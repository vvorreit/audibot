"use server";

import { prisma } from "@/lib/db";
import { checkAdmin } from "./auth";

export async function getExtensionUsageStats() {
  await checkAdmin();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const topSites = await prisma.injectionLog.groupBy({
    by: ["site"],
    _count: { id: true },
    _sum: { fieldsCount: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

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

  const usersBySite = await prisma.injectionLog.groupBy({
    by: ["site"],
    _count: { userId: true },
    where: { createdAt: { gte: thirtyDaysAgo } },
  });
  const usersMap = Object.fromEntries(usersBySite.map(r => [r.site, r._count.userId]));

  const totalInjections = await prisma.injectionLog.count({
    where: { createdAt: { gte: thirtyDaysAgo } },
  });

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
