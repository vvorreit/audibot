"use server";

import { prisma } from "@/lib/db";
import { checkAdmin } from "./auth";

export async function getBilanUsers() {
  await checkAdmin();
  const users = await prisma.bilanSession.findMany({
    distinct: ["userId"],
    select: { user: { select: { id: true, name: true, email: true, storeName: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return users
    .map((s) => s.user)
    .filter(Boolean)
    .map((u) => ({ id: u!.id, label: u!.storeName ?? u!.name ?? u!.email ?? u!.id }));
}

export async function getAdminBilanDashboard(monthParam?: string, period?: "day" | "week" | "month", userId?: string) {
  await checkAdmin();

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (period === "day") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    endDate = new Date(startDate.getTime() + 86400000);
    prevStart = new Date(startDate.getTime() - 86400000);
    prevEnd = startDate;
  } else if (period === "week") {
    const dow = now.getDay();
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
    endDate = new Date(startDate.getTime() + 7 * 86400000);
    prevStart = new Date(startDate.getTime() - 7 * 86400000);
    prevEnd = startDate;
  } else {
    let year = now.getFullYear();
    let month = now.getMonth();
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-").map(Number);
      year = y;
      month = m - 1;
    }
    startDate = new Date(year, month, 1);
    endDate = new Date(year, month + 1, 1);
    prevStart = new Date(year, month - 1, 1);
    prevEnd = startDate;
  }

  const userFilter = userId ? { userId } : {};

  const [allSessions, prevSessions, totalAllTime, usersWithBilan] = await Promise.all([
    prisma.bilanSession.findMany({
      where: { createdAt: { gte: startDate, lt: endDate }, ...userFilter },
      select: {
        delivered: true,
        payload: true,
        status: true,
        source: true,
        npsScore: true,
        npsComment: true,
        npsAt: true,
        createdAt: true,
        userId: true,
        user: { select: { name: true, email: true, storeName: true, plan: true } },
      },
    }),
    prisma.bilanSession.findMany({
      where: { createdAt: { gte: prevStart, lt: prevEnd }, ...userFilter },
      select: { delivered: true, payload: true, npsScore: true, source: true, createdAt: true },
    }),
    prisma.bilanSession.count(),
    prisma.bilanSession.groupBy({ by: ["userId"], _count: true }),
  ]);

  const delivered = allSessions.filter((s) => s.delivered && s.payload);
  const prevDelivered = prevSessions.filter((s) => s.delivered && s.payload);
  const total = allSessions.length;
  const completionRate = total > 0 ? Math.round((delivered.length / total) * 1000) / 10 : 0;
  const prevTotal = prevSessions.length;
  const prevCompletionRate = prevTotal > 0 ? Math.round((prevDelivered.length / prevTotal) * 1000) / 10 : 0;

  type ParsedPayload = { formData?: any; result?: any };
  const parsed: { formData: any; result: any; session: (typeof allSessions)[0] }[] = [];
  for (const s of delivered) {
    try {
      const p: ParsedPayload = JSON.parse(s.payload!);
      parsed.push({ formData: p.formData, result: p.result ?? p, session: s });
    } catch { /* skip */ }
  }

  const prevParsed: { formData: any; result: any }[] = [];
  for (const s of prevDelivered) {
    try {
      const p: ParsedPayload = JSON.parse(s.payload!);
      prevParsed.push({ formData: p.formData, result: p.result ?? p });
    } catch { /* skip */ }
  }

  const waiting = allSessions.filter((s) => s.status === "WAITING").length;
  const inProgress = allSessions.filter((s) => s.status === "IN_PROGRESS").length;
  const done = allSessions.filter((s) => s.status === "DONE").length;

  const sourceDistrib: Record<string, number> = {};
  for (const s of allSessions) {
    const src = s.source ?? "tablette";
    sourceDistrib[src] = (sourceDistrib[src] ?? 0) + 1;
  }

  let complexiteSum = 0;
  const complexiteDistrib: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const { result } of parsed) {
    if (result?.complexiteScore) {
      complexiteSum += result.complexiteScore;
      complexiteDistrib[result.complexiteScore] = (complexiteDistrib[result.complexiteScore] ?? 0) + 1;
    }
  }
  const avgComplexite = parsed.length > 0 ? Math.round((complexiteSum / parsed.length) * 10) / 10 : 0;

  const alertesCount = { urgent: 0, attention: 0, info: 0 };
  for (const { result } of parsed) {
    if (result?.alertes) {
      for (const a of result.alertes) {
        if (a.niveau in alertesCount) alertesCount[a.niveau as keyof typeof alertesCount]++;
      }
    }
  }
  const avgAlertesPerBilan = parsed.length > 0 ? Math.round(((alertesCount.urgent + alertesCount.attention + alertesCount.info) / parsed.length) * 10) / 10 : 0;

  const opportunitesTypes: Record<string, number> = {};
  let totalOpportunites = 0;
  for (const { result } of parsed) {
    if (result?.opportunites) {
      for (const opp of result.opportunites) {
        opportunitesTypes[opp.type] = (opportunitesTypes[opp.type] ?? 0) + 1;
        totalOpportunites++;
      }
    }
  }
  const avgOpportunitesPerBilan = parsed.length > 0 ? Math.round((totalOpportunites / parsed.length) * 10) / 10 : 0;

  const lensRecoMap: Record<string, number> = {};
  for (const { result } of parsed) {
    if (result?.lensRecommendations) {
      for (const rec of result.lensRecommendations) {
        lensRecoMap[rec.label] = (lensRecoMap[rec.label] ?? 0) + 1;
      }
    }
  }
  const lensTopReco = Object.entries(lensRecoMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([label, count]) => ({ label, count, pct: parsed.length > 0 ? Math.round((count / parsed.length) * 100) : 0 }));

  const npsScores = allSessions.filter((s) => s.npsScore !== null).map((s) => s.npsScore!);
  const npsCounts = { promoteurs: 0, passifs: 0, detracteurs: 0 };
  let npsScore: number | null = null;
  if (npsScores.length > 0) {
    for (const score of npsScores) {
      if (score >= 9) npsCounts.promoteurs++;
      else if (score >= 7) npsCounts.passifs++;
      else npsCounts.detracteurs++;
    }
    npsScore = Math.round(((npsCounts.promoteurs - npsCounts.detracteurs) / npsScores.length) * 100);
  }
  const npsResponseRate = delivered.length > 0 ? Math.round((npsScores.length / delivered.length) * 100) : 0;
  const npsComments = allSessions
    .filter((s) => s.npsComment)
    .sort((a, b) => (b.npsAt?.getTime() ?? 0) - (a.npsAt?.getTime() ?? 0))
    .slice(0, 15)
    .map((s) => ({ score: s.npsScore!, comment: s.npsComment!, date: s.npsAt?.toISOString() ?? s.createdAt.toISOString() }));

  const demographics = {
    correctionTypes: {} as Record<string, number>,
    genesActuelles: {} as Record<string, number>,
    budgetDistrib: {} as Record<string, number>,
    frequencePort: {} as Record<string, number>,
    stylePreference: {} as Record<string, number>,
    mainActivity: {} as Record<string, number>,
    screenTimeSum: 0,
    screenTimeCount: 0,
    sportCount: 0,
    conduitNuitCount: 0,
    progressifCount: 0,
    lentillesCount: 0,
    secondePaireCount: 0,
    mutuelleInconnueCount: 0,
    antecedentsCount: 0,
  };

  for (const { formData } of parsed) {
    if (!formData) continue;
    if (formData.correctionType) {
      for (const c of formData.correctionType) {
        demographics.correctionTypes[c] = (demographics.correctionTypes[c] ?? 0) + 1;
      }
    }
    if (formData.genesActuelles) {
      for (const g of formData.genesActuelles) {
        demographics.genesActuelles[g] = (demographics.genesActuelles[g] ?? 0) + 1;
      }
    }
    if (formData.budgetRange) demographics.budgetDistrib[formData.budgetRange] = (demographics.budgetDistrib[formData.budgetRange] ?? 0) + 1;
    if (formData.frequencePort) demographics.frequencePort[formData.frequencePort] = (demographics.frequencePort[formData.frequencePort] ?? 0) + 1;
    if (formData.stylePreference) demographics.stylePreference[formData.stylePreference] = (demographics.stylePreference[formData.stylePreference] ?? 0) + 1;
    if (formData.mainActivity) demographics.mainActivity[formData.mainActivity] = (demographics.mainActivity[formData.mainActivity] ?? 0) + 1;
    if (typeof formData.screenTimeHours === "number") { demographics.screenTimeSum += formData.screenTimeHours; demographics.screenTimeCount++; }
    if (formData.sport) demographics.sportCount++;
    if (formData.conduitNuit) demographics.conduitNuitCount++;
    if (formData.isProgressive) demographics.progressifCount++;
    if (formData.portLentilles) demographics.lentillesCount++;
    if (formData.projetSecondairesPaires) demographics.secondePaireCount++;
    if (formData.mutuelleConnue === false) demographics.mutuelleInconnueCount++;
    if (formData.antecedentsFamiliaux) demographics.antecedentsCount++;
  }
  const avgScreenTime = demographics.screenTimeCount > 0 ? Math.round((demographics.screenTimeSum / demographics.screenTimeCount) * 10) / 10 : 0;

  const dailyVolume: Record<string, { created: number; delivered: number }> = {};
  const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
  for (let d = 0; d < daysInPeriod; d++) {
    const date = new Date(startDate.getTime() + d * 86400000);
    if (date > now) break;
    const key = date.toISOString().slice(0, 10);
    dailyVolume[key] = { created: 0, delivered: 0 };
  }
  for (const s of allSessions) {
    const key = s.createdAt.toISOString().slice(0, 10);
    if (dailyVolume[key]) {
      dailyVolume[key].created++;
      if (s.delivered) dailyVolume[key].delivered++;
    }
  }

  const userSessionMap: Record<string, { name: string; email: string; store: string; plan: string; total: number; delivered: number }> = {};
  for (const s of allSessions) {
    if (!userSessionMap[s.userId]) {
      userSessionMap[s.userId] = {
        name: s.user.name ?? "",
        email: s.user.email ?? "",
        store: s.user.storeName ?? "",
        plan: s.user.plan ?? "FREE",
        total: 0,
        delivered: 0,
      };
    }
    userSessionMap[s.userId].total++;
    if (s.delivered) userSessionMap[s.userId].delivered++;
  }
  const topUsers = Object.values(userSessionMap)
    .sort((a, b) => b.delivered - a.delivered)
    .slice(0, 10);

  const prevNpsScores = prevSessions.filter((s) => s.npsScore !== null).map((s) => s.npsScore!);
  let prevNps: number | null = null;
  if (prevNpsScores.length > 0) {
    let pp = 0, pd = 0;
    for (const sc of prevNpsScores) { if (sc >= 9) pp++; else if (sc < 7) pd++; }
    prevNps = Math.round(((pp - pd) / prevNpsScores.length) * 100);
  }
  let prevAvgComplexite = 0;
  if (prevParsed.length > 0) {
    let s = 0;
    for (const { result } of prevParsed) { if (result?.complexiteScore) s += result.complexiteScore; }
    prevAvgComplexite = Math.round((s / prevParsed.length) * 10) / 10;
  }

  return {
    total,
    delivered: delivered.length,
    completionRate,
    waiting,
    inProgress,
    done,
    totalAllTime,
    uniqueUsers: usersWithBilan.length,
    sourceDistrib,
    dailyVolume,
    avgComplexite,
    complexiteDistrib,
    alertesCount,
    avgAlertesPerBilan,
    opportunitesTypes,
    totalOpportunites,
    avgOpportunitesPerBilan,
    lensTopReco,
    npsScore,
    npsCounts,
    npsResponseRate,
    npsComments,
    demographics: {
      ...demographics,
      avgScreenTime,
      totalWithFormData: parsed.filter((p) => p.formData).length,
    },
    topUsers,
    vsLastMonth: {
      total: prevTotal,
      delivered: prevDelivered.length,
      completionRate: prevCompletionRate,
      nps: prevNps,
      avgComplexite: prevAvgComplexite,
    },
  };
}
