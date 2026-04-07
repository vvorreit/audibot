export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getExtCors, optionsCors } from "@/lib/extensionAuth";

export async function OPTIONS() {
  return optionsCors();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bilanId: string }> }
) {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, role: true, teamId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: getExtCors(req.headers.get('origin')) });
  }

  const { bilanId } = await params;

  // Verify user has access to this bilan
  const session = await prisma.bilanSession.findUnique({
    where: { id: bilanId },
    select: { userId: true, teamId: true },
  });
  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404, headers: getExtCors(req.headers.get('origin')) });
  }

  const isOwner = session.userId === user.id;
  const isTeamMember = user.teamId && session.teamId && user.teamId === session.teamId;
  if (!isOwner && !isTeamMember && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: getExtCors(req.headers.get('origin')) });
  }

  // Fetch non-expired, non-downloaded blob
  const doc = await prisma.documentBlob.findFirst({
    where: {
      bilanId,
      expiresAt: { gt: new Date() },
      downloaded: false,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, blob: true },
  });

  if (!doc) {
    return NextResponse.json({ notAvailable: true }, { headers: getExtCors(req.headers.get('origin')) });
  }

  // Mark as downloaded
  await prisma.documentBlob.update({
    where: { id: doc.id },
    data: { downloaded: true },
  });

  return NextResponse.json({ blob: doc.blob }, { headers: getExtCors(req.headers.get('origin')) });
}
