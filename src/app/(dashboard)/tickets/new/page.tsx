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
import { ArrowLeft, Bot, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

export default function NewTicketPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

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

  useEffect(() => {
    if (!form.title || form.title.length < 5 || !form.description || form.description.length < 10) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(() => {
      setAiLoading(true);
      fetch("/api/ai/suggest-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, description: form.description }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.category) setAiSuggestion(data.category);
        })
        .catch(() => {})
        .finally(() => setAiLoading(false));
    }, 1000);

    return () => clearTimeout(timer);
  }, [form.title, form.description]);

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
