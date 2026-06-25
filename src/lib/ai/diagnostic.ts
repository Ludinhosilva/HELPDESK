// Motor de diagnóstico interactivo: árbol de decisión conversacional.
// Guía al usuario por una serie de preguntas para resolver el problema
// antes de crear un ticket. Solo deriva a ticket si el diagnóstico falla.

export interface DiagnosticState {
  step: number;
  symptom: string;
  category: string | null;
  responses: Record<string, string>;
  resolved: boolean;
  nextQuestion: string | null;
  conclusion: string | null;
  suggestedActions: string[];
}

interface DiagnosticNode {
  id: string;
  question: string;
  options: Array<{
    label: string;
    value: string;
    next: string;
    action?: string;
  }>;
}

const DIAGNOSTIC_TREE: Record<string, DiagnosticNode> = {
  start: {
    id: "start",
    question: "Entiendo que tienes un problema. Para ayudarte mejor, ¿qué tipo de dispositivo estás usando?",
    options: [
      { label: "Laptop / Notebook", value: "laptop", next: "symptom_category" },
      { label: "PC de escritorio", value: "desktop", next: "symptom_category" },
      { label: "Impresora", value: "printer", next: "printer_check" },
      { label: "Teléfono / Tablet", value: "mobile", next: "mobile_redirect" },
    ],
  },
  symptom_category: {
    id: "symptom_category",
    question: "¿Qué tipo de problema estás experimentando?",
    options: [
      { label: "No enciende / No da video", value: "no_power", next: "power_check" },
      { label: "Está muy lento / Se congela", value: "slow", next: "slow_check" },
      { label: "No tengo internet / WiFi", value: "no_internet", next: "internet_check" },
      { label: "No puedo entrar / Contraseña", value: "access", next: "access_check" },
      { label: "Pantalla azul / Error Windows", value: "bsod", next: "bsod_check" },
      { label: "Programa no funciona", value: "software", next: "software_check" },
      { label: "Ruido extraño / Se calienta", value: "noise", next: "noise_check" },
    ],
  },

  // === NO ENCIENDE ===
  power_check: {
    id: "power_check",
    question: "Cuando presionas el botón de encendido, ¿qué sucede exactamente?",
    options: [
      { label: "No hace absolutamente nada (ni luces ni ventiladores)", value: "dead", next: "power_dead", action: "Posible falla de fuente de poder o cargador." },
      { label: "Los ventiladores giran pero la pantalla queda negra", value: "no_display", next: "power_no_display", action: "Posible falla de RAM, GPU o pantalla." },
      { label: "Enciende pero se apaga a los segundos", value: "turns_off", next: "power_off", action: "Posible sobrecalentamiento o falla de batería." },
    ],
  },
  power_dead: {
    id: "power_dead",
    question: "¿El LED del cargador o fuente de poder enciende cuando está conectado?",
    options: [
      { label: "Sí, el LED enciende normalmente", value: "led_on", next: "power_motherboard", action: "El cargador funciona. El problema puede estar en la placa madre o el botón de encendido." },
      { label: "No, el LED no enciende", value: "led_off", next: "power_charger", action: "El cargador o la fuente de poder está defectuosa. Prueba con otro cargador compatible." },
    ],
  },
  power_charger: {
    id: "power_charger",
    question: "¿Tienes acceso a otro cargador o fuente de poder compatible para probar?",
    options: [
      { label: "Sí, puedo probar con otro", value: "yes_test", next: "resolved_charger" },
      { label: "No tengo otro cargador", value: "no_test", next: "needs_ticket" },
    ],
  },
  resolved_charger: {
    id: "resolved_charger",
    question: "",
    options: [
      { label: "Continuar", value: "done", next: "end", action: "Prueba con el otro cargador. Si el equipo enciende, el cargador original está dañado y debe ser reemplazado. Si aún no enciende, el problema está en la placa madre y necesitarás servicio técnico." },
    ],
  },
  power_no_display: {
    id: "power_no_display",
    question: "¿Has probado conectar un monitor externo (HDMI/VGA)?",
    options: [
      { label: "Sí, y en el monitor externo sí se ve", value: "external_works", next: "resolved_screen", action: "El problema es la pantalla del equipo o el cable flex interno. Requiere servicio técnico para diagnóstico preciso." },
      { label: "No he probado con monitor externo", value: "not_tested", next: "power_ram" },
      { label: "Probé y tampoco se ve en monitor externo", value: "no_external", next: "power_ram" },
    ],
  },
  power_ram: {
    id: "power_ram",
    question: "¿Te sientes cómodo/a abriendo el equipo para revisar la memoria RAM? (Solo si sabes hacerlo)",
    options: [
      { label: "Sí, puedo intentarlo", value: "yes_ram", next: "resolved_ram", action: "Apaga el equipo, desconecta la batería, retira los módulos de RAM, limpia los contactos con una goma suave y vuelve a insertarlos firmemente. Prueba con un solo módulo en diferentes slots." },
      { label: "Prefiero que lo revise un técnico", value: "no_ram", next: "needs_ticket" },
    ],
  },
  resolved_ram: {
    id: "resolved_ram",
    question: "",
    options: [
      { label: "Continuar", value: "done", next: "end", action: "Después de limpiar y reinsertar la RAM, enciende el equipo. Si funciona, el problema era mal contacto. Si no, la falla está en la placa madre o GPU y requiere servicio técnico especializado." },
    ],
  },
  resolved_screen: {
    id: "resolved_screen",
    question: "",
    options: [
      { label: "Continuar", value: "done", next: "end", action: "Al funcionar en monitor externo, confirmamos que el problema es la pantalla del equipo. Puede ser el cable flex LVDS, el backlight, o el panel LCD. Necesitas un técnico para diagnóstico y reemplazo." },
    ],
  },
  power_off: {
    id: "power_off",
    question: "¿El equipo se siente muy caliente al tacto cuando se apaga?",
    options: [
      { label: "Sí, está muy caliente", value: "hot", next: "resolved_overheat", action: "Sobrecalentamiento. Limpia las rejillas de ventilación con aire comprimido. Si el problema persiste, necesita cambio de pasta térmica." },
      { label: "No, temperatura normal", value: "normal", next: "needs_ticket", action: "Apagado repentino sin sobrecalentamiento puede indicar falla en la batería, fuente de poder o placa madre." },
    ],
  },
  power_motherboard: {
    id: "power_motherboard",
    question: "",
    options: [
      { label: "Continuar", value: "done", next: "end", action: "Como el cargador funciona pero el equipo no reacciona, la falla está en la placa madre. Intenta: 1) Mantén presionado el botón de encendido 30 segundos. 2) Si es laptop, retira la batería y prueba solo con cargador. 3) Si nada funciona, requiere servicio técnico." },
    ],
  },

  // === LENTITUD ===
  slow_check: {
    id: "slow_check",
    question: "¿La lentitud es general (todo el sistema) o solo en programas específicos?",
    options: [
      { label: "Todo el sistema está lento, incluso abrir carpetas", value: "general", next: "slow_general" },
      { label: "Solo ciertos programas van lentos", value: "specific", next: "slow_specific" },
    ],
  },
  slow_general: {
    id: "slow_general",
    question: "Abre el Administrador de Tareas (Ctrl+Shift+Esc). En la pestaña Rendimiento, ¿el Disco está al 100% constantemente?",
    options: [
      { label: "Sí, está pegado al 100%", value: "disk_100", next: "slow_disk", action: "El disco está saturado. Libera espacio, desfragmenta (si es HDD), desactiva programas de inicio, y ejecuta chkdsk." },
      { label: "No, el disco está normal", value: "disk_ok", next: "slow_ram" },
    ],
  },
  slow_disk: {
    id: "slow_disk",
    question: "",
    options: [
      { label: "Entendido, voy a seguir los pasos", value: "done", next: "end", action: "Para resolver el 100% de disco: 1) Presiona Win+R, escribe 'temp' y elimina todo. 2) Repite con '%temp%' y 'prefetch'. 3) Desactiva SysMain (services.msc > SysMain > Deshabilitar). 4) Ejecuta 'chkdsk /f' en CMD como administrador. Si el problema persiste por más de 2 días, el disco puede tener sectores dañados y necesitar reemplazo." },
    ],
  },
  slow_ram: {
    id: "slow_ram",
    question: "¿Cuánta memoria RAM tiene tu equipo? (Revisa en Configuración > Sistema > Acerca de)",
    options: [
      { label: "4 GB o menos", value: "low_ram", next: "needs_ticket", action: "Con 4GB de RAM, Windows 10/11 funciona al límite. Cada pestaña de Chrome consume ~200MB. Considera upgrade de RAM a 8GB mínimo, o cambia a SSD para mejorar el rendimiento." },
      { label: "8 GB o más", value: "ok_ram", next: "slow_software" },
    ],
  },
  slow_software: {
    id: "slow_software",
    question: "",
    options: [
      { label: "Entendido, voy a seguir los pasos", value: "done", next: "end", action: "Con suficiente RAM, la lentitud suele ser por software: 1) Desactiva programas de inicio (Admin. Tareas > Inicio). 2) Ejecuta un análisis completo de antivirus. 3) Desinstala programas que no uses. 4) Ejecuta 'sfc /scannow' en CMD como admin. Si persiste, considera formatear Windows." },
    ],
  },
  slow_specific: {
    id: "slow_specific",
    question: "",
    options: [
      { label: "Entendido, voy a seguir los pasos", value: "done", next: "end", action: "Para lentitud en programas específicos: 1) Reinstala el programa afectado. 2) Verifica que tengas la última versión. 3) Revisa en Admin. Tareas si el programa usa excesiva CPU/RAM. 4) Si es el navegador, limpia caché y extensiones, o prueba con otro navegador." },
    ],
  },

  // === INTERNET ===
  internet_check: {
    id: "internet_check",
    question: "¿El problema es solo en tu equipo o en todos los dispositivos de la casa/oficina?",
    options: [
      { label: "Todos los dispositivos están sin internet", value: "all_down", next: "inet_all", action: "El problema es el router/módem o el ISP. Reinicia el router (30 segundos desconectado). Si no vuelve, contacta a tu proveedor." },
      { label: "Solo mi equipo no tiene internet", value: "only_me", next: "inet_only" },
    ],
  },
  inet_all: {
    id: "inet_all",
    question: "",
    options: [
      { label: "Voy a reiniciar el router", value: "done", next: "end", action: "Reinicia el módem y router: 1) Desconecta ambos de la corriente. 2) Espera 30 segundos. 3) Conecta primero el módem, espera a que las luces estén estables. 4) Conecta el router. Si después de esto sigues sin internet, el problema es de tu proveedor (ISP). Llámalos." },
    ],
  },
  inet_only: {
    id: "inet_only",
    question: "¿Estás conectado por WiFi o por cable Ethernet?",
    options: [
      { label: "WiFi", value: "wifi", next: "inet_wifi", action: "Problemas WiFi: interferencia, distancia al router, o driver del adaptador." },
      { label: "Cable Ethernet", value: "ethernet", next: "inet_ethernet", action: "Problema de cable o configuración de red." },
    ],
  },
  inet_wifi: {
    id: "inet_wifi",
    question: "¿Aparece un triángulo amarillo o un ícono de 'globo terráqueo' en el icono de red?",
    options: [
      { label: "Sí, triángulo amarillo", value: "yellow", next: "inet_dns", action: "Conectado a la red pero sin acceso a internet. Problema de DNS o IP." },
      { label: "No, dice 'Conectado' pero no carga", value: "connected", next: "inet_dns" },
      { label: "Ni siquiera veo redes WiFi disponibles", value: "no_wifi", next: "inet_adapter" },
    ],
  },
  inet_dns: {
    id: "inet_dns",
    question: "",
    options: [
      { label: "Voy a seguir los pasos", value: "done", next: "end", action: "Para reparar la conexión: 1) Abre CMD como administrador. 2) Ejecuta: ipconfig /release, luego ipconfig /renew, luego ipconfig /flushdns. 3) Cambia DNS a 8.8.8.8 y 8.8.4.4 en Propiedades del adaptador. 4) Olvida la red WiFi y vuelve a conectarte." },
    ],
  },
  inet_adapter: {
    id: "inet_adapter",
    question: "",
    options: [
      { label: "Voy a seguir los pasos", value: "done", next: "end", action: "Adaptador WiFi deshabilitado: 1) Ve a Configuración > Red e Internet > Cambiar opciones del adaptador. 2) Si el WiFi está deshabilitado, click derecho > Habilitar. 3) En laptops, verifica que el switch físico de WiFi no esté en OFF (Fn + tecla de WiFi). 4) Si no aparece, reinstala el driver desde el sitio del fabricante." },
    ],
  },
  inet_ethernet: {
    id: "inet_ethernet",
    question: "",
    options: [
      { label: "Voy a seguir los pasos", value: "done", next: "end", action: "Para cable Ethernet: 1) Verifica que las luces del puerto Ethernet estén parpadeando (verde/ámbar). 2) Prueba con otro cable Ethernet. 3) Conecta a otro puerto del router. 4) Ejecuta 'ipconfig /release' y 'ipconfig /renew' en CMD. Si no funciona, el adaptador de red puede estar dañado." },
    ],
  },

  // === ACCESO ===
  access_check: {
    id: "access_check",
    question: "¿Qué tipo de acceso estás intentando?",
    options: [
      { label: "No recuerdo mi contraseña", value: "forgot", next: "access_forgot" },
      { label: "Acceso denegado a carpeta o archivo", value: "denied", next: "access_denied" },
      { label: "Mi cuenta está bloqueada", value: "locked", next: "access_locked" },
    ],
  },
  access_forgot: {
    id: "access_forgot",
    question: "¿Tu cuenta de Windows es local o usas una cuenta Microsoft (correo electrónico)?",
    options: [
      { label: "Cuenta Microsoft (correo @outlook, @hotmail, etc.)", value: "ms", next: "access_ms", action: "Puedes restablecerla desde account.microsoft.com desde otro dispositivo." },
      { label: "Cuenta local (solo usuario y contraseña)", value: "local", next: "access_local" },
      { label: "No estoy seguro/a", value: "unsure", next: "access_local" },
    ],
  },
  access_ms: {
    id: "access_ms",
    question: "",
    options: [
      { label: "Voy a intentarlo", value: "done", next: "end", action: "Para restablecer contraseña Microsoft: 1) En la pantalla de login, haz clic en 'Olvidé mi contraseña'. 2) Recibirás un código en tu correo o teléfono alternativo. 3) Ingresa el código y crea una nueva contraseña. Si no tienes acceso al correo alternativo, necesitas ayuda de un administrador." },
    ],
  },
  access_local: {
    id: "access_local",
    question: "¿Hay otro usuario con permisos de administrador en este equipo?",
    options: [
      { label: "Sí, hay otro usuario administrador", value: "yes_admin", next: "access_admin", action: "Inicia sesión con esa cuenta y restablece la contraseña desde Panel de Control > Cuentas de usuario." },
      { label: "No, solo está mi cuenta", value: "no_admin", next: "needs_ticket", action: "Sin otro administrador, se necesita un técnico para restablecer la contraseña usando herramientas de recuperación." },
    ],
  },
  access_admin: {
    id: "access_admin",
    question: "",
    options: [
      { label: "Entendido", value: "done", next: "end", action: "Con la cuenta de administrador: 1) Abre CMD como administrador. 2) Escribe: net user [nombre_usuario] [nueva_contraseña]. 3) La contraseña se cambiará. Usa una contraseña segura (mínimo 8 caracteres, mayúsculas, números y símbolos)." },
    ],
  },
  access_denied: {
    id: "access_denied",
    question: "",
    options: [
      { label: "Voy a intentar recuperar el acceso", value: "done", next: "end", action: "Para recuperar acceso a carpetas: 1) Click derecho > Propiedades > Seguridad > Opciones avanzadas. 2) Cambia el propietario a tu usuario. 3) Agrega tu usuario con Control Total. 4) Marca 'Reemplazar permisos de objetos secundarios'. Si es carpeta de red, contacta al administrador de sistemas." },
    ],
  },
  access_locked: {
    id: "access_locked",
    question: "",
    options: [
      { label: "Voy a seguir los pasos", value: "done", next: "end", action: "Cuenta bloqueada: 1) Espera 30 minutos e intenta de nuevo (algunos sistemas desbloquean automáticamente). 2) Si usas cuenta Microsoft, restablece la contraseña. 3) En entornos corporativos, el administrador de sistemas debe desbloquear la cuenta desde el panel de control." },
    ],
  },

  // === BSOD ===
  bsod_check: {
    id: "bsod_check",
    question: "¿Puedes iniciar Windows en Modo Seguro? (Reinicia y presiona F8 repetidamente durante el arranque)",
    options: [
      { label: "Sí, Modo Seguro funciona", value: "safe_works", next: "bsod_driver", action: "Si funciona en Modo Seguro, el problema es un driver o programa. Desinstala lo último que instalaste." },
      { label: "No, Modo Seguro también falla", value: "safe_fails", next: "needs_ticket", action: "Si Modo Seguro también falla, el problema es más grave: archivos de sistema corruptos o hardware defectuoso (RAM, disco)." },
    ],
  },
  bsod_driver: {
    id: "bsod_driver",
    question: "",
    options: [
      { label: "Voy a seguir los pasos en Modo Seguro", value: "done", next: "end", action: "En Modo Seguro: 1) Desinstala el último programa o driver que instalaste. 2) Ejecuta CMD como admin: 'DISM /Online /Cleanup-Image /RestoreHealth'. 3) Ejecuta 'sfc /scannow'. 4) Busca 'Restaurar sistema' y vuelve a un punto anterior al problema. 5) Si el error persiste, anota el código de error exacto de la pantalla azul." },
    ],
  },

  // === SOFTWARE ===
  software_check: {
    id: "software_check",
    question: "¿El problema es con Microsoft Office (Word, Excel, etc.) o con otro programa?",
    options: [
      { label: "Microsoft Office", value: "office", next: "sw_office" },
      { label: "Navegador (Chrome, Edge)", value: "browser", next: "sw_browser" },
      { label: "Otro programa", value: "other", next: "sw_other" },
    ],
  },
  sw_office: {
    id: "sw_office",
    question: "",
    options: [
      { label: "Voy a reparar Office", value: "done", next: "end", action: "Para reparar Office: 1) Panel de Control > Programas > Microsoft 365 > Cambiar > Reparación rápida. 2) Si no funciona, Reparación en línea. 3) Abre la app en Modo Seguro: Win+R > 'winword /safe'. Si funciona, desactiva complementos en Archivo > Opciones > Complementos." },
    ],
  },
  sw_browser: {
    id: "sw_browser",
    question: "",
    options: [
      { label: "Voy a limpiar el navegador", value: "done", next: "end", action: "Para reparar el navegador: 1) Limpia caché y cookies (Ctrl+Shift+Supr). 2) Desactiva todas las extensiones. 3) Restablece la configuración del navegador. 4) Si el problema persiste, desinstala y reinstala el navegador. 5) Ejecuta un escaneo de malware." },
    ],
  },
  sw_other: {
    id: "sw_other",
    question: "",
    options: [
      { label: "Voy a reinstalar el programa", value: "done", next: "end", action: "Para otros programas: 1) Desinstala el programa desde Panel de Control. 2) Reinicia el equipo. 3) Descarga la última versión desde la página oficial. 4) Instala como administrador (clic derecho > Ejecutar como administrador). 5) Si sigue fallando, verifica compatibilidad con tu versión de Windows." },
    ],
  },

  // === RUIDO / CALOR ===
  noise_check: {
    id: "noise_check",
    question: "¿El ruido es más como un 'click-click' repetitivo (disco duro) o un zumbido constante (ventilador)?",
    options: [
      { label: "Click-click repetitivo", value: "click", next: "noise_hdd", action: "¡RESPALDA TUS DATOS AHORA! El disco duro está fallando y puede morir en cualquier momento." },
      { label: "Zumbido o chirrido constante", value: "whine", next: "noise_fan", action: "Ventilador con rodamiento dañado o sucio." },
    ],
  },
  noise_hdd: {
    id: "noise_hdd",
    question: "",
    options: [
      { label: "Voy a respaldar mis datos urgentemente", value: "done", next: "end", action: "¡ALERTA! El 'click of death' indica falla mecánica inminente del disco duro: 1) Respalda tus archivos importantes AHORA MISMO a un disco externo o nube. 2) No apagues el equipo hasta terminar el respaldo. 3) Compra un SSD de reemplazo (más rápido y confiable). 4) Un técnico puede clonar tu disco actual al nuevo si aún funciona." },
    ],
  },
  noise_fan: {
    id: "noise_fan",
    question: "",
    options: [
      { label: "Voy a limpiar los ventiladores", value: "done", next: "end", action: "Ventilador ruidoso: 1) Apaga el equipo. 2) Usa aire comprimido para limpiar las rejillas y ventiladores (no uses aspiradora). 3) Si el ruido persiste, el ventilador necesita reemplazo. 4) Monitorea temperaturas con HWMonitor para verificar que no haya sobrecalentamiento." },
    ],
  },

  // === IMPRESORA ===
  printer_check: {
    id: "printer_check",
    question: "¿La impresora enciende y muestra alguna luz de error?",
    options: [
      { label: "Enciende pero no imprime", value: "no_print", next: "printer_queue" },
      { label: "No enciende", value: "dead_printer", next: "needs_ticket", action: "Impresora sin energía: verifica el cable de corriente y el tomacorriente. Si no enciende, la fuente interna está dañada." },
      { label: "Tiene luz de error parpadeante", value: "error_led", next: "printer_error" },
    ],
  },
  printer_queue: {
    id: "printer_queue",
    question: "",
    options: [
      { label: "Voy a seguir los pasos", value: "done", next: "end", action: "Para destrabar la impresión: 1) Apaga la impresora. 2) En Windows, abre services.msc, busca 'Cola de impresión', click derecho > Detener. 3) Ve a C:\\Windows\\System32\\spool\\PRINTERS y borra todos los archivos. 4) Reinicia el servicio 'Cola de impresión'. 5) Enciende la impresora. 6) Si no funciona, reinstala el driver." },
    ],
  },
  printer_error: {
    id: "printer_error",
    question: "",
    options: [
      { label: "Voy a revisar la impresora", value: "done", next: "end", action: "Luz de error: 1) Verifica si hay papel atascado (revisa todos los compartimientos). 2) Revisa niveles de tinta/tóner. 3) Abre y cierra todas las tapas firmemente. 4) Reinicia la impresora. 5) Si el error persiste, busca el código de error específico en el manual de la impresora." },
    ],
  },

  // === TERMINALES ===
  mobile_redirect: {
    id: "mobile_redirect",
    question: "",
    options: [
      { label: "Entendido", value: "done", next: "end", action: "Para problemas con teléfonos o tablets, te recomiendo contactar al soporte del fabricante (Apple, Samsung, etc.). FlixSupport se especializa en equipos de cómputo (PC, laptop, impresoras) y redes. Si tu problema está relacionado con correo, WiFi o cuentas, puedo ayudarte igualmente." },
    ],
  },
  needs_ticket: {
    id: "needs_ticket",
    question: "Basado en el diagnóstico, este problema requiere la intervención de un técnico especializado. ¿Quieres que genere un ticket de soporte?",
    options: [
      { label: "Sí, crear ticket de soporte", value: "create_ticket", next: "end" },
      { label: "No, lo intentaré por mi cuenta primero", value: "no_ticket", next: "end", action: "Entendido. Si cambias de opinión o el problema persiste, puedes crear un ticket en cualquier momento. Te recomiendo anotar los síntomas específicos para cuando contactes a soporte." },
    ],
  },
  end: {
    id: "end",
    question: "",
    options: [],
  },
};

export function startDiagnostic(symptom: string): DiagnosticState {
  // Analizar el síntoma para saltar directamente a la sección relevante
  const lower = symptom.toLowerCase();
  let firstNode = "start";

  if (lower.includes("enciende") || lower.includes("prende") || lower.includes("video") || lower.includes("pantalla negra")) {
    firstNode = "power_check";
  } else if (lower.includes("lento") || lower.includes("lentitud") || lower.includes("congela")) {
    firstNode = "slow_check";
  } else if (lower.includes("internet") || lower.includes("wifi") || lower.includes("red")) {
    firstNode = "internet_check";
  } else if (lower.includes("contraseña") || lower.includes("entrar") || lower.includes("acceso") || lower.includes("cuenta")) {
    firstNode = "access_check";
  } else if (lower.includes("pantalla azul") || lower.includes("bsod") || lower.includes("error critico")) {
    firstNode = "bsod_check";
  } else if (lower.includes("programa") || lower.includes("office") || lower.includes("word") || lower.includes("excel")) {
    firstNode = "software_check";
  } else if (lower.includes("ruido") || lower.includes("calienta") || lower.includes("temperatura")) {
    firstNode = "noise_check";
  } else if (lower.includes("impresora")) {
    firstNode = "printer_check";
  }

  const node = DIAGNOSTIC_TREE[firstNode];
  return {
    step: 1,
    symptom,
    category: null,
    responses: {},
    resolved: false,
    nextQuestion: node?.question || DIAGNOSTIC_TREE.start.question,
    suggestedActions: [],
    conclusion: null,
  };
}

export function progressDiagnostic(state: DiagnosticState, nodeId: string, response: string): DiagnosticState {
  const currentNode = DIAGNOSTIC_TREE[nodeId];
  if (!currentNode) {
    return { ...state, resolved: true, nextQuestion: null, conclusion: "Diagnóstico completado. Si el problema persiste, crea un ticket de soporte." };
  }

  const selectedOption = currentNode.options.find(o => o.value === response);
  if (!selectedOption) {
    return { ...state, resolved: false, nextQuestion: currentNode.question };
  }

  const newResponses = { ...state.responses, [nodeId]: selectedOption.value };
  const action = selectedOption.action || "";
  const actions = action ? [action] : [];

  // Check if reached end
  if (selectedOption.next === "end") {
    if (selectedOption.value === "create_ticket") {
      return {
        ...state,
        step: state.step + 1,
        responses: newResponses,
        resolved: false,
        nextQuestion: null,
        suggestedActions: [...state.suggestedActions, ...actions],
        conclusion: "Derivando a creación de ticket...",
      };
    }
    return {
      ...state,
      step: state.step + 1,
      responses: newResponses,
      resolved: true,
      nextQuestion: null,
      suggestedActions: [...state.suggestedActions, ...actions],
      conclusion: "Diagnóstico completado.",
    };
  }

  const nextNode = DIAGNOSTIC_TREE[selectedOption.next];
  return {
    ...state,
    step: state.step + 1,
    responses: newResponses,
    resolved: false,
    nextQuestion: nextNode?.question || null,
    suggestedActions: [...state.suggestedActions, ...actions],
    conclusion: null,
  };
}

export function getDiagnosticQuestion(nodeId: string): string | null {
  return DIAGNOSTIC_TREE[nodeId]?.question || null;
}

export function getDiagnosticOptions(nodeId: string): Array<{ label: string; value: string }> {
  return DIAGNOSTIC_TREE[nodeId]?.options.map(o => ({ label: o.label, value: o.value })) || [];
}
