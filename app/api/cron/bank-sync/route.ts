export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { safeCompare } from "@/lib/safeCompare";
import { syncAllConnections } from "@/lib/bank/sync";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || !auth || !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.BANK_SYNC_ENABLED === "false") {
    return NextResponse.json({ message: "Bank sync disabled", synced: 0 });
  }

  try {
    const result = await syncAllConnections();

    const totalImported = result.results.reduce((sum, r) => sum + r.imported, 0);
    const totalErrors = result.results.filter((r) => r.error).length;
    const totalMatched = result.matchResults.reduce((sum, r) => sum + r.total, 0);
    const totalAutoConfirmed = result.matchResults.reduce((sum, r) => sum + r.autoConfirmed, 0);

    return NextResponse.json({
      synced: result.results.length,
      imported: totalImported,
      errors: totalErrors,
      matched: totalMatched,
      autoConfirmed: totalAutoConfirmed,
    });
  } catch (err) {
    console.error("[cron/bank-sync]", err);
    return NextResponse.json({ error: "Erreur lors du sync bancaire" }, { status: 500 });
  }
}
