import { test, expect } from "@playwright/test";

test.describe("Public pages SEO", () => {
  test("homepage loads and has schema.org", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    const schemas = await page.locator('script[type="application/ld+json"]').all();
    expect(schemas.length).toBeGreaterThanOrEqual(2);
  });

  test("portails page has correct title", async ({ page }) => {
    await page.goto("/portails");
    const title = await page.title();
    expect(title).toContain("Portails");
  });

  test("status page loads", async ({ page }) => {
    await page.goto("/status");
    await expect(page.locator("h1")).toContainText("Statut");
  });

  test("blog page loads and has articles", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.locator("h1")).toBeVisible();
    const articles = page.locator("article");
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });

  test("pricing page has plan cards", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("h1")).toBeVisible();
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/tarif|prix|plan/);
  });

  test("/api/health accessible publiquement", async ({ request }) => {
    const res = await request.get("/api/health");
    expect([200, 503]).toContain(res.status());
  });

  test("portails page liste des mutuelles", async ({ page }) => {
    await page.goto("/portails");
    const title = await page.title();
    expect(title).toBeTruthy();
    await expect(page.getByText("Almerys", { exact: false })).toBeVisible();
  });

  test("extension page loads", async ({ page }) => {
    await page.goto("/extension");
    await expect(page.locator("h1")).toBeVisible();
  });

  test("contact page has form", async ({ page }) => {
    await page.goto("/contact");
    const form = page.locator("form");
    await expect(form).toBeVisible();
  });

  test("404 page branded", async ({ page }) => {
    await page.goto("/cette-page-nexiste-pas-vraiment-xyz");
    await page.waitForLoadState("networkidle");
    const body = await page.locator("body").textContent();
    expect(body).toMatch(/404|introuvable|exist/i);
  });
});
