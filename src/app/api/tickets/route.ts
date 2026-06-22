import { NextRequest, NextResponse } from "next/server";
import { getTickets, createTicket } from "@/modules/tickets/actions/ticket-actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const result = await getTickets(page, limit, search, status);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createTicket(body);

    if ("error" in result) {
      return NextResponse.json(
        { error: "validation_error", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al crear ticket" },
      { status: 500 }
    );
  }
}
