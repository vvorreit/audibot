"use server";

import { prisma } from "@/lib/db";
import { checkAdmin } from "./auth";

export async function getAdminAnalytics() {
  await checkAdmin();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const payantFilter = { stripeSubscriptionId: { not: null } } as const;

  const [
    totalUsers, proUsers,
    proPlanUsers, equipeUsers,
    payantPro, payantCabinet, payantReseau, payantEquipe,
    newThisMonth, newLastMonth, usersLast30Days,
    scansAggregate, verifiedUsers, teamsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPro: true } }),
    prisma.user.count({ where: { plan: "PRO" } }),
    prisma.user.count({ where: { plan: "EQUIPE" } }),
    prisma.user.count({ where: { ...payantFilter, plan: "PRO" } }),
    prisma.user.count({ where: { ...payantFilter, plan: "CABINET" } }),
    prisma.user.count({ where: { ...payantFilter, plan: "RESEAU" } }),
    prisma.user.count({ where: { ...payantFilter, plan: { in: ["EQUIPE", "ENTERPRISE"] } } }),
    prisma.user.count({ where: { createdAt: { gte: thisMonthStart } } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lt: thisMonthStart } } }),
    prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true }, take: 10000 }),
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

  const totalPayants = payantPro + payantCabinet + payantReseau + payantEquipe;
  const conversionRate = totalUsers > 0 ? Math.round((totalPayants / totalUsers) * 1000) / 10 : 0;
  const pricePro = Number(process.env.STRIPE_PRICE_PRO_AMOUNT ?? 69.9);
  const priceCabinet = Number(process.env.STRIPE_PRICE_CABINET_AMOUNT ?? 179);
  const priceReseau = Number(process.env.STRIPE_PRICE_RESEAU_AMOUNT ?? 299);
  const priceEquipe = Number(process.env.STRIPE_PRICE_EQUIPE_AMOUNT ?? 249.9);

  const mrrEstimate = Math.round((
    payantPro * pricePro +
    payantCabinet * priceCabinet +
    payantReseau * priceReseau +
    payantEquipe * priceEquipe
  ) * 100) / 100;

  return {
    totalUsers, proUsers, proPlanUsers, equipeUsers,
    payantPro, payantCabinet, payantReseau, payantEquipe, totalPayants,
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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 10000,
    select: {
      id: true, name: true, email: true,
      isPro: true, plan: true, clientCount: true,
      createdAt: true, role: true,
      teamId: true, teamRole: true, freeUntil: true,
      onboardingStep: true,
      lastActiveAt: true,
      isBanned: true,
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
      _count: {
        select: { ocrScanLogs: true },
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
      ocrScanCount: u._count.ocrScanLogs,
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

  const ownerIds = [...new Set(teams.map(t => t.ownerId))];
  const owners = await prisma.user.findMany({
    where: { id: { in: ownerIds } },
    select: { id: true, plan: true, name: true, email: true }
  });
  const ownerMap = Object.fromEntries(owners.map(o => [o.id, o]));

  return teams.map(t => {
    const owner = ownerMap[t.ownerId];
    const baseMap: Record<string, number> = { RESEAU: 5, EQUIPE: 5, TEAM_5: 5, CABINET: 3, TEAM_3: 3, PRO: 3 };
    const limit = (baseMap[owner?.plan ?? ""] ?? 1) + (owner?.plan === "RESEAU" ? (t.extraSeats ?? 0) : 0);
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
      extraSeats: t.extraSeats ?? 0,
      members: t.users,
      pendingInvites: t.invitations,
      createdAt: t.createdAt.toISOString(),
    };
  });
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
      isBanned: true, bannedAt: true, bannedReason: true, bannedBy: true,
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
    isBanned: user.isBanned,
    bannedAt: user.bannedAt?.toISOString() ?? null,
    bannedReason: user.bannedReason ?? null,
    bannedBy: user.bannedBy ?? null,
    totalScans,
    scansThisMonth,
    successRate,
    totalDossiers,
    dossiersEnAttente,
    totalRelances: relancesCount,
    subscriptionStartDate,
    subscriptionHistory: subscriptionHistory.map(l => ({
      date: l.createdAt.toISOString(),
      plan: (l.meta as Record<string, string> | null)?.plan ?? "—",
      event: l.action,
    })),
    emailsSent: emailsSent.map(e => ({
      subject: e.campaign.subject ?? e.campaign.name,
      sentAt: e.sentAt?.toISOString() ?? "",
      type: e.campaign.name,
    })),
    legalAcceptances: legalAcceptances.map(a => ({
      documentType: a.documentType,
      documentVersion: a.documentVersion,
      createdAt: a.createdAt.toISOString(),
      ipAddress: a.ipAddress,
    })),
    recentScans: recentScans.map(s => ({
      type: s.type,
      score: s.globalScore,
      createdAt: s.createdAt.toISOString(),
      success: s.success,
    })),
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
