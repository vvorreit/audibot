"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkTeamOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Non connecte.");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, teamId: true, teamRole: true },
  });
  if (!user?.teamId || user.teamRole !== "OWNER")
    throw new Error("Acces reserve au proprietaire de l'equipe.");
  return { userId: user.id, teamId: user.teamId };
}

export interface FranchiseMember {
  id: string;
  name: string | null;
  email: string | null;
  storeName: string | null;
  storeId: string | null;
  scanCount: number;
  injectionCount: number;
  dossiersTotal: number;
  dossiersRejetes: number;
  montantEnAttente: number;
}

export interface StoreStats {
  storeId: string;
  storeName: string;
  memberCount: number;
  scanCount: number;
  injectionCount: number;
  dossiersTotal: number;
  dossiersRejetes: number;
  tauxRejet: number;
  montantEnAttente: number;
}

export interface FranchiseKPIs {
  totalScans: number;
  totalInjections: number;
  roiHeures: number;
  tauxRejet: number;
  montantEnAttente: number;
  montantRecu: number;
  members: FranchiseMember[];
  storeStats: StoreStats[];
  scansByDay: { date: string; count: number; memberId: string; memberName: string }[];
  rejetsByMutuelle: { mutuelle: string; count: number }[];
}

export async function getFranchiseAnalytics(
  period: "7d" | "30d" | "90d" | "all"
): Promise<FranchiseKPIs> {
  const { teamId } = await checkTeamOwner();

  const teamUsers = await prisma.user.findMany({
    where: { teamId },
    select: { id: true, name: true, email: true, storeName: true, storeId: true, store: { select: { name: true } } },
  });

  const memberIds = teamUsers.map((u) => u.id);

  const periodStart = period === "all" ? new Date(0) : new Date();
  if (period === "7d") periodStart.setDate(periodStart.getDate() - 7);
  else if (period === "30d") periodStart.setDate(periodStart.getDate() - 30);
  else if (period === "90d") periodStart.setDate(periodStart.getDate() - 90);

  const dateFilter = period === "all" ? {} : { createdAt: { gte: periodStart } };

  const [scanLogs, injectionLogs, dossiers] = await Promise.all([
    prisma.ocrScanLog.findMany({
      where: { userId: { in: memberIds }, ...dateFilter },
      select: { userId: true, createdAt: true },
    }),
    prisma.injectionLog.findMany({
      where: { userId: { in: memberIds }, ...dateFilter },
      select: { userId: true },
    }),
    prisma.dossierTiersPayant.findMany({
      where: { userId: { in: memberIds }, ...dateFilter },
      select: {
        userId: true,
        statut: true,
        montant: true,
        montantRecu: true,
        mutuelle: true,
      },
    }),
  ]);

  const memberMap = new Map(teamUsers.map((u) => [u.id, u]));

  const members: FranchiseMember[] = teamUsers.map((u) => {
    const userScans = scanLogs.filter((s) => s.userId === u.id);
    const userInjections = injectionLogs.filter((i) => i.userId === u.id);
    const userDossiers = dossiers.filter((d) => d.userId === u.id);
    const rejetes = userDossiers.filter((d) => d.statut === "REJETE");
    const enAttente = userDossiers.filter((d) => d.statut === "EN_ATTENTE");

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      storeName: u.store?.name ?? u.storeName,
      storeId: u.storeId,
      scanCount: userScans.length,
      injectionCount: userInjections.length,
      dossiersTotal: userDossiers.length,
      dossiersRejetes: rejetes.length,
      montantEnAttente: enAttente.reduce((s, d) => s + d.montant, 0),
    };
  });

  const totalScans = scanLogs.length;
  const totalInjections = injectionLogs.length;
  const roiHeures = Math.round((totalScans * 3) / 60 * 10) / 10;

  const totalDossiers = dossiers.length;
  const totalRejetes = dossiers.filter((d) => d.statut === "REJETE").length;
  const tauxRejet = totalDossiers > 0
    ? Math.round((totalRejetes / totalDossiers) * 1000) / 10
    : 0;

  const montantEnAttente = dossiers
    .filter((d) => d.statut === "EN_ATTENTE")
    .reduce((s, d) => s + d.montant, 0);
  const montantRecu = dossiers
    .filter((d) => d.statut === "RECU")
    .reduce((s, d) => s + (d.montantRecu ?? d.montant), 0);

  /* Agregation par magasin */
  const storeStatsMap = new Map<string, StoreStats>();
  for (const m of members) {
    const sid = m.storeId ?? "__unassigned__";
    const existing = storeStatsMap.get(sid);
    if (existing) {
      existing.memberCount++;
      existing.scanCount += m.scanCount;
      existing.injectionCount += m.injectionCount;
      existing.dossiersTotal += m.dossiersTotal;
      existing.dossiersRejetes += m.dossiersRejetes;
      existing.montantEnAttente += m.montantEnAttente;
    } else {
      storeStatsMap.set(sid, {
        storeId: sid,
        storeName: m.storeName ?? "Non assigne",
        memberCount: 1,
        scanCount: m.scanCount,
        injectionCount: m.injectionCount,
        dossiersTotal: m.dossiersTotal,
        dossiersRejetes: m.dossiersRejetes,
        tauxRejet: 0,
        montantEnAttente: m.montantEnAttente,
      });
    }
  }
  const storeStats = Array.from(storeStatsMap.values()).map((s) => ({
    ...s,
    tauxRejet: s.dossiersTotal > 0 ? Math.round((s.dossiersRejetes / s.dossiersTotal) * 1000) / 10 : 0,
  })).sort((a, b) => b.scanCount - a.scanCount);

  const memberName = (u: typeof teamUsers[number]) => u.store?.name ?? u.storeName ?? u.name ?? "Inconnu";

  const scansByDayMap = new Map<string, { count: number; memberId: string; memberName: string }>();
  for (const scan of scanLogs) {
    const date = scan.createdAt.toISOString().slice(0, 10);
    const member = memberMap.get(scan.userId);
    const key = `${date}__${scan.userId}`;
    const existing = scansByDayMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      scansByDayMap.set(key, {
        count: 1,
        memberId: scan.userId,
        memberName: member ? memberName(member) : "Inconnu",
      });
    }
  }
  const scansByDay = Array.from(scansByDayMap.entries()).map(
    ([key, val]) => ({
      date: key.split("__")[0],
      ...val,
    })
  );

  const rejetsByMutuelleMap = new Map<string, number>();
  for (const d of dossiers) {
    if (d.statut === "REJETE") {
      rejetsByMutuelleMap.set(
        d.mutuelle,
        (rejetsByMutuelleMap.get(d.mutuelle) ?? 0) + 1
      );
    }
  }
  const rejetsByMutuelle = Array.from(rejetsByMutuelleMap.entries())
    .map(([mutuelle, count]) => ({ mutuelle, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalScans,
    totalInjections,
    roiHeures,
    tauxRejet,
    montantEnAttente,
    montantRecu,
    members,
    storeStats,
    scansByDay,
    rejetsByMutuelle,
  };
}

/* -- Bilan Auditif Franchise -- */

export interface BilanMemberStats {
  userId: string;
  name: string | null;
  storeName: string | null;
  storeId: string | null;
  email: string | null;
  total: number;
  delivered: number;
  completionRate: number;
  avgComplexite: number;
  totalOpportunites: number;
  avgOpportunitesPerBilan: number;
  npsScore: number | null;
  topGenes: string[];
  topOpportunites: { type: string; count: number }[];
  alertesUrgentes: number;
}

export interface FranchiseBilanKPIs {
  totalBilans: number;
  totalDelivered: number;
  completionRateGlobal: number;
  avgComplexiteGlobal: number;
  totalOpportunites: number;
  npsGlobal: number | null;
  members: BilanMemberStats[];
}

export async function getFranchiseBilanAnalytics(
  period: "7d" | "30d" | "90d" | "all"
): Promise<FranchiseBilanKPIs> {
  const { teamId } = await checkTeamOwner();

  const teamUsers = await prisma.user.findMany({
    where: { teamId },
    select: { id: true, name: true, email: true, storeName: true, storeId: true, store: { select: { name: true } } },
  });

  const memberIds = teamUsers.map((u) => u.id);

  const periodStart = new Date();
  if (period === "7d") periodStart.setDate(periodStart.getDate() - 7);
  else if (period === "30d") periodStart.setDate(periodStart.getDate() - 30);
  else if (period === "90d") periodStart.setDate(periodStart.getDate() - 90);

  const dateFilter = period === "all" ? {} : { createdAt: { gte: periodStart } };

  const bilans = await prisma.bilanSession.findMany({
    where: { userId: { in: memberIds }, ...dateFilter },
    select: {
      userId: true,
      delivered: true,
      payload: true,
      npsScore: true,
    },
  });

  const memberStats: BilanMemberStats[] = teamUsers.map((u) => {
    const userBilans = bilans.filter((b) => b.userId === u.id);
    const delivered = userBilans.filter((b) => b.delivered && b.payload);

    let totalComplexite = 0;
    let totalOppos = 0;
    let alertesUrgentes = 0;
    const genesCount: Record<string, number> = {};
    const oppoCount: Record<string, number> = {};
    const npsScores: number[] = [];

    for (const b of delivered) {
      if (!b.payload) continue;
      try {
        const raw = JSON.parse(b.payload);
        const result = raw.result ?? raw;

        if (result.complexiteScore) totalComplexite += result.complexiteScore;

        const oppos = result.opportunites ?? [];
        totalOppos += oppos.length;
        for (const o of oppos) {
          oppoCount[o.type] = (oppoCount[o.type] ?? 0) + 1;
        }

        const alertes = result.alertes ?? [];
        alertesUrgentes += alertes.filter((a: { niveau: string }) => a.niveau === "urgent").length;

        const formData = raw.formData;
        if (formData?.genesActuelles) {
          for (const g of formData.genesActuelles) {
            genesCount[g] = (genesCount[g] ?? 0) + 1;
          }
        }
      } catch { /* skip */ }

      if (b.npsScore !== null && b.npsScore !== undefined) {
        npsScores.push(b.npsScore);
      }
    }

    const deliveredCount = delivered.length;
    const avgComplexite = deliveredCount > 0
      ? Math.round((totalComplexite / deliveredCount) * 10) / 10
      : 0;

    const topGenes = Object.entries(genesCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([k]) => k);

    const topOpportunites = Object.entries(oppoCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    const npsScore = npsScores.length > 0
      ? Math.round(
          ((npsScores.filter((s) => s >= 9).length - npsScores.filter((s) => s <= 6).length) / npsScores.length) * 100
        )
      : null;

    return {
      userId: u.id,
      name: u.name,
      storeName: u.store?.name ?? u.storeName,
      storeId: u.storeId,
      email: u.email,
      total: userBilans.length,
      delivered: deliveredCount,
      completionRate: userBilans.length > 0 ? Math.round((deliveredCount / userBilans.length) * 100) : 0,
      avgComplexite,
      totalOpportunites: totalOppos,
      avgOpportunitesPerBilan: deliveredCount > 0 ? Math.round((totalOppos / deliveredCount) * 10) / 10 : 0,
      npsScore,
      topGenes,
      topOpportunites,
      alertesUrgentes,
    };
  });

  const totalBilans = bilans.length;
  const totalDelivered = bilans.filter((b) => b.delivered).length;
  const allNps = memberStats.map((m) => m.npsScore).filter((n): n is number => n !== null);

  return {
    totalBilans,
    totalDelivered,
    completionRateGlobal: totalBilans > 0 ? Math.round((totalDelivered / totalBilans) * 100) : 0,
    avgComplexiteGlobal: memberStats.length > 0
      ? Math.round((memberStats.reduce((s, m) => s + m.avgComplexite, 0) / memberStats.length) * 10) / 10
      : 0,
    totalOpportunites: memberStats.reduce((s, m) => s + m.totalOpportunites, 0),
    npsGlobal: allNps.length > 0 ? Math.round(allNps.reduce((a, b) => a + b, 0) / allNps.length) : null,
    members: memberStats.sort((a, b) => b.total - a.total),
  };
}
