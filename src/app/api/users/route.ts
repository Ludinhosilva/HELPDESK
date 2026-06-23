import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders } from "@/lib/auth-helpers";
import { hashPassword } from "@/lib/auth";

const inviteUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email invalido"),
  role: z.enum(["ADMIN", "TECHNICIAN", "END_USER"]).default("END_USER"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
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

    const users = await prisma.user.findMany({
      where: { organizationId: auth.orgId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ users });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener usuarios" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        { error: "forbidden", message: "Solo administradores pueden invitar usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = inviteUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation_error", message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, role, password } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { email, organizationId: auth.orgId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "conflict", message: "Ya existe un usuario con ese email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
        organizationId: auth.orgId,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al crear usuario" },
      { status: 500 }
    );
  }
}
