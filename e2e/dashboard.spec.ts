import { test, expect } from "@playwright/test";

test.describe("Dashboard — redirection et protection", () => {
  test("accès /dashboard sans auth → redirect signin", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/signin/);
    expect(page.url()).toContain("signin");
  });

  test("accès /admin sans auth → redirect signin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/signin/);
    expect(page.url()).toContain("signin");
  });

  test("accès /tiers-payant sans auth → redirect signin", async ({ page }) => {
    await page.goto("/tiers-payant");
    await page.waitForURL(/signin/);
    expect(page.url()).toContain("signin");
  });
});
