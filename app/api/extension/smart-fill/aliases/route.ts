export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimit("smart-fill-aliases:" + ip, 10, 60 * 60_000);
  if (!allowed)
    return NextResponse.json(
      { aliases: {} },
      { status: 429, headers: CORS_HEADERS },
    );

  const hostname = req.nextUrl.searchParams.get("hostname");

  // Corrections spécifiques au hostname + corrections globales (hostname-agnostic)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hostCorrections, globalCorrections] = await Promise.all([
    hostname
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (prisma as any).smartFillCorrection.groupBy({
          by: ["label", "oldVariable"],
          _count: { id: true },
          where: { hostname, oldVariable: { not: "unknown" } },
          orderBy: { _count: { id: "desc" } },
          take: 200,
        })
      : Promise.resolve([]),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).smartFillCorrection.groupBy({
      by: ["label", "oldVariable"],
      _count: { id: true },
      where: { oldVariable: { not: "unknown" } },
      orderBy: { _count: { id: "desc" } },
      take: 200,
    }),
  ]);

  const aliases: Record<string, string> = {};

  // Globales d'abord (seuil: 3+ occurrences cross-site)
  for (const c of globalCorrections) {
    if (c._count.id < 3) continue;
    if (!aliases[c.label]) aliases[c.label] = c.oldVariable;
  }

  // Host-spécifiques (seuil: 2+ occurrences, écrase le global)
  for (const c of hostCorrections) {
    if (c._count.id < 2) continue;
    aliases[c.label] = c.oldVariable;
  }

  return NextResponse.json({ aliases }, { headers: CORS_HEADERS });
}
