export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";

export async function GET() {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const appareils = await prisma.appareil.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  return NextResponse.json({ appareils });
}

export async function POST(req: NextRequest) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  let body: {
    id?: string;
    marque: string;
    modele: string;
    type: string;
    classe: string;
    canaux?: number;
    connectivite?: string;
    rechargeable?: boolean;
    indiceProtection?: string;
    gamme: string;
    style: string;
    targetAgeGroup?: string;
    imageUrl?: string;
    inStock?: boolean;
    prixBase?: number;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (!body.marque || !body.modele || !body.type || !body.classe || !body.gamme || !body.style) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const data = {
    marque: body.marque,
    modele: body.modele,
    type: body.type,
    classe: body.classe,
    canaux: body.canaux ?? null,
    connectivite: body.connectivite ?? null,
    rechargeable: body.rechargeable ?? false,
    indiceProtection: body.indiceProtection ?? null,
    gamme: body.gamme,
    style: body.style,
    targetAgeGroup: body.targetAgeGroup ?? "Adulte",
    imageUrl: body.imageUrl ?? null,
    inStock: body.inStock ?? true,
    prixBase: body.prixBase ?? null,
  };

  // Upsert: if id provided, update; otherwise create
  if (body.id) {
    const appareil = await prisma.appareil.update({
      where: { id: body.id },
      data,
    });
    return NextResponse.json({ appareil });
  }

  const appareil = await prisma.appareil.create({ data });
  return NextResponse.json({ appareil }, { status: 201 });
}
