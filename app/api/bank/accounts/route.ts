export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireBankAccess } from "@/lib/bank/access";
import { getProvider } from "@/lib/bank/provider";
import { tryDecrypt } from "@/lib/serverCrypto";
import type { BankProviderName } from "@/lib/bank/types";

export async function GET() {
  try {
    const user = await requireBankAccess();
    const connections = await (prisma as any).bankConnection.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        provider: true,
        bankName: true,
        iban: true,
        label: true,
        status: true,
        lastSyncAt: true,
        lastError: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Masquer l'IBAN (montrer les 4 derniers caractères)
    const masked = connections.map((c: any) => ({
      ...c,
      iban: c.iban ? `****${c.iban.slice(-4)}` : null,
    }));

    return NextResponse.json({ connections: masked });
  } catch (err: any) {
    console.error("[bank/accounts/GET]", err);
    if (err.message?.includes("plan Pro")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireBankAccess();
    const { searchParams } = new URL(req.url);
    const connectionId = searchParams.get("id");

    if (!connectionId) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    const connection = await (prisma as any).bankConnection.findFirst({
      where: { id: connectionId, userId: user.id },
    });

    if (!connection) {
      return NextResponse.json({ error: "Connexion introuvable" }, { status: 404 });
    }

    // Tenter de supprimer chez le provider
    try {
      const provider = getProvider(connection.provider as BankProviderName);
      const token = tryDecrypt(connection.accessToken) ?? connection.accessToken;
      await provider.deleteConnection(token);
    } catch (err) {
      console.warn("[bank/accounts/DELETE] provider cleanup failed:", err);
    }

    await (prisma as any).bankConnection.delete({ where: { id: connectionId } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[bank/accounts/DELETE]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
