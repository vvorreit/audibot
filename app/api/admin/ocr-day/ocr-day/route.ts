export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminAudit";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = req.nextUrl.searchParams.get("date"); // format: YYYY-MM-DD ou YYYY-MM ou YYYY-Sxx
  if (!date) return NextResponse.json({ error: "date requis" }, { status: 400 });

  let start: Date;
  let end: Date;

  if (date.match(/^\d{4}-\d{2}$/) && !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // Format YYYY-MM → tout le mois
    start = new Date(`${date}-01T00:00:00.000Z`);
    end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (date.match(/^\d{4}-S\d{2}$/)) {
    // Format YYYY-Sxx → toute la semaine (approximation)
    start = new Date(`${date.slice(0, 4)}-01-01T00:00:00.000Z`);
    end = new Date();
  } else {
    // Format YYYY-MM-DD → toute la journée Paris (UTC-2h pour couvrir UTC+2)
    start = new Date(`${date}T00:00:00.000Z`);
    start.setHours(start.getHours() - 2);
    end = new Date(`${date}T23:59:59.999Z`);
  }

  const scans = await prisma.ocrScanLog.findMany({
    where: { createdAt: { gte: start, lte: end } },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      type: true,
      globalScore: true,
      success: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true, email: true } },
    },
  });

  const total = scans.length;
  const successes = scans.filter(s => s.success).length;
  const successRate = total > 0 ? Math.round((successes / total) * 100) : 0;
  const avgScore = total > 0
    ? Math.round(scans.reduce((s, r) => s + (r.globalScore ?? 0), 0) / total * 10) / 10
    : 0;

  return NextResponse.json({ date, total, successes, successRate, avgScore, scans });
}
