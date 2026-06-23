import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/core/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TicketFilters } from "./ticket-filters";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Ticket,
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

interface TicketsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    priority?: string;
    q?: string;
  }>;
}

export default async function TicketsPage({ searchParams }: TicketsPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const payload = await verifyToken(token);
  if (!payload) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, role: true },
  });
  if (!user) redirect("/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const status = params.status || "";
  const priority = params.priority || "";
  const q = params.q || "";
  const pageSize = 15;

  const where: Record<string, unknown> = {
    organizationId: payload.orgId,
  };

  if (user.role === "TECHNICIAN") {
    where.assignedToId = payload.sub;
  } else if (user.role === "END_USER") {
    where.createdById = payload.sub;
  }

  if (status && status !== "all") where.status = status;
  if (priority && priority !== "all") where.priority = priority;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { ticketNumber: { equals: parseInt(q.replace(/\D/g, "")) || -1 } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        category: { select: { name: true } },
        createdBy: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.ticket.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);
  const canCreate = user.role === "ADMIN" || user.role === "END_USER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground text-sm">
            {total} ticket{total !== 1 ? "s" : ""} encontrados
          </p>
        </div>
        {canCreate && (
          <Button asChild size="sm">
            <Link href="/tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Crear Ticket
            </Link>
          </Button>
        )}
      </div>

      <TicketFilters />

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
                <TableHead className="hidden sm:table-cell">Categoría</TableHead>
                <TableHead className="hidden sm:table-cell">Asignado A</TableHead>
                <TableHead className="hidden md:table-cell">Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Link
                      href={`/tickets/${t.id}`}
                      className="font-mono text-xs font-semibold text-primary hover:underline"
                    >
                      TK-{t.ticketNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium max-w-[220px] truncate">
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
              {tickets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Ticket className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No hay tickets con esos filtros</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/tickets?page=${page - 1}${status ? `&status=${status}` : ""}${priority ? `&priority=${priority}` : ""}${q ? `&q=${q}` : ""}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Link>
              ) : (
                <span><ChevronLeft className="h-4 w-4 mr-1" /> Anterior</span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/tickets?page=${page + 1}${status ? `&status=${status}` : ""}${priority ? `&priority=${priority}` : ""}${q ? `&q=${q}` : ""}`}>
                  Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <span>Siguiente <ChevronRight className="h-4 w-4 ml-1" /></span>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
