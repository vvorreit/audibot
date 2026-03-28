import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  emailsSend: vi.fn().mockResolvedValue({ data: { id: "mock-id" }, error: null }),
}));

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: mocks.emailsSend };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

// ─── smtpConfigured ───────────────────────────────────────────────────────────

describe("smtpConfigured", () => {
  it("retourne true si RESEND_API_KEY est défini", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.resetModules();
    const { smtpConfigured } = await import("@/lib/mailer");
    expect(smtpConfigured()).toBe(true);
  });

  it("retourne false si RESEND_API_KEY est absent", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.resetModules();
    const { smtpConfigured } = await import("@/lib/mailer");
    expect(smtpConfigured()).toBe(false);
  });
});

describe("sendWelcomeEmail", () => {
  it("appelle sendMail avec le bon subject", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("NEXTAUTH_URL", "https://app.optibot.fr");

    vi.resetModules();
    const { sendWelcomeEmail } = await import("@/lib/mailer");

    await sendWelcomeEmail("alice@test.com", "Alice");

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Bienvenue sur OptiBot",
        to: ["alice@test.com"],
      })
    );
  });

  it("si RESEND_API_KEY absent → log d'erreur, pas de throw non catchée", async () => {
    vi.stubEnv("RESEND_API_KEY", "");

    vi.resetModules();
    const { sendWelcomeEmail } = await import("@/lib/mailer");

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(sendWelcomeEmail("bob@test.com", "Bob")).rejects.toThrow(
      "RESEND_API_KEY manquant"
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "[mailer] RESEND_API_KEY manquant — mail non envoyé"
    );

    consoleSpy.mockRestore();
  });

  it("sendMail — Resend renvoie une erreur → throw (ligne 41-42)", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.resetModules();

    // Recréer le mock avec une erreur Resend
    mocks.emailsSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Rate limit exceeded" },
    });

    const { sendMail } = await import("@/lib/mailer");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      sendMail({ to: "user@test.com", subject: "Test", html: "<p>Test</p>" })
    ).rejects.toThrow("Rate limit exceeded");

    expect(consoleSpy).toHaveBeenCalledWith(
      "[mailer] Erreur Resend:",
      expect.any(String)
    );

    consoleSpy.mockRestore();
  });

  it("sendWelcomeEmail sans nom → HTML sans prénom (ligne 81-82)", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("NEXTAUTH_URL", "https://app.optibot.fr");
    vi.resetModules();
    const { sendWelcomeEmail } = await import("@/lib/mailer");

    await sendWelcomeEmail("anon@test.com", "");

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["anon@test.com"],
        subject: "Bienvenue sur OptiBot",
      })
    );
    // HTML ne doit pas contenir de prénom (condition `name ? ` ${name}` : ""`)
    const callHtml = mocks.emailsSend.mock.calls[0][0].html as string;
    expect(callHtml).toContain("Bonjour,");
  });

  it("sendMail avec options cc et replyTo", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.resetModules();
    const { sendMail } = await import("@/lib/mailer");

    await sendMail({
      to: "user@test.com",
      cc: "copy@test.com",
      replyTo: "reply@test.com",
      subject: "Test CC",
      html: "<p>Test</p>",
    });

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        cc: ["copy@test.com"],
        reply_to: "reply@test.com",
      })
    );
  });

  it("getTransporter().sendMail() délègue à sendMail", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.resetModules();
    const { getTransporter } = await import("@/lib/mailer");

    const transporter = getTransporter();
    await transporter.sendMail({ to: "user@test.com", subject: "Via transporter", html: "<p>ok</p>" });

    expect(mocks.emailsSend).toHaveBeenCalledTimes(1);
  });
});
