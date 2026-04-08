
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail, smtpConfigured } from "@/lib/mailer";
import { auditLog } from "@/lib/adminAudit";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!smtpConfigured()) {
    return NextResponse.json({
      ok: false,
      error: "RESEND_API_KEY non défini dans les variables d'environnement",
    }, { status: 500 });
  }

  try {
    const result = await sendMail({
      to: session!.user.email!,
      subject: "AudiBot — Test email ✓",
      html: `<p>Email de test envoyé depuis AudiBot à ${new Date().toISOString()}.<br/>Si vous recevez ceci, Resend est correctement configuré.</p>`,
    });

    await auditLog({
      userId: session!.user.id!,
      action: "test-mail.send",
      target: session!.user.email!,
      req,
    });

    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
