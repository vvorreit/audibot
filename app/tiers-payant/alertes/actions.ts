"use server";

import { prisma } from "@/lib/db";
import { requireTPUser, tpUserFilter } from "@/lib/tpAccess";

export async function getAlertes(showTraitees: boolean = false) {
  const user = await requireTPUser();
  const userFilter = await tpUserFilter(user);

  const alertes = await prisma.alerteExpiration.findMany({
    where: { ...(showTraitees ? {} : { traitee: false }), ...userFilter },
    orderBy: { dateExpiration: "asc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return alertes.map((a) => ({
    id: a.id,
    dossierId: a.dossierId,
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
  const admin = await requireTPUser();
  const userFilter = await tpUserFilter(admin);

  const alerte = await prisma.alerteExpiration.findFirst({ where: { id: alerteId, ...userFilter } });
  if (!alerte) throw new Error("Alerte introuvable.");

  await prisma.alerteExpiration.update({
    where: { id: alerteId },
    data: {
      traitee: true,
      traiteePar: admin.name || admin.email || "Admin",
      traiteeAt: new Date(),
      commentaire: commentaire?.trim() || null,
    },
  });

  return { ok: true };
}

export async function getAlertesCount() {
  const user = await requireTPUser();
  const userFilter = await tpUserFilter(user);
  return prisma.alerteExpiration.count({ where: { traitee: false, ...userFilter } });
}
