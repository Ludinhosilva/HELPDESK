import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLogin = vi.fn();
const mockRegisterCompany = vi.fn();
const mockRegisterPersonal = vi.fn();

vi.mock("@/lib/auth-actions", () => ({
  loginUser: mockLogin,
  registerCompany: mockRegisterCompany,
  registerPersonal: mockRegisterPersonal,
}));

describe("Auth API Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("retorna 401 si credenciales invalidas", async () => {
      mockLogin.mockResolvedValue({
        error: "Credenciales invalidas",
        status: 401,
      });

      const { POST } = await import("@/app/api/auth/login/route");

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", password: "wrong" }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe("unauthorized");
      expect(body.message).toBe("Credenciales invalidas");
    });

    it("retorna 500 si ocurre un error inesperado", async () => {
      mockLogin.mockRejectedValue(new Error("DB error"));

      const { POST } = await import("@/app/api/auth/login/route");

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", password: "pass" }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("server_error");
    });

    it("retorna 200 con token si login exitoso", async () => {
      mockLogin.mockResolvedValue({
        user: { id: "u1", name: "Test", email: "test@test.com", role: "ADMIN", orgId: "org-1" },
        token: "mocked-jwt-token",
      });

      const { POST } = await import("@/app/api/auth/login/route");

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", password: "correct" }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.user.role).toBe("ADMIN");
    });
  });

  describe("POST /api/auth/register", () => {
    it("retorna 400 si validacion falla", async () => {
      mockRegisterPersonal.mockResolvedValue({
        error: "El nombre es requerido",
        status: 400,
      });

      const { POST } = await import("@/app/api/auth/register/route");

      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("conflict");
    });

    it("retorna 201 si registro exitoso", async () => {
      mockRegisterCompany.mockResolvedValue({
        message: "Organizacion y usuario administrador creados correctamente",
        status: 201,
      });

      const { POST } = await import("@/app/api/auth/register/route");

      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          orgName: "Test Corp",
          name: "Test User",
          email: "test@test.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body.message).toBeDefined();
    });
  });
});
