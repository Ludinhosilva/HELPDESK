"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bot, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { AITriage } from "@/components/ai-triage";
import { PaymentModal } from "@/components/ui/payment-modal";
import { SLA_PREMIUM_PRICE } from "@/lib/sla";

interface TriageResult {
  complexity: string;
  category: string;
  categoryConfidence?: number;
  solution: string | null;
  requiresPayment: boolean;
  reason: string;
  suggestedAction: string;
  estimatedCost: number;
  priorityOverride: string | null;
  priorityReason?: string;
  classification?: {
    diagnosis: string;
    suggestedSteps: string[];
    priority: string;
    urgency: string;
  };
}

const complexityColors: Record<string, string> = {
  SIMPLE: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLEX: "bg-red-100 text-red-700 border-red-200",
};

const complexityLabels: Record<string, string> = {
  SIMPLE: "Simple - Solución automática",
  MEDIUM: "Medio - Requiere técnico",
  COMPLEX: "Complejo - Requiere pago o prioridad normal",
};

export default function NewTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<"triage" | "form">("triage");
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState(0);

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "MEDIUM" as string,
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || data || []))
      .catch(() => {});
  }, []);

  function handleTriageComplete(result: TriageResult, problem: string) {
    setTriageResult(result);

    // Buscar categoryId que coincida con la categoría detectada por IA
    const matchingCategory = categories.find(
      (c) => c.name.toLowerCase() === result.category.toLowerCase()
    );

    setForm({
      title: problem.length > 80 ? problem.slice(0, 77) + "..." : problem,
      description: problem,
      categoryId: matchingCategory?.id || "",
      priority: result.priorityOverride || result.classification?.priority || "MEDIUM",
    });

    setStep("form");
  }

  function handleBackToTriage() {
    setStep("triage");
    setTriageResult(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          categoryId: form.categoryId || undefined,
          priority: form.priority,
        }),
      });

      if (res.ok) {
        const data = await res.json();

        if (triageResult?.complexity === "COMPLEX") {
          setTicketId(data.id);
          setTicketNumber(data.ticketNumber);
          setShowPayment(true);
          toast({
            type: "info",
            title: "Ticket creado",
            description: "Activa Ticket Exprés para prioridad urgente.",
          });
        } else {
          toast({ type: "success", title: "Ticket creado", description: "Tu ticket ha sido creado exitosamente" });
          router.push(`/tickets/${data.id}`);
        }
      } else {
        const err = await res.json();
        toast({ type: "error", title: "Error", description: err.message || "Error al crear el ticket" });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Ocurrió un error al crear el ticket" });
    } finally {
      setLoading(false);
    }
  }

  if (step === "triage") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/tickets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear Ticket</h1>
            <p className="text-muted-foreground text-sm">Cuéntame tu problema para analizarlo</p>
          </div>
        </div>
        <AITriage onComplete={handleTriageComplete} onBack={() => router.push("/tickets")} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBackToTriage}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Ticket</h1>
          <p className="text-muted-foreground text-sm">Confirma los detalles de tu solicitud</p>
        </div>
      </div>

      {triageResult && (
        <Card className={`border-l-4 ${triageResult.complexity === "COMPLEX" ? "border-l-red-500" : triageResult.complexity === "SIMPLE" ? "border-l-green-500" : "border-l-blue-500"}`}>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Resultado del análisis</span>
              </div>
              <Badge variant="outline" className={complexityColors[triageResult.complexity]}>
                {complexityLabels[triageResult.complexity]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{triageResult.reason}</p>
            <p className="text-xs text-muted-foreground">Categoría detectada: <span className="font-medium">{triageResult.category}</span></p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Información del Ticket</CardTitle>
          <CardDescription>Revisa y completa los detalles</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Breve descripción del problema"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu problema en detalle..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-[120px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => setForm({ ...form, categoryId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baja</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {triageResult?.complexity === "COMPLEX" && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-400">
                  <p className="font-medium">Problema complejo detectado</p>
                  <p>Si necesitas atención urgente, activa Ticket Exprés por <strong>S/ {(SLA_PREMIUM_PRICE / 100).toFixed(2)}</strong> luego de crear el ticket.</p>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {triageResult?.complexity === "COMPLEX" ? "Crear ticket" : "Crear Ticket"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {ticketId && (
        <PaymentModal
          open={showPayment}
          onOpenChange={(o) => {
            setShowPayment(o);
            if (!o) router.push(`/tickets/${ticketId}`);
          }}
          ticketId={ticketId}
          ticketNumber={ticketNumber}
        />
      )}
    </div>
  );
}
