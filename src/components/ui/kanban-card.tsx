"use client";

import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
  id: string;
  ticketNumber: number;
  title: string;
  priority: string;
  priorityLabel: string;
  priorityColor: string;
  assignee: string | undefined;
  category: string | undefined;
  createdAt: Date;
  href: string;
}

export function KanbanCard({
  id,
  ticketNumber,
  title,
  priorityLabel,
  priorityColor,
  assignee,
  category,
  createdAt,
  href,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function formatTimeAgo(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return "Hace minutos";
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-lg border bg-card p-3 cursor-grab active:cursor-grabbing",
        "hover:shadow-md transition-all hover:-translate-y-0.5",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <Link href={href} className="block" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs font-semibold text-primary">
            TK-{ticketNumber}
          </span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", priorityColor)}>
            {priorityLabel}
          </span>
        </div>
        <p className="text-sm font-medium line-clamp-2 leading-snug mb-2">
          {title}
        </p>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{assignee || "Sin asignar"}</span>
          <span>{formatTimeAgo(createdAt)}</span>
        </div>
        {category && (
          <div className="mt-1.5">
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
              {category}
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
