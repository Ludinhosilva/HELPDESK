import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "No autorizado" },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findFirst({
      where: { organizationId: auth.orgId },
      include: {
        plan: true,
        payments: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    return NextResponse.json({ subscription });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener suscripcion" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden gestionar suscripciones" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "validation_error", message: "Se requiere planId" },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "not_found", message: "Plan no encontrado" },
        { status: 404 }
      );
    }

    const existing = await prisma.subscription.findFirst({
      where: { organizationId: auth.orgId },
    });

    let subscription;

    if (existing) {
      subscription = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          status: "ACTIVE",
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { plan: true },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          organizationId: auth.orgId,
          planId,
          status: "ACTIVE",
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        include: { plan: true },
      });
    }

    await prisma.payment.create({
      data: {
        amount: plan.price,
        currency: "PEN",
        status: "SUCCESS",
        reference: `CULQI-${Date.now()}`,
        subscriptionId: subscription.id,
      },
    });

    return NextResponse.json(subscription);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al procesar suscripcion" },
      { status: 500 }
    );
  }
}
