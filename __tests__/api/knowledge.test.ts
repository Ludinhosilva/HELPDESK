import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetAuthFromHeaders = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getAuthFromHeaders: mockGetAuthFromHeaders,
}));

vi.mock("@/core/prisma", () => ({
  prisma: {
    knowledgeArticle: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from "@/core/prisma";

const prismaMock = prisma as unknown as {
  knowledgeArticle: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
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

const mockCategory = { id: "cat-1", name: "Hardware", slug: "hardware" };

function buildArticle(overrides: Record<string, unknown> = {}) {
  return {
    id: "article-1",
    title: "Como reparar una PC",
    content: "Pasos para diagnosticar y reparar una PC que no enciende",
    slug: "como-reparar-una-pc",
    status: "PUBLISHED" as const,
    viewCount: 10,
    categoryId: "cat-1",
    organizationId: "org-1",
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
    category: mockCategory,
    ...overrides,
  };
}

describe("GET /api/knowledge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna lista de articulos publicados", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const articles = [
      buildArticle(),
      buildArticle({ id: "article-2", title: "Guia de redes", slug: "guia-de-redes" }),
    ];
    prismaMock.knowledgeArticle.findMany.mockResolvedValue(articles);

    const { GET } = await import("@/app/api/knowledge/route");
    const request = new NextRequest("http://localhost:3000/api/knowledge", {
      headers: authHeaders(),
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.articles).toHaveLength(2);
    expect(prismaMock.knowledgeArticle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org-1",
          status: "PUBLISHED",
        }),
      })
    );
  });

  it("retorna 401 sin autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { GET } = await import("@/app/api/knowledge/route");
    const request = new NextRequest("http://localhost:3000/api/knowledge");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });
});

describe("GET /api/knowledge/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna detalle del articulo por slug", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const article = buildArticle();
    prismaMock.knowledgeArticle.findFirst.mockResolvedValue(article);
    prismaMock.knowledgeArticle.update.mockResolvedValue(
      buildArticle({ viewCount: 11 })
    );

    const { GET } = await import("@/app/api/knowledge/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/knowledge/article-1", {
      headers: authHeaders(),
    });

    const response = await GET(request, { params: { id: "article-1" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("article-1");
    expect(body.title).toBe("Como reparar una PC");
    expect(body.category).toBeDefined();
    expect(prismaMock.knowledgeArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "article-1" },
        data: { viewCount: { increment: 1 } },
      })
    );
  });

  it("retorna 404 si el articulo no existe", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.knowledgeArticle.findFirst.mockResolvedValue(null);

    const { GET } = await import("@/app/api/knowledge/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/knowledge/inexistente", {
      headers: authHeaders(),
    });

    const response = await GET(request, { params: { id: "inexistente" } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
  });
});

describe("POST /api/knowledge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea articulo como DRAFT por defecto", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.knowledgeArticle.findFirst.mockResolvedValue(null);
    prismaMock.knowledgeArticle.create.mockResolvedValue(
      buildArticle({ status: "DRAFT" })
    );

    const { POST } = await import("@/app/api/knowledge/route");
    const request = new NextRequest("http://localhost:3000/api/knowledge", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: "Como reparar una PC",
        content: "Pasos para diagnosticar y reparar una PC que no enciende",
        slug: "como-reparar-una-pc",
        categoryId: "cat-1",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.status).toBe("DRAFT");
    expect(prismaMock.knowledgeArticle.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "DRAFT",
          title: "Como reparar una PC",
        }),
      })
    );
  });

  it("retorna 403 sin autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { POST } = await import("@/app/api/knowledge/route");
    const request = new NextRequest("http://localhost:3000/api/knowledge", {
      method: "POST",
      body: JSON.stringify({
        title: "Test",
        content: "Contenido del articulo",
        slug: "test",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("forbidden");
  });
});

describe("PATCH /api/knowledge/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("actualiza articulo exitosamente", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.knowledgeArticle.findFirst.mockResolvedValue(buildArticle());
    prismaMock.knowledgeArticle.update.mockResolvedValue(
      buildArticle({ title: "Como reparar una PC - Actualizado", status: "PUBLISHED" })
    );

    const { PATCH } = await import("@/app/api/knowledge/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/knowledge/article-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ title: "Como reparar una PC - Actualizado", status: "PUBLISHED" }),
    });

    const response = await PATCH(request, { params: { id: "article-1" } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.title).toBe("Como reparar una PC - Actualizado");
    expect(body.status).toBe("PUBLISHED");
    expect(prismaMock.knowledgeArticle.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "article-1" },
        data: expect.objectContaining({
          title: "Como reparar una PC - Actualizado",
          status: "PUBLISHED",
        }),
        include: { category: true },
      })
    );
  });
});
