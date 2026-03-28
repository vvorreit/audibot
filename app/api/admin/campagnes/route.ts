export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        emails: {
          select: {
            id: true,
            email: true,
            status: true,
            openCount: true,
            clickCount: true,
            sentAt: true,
            firstOpenAt: true,
            variant: true,
          },
        },
      },
    });

    /* Fetch all unsubscribed emails in one query */
    const allUnsubscribed = new Set(
      (await prisma.emailUnsubscribe.findMany({ select: { email: true } })).map((u) => u.email),
    );

    const data = campaigns.map((c) => {
      const totalEmails = c.emails.length;
      const sentCount = c.emails.filter((e) => e.status === "sent").length;
      const errorCount = c.emails.filter((e) => e.status === "error").length;
      const pendingCount = c.emails.filter((e) => e.status === "pending").length;
      const uniqueOpens = c.emails.filter((e) => e.openCount > 0).length;
      const uniqueClicks = c.emails.filter((e) => e.clickCount > 0).length;
      const unsubscribed = c.emails.filter((e) => allUnsubscribed.has(e.email)).length;

      const deliveryRate = totalEmails > 0 ? sentCount / totalEmails : 0;
      const openRate = sentCount > 0 ? uniqueOpens / sentCount : 0;
      const clickRate = sentCount > 0 ? uniqueClicks / sentCount : 0;
      const ctor = uniqueOpens > 0 ? uniqueClicks / uniqueOpens : 0;

      const openDelays = c.emails
        .filter((e) => e.sentAt && e.firstOpenAt)
        .map((e) => (new Date(e.firstOpenAt!).getTime() - new Date(e.sentAt!).getTime()) / 3600000);
      const avgOpenDelayHours = openDelays.length > 0
        ? openDelays.reduce((a, b) => a + b, 0) / openDelays.length
        : null;

      const hasVariants = c.emails.some((e) => e.variant != null);

      return {
        id: c.id,
        name: c.name,
        subject: c.subject,
        sendingAt: c.sendingAt,
        sentAt: c.sentAt,
        scheduledAt: c.scheduledAt,
        drip_enabled: c.drip_enabled,
        drip_delay_days: c.drip_delay_days,
        drip_subject: c.drip_subject,
        drip_sent_at: c.drip_sent_at,
        createdAt: c.createdAt,
        totalEmails,
        sentCount,
        errorCount,
        pendingCount,
        uniqueOpens,
        uniqueClicks,
        unsubscribed,
        deliveryRate,
        openRate,
        clickRate,
        ctor,
        avgOpenDelayHours,
        hasVariants,
      };
    });

    /* Compute best opening hour across all campaigns */
    const allOpenHours: number[] = [];
    for (const c of campaigns) {
      for (const e of c.emails) {
        if (e.firstOpenAt) {
          allOpenHours.push(new Date(e.firstOpenAt).getHours());
        }
      }
    }
    let bestOpenHour: number | null = null;
    if (allOpenHours.length > 0) {
      const hourCounts: Record<number, number> = {};
      for (const h of allOpenHours) hourCounts[h] = (hourCounts[h] || 0) + 1;
      bestOpenHour = parseInt(Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0]);
    }

    return NextResponse.json({ campaigns: data, bestOpenHour });
  } catch (err) {
    console.error("[admin/campagnes]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id: string | undefined = body.id;

    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    await prisma.emailCampaign.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/campagnes] DELETE", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
