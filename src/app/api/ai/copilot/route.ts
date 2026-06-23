import { NextRequest, NextResponse } from "next/server";
import { generateCopilotResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const { title, description, category, similarTickets } = await request.json();

    if (!title || !description) {
      return NextResponse.json({ error: "title y description son requeridos" }, { status: 400 });
    }

    const result = generateCopilotResponse(title, description, category || "otros", similarTickets || []);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Error al generar respuesta" }, { status: 500 });
  }
}
