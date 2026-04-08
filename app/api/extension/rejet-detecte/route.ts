export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getExtCors, optionsCors } from "@/lib/extensionAuth";

export async function OPTIONS() { return optionsCors(); }

const PORTAILS_VALIDES = [
  "ALMERYS", "VIAMEDIS", "ITELIS", "KALIXIA", "AMELI",
  "OXANTIS", "GENERATION", "SP_SANTE", "SANTECLAIR", "LBO",
  "SOLIMUT", "MERCER", "WEMIND", "CARTE_BLANCHE", "OPTISTYA",
  "GROUPAMA", "KORELIO", "SEVEANE", "HARMONIE", "ISANTE",
  "AESIO", "INTERAMC", "INCONNU",
];

export async function POST(req: Request) {
  const cors = getExtCors(req.headers.get('origin'));
  try {
    const body = await req.json();
    const { syncToken, portail, numeroDossier, motif, dateRejet, montant, noemieCode, noemieLabel, noemieCorrection, genericDetection, rejetType } = body as {
      syncToken: string; portail: string; numeroDossier?: string; motif?: string;
      dateRejet?: string; montant?: string; noemieCode?: string; noemieLabel?: string;
      noemieCorrection?: string; genericDetection?: boolean; rejetType?: string;
    };

    if (!syncToken || typeof syncToken !== "string") {
      return NextResponse.json({ ok: false, error: "syncToken requis" }, { status: 400, headers: cors });
    }

    const allowed = await rateLimit(`rejet-detecte:${syncToken}`, 50, 60_000);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Trop de requêtes." }, { status: 429, headers: cors });
    }

    if (!portail || !PORTAILS_VALIDES.includes(portail)) {
      return NextResponse.json({ ok: false, error: "portail invalide" }, { status: 400, headers: cors });
    }

    if (numeroDossier && numeroDossier.length > 100) {
      return NextResponse.json({ ok: false, error: "numeroDossier trop long" }, { status: 400, headers: cors });
    }
    if (motif && motif.length > 100) {
      return NextResponse.json({ ok: false, error: "motif trop long" }, { status: 400, headers: cors });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "utilisateur introuvable" }, { status: 404, headers: cors });
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

    /* Enrichir le motif avec le code NOEMIE si disponible */
    let enrichedMotif = motif || null;
    if (noemieCode && noemieLabel) {
      enrichedMotif = `[NOEMIE ${noemieCode}] ${noemieLabel}${motif ? " — " + motif : ""}`;
    }

    /* Valider le montant (format FR : "12,50 €" → 12.50) */
    let parsedMontant: number | null = null;
    if (montant) {
      const cleaned = montant.replace(/[€\sEUR]/gi, "").replace(",", ".");
      const num = parseFloat(cleaned);
      if (!isNaN(num)) parsedMontant = num;
    }

    /* Valider la date */
    let parsedDate: Date | null = null;
    if (dateRejet) {
      // Support dd/mm/yyyy et yyyy-mm-dd
      const ddmmyyyy = dateRejet.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      if (ddmmyyyy) {
        parsedDate = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`);
      } else {
        const d = new Date(dateRejet);
        if (!isNaN(d.getTime())) parsedDate = d;
      }
    }

    await prisma.rejetAutoDetecte.create({
      data: {
        userId: user.id,
        portail,
        numeroDossier: numeroDossier || null,
        motif: enrichedMotif ? enrichedMotif.slice(0, 500) : null,
        dateRejet: parsedDate,
        montant: parsedMontant,
        dossierId,
        matched,
      },
    });

    return NextResponse.json({
      ok: true,
      matched,
      message: matched
        ? "Rejet detecte et associe a un dossier existant."
        : "Rejet detecte — aucun dossier correspondant trouve.",
    }, { headers: cors });
  } catch (err) {
    console.error("[api/extension/rejet-detecte] Erreur:", err);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500, headers: cors });
  }
}
