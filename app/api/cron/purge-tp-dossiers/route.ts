export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (req.headers.get("Authorization") !== "Bearer " + process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1095);

  const result = await prisma.dossierTiersPayant.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  console.log("[RGPD] Purge dossiers TP 3ans:", result.count, new Date().toISOString());
  return NextResponse.json({ ok: true, deleted: result.count });
}
