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

    const emails = await prisma.emailLog.findMany({
      where: { organizationId: auth.orgId },
      orderBy: { sentAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ emails });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener logs de email" },
      { status: 500 }
    );
  }
}
