import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const emailsSend = vi.fn();
  return { emailsSend };
});

vi.mock("resend", () => {
  function ResendMock() {
    return { emails: { send: mocks.emailsSend } };
  }
  return { Resend: ResendMock };
});

// Réimporter après chaque test pour reset le singleton _resend
import { smtpConfigured } from "@/lib/mailer";

beforeEach(() => {
  vi.clearAllMocks();
  // Reset le module pour vider le singleton _resend
  vi.resetModules();
  process.env.RESEND_API_KEY = "re_test_key";
});

async function getMailer() {
  const { sendMail, sendWelcomeEmail, smtpConfigured: sc } = await import("@/lib/mailer");
  return { sendMail, sendWelcomeEmail, smtpConfigured: sc };
}

describe("smtpConfigured", () => {
  it("retourne true si RESEND_API_KEY présent", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    expect(smtpConfigured()).toBe(true);
  });

  it("retourne false si RESEND_API_KEY absent", () => {
    delete process.env.RESEND_API_KEY;
    expect(smtpConfigured()).toBe(false);
  });
});

describe("sendMail", () => {
  it("envoie un mail avec succès", async () => {
    mocks.emailsSend.mockResolvedValue({ data: { id: "msg_123" }, error: null });
    const { sendMail } = await getMailer();

    await sendMail({ to: "user@example.com", subject: "Test", html: "<p>Test</p>" });

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ["user@example.com"], subject: "Test" })
    );
  });

  it("utilise SMTP_FROM si défini", async () => {
    process.env.SMTP_FROM = "noreply@myapp.fr";
    mocks.emailsSend.mockResolvedValue({ data: { id: "msg_456" }, error: null });
    const { sendMail } = await getMailer();

    await sendMail({ to: "user@example.com", subject: "Test", html: "<p>Test</p>" });

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ from: "noreply@myapp.fr" })
    );
    delete process.env.SMTP_FROM;
  });

  it("accepte un tableau de destinataires", async () => {
    mocks.emailsSend.mockResolvedValue({ data: { id: "msg_789" }, error: null });
    const { sendMail } = await getMailer();

    await sendMail({ to: ["a@example.com", "b@example.com"], subject: "Multi", html: "<p>Multi</p>" });

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ["a@example.com", "b@example.com"] })
    );
  });

  it("inclut cc si fourni", async () => {
    mocks.emailsSend.mockResolvedValue({ data: { id: "msg_cc" }, error: null });
    const { sendMail } = await getMailer();

    await sendMail({ to: "user@example.com", cc: "cc@example.com", subject: "CC", html: "<p>CC</p>" });

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ cc: ["cc@example.com"] })
    );
  });

  it("inclut replyTo si fourni", async () => {
    mocks.emailsSend.mockResolvedValue({ data: { id: "msg_rt" }, error: null });
    const { sendMail } = await getMailer();

    await sendMail({ to: "user@example.com", subject: "RT", html: "<p>RT</p>", replyTo: "support@example.com" });

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ reply_to: "support@example.com" })
    );
  });

  it("throw si RESEND_API_KEY manquant", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendMail } = await getMailer();

    await expect(
      sendMail({ to: "user@example.com", subject: "Test", html: "<p>Test</p>" })
    ).rejects.toThrow("RESEND_API_KEY manquant");
  });

  it("throw si Resend retourne une erreur", async () => {
    mocks.emailsSend.mockResolvedValue({
      data: null,
      error: { message: "Invalid email address", name: "validation_error" },
    });
    const { sendMail } = await getMailer();

    await expect(
      sendMail({ to: "bad-email", subject: "Test", html: "<p>Test</p>" })
    ).rejects.toThrow("Invalid email address");
  });
});

describe("sendWelcomeEmail", () => {
  it("envoie un email de bienvenue avec le nom", async () => {
    process.env.NEXTAUTH_URL = "https://app.example.com";
    mocks.emailsSend.mockResolvedValue({ data: { id: "msg_welcome" }, error: null });
    const { sendWelcomeEmail } = await getMailer();

    await sendWelcomeEmail("new@example.com", "Jean Dupont");

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ["new@example.com"], subject: "Bienvenue sur OptiBot" })
    );
  });

  it("envoie un email de bienvenue sans nom", async () => {
    mocks.emailsSend.mockResolvedValue({ data: { id: "msg_welcome_noname" }, error: null });
    const { sendWelcomeEmail } = await getMailer();

    await sendWelcomeEmail("anon@example.com", "");

    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({ to: ["anon@example.com"] })
    );
  });
});
