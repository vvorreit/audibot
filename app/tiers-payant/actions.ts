"use server";

import { prisma } from "@/lib/db";
import { generateTPReference } from "@/lib/generateTPReference";
import { requireTPUser, tpUserFilter } from "@/lib/tpAccess";


const MUTUELLES = [
  "CPAM", "ALMERYS", "VIAMEDIS", "ITELIS", "KALIXIA",
  "CARTE_BLANCHE", "SANTECLAIR", "SEVEANE", "SP_SANTE", "AUTRE",
] as const;

type MutuelleValue = typeof MUTUELLES[number];

interface CreateDossierTPInput {
  mutuelle: string;
  montant: number;
  dateEnvoi: string;
  numeroAdherent?: string;
  referenceInterne?: string;
}

export async function createDossierTP(input: CreateDossierTPInput) {
  const admin = await requireTPUser();

  if (!MUTUELLES.includes(input.mutuelle as MutuelleValue)) {
    throw new Error("Mutuelle invalide.");
  }
  if (!input.montant || input.montant <= 0 || input.montant > 100_000) {
    throw new Error("Le montant doit etre entre 0 et 100 000.");
  }
  if (input.numeroAdherent && (!/^[a-zA-Z0-9\s\-_.]+$/.test(input.numeroAdherent) || input.numeroAdherent.length > 50)) {
    throw new Error("Numero adherent invalide (alphanumerique, max 50 car.).");
  }
  if (input.referenceInterne && input.referenceInterne.length > 50) {
    throw new Error("Reference interne trop longue (max 50 car.).");
  }

  const dateEnvoi = new Date(input.dateEnvoi);
  if (isNaN(dateEnvoi.getTime())) {
    throw new Error("Date d'envoi invalide.");
  }

  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (dateEnvoi > todayEnd) {
    throw new Error("La date d'envoi ne peut pas etre dans le futur.");
  }

  const dossier = await prisma.$transaction(async (tx) => {
    const reference = await generateTPReference(tx);
    return tx.dossierTiersPayant.create({
      data: {
        reference,
        mutuelle: input.mutuelle as MutuelleValue,
        montant: input.montant,
        dateEnvoi,
        numeroAdherent: input.numeroAdherent || null,
        referenceInterne: input.referenceInterne || null,
        statut: "EN_ATTENTE",
        userId: admin.id,
      },
    });
  });

  return { reference: dossier.reference };
}

export async function getDossiersTP(page: number = 1, pageSize: number = 50) {
  const user = await requireTPUser();

  const where = await tpUserFilter(user);
  const total = await prisma.dossierTiersPayant.count({ where });

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      historique: { orderBy: { createdAt: "desc" } },
    },
  });

  const mapped = dossiers.map((d) => ({
    id: d.id,
    reference: d.reference,
    mutuelle: d.mutuelle,
    montant: d.montant,
    dateEnvoi: d.dateEnvoi.toISOString(),
    numeroAdherent: d.numeroAdherent,
    referenceInterne: d.referenceInterne,
    statut: d.statut,
    montantRecu: d.montantRecu,
    dateReception: d.dateReception?.toISOString() ?? null,
    motifRejet: d.motifRejet,
    commentaire: d.commentaire,
    mode: d.mode,
    createdBy: d.user.name || d.user.email || "Inconnu",
    createdAt: d.createdAt.toISOString(),
    historique: d.historique.map((h) => ({
      id: h.id,
      ancienStatut: h.ancienStatut,
      nouveauStatut: h.nouveauStatut,
      commentaire: h.commentaire,
      auteurNom: h.auteurNom,
      createdAt: h.createdAt.toISOString(),
    })),
  }));

  return { dossiers: mapped, total };
}

const STATUTS_VALIDES = ["EN_ATTENTE", "RECU", "REJETE", "EN_LITIGE"] as const;
type StatutTP = typeof STATUTS_VALIDES[number];

const MOTIFS_REJET = [
  "doublon",
  "piece_manquante",
  "delai_depasse",
  "droits_expires",
  "autre",
] as const;

interface UpdateStatutInput {
  dossierId: string;
  nouveauStatut: string;
  montantRecu?: number;
  dateReception?: string;
  motifRejet?: string;
  commentaire?: string;
}

export async function updateStatutDossierTP(input: UpdateStatutInput) {
  const admin = await requireTPUser();
  if (admin.role !== "ADMIN") throw new Error("Acces refuse. Reserve aux administrateurs.");

  if (!STATUTS_VALIDES.includes(input.nouveauStatut as StatutTP)) {
    throw new Error("Statut invalide.");
  }

  const userFilter = await tpUserFilter(admin);
  const dossier = await prisma.dossierTiersPayant.findFirst({
    where: { id: input.dossierId, ...userFilter },
    select: { id: true, statut: true, reference: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  if (dossier.statut === input.nouveauStatut) {
    throw new Error("Le dossier est deja dans ce statut.");
  }

  const updateData: Record<string, unknown> = {
    statut: input.nouveauStatut as StatutTP,
  };

  if (input.nouveauStatut === "RECU") {
    if (!input.montantRecu || input.montantRecu <= 0) {
      throw new Error("Le montant recu doit etre superieur a 0.");
    }
    if (!input.dateReception) {
      throw new Error("La date de reception est requise.");
    }
    const dateRec = new Date(input.dateReception);
    if (isNaN(dateRec.getTime())) {
      throw new Error("Date de reception invalide.");
    }
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (dateRec > todayEnd) {
      throw new Error("La date de reception ne peut pas etre dans le futur.");
    }
    updateData.montantRecu = input.montantRecu;
    updateData.dateReception = dateRec;
  }

  if (input.nouveauStatut === "REJETE") {
    if (input.motifRejet && !MOTIFS_REJET.includes(input.motifRejet as typeof MOTIFS_REJET[number])) {
      throw new Error("Motif de rejet invalide.");
    }
    updateData.motifRejet = input.motifRejet || null;
  }

  if (input.nouveauStatut === "EN_LITIGE") {
    if (!input.commentaire?.trim()) {
      throw new Error("Un commentaire est obligatoire pour le statut En litige.");
    }
  }

  if (input.commentaire?.trim()) {
    updateData.commentaire = input.commentaire.trim();
  }

  const auteurNom = admin.name || admin.email || "Admin";

  await prisma.$transaction([
    prisma.dossierTiersPayant.update({
      where: { id: input.dossierId },
      data: updateData,
    }),
    prisma.historiqueStatutTP.create({
      data: {
        dossierId: input.dossierId,
        ancienStatut: dossier.statut,
        nouveauStatut: input.nouveauStatut as StatutTP,
        commentaire: input.commentaire?.trim() || null,
        auteurId: admin.id,
        auteurNom,
      },
    }),
  ]);

  return { reference: dossier.reference, statut: input.nouveauStatut };
}
