import { NextResponse } from "next/server";
import {
  getTicketById,
  updateTicket,
  assignTicket,
} from "@/modules/tickets/actions/ticket-actions";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getTicketById(params.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: "not_found", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener ticket" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const result = await updateTicket(params.id, body);

    if ("error" in result) {
      return NextResponse.json(
        { error: "validation_error", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (body.technicianId) {
      const result = await assignTicket(params.id, body.technicianId);

      if ("error" in result) {
        return NextResponse.json(
          { error: "validation_error", message: result.error },
          { status: result.status }
        );
      }

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "validation_error", message: "Se requiere technicianId" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al asignar ticket" },
      { status: 500 }
    );
  }
}
