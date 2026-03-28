export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeCompare } from "@/lib/safeCompare";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const result = await prisma.scanSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  /* Nettoyer les batchs expires (48h+) */
  await prisma.batchScanSession.updateMany({
    where: { status: "OPEN", expiresAt: { lt: new Date() } },
    data: { status: "EXPIRED" },
  });

  /* Supprimer les batchs expires et fermes de plus de 7 jours */
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oldBatches = await prisma.batchScanSession.deleteMany({
    where: {
      status: { in: ["EXPIRED", "CLOSED"] },
      expiresAt: { lt: sevenDaysAgo },
    },
  });

  return NextResponse.json({
    deleted: result.count,
    batchesCleaned: oldBatches.count,
  });
}
