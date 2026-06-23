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
import { Badge } from "@/components/ui/badge";
import { Building, Check, ArrowLeft } from "lucide-react";
import { apiClient } from "@/core/api-client";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
  planStatus: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadOrg = useCallback(async () => {
    try {
      const res = await apiClient<OrgInfo>("/profile");
      const orgData = (res as unknown as { organization: OrgInfo }).organization;
      if (orgData) {
        setOrg(orgData);
        setOrgName(orgData.name);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrg();
  }, [loadOrg]);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await apiClient("/profile", {
        method: "PATCH",
        body: { name: orgName },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="space-y-6"><Skeleton className="h-8 w-48" /><div className="max-w-xl space-y-4"><Skeleton className="h-48 rounded-lg" /></div></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Configuracion</h1>
        <p className="text-muted-foreground text-sm">
          Administra la configuracion de tu organizacion
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Informacion de la Organizacion
          </CardTitle>
          <CardDescription>
            Datos generales de tu empresa o taller
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Nombre de la Organizacion</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Nombre de tu organizacion"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input value={org?.slug || ""} disabled />
          </div>

          <div className="space-y-2">
            <Label>Estado del Plan</Label>
            <div>
              <Badge variant={org?.planStatus === "ACTIVE" ? "default" : "secondary"}>
                {org?.planStatus === "ACTIVE" ? "Activo" : org?.planStatus || "Sin plan"}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fecha de Registro</Label>
            <p className="text-sm text-muted-foreground">
              {org?.createdAt ? new Date(org.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardado
                </>
              ) : "Guardar Cambios"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
