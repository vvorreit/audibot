"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";

import { randomBytes } from "crypto";

async function getSession() {
  return await getServerSession(authOptions);
}

function getUserId(session: Awaited<ReturnType<typeof getServerSession<typeof authOptions>>>): string | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (session?.user as any)?.id ?? null;
}

export async function getUserDashboardData() {
  try {
    const session = await getSession();
    if (!session?.user?.email) return null;

    const userId = getUserId(session);
    if (!userId) return null;

    const userSelect = {
        clientCount: true,
        isPro: true,
        plan: true,
        pendingPlan: true,
        syncToken: true,
        role: true,
        createdAt: true,
        onboardingStep: true,
        monthlyScanCount: true,
        monthlyScanResetAt: true,
        needsCgvAcceptance: true,
        cgvVersion: true,
        lastActiveAt: true,
        freeUntil: true,
      } as const;

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (user && !user.syncToken) {
      user = await prisma.user.update({
        where: { id: userId },
        data: { syncToken: randomBytes(16).toString("hex") },
        select: userSelect,
      });
    }

    if (user) {
      // Throttle : update lastActiveAt uniquement si >5 minutes depuis la dernière mise à jour
      const fiveMinAgo = new Date(Date.now() - 5 * 60_000);
      if (!user.lastActiveAt || (user.lastActiveAt instanceof Date && user.lastActiveAt < fiveMinAgo)) {
        prisma.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } }).catch(() => {});
      }
    }

    if (!user) return null;

    const isFreeActive = user.freeUntil && new Date(user.freeUntil) > new Date();
    return {
      ...user,
      isPro: user.isPro || !!isFreeActive,
      plan: (user.isPro || isFreeActive) && user.plan === "FREE" ? "PRO" : user.plan,
      freeUntil: user.freeUntil,
      isFreeActive: !!isFreeActive,
    };
  } catch (error) {
    console.error("Erreur getUserDashboardData:", error);
    return null;
  }
}

// generateAutofillPayload volontairement supprimé côté serveur.
// Le payload contient NSS, nom, prénom, données ordonnance — il ne doit jamais transiter par le serveur.
// Utiliser generatePayloadString() directement côté client (lib/autofill.ts).

const ESSENTIEL_SCAN_LIMIT = Number(process.env.ESSENTIEL_MONTHLY_SCAN_LIMIT ?? 80);

export async function incrementClientCountInDB() {
  try {
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Non autorisé");

    const currentUser = await prisma.user.findUnique({
      where: { id: (session?.user as {id: string})?.id ?? '' },
      select: { plan: true, monthlyScanCount: true, monthlyScanResetAt: true }
    });

    if (!currentUser) throw new Error("Utilisateur introuvable");

    // Reset compteur mensuel si nouveau mois
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let monthlyScanCount = currentUser.monthlyScanCount;

    if (!currentUser.monthlyScanResetAt || currentUser.monthlyScanResetAt < monthStart) {
      monthlyScanCount = 0;
    }

    // Vérifier limite pour plan ESSENTIEL
    if (currentUser.plan === "ESSENTIEL" && monthlyScanCount >= ESSENTIEL_SCAN_LIMIT) {
      throw new Error(`Limite de ${ESSENTIEL_SCAN_LIMIT} scans/mois atteinte. Passez au plan Pro pour un usage illimité.`);
    }

    const user = await prisma.user.update({
      where: { id: (session?.user as {id: string})?.id ?? '' },
      data: {
        clientCount: { increment: 1 },
        monthlyScanCount: monthlyScanCount + 1,
        monthlyScanResetAt: now,
        lastActiveAt: now,
      }
    });

    return user.clientCount;
  } catch (error) {
    console.error("Erreur incrementClientCountInDB:", error);
    throw error;
  }
}

export async function logOcrScan(data: {
  type: string;
  success: boolean;
  ocrConfidence: number;
  dataScore: number;
  globalScore: number;
  level: string;
  fileName?: string;
}) {
  try {
    const session = await getSession();
    if (!session?.user?.email) return;

    const user = await prisma.user.findUnique({
      where: { id: (session?.user as {id: string})?.id ?? '' },
      select: { id: true },
    });
    if (!user) return;

    await prisma.ocrScanLog.create({
      data: {
        userId: user.id,
        type: data.type,
        success: data.success,
        ocrConfidence: data.ocrConfidence,
        dataScore: data.dataScore,
        globalScore: data.globalScore,
        level: data.level,
        fileName: data.fileName,
      },
    });
  } catch (error) {
    console.error("Erreur logOcrScan:", error);
  }
}

export async function createCheckoutSession(
  plan: "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU" | "EQUIPE",
  billing: "monthly" | "annual" = "monthly",
  extraSeats = 0, // Pour le plan RESEAU uniquement
) {
  const priceMap: Record<string, Record<string, string | undefined>> = {
    monthly: {
      ESSENTIEL: process.env.STRIPE_PRICE_ESSENTIEL,
      PRO:       process.env.STRIPE_PRICE_PRO,
      CABINET:   process.env.STRIPE_PRICE_CABINET,
      RESEAU:    process.env.STRIPE_PRICE_RESEAU,
      EQUIPE:    process.env.STRIPE_PRICE_EQUIPE,
    },
    annual: {
      ESSENTIEL: process.env.STRIPE_PRICE_ESSENTIEL_ANNUAL,
      PRO:       process.env.STRIPE_PRICE_PRO_ANNUAL,
      CABINET:   process.env.STRIPE_PRICE_CABINET_ANNUAL,
      RESEAU:    process.env.STRIPE_PRICE_RESEAU_ANNUAL,
      EQUIPE:    process.env.STRIPE_PRICE_EQUIPE_ANNUAL,
    },
  };
  const priceId = priceMap[billing][plan];

  if (!priceId) throw new Error(`Plan Stripe non configuré : STRIPE_PRICE_${plan}`);

  const session = await getSession();
  if (!session?.user?.email) throw new Error("Non autorisé");

  const user = await prisma.user.findUnique({
    where: { id: (session?.user as {id: string})?.id ?? '' },
    include: { team: true },
  });

  if (!user) throw new Error("Utilisateur introuvable");

  // Plans d'équipe — CABINET, RESEAU, EQUIPE
  const isTeamPlan = ["CABINET", "RESEAU", "EQUIPE"].includes(plan);
  let customerId: string | null = null;
  let isTeamBilling = false;

  if (isTeamPlan || user.teamId) {
    if (user.teamId && user.teamRole !== "OWNER") {
      throw new Error("Seul l'administrateur de l'équipe peut gérer la facturation.");
    }
    isTeamBilling = true;
    customerId = user.team?.stripeCustomerId || null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.team?.name || `Équipe de ${user.name}`,
        metadata: { teamId: user.teamId ?? user.id },
      });
      customerId = customer.id;
      if (user.teamId) {
        await prisma.team.update({
          where: { id: user.teamId },
          data: { stripeCustomerId: customerId },
        });
      }
    }
  } else {
    // Facturation personnelle — ESSENTIEL / PRO
    customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }
  }

  // Construction des line_items
  // Plan RESEAU : base + siège(s) supplémentaire(s) si extraSeats > 0
  const lineItems: { price: string; quantity: number }[] = [
    { price: priceId, quantity: 1 },
  ];

  if (plan === "RESEAU" && extraSeats > 0) {
    const extraSeatPriceId = billing === "annual"
      ? process.env.STRIPE_PRICE_RESEAU_SEAT_EXTRA_ANNUAL
      : process.env.STRIPE_PRICE_RESEAU_SEAT_EXTRA;
    if (!extraSeatPriceId) throw new Error("STRIPE_PRICE_RESEAU_SEAT_EXTRA non configuré.");
    lineItems.push({ price: extraSeatPriceId, quantity: extraSeats });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId!,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: lineItems,
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: true },
    customer_update: { name: "auto", address: "auto" },
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url:  `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: isTeamBilling
      ? { teamId: user.teamId ?? user.id, plan, extraSeats: String(extraSeats) }
      : { userId: user.id, plan },
    subscription_data: {
      metadata: isTeamBilling
        ? { teamId: user.teamId ?? user.id, plan, extraSeats: String(extraSeats) }
        : { userId: user.id, plan },
    },
  });

  return { url: checkoutSession.url };
}

export async function upgradePlan(newPlan: "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU" | "EQUIPE", billing: "monthly" | "annual" = "monthly") {
  const session = await getSession();
  if (!session?.user?.email) throw new Error("Non autorisé");

  const user = await prisma.user.findUnique({
    where: { id: (session?.user as {id: string})?.id ?? '' },
    select: { stripeSubscriptionId: true, plan: true }
  });

  if (!user?.stripeSubscriptionId) throw new Error("Aucun abonnement actif.");
  if (user.plan === newPlan) throw new Error("Vous êtes déjà sur ce plan.");

  const priceMap: Record<string, Record<string, string | undefined>> = {
    monthly: {
      ESSENTIEL: process.env.STRIPE_PRICE_ESSENTIEL,
      PRO:       process.env.STRIPE_PRICE_PRO,
      CABINET:   process.env.STRIPE_PRICE_CABINET,
      RESEAU:    process.env.STRIPE_PRICE_RESEAU,
      EQUIPE:    process.env.STRIPE_PRICE_EQUIPE,
    },
    annual: {
      ESSENTIEL: process.env.STRIPE_PRICE_ESSENTIEL_ANNUAL,
      PRO:       process.env.STRIPE_PRICE_PRO_ANNUAL,
      CABINET:   process.env.STRIPE_PRICE_CABINET_ANNUAL,
      RESEAU:    process.env.STRIPE_PRICE_RESEAU_ANNUAL,
      EQUIPE:    process.env.STRIPE_PRICE_EQUIPE_ANNUAL,
    },
  };
  const newPriceId = priceMap[billing][newPlan];

  if (!newPriceId) throw new Error(`Plan Stripe non configuré : STRIPE_PRICE_${newPlan}`);

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error("Abonnement introuvable.");

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{ id: itemId, price: newPriceId }],
    proration_behavior: "always_invoice",
    metadata: { plan: newPlan },
  });

  await prisma.user.update({
    where: { id: (session?.user as {id: string})?.id ?? '' },
    data: { plan: newPlan },
  });

  return { success: true };
}

export async function schedulePlanDowngrade(newPlan: "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU") {
  const session = await getSession();
  if (!session?.user?.email) throw new Error("Non autorisé");

  const userId = (session?.user as {id: string})?.id ?? "";
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true, plan: true, pendingPlan: true },
  });

  if (!user?.stripeSubscriptionId) throw new Error("Aucun abonnement actif.");

  // Vérifier que c'est bien un downgrade
  const planOrder: Record<string, number> = { FREE: 0, ESSENTIEL: 1, PRO: 2, CABINET: 3, RESEAU: 4, EQUIPE: 5 };
  if ((planOrder[newPlan] ?? 0) >= (planOrder[user.plan] ?? 0)) {
    throw new Error("Utilisez le bouton d'upgrade pour monter en gamme.");
  }

  const priceMap: Record<string, string | undefined> = {
    ESSENTIEL: process.env.STRIPE_PRICE_ESSENTIEL,
    PRO:       process.env.STRIPE_PRICE_PRO,
    CABINET:   process.env.STRIPE_PRICE_CABINET,
    RESEAU:    process.env.STRIPE_PRICE_RESEAU,
  };
  const newPriceId = priceMap[newPlan];
  if (!newPriceId) throw new Error(`Plan Stripe non configuré : STRIPE_PRICE_${newPlan}`);

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error("Abonnement introuvable.");

  // Planifier le changement en fin de période courante — sans prorata, sans facture immédiate
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{ id: itemId, price: newPriceId }],
    proration_behavior: "none",
    billing_cycle_anchor: "unchanged",
    metadata: { pendingPlan: newPlan },
  });

  // Stocker le plan prévu localement (affiché dans l'UI)
  await prisma.user.update({
    where: { id: userId },
    data: { pendingPlan: newPlan },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEnd = (subscription as any).current_period_end as number | undefined;
  return { success: true, effectiveDate: periodEnd ? new Date(periodEnd * 1000).toLocaleDateString("fr-FR") : "fin de période" };
}

export async function cancelPlanDowngrade() {
  const session = await getSession();
  if (!session?.user?.email) throw new Error("Non autorisé");

  const userId = (session?.user as {id: string})?.id ?? "";
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeSubscriptionId: true, plan: true, pendingPlan: true },
  });

  if (!user?.stripeSubscriptionId || !user?.pendingPlan) throw new Error("Aucun downgrade planifié.");

  // Remettre le prix actuel (annuler le changement planifié)
  const priceMap: Record<string, string | undefined> = {
    ESSENTIEL: process.env.STRIPE_PRICE_ESSENTIEL,
    PRO:       process.env.STRIPE_PRICE_PRO,
    CABINET:   process.env.STRIPE_PRICE_CABINET,
    RESEAU:    process.env.STRIPE_PRICE_RESEAU,
    EQUIPE:    process.env.STRIPE_PRICE_EQUIPE,
  };
  const currentPriceId = priceMap[user.plan];
  if (!currentPriceId) throw new Error("Plan actuel non configuré.");

  const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error("Abonnement introuvable.");

  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    items: [{ id: itemId, price: currentPriceId }],
    proration_behavior: "none",
    billing_cycle_anchor: "unchanged",
    metadata: { pendingPlan: "" },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { pendingPlan: null },
  });

  return { success: true };
}

export async function createPortalSession() {
  const session = await getSession();
  if (!session?.user?.email) throw new Error("Non autorisé");

  const user = await prisma.user.findUnique({
    where: { id: (session?.user as {id: string})?.id ?? '' },
    include: { team: true }
  });

  if (!user) throw new Error("Utilisateur introuvable");

  let customerId: string | null = null;

  if (user.teamId) {
    if (user.teamRole !== "OWNER") {
      throw new Error("Seul l'administrateur peut accéder au portail de facturation.");
    }
    customerId = user.team?.stripeCustomerId || null;
  } else {
    customerId = user.stripeCustomerId;
  }

  if (!customerId) throw new Error("Aucun abonnement actif trouvé.");

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
  });

  return { url: portalSession.url };
}

export async function getMonthlyStats() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const userId = getUserId(session);
  if (!userId) return null;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [scansThisMonth, dossiersThisMonth] = await Promise.all([
    prisma.ocrScanLog.count({
      where: { userId, createdAt: { gte: monthStart } },
    }),
    prisma.dossierTiersPayant.findMany({
      where: { userId, createdAt: { gte: monthStart } },
      select: { montant: true },
    }),
  ]);

  const montantTP = dossiersThisMonth.reduce((sum, d) => sum + (d.montant ?? 0), 0);

  return {
    scansThisMonth,
    dossiersThisMonth: dossiersThisMonth.length,
    montantTPThisMonth: montantTP,
  };
}
