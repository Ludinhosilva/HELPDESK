"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Tag, Calendar, Clock, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Tech {
  id: string;
  name: string;
}

interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  createdBy: { id: string; name: string; email: string };
  category: { id: string; name: string } | null;
  organizationId: string;
  createdAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  comments: Array<{
    id: string;
    content: string;
    author: { id: string; name: string };
    createdAt: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: string;
  }>;
}

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En Progreso",
  DIAGNOSING: "Diagnosticando",
  REPAIRING: "Reparando",
  WAITING_PARTS: "Esperando Repuestos",
  READY: "Listo para Entregar",
  ON_HOLD: "En Espera",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  DIAGNOSING: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  REPAIRING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  WAITING_PARTS: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  READY: "bg-green-500/10 text-green-400 border-green-500/20",
  ON_HOLD: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  RESOLVED: "bg-green-500/10 text-green-400 border-green-500/20",
  CLOSED: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const statusTransitionMap: Record<string, string[]> = {
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

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-PE", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function SupportTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [technicians, setTechnicians] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignedToId, setAssignedToId] = useState("");
  const [comment, setComment] = useState("");
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<{ subject: string; body: string } | null>(null);

  async function loadTicket() {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
        setAssignedToId(data.assignedToId || "");
      } else {
        toast({ type: "error", title: "Error", description: "Ticket no encontrado" });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al cargar ticket" });
    } finally {
      setLoading(false);
    }
  }

  async function loadTechnicians() {
    try {
      const res = await fetch("/api/admin/support/technicians");
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data.technicians.filter((t: Tech & { isActive: boolean }) => t.isActive !== false));
      }
    } catch { /* ignore */ }
  }

  useEffect(() => { loadTicket(); loadTechnicians(); }, [ticketId]);

  async function handleAssign() {
    if (!assignedToId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedToId }),
      });
      if (res.ok) {
        toast({ type: "success", title: "Asignado", description: "Técnico asignado correctamente" });
        loadTicket();
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al asignar" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ type: "success", title: "Estado actualizado" });
        loadTicket();
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al cambiar estado" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      if (res.ok) {
        setComment("");
        toast({ type: "success", title: "Comentario añadido" });
        loadTicket();
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al añadir comentario" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCopilot() {
    setCopilotLoading(true);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticket?.title || "",
          description: ticket?.description || "",
          category: ticket?.category?.name || "",
          similarTickets: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotResponse(data);
      }
    } catch { /* ignore */ } finally {
      setCopilotLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Ticket no encontrado</p>
        <Button variant="ghost" className="mt-4" onClick={() => router.push("/super-admin/support")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const nextStatuses = statusTransitionMap[ticket.status] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/super-admin/support")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">TK-{ticket.ticketNumber}</h1>
            <Badge variant="outline" className={statusColors[ticket.status]}>
              {statusLabels[ticket.status] || ticket.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{ticket.title}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Descripción</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comentarios ({ticket.comments?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.comments?.map((c) => (
                <div key={c.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{c.author.name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Añadir un comentario..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  disabled={actionLoading}
                />
                <Button type="submit" size="sm" disabled={!comment.trim() || actionLoading}>
                  Enviar
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Historial</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ticket.history?.map((h) => (
                  <div key={h.id} className="flex gap-3 text-sm border-l-2 border-border pl-3">
                    <span className="text-muted-foreground text-xs whitespace-nowrap mt-0.5">
                      {formatDate(h.timestamp)}
                    </span>
                    <div>
                      <span className="font-medium">{h.action}</span>
                      <p className="text-muted-foreground">{h.description}</p>
                    </div>
                  </div>
                ))}
                {(!ticket.history || ticket.history.length === 0) && (
                  <p className="text-muted-foreground text-sm">Sin historial aún</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Acciones</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {nextStatuses.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Cambiar Estado</p>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() => handleStatusChange(s)}
                      >
                        {statusLabels[s] || s}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Asignar Técnico</p>
                <div className="flex gap-2">
                  <Select value={assignedToId || ""} onValueChange={setAssignedToId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar técnico" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" disabled={!assignedToId || assignedToId === ticket.assignedToId || actionLoading} onClick={handleAssign}>
                    Asignar
                  </Button>
                </div>
              </div>

              <Separator />
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={copilotLoading}
                  onClick={handleCopilot}
                >
                  {copilotLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generar solución con IA
                </Button>
                {copilotResponse && (
                  <div className="rounded-lg border bg-muted/30 p-3 mt-3 space-y-2">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Borrador IA</p>
                    <p className="text-sm font-medium">{copilotResponse.subject}</p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{copilotResponse.body}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Detalles</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Creado por</p>
                  <p className="font-medium">{ticket.createdBy.name}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Asignado a</p>
                  <p className="font-medium">{ticket.assignedTo?.name ?? "Sin Asignar"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Categoría</p>
                  <p className="font-medium">{ticket.category?.name ?? "—"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Creado</p>
                  <p className="font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Resuelto</p>
                  <p className="font-medium">{formatDate(ticket.resolvedAt)}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground text-xs">Cerrado</p>
                  <p className="font-medium">{formatDate(ticket.closedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
