// Base de conocimiento de reparación de PCs y soporte técnico.
// Cada entrada asocia síntomas → diagnóstico → solución real.
// Usado por el motor de IA para dar respuestas analizadas, no predeterminadas.

export interface KnowledgeEntry {
  id: string;
  symptoms: string[];         // Palabras/frases clave que el usuario menciona
  category: string;           // "hardware" | "software" | "red" | "accesos" | "impresion" | "sistema" | "otros"
  urgency: "low" | "medium" | "high" | "critical";
  diagnosis: string;          // Diagnóstico técnico en español
  steps: string[];            // Pasos de solución numerados
  followUpQuestions: string[];// Preguntas para refinar el diagnóstico
  requiresTicket: boolean;    // Si el problema requiere intervención técnica obligatoria
  estimatedTime: string;      // Tiempo estimado de resolución
  relatedTerms: string[];     // Términos relacionados que el usuario podría mencionar
}

export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ========== HARDWARE - ENCENDIDO Y PODER ==========
  {
    id: "hw-no-enciende",
    symptoms: ["no enciende", "no prende", "no da video", "pantalla negra", "no arranca", "no da señal", "no reacciona", "muerta", "no responde boton", "led apagado"],
    category: "hardware",
    urgency: "high",
    diagnosis: "Posible falla en la fuente de poder, placa madre o cable de alimentación. Si el LED del cargador no enciende, el problema está en la fuente externa o el conector DC. Si los ventiladores giran pero no hay video, puede ser RAM, placa madre o pantalla.",
    steps: [
      "Verifique que el cable de corriente esté bien conectado en ambos extremos",
      "Pruebe con otro tomacorriente que sepa que funciona",
      "En laptop: retire la batería (si es removible), conecte solo el cargador y pruebe",
      "Revise si el LED del cargador enciende al conectarlo. Si no enciende, el cargador puede estar dañado",
      "Mantenga presionado el botón de encendido por 15-20 segundos para descargar electricidad estática",
      "Si es desktop: verifique que el switch de la fuente esté en 'ON' (I)",
      "Conecte un monitor externo para descartar falla de pantalla en laptop",
      "Retire y vuelva a insertar los módulos de RAM (pruebe uno por uno en diferentes slots)"
    ],
    followUpQuestions: ["¿El LED del cargador enciende al conectarlo?", "¿Los ventiladores giran aunque no haya video?", "¿La batería es removible?", "¿Escucha algún pitido al encender?"],
    requiresTicket: true,
    estimatedTime: "2-4 horas (diagnóstico de hardware)",
    relatedTerms: ["enciende", "encender", "arranque", "boot", "post", "bios", "cargador", "fuente"]
  },
  {
    id: "hw-pantalla-negra",
    symptoms: ["pantalla negra", "no se ve nada", "sin imagen", "no muestra nada", "display apagado", "oscuridad", "no hay display", "monitor sin señal"],
    category: "hardware",
    urgency: "high",
    diagnosis: "La pantalla negra puede tener múltiples causas: RAM mal conectada (común después de golpes), falla de backlight (se ve muy tenue con linterna), GPU dañada, cable LVDS suelto en laptop, o monitor externo defectuoso. Si se escuchan pitidos, es código de error POST.",
    steps: [
      "Acerque una linterna a la pantalla en ángulo. Si ve la imagen muy tenue, el backlight está dañado",
      "Conecte un monitor externo (HDMI/VGA). Si funciona, el problema es la pantalla del equipo",
      "En laptop: abra y cierre la tapa lentamente. Si parpadea, el cable flex está dañado",
      "Retire la RAM, limpie los contactos con una goma de borrar suave y vuelva a insertar",
      "Si es desktop: pruebe con otro cable de video (HDMI, DisplayPort, VGA) y otro monitor",
      "Escuche los pitidos al encender: 1 pitido = normal, pitidos repetidos = error de RAM/GPU"
    ],
    followUpQuestions: ["¿Conectó un monitor externo? ¿Funciona?", "¿Se escuchan pitidos al encender?", "¿La pantalla está completamente negra o se ve algo muy tenue con luz?", "¿Ocurrió después de un golpe o caída?"],
    requiresTicket: true,
    estimatedTime: "1-3 horas",
    relatedTerms: ["pantalla", "monitor", "imagen", "video", "display", "backlight", "negro"]
  },
  {
    id: "hw-sobrecalentamiento",
    symptoms: ["se calienta", "caliente", "sobrecalienta", "temperatura alta", "ventilador ruidoso", "ventilador siempre prendido", "se apaga solo", "se reinicia por calor", "muy caliente", "quema"],
    category: "hardware",
    urgency: "medium",
    diagnosis: "El sobrecalentamiento es causado por acumulación de polvo en ventiladores y disipadores, pasta térmica seca, o ventiladores defectuosos. En laptops, también puede ser por obstrucción de las rejillas de ventilación al usarla sobre superficies blandas.",
    steps: [
      "Apague el equipo y déjelo enfriar 15 minutos antes de continuar",
      "Limpie las rejillas de ventilación con aire comprimido (no use aspiradora, genera estática)",
      "No use la laptop sobre cama, almohada o superficies blandas que bloquean la ventilación",
      "Verifique en el Administrador de Tareas que no haya procesos consumiendo 100% de CPU",
      "Si el ventilador hace ruido excesivo o no gira, necesita reemplazo",
      "Si el problema persiste después de limpiar, se requiere cambio de pasta térmica (servicio técnico)"
    ],
    followUpQuestions: ["¿Hace cuánto no se limpia el equipo?", "¿El ventilador gira fuerte constantemente o no gira?", "¿Se apaga de repente sin aviso?", "¿La usa sobre una superficie plana y dura?"],
    requiresTicket: false,
    estimatedTime: "30 minutos - 1 hora",
    relatedTerms: ["calor", "temperatura", "enfriamiento", "cooler", "ventilador", "disipador", "pasta termica"]
  },

  // ========== HARDWARE - ALMACENAMIENTO ==========
  {
    id: "hw-disco-lento",
    symptoms: ["lento", "muy lento", "demora", "tarda mucho", "lentitud", "va lento", "arranque lento", "carga lento", "programas lentos", "se cuelga"],
    category: "hardware",
    urgency: "medium",
    diagnosis: "La lentitud extrema suele deberse a un disco duro mecánico (HDD) con sectores dañados, fragmentación severa, poco espacio libre, o malware. Si el equipo tiene HDD, considerar upgrade a SSD. También verificar RAM insuficiente o procesos en segundo plano.",
    steps: [
      "Abra el Administrador de Tareas (Ctrl+Shift+Esc) y revise el uso de disco. Si está al 100% constante, el disco puede estar fallando",
      "Libere espacio: elimine archivos temporales con 'Liberador de espacio en disco' de Windows",
      "Desfragmente el disco si es HDD (NO desfragmentar SSD)",
      "Desactive programas de inicio innecesarios en Admin. de Tareas > Pestaña Inicio",
      "Ejecute 'chkdsk /f' en CMD como administrador para verificar sectores dañados",
      "Considere cambiar a un SSD: reduce el tiempo de arranque de 3 minutos a 30 segundos",
      "Escaneo de malware con Windows Defender (completo)"
    ],
    followUpQuestions: ["¿Tiene disco HDD o SSD?", "¿Cuánto espacio libre tiene en C:?", "¿El 100% de uso de disco es constante?", "¿Cuánta RAM tiene instalada?"],
    requiresTicket: false,
    estimatedTime: "1-2 horas (optimización) o requiere SSD nuevo",
    relatedTerms: ["disco", "hd", "ssd", "lentitud", "rendimiento", "rapido", "velocidad", "disco duro"]
  },

  // ========== SOFTWARE - WINDOWS Y SISTEMA ==========
  {
    id: "sw-windows-lento",
    symptoms: ["windows lento", "sistema lento", "inicio lento", "tarda en abrir", "explorador lento", "windows no responde", "congela", "se traba"],
    category: "software",
    urgency: "medium",
    diagnosis: "El sistema operativo se vuelve lento por acumulación de programas innecesarios, archivos temporales, servicios en segundo plano, falta de actualizaciones, o infección de malware. El registro de Windows también puede estar corrupto.",
    steps: [
      "Reinicie el equipo. Muchos problemas se resuelven con un reinicio limpio",
      "Abra Configuración > Aplicaciones > Inicio y desactive programas innecesarios",
      "Ejecute un análisis completo con Windows Defender o Malwarebytes",
      "Presione Win+R, escriba 'temp' y elimine todos los archivos. Repita con '%temp%' y 'prefetch'",
      "Verifique Windows Update: instale todas las actualizaciones pendientes",
      "Ejecute CMD como administrador y escriba: sfc /scannow (repara archivos del sistema)",
      "Si todo falla, considere un formateo limpio de Windows como última opción"
    ],
    followUpQuestions: ["¿Cuántos programas se abren al iniciar Windows?", "¿Hace cuánto no se formatea o reinstala Windows?", "¿Ha notado ventanas emergentes extrañas?", "¿El antivirus está actualizado?"],
    requiresTicket: false,
    estimatedTime: "1-2 horas",
    relatedTerms: ["windows", "sistema", "operativo", "arranque", "booteo", "inicio", "sesion"]
  },
  {
    id: "sw-pantalla-azul",
    symptoms: ["pantalla azul", "bsod", "error critico", "reinicio inesperado", "error de windows", "pantallazo azul", "se reinicia solo", "error fatal"],
    category: "software",
    urgency: "high",
    diagnosis: "La pantalla azul (BSOD) indica un error crítico del sistema. Puede ser por driver defectuoso (común después de actualizar), RAM defectuosa, disco con sectores dañados, o conflicto de software. El código de error en la pantalla azul es clave para el diagnóstico.",
    steps: [
      "Anote el código de error que aparece en la pantalla azul (ej: IRQL_NOT_LESS_OR_EQUAL, MEMORY_MANAGEMENT)",
      "Reinicie en Modo Seguro: presione F8 o Shift+F8 durante el arranque",
      "En Modo Seguro, desinstale el último programa o driver instalado antes del problema",
      "Ejecute CMD como administrador: 'DISM /Online /Cleanup-Image /RestoreHealth'",
      "Verifique la RAM: use la herramienta 'Diagnóstico de memoria de Windows' (buscar en inicio)",
      "Si el error persiste, respalde sus datos y reinstale Windows"
    ],
    followUpQuestions: ["¿Qué código de error muestra la pantalla azul?", "¿Instaló algún programa o driver recientemente?", "¿Ocurre siempre al abrir un programa específico?", "¿Ha probado iniciar en Modo Seguro?"],
    requiresTicket: false,
    estimatedTime: "30 minutos - 2 horas",
    relatedTerms: ["bsod", "pantallazo", "error", "reinicio", "critico", "muerte", "azul"]
  },

  // ========== RED E INTERNET ==========
  {
    id: "net-sin-internet",
    symptoms: ["no hay internet", "sin internet", "no tengo internet", "wifi no funciona", "no carga paginas", "internet caido", "sin conexion", "desconectado", "no navega"],
    category: "red",
    urgency: "high",
    diagnosis: "La pérdida de internet puede ser por: router/módem desconfigurado, cable Ethernet suelto, ISP con caída de servicio, DNS mal configurado, adaptador de red deshabilitado, o contraseña WiFi cambiada. Verificar desde lo más simple a lo más complejo.",
    steps: [
      "Verifique si otros dispositivos en la misma red tienen internet. Si ninguno tiene, el problema es el router o el ISP",
      "Reinicie el router/módem: desconéctelo de la corriente 30 segundos y vuelva a conectar",
      "En Windows: abra Configuración > Red e Internet > Solucionador de problemas de red",
      "Abra CMD y escriba: ipconfig /release, luego ipconfig /renew, luego ipconfig /flushdns",
      "Verifique que el cable Ethernet esté bien conectado (luces verdes/ámbar en el puerto)",
      "Olvide la red WiFi y vuelva a conectarse ingresando la contraseña",
      "Cambie los DNS a 8.8.8.8 y 8.8.4.4 (Google) en las propiedades del adaptador"
    ],
    followUpQuestions: ["¿Otros dispositivos en la misma red tienen internet?", "¿Está conectado por WiFi o cable Ethernet?", "¿El router tiene las luces normales encendidas?", "¿Aparece un triángulo amarillo en el icono de red?"],
    requiresTicket: false,
    estimatedTime: "15-45 minutos",
    relatedTerms: ["internet", "wifi", "red", "conexion", "router", "modem", "navegar", "datos", "inalambrico"]
  },
  {
    id: "net-internet-lento",
    symptoms: ["internet lento", "wifi lento", "paginas cargan lento", "descarga lenta", "mucho lag", "video se traba", "buffering", "velocidad baja"],
    category: "red",
    urgency: "medium",
    diagnosis: "Internet lento puede deberse a: saturación de ancho de banda (otros dispositivos descargando/streaming), interferencia WiFi (muchas redes en el mismo canal), distancia al router, ISP con throttling, o malware consumiendo red en segundo plano.",
    steps: [
      "Haga un test de velocidad en speedtest.net y compare con el plan contratado",
      "Revise el Administrador de Tareas > Rendimiento > Ethernet/WiFi para ver qué consume red",
      "Si usa WiFi: acérquese al router. La señal se degrada con distancia y paredes",
      "Cambie el canal WiFi del router (1, 6 u 11 para 2.4GHz). Use WiFi Analyzer para ver canales congestionados",
      "Desconecte otros dispositivos que puedan estar consumiendo ancho de banda (Netflix, descargas)",
      "Reinicie el router y módem. Si el problema es constante, contacte a su ISP"
    ],
    followUpQuestions: ["¿Qué velocidad de internet tiene contratada?", "¿Está lejos del router?", "¿Cuántos dispositivos hay conectados?", "¿El problema es a todas horas o solo en ciertos momentos?"],
    requiresTicket: false,
    estimatedTime: "15-30 minutos",
    relatedTerms: ["lento", "velocidad", "ancho de banda", "mbps", "ping", "latencia", "lag"]
  },

  // ========== ACCESOS Y CUENTAS ==========
  {
    id: "acc-olvido-contraseña",
    symptoms: ["olvide contraseña", "no recuerdo contraseña", "contraseña incorrecta", "no puedo entrar", "clave equivocada", "password perdido", "no me deja ingresar", "cuenta bloqueada"],
    category: "accesos",
    urgency: "low",
    diagnosis: "El olvido de contraseña es el incidente más común. Windows permite restablecerla si hay una cuenta Microsoft vinculada o un disco de restablecimiento. En sistemas corporativos, el administrador de TI puede restablecerla desde el Active Directory.",
    steps: [
      "En la pantalla de login, haga clic en 'Olvidé mi contraseña' u 'Restablecer contraseña'",
      "Si usa cuenta Microsoft: recibirá un código de verificación en su correo o teléfono alternativo",
      "Si es cuenta local y no tiene disco de restablecimiento, necesita un administrador para cambiarla",
      "El administrador puede ejecutar CMD como admin: net user [usuario] [nueva_contraseña]",
      "Para Windows con cuenta Microsoft vinculada, puede restablecer desde account.microsoft.com",
      "Nunca comparta su contraseña. Use un gestor de contraseñas para evitar olvidos futuros"
    ],
    followUpQuestions: ["¿Es cuenta local de Windows o cuenta Microsoft?", "¿Tiene acceso a su correo de recuperación?", "¿Hay otro usuario administrador en el equipo?"],
    requiresTicket: false,
    estimatedTime: "10-20 minutos",
    relatedTerms: ["contraseña", "password", "clave", "ingresar", "acceso", "login", "bloqueado", "recuperar"]
  },
  {
    id: "acc-acceso-denegado",
    symptoms: ["acceso denegado", "no tengo permiso", "no puedo abrir carpeta", "permiso denegado", "archivo bloqueado", "carpeta restringida", "no autorizado"],
    category: "accesos",
    urgency: "medium",
    diagnosis: "El acceso denegado a archivos o carpetas ocurre por permisos NTFS incorrectos, herencia de permisos rota, o porque la carpeta pertenece a otro usuario. También puede ser por políticas de grupo en entornos corporativos o antivirus bloqueando el acceso.",
    steps: [
      "Haga clic derecho en la carpeta > Propiedades > Seguridad > Opciones avanzadas",
      "Verifique quién es el propietario. Si no es usted, cambie el propietario a su usuario",
      "En 'Opciones avanzadas', haga clic en 'Cambiar permisos' y agregue su usuario con Control Total",
      "Marque 'Reemplazar todas las entradas de permisos de objetos secundarios' para aplicar a subcarpetas",
      "Si es carpeta de red, verifique que el recurso compartido tenga los permisos correctos",
      "Desactive temporalmente el antivirus para descartar que esté bloqueando el acceso"
    ],
    followUpQuestions: ["¿El problema es con una carpeta local o de red?", "¿Qué mensaje de error exacto aparece?", "¿Es usted el administrador del equipo?", "¿La carpeta estaba en otro equipo antes?"],
    requiresTicket: false,
    estimatedTime: "15-30 minutos",
    relatedTerms: ["permiso", "denegado", "carpeta", "archivo", "administrador", "propietario", "ntfs"]
  },

  // ========== IMPRESIÓN ==========
  {
    id: "imp-no-imprime",
    symptoms: ["no imprime", "impresora no funciona", "no responde impresora", "error de impresion", "trabajos atascados", "cola de impresion", "no detecta impresora"],
    category: "hardware",
    urgency: "medium",
    diagnosis: "Problemas de impresión: cola de impresión atascada (más común), driver corrupto, impresora sin papel/tinta/tóner, cable USB defectuoso, impresora en modo offline, o servicio de cola de impresión detenido en Windows.",
    steps: [
      "Verifique que la impresora esté encendida, con papel y tinta/tóner suficiente",
      "Cancele todos los trabajos en la cola de impresión. Reinicie el servicio: services.msc > 'Cola de impresión' > Reiniciar",
      "Apague la impresora 30 segundos y vuelva a encenderla",
      "En Windows: Configuración > Bluetooth y dispositivos > Impresoras > seleccione la impresora > 'Quitar dispositivo'. Luego vuelva a agregarla",
      "Descargue e instale el driver más reciente desde la página del fabricante (HP, Epson, Canon, Brother)",
      "Si es impresora de red: verifique que tenga IP fija y que sea accesible (haga ping a la IP)"
    ],
    followUpQuestions: ["¿Aparece algún mensaje de error en la pantalla de la impresora?", "¿Tiene papel y tinta/tóner?", "¿La impresora está por USB o por red?", "¿Otros usuarios pueden imprimir a la misma impresora?"],
    requiresTicket: false,
    estimatedTime: "15-45 minutos",
    relatedTerms: ["impresora", "imprimir", "papel", "tinta", "toner", "driver", "usb", "impresion"]
  },

  // ========== SOFTWARE - OFFICE Y APLICACIONES ==========
  {
    id: "sw-error-office",
    symptoms: ["error en office", "word no abre", "excel se cierra", "error al abrir documento", "office no funciona", "no puedo editar", "powerpoint error", "outlook no abre"],
    category: "software",
    urgency: "medium",
    diagnosis: "Los errores de Office suelen deberse a: activación vencida, complementos problemáticos, perfil de Office corrupto, archivo de documento dañado, o conflicto con otra aplicación. La reparación en línea de Office resuelve el 80% de los casos.",
    steps: [
      "Cierre todas las aplicaciones de Office",
      "Vaya a Panel de Control > Programas > Microsoft 365/Office > clic derecho > Cambiar > Reparación rápida",
      "Si no funciona: Repita con 'Reparación en línea' (requiere internet)",
      "Abra la aplicación en Modo Seguro: Win+R > escriba 'winword /safe' (para Word) o 'excel /safe' (para Excel)",
      "Si funciona en Modo Seguro, desactive complementos: Archivo > Opciones > Complementos > Complementos COM > Ir > Desactivar todos",
      "Verifique que la suscripción o licencia esté activa en Cuenta > Información del producto"
    ],
    followUpQuestions: ["¿Qué versión de Office tiene? (2016, 2019, 365)", "¿Qué aplicación específica falla?", "¿El error ocurre con todos los documentos o solo uno específico?", "¿Office está activado correctamente?"],
    requiresTicket: false,
    estimatedTime: "20-45 minutos",
    relatedTerms: ["office", "word", "excel", "powerpoint", "outlook", "documento", "microsoft"]
  },

  // ========== VIRUS Y MALWARE ==========
  {
    id: "sw-virus",
    symptoms: ["virus", "malware", "anuncios emergentes", "popup", "navegador raro", "página de inicio cambiada", "extensiones raras", "secuestro de navegador", "mucho spam", "ventanas extrañas"],
    category: "software",
    urgency: "high",
    diagnosis: "Infección por malware/adware. Los síntomas incluyen: cambios no deseados en el navegador, ventanas emergentes constantes, redirecciones a sitios extraños, lentitud extrema, y programas desconocidos instalados. Puede haber robo de información si es un troyano.",
    steps: [
      "Desconecte el equipo de internet inmediatamente para evitar filtración de datos",
      "Reinicie en Modo Seguro con funciones de red",
      "Ejecute un análisis completo con Windows Defender (o Malwarebytes si está instalado)",
      "Revise Programas y Características: desinstale cualquier aplicación sospechosa o desconocida",
      "Restablezca el navegador a configuración de fábrica (Chrome: Configuración > Restablecer)",
      "Instale uBlock Origin para bloquear anuncios y ventanas emergentes",
      "Cambie todas las contraseñas importantes desde otro equipo limpio"
    ],
    followUpQuestions: ["¿Notó algo extraño antes de que empezara? (descarga, correo sospechoso)", "¿Las ventanas emergentes mencionan algún producto?", "¿El antivirus estaba activo?", "¿Tiene respaldo de sus archivos importantes?"],
    requiresTicket: false,
    estimatedTime: "1-3 horas",
    relatedTerms: ["virus", "malware", "spyware", "adware", "troyano", "ransomware", "infeccion", "antivirus"]
  },

  // ========== SISTEMA - ACTUALIZACIONES ==========
  {
    id: "sw-actualizacion-error",
    symptoms: ["actualizacion atascada", "windows update error", "no se actualiza", "error al actualizar", "porcentaje atascado", "reinicio constante", "configurando windows", "no termina de actualizar"],
    category: "software",
    urgency: "medium",
    diagnosis: "Las actualizaciones de Windows pueden quedarse atascadas por: espacio insuficiente en disco, conflicto con antivirus, archivos de actualización corruptos, o interrupción durante la descarga. No fuerce el apagado durante una actualización.",
    steps: [
      "NO apague el equipo a la fuerza durante una actualización. Espere al menos 2 horas",
      "Libere espacio en disco (mínimo 20 GB libres en C: para actualizaciones grandes)",
      "Ejecute el Solucionador de problemas de Windows Update (Configuración > Solucionar problemas)",
      "Abra CMD como administrador y ejecute: net stop wuauserv, luego net start wuauserv",
      "Ejecute: DISM /Online /Cleanup-Image /RestoreHealth y luego sfc /scannow",
      "Descargue la actualización manualmente desde el Catálogo de Microsoft Update si el error persiste"
    ],
    followUpQuestions: ["¿En qué porcentaje se quedó atascado?", "¿Cuánto espacio libre tiene en el disco C:?", "¿El equipo se apagó durante una actualización anterior?", "¿Qué versión de Windows tiene?"],
    requiresTicket: false,
    estimatedTime: "30 minutos - 2 horas",
    relatedTerms: ["actualizacion", "update", "windows update", "parche", "version", "build"]
  },

  // ========== CORREO ELECTRÓNICO ==========
  {
    id: "net-error-correo",
    symptoms: ["no recibo correos", "no envio correos", "outlook error", "correo no sincroniza", "smtp error", "error al enviar", "buzon lleno", "correo no llega"],
    category: "accesos",
    urgency: "medium",
    diagnosis: "Problemas de correo electrónico: contraseña incorrecta, configuración SMTP/IMAP errónea, buzón lleno, autenticación de dos factores bloqueando la app, o servidor de correo caído. Outlook es especialmente sensible a cambios de contraseña.",
    steps: [
      "Verifique que puede iniciar sesión en el webmail (outlook.com, gmail.com, etc.)",
      "Si cambió la contraseña recientemente, actualícela en la configuración de la cuenta en Outlook",
      "Verifique la configuración del servidor: IMAP (entrada) y SMTP (salida) deben ser correctos",
      "Revise que el buzón no esté lleno (elimine correos antiguos o vacíe elementos eliminados)",
      "En Outlook: Archivo > Configuración de cuenta > Reparar cuenta",
      "Desactive temporalmente el firewall/antivirus para descartar bloqueo de puertos de correo"
    ],
    followUpQuestions: ["¿Puede acceder al correo desde el navegador web?", "¿Cambió su contraseña recientemente?", "¿Qué cliente de correo usa? (Outlook, Thunderbird, Mail)", "¿El error ocurre al enviar, al recibir, o ambos?"],
    requiresTicket: false,
    estimatedTime: "15-30 minutos",
    relatedTerms: ["correo", "email", "outlook", "smtp", "imap", "exchange", "buzon", "sincronizar"]
  },

  // ========== PROBLEMAS CRÍTICOS (REQUIEREN TICKET) ==========
  {
    id: "hw-pantalla-rota",
    symptoms: ["pantalla rota", "pantalla quebrada", "display roto", "se cayo", "golpe", "pantalla partida", "vidrio roto", "lcd dañado", "pixeles muertos grandes", "fuga de tinta"],
    category: "hardware",
    urgency: "high",
    diagnosis: "Daño físico en la pantalla por golpe o caída. Las grietas, fugas de líquido LCD y manchas negras indican rotura del panel. No tiene solución por software: se requiere reemplazo físico del panel LCD/LED.",
    steps: [
      "Haga un respaldo inmediato de sus datos si aún puede ver algo en la pantalla",
      "Conecte un monitor externo para poder usar el equipo mientras se repara",
      "No presione la pantalla rota: puede empeorar el daño y causar cortocircuitos",
      "Lleve el equipo a un servicio técnico para cotizar el reemplazo del panel",
      "Si el equipo está en garantía, contacte al fabricante (daño físico usualmente no cubre garantía)",
      "Costo estimado de reemplazo: S/ 150 - S/ 500 dependiendo del modelo"
    ],
    followUpQuestions: ["¿Se cayó o recibió un golpe?", "¿Se alcanza a ver algo en la pantalla?", "¿El equipo está en garantía?", "¿Tiene un monitor externo que pueda conectar?"],
    requiresTicket: true,
    estimatedTime: "1-3 días (reemplazo de pantalla)",
    relatedTerms: ["roto", "quebrado", "caida", "golpe", "fisura", "reemplazo", "panel"]
  },
  {
    id: "hw-agua-derrame",
    symptoms: ["se mojo", "agua", "liquido", "derrame", "cafe", "gaseosa", "mojado", "se cayo al agua", "lluvia", "humedad"],
    category: "hardware",
    urgency: "critical",
    diagnosis: "Derrame de líquido sobre el equipo. El agua y otros líquidos causan cortocircuitos inmediatos que pueden dañar permanentemente la placa madre, teclado y otros componentes. La corrosión continúa incluso después de secado superficial.",
    steps: [
      "APAGUE EL EQUIPO INMEDIATAMENTE. Mantenga presionado el botón de encendido 10 segundos",
      "Desconecte el cargador y todos los periféricos",
      "Si es laptop: voltéela boca abajo en forma de V invertida para que el líquido escurra",
      "Retire la batería si es removible",
      "NO intente encenderlo por al menos 48 horas",
      "NO use secador de pelo (el calor puede dañar componentes y el aire empuja el líquido más adentro)",
      "Coloque el equipo en un lugar ventilado o use sílica gel/arroz para absorber humedad",
      "Lleve a servicio técnico para limpieza con alcohol isopropílico y evaluación de daños"
    ],
    followUpQuestions: ["¿Qué líquido se derramó? (agua, café, gaseosa)", "¿Apagó el equipo inmediatamente?", "¿Cuánto líquido fue derramado?", "¿El equipo seguía encendido después del derrame?"],
    requiresTicket: true,
    estimatedTime: "2-5 días (limpieza y diagnóstico)",
    relatedTerms: ["agua", "liquido", "mojado", "derrame", "humedo", "cortocircuito"]
  },
  {
    id: "hw-ruido-extraño",
    symptoms: ["ruido extraño", "click click", "sonido raro", "chirrido", "zumbido", "disco suena mal", "ventilador ruido metalico", "cloqueo", "grinding"],
    category: "hardware",
    urgency: "high",
    diagnosis: "Ruidos anormales: 'click click' repetitivo indica falla inminente del disco duro (click of death). Zumbido o chirrido puede ser ventilador con rodamiento dañado. Ruido eléctrico (buzz) puede ser fuente de poder defectuosa. Cualquier ruido nuevo es señal de falla mecánica.",
    steps: [
      "RESPALDE SUS DATOS INMEDIATAMENTE si escucha click-click del disco duro",
      "Identifique la fuente del ruido: abra el gabinete (desktop) o acerque el oído (laptop)",
      "Si el ruido viene del ventilador: puede necesitar lubricación o reemplazo",
      "Descargue CrystalDiskInfo para verificar la salud SMART del disco duro",
      "Si el disco muestra 'Caution' o 'Bad', reemplácelo urgentemente",
      "No ignore ruidos nuevos: un disco duro puede fallar completamente en horas"
    ],
    followUpQuestions: ["¿El ruido es constante o intermitente?", "¿Es un click-click repetitivo o un zumbido continuo?", "¿El equipo tiene HDD o SSD?", "¿Tiene respaldo de sus datos importantes?"],
    requiresTicket: true,
    estimatedTime: "1-3 horas (diagnóstico + reemplazo si es necesario)",
    relatedTerms: ["ruido", "sonido", "click", "chirrido", "zumbido", "disco", "ventilador"]
  },

  // ========== OTROS PROBLEMAS ==========
  {
    id: "sw-instalar-programa",
    symptoms: ["instalar programa", "no puedo instalar", "error de instalacion", "instalacion fallida", "setup error", "no se instala", "descargar programa", "instalar office"],
    category: "software",
    urgency: "low",
    diagnosis: "Los errores de instalación suelen deberse a: permisos insuficientes (no es administrador), espacio en disco lleno, instalador corrupto (descarga incompleta), conflicto con versión anterior, o antivirus bloqueando la instalación.",
    steps: [
      "Ejecute el instalador como administrador (clic derecho > 'Ejecutar como administrador')",
      "Verifique que haya suficiente espacio en el disco de destino",
      "Descargue nuevamente el instalador desde la página oficial del fabricante",
      "Desactive temporalmente el antivirus durante la instalación",
      "Desinstale versiones anteriores del programa desde Panel de Control",
      "Reinicie el equipo e intente la instalación nuevamente"
    ],
    followUpQuestions: ["¿Qué programa está intentando instalar?", "¿Es administrador del equipo?", "¿Qué mensaje de error aparece?", "¿Había una versión anterior instalada?"],
    requiresTicket: false,
    estimatedTime: "15-30 minutos",
    relatedTerms: ["instalar", "instalacion", "setup", "programa", "aplicacion", "descargar", "software"]
  }
];

// Buscar en la base de conocimiento por síntomas mencionados
export function findKnowledge(text: string): KnowledgeEntry | null {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 2);
  let bestMatch: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const symptom of entry.symptoms) {
      const symptomWords = symptom.toLowerCase().split(/\s+/);
      // Check if ALL words of the symptom appear in the text in order or unordered
      const allWordsMatch = symptomWords.every(sw => lower.includes(sw));
      if (allWordsMatch) {
        score += 3;
      }
      // Bonus for exact phrase match
      if (lower.includes(symptom.toLowerCase())) {
        score += 2;
      }
    }
    for (const term of entry.relatedTerms) {
      const termWords = term.toLowerCase().split(/\s+/);
      if (termWords.every(tw => lower.includes(tw))) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

// Obtener entradas relacionadas por categoría
export function findRelated(category: string, excludeId: string, limit = 3): KnowledgeEntry[] {
  return KNOWLEDGE_BASE
    .filter(e => e.category === category && e.id !== excludeId)
    .slice(0, limit);
}
