"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ticket, UserCircle, ExternalLink, Search, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Tech {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  _count: { assignedTickets: number };
}

interface PersonalTicket {
  id: string;
  ticketNumber: number;
  title: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  assignedTo: { name: string } | null;
  createdBy: { name: string; email: string };
  category: { name: string } | null;
  organizationId: string;
}

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

const priorityLabels: Record<string, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
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
  CLOSED: <CheckCircle2 className="h-4 w-4 text-gray-400" />,
};

const statusTransitionMap: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["ON_HOLD", "RESOLVED"],
  ON_HOLD: ["IN_PROGRESS", "CLOSED"],
  RESOLVED: ["CLOSED", "OPEN"],
  CLOSED: [],
};

export default function SupportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<PersonalTicket[]>([]);
  const [technicians, setTechnicians] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadData() {
    setLoading(true);
    try {
      const [ticketsRes, techRes] = await Promise.all([
        fetch("/api/admin/support/tickets"),
        fetch("/api/admin/support/technicians"),
      ]);
      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data.tickets);
        const initialAssignments: Record<string, string> = {};
        data.tickets.forEach((t: PersonalTicket) => {
          initialAssignments[t.id] = t.assignedToId || "";
        });
        setAssignments(initialAssignments);
      }
      if (techRes.ok) {
        const data = await techRes.json();
        setTechnicians(data.technicians);
      }
    } catch {
      toast({ type: "error", title: "Error", description: "No se pudieron cargar los datos" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleAssign(ticketId: string) {
    const techId = assignments[ticketId];
    if (!techId) return;
    setActionLoading(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId: techId }),
      });
      if (res.ok) {
        toast({ type: "success", title: "Asignado", description: "Técnico asignado correctamente" });
        loadData();
      } else {
        const err = await res.json();
        toast({ type: "error", title: "Error", description: err.message || "Error al asignar" });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al asignar técnico" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStatusChange(ticketId: string, newStatus: string) {
    setActionLoading(ticketId);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ type: "success", title: "Estado actualizado", description: `Ticket cambiado a ${statusLabels[newStatus]}` });
        loadData();
      } else {
        const err = await res.json();
        toast({ type: "error", title: "Error", description: err.message || "Error al cambiar estado" });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al cambiar estado" });
    } finally {
      setActionLoading(null);
    }
  }

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter(t => t.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Centro de Soporte</h1>
          <p className="text-muted-foreground text-sm">
            Gestiona los tickets de usuarios individuales y asigna técnicos de FlixSupport
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push("/super-admin/support/technicians")}>
          <UserCircle className="mr-2 h-4 w-4" />
          Gestionar Técnicos
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-5 w-5 text-cyan-500" />
            Tickets de Usuarios Individuales
            <Badge variant="outline" className="ml-2">{tickets.length}</Badge>
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="OPEN">Abiertos</SelectItem>
              <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
              <SelectItem value="DIAGNOSING">Diagnosticando</SelectItem>
              <SelectItem value="REPAIRING">Reparando</SelectItem>
              <SelectItem value="WAITING_PARTS">Esperando Repuestos</SelectItem>
              <SelectItem value="READY">Listos</SelectItem>
              <SelectItem value="ON_HOLD">En Espera</SelectItem>
              <SelectItem value="RESOLVED">Resueltos</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {statusFilter === "all" ? "No hay tickets de usuarios individuales" : "No hay tickets con ese estado"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Ticket</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="hidden sm:table-cell">Título</TableHead>
                    <TableHead className="hidden sm:table-cell">Prioridad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="min-w-[180px]">Técnico</TableHead>
                    <TableHead className="min-w-[110px]">Acción</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => {
                    const nextStatuses = statusTransitionMap[ticket.status] || [];
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          TK-{ticket.ticketNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm truncate max-w-[120px]">{ticket.createdBy.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[120px]">{ticket.createdBy.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell max-w-[180px] truncate">{ticket.title}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {priorityLabels[ticket.priority] || ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {statusIcons[ticket.status]}
                            <span className="text-xs">{statusLabels[ticket.status] || ticket.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Select
                              value={assignments[ticket.id] || ""}
                              onValueChange={(val) => setAssignments(prev => ({ ...prev, [ticket.id]: val }))}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Sin asignar" />
                              </SelectTrigger>
                              <SelectContent>
                                {technicians.filter(t => t.isActive).map((t) => (
                                  <SelectItem key={t.id} value={t.id}>
                                    {t.name} {t._count.assignedTickets > 0 ? `(${t._count.assignedTickets} act)` : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {assignments[ticket.id] && assignments[ticket.id] !== ticket.assignedToId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-2"
                                disabled={actionLoading === ticket.id}
                                onClick={() => handleAssign(ticket.id)}
                              >
                                {actionLoading === ticket.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                              </Button>
                            )}
                          </div>
                          {ticket.assignedTo && assignments[ticket.id] === ticket.assignedToId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {ticket.assignedTo.name}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {nextStatuses.length > 0 && (
                            <Select
                              value=""
                              onValueChange={(val) => handleStatusChange(ticket.id, val)}
                            >
                              <SelectTrigger className="h-8 text-xs w-[130px]">
                                <SelectValue placeholder="Cambiar estado" />
                              </SelectTrigger>
                              <SelectContent>
                                {nextStatuses.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {statusLabels[s] || s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          {nextStatuses.length === 0 && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => router.push(`/super-admin/support/tickets/${ticket.id}`)}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
