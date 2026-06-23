"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bot, UserCheck, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface TicketDetailClientProps {
  ticketId: string;
  currentStatus: string;
  currentPriority: string;
  assignedToId: string | null;
  canChangeStatus: boolean;
  canAssign: boolean;
  categories: { id: string; name: string }[];
  technicians: { id: string; name: string }[];
  currentCategoryId: string | null;
  aiSuggestion: string | null;
}

const statusTransitions: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["ON_HOLD", "RESOLVED"],
  ON_HOLD: ["IN_PROGRESS", "RESOLVED"],
  RESOLVED: ["CLOSED", "OPEN"],
  CLOSED: [],
};

const statusLabels: Record<string, string> = {
  OPEN: "Abierto",
  IN_PROGRESS: "En Progreso",
  ON_HOLD: "En Espera",
  RESOLVED: "Resuelto",
  CLOSED: "Cerrado",
};

export default function TicketDetailClient({
  ticketId,
  currentStatus,
  assignedToId,
  canChangeStatus,
  canAssign,
  categories,
  technicians,
  currentCategoryId,
  aiSuggestion,
}: TicketDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<{ subject: string; body: string; estimatedTime: string } | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState(assignedToId || "");
  const [selectedCategory, setSelectedCategory] = useState(currentCategoryId || "");

  const nextStatuses = statusTransitions[currentStatus] || [];

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedAssignee) return;
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ technicianId: selectedAssignee }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopilot() {
    setCopilotLoading(true);
    try {
      const res = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: document.getElementById("ticket-title")?.textContent || "",
          description: document.getElementById("ticket-desc")?.textContent || "",
          category: currentCategoryId || "",
          similarTickets: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotResponse(data);
        toast({ type: "success", title: "Respuesta generada", description: "El AI Copilot ha generado un borrador de respuesta" });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "No se pudo generar la respuesta" });
    } finally {
      setCopilotLoading(false);
    }
  }

  async function handleCategoryChange(categoryId: string) {
    setSelectedCategory(categoryId);
    setLoading(true);
    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Acciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canChangeStatus && nextStatuses.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Cambiar Estado</p>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  disabled={loading}
                  onClick={() => handleStatusChange(s)}
                >
                  {statusLabels[s]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {canChangeStatus && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Asignar Categoría</p>
              <Select value={selectedCategory || undefined} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {canAssign && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Asignar Técnico</p>
              <div className="flex gap-2">
                <Select value={selectedAssignee || undefined} onValueChange={setSelectedAssignee}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!selectedAssignee || loading}
                  onClick={handleAssign}
                >
                  <UserCheck className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {aiSuggestion && (
          <>
            <Separator />
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <Bot className="h-4 w-4 text-primary" />
                Sugerencia de IA
              </div>
              <p className="text-sm text-muted-foreground">
                Categoría sugerida: <span className="font-medium text-foreground">{aiSuggestion}</span>
              </p>
            </div>
          </>
        )}

        {canChangeStatus && (
          <>
            <Separator />
            <div>
              <Button
                variant="outline"
                className="w-full"
                disabled={copilotLoading}
                onClick={handleCopilot}
              >
                {copilotLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generar solución con IA
              </Button>
            </div>
            {copilotResponse && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Borrador generado por IA</p>
                <p className="text-sm font-medium">{copilotResponse.subject}</p>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{copilotResponse.body}</p>
                <p className="text-xs text-muted-foreground">Tiempo estimado: {copilotResponse.estimatedTime}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
