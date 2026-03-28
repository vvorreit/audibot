import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue({}),
  rateLimit: vi.fn().mockResolvedValue(true),
  headers: vi.fn(),
}));

vi.mock("@/lib/mailer", () => ({
  getTransporter: () => ({ sendMail: mocks.sendMail }),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimit: mocks.rateLimit,
}));

vi.mock("next/headers", () => ({
  headers: mocks.headers,
}));

import { sendSupportEmail } from "@/app/support/actions";

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

const VALID = {
  type: "incident",
  name: "Marie Optique",
  email: "marie@optique.fr",
  phone: "0612345678",
  subject: "Bug remplissage Almerys",
  message: "Le formulaire Almerys ne se remplit plus depuis ce matin, le champ NSS reste vide.",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.rateLimit.mockResolvedValue(true);
  mocks.sendMail.mockResolvedValue({});
  mocks.headers.mockResolvedValue(new Headers({ "x-forwarded-for": "5.6.7.8" }));
});

describe("sendSupportEmail", () => {
  it("envoie un email avec des données valides", async () => {
    const result = await sendSupportEmail(makeFormData(VALID));

    expect(result.success).toBe(true);
    expect(mocks.sendMail).toHaveBeenCalledTimes(1);
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "contact@optibot.fr",
        replyTo: "marie@optique.fr",
        subject: "[Incident / Bug] Bug remplissage Almerys",
      })
    );
  });

  it("retourne erreur si le rate limit est atteint", async () => {
    mocks.rateLimit.mockResolvedValue(false);

    const result = await sendSupportEmail(makeFormData(VALID));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Trop de requêtes");
    expect(mocks.sendMail).not.toHaveBeenCalled();
  });

  it("retourne erreur si le type est invalide", async () => {
    const result = await sendSupportEmail(makeFormData({ ...VALID, type: "piratage" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Type invalide");
  });

  it("retourne erreur si le nom est vide", async () => {
    const result = await sendSupportEmail(makeFormData({ ...VALID, name: "" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Nom invalide");
  });

  it("retourne erreur si le nom est trop long", async () => {
    const result = await sendSupportEmail(makeFormData({ ...VALID, name: "A".repeat(101) }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Nom invalide");
  });

  it("retourne erreur si l'email est invalide", async () => {
    const result = await sendSupportEmail(makeFormData({ ...VALID, email: "not-email" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Email invalide");
  });

  it("retourne erreur si le message est trop court (<10 chars)", async () => {
    const result = await sendSupportEmail(makeFormData({ ...VALID, message: "court" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Message invalide");
  });

  it("retourne erreur si le message est trop long (>5000 chars)", async () => {
    const result = await sendSupportEmail(makeFormData({ ...VALID, message: "x".repeat(5001) }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Message invalide");
  });

  it("accepte les 3 types valides", async () => {
    for (const type of ["suggestion", "incident", "evolution"]) {
      vi.clearAllMocks();
      const result = await sendSupportEmail(makeFormData({ ...VALID, type }));
      expect(result.success).toBe(true);
    }
  });

  it("retourne erreur si l'envoi SMTP échoue", async () => {
    mocks.sendMail.mockRejectedValue(new Error("SMTP down"));

    const result = await sendSupportEmail(makeFormData(VALID));
    expect(result.success).toBe(false);
    expect(result.error).toContain("Erreur serveur");
  });

  it("escape les caractères HTML (anti-XSS)", async () => {
    const result = await sendSupportEmail(makeFormData({
      ...VALID,
      message: 'Le champ <img onerror="alert(1)"> est cassé, ça bugge.',
    }));

    expect(result.success).toBe(true);
    const html = mocks.sendMail.mock.calls[0][0].html;
    expect(html).not.toContain('<img onerror');
    expect(html).toContain("&lt;img onerror");
  });

  it("fonctionne sans phone ni subject (optionnels)", async () => {
    const { phone, subject, ...noOptional } = VALID;
    void phone; void subject;
    const result = await sendSupportEmail(makeFormData(noOptional));

    expect(result.success).toBe(true);
    const html = mocks.sendMail.mock.calls[0][0].html;
    expect(html).not.toContain("Téléphone");
  });
});
