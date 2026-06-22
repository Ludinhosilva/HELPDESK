"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Divider,
} from "@nextui-org/react";
import {
  IconTool,
  IconMail,
  IconLock,
  IconUser,
} from "@tabler/icons-react";
import { apiClient } from "@/core/api-client";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("TECHNICIAN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient("/auth/register", {
        method: "POST",
        body: { email, password, name, role },
      });
      await new Promise((resolve) => setTimeout(resolve, 100));
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error al registrar");
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
          <h1 className="text-2xl font-bold">Crear Cuenta</h1>
          <p className="text-sm text-default-400">
            Registrate en PC Repair Help Desk
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4 py-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              label="Nombre completo"
              placeholder="Juan Perez"
              value={name}
              onValueChange={setName}
              startContent={
                <IconUser size={18} className="text-default-400" />
              }
              isRequired
              autoFocus
            />
            <Input
              type="email"
              label="Email"
              placeholder="correo@ejemplo.com"
              value={email}
              onValueChange={setEmail}
              startContent={
                <IconMail size={18} className="text-default-400" />
              }
              isRequired
            />
            <Input
              type="password"
              label="Contraseña"
              placeholder="Minimo 6 caracteres"
              value={password}
              onValueChange={setPassword}
              startContent={
                <IconLock size={18} className="text-default-400" />
              }
              isRequired
            />
            <Select
              label="Rol"
              selectedKeys={[role]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0]?.toString();
                if (selected) setRole(selected);
              }}
            >
              <SelectItem key="TECHNICIAN">Tecnico</SelectItem>
              <SelectItem key="ADMIN">Administrador</SelectItem>
            </Select>
            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              Crear Cuenta
            </Button>
          </form>

          <p className="text-center text-sm text-default-400">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicia sesion
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
