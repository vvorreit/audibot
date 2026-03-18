import { Resend } from "resend";

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

  const from = options.from ?? process.env.SMTP_FROM ?? "AudiBot <contact@audibot.fr>";

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

  console.log("[mailer] Mail envoyé — id:", result.data?.id, "→", options.to);
  return result;
}

export async function sendWelcomeEmail(to: string, name: string) {
  const appUrl = process.env.NEXTAUTH_URL || "https://app.audibot.fr";
  await sendMail({
    to,
    subject: "Bienvenue sur AudiBot",
    html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Bonjour${name ? ` ${name}` : ""}, votre compte AudiBot est pr\u00eat.</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Vous allez \u00e9conomiser jusqu\u2019\u00e0 1h30 de saisie par jour gr\u00e2ce au remplissage automatique de vos dossiers audioproth\u00e8se.
  </p>
  <a href="${appUrl}/dashboard"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Acc\u00e9der \u00e0 mon tableau de bord
  </a>
  <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
    Pas encore l\u2019extension Chrome ?
    <a href="${appUrl}/dashboard" style="color:#4f46e5;text-decoration:underline;">Installez-la ici</a>.
  </p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    Essai gratuit 14 jours \u2014 aucune carte bancaire requise.
  </p>
  <p style="font-size:11px;color:#cbd5e1;">
    AudiBot \u2014 contact@audibot.fr
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
