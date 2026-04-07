"use server";

import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { getSession, getUserId } from "./helpers";

export async function getUserDashboardData() {
  try {
    const session = await getSession();
    if (!session?.user?.email) return null;

    const userId = await getUserId(session);
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
        teamId: true,
        teamRole: true,
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
        prisma.user.update({ where: { id: userId }, data: { lastActiveAt: new Date() } }).catch(err => console.warn("[lastActiveAt] update failed:", err));
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

export async function getMonthlyStats() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const userId = await getUserId(session);
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

export async function getOcrScanHistory() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const userId = await getUserId(session);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, isPro: true },
  });
  if (!user) return null;

  const isPlanLimite = !user.isPro && user.plan !== "PRO" && user.plan !== "EQUIPE";
  const dateLimit = isPlanLimite ? new Date(Date.now() - 30 * 86_400_000) : undefined;

  const scans = await prisma.ocrScanLog.findMany({
    where: { userId, ...(dateLimit ? { createdAt: { gte: dateLimit } } : {}) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, type: true, success: true,
      ocrConfidence: true, dataScore: true, globalScore: true,
      level: true, fileName: true, createdAt: true,
    },
    take: 500,
  });

  return {
    scans: scans.map(s => ({ ...s, createdAt: s.createdAt.toISOString() })),
    isPlanLimite,
    plan: user.plan,
  };
}

export async function getWeeklyActivity() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const userId = await getUserId(session);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { teamId: true },
  });

  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [scansWeek, bilansWeek] = await Promise.all([
    prisma.ocrScanLog.count({
      where: { userId, createdAt: { gte: weekAgo } },
    }),
    prisma.bilanSession.count({
      where: {
        delivered: true,
        createdAt: { gte: weekAgo },
        ...(user?.teamId ? { teamId: user.teamId } : { userId }),
      },
    }),
  ]);

  return { scansWeek, bilansWeek };
}
