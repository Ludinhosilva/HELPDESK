import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import {
  UpdateTicketSchema,
  VALID_STATUS_TRANSITIONS,
} from "@/modules/tickets/types/ticket.types";
import { getAuthFromHeaders } from "@/lib/auth-helpers";
import { notifyTicketAssignment, notifyTicketUpdate, createNotification } from "@/lib/notifications";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "No autorizado" },
        { status: 401 }
      );
    }

    const where: Record<string, unknown> = { id };
    if (auth.role !== "SUPER_ADMIN") {
      where.organizationId = auth.orgId;
    }

    const ticket = await prisma.ticket.findFirst({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        history: { orderBy: { timestamp: "desc" } },
        evaluation: true,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "not_found", message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "Autenticacion requerida" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = UpdateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: parsed.error.errors[0]?.message || "Datos invalidos",
        },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { id };
    if (auth.role !== "SUPER_ADMIN") {
      where.organizationId = auth.orgId;
    }

    const existing = await prisma.ticket.findFirst({ where });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Ticket not found" },
        { status: 404 }
      );
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    const historyEntries: Array<{ action: string; description: string; userId: string }> = [];

    if (data.status && data.status !== existing.status) {
      const allowed = VALID_STATUS_TRANSITIONS[existing.status] || [];
      if (!allowed.includes(data.status)) {
        return NextResponse.json(
          {
            error: "invalid_transition",
            message: `No se puede cambiar de ${existing.status} a ${data.status}`,
          },
          { status: 400 }
        );
      }

      updateData.status = data.status;
      historyEntries.push({
        action: "STATUS_CHANGE",
        description: `Estado cambiado de ${existing.status} a ${data.status}`,
        userId: auth.userId,
      });

      if (data.status === "RESOLVED") {
        updateData.resolvedAt = new Date();
      }
      if (data.status === "CLOSED") {
        updateData.closedAt = new Date();
      }
    }

    if (data.assignedToId !== undefined && data.assignedToId !== existing.assignedToId) {
      updateData.assignedToId = data.assignedToId;

      if (data.assignedToId) {
        const assignee = await prisma.user.findUnique({
          where: { id: data.assignedToId },
          select: { name: true },
        });
        historyEntries.push({
          action: "ASSIGNMENT",
          description: `Asignado a ${assignee?.name || "desconocido"}`,
          userId: auth.userId,
        });
      } else {
        historyEntries.push({
          action: "UNASSIGNMENT",
          description: "Ticket desasignado",
          userId: auth.userId,
        });
      }
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId || null;
      historyEntries.push({
        action: "CATEGORY_CHANGE",
        description: "Categoria actualizada",
        userId: auth.userId,
      });
    }

    if (data.priority && data.priority !== existing.priority) {
      updateData.priority = data.priority;
      historyEntries.push({
        action: "PRIORITY_CHANGE",
        description: `Prioridad cambiada a ${data.priority}`,
        userId: auth.userId,
      });
    }

    if (data.paymentStatus !== undefined) {
      updateData.paymentStatus = data.paymentStatus;
      if (data.paymentAmount !== undefined) updateData.paymentAmount = data.paymentAmount;
      if (data.paymentReference !== undefined) updateData.paymentReference = data.paymentReference;
      if (data.slaExpiresAt !== undefined) updateData.slaExpiresAt = new Date(data.slaExpiresAt);

      if (data.paymentStatus === "APPROVED") {
        historyEntries.push({
          action: "PAYMENT_APPROVED",
          description: `Pago aprobado${data.paymentAmount ? ` - S/${(data.paymentAmount / 100).toFixed(2)}` : ""}`,
          userId: auth.userId,
        });
      }
    }

    const isStatusChange = data.status && data.status !== existing.status;
    const isAssignmentChange = data.assignedToId !== undefined && data.assignedToId !== existing.assignedToId;
    const isPriorityChange = data.priority && data.priority !== existing.priority;
    const notifyPriority = data.priority || existing.priority;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...updateData,
        history: {
          create: historyEntries,
        },
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
        history: { orderBy: { timestamp: "desc" } },
        evaluation: true,
      },
    });

    if (isStatusChange) {
      notifyTicketUpdate(id, existing.ticketNumber, existing.title, "STATUS_CHANGE", existing.organizationId, existing.createdById);
      await createNotification({
        userId: existing.createdById,
        ticketId: id,
        ticketNumber: existing.ticketNumber,
        type: "STATUS_CHANGE",
        title: "Cambio de estado",
        message: `TK-${existing.ticketNumber} pasó a ${data.status}`,
        priority: notifyPriority,
      });
    }
    if (isAssignmentChange) {
      if (data.assignedToId) {
        notifyTicketAssignment(id, existing.ticketNumber, existing.title, data.assignedToId, existing.organizationId);
        await createNotification({
          userId: data.assignedToId,
          ticketId: id,
          ticketNumber: existing.ticketNumber,
          type: "TICKET_ASSIGNED",
          title: "Ticket asignado",
          message: `TK-${existing.ticketNumber} - "${existing.title}" asignado a ti`,
          priority: notifyPriority,
        });
      }
      notifyTicketUpdate(id, existing.ticketNumber, existing.title, "ASSIGNMENT", existing.organizationId, existing.createdById);
    }
    if (isPriorityChange) {
      notifyTicketUpdate(id, existing.ticketNumber, existing.title, "PRIORITY_CHANGE", existing.organizationId, existing.assignedToId || existing.createdById);
      if (existing.assignedToId) {
        await createNotification({
          userId: existing.assignedToId,
          ticketId: id,
          ticketNumber: existing.ticketNumber,
          type: "PRIORITY_CHANGE",
          title: "Cambio de prioridad",
          message: `TK-${existing.ticketNumber} prioridad cambiada a ${notifyPriority}`,
          priority: notifyPriority,
        });
      }
    }

    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar ticket" },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;
