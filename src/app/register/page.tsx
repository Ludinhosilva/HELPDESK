"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, ArrowLeft, Building2, UserCircle } from "lucide-react";

type RegisterType = "COMPANY" | "PERSONAL";

export default function RegisterPage() {
  const router = useRouter();
  const [registerType, setRegisterType] = useState<RegisterType>("COMPANY");
  const [orgName, setOrgName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body: Record<string, string> = { name, email, password };
      if (registerType === "COMPANY") {
        body.orgName = orgName;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Error al registrar");
        return;
      }
      router.push("/login");
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-4 py-8">
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Wrench className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Registrate en Flix Support</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* Toggle Empresa / Individual */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setRegisterType("COMPANY")}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  registerType === "COMPANY"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Empresa
              </button>
              <button
                type="button"
                onClick={() => setRegisterType("PERSONAL")}
                className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  registerType === "PERSONAL"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCircle className="h-4 w-4 shrink-0" />
                <span className="text-xs sm:text-sm truncate">Usuario Individual</span>
              </button>
            </div>

            {/* Nombre de empresa (solo si COMPANY) */}
            {registerType === "COMPANY" && (
              <div className="space-y-2">
                <Label htmlFor="orgName">Nombre de la empresa</Label>
                <Input id="orgName" placeholder="TechCorp S.A.C." value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
              </div>
            )}

            {/* Nombre del usuario */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {registerType === "COMPANY" ? "Tu nombre" : "Tu nombre completo"}
              </Label>
              <Input id="name" placeholder="Juan Perez" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input id="email" type="email" placeholder={registerType === "COMPANY" ? "admin@empresa.com" : "usuario@email.com"} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
            </div>

            {/* Info adicional */}
            {registerType === "PERSONAL" && (
              <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700 border border-blue-200">
                Al registrarte como usuario individual, tendras tu propio espacio de soporte. Podras crear tickets, comprar Ticket Exprés y suscribirte a planes de soporte.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : registerType === "COMPANY" ? "Crear empresa" : "Crear cuenta"}
            </Button>
            <p className="text-sm text-gray-500">
              Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesion
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
