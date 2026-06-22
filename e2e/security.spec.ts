import { test, expect } from "@playwright/test";

test.describe("Seguridad (Caja Negra)", () => {
  test("SQL Injection en login no derriba la BD", async ({ page }) => {
    await page.goto("/");

    const sqlInjection = "'; DROP TABLE users; --";
    await page.getByLabel("Email").fill(sqlInjection);
    await page.getByLabel(/Contraseña/).fill(sqlInjection);
    await page.getByRole("button", { name: "Iniciar Sesion" }).click();

    await expect(page.locator(".text-danger")).toBeVisible({ timeout: 10000 });

    await page.goto("/");

    await page.getByLabel("Email").fill("admin@taller.com");
    await page.getByLabel(/Contraseña/).fill("123456");
    await page.getByRole("button", { name: "Iniciar Sesion" }).click();

    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("XSS en campo de email es sanitizado", async ({ page }) => {
    await page.goto("/");

    const xssPayload = "<script>alert('xss')</script>";
    await page.getByLabel("Email").fill(xssPayload);
    await page.getByLabel(/Contraseña/).fill("123456");
    await page.getByRole("button", { name: "Iniciar Sesion" }).click();

    await expect(page.locator(".text-danger")).toBeVisible({ timeout: 10000 });

    const scriptTags = await page.locator("script").count();
    expect(scriptTags).toBeGreaterThan(0);
  });

  test("ruta protegida sin token redirige a login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/login", { timeout: 5000 });
  });
});
