import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { hashPassword } from "@/lib/auth";

const RegisterSchema = z.object({
  orgName: z.string().min(2, "El nombre de la organizacion es requerido"),
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Formato de email invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Datos invalidos";
      return NextResponse.json(
        { error: "validation_error", message },
        { status: 400 }
      );
    }

    const { orgName, name, email, password } = parsed.data;

    const slug = slugify(orgName);

    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      const existingUser = await prisma.user.findFirst({
        where: { email, organizationId: existingOrg.id },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "conflict", message: "El email ya existe en esta organizacion" },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    await prisma.organization.create({
      data: {
        name: orgName,
        slug,
        users: {
          create: {
            email,
            password: hashedPassword,
            name,
            role: "ADMIN",
          },
        },
      },
      include: { users: true },
    });

    return NextResponse.json(
      { message: "Organizacion y usuario administrador creados correctamente" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
