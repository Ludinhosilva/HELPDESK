const HARDWARE_KEYWORDS = [
  "impresora", "monitor", "disco", "ram", "laptop",
  "teclado", "mouse", "pantalla", "cpu", "fuente",
  "placa", "disco duro", "ssd", "memoria", "gabinete",
];

const SOFTWARE_KEYWORDS = [
  "windows", "office", "error", "virus", "instalacion",
  "formateo", "actualizacion", "sistema operativo", "aplicacion",
  "programa", "excel", "word", "driver", "controlador",
  "navegador", "chrome", "explorador",
];

const NETWORK_KEYWORDS = [
  "wifi", "internet", "red", "conexion", "router",
  "switch", "cable", "dns", "ip", "modem",
  "lan", "inalambrico", "desconectado", "ping",
];

const ACCESS_KEYWORDS = [
  "correo", "usuario", "contraseña", "acceso", "password",
  "permiso", "cuenta", "login", "sesion", "bloqueado",
  "autenticacion", "rol", "privilegio",
];

function matchKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function classifyTicket(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (matchKeywords(text, NETWORK_KEYWORDS)) return "red";
  if (matchKeywords(text, HARDWARE_KEYWORDS)) return "hardware";
  if (matchKeywords(text, SOFTWARE_KEYWORDS)) return "software";
  if (matchKeywords(text, ACCESS_KEYWORDS)) return "accesos";

  return "otros";
}

export function suggestSolutions(
  title: string,
  description: string,
  category: string
): string[] {
  const suggestionsByCategory: Record<string, string[]> = {
    hardware: [
      "Verificar conexiones físicas del dispositivo",
      "Reiniciar el dispositivo y probar nuevamente",
      "Actualizar drivers del hardware desde el Administrador de Dispositivos",
      "Ejecutar diagnóstico de hardware incorporado",
      "Revisar si el dispositivo aparece en el Administrador de Dispositivos",
    ],
    software: [
      "Reiniciar la aplicación o el sistema operativo",
      "Verificar que el software esté actualizado a la última versión",
      "Ejecutar el solucionador de problemas de Windows",
      "Reinstalar el software problemático",
      "Restaurar el sistema a un punto anterior",
    ],
    red: [
      "Verificar la conexión de cables de red (LAN y alimentación del router)",
      "Reiniciar el router o módem (esperar 30 segundos)",
      "Ejecutar diagnóstico de red: ipconfig /flushdns, ping, tracert",
      "Probar con otra red o conexión alternativa (ej. datos móviles)",
      "Verificar que el cable de red esté correctamente conectado",
    ],
    accesos: [
      "Verificar credenciales y permisos del usuario en Active Directory",
      "Restablecer contraseña del usuario en el panel de control",
      "Revisar configuración de grupos y políticas de acceso",
      "Verificar que la cuenta no esté bloqueada o expirada",
      "Comprobar los logs de autenticación del servidor",
    ],
    otros: [
      "Revisar documentación del problema en la base de conocimiento",
      "Reiniciar el sistema y reproducir el incidente",
      "Verificar logs del sistema para identificar el error",
      "Escalar al equipo especializado correspondiente",
      "Documentar el problema y la solución aplicada",
    ],
  };

  return suggestionsByCategory[category] ?? suggestionsByCategory.otros;
}

export interface CopilotResponse {
  subject: string;
  body: string;
  estimatedTime: string;
}

export function generateCopilotResponse(
  title: string,
  description: string,
  category: string,
  similarTickets: { title: string; solution: string }[]
): CopilotResponse {
  const solutions = suggestSolutions(title, description, category);

  let body = `Hola,\n\n`;
  body += `Hemos revisado su solicitud respecto a: "${title}"\n\n`;
  body += `Descripción del problema:\n${description}\n\n`;

  if (similarTickets.length > 0) {
    body += `Hemos encontrado casos similares resueltos anteriormente:\n`;
    similarTickets.slice(0, 2).forEach((st) => {
      body += `- "${st.title}": ${st.solution}\n`;
    });
    body += `\n`;
  }

  body += `Recomendamos seguir estos pasos:\n`;
  solutions.forEach((s, i) => {
    body += `${i + 1}. ${s}\n`;
  });

  body += `\nQuedamos atentos a cualquier consulta adicional.\n`;
  body += `Saludos cordiales,\nEquipo de Soporte TI`;

  const estimateTime = category === "red" ? "1-2 horas" :
    category === "hardware" ? "2-4 horas" :
    category === "software" ? "1-3 horas" : "30 min - 1 hora";

  return {
    subject: `Re: ${title} - Solución sugerida`,
    body,
    estimatedTime: estimateTime,
  };
}

export function searchSimilar(
  title: string,
  description: string,
  resolvedTickets: { id: string; title: string; description: string; category: { name: string } | null }[]
): { id: string; title: string; similarity: number; category: string }[] {
  const words = `${title} ${description}`.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  return resolvedTickets
    .map((t) => {
      const ticketText = `${t.title} ${t.description}`.toLowerCase();
      const matches = words.filter((w) => ticketText.includes(w)).length;
      const similarity = words.length > 0 ? matches / words.length : 0;
      return { id: t.id, title: t.title, similarity, category: t.category?.name ?? "General" };
    })
    .filter((t) => t.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}
