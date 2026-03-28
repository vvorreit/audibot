export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkAdmin } from "@/lib/adminAudit";
import { fetchEmails } from "@/lib/imap";

export async function GET() {
  try {
    await checkAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configured = !!(process.env.IMAP_HOST && process.env.IMAP_USER && process.env.IMAP_PASS);
  if (!configured) {
    return NextResponse.json({ emails: [], notConfigured: true, hint: "IMAP_HOST, IMAP_USER ou IMAP_PASS manquant dans les variables d'environnement." });
  }

  try {
    const emails = await fetchEmails(50);
    return NextResponse.json({ emails });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur IMAP inconnue";
    console.error("[inbox] IMAP error:", msg);
    return NextResponse.json({ emails: [], error: msg });
  }
}
