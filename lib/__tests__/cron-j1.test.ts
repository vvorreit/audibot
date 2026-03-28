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

import { GET } from "@/app/api/cron/onboarding-j1/route";

function makeRequest(secret: string): Request {
  return new Request("http://localhost/api/cron/onboarding-j1", {
    headers: { authorization: `Bearer ${secret}` },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.CRON_SECRET = "test-secret";
  process.env.NEXTAUTH_URL = "https://app.optibot.fr";
});

describe("cron onboarding-j1", () => {
  it("rejette les requêtes sans autorisation", async () => {
    const res = await GET(makeRequest("mauvais-secret"));
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("rejette si CRON_SECRET n'est pas défini", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(makeRequest("test-secret"));
    expect(res.status).toBe(401);
  });

  it("envoie un email aux users créés il y a 24h avec onboardingStep < 1", async () => {
    mocks.findMany.mockResolvedValue([
      { email: "alice@test.fr", name: "Alice" },
      { email: "bob@test.fr", name: null },
    ]);

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();

    expect(json.sent).toBe(2);
    expect(json.total).toBe(2);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "alice@test.fr",
        subject: "OptiBot — installez l'extension pour commencer",
      })
    );
  });

  it("ignore les users sans email", async () => {
    mocks.findMany.mockResolvedValue([
      { email: null, name: "NoEmail" },
      { email: "valid@test.fr", name: "Valid" },
    ]);

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();

    expect(json.sent).toBe(1);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
  });

  it("continue si un email échoue", async () => {
    mocks.findMany.mockResolvedValue([
      { email: "fail@test.fr", name: "Fail" },
      { email: "ok@test.fr", name: "OK" },
    ]);
    mocks.sendMail
      .mockRejectedValueOnce(new Error("SMTP error"))
      .mockResolvedValueOnce({});

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();

    expect(json.sent).toBe(1);
    expect(json.total).toBe(2);
    expect(mocks.sendMail).toHaveBeenCalledTimes(2);
  });

  it("retourne 0 envoyé si aucun user éligible", async () => {
    mocks.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest("test-secret"));
    const json = await res.json();

    expect(json.sent).toBe(0);
    expect(json.total).toBe(0);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("filtre sur la fenêtre 23-25h avec onboardingStep < 1 et emailVerified", async () => {
    mocks.findMany.mockResolvedValue([]);

    await GET(makeRequest("test-secret"));

    expect(mocks.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          onboardingStep: { lt: 1 },
          emailVerified: { not: null },
          createdAt: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        take: 50,
      })
    );
  });

  it("inclut le lien d'installation dans l'email", async () => {
    mocks.findMany.mockResolvedValue([
      { email: "user@test.fr", name: "Test" },
    ]);

    await GET(makeRequest("test-secret"));

    const html = mocks.sendMail.mock.calls[0][0].html;
    expect(html).toContain("https://app.optibot.fr/extension");
    expect(html).toContain("Installer l'extension");
  });
});
