export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const twentyFiveHoursAgo = new Date(now.getTime() - 25 * 3_600_000);
  const twentyThreeHoursAgo = new Date(now.getTime() - 23 * 3_600_000);

  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      sentAt: { gte: twentyFiveHoursAgo, lte: twentyThreeHoursAgo },
      reportSentAt: null,
    },
    include: {
      emails: {
        select: {
          status: true,
          openCount: true,
          clickCount: true,
          firstOpenAt: true,
          email: true,
        },
      },
    },
  });

  let reportsSent = 0;

  for (const campaign of campaigns) {
    const totalSent = campaign.emails.filter((e) => e.status === "sent").length;
    const totalErrors = campaign.emails.filter((e) => e.status === "error").length;
    const uniqueOpens = campaign.emails.filter((e) => e.openCount > 0).length;
    const uniqueClicks = campaign.emails.filter((e) => e.clickCount > 0).length;
    const openRate = totalSent > 0 ? ((uniqueOpens / totalSent) * 100).toFixed(1) : "0";
    const clickRate = totalSent > 0 ? ((uniqueClicks / totalSent) * 100).toFixed(1) : "0";
    const ctor = uniqueOpens > 0 ? ((uniqueClicks / uniqueOpens) * 100).toFixed(1) : "0";

    const recipientEmails = campaign.emails.map((e) => e.email);
    const unsubscribed = await prisma.emailUnsubscribe.count({
      where: { email: { in: recipientEmails } },
    });

    /* Find previous campaign for comparison */
    const previousCampaign = await prisma.emailCampaign.findFirst({
      where: { sentAt: { not: null, lt: campaign.sentAt! }, id: { not: campaign.id } },
      orderBy: { sentAt: "desc" },
      include: {
        emails: {
          select: { status: true, openCount: true, clickCount: true },
        },
      },
    });

    let comparisonHtml = "";
    if (previousCampaign) {
      const prevSent = previousCampaign.emails.filter((e) => e.status === "sent").length;
      const prevOpens = previousCampaign.emails.filter((e) => e.openCount > 0).length;
      const prevClicks = previousCampaign.emails.filter((e) => e.clickCount > 0).length;
      const prevOpenRate = prevSent > 0 ? (prevOpens / prevSent) * 100 : 0;
      const prevClickRate = prevSent > 0 ? (prevClicks / prevSent) * 100 : 0;
      const deltaOpen = (parseFloat(openRate) - prevOpenRate).toFixed(1);
      const deltaClick = (parseFloat(clickRate) - prevClickRate).toFixed(1);
      comparisonHtml = `
        <tr style="background:#f8fafc;">
          <td colspan="2" style="padding:12px;font-weight:700;border-bottom:1px solid #e2e8f0;">vs. campagne précédente (${previousCampaign.name})</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">Delta ouverture</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${parseFloat(deltaOpen) >= 0 ? "#16a34a" : "#dc2626"};">${parseFloat(deltaOpen) >= 0 ? "+" : ""}${deltaOpen}%</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">Delta clic</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${parseFloat(deltaClick) >= 0 ? "#16a34a" : "#dc2626"};">${parseFloat(deltaClick) >= 0 ? "+" : ""}${deltaClick}%</td>
        </tr>`;
    }

    /* Best opening hour */
    const openHours = campaign.emails
      .filter((e) => e.firstOpenAt)
      .map((e) => new Date(e.firstOpenAt!).getHours());
    let bestHourHtml = "";
    if (openHours.length > 0) {
      const hourCounts: Record<number, number> = {};
      for (const h of openHours) hourCounts[h] = (hourCounts[h] || 0) + 1;
      const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0];
      bestHourHtml = `<p style="margin-top:16px;padding:12px;background:#eff6ff;border-radius:8px;font-size:13px;">💡 Vos contacts ouvrent surtout à <strong>${bestHour}h</strong> — programmez votre prochaine campagne à cette heure.</p>`;
    }

    const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:18px;font-weight:800;margin-bottom:4px;">Rapport J+1 — ${campaign.name}</h1>
  <p style="font-size:13px;color:#64748b;margin-bottom:24px;">Envoyée le ${campaign.sentAt!.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</p>

  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;font-size:14px;">
    <tr style="background:#f8fafc;">
      <td style="padding:12px;font-weight:700;border-bottom:1px solid #e2e8f0;">Métrique</td>
      <td style="padding:12px;font-weight:700;border-bottom:1px solid #e2e8f0;">Valeur</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">Envoyés</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;">${totalSent}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">Erreurs</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${totalErrors > 0 ? "#dc2626" : "#1e293b"};">${totalErrors}</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">Taux d'ouverture</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;">${openRate}%</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">Taux de clic</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;">${clickRate}%</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">CTOR</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;">${ctor}%</td>
    </tr>
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">Désinscriptions</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:700;color:${unsubscribed > 0 ? "#dc2626" : "#1e293b"};">${unsubscribed}</td>
    </tr>
    ${comparisonHtml}
  </table>

  ${bestHourHtml}

  <p style="font-size:11px;color:#94a3b8;margin-top:32px;text-align:center;">Rapport automatique OptiBot — contact@optibot.fr</p>
</body></html>`;

    try {
      await sendMail({
        to: "contact@optibot.fr",
        subject: `[Rapport] ${campaign.name} — ${openRate}% ouverture`,
        html,
      });
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { reportSentAt: new Date() },
      });
      reportsSent++;
    } catch (err) {
      console.error("[campaign-report]", err);
    }
  }

  return NextResponse.json({ reportsSent });
}
