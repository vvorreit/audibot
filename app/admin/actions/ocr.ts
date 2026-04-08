"use server";

import { prisma } from "@/lib/db";
import { checkAdmin } from "./auth";

export async function getOcrUsers() {
  await checkAdmin();
  const users = await prisma.user.findMany({
    where: { ocrScanLogs: { some: {} } },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  return users;
}

export async function getOcrAnalytics(period: "day" | "week" | "month" = "month", userId?: string, monthParam?: string) {
  await checkAdmin();

  const now = new Date();
  let startDate: Date;
  let endDate: Date | undefined;
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
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 1);
    } else {
      startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
    }
    groupFormat = (d) => d.toISOString().slice(0, 7);
    labelFormat = (k) => k;
  }

  const userFilter = userId ? { userId } : {};

  const dateFilter = endDate
    ? { createdAt: { gte: startDate, lt: endDate } }
    : { createdAt: { gte: startDate } };

  const [logs, feedbackCount, recentFeedbacks] = await Promise.all([
    prisma.ocrScanLog.findMany({
      where: { ...dateFilter, ...userFilter },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ocrFeedback.count({
      where: { ...dateFilter, ...(userId ? { userId } : {}) },
    }),
    prisma.ocrFeedback.findMany({
      where: { ...dateFilter, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, type: true, message: true, fileName: true, createdAt: true },
    }),
  ]);

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

  const types = ["mutuelle", "ordonnance"] as const;
  const byType = types.map((t) => {
    const filtered = logs.filter((l) => l.type === t);
    const count = filtered.length;
    const succ = filtered.filter((l) => l.success).length;
    const avg = count > 0 ? Math.round(filtered.reduce((s, l) => s + l.globalScore, 0) / count * 10) / 10 : 0;
    return { type: t, count, successRate: count > 0 ? Math.round((succ / count) * 1000) / 10 : 0, avgScore: avg };
  });

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
      date: key,
      label: labelFormat(key),
      mutuelle: v.mutuelle,
      ordonnance: v.ordonnance,
      total: v.mutuelle + v.ordonnance,
      successRate: (v.mutuelle + v.ordonnance) > 0
        ? Math.round(((v.successMutuelle + v.successOrdonnance) / (v.mutuelle + v.ordonnance)) * 1000) / 10
        : 0,
    }));

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
