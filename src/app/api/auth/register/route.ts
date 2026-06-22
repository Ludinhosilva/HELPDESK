import { NextResponse } from "next/server";
import { registerUser } from "@/modules/auth/actions/auth-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await registerUser({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role || "TECHNICIAN",
      specialty: body.specialty || "",
    });

    if ("error" in result) {
      return NextResponse.json(
        { error: "validation_error", message: result.error },
        { status: result.status }
      );
    }

    const response = NextResponse.json({ user: result.user }, { status: 201 });

    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
