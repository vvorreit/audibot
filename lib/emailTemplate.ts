const BASE_URL = process.env.NEXTAUTH_URL || "https://audibot.fr";

/**
 * Wrapper HTML commun pour tous les emails transactionnels AudiBot.
 * Inclut header avec logo, footer avec désinscription.
 */
export function emailWrapper({
  content,
  unsubscribeEmail,
}: {
  content: string;
  unsubscribeEmail?: string;
}): string {
  const unsubLink = unsubscribeEmail
    ? `<p style="font-size:11px;color:#94a3b8;margin-top:24px;text-align:center;">
        <a href="${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}" style="color:#94a3b8;text-decoration:underline;">Se désabonner</a>
        &nbsp;·&nbsp;
        <a href="mailto:contact@audibot.fr" style="color:#94a3b8;text-decoration:underline;">Contact</a>
      </p>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header logo -->
        <tr>
          <td style="padding:0 0 24px 0;text-align:center;">
            <a href="${BASE_URL}" style="text-decoration:none;">
              <span style="display:inline-flex;align-items:center;gap:10px;">
                <span style="display:inline-block;width:36px;height:36px;background:linear-gradient(135deg,#2563eb,#6366f1);border-radius:10px;text-align:center;line-height:36px;color:white;font-weight:800;font-size:18px;">O</span>
                <span style="font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">AudiBot</span>
              </span>
            </a>
          </td>
        </tr>

        <!-- Card principale -->
        <tr>
          <td style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 0 0 0;text-align:center;">
            <p style="font-size:11px;color:#94a3b8;margin:0;">
              AudiBot — L&apos;assistant robotisé des opticiens<br>
              <a href="${BASE_URL}" style="color:#94a3b8;text-decoration:underline;">audibot.fr</a>
            </p>
            ${unsubLink}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** CTA principal bleu standard */
export function ctaButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin:24px 0 8px;padding:14px 32px;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;line-height:1;">${text}</a>`;
}

/** Bloc encadré info bleu */
export function infoBox(content: string): string {
  return `<div style="margin:20px 0;padding:16px 20px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:8px;font-size:13px;color:#1e40af;line-height:1.6;">${content}</div>`;
}

/** Texte corps standard */
export function bodyText(text: string): string {
  return `<p style="font-size:14px;line-height:1.7;color:#475569;margin:0 0 16px 0;">${text}</p>`;
}

/** Titre h1 */
export function h1(text: string): string {
  return `<h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0 0 16px 0;line-height:1.3;">${text}</h1>`;
}

/** Petit texte secondaire */
export function smallText(text: string): string {
  return `<p style="font-size:12px;color:#94a3b8;margin:16px 0 0 0;line-height:1.6;">${text}</p>`;
}
