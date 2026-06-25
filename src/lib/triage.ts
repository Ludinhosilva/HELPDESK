// Motor de triage principal. Intenta Groq LLM primero, cae a rule-based si falla.
// Mantiene compatibilidad con la API existente (misma interfaz TriageResult).

import { classifyProblem, type ClassificationResult } from "./ai/classify";
import { analyzeSentiment, getPriorityOverride } from "./sentiment";
import { groqTriage, groqToClassification, type GroqTriageOutput } from "./ai/groq-triage";
import { isGroqAvailable } from "./ai/groq-client";

export interface TriageResult {
  complexity: "SIMPLE" | "MEDIUM" | "COMPLEX";
  category: string;
  categoryConfidence: number;
  solution: string;
  requiresPayment: boolean;
  estimatedCost: number;
  reason: string;
  suggestedAction: string;
  sentiment: {
    level: string;
    score: number;
    matches: string[];
  };
  priorityOverride: string | null;
  priorityReason: string;
  classification: ClassificationResult;
  aiProvider: "groq" | "rule-based";
}

export function triage(text: string): TriageResult {
  const sentiment = analyzeSentiment(text);

  // La versión síncrona usa siempre rule-based.
  // Para Groq LLM, usa triageAsync() desde la API route.
  return ruleBasedTriage(text, sentiment);
}

function ruleBasedTriage(text: string, sentiment: ReturnType<typeof analyzeSentiment>): TriageResult {
  const classification = classifyProblem(text, text);
  return buildTriageResult(classification, sentiment, "rule-based");
}

// Versión async para usar desde la API route
export async function triageAsync(text: string): Promise<TriageResult> {
  const sentiment = analyzeSentiment(text);

  // Intentar Groq primero
  if (isGroqAvailable()) {
    const groqResult = await groqTriage(text);
    if (groqResult) {
      const classification = groqToClassification(groqResult, text);
      const priorityOverride = getPriorityOverride(groqResult.urgency === "critical" ? "CRITICAL" : groqResult.urgency === "high" ? "FRUSTRATED" : "CALM", groqResult.priority);
      return {
        ...buildTriageResultFromGroq(classification, groqResult, sentiment),
        priorityOverride,
        aiProvider: "groq",
      };
    }
  }

  // Fallback rule-based
  const classification = classifyProblem(text, text);
  return buildTriageResult(classification, sentiment, "rule-based");
}

function buildTriageResultFromGroq(
  classification: ClassificationResult,
  groq: GroqTriageOutput,
  sentiment: ReturnType<typeof analyzeSentiment>
): TriageResult {
  const requiresPayment = groq.complexity === "COMPLEX" || groq.urgency === "critical";
  const estimatedCost = requiresPayment ? 2000 : 0;

  let solution = "";
  if (groq.steps.length > 0) {
    solution = `**Diagnóstico IA**: ${groq.diagnosis}\n\n**Pasos sugeridos**:\n`;
    groq.steps.forEach((step, i) => {
      solution += `${i + 1}. ${step}\n`;
    });
    if (!groq.requiresTicket) {
      solution += `\n✅ La IA sugiere que este problema puede resolverse con los pasos anteriores.`;
    }
  }

  let suggestedAction: string;
  if (groq.complexity === "SIMPLE") {
    suggestedAction = "Sigue los pasos de solución. Si se resuelve, no es necesario crear un ticket.";
  } else if (groq.complexity === "MEDIUM") {
    suggestedAction = "Sigue los pasos sugeridos. Si el problema persiste, crea un ticket para que un técnico lo revise.";
  } else {
    suggestedAction = requiresPayment
      ? "Este problema requiere intervención técnica. Elige entre ticket normal o Ticket Exprés (S/ 20.00, respuesta < 2h)."
      : "Este problema requiere intervención técnica. Se recomienda crear un ticket.";
  }

  const priorityOverride = getPriorityOverride(sentiment.level, groq.priority);

  return {
    complexity: groq.complexity as "SIMPLE" | "MEDIUM" | "COMPLEX",
    category: groq.category,
    categoryConfidence: groq.categoryConfidence,
    solution,
    requiresPayment,
    estimatedCost,
    reason: `Problema clasificado por IA (Groq/Llama 3) como **${groq.category.toUpperCase()}** con ${Math.round(groq.categoryConfidence * 100)}% de confianza. Urgencia: ${groq.urgency.toUpperCase()}.`,
    suggestedAction,
    sentiment: {
      level: sentiment.level,
      score: sentiment.score,
      matches: sentiment.matches,
    },
    priorityOverride,
    priorityReason: classification.priorityReason,
    classification,
    aiProvider: "groq",
  };
}

function buildTriageResult(
  classification: ClassificationResult,
  sentiment: ReturnType<typeof analyzeSentiment>,
  provider: "groq" | "rule-based"
): TriageResult {
  const complexity = classification.complexity;
  const requiresPayment = complexity === "COMPLEX" || classification.urgency === "critical";
  const estimatedCost = requiresPayment ? 2000 : 0;
  const priorityOverride = getPriorityOverride(sentiment.level, classification.priority);

  let solution = "";
  if (classification.knowledgeMatch) {
    solution = `**Diagnóstico**: ${classification.diagnosis}\n\n**Pasos sugeridos**:\n`;
    classification.suggestedSteps.forEach((step, i) => {
      solution += `${i + 1}. ${step}\n`;
    });
    if (!classification.requiresTicket) {
      solution += `\n✅ Este problema puede resolverse siguiendo los pasos anteriores. Si persiste, crea un ticket.`;
    }
  } else if (classification.suggestedSteps.length > 0) {
    solution = classification.suggestedSteps.join("\n");
  } else {
    solution = "Describe tu problema con más detalle para obtener un diagnóstico preciso.";
  }

  const reason = `Problema clasificado como **${classification.category.toUpperCase()}** con ${Math.round(classification.categoryConfidence * 100)}% de confianza. Urgencia: ${classification.urgency.toUpperCase()}.` +
    (classification.knowledgeMatch
      ? ` Coincide con: ${classification.knowledgeMatch.diagnosis.substring(0, 80)}...`
      : "");

  let suggestedAction: string;
  if (complexity === "SIMPLE") {
    suggestedAction = "Sigue los pasos de solución. Si se resuelve, no es necesario crear un ticket.";
  } else if (complexity === "MEDIUM") {
    suggestedAction = "Sigue los pasos sugeridos. Si el problema persiste, te recomiendo crear un ticket.";
  } else {
    suggestedAction = requiresPayment
      ? "Este problema requiere intervención técnica. Puedes crear un ticket normal o Ticket Exprés (S/ 20.00) con respuesta garantizada en menos de 2 horas."
      : "Este problema requiere intervención técnica. Se creará un ticket y un técnico será asignado.";
  }

  return {
    complexity,
    category: classification.category,
    categoryConfidence: classification.categoryConfidence,
    solution,
    requiresPayment,
    estimatedCost,
    reason,
    suggestedAction,
    sentiment: {
      level: sentiment.level,
      score: sentiment.score,
      matches: sentiment.matches,
    },
    priorityOverride,
    priorityReason: classification.priorityReason,
    classification,
    aiProvider: provider,
  };
}
