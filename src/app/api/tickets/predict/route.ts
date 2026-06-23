import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders, getOrgFilter } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "No autorizado" },
        { status: 401 }
      );
    }

    const orgFilter = getOrgFilter(auth);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const tickets = await prisma.ticket.findMany({
      where: {
        ...orgFilter,
        createdAt: { gte: ninetyDaysAgo },
      },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" },
    });

    const dailyCounts: Record<string, number> = {};
    tickets.forEach((t) => {
      const date = t.createdAt.toISOString().split("T")[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const dates = Object.keys(dailyCounts).sort();
    const counts = dates.map((d) => dailyCounts[d]);
    const n = counts.length;

    let trend = "stable";
    let avgLast7 = 0;
    let avgPrev7 = 0;
    let predictedNext7 = 0;

    if (n >= 14) {
      const last7 = counts.slice(-7);
      const prev7 = counts.slice(-14, -7);
      avgLast7 = last7.reduce((a, b) => a + b, 0) / 7;
      avgPrev7 = prev7.reduce((a, b) => a + b, 0) / 7;
      const change = avgLast7 - avgPrev7;
      trend = change > 1 ? "increasing" : change < -1 ? "decreasing" : "stable";

      const weekOverWeek = n >= 21
        ? counts.slice(-7).reduce((a, b) => a + b, 0) / counts.slice(-14, -7).reduce((a, b) => a + b, 0)
        : 1;
      const smoothedAvg = counts.slice(-21).reduce((a, b) => a + b, 0) / Math.min(21, counts.length);
      predictedNext7 = Math.max(0, Math.round(smoothedAvg * weekOverWeek * 7));
    } else {
      const total = counts.reduce((a, b) => a + b, 0);
      predictedNext7 = Math.max(0, Math.round((total / Math.max(1, n)) * 7));
    }

    return NextResponse.json({
      trend,
      avgLast7: Math.round(avgLast7 * 10) / 10,
      avgPrev7: Math.round(avgPrev7 * 10) / 10,
      predictedNext7,
      totalTickets: tickets.length,
      daysOfData: n,
    });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al generar prediccion" },
      { status: 500 }
    );
  }
}
