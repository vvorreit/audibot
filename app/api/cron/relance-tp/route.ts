export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { safeCompare } from "@/lib/safeCompare";
import { processRelances } from "@/app/lib/relanceTP";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    !auth ||
    !safeCompare(auth, `Bearer ${process.env.CRON_SECRET}`)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processRelances();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[cron/relance-tp] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur interne", detail: String(err) },
      { status: 500 }
    );
  }
}
