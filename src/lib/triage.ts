export type Complexity = "SIMPLE" | "MEDIUM" | "COMPLEX";

export interface TriageResult {
  complexity: Complexity;
  category: string;
  solution: string | null;
  requiresPayment: boolean;
  reason: string;
  suggestedAction: string;
  estimatedCost: number;
}

const SIMPLE_PATTERNS: [RegExp, string][] = [
  [/olvide.*contra|olvido.*contra|reset.*pass|cambi.*contra/i, "Restablece tu contraseña desde la pantalla de login. Si no puedes, contacta a tu administrador."],
  [/papel.*atasc|atasco.*papel/i, "Abre la tapa de la impresora, retira el papel atascado con cuidado. Guia: https://helpdesklu-five.vercel.app/knowledge"],
  [/monitor.*apag|pantalla.*negr/i, "Verifica que el cable de poder esté conectado. Presiona el botón de encendido por 10 segundos."],
  [/mouse.*funcion|teclado.*funcion|mouse.*anda|teclado.*anda/i, "Prueba con otro puerto USB. Desconecta y conecta nuevamente. Si es inalámbrico, cambia las pilas."],
  [/wifi.*desconect|no.*conect.*wifi/i, "Haz clic en el icono de red, selecciona tu WiFi y haz clic en 'Conectar'. Verifica la contraseña."],
  [/no.*imprime|impresora.*imprime/i, "Verifica que la impresora esté encendida y con papel. Ve a Dispositivos e Impresoras y asegúrate que sea la predeterminada."],
  [/actualiz.*windows|update.*windows/i, "Ve a Configuración > Actualización y Seguridad > Windows Update. Haz clic en 'Buscar actualizaciones'."],
  [/navegador.*lento|chrome.*lento/i, "Limpia el caché: Ctrl+Shift+Supr. Selecciona 'Cookies' y 'Archivos en caché'. Luego reinicia el navegador."],
];

const COMPLEX_PATTERNS: RegExp[] = [
  /pantalla.*rot[ao]|pantalla.*quebr|LCD.*dañad|display.*roto/i,
  /disco.*dañad|disco.*muert|hdd.*fall|ssd.*fall/i,
  /virus.*no.*elimina|ransomware|secuestr.*datos|miner/i,
  /servidor.*caid[ao]|server.*down|base.*datos.*caid/i,
  /formateo.*complet|instalar.*windows.*desde.*cero/i,
  /cambi[oa].*pantalla|reparac.*hardware|cambi.*teclad|cambi.*bateri/i,
  /perdid.*datos|recuper.*archiv|rescatar.*informac/i,
  /red.*empres.*caid|router.*principal.*caid|switch.*dañad/i,
  /tarjeta.*madre|placa.*base.*dañad|fuente.*poder.*quem/i,
];

const MEDIUM_PATTERNS: RegExp[] = [
  /instal.*office|instal.*programa|instal.*software/i,
  /virus.*leve|antivirus|malware.*leve/i,
  /correo.*configur|outlook.*config|email.*no.*envi/i,
  /red.*lent[oa]|internet.*lent|wifi.*lent/i,
  /actualiz.*driver|driver.*desactualiz/i,
  /sistema.*lent[oa]|pc.*lent[oa]|comput.*lent/i,
  /configur.*red|configur.*impresor|configur.*correo/i,
  /acces.*carpet|permiso.*archiv|carpet.*compartid/i,
  /programa.*cierr|aplicacion.*error|app.*no.*abre/i,
];

const CATEGORY_PATTERNS: [RegExp, string][] = [
  [/impresora|monitor|pantalla|disco|ram|teclado|mouse|cpu|fuente|hardware/i, "Hardware"],
  [/windows|office|virus|instalac|formateo|programa|software|driver|actualiz/i, "Software"],
  [/wifi|internet|red|router|switch|cable|dns|ip|modem|conexion/i, "Red"],
  [/correo|usuario|contra|acceso|password|permiso|cuenta|login|sesion|bloque/i, "Accesos"],
];

export function triage(text: string): TriageResult {
  // Check COMPLEX first (highest priority)
  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(text)) {
      return {
        complexity: "COMPLEX",
        category: getCategory(text),
        solution: null,
        requiresPayment: true,
        reason: "Este problema requiere reparación física o intervención especializada. No podemos resolverlo automáticamente.",
        suggestedAction: "Activar Ticket Exprés para obtener respuesta garantizada en menos de 2 horas.",
        estimatedCost: 2000,
      };
    }
  }

  // Check SIMPLE
  for (const [pattern, solution] of SIMPLE_PATTERNS) {
    if (pattern.test(text)) {
      return {
        complexity: "SIMPLE",
        category: getCategory(text),
        solution,
        requiresPayment: false,
        reason: "Este es un problema común que puedes resolver siguiendo estos pasos.",
        suggestedAction: "Sigue las instrucciones para resolverlo. Si persiste, crea un ticket gratuito.",
        estimatedCost: 0,
      };
    }
  }

  // Check MEDIUM
  for (const pattern of MEDIUM_PATTERNS) {
    if (pattern.test(text)) {
      return {
        complexity: "MEDIUM",
        category: getCategory(text),
        solution: null,
        requiresPayment: false,
        reason: "Este problema requiere configuración o instalación. Podemos ayudarte con un ticket.",
        suggestedAction: "Crear un ticket para que un técnico te ayude.",
        estimatedCost: 0,
      };
    }
  }

  // Fallback: if it mentions complex keywords but not strongly matched
  if (/(repar|cambi|dañ|rot|quem|fall|averi)/i.test(text)) {
    return {
      complexity: "COMPLEX",
      category: getCategory(text),
      solution: null,
      requiresPayment: true,
      reason: "Por la descripción, parece un problema que requiere atención especializada.",
      suggestedAction: "Activar Ticket Exprés para prioridad urgente.",
      estimatedCost: 2000,
    };
  }

  // Default: MEDIUM
  return {
    complexity: "MEDIUM",
    category: getCategory(text),
    solution: null,
    requiresPayment: false,
    reason: "Describiste un problema que un técnico puede resolver.",
    suggestedAction: "Crear un ticket para que un técnico te ayude.",
    estimatedCost: 0,
  };
}

function getCategory(text: string): string {
  for (const [pattern, cat] of CATEGORY_PATTERNS) {
    if (pattern.test(text)) return cat;
  }
  return "Otros";
}
