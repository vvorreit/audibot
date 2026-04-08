export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || !secret || !safeCompare(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const logs = await prisma.injectionLog.groupBy({
    by: ["site"],
    _count: { id: true },
    where: { createdAt: { gte: since } },
  });

  const successLogs = await prisma.injectionLog.groupBy({
    by: ["site"],
    _count: { id: true },
    where: { createdAt: { gte: since }, success: true },
  });

  const successMap: Record<string, number> = {};
  for (const s of successLogs) successMap[s.site] = s._count.id;

  const stats = logs
    .map((l) => ({
      site: l.site,
      total: l._count.id,
      success: successMap[l.site] || 0,
      rate: Math.round(((successMap[l.site] || 0) / l._count.id) * 100),
    }))
    .sort((a, b) => a.rate - b.rate);

  // Alerter si un portail tombe sous 60% sur 10+ injections
  const alerts = stats.filter((s) => s.total >= 10 && s.rate < 60);

  if (alerts.length > 0) {
    await sendMail({
      to: "contact@audibot.fr",
      subject: `[ALERTE] Smart Fill — ${alerts.length} portail(s) sous 60% de succès`,
      html: `<ul>${alerts.map((a) => `<li><strong>${a.site}</strong> : ${a.rate}% (${a.success}/${a.total})</li>`).join("")}</ul>`,
    }).catch(() => {});
  }

  return NextResponse.json({ stats, alerts: alerts.length });
}
