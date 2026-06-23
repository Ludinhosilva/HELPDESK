import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetAuthFromHeaders = vi.fn();
const mockGetOrgFilter = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getAuthFromHeaders: mockGetAuthFromHeaders,
  getOrgFilter: mockGetOrgFilter,
}));

vi.mock("@/core/prisma", () => ({
  prisma: {
    ticket: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/core/prisma";

const prismaMock = prisma as unknown as {
  ticket: {
    groupBy: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  category: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = { userId: "user-1", role: "ADMIN", orgId: "org-1" };
const mockOrgFilter = { organizationId: "org-1" };

function authHeaders(): Record<string, string> {
  return {
    "x-user-id": "user-1",
    "x-user-role": "ADMIN",
    "x-org-id": "org-1",
  };
}

describe("GET /api/tickets/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna estadisticas con arrays byCategory, byStatus y byTime", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    mockGetOrgFilter.mockReturnValue(mockOrgFilter);

    prismaMock.ticket.groupBy
      .mockResolvedValueOnce([
        { categoryId: "cat-1", _count: 3 },
        { categoryId: "cat-2", _count: 1 },
      ])
      .mockResolvedValueOnce([
        { status: "OPEN", _count: 2 },
        { status: "IN_PROGRESS", _count: 1 },
        { status: "RESOLVED", _count: 1 },
      ]);

    prismaMock.category.findMany.mockResolvedValue([
      { id: "cat-1", name: "Hardware" },
      { id: "cat-2", name: "Software" },
    ]);

    const now = new Date("2025-06-01T12:00:00Z");
    prismaMock.ticket.findMany.mockResolvedValue([
      { createdAt: new Date("2025-05-15T10:00:00Z") },
      { createdAt: new Date("2025-05-15T14:00:00Z") },
      { createdAt: new Date("2025-05-20T08:00:00Z") },
    ]);

    const { GET } = await import("@/app/api/tickets/stats/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/stats", {
      headers: authHeaders(),
    });
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveProperty("byCategory");
    expect(body).toHaveProperty("byStatus");
    expect(body).toHaveProperty("byTime");
    expect(Array.isArray(body.byCategory)).toBe(true);
    expect(Array.isArray(body.byStatus)).toBe(true);
    expect(Array.isArray(body.byTime)).toBe(true);
  });

  it("retorna 401 sin autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { GET } = await import("@/app/api/tickets/stats/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/stats");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });

  it("agrupa por status correctamente con etiquetas en español", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    mockGetOrgFilter.mockReturnValue(mockOrgFilter);

    prismaMock.ticket.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { status: "OPEN", _count: 5 },
        { status: "IN_PROGRESS", _count: 3 },
        { status: "RESOLVED", _count: 2 },
        { status: "CLOSED", _count: 1 },
      ]);

    prismaMock.category.findMany.mockResolvedValue([]);
    prismaMock.ticket.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/tickets/stats/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/stats", {
      headers: authHeaders(),
    });
    const response = await GET(request);
    const body = await response.json();

    expect(body.byStatus).toEqual(
      expect.arrayContaining([
        { status: "Abierto", count: 5 },
        { status: "En progreso", count: 3 },
        { status: "Resuelto", count: 2 },
        { status: "Cerrado", count: 1 },
      ])
    );
    expect(prismaMock.ticket.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ by: ["status"] })
    );
  });

  it("agrupa por categoria correctamente mapeando nombres", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    mockGetOrgFilter.mockReturnValue(mockOrgFilter);

    prismaMock.ticket.groupBy
      .mockResolvedValueOnce([
        { categoryId: "cat-a", _count: 4 },
        { categoryId: "cat-b", _count: 2 },
        { categoryId: null, _count: 1 },
      ])
      .mockResolvedValueOnce([]);

    prismaMock.category.findMany.mockResolvedValue([
      { id: "cat-a", name: "Redes" },
      { id: "cat-b", name: "Impresion" },
    ]);

    prismaMock.ticket.findMany.mockResolvedValue([]);

    const { GET } = await import("@/app/api/tickets/stats/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/stats", {
      headers: authHeaders(),
    });
    const response = await GET(request);
    const body = await response.json();

    expect(body.byCategory).toEqual(
      expect.arrayContaining([
        { category: "Redes", count: 4 },
        { category: "Impresion", count: 2 },
      ])
    );
    expect(body.byCategory).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ category: "Sin categoria" })])
    );
  });
});
