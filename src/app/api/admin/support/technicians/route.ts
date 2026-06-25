import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/core/prisma";
import { getAuthFromHeaders, isSuperAdmin } from "@/lib/auth-helpers";
import { z } from "zod";
import { hashPassword } from "@/lib/auth";

const inviteSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || !isSuperAdmin(auth)) {
      return NextResponse.json({ error: "forbidden", message: "Acceso denegado" }, { status: 403 });
    }

    const technicians = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
        organization: { type: "INTERNAL" },
      },
      include: {
        organization: { select: { name: true } },
        _count: { select: { assignedTickets: { where: { status: { notIn: ["RESOLVED", "CLOSED"] } } } } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ technicians });
  } catch {
    return NextResponse.json({ error: "server_error", message: "Error al obtener técnicos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth || !isSuperAdmin(auth)) {
      return NextResponse.json({ error: "forbidden", message: "Acceso denegado" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "validation_error", message: parsed.error.errors[0]?.message || "Datos invalidos" }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const internalOrg = await prisma.organization.findFirst({
      where: { type: "INTERNAL" },
    });

    if (!internalOrg) {
      return NextResponse.json({ error: "not_found", message: "Organizacion interna no encontrada. Ejecuta el seed." }, { status: 500 });
    }

    const existing = await prisma.user.findUnique({
      where: { email_organizationId: { email, organizationId: internalOrg.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "conflict", message: "Ya existe un usuario con ese email" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TECHNICIAN",
        organizationId: internalOrg.id,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "server_error", message: "Error al crear técnico" }, { status: 500 });
  }
}
