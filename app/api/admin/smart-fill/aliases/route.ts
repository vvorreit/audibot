export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET — retourne les aliases appris depuis les corrections utilisateurs
// Format : { aliases: { hostname: { label: "variable" } } }
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Agréger les corrections : hostname + label → variable la plus fréquente (>= 3 occurrences)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const corrections = await (prisma as any).smartFillCorrection.groupBy({
    by: ["hostname", "label", "oldVariable"],
    _count: { id: true },
    where: { oldVariable: { not: "unknown" } },
    orderBy: { _count: { id: "desc" } },
  });

  // Grouper par hostname → label → variable la plus fréquente
  const aliases: Record<string, Record<string, string>> = {};
  for (const c of corrections) {
    if (c._count.id < 3) continue;
    if (!aliases[c.hostname]) aliases[c.hostname] = {};
    if (!aliases[c.hostname][c.label]) {
      aliases[c.hostname][c.label] = c.oldVariable;
    }
  }

  return NextResponse.json({ aliases, total: Object.keys(aliases).length });
}
