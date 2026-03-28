export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/admin/parcours/[id]/dry-run?step=step_1
// Sans step → liste des étapes avec hasSnapshot
// Avec step → retourne le HTML brut du snapshot
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const stepId = req.nextUrl.searchParams.get("step");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcours = await (prisma as any).parcoursRPA.findUnique({
    where: { id },
    select: { htmlSnapshots: true, etapes: true, nom: true },
  });

  if (!parcours) {
    return NextResponse.json({ error: "Parcours introuvable" }, { status: 404 });
  }

  const snapshots = parcours.htmlSnapshots as Record<string, string> | null;

  if (!stepId) {
    return NextResponse.json({
      nom: parcours.nom,
      etapes: (parcours.etapes as Array<{ id: string; label: string; action: string; url?: string }>).map((e) => ({
        id: e.id,
        label: e.label,
        action: e.action,
        url: e.url,
        hasSnapshot: !!(snapshots && snapshots[e.id]),
      })),
    });
  }

  if (!snapshots || !snapshots[stepId]) {
    return NextResponse.json(
      { error: "Snapshot introuvable pour cette étape" },
      { status: 404 }
    );
  }

  return new NextResponse(snapshots[stepId], {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
