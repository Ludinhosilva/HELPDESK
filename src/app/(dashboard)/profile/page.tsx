"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/ui/role-badge";
import { User, Check, Lock, ArrowLeft } from "lucide-react";
import { apiClient } from "@/core/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  organization: { id: string; name: string; slug: string };
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      const res = await apiClient<UserProfile>("/profile");
      setProfile(res);
      setName(res.name);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleUpdateName() {
    setSavingName(true);
    setNameSaved(false);
    setError("");
    try {
      await apiClient("/profile", { method: "PATCH", body: { name } });
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSavingName(false);
    }
  }

  async function handleChangePassword() {
    setSavingPassword(true);
    setPasswordSaved(false);
    setError("");
    try {
      await apiClient("/profile", {
        method: "PATCH",
        body: { currentPassword, newPassword },
      });
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="grid gap-6 lg:grid-cols-2"><div className="space-y-4"><Skeleton className="h-40 rounded-lg" /><Skeleton className="h-48 rounded-lg" /></div></div></div>;
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground text-sm">
          Administra tu informacion personal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informacion Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <div>
                <RoleBadge role={profile.role} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Organizacion</Label>
            <p className="text-sm">{profile.organization.name}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button onClick={handleUpdateName} disabled={savingName}>
                {savingName ? "Guardando..." : nameSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Guardado
                  </>
                ) : "Actualizar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña de acceso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleChangePassword} disabled={savingPassword}>
            {savingPassword ? "Cambiando..." : passwordSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Contraseña Actualizada
              </>
            ) : "Cambiar Contraseña"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
