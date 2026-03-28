export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  let body: { sessionId?: string; blob?: string; syncToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { sessionId, blob, syncToken } = body;

  if (!sessionId || typeof sessionId !== "string" || sessionId.length > 64) {
    return NextResponse.json({ error: "sessionId invalide" }, { status: 400 });
  }
  if (!blob || typeof blob !== "string" || blob.length > 50_000) {
    return NextResponse.json({ error: "blob invalide" }, { status: 400 });
  }
  if (!syncToken || typeof syncToken !== "string" || syncToken.length > 256) {
    return NextResponse.json({ error: "syncToken manquant" }, { status: 400 });
  }

  // Rate limit par sessionId
  const allowed = await rateLimit(`scan-relay:${sessionId}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  // Vérifier que le syncToken correspond au user propriétaire de la session
  const user = await prisma.user.findUnique({
    where: { syncToken },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  // Vérifier que la session existe, appartient à cet user et n'est pas expirée
  const scanSession = await prisma.scanSession.findFirst({
    where: {
      id: sessionId,
      userId: user.id,
      delivered: false,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!scanSession) {
    return NextResponse.json({ error: "Session introuvable ou expirée" }, { status: 404 });
  }

  // Stocker le blob opaque (serveur ne peut PAS déchiffrer — clé est dans le QR côté client)
  await prisma.scanSession.update({
    where: { id: sessionId },
    data: { blob },
  });

  return NextResponse.json({ ok: true });
}
