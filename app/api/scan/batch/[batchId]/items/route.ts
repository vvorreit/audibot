export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { batchId } = await params;
  const userId = (session.user as { id: string }).id;

  const batch = await prisma.batchScanSession.findFirst({
    where: { id: batchId, userId },
    select: { id: true, status: true, itemCount: true, createdAt: true, expiresAt: true },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch introuvable" }, { status: 404 });
  }

  const items = await prisma.batchScanItem.findMany({
    where: { batchId },
    select: {
      id: true,
      blob: true,
      status: true,
      orderIndex: true,
      processedAt: true,
      createdAt: true,
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json({
    batch: {
      id: batch.id,
      status: batch.status,
      itemCount: batch.itemCount,
      createdAt: batch.createdAt.toISOString(),
      expiresAt: batch.expiresAt.toISOString(),
    },
    items: items.map((i) => ({
      id: i.id,
      blob: i.blob,
      status: i.status,
      orderIndex: i.orderIndex,
      processedAt: i.processedAt?.toISOString() ?? null,
      createdAt: i.createdAt.toISOString(),
    })),
  });
}
