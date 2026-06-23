import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/core/prisma";
import { comparePassword, generateToken } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("Formato de email invalido"),
  password: z.string().min(1, "La contrasena es requerida"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || "Datos invalidos";
      return NextResponse.json(
        { error: "validation_error", message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "Credenciales invalidas" },
        { status: 401 }
      );
    }

    const validPassword = await comparePassword(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: "unauthorized", message: "Credenciales invalidas" },
        { status: 401 }
      );
    }

    const token = await generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      orgId: user.organizationId || "",
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orgId: user.organizationId,
        },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
