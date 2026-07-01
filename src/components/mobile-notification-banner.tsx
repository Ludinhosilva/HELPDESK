"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface BannerNotif {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  priorityLabel: string;
  ticketId: string | null;
}

const priorityGradient: Record<string, string> = {
  URGENT: "border-red-500 bg-red-50 dark:bg-red-950/30",
  HIGH: "border-orange-500 bg-orange-50 dark:bg-orange-950/30",
  MEDIUM: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
  LOW: "border-gray-400 bg-gray-50 dark:bg-gray-900/30",
};

export function MobileNotificationBanner() {
  const [banner, setBanner] = useState<BannerNotif | null>(null);
  const [visible, setVisible] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [dismissing, setDismissing] = useState(false);

  const showBanner = useCallback((notif: BannerNotif) => {
    setBanner(notif);
    setVisible(true);
    setDismissing(false);

    // Auto dismiss after 5s
    const timer = setTimeout(() => dismiss(), 5000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setDismissing(true);
    setTimeout(() => {
      setVisible(false);
      setBanner(null);
    }, 300);
  }

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      if (eventSource) eventSource.close();
      eventSource = new EventSource("/api/notifications");

      eventSource.addEventListener("notification", (event) => {
        try {
          const notif = JSON.parse(event.data);
          showBanner({
            id: notif.id,
            type: notif.type,
            title: notif.title,
            message: notif.message,
            priority: notif.priority,
            priorityLabel: notif.priorityLabel,
            ticketId: notif.ticketId,
          });
        } catch { /* ignore */ }
      });

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
  }, [showBanner]);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientY);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const delta = e.changedTouches[0].clientY - touchStart;
    // Swipe up to dismiss
    if (delta < -50) {
      dismiss();
    }
  }

  function openTicket() {
    if (banner?.ticketId) {
      window.open(`/tickets/${banner.ticketId}`, "_self");
    }
    dismiss();
  }

  if (!visible || !banner) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-3 pt-2 pb-1",
        dismissing
          ? "animate-out fade-out slide-out-to-top duration-300"
          : "animate-in fade-in slide-in-from-top duration-300"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        onClick={openTicket}
        className={cn(
          "rounded-xl border-2 p-3 shadow-lg cursor-pointer active:scale-[0.98] transition-transform",
          priorityGradient[banner.priority] || priorityGradient.MEDIUM
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              banner.priority === "URGENT" && "bg-red-500 text-white",
              banner.priority === "HIGH" && "bg-orange-500 text-white",
              banner.priority === "MEDIUM" && "bg-blue-500 text-white",
              banner.priority === "LOW" && "bg-gray-500 text-white"
            )}
          >
            <Bell className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">
                {banner.title}
              </p>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0 rounded-full font-medium shrink-0",
                  banner.priority === "URGENT" && "bg-red-500/10 text-red-600",
                  banner.priority === "HIGH" && "bg-orange-500/10 text-orange-600",
                  banner.priority === "MEDIUM" && "bg-blue-500/10 text-blue-600",
                  banner.priority === "LOW" && "bg-gray-500/10 text-gray-600"
                )}
              >
                {banner.priorityLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {banner.message}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismiss();
            }}
            className="shrink-0 p-1 rounded-lg hover:bg-foreground/5"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
