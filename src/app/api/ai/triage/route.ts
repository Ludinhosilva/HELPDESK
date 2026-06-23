import { NextRequest, NextResponse } from "next/server";
import { triage } from "@/lib/triage";
import { analyzeSentiment, getPriorityOverride } from "@/lib/sentiment";
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

    const { text } = await request.json();

    if (!text || text.trim().length < 3) {
      return NextResponse.json({ error: "Describe tu problema brevemente" }, { status: 400 });
    }

    const triageResult = triage(text);

    const sentimentResult = analyzeSentiment(text);
    const priorityOverride = getPriorityOverride(sentimentResult.level, "MEDIUM");

    return NextResponse.json({
      ...triageResult,
      sentiment: sentimentResult,
      priorityOverride,
    });
  } catch {
    return NextResponse.json({ error: "Error al analizar el problema" }, { status: 500 });
  }
}
