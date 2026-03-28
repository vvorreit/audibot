export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { batchId?: string; syncToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { batchId, syncToken } = body;

  if (!batchId || !syncToken) {
    return NextResponse.json({ error: "Parametres manquants" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken },
    select: { id: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401 });
  }

  const batch = await prisma.batchScanSession.findFirst({
    where: { id: batchId, userId: user.id, status: "OPEN" },
    select: { id: true },
  });

  if (!batch) {
    return NextResponse.json({ error: "Batch introuvable" }, { status: 404 });
  }

  await prisma.batchScanSession.update({
    where: { id: batchId },
    data: { status: "CLOSED" },
  });

  return NextResponse.json({ ok: true });
}
