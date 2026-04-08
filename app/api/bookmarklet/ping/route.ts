export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new Response(null, { status: 204, headers: getPortalCorsHeaders(req.headers.get("origin")) });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPortalCorsHeaders } from "@/lib/cors";
import { rateLimit } from "@/lib/rateLimit";
import { sendMail } from "@/lib/mailer";
import { createNotification } from "@/app/actions/notifications";

const STATUS_VALIDES = ["ok", "broken", "partial"] as const;

/**
 * POST /api/bookmarklet/ping
 * Appelé par le bookmarklet lui-même après injection pour signaler son état.
 * Aucune donnée patient — uniquement : version, portal, status, errorHint (optionnel).
 */
export async function POST(req: NextRequest) {
  try {
    /* 30 pings par heure par IP */
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = await rateLimit(`bookmarklet-ping:${ip}`, 30, 60 * 60_000);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Trop de requêtes" }, { status: 429 });
    }

    const body = await req.json();
    const { version, portal, status, errorHint } = body;

    if (!version || typeof version !== "string") {
      return NextResponse.json({ ok: false, error: "version manquante" }, { status: 400 });
    }
    if (!portal || typeof portal !== "string" || portal.length === 0) {
      return NextResponse.json({ ok: false, error: "portal manquant" }, { status: 400 });
    }
    if (!status || !STATUS_VALIDES.includes(status)) {
      return NextResponse.json({ ok: false, error: "status invalide" }, { status: 400 });
    }

    /* Rate limit secondaire par portail + IP : 10 pings/min */
    const portalAllowed = await rateLimit(`bookmarklet-ping-portal:${portal}:${ip}`, 10, 60_000);
    if (!portalAllowed) {
      return NextResponse.json({ ok: false, error: "Trop de requêtes pour ce portail" }, { status: 429 });
    }

    const userAgent = req.headers.get("user-agent") ?? null;
    const portalNorm = portal.toLowerCase().slice(0, 30);

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    await (prisma as any).bookmarkletPing.create({
      data: {
        version: version.slice(0, 20),
        portal: portalNorm,
        status,
        userAgent: userAgent ? userAgent.slice(0, 255) : null,
        /* errorHint : jamais de données patient — description technique uniquement */
        errorHint: errorHint ? String(errorHint).slice(0, 200) : null,
      },
    });

    /* Détection seuil : 3+ broken en 1h → alerte email (best-effort) */
    if (status === "broken") {
      try {
        const since1h = new Date(Date.now() - 60 * 60_000);

        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        const brokenCount = await (prisma as any).bookmarkletPing.count({
          where: { portal: portalNorm, status: "broken", createdAt: { gte: since1h } },
        });

        if (brokenCount >= 3) {
          /* Guard anti-doublon : 1 email max toutes les 2h par portail */
          const alertAllowed = await rateLimit(`alert-portal-${portalNorm}`, 1, 2 * 60 * 60_000);
          if (alertAllowed) {
            await sendMail({
              to: "contact@audibot.fr",
              subject: `[ALERTE] Portail ${portalNorm} — 3+ broken en 1h`,
              html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:18px;font-weight:800;color:#dc2626;">🚨 Alerte Bookmarklet</h1>
  <p style="font-size:14px;line-height:1.6;">
    Le portail <strong>${portalNorm}</strong> a enregistré <strong>${brokenCount} pings "broken"</strong> au cours de la dernière heure.
  </p>
  <p style="font-size:13px;color:#64748b;">
    Une investigation est recommandée — vérifier la compatibilité du sélecteur ou un changement de structure HTML du portail.
  </p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    AudiBot — contact@audibot.fr
  </p>
</body></html>`,
            });

            /* P1 — Notifier in-app les users ayant un parcours actif sur ce portail */
            try {
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              const parcoursList = await (prisma as any).parcoursRPA.findMany({
                where: { hostname: portalNorm, valide: true },
                select: { createdBy: true },
              });
              for (const p of parcoursList) {
                if (p.createdBy) {
                  await createNotification(
                    p.createdBy,
                    "rpa_broken",
                    "Portail potentiellement cassé",
                    `Le portail ${portalNorm} a généré des erreurs RPA. Vérifiez et re-enregistrez le parcours si nécessaire.`,
                    "/admin/parcours"
                  );
                }
              }
            } catch (notifErr) {
              console.error("[bookmarklet/ping] Notification in-app échouée:", notifErr);
            }
          }
        }
      } catch (alertErr) {
        /* Best-effort : ne pas faire planter la route */
        console.error("[bookmarklet/ping] Alerte email échouée:", alertErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[bookmarklet/ping]", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
