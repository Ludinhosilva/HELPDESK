import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/core/prisma", () => ({
  prisma: {
    ticket: {
      findFirst: vi.fn(),
    },
    comment: {
      create: vi.fn(),
    },
    ticketHistory: {
      create: vi.fn(),
    },
  },
}));

import { prisma } from "@/core/prisma";

const prismaMock = prisma as unknown as {
  ticket: {
    findFirst: ReturnType<typeof vi.fn>;
  };
  comment: {
    create: ReturnType<typeof vi.fn>;
  };
  ticketHistory: {
    create: ReturnType<typeof vi.fn>;
  };
};

function authHeaders(): Record<string, string> {
  return {
    "x-user-id": "user-1",
    "x-user-role": "ADMIN",
    "x-org-id": "org-1",
    "Content-Type": "application/json",
  };
}

describe("POST /api/tickets/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 201 y agrega comentario con contenido valido", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      ticketNumber: 123,
    });
    prismaMock.comment.create.mockResolvedValue({
      id: "comment-1",
      content: "Nuevo comentario",
      ticketId: "ticket-1",
      authorId: "user-1",
      author: { id: "user-1", name: "Tech User" },
    });

    const { POST } = await import("@/app/api/tickets/[id]/comments/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/comments", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: "Nuevo comentario" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.content).toBe("Nuevo comentario");
    expect(prismaMock.comment.create).toHaveBeenCalledTimes(1);
  });

  it("retorna 401 sin autenticacion", async () => {
    const { POST } = await import("@/app/api/tickets/[id]/comments/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/comments", {
      method: "POST",
      body: JSON.stringify({ content: "Comentario" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });

  it("retorna 404 si ticket no existe", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue(null);

    const { POST } = await import("@/app/api/tickets/[id]/comments/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-inexistente/comments", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: "Comentario" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-inexistente" }) });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
  });

  it("retorna 400 con contenido vacio (Zod validation)", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      ticketNumber: 123,
    });

    const { POST } = await import("@/app/api/tickets/[id]/comments/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/comments", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: "" }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("validation_error");
  });

  it("crea entrada en historial 'Comentario agregado en TK-{number}'", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      ticketNumber: 456,
    });
    prismaMock.comment.create.mockResolvedValue({
      id: "comment-2",
      content: "Otro comentario",
      ticketId: "ticket-1",
      authorId: "user-1",
      author: { id: "user-1", name: "Tech User" },
    });

    const { POST } = await import("@/app/api/tickets/[id]/comments/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/comments", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ content: "Otro comentario" }),
    });
    await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });

    expect(prismaMock.ticketHistory.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        action: "COMMENT",
        description: "Comentario agregado en TK-456",
        userId: "user-1",
      },
    });
  });
});
