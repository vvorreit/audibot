"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

/** Log un accès aux données personnelles (RGPD Art. 15 — accountability) */
export async function logDataAccess(opts: {
  userId: string;
  action: string;
  accessor: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? headersList.get("x-real-ip")
      ?? null;

    await prisma.dataAccessLog.create({
      data: {
        userId: opts.userId,
        action: opts.action,
        accessor: opts.accessor,
        ipAddress: ip,
        meta: opts.meta as Record<string, string> | undefined,
      },
    });
  } catch (err) {
    console.error("[DataAccessLog] Failed:", err);
  }
}

/** Récupère le journal d'accès données pour l'utilisateur connecté */
export async function getMyDataAccessLogs(): Promise<{
  logs: { action: string; accessor: string; createdAt: string; ipAddress: string | null }[];
  error?: string;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { logs: [], error: "Non autorisé." };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { logs: [], error: "Utilisateur introuvable." };

  const logs = await prisma.dataAccessLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      action: true,
      accessor: true,
      createdAt: true,
      ipAddress: true,
    },
  });

  return {
    logs: logs.map((l) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    })),
  };
}
