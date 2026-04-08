export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractToken, getExtCors, optionsCors } from "@/lib/extensionAuth";
import { rateLimit } from "@/lib/rateLimit";
import { getUserFeatures } from "@/lib/userFeatures";

export async function OPTIONS() {
  return optionsCors();
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = await rateLimit(`bilan-create:${ip}`, 60, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429, headers: getExtCors(req.headers.get('origin')) });
  }

  // Mode 1 : ?shop=SHOP_TOKEN (client depuis QR magasin, public)
  const shopToken = req.nextUrl.searchParams.get("shop");
  if (shopToken) {
    try {
      const user = await prisma.user.findUnique({
        where: { shopToken },
        select: { id: true, role: true, teamId: true, isPro: true, plan: true },
      });
      if (!user) {
        return NextResponse.json({ error: "QR invalide ou expiré. Demandez un nouveau QR à votre opticien." }, { status: 404, headers: getExtCors(req.headers.get('origin')) });
      }
      // Autoriser ADMIN + users PRO/EQUIPE/CABINET ayant un shopToken
      const planAllowed = user.role === "ADMIN" || user.isPro || ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"].includes(user.plan ?? "");
      if (!planAllowed) {
        return NextResponse.json(
          { error: "Ce magasin n'est pas autorisé à utiliser les bilans." },
          { status: 403, headers: getExtCors(req.headers.get('origin')) }
        );
      }

      const session = await prisma.bilanSession.create({
        data: {
          userId: user.id,
          teamId: user.teamId ?? undefined,
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h
        },
      });

      return NextResponse.json({ sessionId: session.id }, { headers: getExtCors(req.headers.get('origin')) });
    } catch (err) {
      console.error("[bilan/session/create] Erreur DB (shop mode):", err);
      return NextResponse.json(
        { error: "Erreur serveur. Réessayez dans quelques instants." },
        { status: 500, headers: getExtCors(req.headers.get('origin')) }
      );
    }
  }

  // Mode 2 : Authorization: Bearer SYNC_TOKEN (opticien connecté, ADMIN)
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: "Token requis" }, { status: 400, headers: getExtCors(req.headers.get('origin')) });
  }

  const user = await prisma.user.findUnique({
    where: { syncToken: token },
    select: { id: true, role: true, teamId: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Token invalide" }, { status: 401, headers: getExtCors(req.headers.get('origin')) });
  }
  if (user.role !== "ADMIN") {
    const features = await getUserFeatures(user.id);
    if (!features.bilanAuditif) {
      return NextResponse.json(
        { error: "Cette fonctionnalité est réservée aux comptes administrateur." },
        { status: 403, headers: getExtCors(req.headers.get('origin')) }
      );
    }
  }

  const session = await prisma.bilanSession.create({
    data: {
      userId: user.id,
      teamId: user.teamId ?? undefined,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    },
  });

  return NextResponse.json({ sessionId: session.id }, { headers: getExtCors(req.headers.get('origin')) });
}
