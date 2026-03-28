export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auditLog } from "@/lib/adminAudit";

const ALLOWED_VARIABLES = [
  /* Patient */
  "{{nom}}", "{{prenom}}", "{{nss}}", "{{dateNaissance}}",
  /* Contact */
  "{{telephone}}", "{{email}}", "{{adresse}}", "{{codePostal}}", "{{ville}}",
  /* Mutuelle */
  "{{organisme}}", "{{numeroAdherent}}", "{{numeroAMC}}", "{{numeroTeletransmission}}",
  "{{critereSecondaire}}", "{{codeConvention}}",
  "{{dateDebutValidite}}", "{{dateFinValidite}}",
  /* Prescription */
  "{{dateOrdonnance}}", "{{nomOphtalmologue}}", "{{rpps}}",
  "{{distancePupillaire}}", "{{typePrescription}}",
  /* Lunettes OD/OG */
  "{{sphere_od}}", "{{cylindre_od}}", "{{axe_od}}", "{{addition_od}}",
  "{{sphere_og}}", "{{cylindre_og}}", "{{axe_og}}", "{{addition_og}}",
  "{{addition}}",
  /* Lentilles OD */
  "{{sphere_lentille_od}}", "{{cylindre_lentille_od}}", "{{axe_lentille_od}}", "{{addition_lentille_od}}",
  "{{rayon_od}}", "{{diametre_od}}",
  /* Lentilles OG */
  "{{sphere_lentille_og}}", "{{cylindre_lentille_og}}", "{{axe_lentille_og}}", "{{addition_lentille_og}}",
  "{{rayon_og}}", "{{diametre_og}}",
];

function sanitizeEtapes(etapes: unknown[]): Record<string, unknown>[] {
  return etapes.map((e) => {
    const etape = { ...(e as Record<string, unknown>) };
    if (Array.isArray(etape.selectors) && etape.selectors.length > 0 && !etape.selector) {
      etape.selector = etape.selectors[0];
    }
    if (
      etape.variable !== null &&
      etape.variable !== undefined &&
      (typeof etape.variable !== "string" || !ALLOWED_VARIABLES.includes(etape.variable as string))
    ) {
      etape.variable = null;
    }
    return etape;
  });
}

function validateEtapes(etapes: unknown): boolean {
  if (!Array.isArray(etapes)) return false;
  for (const e of etapes) {
    if (typeof e !== "object" || e === null) return false;
    const etape = e as Record<string, unknown>;
    if (!etape.id || !etape.action) return false;
    const validActions = ["fill", "click", "select", "wait"];
    if (!validActions.includes(etape.action as string)) return false;
    /* variable doit être un placeholder template ou null */
    if (etape.variable !== null && etape.variable !== undefined) {
      if (!ALLOWED_VARIABLES.includes(etape.variable as string)) return false;
    }
    /* selector vide autorisé pour l'édition admin — step inutilisable au replay mais sauvegardable */
  }
  return true;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { hostname, nom, etapes } = body as {
    hostname?: string;
    nom?: string;
    etapes?: unknown;
  };

  const sanitizedEtapes = etapes !== undefined && Array.isArray(etapes) ? sanitizeEtapes(etapes) : etapes;

  if (sanitizedEtapes !== undefined && !validateEtapes(sanitizedEtapes)) {
    return NextResponse.json(
      { error: "Format d'étapes invalide ou variable non autorisée" },
      { status: 400 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existing = await (prisma as any).parcoursRPA.findUnique({
    where: { id },
    select: { etapes: true, version: true, history: true, hostname: true, nom: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Parcours introuvable" }, { status: 404 });
  }

  /* P2 — Versionning : sauvegarder l'état courant dans l'historique (5 versions max) */
  let historyData = existing.history;
  let newVersion = existing.version;
  if (etapes !== undefined) {
    const prevEntry = {
      version: existing.version,
      etapes: existing.etapes,
      savedAt: new Date().toISOString(),
    };
    const prevHistory = Array.isArray(historyData) ? historyData : [];
    historyData = [...prevHistory, prevEntry].slice(-5);
    newVersion = existing.version + 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).parcoursRPA.update({
    where: { id },
    data: {
      ...(hostname ? { hostname: hostname.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim() } : {}),
      ...(nom ? { nom } : {}),
      ...(sanitizedEtapes !== undefined ? { etapes: sanitizedEtapes, version: newVersion, history: historyData } : {}),
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: "parcours.update",
    target: id,
    meta: { hostname: updated.hostname, nom: updated.nom, version: updated.version },
    req,
  });

  return NextResponse.json({ parcours: updated });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  /* P2 — Restauration d'une version précédente */
  if (typeof body.restoreVersion === "number") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = await (prisma as any).parcoursRPA.findUnique({
      where: { id },
      select: { etapes: true, version: true, history: true },
    });
    if (!current) return NextResponse.json({ error: "Parcours introuvable" }, { status: 404 });

    const history = Array.isArray(current.history) ? current.history : [];
    const target = history.find((h: { version: number }) => h.version === body.restoreVersion);
    if (!target) return NextResponse.json({ error: "Version introuvable" }, { status: 404 });

    /* Sauvegarder l'état courant dans l'historique avant restauration */
    const prevEntry = {
      version: current.version,
      etapes: current.etapes,
      savedAt: new Date().toISOString(),
    };
    const newHistory = [...history.filter((h: { version: number }) => h.version !== body.restoreVersion), prevEntry].slice(-5);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const restored = await (prisma as any).parcoursRPA.update({
      where: { id },
      data: { etapes: target.etapes, version: current.version + 1, history: newHistory },
    });
    await auditLog({
      userId: session.user.id!,
      action: "parcours.restore",
      target: id,
      meta: { restoredVersion: body.restoreVersion, newVersion: restored.version },
      req,
    });
    return NextResponse.json({ parcours: restored });
  }

  const { valide } = body as { valide: boolean };

  if (typeof valide !== "boolean") {
    return NextResponse.json({ error: "Champ 'valide' manquant ou invalide" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any).parcoursRPA.update({
    where: { id },
    data: { valide },
  });

  await auditLog({
    userId: session.user.id!,
    action: "parcours.validate",
    target: id,
    meta: { valide },
    req,
  });

  return NextResponse.json({ parcours: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;

  // Lire le nom avant suppression pour l'audit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcours = await (prisma as any).parcoursRPA.findUnique({
    where: { id },
    select: { nom: true, hostname: true },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).parcoursRPA.delete({ where: { id } });

  await auditLog({
    userId: session.user.id!,
    action: "parcours.delete",
    target: id,
    meta: { nom: parcours?.nom, hostname: parcours?.hostname },
    req,
  });

  return NextResponse.json({ ok: true });
}
