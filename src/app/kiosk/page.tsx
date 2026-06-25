"use client";

import { useState, useEffect, useCallback } from "react";
import { WifiOff, Printer, Gauge, Lock, Monitor, HelpCircle, CheckCircle2, Loader2, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Step = "idle" | "scanning" | "done" | "error";

const issues = [
  { label: "No tengo internet", icon: WifiOff },
  { label: "Impresora no responde", icon: Printer },
  { label: "Mi PC está lenta", icon: Gauge },
  { label: "No puedo entrar al sistema", icon: Lock },
  { label: "Pantalla en negro", icon: Monitor },
  { label: "Otro problema", icon: HelpCircle },
];

const scanMessages = [
  "Conectando con FlixSupport...",
  "Analizando tu equipo...",
  "Clasificando el problema...",
  "Generando reporte exprés...",
];

export default function KioskPage() {
  const [step, setStep] = useState<Step>("idle");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [scanIndex, setScanIndex] = useState(0);
  const [error, setError] = useState("");

  // Rotar mensajes durante scanning
  useEffect(() => {
    if (step !== "scanning") return;
    setScanIndex(0);
    const interval = setInterval(() => {
      setScanIndex((prev) => (prev + 1) % scanMessages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  // Reset
  const reset = useCallback(() => {
    setStep("idle");
    setSelectedIssue("");
    setTicketId("");
    setScanIndex(0);
    setError("");
  }, []);

  // Auto-reset después de 8 segundos en done
  useEffect(() => {
    if (step !== "done") return;
    const timeout = setTimeout(reset, 8000);
    return () => clearTimeout(timeout);
  }, [step, reset]);

  // Flujo principal
  const handleIssueSelect = async (label: string) => {
    setStep("scanning");
    setSelectedIssue(label);

    const title = label;
    const description = `El usuario reporta desde el kiosko: ${label}`;

    // Timer de 4 segundos + fetch en paralelo
    const timerPromise = new Promise<void>((resolve) => setTimeout(resolve, 4000));

    const triagePromise = fetch("/api/ai/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `${title}. ${description}` }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error de IA" }));
        if (err.upsell) throw new Error("Límite de IA alcanzado");
        throw new Error(err.error || "Error de triage");
      }
      return res.json();
    });

    try {
      const [, triage] = await Promise.all([timerPromise, triagePromise]);

      // Crear ticket
      const ticketRes = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Ticket Kiosko: ${label}`,
          description: `Generado automáticamente desde Kiosko FlixSupport.\n\nProblema: ${label}\n\nCategoría sugerida por IA: ${triage.category}\nSentimiento: ${triage.sentiment?.level || "N/A"}`,
          priority: triage.priorityOverride || triage.priority || "MEDIUM",
        }),
      });

      if (!ticketRes.ok) {
        throw new Error("Error al crear ticket");
      }

      const ticket = await ticketRes.json();
      setTicketId(ticket.ticketNumber?.toString() || ticket.id);
      setStep("done");
    } catch (err) {
      console.error("Kiosk error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setStep("error");
    }
  };

  // ============================
  // RENDER: Estado IDLE (6 botones)
  // ============================
  if (step === "idle") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-10 w-10 text-blue-500" />
            <h1 className="text-4xl font-bold text-white tracking-tight">FlixSupport</h1>
          </div>
          <p className="text-xl text-zinc-400">¿Qué problema tienes hoy?</p>
        </div>

        {/* Grid de problemas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full">
          {issues.map((issue) => (
            <button
              key={issue.label}
              onClick={() => handleIssueSelect(issue.label)}
              className="flex flex-col items-center justify-center gap-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-200 hover:scale-105 cursor-pointer group"
            >
              <issue.icon className="h-16 w-16 text-zinc-300 group-hover:text-blue-400 transition-colors" />
              <span className="text-lg font-medium text-zinc-200 group-hover:text-white text-center">
                {issue.label}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  // ============================
  // RENDER: Estado SCANNING (animación)
  // ============================
  if (step === "scanning") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        {/* Círculo pulsante */}
        <div className="relative mb-10">
          <div className="absolute inset-0 w-32 h-32 bg-blue-500 rounded-full animate-ping opacity-20" />
          <div className="relative w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-blue-400 animate-spin" />
          </div>
        </div>

        {/* Mensaje rotativo */}
        <p className="text-xl text-zinc-300 font-mono h-8 transition-opacity duration-300">
          {scanMessages[scanIndex]}
        </p>

        {/* Barra de progreso */}
        <div className="mt-8 w-80 max-w-full">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-[progress_4s_ease-in-out]" />
          </div>
          <p className="text-sm text-zinc-500 mt-3 text-center">{selectedIssue}</p>
        </div>

        {/* Keyframes inline para la barra */}
        <style jsx>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ============================
  // RENDER: Estado DONE (éxito)
  // ============================
  if (step === "done") {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        {/* Check animado */}
        <div className="mb-8 animate-[scaleIn_0.5s_ease-out]">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-green-400" />
          </div>
        </div>

        {/* Mensajes */}
        <h2 className="text-3xl font-bold text-white mb-3">¡Reporte enviado!</h2>
        <p className="text-lg text-zinc-400 mb-6">FlixSupport detectó tu problema automáticamente.</p>

        {/* Badge del ticket */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-full px-6 py-3 mb-6">
          <span className="text-xl font-mono font-bold text-blue-400">Ticket #{ticketId}</span>
        </div>

        <p className="text-sm text-zinc-500 mb-10">Un técnico está siendo notificado ahora mismo.</p>

        {/* Botón nuevo reporte */}
        <button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-colors"
        >
          Nuevo reporte
        </button>

        {/* Keyframes para scaleIn */}
        <style jsx>{`
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ============================
  // RENDER: Estado ERROR
  // ============================
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">Error de conexión</h2>
        <p className="text-zinc-400 mb-2">{error}</p>
        <p className="text-sm text-zinc-500 mb-8">Llama al técnico o intenta de nuevo.</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleIssueSelect(selectedIssue)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={reset}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
