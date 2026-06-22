import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/core/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("jose", () => {
  return {
    SignJWT: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.setProtectedHeader = vi.fn().mockReturnThis();
      this.setIssuedAt = vi.fn().mockReturnThis();
      this.setExpirationTime = vi.fn().mockReturnThis();
      this.sign = vi.fn().mockResolvedValue("mocked-jwt-token");
    }),
  };
});

import { prisma } from "@/core/prisma";
import { loginUser, registerUser } from "@/modules/auth/actions/auth-actions";

const prismaMock = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginUser", () => {
    it("retorna error si el usuario no existe", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await loginUser("noexiste@test.com", "password123");

      expect(result).toEqual({
        error: "Credenciales invalidas",
        status: 401,
      });
    });

    it("retorna error si la contraseña es incorrecta", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        password: hashedPassword,
        name: "Test User",
        role: "TECHNICIAN",
        specialty: "",
      });

      const result = await loginUser("test@test.com", "wrongpassword");

      expect(result).toEqual({
        error: "Credenciales invalidas",
        status: 401,
      });
    });

    it("retorna usuario y token si credenciales correctas", async () => {
      const hashedPassword = await bcrypt.hash("password123", 12);
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        password: hashedPassword,
        name: "Test User",
        role: "TECHNICIAN",
        specialty: "Hardware",
      });

      const result = await loginUser("test@test.com", "password123");

      expect("token" in result).toBe(true);
      if ("token" in result) {
        expect(result.user).toEqual({
          id: "user-1",
          email: "test@test.com",
          name: "Test User",
          role: "TECHNICIAN",
          specialty: "Hardware",
        });
        expect(result.token).toBe("mocked-jwt-token");
      }
    });
  });

  describe("registerUser", () => {
    it("retorna error si falta email", async () => {
      const result = await registerUser({
        email: "",
        password: "password123",
        name: "Test",
        role: "TECHNICIAN",
        specialty: "",
      });

      expect(result).toEqual({
        error: "El email es requerido",
        status: 400,
      });
    });

    it("retorna error si email tiene formato invalido", async () => {
      const result = await registerUser({
        email: "noesunemail",
        password: "password123",
        name: "Test",
        role: "TECHNICIAN",
        specialty: "",
      });

      expect(result).toEqual({
        error: "Formato de email invalido",
        status: 400,
      });
    });

    it("retorna error si contraseña es corta", async () => {
      const result = await registerUser({
        email: "test@test.com",
        password: "12345",
        name: "Test",
        role: "TECHNICIAN",
        specialty: "",
      });

      expect(result).toEqual({
        error: "La contraseña debe tener al menos 6 caracteres",
        status: 400,
      });
    });

    it("retorna error si nombre esta vacio", async () => {
      const result = await registerUser({
        email: "test@test.com",
        password: "password123",
        name: "",
        role: "TECHNICIAN",
        specialty: "",
      });

      expect(result).toEqual({
        error: "El nombre es requerido",
        status: 400,
      });
    });

    it("retorna error si el email ya existe", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "existing",
        email: "test@test.com",
      });

      const result = await registerUser({
        email: "test@test.com",
        password: "password123",
        name: "Test User",
        role: "TECHNICIAN",
        specialty: "",
      });

      expect(result).toEqual({
        error: "El email ya esta registrado",
        status: 409,
      });
    });

    it("registra usuario correctamente", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: "new-user",
        email: "nuevo@test.com",
        password: "hashed...",
        name: "Nuevo User",
        role: "TECHNICIAN",
        specialty: "",
      });

      const result = await registerUser({
        email: "nuevo@test.com",
        password: "password123",
        name: "Nuevo User",
        role: "TECHNICIAN",
        specialty: "",
      });

      expect("token" in result).toBe(true);
      if ("token" in result) {
        expect(result.user.email).toBe("nuevo@test.com");
        expect(result.user.role).toBe("TECHNICIAN");
        expect(result.token).toBe("mocked-jwt-token");
      }
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
    });
  });
});
