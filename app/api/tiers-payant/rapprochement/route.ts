export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { runMatching } from "@/lib/bank/matching";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const allowed = await rateLimit(`rapprochement:${session.user.id}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  try {
    const result = await runMatching(session.user.id);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[rapprochement/POST]", err);
    return NextResponse.json({ error: "Erreur lors du matching" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const confirme = searchParams.get("confirme");

  try {
    const where: any = { userId };
    if (confirme === "true") where.confirme = true;
    else if (confirme === "false") where.confirme = false;

    const rapprochements = await (prisma as any).rapprochementBancaire.findMany({
      where,
      include: {
        ligne: true,
        dossier: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ rapprochements });
  } catch (err) {
    console.error("[rapprochement/GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
