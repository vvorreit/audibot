export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getExtCors, optionsCors } from "@/lib/extensionAuth";

export async function OPTIONS() {
  return optionsCors();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
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

  const { sessionId } = await params;

  const session = await prisma.bilanSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    return NextResponse.json(
      { error: "Session introuvable" },
      { status: 404, headers: getExtCors(req.headers.get('origin')) }
    );
  }

  /* Vérifier que l'utilisateur est propriétaire ou dans la même équipe */
  const isOwner = session.userId === user.id;
  const isTeamMember = user.teamId && session.teamId && user.teamId === session.teamId;
  if (!isOwner && !isTeamMember && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: getExtCors(req.headers.get('origin')) });
  }

  if (!session.delivered || !session.payload) {
    return NextResponse.json({ waiting: true }, { headers: getExtCors(req.headers.get('origin')) });
  }

  const parsed = JSON.parse(session.payload);

  /* Backward compat : ancien format = result direct, nouveau = { formData, result } */
  const result = parsed.result ?? parsed;
  const formData = parsed.formData ?? null;
  const ocrData = parsed.ocrData ?? null;

  return NextResponse.json(
    { waiting: false, result, formData, ocrData },
    { headers: getExtCors(req.headers.get('origin')) }
  );
}
