"use server";
import { checkAdmin } from "@/lib/adminAudit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail, smtpConfigured } from "@/lib/mailer";
import { getBrand } from "@/lib/brand";
import { prisma } from "@/lib/db";
import { EMAIL_CATALOG } from "./email-catalog";
export type { EmailId } from "./email-catalog";

function emailWrapper(brand: ReturnType<typeof getBrand>, content: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;background:#f8fafc;">
<div style="background:#fff;border-radius:16px;padding:32px;border:1px solid #e2e8f0;">
<p style="font-size:12px;font-weight:800;color:${brand.colors.primary};margin:0 0 24px 0;letter-spacing:0.1em;text-transform:uppercase;">${brand.name}</p>
${content}
<hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
<p style="font-size:11px;color:#94a3b8;margin:0;">${brand.name} — ${brand.supportEmail}</p>
</div></body></html>`;
}

function btn(color: string, url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;margin:20px 0;padding:12px 28px;background:${color};color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">${label}</a>`;
}

export async function getEmailPreview(type: string): Promise<{ subject: string; html: string }> {
  await checkAdmin();
  const brand = getBrand();
  const appUrl = brand.appUrl;
  const primary = brand.colors.primary;

  switch (type) {
    case "welcome":
      return {
        subject: `Bienvenue sur ${brand.name}`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Bonjour Jean, votre compte ${brand.name} est prêt.</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Vous allez économiser jusqu'à 1h30 de saisie par jour grâce au remplissage automatique.</p>
          ${btn(primary, appUrl + "/dashboard", "Accéder à mon tableau de bord")}
          <p style="font-size:12px;color:#94a3b8;">Essai gratuit — aucune carte bancaire requise.</p>
        `),
      };
    case "onboarding-j1":
      return {
        subject: `${brand.name} — installez l'extension pour commencer`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Vous n'avez pas encore installé l'extension 🔌</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">L'extension Chrome permet le remplissage automatique des portails mutuelles. Installation en 2 minutes.</p>
          ${btn(primary, appUrl + "/extension", "Installer l'extension")}
        `),
      };
    case "onboarding-j3":
      return {
        subject: `${brand.name} — avez-vous essayé le scan automatique ?`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Avez-vous essayé le scan automatique ?</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Photographiez une carte mutuelle ou une prescription audiologique — ${brand.name} remplit le formulaire en 3 secondes.</p>
          ${btn(primary, appUrl + "/dashboard", "Essayer maintenant")}
        `),
      };
    case "nps":
      return {
        subject: `Comment se passe votre expérience avec ${brand.name} ?`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Sur 10, recommanderiez-vous ${brand.name} ?</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Votre avis nous aide à améliorer le produit.</p>
          <div style="margin:20px 0;">${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<a href="${appUrl}/api/nps?score=${n}&t=EXEMPLE" style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;background:#f1f5f9;border-radius:8px;text-decoration:none;color:#1e293b;font-weight:700;font-size:13px;margin:2px;">${n}</a>`).join("")}</div>
        `),
      };
    case "scan-limit-warning":
      return {
        subject: `${brand.name} — vous approchez de votre limite mensuelle`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Vous approchez de votre limite mensuelle ⚠️</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Vous avez utilisé <strong>64 scans sur 80</strong> ce mois-ci (plan Essentiel).</p>
          <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:16px 0;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:13px;font-weight:700;color:#92400e;">Utilisation mensuelle</span>
              <span style="font-size:13px;font-weight:800;color:#92400e;">64 / 80</span>
            </div>
            <div style="background:#fde68a;border-radius:8px;height:8px;">
              <div style="background:#d97706;border-radius:8px;height:8px;width:80%;"></div>
            </div>
          </div>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Passez au plan <strong>Pro</strong> pour des scans illimités et ne jamais être bloqué en pleine journée de travail.</p>
          ${btn("#2563eb", appUrl + "/dashboard?upgrade=1", "Passer au plan Pro — illimité")}
          <p style="font-size:12px;color:#94a3b8;">Votre quota se renouvelle le 1er du mois.</p>
        `),
      };
    case "relance-tp":
      return {
        subject: "Relance — Dossier TP-2026-0001",
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Relance — Dossier TP-2026-0001</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Madame, Monsieur,<br>Nous vous contactons au sujet du dossier <strong>TP-2026-0001</strong> d'un montant de <strong>385,00 €</strong> envoyé le <strong>01/02/2026</strong>.</p>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Nous vous remercions de bien vouloir traiter ce dossier dans les meilleurs délais.</p>
          <p style="font-size:14px;color:#475569;">Cordialement,<br><strong>Dr. Jean Dupont</strong></p>
        `),
      };
    case "alerte-expiration":
      return {
        subject: `${brand.name} — Prescription audiologique expire dans 30 jours`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Prescription audiologique expire dans 30 jours ⚠️</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">La prescription audiologique du patient <strong>Marie Dupont</strong> expire le <strong>25/04/2026</strong>.</p>
          ${btn(primary, appUrl + "/tiers-payant/alertes", "Voir les alertes")}
        `),
      };
    case "rappel-patient":
      return {
        subject: "Rappel — Votre renouvellement",
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Rappel — votre renouvellement</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Bonjour Marie,<br>Votre prescription audiologique arrive bientôt à expiration. Contactez notre cabinet pour prendre rendez-vous.</p>
          <p style="font-size:14px;color:#475569;">Téléphone : 01 23 45 67 89</p>
        `),
      };
    case "webhook-stripe-failed":
      return {
        subject: "[ALERTE] Webhook Stripe échoué",
        html: `<!DOCTYPE html><html><body style="font-family:monospace;padding:20px;background:#fef2f2;color:#7f1d1d;"><h2 style="margin:0 0 16px 0;">[ALERTE] Webhook Stripe échoué</h2><p>Erreur détectée dans le traitement du webhook Stripe.</p><p>Timestamp: ${new Date().toISOString()}</p><p style="background:#fee2e2;padding:12px;border-radius:8px;">Vérifier immédiatement : docker logs audibot-app --tail 50</p></body></html>`,
      };
    case "verify-email":
      return {
        subject: `Vérifiez votre adresse email — ${brand.name}`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Vérifiez votre adresse email</h1>
          <p style="font-size:14px;line-height:1.6;color:#475569;">Cliquez ci-dessous pour confirmer votre adresse email.</p>
          ${btn(primary, appUrl + "/api/auth/verify-email?token=EXEMPLE_TOKEN", "Vérifier mon email")}
          <p style="font-size:12px;color:#94a3b8;">Lien valide 24h.</p>
        `),
      };
    case "smart-fill-stats":
      return {
        subject: `Vos stats Smart Fill cette semaine — ${brand.name}`,
        html: emailWrapper(brand, `
          <h1 style="font-size:20px;font-weight:800;margin:0 0 12px 0;">Vos stats de la semaine</h1>
          <div style="display:flex;gap:12px;margin:20px 0;">
            <div style="flex:1;background:#eff6ff;border-radius:12px;padding:16px;text-align:center;">
              <p style="font-size:28px;font-weight:800;color:${primary};margin:0;">47</p>
              <p style="font-size:12px;color:#64748b;margin:4px 0 0 0;">Remplissages</p>
            </div>
            <div style="flex:1;background:#f0fdf4;border-radius:12px;padding:16px;text-align:center;">
              <p style="font-size:28px;font-weight:800;color:#16a34a;margin:0;">2h20</p>
              <p style="font-size:12px;color:#64748b;margin:4px 0 0 0;">Temps économisé</p>
            </div>
          </div>
          ${btn(primary, appUrl + "/dashboard", "Voir mon dashboard")}
        `),
      };
    default:
      throw new Error("Type email inconnu: " + type);
  }
}

export async function sendTestEmail(type: string): Promise<{ ok: boolean; to: string }> {
  await checkAdmin();
  const session = await getServerSession(authOptions);
  const to = session!.user!.email!;
  const preview = await getEmailPreview(type);
  await sendMail({ to, subject: `[TEST] ${preview.subject}`, html: preview.html });
  return { ok: true, to };
}

export async function getSmtpStatus() {
  await checkAdmin();
  return { configured: smtpConfigured() };
}

export async function getEmailTemplate(emailId: string): Promise<{ subject: string; html: string; isCustom: boolean }> {
  await checkAdmin();
  const saved = await prisma.emailTemplate.findUnique({ where: { emailId } });
  if (saved) return { subject: saved.subject, html: saved.html, isCustom: true };
  const preview = await getEmailPreview(emailId);
  return { ...preview, isCustom: false };
}

export async function saveEmailTemplate(emailId: string, subject: string, html: string): Promise<{ ok: boolean }> {
  await checkAdmin();
  const session = await getServerSession(authOptions);
  await prisma.emailTemplate.upsert({
    where: { emailId },
    update: { subject, html, updatedBy: session?.user?.email ?? null },
    create: { emailId, subject, html, updatedBy: session?.user?.email ?? null },
  });
  return { ok: true };
}

export async function resetEmailTemplate(emailId: string): Promise<{ ok: boolean }> {
  await checkAdmin();
  await prisma.emailTemplate.deleteMany({ where: { emailId } });
  return { ok: true };
}
