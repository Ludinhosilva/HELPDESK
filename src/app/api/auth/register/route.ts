import { NextResponse } from "next/server";
import { registerCompany, registerPersonal } from "@/lib/auth-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Si viene orgName → registro de empresa
    // Si no viene → registro personal
    const result = body.orgName
      ? await registerCompany(body)
      : await registerPersonal(body);

    if (result.error) {
      return NextResponse.json(
        { error: "conflict", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
