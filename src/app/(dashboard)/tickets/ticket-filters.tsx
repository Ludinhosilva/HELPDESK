"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function TicketFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  const currentStatus = searchParams.get("status") || "all";
  const currentPriority = searchParams.get("priority") || "all";

  const applyFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/tickets?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilter("q", search);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </form>
      <Select value={currentStatus} onValueChange={(v) => applyFilter("status", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Todos los Estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los Estados</SelectItem>
          <SelectItem value="OPEN">Abierto</SelectItem>
          <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
          <SelectItem value="ON_HOLD">En Espera</SelectItem>
          <SelectItem value="RESOLVED">Resuelto</SelectItem>
          <SelectItem value="CLOSED">Cerrado</SelectItem>
        </SelectContent>
      </Select>
      <Select value={currentPriority} onValueChange={(v) => applyFilter("priority", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Todas las Prioridades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las Prioridades</SelectItem>
          <SelectItem value="LOW">Baja</SelectItem>
          <SelectItem value="MEDIUM">Media</SelectItem>
          <SelectItem value="HIGH">Alta</SelectItem>
          <SelectItem value="URGENT">Urgente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
