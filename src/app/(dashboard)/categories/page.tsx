"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Pencil, Tags, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/core/api-client";
import { useToast } from "@/components/ui/toast";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    tickets: number;
    knowledgeArticles: number;
  };
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient<{ categories: Category[] }>("/categories");
      setCategories(res.categories);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  function openCreate() {
    setEditingId(null);
    setFormData({ name: "", slug: "" });
    setError("");
    setDialogOpen(true);
  }

  function openEdit(cat: Category) {
    setEditingId(cat.id);
    setFormData({ name: cat.name, slug: cat.slug });
    setError("");
    setDialogOpen(true);
  }

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await apiClient(`/categories/${editingId}`, {
          method: "PATCH",
          body: formData,
        });
      } else {
        await apiClient("/categories", { method: "POST", body: formData });
      }
      setDialogOpen(false);
      toast({ type: "success", title: editingId ? "Categoría actualizada" : "Categoría creada" });
      await loadCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Eliminar esta categoria?")) return;
    try {
      await apiClient(`/categories/${id}`, { method: "DELETE" });
      toast({ type: "success", title: "Categoría eliminada" });
      await loadCategories();
    } catch (err) {
      toast({ type: "error", title: "Error", description: err instanceof Error ? err.message : "Error al eliminar" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="text-muted-foreground text-sm">
            Organiza tus tickets y articulos por categorias
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Categoria
        </Button>
      </div>

      <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Articulos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-4">
                    <TableSkeleton rows={4} cols={5} />
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Tags className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No hay categor&iacute;as creadas</p>
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cat.slug}</Badge>
                    </TableCell>
                    <TableCell>{cat._count.tickets}</TableCell>
                    <TableCell>{cat._count.knowledgeArticles}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Categoria" : "Nueva Categoria"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                placeholder="Ej: Hardware, Software, Redes..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                placeholder="Ej: hardware, software, redes..."
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Guardando..." : editingId ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
