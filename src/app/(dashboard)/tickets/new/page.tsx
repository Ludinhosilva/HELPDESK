"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { ArrowLeft, Bot, Loader2, Lightbulb, AlertTriangle, Search } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { classifyTicket } from "@/lib/ai";

export default function NewTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [similarTickets, setSimilarTickets] = useState<{ id: string; title: string; similarity: number; category: string }[]>([]);
  const [sentimentAlert, setSentimentAlert] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || data || []))
      .catch(() => {});
  }, []);

  const doAIAnalysis = useCallback(async (title: string, description: string) => {
    if (!title || title.length < 5 || !description || description.length < 10) {
      setAiSuggestion(null);
      setSimilarTickets([]);
      setSentimentAlert(null);
      return;
    }

    setAiLoading(true);

    // Category suggestion (client-side)
    const category = classifyTicket(title, description);
    const catMap: Record<string, string> = {
      hardware: "Hardware", software: "Software", red: "Red", accesos: "Accesos", otros: "Otros",
    };
    setAiSuggestion(catMap[category] || category);

    // Sentiment analysis
    try {
      const sentRes = await fetch("/api/ai/sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const sentData = await sentRes.json();
      if (sentData.sentiment && sentData.sentiment.level !== "CALM") {
        const labels: Record<string, string> = {
          FRUSTRATED: "Detectamos frustracion en tu solicitud. La prioridad sera ajustada.",
          CRITICAL: "Situacion critica detectada. La prioridad se cambiara a URGENTE.",
        };
        setSentimentAlert(sentData.sentiment.level ? labels[sentData.sentiment.level] : null);
        if (sentData.priorityOverride) {
          setForm((prev) => ({ ...prev, priority: sentData.priorityOverride }));
        }
      } else {
        setSentimentAlert(null);
      }
    } catch {
      // ignore
    }

    // Search similar tickets
    try {
      const simRes = await fetch("/api/ai/search-similar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (simRes.ok) {
        const simData = await simRes.json();
        setSimilarTickets(simData.results || []);
      }
    } catch {
      // ignore
    }

    setAiLoading(false);
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      doAIAnalysis(form.title, form.description);
    }, 800);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [form.title, form.description, doAIAnalysis]);

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
        toast({ type: "success", title: "Ticket creado", description: "Tu ticket ha sido creado exitosamente" });
        router.push(`/tickets/${data.id}`);
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
          <p className="text-muted-foreground text-sm">Envía una nueva solicitud de soporte</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Ticket</CardTitle>
          <CardDescription>Completa los detalles de tu solicitud de soporte</CardDescription>
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

            {aiLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analizando ticket para sugerir categoría...
              </div>
            )}

            {aiSuggestion && !aiLoading && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
                <Bot className="h-4 w-4 text-primary shrink-0" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Categoría sugerida: </span>
                  <span className="font-medium text-foreground">{aiSuggestion}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => {
                    const cat = categories.find(
                      (c) => c.name.toLowerCase() === aiSuggestion.toLowerCase()
                    );
                    if (cat) setForm({ ...form, categoryId: cat.id });
                  }}
                >
                  Aplicar
                </Button>
              </div>
            )}

            {sentimentAlert && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{sentimentAlert}</p>
              </div>
            )}

            {similarTickets.length > 0 && (
              <div className="rounded-lg border bg-card">
                <div className="flex items-center gap-2 p-3 border-b">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tickets similares resueltos</span>
                </div>
                <div className="divide-y">
                  {similarTickets.slice(0, 3).map((st) => (
                    <div key={st.id} className="flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <Lightbulb className="h-3 w-3 text-yellow-500 shrink-0" />
                        <span className="truncate">{st.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {st.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(st.similarity * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear Ticket"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
