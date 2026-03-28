export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      select: { sentAt: true, sendingAt: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    const emails = await prisma.emailTracking.findMany({
      where: { campaignId: id },
      select: {
        status: true,
        sentAt: true,
        firstOpenAt: true,
        firstClickAt: true,
        openCount: true,
        clickCount: true,
        variant: true,
      },
    });

    /* Opens/clicks by day (J+0 to J+7 after campaign send) */
    const baseDate = campaign.sentAt ?? campaign.sendingAt ?? new Date();
    const opensByDay: { date: string; opens: number; clicks: number }[] = [];
    for (let d = 0; d < 8; d++) {
      const dayStart = new Date(baseDate);
      dayStart.setDate(dayStart.getDate() + d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const opens = emails.filter(
        (e) => e.firstOpenAt && new Date(e.firstOpenAt) >= dayStart && new Date(e.firstOpenAt) < dayEnd,
      ).length;
      const clicks = emails.filter(
        (e) => e.firstClickAt && new Date(e.firstClickAt) >= dayStart && new Date(e.firstClickAt) < dayEnd,
      ).length;

      opensByDay.push({
        date: dayStart.toISOString().slice(0, 10),
        opens,
        clicks,
      });
    }

    /* Opens by hour (0-23) */
    const opensByHour: { hour: number; count: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const count = emails.filter(
        (e) => e.firstOpenAt && new Date(e.firstOpenAt).getHours() === h,
      ).length;
      opensByHour.push({ hour: h, count });
    }

    /* A/B variant stats if applicable */
    const variantA = emails.filter((e) => e.variant === "A");
    const variantB = emails.filter((e) => e.variant === "B");
    const hasVariants = variantA.length > 0 && variantB.length > 0;

    const variantStats = hasVariants
      ? {
          A: {
            total: variantA.length,
            sent: variantA.filter((e) => e.status === "sent").length,
            opens: variantA.filter((e) => e.openCount > 0).length,
            clicks: variantA.filter((e) => e.clickCount > 0).length,
          },
          B: {
            total: variantB.length,
            sent: variantB.filter((e) => e.status === "sent").length,
            opens: variantB.filter((e) => e.openCount > 0).length,
            clicks: variantB.filter((e) => e.clickCount > 0).length,
          },
        }
      : null;

    return NextResponse.json({ opensByDay, opensByHour, variantStats });
  } catch (err) {
    console.error("[campagnes/stats]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
