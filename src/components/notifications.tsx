"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface NotifItem {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  priorityLabel: string;
  ticketId: string | null;
  ticketNumber: number | null;
  createdAt: string;
  read: boolean;
}

const priorityBorder: Record<string, string> = {
  URGENT: "border-l-red-500",
  HIGH: "border-l-orange-500",
  MEDIUM: "border-l-blue-500",
  LOW: "border-l-gray-400",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export function NotificationsBell() {
  const { toast } = useToast();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/list?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications || []);
        setCount(data.unreadCount || 0);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // SSE real-time
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      if (eventSource) eventSource.close();
      eventSource = new EventSource("/api/notifications");

      eventSource.addEventListener("notification", (event) => {
        try {
          const notif: NotifItem = JSON.parse(event.data);
          setNotifs((prev) => [notif, ...prev.slice(0, 19)]);
          setCount((prev) => prev + 1);
          toast({
            type: "info",
            title: notif.title,
            description: notif.message,
          });
        } catch { /* ignore */ }
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setCount((prev) => prev + 1);
          toast({
            type: "info",
            title: data.type === "TICKET_ASSIGNED" ? "Ticket Asignado" : "Actualizacion",
            description: data.message,
          });
        } catch { /* ignore */ }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        retryTimeout = setTimeout(connect, 5000);
      };
    }

    connect();
    return () => {
      eventSource?.close();
      clearTimeout(retryTimeout);
    };
  }, [toast]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function markAsRead(notifId: string) {
    setNotifs((prev) => prev.map((n) => (n.id === notifId ? { ...n, read: true } : n)));
    setCount((prev) => Math.max(0, prev - 1));
    try { await fetch(`/api/notifications/${notifId}`, { method: "PUT" }); } catch { /* ignore */ }
  }

  async function markAllAsRead() {
    setMarkingAll(true);
    try { await fetch("/api/notifications/mark-all-read", { method: "POST" }); } catch { /* ignore */ }
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setCount(0);
    setMarkingAll(false);
  }

  function openTicket(ticketId: string | null) {
    if (ticketId) {
      window.open(`/tickets/${ticketId}`, "_self");
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="h-11 w-11 relative"
        onClick={() => {
          if (open) {
            setOpen(false);
          } else {
            setOpen(true);
            setLoading(true);
            fetchNotifications().finally(() => setLoading(false));
          }
        }}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-in zoom-in-95 duration-200">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border bg-card shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Notificaciones</span>
            </div>
            {count > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={markAllAsRead}
                disabled={markingAll}
              >
                {markingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCheck className="h-3 w-3" />}
                Marcar todas
              </Button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Sin notificaciones</p>
              </div>
            ) : (
              <div className="py-1">
                {notifs.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => {
                      if (!notif.read) markAsRead(notif.id);
                      openTicket(notif.ticketId);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 border-l-4 transition-colors hover:bg-muted/50 flex items-start gap-3",
                      priorityBorder[notif.priority] || "border-l-blue-500",
                      !notif.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xs font-medium", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className={cn("text-xs mt-0.5 truncate", !notif.read ? "text-foreground/80" : "text-muted-foreground")}>
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0 rounded-full font-medium",
                            notif.priority === "URGENT" && "bg-red-500/10 text-red-500",
                            notif.priority === "HIGH" && "bg-orange-500/10 text-orange-500",
                            notif.priority === "MEDIUM" && "bg-blue-500/10 text-blue-500",
                            notif.priority === "LOW" && "bg-gray-500/10 text-gray-500"
                          )}
                        >
                          {notif.priorityLabel}
                        </span>
                        {notif.ticketNumber && (
                          <span className="text-[10px] text-muted-foreground">TK-{notif.ticketNumber}</span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
