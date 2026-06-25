import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/core/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
    },
    organization: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
    this.setProtectedHeader = vi.fn().mockReturnThis();
    this.setIssuedAt = vi.fn().mockReturnThis();
    this.setExpirationTime = vi.fn().mockReturnThis();
    this.sign = vi.fn().mockResolvedValue("mocked-jwt-token");
  }),
}));

import { prisma } from "@/core/prisma";
import { loginUser, registerCompany } from "@/lib/auth-actions";

const prismaMock = prisma as unknown as {
  user: {
    findFirst: ReturnType<typeof vi.fn>;
  };
  organization: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

describe("loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna error si credenciales invalidas (usuario no existe)", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    const result = await loginUser("noexiste@test.com", "password123");

    expect(result.error).toBe("Credenciales invalidas");
    expect(result.status).toBe(401);
  });

  it("retorna error si la contraseña es incorrecta", async () => {
    const hashedPassword = await bcrypt.hash("password123", 12);
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
      password: hashedPassword,
      name: "Test User",
      role: "TECHNICIAN",
      organizationId: "org-1",
    });

    const result = await loginUser("test@test.com", "wrongpassword");

    expect(result.error).toBe("Credenciales invalidas");
    expect(result.status).toBe(401);
  });

  it("retorna usuario y token si credenciales correctas", async () => {
    const hashedPassword = await bcrypt.hash("password123", 12);
    prismaMock.user.findFirst.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
      password: hashedPassword,
      name: "Test User",
      role: "TECHNICIAN",
      organizationId: "org-1",
    });

    const result = await loginUser("test@test.com", "password123");

    expect(result.token).toBe("mocked-jwt-token");
    expect(result.user).toBeDefined();
    expect(result.user!.email).toBe("test@test.com");
    expect(result.user!.role).toBe("TECHNICIAN");
  });
});

describe("registerCompany", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retorna error si email falta", async () => {
    const result = await registerCompany({
      email: "",
      password: "password123",
      name: "Test",
      orgName: "Test Org",
    });

    expect(result.error).toBeDefined();
    expect(result.status).toBe(400);
  });

  it("retorna error si email tiene formato invalido", async () => {
    const result = await registerCompany({
      email: "noesunemail",
      password: "password123",
      name: "Test",
      orgName: "Test Org",
    });

    expect(result.error).toBe("Formato de email invalido");
    expect(result.status).toBe(400);
  });

  it("retorna error si contraseña es corta", async () => {
    const result = await registerCompany({
      email: "test@test.com",
      password: "12345",
      name: "Test",
      orgName: "Test Org",
    });

    expect(result.error).toContain("6 caracteres");
    expect(result.status).toBe(400);
  });

  it("retorna error si nombre esta vacio", async () => {
    const result = await registerCompany({
      email: "test@test.com",
      password: "password123",
      name: "",
      orgName: "Test Org",
    });

    expect(result.error).toBeDefined();
    expect(result.status).toBe(400);
  });

  it("retorna error si el email ya existe en la org", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: "org-1" });
    prismaMock.user.findFirst.mockResolvedValue({ id: "existing", email: "test@test.com" });

    const result = await registerCompany({
      email: "test@test.com",
      password: "password123",
      name: "Test User",
      orgName: "Test Org",
    });

    expect(result.error).toBe("El email ya existe en esta organizacion");
    expect(result.status).toBe(409);
  });

  it("registra usuario correctamente", async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);
    prismaMock.organization.create.mockResolvedValue({
      id: "org-new",
      users: [{ id: "user-new", email: "nuevo@test.com" }],
    });

    const result = await registerCompany({
      email: "nuevo@test.com",
      password: "password123",
      name: "Nuevo User",
      orgName: "Nueva Empresa",
    });

    expect(result.message).toBeDefined();
    expect(result.status).toBe(201);
    expect(prismaMock.organization.create).toHaveBeenCalledTimes(1);
  });
});
