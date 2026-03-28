import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  prismaSession: { findFirst: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
  prismaUser: { findUnique: vi.fn() },
  rateLimit: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    scanSession: mocks.prismaSession,
    user: mocks.prismaUser,
  },
}));

vi.mock("@/lib/rateLimit", () => ({ rateLimit: mocks.rateLimit }));

import { POST } from "@/app/api/scan/relay/route";
import { NextRequest } from "next/server";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/scan/relay", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => { vi.clearAllMocks(); mocks.rateLimit.mockResolvedValue(true); });

describe("POST /api/scan/relay", () => {
  it("retourne 400 si sessionId manquant", async () => {
    const res = await POST(makeRequest({ blob: "abc", syncToken: "tok" }));
    expect(res.status).toBe(400);
  });

  it("retourne 400 si blob manquant", async () => {
    const res = await POST(makeRequest({ sessionId: "sess123", syncToken: "tok" }));
    expect(res.status).toBe(400);
  });

  it("retourne 400 si syncToken manquant", async () => {
    const res = await POST(makeRequest({ sessionId: "sess123", blob: "data" }));
    expect(res.status).toBe(400);
  });

  it("retourne 429 si rate limit atteint", async () => {
    mocks.rateLimit.mockResolvedValue(false);
    const res = await POST(makeRequest({ sessionId: "sess123", blob: "data", syncToken: "validtoken" }));
    expect(res.status).toBe(429);
  });

  it("retourne 401 si syncToken inconnu", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue(null);
    const res = await POST(makeRequest({ sessionId: "sess123", blob: "data", syncToken: "badtoken" }));
    expect(res.status).toBe(401);
  });

  it("retourne 404 si session introuvable ou expirée", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue({ id: "user_1" });
    mocks.prismaSession.findFirst.mockResolvedValue(null);
    const res = await POST(makeRequest({ sessionId: "sess123", blob: "data", syncToken: "validtoken" }));
    expect(res.status).toBe(404);
  });

  it("retourne 200 et stocke le blob si tout est valide", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue({ id: "user_1" });
    mocks.prismaSession.findFirst.mockResolvedValue({ id: "sess123" });
    mocks.prismaSession.update.mockResolvedValue({});
    const res = await POST(makeRequest({ sessionId: "sess123", blob: "encrypteddata", syncToken: "validtoken" }));
    expect(res.status).toBe(200);
    expect(mocks.prismaSession.update).toHaveBeenCalledWith({
      where: { id: "sess123" },
      data: { blob: "encrypteddata" },
    });
  });
});
