"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Acces refuse. Non connecte.");
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true, name: true, email: true, plan: true },
  });
  if (!dbUser) throw new Error("Utilisateur introuvable.");
  if (dbUser.plan === "FREE") throw new Error("Module disponible a partir du plan Essentiel.");
  return dbUser;
}

export async function getAlertes(showTraitees: boolean = false) {
  const user = await checkAuth();

  const alertes = await prisma.alerteExpiration.findMany({
    where: {
      userId: user.id,
      ...(showTraitees ? {} : { traitee: false }),
    },
    orderBy: { dateExpiration: "asc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return alertes.map((a) => ({
    id: a.id,
    dossierId: a.dossierId,
    clientNom: a.clientNom,
    dateOrdonnance: a.dateOrdonnance.toISOString(),
    dateExpiration: a.dateExpiration.toISOString(),
    joursAvant: a.joursAvant,
    traitee: a.traitee,
    traiteePar: a.traiteePar,
    traiteeAt: a.traiteeAt?.toISOString() ?? null,
    commentaire: a.commentaire,
    notifEmail: a.notifEmail,
    userName: a.user.name || a.user.email || "Inconnu",
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function marquerTraitee(alerteId: string, commentaire?: string) {
  const user = await checkAuth();

  await prisma.alerteExpiration.update({
    where: { id: alerteId },
    data: {
      traitee: true,
      traiteePar: user.name || user.email || "Utilisateur",
      traiteeAt: new Date(),
      commentaire: commentaire?.trim() || null,
    },
  });

  return { ok: true };
}

export async function getAlertesCount() {
  const user = await checkAuth();
  return prisma.alerteExpiration.count({ where: { userId: user.id, traitee: false } });
}
