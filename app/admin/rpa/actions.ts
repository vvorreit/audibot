"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé. Non connecté.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (dbUser?.role !== "ADMIN")
    throw new Error("Accès refusé. Réservé aux administrateurs.");
}

export async function getRpaLogs(filters: {
  mutuelle?: string;
  statut?: string;
  days?: number;
}) {
  await checkAdmin();

  const where: Record<string, unknown> = {};
  if (filters.mutuelle) where.mutuelle = filters.mutuelle;
  if (filters.statut) where.statut = filters.statut;
  if (filters.days) {
    where.createdAt = {
      gte: new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000),
    };
  }

  const logs = await prisma.rpaLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return logs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
  }));
}

export async function getRpaStats() {
  await checkAdmin();

  const [allLogs, last30dLogs] = await Promise.all([
    prisma.rpaLog.findMany({
      select: { mutuelle: true, etape: true, statut: true },
    }),
    prisma.rpaLog.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      select: { mutuelle: true, etape: true, statut: true },
    }),
  ]);

  const totalLances = last30dLogs.length;
  const succesCount = last30dLogs.filter((l) => l.statut === "succes").length;
  const echecCount = last30dLogs.filter((l) => l.statut === "echec").length;
  const tauxSucces =
    totalLances > 0 ? Math.round((succesCount / totalLances) * 1000) / 10 : 0;
  const tauxEchec =
    totalLances > 0 ? Math.round((echecCount / totalLances) * 1000) / 10 : 0;

  /* Par mutuelle */
  const mutuelleMap: Record<
    string,
    { total: number; succes: number; echecs: number }
  > = {};
  for (const l of last30dLogs) {
    if (!mutuelleMap[l.mutuelle])
      mutuelleMap[l.mutuelle] = { total: 0, succes: 0, echecs: 0 };
    mutuelleMap[l.mutuelle].total++;
    if (l.statut === "succes") mutuelleMap[l.mutuelle].succes++;
    if (l.statut === "echec") mutuelleMap[l.mutuelle].echecs++;
  }
  const parMutuelle = Object.entries(mutuelleMap).map(([mutuelle, data]) => ({
    mutuelle,
    ...data,
  }));

  /* Points de rupture fréquents (all time) */
  const ruptureMap: Record<string, number> = {};
  for (const l of allLogs) {
    if (l.statut === "echec" || l.statut === "bloque") {
      const key = `${l.mutuelle}|${l.etape}`;
      ruptureMap[key] = (ruptureMap[key] || 0) + 1;
    }
  }
  const pointsRupture = Object.entries(ruptureMap)
    .map(([key, count]) => {
      const [mutuelle, etape] = key.split("|");
      return { mutuelle, etape, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    totalLances,
    tauxSucces,
    tauxEchec,
    parMutuelle,
    pointsRupture,
  };
}
