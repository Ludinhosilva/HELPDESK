import { NextResponse } from "next/server";
import {
  getDeviceById,
  updateDevice,
  deleteDevice,
} from "@/modules/devices/actions/device-actions";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getDeviceById(params.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: "not_found", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al obtener equipo" },
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
    const result = await updateDevice(params.id, body);

    if ("error" in result) {
      return NextResponse.json(
        { error: "validation_error", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al actualizar equipo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteDevice(params.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: "not_found", message: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "server_error", message: "Error al eliminar equipo" },
      { status: 500 }
    );
  }
}
