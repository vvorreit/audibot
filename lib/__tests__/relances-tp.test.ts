import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ─────────────────────────────────────── */

const mocks = vi.hoisted(() => ({
  prismaRegleRelance: { findMany: vi.fn() },
  prismaDossier: { findMany: vi.fn(), update: vi.fn() },
  prismaRelanceLog: { create: vi.fn() },
  prismaTemplateRelance: { findMany: vi.fn() },
  sendMail: vi.fn(),
  smtpConfigured: vi.fn(),
  sendRelanceEmail: vi.fn(),
  createNotification: vi.fn(),
  safeCompare: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    regleRelance: mocks.prismaRegleRelance,
    dossierTiersPayant: mocks.prismaDossier,
    relanceLog: mocks.prismaRelanceLog,
    templateRelance: mocks.prismaTemplateRelance,
    $transaction: vi.fn(async (arr: unknown[]) => {
      for (const p of arr as Promise<unknown>[]) await p;
    }),
  },
}));

vi.mock("@/lib/mailer", () => ({
  sendMail: (...args: unknown[]) => mocks.sendMail(...args),
  smtpConfigured: () => mocks.smtpConfigured(),
}));

vi.mock("@/lib/relance-emails", () => ({
  sendRelanceEmail: (...args: unknown[]) => mocks.sendRelanceEmail(...args),
}));

vi.mock("@/app/actions/notifications", () => ({
  createNotification: (...args: unknown[]) => mocks.createNotification(...args),
}));

vi.mock("@/lib/safeCompare", () => ({
  safeCompare: (...args: unknown[]) => mocks.safeCompare(...args),
}));

import { GET } from "@/app/api/cron/relances-tp/route";

function makeReq(secret?: string): Request {
  const headers: Record<string, string> = {};
  if (secret) headers.authorization = `Bearer ${secret}`;
  return new Request("http://localhost/api/cron/relances-tp", { headers });
}

describe("GET /api/cron/relances-tp", () => {
  const originalEnv = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
    mocks.safeCompare.mockImplementation((a: string, b: string) => a === b);
    mocks.smtpConfigured.mockReturnValue(true);
    mocks.sendMail.mockResolvedValue({});
    mocks.sendRelanceEmail.mockResolvedValue({ sent: true, to: "gestion@test.fr" });
    mocks.createNotification.mockResolvedValue({});
    mocks.prismaRelanceLog.create.mockResolvedValue({});
    mocks.prismaDossier.update.mockResolvedValue({});
    mocks.prismaTemplateRelance.findMany.mockResolvedValue([]);
  });

  afterAll(() => {
    process.env.CRON_SECRET = originalEnv;
  });

  it("retourne 401 sans authorization header", async () => {
    const res = await GET(makeReq());
    expect(res.status).toBe(401);
  });

  it("retourne 401 avec mauvais secret", async () => {
    mocks.safeCompare.mockReturnValue(false);
    const res = await GET(makeReq("wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("retourne sent=0 si aucune règle active", async () => {
    mocks.prismaRegleRelance.findMany.mockResolvedValue([]);
    const res = await GET(makeReq("test-secret"));
    const body = await res.json();
    expect(body.sent).toBe(0);
  });

  it("relance un dossier EN_ATTENTE depuis 30j si règle 30j existe", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    mocks.prismaRegleRelance.findMany.mockResolvedValue([
      { id: "r1", delaiJours: 30, action: "email", actif: true, mutuelle: null },
    ]);
    mocks.prismaDossier.findMany.mockResolvedValue([
      {
        id: "d1",
        reference: "TP-2026-0001",
        mutuelle: "CPAM",
        montant: 150,
        dateEnvoi: thirtyDaysAgo,
        relanceDesactivee: false,
        relanceCount: 0,
        userId: "user_1",
        relances: [],
        user: { name: "Test", email: "user@test.fr" },
      },
    ]);

    const res = await GET(makeReq("test-secret"));
    const body = await res.json();
    expect(body.sent).toBe(1);
    expect(mocks.createNotification).toHaveBeenCalledWith(
      "user_1",
      "relance_tp",
      "Relance envoyée",
      expect.stringContaining("TP-2026-0001"),
      "/tiers-payant"
    );
  });

  it("ne re-relance pas un dossier déjà relancé à J+30", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    mocks.prismaRegleRelance.findMany.mockResolvedValue([
      { id: "r1", delaiJours: 30, action: "email", actif: true, mutuelle: null },
    ]);
    mocks.prismaDossier.findMany.mockResolvedValue([
      {
        id: "d1",
        reference: "TP-2026-0001",
        mutuelle: "CPAM",
        montant: 150,
        dateEnvoi: thirtyDaysAgo,
        relanceDesactivee: false,
        relanceCount: 1,
        userId: "user_1",
        relances: [{ delaiJours: 30 }], // already relanced at 30 days
        user: { name: "Test", email: "user@test.fr" },
      },
    ]);

    const res = await GET(makeReq("test-secret"));
    const body = await res.json();
    expect(body.sent).toBe(0);
  });

  it("exclut les dossiers RECU (query filter)", async () => {
    // The route queries only EN_ATTENTE dossiers, so RECU won't appear
    mocks.prismaRegleRelance.findMany.mockResolvedValue([
      { id: "r1", delaiJours: 30, action: "email", actif: true, mutuelle: null },
    ]);
    mocks.prismaDossier.findMany.mockResolvedValue([]); // no EN_ATTENTE dossiers

    const res = await GET(makeReq("test-secret"));
    const body = await res.json();
    expect(body.sent).toBe(0);

    // Verify query filters for EN_ATTENTE only
    expect(mocks.prismaDossier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          statut: "EN_ATTENTE",
        }),
      })
    );
  });

  it("template mutuelle spécifique → prioritaire sur template générique", async () => {
    const fifteenDaysAgo = new Date(Date.now() - 15 * 86_400_000);

    mocks.prismaRegleRelance.findMany.mockResolvedValue([
      { id: "r1", delaiJours: 15, action: "email", actif: true, mutuelle: null },
    ]);
    mocks.prismaDossier.findMany.mockResolvedValue([
      {
        id: "d1",
        reference: "TP-2026-0001",
        mutuelle: "ALMERYS",
        montant: 200,
        dateEnvoi: fifteenDaysAgo,
        relanceDesactivee: false,
        relanceCount: 0,
        userId: "user_1",
        relances: [],
        user: { name: "Test", email: "user@test.fr" },
      },
    ]);

    // Two templates: one generic, one specific to ALMERYS
    mocks.prismaTemplateRelance.findMany.mockResolvedValue([
      { id: "t1", type: "amiable", objet: "Relance Almerys", contenu: "Texte ALMERYS spécifique", delaiJours: 15, actif: true, createdAt: new Date() },
      { id: "t2", type: "amiable", objet: "Relance générique", contenu: "Texte générique", delaiJours: 15, actif: true, createdAt: new Date(Date.now() - 1000) },
    ]);

    await GET(makeReq("test-secret"));

    // sendRelanceEmail should be called with the ALMERYS-specific template
    expect(mocks.sendRelanceEmail).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "TP-2026-0001", mutuelle: "ALMERYS" }),
      expect.objectContaining({ objet: "Relance Almerys" }),
      "user@test.fr"
    );
  });

  it("règle avec mutuelle spécifique ne s'applique pas aux autres mutuelles", async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    mocks.prismaRegleRelance.findMany.mockResolvedValue([
      { id: "r1", delaiJours: 30, action: "email", actif: true, mutuelle: "VIAMEDIS" },
    ]);
    mocks.prismaDossier.findMany.mockResolvedValue([
      {
        id: "d1",
        reference: "TP-2026-0001",
        mutuelle: "CPAM",
        montant: 100,
        dateEnvoi: thirtyDaysAgo,
        relanceDesactivee: false,
        relanceCount: 0,
        userId: "user_1",
        relances: [],
        user: { name: "Test", email: "user@test.fr" },
      },
    ]);

    const res = await GET(makeReq("test-secret"));
    const body = await res.json();
    expect(body.sent).toBe(0);
  });

  it("sendRelanceEmail appelé avec les bonnes données", async () => {
    const twentyDaysAgo = new Date(Date.now() - 20 * 86_400_000);

    mocks.prismaRegleRelance.findMany.mockResolvedValue([
      { id: "r1", delaiJours: 20, action: "email", actif: true, mutuelle: null },
    ]);
    mocks.prismaDossier.findMany.mockResolvedValue([
      {
        id: "d1",
        reference: "TP-2026-0042",
        mutuelle: "KALIXIA",
        montant: 300.5,
        dateEnvoi: twentyDaysAgo,
        relanceDesactivee: false,
        relanceCount: 0,
        userId: "user_1",
        relances: [],
        user: { name: "Dr Martin", email: "martin@opticien.fr" },
      },
    ]);

    await GET(makeReq("test-secret"));

    expect(mocks.sendRelanceEmail).toHaveBeenCalledOnce();
    const call = mocks.sendRelanceEmail.mock.calls[0];
    expect(call[0]).toMatchObject({
      reference: "TP-2026-0042",
      mutuelle: "KALIXIA",
      montant: 300.5,
    });
    expect(call[2]).toBe("martin@opticien.fr");
  });
});
