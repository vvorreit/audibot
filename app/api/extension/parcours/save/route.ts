export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getPortalCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getPortalCorsHeaders(req.headers.get("origin")) });
}

export async function POST(req: NextRequest) {
  const CORS = getPortalCorsHeaders(req.headers.get("origin"));

  try {
    const body = await req.json() as { token?: string; hostname?: string; nom?: string; etapes?: unknown[] };
    const { token, hostname, nom, etapes } = body;

    if (!token || !hostname || !etapes || !Array.isArray(etapes)) {
      return NextResponse.json({ ok: false, error: "Payload invalide" }, { status: 400, headers: CORS });
    }

    /* Vérifier le token + plan PRO/EQUIPE/ADMIN */
    const user = await prisma.user.findUnique({
      where: { syncToken: token },
      select: { id: true, plan: true, isPro: true, role: true },
    });

    if (!user) return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 401, headers: CORS });

    const rpaEnabled = user.role === "ADMIN" || user.isPro || ["PRO", "EQUIPE"].includes(user.plan);
    if (!rpaEnabled) return NextResponse.json({ ok: false, error: "Plan Pro requis" }, { status: 403, headers: CORS });

    /* Rate limit */
    const allowed = await rateLimit(`parcours-save:${user.id}`, 10, 60 * 60_000);
    if (!allowed) return NextResponse.json({ ok: false, error: "Trop de requêtes" }, { status: 429, headers: CORS });

    /* Valider les étapes : JAMAIS de valeurs patient réelles */
    const PATIENT_FIELDS = /\b(nss|num.ss|secu|insee|password|mdp)\b/i;
    for (const etape of etapes as Array<{ variable?: string }>) {
      if (etape.variable && !etape.variable.startsWith("{{") && PATIENT_FIELDS.test(etape.variable)) {
        return NextResponse.json({ ok: false, error: "Donnée patient détectée dans les étapes" }, { status: 400, headers: CORS });
      }
    }

    /* RGPD : htmlSnapshots acceptés uniquement des ADMINs.
       Un opticien lambda pourrait enregistrer une page avec des données patient dans le DOM.
       Pour les non-admins, les snapshots sont ignorés silencieusement. */
    const isAdmin = user.role === "ADMIN";
    const htmlSnapshots: Record<string, string> = {};
    const etapesSansHtml = (etapes as Array<{ htmlSnapshot?: string; id?: string; [k: string]: unknown }>).map((etape) => {
      if (isAdmin && etape.htmlSnapshot && etape.id) {
        htmlSnapshots[etape.id] = etape.htmlSnapshot;
      }
      const { htmlSnapshot, ...rest } = etape;
      return rest;
    });

    /* Créer le parcours en brouillon (valide = false → admin doit valider) */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parcours = await (prisma as any).parcoursRPA.create({
      data: {
        hostname: hostname.slice(0, 100),
        nom: (nom || "Parcours enregistré").slice(0, 200),
        etapes: etapesSansHtml,
        htmlSnapshots: Object.keys(htmlSnapshots).length > 0 ? htmlSnapshots : undefined,
        valide: false,
        createdBy: user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, parcoursId: parcours.id }, { headers: CORS });
  } catch (e) {
    console.error("[parcours/save]", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500, headers: CORS });
  }
}
