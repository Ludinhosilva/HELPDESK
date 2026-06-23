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

    const orgId = auth.orgId;

    const byCategory = await prisma.ticket.groupBy({
      by: ["categoryId"],
      where: { organizationId: orgId },
      _count: true,
    });

    const categories = await prisma.category.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const byCategoryData = byCategory
      .filter((b) => b.categoryId)
      .map((b) => ({
        category: categoryMap.get(b.categoryId!) || "Sin categoria",
        count: b._count,
      }));

    const byStatus = await prisma.ticket.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: true,
    });

    const statusLabels: Record<string, string> = {
      OPEN: "Abierto",
      IN_PROGRESS: "En progreso",
      RESOLVED: "Resuelto",
      CLOSED: "Cerrado",
      RECEIVED: "Recibido",
      DIAGNOSING: "Diagnosticando",
      REPAIRING: "Reparando",
      WAITING_PARTS: "Esperando repuestos",
      READY: "Listo",
      DELIVERED: "Entregado",
    };

    const byStatusData = byStatus.map((b) => ({
      status: statusLabels[b.status] || b.status,
      count: b._count,
    }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const ticketsByDay = await prisma.ticket.findMany({
      where: {
        organizationId: orgId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyCounts: Record<string, number> = {};
    ticketsByDay.forEach((t) => {
      const date = t.createdAt.toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const byTimeData = Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      byCategory: byCategoryData,
      byStatus: byStatusData,
      byTime: byTimeData,
    });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener estadisticas" },
      { status: 500 }
    );
  }
}
