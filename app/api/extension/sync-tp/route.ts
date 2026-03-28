export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateTPReference } from "@/lib/generateTPReference";
import { rateLimit } from "@/lib/rateLimit";
import { Mutuelle } from "@prisma/client";
import { getPortalCorsHeaders } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: getPortalCorsHeaders(req.headers.get("origin")) });
}

interface LboDossier {
  date: string;
  mode: string;
  numFSE: string;
  organisme: string;
  type: string;
  numBordereau: string;
  montant: number;
  statut: string;
  remarque: string;
  rejetTypeId: string;
  lboDetailId: string;
  erpDetailId?: string;
}

const MUTUELLE_MAP: Record<string, string> = {
  // CPAM / Ameli
  cpam: "CPAM",
  "assurance maladie": "CPAM",
  ameli: "CPAM",
  "regime obligatoire": "CPAM",
  "caisse primaire": "CPAM",
  // Almerys
  almerys: "ALMERYS",
  "be-almerys": "ALMERYS",
  // Viamedis
  viamedis: "VIAMEDIS",
  // Itelis / AG2R / Klésia
  itelis: "ITELIS",
  "ism-tp": "ITELIS",
  "ag2r": "ITELIS",
  "klesia": "ITELIS",
  // Kalixia / Actil
  kalixia: "KALIXIA",
  actil: "KALIXIA",
  // Carte Blanche Partenaires
  "carte blanche": "CARTE_BLANCHE",
  "cbp": "CARTE_BLANCHE",
  // Santeclair / TP Plus
  santeclair: "SANTECLAIR",
  "tp plus": "SANTECLAIR",
  "tpplus": "SANTECLAIR",
  // Sévéane
  seveane: "SEVEANE",
  "séveane": "SEVEANE",
  // SP Santé
  "sp sante": "SP_SANTE",
  "sp santé": "SP_SANTE",
  "ffl": "SP_SANTE",
  // Wemind / Harmonie / MGEN
  wemind: "AUTRE",
  "harmonie": "AUTRE",
  mgen: "AUTRE",
  // Malakoff / Humanis
  malakoff: "AUTRE",
  humanis: "AUTRE",
  // AG2R La Mondiale (hors Itelis)
  "la mondiale": "AUTRE",
  // Groupama
  groupama: "AUTRE",
  // Swiss Life
  "swiss life": "AUTRE",
  swisslife: "AUTRE",
  // Mutex / Apivia
  mutex: "AUTRE",
  apivia: "AUTRE",
  // Apgis
  apgis: "AUTRE",
  // Mercer
  mercer: "AUTRE",
  // Solimut / Ociane / Matmut
  solimut: "AUTRE",
  ociane: "AUTRE",
  matmut: "AUTRE",
  // Generali / April / Alptis
  generali: "AUTRE",
  april: "AUTRE",
  alptis: "AUTRE",
};

function mapMutuelle(organisme: string): Mutuelle {
  const lower = organisme.toLowerCase();
  for (const [key, value] of Object.entries(MUTUELLE_MAP)) {
    if (lower.includes(key)) return value as Mutuelle;
  }
  return "AUTRE" as Mutuelle;
}

function mapStatut(statut: string): "EN_ATTENTE" | "REJETE" | "RECU" {
  const lower = statut.toLowerCase();
  if (lower.includes("rejet")) return "REJETE";
  if (lower.includes("sold") && !lower.includes("non")) return "RECU";
  return "EN_ATTENTE";
}

function parseDate(dateStr: string): Date {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(dateStr);
}

export async function POST(req: Request) {
  const CORS_HEADERS = getPortalCorsHeaders(req.headers.get("origin"));
  try {
    const body = await req.json();
    const { syncToken, dossiers } = body as { syncToken: string; dossiers: LboDossier[] };

    if (!syncToken || !Array.isArray(dossiers) || dossiers.length > 500) {
      return NextResponse.json({ error: "Payload invalide ou trop grand (max 500 dossiers)" }, { status: 400, headers: CORS_HEADERS });
    }

    const user = await prisma.user.findFirst({
      where: { syncToken },
      select: { id: true, isPro: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: CORS_HEADERS });
    }

    const allowed = await rateLimit(`sync-tp:${syncToken}`, 60, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429, headers: CORS_HEADERS });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const d of dossiers) {
      const detailId = d.lboDetailId || d.erpDetailId || "";
      if (!detailId) { skipped++; continue; }

      const existing = d.lboDetailId
        ? await prisma.dossierTiersPayant.findUnique({
            where: { lboDetailId: d.lboDetailId },
            select: { id: true, statut: true },
          })
        : await prisma.dossierTiersPayant.findUnique({
            where: { erpDetailId: d.erpDetailId! },
            select: { id: true, statut: true },
          });

      const mutuelle = mapMutuelle(d.organisme);
      const statut = mapStatut(d.statut);
      const dateEnvoi = parseDate(d.date);
      const montant = d.montant || 0;

      if (existing) {
        const newStatut = mapStatut(d.statut);
        if (existing.statut !== newStatut || existing.statut === "EN_ATTENTE") {
          await prisma.dossierTiersPayant.update({
            where: { id: existing.id },
            data: {
              statut: newStatut,
              montant,
              commentaire: d.remarque || undefined,
              motifRejet: statut === "REJETE" && d.rejetTypeId ? `NOEMIE_${d.rejetTypeId}` : undefined,
              mode: d.mode || undefined,
            },
          });
          updated++;
        } else {
          skipped++;
        }
      } else {
        await prisma.$transaction(async (tx) => {
          const reference = await generateTPReference(tx);
          await tx.dossierTiersPayant.create({
            data: {
              reference,
              mutuelle,
              montant,
              dateEnvoi,
              referenceInterne: d.numFSE || null,
              statut,
              motifRejet: statut === "REJETE" && d.rejetTypeId ? `NOEMIE_${d.rejetTypeId}` : null,
              commentaire: d.remarque || null,
              lboDetailId: d.lboDetailId || null,
              erpDetailId: d.erpDetailId || null,
              mode: d.mode || null,
              userId: user.id,
            },
          });
        });
        created++;
      }
    }

    return NextResponse.json({ success: true, created, updated, skipped }, { headers: CORS_HEADERS });
  } catch (err: unknown) {
    console.error("[sync-tp] Erreur:", err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  }
}
