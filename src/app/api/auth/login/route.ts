import { NextResponse } from "next/server";
import { loginUser } from "@/lib/auth-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await loginUser(body.email, body.password);

    if (result.error) {
      return NextResponse.json(
        { error: "unauthorized", message: result.error },
        { status: result.status || 401 }
      );
    }

    const token = result.token!;

    const response = NextResponse.json(
      {
        user: {
          id: result.user!.id,
          name: result.user!.name,
          email: result.user!.email,
          role: result.user!.role,
          orgId: result.user!.orgId,
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
