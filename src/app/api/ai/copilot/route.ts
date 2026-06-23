import { NextRequest, NextResponse } from "next/server";
import { generateCopilotResponse } from "@/lib/ai";
import { getAuthFromHeaders } from "@/lib/auth-helpers";
import { checkAiUsage } from "@/lib/ai-usage";

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth?.orgId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const access = await checkAiUsage(auth.orgId);
    if (!access.allowed) {
      return NextResponse.json({ upsell: true, message: access.message }, { status: 403 });
    }

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
