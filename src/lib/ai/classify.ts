// Motor de clasificación con scoring ponderado y análisis de contexto.
// Evalúa múltiples factores: palabras clave con peso, contexto semántico,
// severidad, urgencia implícita, y coincidencia con base de conocimiento.

import { findKnowledge, type KnowledgeEntry } from "./knowledge-base";
import { analyzeSentiment } from "@/lib/sentiment";

export interface ClassificationResult {
  category: string;
  categoryConfidence: number;    // 0-1
  priority: string;              // LOW | MEDIUM | HIGH | URGENT
  priorityReason: string;
  urgency: "low" | "medium" | "high" | "critical";
  complexity: "SIMPLE" | "MEDIUM" | "COMPLEX";
  requiresTicket: boolean;
  estimatedTime: string;
  diagnosis: string;
  suggestedSteps: string[];
  followUpQuestions: string[];
  knowledgeMatch: KnowledgeEntry | null;
  analysis: string;              // Explicación en español del análisis
}

// Palabras clave con pesos por categoría
const WEIGHTED_KEYWORDS: Record<string, Array<{ word: string; weight: number }>> = {
  hardware: [
    { word: "no enciende", weight: 10 }, { word: "pantalla rota", weight: 10 },
    { word: "quemado", weight: 9 }, { word: "olor a quemado", weight: 10 },
    { word: "se mojó", weight: 10 }, { word: "agua", weight: 9 },
    { word: "laptop", weight: 1 }, { word: "pc", weight: 1 },
    { word: "monitor", weight: 2 }, { word: "teclado", weight: 3 },
    { word: "pantalla", weight: 3 }, { word: "disco duro", weight: 4 },
    { word: "ram", weight: 4 }, { word: "memoria", weight: 3 },
    { word: "fuente", weight: 5 }, { word: "cargador", weight: 5 },
    { word: "batería", weight: 4 }, { word: "ventilador", weight: 4 },
    { word: "calienta", weight: 4 }, { word: "temperatura", weight: 3 },
    { word: "impresora", weight: 5 }, { word: "mouse", weight: 3 },
    { word: "cable", weight: 2 }, { word: "puerto", weight: 3 },
    { word: "usb", weight: 3 }, { word: "hdmi", weight: 3 },
    { word: "parlantes", weight: 2 }, { word: "audio", weight: 2 },
    { word: "sonido", weight: 2 }, { word: "camara", weight: 2 },
    { word: "garantia", weight: 1 }, { word: "caida", weight: 10 },
    { word: "golpe", weight: 9 }, { word: "derrame", weight: 10 },
    { word: "ruido", weight: 6 }, { word: "click", weight: 7 },
  ],
  software: [
    { word: "no abre", weight: 6 }, { word: "error", weight: 4 },
    { word: "pantalla azul", weight: 9 }, { word: "bsod", weight: 9 },
    { word: "se cierra", weight: 5 }, { word: "virus", weight: 9 },
    { word: "malware", weight: 9 }, { word: "lento", weight: 3 },
    { word: "windows", weight: 2 }, { word: "office", weight: 5 },
    { word: "word", weight: 4 }, { word: "excel", weight: 4 },
    { word: "actualización", weight: 4 }, { word: "update", weight: 4 },
    { word: "instalar", weight: 2 }, { word: "desinstalar", weight: 2 },
    { word: "programa", weight: 2 }, { word: "aplicación", weight: 2 },
    { word: "driver", weight: 5 }, { word: "controlador", weight: 5 },
    { word: "navegador", weight: 3 }, { word: "chrome", weight: 3 },
    { word: "compatible", weight: 3 }, { word: "licencia", weight: 3 },
    { word: "activar", weight: 3 }, { word: "bloqueado", weight: 5 },
    { word: "formateo", weight: 6 }, { word: "formatear", weight: 6 },
    { word: "reinstalar", weight: 5 },
  ],
  red: [
    { word: "internet", weight: 4 }, { word: "wifi", weight: 4 },
    { word: "red", weight: 4 }, { word: "conexión", weight: 3 },
    { word: "conectado", weight: 2 }, { word: "router", weight: 5 },
    { word: "módem", weight: 5 }, { word: "señal", weight: 3 },
    { word: "no carga", weight: 4 }, { word: "desconecta", weight: 4 },
    { word: "intermitente", weight: 4 }, { word: "cable red", weight: 5 },
    { word: "ethernet", weight: 5 }, { word: "dns", weight: 5 },
    { word: "ip", weight: 4 }, { word: "proxy", weight: 4 },
    { word: "vpn", weight: 5 }, { word: "inalámbrico", weight: 2 },
    { word: "lan", weight: 4 }, { word: "ping", weight: 4 },
    { word: "latencia", weight: 3 }, { word: "lentitud red", weight: 3 },
    { word: "datos móviles", weight: 2 },
  ],
  accesos: [
    { word: "contraseña", weight: 5 }, { word: "password", weight: 5 },
    { word: "olvidé", weight: 4 }, { word: "no recuerdo", weight: 4 },
    { word: "acceso", weight: 4 }, { word: "login", weight: 4 },
    { word: "no puedo entrar", weight: 5 }, { word: "cuenta", weight: 3 },
    { word: "usuario", weight: 3 }, { word: "permiso", weight: 4 },
    { word: "denegado", weight: 5 }, { word: "carpeta", weight: 3 },
    { word: "compartir", weight: 3 }, { word: "correo", weight: 3 },
    { word: "email", weight: 3 }, { word: "outlook", weight: 4 },
    { word: "buzón", weight: 3 }, { word: "sincronizar", weight: 3 },
    { word: "bloqueado", weight: 5 }, { word: "sesion", weight: 3 },
    { word: "sesión", weight: 3 }, { word: "iniciar sesion", weight: 4 },
    { word: "iniciar sesión", weight: 4 }, { word: "cerrar sesión", weight: 3 },
    { word: "token", weight: 4 }, { word: "autenticación", weight: 4 },
    { word: "autenticacion", weight: 4 },
  ],
};

// Palabras de urgencia explícita
const URGENCY_KEYWORDS: Record<string, number> = {
  "urgente": 10, "emergencia": 10, "crítico": 10, "inmediato": 9,
  "ya": 6, "rápido": 6, "ahora": 5, "cuanto antes": 7,
  "no puedo trabajar": 9, "detenido": 8, "paralizado": 9,
  "producción parada": 10, "cliente esperando": 8, "reunión": 5,
  "presentación": 6, "deadline": 7, "fecha límite": 7,
  "todo el equipo": 6, "toda la oficina": 8, "varios usuarios": 5,
  "desde ayer": 3, "desde hace días": 4, "semanas": 2,
};

// Palabras de baja urgencia
const LOW_URGENCY_KEYWORDS: Record<string, number> = {
  "consulta": -5, "pregunta": -4, "duda": -3,
  "cuando puedas": -5, "sin prisa": -6, "no es urgente": -8,
  "tranquilo": -5, "solo preguntaba": -6, "por curiosidad": -5,
};

function scoreCategory(text: string, category: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  const keywords = WEIGHTED_KEYWORDS[category] || [];
  for (const { word, weight } of keywords) {
    if (lower.includes(word.toLowerCase())) {
      score += weight;
    }
  }
  return score;
}

function scoreUrgency(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const [word, weight] of Object.entries(URGENCY_KEYWORDS)) {
    if (lower.includes(word.toLowerCase())) score += weight;
  }
  for (const [word, weight] of Object.entries(LOW_URGENCY_KEYWORDS)) {
    if (lower.includes(word.toLowerCase())) score += weight;
  }
  return score;
}

function determineComplexity(requiresTicket: boolean, urgencyScore: number, categoryScore: number): "SIMPLE" | "MEDIUM" | "COMPLEX" {
  if (requiresTicket) return "COMPLEX";
  if (urgencyScore >= 10 || categoryScore >= 15) return "MEDIUM";
  if (urgencyScore >= 4) return "MEDIUM";
  return "SIMPLE";
}

function determinePriority(urgencyScore: number, sentimentLevel: string, requiresTicket: boolean): { priority: string; reason: string } {
  if (sentimentLevel === "CRITICAL" || urgencyScore >= 15) {
    return { priority: "URGENT", reason: "El usuario expresa urgencia crítica. Múltiples indicadores de emergencia detectados en el mensaje." };
  }
  if (urgencyScore >= 8 || sentimentLevel === "FRUSTRATED" || requiresTicket) {
    return { priority: "HIGH", reason: "Problema con impacto significativo. El usuario muestra frustración o el problema requiere intervención técnica." };
  }
  if (urgencyScore >= 3) {
    return { priority: "MEDIUM", reason: "Problema moderado. El usuario puede continuar trabajando pero con limitaciones." };
  }
  return { priority: "LOW", reason: "Consulta o problema menor. No hay indicadores de urgencia en el mensaje." };
}

export function classifyProblem(title: string, description: string): ClassificationResult {
  const fullText = `${title} ${description}`.toLowerCase();
  const combined = `${title}. ${description}`;

  // Scoring por categoría
  const scores: Record<string, number> = {};
  for (const cat of Object.keys(WEIGHTED_KEYWORDS)) {
    scores[cat] = scoreCategory(fullText, cat);
  }

  // Categoría con mayor puntaje
  let bestCategory = "otros";
  let bestScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestCategory = cat;
    }
  }

  // Confianza normalizada
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0 ? Math.min(bestScore / Math.max(totalScore, 5), 1) : 0.3;

  // Urgencia
  const urgencyScore = scoreUrgency(fullText);

  // Base de conocimiento
  const knowledgeMatch = findKnowledge(combined);

  // Sentimiento
  const sentiment = analyzeSentiment(combined);

  // Complejidad
  const requiresTicket = knowledgeMatch?.requiresTicket ?? (bestScore >= 12 || urgencyScore >= 10);
  const complexity = determineComplexity(requiresTicket, urgencyScore, bestScore);

  // Prioridad
  const { priority, reason: priorityReason } = determinePriority(urgencyScore, sentiment.level, requiresTicket);

  // Urgencia textual
  let urgency: "low" | "medium" | "high" | "critical" = "medium";
  if (urgencyScore >= 15) urgency = "critical";
  else if (urgencyScore >= 8) urgency = "high";
  else if (urgencyScore <= 0) urgency = "low";

  // Mapear categoría interna a slug
  const categoryMap: Record<string, string> = {
    hardware: "hardware",
    software: "software",
    red: "red",
    accesos: "accesos",
    otros: "otros",
  };

  // Generar análisis explicativo
  const analysis = generateAnalysis(bestCategory, confidence, priority, urgency, knowledgeMatch);

  return {
    category: categoryMap[bestCategory] || bestCategory,
    categoryConfidence: confidence,
    priority,
    priorityReason,
    urgency,
    complexity,
    requiresTicket,
    estimatedTime: knowledgeMatch?.estimatedTime || "1-2 horas",
    diagnosis: knowledgeMatch?.diagnosis || `Problema de ${bestCategory} detectado con ${Math.round(confidence * 100)}% de confianza.`,
    suggestedSteps: knowledgeMatch?.steps || generateDefaultSteps(bestCategory),
    followUpQuestions: knowledgeMatch?.followUpQuestions || [],
    knowledgeMatch,
    analysis,
  };
}

function generateAnalysis(category: string, confidence: number, priority: string, urgency: string, match: KnowledgeEntry | null): string {
  const confPct = Math.round(confidence * 100);
  let analysis = `He analizado tu mensaje y he detectado un problema de tipo **${category.toUpperCase()}** con un ${confPct}% de confianza.\n\n`;

  if (match) {
    analysis += `El patrón de síntomas coincide con: **${match.diagnosis}**\n\n`;
    analysis += `📊 **Complejidad**: ${match.requiresTicket ? 'Requiere atención técnica' : 'Posible de resolver con auto-ayuda'}\n`;
    analysis += `⏱️ **Tiempo estimado**: ${match.estimatedTime}\n`;
  } else {
    analysis += `Los síntomas descritos sugieren un incidente de categoría **${category}**. Para darte un diagnóstico más preciso, necesito hacerte algunas preguntas adicionales.\n`;
  }

  analysis += `\n🔴 **Nivel de urgencia**: ${urgency.toUpperCase()}\n`;
  analysis += `⚡ **Prioridad asignada**: ${priority}\n`;

  return analysis;
}

function generateDefaultSteps(category: string): string[] {
  const defaults: Record<string, string[]> = {
    hardware: [
      "Verifique todas las conexiones físicas (cables, enchufes, periféricos)",
      "Reinicie el equipo completamente (no suspender)",
      "Si es laptop, retire la batería y pruebe solo con cargador",
      "Escuche si hay pitidos o ruidos anormales al encender",
      "Si el problema persiste, se requiere diagnóstico presencial"
    ],
    software: [
      "Reinicie el equipo para descartar errores temporales",
      "Verifique si el problema ocurre en otras aplicaciones",
      "Ejecute el solucionador de problemas de Windows",
      "Actualice los drivers y el sistema operativo",
      "Si el error persiste, considere restaurar a un punto anterior"
    ],
    red: [
      "Reinicie el router/módem (desconectar 30 segundos)",
      "Verifique si otros dispositivos tienen el mismo problema",
      "Conecte directamente por cable Ethernet para descartar WiFi",
      "Ejecute 'ipconfig /release' y 'ipconfig /renew' en CMD",
      "Contacte a su ISP si el problema está en la línea"
    ],
    accesos: [
      "Verifique que el teclado no tenga Bloq Mayús activado",
      "Use la opción 'Olvidé mi contraseña' si está disponible",
      "Intente con otra cuenta de usuario si existe",
      "Contacte al administrador del sistema para restablecer credenciales",
      "No comparta sus credenciales con nadie"
    ],
    otros: [
      "Describa el problema con más detalle para un mejor diagnóstico",
      "Indique cuándo comenzó el problema",
      "Mencione si realizó algún cambio reciente en el equipo",
      "Especifique qué mensajes de error aparecen exactamente"
    ],
  };
  return defaults[category] || defaults.otros;
}
