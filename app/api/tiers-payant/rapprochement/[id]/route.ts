import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const userId = session.user.id;

  const { id } = await params;
  const body = await req.json();
  const { confirme } = body as { confirme: boolean };

  try {
    const rap = await (prisma as any).rapprochementBancaire.findUnique({
      where: { id },
      include: { ligne: true, dossier: true },
    });

    if (!rap || rap.userId !== userId) {
      return NextResponse.json({ error: "Rapprochement introuvable" }, { status: 404 });
    }

    // Verify dossier ownership (IDOR protection)
    if (rap.dossier?.userId !== userId) {
      return NextResponse.json({ error: "Rapprochement introuvable" }, { status: 404 });
    }

    if (confirme === true) {
      // Confirm: update rapprochement, dossier → ENCAISSE, ligne → RAPPROCHE
      await (prisma as any).rapprochementBancaire.update({
        where: { id },
        data: { confirme: true },
      });

      await prisma.dossierTiersPayant.update({
        where: { id: rap.dossierId },
        data: { statut: "ENCAISSE" },
      });

      await (prisma as any).ligneReleveBancaire.update({
        where: { id: rap.ligneId },
        data: { statut: "RAPPROCHE" },
      });

      return NextResponse.json({ success: true, action: "confirmed" });
    } else {
      // Reject: delete the rapprochement
      await (prisma as any).rapprochementBancaire.delete({ where: { id } });

      return NextResponse.json({ success: true, action: "rejected" });
    }
  } catch (err) {
    console.error("[rapprochement/[id]/PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
