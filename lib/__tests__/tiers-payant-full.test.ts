import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ─────────────────────────────────────── */

const mocks = vi.hoisted(() => {
  const prismaDossier = {
    create: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const prismaHistorique = { create: vi.fn() };
  const prismaCounter = { upsert: vi.fn() };
  return { prismaDossier, prismaHistorique, prismaCounter };
});

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { email: "admin@test.fr", name: "Admin", role: "ADMIN" },
  }),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/db", () => ({
  prisma: {
    dossierTiersPayant: mocks.prismaDossier,
    historiqueStatutTP: mocks.prismaHistorique,
    tpCounter: mocks.prismaCounter,
    $transaction: vi.fn(async (fnOrArray: unknown) => {
      if (typeof fnOrArray === "function") {
        const tx = {
          tpCounter: mocks.prismaCounter,
          dossierTiersPayant: mocks.prismaDossier,
        };
        return (fnOrArray as (tx: unknown) => Promise<unknown>)(tx);
      }
      // Array of promises — execute them
      for (const p of fnOrArray as Promise<unknown>[]) await p;
    }),
  },
}));

vi.mock("@/lib/generateTPReference", () => ({
  generateTPReference: vi.fn().mockResolvedValue("TP-2026-0001"),
}));

vi.mock("@/lib/tpAccess", () => ({
  requireTPUser: vi.fn().mockResolvedValue({
    id: "user_1",
    email: "admin@test.fr",
    role: "ADMIN",
    name: "Admin",
    teamId: null,
  }),
  tpUserFilter: vi.fn().mockResolvedValue({ userId: "user_1" }),
  hasTPAccess: vi.fn().mockReturnValue(true),
}));

vi.mock("@/app/actions/notifications", () => ({
  createNotification: vi.fn().mockResolvedValue({}),
}));

import { createDossierTP, updateStatutDossierTP, getDossiersTP } from "@/app/tiers-payant/actions";

describe("createDossierTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prismaDossier.create.mockResolvedValue({
      id: "d1",
      reference: "TP-2026-0001",
      mutuelle: "CPAM",
      montant: 150,
      dateEnvoi: new Date(),
      statut: "EN_ATTENTE",
    });
    mocks.prismaCounter.upsert.mockResolvedValue({ lastNumber: 1 });
  });

  it("crée un dossier TP avec données valides → retourne référence TP-XXXX-XXXX", async () => {
    const result = await createDossierTP({
      mutuelle: "CPAM",
      montant: 150,
      dateEnvoi: "2026-01-15",
    });
    expect(result.reference).toBe("TP-2026-0001");
    expect(mocks.prismaDossier.create).toHaveBeenCalledOnce();
  });

  it("throw si mutuelle invalide", async () => {
    await expect(
      createDossierTP({ mutuelle: "MUTUELLE_INEXISTANTE", montant: 100, dateEnvoi: "2026-01-15" })
    ).rejects.toThrow("Mutuelle invalide");
  });

  it("throw si montant négatif", async () => {
    await expect(
      createDossierTP({ mutuelle: "CPAM", montant: -50, dateEnvoi: "2026-01-15" })
    ).rejects.toThrow("montant");
  });

  it("throw si montant est 0", async () => {
    await expect(
      createDossierTP({ mutuelle: "CPAM", montant: 0, dateEnvoi: "2026-01-15" })
    ).rejects.toThrow("montant");
  });

  it("throw si date d'envoi dans le futur", async () => {
    const future = new Date(Date.now() + 7 * 86_400_000).toISOString().split("T")[0];
    await expect(
      createDossierTP({ mutuelle: "CPAM", montant: 100, dateEnvoi: future })
    ).rejects.toThrow("futur");
  });

  it("throw si date invalide", async () => {
    await expect(
      createDossierTP({ mutuelle: "CPAM", montant: 100, dateEnvoi: "not-a-date" })
    ).rejects.toThrow("Date");
  });

  it("accepte toutes les mutuelles valides", async () => {
    const mutuelles = [
      "CPAM", "ALMERYS", "VIAMEDIS", "ITELIS", "KALIXIA",
      "CARTE_BLANCHE", "SANTECLAIR", "SEVEANE", "SP_SANTE", "AUTRE",
    ];
    for (const m of mutuelles) {
      mocks.prismaDossier.create.mockResolvedValue({
        id: "d", reference: "TP-2026-0001", mutuelle: m,
        montant: 100, dateEnvoi: new Date(), statut: "EN_ATTENTE",
      });
      const result = await createDossierTP({
        mutuelle: m,
        montant: 100,
        dateEnvoi: "2026-01-15",
      });
      expect(result.reference).toBeTruthy();
    }
  });
});

describe("updateStatutDossierTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prismaDossier.findFirst.mockResolvedValue({
      id: "d1",
      statut: "EN_ATTENTE",
      reference: "TP-2026-0001",
    });
    mocks.prismaDossier.update.mockResolvedValue({});
    mocks.prismaHistorique.create.mockResolvedValue({});
  });

  it("changement statut REJETE avec motif → met à jour statut + crée HistoriqueStatutTP", async () => {
    const result = await updateStatutDossierTP({
      dossierId: "d1",
      nouveauStatut: "REJETE",
      motifRejet: "doublon",
      commentaire: "Dossier en double",
    });
    expect(result.statut).toBe("REJETE");
    expect(result.reference).toBe("TP-2026-0001");
  });

  it("changement statut RECU avec montant reçu", async () => {
    const result = await updateStatutDossierTP({
      dossierId: "d1",
      nouveauStatut: "RECU",
      montantRecu: 150,
      dateReception: "2026-03-15",
    });
    expect(result.statut).toBe("RECU");
  });

  it("throw si montant reçu manquant pour statut RECU", async () => {
    await expect(
      updateStatutDossierTP({
        dossierId: "d1",
        nouveauStatut: "RECU",
        dateReception: "2026-03-15",
      })
    ).rejects.toThrow("montant");
  });

  it("throw si date réception manquante pour statut RECU", async () => {
    await expect(
      updateStatutDossierTP({
        dossierId: "d1",
        nouveauStatut: "RECU",
        montantRecu: 100,
      })
    ).rejects.toThrow("date de reception");
  });

  it("throw si dossier introuvable", async () => {
    mocks.prismaDossier.findFirst.mockResolvedValue(null);
    await expect(
      updateStatutDossierTP({ dossierId: "invalid", nouveauStatut: "RECU", montantRecu: 100, dateReception: "2026-03-15" })
    ).rejects.toThrow("introuvable");
  });

  it("throw si statut est déjà le même", async () => {
    mocks.prismaDossier.findFirst.mockResolvedValue({
      id: "d1",
      statut: "REJETE",
      reference: "TP-2026-0001",
    });
    await expect(
      updateStatutDossierTP({ dossierId: "d1", nouveauStatut: "REJETE" })
    ).rejects.toThrow("deja dans ce statut");
  });

  it("throw si EN_LITIGE sans commentaire", async () => {
    await expect(
      updateStatutDossierTP({ dossierId: "d1", nouveauStatut: "EN_LITIGE" })
    ).rejects.toThrow("commentaire");
  });

  it("throw si motif de rejet invalide", async () => {
    await expect(
      updateStatutDossierTP({
        dossierId: "d1",
        nouveauStatut: "REJETE",
        motifRejet: "motif_inexistant",
      })
    ).rejects.toThrow("Motif de rejet invalide");
  });
});

describe("getDossiersTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne dossiers avec pagination", async () => {
    mocks.prismaDossier.count.mockResolvedValue(2);
    mocks.prismaDossier.findMany.mockResolvedValue([
      {
        id: "d1",
        reference: "TP-2026-0001",
        mutuelle: "CPAM",
        montant: 150,
        dateEnvoi: new Date("2026-01-15"),
        numeroAdherent: null,
        referenceInterne: null,
        statut: "EN_ATTENTE",
        montantRecu: null,
        dateReception: null,
        motifRejet: null,
        commentaire: null,
        mode: "NORMAL",
        createdAt: new Date(),
        user: { name: "Admin", email: "admin@test.fr" },
        historique: [],
      },
    ]);

    const result = await getDossiersTP(1, 50);
    expect(result.total).toBe(2);
    expect(result.dossiers).toHaveLength(1);
    expect(result.dossiers[0].reference).toBe("TP-2026-0001");
    expect(result.dossiers[0].mutuelle).toBe("CPAM");
  });
});
