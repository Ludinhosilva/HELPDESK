// Motor de triage mejorado. Clasifica la complejidad del problema,
// sugiere soluciones y recomienda acciones basado en el nuevo motor de IA.

import { classifyProblem, type ClassificationResult } from "./ai/classify";
import { analyzeSentiment, getPriorityOverride } from "./sentiment";

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
}

export function triage(text: string): TriageResult {
  // Clasificación con el nuevo motor
  const classification = classifyProblem(text, text);

  // Análisis de sentimiento
  const sentiment = analyzeSentiment(text);
  const priorityOverride = getPriorityOverride(sentiment.level, classification.priority);

  // Complejidad
  const complexity = classification.complexity;

  // Determinar si requiere pago (Ticket Exprés)
  const requiresPayment = complexity === "COMPLEX" || classification.urgency === "critical";

  // Costo estimado
  const estimatedCost = requiresPayment ? 2000 : 0; // S/ 20.00 para Ticket Exprés

  // Generar solución en texto
  let solution = "";
  if (classification.knowledgeMatch) {
    solution = `**Diagnóstico**: ${classification.diagnosis}\n\n`;
    solution += `**Pasos sugeridos**:\n`;
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

  // Razón del diagnóstico
  const reason = `Problema clasificado como **${classification.category.toUpperCase()}** ` +
    `con ${Math.round(classification.categoryConfidence * 100)}% de confianza. ` +
    `Urgencia: ${classification.urgency.toUpperCase()}. ` +
    (classification.knowledgeMatch
      ? `Coincide con el patrón: ${classification.knowledgeMatch.diagnosis.substring(0, 80)}...`
      : "No se encontró un patrón exacto en la base de conocimiento.");

  // Acción sugerida
  let suggestedAction: string;
  if (complexity === "SIMPLE") {
    suggestedAction = "Sigue los pasos de solución. Si se resuelve, no es necesario crear un ticket.";
  } else if (complexity === "MEDIUM") {
    suggestedAction = "Sigue los pasos sugeridos. Si el problema persiste, te recomiendo crear un ticket para que un técnico lo revise.";
  } else {
    suggestedAction = requiresPayment
      ? "Este problema requiere intervención técnica. Puedes crear un ticket normal o uno prioritario Ticket Exprés (S/ 20.00) con respuesta garantizada en menos de 2 horas."
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
  };
}
