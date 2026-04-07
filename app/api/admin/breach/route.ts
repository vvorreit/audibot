export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auditLog, checkAdmin } from "@/lib/adminAudit";

/** GET — Liste des incidents de breach */
export async function GET() {
  try {
    await checkAdmin();
    const breaches = await prisma.breachNotification.findMany({
      orderBy: { detectedAt: "desc" },
      take: 50,
    });
    return NextResponse.json(breaches);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}

/** POST — Déclarer un nouvel incident */
export async function POST(req: NextRequest) {
  try {
    await checkAdmin();
    const session = await getServerSession(authOptions);
    const { z } = await import("zod");
    const breachSchema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().min(1).max(5000),
      severity: z.enum(["low", "medium", "high", "critical"]),
      dataCategories: z.string().min(1).max(500),
      affectedUsers: z.number().int().min(0).optional().default(0),
    });
    let raw: unknown;
    try { raw = await req.json(); } catch {
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }
    const parsed = breachSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { title, description, severity, dataCategories, affectedUsers } = parsed.data;

    const breach = await prisma.breachNotification.create({
      data: {
        title,
        description,
        severity,
        dataCategories,
        affectedUsers: affectedUsers ?? 0,
        notifiedBy: (session?.user as { id?: string })?.id ?? null,
      },
    });

    await auditLog({
      userId: (session?.user as { id?: string })?.id ?? "unknown",
      action: "breach.create",
      target: breach.id,
      meta: { title, severity },
      req,
    });

    return NextResponse.json(breach, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
