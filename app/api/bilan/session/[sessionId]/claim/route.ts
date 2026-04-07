export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserFeatures } from "@/lib/userFeatures";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    const features = await getUserFeatures(session.user.id);
    if (!features.bilanAuditif) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
  }

  const { sessionId } = await params;
  const userId = session.user.id;

  const userWithTeam = await prisma.user.findUnique({
    where: { id: userId },
    select: { teamId: true, role: true },
  });

  const bilan = await prisma.bilanSession.findUnique({
    where: { id: sessionId },
    select: { status: true, assignedToUserId: true, userId: true, teamId: true },
  });

  if (!bilan) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  // IDOR protection — vérifier que l'user appartient à la même équipe ou est propriétaire
  const isOwner = bilan.userId === userId;
  const isTeamMember = userWithTeam?.teamId && bilan.teamId && userWithTeam.teamId === bilan.teamId;
  const isAdmin = userWithTeam?.role === "ADMIN";
  if (!isOwner && !isTeamMember && !isAdmin) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (bilan.status === "DONE") {
    return NextResponse.json({ error: "Bilan déjà traité" }, { status: 409 });
  }

  if (bilan.status === "IN_PROGRESS" && bilan.assignedToUserId !== userId) {
    return NextResponse.json(
      { error: "Déjà pris par un autre opticien" },
      { status: 409 }
    );
  }

  const updated = await prisma.bilanSession.update({
    where: { id: sessionId },
    data: {
      status: "IN_PROGRESS",
      assignedToUserId: userId,
      assignedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, session: { id: updated.id, status: updated.status } });
}
