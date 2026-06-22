import { NextResponse } from "next/server";
import { loginUser } from "@/modules/auth/actions/auth-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginUser(body.email, body.password);

    if ("error" in result) {
      return NextResponse.json(
        { error: "unauthorized", message: result.error },
        { status: result.status }
      );
    }

    const response = NextResponse.json({ user: result.user }, { status: 200 });

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
