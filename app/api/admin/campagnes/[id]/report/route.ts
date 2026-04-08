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
      include: {
        emails: {
          select: {
            email: true,
            firstName: true,
            status: true,
            openCount: true,
            clickCount: true,
            sentAt: true,
            firstOpenAt: true,
            firstClickAt: true,
            variant: true,
            errorReason: true,
          },
        },
      },
    });

    if (!campaign) {
      return new NextResponse("Campagne introuvable", { status: 404 });
    }

    const totalEmails = campaign.emails.length;
    const sent = campaign.emails.filter((e) => e.status === "sent").length;
    const errors = campaign.emails.filter((e) => e.status === "error").length;
    const skipped = campaign.emails.filter((e) => e.status === "skipped").length;
    const uniqueOpens = campaign.emails.filter((e) => e.openCount > 0).length;
    const uniqueClicks = campaign.emails.filter((e) => e.clickCount > 0).length;
    const openRate = sent > 0 ? ((uniqueOpens / sent) * 100).toFixed(1) : "0";
    const clickRate = sent > 0 ? ((uniqueClicks / sent) * 100).toFixed(1) : "0";
    const ctor = uniqueOpens > 0 ? ((uniqueClicks / uniqueOpens) * 100).toFixed(1) : "0";

    const recipientEmails = campaign.emails.map((e) => e.email);
    const unsubscribed = await prisma.emailUnsubscribe.count({
      where: { email: { in: recipientEmails } },
    });

    /* A/B variant breakdown */
    const hasVariants = campaign.emails.some((e) => e.variant != null);
    let variantHtml = "";
    if (hasVariants) {
      const varA = campaign.emails.filter((e) => e.variant === "A");
      const varB = campaign.emails.filter((e) => e.variant === "B");
      const sentA = varA.filter((e) => e.status === "sent").length;
      const sentB = varB.filter((e) => e.status === "sent").length;
      const opensA = varA.filter((e) => e.openCount > 0).length;
      const opensB = varB.filter((e) => e.openCount > 0).length;
      const clicksA = varA.filter((e) => e.clickCount > 0).length;
      const clicksB = varB.filter((e) => e.clickCount > 0).length;
      variantHtml = `
        <h2 style="font-size:16px;font-weight:800;margin-top:32px;">Test A/B</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-top:8px;font-size:13px;">
          <tr style="background:#f8fafc;">
            <th style="padding:10px;text-align:left;border-bottom:1px solid #e2e8f0;">Variante</th>
            <th style="padding:10px;text-align:left;border-bottom:1px solid #e2e8f0;">Objet</th>
            <th style="padding:10px;text-align:right;border-bottom:1px solid #e2e8f0;">Envoyés</th>
            <th style="padding:10px;text-align:right;border-bottom:1px solid #e2e8f0;">Ouvertures</th>
            <th style="padding:10px;text-align:right;border-bottom:1px solid #e2e8f0;">Clics</th>
          </tr>
          <tr>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:700;">A</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${campaign.subject || "—"}</td>
            <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${sentA}</td>
            <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${opensA} (${sentA > 0 ? ((opensA / sentA) * 100).toFixed(1) : 0}%)</td>
            <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${clicksA}</td>
          </tr>
          <tr>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:700;">B</td>
            <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${campaign.subjectB || "—"}</td>
            <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${sentB}</td>
            <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${opensB} (${sentB > 0 ? ((opensB / sentB) * 100).toFixed(1) : 0}%)</td>
            <td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${clicksB}</td>
          </tr>
        </table>`;
    }

    /* Heatmap: best opening hour */
    const openHours = campaign.emails
      .filter((e) => e.firstOpenAt)
      .map((e) => new Date(e.firstOpenAt!).getHours());
    let bestHourHtml = "";
    if (openHours.length > 0) {
      const hourCounts: Record<number, number> = {};
      for (const h of openHours) hourCounts[h] = (hourCounts[h] || 0) + 1;
      const sorted = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);
      const bestHour = sorted[0][0];
      bestHourHtml = `
        <div style="margin-top:24px;padding:16px;background:#eff6ff;border-radius:12px;">
          <p style="margin:0;font-size:14px;font-weight:700;">Recommandation</p>
          <p style="margin:4px 0 0;font-size:13px;color:#475569;">Vos contacts ouvrent surtout a ${bestHour}h — programmez votre prochaine campagne a cette heure.</p>
        </div>`;
    }

    /* Error details */
    const errorEmails = campaign.emails.filter((e) => e.status === "error");
    let errorHtml = "";
    if (errorEmails.length > 0) {
      const rows = errorEmails.slice(0, 20).map((e) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;">${e.email}</td><td style="padding:6px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#dc2626;">${e.errorReason || "Inconnue"}</td></tr>`
      ).join("");
      errorHtml = `
        <h2 style="font-size:16px;font-weight:800;margin-top:32px;color:#dc2626;">Erreurs (${errorEmails.length})</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-top:8px;">
          <tr style="background:#fef2f2;">
            <th style="padding:10px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:12px;">Email</th>
            <th style="padding:10px;text-align:left;border-bottom:1px solid #e2e8f0;font-size:12px;">Raison</th>
          </tr>
          ${rows}
        </table>
        ${errorEmails.length > 20 ? `<p style="font-size:12px;color:#94a3b8;margin-top:4px;">Et ${errorEmails.length - 20} autres erreurs…</p>` : ""}`;
    }

    /* Drip info */
    let dripHtml = "";
    if (campaign.drip_enabled) {
      dripHtml = `
        <h2 style="font-size:16px;font-weight:800;margin-top:32px;">Relance automatique (drip)</h2>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;margin-top:8px;font-size:13px;">
          <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;">Delai</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${campaign.drip_delay_days} jours</td></tr>
          <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;">Sujet relance</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${campaign.drip_subject || "—"}</td></tr>
          <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-weight:600;">Envoyee</td><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">${campaign.drip_sent_at ? new Date(campaign.drip_sent_at).toLocaleDateString("fr-FR") : "Pas encore"}</td></tr>
        </table>`;
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rapport — ${campaign.name}</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 24px; color: #1e293b; }
  </style>
</head>
<body>
  <h1 style="font-size:22px;font-weight:800;margin-bottom:4px;">Rapport — ${campaign.name}</h1>
  <p style="font-size:13px;color:#64748b;margin-bottom:32px;">
    ${campaign.sentAt ? `Envoyee le ${campaign.sentAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}` : "Non envoyee"}
    ${campaign.scheduledAt && !campaign.sentAt ? ` | Programmee le ${campaign.scheduledAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}` : ""}
  </p>

  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px;">
    <div style="background:#f0fdf4;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#16a34a;">${sent}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Envoyes</div>
    </div>
    <div style="background:#eff6ff;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#2563eb;">${openRate}%</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Ouverture</div>
    </div>
    <div style="background:#faf5ff;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#9333ea;">${clickRate}%</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">Clic</div>
    </div>
    <div style="background:#fff7ed;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:28px;font-weight:800;color:#ea580c;">${ctor}%</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px;">CTOR</div>
    </div>
  </div>

  <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;font-size:13px;">
    <tr style="background:#f8fafc;">
      <td style="padding:10px;font-weight:700;border-bottom:1px solid #e2e8f0;">Metrique</td>
      <td style="padding:10px;font-weight:700;text-align:right;border-bottom:1px solid #e2e8f0;">Valeur</td>
    </tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Total emails</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${totalEmails}</td></tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Envoyes</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${sent}</td></tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Erreurs</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;color:${errors > 0 ? "#dc2626" : "inherit"};">${errors}</td></tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Ignores (skip)</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${skipped}</td></tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Ouvertures uniques</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${uniqueOpens} (${openRate}%)</td></tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Clics uniques</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${uniqueClicks} (${clickRate}%)</td></tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">CTOR</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;">${ctor}%</td></tr>
    <tr><td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;">Desinscriptions</td><td style="padding:8px 10px;text-align:right;border-bottom:1px solid #e2e8f0;color:${unsubscribed > 0 ? "#dc2626" : "inherit"};">${unsubscribed}</td></tr>
  </table>

  ${variantHtml}
  ${dripHtml}
  ${errorHtml}
  ${bestHourHtml}

  <p style="font-size:11px;color:#94a3b8;margin-top:40px;text-align:center;border-top:1px solid #e2e8f0;padding-top:16px;">
    Rapport genere par AudiBot — contact@audibot.fr<br>
    Appuyez sur Ctrl+P pour exporter en PDF
  </p>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("[campagnes/report]", err);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
