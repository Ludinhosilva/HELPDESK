export const ROLE_COLORS: Record<string, {
  primary: string;
  hex: string;
  bg: string;
  bgHover: string;
  text: string;
  textStrong: string;
  border: string;
  borderLeft: string;
  ring: string;
  gradient: string;
  gradientLight: string;
  avatar: string;
  sidebarIcon: string;
  headerBg: string;
  cardBorder: string;
  badge: string;
  kanbanBorder: string;
  shimmer: string;
}> = {
  SUPER_ADMIN: {
    primary: "purple",
    hex: "#a855f7",
    bg: "bg-purple-500/10",
    bgHover: "hover:bg-purple-500/15",
    text: "text-purple-400",
    textStrong: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
    borderLeft: "border-l-purple-500",
    ring: "ring-purple-500/20",
    gradient: "from-purple-950 to-purple-900",
    gradientLight: "from-purple-500 to-purple-400",
    avatar: "bg-purple-500/10 text-purple-600",
    sidebarIcon: "text-purple-500",
    headerBg: "bg-purple-950/50",
    cardBorder: "border-purple-500/20 hover:border-purple-500/40",
    badge: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30",
    kanbanBorder: "border-t-purple-500",
    shimmer: "from-purple-500/5 via-purple-500/10",
  },
  ADMIN: {
    primary: "blue",
    hex: "#3b82f6",
    bg: "bg-blue-500/10",
    bgHover: "hover:bg-blue-500/15",
    text: "text-blue-400",
    textStrong: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    borderLeft: "border-l-blue-500",
    ring: "ring-blue-500/20",
    gradient: "from-blue-950 to-blue-900",
    gradientLight: "from-blue-500 to-blue-400",
    avatar: "bg-blue-500/10 text-blue-600",
    sidebarIcon: "text-blue-500",
    headerBg: "bg-blue-950/50",
    cardBorder: "border-blue-500/20 hover:border-blue-500/40",
    badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
    kanbanBorder: "border-t-blue-500",
    shimmer: "from-blue-500/5 via-blue-500/10",
  },
  TECHNICIAN: {
    primary: "green",
    hex: "#22c55e",
    bg: "bg-green-500/10",
    bgHover: "hover:bg-green-500/15",
    text: "text-green-400",
    textStrong: "text-green-600 dark:text-green-400",
    border: "border-green-500/20",
    borderLeft: "border-l-green-500",
    ring: "ring-green-500/20",
    gradient: "from-green-950 to-green-900",
    gradientLight: "from-green-500 to-green-400",
    avatar: "bg-green-500/10 text-green-600",
    sidebarIcon: "text-green-500",
    headerBg: "bg-green-950/50",
    cardBorder: "border-green-500/20 hover:border-green-500/40",
    badge: "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
    kanbanBorder: "border-t-green-500",
    shimmer: "from-green-500/5 via-green-500/10",
  },
  END_USER: {
    primary: "slate",
    hex: "#64748b",
    bg: "bg-slate-500/10",
    bgHover: "hover:bg-slate-500/15",
    text: "text-slate-400",
    textStrong: "text-slate-600 dark:text-slate-400",
    border: "border-slate-500/20",
    borderLeft: "border-l-slate-500",
    ring: "ring-slate-500/20",
    gradient: "from-slate-950 to-slate-900",
    gradientLight: "from-slate-500 to-slate-400",
    avatar: "bg-slate-500/10 text-slate-600",
    sidebarIcon: "text-slate-500",
    headerBg: "bg-slate-950/50",
    cardBorder: "border-slate-500/20 hover:border-slate-500/40",
    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
    kanbanBorder: "border-t-slate-500",
    shimmer: "from-slate-500/5 via-slate-500/10",
  },
};

export function getRoleTheme(role: string) {
  return ROLE_COLORS[role] || ROLE_COLORS.END_USER;
}

export const STATUS_COLORS: Record<string, { badge: string; label: string; icon: string }> = {
  OPEN:        { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Abierto", icon: "text-blue-400" },
  IN_PROGRESS: { badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "En Progreso", icon: "text-yellow-400" },
  DIAGNOSING:  { badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "Diagnosticando", icon: "text-cyan-400" },
  REPAIRING:   { badge: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "Reparando", icon: "text-purple-400" },
  WAITING_PARTS: { badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Esperando Repuestos", icon: "text-orange-400" },
  READY:      { badge: "bg-green-500/10 text-green-400 border-green-500/20", label: "Listo para Entregar", icon: "text-green-400" },
  ON_HOLD:    { badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "En Espera", icon: "text-orange-400" },
  RESOLVED:   { badge: "bg-green-500/10 text-green-400 border-green-500/20", label: "Resuelto", icon: "text-green-400" },
  CLOSED:     { badge: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Cerrado", icon: "text-gray-400" },
};

export function getStatusBadge(status: string) {
  return STATUS_COLORS[status]?.badge || STATUS_COLORS.OPEN.badge;
}

export function getStatusLabel(status: string) {
  return STATUS_COLORS[status]?.label || status;
}

export const PRIORITY_COLORS: Record<string, { badge: string; label: string }> = {
  URGENT: { badge: "bg-red-500/10 text-red-400 border-red-500/20", label: "Urgente" },
  HIGH:   { badge: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Alta" },
  MEDIUM: { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Media" },
  LOW:    { badge: "bg-gray-500/10 text-gray-400 border-gray-500/20", label: "Baja" },
};

export function getPriorityBadge(priority: string) {
  return PRIORITY_COLORS[priority]?.badge || PRIORITY_COLORS.MEDIUM.badge;
}

export function getPriorityLabel(priority: string) {
  return PRIORITY_COLORS[priority]?.label || priority;
}

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  TECHNICIAN: "Técnico",
  END_USER: "Usuario Final",
};

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["DIAGNOSING", "ON_HOLD", "RESOLVED"],
  DIAGNOSING: ["REPAIRING", "ON_HOLD"],
  REPAIRING: ["WAITING_PARTS", "READY", "ON_HOLD"],
  WAITING_PARTS: ["REPAIRING"],
  READY: ["RESOLVED"],
  ON_HOLD: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "OPEN"],
  CLOSED: [],
};
