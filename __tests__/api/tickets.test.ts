import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetAuthFromHeaders = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getAuthFromHeaders: mockGetAuthFromHeaders,
}));

vi.mock("@/core/prisma", () => ({
  prisma: {
    ticket: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    ticketHistory: {
      create: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from "@/core/prisma";

const prismaMock = prisma as unknown as {
  ticket: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
  };
  ticketHistory: {
    create: ReturnType<typeof vi.fn>;
  };
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = { userId: "user-1", role: "ADMIN", orgId: "org-1" };

const mockCreatedBy = { id: "user-1", name: "Tech User" };
const mockCategory = { id: "cat-1", name: "Hardware", slug: "hardware" };
const mockAssignedTo = { id: "user-2", name: "Support Agent" };

function buildTicket(overrides: Record<string, unknown> = {}) {
  return {
    id: "ticket-1",
    ticketNumber: 1,
    title: "PC no enciende",
    description: "La PC de escritorio no enciende desde esta mañana luego de una actualización",
    status: "OPEN",
    priority: "HIGH",
    aiCategorySuggested: null,
    aiSentiment: null,
    slaExpiresAt: null,
    paymentStatus: "NONE",
    paymentAmount: null,
    paymentReference: null,
    resolvedAt: null,
    closedAt: null,
    organizationId: "org-1",
    categoryId: "cat-1",
    createdById: "user-1",
    assignedToId: null,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    updatedAt: new Date("2025-01-01T00:00:00Z"),
    category: mockCategory,
    createdBy: mockCreatedBy,
    assignedTo: null,
    comments: [],
    history: [],
    evaluation: null,
    ...overrides,
  };
}

function authHeaders(): Record<string, string> {
  return {
    "x-user-id": "user-1",
    "x-user-role": "ADMIN",
    "x-org-id": "org-1",
    "Content-Type": "application/json",
  };
}

describe("POST /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna 201 y crea ticket con datos validos", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(null);
    prismaMock.ticket.create.mockResolvedValue(buildTicket());

    const { POST } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: "PC no enciende",
        description: "La PC de escritorio no enciende desde esta mañana luego de una actualización",
        priority: "HIGH",
        categoryId: "cat-1",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.id).toBe("ticket-1");
    expect(body.title).toBe("PC no enciende");
    expect(prismaMock.ticket.create).toHaveBeenCalledTimes(1);
  });

  it("retorna 401 si no hay autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { POST } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      body: JSON.stringify({ title: "Test", description: "Descripcion larga para el ticket" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });

  it("retorna 400 si titulo es muy corto", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);

    const { POST } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: "PC",
        description: "Descripcion larga para validar el ticket",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("validation_error");
  });

  it("retorna 400 si descripcion es muy corta", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);

    const { POST } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: "PC no enciende",
        description: "Corto",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("validation_error");
  });

  it("crea entrada en historial con accion CREATED", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(null);
    prismaMock.ticket.create.mockResolvedValue(buildTicket());

    const { POST } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: "PC no enciende",
        description: "La PC de escritorio no enciende desde esta mañana luego de una actualización",
        priority: "HIGH",
      }),
    });

    await POST(request);

    const createCall = prismaMock.ticket.create.mock.calls[0][0];
    expect(createCall.data.history.create.action).toBe("CREATED");
    expect(createCall.data.history.create.userId).toBe("user-1");
  });

  it("auto-incrementa ticketNumber", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue({ ticketNumber: 5 });
    prismaMock.ticket.create.mockResolvedValue(buildTicket({ ticketNumber: 6 }));

    const { POST } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: "Monitor falla",
        description: "El monitor parpadea intermitentemente cada pocos segundos",
        priority: "MEDIUM",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(prismaMock.ticket.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org-1" },
        orderBy: { ticketNumber: "desc" },
      })
    );
    expect(prismaMock.ticket.create.mock.calls[0][0].data.ticketNumber).toBe(6);
    expect(body.ticketNumber).toBe(6);
  });
});

describe("GET /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna tickets paginados", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const tickets = [buildTicket({ id: "ticket-1" }), buildTicket({ id: "ticket-2", ticketNumber: 2 })];
    prismaMock.ticket.findMany.mockResolvedValue(tickets);
    prismaMock.ticket.count.mockResolvedValue(2);

    const { GET } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets?page=1&limit=10", {
      headers: authHeaders(),
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.tickets).toHaveLength(2);
    expect(body.total).toBe(2);
    expect(body.page).toBe(1);
    expect(body.totalPages).toBe(1);
    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 10 })
    );
  });

  it("retorna 401 si no hay autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { GET } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });

  it("filtra por status", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const ticket = buildTicket({ status: "IN_PROGRESS" });
    prismaMock.ticket.findMany.mockResolvedValue([ticket]);
    prismaMock.ticket.count.mockResolvedValue(1);

    const { GET } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets?status=IN_PROGRESS", {
      headers: authHeaders(),
    });

    await GET(request);

    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "IN_PROGRESS" }),
      })
    );
  });

  it("filtra por priority", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const ticket = buildTicket({ priority: "URGENT" });
    prismaMock.ticket.findMany.mockResolvedValue([ticket]);
    prismaMock.ticket.count.mockResolvedValue(1);

    const { GET } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets?priority=URGENT", {
      headers: authHeaders(),
    });

    await GET(request);

    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ priority: "URGENT" }),
      })
    );
  });

  it("busca por texto en titulo y descripcion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findMany.mockResolvedValue([buildTicket()]);
    prismaMock.ticket.count.mockResolvedValue(1);

    const { GET } = await import("@/app/api/tickets/route");
    const request = new NextRequest("http://localhost:3000/api/tickets?search=enciende", {
      headers: authHeaders(),
    });

    await GET(request);

    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [
            { title: { contains: "enciende" } },
            { description: { contains: "enciende" } },
            { ticketNumber: { equals: -1 } },
          ],
        }),
      })
    );
  });
});

describe("GET /api/tickets/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna ticket por id", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const ticket = buildTicket({
      createdBy: { ...mockCreatedBy, email: "tech@test.com" },
    });
    prismaMock.ticket.findFirst.mockResolvedValue(ticket);

    const { GET } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      headers: authHeaders(),
    });
    const response = await GET(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("ticket-1");
    expect(body.title).toBe("PC no enciende");
  });

  it("retorna 404 si ticket no existe", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(null);

    const { GET } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/inexistente", {
      headers: authHeaders(),
    });
    const response = await GET(request, { params: Promise.resolve({ id: "inexistente" }) });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
  });

  it("retorna 401 si no hay autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { GET } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1");
    const response = await GET(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });
});

describe("PATCH /api/tickets/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("actualiza status con transicion valida", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(buildTicket());
    prismaMock.ticket.update.mockResolvedValue(
      buildTicket({ status: "IN_PROGRESS" })
    );

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("IN_PROGRESS");
  });

  it("retorna 400 para transicion invalida", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(
      buildTicket({ status: "CLOSED" })
    );

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: "OPEN" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("invalid_transition");
  });

  it("asigna ticket a un usuario", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(buildTicket());
    prismaMock.user.findUnique.mockResolvedValue({ name: "Support Agent" });
    prismaMock.ticket.update.mockResolvedValue(
      buildTicket({ assignedToId: "user-2", assignedTo: mockAssignedTo })
    );

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ assignedToId: "user-2" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket-1" }) });

    expect(response.status).toBe(200);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-2" },
      select: { name: true },
    });
    const updateCall = prismaMock.ticket.update.mock.calls[0][0];
    expect(updateCall.data.assignedToId).toBe("user-2");
    expect(updateCall.data.history.create).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "ASSIGNMENT" }),
      ])
    );
  });

  it("desasigna ticket", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(
      buildTicket({ assignedToId: "user-2", assignedTo: mockAssignedTo })
    );
    prismaMock.ticket.update.mockResolvedValue(
      buildTicket({ assignedToId: null, assignedTo: null })
    );

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ assignedToId: null }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket-1" }) });

    expect(response.status).toBe(200);
    const updateCall = prismaMock.ticket.update.mock.calls[0][0];
    expect(updateCall.data.assignedToId).toBeNull();
    expect(updateCall.data.history.create).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "UNASSIGNMENT" }),
      ])
    );
  });

  it("actualiza priority", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(buildTicket());
    prismaMock.ticket.update.mockResolvedValue(
      buildTicket({ priority: "URGENT" })
    );

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ priority: "URGENT" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket-1" }) });

    expect(response.status).toBe(200);
    const updateCall = prismaMock.ticket.update.mock.calls[0][0];
    expect(updateCall.data.priority).toBe("URGENT");
    expect(updateCall.data.history.create).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "PRIORITY_CHANGE" }),
      ])
    );
  });

  it("crea entradas de historial para cambios de estado", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(buildTicket());
    prismaMock.ticket.update.mockResolvedValue(
      buildTicket({ status: "IN_PROGRESS" })
    );

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    await PATCH(request, { params: Promise.resolve({ id: "ticket-1" }) });

    const updateCall = prismaMock.ticket.update.mock.calls[0][0];
    expect(updateCall.data.history.create).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "STATUS_CHANGE",
          description: "Estado cambiado de OPEN a IN_PROGRESS",
          userId: "user-1",
        }),
      ])
    );
  });

  it("retorna 401 si no hay autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: "ticket-1" }) });
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });

  it("retorna 404 si ticket no existe", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    prismaMock.ticket.findFirst.mockResolvedValue(null);

    const { PATCH } = await import("@/app/api/tickets/[id]/route");
    const request = new NextRequest("http://localhost:3000/api/tickets/ticket-inexistente", {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ status: "IN_PROGRESS" }),
    });
    const response = await PATCH(request, {
      params: Promise.resolve({ id: "ticket-inexistente" }),
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
  });
});
