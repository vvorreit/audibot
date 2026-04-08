import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue({}),
  smtpConfigured: vi.fn().mockReturnValue(true),
  rateLimit: vi.fn().mockResolvedValue(true),
  headers: vi.fn(),
}));

vi.mock("@/lib/mailer", () => ({
  getTransporter: () => ({ sendMail: mocks.sendMail }),
  smtpConfigured: mocks.smtpConfigured,
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: mocks.rateLimit,
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

import { sendContactEmail } from "@/app/contact/actions";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

const VALID = {
  name: "Jean Dupont",
  company: "Optique Paris",
  email: "jean@optique.fr",
  shops: "3",
  message: "Je souhaite un devis pour 3 magasins.",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rateLimit.mockResolvedValue(true);
  mocks.smtpConfigured.mockReturnValue(true);
  mocks.sendMail.mockResolvedValue({});
  mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": "1.2.3.4" }));
});

describe("sendContactEmail", () => {
  it("envoie un email avec des données valides", async () => {
    const result = await sendContactEmail(makeFormData(VALID));

    expect(result.success).toBe(true);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "contact@audibot.fr",
        replyTo: "jean@optique.fr",
        subject: "Nouveau Devis Franchise : Optique Paris",
      })
    );
  });

  it("retourne false si le rate limit est atteint", async () => {
    mocks.rateLimit.mockResolvedValue(false);

    const result = await sendContactEmail(makeFormData(VALID));
    expect(result.success).toBe(false);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("retourne false si le nom est manquant", async () => {
    const result = await sendContactEmail(makeFormData({ ...VALID, name: "" }));
    expect(result.success).toBe(false);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("retourne false si l'email est invalide", async () => {
    const result = await sendContactEmail(makeFormData({ ...VALID, email: "pas-un-email" }));
    expect(result.success).toBe(false);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("retourne false si le message est vide", async () => {
    const result = await sendContactEmail(makeFormData({ ...VALID, message: "" }));
    expect(result.success).toBe(false);
  });

  it("retourne false si SMTP n'est pas configuré", async () => {
    mocks.smtpConfigured.mockReturnValue(false);

    const result = await sendContactEmail(makeFormData(VALID));
    expect(result.success).toBe(false);
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("retourne false si l'envoi échoue (erreur SMTP)", async () => {
    mocks.sendMail.mockRejectedValue(new Error("SMTP timeout"));

    const result = await sendContactEmail(makeFormData(VALID));
    expect(result.success).toBe(false);
  });

  it("escape les caractères HTML dans les champs", async () => {
    const result = await sendContactEmail(makeFormData({
      ...VALID,
      name: '<script>alert("xss")</script>',
    }));

    expect(result.success).toBe(true);
    const callArg = mocks.sendMail.mock.calls[0][0];
    expect(callArg.html).not.toContain("<script>");
    expect(callArg.html).toContain("&lt;script&gt;");
  });

  it("tronque les champs trop longs", async () => {
    const longName = "A".repeat(200);
    const result = await sendContactEmail(makeFormData({ ...VALID, name: longName }));

    expect(result.success).toBe(true);
    const callArg = mocks.sendMail.mock.calls[0][0];
    expect(callArg.html).not.toContain("A".repeat(200));
  });
});
