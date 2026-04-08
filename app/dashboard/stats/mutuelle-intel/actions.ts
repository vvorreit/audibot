"use server";

import { prisma } from "@/lib/db";
import { requireTPUser, tpUserFilter } from "@/lib/tpAccess";
import { checkAdmin } from "@/lib/adminAudit";

const MIN_USERS = 5; // Seuil de confidentialité
const MUTUELLE_LABELS: Record<string, string> = {
  CPAM: "CPAM",
  ALMERYS: "Almerys",
  VIAMEDIS: "Viamedis",
  ITELIS: "Itelis",
  KALIXIA: "Kalixia",
  CARTE_BLANCHE: "Carte Blanche",
  SANTECLAIR: "Santéclair",
  SEVEANE: "Sévéane",
  SP_SANTE: "SP Santé",
  AUTRE: "Autre",
};

export interface BenchmarkRow {
  mutuelle: string;
  label: string;
  totalDossiers: number;
  totalUsers: number;
  delaiMoyen: number | null;
  tauxRejet: number;
  tauxReception: number;
  montantMoyen: number;
  topMotifsRejet: { motif: string; count: number }[];
  rankingScore: number;
}

export interface MutuelleBenchmarksResult {
  benchmarks: BenchmarkRow[];
  best: BenchmarkRow[];
  worst: BenchmarkRow[];
  problematic: BenchmarkRow[];
  period: string | null;
}

export async function getMutuelleBenchmarks(): Promise<MutuelleBenchmarksResult> {
  await checkAdmin();

  // Dernier period disponible
  const latest = await prisma.mutuelleBenchmark.findFirst({
    orderBy: { period: "desc" },
    select: { period: true },
  });

  if (!latest) {
    return { benchmarks: [], best: [], worst: [], problematic: [], period: null };
  }

  const rows = await prisma.mutuelleBenchmark.findMany({
    where: { period: latest.period },
    orderBy: { rankingScore: "asc" },
  });

  const benchmarks: BenchmarkRow[] = rows
    .filter(r => r.totalUsers >= MIN_USERS && r.mutuelle !== "AUTRE")
    .map(r => ({
      mutuelle: r.mutuelle,
      label: MUTUELLE_LABELS[r.mutuelle] ?? r.mutuelle,
      totalDossiers: r.totalDossiers,
      totalUsers: r.totalUsers,
      delaiMoyen: r.delaiMoyen,
      tauxRejet: r.tauxRejet,
      tauxReception: r.tauxReception,
      montantMoyen: r.montantMoyen,
      topMotifsRejet: r.topMotifsRejet ? JSON.parse(r.topMotifsRejet) : [],
      rankingScore: r.rankingScore,
    }));

  const best = benchmarks.slice(0, 3);
  const worst = [...benchmarks].sort((a, b) => b.rankingScore - a.rankingScore).slice(0, 3);
  const problematic = [...benchmarks]
    .sort((a, b) => b.topMotifsRejet.length - a.topMotifsRejet.length)
    .slice(0, 3);

  return { benchmarks, best, worst, problematic, period: latest.period };
}

export interface ComparisonRow {
  mutuelle: string;
  label: string;
  userDelai: number | null;
  globalDelai: number | null;
  userTauxRejet: number;
  globalTauxRejet: number;
  deltaDelai: number | null;
  deltaTauxRejet: number;
}

export async function getMutuelleComparison(): Promise<ComparisonRow[]> {
  await checkAdmin();
  const user = await requireTPUser();
  const filter = await tpUserFilter(user);

  const cutoff = new Date(Date.now() - 90 * 86_400_000);

  // Dossiers de l'utilisateur/équipe
  const dossiers = await prisma.dossierTiersPayant.findMany({
    where: { ...filter, createdAt: { gte: cutoff } },
    select: { mutuelle: true, statut: true, dateEnvoi: true, dateReception: true },
    take: 2000,
  });

  // Agréger par mutuelle côté JS
  const userMap = new Map<string, { total: number; rejete: number; delais: number[] }>();
  for (const d of dossiers) {
    const m = userMap.get(d.mutuelle) ?? { total: 0, rejete: 0, delais: [] };
    m.total++;
    if (d.statut === "REJETE") m.rejete++;
    if (d.statut === "RECU" && d.dateReception) {
      m.delais.push((d.dateReception.getTime() - d.dateEnvoi.getTime()) / 86_400_000);
    }
    userMap.set(d.mutuelle, m);
  }

  // Benchmarks globaux
  const latest = await prisma.mutuelleBenchmark.findFirst({ orderBy: { period: "desc" }, select: { period: true } });
  if (!latest) return [];

  const benchmarks = await prisma.mutuelleBenchmark.findMany({
    where: { period: latest.period, totalUsers: { gte: MIN_USERS } },
  });
  const benchMap = new Map(benchmarks.map(b => [b.mutuelle as string, b]));

  const comparisons: ComparisonRow[] = [];
  for (const [mutuelle, stats] of userMap) {
    if (mutuelle === "AUTRE") continue;
    const bench = benchMap.get(mutuelle);
    if (!bench) continue;

    const userDelai = stats.delais.length > 0
      ? Math.round(stats.delais.reduce((a, b) => a + b, 0) / stats.delais.length * 10) / 10
      : null;
    const userTauxRejet = stats.total > 0 ? stats.rejete / stats.total : 0;

    comparisons.push({
      mutuelle,
      label: MUTUELLE_LABELS[mutuelle] ?? mutuelle,
      userDelai,
      globalDelai: bench.delaiMoyen,
      userTauxRejet: Math.round(userTauxRejet * 10000) / 10000,
      globalTauxRejet: bench.tauxRejet,
      deltaDelai: userDelai != null && bench.delaiMoyen != null ? Math.round((userDelai - bench.delaiMoyen) * 10) / 10 : null,
      deltaTauxRejet: Math.round((userTauxRejet - bench.tauxRejet) * 10000) / 10000,
    });
  }

  return comparisons.sort((a, b) => Math.abs(b.deltaTauxRejet) - Math.abs(a.deltaTauxRejet));
}
