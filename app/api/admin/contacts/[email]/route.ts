export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email } = await params;
  const decodedEmail = decodeURIComponent(email);

  try {
    const trackings = await prisma.emailTracking.findMany({
      where: { email: decodedEmail },
      include: {
        campaign: {
          select: { id: true, name: true, sentAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const unsub = await prisma.emailUnsubscribe.findFirst({
      where: { email: decodedEmail },
    });

    const totalCampaigns = trackings.length;
    const engaged = trackings.filter((t) => t.openCount > 0).length;

    const campaigns = trackings.map((t) => ({
      campaignId: t.campaign.id,
      campaignName: t.campaign.name,
      sentAt: t.campaign.sentAt,
      status: t.status,
      opened: t.openCount > 0,
      clicked: t.clickCount > 0,
      openCount: t.openCount,
      clickCount: t.clickCount,
      firstOpenAt: t.firstOpenAt,
      firstClickAt: t.firstClickAt,
    }));

    return NextResponse.json({
      email: decodedEmail,
      totalCampaigns,
      engaged,
      unsubscribedAt: unsub?.unsubscribedAt ?? null,
      campaigns,
    });
  } catch (err) {
    console.error("[contacts/email]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
