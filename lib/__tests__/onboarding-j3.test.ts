import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const prismaUser = { findMany: vi.fn() };
  const sendMail = vi.fn();
  return { prismaUser, sendMail };
});

vi.mock("@/lib/db", () => ({
  prisma: { user: mocks.prismaUser },
}));

vi.mock("@/lib/mailer", () => ({
  sendMail: mocks.sendMail,
}));

import { GET } from "@/app/api/cron/onboarding-j3/route";

function makeRequest(auth?: string): Request {
  return new Request("http://localhost/api/cron/onboarding-j3", {
    method: "GET",
    headers: auth ? { authorization: auth } : {},
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-cron-secret";
});

describe("GET /api/cron/onboarding-j3", () => {
  it("401 si authorization absente", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("Unauthorized");
  });

  it("401 si mauvais token", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("200 + sent=0 si aucun utilisateur éligible", async () => {
    mocks.prismaUser.findMany.mockResolvedValue([]);
    const res = await GET(makeRequest("Bearer test-cron-secret"));
    expect(res.status).toBe(200);
    const body = await res.json() as { sent: number; total: number };
    expect(body.sent).toBe(0);
    expect(body.total).toBe(0);
  });

  it("envoie un email par utilisateur éligible", async () => {
    mocks.prismaUser.findMany.mockResolvedValue([
      { email: "user1@example.com", name: "Alice" },
      { email: "user2@example.com", name: "Bob" },
    ]);
    mocks.sendMail.mockResolvedValue({});

    const res = await GET(makeRequest("Bearer test-cron-secret"));
    expect(res.status).toBe(200);
    const body = await res.json() as { sent: number; total: number };
    expect(body.sent).toBe(2);
    expect(body.total).toBe(2);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
  });

  it("skip les utilisateurs sans email", async () => {
    mocks.prismaUser.findMany.mockResolvedValue([
      { email: null, name: "Sans Email" },
      { email: "ok@example.com", name: "Avec Email" },
    ]);
    mocks.sendMail.mockResolvedValue({});

    const res = await GET(makeRequest("Bearer test-cron-secret"));
    const body = await res.json() as { sent: number; total: number };
    expect(body.sent).toBe(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("continue malgré erreur d'envoi sur un utilisateur", async () => {
    mocks.prismaUser.findMany.mockResolvedValue([
      { email: "fail@example.com", name: "Fail" },
      { email: "ok@example.com", name: "Ok" },
    ]);
    mocks.sendMail
      .mockRejectedValueOnce(new Error("SMTP error"))
      .mockResolvedValueOnce({});

    const res = await GET(makeRequest("Bearer test-cron-secret"));
    const body = await res.json() as { sent: number; total: number };
    // fail → skip, ok → sent
    expect(body.sent).toBe(1);
    expect(body.total).toBe(2);
  });
});
