export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const PORTAILS_VALIDES = ["ALMERYS", "VIAMEDIS", "ITELIS", "KALIXIA"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { syncToken, portail, numeroDossier, motif, dateRejet, montant, rawData } = body;

    if (!syncToken || typeof syncToken !== "string") {
      return NextResponse.json({ ok: false, error: "syncToken requis" }, { status: 400 });
    }
    if (!portail || !PORTAILS_VALIDES.includes(portail)) {
      return NextResponse.json({ ok: false, error: "portail invalide" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "utilisateur introuvable" }, { status: 404 });
    }

    let dossierId: string | null = null;
    let matched = false;

    if (numeroDossier) {
      const dossier = await prisma.dossierTiersPayant.findFirst({
        where: {
          userId: user.id,
          OR: [
            { reference: { contains: numeroDossier } },
            { referenceInterne: { contains: numeroDossier } },
            { numeroAdherent: { contains: numeroDossier } },
          ],
        },
        select: { id: true },
      });
      if (dossier) {
        dossierId = dossier.id;
        matched = true;
      }
    }

    await prisma.rejetAutoDetecte.create({
      data: {
        syncToken,
        portail,
        numeroDossier: numeroDossier || null,
        motif: motif || null,
        dateRejet: dateRejet ? new Date(dateRejet) : null,
        montant: montant ? parseFloat(montant) : null,
        dossierId,
        matched,
        rawData: rawData ? JSON.stringify(rawData) : null,
      },
    });

    return NextResponse.json({
      ok: true,
      matched,
      message: matched
        ? "Rejet detecte et associe a un dossier existant."
        : "Rejet detecte — aucun dossier correspondant trouve.",
    });
  } catch (err) {
    console.error("[api/extension/rejet-detecte] Erreur:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
