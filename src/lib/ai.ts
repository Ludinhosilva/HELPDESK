// Motor de clasificación unificado. Delega al nuevo sistema de IA.
// Mantiene compatibilidad hacia atrás con la API existente.

import { classifyProblem, type ClassificationResult } from "./ai/classify";
import { generateDynamicSolution, type CopilotResult } from "./ai/solutions";
import { findKnowledge, findRelated } from "./ai/knowledge-base";

// === Re-exportar para compatibilidad ===
export type { ClassificationResult, CopilotResult };

export function classifyTicket(title: string, description: string): string {
  const result = classifyProblem(title, description);
  const slugToCategory: Record<string, string> = {
    hardware: "hardware", software: "software", red: "red", accesos: "accesos", otros: "otros",
  };
  return slugToCategory[result.category] || result.category;
}

export function suggestSolutions(title: string, description: string): string[] {
  const result = classifyProblem(title, description);
  return result.suggestedSteps;
}

export function generateCopilotResponse(
  title: string,
  description: string,
  category: string,
  similarTickets: Array<{ id: string; title: string; category: string; status: string }>
) {
  const classification = classifyProblem(title, description);
  const solution = generateDynamicSolution(title, description, classification);

  let body = solution.body;

  if (similarTickets.length > 0) {
    body += "\n\n## Tickets similares resueltos\n\n";
    similarTickets.slice(0, 3).forEach((t, i) => {
      body += `${i + 1}. **${t.title}** (${t.category}) — Resuelto ✅\n`;
    });
  }

  return {
    subject: solution.subject,
    body,
    estimatedTime: solution.estimatedTime,
    classification: {
      category: classification.category,
      confidence: classification.categoryConfidence,
      priority: classification.priority,
      urgency: classification.urgency,
    },
  };
}

export function searchSimilar(
  title: string,
  description: string,
  resolvedTickets: Array<{ id: string; title: string; description: string; category: string }>
) {
  const words = `${title} ${description}`.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .map(w => w.replace(/[^a-záéíóúñ0-9]/g, ""));

  const scored = resolvedTickets.map(ticket => {
    const ticketText = `${ticket.title} ${ticket.description}`.toLowerCase();
    let matches = 0;
    for (const word of words) {
      if (ticketText.includes(word)) matches++;
    }
    const similarity = words.length > 0 ? matches / words.length : 0;
    return { ...ticket, similarity, matches };
  });

  return scored
    .filter(t => t.similarity > 0.2)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

export { findKnowledge, findRelated, classifyProblem };
