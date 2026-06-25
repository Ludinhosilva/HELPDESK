import { notFound } from "next/navigation";
import { prisma } from "@/core/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Ticket, CreditCard, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  TECHNICIAN: "Técnico",
  END_USER: "Usuario Final",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
  ADMIN: "bg-blue-100 text-blue-700 border-blue-200",
  TECHNICIAN: "bg-green-100 text-green-700 border-green-200",
  END_USER: "bg-gray-100 text-gray-700 border-gray-200",
};

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En Progreso",
  DIAGNOSING: "Diagnosticando",
  REPAIRING: "Reparando",
  WAITING_PARTS: "Esperando Repuestos",
  READY: "Listo",
  ON_HOLD: "En Espera",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700 border-yellow-200",
  DIAGNOSING: "bg-cyan-100 text-cyan-700 border-cyan-200",
  REPAIRING: "bg-purple-100 text-purple-700 border-purple-200",
  WAITING_PARTS: "bg-orange-100 text-orange-700 border-orange-200",
  READY: "bg-green-100 text-green-700 border-green-200",
  ON_HOLD: "bg-orange-100 text-orange-700 border-orange-200",
  RESOLVED: "bg-green-100 text-green-700 border-green-200",
  CLOSED: "bg-gray-100 text-gray-700 border-gray-200",
};

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { name: "asc" },
      },
      _count: { select: { tickets: true } },
      subscription: { include: { plan: { select: { name: true, price: true } } } },
    },
  });

  if (!org) notFound();

  const recentTickets = await prisma.ticket.findMany({
    where: { organizationId: org.id },
    include: {
      createdBy: { select: { name: true } },
      assignedTo: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{org.name}</h1>
          <p className="text-muted-foreground text-sm">
            @{org.slug} &middot; Creada {new Date(org.createdAt).toLocaleDateString("es-PE")}
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {org.subscription?.plan?.name || "Sin plan"}
        </Badge>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <Users className="h-4 w-4 text-blue-400" />
            <p className="text-sm text-muted-foreground mt-1">Usuarios</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{org.users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Ticket className="h-4 w-4 text-green-400" />
            <p className="text-sm text-muted-foreground mt-1">Tickets</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{org._count.tickets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CreditCard className="h-4 w-4 text-amber-400" />
            <p className="text-sm text-muted-foreground mt-1">Suscripción</p>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{org.subscription?.plan?.name || "Gratis"}</p>
            {org.subscription?.plan?.price ? (
              <p className="text-xs text-muted-foreground">
                S/ {(org.subscription.plan.price / 100).toFixed(2)}/mes
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            <p className="text-sm text-muted-foreground mt-1">Creada</p>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {new Date(org.createdAt).toLocaleDateString("es-PE")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuarios ({org.users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {org.users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColors[u.role]}>
                      {roleLabels[u.role] || u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdAt).toLocaleDateString("es-PE")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tickets Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creado Por</TableHead>
                <TableHead>Asignado A</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono text-xs font-semibold">
                    TK-{t.ticketNumber}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{t.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[t.status]}>
                      {statusLabels[t.status] || t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.createdBy.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {t.assignedTo?.name || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {recentTickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Sin tickets
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
