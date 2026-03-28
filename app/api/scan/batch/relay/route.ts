export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  let body: { batchId?: string; blob?: string; syncToken?: string; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { batchId, blob, syncToken, order } = body;

  if (!batchId || typeof batchId !== "string" || batchId.length > 64) {
    return NextResponse.json({ error: "batchId invalide" }, { status: 400 });
  }
  if (!blob || typeof blob !== "string" || blob.length > 100_000) {
    return NextResponse.json({ error: "blob invalide (max 100Ko)" }, { status: 400 });
  }
  if (!syncToken || typeof syncToken !== "string" || syncToken.length > 256) {
    return NextResponse.json({ error: "syncToken manquant" }, { status: 400 });
  }

  const allowed = await rateLimit(`batch-relay:${batchId}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requetes" }, { status: 429 });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const batch = await prisma.batchScanSession.findFirst({
    where: {
      id: batchId,
      userId: user.id,
      status: "OPEN",
      expiresAt: { gt: new Date() },
    },
    select: { id: true, itemCount: true },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch introuvable, ferme ou expire" }, { status: 404 });
  }

  if (batch.itemCount >= 20) {
    return NextResponse.json({ error: "Maximum 20 scans par lot" }, { status: 400 });
  }

  const orderIndex = typeof order === "number" ? order : batch.itemCount;

  await prisma.$transaction([
    prisma.batchScanItem.create({
      data: {
        batchId,
        blob,
        orderIndex,
      },
    }),
    prisma.batchScanSession.update({
      where: { id: batchId },
      data: { itemCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ ok: true, count: batch.itemCount + 1 });
}
