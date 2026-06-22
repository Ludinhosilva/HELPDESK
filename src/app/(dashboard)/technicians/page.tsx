"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@nextui-org/react";
import { apiClient } from "@/core/api-client";

interface Technician {
  id: string;
  name: string;
  email: string;
  role: string;
  specialty: string;
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient<{ users: Technician[] }>("/users");
        setTechnicians(res.users);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Tecnicos</h1>
        <p className="text-default-400 text-sm">
          {technicians.length} tecnicos registrados
        </p>
      </div>

      <Table aria-label="Tecnicos" removeWrapper>
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>ESPECIALIDAD</TableColumn>
          <TableColumn>ROL</TableColumn>
        </TableHeader>
        <TableBody
          isLoading={loading}
          loadingContent="Cargando..."
          emptyContent="No hay tecnicos registrados"
          items={technicians}
        >
          {(tech) => (
            <TableRow key={tech.id}>
              <TableCell className="font-medium">{tech.name}</TableCell>
              <TableCell>{tech.email}</TableCell>
              <TableCell>
                <Chip variant="flat" size="sm">{tech.specialty || "General"}</Chip>
              </TableCell>
              <TableCell>
                <Chip color={tech.role === "ADMIN" ? "secondary" : "primary"} variant="flat" size="sm">
                  {tech.role === "ADMIN" ? "Administrador" : "Tecnico"}
                </Chip>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
