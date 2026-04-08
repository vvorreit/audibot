export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireTPUser, tpUserFilter } from "@/lib/tpAccess";
import { Mutuelle } from "@prisma/client";
import { z } from "zod";
import { parseBody } from "@/lib/validation";
import { rateLimit } from "@/lib/rateLimit";

const checkDoublonSchema = z.object({
  mutuelle: z.string().min(1),
  numeroAdherent: z.string().min(1),
  montant: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireTPUser();

    const allowed = await rateLimit(`check-doublon:${user.id}`, 30, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
    }

    const data = await parseBody(req, checkDoublonSchema);
    if (data instanceof NextResponse) return data;

    // Validate that mutuelle is a valid Mutuelle enum value
    const validMutuelles = Object.values(Mutuelle);
    if (!validMutuelles.includes(data.mutuelle as Mutuelle)) {
      return NextResponse.json({ doublon: false });
    }

    const baseWhere = await tpUserFilter(user);
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const existing = await prisma.dossierTiersPayant.findFirst({
      where: {
        ...baseWhere,
        mutuelle: data.mutuelle as Mutuelle,
        numeroAdherent: data.numeroAdherent,
        dateEnvoi: { gte: since },
      },
      select: {
        reference: true,
        dateEnvoi: true,
        statut: true,
        montant: true,
      },
      orderBy: { dateEnvoi: "desc" },
    });

    if (!existing) {
      return NextResponse.json({ doublon: false });
    }

    return NextResponse.json({
      doublon: true,
      dossier: {
        reference: existing.reference,
        dateEnvoi: existing.dateEnvoi.toISOString().slice(0, 10),
        statut: existing.statut,
        montant: existing.montant,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
