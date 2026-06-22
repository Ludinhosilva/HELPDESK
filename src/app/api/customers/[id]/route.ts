import { NextResponse } from "next/server";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/modules/customers/actions/customer-actions";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getCustomerById(params.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: "not_found", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener cliente" },
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
    const result = await updateCustomer(params.id, body);

    if ("error" in result) {
      return NextResponse.json(
        { error: "validation_error", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteCustomer(params.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: "not_found", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al eliminar cliente" },
      { status: 500 }
    );
  }
}
