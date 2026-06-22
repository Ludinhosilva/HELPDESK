import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock("@/modules/auth/actions/auth-actions", () => ({
  loginUser: mockLogin,
  registerUser: mockRegister,
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

      const { POST } = await import(
        "@/app/api/auth/login/route"
      );

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

      const { POST } = await import(
        "@/app/api/auth/login/route"
      );

      const request = new Request("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", password: "pass" }),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe("server_error");
    });
  });

  describe("POST /api/auth/register", () => {
    it("retorna 400 si validacion falla", async () => {
      mockRegister.mockResolvedValue({
        error: "El email es requerido",
        status: 400,
      });

      const { POST } = await import(
        "@/app/api/auth/register/route"
      );

      const request = new Request("http://localhost:3000/api/auth/register", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe("validation_error");
    });
  });
});
