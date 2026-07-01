import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/core/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En Progreso",
  ON_HOLD: "En Espera",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  IN_PROGRESS: "bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  ON_HOLD: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  RESOLVED: "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  CLOSED: "bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
};

const statusBarColors: Record<string, string> = {
  OPEN: "bg-blue-500",
  IN_PROGRESS: "bg-yellow-500",
  ON_HOLD: "bg-orange-500",
  RESOLVED: "bg-green-500",
  CLOSED: "bg-gray-400 dark:bg-gray-600",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 dark:bg-gray-800/40 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  MEDIUM: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  HIGH: "bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  URGENT: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
};

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("es-PE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { role: true },
  });
  if (!user) redirect("/login");

  /* ── ADMIN ────────────────────────────── */
  if (user.role === "ADMIN") {
    const [total, open, inProgress, onHold, resolved, closed, recentTickets, statusCounts] =
      await Promise.all([
        prisma.ticket.count({ where: { organizationId: payload.orgId } }),
        prisma.ticket.count({ where: { organizationId: payload.orgId, status: "OPEN" } }),
        prisma.ticket.count({ where: { organizationId: payload.orgId, status: "IN_PROGRESS" } }),
        prisma.ticket.count({ where: { organizationId: payload.orgId, status: "ON_HOLD" } }),
        prisma.ticket.count({ where: { organizationId: payload.orgId, status: "RESOLVED" } }),
        prisma.ticket.count({ where: { organizationId: payload.orgId, status: "CLOSED" } }),
        prisma.ticket.findMany({
          where: { organizationId: payload.orgId },
          include: {
            category: { select: { name: true } },
            createdBy: { select: { name: true } },
            assignedTo: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.ticket.groupBy({
          by: ["status"],
          where: { organizationId: payload.orgId },
          _count: true,
        }),
      ]);

    const stats = [
      { title: "Total Tickets", value: total, icon: Ticket, color: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
      { title: "Abiertos", value: open, icon: AlertCircle, color: "from-blue-500/10 to-cyan-500/5", iconColor: "text-blue-400" },
      { title: "En Progreso", value: inProgress, icon: Clock, color: "from-amber-500/10 to-yellow-500/5", iconColor: "text-amber-400" },
      { title: "En Espera", value: onHold, icon: Activity, color: "from-orange-500/10 to-orange-500/5", iconColor: "text-orange-400" },
      { title: "Resueltos", value: resolved, icon: CheckCircle2, color: "from-green-500/10 to-emerald-500/5", iconColor: "text-green-400" },
      { title: "Cerrados", value: closed, icon: XCircle, color: "from-gray-500/10 to-gray-500/5", iconColor: "text-gray-400" },
    ];

    const resolutionRate = total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Panel Principal</h1>
            <p className="text-gray-400 text-sm mt-0.5">Resumen de tu soporte técnico</p>
          </div>
          <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20">
            <Link href="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Ticket
            </Link>
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((s, i) => (
            <Card
              key={s.title}
              className={`relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-50`} />
              <CardHeader className="relative flex flex-row items-center justify-between pb-2 pt-5 px-5">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.title}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconColor.replace("text-", "bg-").replace("-400", "-500/15")}`}>
                  <s.icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative pb-5 px-5">
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Second row: Stats + Resolution */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <Card className="glass-card lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-base text-white/90 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Distribución por Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusCounts.map((s) => {
                  const pct = total > 0 ? (s._count / total) * 100 : 0;
                  return (
                    <div key={s.status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${statusBarColors[s.status] || "bg-gray-500"}`} />
                          {statusLabels[s.status] || s.status}
                        </span>
                        <span className="text-white font-medium tabular-nums">{s._count}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statusBarColors[s.status] || "bg-primary"} transition-all duration-500`}
                          style={{ width: `${pct}%`, minWidth: pct > 0 ? "4px" : "0" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "150ms" }}>
            <CardHeader>
              <CardTitle className="text-base text-white/90 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                Eficiencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <span className={`text-4xl font-bold tabular-nums ${resolutionRate >= 70 ? "text-green-400" : resolutionRate >= 40 ? "text-amber-400" : "text-red-400"}`}>
                  {resolutionRate}%
                </span>
                <p className="text-xs text-gray-400 mt-1">Tasa de resolución</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Pendientes</span>
                  <span className="text-white font-medium">{open + inProgress + onHold}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Resueltos hoy</span>
                  <span className="text-green-400 font-medium">{resolved}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent tickets */}
        <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms" }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base text-white/90 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-400" />
              Tickets Recientes
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Link href="/tickets">
                Ver Todos <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40">
                    <TableHead className="w-[100px] text-gray-500">Ticket</TableHead>
                    <TableHead className="text-gray-500">Título</TableHead>
                    <TableHead className="text-gray-500">Estado</TableHead>
                    <TableHead className="text-gray-500">Prioridad</TableHead>
                    <TableHead className="hidden sm:table-cell text-gray-500">Categoría</TableHead>
                    <TableHead className="hidden sm:table-cell text-gray-500">Asignado</TableHead>
                    <TableHead className="hidden md:table-cell text-gray-500">Creado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((t) => (
                    <TableRow key={t.id} className="border-border/30 hover:bg-white/5 transition-colors">
                      <TableCell>
                        <Link href={`/tickets/${t.id}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                          TK-{t.ticketNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate text-white/90">{t.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[t.status]}>{statusLabels[t.status] || t.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityColors[t.priority]}>{priorityLabels[t.priority] || t.priority}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-400">{t.category?.name ?? "—"}</TableCell>
                      <TableCell className="hidden sm:table-cell text-gray-400">{t.assignedTo?.name ?? "Sin Asignar"}</TableCell>
                      <TableCell className="hidden md:table-cell text-gray-500 text-sm">{formatDate(t.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                  {recentTickets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Ticket className="mx-auto h-12 w-12 text-gray-700 mb-3" />
                        <p className="text-gray-500">No hay tickets aún</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ── TECHNICIAN ────────────────────────── */
  if (user.role === "TECHNICIAN") {
    const [assignedTickets, priorityCounts, statusCounts] = await Promise.all([
      prisma.ticket.findMany({
        where: { assignedToId: payload.sub, organizationId: payload.orgId },
        include: {
          category: { select: { name: true } },
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.groupBy({
        by: ["priority"],
        where: { assignedToId: payload.sub, organizationId: payload.orgId },
        _count: true,
      }),
      prisma.ticket.groupBy({
        by: ["status"],
        where: { assignedToId: payload.sub, organizationId: payload.orgId },
        _count: true,
      }),
    ]);

    const openCount = assignedTickets.filter(
      (t) => t.status === "OPEN"
    ).length;
    const inProgressCount = assignedTickets.filter(
      (t) => t.status === "IN_PROGRESS"
    ).length;
    const total = assignedTickets.length;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mis Tickets Asignados</h1>
          <p className="text-gray-400 text-sm mt-0.5">{openCount + inProgressCount} activos, {total} total</p>
        </div>

        {/* Priority breakdown */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4">
          {priorityCounts.map((p, i) => {
            const iconMap: Record<string, typeof AlertCircle> = {
              URGENT: AlertCircle,
              HIGH: AlertCircle,
              MEDIUM: Clock,
              LOW: CheckCircle2,
            };
            const Icon = iconMap[p.priority] || Ticket;
            const gradientMap: Record<string, string> = {
              URGENT: "from-red-500/10 to-red-500/5",
              HIGH: "from-orange-500/10 to-orange-500/5",
              MEDIUM: "from-blue-500/10 to-blue-500/5",
              LOW: "from-gray-500/10 to-gray-500/5",
            };
            return (
              <Card
                key={p.priority}
                className={`relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientMap[p.priority] || "from-blue-500/10 to-blue-500/5"} opacity-50`} />
                <CardHeader className="relative flex flex-row items-center justify-between pb-2 pt-5 px-5">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{priorityLabels[p.priority] || p.priority}</p>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Icon className={`h-4 w-4 ${p.priority === "URGENT" ? "text-red-400" : p.priority === "HIGH" ? "text-orange-400" : p.priority === "MEDIUM" ? "text-blue-400" : "text-gray-400"}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative pb-5 px-5">
                  <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{p._count}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Status distribution + table */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
            <CardHeader>
              <CardTitle className="text-base text-white/90 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Estados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusCounts.map((s) => {
                  const pct = total > 0 ? (s._count / total) * 100 : 0;
                  return (
                    <div key={s.status} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{statusLabels[s.status] || s.status}</span>
                        <span className="text-white font-medium tabular-nums">{s._count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                        <div className={`h-full rounded-full ${statusBarColors[s.status] || "bg-blue-500"} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "150ms" }}>
            <CardHeader>
              <CardTitle className="text-base text-white/90 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-blue-400" />
                Tickets Asignados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40">
                      <TableHead className="w-[100px] text-gray-500">Ticket</TableHead>
                      <TableHead className="text-gray-500">Título</TableHead>
                      <TableHead className="text-gray-500">Estado</TableHead>
                      <TableHead className="text-gray-500">Prioridad</TableHead>
                      <TableHead className="hidden sm:table-cell text-gray-500">Categoría</TableHead>
                      <TableHead className="hidden sm:table-cell text-gray-500">Creado Por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedTickets.map((t) => (
                      <TableRow key={t.id} className="border-border/30 hover:bg-white/5 transition-colors">
                        <TableCell>
                          <Link href={`/tickets/${t.id}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                            TK-{t.ticketNumber}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate text-white/90">{t.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[t.status]}>{statusLabels[t.status] || t.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={priorityColors[t.priority]}>{priorityLabels[t.priority] || t.priority}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-400">{t.category?.name ?? "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-400">{t.createdBy.name}</TableCell>
                      </TableRow>
                    ))}
                    {assignedTickets.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <Ticket className="mx-auto h-12 w-12 text-gray-700 mb-3" />
                          <p className="text-gray-500">No tienes tickets asignados</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ── END_USER ─────────────────────────── */
  const myTickets = await prisma.ticket.findMany({
    where: { createdById: payload.sub, organizationId: payload.orgId },
    include: {
      category: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const [myTotal, myOpen, myResolved] = await Promise.all([
    prisma.ticket.count({ where: { createdById: payload.sub, organizationId: payload.orgId } }),
    prisma.ticket.count({ where: { createdById: payload.sub, organizationId: payload.orgId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.ticket.count({ where: { createdById: payload.sub, organizationId: payload.orgId, status: "RESOLVED" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mis Tickets</h1>
          <p className="text-gray-400 text-sm mt-0.5">{myTotal} ticket{myTotal !== 1 ? "s" : ""} creados por ti</p>
        </div>
        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20">
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        {[
          { title: "Total", value: myTotal, icon: Ticket, color: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-400" },
          { title: "Activos", value: myOpen, icon: AlertCircle, color: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-400" },
          { title: "Resueltos", value: myResolved, icon: CheckCircle2, color: "from-green-500/10 to-green-500/5", iconColor: "text-green-400" },
        ].map((s, i) => (
          <Card key={s.title} className={`relative overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-50`} />
            <CardHeader className="relative flex flex-row items-center justify-between pb-2 pt-5 px-5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{s.title}</p>
              <s.icon className={`h-4 w-4 ${s.iconColor}`} />
            </CardHeader>
            <CardContent className="relative pb-5 px-5">
              <p className="text-2xl font-bold text-white tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
        <CardHeader>
          <CardTitle className="text-base text-white/90 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-blue-400" />
            Tickets Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40">
                  <TableHead className="w-[100px] text-gray-500">Ticket</TableHead>
                  <TableHead className="text-gray-500">Título</TableHead>
                  <TableHead className="text-gray-500">Estado</TableHead>
                  <TableHead className="text-gray-500">Prioridad</TableHead>
                  <TableHead className="hidden sm:table-cell text-gray-500">Asignado</TableHead>
                  <TableHead className="hidden md:table-cell text-gray-500">Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTickets.map((t) => (
                  <TableRow key={t.id} className="border-border/30 hover:bg-white/5 transition-colors">
                    <TableCell>
                      <Link href={`/tickets/${t.id}`} className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                        TK-{t.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate text-white/90">{t.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[t.status]}>{statusLabels[t.status] || t.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityColors[t.priority]}>{priorityLabels[t.priority] || t.priority}</Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-400">{t.assignedTo?.name ?? "Sin Asignar"}</TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500 text-sm">{formatDate(t.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {myTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Ticket className="mx-auto h-12 w-12 text-gray-700 mb-3" />
                      <p className="text-gray-500">No has creado ningún ticket aún</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
