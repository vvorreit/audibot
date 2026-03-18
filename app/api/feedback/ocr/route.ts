export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMail, smtpConfigured } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "Utilisateur introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const { type, rawText, message, fileName } = body;

    if (!type || !rawText || !message) {
      return NextResponse.json({ ok: false, error: "Champs manquants" }, { status: 400 });
    }

    await prisma.ocrFeedback.create({
      data: {
        userId: user.id,
        type,
        message,
        rawText,
        fileName: fileName || null,
      },
    });

    // Alerte email best-effort
    if (smtpConfigured()) {
      sendMail({
        to: "contact@audibot.fr",
        subject: `[OCR Feedback] ${type} — ${user.email}`,
        html: `
<h2>Feedback OCR reçu</h2>
<p><strong>Utilisateur :</strong> ${user.name || "—"} (${user.email})</p>
<p><strong>Type :</strong> ${type}</p>
<p><strong>Fichier :</strong> ${fileName || "—"}</p>
<p><strong>Message :</strong></p>
<blockquote style="border-left:3px solid #4f46e5;padding-left:12px;color:#475569;">${message}</blockquote>
<p><strong>Texte brut extrait :</strong></p>
<pre style="background:#f1f5f9;padding:12px;border-radius:8px;font-size:12px;white-space:pre-wrap;">${rawText.slice(0, 2000)}</pre>
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
