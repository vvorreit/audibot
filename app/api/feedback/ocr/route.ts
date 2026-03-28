export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMail, smtpConfigured } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    // 5 feedbacks par heure par utilisateur
    const allowed = await rateLimit(`ocr-feedback:${session.user.email}`, 5, 60 * 60_000);
    if (!allowed) {
      return NextResponse.json({ ok: false, error: "Trop de feedbacks. Réessayez dans une heure." }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    const body = await req.json();
    // rawText et parsedData délibérément ignorés — zéro donnée santé côté serveur (RGPD Art.5)
    const { type, message, fileName } = body;

    if (!type || !message) {
      return NextResponse.json({ ok: false, error: "Champs manquants" }, { status: 400 });
    }

    await prisma.ocrFeedback.create({
      data: {
        userId: user.id,
        type,
        message,
        fileName: fileName || null,
        // rawText non stocké — principe Privacy by Design
      },
    });

    // Alerte email best-effort — sans données patient
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    if (smtpConfigured()) {
      sendMail({
        to: "contact@optibot.fr",
        subject: `[OCR Feedback] ${type} — ${user.email}`,
        html: `
<h2>Feedback OCR reçu</h2>
<p><strong>Utilisateur :</strong> ${esc(user.name || "—")} (${esc(user.email || "")})</p>
<p><strong>Type :</strong> ${esc(type)}</p>
<p><strong>Fichier :</strong> ${esc(fileName || "—")}</p>
<p><strong>Message :</strong></p>
<blockquote style="border-left:3px solid #2563eb;padding-left:12px;color:#475569;">${esc(message)}</blockquote>
<p style="color:#94a3b8;font-size:11px;">Aucune donnée patient transmise (RGPD — zéro donnée santé serveur).</p>
        `.trim(),
      }).catch((err) => {
        console.error("[ocr-feedback] Erreur envoi mail:", err);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[ocr-feedback] Erreur:", e);
    return NextResponse.json({ ok: false, error: "Erreur serveur" }, { status: 500 });
  }
}
