export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeCompare } from "@/lib/safeCompare";
import { Prisma } from "@prisma/client";

/**
 * GET /api/cron/mutuelle-benchmark
 * Nightly cron: aggregates DossierTiersPayant from last 90 days
 * and upserts per-mutuelle benchmarks.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || !secret || !safeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const DAYS = 90;
  const cutoff = new Date(Date.now() - DAYS * 86_400_000);
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    // Agrégation globale en une seule requête SQL
    const stats = await prisma.$queryRaw<Array<{
      mutuelle: string;
      total_dossiers: bigint;
      total_users: bigint;
      nb_recu: bigint;
      nb_rejete: bigint;
      delai_moyen: number | null;
      montant_moyen: number | null;
    }>>(Prisma.sql`
      SELECT
        d.mutuelle::text AS mutuelle,
        COUNT(*)::bigint AS total_dossiers,
        COUNT(DISTINCT d."userId")::bigint AS total_users,
        COUNT(*) FILTER (WHERE d.statut = 'RECU' AND d."dateReception" IS NOT NULL)::bigint AS nb_recu,
        COUNT(*) FILTER (WHERE d.statut = 'REJETE')::bigint AS nb_rejete,
        AVG(EXTRACT(EPOCH FROM (d."dateReception" - d."dateEnvoi")) / 86400)
          FILTER (WHERE d.statut = 'RECU' AND d."dateReception" IS NOT NULL) AS delai_moyen,
        AVG(d.montant) AS montant_moyen
      FROM "DossierTiersPayant" d
      WHERE d."createdAt" >= ${cutoff}
      GROUP BY d.mutuelle
    `);

    // Batch : récupérer tous les motifs de rejet en une seule requête au lieu de N
    const allMotifs = await prisma.dossierTiersPayant.groupBy({
      by: ["mutuelle", "motifRejet"],
      where: {
        statut: "REJETE",
        createdAt: { gte: cutoff },
        motifRejet: { not: null },
      },
      _count: true,
    });
    const motifsByMutuelle = new Map<string, Array<{ motifRejet: string; _count: number }>>();
    for (const m of allMotifs) {
      const key = m.mutuelle as string;
      if (!motifsByMutuelle.has(key)) motifsByMutuelle.set(key, []);
      motifsByMutuelle.get(key)!.push({ motifRejet: m.motifRejet as string, _count: m._count });
    }

    let updated = 0;

    for (const row of stats) {
      const total = Number(row.total_dossiers);
      const nbRejete = Number(row.nb_rejete);
      const nbRecu = Number(row.nb_recu);
      const tauxRejet = total > 0 ? nbRejete / total : 0;
      const tauxReception = total > 0 ? nbRecu / total : 0;
      const delai = row.delai_moyen != null ? Math.round(row.delai_moyen * 10) / 10 : null;
      const montantMoyen = row.montant_moyen != null ? Math.round(row.montant_moyen * 100) / 100 : 0;

      const motifs = (motifsByMutuelle.get(row.mutuelle) ?? [])
        .sort((a, b) => b._count - a._count)
        .slice(0, 10);

      const topMotifsRejet = motifs
        .filter(m => m.motifRejet)
        .map(m => ({ motif: m.motifRejet!, count: m._count }));

      const rankingScore = ((delai ?? 90) * 0.4) + (tauxRejet * 100 * 0.6);

      await prisma.mutuelleBenchmark.upsert({
        where: { mutuelle_period: { mutuelle: row.mutuelle as never, period } },
        create: {
          mutuelle: row.mutuelle as never,
          period,
          totalDossiers: total,
          totalUsers: Number(row.total_users),
          delaiMoyen: delai,
          tauxRejet: Math.round(tauxRejet * 10000) / 10000,
          tauxReception: Math.round(tauxReception * 10000) / 10000,
          montantMoyen,
          topMotifsRejet: JSON.stringify(topMotifsRejet),
          rankingScore: Math.round(rankingScore * 100) / 100,
        },
        update: {
          totalDossiers: total,
          totalUsers: Number(row.total_users),
          delaiMoyen: delai,
          tauxRejet: Math.round(tauxRejet * 10000) / 10000,
          tauxReception: Math.round(tauxReception * 10000) / 10000,
          montantMoyen,
          topMotifsRejet: JSON.stringify(topMotifsRejet),
          rankingScore: Math.round(rankingScore * 100) / 100,
          computedAt: new Date(),
        },
      });
      updated++;
    }

    return NextResponse.json({ ok: true, period, updated });
  } catch (err) {
    console.error("[cron/mutuelle-benchmark]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
