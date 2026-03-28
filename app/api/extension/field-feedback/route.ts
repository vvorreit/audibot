/**
 * US-8 — Feedback Loop : signalement de champ mal rempli
 * POST /api/extension/field-feedback
 *
 * Body : { selector, fieldType, portal, url, ts }
 * Auth : Bearer token (optionnel — on log quand même sans userId)
 * RGPD : aucune donnée patient transmise, uniquement des métadonnées DOM
 */
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  /* Rate limit : 20 signalements / minute par IP */
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await rateLimit(`field-feedback:${ip}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limit" },
      { status: 429, headers: CORS },
    );
  }

  /* Résoudre l'userId si token présent */
  let userId: string | null = null;
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const user = await prisma.user.findFirst({
      where: { syncToken: token },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  /* Valider le body */
  let body: {
    selector?: string;
    fieldType?: string;
    portal?: string;
    url?: string;
    ts?: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400, headers: CORS },
    );
  }

  const { selector, fieldType, portal, url } = body;

  if (!selector || !portal) {
    return NextResponse.json(
      { ok: false, error: "selector et portal requis" },
      { status: 400, headers: CORS },
    );
  }

  /* Sanitize : on tronque pour éviter les payloads abusifs */
  const safeSelector = String(selector).slice(0, 256);
  const safeFieldType = String(fieldType ?? "unknown").slice(0, 64);
  const safePortal = String(portal).slice(0, 128);
  const safeUrl = url ? String(url).slice(0, 512) : null;

  await prisma.fieldFeedback.create({
    data: {
      userId,
      selector: safeSelector,
      fieldType: safeFieldType,
      portal: safePortal,
      url: safeUrl,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true }, { headers: CORS });
}
