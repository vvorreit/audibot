export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMail, smtpConfigured } from "@/lib/mailer";

const GRACE_PERIOD_DAYS = 30;

/** POST — Demande de suppression avec délai de grâce 30j (RGPD Art. 17) */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const existing = await prisma.deletionRequest.findUnique({ where: { userId } });
  if (existing && !existing.cancelledAt && !existing.executedAt) {
    return NextResponse.json({
      error: "Une demande de suppression est déjà en cours.",
      scheduledAt: existing.scheduledAt,
    }, { status: 409 });
  }

  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + GRACE_PERIOD_DAYS);

  const deletion = await prisma.deletionRequest.upsert({
    where: { userId },
    update: {
      scheduledAt,
      cancelledAt: null,
      executedAt: null,
      confirmedAt: null,
      reason: null,
    },
    create: {
      userId,
      scheduledAt,
    },
  });

  if (smtpConfigured() && session.user.email) {
    try {
      const cancelUrl = `${process.env.NEXTAUTH_URL ?? "https://audibot.fr"}/dashboard/supprimer-compte?cancel=${deletion.confirmToken}`;
      await sendMail({
        to: session.user.email,
        subject: "[AudiBot] Confirmation de suppression de compte",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
            <h1 style="color: #1E293B; font-size: 20px;">Suppression de votre compte AudiBot</h1>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Votre demande de suppression a été enregistrée. Conformément au RGPD (Art. 17),
              votre compte et toutes vos données seront <strong>définitivement supprimés le
              ${scheduledAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</strong>.
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Si vous n'êtes pas à l'origine de cette demande, ou si vous changez d'avis,
              vous pouvez annuler à tout moment pendant les ${GRACE_PERIOD_DAYS} prochains jours :
            </p>
            <a href="${cancelUrl}" style="display: inline-block; padding: 12px 24px; background: #2563EB; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0;">
              Annuler la suppression
            </a>
            <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">
              Contact DPO : contact@audibot.fr
            </p>
          </div>
        `,
      });
    } catch (e) {
      console.error("[DeletionRequest] Email failed:", e);
    }
  }

  return NextResponse.json({
    ok: true,
    scheduledAt: deletion.scheduledAt,
    message: `Suppression programmée le ${scheduledAt.toLocaleDateString("fr-FR")}. Un email de confirmation a été envoyé.`,
  });
}
