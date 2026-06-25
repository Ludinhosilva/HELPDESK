import { NextRequest, NextResponse } from "next/server";
import { triageAsync } from "@/lib/triage";
import { getAuthFromHeaders } from "@/lib/auth-helpers";
import { checkAiUsage } from "@/lib/ai-usage";
import { startDiagnostic, progressDiagnostic } from "@/lib/ai/diagnostic";

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromHeaders(request);
    if (!auth?.orgId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { text, mode, diagnosticState, diagnosticAnswer } = body;

    // Modo diagnóstico interactivo
    if (mode === "diagnostic") {
      if (!diagnosticState) {
        const state = startDiagnostic(text || "");
        return NextResponse.json({
          mode: "diagnostic",
          state,
          question: state.nextQuestion,
          options: [],
        });
      }

      const progress = progressDiagnostic(
        diagnosticState,
        diagnosticState.currentNode || diagnosticState.lastNode || "start",
        diagnosticAnswer
      );

      if (progress.resolved && progress.conclusion !== "Derivando a creación de ticket...") {
        return NextResponse.json({
          mode: "diagnostic",
          state: progress,
          resolved: true,
          conclusion: progress.conclusion,
          suggestedActions: progress.suggestedActions,
        });
      }

      if (progress.conclusion === "Derivando a creación de ticket...") {
        const triageResult = await triageAsync(text || progress.symptom);
        return NextResponse.json({
          mode: "diagnostic",
          state: progress,
          resolved: true,
          createTicket: true,
          triage: triageResult,
          suggestedActions: progress.suggestedActions,
        });
      }

      return NextResponse.json({
        mode: "diagnostic",
        state: progress,
        question: progress.nextQuestion,
        suggestedActions: progress.suggestedActions,
      });
    }

    // Modo triage normal (análisis directo)
    if (!text || text.trim().length < 3) {
      return NextResponse.json({ error: "Describe tu problema brevemente" }, { status: 400 });
    }

    const access = await checkAiUsage(auth.orgId);
    if (!access.allowed) {
      return NextResponse.json({ upsell: true, message: access.message }, { status: 403 });
    }

    const triageResult = await triageAsync(text);

    return NextResponse.json({
      mode: "triage",
      ...triageResult,
    });
  } catch {
    return NextResponse.json({ error: "Error al analizar el problema" }, { status: 500 });
  }
}
