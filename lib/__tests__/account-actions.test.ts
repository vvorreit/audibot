import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  compare: vi.fn(),
  hash: vi.fn(),
}));

vi.mock("next-auth/next", () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      update: mocks.update,
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: mocks.compare,
    hash: mocks.hash,
  },
}));

import { exportUserData, updateUserName, updatePassword } from "@/app/dashboard/account/actions";

const SESSION = { user: { email: "user@test.fr" } };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getServerSession.mockResolvedValue(SESSION);
});

// ─── exportUserData ──────────────────────────────────────────

describe("exportUserData", () => {
  it("retourne erreur si non connecté", async () => {
    mocks.getServerSession.mockResolvedValue(null);
    const result = await exportUserData();
    expect(result.error).toBe("Non autorisé.");
  });

  it("retourne erreur si utilisateur introuvable", async () => {
    mocks.findUnique.mockResolvedValue(null);
    const result = await exportUserData();
    expect(result.error).toBe("Utilisateur introuvable.");
  });

  it("retourne les données RGPD sérialisées", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "u1",
      name: "Test",
      email: "user@test.fr",
      emailVerified: new Date(),
      image: null,
      clientCount: 42,
      isPro: true,
      role: "USER",
      teamId: null,
      teamRole: null,
      createdAt: new Date("2024-01-15"),
      lastActiveAt: new Date("2024-06-01"),
      accounts: [{ provider: "google", type: "oauth" }],
      team: null,
      invitationsSent: [],
    });

    const result = await exportUserData();
    expect(result.data).toBeDefined();
    const parsed = JSON.parse(result.data!);

    expect(parsed.profile.name).toBe("Test");
    expect(parsed.usage.clientCount).toBe(42);
    expect(parsed.connectedProviders).toEqual(["google"]);
    expect(parsed.exportBasis).toContain("RGPD");
  });

  it("n'inclut PAS syncToken, password, stripeCustomerId", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "u1", name: "Test", email: "user@test.fr",
      emailVerified: null, image: null, clientCount: 0,
      isPro: false, role: "USER", teamId: null, teamRole: null,
      createdAt: new Date(), lastActiveAt: null,
      accounts: [], team: null, invitationsSent: [],
    });

    const result = await exportUserData();
    const raw = result.data!;
    expect(raw).not.toContain("syncToken");
    expect(raw).not.toContain("password");
    expect(raw).not.toContain("stripeCustomerId");
    expect(raw).not.toContain("stripeSubscriptionId");
  });
});

// ─── updateUserName ──────────────────────────────────────────

describe("updateUserName", () => {
  it("retourne erreur si non connecté", async () => {
    mocks.getServerSession.mockResolvedValue(null);
    const result = await updateUserName("Nouveau Nom");
    expect(result.error).toBe("Non autorisé.");
  });

  it("retourne erreur si le nom est vide", async () => {
    const result = await updateUserName("   ");
    expect(result.error).toContain("ne peut pas être vide");
  });

  it("retourne erreur si le nom est trop long", async () => {
    const result = await updateUserName("A".repeat(101));
    expect(result.error).toContain("trop long");
  });

  it("met à jour le nom avec succès", async () => {
    mocks.update.mockResolvedValue({});
    const result = await updateUserName("  Nouveau Nom  ");

    expect(result.success).toBe(true);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { email: "user@test.fr" },
      data: { name: "Nouveau Nom" },
    });
  });
});

// ─── updatePassword ──────────────────────────────────────────

describe("updatePassword", () => {
  it("retourne erreur si non connecté", async () => {
    mocks.getServerSession.mockResolvedValue(null);
    const result = await updatePassword("old", "newpassword");
    expect(result.error).toBe("Non autorisé.");
  });

  it("retourne erreur si le nouveau mot de passe est trop court", async () => {
    const result = await updatePassword("old", "short");
    expect(result.error).toContain("au moins 8 caractères");
  });

  it("retourne erreur si le compte utilise Google (pas de password)", async () => {
    mocks.findUnique.mockResolvedValue({ id: "u1", password: null });
    const result = await updatePassword("old", "newpassword123");
    expect(result.error).toContain("connexion externe");
  });

  it("retourne erreur si le mot de passe actuel est incorrect", async () => {
    mocks.findUnique.mockResolvedValue({ id: "u1", password: "$2a$hashed" });
    mocks.compare.mockResolvedValue(false);

    const result = await updatePassword("wrong", "newpassword123");
    expect(result.error).toContain("incorrect");
  });

  it("change le mot de passe avec succès", async () => {
    mocks.findUnique.mockResolvedValue({ id: "u1", password: "$2a$hashed" });
    mocks.compare.mockResolvedValue(true);
    mocks.hash.mockResolvedValue("$2a$newhashed");
    mocks.update.mockResolvedValue({});

    const result = await updatePassword("oldpass", "newpassword123");
    expect(result.success).toBe(true);
    expect(mocks.hash).toHaveBeenCalledWith("newpassword123", 12);
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: {
        password: "$2a$newhashed",
        passwordChangedAt: expect.any(Date),
      },
    });
  });
});
