import { prisma } from "@/core/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, Ticket, CreditCard, AlertCircle, CheckCircle2, Clock, XCircle, UserCircle, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, tickets: true } },
      subscription: { select: { status: true, plan: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const personalOrgs = orgs.filter((o) => o.type === "PERSONAL");
  const companyOrgs = orgs.filter((o) => o.type === "COMPANY");

  const totalTickets = orgs.reduce((sum, o) => sum + o._count.tickets, 0);
  const activeOrgs = orgs.filter((o) => o.subscription?.status === "ACTIVE" || !o.subscription).length;

  // Tickets abiertos de usuarios individuales
  const personalOrgIds = personalOrgs.map((o) => o.id);
  const personalTickets = await prisma.ticket.findMany({
    where: {
      organizationId: { in: personalOrgIds },
      status: { notIn: ["RESOLVED", "CLOSED"] },
    },
    include: {
      createdBy: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const ticketsByStatus = await prisma.ticket.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusLabels: Record<string, string> = {
    OPEN: "Abiertos",
    IN_PROGRESS: "En Progreso",
    DIAGNOSING: "Diagnosticando",
    REPAIRING: "Reparando",
    WAITING_PARTS: "Esperando Repuestos",
    READY: "Listos",
    ON_HOLD: "En Espera",
    RESOLVED: "Resueltos",
    CLOSED: "Cerrados",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    OPEN: <AlertCircle className="h-4 w-4 text-blue-400" />,
    IN_PROGRESS: <Clock className="h-4 w-4 text-yellow-400" />,
    DIAGNOSING: <Clock className="h-4 w-4 text-cyan-400" />,
    REPAIRING: <Clock className="h-4 w-4 text-purple-400" />,
    WAITING_PARTS: <Clock className="h-4 w-4 text-orange-400" />,
    READY: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    ON_HOLD: <Clock className="h-4 w-4 text-orange-400" />,
    RESOLVED: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    CLOSED: <XCircle className="h-4 w-4 text-gray-400" />,
  };
  const statusColors: Record<string, string> = {
    OPEN: "text-blue-600",
    IN_PROGRESS: "text-yellow-600",
    DIAGNOSING: "text-cyan-600",
    REPAIRING: "text-purple-600",
    WAITING_PARTS: "text-orange-600",
    READY: "text-green-600",
    ON_HOLD: "text-orange-600",
    RESOLVED: "text-green-600",
    CLOSED: "text-gray-600",
  };

  const priorityColors: Record<string, string> = {
    LOW: "bg-gray-100 text-gray-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Global</h1>
        <p className="text-muted-foreground text-sm">
          Resumen general de todas las organizaciones y soporte a usuarios
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-muted-foreground">Organizaciones</p>
            <Building2 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{companyOrgs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeOrgs} activas</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-muted-foreground">Usuarios Individuales</p>
            <UserCircle className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{personalOrgs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{personalTickets.length} tickets abiertos</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
            <Ticket className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTickets}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-muted-foreground">Suscripciones</p>
            <CreditCard className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orgs.filter(o => o.subscription?.plan?.name).length}</p>
            <p className="text-xs text-muted-foreground mt-1">con plan activo</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets de Usuarios Individuales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-cyan-500" />
            Soporte a Usuarios Individuales
            <Badge variant="outline" className="ml-2">{personalTickets.length} pendientes</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {personalTickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay tickets pendientes de usuarios individuales
            </p>
          ) : (
            <div className="space-y-2">
              {personalTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/super-admin/organizations/${ticket.organizationId}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 shrink-0">
                      <Ticket className="h-4 w-4 text-cyan-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-muted-foreground">TK-{ticket.ticketNumber}</p>
                        <Badge variant="outline" className={`text-xs ${priorityColors[ticket.priority] || ""}`}>
                          {ticket.priority === "URGENT" ? "Urgente" : ticket.priority === "HIGH" ? "Alta" : ticket.priority === "MEDIUM" ? "Media" : "Baja"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {ticket.createdBy.name} &middot; {ticket.category?.name || "Sin categoria"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {ticket.status === "OPEN" ? "Abierto" : ticket.status === "IN_PROGRESS" ? "En Progreso" : ticket.status}
                    </Badge>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Organizaciones */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Organizaciones (Empresas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {companyOrgs.map((org) => (
                <a
                  key={org.id}
                  href={`/super-admin/organizations/${org.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org._count.users} usuarios &middot; {org._count.tickets} tickets
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{org.subscription?.plan?.name || "Sin plan"}</p>
                    <p className="text-xs text-muted-foreground">{org.slug}</p>
                  </div>
                </a>
              ))}
              {companyOrgs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No hay empresas registradas
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tickets por Estado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tickets por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ticketsByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusIcons[s.status]}
                    <span className="text-sm">{statusLabels[s.status] || s.status}</span>
                  </div>
                  <span className={`text-sm font-semibold ${statusColors[s.status] || ""}`}>
                    {s._count}
                  </span>
                </div>
              ))}
              {ticketsByStatus.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Sin tickets</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
