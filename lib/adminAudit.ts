import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Vérifie que l'utilisateur connecté est admin.
 * Throw si non connecté ou non admin.
 */
export async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé. Non connecté.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN") throw new Error("Accès refusé. Réservé aux administrateurs.");
}

export interface AuditOptions {
  userId: string;
  action: string;       // ex: "parcours.create", "parcours.delete", "test-mail.send"
  target?: string;      // id ou nom de la ressource concernée
  meta?: Record<string, unknown>;
  req?: NextRequest;
}

/**
 * Enregistre une action admin dans AdminAuditLog.
 * Ne throw jamais — un échec de log ne doit pas bloquer l'action métier.
 */
export async function auditLog(opts: AuditOptions): Promise<void> {
  try {
    const ip = opts.req
      ? (opts.req.headers.get("x-forwarded-for") ?? opts.req.headers.get("x-real-ip") ?? null)
      : null;

    await prisma.adminAuditLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        target: opts.target ?? null,
        ip,
        meta: opts.meta ? (opts.meta as Record<string, string>) : undefined,
      },
    });
  } catch (err) {
    console.error("[AdminAudit] Failed to write audit log:", err);
  }
}
