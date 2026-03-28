import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

/* ── Mocks ─────────────────────────────────────── */

const mocks = vi.hoisted(() => ({
  prismaVerificationToken: {
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
  prismaUser: {
    update: vi.fn(),
  },
  rateLimit: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  smtpConfigured: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    verificationToken: mocks.prismaVerificationToken,
    user: mocks.prismaUser,
  },
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: (...args: unknown[]) => mocks.rateLimit(...args),
}));

vi.mock("@/lib/mailer", () => ({
  sendWelcomeEmail: (...args: unknown[]) => mocks.sendWelcomeEmail(...args),
  smtpConfigured: () => mocks.smtpConfigured(),
}));

import { GET } from "@/app/api/auth/verify-email/route";

function makeReq(params: Record<string, string>): NextRequest {
  const url = new URL("http://localhost/api/auth/verify-email");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url);
}

describe("GET /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimit.mockResolvedValue(true);
    mocks.smtpConfigured.mockReturnValue(true);
  });

  it("retourne 429 si rate limit atteint", async () => {
    mocks.rateLimit.mockResolvedValue(false);
    const res = await GET(makeReq({ token: "tok", email: "a@b.com" }));
    expect(res.status).toBe(429);
  });

  it("redirect si token manquant", async () => {
    const res = await GET(makeReq({ email: "a@b.com" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("InvalidLink");
  });

  it("redirect si email manquant", async () => {
    const res = await GET(makeReq({ token: "tok" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("InvalidLink");
  });

  it("redirect si token introuvable en base", async () => {
    mocks.prismaVerificationToken.findUnique.mockResolvedValue(null);
    const res = await GET(makeReq({ token: "bad-token", email: "a@b.com" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("InvalidLink");
  });

  it("redirect si email ne correspond pas au token", async () => {
    mocks.prismaVerificationToken.findUnique.mockResolvedValue({
      token: "tok",
      identifier: "other@b.com",
      expires: new Date(Date.now() + 3600_000),
    });
    const res = await GET(makeReq({ token: "tok", email: "a@b.com" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("InvalidLink");
  });

  it("redirect si token expiré", async () => {
    mocks.prismaVerificationToken.findUnique.mockResolvedValue({
      token: "tok",
      identifier: "a@b.com",
      expires: new Date(Date.now() - 3600_000), // expired
    });
    const res = await GET(makeReq({ token: "tok", email: "a@b.com" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("InvalidLink");
  });

  it("valide email avec token valide → met emailVerified + redirect verified=1", async () => {
    mocks.prismaVerificationToken.findUnique.mockResolvedValue({
      token: "valid-tok",
      identifier: "user@test.fr",
      expires: new Date(Date.now() + 3600_000),
    });
    mocks.prismaUser.update.mockResolvedValue({
      name: "Test User",
      email: "user@test.fr",
    });
    mocks.prismaVerificationToken.delete.mockResolvedValue({});
    mocks.sendWelcomeEmail.mockResolvedValue({});

    const res = await GET(makeReq({ token: "valid-tok", email: "user@test.fr" }));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("verified=1");

    // User emailVerified should be set
    expect(mocks.prismaUser.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: "user@test.fr" },
        data: expect.objectContaining({
          emailVerified: expect.any(Date),
        }),
      })
    );

    // Token deleted
    expect(mocks.prismaVerificationToken.delete).toHaveBeenCalledWith({
      where: { token: "valid-tok" },
    });
  });

  it("envoie welcome email après validation", async () => {
    mocks.prismaVerificationToken.findUnique.mockResolvedValue({
      token: "tok",
      identifier: "user@test.fr",
      expires: new Date(Date.now() + 3600_000),
    });
    mocks.prismaUser.update.mockResolvedValue({
      name: "Marie",
      email: "user@test.fr",
    });
    mocks.prismaVerificationToken.delete.mockResolvedValue({});
    mocks.sendWelcomeEmail.mockResolvedValue({});

    await GET(makeReq({ token: "tok", email: "user@test.fr" }));

    expect(mocks.sendWelcomeEmail).toHaveBeenCalledWith("user@test.fr", "Marie");
  });

  it("ne crash pas si welcome email échoue", async () => {
    mocks.prismaVerificationToken.findUnique.mockResolvedValue({
      token: "tok",
      identifier: "user@test.fr",
      expires: new Date(Date.now() + 3600_000),
    });
    mocks.prismaUser.update.mockResolvedValue({
      name: "Test",
      email: "user@test.fr",
    });
    mocks.prismaVerificationToken.delete.mockResolvedValue({});
    mocks.sendWelcomeEmail.mockRejectedValue(new Error("SMTP fail"));

    const res = await GET(makeReq({ token: "tok", email: "user@test.fr" }));
    // Should still redirect successfully
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("verified=1");
  });

  it("n'envoie pas de welcome email si SMTP non configuré", async () => {
    mocks.smtpConfigured.mockReturnValue(false);
    mocks.prismaVerificationToken.findUnique.mockResolvedValue({
      token: "tok",
      identifier: "user@test.fr",
      expires: new Date(Date.now() + 3600_000),
    });
    mocks.prismaUser.update.mockResolvedValue({
      name: "Test",
      email: "user@test.fr",
    });
    mocks.prismaVerificationToken.delete.mockResolvedValue({});

    await GET(makeReq({ token: "tok", email: "user@test.fr" }));

    expect(mocks.sendWelcomeEmail).not.toHaveBeenCalled();
  });
});
