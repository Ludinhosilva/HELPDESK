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
import { Ticket } from "lucide-react";
import { getPriorityBadge, getPriorityLabel } from "@/lib/theme";

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
  { id: "ON_HOLD", label: "En Espera", color: "border-t-orange-400" },
  { id: "RESOLVED", label: "Resuelto", color: "border-t-green-400" },
];

interface KanbanBoardProps {
  tickets: TicketItem[];
}

export function KanbanBoard({ tickets }: KanbanBoardProps) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(null);

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

    try {
      await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } catch {
      // ignore errors on drag
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[70vh]">
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
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
