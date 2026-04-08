"use server";

import { headers } from "next/headers";
import { getTransporter } from "@/lib/mailer";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(str: string) {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function raw(formData: FormData, key: string, maxLen = 500): string {
  return ((formData.get(key) as string) ?? "").trim().slice(0, maxLen);
}

export async function sendFranchiseEmail(formData: FormData) {
  /* Rate limit : 2 demandes franchise par heure par IP */
  const reqHeaders = await headers();
  const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimit(`franchise:${ip}`, 2, 60 * 60_000);
  if (!allowed) {
    return { success: false };
  }

  const nameRaw       = raw(formData, "name", 100);
  const emailRaw      = raw(formData, "email", 254);
  const phoneRaw      = raw(formData, "phone", 20);
  const companyRaw    = raw(formData, "company", 200);
  const storesRaw     = raw(formData, "stores", 50);
  const seatsRaw      = raw(formData, "seats", 50);
  const erpRaw        = raw(formData, "erp", 200);
  const messageRaw    = raw(formData, "message", 2000);
  const reseauRaw     = raw(formData, "reseau", 200);
  /* nbMagasins mirrors stores (the select value) */
  const nbMagasinsRaw = storesRaw;

  if (!nameRaw || !companyRaw || !storesRaw) return { success: false };
  if (!emailRaw || !EMAIL_REGEX.test(emailRaw)) return { success: false };
  if (!phoneRaw || phoneRaw.length < 8) return { success: false };

  const name       = esc(nameRaw);
  const email      = esc(emailRaw);
  const phone      = esc(phoneRaw);
  const company    = esc(companyRaw);
  const stores     = esc(storesRaw);
  const seats      = esc(seatsRaw);
  const erp        = esc(erpRaw);
  const message    = esc(messageRaw);
  const reseau     = esc(reseauRaw);
  const nbMagasins = esc(nbMagasinsRaw);

  /* Sauvegarde en DB pour suivi CRM */
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).franchiseLead.create({
      data: {
        name: nameRaw,
        email: emailRaw,
        phone: phoneRaw,
        company: companyRaw,
        stores: storesRaw,
        seats: seatsRaw || null,
        erp: erpRaw || null,
        message: messageRaw || null,
        reseau: reseauRaw || null,
        nbMagasins: nbMagasinsRaw || null,
        status: "NEW",
      },
    });
  } catch (err) {
    console.error("[franchise] Erreur sauvegarde lead:", err);
    /* On continue — l'email reste la source de vérité */
  }

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0f172a;padding:24px 32px;border-radius:16px 16px 0 0">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:36px;height:36px;background:#2563eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:18px">O</div>
          <span style="color:white;font-weight:900;font-size:18px;letter-spacing:-0.5px">AudiBot — Demande Franchise</span>
        </div>
      </div>
      <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px">
        <span style="display:inline-block;background:#2563eb;color:white;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;padding:4px 12px;border-radius:999px;margin-bottom:20px">Franchise — ${stores} magasins</span>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600;width:160px">Contact</td><td style="padding:8px 0;font-weight:700">${name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600">Téléphone</td><td style="padding:8px 0">${phone}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600">Enseigne</td><td style="padding:8px 0;font-weight:700">${company}</td></tr>
          ${reseau ? `<tr><td style="padding:8px 0;color:#64748b;font-weight:600">Réseau</td><td style="padding:8px 0">${reseau}</td></tr>` : ""}
          <tr><td style="padding:8px 0;color:#64748b;font-weight:600">Magasins (tranche)</td><td style="padding:8px 0">${stores}</td></tr>
          ${nbMagasins ? `<tr><td style="padding:8px 0;color:#64748b;font-weight:600">Nb magasins</td><td style="padding:8px 0">${nbMagasins}</td></tr>` : ""}
          ${seats ? `<tr><td style="padding:8px 0;color:#64748b;font-weight:600">Postes estimés</td><td style="padding:8px 0">${seats}</td></tr>` : ""}
          ${erp ? `<tr><td style="padding:8px 0;color:#64748b;font-weight:600">ERP utilisé(s)</td><td style="padding:8px 0">${erp}</td></tr>` : ""}
        </table>
        ${message ? `
        <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px 20px;border-radius:0 8px 8px 0">
          <p style="margin:0;font-size:12px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Message</p>
          <p style="margin:0;color:#1e293b;line-height:1.6;white-space:pre-wrap">${message}</p>
        </div>` : ""}
      </div>
    </div>
  `;

  try {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to: "contact@audibot.fr",
      replyTo: email,
      subject: `[Franchise] ${company} — ${stores} magasins — ${name}`,
      html,
    });
  } catch (err) {
    console.error(err);
    return { success: false };
  }

  /* Email de confirmation best-effort à l'auteur */
  try {
    const confirmHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#0f172a;padding:24px 32px;border-radius:16px 16px 0 0">
          <span style="color:white;font-weight:900;font-size:18px;letter-spacing:-0.5px">AudiBot</span>
        </div>
        <div style="background:white;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px">
          <p style="color:#1e293b;font-size:16px;line-height:1.7;margin:0">
            Merci ${name}, votre demande pour ${company} a été reçue.<br/>
            Notre équipe vous contacte sous 24h.
          </p>
        </div>
      </div>
    `;
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to: emailRaw,
      subject: "AudiBot — Votre demande a bien été reçue",
      html: confirmHtml,
    });
  } catch (err) {
    console.error("[franchise] Erreur email confirmation:", err);
    /* best-effort — ne pas faire échouer la réponse */
  }

  return { success: true };
}
