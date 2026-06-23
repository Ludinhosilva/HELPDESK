import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockGetAuthFromHeaders = vi.fn();

vi.mock("@/lib/auth-helpers", () => ({
  getAuthFromHeaders: mockGetAuthFromHeaders,
}));

vi.mock("@/core/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/core/prisma";

const prismaMock = prisma as unknown as {
  user: {
    findMany: ReturnType<typeof vi.fn>;
  };
};

const mockAuth = { userId: "user-1", role: "ADMIN", orgId: "org-1" };
const mockSuperAuth = { userId: "super-1", role: "SUPER_ADMIN", orgId: "org-1" };

function authHeaders(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    "x-user-id": "user-1",
    "x-user-role": "ADMIN",
    "x-org-id": "org-1",
    "Content-Type": "application/json",
    ...overrides,
  };
}

function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "user-1",
    name: "Juan Perez",
    email: "juan@test.com",
    role: "TECHNICIAN",
    isActive: true,
    createdAt: new Date("2025-01-01T00:00:00Z"),
    ...overrides,
  };
}

describe("GET /api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna lista de usuarios de la organizacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const users = [buildUser(), buildUser({ id: "user-2", name: "Maria Lopez", email: "maria@test.com" })];
    prismaMock.user.findMany.mockResolvedValue(users);

    const { GET } = await import("@/app/api/users/route");
    const request = new NextRequest("http://localhost:3000/api/users", {
      headers: authHeaders(),
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.users).toHaveLength(2);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org-1" },
      })
    );
  });

  it("retorna 401 sin autenticacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(null);

    const { GET } = await import("@/app/api/users/route");
    const request = new NextRequest("http://localhost:3000/api/users");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("unauthorized");
  });

  it("SUPER_ADMIN ve todos los usuarios sin filtro de organizacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockSuperAuth);
    const users = [
      buildUser({ id: "u1", organizationId: "org-1" }),
      buildUser({ id: "u2", organizationId: "org-2" }),
    ];
    prismaMock.user.findMany.mockResolvedValue(users);

    const { GET } = await import("@/app/api/users/route");
    const request = new NextRequest("http://localhost:3000/api/users", {
      headers: authHeaders({ "x-user-role": "SUPER_ADMIN", "x-user-id": "super-1" }),
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.users).toHaveLength(2);
    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: { not: "SUPER_ADMIN" } },
      })
    );
  });

  it("admin regular solo ve usuarios de su propia organizacion", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const users = [buildUser({ id: "u1", organizationId: "org-1" })];
    prismaMock.user.findMany.mockResolvedValue(users);

    const { GET } = await import("@/app/api/users/route");
    const request = new NextRequest("http://localhost:3000/api/users", {
      headers: authHeaders(),
    });

    await GET(request);

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: "org-1" },
      })
    );
  });

  it("retorna la estructura correcta de datos del usuario", async () => {
    mockGetAuthFromHeaders.mockReturnValue(mockAuth);
    const user = buildUser();
    prismaMock.user.findMany.mockResolvedValue([user]);

    const { GET } = await import("@/app/api/users/route");
    const request = new NextRequest("http://localhost:3000/api/users", {
      headers: authHeaders(),
    });

    const response = await GET(request);
    const body = await response.json();

    expect(body.users[0]).toHaveProperty("id");
    expect(body.users[0]).toHaveProperty("name");
    expect(body.users[0]).toHaveProperty("email");
    expect(body.users[0]).toHaveProperty("role");
    expect(body.users[0]).toHaveProperty("isActive");
    expect(body.users[0]).not.toHaveProperty("password");
  });
});
