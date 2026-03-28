import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  session: { user: { email: "user@test.com", id: "user_1" } } as { user: { email: string; id: string } } | null,
  prismaUser: { findUnique: vi.fn(), delete: vi.fn() },
  prismaOcrScanLog: { deleteMany: vi.fn() },
  prismaInjectionLog: { deleteMany: vi.fn() },
  prismaRpaLog: { deleteMany: vi.fn() },
  prismaRejetAutoDetecte: { deleteMany: vi.fn() },
  prismaDossierTP: { deleteMany: vi.fn() },
  prismaNotification: { deleteMany: vi.fn() },
  prismaAlerteExpiration: { deleteMany: vi.fn() },
  prismaScanSession: { deleteMany: vi.fn() },
  prismaOcrFeedback: { deleteMany: vi.fn() },
  prismaAdminAudit: { deleteMany: vi.fn() },
  prismaSmartFill: { deleteMany: vi.fn() },
  prismaInvitation: { deleteMany: vi.fn() },
  prismaLegal: { deleteMany: vi.fn() },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockImplementation(() => Promise.resolve(mocks.session)),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: mocks.prismaUser,
    ocrScanLog: mocks.prismaOcrScanLog,
    injectionLog: mocks.prismaInjectionLog,
    rpaLog: mocks.prismaRpaLog,
    rejetAutoDetecte: mocks.prismaRejetAutoDetecte,
    dossierTiersPayant: mocks.prismaDossierTP,
    notification: mocks.prismaNotification,
    alerteExpiration: mocks.prismaAlerteExpiration,
    scanSession: mocks.prismaScanSession,
    ocrFeedback: mocks.prismaOcrFeedback,
    adminAuditLog: mocks.prismaAdminAudit,
    smartFillCorrection: mocks.prismaSmartFill,
    invitation: mocks.prismaInvitation,
    legalAcceptance: mocks.prismaLegal,
    $transaction: vi.fn(async (ops: unknown[]) => Promise.all(ops)),
  },
}));

import { DELETE } from "@/app/api/user/delete/route";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.session = { user: { email: "user@test.com", id: "user_1" } };
});

describe("DELETE /api/user/delete", () => {
  it("retourne 401 si non authentifié", async () => {
    mocks.session = null;
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("retourne 200 et supprime le compte si authentifié (sans Stripe)", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue({ stripeSubscriptionId: null, stripeCustomerId: null });
    mocks.prismaUser.delete.mockResolvedValue({});
    const res = await DELETE();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.deletedEntities).toContain("user");
  });
});
