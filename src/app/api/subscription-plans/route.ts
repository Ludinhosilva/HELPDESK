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

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener planes" },
      { status: 500 }
    );
  }
}
