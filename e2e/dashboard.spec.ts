import { test, expect } from "@playwright/test";

test.describe("Dashboard (Caja Negra)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Email").fill("admin@taller.com");
    await page.getByLabel(/Contraseña/).fill("123456");
    await page.getByRole("button", { name: "Iniciar Sesion" }).click();

    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("muestra el sidebar con navegacion", async ({ page }) => {
    const navLabels = ["Dashboard", "Tickets", "Clientes", "Equipos", "Tecnicos"];
    for (const label of navLabels) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Salir" })).toBeVisible();
  });

  test("muestra las 4 cards de estadisticas", async ({ page }) => {
    await expect(page.locator("main").getByText("Tickets Activos")).toBeVisible();
    await expect(page.locator("main").getByText("Clientes")).toBeVisible();
    await expect(page.locator("main").getByText("Equipos")).toBeVisible();
    await expect(page.locator("main").getByText("Tecnicos")).toBeVisible();
  });

  test("navega entre paginas del sidebar", async ({ page }) => {
    await page.getByRole("button", { name: "Tickets" }).click();
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toContainText("Gestion de ordenes", { timeout: 5000 });

    await page.getByRole("button", { name: "Clientes" }).click();
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toContainText("Gestion de clientes", { timeout: 5000 });

    await page.getByRole("button", { name: "Dashboard" }).click();
    await page.waitForTimeout(2000);
    await expect(page.locator("main")).toContainText("Tickets Activos", { timeout: 5000 });
  });

  test("el sidebar es colapsable", async ({ page }) => {
    const asideBefore = await page.locator("aside").first();
    const widthBefore = (await asideBefore.boundingBox())?.width || 240;

    const toggleBtn = page.locator("button").filter({ has: page.locator("svg") }).first();
    if (await toggleBtn.isVisible().catch(() => false)) {
      await toggleBtn.click();
      await page.waitForTimeout(500);
    }

    const asideAfter = await page.locator("aside").first();
    const widthAfter = (await asideAfter.boundingBox())?.width || 240;

    expect(widthAfter).not.toBe(widthBefore);
  });

  test("cierra sesion correctamente", async ({ page }) => {
    await page.getByRole("button", { name: "Salir" }).click();
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL(/login/, { timeout: 10000 });
    await expect(page.getByText("PC Repair Help Desk")).toBeVisible();
  });
});
