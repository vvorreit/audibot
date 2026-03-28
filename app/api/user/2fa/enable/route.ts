import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import speakeasy from "speakeasy";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json() as { code?: string };
  if (!code || code.length !== 6)
    return NextResponse.json({ error: "Code invalide" }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorSecret)
    return NextResponse.json({ error: "Aucune configuration 2FA en cours. Recommencez le setup." }, { status: 400 });

  if (user.twoFactorEnabled)
    return NextResponse.json({ error: "Le 2FA est déjà activé." }, { status: 400 });

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 1, // tolérance ±30s
  });

  if (!isValid)
    return NextResponse.json({ error: "Code incorrect. Vérifiez l'heure de votre appareil et réessayez." }, { status: 400 });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: true },
  });

  return NextResponse.json({ success: true });
}
