export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeCompare } from "@/lib/safeCompare";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || !secret || !safeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const result = await prisma.user.deleteMany({
    where: {
      lastActiveAt: { lt: cutoff },
      stripeSubscriptionId: null,
      isPro: false,
    },
  });

  console.log("[RGPD] Purge comptes inactifs:", result.count, new Date().toISOString());
  return NextResponse.json({ ok: true, deleted: result.count });
}
