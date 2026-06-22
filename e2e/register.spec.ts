import { test, expect } from "@playwright/test";

test.describe("Registro de Usuario (Caja Negra)", () => {
  test("renderiza el formulario de registro", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Crear Cuenta" })
    ).toBeVisible();
    await expect(page.getByLabel("Nombre completo")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel(/Contraseña/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Crear Cuenta" })
    ).toBeVisible();
    await expect(page.getByText("Ya tienes cuenta?")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Inicia sesion" })
    ).toBeVisible();
  });

  test("navega a login desde el link", async ({ page }) => {
    await page.goto("/register");

    await page.getByRole("link", { name: "Inicia sesion" }).click();

    await expect(page).toHaveURL("/login");
    await expect(page.getByText("PC Repair Help Desk")).toBeVisible();
  });

  test("muestra error si el email ya existe", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Nombre completo").fill("Admin Dup");
    await page.getByLabel("Email").fill("admin@taller.com");
    await page.getByLabel(/Contraseña/).fill("123456");
    await page.getByRole("button", { name: "Crear Cuenta" }).click();

    await expect(page.locator(".text-danger")).toBeVisible({ timeout: 10000 });
  });

  test("muestra error si falta nombre", async ({ page }) => {
    await page.goto("/register");

    await page.getByLabel("Email").fill("nuevo@test.com");
    await page.getByLabel(/Contraseña/).fill("123456");
    await page.getByRole("button", { name: "Crear Cuenta" }).click();

    await expect(page.locator(".text-danger")).toBeVisible({ timeout: 10000 });
  });

  test("registra un nuevo usuario exitosamente", async ({ page }) => {
    const uniqueEmail = `test${Date.now()}@test.com`;

    await page.goto("/register");

    await page.getByLabel("Nombre completo").fill("Test User");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel(/Contraseña/).fill("123456");
    await page.getByRole("button", { name: "Crear Cuenta" }).click();

    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });
});
