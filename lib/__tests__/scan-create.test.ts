import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ─────────────────────────────────────── */

const mocks = vi.hoisted(() => ({
  session: null as { user: { id: string; email: string } } | null,
  prismaScanSession: {
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  rateLimit: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockImplementation(() => Promise.resolve(mocks.session)),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

vi.mock("@/lib/db", () => ({
  prisma: {
    scanSession: mocks.prismaScanSession,
  },
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => mocks.rateLimit(...args),
}));

import { POST } from "@/app/api/scan/create/route";

describe("POST /api/scan/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session = null;
    mocks.rateLimit.mockResolvedValue(true);
  });

  it("retourne 401 si non authentifié", async () => {
    mocks.session = null;
    const res = await POST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toContain("authentifié");
  });

  it("crée une ScanSession avec expiresAt dans ~90s", async () => {
    mocks.session = { user: { id: "u1", email: "a@b.com" } };
    mocks.prismaScanSession.deleteMany.mockResolvedValue({ count: 0 });
    mocks.prismaScanSession.create.mockResolvedValue({ id: "sess_123" });

    const before = Date.now();
    const res = await POST();
    const after = Date.now();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("sessionId", "sess_123");

    // Verify expiresAt is roughly 90s in the future
    const createCall = mocks.prismaScanSession.create.mock.calls[0][0];
    const expiresAt = new Date(createCall.data.expiresAt).getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + 89_000);
    expect(expiresAt).toBeLessThanOrEqual(after + 91_000);
  });

  it("supprime les sessions expirées avant d'en créer une nouvelle", async () => {
    mocks.session = { user: { id: "u1", email: "a@b.com" } };
    mocks.prismaScanSession.deleteMany.mockResolvedValue({ count: 3 });
    mocks.prismaScanSession.create.mockResolvedValue({ id: "sess_new" });

    await POST();

    // deleteMany should be called before create
    expect(mocks.prismaScanSession.deleteMany).toHaveBeenCalledOnce();
    const deleteCall = mocks.prismaScanSession.deleteMany.mock.calls[0][0];
    expect(deleteCall.where).toHaveProperty("userId", "u1");
    expect(deleteCall.where.expiresAt).toHaveProperty("lt");
    expect(mocks.prismaScanSession.create).toHaveBeenCalledOnce();
  });

  it("retourne 429 si rate limit atteint (>10 requêtes en 60s)", async () => {
    mocks.session = { user: { id: "u1", email: "a@b.com" } };
    mocks.rateLimit.mockResolvedValue(false);

    const res = await POST();
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("requêtes");
  });

  it("retourne { sessionId } en JSON avec status 200", async () => {
    mocks.session = { user: { id: "u1", email: "a@b.com" } };
    mocks.prismaScanSession.deleteMany.mockResolvedValue({ count: 0 });
    mocks.prismaScanSession.create.mockResolvedValue({ id: "abc-def-ghi" });

    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ sessionId: "abc-def-ghi" });
  });

  it("appelle rateLimit avec la bonne clé", async () => {
    mocks.session = { user: { id: "user_42", email: "a@b.com" } };
    mocks.prismaScanSession.deleteMany.mockResolvedValue({ count: 0 });
    mocks.prismaScanSession.create.mockResolvedValue({ id: "x" });

    await POST();

    expect(mocks.rateLimit).toHaveBeenCalledWith("scan-create:user_42", 10, 60_000);
  });
});
