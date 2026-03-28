export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import type { EtapeRPA } from "@/types/parcours";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const token =
    req.nextUrl.searchParams.get("token") ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return NextResponse.json(
      { error: "Paramètres manquants" },
      { status: 400, headers: CORS },
    );
  }

  /* Rate limit : 30 requêtes/min par token */
  const allowed = await rateLimit(`parcours:${token}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429, headers: CORS },
    );
  }

  /* Vérifier le token + plan rpaEnabled */
  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, plan: true, isPro: true, role: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Token invalide" },
      { status: 401, headers: CORS },
    );
  }

  const rpaEnabled =
    user.isPro ||
    user.plan === "PRO" ||
    user.plan === "EQUIPE" ||
    user.role === "ADMIN";

  if (!rpaEnabled) {
    return NextResponse.json(
      { parcours: [], handlers: [], rpaEnabled: false },
      { headers: CORS },
    );
  }

  const hostname = req.nextUrl.searchParams.get("hostname");
  const wantHandlers = req.nextUrl.searchParams.get("handlers") === "true";

  /* ── Mode bulk handlers : tous les parcours valides → JS généré ── */
  if (wantHandlers || !hostname) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allParcours = await (prisma as any).parcoursRPA.findMany({
      where: { valide: true },
      select: { hostname: true, nom: true, etapes: true },
      orderBy: { updatedAt: "desc" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlers = allParcours.map((p: any) => ({
      hostname: p.hostname,
      nom: p.nom,
      etapes: p.etapes as EtapeRPA[],
    }));

    return NextResponse.json({ handlers, rpaEnabled: true }, { headers: CORS });
  }

  /* ── Mode per-hostname : retourner les étapes brutes ── */
  const normalizedHostname = hostname.replace(/^www\./, "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcours = await (prisma as any).parcoursRPA.findMany({
    where: { hostname: normalizedHostname, valide: true },
    select: { id: true, hostname: true, nom: true, etapes: true, version: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ parcours, rpaEnabled: true }, { headers: CORS });
}
