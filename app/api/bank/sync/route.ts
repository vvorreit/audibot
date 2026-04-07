export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { requireBankAccess } from "@/lib/bank/access";
import { syncConnection, syncAllConnections } from "@/lib/bank/sync";
import { runMatching } from "@/lib/bank/matching";
import { prisma } from "@/lib/db";
import { safeCompare } from "@/lib/safeCompare";
import { rateLimit } from "@/lib/rateLimit";

/** POST — Sync manuel déclenché par l'utilisateur (ses connexions uniquement). */
export async function POST() {
  try {
    const user = await requireBankAccess();

    const allowed = await rateLimit(`bank-sync:${user.id}`, 5, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
    }

    const connections = await (prisma as any).bankConnection.findMany({
      where: { userId: user.id, status: "ACTIVE" },
    });

    if (connections.length === 0) {
      return NextResponse.json({ error: "Aucune connexion bancaire active" }, { status: 400 });
    }

    let totalImported = 0;
    const errors: string[] = [];

    for (const conn of connections) {
      const result = await syncConnection(conn.id);
      totalImported += result.imported;
      if (result.error) errors.push(`${conn.bankName || conn.provider}: ${result.error}`);
    }

    // Auto-matching après sync
    const matchResult = totalImported > 0 ? await runMatching(user.id) : null;

    return NextResponse.json({
      imported: totalImported,
      matched: matchResult?.total ?? 0,
      autoConfirmed: matchResult?.autoConfirmed ?? 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    console.error("[bank/sync/POST]", err);
    if (err.message?.includes("plan Pro")) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Erreur lors de la synchronisation" }, { status: 500 });
  }
}
