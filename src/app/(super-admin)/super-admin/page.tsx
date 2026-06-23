import { prisma } from "@/core/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Ticket, CreditCard, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard() {
  const orgs = await prisma.organization.findMany({
    include: {
      _count: { select: { users: true, tickets: true } },
      subscription: { select: { status: true, plan: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalTickets = orgs.reduce((sum, o) => sum + o._count.tickets, 0);
  const totalUsers = orgs.reduce((sum, o) => sum + o._count.users, 0);
  const activeOrgs = orgs.filter((o) => o.subscription?.status === "ACTIVE" || !o.subscription).length;

  const ticketsByStatus = await prisma.ticket.groupBy({
    by: ["status"],
    _count: true,
  });

  const statusLabels: Record<string, string> = {
    OPEN: "Abiertos",
    IN_PROGRESS: "En Progreso",
    ON_HOLD: "En Espera",
    RESOLVED: "Resueltos",
    CLOSED: "Cerrados",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    OPEN: <AlertCircle className="h-4 w-4 text-blue-400" />,
    IN_PROGRESS: <Clock className="h-4 w-4 text-yellow-400" />,
    ON_HOLD: <Clock className="h-4 w-4 text-orange-400" />,
    RESOLVED: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    CLOSED: <XCircle className="h-4 w-4 text-gray-400" />,
  };
  const statusColors: Record<string, string> = {
    OPEN: "text-blue-600",
    IN_PROGRESS: "text-yellow-600",
    ON_HOLD: "text-orange-600",
    RESOLVED: "text-green-600",
    CLOSED: "text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel Global</h1>
        <p className="text-muted-foreground text-sm">
          Resumen general de todas las organizaciones
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-muted-foreground">Organizaciones</p>
            <Building2 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orgs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeOrgs} activas</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-muted-foreground">Usuarios</p>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium text-muted-foreground">Tickets</p>
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

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Organizaciones Registradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orgs.map((org) => (
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
              {orgs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No hay organizaciones registradas
                </p>
              )}
            </div>
          </CardContent>
        </Card>

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
