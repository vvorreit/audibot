export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkAdmin, auditLog } from "@/lib/adminAudit";
import { sendMail, smtpConfigured } from "@/lib/mailer";

/** POST — Notifier les utilisateurs affectés par un breach (Art. 34 RGPD) */
export async function POST(req: NextRequest) {
  try {
    await checkAdmin();
    const session = await getServerSession(authOptions);
    const { breachId } = await req.json();

    if (!breachId) {
      return NextResponse.json({ error: "breachId requis" }, { status: 400 });
    }

    const breach = await prisma.breachNotification.findUnique({ where: { id: breachId } });
    if (!breach) {
      return NextResponse.json({ error: "Incident introuvable" }, { status: 404 });
    }

    if (!smtpConfigured()) {
      return NextResponse.json({ error: "RESEND_API_KEY non configuré" }, { status: 500 });
    }

    const users = await prisma.user.findMany({
      where: { email: { not: null } },
      select: { email: true },
      take: 10000,
    });

    const emails = users.map((u: { email: string | null }) => u.email).filter(Boolean) as string[];
    let sent = 0;

    /* Envoi par batch de 10 pour ne pas surcharger Resend */
    for (let i = 0; i < emails.length; i += 10) {
      const batch = emails.slice(i, i + 10);
      const promises = batch.map((email) =>
        sendMail({
          to: email,
          subject: `[AudiBot] Notification de sécurité — ${breach.title}`,
          html: buildBreachEmail(breach),
        }).catch((err) => console.error(`[Breach] Failed to notify ${email}:`, err))
      );
      await Promise.all(promises);
      sent += batch.length;
    }

    await prisma.breachNotification.update({
      where: { id: breachId },
      data: { usersNotifiedAt: new Date(), status: "notified_users", affectedUsers: sent },
    });

    await auditLog({
      userId: (session?.user as { id?: string })?.id ?? "unknown",
      action: "breach.notify_users",
      target: breachId,
      meta: { sent },
      req,
    });

    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

function buildBreachEmail(breach: { title: string; description: string; severity: string; dataCategories: string; remediation: string | null }): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
      <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h1 style="color: #991B1B; font-size: 20px; margin: 0 0 8px;">Notification de sécurité</h1>
        <p style="color: #DC2626; font-size: 14px; margin: 0;">Conformément à l'article 34 du RGPD, nous vous informons d'un incident de sécurité.</p>
      </div>
      <h2 style="color: #1E293B; font-size: 16px;">${breach.title}</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6;">${breach.description}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px; color: #64748B; font-size: 13px;">Sévérité</td><td style="padding: 8px; font-weight: 600; font-size: 13px;">${breach.severity.toUpperCase()}</td></tr>
        <tr><td style="padding: 8px; color: #64748B; font-size: 13px;">Données concernées</td><td style="padding: 8px; font-weight: 600; font-size: 13px;">${breach.dataCategories}</td></tr>
      </table>
      ${breach.remediation ? `<div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 16px; margin: 16px 0;"><p style="color: #166534; font-size: 13px; margin: 0;"><strong>Mesures prises :</strong> ${breach.remediation}</p></div>` : ""}
      <p style="color: #64748B; font-size: 12px; margin-top: 24px;">
        Pour toute question, contactez notre DPO : <a href="mailto:contact@audibot.fr" style="color: #2563EB;">contact@audibot.fr</a><br>
        Vous pouvez également contacter la CNIL : <a href="https://www.cnil.fr/plaintes" style="color: #2563EB;">www.cnil.fr</a>
      </p>
    </div>
  `;
}
