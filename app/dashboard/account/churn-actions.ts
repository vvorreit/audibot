"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { getBrand } from "@/lib/brand";

type ChurnReasonType = "too_expensive" | "missing_feature" | "no_longer_needed";

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function getSessionUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Non autorisé.");
  const id = (session.user as { id: string }).id;
  if (!id) throw new Error("Non autorisé.");
  return id;
}

export async function getChurnRetentionOffer(reason: ChurnReasonType): Promise<{
  offer: "free_month" | "feature_request" | "pause" | null;
  eligible: boolean;
  message: string;
}> {
  const userId = await getSessionUserId();

  if (reason === "too_expensive") {
    const existing = await prisma.churnReason.findFirst({
      where: { userId, retentionOffer: "free_month" },
    });
    if (existing) {
      return {
        offer: null,
        eligible: false,
        message: "Vous avez déjà bénéficié d'un mois offert. Souhaitez-vous tout de même résilier ?",
      };
    }
    return {
      offer: "free_month",
      eligible: true,
      message: "On vous offre 1 mois gratuit pour vous laisser le temps de voir la valeur d'AudiBot.",
    };
  }

  if (reason === "missing_feature") {
    return {
      offer: "feature_request",
      eligible: true,
      message: "Dites-nous quelle fonctionnalité vous manque. On la développe peut-être en ce moment !",
    };
  }

  return {
    offer: "pause",
    eligible: true,
    message: "Votre compte reste actif jusqu'à la fin de la période. Vous pourrez revenir quand vous le souhaitez.",
  };
}

export async function submitChurnReason(data: {
  reason: ChurnReasonType;
  comment?: string;
  acceptedOffer: boolean;
  retentionOffer?: string;
}): Promise<{ ok: boolean; retained: boolean; message: string }> {
  const VALID_REASONS: string[] = ["too_expensive", "missing_feature", "no_longer_needed"];
  if (!VALID_REASONS.includes(data.reason)) throw new Error("Raison invalide.");

  const VALID_OFFERS: string[] = ["free_month", "feature_request", "pause"];
  if (data.retentionOffer && !VALID_OFFERS.includes(data.retentionOffer)) throw new Error("Offre invalide.");

  const userId = await getSessionUserId();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, email: true, name: true, stripeCustomerId: true, stripeSubscriptionId: true },
  });
  if (!user) throw new Error("Utilisateur introuvable.");

  const retained = data.acceptedOffer && !!data.retentionOffer;

  const churn = await prisma.churnReason.create({
    data: {
      userId,
      reason: data.reason,
      comment: data.comment || null,
      plan: user.plan,
      retained,
      retentionOffer: retained ? data.retentionOffer : null,
    },
  });

  /* ── Action si offre acceptée ──────────────────────────────────────────── */
  if (retained && data.retentionOffer === "free_month") {
    const base = new Date();
    const newFreeUntil = new Date(base);
    newFreeUntil.setMonth(newFreeUntil.getMonth() + 1);

    await prisma.user.update({
      where: { id: userId },
      data: { freeUntil: newFreeUntil, freeMonthsNote: `Retention churn — raison: ${data.reason}`, isPro: true },
    });

    if (user.stripeCustomerId && user.stripeSubscriptionId) {
      try {
        const { stripe } = await import("@/lib/stripe");
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const monthlyAmount = subscription.items.data[0]?.price?.unit_amount || 0;
        if (monthlyAmount > 0) {
          await stripe.customers.createBalanceTransaction(user.stripeCustomerId, {
            amount: -monthlyAmount,
            currency: "eur",
            description: "1 mois offert — retention churn",
          });
        }
      } catch (e) {
        console.warn("[churn] Stripe credit failed:", e);
      }
    }
  }

  /* ── Résiliation via Stripe portal si non retained ─────────────────────── */
  if (!retained && user.stripeSubscriptionId) {
    try {
      const { stripe } = await import("@/lib/stripe");
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      await prisma.user.update({
        where: { id: userId },
        data: { pendingPlan: `FREE_AT_fin_periode` },
      });
    } catch (e) {
      console.error("[churn] Stripe cancel failed:", e);
    }
  }

  /* ── Email interne ─────────────────────────────────────────────────────── */
  await sendChurnNotificationEmail({
    plan: user.plan,
    reason: data.reason,
    comment: data.comment,
    retained,
    userName: user.name || user.email || "Inconnu",
    userEmail: user.email || "",
    churnId: churn.id,
  });

  if (retained) {
    const msgs: Record<string, string> = {
      free_month: "Super ! 1 mois offert. Votre abonnement continue normalement.",
      feature_request: "Merci pour votre retour ! On prend note et on vous tient au courant.",
    };
    return { ok: true, retained: true, message: msgs[data.retentionOffer!] || "Merci pour votre retour !" };
  }

  return {
    ok: true,
    retained: false,
    message: "Votre résiliation est programmée en fin de période. Vous conservez l'accès jusque-là.",
  };
}

const REASON_LABELS: Record<string, string> = {
  too_expensive: "Trop cher",
  missing_feature: "Fonctionnalité manquante",
  no_longer_needed: "Plus besoin",
};

async function sendChurnNotificationEmail(opts: {
  plan: string;
  reason: string;
  comment?: string;
  retained: boolean;
  userName: string;
  userEmail: string;
  churnId: string;
}) {
  const brand = getBrand();
  const reasonLabel = REASON_LABELS[opts.reason] || opts.reason;

  try {
    await sendMail({
      to: "contact@audibot.fr",
      subject: `[Churn] ${opts.plan} — Raison : ${reasonLabel} — Retained : ${opts.retained ? "oui" : "non"}`,
      html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:18px;font-weight:800;color:#dc2626;margin-bottom:16px;">[Churn] ${opts.retained ? "Retenu" : "Perdu"}</h1>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:8px 0;font-weight:700;color:#64748b;width:140px;">Utilisateur</td><td>${escapeHtml(opts.userName)} (${escapeHtml(opts.userEmail)})</td></tr>
    <tr><td style="padding:8px 0;font-weight:700;color:#64748b;">Plan</td><td><strong>${escapeHtml(opts.plan)}</strong></td></tr>
    <tr><td style="padding:8px 0;font-weight:700;color:#64748b;">Raison</td><td>${escapeHtml(reasonLabel)}</td></tr>
    ${opts.comment ? `<tr><td style="padding:8px 0;font-weight:700;color:#64748b;">Commentaire</td><td>${escapeHtml(opts.comment)}</td></tr>` : ""}
    <tr><td style="padding:8px 0;font-weight:700;color:#64748b;">Retained</td><td style="font-weight:700;color:${opts.retained ? "#16a34a" : "#dc2626"};">${opts.retained ? "Oui" : "Non"}</td></tr>
  </table>
  <p style="font-size:12px;color:#94a3b8;margin-top:24px;">ID: ${opts.churnId} — ${brand.name}</p>
</body></html>`,
    });
  } catch (e) {
    console.error("[churn] Email notification failed:", e);
  }
}
