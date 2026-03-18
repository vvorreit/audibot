"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Acces refuse. Non connecte.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true, plan: true },
  });
  if (!dbUser) throw new Error("Utilisateur introuvable.");
  if (dbUser.plan === "FREE") throw new Error("Module disponible a partir du plan Essentiel.");
  return dbUser;
}

export async function getRejetsAutoDetectes(showTraites: boolean = false) {
  const user = await checkAuth();

  const rejets = await prisma.rejetAutoDetecte.findMany({
    where: {
      syncToken: { in: [user.id] },
      ...(showTraites ? {} : { traite: false }),
    },
    orderBy: { createdAt: "desc" },
  });

  return rejets.map((r) => ({
    id: r.id,
    portail: r.portail,
    numeroDossier: r.numeroDossier,
    motif: r.motif,
    dateRejet: r.dateRejet?.toISOString() ?? null,
    montant: r.montant,
    dossierId: r.dossierId,
    matched: r.matched,
    traite: r.traite,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function marquerRejetTraite(rejetId: string) {
  await checkAuth();
  await prisma.rejetAutoDetecte.update({
    where: { id: rejetId },
    data: { traite: true },
  });
  return { ok: true };
}

export async function getRejetsCount() {
  const user = await checkAuth();
  return prisma.rejetAutoDetecte.count({
    where: { syncToken: { in: [user.id] }, traite: false },
  });
}
