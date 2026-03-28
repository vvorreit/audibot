"use server";

import { headers } from "next/headers";
import { getTransporter } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES_VALIDES = ["suggestion", "incident", "evolution"] as const;

function esc(str: string) {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const TYPE_LABELS: Record<string, string> = {
  suggestion: "Suggestion",
  incident: "Incident / Bug",
  evolution: "Demande d'évolution",
};

export async function sendSupportEmail(formData: FormData) {
  // Rate limit : 3 emails de support par heure par IP
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimit(`support:${ip}`, 3, 60 * 60_000);
  if (!allowed) {
    return { success: false, error: "Trop de requêtes. Réessayez dans une heure." };
  }

  const typeRaw  = ((formData.get("type")    as string) ?? "").trim();
  const nameRaw  = ((formData.get("name")    as string) ?? "").trim();
  const emailRaw = ((formData.get("email")   as string) ?? "").trim();
  const phone    = ((formData.get("phone")   as string) ?? "").trim().slice(0, 20);
  const subject  = ((formData.get("subject") as string) ?? "").trim().slice(0, 200);
  const messageRaw = ((formData.get("message") as string) ?? "").trim();

  // Validation
  if (!TYPES_VALIDES.includes(typeRaw as typeof TYPES_VALIDES[number])) {
    return { success: false, error: "Type invalide." };
  }
  if (!nameRaw || nameRaw.length > 100) return { success: false, error: "Nom invalide." };
  if (!emailRaw || !EMAIL_REGEX.test(emailRaw) || emailRaw.length > 254) {
    return { success: false, error: "Email invalide." };
  }
  if (!messageRaw || messageRaw.length < 10 || messageRaw.length > 5000) {
    return { success: false, error: "Message invalide (10–5000 caractères)." };
  }

  const name    = esc(nameRaw);
  const email   = esc(emailRaw);
  const typeLabel = TYPE_LABELS[typeRaw] ?? typeRaw;
  const typeBadgeColor = typeRaw === "incident" ? "#ef4444" : typeRaw === "evolution" ? "#8b5cf6" : "#2563eb";

  const phoneRow = phone
    ? `<tr><td style="padding:6px 0;color:#64748b;font-weight:600">Téléphone</td><td style="padding:6px 0">${esc(phone)}</td></tr>`
    : "";
  const subjectRow = subject
    ? `<tr><td style="padding:6px 0;color:#64748b;font-weight:600">Objet</td><td style="padding:6px 0">${esc(subject)}</td></tr>`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0f172a;padding:24px 32px;border-radius:16px 16px 0 0">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:#2563eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:18px">O</div>
          <span style="color:white;font-weight:900;font-size:18px;letter-spacing:-0.5px">OptiBot Support</span>
        </div>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px">
        <span style="display:inline-block;background:${typeBadgeColor};color:white;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;padding:4px 12px;border-radius:999px;margin-bottom:20px">${typeLabel}</span>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:6px 0;color:#64748b;font-weight:600;width:140px">Nom</td><td style="padding:6px 0">${name}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-weight:600">Email</td><td style="padding:6px 0"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
          ${phoneRow}
          ${subjectRow}
        </table>
        <div style="background:#f8fafc;border-left:4px solid ${typeBadgeColor};padding:16px 20px;border-radius:0 8px 8px 0">
          <p style="margin:0;color:#1e293b;line-height:1.6;white-space:pre-wrap">${esc(messageRaw)}</p>
        </div>
      </div>
    </div>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to: "contact@optibot.fr",
      replyTo: emailRaw,
      subject: `[${typeLabel}] ${subject || nameRaw}`,
      html,
    });
    return { success: true };
  } catch (err) {
    console.error("[support] Erreur envoi email:", err);
    return { success: false, error: "Erreur serveur. Réessayez." };
  }
}
