const FRUSTRATED_KEYWORDS = [
  "enojo", "molesto", "harto", "cansado", "mal servicio",
  "ineficiente", "pesimo", "horrible", "queja", "reclamo",
];

const CRITICAL_KEYWORDS = [
  "perdida", "dinero", "caido", "caida", "emergencia",
  "critico", "grave", "urgentisimo", "detenido", "paralizado",
  "todo mal", "no funciona nada", "sistema caido",
];

const URGENT_KEYWORDS = [
  "urgente", "rapido", "ya", "inmediato", "ahora",
  "lo antes posible", "maximo", "corre prisa",
];

export type SentimentLevel = "CALM" | "FRUSTRATED" | "CRITICAL";

export interface SentimentResult {
  level: SentimentLevel;
  score: number;
  matches: string[];
}

export function analyzeSentiment(text: string): SentimentResult {
  const lower = text.toLowerCase();
  let score = 0;
  const matches: string[] = [];

  const urgentHits = URGENT_KEYWORDS.filter((kw) => lower.includes(kw));
  score += urgentHits.length * 15;
  matches.push(...urgentHits);

  const frustratedHits = FRUSTRATED_KEYWORDS.filter((kw) => lower.includes(kw));
  score += frustratedHits.length * 25;
  matches.push(...frustratedHits);

  const criticalHits = CRITICAL_KEYWORDS.filter((kw) => lower.includes(kw));
  score += criticalHits.length * 40;
  matches.push(...criticalHits);

  let level: SentimentLevel = "CALM";
  if (score >= 40) level = "CRITICAL";
  else if (score >= 15) level = "FRUSTRATED";

  return { level, score, matches };
}

export function getPriorityOverride(level: SentimentLevel, currentPriority: string): string | null {
  if (level === "CRITICAL") return "URGENT";
  if (level === "FRUSTRATED" && currentPriority !== "URGENT") {
    return currentPriority === "LOW" ? "MEDIUM" : "HIGH";
  }
  return null;
}
