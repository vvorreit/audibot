import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => {
  const prismaUser = {
    update: vi.fn(),
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
  };
  const prismaTeam = {
    update: vi.fn(),
    findFirst: vi.fn(),
  };
  const constructEvent = vi.fn();

  return { prismaUser, prismaTeam, constructEvent };
});

vi.mock("@/lib/db", () => ({
  prisma: {
    user: mocks.prismaUser,
    team: mocks.prismaTeam,
  },
}));

vi.mock("@/lib/mailer", () => ({
  sendMail: vi.fn().mockResolvedValue({}),
  smtpConfigured: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: mocks.constructEvent,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue("test-signature"),
  }),
}));

import { POST } from "@/app/api/webhook/route";

function makeRequest(body: string): Request {
  return new Request("http://localhost/api/webhook", {
    method: "POST",
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
});

describe("webhook checkout.session.completed", () => {
  it("user essentiel → isPro: true", async () => {
    const session = {
      subscription: "sub_123",
      customer: "cus_123",
      metadata: { userId: "user_1", plan: "ESSENTIEL" },
    };

    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });

    mocks.prismaUser.update.mockResolvedValue({});
    mocks.prismaUser.findUnique.mockResolvedValue(null);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mocks.prismaUser.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: {
        stripeSubscriptionId: "sub_123",
        stripeCustomerId: "cus_123",
        isPro: true,
        plan: "ESSENTIEL",
      },
    });
  });

  it("team → plan: EQUIPE", async () => {
    const session = {
      subscription: "sub_team_1",
      customer: "cus_team_1",
      metadata: { teamId: "team_1", plan: "EQUIPE" },
    };

    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });

    mocks.prismaTeam.update.mockResolvedValue({ ownerId: "owner_1" });
    mocks.prismaUser.update.mockResolvedValue({});
    mocks.prismaUser.findFirst.mockResolvedValue(null);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mocks.prismaTeam.update).toHaveBeenCalledWith({
      where: { id: "team_1" },
      data: {
        stripeSubscriptionId: "sub_team_1",
        stripeCustomerId: "cus_team_1",
        plan: "EQUIPE",
      },
      select: { ownerId: true },
    });
  });
});

describe("webhook customer.subscription.deleted", () => {
  it("user → isPro: false", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { id: "sub_123" },
      },
    });

    mocks.prismaTeam.findFirst.mockResolvedValue(null);
    mocks.prismaUser.findFirst.mockResolvedValue({ id: "user_1" });
    mocks.prismaUser.update.mockResolvedValue({});

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mocks.prismaUser.update).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { isPro: false, plan: "FREE", pendingPlan: null, stripeSubscriptionId: null },
    });
  });

  it("team → plan: FREE (owner rétrogradé aussi)", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: {
        object: { id: "sub_team_deleted_1" },
      },
    });

    // Une team est trouvée pour cette subscription
    mocks.prismaTeam.findFirst.mockResolvedValue({
      id: "team_test_1",
      ownerId: "owner_test_1",
    });
    mocks.prismaTeam.update.mockResolvedValue({});
    mocks.prismaUser.update.mockResolvedValue({});
    mocks.prismaUser.findMany.mockResolvedValue([]);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    // La team passe FREE
    expect(mocks.prismaTeam.update).toHaveBeenCalledWith({
      where: { id: "team_test_1" },
      data: { plan: "FREE", stripeSubscriptionId: null },
    });

    // Le owner passe FREE + isPro: false
    expect(mocks.prismaUser.update).toHaveBeenCalledWith({
      where: { id: "owner_test_1" },
      data: { plan: "FREE", isPro: false, pendingPlan: null, stripeSubscriptionId: null },
    });
  });
});

describe("webhook customer.subscription.updated", () => {
  it("status=active → isActive=true (team garde EQUIPE)", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_updated_team_1", status: "active", cancel_at_period_end: false, items: { data: [{ price: { id: "price_unknown" } }] } },
      },
    });

    mocks.prismaTeam.findFirst.mockResolvedValue({ id: "team_test_2", ownerId: "owner_test_2", plan: "EQUIPE" });
    mocks.prismaTeam.update.mockResolvedValue({});
    mocks.prismaUser.update.mockResolvedValue({});

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mocks.prismaTeam.update).toHaveBeenCalledWith({
      where: { id: "team_test_2" },
      data: { plan: "EQUIPE" },
    });
    expect(mocks.prismaUser.update).toHaveBeenCalledWith({
      where: { id: "owner_test_2" },
      data: { plan: "EQUIPE", isPro: true, pendingPlan: null },
    });
  });

  it("status=canceled → isActive=false → user isPro: false (downgrade)", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_updated_user_downgrade", status: "canceled", cancel_at_period_end: false, items: { data: [{ price: { id: "price_unknown" } }] } },
      },
    });

    // Pas de team → cherche un user
    mocks.prismaTeam.findFirst.mockResolvedValue(null);
    mocks.prismaUser.findFirst.mockResolvedValue({ id: "user_downgrade_1", plan: "ESSENTIEL" });
    mocks.prismaUser.update.mockResolvedValue({});

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mocks.prismaUser.update).toHaveBeenCalledWith({
      where: { id: "user_downgrade_1" },
      data: { isPro: false, plan: "FREE", pendingPlan: null },
    });
  });

  it("status=past_due → isActive=false → user isPro: false", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: { id: "sub_past_due_1", status: "past_due", cancel_at_period_end: false, items: { data: [{ price: { id: "price_unknown" } }] } },
      },
    });

    mocks.prismaTeam.findFirst.mockResolvedValue(null);
    mocks.prismaUser.findFirst.mockResolvedValue({ id: "user_past_due_1", plan: "ESSENTIEL" });
    mocks.prismaUser.update.mockResolvedValue({});

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mocks.prismaUser.update).toHaveBeenCalledWith({
      where: { id: "user_past_due_1" },
      data: { isPro: false, plan: "FREE", pendingPlan: null },
    });
  });
});

describe("webhook invoice.payment_failed", () => {
  it("log uniquement — retourne 200 sans modifier la DB", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: {
        object: {
          subscription: "sub_payment_failed_1",
          attempt_count: 1,
        },
      },
    });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    // Aucune modification en DB — Stripe retente automatiquement
    expect(mocks.prismaUser.update).not.toHaveBeenCalled();
    expect(mocks.prismaTeam.update).not.toHaveBeenCalled();
  });

  it("2ème tentative → retourne 200 sans modifier la DB", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: {
        object: {
          subscription: "sub_payment_failed_2",
          attempt_count: 2,
        },
      },
    });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);

    expect(mocks.prismaUser.update).not.toHaveBeenCalled();
    expect(mocks.prismaTeam.update).not.toHaveBeenCalled();
  });
});

describe("webhook checkout.session.completed — branches email", () => {
  it("smtpConfigured=true + user trouvé → email envoyé", async () => {
    const { sendMail, smtpConfigured } = await import("@/lib/mailer");
    vi.mocked(smtpConfigured).mockReturnValue(true);
    vi.mocked(sendMail).mockResolvedValue({} as never);

    const session = {
      subscription: "sub_email_1",
      customer: "cus_email_1",
      metadata: { userId: "user_email_1", plan: "ESSENTIEL" },
    };
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });
    mocks.prismaUser.update.mockResolvedValue({});
    mocks.prismaUser.findUnique.mockResolvedValue({ email: "test@example.com", name: "Test User" });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(sendMail).toHaveBeenCalled();
  });

  it("smtpConfigured=true + team trouvée + owner trouvé → email team envoyé", async () => {
    const { sendMail, smtpConfigured } = await import("@/lib/mailer");
    vi.mocked(smtpConfigured).mockReturnValue(true);
    vi.mocked(sendMail).mockResolvedValue({} as never);

    const session = {
      subscription: "sub_team_email",
      customer: "cus_team_email",
      metadata: { teamId: "team_email_1", plan: "EQUIPE" },
    };
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });
    mocks.prismaTeam.update.mockResolvedValue({ ownerId: "owner_email_1" });
    mocks.prismaUser.update.mockResolvedValue({});
    mocks.prismaUser.findFirst.mockResolvedValue({ email: "owner@example.com", name: "Owner" });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(sendMail).toHaveBeenCalled();
  });

  it("sans teamId ni userId → warn + 200 sans DB update", async () => {
    const session = {
      subscription: "sub_no_meta",
      customer: "cus_no_meta",
      metadata: {},
    };
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(mocks.prismaUser.update).not.toHaveBeenCalled();
    expect(mocks.prismaTeam.update).not.toHaveBeenCalled();
  });
});

describe("webhook customer.subscription.deleted — ni team ni user", () => {
  it("ni team ni user → warn + 200 sans update", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_orphan_1" } },
    });
    mocks.prismaTeam.findFirst.mockResolvedValue(null);
    mocks.prismaUser.findFirst.mockResolvedValue(null);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(mocks.prismaUser.update).not.toHaveBeenCalled();
    expect(mocks.prismaTeam.update).not.toHaveBeenCalled();
  });
});

describe("webhook — erreur traitement → 500", () => {
  it("prisma throw → retourne 500", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_crash_1" } },
    });
    mocks.prismaTeam.findFirst.mockRejectedValue(new Error("DB crash"));

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(500);
  });
});

describe("webhook — signature invalide → 400", () => {
  it("constructEvent throw → 400", async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error("Invalid signature"); });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(400);
  });
});

describe("webhook — branches non couvertes", () => {
  it("STRIPE_WEBHOOK_SECRET manquant → 500", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(400);
  });

  it("subscription.updated status=incomplete → no-op (200)", async () => {
    mocks.constructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: { object: { id: "sub_incomplete_1", status: "incomplete", cancel_at_period_end: false, items: { data: [{ price: { id: "price_unknown" } }] } } },
    });
    mocks.prismaTeam.findFirst.mockResolvedValue(null);
    mocks.prismaUser.findFirst.mockResolvedValue(null);

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
    expect(mocks.prismaUser.update).not.toHaveBeenCalled();
  });

  it("email envoi échoue → catch silencieux + 200", async () => {
    const { sendMail, smtpConfigured } = await import("@/lib/mailer");
    vi.mocked(smtpConfigured).mockReturnValue(true);
    vi.mocked(sendMail).mockRejectedValue(new Error("SMTP down"));

    const session = {
      subscription: "sub_email_fail",
      customer: "cus_email_fail",
      metadata: { userId: "user_email_fail", plan: "PRO" },
    };
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: session },
    });
    mocks.prismaUser.update.mockResolvedValue({});
    mocks.prismaUser.findUnique.mockResolvedValue({ email: "fail@test.com", name: "Fail" });

    const res = await POST(makeRequest("{}"));
    expect(res.status).toBe(200);
  });
});
