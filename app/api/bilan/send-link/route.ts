export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserFeatures } from "@/lib/userFeatures";
import { sendMail } from "@/lib/mailer";
import { emailWrapper, ctaButton, bodyText, h1, smallText } from "@/lib/emailTemplate";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    const features = await getUserFeatures(session.user.id);
    if (!features.bilanAuditif) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
  }

  const { z } = await import("zod");
  const schema = z.object({
    clientEmail: z.string().email("Email invalide"),
    clientPhone: z.string().max(20).optional(),
    clientName: z.string().max(100).optional(),
  });
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const body = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, shopToken: true, teamId: true },
  });
  if (!user?.shopToken) {
    return NextResponse.json({ error: "shopToken manquant" }, { status: 400 });
  }

  const bilanSession = await prisma.bilanSession.create({
    data: {
      userId: user.id,
      teamId: user.teamId ?? undefined,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      source: "email",
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone ?? null,
      sentAt: new Date(),
    },
  });

  const link = `https://audibot.fr/bilan?shop=${user.shopToken}&session=${bilanSession.id}`;

  // Envoyer l'email via Resend
  try {
    const html = emailWrapper({
      content: [
        h1("Votre bilan auditif est prêt"),
        bodyText(
          body.clientName
            ? `Bonjour ${body.clientName}, votre opticien vous invite à compléter votre bilan auditif avant votre visite.`
            : "Votre opticien vous invite à compléter votre bilan auditif avant votre visite."
        ),
        bodyText("Répondez en 3 minutes depuis votre téléphone ou ordinateur."),
        `<div style="text-align:center;">${ctaButton("Démarrer mon bilan", link)}</div>`,
        smallText(`<a href="${link}" style="color:#94a3b8;word-break:break-all;">${link}</a>`),
        smallText("Ce lien expire dans 7 jours."),
      ].join(""),
    });

    await sendMail({
      from: "Votre opticien <bilan@audibot.fr>",
      to: body.clientEmail,
      subject: "Votre bilan auditif est prêt — répondez en 3 min",
      html,
    });
  } catch (e) {
    console.error("[send-link] Erreur envoi email:", e);
    // On retourne quand même le lien pour copie manuelle
  }

  return NextResponse.json({
    ok: true,
    link,
    sessionId: bilanSession.id,
  });
}
