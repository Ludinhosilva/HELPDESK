// Generador dinámico de soluciones basado en análisis real del problema.
// No devuelve respuestas predeterminadas por categoría, sino que analiza
// el texto del usuario y los datos de clasificación para generar soluciones específicas.

import type { ClassificationResult } from "./classify";

export interface CopilotResult {
  subject: string;
  body: string;
  estimatedTime: string;
  diagnosticResumen: string;
  pasosAccion: string[];
  prevencionTips: string[];
}

export function generateDynamicSolution(
  title: string,
  description: string,
  classification: ClassificationResult
): CopilotResult {
  const problem = `${title}. ${description}`;
  const { category, diagnosis, suggestedSteps, urgency, estimatedTime, knowledgeMatch } = classification;

  // Generar asunto contextual
  const subject = `Re: ${title} — Diagnóstico y solución`;

  // Resumen del diagnóstico
  let diagnosticResumen: string;
  if (knowledgeMatch) {
    diagnosticResumen = `## Diagnóstico\n\nTras analizar tu caso, he identificado el siguiente problema:\n\n**${diagnosis}**\n\nEste es un incidente de tipo **${category.toUpperCase()}** con nivel de urgencia **${urgency.toUpperCase()}**. El tiempo estimado de resolución es de **${estimatedTime}**.`;
  } else {
    diagnosticResumen = `## Diagnóstico\n\nHe analizado tu problema y, basado en los síntomas descritos (**${problem.substring(0, 100)}...**), he clasificado este incidente como:\n\n- **Categoría**: ${category.toUpperCase()}\n- **Urgencia**: ${urgency.toUpperCase()}\n- **Tiempo estimado**: ${estimatedTime}\n\n${diagnosis}`;
  }

  // Pasos de acción específicos
  const pasosAccion: string[] = [];
  if (suggestedSteps.length > 0) {
    pasosAccion.push("## Pasos para resolver el problema\n");
    suggestedSteps.forEach((step, i) => {
      pasosAccion.push(`${i + 1}. ${step}`);
    });
  }

  // Consejos de prevención según categoría
  const prevencionTips = generatePreventionTips(category, problem);

  // Generar cuerpo completo
  const body = [
    diagnosticResumen,
    "",
    ...pasosAccion,
    "",
    "## Prevención",
    ...prevencionTips.map((t, i) => `${i + 1}. ${t}`),
    "",
    "---",
    "",
    "*Este diagnóstico fue generado por el asistente IA de FlixSupport basado en el análisis de tu caso. Si el problema persiste después de seguir estos pasos, se creará un ticket de soporte y un técnico te contactará.*",
  ].join("\n");

  return {
    subject,
    body,
    estimatedTime,
    diagnosticResumen,
    pasosAccion: suggestedSteps,
    prevencionTips,
  };
}

function generatePreventionTips(category: string, problem: string): string[] {
  const lower = problem.toLowerCase();

  const tips: Record<string, string[]> = {
    hardware: [
      "Realiza limpieza física del equipo cada 6 meses (polvo en ventiladores y teclado)",
      "No consumas alimentos ni bebidas cerca del equipo para evitar derrames",
      "Usa un protector de voltaje o UPS para proteger contra picos eléctricos",
      "Mantén el equipo en superficies planas y duras para ventilación adecuada",
      "Haz respaldos trimestrales de tus archivos importantes en un disco externo o nube",
    ],
    software: [
      "Mantén Windows y todos los programas actualizados a la última versión",
      "No instales programas de fuentes desconocidas o sitios no oficiales",
      "Usa un antivirus activo y realiza escaneos completos mensuales",
      "Libera espacio en disco regularmente (mínimo 20% libre en C:)",
      "Crea un punto de restauración del sistema antes de instalar software nuevo",
    ],
    red: [
      "Reinicia el router al menos una vez al mes para mantener la conexión estable",
      "Cambia la contraseña del WiFi periódicamente y usa WPA2/WPA3",
      "No compartas tu red WiFi con desconocidos; usa una red de invitados si es necesario",
      "Mantén el firmware del router actualizado (revisa el sitio del fabricante)",
      "Coloca el router en una ubicación central y elevada, lejos de paredes gruesas y electrodomésticos",
    ],
    accesos: [
      "Usa un gestor de contraseñas para no depender de tu memoria",
      "Activa la verificación en dos pasos en todas tus cuentas importantes",
      "No uses la misma contraseña en múltiples servicios",
      "Configura un correo o teléfono de recuperación en tu cuenta Microsoft",
      "Cierra sesión en equipos compartidos y no guardes contraseñas en navegadores públicos",
    ],
    otros: [
      "Documenta los problemas que ocurren con frecuencia para identificar patrones",
      "Mantén un registro de cambios que realizas en el sistema",
      "Capacítate en uso básico de herramientas de diagnóstico de Windows",
      "Consulta la base de conocimiento de FlixSupport para problemas comunes",
    ],
  };

  // Personalizar tips según el problema específico
  const baseTips = tips[category] || tips.otros;

  if (lower.includes("lento") || lower.includes("rendimiento")) {
    return [
      ...baseTips.slice(0, 2),
      "Desfragmenta el disco duro mensualmente (solo si es HDD, no SSD)",
      "Revisa los programas de inicio y desactiva los innecesarios",
      "Considera agregar más RAM si tu equipo tiene 4GB o menos",
    ];
  }

  if (lower.includes("virus") || lower.includes("malware")) {
    return [
      "No hagas clic en enlaces sospechosos en correos o mensajes",
      "No descargues archivos adjuntos de remitentes desconocidos",
      "Mantén Windows Defender activo y actualizado siempre",
      "Instala una extensión de bloqueo de anuncios (uBlock Origin) en tu navegador",
      "Realiza escaneos completos de seguridad cada 15 días",
    ];
  }

  return baseTips;
}
