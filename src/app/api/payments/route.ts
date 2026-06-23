import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { SLA_PREMIUM_PRICE, calculateSLAExpiry } from "@/lib/sla";

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get("x-org-id");
    const userId = request.headers.get("x-user-id");

    if (!orgId || !userId) {
      return NextResponse.json({ error: "unauthorized", message: "Autenticacion requerida" }, { status: 401 });
    }

    const { ticketId } = await request.json();
    if (!ticketId) {
      return NextResponse.json({ error: "validation", message: "ticketId requerido" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findFirst({
      where: { id: ticketId, organizationId: orgId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "not_found", message: "Ticket no encontrado" }, { status: 404 });
    }

    if (ticket.paymentStatus === "APPROVED") {
      return NextResponse.json({ error: "already_paid", message: "Este ticket ya tiene SLA premium activo" }, { status: 400 });
    }

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        paymentStatus: "PROCESSING",
        paymentAmount: SLA_PREMIUM_PRICE,
        paymentReference: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        history: {
          create: {
            action: "PAYMENT_PROCESSING",
            description: `Procesando pago SLA Premium - S/${(SLA_PREMIUM_PRICE / 100).toFixed(2)}`,
            userId,
          },
        },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const success = Math.random() > 0.1;
    const slaExpiresAt = success ? calculateSLAExpiry() : null;

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        paymentStatus: success ? "APPROVED" : "FAILED",
        slaExpiresAt,
        priority: success ? "URGENT" : ticket.priority,
        history: {
          create: success
            ? {
                action: "SLA_ACTIVATED",
                description: `SLA Premium activado - Tiempo maximo de respuesta: 2 horas`,
                userId,
              }
            : {
                action: "PAYMENT_FAILED",
                description: "Pago rechazado - Fondos insuficientes",
                userId,
              },
        },
      },
    });

    return NextResponse.json({
      status: success ? "APPROVED" : "FAILED",
      slaExpiresAt: slaExpiresAt?.toISOString() ?? null,
      paymentReference: updated.paymentReference,
      ticket: {
        id: updated.id,
        priority: updated.priority,
        paymentStatus: updated.paymentStatus,
        slaExpiresAt: updated.slaExpiresAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "server_error", message: "Error al procesar pago" }, { status: 500 });
  }
}
