import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mocks ─────────────────────────────────────── */

const mocks = vi.hoisted(() => ({
  prismaUser: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  prismaRejet: { create: vi.fn() },
  prismaDossier: { findFirst: vi.fn() },
  session: null as { user: { email: string; id: string } } | null,
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: mocks.prismaUser,
    rejetAutoDetecte: mocks.prismaRejet,
    dossierTiersPayant: mocks.prismaDossier,
  },
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: vi.fn().mockResolvedValue(true),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockImplementation(() => Promise.resolve(mocks.session)),
}));

vi.mock("@/lib/auth", () => ({ authOptions: {} }));

/* ── GET /api/extension/verify ────────────────── */
/* Note: la route utilise NextRequest.nextUrl.searchParams qui n'existe pas
   sur un Request standard. On mock NextRequest via un objet custom. */

describe("GET /api/extension/verify", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  function makeNextReq(url: string) {
    const u = new URL(url);
    return { nextUrl: u, url } as never;
  }

  it("returns 401 if token missing", async () => {
    const { GET } = await import("@/app/api/extension/verify/route");
    const res = await GET(makeNextReq("http://localhost/api/extension/verify"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with valid token", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue({
      id: "u1", email: "a@b.com", isPro: true, plan: "PRO", role: "USER",
    });
    const { GET } = await import("@/app/api/extension/verify/route");
    const res = await GET(makeNextReq("http://localhost/api/extension/verify?token=valid-token"));
    expect(res.status).toBe(200);
  });
});

/* ── POST /api/extension/rejet-detecte ────────── */

describe("POST /api/extension/rejet-detecte", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("returns 400 without syncToken", async () => {
    const { POST } = await import("@/app/api/extension/rejet-detecte/route");
    const req = new Request("http://localhost/api/extension/rejet-detecte", {
      method: "POST",
      body: JSON.stringify({ portail: "ALMERYS" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 with invalid portail", async () => {
    const { POST } = await import("@/app/api/extension/rejet-detecte/route");
    const req = new Request("http://localhost/api/extension/rejet-detecte", {
      method: "POST",
      body: JSON.stringify({ syncToken: "tok", portail: "INVALIDE" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 with unknown syncToken", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue(null);
    const { POST } = await import("@/app/api/extension/rejet-detecte/route");
    const req = new Request("http://localhost/api/extension/rejet-detecte", {
      method: "POST",
      body: JSON.stringify({ syncToken: "unknown", portail: "ALMERYS" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 200 with valid data", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue({ id: "u1" });
    mocks.prismaDossier.findFirst.mockResolvedValue(null);
    mocks.prismaRejet.create.mockResolvedValue({ id: "r1" });
    const { POST } = await import("@/app/api/extension/rejet-detecte/route");
    const req = new Request("http://localhost/api/extension/rejet-detecte", {
      method: "POST",
      body: JSON.stringify({ syncToken: "valid", portail: "ALMERYS", numeroDossier: "123" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
