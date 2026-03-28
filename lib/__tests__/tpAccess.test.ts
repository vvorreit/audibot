import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { hasTPAccess } from "@/lib/tpAccess";

describe("hasTPAccess", () => {
  it("ADMIN a toujours accès (indépendamment du plan et isPro)", () => {
    expect(hasTPAccess("ADMIN", false, "FREE")).toBe(true);
    expect(hasTPAccess("ADMIN", false, "")).toBe(true);
  });

  it("isPro=true donne accès peu importe le plan", () => {
    expect(hasTPAccess("USER", true, "FREE")).toBe(true);
    expect(hasTPAccess("USER", true, "")).toBe(true);
  });

  it("plan FREE → pas d'accès", () => {
    expect(hasTPAccess("USER", false, "FREE")).toBe(false);
  });

  it("plan ESSENTIEL → accès", () => {
    expect(hasTPAccess("USER", false, "ESSENTIEL")).toBe(true);
  });

  it("plan PRO → accès", () => {
    expect(hasTPAccess("USER", false, "PRO")).toBe(true);
  });

  it("plan EQUIPE → accès", () => {
    expect(hasTPAccess("USER", false, "EQUIPE")).toBe(true);
  });

  it("plan ENTERPRISE → accès", () => {
    expect(hasTPAccess("USER", false, "ENTERPRISE")).toBe(true);
  });

  it("plan inconnu → pas d'accès", () => {
    expect(hasTPAccess("USER", false, "UNKNOWN_PLAN")).toBe(false);
  });

  it("chaîne vide → pas d'accès", () => {
    expect(hasTPAccess("USER", false, "")).toBe(false);
  });
});
