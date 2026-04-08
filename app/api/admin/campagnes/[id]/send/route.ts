export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/adminAudit";
import { sendMail } from "@/lib/mailer";
import { getTrackingPixel, getTrackingLink, getUnsubscribeFooter } from "@/lib/email-tracking";

const BATCH_SIZE = 100;
const SEND_INTERVAL_MS = Number(process.env.EMAIL_SEND_INTERVAL_MS ?? 500);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function personalizeHtml(html: string, token: string, firstName: string | null): string {
  const greeting = firstName || "Bonjour";
  let result = html.replace(/\[Prénom\]/gi, greeting);
  result = result.replace(
    /href="(https?:\/\/[^"]*(?:audibot)\.fr[^"]*)"/gi,
    (_match: string, url: string) => `href="${getTrackingLink(token, url)}"`,
  );
  const footer = getUnsubscribeFooter(token);
  const pixel = getTrackingPixel(token);
  if (result.includes("</body>")) {
    result = result.replace("</body>", `${footer}${pixel}</body>`);
  } else {
    result += footer + pixel;
  }
  return result;
}

/** Envoie les emails en background après la réponse HTTP */
async function processCampaignEmails(campaignId: string) {
  try {
    const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
    if (!campaign?.subject || !campaign?.htmlBody) return;

    const unsubscribedSet = new Set(
      (await prisma.emailUnsubscribe.findMany({ select: { email: true } })).map(u => u.email)
    );

    let hasMore = true;
    while (hasMore) {
      const batch = await prisma.emailTracking.findMany({
        where: { campaignId, status: "pending" },
        take: BATCH_SIZE,
      });

      if (batch.length === 0) {
        await prisma.emailCampaign.update({ where: { id: campaignId }, data: { sentAt: new Date() } });
        hasMore = false;
        break;
      }

      for (const tracking of batch) {
        if (unsubscribedSet.has(tracking.email)) {
          await prisma.emailTracking.update({ where: { id: tracking.id }, data: { status: "skipped" } });
          continue;
        }

        const html = personalizeHtml(campaign.htmlBody, tracking.token, tracking.firstName);
        const emailSubject = tracking.variant === "B" && campaign.subjectB ? campaign.subjectB : campaign.subject!;

        try {
          await sendMail({ to: tracking.email, subject: emailSubject, html });
          await prisma.emailTracking.update({
            where: { id: tracking.id },
            data: { status: "sent", sentAt: new Date() },
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "unknown";
          await prisma.emailTracking.update({
            where: { id: tracking.id },
            data: { status: "error", errorReason: msg.slice(0, 200) },
          });
        }

        await sleep(SEND_INTERVAL_MS);
      }
    }
  } catch (err) {
    console.error("[campagnes/send background]", err);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const subject: string | undefined = body.subject;
    const htmlBody: string | undefined = body.htmlBody;
    const subjectA: string | undefined = body.subjectA;
    const subjectB: string | undefined = body.subjectB;
    const splitPercent: number | undefined = body.splitPercent;
    const scheduledAt: string | undefined = body.scheduledAt;
    const excludeHighRisk: boolean = body.excludeHighRisk === true;
    const dripEnabled: boolean = body.dripEnabled === true;
    const dripDelayDays: number = body.dripDelayDays ?? 3;
    const dripSubject: string | undefined = body.dripSubject;
    const dripHtmlBody: string | undefined = body.dripHtmlBody;

    const isAB = !!(subjectA && subjectB && splitPercent != null);

    if (!isAB && (!subject || !htmlBody)) {
      return NextResponse.json({ error: "subject et htmlBody requis" }, { status: 400 });
    }
    if (isAB && !htmlBody) {
      return NextResponse.json({ error: "htmlBody requis pour A/B test" }, { status: 400 });
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: { id },
      include: { emails: { where: { status: "pending" } } },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campagne introuvable" }, { status: 404 });
    }

    /* Fix 2 — Lock re-envoi */
    if (campaign.sendingAt && !campaign.sentAt) {
      return NextResponse.json({ error: "Envoi déjà en cours" }, { status: 409 });
    }

    /* Exclude high-risk contacts if requested */
    let skippedHighRisk = 0;
    if (excludeHighRisk) {
      const allCampaigns = await prisma.emailCampaign.findMany({
        where: { sentAt: { not: null } },
        select: { id: true },
      });
      const campaignIds = allCampaigns.map((c) => c.id);

      for (const pending of campaign.emails) {
        const trackings = await prisma.emailTracking.findMany({
          where: { email: pending.email, campaignId: { in: campaignIds }, status: "sent" },
          select: { openCount: true, clickCount: true },
        });
        const unopenedCampaigns = trackings.filter((t) => t.openCount === 0).length;
        const totalOpens = trackings.reduce((s, t) => s + t.openCount, 0);
        const totalClicks = trackings.reduce((s, t) => s + t.clickCount, 0);
        const rawScore = totalOpens * 3 + totalClicks * 5 - unopenedCampaigns * 2;
        const maxPossible = trackings.length * 8 || 1;
        const score = Math.max(0, Math.min(100, Math.round((rawScore / maxPossible) * 100)));

        if (score < 20) {
          await prisma.emailTracking.update({
            where: { id: pending.id },
            data: { status: "skipped", errorReason: "high_unsubscribe_risk" },
          });
          skippedHighRisk++;
        }
      }
    }

    /* A/B test: assign variants to remaining pending emails */
    if (isAB) {
      const remainingPending = await prisma.emailTracking.findMany({
        where: { campaignId: id, status: "pending" },
        select: { id: true },
      });
      const pendingIds = remainingPending.map((e) => e.id);
      const splitIndex = Math.round(pendingIds.length * (splitPercent / 100));
      const variantAIds = pendingIds.slice(0, splitIndex);
      const variantBIds = pendingIds.slice(splitIndex);

      if (variantAIds.length > 0) {
        await prisma.emailTracking.updateMany({
          where: { id: { in: variantAIds } },
          data: { variant: "A" },
        });
      }
      if (variantBIds.length > 0) {
        await prisma.emailTracking.updateMany({
          where: { id: { in: variantBIds } },
          data: { variant: "B" },
        });
      }
    }

    /* Save template + mark campaign as queued (or scheduled) */
    const finalSubject = isAB ? subjectA! : subject!;
    const isScheduled = !!scheduledAt;
    await prisma.emailCampaign.update({
      where: { id },
      data: {
        subject: finalSubject,
        subjectB: isAB ? subjectB! : null,
        htmlBody: htmlBody!,
        ...(isScheduled
          ? { scheduledAt: new Date(scheduledAt), sendingAt: null }
          : { sendingAt: new Date(), scheduledAt: null }),
        sentAt: null,
        drip_enabled: dripEnabled,
        drip_delay_days: dripDelayDays,
        drip_subject: dripSubject ?? null,
        drip_html_body: dripHtmlBody ?? null,
      },
    });

    const remainingQueued = await prisma.emailTracking.count({
      where: { campaignId: id, status: "pending" },
    });

    /* Lancer l'envoi en background (non-bloquant) si pas schedulé */
    if (!isScheduled) {
      processCampaignEmails(id).catch(err => console.error("[campagnes/send] background error:", err));
    }

    return NextResponse.json({
      ok: true,
      queued: remainingQueued,
      skippedHighRisk,
      scheduled: isScheduled ? scheduledAt : null,
      ...(isAB ? { abTest: true, subjectA, subjectB, splitPercent } : {}),
    });
  } catch (err) {
    console.error("[campagnes/send]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
