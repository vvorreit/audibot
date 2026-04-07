"use server";

import { prisma } from "@/lib/db";
import { checkAdmin } from "./auth";

export async function getFunnelMetrics(days: 7 | 30 | 90 = 30) {
  await checkAdmin();

  const now = new Date();
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);

  const [
    newUsers,
    activatedUsers,
    convertedUsers,
    churnedUsers,
    prevConverted,
    prevNewUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: since }, clientCount: { gt: 0 } } }),
    prisma.user.count({ where: { createdAt: { gte: since }, isPro: true } }),
    prisma.user.count({ where: { isPro: false, plan: "FREE", stripeSubscriptionId: { not: null }, lastActiveAt: { gte: since } } }),
    prisma.user.count({ where: { createdAt: { gte: prevSince, lt: since }, isPro: true } }),
    prisma.user.count({ where: { createdAt: { gte: prevSince, lt: since } } }),
  ]);

  const activationRate = newUsers > 0 ? Math.round((activatedUsers / newUsers) * 1000) / 10 : 0;
  const conversionRate = newUsers > 0 ? Math.round((convertedUsers / newUsers) * 1000) / 10 : 0;
  const prevConversionRate = prevNewUsers > 0 ? Math.round((prevConverted / prevNewUsers) * 1000) / 10 : 0;
  const conversionDelta = Math.round((conversionRate - prevConversionRate) * 10) / 10;

  const [proCount, cabinetCount, reseauCount, equipeCount] = await Promise.all([
    prisma.user.count({ where: { plan: "PRO", stripeSubscriptionId: { not: null } } }),
    prisma.user.count({ where: { plan: "CABINET", stripeSubscriptionId: { not: null } } }),
    prisma.user.count({ where: { plan: "RESEAU", stripeSubscriptionId: { not: null } } }),
    prisma.user.count({ where: { plan: "EQUIPE", stripeSubscriptionId: { not: null } } }),
  ]);
  const pricePro = Number(process.env.STRIPE_PRICE_PRO_AMOUNT ?? 69.9);
  const priceCabinet = Number(process.env.STRIPE_PRICE_CABINET_AMOUNT ?? 179);
  const priceReseau = Number(process.env.STRIPE_PRICE_RESEAU_AMOUNT ?? 299);
  const priceEquipe = Number(process.env.STRIPE_PRICE_EQUIPE_AMOUNT ?? 249.9);
  const mrr = Math.round((
    proCount * pricePro +
    cabinetCount * priceCabinet +
    reseauCount * priceReseau +
    equipeCount * priceEquipe
  ) * 100) / 100;

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

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const dauRows = await prisma.$queryRaw<{ day: string; count: bigint }[]>`
    SELECT DATE("createdAt") as day, COUNT(DISTINCT "userId") as count
    FROM "OcrScanLog"
    WHERE "createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE("createdAt")
    ORDER BY day
  `;

  const dauMap = new Map(dauRows.map(r => [r.day.toString().slice(0, 10), Number(r.count)]));
  const dauCurve: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    dauCurve.push({ date: key, count: dauMap.get(key) ?? 0 });
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
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(DISTINCT "userId") as count FROM "DossierTiersPayant"`.then(r => Number(r[0].count)),
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(DISTINCT "userId") as count FROM "ScanSession"`.then(r => Number(r[0].count)),
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(DISTINCT "userId") as count FROM "OcrScanLog"`.then(r => Number(r[0].count)),
    prisma.user.count({ where: { onboardingStep: { gte: 1 } } }),
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(DISTINCT "userId") as count FROM "RpaLog" WHERE "userId" IS NOT NULL`.then(r => Number(r[0].count)),
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

  return { mrrByPlan, totalMrr: Math.round(totalMrr * 100) / 100, arr: Math.round(arr) };
}
