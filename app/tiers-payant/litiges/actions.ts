"use server";

import { prisma } from "@/lib/db";
import { requireTPUser, tpUserFilter } from "@/lib/tpAccess";

export interface LitigeCandidate {
  id: string;
  reference: string;
  mutuelle: string;
  montant: number;
  dateEnvoi: string;
  nombreJours: number;
  motifRejet: string | null;
  numeroAdherent: string | null;
  relanceCount: number;
  derniereRelanceAt: string | null;
  userName: string | null;
}

export async function getLitigeCandidates(): Promise<LitigeCandidate[]> {
  const user = await requireTPUser();
  const userFilter = await tpUserFilter(user);

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where: {
      statut: "EN_ATTENTE",
      dateEnvoi: { lt: ninetyDaysAgo },
      montant: { gt: 0 },
      ...userFilter,
    },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { dateEnvoi: "asc" },
  });

  return dossiers.map((d) => {
    const jours = Math.floor(
      (Date.now() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: d.id,
      reference: d.reference,
      mutuelle: d.mutuelle,
      montant: d.montant,
      dateEnvoi: d.dateEnvoi.toISOString(),
      nombreJours: jours,
      motifRejet: d.motifRejet,
      numeroAdherent: d.numeroAdherent,
      relanceCount: d.relanceCount,
      derniereRelanceAt: d.derniereRelanceAt?.toISOString() ?? null,
      userName: d.user.name,
    };
  });
}

export async function getRejectedDossiers(): Promise<LitigeCandidate[]> {
  const user = await requireTPUser();
  const userFilter = await tpUserFilter(user);

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where: {
      statut: "REJETE",
      montant: { gt: 0 },
      ...userFilter,
    },
    include: {
      user: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return dossiers.map((d) => {
    const jours = Math.floor(
      (Date.now() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: d.id,
      reference: d.reference,
      mutuelle: d.mutuelle,
      montant: d.montant,
      dateEnvoi: d.dateEnvoi.toISOString(),
      nombreJours: jours,
      motifRejet: d.motifRejet,
      numeroAdherent: d.numeroAdherent,
      relanceCount: d.relanceCount,
      derniereRelanceAt: d.derniereRelanceAt?.toISOString() ?? null,
      userName: d.user.name,
    };
  });
}

export async function logLitigePdfGeneration(
  dossierId: string,
  pdfType: string
): Promise<void> {
  const user = await requireTPUser();
  const userFilter = await tpUserFilter(user);

  const dossier = await prisma.dossierTiersPayant.findFirst({ where: { id: dossierId, ...userFilter } });
  if (!dossier) throw new Error("Dossier introuvable.");

  await prisma.relanceLog.create({
    data: {
      dossierId,
      type: "litige",
      delaiJours: 0,
      statut: "envoyee",
      datePrevu: new Date(),
      dateExecution: new Date(),
      pdfGenerated: true,
      pdfType,
    },
  });

  await prisma.dossierTiersPayant.update({
    where: { id: dossierId },
    data: {
      statut: "EN_LITIGE",
      historique: {
        create: {
          ancienStatut: "EN_ATTENTE",
          nouveauStatut: "EN_LITIGE",
          commentaire: `Courrier de ${pdfType === "mise_en_demeure" ? "mise en demeure" : "contestation de rejet"} genere`,
          auteurId: user.id,
          auteurNom: user.name ?? "Utilisateur",
        },
      },
    },
  });
}
