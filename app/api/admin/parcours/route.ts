export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auditLog } from "@/lib/adminAudit";

/* Variables autorisées dans les étapes — aucune valeur patient réelle */
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

/**
 * Normalise les étapes avant validation :
 * - Rétrocompatibilité selectors[] → selector (format extension)
 * - Supprime les placeholders non-template comme "[VALEUR STATIQUE — À RENSEIGNER]"
 */
function sanitizeEtapes(etapes: unknown[]): Record<string, unknown>[] {
  return etapes.map((e) => {
    const etape = { ...(e as Record<string, unknown>) };
    /* selectors[] (nouveau format extension) → utiliser le premier comme selector */
    if (Array.isArray(etape.selectors) && etape.selectors.length > 0 && !etape.selector) {
      etape.selector = etape.selectors[0];
    }
    /* Variable non-template → null */
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
    if (etape.variable !== null && etape.variable !== undefined) {
      if (!ALLOWED_VARIABLES.includes(etape.variable as string)) return false;
    }
  }
  return true;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcours = await (prisma as any).parcoursRPA.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ parcours });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { hostname, nom, etapes } = body as {
    hostname: string;
    nom: string;
    etapes: unknown;
  };

  if (!hostname || !nom || !etapes) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const sanitized = Array.isArray(etapes) ? sanitizeEtapes(etapes) : etapes;

  if (!validateEtapes(sanitized)) {
    return NextResponse.json(
      { error: "Format d'étapes invalide ou variable non autorisée" },
      { status: 400 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parcours = await (prisma as any).parcoursRPA.create({
    data: {
      hostname: hostname.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim(),
      nom,
      etapes: sanitized,
      valide: false,
      version: 1,
      createdBy: session.user.id,
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: "parcours.create",
    target: parcours.id,
    meta: { hostname: parcours.hostname, nom: parcours.nom },
    req,
  });

  return NextResponse.json({ parcours }, { status: 201 });
}
