export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getExtCors, optionsCors } from "@/lib/extensionAuth";

export async function OPTIONS() {
  return optionsCors();
}

export async function PATCH(
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
    return NextResponse.json({ error: "Session introuvable" }, { status: 404, headers: getExtCors(req.headers.get('origin')) });
  }

  const isOwner = session.userId === user.id;
  const isTeamMember = user.teamId && session.teamId && user.teamId === session.teamId;
  if (!isOwner && !isTeamMember && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403, headers: getExtCors(req.headers.get('origin')) });
  }

  if (!session.delivered || !session.payload) {
    return NextResponse.json({ error: "Bilan non soumis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const body = await req.json() as { formData?: Record<string, unknown>; ocrData?: Record<string, unknown> };
  const { formData, ocrData: updatedOcr } = body;
  if (!formData || typeof formData !== "object") {
    return NextResponse.json({ error: "formData requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const parsed = JSON.parse(session.payload);
  const result = parsed.result ?? parsed;
  const existingOcr = parsed.ocrData ?? null;

  // Merge: updated ocrData wins, else preserve existing
  const finalOcr = updatedOcr ?? existingOcr;

  const storedPayload: Record<string, unknown> = { formData, result };
  if (finalOcr) storedPayload.ocrData = finalOcr;

  await prisma.bilanSession.update({
    where: { id: sessionId },
    data: { payload: JSON.stringify(storedPayload) },
  });

  return NextResponse.json({ success: true }, { headers: getExtCors(req.headers.get('origin')) });
}
