"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, Sparkles, Wrench, Loader2, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "bot" | "user";
  text: string;
  type?: "solution" | "payment_required" | "info" | "question" | "success" | "analysis" | "action";
  options?: Array<{ label: string; value: string }>;
}

interface TriageResult {
  complexity: string;
  category: string;
  categoryConfidence: number;
  solution: string | null;
  requiresPayment: boolean;
  reason: string;
  suggestedAction: string;
  estimatedCost: number;
  priorityOverride: string | null;
  priorityReason: string;
  classification?: {
    diagnosis: string;
    suggestedSteps: string[];
    priority: string;
    urgency: string;
    estimatedTime: string;
  };
}

interface DiagnosticState {
  step: number;
  symptom: string;
  responses: Record<string, string>;
  resolved: boolean;
  nextQuestion: string | null;
  conclusion: string | null;
  suggestedActions: string[];
  currentNode?: string;
  lastNode?: string;
}

interface AITriageProps {
  onComplete: (result: TriageResult, problem: string) => void;
  onBack?: () => void;
}

const BOT_GREETING = "¡Hola! Soy el asistente inteligente de Flix Support. Puedo ayudarte a diagnosticar y resolver tu problema antes de crear un ticket. Describe qué sucede:";

export function AITriage({ onComplete }: AITriageProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: BOT_GREETING, type: "info" },
  ]);
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [diagnosticState, setDiagnosticState] = useState<DiagnosticState | null>(null);
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
  }

  async function handleSend() {
    if (!input.trim() || analyzing) return;

    const userText = input.trim();
    setInput("");
    addMessage({ role: "user", text: userText });
    setAnalyzing(true);

    // Si estamos en modo diagnóstico, enviar respuesta al flujo
    if (diagnosticMode && diagnosticState) {
      await handleDiagnosticResponse(userText);
      return;
    }

    try {
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userText, mode: "triage" }),
      });

      if (res.status === 403) {
        const d = await res.json();
        addMessage({ role: "bot", text: d.message || "Límite de IA alcanzado. Actualiza tu plan.", type: "payment_required" });
        return;
      }

      const data = await res.json();

      if (data.error) {
        addMessage({ role: "bot", text: data.error, type: "info" });
        return;
      }

      const triageResult = data as TriageResult;

      // Badge indicando el motor de IA
      const isGroq = data.aiProvider === "groq";
      const providerBadge = isGroq
        ? "🤖 **IA: Groq / Llama 3.1** — Análisis inteligente en tiempo real"
        : "📋 **IA: Motor de reglas** — Análisis basado en patrones";

      // Mostrar análisis detallado
      const analysisLines: string[] = [];
      analysisLines.push(providerBadge);
      analysisLines.push("");
      analysisLines.push(`🔍 **Análisis**: He detectado un problema de tipo **${triageResult.category.toUpperCase()}** (${Math.round((triageResult.categoryConfidence || 0.7) * 100)}% de confianza).`);

      if (data.classification?.diagnosis) {
        analysisLines.push("");
        analysisLines.push(`📋 **Diagnóstico**: ${data.classification.diagnosis}`);
      }

      if (data.classification?.urgency) {
        analysisLines.push(`🔴 **Urgencia**: ${data.classification.urgency.toUpperCase()}`);
      }

      if (data.classification?.estimatedTime) {
        analysisLines.push(`⏱️ **Tiempo estimado**: ${data.classification.estimatedTime}`);
      }

      analysisLines.push("");
      analysisLines.push(data.suggestedAction);

      addMessage({ role: "bot", text: analysisLines.join("\n"), type: "analysis" });

      // Si es simple y tiene solución, ofrecer seguir los pasos
      if (triageResult.complexity === "SIMPLE" && triageResult.solution) {
        addMessage({
          role: "bot",
          text: `💡 **Solución sugerida**:\n${triageResult.solution}`,
          type: "solution",
        });
      }

      // Ofrecer diagnóstico interactivo o crear ticket
      setResult(triageResult);
      setDone(true);
    } catch {
      addMessage({ role: "bot", text: "Error al analizar tu problema. Intenta de nuevo.", type: "info" });
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleDiagnosticResponse(answer: string) {
    if (!diagnosticState) return;

    // Enviar respuesta del usuario al diagnóstico
    const currentNode = diagnosticState.currentNode || "start";
    const res = await fetch("/api/ai/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: diagnosticState.symptom,
        mode: "diagnostic",
        diagnosticState: { ...diagnosticState, currentNode, lastNode: currentNode },
        diagnosticAnswer: answer,
      }),
    });

    if (!res.ok) {
      addMessage({ role: "bot", text: "Error en el diagnóstico. Intenta de nuevo.", type: "info" });
      setAnalyzing(false);
      return;
    }

    const data = await res.json();

    if (data.resolved) {
      if (data.createTicket && data.triage) {
        // El diagnóstico dice que necesita ticket
        addMessage({
          role: "bot",
          text: `✅ **Diagnóstico completado**\n\n${data.conclusion || "Se requiere crear un ticket de soporte."}\n\n${data.suggestedActions?.join("\n") || ""}`,
          type: "success",
        });
        setResult(data.triage as TriageResult);
        setDone(true);
        setDiagnosticMode(false);
      } else {
        // Problema resuelto
        addMessage({
          role: "bot",
          text: `✅ **${data.conclusion || "Problema resuelto"}**\n\n${data.suggestedActions?.join("\n") || ""}`,
          type: "success",
        });
        setDone(true);
        setDiagnosticMode(false);
      }
    } else if (data.question) {
      // Siguiente pregunta del diagnóstico
      // Obtener opciones para el siguiente nodo
      const nextNode = data.state.lastNode || "start";
      const optionsRes = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: diagnosticState.symptom,
          mode: "diagnostic",
          diagnosticState: {
            step: data.state.step,
            symptom: diagnosticState.symptom,
            responses: data.state.responses,
            resolved: false,
            nextQuestion: data.question,
            conclusion: null,
            suggestedActions: [],
            currentNode: nextNode,
          },
          diagnosticAnswer: "__get_options__",
        }),
      }).catch(() => null);

      let options: Array<{ label: string; value: string }> = [];
      if (optionsRes?.ok) {
        try {
          // Extraer opciones del diagnostic tree para este nodo
          const diagModule = await import("@/lib/ai/diagnostic");
          options = diagModule.getDiagnosticOptions(nextNode).map(o => ({ label: o.label, value: o.value }));
        } catch { /* fallback */ }
      }

      // Si no hay opciones, usar las sugerencias como texto
      const actionText = data.suggestedActions?.join("\n") || "";
      if (actionText) {
        addMessage({ role: "bot", text: actionText, type: "action" });
      }

      addMessage({
        role: "bot",
        text: data.question,
        type: "question",
        options: options.length > 0 ? options : undefined,
      });

      setDiagnosticState(data.state);
    }
    setAnalyzing(false);
  }

  function handleOptionClick(option: { label: string; value: string }) {
    if (analyzing) return;
    addMessage({ role: "user", text: option.label });
    setAnalyzing(true);
    handleDiagnosticResponse(option.value);
  }

  function startDiagnosticFlow() {
    if (!result) return;
    setDiagnosticMode(true);
    setDone(false);

    // Iniciar diagnóstico
    const init = async () => {
      setAnalyzing(true);
      const res = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Problema: ${result.category}. ${result.reason}`,
          mode: "diagnostic",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.question) {
          addMessage({
            role: "bot",
            text: `Vamos paso a paso para resolver tu problema.\n\n${data.question}`,
            type: "question",
          });

          // Obtener opciones
          let options: Array<{ label: string; value: string }> = [];
          try {
            const diagModule = await import("@/lib/ai/diagnostic");
            options = diagModule.getDiagnosticOptions("start").map(o => ({ label: o.label, value: o.value }));
          } catch { /* fallback */ }

          setDiagnosticState({
            step: data.state?.step || 1,
            symptom: `Problema: ${result.category}`,
            responses: {},
            resolved: false,
            nextQuestion: data.question,
            conclusion: null,
            suggestedActions: data.suggestedActions || [],
          });

          if (options.length > 0) {
            setMessages(prev => [...prev, {
              role: "bot",
              text: "",
              type: "question",
              options,
            }]);
          }
        }
      }
      setAnalyzing(false);
    };
    init();
  }

  return (
    <Card className="flex flex-col h-[calc(100dvh-13rem)] sm:h-[550px]">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Asistente IA — Diagnóstico Inteligente
        </CardTitle>
        {diagnosticMode && (
          <p className="text-xs text-muted-foreground">Modo diagnóstico interactivo — responde las preguntas para resolver tu problema</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role === "bot" && (
                <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : m.type === "solution"
                    ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-foreground rounded-bl-md"
                    : m.type === "payment_required"
                    ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-foreground rounded-bl-md"
                    : m.type === "success"
                    ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-foreground rounded-bl-md"
                    : m.type === "analysis"
                    ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-foreground rounded-bl-md"
                    : m.type === "action"
                    ? "bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-foreground rounded-bl-md"
                    : "bg-muted border border-border/50 text-foreground rounded-bl-md"
                )}
              >
                {m.text.split("\n").map((line, j) => (
                  <span key={j}>
                    {line.startsWith("**") && line.endsWith("**") ? (
                      <strong>{line.replace(/\*\*/g, "")}</strong>
                    ) : (
                      line
                    )}
                    {j < m.text.split("\n").length - 1 && <br />}
                  </span>
                ))}

                {/* Opciones clickeables para diagnóstico interactivo */}
                {m.options && m.options.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    {m.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleOptionClick(opt)}
                        disabled={analyzing}
                        className="text-left text-xs bg-background hover:bg-accent border border-border rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {analyzing && (
            <div className="flex gap-2 justify-start">
              <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="bg-muted border border-border/50 rounded-2xl rounded-bl-md px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>

        <div className="border-t border-border p-3 sm:p-4 shrink-0 space-y-2 bg-card/50">
          {!done && !diagnosticMode && (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={analyzing ? "Analizando tu problema..." : "Describe tu problema de TI..."}
                disabled={analyzing}
                className="flex-1 h-11"
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={analyzing || !input.trim()}>
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          )}

          {diagnosticMode && !done && (
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tu respuesta..."
                disabled={analyzing}
                className="flex-1 h-11"
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={analyzing || !input.trim()}>
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}

          {done && result && !diagnosticMode && (
            <div className="flex flex-col sm:flex-row gap-2">
              {result.complexity === "SIMPLE" && result.solution && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={startDiagnosticFlow}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Diagnóstico paso a paso
                </Button>
              )}
              {result.complexity === "SIMPLE" && result.solution && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setDone(false)}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  Preguntar otra cosa
                </Button>
              )}
              {result.complexity !== "SIMPLE" && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => onComplete(result, `Problema de ${result.category}: ${result.reason}`)}
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  Crear ticket de soporte
                </Button>
              )}
              {result.requiresPayment && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => onComplete(result, `Ticket Exprés: ${result.reason}`)}
                >
                  <Sparkles className="mr-2 h-4 w-4 text-amber-400" />
                  Ticket Exprés — S/{(result.estimatedCost / 100).toFixed(2)}
                </Button>
              )}
            </div>
          )}

          {done && diagnosticMode && result && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onComplete(result, `Problema: ${result.reason}`)}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Crear ticket de soporte
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
