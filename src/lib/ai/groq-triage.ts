// Triage via Groq LLM. Analiza el problema del usuario y devuelve
// clasificación estructurada. Con fallback al motor rule-based.

import { groqChat, isGroqAvailable } from "./groq-client";
import type { ClassificationResult } from "./classify";
import { findKnowledge } from "./knowledge-base";

export interface GroqTriageOutput {
  category: string;
  categoryConfidence: number;
  priority: string;
  urgency: string;
  complexity: string;
  diagnosis: string;
  steps: string[];
  estimatedTime: string;
  requiresTicket: boolean;
}

function buildSystemPrompt(): string {
  return `Eres un técnico de soporte TI experto con 15 años de experiencia. Analiza problemas de computadoras, redes, software e impresoras. Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:

{
  "category": "hardware" | "software" | "red" | "accesos" | "otros",
  "categoryConfidence": número entre 0 y 1,
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "urgency": "low" | "medium" | "high" | "critical",
  "complexity": "SIMPLE" | "MEDIUM" | "COMPLEX",
  "diagnosis": "Diagnóstico técnico en español (1-2 oraciones)",
  "steps": ["paso 1 concreto", "paso 2 concreto", ...máximo 6 pasos],
  "estimatedTime": "ej: 15-30 minutos o 1-2 horas",
  "requiresTicket": true o false
}

Reglas:
- PRIORITY: usa URGENT cuando hay pérdida de datos, equipo no enciende, derrame de líquido, producción parada, o el usuario expresa desesperación. Usa HIGH para hardware dañado, internet caído o virus. MEDIUM para instalaciones, configuración. LOW para consultas.
- COMPLEXITY: SIMPLE si el usuario puede resolverlo con pasos. MEDIUM si requiere cierto conocimiento técnico. COMPLEX si requiere intervención física (pantalla rota, derrame, cambio de hardware).
- REQUIRES_TICKET: true solo si el problema NO PUEDE resolverse con auto-ayuda (hardware roto, derrames, falla de disco).
- STEPS: deben ser ACCIONABLES y ESPECÍFICOS al problema. No genéricos. Incluye comandos exactos cuando aplique.
- Sé CONCISO. Cada paso máximo 1 línea.`;
}

export async function groqTriage(text: string): Promise<GroqTriageOutput | null> {
  if (!isGroqAvailable()) return null;

  const messages = [
    { role: "system" as const, content: buildSystemPrompt() },
    { role: "user" as const, content: `Problema del usuario: "${text}"` },
  ];

  const result = await groqChat(messages, { temperature: 0.3, maxTokens: 600 });
  if (!result) return null;

  try {
    const parsed = JSON.parse(result.text) as GroqTriageOutput;

    // Validar campos obligatorios
    if (!parsed.category || !parsed.diagnosis || !Array.isArray(parsed.steps)) {
      console.warn("[Groq] Invalid triage response structure");
      return null;
    }

    // Normalizar valores
    const validCategories = ["hardware", "software", "red", "accesos", "otros"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const validComplexities = ["SIMPLE", "MEDIUM", "COMPLEX"];
    const validUrgencies = ["low", "medium", "high", "critical"];

    return {
      category: validCategories.includes(parsed.category) ? parsed.category : "otros",
      categoryConfidence: Math.min(1, Math.max(0, parsed.categoryConfidence || 0.7)),
      priority: validPriorities.includes(parsed.priority) ? parsed.priority : "MEDIUM",
      urgency: validUrgencies.includes(parsed.urgency) ? parsed.urgency : "medium",
      complexity: validComplexities.includes(parsed.complexity) ? parsed.complexity : "MEDIUM",
      diagnosis: parsed.diagnosis || "No se pudo generar un diagnóstico automático.",
      steps: parsed.steps?.slice(0, 6) || ["Reinicia el equipo.", "Describe el problema con más detalle."],
      estimatedTime: parsed.estimatedTime || "30 minutos - 1 hora",
      requiresTicket: !!parsed.requiresTicket,
    };
  } catch (err) {
    console.warn("[Groq] Failed to parse triage response:", (err as Error).message);
    return null;
  }
}

// Convierte GroqTriageOutput a ClassificationResult para compatibilidad
export function groqToClassification(groq: GroqTriageOutput, text: string): ClassificationResult {
  const knowledgeMatch = findKnowledge(text);
  return {
    category: groq.category,
    categoryConfidence: groq.categoryConfidence,
    priority: groq.priority,
    priorityReason: `Determinado por IA (Groq/Llama 3): prioridad ${groq.priority} basada en análisis de urgencia y criticidad del problema.`,
    urgency: groq.urgency as "low" | "medium" | "high" | "critical",
    complexity: groq.complexity as "SIMPLE" | "MEDIUM" | "COMPLEX",
    requiresTicket: groq.requiresTicket,
    estimatedTime: groq.estimatedTime,
    diagnosis: groq.diagnosis,
    suggestedSteps: groq.steps,
    followUpQuestions: [],
    knowledgeMatch,
    analysis: `🤖 **Análisis por IA (Llama 3)**:\n\n**Diagnóstico**: ${groq.diagnosis}\n\n**Categoría**: ${groq.category.toUpperCase()} (${Math.round(groq.categoryConfidence * 100)}% confianza)\n**Urgencia**: ${groq.urgency.toUpperCase()}\n**Prioridad**: ${groq.priority}\n**Tiempo estimado**: ${groq.estimatedTime}\n**Requiere ticket**: ${groq.requiresTicket ? 'Sí' : 'No (posible auto-resolución)'}`,
  };
}
