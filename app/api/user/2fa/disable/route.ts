import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { password } = await req.json() as { password?: string };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, twoFactorEnabled: true },
  });

  if (!user?.twoFactorEnabled)
    return NextResponse.json({ error: "Le 2FA n'est pas activé." }, { status: 400 });

  // Vérification mot de passe (si compte credentials)
  if (user.password) {
    if (!password)
      return NextResponse.json({ error: "Mot de passe requis pour désactiver le 2FA." }, { status: 400 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { twoFactorEnabled: false, twoFactorSecret: null },
  });

  return NextResponse.json({ success: true });
}
