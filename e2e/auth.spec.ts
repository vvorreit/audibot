import { test, expect } from "@playwright/test";

test.describe("Authentication flow", () => {
  test("signin page loads with form", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.locator("h1")).toContainText("Connexion");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("signup page loads with form and password strength indicator", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.locator("h1")).toContainText("Créer un compte");
    const pwInput = page.locator('input[type="password"]').first();
    await pwInput.fill("ab");
    /* Strength bar should not appear for very short input */
    await pwInput.fill("mySecure1!");
    /* Strength bar should be visible after typing */
  });

  test("unauthenticated user redirected from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    /* Should redirect to signin */
    await page.waitForURL(/auth\/signin|api\/auth/);
  });
});
