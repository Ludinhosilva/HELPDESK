import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";

const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "TECHNICIAN", "END_USER"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden modificar usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { id: params.id, organizationId: auth.orgId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "not_found", message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: parsed.data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
