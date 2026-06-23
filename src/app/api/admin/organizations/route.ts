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

    const orgs = await prisma.organization.findMany({
      include: {
        _count: { select: { users: true, tickets: true } },
        subscription: {
          select: { status: true, plan: { select: { name: true, price: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ organizations: orgs });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener organizaciones" },
      { status: 500 }
    );
  }
}
