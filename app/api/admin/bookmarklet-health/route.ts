export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface PingRow {
  portal: string;
  status: string;
  version: string;
  errorHint: string | null;
  createdAt: Date;
}

type PortalStats = {
  ok: number;
  broken: number;
  partial: number;
  lastStatus: string;
  lastSeen: string;
  lastVersion: string;
  lastError: string | null;
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pings: PingRow[] = await (prisma as any).bookmarkletPing.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { portal: true, status: true, version: true, errorHint: true, createdAt: true },
  });

  const byPortal: Record<string, PortalStats> = {};
  for (const p of pings) {
    if (!byPortal[p.portal]) {
      byPortal[p.portal] = {
        ok: 0, broken: 0, partial: 0,
        lastStatus: p.status,
        lastSeen: p.createdAt.toISOString(),
        lastVersion: p.version,
        lastError: p.errorHint,
      };
    }
    const key = p.status as keyof Pick<PortalStats, "ok" | "broken" | "partial">;
    if (key === "ok" || key === "broken" || key === "partial") {
      byPortal[p.portal][key]++;
    }
  }

  const versionMap: Record<string, number> = {};
  for (const p of pings) {
    versionMap[p.version] = (versionMap[p.version] ?? 0) + 1;
  }

  const totalBroken = pings.filter((p) => p.status === "broken").length;
  const totalOk = pings.filter((p) => p.status === "ok").length;
  const healthRate = pings.length > 0 ? Math.round((totalOk / pings.length) * 100) : 100;

  return NextResponse.json({
    period: "7d",
    total: pings.length,
    totalOk,
    totalBroken,
    healthRate,
    byPortal,
    versionDistribution: versionMap,
    recentErrors: pings
      .filter((p) => p.status === "broken" && p.errorHint)
      .slice(0, 20)
      .map((p) => ({ portal: p.portal, version: p.version, errorHint: p.errorHint, createdAt: p.createdAt.toISOString() })),
  });
}
