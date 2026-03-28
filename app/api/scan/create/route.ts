export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const allowed = await rateLimit(`scan-create:${userId}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  // Supprimer les sessions expirées de cet user avant d'en créer une nouvelle
  await prisma.scanSession.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

  const scanSession = await prisma.scanSession.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + 90_000), // 90s — temps pour scanner + OCR
    },
    select: { id: true },
  });

  return NextResponse.json({ sessionId: scanSession.id });
}
