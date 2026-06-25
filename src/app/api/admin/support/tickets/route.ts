import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders, isSuperAdmin } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || !isSuperAdmin(auth)) {
      return NextResponse.json({ error: "forbidden", message: "Acceso denegado" }, { status: 403 });
    }

    const personalOrgs = await prisma.organization.findMany({
      where: { type: "PERSONAL" },
      select: { id: true },
    });

    const personalOrgIds = personalOrgs.map((o) => o.id);

    const tickets = await prisma.ticket.findMany({
      where: {
        organizationId: { in: personalOrgIds },
        status: { notIn: ["CLOSED"] },
      },
      include: {
        createdBy: { select: { name: true, email: true } },
        assignedTo: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    });

    const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    tickets.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

    return NextResponse.json({ tickets });
  } catch {
    return NextResponse.json({ error: "server_error", message: "Error al obtener tickets" }, { status: 500 });
  }
}
