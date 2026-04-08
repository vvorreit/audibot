"use server";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getTransporter, smtpConfigured } from "@/lib/mailer";

/** Délai artificiel pour égaliser le timing succès/échec (anti-timing attack) */
const REGISTER_DELAY_MS = 500;
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function registerUser(name: string, email: string, password: string, dpaVersion?: string, ipAddress?: string, userAgent?: string) {
  if (!name || !email || !password) {
    return { error: "Tous les champs sont requis." };
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (trimmedName.length < 1 || trimmedName.length > 100) {
    return { error: "Le nom doit contenir entre 1 et 100 caractères." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 254) {
    return { error: "Adresse email invalide." };
  }
  if (password.length < 8 || password.length > 128) {
    return { error: "Le mot de passe doit contenir entre 8 et 128 caractères." };
  }

  const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } });
  if (existing) {
    // Anti-énumération : on ne confirme pas l'existence du compte.
    // Même message que le succès + même délai pour éviter les attaques par timing.
    // (OWASP : "Username Enumeration" — CWE-204)
    await delay(REGISTER_DELAY_MS);
    return {
      success: true,
      message: "Si cet email n'est pas encore enregistré, vous recevrez un email de confirmation.",
    };
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name: trimmedName, email: trimmedEmail, password: hashed },
  });

  if (dpaVersion) {
    await prisma.legalAcceptance.create({
      data: {
        userId: user.id,
        email,
        documentType: "dpa",
        documentVersion: dpaVersion,
        ipAddress,
        userAgent,
      },
    });
  }

  // Génération du token de vérification (24h)
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  if (smtpConfigured()) {
    await getTransporter().sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Confirmez votre adresse email — AudiBot",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px">
          <h2 style="color:#1e293b">Bienvenue sur AudiBot, ${name} !</h2>
          <p style="color:#475569">Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.</p>
          <a href="${verifyUrl}" style="display:inline-block;margin:24px 0;background:#2563eb;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;">
            Confirmer mon email
          </a>
          <p style="color:#94a3b8;font-size:13px">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
      `,
    });
  }

  return { success: true };
}
