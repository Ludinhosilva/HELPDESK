"use client";

import { useState, useEffect, useCallback } from "react";
import { WifiOff, Printer, Gauge, Lock, Monitor, HelpCircle, CheckCircle2, Loader2, Zap, ArrowLeft, LogIn } from "lucide-react";
import Link from "next/link";

type Step = "idle" | "scanning" | "done" | "error" | "login_required";

const issues = [
  { label: "No tengo internet", icon: WifiOff },
  { label: "Impresora no responde", icon: Printer },
  { label: "Mi PC está lenta", icon: Gauge },
  { label: "No puedo entrar al sistema", icon: Lock },
  { label: "Pantalla en negro", icon: Monitor },
  { label: "Otro problema", icon: HelpCircle },
];

export default function KioskPage() {
  const [step, setStep] = useState<Step>("idle");
  const [selectedIssue, setSelectedIssue] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState("");
  const [error, setError] = useState("");

  // Reset
  const reset = useCallback(() => {
    setStep("idle");
    setSelectedIssue("");
    setTicketId("");
    setScanProgress(0);
    setScanMessage("");
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
    // Verificar autenticacion antes de proceder
    setSelectedIssue(label);
    setScanProgress(0);
    setScanMessage("Verificando sesión...");

    try {
      const authCheck = await fetch("/api/profile", { method: "HEAD" });
      if (!authCheck.ok) {
        setStep("login_required");
        return;
      }
    } catch {
      setStep("login_required");
      return;
    }

    setStep("scanning");
    setScanProgress(0);
    setScanMessage("Conectando con FlixSupport...");

    const title = label;
    const description = `El usuario reporta desde el kiosko: ${label}`;

    try {
      // Paso 1: Analizar con IA (25% de progreso)
      setScanMessage("Analizando con IA...");
      setScanProgress(25);

      const triageRes = await fetch("/api/ai/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `${title}. ${description}` }),
      });

      if (!triageRes.ok) {
        if (triageRes.status === 401) throw new Error("Sesión expirada. Por favor inicia sesión nuevamente.");
        const err = await triageRes.json().catch(() => ({ error: "Error de IA" }));
        if (err.upsell) throw new Error("Límite de IA alcanzado. Contacta al administrador.");
        throw new Error(err.error || "Error al analizar el problema");
      }

      const triage = await triageRes.json();

      // Buscar categoryId que coincida con la categoría detectada por IA
      let categoryId: string | undefined;
      try {
        const catRes = await fetch("/api/categories");
        if (catRes.ok) {
          const catData = await catRes.json();
          const categories: Array<{ id: string; name: string; slug: string }> = catData.categories || [];
          const matched = categories.find(
            (c) => c.name.toLowerCase() === (triage.category || "").toLowerCase()
          );
          if (matched) categoryId = matched.id;
        }
      } catch { /* ignore - optional */ }

      // Paso 2: Crear ticket (50% de progreso)
      setScanMessage("Creando ticket...");
      setScanProgress(50);

      const ticketRes = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Ticket Kiosko: ${label}`,
          description: `Generado automáticamente desde Kiosko FlixSupport.\n\nProblema: ${label}\n\nCategoría sugerida por IA: ${triage.category}\nPrioridad: ${triage.priority || "MEDIUM"}\nSentimiento: ${triage.sentiment?.level || "N/A"}`,
          priority: triage.priorityOverride || triage.priority || "MEDIUM",
          categoryId: categoryId || undefined,
        }),
      });

      // Progreso intermedio
      setScanMessage("Registrando en el sistema...");
      setScanProgress(75);

      if (!ticketRes.ok) {
        if (ticketRes.status === 401) throw new Error("Sesión expirada. Inicia sesión nuevamente.");
        throw new Error("Error al crear el ticket");
      }

      const ticket = await ticketRes.json();

      // Paso 3: Completado (100%)
      setScanMessage("Ticket creado exitosamente");
      setScanProgress(100);
      setTicketId(ticket.ticketNumber?.toString() || ticket.id);

      // Pequeña pausa para mostrar el 100%
      await new Promise((r) => setTimeout(r, 600));
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
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="h-10 w-10 text-blue-600 dark:text-blue-500" />
            <h1 className="text-4xl font-bold text-foreground tracking-tight">FlixSupport</h1>
          </div>
          <p className="text-xl text-muted-foreground">¿Qué problema tienes hoy?</p>
        </div>

        {/* Grid de problemas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full">
          {issues.map((issue) => (
            <button
              key={issue.label}
              onClick={() => handleIssueSelect(issue.label)}
              className="flex flex-col items-center justify-center gap-4 bg-card hover:bg-accent border border-border hover:border-blue-500/50 rounded-2xl p-8 transition-all duration-200 hover:scale-105 cursor-pointer group shadow-sm hover:shadow-lg"
            >
              <issue.icon className="h-16 w-16 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              <span className="text-lg font-medium text-foreground text-center">
                {issue.label}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // ============================
  // RENDER: Estado SCANNING (progreso real)
  // ============================
  if (step === "scanning") {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-6">
        {/* Círculo pulsante con spinner */}
        <div className="relative mb-10">
          <div className="absolute inset-0 w-32 h-32 bg-blue-500 rounded-full animate-ping opacity-20" />
          <div className="relative w-32 h-32 bg-blue-500/20 rounded-full flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          </div>
        </div>

        {/* Mensaje de progreso real */}
        <p className="text-xl text-foreground font-mono h-8 text-center">
          {scanMessage}
        </p>

        {/* Barra de progreso real */}
        <div className="mt-8 w-80 max-w-full">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {selectedIssue}
          </p>
        </div>
      </div>
    );
  }

  // ============================
  // RENDER: Estado DONE (éxito)
  // ============================
  if (step === "done") {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-6">
        {/* Check animado */}
        <div className="mb-8 animate-[scaleIn_0.5s_ease-out]">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
          </div>
        </div>

        {/* Mensajes */}
        <h2 className="text-3xl font-bold text-foreground mb-3">¡Reporte enviado!</h2>
        <p className="text-lg text-muted-foreground mb-6">FlixSupport detectó tu problema automáticamente.</p>

        {/* Badge del ticket */}
        <div className="bg-card border border-border rounded-full px-6 py-3 mb-6 shadow-sm">
          <span className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400">Ticket #{ticketId}</span>
        </div>

        <p className="text-sm text-muted-foreground/70 mb-10">Un técnico está siendo notificado ahora mismo.</p>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/25"
          >
            Nuevo reporte
          </button>
        </div>

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
  // RENDER: Estado LOGIN_REQUIRED
  // ============================
  if (step === "login_required") {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="mb-8">
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
              <LogIn className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-3">Inicia sesión para continuar</h2>
          <p className="text-muted-foreground mb-2">Necesitas estar autenticado para crear un ticket desde el kiosko.</p>
          <p className="text-sm text-muted-foreground/70 mb-8">
            Es rápido y te permitirá dar seguimiento a tu reporte.
          </p>

          <div className="flex gap-3 justify-center">
            <Link
              href="/login?redirect=/kiosk"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-8 py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/25"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
            <button
              onClick={reset}
              className="bg-card hover:bg-accent border border-border text-foreground font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // RENDER: Estado ERROR
  // ============================
  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-sky-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-3">Error de conexión</h2>
        <p className="text-muted-foreground mb-2">{error}</p>
        <p className="text-sm text-muted-foreground/70 mb-8">Llama al técnico o intenta de nuevo.</p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => handleIssueSelect(selectedIssue || issues[0].label)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/25"
          >
            Reintentar
          </button>
          <button
            onClick={reset}
            className="bg-card hover:bg-accent border border-border text-foreground font-medium px-6 py-3 rounded-xl transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
