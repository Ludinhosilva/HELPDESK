"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
} from "@nextui-org/react";
import { IconTool, IconMail, IconLock } from "@tabler/icons-react";
import { apiClient } from "@/core/api-client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al iniciar sesion");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-2 items-center pt-8">
          <div className="p-3 rounded-full bg-primary/10">
            <IconTool size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold">PC Repair Help Desk</h1>
          <p className="text-sm text-default-400">
            Inicia sesion para continuar
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4 py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="tecnico@taller.com"
              value={email}
              onValueChange={setEmail}
              startContent={
                <IconMail size={18} className="text-default-400" />
              }
              isRequired
              autoFocus
            />
            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••"
              value={password}
              onValueChange={setPassword}
              startContent={
                <IconLock size={18} className="text-default-400" />
              }
              isRequired
            />
            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              Iniciar Sesion
            </Button>
          </form>

          <p className="text-center text-sm text-default-400">
            No tienes cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Registrate
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
