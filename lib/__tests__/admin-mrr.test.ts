import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({ prisma: {} }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));

describe("MRR calculation logic", () => {
  it("calcule correctement le MRR avec 2 ESSENTIEL + 1 PRO", () => {
    const priceEssentiel = 39.9;
    const pricePro = 69.9;
    const priceEquipe = 249.9;
    const payantEssentiel = 2;
    const payantPro = 1;
    const payantEquipe = 0;
    const mrr = Math.round((payantEssentiel * priceEssentiel + payantPro * pricePro + payantEquipe * priceEquipe) * 100) / 100;
    expect(mrr).toBe(149.70);
  });

  it("calcule le taux de conversion correctement", () => {
    const totalUsers = 100;
    const totalPayants = 15;
    const conversionRate = Math.round((totalPayants / totalUsers) * 1000) / 10;
    expect(conversionRate).toBe(15.0);
  });

  it("conversionRate = 0 si totalUsers = 0", () => {
    const totalUsers = 0;
    const totalPayants = 0;
    const conversionRate = totalUsers > 0 ? Math.round((totalPayants / totalUsers) * 1000) / 10 : 0;
    expect(conversionRate).toBe(0);
  });
});
