import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const session = {
    user: { email: "admin@test.com", name: "Admin", role: "ADMIN", isPro: true },
  };
  const prismaUser = { findUnique: vi.fn() };
  const prismaDossier = { create: vi.fn() };
  const prismaCounter = { upsert: vi.fn() };
  return { session, prismaUser, prismaDossier, prismaCounter };
});

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue(mocks.session),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: mocks.prismaUser,
    dossierTiersPayant: mocks.prismaDossier,
    tpCounter: mocks.prismaCounter,
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        tpCounter: mocks.prismaCounter,
        dossierTiersPayant: mocks.prismaDossier,
      };
      return fn(tx);
    }),
  },
}));

vi.mock("@/lib/generateTPReference", () => ({
  generateTPReference: vi.fn().mockResolvedValue("TP-2026-0001"),
}));

vi.mock("@/lib/tpAccess", () => ({
  hasTPAccess: vi.fn().mockReturnValue(true),
  requireTPUser: vi.fn().mockResolvedValue({ id: "user_1", email: "admin@test.com", role: "ADMIN", name: "Admin", teamId: null }),
  tpUserFilter: vi.fn().mockResolvedValue({ userId: "user_1" }),
}));

vi.mock("@/app/actions/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}));

import { createDossierTP } from "@/app/tiers-payant/actions";

describe("createDossierTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prismaUser.findUnique.mockResolvedValue({ id: "admin-id", role: "ADMIN" });
    mocks.prismaDossier.create.mockResolvedValue({
      id: "d1", reference: "TP-2026-0001", mutuelle: "CPAM",
      montant: 100, dateEnvoi: new Date(), statut: "EN_ATTENTE",
    });
    mocks.prismaCounter.upsert.mockResolvedValue({ lastNumber: 1 });
  });

  it("rejects invalid mutuelle", async () => {
    await expect(createDossierTP({
      mutuelle: "INVALIDE", montant: 100, dateEnvoi: "2026-01-15",
    })).rejects.toThrow("Mutuelle invalide");
  });

  it("rejects montant <= 0", async () => {
    await expect(createDossierTP({
      mutuelle: "CPAM", montant: 0, dateEnvoi: "2026-01-15",
    })).rejects.toThrow("montant");
  });

  it("rejects montant > 100000", async () => {
    await expect(createDossierTP({
      mutuelle: "CPAM", montant: 100001, dateEnvoi: "2026-01-15",
    })).rejects.toThrow("montant");
  });

  it("rejects future date", async () => {
    const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await expect(createDossierTP({
      mutuelle: "CPAM", montant: 100, dateEnvoi: future,
    })).rejects.toThrow("futur");
  });

  it("rejects invalid date", async () => {
    await expect(createDossierTP({
      mutuelle: "CPAM", montant: 100, dateEnvoi: "not-a-date",
    })).rejects.toThrow("invalide");
  });

  it("rejects too long referenceInterne", async () => {
    await expect(createDossierTP({
      mutuelle: "CPAM", montant: 100, dateEnvoi: "2026-01-15",
      referenceInterne: "x".repeat(51),
    })).rejects.toThrow("Reference interne");
  });

  it("rejects non-alphanumeric numeroAdherent", async () => {
    await expect(createDossierTP({
      mutuelle: "CPAM", montant: 100, dateEnvoi: "2026-01-15",
      numeroAdherent: "<script>alert(1)</script>",
    })).rejects.toThrow("Numero adherent");
  });

  it("creates dossier with valid input", async () => {
    const result = await createDossierTP({
      mutuelle: "CPAM", montant: 150.50, dateEnvoi: "2026-01-15",
      numeroAdherent: "123456", referenceInterne: "CMD-001",
    });
    expect(result.reference).toBe("TP-2026-0001");
    expect(mocks.prismaDossier.create).toHaveBeenCalled();
  });
});
