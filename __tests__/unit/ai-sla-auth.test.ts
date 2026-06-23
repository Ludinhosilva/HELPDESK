import { describe, it, expect } from "vitest";
import { classifyTicket, suggestSolutions, searchSimilar } from "@/lib/ai";
import { getSLAStatusColor, getSLAStatusLabel } from "@/lib/sla";
import { requireAdmin, requireRole, isSuperAdmin, getOrgFilter } from "@/lib/auth-helpers";

describe("classifyTicket()", () => {
  it("detecta hardware", () => {
    expect(classifyTicket("Mi laptop no enciende", "desc")).toBe("hardware");
  });

  it("detecta software", () => {
    expect(classifyTicket("Error al instalar Windows", "desc")).toBe("software");
  });

  it("detecta red", () => {
    expect(classifyTicket("Internet lento en la oficina", "desc")).toBe("red");
  });

  it("detecta accesos", () => {
    expect(classifyTicket("No puedo iniciar sesion", "desc")).toBe("accesos");
  });

  it("retorna otros por defecto", () => {
    expect(classifyTicket("Problema general", "desc")).toBe("otros");
  });
});

describe("suggestSolutions()", () => {
  it("retorna lista de soluciones", () => {
    const solutions = suggestSolutions("hardware", "No enciende");
    expect(Array.isArray(solutions)).toBe(true);
    expect(solutions.length).toBeGreaterThan(0);
  });
});

describe("searchSimilar()", () => {
  const tickets = [
    { id: "1", title: "No enciende laptop", description: "Laptop Dell no da video", category: { name: "Hardware" } },
    { id: "2", title: "Internet lento", description: "Velocidad baja en todo el piso", category: { name: "Red" } },
    { id: "3", title: "Problema de correo", description: "Outlook no envía correos", category: { name: "Software" } },
  ];

  it("encuentra ticket similar por titulo", () => {
    const results = searchSimilar("No enciende laptop Dell", "descripción", tickets as any);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe("1");
  });

  it("ordena por similitud descendente", () => {
    const results = searchSimilar("Laptop no prende", "descripción", tickets as any);
    if (results.length > 1) {
      expect(results[0].similarity).toBeGreaterThanOrEqual(results[1].similarity);
    }
  });

  it("retorna lista vacia si no hay coincidencia", () => {
    const results = searchSimilar("zyxwvutsrqponmlkjihgfedcba", "", tickets as any);
    expect(results.length).toBe(0);
  });
});

describe("Utilidades SLA", () => {
  it("color segun minutos restantes", () => {
    expect(getSLAStatusColor(120)).toContain("green");
    expect(getSLAStatusColor(45)).toContain("yellow");
    expect(getSLAStatusColor(15)).toContain("orange");
    expect(getSLAStatusColor(0)).toContain("red");
  });

  it("etiqueta de estado legible", () => {
    expect(getSLAStatusLabel(120)).toContain("h");
    expect(getSLAStatusLabel(45)).toContain("min");
    expect(getSLAStatusLabel(0)).toBe("Vencido");
  });
});

describe("Helpers de autenticación", () => {
  const adminAuth = { userId: "u1", role: "ADMIN", orgId: "org-1" };
  const superAuth = { userId: "u1", role: "SUPER_ADMIN", orgId: "" };
  const techAuth = { userId: "u2", role: "TECHNICIAN", orgId: "org-1" };
  const endUserAuth = { userId: "u3", role: "END_USER", orgId: "org-1" };

  it("permite ADMIN y SUPER_ADMIN", () => {
    expect(requireAdmin(adminAuth)).toBe(true);
    expect(requireAdmin(superAuth)).toBe(true);
    expect(requireAdmin(techAuth)).toBe(false);
    expect(requireAdmin(endUserAuth)).toBe(false);
    expect(requireAdmin(null)).toBe(false);
  });

  it("funciona con cualquier rol", () => {
    const isAdmin = requireRole("ADMIN");
    const isTechOrAdmin = requireRole("TECHNICIAN", "ADMIN");

    expect(isAdmin(adminAuth)).toBe(true);
    expect(isAdmin(techAuth)).toBe(false);
    expect(isTechOrAdmin(techAuth)).toBe(true);
    expect(isTechOrAdmin(endUserAuth)).toBe(false);
  });

  it("detecta solo SUPER_ADMIN", () => {
    expect(isSuperAdmin(superAuth)).toBe(true);
    expect(isSuperAdmin(adminAuth)).toBe(false);
    expect(isSuperAdmin(techAuth)).toBe(false);
    expect(isSuperAdmin(null)).toBe(false);
  });

  it("retorna vacio para SUPER_ADMIN", () => {
    expect(getOrgFilter(superAuth)).toEqual({});
  });

  it("retorna filtro para otros roles", () => {
    expect(getOrgFilter(adminAuth)).toEqual({ organizationId: "org-1" });
    expect(getOrgFilter(techAuth)).toEqual({ organizationId: "org-1" });
  });
});
