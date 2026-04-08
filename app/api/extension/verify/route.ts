export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getExtCors, optionsCors } from "@/lib/extensionAuth";

export async function OPTIONS(req: NextRequest) {
  return optionsCors(req);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token =
    req.nextUrl.searchParams.get("token") ||
    (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Token manquant" },
      { status: 401, headers: getExtCors(req.headers.get('origin')) },
    );
  }

  const allowed = await rateLimit(`verify:${token}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429, headers: getExtCors(req.headers.get('origin')) },
    );
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, plan: true, isPro: true, email: true, name: true, role: true },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Compte introuvable. Créez un compte sur audibot.fr" },
      { status: 401, headers: getExtCors(req.headers.get('origin')) },
    );
  }

  const rpaEnabled =
    user.isPro ||
    user.plan === "PRO" ||
    user.plan === "EQUIPE" ||
    user.role === "ADMIN";

  return NextResponse.json(
    {
      ok: true,
      plan: user.plan,
      isPro: user.isPro,
      name: user.name || user.email,
      rpaEnabled,
    },
    { headers: getExtCors(req.headers.get('origin')) },
  );
}
