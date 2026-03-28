import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Génère un nouveau secret
  const secretObj = speakeasy.generateSecret({
    name: `OptiBot (${session.user.email})`,
    length: 20,
  });

  const base32Secret = secretObj.base32;
  const otpauth = secretObj.otpauth_url!;

  // QR code data URL
  const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

  // Stocke le secret (non activé — twoFactorEnabled reste false jusqu'à enable)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorSecret: base32Secret },
  });

  return NextResponse.json({ secret: base32Secret, qrCode: qrCodeDataUrl });
}
