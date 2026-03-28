/**
 * Tests de sécurité — accès module Tiers Payant
 *
 * Données fictives uniquement. Aucune donnée santé patient réelle.
 */
import { describe, it, expect, vi } from "vitest";

// Mock Prisma, NextAuth et les dépendances serveur pour éviter les erreurs d'import
vi.mock("@/lib/db", () => ({
  prisma: { dossierTiersPayant: { create: vi.fn() }, $transaction: vi.fn() },
}));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/generateTPReference", () => ({
  generateTPReference: vi.fn().mockResolvedValue("TP-2026-TEST-0001"),
}));

import { hasTPAccess } from "@/lib/tpAccess";

describe("hasTPAccess — accès refusé (plan FREE, non-admin, non-pro)", () => {
  it("retourne false pour role=USER, isPro=false, plan=FREE", () => {
    expect(hasTPAccess("USER", false, "FREE")).toBe(false);
  });

  it("retourne false pour role vide, isPro=false, plan=FREE", () => {
    expect(hasTPAccess("", false, "FREE")).toBe(false);
  });

  it("retourne false pour role=USER, isPro=false, plan vide", () => {
    expect(hasTPAccess("USER", false, "")).toBe(false);
  });
});

describe("hasTPAccess — accès accordé (ADMIN)", () => {
  it("retourne true pour role=ADMIN, peu importe isPro et plan", () => {
    expect(hasTPAccess("ADMIN", false, "FREE")).toBe(true);
  });

  it("retourne true pour role=ADMIN avec isPro=true", () => {
    expect(hasTPAccess("ADMIN", true, "ESSENTIEL")).toBe(true);
  });
});

describe("hasTPAccess — accès accordé (isPro=true)", () => {
  it("retourne true si isPro=true, même avec plan=FREE", () => {
    expect(hasTPAccess("USER", true, "FREE")).toBe(true);
  });

  it("retourne true si isPro=true et role=USER", () => {
    expect(hasTPAccess("USER", true, "")).toBe(true);
  });
});

describe("hasTPAccess — accès accordé (plans payants)", () => {
  it("retourne true pour plan=ESSENTIEL", () => {
    expect(hasTPAccess("USER", false, "ESSENTIEL")).toBe(true);
  });

  it("retourne true pour plan=PRO", () => {
    expect(hasTPAccess("USER", false, "PRO")).toBe(true);
  });

  it("retourne true pour plan=EQUIPE", () => {
    expect(hasTPAccess("USER", false, "EQUIPE")).toBe(true);
  });

  it("retourne true pour plan=ENTERPRISE", () => {
    expect(hasTPAccess("USER", false, "ENTERPRISE")).toBe(true);
  });
});
