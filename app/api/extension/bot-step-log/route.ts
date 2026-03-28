export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rateLimit";
import { getPortalCorsHeaders } from "@/lib/cors";

/** RGPD — Sanitise le champ erreur/detail avant stockage */
function sanitizeDetail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let s = raw;
  s = s.replace(/\b\d[\d\s]{11,14}\d\b/g, "[NSS_REDACTED]");
  s = s.replace(/\d{8,}/g, "[NUM_REDACTED]");
  s = s.replace(/\b([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ]{2,}\s+){1,3}[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ]{2,}\b/g, "[NOM_REDACTED]");
  return s.slice(0, 500);
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getPortalCorsHeaders(req.headers.get("origin")) });
}

export async function POST(req: NextRequest) {
  const CORS = getPortalCorsHeaders(req.headers.get("origin"));

  try {
    const body = await req.json();
    const { syncToken, stepNum, action, status, detail, url, hostname } = body;

    if (!syncToken || !action || !status) {
      return NextResponse.json({ ok: false, error: "Payload invalide" }, { status: 400, headers: CORS });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = await rateLimit(`bot-step-log:${ip}`, 100, 60 * 60_000);
    if (!allowed) {
      return NextResponse.json({ ok: false }, { status: 429, headers: CORS });
    }

    const user = await prisma.user.findUnique({
      where: { syncToken },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 401, headers: CORS });
    }

    await prisma.rpaLog.create({
      data: {
        userId: user.id,
        syncToken,
        mutuelle: (hostname || "bot").slice(0, 50),
        etape: (`step${stepNum}_${action}`).slice(0, 50),
        statut: status === "succes" ? "succes" : status === "pause" ? "bloque" : "echec",
        erreur: sanitizeDetail(detail ? String(detail) : null),
        url: url ? String(url).slice(0, 500) : null,
        userAgent: req.headers.get("user-agent")?.slice(0, 255) ?? null,
      },
    });

    return NextResponse.json({ ok: true }, { headers: CORS });
  } catch (e) {
    console.error("[bot-step-log]", e);
    return NextResponse.json({ ok: false }, { status: 500, headers: CORS });
  }
}
