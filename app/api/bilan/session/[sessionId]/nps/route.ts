export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  // Rate limit par sessionId pour éviter le spam (5 req/heure par session)
  const allowed = await rateLimit(`nps:${sessionId}`, 5, 3_600_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const body = (await req.json()) as { score: number; comment?: string };

  if (typeof body.score !== "number" || body.score < 0 || body.score > 10) {
    return NextResponse.json({ error: "Score invalide (0-10)" }, { status: 400 });
  }

  const session = await prisma.bilanSession.findUnique({
    where: { id: sessionId },
    select: { id: true, delivered: true, expiresAt: true, npsScore: true },
  });

  if (!session) {
    return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
  }
  if (session.expiresAt < new Date()) {
    return NextResponse.json({ error: "Session expirée" }, { status: 403 });
  }
  if (!session.delivered) {
    return NextResponse.json({ error: "Bilan non soumis" }, { status: 403 });
  }
  // Empêcher la double soumission NPS
  if (session.npsScore !== null) {
    return NextResponse.json({ error: "NPS déjà soumis" }, { status: 409 });
  }

  // Sanitize comment — échapper les balises HTML
  const rawComment = body.comment?.slice(0, 500) ?? null;
  const sanitizedComment = rawComment
    ? rawComment.replace(/[<>"'&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" }[c] || c))
    : null;

  await prisma.bilanSession.update({
    where: { id: sessionId },
    data: {
      npsScore: Math.round(body.score),
      npsComment: sanitizedComment,
      npsAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
