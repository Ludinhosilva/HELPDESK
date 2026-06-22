import { NextResponse } from "next/server";
import { prisma } from "@/core/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "TECHNICIAN" },
      select: { id: true, name: true, email: true, role: true, specialty: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener tecnicos" },
      { status: 500 }
    );
  }
}
