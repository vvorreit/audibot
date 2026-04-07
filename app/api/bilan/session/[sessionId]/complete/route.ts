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

  const bilan = await prisma.bilanSession.findUnique({
    where: { id: sessionId },
    select: { status: true, assignedToUserId: true },
  });

  if (!bilan) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }

  const isAssigned = bilan.assignedToUserId === userId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isAssigned && !isAdmin) {
    return NextResponse.json(
      { error: "Seul l'opticien assigné peut terminer ce bilan" },
      { status: 403 }
    );
  }

  const updated = await prisma.bilanSession.update({
    where: { id: sessionId },
    data: { status: "DONE" },
  });

  return NextResponse.json({ ok: true, session: { id: updated.id, status: updated.status } });
}
