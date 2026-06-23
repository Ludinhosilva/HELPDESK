import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/core/prisma", () => ({
  prisma: {
    ticket: {
      findFirst: vi.fn(),
    },
    evaluation: {
      findFirst: vi.fn(),
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
  evaluation: {
    findFirst: ReturnType<typeof vi.fn>;
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

describe("POST /api/tickets/[id]/evaluate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 201 y evalua ticket resuelto con rating 5", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      status: "RESOLVED",
      ticketNumber: 100,
    });
    prismaMock.evaluation.findFirst.mockResolvedValue(null);
    prismaMock.evaluation.create.mockResolvedValue({
      id: "eval-1",
      rating: 5,
      comment: null,
      ticketId: "ticket-1",
      userId: "user-1",
    });

    const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/evaluate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rating: 5 }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.rating).toBe(5);
    expect(prismaMock.evaluation.create).toHaveBeenCalledTimes(1);
  });

  it("retorna 400 si ticket esta OPEN (debe estar resuelto o cerrado)", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      status: "OPEN",
      ticketNumber: 100,
    });

    const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/evaluate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rating: 5 }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_status");
    expect(body.message).toBe("El ticket debe estar resuelto o cerrado antes de evaluar");
  });

  it("retorna 409 si el ticket ya fue evaluado por el mismo usuario", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      status: "RESOLVED",
      ticketNumber: 100,
    });
    prismaMock.evaluation.findFirst.mockResolvedValue({
      id: "eval-existente",
      rating: 4,
      ticketId: "ticket-1",
      userId: "user-1",
    });

    const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/evaluate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rating: 5 }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("already_evaluated");
  });

  it("retorna 401 sin autenticacion", async () => {
    const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/evaluate", {
      method: "POST",
      body: JSON.stringify({ rating: 5 }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });

  it("retorna 404 si ticket no existe", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue(null);

    const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-inexistente/evaluate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rating: 5 }),
    });
    const response = await POST(request, { params: Promise.resolve({ id: "ticket-inexistente" }) });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
  });

  it("crea entrada en historial 'Ticket evaluado con puntuacion {rating}/5'", async () => {
    prismaMock.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      status: "CLOSED",
      ticketNumber: 200,
    });
    prismaMock.evaluation.findFirst.mockResolvedValue(null);
    prismaMock.evaluation.create.mockResolvedValue({
      id: "eval-2",
      rating: 3,
      comment: "Regular",
      ticketId: "ticket-1",
      userId: "user-1",
    });

    const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/evaluate", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rating: 3, comment: "Regular" }),
    });
    await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });

    expect(prismaMock.ticketHistory.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        action: "EVALUATION",
        description: "Ticket evaluado con puntuacion 3/5",
        userId: "user-1",
      },
    });
  });

  describe("validacion de rating (Zod)", () => {
    it("retorna 400 si rating es 0 (minimo 1)", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue({
        id: "ticket-1",
        status: "RESOLVED",
        ticketNumber: 100,
      });
      prismaMock.evaluation.findFirst.mockResolvedValue(null);

      const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
      const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/evaluate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ rating: 0 }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("validation_error");
    });

    it("retorna 400 si rating es 6 (maximo 5)", async () => {
      prismaMock.ticket.findFirst.mockResolvedValue({
        id: "ticket-1",
        status: "RESOLVED",
        ticketNumber: 100,
      });
      prismaMock.evaluation.findFirst.mockResolvedValue(null);

      const { POST } = await import("@/app/api/tickets/[id]/evaluate/route");
      const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1/evaluate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ rating: 6 }),
      });
      const response = await POST(request, { params: Promise.resolve({ id: "ticket-1" }) });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("validation_error");
    });
  });
});
