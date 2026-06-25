"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserCircle, Plus, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Technician {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  organization: { name: string };
  _count: { assignedTickets: number };
}

export default function TechniciansPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [inviting, setInviting] = useState(false);

  async function loadTechnicians() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support/technicians");
      if (res.ok) {
        const data = await res.json();
        setTechnicians(data.technicians);
      }
    } catch {
      toast({ type: "error", title: "Error", description: "No se pudieron cargar los técnicos" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTechnicians(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const res = await fetch("/api/admin/support/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast({ type: "success", title: "Técnico creado", description: `${formData.name} ha sido agregado al equipo` });
        setInviteOpen(false);
        setFormData({ name: "", email: "", password: "" });
        loadTechnicians();
      } else {
        const err = await res.json();
        toast({ type: "error", title: "Error", description: err.message || "Error al crear técnico" });
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al crear técnico" });
    } finally {
      setInviting(false);
    }
  }

  async function handleToggleActive(techId: string, currentActive: boolean) {
    try {
      const res = await fetch(`/api/users/${techId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        toast({ type: "success", title: currentActive ? "Técnico desactivado" : "Técnico activado" });
        loadTechnicians();
      }
    } catch {
      toast({ type: "error", title: "Error", description: "Error al actualizar técnico" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/super-admin/support")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestionar Técnicos</h1>
            <p className="text-muted-foreground text-sm">
              Equipo de soporte de FlixSupport &middot; {technicians.length} técnicos
            </p>
          </div>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Invitar Técnico
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invitar Nuevo Técnico</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  placeholder="Ej: Carlos Lopez"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="carlos@flixsupport.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={inviting}>
                {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {inviting ? "Creando..." : "Crear Técnico"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-purple-500" />
            Técnicos de FlixSupport
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : technicians.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <UserCircle className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No hay técnicos en el equipo</p>
              <Button variant="outline" size="sm" onClick={() => setInviteOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Invitar primer técnico
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tickets Activos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[100px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((tech) => (
                    <TableRow key={tech.id}>
                      <TableCell className="font-medium">{tech.name}</TableCell>
                      <TableCell className="text-muted-foreground">{tech.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tech._count.assignedTickets > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100"}>
                          {tech._count.assignedTickets}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={tech.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                          {tech.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleToggleActive(tech.id, tech.isActive)}
                        >
                          {tech.isActive ? "Desactivar" : "Activar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
