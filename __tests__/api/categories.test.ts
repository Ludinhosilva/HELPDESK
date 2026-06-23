import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetAuthFromHeaders = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getAuthFromHeaders: mockGetAuthFromHeaders,
}));

vi.mock("@/core/prisma", () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "@/core/prisma";

const prismaMock = prisma as unknown as {
  category: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = { userId: "user-1", role: "ADMIN", orgId: "org-1" };

function authHeaders(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    "x-user-id": "user-1",
    "x-user-role": "ADMIN",
    "x-org-id": "org-1",
    "Content-Type": "application/json",
    ...overrides,
  };
}

function buildCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: "cat-1",
    name: "Hardware",
    slug: "hardware",
    organizationId: "org-1",
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
    _count: { tickets: 0, knowledgeArticles: 0 },
    ...overrides,
  };
}

describe("GET /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna lista de categorias", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const categories = [
      buildCategory(),
      buildCategory({ id: "cat-2", name: "Software", slug: "software" }),
    ];
    prismaMock.category.findMany.mockResolvedValue(categories);

    const { GET } = await import("@/app/api/categories/route");
    const request = new NextRequest("http://localhost:3000/api/categories", {
      headers: authHeaders(),
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.categories).toHaveLength(2);
    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org-1" },
      })
    );
  });

  it("retorna 401 sin autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { GET } = await import("@/app/api/categories/route");
    const request = new NextRequest("http://localhost:3000/api/categories");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });
});

describe("POST /api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea categoria exitosamente", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.category.findFirst.mockResolvedValue(null);
    prismaMock.category.create.mockResolvedValue(buildCategory());

    const { POST } = await import("@/app/api/categories/route");
    const request = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ name: "Hardware", slug: "hardware" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("cat-1");
    expect(body.name).toBe("Hardware");
    expect(prismaMock.category.create).toHaveBeenCalledTimes(1);
  });

  it("retorna 403 sin autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { POST } = await import("@/app/api/categories/route");
    const request = new NextRequest("http://localhost:3000/api/categories", {
      method: "POST",
      body: JSON.stringify({ name: "Hardware", slug: "hardware" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("forbidden");
  });
});

describe("PATCH /api/categories/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("actualiza el nombre de la categoria", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.category.findFirst.mockResolvedValue(buildCategory());
    prismaMock.category.update.mockResolvedValue(
      buildCategory({ name: "Hardware y Perifericos" })
    );

    const { PATCH } = await import("@/app/api/categories/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/categories/cat-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ name: "Hardware y Perifericos" }),
    });

    const response = await PATCH(request, { params: { id: "cat-1" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Hardware y Perifericos");
    expect(prismaMock.category.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "cat-1" },
        data: { name: "Hardware y Perifericos" },
      })
    );
  });

  it("retorna 404 si la categoria no existe", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.category.findFirst.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/categories/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/categories/inexistente", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ name: "Nuevo nombre" }),
    });

    const response = await PATCH(request, { params: { id: "inexistente" } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
  });
});

describe("DELETE /api/categories/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("elimina categoria sin tickets asociados", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.category.findFirst.mockResolvedValue(
      buildCategory({ _count: { tickets: 0, knowledgeArticles: 0 } })
    );
    prismaMock.category.delete.mockResolvedValue(buildCategory());

    const { DELETE } = await import("@/app/api/categories/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/categories/cat-1", {
      method: "DELETE",
      headers: authHeaders(),
    });

    const response = await DELETE(request, { params: { id: "cat-1" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Categoria eliminada");
    expect(prismaMock.category.delete).toHaveBeenCalledWith({
      where: { id: "cat-1" },
    });
  });

  it("retorna 403 sin autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { DELETE } = await import("@/app/api/categories/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/categories/cat-1", {
      method: "DELETE",
    });

    const response = await DELETE(request, { params: { id: "cat-1" } });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("forbidden");
  });
});
