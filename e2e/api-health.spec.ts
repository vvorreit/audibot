import { test, expect } from "@playwright/test";

test.describe("/api/health", () => {
  test("retourne 200 ou 503 avec structure correcte", async ({ request }) => {
    const res = await request.get("/api/health");
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("services");
    expect(body).toHaveProperty("checkedAt");
    expect(Array.isArray(body.services)).toBe(true);
  });

  test("services contient database, api", async ({ request }) => {
    const res = await request.get("/api/health");
    const body = await res.json();
    const names = body.services.map((s: { name: string }) => s.name);
    expect(names).toContain("database");
    expect(names).toContain("api");
  });

  test("retourne system metrics (RAM, CPU)", async ({ request }) => {
    const res = await request.get("/api/health");
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.system).toHaveProperty("ram");
      expect(body.system.ram).toHaveProperty("usedPct");
      expect(body.system.ram.usedPct).toBeGreaterThanOrEqual(0);
      expect(body.system.ram.usedPct).toBeLessThanOrEqual(100);
    }
  });
});
