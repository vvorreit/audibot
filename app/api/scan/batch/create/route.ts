export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const allowed = await rateLimit(`batch-create:${userId}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  /* Nettoyer les batchs expires */
  await prisma.batchScanSession.updateMany({
    where: { userId, status: "OPEN", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  const batch = await prisma.batchScanSession.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), /* 48h */
    },
    select: { id: true },
  });

  return NextResponse.json({ batchId: batch.id });
}
