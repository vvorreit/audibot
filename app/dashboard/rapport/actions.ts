"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasFeature } from "@/lib/userFeatures";
import type { BilanResult } from "@/types/bilan";

function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export async function getUserBilanDashboard(
  monthParam?: string,
  period?: "day" | "week" | "month"
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non autorisé");

  const isAdmin = session.user.role === "ADMIN";
  const hasBilan = await hasFeature("bilanAuditif");
  if (!isAdmin && !hasBilan) throw new Error("Accès refusé");

  const userId = session.user.id;
  const teamId = session.user.teamId ?? null;
  // Filtre : si l'user est dans une équipe (franchise), on prend tout le teamId
  const ownerFilter = teamId ? { teamId } : { userId };

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

  const [allSessions, prevSessions, totalAllTime] = await Promise.all([
    prisma.bilanSession.findMany({
      where: { ...ownerFilter, createdAt: { gte: startDate, lt: endDate } },
      select: {
        delivered: true, payload: true, status: true, source: true,
        npsScore: true, npsComment: true, npsAt: true, createdAt: true, userId: true,
        user: { select: { name: true, email: true, storeName: true } },
      },
    }),
    prisma.bilanSession.findMany({
      where: { ...ownerFilter, createdAt: { gte: prevStart, lt: prevEnd } },
      select: { delivered: true, payload: true, npsScore: true, source: true, createdAt: true },
    }),
    prisma.bilanSession.count({ where: ownerFilter }),
  ]);

  const delivered = allSessions.filter((s) => s.delivered && s.payload);
  const prevDelivered = prevSessions.filter((s) => s.delivered && s.payload);
  const total = allSessions.length;
  const completionRate = total > 0 ? Math.round((delivered.length / total) * 1000) / 10 : 0;
  const prevCompletionRate = prevSessions.length > 0
    ? Math.round((prevDelivered.length / prevSessions.length) * 1000) / 10 : 0;

  type Parsed = { formData?: Record<string, unknown>; result?: BilanResult };
  const parsed: { formData: Record<string, unknown> | null; result: BilanResult; session: typeof allSessions[0] }[] = [];
  for (const s of delivered) {
    try {
      const p: Parsed = JSON.parse(s.payload!);
      const result = p.result ?? (p as unknown as BilanResult);
      if (result && typeof result.complexiteScore === "number") {
        parsed.push({ formData: p.formData ?? null, result, session: s });
      }
    } catch { /* skip */ }
  }

  const prevParsed: { result: BilanResult }[] = [];
  for (const s of prevDelivered) {
    try {
      const p: Parsed = JSON.parse(s.payload!);
      const result = p.result ?? (p as unknown as BilanResult);
      if (result && typeof result.complexiteScore === "number") prevParsed.push({ result });
    } catch { /* skip */ }
  }

  // ── Complexité ──
  const complexiteDistrib: Record<number, number> = {};
  let complexiteSum = 0;
  for (const { result } of parsed) {
    complexiteDistrib[result.complexiteScore] = (complexiteDistrib[result.complexiteScore] ?? 0) + 1;
    complexiteSum += result.complexiteScore;
  }
  const avgComplexite = parsed.length > 0 ? Math.round((complexiteSum / parsed.length) * 10) / 10 : 0;
  const prevAvgComplexite = prevParsed.length > 0
    ? Math.round((prevParsed.reduce((s, { result }) => s + result.complexiteScore, 0) / prevParsed.length) * 10) / 10 : 0;

  // ── Alertes ──
  const alertesCount = { urgent: 0, attention: 0, info: 0 };
  let alertesTotal = 0;
  for (const { result } of parsed) {
    for (const a of result.alertes) {
      if (a.niveau in alertesCount) { alertesCount[a.niveau as keyof typeof alertesCount]++; alertesTotal++; }
    }
  }
  const avgAlertesPerBilan = parsed.length > 0 ? Math.round((alertesTotal / parsed.length) * 10) / 10 : 0;

  // ── Opportunités ──
  const opportunitesTypes: Record<string, number> = {};
  let totalOpportunites = 0;
  for (const { result } of parsed) {
    for (const o of result.opportunites) {
      opportunitesTypes[o.type] = (opportunitesTypes[o.type] ?? 0) + 1;
      totalOpportunites++;
    }
  }
  const avgOpportunitesPerBilan = parsed.length > 0
    ? Math.round((totalOpportunites / parsed.length) * 10) / 10 : 0;
  const prevTotalOppos = prevParsed.reduce((s, { result }) => s + result.opportunites.length, 0);
  const prevAvgOppos = prevParsed.length > 0
    ? Math.round((prevTotalOppos / prevParsed.length) * 10) / 10 : 0;

  // ── Lens reco ──
  const lensRecoMap: Record<string, { count: number; must: number; recommended: number }> = {};
  for (const { result } of parsed) {
    for (const rec of result.lensRecommendations) {
      if (!lensRecoMap[rec.label]) lensRecoMap[rec.label] = { count: 0, must: 0, recommended: 0 };
      lensRecoMap[rec.label].count++;
      if (rec.priority === "must") lensRecoMap[rec.label].must++;
      else if (rec.priority === "recommended") lensRecoMap[rec.label].recommended++;
    }
  }
  const lensTopReco = Object.entries(lensRecoMap)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([label, v]) => ({ label, count: v.count, pct: pct(v.count, parsed.length) }));

  // ── NPS ──
  const npsScores = allSessions.filter((s) => s.npsScore !== null).map((s) => s.npsScore!);
  const npsComments = allSessions
    .filter((s) => s.npsComment && s.npsAt)
    .sort((a, b) => new Date(b.npsAt!).getTime() - new Date(a.npsAt!).getTime())
    .slice(0, 8)
    .map((s) => ({ score: s.npsScore!, comment: s.npsComment!, date: s.npsAt!.toISOString() }));
  const npsCounts = { promoteurs: 0, passifs: 0, detracteurs: 0 };
  for (const s of npsScores) {
    if (s >= 9) npsCounts.promoteurs++;
    else if (s >= 7) npsCounts.passifs++;
    else npsCounts.detracteurs++;
  }
  const npsScore = npsScores.length > 0
    ? Math.round(((npsCounts.promoteurs - npsCounts.detracteurs) / npsScores.length) * 100)
    : null;
  const npsResponseRate = total > 0 ? pct(npsScores.length, total) : 0;
  const prevNpsScores = prevSessions.filter((s) => s.npsScore !== null).map((s) => s.npsScore!);
  const prevNpsCounts = { prom: 0, det: 0 };
  for (const s of prevNpsScores) { if (s >= 9) prevNpsCounts.prom++; else if (s <= 6) prevNpsCounts.det++; }
  const prevNps = prevNpsScores.length > 0
    ? Math.round(((prevNpsCounts.prom - prevNpsCounts.det) / prevNpsScores.length) * 100) : null;

  // ── Sources ──
  const sourceDistrib: Record<string, number> = {};
  for (const s of allSessions) {
    const src = s.source ?? "tablette";
    sourceDistrib[src] = (sourceDistrib[src] ?? 0) + 1;
  }

  // ── Status ──
  const waiting = allSessions.filter((s) => s.status === "WAITING").length;
  const inProgress = allSessions.filter((s) => s.status === "IN_PROGRESS").length;
  const done = allSessions.filter((s) => s.status === "DONE").length;

  // ── Daily volume ──
  const dailyVolume: Record<string, { created: number; delivered: number }> = {};
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000);
  for (let d = 0; d < days; d++) {
    const date = new Date(startDate.getTime() + d * 86400000);
    if (date > now) break;
    dailyVolume[date.toISOString().slice(0, 10)] = { created: 0, delivered: 0 };
  }
  for (const s of allSessions) {
    const key = s.createdAt.toISOString().slice(0, 10);
    if (dailyVolume[key]) {
      dailyVolume[key].created++;
      if (s.delivered) dailyVolume[key].delivered++;
    }
  }

  // ── Démographie ──
  const correctionTypes: Record<string, number> = {};
  const genesActuelles: Record<string, number> = {};
  const mainActivity: Record<string, number> = {};
  const budgetDistrib: Record<string, number> = {};
  const stylePreference: Record<string, number> = {};
  const frequencePort: Record<string, number> = {};
  let progressifCount = 0, lentillesCount = 0, sportCount = 0, conduitNuitCount = 0;
  let screenTimeSum = 0, screenTimeCount = 0;
  let secondePaireCount = 0, mutuelleInconnueCount = 0, antecedentsCount = 0;
  let totalWithFormData = 0;

  for (const { formData } of parsed) {
    if (!formData) continue;
    totalWithFormData++;
    const fd = formData as Record<string, unknown>;
    if (Array.isArray(fd.correctionType)) { for (const v of fd.correctionType as string[]) correctionTypes[v] = (correctionTypes[v] ?? 0) + 1; }
    if (Array.isArray(fd.genesActuelles)) { for (const v of fd.genesActuelles as string[]) genesActuelles[v] = (genesActuelles[v] ?? 0) + 1; }
    if (fd.mainActivity) mainActivity[fd.mainActivity as string] = (mainActivity[fd.mainActivity as string] ?? 0) + 1;
    if (fd.budgetRange) budgetDistrib[fd.budgetRange as string] = (budgetDistrib[fd.budgetRange as string] ?? 0) + 1;
    if (fd.stylePreference) stylePreference[fd.stylePreference as string] = (stylePreference[fd.stylePreference as string] ?? 0) + 1;
    if (fd.frequencePort) frequencePort[fd.frequencePort as string] = (frequencePort[fd.frequencePort as string] ?? 0) + 1;
    if (fd.isProgressive) progressifCount++;
    if (fd.portLentilles) lentillesCount++;
    if (fd.sport) sportCount++;
    if (fd.conduitNuit) conduitNuitCount++;
    if (typeof fd.screenTimeHours === "number") { screenTimeSum += fd.screenTimeHours; screenTimeCount++; }
    if (fd.projetSecondairesPaires) secondePaireCount++;
    if (!fd.mutuelleConnue) mutuelleInconnueCount++;
    if (fd.antecedentsFamiliaux) antecedentsCount++;
  }
  const avgScreenTime = screenTimeCount > 0 ? Math.round((screenTimeSum / screenTimeCount) * 10) / 10 : 0;

  // ── Top users (si franchise) ──
  const userMap = new Map<string, { name: string | null; email: string | null; storeName: string | null; total: number; delivered: number }>();
  for (const s of allSessions) {
    const uid = s.userId;
    if (!userMap.has(uid)) {
      userMap.set(uid, { name: s.user?.name ?? null, email: s.user?.email ?? null, storeName: s.user?.storeName ?? null, total: 0, delivered: 0 });
    }
    const entry = userMap.get(uid)!;
    entry.total++;
    if (s.delivered) entry.delivered++;
  }
  const uniqueUsers = userMap.size;
  const topUsers = Array.from(userMap.entries())
    .map(([, v]) => ({ ...v, plan: "" }))
    .sort((a, b) => b.delivered - a.delivered)
    .slice(0, 10);

  return {
    total, delivered: delivered.length, completionRate,
    avgComplexite, complexiteDistrib,
    alertesCount, avgAlertesPerBilan,
    opportunitesTypes, totalOpportunites, avgOpportunitesPerBilan,
    lensTopReco, sourceDistrib,
    waiting, inProgress, done,
    npsScore, npsCounts, npsResponseRate, npsComments,
    dailyVolume, totalAllTime, uniqueUsers, topUsers,
    demographics: {
      correctionTypes, genesActuelles, mainActivity, budgetDistrib,
      stylePreference, frequencePort,
      progressifCount, lentillesCount, sportCount, conduitNuitCount,
      avgScreenTime, secondePaireCount, mutuelleInconnueCount, antecedentsCount,
      totalWithFormData,
    },
    vsLastMonth: {
      total: prevSessions.length,
      completionRate: prevCompletionRate,
      avgComplexite: prevAvgComplexite,
      avgOpportunitesPerBilan: prevAvgOppos,
      nps: prevNps,
    },
    isTeam: !!teamId,
  };
}
