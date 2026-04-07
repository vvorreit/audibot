export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getExtCors, optionsCors, authenticateExtension } from "@/lib/extensionAuth";
import { sanitizePII, sanitizeHtmlSnapshot } from "@/lib/sanitizer";
import { z } from "zod";

const diagnosticSchema = z.object({
  hostname: z.string().min(1).max(200),
  url: z.string().max(2000).optional(),
  trigger: z.enum(["auto", "manual", "error"]).optional(),
  entryCount: z.number().int().min(0).optional(),
  summary: z.string().max(1000).optional(),
  logs: z.string().min(1),
  htmlSnapshot: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  syncToken: z.string().optional(),
});

export async function OPTIONS() {
  return optionsCors();
}

/**
 * POST /api/extension/diagnostic
 * Reçoit les logs de diagnostic de l'extension et les stocke en BDD.
 * Envoyé automatiquement après chaque fill ou manuellement par l'utilisateur.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const auth = await authenticateExtension(req, body, "diagnostic", 30, 60_000);
    if ("error" in auth) return auth.error;
    const { user } = auth;

    const parsed = diagnosticSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Données invalides" },
        { status: 400, headers: getExtCors(req.headers.get('origin')) }
      );
    }

    const {
      hostname,
      url,
      trigger,
      entryCount,
      summary,
      logs,
      htmlSnapshot,
      metadata,
    } = parsed.data;

    // RGPD : Sanitisation des données avant stockage
    const sanitizedLogs = sanitizePII(logs);
    const sanitizedHtml = sanitizeHtmlSnapshot(htmlSnapshot);

    // Limiter la taille des logs (max 500KB) et du HTML (max 1MB)
    const trimmedLogs = sanitizedLogs.length > 500_000 ? sanitizedLogs.slice(-500_000) : sanitizedLogs;
    const trimmedHtml = sanitizedHtml && sanitizedHtml.length > 1_000_000
      ? sanitizedHtml.slice(0, 1_000_000) + "\n<!-- redacted/truncated -->"
      : sanitizedHtml || null;

    await prisma.diagnosticLog.create({
      data: {
        userId: user.id,
        hostname: hostname.slice(0, 200),
        url: url?.slice(0, 2000) || null,
        trigger: (trigger || "auto").slice(0, 20),
        entryCount: entryCount || 0,
        summary: sanitizePII(summary?.slice(0, 1000) || null),
        logs: trimmedLogs,
        htmlSnapshot: trimmedHtml,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });

    // Nettoyage : garder max 50 logs par utilisateur (supprimer les plus anciens)
    const count = await prisma.diagnosticLog.count({ where: { userId: user.id } });
    if (count > 50) {
      const oldest = await prisma.diagnosticLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        take: count - 50,
        select: { id: true },
      });
      if (oldest.length > 0) {
        await prisma.diagnosticLog.deleteMany({
          where: { id: { in: oldest.map((l) => l.id) } },
        });
      }
    }

    return NextResponse.json({ ok: true }, { headers: getExtCors(req.headers.get('origin')) });
  } catch (e) {
    console.error("[diagnostic]", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500, headers: getExtCors(req.headers.get('origin')) }
    );
  }
}

/**
 * GET /api/extension/diagnostic?userId=xxx&hostname=xxx&limit=20
 * Admin : récupère les logs de diagnostic
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateExtension(req);
    if ("error" in auth) return auth.error;

    // Vérifier que c'est un admin
    const adminUser = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { role: true },
    });
    if (adminUser?.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "Admin requis" },
        { status: 403, headers: getExtCors(req.headers.get('origin')) }
      );
    }

    const userId = req.nextUrl.searchParams.get("userId");
    const hostname = req.nextUrl.searchParams.get("hostname");
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "20"), 100);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (userId) where.userId = userId;
    if (hostname) where.hostname = { contains: hostname };

    const logs = await prisma.diagnosticLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, storeName: true } },
      },
    });

    return NextResponse.json({ ok: true, logs }, { headers: getExtCors(req.headers.get('origin')) });
  } catch (e) {
    console.error("[diagnostic/get]", e);
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500, headers: getExtCors(req.headers.get('origin')) }
    );
  }
}
