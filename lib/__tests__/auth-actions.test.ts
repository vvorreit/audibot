import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const prismaUser = {
    findUnique: vi.fn(),
    create: vi.fn(),
  };
  const prismaVerificationToken = { create: vi.fn() };
  const prismaLegalAcceptance = { create: vi.fn() };
  return { prismaUser, prismaVerificationToken, prismaLegalAcceptance };
});

vi.mock("@/lib/db", () => ({
  prisma: {
    user: mocks.prismaUser,
    verificationToken: mocks.prismaVerificationToken,
    legalAcceptance: mocks.prismaLegalAcceptance,
  },
}));

vi.mock("@/lib/mailer", () => ({
  getTransporter: vi.fn().mockReturnValue({ sendMail: vi.fn().mockResolvedValue({}) }),
  smtpConfigured: vi.fn().mockReturnValue(false),
}));

import { registerUser } from "@/app/actions/auth";

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prismaUser.findUnique.mockResolvedValue(null);
    mocks.prismaUser.create.mockResolvedValue({ id: "new-user-id" });
    mocks.prismaVerificationToken.create.mockResolvedValue({});
  });

  it("rejects empty fields", async () => {
    const result = await registerUser("", "a@b.com", "12345678");
    expect(result.error).toBe("Tous les champs sont requis.");
  });

  it("rejects name too long (>100)", async () => {
    const result = await registerUser("A".repeat(101), "a@b.com", "12345678");
    expect(result.error).toContain("1 et 100");
  });

  it("rejects invalid email", async () => {
    const result = await registerUser("Jean", "not-an-email", "12345678");
    expect(result.error).toContain("email invalide");
  });

  it("rejects password too short (<8)", async () => {
    const result = await registerUser("Jean", "a@b.com", "short");
    expect(result.error).toContain("8 et 128");
  });

  it("rejects password too long (>128)", async () => {
    const result = await registerUser("Jean", "a@b.com", "x".repeat(129));
    expect(result.error).toContain("8 et 128");
  });

  it("returns success (anti-enum) when email exists", async () => {
    mocks.prismaUser.findUnique.mockResolvedValue({ id: "existing" });
    const result = await registerUser("Jean", "existing@b.com", "12345678");
    expect(result.success).toBe(true);
    expect(mocks.prismaUser.create).not.toHaveBeenCalled();
  });

  it("creates user with trimmed name and lowercased email", async () => {
    await registerUser("  Jean Dupont  ", "  Jean@EXAMPLE.com  ", "secure123!");
    expect(mocks.prismaUser.create).toHaveBeenCalledWith({
      data: {
        name: "Jean Dupont",
        email: "jean@example.com",
        password: expect.any(String),
      },
    });
  });

  it("creates DPA acceptance when dpaVersion provided", async () => {
    await registerUser("Jean", "a@b.com", "secure123!", "1.1");
    expect(mocks.prismaLegalAcceptance.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        documentType: "dpa",
        documentVersion: "1.1",
      }),
    });
  });

  it("does not create DPA when dpaVersion is absent", async () => {
    await registerUser("Jean", "a@b.com", "secure123!");
    expect(mocks.prismaLegalAcceptance.create).not.toHaveBeenCalled();
  });

  it("creates verification token", async () => {
    await registerUser("Jean", "a@b.com", "secure123!");
    expect(mocks.prismaVerificationToken.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        identifier: "a@b.com",
        token: expect.any(String),
        expires: expect.any(Date),
      }),
    });
  });
});
