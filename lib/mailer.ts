import { Resend } from "resend";
import { getBrand } from "./brand";

// Instanciation lazy — évite le crash au build Docker (pas d'API key disponible)
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const smtpConfigured = () => Boolean(process.env.RESEND_API_KEY);

interface MailOptions {
  from?: string;
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendMail(options: MailOptions) {
  if (!smtpConfigured()) {
    console.error("[mailer] RESEND_API_KEY manquant — mail non envoyé");
    throw new Error("RESEND_API_KEY manquant");
  }

  const brand = getBrand();
  const from = options.from ?? process.env.SMTP_FROM ?? `${brand.name} <${brand.supportEmail}>`;

  const result = await getResend().emails.send({
    from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    ...(options.cc ? { cc: Array.isArray(options.cc) ? options.cc : [options.cc] } : {}),
    ...(options.replyTo ? { reply_to: options.replyTo } : {}),
  });

  if (result.error) {
    console.error("[mailer] Erreur Resend:", JSON.stringify(result.error));
    throw new Error(result.error.message);
  }

  return result;
}

export async function sendWelcomeEmail(to: string, name: string) {
  const brand = getBrand();
  const appUrl = brand.appUrl;
  await sendMail({
    to,
    subject: `Bienvenue sur ${brand.name}`,
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Bonjour${name ? ` ${name}` : ""}, votre compte ${brand.name} est prêt.</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Vous allez économiser jusqu’à 1h30 de saisie par jour grâce au remplissage automatique.
  </p>
  <a href="${appUrl}/dashboard"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:${brand.colors.primary};color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Accéder à mon tableau de bord
  </a>
  <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
    Pas encore l’extension Chrome ?
    <a href="${appUrl}/dashboard" style="color:${brand.colors.primary};text-decoration:underline;">Installez-la ici</a>.
  </p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    Essai gratuit 14 jours — aucune carte bancaire requise.
  </p>
  <p style="font-size:11px;color:#cbd5e1;">
    ${brand.name} — ${brand.supportEmail}
  </p>
</body></html>`,
  });
}

/** Compatibilité avec l'ancien pattern getTransporter().sendMail() */
export function getTransporter() {
  return {
    sendMail: (options: MailOptions) => sendMail(options),
  };
}
