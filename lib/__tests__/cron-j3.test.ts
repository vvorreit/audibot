import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  sendMail: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: mocks.findMany,
    },
  },
}));

vi.mock("@/lib/mailer", () => ({
  sendMail: mocks.sendMail,
}));

import { GET } from "@/app/api/cron/onboarding-j3/route";

function makeRequest(secret: string): Request {
  return new Request("http://localhost/api/cron/onboarding-j3", {
    headers: { authorization: `Bearer ${secret}` },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-secret";
  process.env.NEXTAUTH_URL = "https://app.optibot.fr";
});

describe("cron onboarding-j3", () => {
  it("user créé il y a 72h, clientCount=0, emailVerified → reçoit un email", async () => {
    mocks.findMany.mockResolvedValue([
      { email: "user@test.com", name: "Alice" },
    ]);

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();

    expect(json.sent).toBe(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "user@test.com",
        subject: "OptiBot — avez-vous testé le bot ?",
      })
    );
  });

  it("user créé il y a 72h, clientCount > 0 → pas d'email (filtré par query)", async () => {
    mocks.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();

    expect(json.sent).toBe(0);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("user créé il y a 24h → pas d'email (filtré par query)", async () => {
    mocks.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();

    expect(json.sent).toBe(0);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });
});
