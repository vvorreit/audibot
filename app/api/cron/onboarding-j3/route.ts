export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 73 * 60 * 60 * 1000);
  const to = new Date(now.getTime() - 71 * 60 * 60 * 1000);

  const users = await prisma.user.findMany({
    where: {
      createdAt: { gte: from, lte: to },
      clientCount: 0,
      emailVerified: { not: null },
    },
    select: { email: true, name: true },
    take: 50,
  });

  let sent = 0;
  for (const user of users) {
    if (!user.email) continue;
    try {
      await sendMail({
        to: user.email,
        subject: "AudiBot — avez-vous testé le bot ?",
        html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 16px;color:#1e293b;">
  <h1 style="font-size:20px;font-weight:800;margin-bottom:8px;">Bonjour${user.name ? ` ${user.name}` : ""} !</h1>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Vous avez créé votre compte AudiBot il y a 3 jours, mais vous n'avez pas encore scanné de document.
  </p>
  <p style="font-size:14px;line-height:1.6;color:#475569;">
    Nos utilisateurs économisent en moyenne <strong>1h30 par jour</strong> grâce au remplissage automatique de leurs dossiers audioprothèse.
    Testez avec votre première carte mutuelle ou prescription ORL !
  </p>
  <a href="${process.env.NEXTAUTH_URL}/dashboard"
     style="display:inline-block;margin:24px 0;padding:12px 28px;background:#4f46e5;color:#fff;font-size:14px;font-weight:700;border-radius:12px;text-decoration:none;">
    Accéder au tableau de bord
  </a>
  <p style="font-size:13px;color:#94a3b8;margin-top:16px;">
    Vous n'avez pas encore l'extension ?
    <a href="${process.env.NEXTAUTH_URL}/extension" style="color:#4f46e5;text-decoration:underline;">Installez-la ici</a>.
  </p>
  <p style="font-size:11px;color:#cbd5e1;margin-top:32px;">
    AudiBot — contact@audibot.fr
  </p>
</body></html>`,
      });
      sent++;
    } catch (err) {
      console.error(`[cron/onboarding-j3] Erreur pour ${user.email}:`, err);
    }
  }

  return NextResponse.json({ sent, total: users.length });
}
