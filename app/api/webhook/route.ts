export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { sendMail, smtpConfigured } from "@/lib/mailer";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is missing");
    }
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook signature verification failed:", errMsg);
    if (process.env.SENTRY_DSN) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(error);
    }
    return new NextResponse(`Webhook Error: ${errMsg}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      const metadata = session.metadata || {};

      const plan = (metadata.plan as string) || "ESSENTIEL";
      // Normaliser : CABINET et RESEAU sont des plans d'équipe → isPro: true
      const isTeamPlan = ["CABINET", "RESEAU", "EQUIPE"].includes(plan);

      // 1. Abonnement ÉQUIPE
      if (metadata.teamId) {
        const team = await prisma.team.update({
          where: { id: metadata.teamId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            plan: "EQUIPE",
          },
          select: { ownerId: true },
        });

        // Mettre à jour le plan du owner aussi
        await prisma.user.update({
          where: { id: team.ownerId },
          data: { plan: "EQUIPE", isPro: true },
        });

        // Email confirmation team
        try {
          if (smtpConfigured()) {
            const teamOwner = await prisma.user.findFirst({
              where: { id: team.ownerId },
              select: { email: true, name: true },
            });
            if (teamOwner?.email) {
              const appUrl = process.env.NEXTAUTH_URL || "https://app.audibot.fr";
              await sendMail({
                to: teamOwner.email,
                subject: "Votre abonnement équipe AudiBot est actif",
                html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Merci${teamOwner.name ? ` ${teamOwner.name}` : ""} !</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Votre abonnement équipe AudiBot <strong>${plan}</strong> est désormais actif. Toute votre équipe bénéficie d'un accès illimité.
  </p>
  <a href="${appUrl}/dashboard"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Accéder au tableau de bord
  </a>
  <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
    Une question ? Contactez-nous à <a href="mailto:contact@audibot.fr" style="color:#2563eb;">contact@audibot.fr</a>.
  </p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    AudiBot — contact@audibot.fr
  </p>
</body></html>`,
              });
            }
          }
        } catch (emailErr) {
          console.error("[webhook] Erreur envoi email team post-paiement:", emailErr);
        }
      }
      // 2. Abonnement PERSO (ESSENTIEL, PRO) ou équipe sans teamId explicite (CABINET/RESEAU auto-créé)
      else if (metadata.userId) {
        await prisma.user.update({
          where: { id: metadata.userId },
          data: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            isPro: true,
            plan,
            // Pour CABINET / RESEAU sans team préexistante : le owner est l'utilisateur lui-même
            ...(isTeamPlan && !metadata.teamId ? { teamRole: "OWNER" } : {}),
          },
        });
        // Email de confirmation post-paiement
        try {
          if (smtpConfigured()) {
            const paidUser = await prisma.user.findUnique({
              where: { id: metadata.userId },
              select: { email: true, name: true },
            });
            if (paidUser?.email) {
              const appUrl = process.env.NEXTAUTH_URL || "https://app.audibot.fr";
              await sendMail({
                to: paidUser.email,
                subject: "Votre abonnement AudiBot est actif",
                html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Merci${paidUser.name ? ` ${paidUser.name}` : ""} !</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Votre abonnement AudiBot <strong>${plan}</strong> est d\u00e9sormais actif. Vous b\u00e9n\u00e9ficiez d\u2019un acc\u00e8s illimit\u00e9.
  </p>
  <a href="${appUrl}/dashboard"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Acc\u00e9der au tableau de bord
  </a>
  <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
    Une question ? Contactez-nous \u00e0 <a href="mailto:contact@audibot.fr" style="color:#2563eb;">contact@audibot.fr</a>.
  </p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    AudiBot \u2014 contact@audibot.fr
  </p>
</body></html>`,
              });
            }
          }
        } catch (emailErr) {
          console.error("[webhook] Erreur envoi email post-paiement:", emailErr);
        }
      } else {
        console.warn("checkout.session.completed sans metadata teamId/userId", session.id);
      }
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscriptionId = (invoice as any).subscription as string;
      // Log uniquement — on ne rétrograde pas immédiatement (Stripe retente 3 fois)
      console.warn(`Paiement échoué pour subscription ${subscriptionId}. Tentative ${invoice.attempt_count}`);
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;

      // Abonnement ÉQUIPE annulé
      const team = await prisma.team.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
      if (team) {
        await prisma.team.update({
          where: { id: team.id },
          data: { plan: "FREE", stripeSubscriptionId: null },
        });
        // Rétrograder le owner
        await prisma.user.update({
          where: { id: team.ownerId },
          data: { plan: "FREE", isPro: false, pendingPlan: null, stripeSubscriptionId: null },
        });
        // Expulser tous les membres (sauf le owner)
        const members = await prisma.user.findMany({
          where: { teamId: team.id, id: { not: team.ownerId } },
          select: { id: true, email: true, name: true },
        });
        if (members.length > 0) {
          await prisma.user.updateMany({
            where: { teamId: team.id, id: { not: team.ownerId } },
            data: { teamId: null, teamRole: "MEMBER" },
          });
          if (smtpConfigured()) {
            for (const member of members) {
              if (!member.email) continue;
              try {
                await sendMail({
                  to: member.email,
                  subject: "Votre accès équipe AudiBot a pris fin",
                  html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Votre accès équipe a pris fin</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Bonjour${member.name ? ` ${member.name}` : ""},<br><br>
    L'abonnement équipe AudiBot a été résilié. Votre accès via l'équipe n'est plus actif.
  </p>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Pour continuer à utiliser AudiBot, vous pouvez souscrire à votre propre abonnement.
  </p>
  <a href="${process.env.NEXTAUTH_URL ?? "https://audibot.fr"}/dashboard"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Voir les abonnements
  </a>
  <p style="font-size:13px;color:#94a3b8;margin-top:16px;">Une question ? <a href="mailto:contact@audibot.fr" style="color:#2563eb;">contact@audibot.fr</a></p>
</body></html>`,
                });
              } catch (emailErr) {
                console.error("[webhook] Erreur email expulsion membre annulation:", emailErr);
              }
            }
          }
        }
      } else {
        // Abonnement PERSO annulé
        const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { isPro: false, plan: "FREE", pendingPlan: null, stripeSubscriptionId: null },
          });
        } else {
          console.warn(`customer.subscription.deleted : aucun team/user trouvé pour ${subscriptionId}`);
        }
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const subscriptionId = subscription.id;
      const isActive = subscription.status === "active" || subscription.status === "trialing";

      // Annulation programmée en fin de période (cancel_at_period_end)
      // → on stocke l'info pour l'afficher dans l'UI, mais on ne rétrograde pas encore
      if (subscription.cancel_at_period_end) {
        const cancelDate = subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000).toLocaleDateString("fr-FR")
          : null;
        // Stocker dans pendingPlan = "FREE" pour afficher le badge dans Mon compte
        const teamCancel = await prisma.team.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
        if (teamCancel) {
          await prisma.user.update({
            where: { id: teamCancel.ownerId },
            data: { pendingPlan: `FREE_AT_${cancelDate ?? "fin_periode"}` },
          });
        } else {
          const userCancel = await prisma.user.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
          if (userCancel) {
            await prisma.user.update({
              where: { id: userCancel.id },
              data: { pendingPlan: `FREE_AT_${cancelDate ?? "fin_periode"}` },
            });
          }
        }
        // Le vrai rétrogradage se fera via customer.subscription.deleted à la fin du cycle
        return new NextResponse(null, { status: 200 });
      }

      // Détecter le plan réel depuis le price Stripe
      const priceId = subscription.items.data[0]?.price?.id;
      const priceToplan: Record<string, string> = {
        [process.env.STRIPE_PRICE_ESSENTIEL ?? ""]: "ESSENTIEL",
        [process.env.STRIPE_PRICE_ESSENTIEL_ANNUAL ?? ""]: "ESSENTIEL",
        [process.env.STRIPE_PRICE_PRO ?? ""]: "PRO",
        [process.env.STRIPE_PRICE_PRO_ANNUAL ?? ""]: "PRO",
        [process.env.STRIPE_PRICE_CABINET ?? ""]: "CABINET",
        [process.env.STRIPE_PRICE_CABINET_ANNUAL ?? ""]: "CABINET",
        [process.env.STRIPE_PRICE_RESEAU ?? ""]: "RESEAU",
        [process.env.STRIPE_PRICE_RESEAU_ANNUAL ?? ""]: "RESEAU",
        [process.env.STRIPE_PRICE_EQUIPE ?? ""]: "EQUIPE",
        [process.env.STRIPE_PRICE_EQUIPE_ANNUAL ?? ""]: "EQUIPE",
      };
      const newPlan = priceId ? (priceToplan[priceId] ?? null) : null;

      // Abonnement ÉQUIPE
      const team = await prisma.team.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
      if (team) {
        const oldPlan = team.plan;
        const effectivePlan = isActive ? (newPlan ?? "EQUIPE") : "FREE";
        await prisma.team.update({
          where: { id: team.id },
          data: { plan: effectivePlan },
        });
        // Mettre à jour le owner
        await prisma.user.update({
          where: { id: team.ownerId },
          data: { plan: effectivePlan, isPro: isActive, pendingPlan: null },
        });

        // Si downgrade depuis ÉQUIPE → expulser les membres (pas le owner)
        if (oldPlan === "EQUIPE" && effectivePlan !== "EQUIPE") {
          const members = await prisma.user.findMany({
            where: { teamId: team.id, id: { not: team.ownerId } },
            select: { id: true, email: true, name: true },
          });
          if (members.length > 0) {
            // Détacher les membres de l'équipe
            await prisma.user.updateMany({
              where: { teamId: team.id, id: { not: team.ownerId } },
              data: { teamId: null, teamRole: "MEMBER" },
            });
            // Notifier chaque membre par email
            if (smtpConfigured()) {
              for (const member of members) {
                if (!member.email) continue;
                try {
                  await sendMail({
                    to: member.email,
                    subject: "Votre accès équipe AudiBot a pris fin",
                    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Votre accès équipe a pris fin</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Bonjour${member.name ? ` ${member.name}` : ""},<br><br>
    L'abonnement équipe AudiBot auquel vous étiez rattaché a été modifié. Votre accès via l'équipe n'est plus actif.
  </p>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Pour continuer à utiliser AudiBot, vous pouvez souscrire à votre propre abonnement.
  </p>
  <a href="${process.env.NEXTAUTH_URL ?? "https://audibot.fr"}/dashboard"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Voir les abonnements
  </a>
  <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
    Une question ? <a href="mailto:contact@audibot.fr" style="color:#2563eb;">contact@audibot.fr</a>
  </p>
</body></html>`,
                  });
                } catch (emailErr) {
                  console.error("[webhook] Erreur email expulsion membre:", emailErr);
                }
              }
            }
          }
        }
      } else {
        // Abonnement PERSO
        const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: subscriptionId } });
        if (user) {
          const effectivePlan = isActive ? (newPlan ?? user.plan) : "FREE";
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPro: isActive && effectivePlan !== "FREE" && effectivePlan !== "ESSENTIEL" ? true : (isActive && effectivePlan === "ESSENTIEL" ? true : false),
              plan: effectivePlan,
              pendingPlan: null,
            },
          });
        }
      }
    }
  } catch (err) {
    console.error(`Erreur traitement webhook ${event.type}:`, err);
    if (process.env.SENTRY_DSN) {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureException(err);
    }
    // Alerte critique — webhook Stripe échoué
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "alerts@audibot.fr",
        to: "contact@audibot.fr",
        subject: "[ALERTE] Webhook Stripe échoué",
        text: "Erreur webhook Stripe: " + String(err) + "\n\nTimestamp: " + new Date().toISOString(),
      });
    } catch (_) {
      // silently ignore alert failure
    }
    // Retourner 500 pour que Stripe retente
    return new NextResponse("Webhook processing error", { status: 500 });
  }

  return new NextResponse(null, { status: 200 });
}
