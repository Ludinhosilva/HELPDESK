import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders, isSuperAdmin } from "@/lib/auth-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || !isSuperAdmin(auth)) {
      return NextResponse.json(
        { error: "forbidden", message: "Acceso denegado" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
          orderBy: { name: "asc" },
        },
        _count: { select: { tickets: true } },
        subscription: { include: { plan: { select: { name: true, price: true } } } },
      },
    });

    if (!org) {
      return NextResponse.json(
        { error: "not_found", message: "Organizacion no encontrada" },
        { status: 404 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: { organizationId: org.id },
      include: {
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ organization: org, tickets });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener organizacion" },
      { status: 500 }
    );
  }
}
