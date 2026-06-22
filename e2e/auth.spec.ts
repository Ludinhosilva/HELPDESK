import { test, expect } from "@playwright/test";

test.describe("Login (Caja Negra)", () => {
  test("renderiza el formulario de login correctamente", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("PC Repair Help Desk")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel(/Contraseña/)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Iniciar Sesion" })
    ).toBeVisible();
    await expect(page.getByText("No tienes cuenta?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Registrate" })).toBeVisible();
  });

  test("navega a registro desde el link", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Registrate" }).click();
    await page.waitForURL("/register");

    await expect(
      page.getByRole("heading", { name: "Crear Cuenta" })
    ).toBeVisible();
  });

  test("muestra error con credenciales incorrectas", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Email").fill("noexiste@test.com");
    await page.getByLabel(/Contraseña/).fill("wrongpassword");
    await page.getByRole("button", { name: "Iniciar Sesion" }).click();

    await expect(page.locator(".text-danger")).toBeVisible({ timeout: 10000 });
  });

  test("inicia sesion exitosamente con admin por defecto", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Email").fill("admin@taller.com");
    await page.getByLabel(/Contraseña/).fill("123456");
    await page.getByRole("button", { name: "Iniciar Sesion" }).click();

    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });

  test("campos vacios no envian el formulario", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Iniciar Sesion" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByLabel("Email")).toBeVisible();
  });
});
