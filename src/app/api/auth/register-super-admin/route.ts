import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { hashPassword } from "@/lib/auth";

const SuperAdminSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Formato de email invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  secretKey: z.string().min(1, "Clave secreta requerida"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SuperAdminSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Datos invalidos";
      return NextResponse.json(
        { error: "validation_error", message },
        { status: 400 }
      );
    }

    const { name, email, password, secretKey } = parsed.data;

    if (secretKey !== "servidesk-super-2026") {
      return NextResponse.json(
        { error: "forbidden", message: "Clave secreta incorrecta" },
        { status: 403 }
      );
    }

    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN", email },
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: "conflict", message: "Ya existe un super administrador con ese email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "SUPER_ADMIN",
      },
    });

    return NextResponse.json(
      { message: "Super administrador creado correctamente" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
