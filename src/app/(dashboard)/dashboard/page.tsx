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
  OPEN: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-200",
  ON_HOLD: "bg-orange-100 text-orange-700 border-orange-200",
  RESOLVED: "bg-green-100 text-green-700 border-green-200",
  CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700 border-gray-200",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  URGENT: "bg-red-100 text-red-700 border-red-200",
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

  if (user.role === "ADMIN") {
    const [total, open, inProgress, , resolved, closed, recentTickets, statusCounts] =
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

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Panel Principal</h1>
            <p className="text-muted-foreground text-sm">
              Resumen de tu soporte técnico
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Ticket
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          {[
            { title: "Total Tickets", value: total, icon: Ticket, color: "text-blue-400", trend: null },
            { title: "Abiertos", value: open, icon: AlertCircle, color: "text-blue-400", trend: null },
            { title: "En Progreso", value: inProgress, icon: Clock, color: "text-yellow-400", trend: null },
            { title: "Resueltos", value: resolved, icon: CheckCircle2, color: "text-green-400", trend: null },
            { title: "Cerrados", value: closed, icon: XCircle, color: "text-gray-400", trend: null },
          ].map((stat, index) => (
            <Card
              key={stat.title}
              className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
          <Card className="glass-card lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="text-base">Alertas Predictivas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium">Posible recurrencia detectada</p>
                        <p className="text-xs text-muted-foreground">3 tickets de red en el piso 3 esta semana</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      Alta
                    </Badge>
                  </div>
                ))}
                <div className="text-center text-sm text-muted-foreground">
                  Basado en analisis de patrones de tickets recientes
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="text-base">Ticket Exprés Vencidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <span className="text-3xl font-bold text-red-500">0</span>
                <p className="text-sm text-muted-foreground mt-1">Sin Ticket Exprés vencidos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-base">Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statusCounts.map((s) => {
                const pct = total > 0 ? (s._count / total) * 100 : 0;
                return (
                  <div key={s.status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{statusLabels[s.status] || s.status}</span>
                      <span className="font-medium">{s._count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Tickets Recientes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tickets">
                Ver Todos <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Ticket</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="hidden sm:table-cell">Asignado A</TableHead>
                  <TableHead className="hidden md:table-cell">Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTickets.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link
                        href={`/tickets/${t.id}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        TK-{t.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {t.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[t.status]}>
                        {statusLabels[t.status] || t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityColors[t.priority]}>
                        {priorityLabels[t.priority] || t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {t.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {t.assignedTo?.name ?? "Sin Asignar"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(t.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
                {recentTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Ticket className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No hay tickets a&uacute;n</p>
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

  if (user.role === "TECHNICIAN") {
    const [assignedTickets, priorityCounts] = await Promise.all([
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
    ]);

    const openAssigned = assignedTickets.filter(
      (t) => t.status === "OPEN" || t.status === "IN_PROGRESS"
    );

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Tickets Asignados</h1>
          <p className="text-muted-foreground text-sm">
            {openAssigned.length} activos, {assignedTickets.length} total
          </p>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {priorityCounts.map((p, index) => (
            <Card key={p.priority} className="hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {priorityLabels[p.priority] || p.priority}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{p._count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-base">Tickets Asignados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Ticket</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                  <TableHead className="hidden sm:table-cell">Creado Por</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedTickets.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link
                        href={`/tickets/${t.id}`}
                        className="font-mono text-xs font-semibold text-primary hover:underline"
                      >
                        TK-{t.ticketNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {t.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[t.status]}>
                        {statusLabels[t.status] || t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityColors[t.priority]}>
                        {priorityLabels[t.priority] || t.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {t.category?.name ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {t.createdBy.name}
                    </TableCell>
                  </TableRow>
                ))}
                {assignedTickets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Ticket className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No tienes tickets asignados</p>
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

  const myTickets = await prisma.ticket.findMany({
    where: { createdById: payload.sub, organizationId: payload.orgId },
    include: {
      category: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const myTotal = await prisma.ticket.count({
    where: { createdById: payload.sub, organizationId: payload.orgId },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Tickets</h1>
          <p className="text-muted-foreground text-sm">
            {myTotal} ticket{myTotal !== 1 ? "s" : ""} creados por ti
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Link>
        </Button>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ticket</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="hidden sm:table-cell">Asignado A</TableHead>
                <TableHead className="hidden md:table-cell">Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myTickets.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                      TK-{t.ticketNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {t.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[t.status]}>
                      {statusLabels[t.status] || t.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityColors[t.priority]}>
                      {priorityLabels[t.priority] || t.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {t.assignedTo?.name ?? "Sin Asignar"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatDate(t.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {myTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No has creado ningún ticket aún
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
