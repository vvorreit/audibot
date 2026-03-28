export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/**
 * RGPD — Sanitise le champ erreur avant stockage.
 * Supprime toute donnée patient potentielle :
 *  - NSS (13-15 chiffres consécutifs)
 *  - Suites de chiffres de 8+ caractères (dates, codes)
 *  - Patterns nom/prénom (majuscules 2+ mots consécutifs)
 */
function sanitizeErreur(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw;
  // NSS : 13 à 15 chiffres consécutifs (avec ou sans espaces de formatage)
  s = s.replace(/\b\d[\d\s]{11,14}\d\b/g, "[NSS_REDACTED]");
  // Suites brutes de 8+ chiffres (dates compactes, codes)
  s = s.replace(/\d{8,}/g, "[NUM_REDACTED]");
  // Noms en majuscules : séquence de 2+ mots tout-caps de 2+ lettres
  s = s.replace(/\b([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ]{2,}\s+){1,3}[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ]{2,}\b/g, "[NOM_REDACTED]");
  // Tronquer à 500 chars pour éviter les dumps accidentels
  return s.slice(0, 500);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { syncToken, mutuelle, etape, statut, erreur, url } = body;

    let userId: string | undefined;
    if (syncToken) {
      const user = await prisma.user.findUnique({
        where: { syncToken },
        select: { id: true },
      });
      userId = user?.id;
    }

    await prisma.rpaLog.create({
      data: {
        userId,
        syncToken: syncToken || null,
        mutuelle: mutuelle || "inconnu",
        etape: etape || "inconnu",
        statut: statut || "echec",
        erreur: sanitizeErreur(erreur),
        url: url || null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS });
  }
}
