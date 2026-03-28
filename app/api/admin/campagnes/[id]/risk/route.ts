export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";

interface ContactRisk {
  email: string;
  firstName: string | null;
  score: number;
}

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
      include: {
        emails: {
          where: { status: "pending" },
          select: { email: true, firstName: true },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    /* Get all completed campaign IDs */
    const completedCampaigns = await prisma.emailCampaign.findMany({
      where: { sentAt: { not: null } },
      select: { id: true },
    });
    const campaignIds = completedCampaigns.map((c) => c.id);

    /* Check unsubscribed emails */
    const allEmails = campaign.emails.map((e) => e.email);
    const unsubscribed = new Set(
      (await prisma.emailUnsubscribe.findMany({
        where: { email: { in: allEmails } },
        select: { email: true },
      })).map((u) => u.email),
    );

    const risks: ContactRisk[] = [];

    for (const contact of campaign.emails) {
      if (unsubscribed.has(contact.email)) {
        risks.push({ email: contact.email, firstName: contact.firstName, score: 0 });
        continue;
      }

      const trackings = await prisma.emailTracking.findMany({
        where: {
          email: contact.email,
          campaignId: { in: campaignIds },
          status: "sent",
        },
        select: { openCount: true, clickCount: true },
      });

      if (trackings.length === 0) {
        risks.push({ email: contact.email, firstName: contact.firstName, score: 50 });
        continue;
      }

      const unopened = trackings.filter((t) => t.openCount === 0).length;
      const totalOpens = trackings.reduce((s, t) => s + t.openCount, 0);
      const totalClicks = trackings.reduce((s, t) => s + t.clickCount, 0);

      const rawScore = totalOpens * 3 + totalClicks * 5 - unopened * 2;
      const maxPossible = trackings.length * 8 || 1;
      const score = Math.max(0, Math.min(100, Math.round((rawScore / maxPossible) * 100)));

      risks.push({ email: contact.email, firstName: contact.firstName, score });
    }

    const highRisk = risks.filter((r) => r.score < 20).length;
    const mediumRisk = risks.filter((r) => r.score >= 20 && r.score < 50).length;
    const lowRisk = risks.filter((r) => r.score >= 50).length;

    return NextResponse.json({
      total: risks.length,
      highRisk,
      mediumRisk,
      lowRisk,
      contacts: risks.sort((a, b) => a.score - b.score),
    });
  } catch (err) {
    console.error("[campagnes/risk]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
