export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractOrganisme } from "@/lib/bank/organisme";
import { rateLimit } from "@/lib/rateLimit";

function parseCSV(content: string): { date: Date; libelle: string; montant: number }[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const results: { date: Date; libelle: string; montant: number }[] = [];

  // Detect separator
  const sep = lines[0]?.includes(";") ? ";" : ",";

  for (const line of lines) {
    const parts = line.split(sep).map((p) => p.trim().replace(/^["']|["']$/g, ""));
    if (parts.length < 3) continue;

    const rawDate = parts[0];
    const libelle = parts[1];
    const rawMontant = parts[2].replace(",", ".");

    let date: Date | null = null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
      const [d, m, y] = rawDate.split("/");
      date = new Date(`${y}-${m}-${d}`);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
      date = new Date(rawDate);
    }

    if (!date || isNaN(date.getTime())) continue;

    const montant = parseFloat(rawMontant);
    if (isNaN(montant) || montant <= 0) continue;

    results.push({ date, libelle, montant });
  }

  return results;
}

function parseOFX(content: string): { date: Date; libelle: string; montant: number }[] {
  const results: { date: Date; libelle: string; montant: number }[] = [];
  const stmtTrnPattern = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = stmtTrnPattern.exec(content)) !== null) {
    const block = match[1];
    const amtMatch = block.match(/<TRNAMT>([\d.+-]+)/i);
    const dateMatch = block.match(/<DTPOSTED>(\d{8})/i);
    const memoMatch = block.match(/<MEMO>(.*?)(?:<|$)/i);
    const nameMatch = block.match(/<NAME>(.*?)(?:<|$)/i);

    if (!amtMatch || !dateMatch) continue;

    const montant = parseFloat(amtMatch[1]);
    if (isNaN(montant) || montant <= 0) continue;

    const rawDate = dateMatch[1];
    const date = new Date(
      `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
    );
    if (isNaN(date.getTime())) continue;

    const libelle =
      (memoMatch?.[1] || nameMatch?.[1] || "").trim() || "Virement";

    results.push({ date, libelle, montant });
  }

  return results;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const userId = session.user.id;

  const allowed = await rateLimit(`releve-import:${userId}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    }

    const text = await file.text();
    const filename = file.name.toLowerCase();

    let parsed: { date: Date; libelle: string; montant: number }[] = [];

    if (filename.endsWith(".ofx") || filename.endsWith(".qfx")) {
      parsed = parseOFX(text);
    } else {
      parsed = parseCSV(text);
    }

    if (parsed.length === 0) {
      return NextResponse.json({ error: "Aucune ligne valide trouvée dans le fichier" }, { status: 400 });
    }

    const lignes = await (prisma as any).ligneReleveBancaire.createManyAndReturn({
      data: parsed.map((p) => ({
        userId,
        date: p.date,
        libelle: p.libelle,
        montant: p.montant,
        organisme: extractOrganisme(p.libelle),
        statut: "NON_RAPPROCHE",
        source: "csv",
      })),
    });

    return NextResponse.json({ imported: lignes.length, lignes });
  } catch (err) {
    console.error("[releve/POST]", err);
    return NextResponse.json({ error: "Erreur lors de l'import" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const statut = searchParams.get("statut");

  try {
    const lignes = await (prisma as any).ligneReleveBancaire.findMany({
      where: {
        userId,
        ...(statut ? { statut } : {}),
      },
      orderBy: { date: "desc" },
      take: 200,
    });

    return NextResponse.json({ lignes });
  } catch (err) {
    console.error("[releve/GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
