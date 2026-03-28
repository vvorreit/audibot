export const dynamic = "force-dynamic";

/**
 * Cron franchise-followup — Relance J+2
 * Cible : leads Franchise en statut NEW depuis ~48h, sans réponse (pas CONTACTED)
 * But : envoyer un email de suivi proactif si l'équipe n'a pas encore pris contact
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { safeCompare } from "@/lib/safeCompare";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 50 * 60 * 60 * 1000); // ~48h
  const to   = new Date(now.getTime() - 46 * 60 * 60 * 1000);

  // Leads NEW créés il y a ~48h, jamais contactés
  const leads = await (prisma as unknown as {
    franchiseLead: {
      findMany: (args: object) => Promise<{ id: string; name: string; email: string; company: string; stores: string }[]>
    }
  }).franchiseLead.findMany({
    where: {
      status: "NEW",
      createdAt: { gte: from, lte: to },
    },
    select: { id: true, name: true, email: true, company: true, stores: true },
    take: 20,
  });

  let sent = 0;
  for (const lead of leads) {
    try {
      await sendMail({
        to: lead.email,
        subject: "OptiBot — on prépare votre démo",
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Bonjour ${lead.name},</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Vous avez soumis une demande pour <strong>${lead.company}</strong> (${lead.stores} magasin${parseInt(lead.stores) > 1 ? "s" : ""}).
    Notre équipe prépare votre démonstration personnalisée.
  </p>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Pour accélérer les choses, vous pouvez directement planifier un créneau de 30 min avec nous :
  </p>
  <a href="mailto:contact@optibot.fr?subject=Demo%20OptiBot%20Franchise%20-%20${encodeURIComponent(lead.company)}"
     style="display:inline-block;margin:24px 0;padding:14px 32px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Répondre pour planifier la démo
  </a>
  <p style="font-size:13px;color:#64748b;line-height:1.6;">
    On vous montrera comment OptiBot s'intègre dans votre réseau, les stats agrégées multi-magasins,
    et le déploiement accompagné. <strong>Temps estimé : 30 min.</strong>
  </p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    OptiBot — contact@optibot.fr
  </p>
</body></html>`,
      });
      sent++;
    } catch (err) {
      console.error(`[cron/franchise-followup] Erreur pour ${lead.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: leads.length });
}
