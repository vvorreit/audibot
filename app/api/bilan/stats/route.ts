export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasFeature } from "@/lib/userFeatures";
import type { BilanResult } from "@/types/bilan";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const hasBilan = await hasFeature("bilanAuditif");
  if (!isAdmin && !hasBilan) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const monthParam = req.nextUrl.searchParams.get("month");
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split("-").map(Number);
    year = y;
    month = m - 1;
  }

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 1);

  const userId = session.user.id;
  const teamId = session.user.teamId;
  const ownerFilter = teamId ? { teamId } : { userId };

  // All sessions created this month for this user/team
  const allSessions = await prisma.bilanSession.findMany({
    where: {
      ...ownerFilter,
      createdAt: { gte: startOfMonth, lt: endOfMonth },
    },
    select: {
      delivered: true,
      payload: true,
      npsScore: true,
      npsComment: true,
    },
  });

  const deliveredSessions = allSessions.filter((s) => s.delivered && s.payload);
  const total = allSessions.length;
  const completionRate = total > 0 ? deliveredSessions.length / total : 0;

  // Parse all payloads (handle both raw BilanResult and { formData, result } formats)
  const results: BilanResult[] = [];
  for (const s of deliveredSessions) {
    try {
      const parsed = JSON.parse(s.payload!);
      const candidate = parsed?.result ?? parsed;
      // Validate it looks like a BilanResult before pushing
      if (candidate && typeof candidate.complexiteScore === "number" && Array.isArray(candidate.alertes)) {
        results.push(candidate as BilanResult);
      }
    } catch { /* skip */ }
  }

  // Aggregate
  const correctionTypes: Record<string, number> = {};
  const sphereDistrib: Record<string, number> = {};
  const frequencePort: Record<string, number> = {};
  const alertesCount = { urgent: 0, attention: 0, info: 0 };
  const opportunitesTypes: Record<string, number> = {};
  const lensRecoMap: Record<string, number> = {};
  const budgetDistrib: Record<string, number> = {};
  let complexiteSum = 0;

  for (const r of results) {
    complexiteSum += r.complexiteScore;

    for (const a of r.alertes) {
      if (a.niveau in alertesCount) {
        alertesCount[a.niveau as keyof typeof alertesCount]++;
      }
    }
    for (const opp of r.opportunites) {
      opportunitesTypes[opp.type] = (opportunitesTypes[opp.type] ?? 0) + 1;
    }
    for (const rec of r.lensRecommendations) {
      lensRecoMap[rec.label] = (lensRecoMap[rec.label] ?? 0) + 1;
    }
  }

  // Parse form data from payload for demographic stats
  // The payload is actually BilanResult (computed), not raw form data
  // We extract what we can from result fields
  // For correctionTypes, sphereDistrib, frequencePort, budgetDistrib:
  // These are in the raw form data which is NOT stored separately.
  // We infer from profileText and recommendations instead.
  // For now, leave these as empty - the main value is in lensRecommendations, alertes, opportunites

  const lensTopReco = Object.entries(lensRecoMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }));

  // NPS
  const npsScores = allSessions
    .filter((s) => s.npsScore !== null)
    .map((s) => s.npsScore!);
  const npsComments = allSessions
    .filter((s) => s.npsComment)
    .map((s) => s.npsComment!);

  let npsScore: number | null = null;
  const npsCounts = { promoteurs: 0, passifs: 0, detracteurs: 0 };
  if (npsScores.length > 0) {
    for (const score of npsScores) {
      if (score >= 9) npsCounts.promoteurs++;
      else if (score >= 7) npsCounts.passifs++;
      else npsCounts.detracteurs++;
    }
    npsScore = Math.round(
      ((npsCounts.promoteurs - npsCounts.detracteurs) / npsScores.length) * 100
    );
  }

  // Previous month comparison
  const prevStart = new Date(year, month - 1, 1);
  const prevEnd = new Date(year, month, 1);
  const prevCount = await prisma.bilanSession.count({
    where: {
      ...ownerFilter,
      delivered: true,
      createdAt: { gte: prevStart, lt: prevEnd },
    },
  });

  return NextResponse.json({
    total,
    completionRate: Math.round(completionRate * 100) / 100,
    avgComplexite: results.length > 0 ? Math.round((complexiteSum / results.length) * 10) / 10 : 0,
    correctionTypes,
    sphereDistrib,
    frequencePort,
    alertesCount,
    opportunitesTypes,
    lensTopReco,
    budgetDistrib,
    npsScore,
    npsCounts,
    npsComments: npsComments.slice(0, 10),
    vsLastMonth: {
      total: prevCount,
      delta: deliveredSessions.length - prevCount,
    },
  });
}
