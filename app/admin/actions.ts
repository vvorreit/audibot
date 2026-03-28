"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auditLog } from "@/lib/adminAudit";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé. Non connecté.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });
  if (dbUser?.role !== "ADMIN") throw new Error("Accès refusé. Réservé aux administrateurs.");
}

export async function getAdminAnalytics() {
  await checkAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Filtre "payant réel" = stripeSubscriptionId non null (abonnement Stripe actif)
  const payantFilter = { stripeSubscriptionId: { not: null } } as const;

  const [
    totalUsers, proUsers,
    essentielUsers, proPlanUsers, equipeUsers,
    payantEssentiel, payantPro, payantCabinet, payantReseau, payantEquipe,
    newThisMonth, newLastMonth, usersLast30Days,
    scansAggregate, verifiedUsers, teamsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPro: true } }),
    prisma.user.count({ where: { plan: "ESSENTIEL" } }),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.user.count({ where: { plan: "EQUIPE" } }),
    // Payants réels (Stripe actif) par plan
    prisma.user.count({ where: { ...payantFilter, plan: "ESSENTIEL" } }),
    prisma.user.count({ where: { ...payantFilter, plan: "PRO" } }),
    prisma.user.count({ where: { ...payantFilter, plan: "CABINET" } }),
    prisma.user.count({ where: { ...payantFilter, plan: "RESEAU" } }),
    prisma.user.count({ where: { ...payantFilter, plan: { in: ["EQUIPE", "ENTERPRISE"] } } }),
    prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
    prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.user.aggregate({ _sum: { clientCount: true } }),
    prisma.user.count({ where: { emailVerified: { not: null } } }),
    prisma.team.count(),
  ]);

  const dailyCounts: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    dailyCounts[d.toISOString().slice(0, 10)] = 0;
  }
  for (const u of usersLast30Days) {
    const key = u.createdAt.toISOString().slice(0, 10);
    if (key in dailyCounts) dailyCounts[key]++;
  }

  const totalPayants = payantEssentiel + payantPro + payantCabinet + payantReseau + payantEquipe;
  const conversionRate = totalUsers > 0 ? Math.round((totalPayants / totalUsers) * 1000) / 10 : 0;
  const priceEssentiel = Number(process.env.STRIPE_PRICE_ESSENTIEL_AMOUNT ?? 39.9);
  const pricePro = Number(process.env.STRIPE_PRICE_PRO_AMOUNT ?? 69.9);
  const priceCabinet = Number(process.env.STRIPE_PRICE_CABINET_AMOUNT ?? 179);
  const priceReseau = Number(process.env.STRIPE_PRICE_RESEAU_AMOUNT ?? 299);
  const priceEquipe = Number(process.env.STRIPE_PRICE_EQUIPE_AMOUNT ?? 249.9);

  // MRR basé uniquement sur les abonnements Stripe actifs
  const mrrEstimate = Math.round((
    payantEssentiel * priceEssentiel +
    payantPro * pricePro +
    payantCabinet * priceCabinet +
    payantReseau * priceReseau +
    payantEquipe * priceEquipe
  ) * 100) / 100;

  return {
    totalUsers, proUsers, essentielUsers, proPlanUsers, equipeUsers,
    payantEssentiel, payantPro, payantCabinet, payantReseau, payantEquipe, totalPayants,
    freeUsers: totalUsers - totalPayants,
    newThisMonth, newLastMonth,
    totalScans: scansAggregate._sum.clientCount ?? 0,
    verifiedUsers, unverifiedUsers: totalUsers - verifiedUsers,
    teamsCount, conversionRate, mrrEstimate,
    signupsLast30Days: dailyCounts,
  };
}

export async function getAllUsersAdmin() {
  await checkAdmin();

  // 1. Récupérer les stats de qualité globales par utilisateur via une requête brute (plus performant)
  const qualityStats = await prisma.$queryRaw`
    SELECT 
      "userId",
      COUNT(*)::float as total,
      COUNT(*) FILTER (WHERE "success" = true)::float as successes,
      AVG("fieldsCount")::float as "avgFields"
    FROM "InjectionLog"
    GROUP BY "userId"
  ` as any[];

  const qualityMap = new Map(qualityStats.map(s => [s.userId, {
    successRate: s.total > 0 ? Math.round((s.successes / s.total) * 100) : 0,
    avgFields: Math.round((s.avgFields || 0) * 10) / 10
  }]));

  // 2. Récupérer la liste des utilisateurs
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true,
      isPro: true, plan: true, clientCount: true,
      createdAt: true, role: true,
      teamId: true, teamRole: true, freeUntil: true,
      onboardingStep: true,
      lastActiveAt: true,
      team: { select: { id: true, name: true, ownerId: true } },
      dossiersTP: {
        select: {
          relances: {
            where: { type: { in: ["email", "both"] }, statut: "envoyee" },
            select: { id: true },
          },
        },
      },
      injectionLogs: {
        select: { id: true, site: true, success: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      ocrScanLogs: {
        select: { id: true },
      },
    }
  });

  return users.map(u => {
    const quality = qualityMap.get(u.id) || { successRate: 0, avgFields: 0 };
    return {
      ...u,
      createdAt: u.createdAt.toISOString(),
      freeUntil: u.freeUntil?.toISOString() ?? null,
      lastActiveAt: u.lastActiveAt?.toISOString() ?? null,
      teamName: u.team?.name ?? null,
      isTeamOwner: u.team?.ownerId === u.id,
      relancesEmailCount: u.dossiersTP.reduce((sum, d) => sum + d.relances.length, 0),
      extensionInstalled: (u.onboardingStep ?? 0) >= 1,
      injectionCount: u.clientCount,
      lastInjection: u.injectionLogs[0]?.createdAt?.toISOString() ?? null,
      lastInjectionSite: u.injectionLogs[0]?.site ?? null,
      ocrScanCount: u.ocrScanLogs.length,
      // Nouveaux indicateurs de qualité
      successRate: quality.successRate,
      avgFields: quality.avgFields,
    };
  });
}

export async function getAllTeamsAdmin() {
  await checkAdmin();

  const teams = await prisma.team.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: { select: { id: true, name: true, email: true, teamRole: true, plan: true } },
      invitations: { where: { expires: { gt: new Date() } }, select: { id: true, email: true } },
    }
  });

  // Pour chaque team, récupérer le plan du owner
  const ownerIds = [...new Set(teams.map(t => t.ownerId))];
  const owners = await prisma.user.findMany({
    where: { id: { in: ownerIds } },
    select: { id: true, plan: true, name: true, email: true }
  });
  const ownerMap = Object.fromEntries(owners.map(o => [o.id, o]));

  return teams.map(t => {
    const owner = ownerMap[t.ownerId];
    const limit = owner?.plan === "EQUIPE" ? 5 : owner?.plan === "TEAM_5" ? 5 : owner?.plan === "TEAM_3" ? 3 : 1;
    return {
      id: t.id,
      name: t.name,
      ownerId: t.ownerId,
      ownerName: owner?.name ?? owner?.email ?? "Inconnu",
      ownerEmail: owner?.email ?? "",
      ownerPlan: owner?.plan ?? "FREE",
      membersCount: t.users.length,
      pendingCount: t.invitations.length,
      limit,
      members: t.users,
      pendingInvites: t.invitations,
      createdAt: t.createdAt.toISOString(),
    };
  });
}

export async function setUserPlan(userId: string, plan: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");

  const isPro = plan !== "FREE";
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan, isPro },
    select: { email: true },
  });

  await auditLog({ userId: admin.id, action: "user.plan.change", target: userId, meta: { plan, email: user.email } });
  return { success: true };
}

export async function toggleUserAdminRole(userId: string, currentRole: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const self = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (self?.role !== "ADMIN") throw new Error("Accès refusé.");
  if (self?.id === userId) throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
  const updated = await prisma.user.update({ where: { id: userId }, data: { role: newRole }, select: { id: true, role: true, email: true } });
  await auditLog({ userId: self.id, action: "user.role.change", target: userId, meta: { newRole, email: updated.email } });
  return updated;
}

export async function getOcrUsers() {
  await checkAdmin();
  const users = await prisma.user.findMany({
    where: { ocrScanLogs: { some: {} } },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return users;
}

export async function getOcrAnalytics(period: "day" | "week" | "month" = "month", userId?: string) {
  await checkAdmin();

  const now = new Date();
  let startDate: Date;
  let groupFormat: (d: Date) => string;
  let labelFormat: (key: string) => string;

  if (period === "day") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    groupFormat = (d) => d.toISOString().slice(0, 10);
    labelFormat = (k) => k.slice(5);
  } else if (period === "week") {
    startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    groupFormat = (d) => {
      const onejan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
      return `${d.getFullYear()}-S${String(week).padStart(2, "0")}`;
    };
    labelFormat = (k) => k;
  } else {
    startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
    groupFormat = (d) => d.toISOString().slice(0, 7);
    labelFormat = (k) => k;
  }

  const userFilter = userId ? { userId } : {};

  const [logs, feedbackCount, recentFeedbacks] = await Promise.all([
    prisma.ocrScanLog.findMany({
      where: { createdAt: { gte: startDate }, ...userFilter },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ocrFeedback.count({
      where: { createdAt: { gte: startDate }, ...(userId ? { userId } : {}) },
    }),
    prisma.ocrFeedback.findMany({
      where: { createdAt: { gte: startDate }, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, type: true, message: true, fileName: true, createdAt: true },
    }),
  ]);

  /* KPIs globaux */
  const totalScans = logs.length;
  const successCount = logs.filter((l) => l.success).length;
  const successRate = totalScans > 0 ? Math.round((successCount / totalScans) * 1000) / 10 : 0;
  const avgScore = totalScans > 0 ? Math.round(logs.reduce((s, l) => s + l.globalScore, 0) / totalScans * 10) / 10 : 0;
  const levelCounts = { high: 0, medium: 0, low: 0 };
  for (const l of logs) {
    if (l.level === "high") levelCounts.high++;
    else if (l.level === "medium") levelCounts.medium++;
    else levelCounts.low++;
  }

  /* Par type */
  const types = ["mutuelle", "ordonnance"] as const;
  const byType = types.map((t) => {
    const filtered = logs.filter((l) => l.type === t);
    const count = filtered.length;
    const succ = filtered.filter((l) => l.success).length;
    const avg = count > 0 ? Math.round(filtered.reduce((s, l) => s + l.globalScore, 0) / count * 10) / 10 : 0;
    return { type: t, count, successRate: count > 0 ? Math.round((succ / count) * 1000) / 10 : 0, avgScore: avg };
  });

  /* Évolution temporelle */
  const timeMap: Record<string, { mutuelle: number; ordonnance: number; successMutuelle: number; successOrdonnance: number }> = {};
  for (const l of logs) {
    const key = groupFormat(l.createdAt);
    if (!timeMap[key]) timeMap[key] = { mutuelle: 0, ordonnance: 0, successMutuelle: 0, successOrdonnance: 0 };
    if (l.type === "mutuelle") {
      timeMap[key].mutuelle++;
      if (l.success) timeMap[key].successMutuelle++;
    } else {
      timeMap[key].ordonnance++;
      if (l.success) timeMap[key].successOrdonnance++;
    }
  }
  const timeSeries = Object.entries(timeMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      date: key, // ISO date key (YYYY-MM-DD ou YYYY-MM) pour le drill-down
      label: labelFormat(key),
      mutuelle: v.mutuelle,
      ordonnance: v.ordonnance,
      total: v.mutuelle + v.ordonnance,
      successRate: (v.mutuelle + v.ordonnance) > 0
        ? Math.round(((v.successMutuelle + v.successOrdonnance) / (v.mutuelle + v.ordonnance)) * 1000) / 10
        : 0,
    }));

  /* Distribution des scores */
  const scoreBuckets = [0, 0, 0, 0];
  for (const l of logs) {
    if (l.globalScore < 25) scoreBuckets[0]++;
    else if (l.globalScore < 50) scoreBuckets[1]++;
    else if (l.globalScore < 75) scoreBuckets[2]++;
    else scoreBuckets[3]++;
  }

  return {
    totalScans,
    successRate,
    avgScore,
    feedbackCount,
    levelCounts,
    byType,
    timeSeries,
    scoreBuckets,
    recentFeedbacks: recentFeedbacks.map((f) => ({
      id: f.id,
      type: f.type,
      message: f.message,
      fileName: f.fileName,
      createdAt: f.createdAt.toISOString(),
    })),
  };
}

export async function toggleUserProStatus(userId: string, currentStatus: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isPro: !currentStatus },
    select: { id: true, isPro: true, email: true }
  });
  await auditLog({ userId: admin.id, action: "user.pro.toggle", target: userId, meta: { isPro: updated.isPro, email: updated.email } });
  return updated;
}

export async function getFranchiseLeads() {
  await checkAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads = await (prisma as any).franchiseLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (leads as any[]).map((l) => ({
    id: l.id as string,
    name: l.name as string,
    email: l.email as string,
    phone: l.phone as string,
    company: l.company as string,
    stores: l.stores as string,
    seats: l.seats as string | null,
    erp: l.erp as string | null,
    message: l.message as string | null,
    status: l.status as string,
    notes: l.notes as string | null,
    reseau: l.reseau as string | null,
    nbMagasins: l.nbMagasins as string | null,
    createdAt: (l.createdAt as Date).toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    statusHistory: (l.statusHistory as any[]).map((h) => ({
      id: h.id as string,
      oldStatus: h.oldStatus as string,
      newStatus: h.newStatus as string,
      note: h.note as string | null,
      createdAt: (h.createdAt as Date).toISOString(),
    })),
  }));
}

export async function updateFranchiseLeadStatus(leadId: string, status: string, notes?: string) {
  await checkAdmin();
  const STATUTS = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED_WON", "CLOSED_LOST"] as const;
  if (!STATUTS.includes(status as typeof STATUTS[number])) throw new Error("Statut invalide.");

  /* Récupérer l'ancien statut avant mise à jour */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const current = await (prisma as any).franchiseLead.findUnique({
    where: { id: leadId },
    select: { status: true },
  });
  const oldStatus = (current?.status as string) ?? "NEW";

  /* Enregistrer l'historique + mettre à jour en transaction */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, updated] = await (prisma as any).$transaction([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).franchiseLeadStatusHistory.create({
      data: { leadId, oldStatus, newStatus: status, note: notes ?? null },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).franchiseLead.update({
      where: { id: leadId },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
      select: { id: true, status: true },
    }),
  ]);
  return updated;
}

export async function getFranchiseAlerts() {
  await checkAdmin();
  const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const count = await (prisma as any).franchiseLead.count({
    where: { status: "NEW", createdAt: { lt: threshold } },
  });
  return { count } as { count: number };
}

export async function getFunnelMetrics(days: 7 | 30 | 90 = 30) {
  await checkAdmin();

  const now = new Date();
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);

  const [
    newUsers,
    activatedUsers, // au moins 1 scan
    convertedUsers,
    churnedUsers,
    prevConverted,
    prevNewUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: since }, clientCount: { gt: 0 } } }),
    prisma.user.count({ where: { createdAt: { gte: since }, isPro: true } }),
    // Churn = users devenus FREE après avoir été Pro (approximé par plan=FREE + isPro=false + stripeSubscriptionId non null)
    prisma.user.count({ where: { isPro: false, plan: "FREE", stripeSubscriptionId: { not: null }, lastActiveAt: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: prevSince, lt: since }, isPro: true } }),
    prisma.user.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
  ]);

  const activationRate = newUsers > 0 ? Math.round((activatedUsers / newUsers) * 1000) / 10 : 0;
  const conversionRate = newUsers > 0 ? Math.round((convertedUsers / newUsers) * 1000) / 10 : 0;
  const prevConversionRate = prevNewUsers > 0 ? Math.round((prevConverted / prevNewUsers) * 1000) / 10 : 0;
  const conversionDelta = Math.round((conversionRate - prevConversionRate) * 10) / 10;

  // MRR actuel
  const [essentielCount, proCount, cabinetCount, reseauCount, equipeCount] = await Promise.all([
    prisma.user.count({ where: { plan: "ESSENTIEL", stripeSubscriptionId: { not: null } } }),
    prisma.user.count({ where: { plan: "PRO", stripeSubscriptionId: { not: null } } }),
    prisma.user.count({ where: { plan: "CABINET", stripeSubscriptionId: { not: null } } }),
    prisma.user.count({ where: { plan: "RESEAU", stripeSubscriptionId: { not: null } } }),
    prisma.user.count({ where: { plan: "EQUIPE", stripeSubscriptionId: { not: null } } }),
  ]);
  const priceEssentiel = Number(process.env.STRIPE_PRICE_ESSENTIEL_AMOUNT ?? 39.9);
  const pricePro = Number(process.env.STRIPE_PRICE_PRO_AMOUNT ?? 69.9);
  const priceCabinet = Number(process.env.STRIPE_PRICE_CABINET_AMOUNT ?? 179);
  const priceReseau = Number(process.env.STRIPE_PRICE_RESEAU_AMOUNT ?? 299);
  const priceEquipe = Number(process.env.STRIPE_PRICE_EQUIPE_AMOUNT ?? 249.9);
  const mrr = Math.round((
    essentielCount * priceEssentiel +
    proCount * pricePro +
    cabinetCount * priceCabinet +
    reseauCount * priceReseau +
    equipeCount * priceEquipe
  ) * 100) / 100;

  // Funnel par étape (barres)
  const funnelSteps = [
    { label: "Inscrits", value: newUsers },
    { label: "Activés (1 scan)", value: activatedUsers },
    { label: "Convertis (payant)", value: convertedUsers },
  ];

  return {
    newUsers, activatedUsers, convertedUsers, churnedUsers,
    activationRate, conversionRate, conversionDelta,
    mrr, funnelSteps,
  };
}

export async function grantFreeMonths(
  userId: string,
  months: number,
  note?: string
): Promise<{ ok: boolean; freeUntil: string; stripeCredit: boolean }> {
  await checkAdmin();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, stripeSubscriptionId: true, freeUntil: true, plan: true, email: true, name: true },
  });
  if (!user) throw new Error("Utilisateur introuvable");

  const base = user.freeUntil && user.freeUntil > new Date() ? user.freeUntil : new Date();
  const newFreeUntil = new Date(base);
  newFreeUntil.setMonth(newFreeUntil.getMonth() + months);

  await prisma.user.update({
    where: { id: userId },
    data: {
      freeUntil: newFreeUntil,
      freeMonthsNote: note || null,
      isPro: true,
    },
  });

  let stripeCredit = false;
  if (user.stripeCustomerId && user.stripeSubscriptionId) {
    try {
      const { stripe } = await import("@/lib/stripe");
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const monthlyAmount = subscription.items.data[0]?.price?.unit_amount || 0;
      if (monthlyAmount > 0) {
        await stripe.customers.createBalanceTransaction(user.stripeCustomerId, {
          amount: -(monthlyAmount * months),
          currency: "eur",
          description: `${months} mois offerts par OptiBot${note ? " — " + note : ""}`,
        });
        stripeCredit = true;
      }
    } catch (e) {
      console.warn("[grantFreeMonths] Stripe credit failed:", e);
    }
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await auditLog({ userId: session.user.id, action: "user.free_months.grant", target: userId, meta: { months, note, freeUntil: newFreeUntil.toISOString(), stripeCredit, email: user.email } });
  }
  return { ok: true, freeUntil: newFreeUntil.toISOString(), stripeCredit };
}

export async function revokeFreeMonths(userId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  await prisma.user.update({
    where: { id: userId },
    data: { freeUntil: null, freeMonthsNote: null },
  });
  await auditLog({ userId: admin.id, action: "user.free_months.revoke", target: userId, meta: { email: user?.email } });
}

export async function getUserDetail(userId: string) {
  await checkAdmin();

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true,
      createdAt: true, lastActiveAt: true, emailVerified: true,
      role: true, plan: true, isPro: true, pendingPlan: true, freeUntil: true, freeMonthsNote: true,
      stripeSubscriptionId: true, stripeCustomerId: true,
      cgvVersion: true, needsCgvAcceptance: true,
      clientCount: true, teamId: true, teamRole: true,
      team: { select: { name: true } },
    },
  });
  if (!user) throw new Error("Utilisateur introuvable.");

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalScans,
    scansThisMonth,
    successScans,
    totalDossiers,
    dossiersEnAttente,
    relancesCount,
    subscriptionHistory,
    emailsSent,
    legalAcceptances,
    recentScans,
    totalInjections,
    successInjections,
    injections30d,
    recentInjections,
  ] = await Promise.all([
    prisma.ocrScanLog.count({ where: { userId } }),
    prisma.ocrScanLog.count({ where: { userId, createdAt: { gte: thisMonthStart } } }),
    prisma.ocrScanLog.count({ where: { userId, globalScore: { gte: 60 } } }),
    prisma.dossierTiersPayant.count({ where: { userId } }),
    prisma.dossierTiersPayant.count({ where: { userId, statut: "EN_ATTENTE" } }),
    prisma.relanceLog.count({ where: { dossier: { userId } } }),
    prisma.adminAuditLog.findMany({
      where: { target: userId, action: { contains: "plan" } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true, action: true, meta: true },
    }),
    user.email
      ? prisma.emailTracking.findMany({
          where: { email: user.email },
          orderBy: { sentAt: "desc" },
          take: 20,
          select: { sentAt: true, campaign: { select: { subject: true, name: true } } },
        })
      : Promise.resolve([]),
    prisma.legalAcceptance.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { documentType: true, documentVersion: true, createdAt: true, ipAddress: true },
    }),
    prisma.ocrScanLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { type: true, globalScore: true, createdAt: true, success: true },
    }),
    // Extension usage
    prisma.injectionLog.count({ where: { userId } }),
    prisma.injectionLog.count({ where: { userId, success: true } }),
    prisma.injectionLog.count({ where: { userId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.injectionLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 15,
      select: { id: true, site: true, success: true, fieldsCount: true, createdAt: true },
    }),
  ]);

  const successRate = totalScans > 0 ? Math.round((successScans / totalScans) * 1000) / 10 : 0;

  // subscriptionStartDate : première LegalAcceptance CGV ou createdAt si isPro
  const firstCgv = legalAcceptances.find(a => a.documentType === "CGV");
  const subscriptionStartDate = firstCgv
    ? firstCgv.createdAt.toISOString()
    : user.isPro ? user.createdAt.toISOString() : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    lastActiveAt: user.lastActiveAt.toISOString(),
    emailVerified: user.emailVerified?.toISOString() ?? null,
    role: user.role,
    plan: user.plan,
    isPro: user.isPro,
    pendingPlan: user.pendingPlan,
    freeUntil: user.freeUntil?.toISOString() ?? null,
    freeMonthsNote: user.freeMonthsNote ?? null,
    stripeSubscriptionId: user.stripeSubscriptionId,
    stripeCustomerId: user.stripeCustomerId,
    cgvVersion: user.cgvVersion,
    needsCgvAcceptance: user.needsCgvAcceptance,
    clientCount: user.clientCount,
    teamId: user.teamId,
    teamRole: user.teamRole,
    teamName: user.team?.name ?? null,
    // KPIs
    totalScans,
    scansThisMonth,
    successRate,
    totalDossiers,
    dossiersEnAttente,
    totalRelances: relancesCount,
    // Abonnement
    subscriptionStartDate,
    subscriptionHistory: subscriptionHistory.map(l => ({
      date: l.createdAt.toISOString(),
      plan: (l.meta as Record<string, string> | null)?.plan ?? "—",
      event: l.action,
    })),
    // Emails
    emailsSent: emailsSent.map(e => ({
      subject: e.campaign.subject ?? e.campaign.name,
      sentAt: e.sentAt?.toISOString() ?? "",
      type: e.campaign.name,
    })),
    // Légal
    legalAcceptances: legalAcceptances.map(a => ({
      documentType: a.documentType,
      documentVersion: a.documentVersion,
      createdAt: a.createdAt.toISOString(),
      ipAddress: a.ipAddress,
    })),
    // Scans récents
    recentScans: recentScans.map(s => ({
      type: s.type,
      score: s.globalScore,
      createdAt: s.createdAt.toISOString(),
      success: s.success,
    })),
    // Extension usage
    extensionStats: {
      totalInjections: user.clientCount,
      successRate: totalInjections > 0 ? Math.round((successInjections / totalInjections) * 100) : 0,
      injections30d,
    },
    recentInjections: recentInjections.map(l => ({
      id: l.id,
      site: l.site,
      success: l.success,
      fieldsCount: l.fieldsCount,
      createdAt: l.createdAt.toISOString(),
    })),
  };
}

export async function deleteUserAdmin(userId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");
  if (admin.id === userId) throw new Error("Impossible de supprimer son propre compte.");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeSubscriptionId: true, teamId: true, teamRole: true },
  });

  // Annuler l'abonnement Stripe si actif
  if (user?.stripeSubscriptionId) {
    try {
      const { stripe } = await import("@/lib/stripe");
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (e) {
      console.warn("[ADMIN DELETE] Stripe cancel failed:", e);
    }
  }

  // Si l'utilisateur est owner d'une équipe → supprimer l'équipe + tous ses membres
  const ownedTeam = await prisma.team.findFirst({
    where: { ownerId: userId },
    select: { id: true, stripeSubscriptionId: true, users: { select: { id: true } } },
  });

  if (ownedTeam) {
    // Annuler l'abonnement Stripe de l'équipe
    if (ownedTeam.stripeSubscriptionId) {
      try {
        const { stripe } = await import("@/lib/stripe");
        await stripe.subscriptions.cancel(ownedTeam.stripeSubscriptionId);
      } catch (e) {
        console.warn("[ADMIN DELETE] Team Stripe cancel failed:", e);
      }
    }
    // Supprimer tous les membres (sauf l'owner qui sera supprimé après)
    for (const member of ownedTeam.users) {
      if (member.id !== userId) {
        try {
          await prisma.user.delete({ where: { id: member.id } });
        } catch (e) {
          console.warn("[ADMIN DELETE] Member delete failed:", member.id, e);
        }
      }
    }
    await prisma.team.delete({ where: { id: ownedTeam.id } });
    console.log("[ADMIN] Équipe supprimée avec son owner:", ownedTeam.id);
  }

  // Suppression en cascade via Prisma (onDelete: Cascade)
  await prisma.user.delete({ where: { id: userId } });

  await auditLog({ userId: admin.id, action: "user.delete", target: userId, meta: { email: user?.email } });
  console.log("[ADMIN] User supprimé:", userId, user?.email, new Date().toISOString());
}

export async function purgeOrphanTeams(): Promise<{ count: number }> {
  await checkAdmin();
  // Équipes orphelines = aucun utilisateur avec ce teamId
  const allTeams = await prisma.team.findMany({ select: { id: true } });
  const teamsWithMembers = await prisma.user.groupBy({
    by: ["teamId"],
    where: { teamId: { not: null } },
  });
  const teamIdsWithMembers = new Set(teamsWithMembers.map(t => t.teamId));
  const orphanTeams = allTeams.filter(t => !teamIdsWithMembers.has(t.id));
  for (const t of orphanTeams) {
    await prisma.team.delete({ where: { id: t.id } });
  }
  return { count: orphanTeams.length };
}

export async function getExtensionUsageStats() {
  await checkAdmin();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Top sites par nombre de remplissages (30 derniers jours)
  const topSites = await prisma.injectionLog.groupBy({
    by: ["site"],
    _count: { id: true },
    _sum: { fieldsCount: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  // Taux de succès par site
  const successBySite = await prisma.injectionLog.groupBy({
    by: ["site", "success"],
    _count: { id: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  const successMap: Record<string, { success: number; total: number }> = {};
  for (const row of successBySite) {
    if (!successMap[row.site]) successMap[row.site] = { success: 0, total: 0 };
    successMap[row.site].total += row._count.id;
    if (row.success) successMap[row.site].success += row._count.id;
  }

  // Nb d'utilisateurs distincts par site
  const usersBySite = await prisma.injectionLog.groupBy({
    by: ["site"],
    _count: { userId: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  const usersMap = Object.fromEntries(usersBySite.map(r => [r.site, r._count.userId]));

  // Total remplissages 30j
  const totalInjections = await prisma.injectionLog.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

  // Nb users avec au moins 1 remplissage 30j
  const activeExtUsers = await prisma.injectionLog.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    distinct: ["userId"],
    select: { userId: true },
  });

  return {
    totalInjections30d: totalInjections,
    activeExtUsers30d: activeExtUsers.length,
    topSites: topSites.map(s => ({
      site: s.site,
      injections: s._count.id,
      fieldsTotal: s._sum.fieldsCount ?? 0,
      users: usersMap[s.site] ?? 0,
      successRate: successMap[s.site]
        ? Math.round((successMap[s.site].success / successMap[s.site].total) * 100)
        : 0,
    })),
  };
}

export async function getInjectionByMode(days = 30) {
  await checkAdmin();
  const since = new Date(Date.now() - days * 86_400_000);
  const modes = ["smartfill", "bot", "recorder"] as const;
  const results = await Promise.all(modes.map(async (mode) => {
    const [total, successes, topSites] = await Promise.all([
      prisma.injectionLog.count({ where: { mode, createdAt: { gte: since } } }),
      prisma.injectionLog.count({ where: { mode, success: true, createdAt: { gte: since } } }),
      prisma.injectionLog.groupBy({
        by: ["site"],
        where: { mode, createdAt: { gte: since } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 3,
      }),
    ]);
    return {
      mode,
      total,
      successRate: total > 0 ? Math.round((successes / total) * 100) : 0,
      topSites: topSites.map(s => ({ site: s.site, count: s._count.id })),
    };
  }));
  return results;
}

export async function getUserInjectionHistory(userId: string) {
  await checkAdmin();
  const logs = await prisma.injectionLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, site: true, success: true, fieldsCount: true, createdAt: true },
  });
  return logs.map(l => ({ ...l, createdAt: l.createdAt.toISOString() }));
}

// ── KPIs avancés ────────────────────────────────────────────────────────────

export async function getTimeToValueMetrics() {
  await checkAdmin();

  const users = await prisma.user.findMany({
    where: { clientCount: { gt: 0 } },
    select: { id: true, createdAt: true, ocrScanLogs: { select: { createdAt: true }, orderBy: { createdAt: "asc" }, take: 1 } },
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const ttv = users
    .filter(u => u.ocrScanLogs.length > 0)
    .map(u => {
      const firstScan = u.ocrScanLogs[0].createdAt;
      return Math.round((firstScan.getTime() - u.createdAt.getTime()) / (1000 * 60 * 60));
    });

  if (ttv.length === 0) return { avg: 0, median: 0, p90: 0, lt1h: 0, lt24h: 0, lt48h: 0, gt48h: 0, total: 0 };

  ttv.sort((a, b) => a - b);
  const avg = Math.round(ttv.reduce((s, v) => s + v, 0) / ttv.length);
  const median = ttv[Math.floor(ttv.length / 2)];
  const p90 = ttv[Math.floor(ttv.length * 0.9)];
  const lt1h = ttv.filter(v => v < 1).length;
  const lt24h = ttv.filter(v => v < 24).length;
  const lt48h = ttv.filter(v => v < 48).length;
  const gt48h = ttv.filter(v => v >= 48).length;

  return { avg, median, p90, lt1h, lt24h, lt48h, gt48h, total: ttv.length };
}

export async function getEngagementMetrics() {
  await checkAdmin();
  const now = new Date();
  const day1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const week1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const month1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [dau, wau, mau, total] = await Promise.all([
    prisma.user.count({ where: { lastActiveAt: { gte: day1 } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: week1 } } }),
    prisma.user.count({ where: { lastActiveAt: { gte: month1 } } }),
    prisma.user.count(),
  ]);

  const dauCurve: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const dayStart = new Date(now);
    dayStart.setDate(dayStart.getDate() - i);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const count = await prisma.ocrScanLog.findMany({
      where: { createdAt: { gte: dayStart, lte: dayEnd } },
      distinct: ["userId"],
      select: { userId: true },
    }).then(r => r.length);
    dauCurve.push({ date: dayStart.toISOString().slice(0, 10), count });
  }

  return {
    dau, wau, mau,
    stickiness: mau > 0 ? Math.round((dau / mau) * 100) : 0,
    wauMauRatio: mau > 0 ? Math.round((wau / mau) * 100) : 0,
    dauCurve,
  };
}

export async function getFeatureAdoptionMetrics() {
  await checkAdmin();

  const proUsers = await prisma.user.count({ where: { isPro: true } });
  const totalUsers = await prisma.user.count();

  const [
    tpUsers,
    scanMobileUsers,
    ocrUsers,
    extensionUsers,
    rpaUsers,
  ] = await Promise.all([
    prisma.dossierTiersPayant.findMany({ distinct: ["userId"], select: { userId: true } }).then(r => r.length),
    prisma.scanSession.findMany({ distinct: ["userId"], select: { userId: true } }).then(r => r.length),
    prisma.ocrScanLog.findMany({ distinct: ["userId"], select: { userId: true } }).then(r => r.length),
    prisma.user.count({ where: { onboardingStep: { gte: 1 } } }),
    prisma.rpaLog.findMany({ where: { userId: { not: null } }, distinct: ["userId"], select: { userId: true } }).then(r => r.length),
  ]);

  return {
    totalUsers,
    proUsers,
    features: [
      { label: "Extension installée", users: extensionUsers, pct: totalUsers > 0 ? Math.round(extensionUsers / totalUsers * 100) : 0 },
      { label: "OCR utilisé", users: ocrUsers, pct: totalUsers > 0 ? Math.round(ocrUsers / totalUsers * 100) : 0 },
      { label: "Scan mobile", users: scanMobileUsers, pct: totalUsers > 0 ? Math.round(scanMobileUsers / totalUsers * 100) : 0 },
      { label: "Tiers-Payant", users: tpUsers, pct: proUsers > 0 ? Math.round(tpUsers / proUsers * 100) : 0, note: "% des PRO" },
      { label: "RPA utilisé", users: rpaUsers, pct: proUsers > 0 ? Math.round(rpaUsers / proUsers * 100) : 0, note: "% des PRO" },
    ],
  };
}

export async function getNpsMetrics() {
  await checkAdmin();

  const responses = await prisma.npsResponse.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { score: true, message: true, createdAt: true, email: true },
  });

  if (responses.length === 0) return { nps: null, responses: [], distribution: {}, promoters: 0, passives: 0, detractors: 0, total: 0 };

  const normalized = responses.map(r => ({ ...r, score10: r.score <= 5 ? r.score * 2 : r.score }));

  const promoters = normalized.filter(r => r.score10 >= 9).length;
  const passives = normalized.filter(r => r.score10 >= 7 && r.score10 <= 8).length;
  const detractors = normalized.filter(r => r.score10 <= 6).length;
  const total = responses.length;

  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : null;

  const distribution: Record<string, number> = {};
  for (let i = 1; i <= 10; i++) {
    distribution[String(i)] = normalized.filter(r => r.score10 === i).length;
  }

  return {
    nps,
    total,
    promoters,
    passives,
    detractors,
    distribution,
    responses: normalized.slice(0, 20).map(r => ({
      score: r.score10,
      message: r.message,
      email: r.email,
      date: r.createdAt.toISOString(),
    })),
  };
}

export async function getExpansionMetrics() {
  await checkAdmin();
  const now = new Date();

  const priceMap: Record<string, number> = {
    ESSENTIEL: Number(process.env.STRIPE_PRICE_ESSENTIEL_AMOUNT ?? 39.9),
    PRO: Number(process.env.STRIPE_PRICE_PRO_AMOUNT ?? 69.9),
    CABINET: Number(process.env.STRIPE_PRICE_CABINET_AMOUNT ?? 179),
    RESEAU: Number(process.env.STRIPE_PRICE_RESEAU_AMOUNT ?? 299),
    EQUIPE: Number(process.env.STRIPE_PRICE_EQUIPE_AMOUNT ?? 249.9),
  };

  const payants = await prisma.user.findMany({
    where: { stripeSubscriptionId: { not: null } },
    select: { plan: true },
  });

  const mrrByPlan = Object.entries(priceMap).map(([plan, price]) => ({
    plan,
    count: payants.filter(u => u.plan === plan).length,
    mrr: payants.filter(u => u.plan === plan).length * price,
  }));

  const totalMrr = mrrByPlan.reduce((s, p) => s + p.mrr, 0);
  const arr = totalMrr * 12;

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const essentielNearLimit = await prisma.user.count({
    where: {
      plan: "ESSENTIEL",
      monthlyScanCount: { gte: 64 },
      monthlyScanResetAt: { gte: monthStart },
    },
  });

  return { mrrByPlan, totalMrr: Math.round(totalMrr * 100) / 100, arr: Math.round(arr), essentielNearLimit };
}
