/**
 * US-9 — Remote Config Mappings : mise à jour silencieuse
 * GET /api/extension/mappings?version=X
 *
 * Retourne les mappings portails/ERPs versionés.
 * Si version locale == version serveur → 304 Not Modified (économie bande passante).
 * Chrome Web Store autorise les données JSON distantes (pas le code JS).
 *
 * Format réponse :
 * {
 *   version: number,
 *   sources: [
 *     { source: "cosium", urlPattern: "*.cosium.com/*", fields: { patient_nom: "#lastname", ... } },
 *     ...
 *   ]
 * }
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  /* Version locale envoyée par l'extension */
  const clientVersion = parseInt(
    req.nextUrl.searchParams.get("version") ?? "0",
    10,
  );

  /* Charger tous les mappings actifs */
  const mappings = await prisma.portalMapping.findMany({
    where: { enabled: true },
    select: {
      source: true,
      urlPattern: true,
      fields: true,
      version: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  /* Version serveur = version max parmi tous les mappings */
  const serverVersion =
    mappings.length > 0 ? Math.max(...mappings.map((m) => m.version)) : 1;

  /* 304 si déjà à jour */
  if (clientVersion >= serverVersion && clientVersion > 0) {
    return new NextResponse(null, {
      status: 304,
      headers: CORS,
    });
  }

  const sources = mappings.map((m) => ({
    source: m.source,
    urlPattern: m.urlPattern,
    fields: m.fields as Record<string, string>,
  }));

  return NextResponse.json(
    { version: serverVersion, sources },
    {
      headers: {
        ...CORS,
        /* Cache 30 min côté CDN — l'extension vérifie de son côté toutes les 24h */
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    },
  );
}
