import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
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
}

const MUTUELLE_MAP: Record<string, string> = {
  cpam: "CPAM",
  almerys: "ALMERYS",
  viamedis: "VIAMEDIS",
  itelis: "ITELIS",
  kalixia: "KALIXIA",
  "carte blanche": "CARTE_BLANCHE",
  santeclair: "SANTECLAIR",
  seveane: "SEVEANE",
  "sp sante": "SP_SANTE",
  "sp santé": "SP_SANTE",
};

function mapMutuelle(organisme: string): string {
  const lower = organisme.toLowerCase();
  for (const [key, value] of Object.entries(MUTUELLE_MAP)) {
    if (lower.includes(key)) return value;
  }
  return "AUTRE";
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
  try {
    const body = await req.json();
    const { syncToken, dossiers } = body as { syncToken: string; dossiers: LboDossier[] };

    if (!syncToken || !Array.isArray(dossiers)) {
      return NextResponse.json({ error: "Donnees invalides" }, { status: 400, headers: CORS_HEADERS });
    }

    const user = await prisma.user.findFirst({
      where: { syncToken },
      select: { id: true, isPro: true, plan: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: CORS_HEADERS });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const d of dossiers) {
      if (!d.lboDetailId) { skipped++; continue; }

      const existing = await prisma.dossierTiersPayant.findUnique({
        where: { lboDetailId: d.lboDetailId },
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
        const year = new Date().getFullYear();
        const lastDossier = await prisma.dossierTiersPayant.findFirst({
          where: { reference: { startsWith: `TP-${year}-` } },
          orderBy: { reference: "desc" },
          select: { reference: true },
        });

        let nextNum = 1;
        if (lastDossier) {
          const parts = lastDossier.reference.split("-");
          const lastNum = parseInt(parts[2], 10);
          if (!isNaN(lastNum)) nextNum = lastNum + 1;
        }

        const reference = `TP-${year}-${String(nextNum).padStart(4, "0")}`;

        await prisma.dossierTiersPayant.create({
          data: {
            reference,
            mutuelle: mutuelle as any,
            montant,
            dateEnvoi,
            referenceInterne: d.numFSE || null,
            statut,
            motifRejet: statut === "REJETE" && d.rejetTypeId ? `NOEMIE_${d.rejetTypeId}` : null,
            commentaire: d.remarque || null,
            lboDetailId: d.lboDetailId,
            mode: d.mode || null,
            userId: user.id,
          },
        });
        created++;
      }
    }

    return NextResponse.json({ success: true, created, updated, skipped }, { headers: CORS_HEADERS });
  } catch (err: any) {
    console.error("[sync-tp] Erreur:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500, headers: CORS_HEADERS });
  }
}
