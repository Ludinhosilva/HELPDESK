import { test, expect } from "@playwright/test";

test.describe("Auth Guard (Caja Negra)", () => {
  test("redirige a login al acceder a /dashboard sin autenticacion", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL("/login", { timeout: 5000 });
    await expect(page.getByText("PC Repair Help Desk")).toBeVisible();
  });

  test("redirige a login al acceder a /dashboard/tickets sin auth", async ({
    page,
  }) => {
    await page.goto("/dashboard/tickets");

    await expect(page).toHaveURL("/login", { timeout: 5000 });
  });

  test("redirige a login al acceder a /dashboard/customers sin auth", async ({
    page,
  }) => {
    await page.goto("/dashboard/customers");

    await expect(page).toHaveURL("/login", { timeout: 5000 });
  });

  test("/login y /register son accesibles sin autenticacion", async ({
    page,
  }) => {
    await page.goto("/login");
    await expect(page.getByText("PC Repair Help Desk")).toBeVisible();

    await page.goto("/register");
    await expect(
      page.getByRole("heading", { name: "Crear Cuenta" })
    ).toBeVisible();
  });
});
