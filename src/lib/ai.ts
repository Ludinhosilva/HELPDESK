const HARDWARE_KEYWORDS = [
  "impresora",
  "monitor",
  "disco",
  "ram",
  "laptop",
  "teclado",
  "mouse",
];

const SOFTWARE_KEYWORDS = [
  "windows",
  "office",
  "error",
  "virus",
  "instalacion",
  "formateo",
];

const NETWORK_KEYWORDS = [
  "wifi",
  "internet",
  "red",
  "conexion",
  "router",
  "switch",
];

const ACCESS_KEYWORDS = [
  "correo",
  "usuario",
  "contraseña",
  "acceso",
  "password",
];

function matchKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export function classifyTicket(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (matchKeywords(text, HARDWARE_KEYWORDS)) return "hardware";
  if (matchKeywords(text, SOFTWARE_KEYWORDS)) return "software";
  if (matchKeywords(text, NETWORK_KEYWORDS)) return "red";
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
      "Actualizar drivers del hardware",
    ],
    software: [
      "Reiniciar la aplicación o el sistema",
      "Verificar que el software esté actualizado",
      "Reinstalar el software problemático",
    ],
    red: [
      "Verificar la conexión de cables de red",
      "Reiniciar el router o módem",
      "Probar con otra red o conexión alternativa",
    ],
    accesos: [
      "Verificar credenciales y permisos del usuario",
      "Restablecer contraseña del usuario",
      "Revisar configuración de grupos y políticas de acceso",
    ],
    otros: [
      "Revisar documentación del problema",
      "Reiniciar el sistema y reproducir el incidente",
      "Escalar al equipo especializado correspondiente",
    ],
  };

  return suggestionsByCategory[category] ?? suggestionsByCategory.otros;
}
