export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail, smtpConfigured } from "@/lib/mailer";
import { rateLimit } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await rateLimit(`verify-email:${ip}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans une minute." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const invalid = NextResponse.redirect(
    new URL("/auth/signin?error=InvalidLink", req.url)
  );

  if (!token || !email) return invalid;

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || record.identifier !== email || record.expires < new Date()) {
    return invalid;
  }

  const user = await prisma.user.update({
    where: { email },
    data: { emailVerified: new Date() },
    select: { name: true, email: true },
  });

  await prisma.verificationToken.delete({ where: { token } });

  // Email de bienvenue J0
  if (smtpConfigured() && user.email) {
    try {
      await sendWelcomeEmail(user.email, user.name || "");
    } catch (err) {
      console.error("[verify-email] Erreur envoi welcome email:", err);
    }
  }

  return NextResponse.redirect(new URL("/auth/signin?verified=1", req.url));
}
