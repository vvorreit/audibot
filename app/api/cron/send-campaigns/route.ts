export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";
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
    /href="(https?:\/\/[^"]*(?:audibot|audibot)\.fr[^"]*)"/gi,
    (_match, url) => `href="${getTrackingLink(token, url)}"`,
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

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* Activate scheduled campaigns that are due */
  const now = new Date();
  await prisma.emailCampaign.updateMany({
    where: {
      scheduledAt: { lte: now },
      sendingAt: null,
      sentAt: null,
    },
    data: { sendingAt: now },
  });

  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      OR: [
        { sendingAt: { not: null }, sentAt: null },
      ],
    },
  });

  let totalProcessed = 0;
  let totalSent = 0;
  let totalErrors = 0;
  let totalBlocked = 0;

  for (const campaign of campaigns) {
    if (!campaign.subject || !campaign.htmlBody) continue;

    const pendingEmails = await prisma.emailTracking.findMany({
      where: { campaignId: campaign.id, status: "pending" },
      take: BATCH_SIZE,
    });

    if (pendingEmails.length === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { sentAt: new Date() },
      });
      continue;
    }

    const recipientEmails = pendingEmails.map((e) => e.email);
    const unsubscribed = new Set(
      (
        await prisma.emailUnsubscribe.findMany({
          where: { email: { in: recipientEmails } },
          select: { email: true },
        })
      ).map((u) => u.email),
    );

    for (const tracking of pendingEmails) {
      totalProcessed++;

      if (unsubscribed.has(tracking.email)) {
        totalBlocked++;
        await prisma.emailTracking.update({
          where: { id: tracking.id },
          data: { status: "skipped" },
        });
        continue;
      }

      const html = personalizeHtml(campaign.htmlBody, tracking.token, tracking.firstName);

      /* A/B test: use subjectB for variant B emails */
      const emailSubject =
        tracking.variant === "B" && campaign.subjectB
          ? campaign.subjectB
          : campaign.subject;

      try {
        await sendMail({
          to: tracking.email,
          subject: emailSubject!,
          html,
        });

        await prisma.emailTracking.update({
          where: { id: tracking.id },
          data: { status: "sent", sentAt: new Date() },
        });

        totalSent++;
      } catch (err) {
        totalErrors++;
        await prisma.emailTracking.update({
          where: { id: tracking.id },
          data: {
            status: "error",
            errorReason: err instanceof Error ? err.message.slice(0, 500) : "Erreur inconnue",
            errorAt: new Date(),
          },
        });
      }

      if (tracking !== pendingEmails[pendingEmails.length - 1]) {
        await sleep(SEND_INTERVAL_MS);
      }
    }

    /* Check if campaign is done */
    const remaining = await prisma.emailTracking.count({
      where: { campaignId: campaign.id, status: "pending" },
    });
    if (remaining === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { sentAt: new Date() },
      });
    }
  }

  /* ── Drip sequence: send follow-up to non-openers ── */
  let dripSent = 0;
  let dripErrors = 0;

  const dripCampaigns = await prisma.emailCampaign.findMany({
    where: {
      drip_enabled: true,
      sentAt: { not: null },
      drip_sent_at: null,
      drip_subject: { not: null },
      drip_html_body: { not: null },
    },
  });

  for (const dc of dripCampaigns) {
    if (!dc.sentAt || !dc.drip_subject || !dc.drip_html_body) continue;
    const delayMs = dc.drip_delay_days * 86_400_000;
    if (now.getTime() - dc.sentAt.getTime() < delayMs) continue;

    const nonOpeners = await prisma.emailTracking.findMany({
      where: {
        campaignId: dc.id,
        status: "sent",
        openCount: 0,
      },
    });

    const recipientEmails = nonOpeners.map((e) => e.email);
    const unsubscribedSet = new Set(
      (await prisma.emailUnsubscribe.findMany({
        where: { email: { in: recipientEmails } },
        select: { email: true },
      })).map((u) => u.email),
    );

    for (const tracking of nonOpeners) {
      if (unsubscribedSet.has(tracking.email)) continue;

      const html = personalizeHtml(dc.drip_html_body, tracking.token, tracking.firstName);
      try {
        await sendMail({ to: tracking.email, subject: dc.drip_subject, html });
        dripSent++;
      } catch {
        dripErrors++;
      }
      if (tracking !== nonOpeners[nonOpeners.length - 1]) {
        await sleep(SEND_INTERVAL_MS);
      }
    }

    await prisma.emailCampaign.update({
      where: { id: dc.id },
      data: { drip_sent_at: now },
    });
  }

  return NextResponse.json({
    processed: totalProcessed,
    sent: totalSent,
    errors: totalErrors,
    blocked: totalBlocked,
    dripSent,
    dripErrors,
  });
}
