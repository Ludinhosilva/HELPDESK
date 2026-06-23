"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Sparkles, AlertTriangle, Wrench, Lightbulb, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SLA_PREMIUM_PRICE } from "@/lib/sla";

interface Message {
  role: "bot" | "user";
  text: string;
  type?: "solution" | "payment_required" | "info";
}

interface TriageResult {
  complexity: string;
  category: string;
  solution: string | null;
  requiresPayment: boolean;
  reason: string;
  suggestedAction: string;
  estimatedCost: number;
  priorityOverride: string | null;
}

interface AITriageProps {
  onComplete: (result: TriageResult, problem: string) => void;
  onBack: () => void;
}

const BOT_GREETING = "¡Hola! Soy el asistente inteligente de Flix Support. Describe tu problema en una línea para analizarlo:";

export function AITriage({ onComplete, onBack }: AITriageProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: BOT_GREETING, type: "info" },
  ]);
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText }),
      });

      if (res.status === 403) {
        const errData = await res.json();
        setMessages((prev) => [...prev, { role: "bot", text: errData.message || "Límite alcanzado", type: "info" }]);
        setDone(true);
        return;
      }

      if (!res.ok) throw new Error("Error");

      const data: TriageResult = await res.json();
      setResult(data);

      const botMessages: Message[] = [];

      if (data.complexity === "SIMPLE") {
        botMessages.push({
          role: "bot",
          text: `✅ **Problema simple detectado** — ${data.reason}`,
          type: "info",
        });
        if (data.solution) {
          botMessages.push({
            role: "bot",
            text: `🔧 **Solución rápida:**\n\n${data.solution}`,
            type: "solution",
          });
        }
        botMessages.push({
          role: "bot",
          text: "Con esto deberías resolverlo. Si el problema persiste, puedes crear un ticket gratuito.",
          type: "info",
        });
      }

      if (data.complexity === "MEDIUM") {
        botMessages.push({
          role: "bot",
          text: `📋 **Problema nivel medio** — ${data.reason}`,
          type: "info",
        });
        botMessages.push({
          role: "bot",
          text: "Podemos crear un ticket para que un técnico revise tu caso. Es **gratuito** y sin compromiso.",
          type: "info",
        });
      }

      if (data.complexity === "COMPLEX") {
        botMessages.push({
          role: "bot",
          text: `⚠️ **Problema complejo detectado** — ${data.reason}`,
          type: "payment_required",
        });
        botMessages.push({
          role: "bot",
          text: `Para problemas complejos, recomendamos activar **Ticket Exprés** por **S/ ${(SLA_PREMIUM_PRICE / 100).toFixed(2)}**. Obtienes:\n\n• 🚀 Respuesta garantizada en < 2 horas\n• 🔥 Prioridad URGENTE\n• 👨‍🔧 Técnico especializado asignado\n\nTambién puedes crear un ticket normal (sin prioridad).`,
          type: "payment_required",
        });
      }

      setMessages((prev) => [...prev, ...botMessages]);
      setDone(true);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Ocurrió un error. Intenta nuevamente.", type: "info" }]);
    } finally {
      setAnalyzing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleContinue() {
    if (result) onComplete(result, messages.find((m) => m.role === "user")?.text || "");
  }

  const iconMap: Record<string, React.ReactNode> = {
    solution: <Lightbulb className="h-5 w-5 text-yellow-500" />,
    payment_required: <AlertTriangle className="h-5 w-5 text-red-500" />,
    info: <Bot className="h-5 w-5 text-primary" />,
  };

  const bgMap: Record<string, string> = {
    solution: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800",
    payment_required: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
    info: "bg-muted/50",
  };

  return (
    <Card className="border-primary/30 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Asistente Inteligente</CardTitle>
            <p className="text-xs text-muted-foreground">Analizo tu problema antes de crear el ticket</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[280px] sm:h-[320px] overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2 text-sm",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "bot" && (
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  msg.type === "payment_required" ? "bg-red-100" : "bg-primary/10"
                )}>
                  {iconMap[msg.type || "info"]}
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-4 py-2.5 whitespace-pre-wrap leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : cn("border", bgMap[msg.type || "info"])
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {analyzing && (
            <div className="flex gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="rounded-xl border bg-muted/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Analizando tu problema...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEnd} />
        </div>

        {!done ? (
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ej: No enciende mi laptop..."
                disabled={analyzing}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={analyzing || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t p-4 space-y-2">
            {result?.complexity === "SIMPLE" && (
              <Button className="w-full" variant="outline" onClick={handleContinue}>
                <Wrench className="mr-2 h-4 w-4" />
                Ya lo resolví
              </Button>
            )}
            {(result?.complexity === "MEDIUM" || result?.complexity === "SIMPLE") && (
              <Button className="w-full" onClick={handleContinue}>
                <Sparkles className="mr-2 h-4 w-4" />
                {result?.complexity === "SIMPLE" ? "Crear ticket de todas formas" : "Crear ticket gratuito"}
              </Button>
            )}
            {result?.complexity === "COMPLEX" && (
              <>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white" onClick={handleContinue}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Activar Ticket Exprés - S/ {(SLA_PREMIUM_PRICE / 100).toFixed(2)}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleContinue}>
                  Crear ticket normal (sin prioridad)
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={onBack}>
              Volver atrás
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
