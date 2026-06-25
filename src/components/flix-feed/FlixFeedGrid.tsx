"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Network,
  Cpu,
  Code2,
  Printer,
  Mail,
  Server,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

type Ticket = {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  aiCategorySuggested: string | null;
  aiSentiment: string | null;
  createdAt: string;
  createdBy: { name: string };
  assignedTo: { name: string } | null;
  category: { name: string } | null;
};

type CategoryConfig = {
  name: string;
  icon: React.ElementType;
  match: (ticket: Ticket) => boolean;
};

const categories: CategoryConfig[] = [
  { name: "Hardware", icon: Cpu, match: (t) => t.category?.name === "Hardware" || t.aiCategorySuggested === "Hardware" || t.title.toLowerCase().includes("hardware") || t.title.toLowerCase().includes("pc") || t.title.toLowerCase().includes("pantalla") },
  { name: "Software", icon: Code2, match: (t) => t.category?.name === "Software" || t.aiCategorySuggested === "Software" || t.title.toLowerCase().includes("software") || t.title.toLowerCase().includes("sistema") },
  { name: "Red", icon: Network, match: (t) => t.category?.name === "Red" || t.aiCategorySuggested === "Red" || t.title.toLowerCase().includes("internet") || t.title.toLowerCase().includes("red") || t.title.toLowerCase().includes("wifi") },
  { name: "Impresoras", icon: Printer, match: (t) => t.category?.name === "Impresoras" || t.aiCategorySuggested === "Impresoras" || t.title.toLowerCase().includes("impresora") },
  { name: "Correos", icon: Mail, match: (t) => t.category?.name === "Correos" || t.aiCategorySuggested === "Correos" || t.title.toLowerCase().includes("correo") || t.title.toLowerCase().includes("email") },
  { name: "Servidores", icon: Server, match: (t) => t.category?.name === "Servidores" || t.aiCategorySuggested === "Servidores" || t.title.toLowerCase().includes("servidor") },
];

function getTicketStatus(ticket: Ticket): "active" | "critical" {
  const hasFrustrated = ticket.aiSentiment === "FRUSTRATED" || ticket.aiSentiment === "CRITICAL";
  const hasUrgent = ticket.priority === "URGENT" || ticket.priority === "HIGH";
  if (hasFrustrated || hasUrgent) return "critical";
  return "active";
}

function FlixFeedCard({ name, icon: Icon, tickets }: { name: string; icon: React.ElementType; tickets: Ticket[] }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeCount = tickets.filter(
    (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
  ).length;

  const hasCritical = tickets.some(
    (t) => getTicketStatus(t) === "critical"
  );

  const isAlert = hasCritical;
  const isOperative = activeCount === 0;

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Card
          className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
            isAlert
              ? "border-red-500 bg-red-950/30 animate-pulse"
              : isOperative
              ? "border-green-500 bg-green-950/20"
              : "border-yellow-500 bg-yellow-950/20"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <Icon
                className={`h-10 w-10 ${
                  isAlert ? "text-red-400" : isOperative ? "text-green-400" : "text-yellow-400"
                }`}
              />
              <Badge
                variant={isAlert ? "destructive" : isOperative ? "default" : "secondary"}
                className={`text-xs font-semibold ${
                  isAlert
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : isOperative
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                }`}
              >
                {isAlert ? (
                  <><AlertTriangle className="h-3 w-3 mr-1" /> INCIDENTE ACTIVO</>
                ) : isOperative ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> OPERATIVO</>
                ) : (
                  <><Clock className="h-3 w-3 mr-1" /> EN ATENCIÓN</>
                )}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
            <p className={`text-3xl font-bold mb-2 ${isAlert ? "text-red-400" : isOperative ? "text-green-400" : "text-yellow-400"}`}>
              {activeCount} {activeCount === 1 ? "ticket" : "tickets"} activo{activeCount !== 1 ? "s" : ""}
            </p>
            <p className={`text-sm ${isAlert ? "text-red-300" : isOperative ? "text-green-300" : "text-yellow-300"}`}>
              {isAlert
                ? "Requiere atención inmediata"
                : isOperative
                ? "Sin incidentes reportados"
                : "Atendiendo tickets activos"}
            </p>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="w-[400px] sm:w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {name}
            <Badge variant="outline" className="ml-2">
              {activeCount} activo{activeCount !== 1 ? "s" : ""}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {tickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Sin tickets en esta categoría</p>
          ) : (
            tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 rounded-lg border bg-card/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      TK-{ticket.ticketNumber}
                    </p>
                    <p className="font-medium text-sm truncate">{ticket.title}</p>
                  </div>
                  <Badge
                    variant={
                      ticket.priority === "URGENT" || ticket.priority === "HIGH"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-xs shrink-0"
                  >
                    {ticket.priority === "URGENT"
                      ? "Urgente"
                      : ticket.priority === "HIGH"
                      ? "Alta"
                      : ticket.priority === "MEDIUM"
                      ? "Media"
                      : "Baja"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {ticket.status === "OPEN"
                      ? "Abierto"
                      : ticket.status === "IN_PROGRESS"
                      ? "En Progreso"
                      : ticket.status === "ON_HOLD"
                      ? "En Espera"
                      : ticket.status}
                  </Badge>
                  <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                    <Link href={`/tickets/${ticket.id}`}>
                      Ver ticket <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function FlixFeedGrid({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/tickets?limit=100");
      if (!res.ok) return;
      const data = await res.json();
      const active = data.tickets.filter(
        (t: Ticket) => t.status !== "RESOLVED" && t.status !== "CLOSED"
      );
      setTickets(active);
    } catch {
      // Silenciar errores de refresh
    }
  }, []);

  // Auto-refresh cada 5 segundos (para demo)
  useEffect(() => {
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            FlixSupport — Centro de Comando
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
          <span className="text-sm font-medium text-green-400 uppercase tracking-wider">En Vivo</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const catTickets = tickets.filter(cat.match);
          return (
            <FlixFeedCard
              key={cat.name}
              name={cat.name}
              icon={cat.icon}
              tickets={catTickets}
            />
          );
        })}
      </div>
    </div>
  );
}
