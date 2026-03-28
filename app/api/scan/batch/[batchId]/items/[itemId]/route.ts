export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string; itemId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const { batchId, itemId } = await params;
  const userId = (session.user as { id: string }).id;

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (!body.status || !["PROCESSED", "SKIPPED"].includes(body.status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const batch = await prisma.batchScanSession.findFirst({
    where: { id: batchId, userId },
    select: { id: true },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch introuvable" }, { status: 404 });
  }

  await prisma.batchScanItem.update({
    where: { id: itemId },
    data: {
      status: body.status,
      processedAt: body.status === "PROCESSED" ? new Date() : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
