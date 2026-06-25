// Analizador de sentimiento y urgencia mejorado.
// Detecta frustración, urgencia, criticidad y contexto emocional.

export interface SentimentResult {
  level: "CALM" | "FRUSTRATED" | "CRITICAL";
  score: number;
  matches: string[];
  explanation: string;
}

const URGENT_KEYWORDS = [
  "urgente", "rapido", "ya", "inmediato", "ahora", "cuanto antes",
  "emergencia", "critico", "no puedo esperar", "necesito ya",
  "para ayer", "apurate", "apúrate",
];

const FRUSTRATED_KEYWORDS = [
  "enojo", "molesto", "harto", "cansado", "mal servicio",
  "siempre falla", "otra vez", "de nuevo", "no puede ser",
  "increible", "increíble", "desesperado", "frustrado",
  "estoy cansado", "ya me canse", "ya me cansé", "basta",
  "solucionen", "arreglen esto",
];

const CRITICAL_KEYWORDS = [
  "perdida de datos", "perdida dinero", "caido", "detenido",
  "paralizado", "no funciona nada", "todo caido",
  "produccion parada", "producción parada", "no puedo trabajar",
  "toda la oficina", "todos sin acceso", "datos perdidos",
  "informacion perdida", "información perdida", "se borro todo",
  "se borró todo", "robo", "hackeo", "hackearon",
  "ransomware", "secuestro de datos",
];

const CALM_KEYWORDS = [
  "consulta", "pregunta", "duda", "cuando puedas", "sin prisa",
  "no es urgente", "tranquilo", "solo preguntaba", "por curiosidad",
  "gracias", "por favor", "cuando tengas tiempo",
];

export function analyzeSentiment(text: string): SentimentResult {
  const lower = text.toLowerCase();
  let score = 0;
  const matches: string[] = [];

  // Palabras críticas (mayor peso)
  for (const kw of CRITICAL_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 40;
      matches.push(kw);
    }
  }

  // Palabras de frustración
  for (const kw of FRUSTRATED_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 25;
      matches.push(kw);
    }
  }

  // Palabras de urgencia
  for (const kw of URGENT_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 15;
      matches.push(kw);
    }
  }

  // Palabras de calma (restan puntaje)
  for (const kw of CALM_KEYWORDS) {
    if (lower.includes(kw)) {
      score -= 15;
    }
  }

  // Detectar mayúsculas (indica grito/urgencia)
  const upperCount = (text.match(/[A-ZÁÉÍÓÚÑ]{2,}/g) || []).length;
  if (upperCount >= 3) {
    score += 10;
    matches.push("USO_MAYUSCULAS");
  }

  // Detectar signos de exclamación múltiples
  const exclamCount = (text.match(/!/g) || []).length;
  if (exclamCount >= 3) {
    score += 8;
    matches.push("EXCLAMACIONES");
  }

  // Detectar frases de desesperación
  const despairPhrases = [
    "ayuda", "help", "auxilio", "socorro", "por favor ayúdenme",
    "estoy desesperado", "no se que hacer", "no sé qué hacer",
    "perdi todo", "perdí todo",
  ];
  for (const phrase of despairPhrases) {
    if (lower.includes(phrase)) {
      score += 20;
      matches.push(phrase);
    }
  }

  // Determinar nivel
  let level: "CALM" | "FRUSTRATED" | "CRITICAL";
  let explanation: string;

  if (score >= 40) {
    level = "CRITICAL";
    explanation = "El mensaje contiene múltiples indicadores de emergencia. El usuario está experimentando un problema grave que requiere atención inmediata.";
  } else if (score >= 15) {
    level = "FRUSTRATED";
    explanation = "El usuario muestra signos de frustración o urgencia moderada. Se recomienda priorizar la respuesta.";
  } else {
    level = "CALM";
    explanation = "El tono del mensaje es tranquilo. El usuario describe el problema sin indicadores de urgencia.";
  }

  return { level, score, matches, explanation };
}

export function getPriorityOverride(level: string, currentPriority: string): string | null {
  if (level === "CRITICAL") return "URGENT";
  if (level === "FRUSTRATED") {
    const order = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    const currentIdx = order.indexOf(currentPriority);
    const suggested = currentPriority === "LOW" ? "MEDIUM" : "HIGH";
    const suggestedIdx = order.indexOf(suggested);
    if (suggestedIdx > currentIdx) return suggested;
    return null;
  }
  return null;
}
