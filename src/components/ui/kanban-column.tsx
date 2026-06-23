"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  label: string;
  color: string;
  count: number;
  children: React.ReactNode;
}

export function KanbanColumn({ id, label, color, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl border bg-card/50 backdrop-blur-sm border-t-4 flex flex-col min-h-[400px] transition-all",
        color,
        isOver && "ring-2 ring-primary shadow-lg scale-[1.02]"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">{label}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
