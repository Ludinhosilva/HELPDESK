import { NextRequest, NextResponse } from "next/server";
import { getAuthFromHeaders } from "@/lib/auth-helpers";
import { prisma } from "@/core/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthFromHeaders(request);
  if (!auth) {
    return NextResponse.json(
      { error: "unauthorized", message: "Autenticacion requerida" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    // Verificar que el ticket existe y pertenece a la organización
    const ticket = await prisma.ticket.findFirst({
      where: {
        id,
        organizationId: auth.orgId,
      },
      select: { id: true, status: true, title: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "not_found", message: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    // No ejecutar si ya está resuelto o cerrado
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
      return NextResponse.json(
        { error: "invalid_state", message: "El ticket ya fue resuelto o cerrado" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Ejecutar runbook: transición de estados
    // IN_PROGRESS → DIAGNOSING → REPAIRING → READY
    await prisma.ticket.update({
      where: { id },
      data: { status: "IN_PROGRESS" },
    });

    // Simular diagnóstico (1.5s)
    await new Promise((r) => setTimeout(r, 1500));

    await prisma.ticket.update({
      where: { id },
      data: { status: "DIAGNOSING" },
    });

    // Simular reparación (1.5s)
    await new Promise((r) => setTimeout(r, 1500));

    await prisma.ticket.update({
      where: { id },
      data: { status: "REPAIRING" },
    });

    // Completar
    await new Promise((r) => setTimeout(r, 1500));

    await prisma.ticket.update({
      where: { id },
      data: {
        status: "READY",
        resolvedAt: new Date(),
      },
    });

    // Registrar en historial
    await prisma.ticketHistory.create({
      data: {
        ticketId: id,
        action: "RUNBOOK_EXECUTED",
        description:
          "Runbook automatizado ejecutado por FlixSupport AI. Servicio restablecido sin intervención manual.",
        userId: "SYSTEM",
      },
    });

    return NextResponse.json({
      success: true,
      newStatus: "READY",
      executedAt: now,
      message: "Runbook ejecutado exitosamente",
    });
  } catch (error) {
    console.error("Runbook error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Error al ejecutar runbook" },
      { status: 500 }
    );
  }
}
