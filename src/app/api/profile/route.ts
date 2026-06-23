import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";
import { hashPassword, comparePassword } from "@/lib/auth";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "No autorizado" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        organization: { select: { id: true, name: true, slug: true } },
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "not_found", message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener perfil" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth) {
      return NextResponse.json(
        { error: "unauthorized", message: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.newPassword && data.currentPassword) {
      const user = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { password: true },
      });

      if (!user) {
        return NextResponse.json(
          { error: "not_found", message: "Usuario no encontrado" },
          { status: 404 }
        );
      }

      const valid = await comparePassword(data.currentPassword, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: "validation_error", message: "La contraseña actual es incorrecta" },
          { status: 400 }
        );
      }

      const hashed = await hashPassword(data.newPassword);
      await prisma.user.update({
        where: { id: auth.userId },
        data: { password: hashed },
      });
    }

    if (data.name) {
      await prisma.user.update({
        where: { id: auth.userId },
        data: { name: data.name },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar perfil" },
      { status: 500 }
    );
  }
}
