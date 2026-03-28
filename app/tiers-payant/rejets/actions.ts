"use server";

import { prisma } from "@/lib/db";
import { requireTPUser } from "@/lib/tpAccess";

async function rejetUserIdFilter(user: { id: string; role: string; teamId: string | null }): Promise<object> {
  if (user.role === "ADMIN") return {};

  if (user.teamId) {
    const teamMembers = await prisma.user.findMany({
      where: { teamId: user.teamId },
      select: { id: true },
    });
    const ids = teamMembers.map((m) => m.id);
    return { OR: [{ userId: { in: ids } }, { userId: null }] };
  }

  return { OR: [{ userId: user.id }, { userId: null }] };
}

export async function getRejetsAutoDetectes(showTraites: boolean = false) {
  const user = await requireTPUser();
  const userIdFilter = await rejetUserIdFilter(user);

  const rejets = await prisma.rejetAutoDetecte.findMany({
    where: { ...(showTraites ? {} : { traite: false }), ...userIdFilter },
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
  const user = await requireTPUser();
  const userIdFilter = await rejetUserIdFilter(user);

  const rejet = await prisma.rejetAutoDetecte.findFirst({ where: { id: rejetId, ...userIdFilter } });
  if (!rejet) throw new Error("Rejet introuvable.");

  await prisma.rejetAutoDetecte.update({
    where: { id: rejetId },
    data: { traite: true },
  });
  return { ok: true };
}

export async function getRejetsCount() {
  const user = await requireTPUser();
  const userIdFilter = await rejetUserIdFilter(user);
  return prisma.rejetAutoDetecte.count({ where: { traite: false, ...userIdFilter } });
}
