import { NextRequest, NextResponse } from "next/server";
import { searchSimilar } from "@/lib/ai";
import { prisma } from "@/core/prisma";

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json();
    const orgId = request.headers.get("x-org-id");

    if (!title || !description || !orgId) {
      return NextResponse.json({ error: "title, description requeridos" }, { status: 400 });
    }

    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        organizationId: orgId,
        status: { in: ["RESOLVED", "CLOSED"] },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: { select: { name: true } },
      },
      take: 100,
    });

    const results = searchSimilar(
      title,
      description,
      resolvedTickets.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        category: t.category?.name || "otros",
      }))
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Error al buscar tickets similares" }, { status: 500 });
  }
}
