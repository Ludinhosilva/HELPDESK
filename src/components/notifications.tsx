"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Notification {
  id: string;
  type: string;
  message: string;
  ticketId: string;
  timestamp: string;
}

export function NotificationsBell() {
  const { toast } = useToast();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      if (eventSource) eventSource.close();

      eventSource = new EventSource("/api/notifications");

      eventSource.onmessage = (event) => {
        try {
          const notif: Notification = JSON.parse(event.data);
          setCount((prev) => prev + 1);

          toast({
            type: "info",
            title: notif.type === "TICKET_ASSIGNED" ? "Ticket Asignado" : "Actualizacion",
            description: notif.message,
          });
        } catch {
          // ignore parse errors
        }
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

  const clearCount = useCallback(() => setCount(0), []);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={clearCount}>
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>
    </div>
  );
}
