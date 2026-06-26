"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { Ticket, Loader2 } from "lucide-react";
import { getPriorityBadge, getPriorityLabel } from "@/lib/theme";
import { useToast } from "@/components/ui/toast";

// Must match VALID_STATUS_TRANSITIONS in ticket.types.ts
const VALID_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS", "ON_HOLD", "CLOSED"],
  IN_PROGRESS: ["ON_HOLD", "RESOLVED"],
  ON_HOLD: ["IN_PROGRESS", "CLOSED"],
  RESOLVED: ["CLOSED", "OPEN"],
  CLOSED: [],
};

interface TicketItem {
  id: string;
  ticketNumber: number;
  title: string;
  status: string;
  priority: string;
  assignedTo: { name: string } | null;
  category: { name: string } | null;
  createdAt: Date;
}

const columns = [
  { id: "OPEN", label: "Pendiente", color: "border-t-blue-400" },
  { id: "IN_PROGRESS", label: "En Progreso", color: "border-t-yellow-400" },
  { id: "ON_HOLD", label: "En Espera", color: "border-t-amber-400" },
  { id: "RESOLVED", label: "Resuelto", color: "border-t-emerald-400" },
  { id: "CLOSED", label: "Cerrado", color: "border-t-gray-400" },
];

interface KanbanBoardProps {
  tickets: TicketItem[];
}

export function KanbanBoard({ tickets }: KanbanBoardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const grouped = columns.reduce<Record<string, TicketItem[]>>((acc, col) => {
    acc[col.id] = tickets.filter((t) => t.status === col.id);
    return acc;
  }, {});

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ticketId = active.id as string;
    const newStatus = over.id as string;
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus || newStatus === ticketId) return;

    // Client-side validation
    const allowed = VALID_TRANSITIONS[ticket.status] || [];
    if (!allowed.includes(newStatus)) {
      toast({ type: "error", title: "Transición no permitida", description: `No se puede mover de "${ticket.status}" a "${newStatus}"` });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
        toast({ type: "success", title: "Estado actualizado", description: `Ticket movido a "${columns.find(c => c.id === newStatus)?.label || newStatus}"` });
      } else {
        const err = await res.json().catch(() => ({ message: "Error desconocido" }));
        toast({ type: "error", title: "Error", description: err.message || "No se pudo actualizar el ticket" });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error de conexión al actualizar el ticket" });
    } finally {
      setSaving(false);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
  }

  const activeTicket = activeId ? tickets.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      {saving && (
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-primary/10 backdrop-blur-sm py-2 text-sm font-medium text-primary animate-in slide-in-from-top-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Guardando...
        </div>
      )}
      <div className="flex gap-4 min-h-[70dvh] overflow-x-auto pb-4 snap-x">
        {columns.map((col) => (
          <div key={col.id} className="min-w-[260px] w-[260px] flex-shrink-0 snap-start">
            <KanbanColumn
              id={col.id}
              label={col.label}
              color={col.color}
              count={grouped[col.id]?.length ?? 0}
            >
              <SortableContext
                items={grouped[col.id]?.map((t) => t.id) ?? []}
                strategy={verticalListSortingStrategy}
              >
                {grouped[col.id]?.map((ticket) => (
                  <KanbanCard
                    key={ticket.id}
                    id={ticket.id}
                    ticketNumber={ticket.ticketNumber}
                    title={ticket.title}
                    priority={ticket.priority}
                    priorityLabel={getPriorityLabel(ticket.priority)}
                    priorityColor={getPriorityBadge(ticket.priority)}
                    assignee={ticket.assignedTo?.name}
                    category={ticket.category?.name}
                    createdAt={ticket.createdAt}
                    href={`/tickets/${ticket.id}`}
                  />
                ))}
              </SortableContext>
              {(!grouped[col.id] || grouped[col.id].length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Ticket className="h-8 w-8 mb-2 opacity-30" />
                  <p className="text-sm">Sin tickets</p>
                </div>
              )}
            </KanbanColumn>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTicket && (
          <div className="rotate-3 opacity-90">
            <KanbanCard
              id={activeTicket.id}
              ticketNumber={activeTicket.ticketNumber}
              title={activeTicket.title}
              priority={activeTicket.priority}
              priorityLabel={getPriorityLabel(activeTicket.priority)}
              priorityColor={getPriorityBadge(activeTicket.priority)}
              assignee={activeTicket.assignedTo?.name}
              category={activeTicket.category?.name}
              createdAt={activeTicket.createdAt}
              href={`/tickets/${activeTicket.id}`}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
