import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import {
  UpdateTicketSchema,
  VALID_STATUS_TRANSITIONS,
} from "@/modules/tickets/types/ticket.types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orgId = request.headers.get("x-org-id");

    if (!orgId) {
      return NextResponse.json(
        { error: "unauthorized", message: "Organization not found" },
        { status: 401 }
      );
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id, organizationId: orgId },
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
        { error: "not_found", message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error fetching ticket" },
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
    const orgId = request.headers.get("x-org-id");
    const userId = request.headers.get("x-user-id");

    if (!orgId || !userId) {
      return NextResponse.json(
        { error: "unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = UpdateTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "validation_error",
          message: parsed.error.errors[0]?.message || "Invalid data",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.ticket.findFirst({
      where: { id, organizationId: orgId },
    });

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
            message: `Cannot transition from ${existing.status} to ${data.status}`,
          },
          { status: 400 }
        );
      }

      updateData.status = data.status;
      historyEntries.push({
        action: "STATUS_CHANGE",
        description: `Status changed from ${existing.status} to ${data.status}`,
        userId,
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
          description: `Assigned to ${assignee?.name || "unknown"}`,
          userId,
        });
      } else {
        historyEntries.push({
          action: "UNASSIGNMENT",
          description: "Ticket unassigned",
          userId,
        });
      }
    }

    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId || null;
      historyEntries.push({
        action: "CATEGORY_CHANGE",
        description: "Category updated",
        userId,
      });
    }

    if (data.priority && data.priority !== existing.priority) {
      updateData.priority = data.priority;
      historyEntries.push({
        action: "PRIORITY_CHANGE",
        description: `Priority changed to ${data.priority}`,
        userId,
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
          userId,
        });
      }
    }

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

    return NextResponse.json(ticket);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error updating ticket" },
      { status: 500 }
    );
  }
}

export const PUT = PATCH;
