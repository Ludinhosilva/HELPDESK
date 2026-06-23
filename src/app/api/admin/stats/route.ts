import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders, isSuperAdmin } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || !isSuperAdmin(auth)) {
      return NextResponse.json(
        { error: "forbidden", message: "Acceso denegado" },
        { status: 403 }
      );
    }

    const [orgCount, userCount, ticketCount, orgsWithSubs] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
      prisma.ticket.count(),
      prisma.organization.count({ where: { subscription: { isNot: null } } }),
    ]);

    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ["status"],
      _count: true,
    });

    const ticketsByPriority = await prisma.ticket.groupBy({
      by: ["priority"],
      _count: true,
    });

    return NextResponse.json({
      orgCount,
      userCount,
      ticketCount,
      orgsWithSubs,
      ticketsByStatus,
      ticketsByPriority,
    });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener estadisticas" },
      { status: 500 }
    );
  }
}
