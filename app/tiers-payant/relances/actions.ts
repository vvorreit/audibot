"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendRelanceEmail } from "@/lib/relance-emails";

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

const MUTUELLES = [
  "CPAM", "ALMERYS", "VIAMEDIS", "ITELIS", "KALIXIA",
  "CARTE_BLANCHE", "SANTECLAIR", "SEVEANE", "SP_SANTE", "AUTRE",
] as const;

const ACTIONS_VALIDES = ["email", "dashboard", "both"] as const;

export async function getReglesRelance() {
  await checkAuth();
  const regles = await prisma.regleRelance.findMany({
    orderBy: { delaiJours: "asc" },
  });
  return regles.map((r) => ({
    id: r.id,
    delaiJours: r.delaiJours,
    action: r.action,
    mutuelle: r.mutuelle,
    actif: r.actif,
  }));
}

interface CreateRegleInput {
  delaiJours: number;
  action: string;
  mutuelle?: string;
}

export async function createRegleRelance(input: CreateRegleInput) {
  await checkAuth();

  if (!input.delaiJours || input.delaiJours < 1) {
    throw new Error("Le delai doit etre d'au moins 1 jour.");
  }
  if (!ACTIONS_VALIDES.includes(input.action as typeof ACTIONS_VALIDES[number])) {
    throw new Error("Action invalide.");
  }
  if (input.mutuelle && !MUTUELLES.includes(input.mutuelle as typeof MUTUELLES[number])) {
    throw new Error("Mutuelle invalide.");
  }

  return prisma.regleRelance.create({
    data: {
      delaiJours: input.delaiJours,
      action: input.action,
      mutuelle: input.mutuelle as typeof MUTUELLES[number] | undefined,
      actif: true,
    },
  });
}

export async function updateRegleRelance(id: string, data: { delaiJours?: number; action?: string; actif?: boolean }) {
  await checkAuth();
  return prisma.regleRelance.update({
    where: { id },
    data,
  });
}

export async function deleteRegleRelance(id: string) {
  await checkAuth();
  return prisma.regleRelance.delete({ where: { id } });
}

export async function toggleRelanceDossier(dossierId: string, desactiver: boolean) {
  const user = await checkAuth();
  return prisma.dossierTiersPayant.update({
    where: { id: dossierId, userId: user.id },
    data: { relanceDesactivee: desactiver },
  });
}

export async function getDossiersPrevusRelance() {
  const user = await checkAuth();

  const now = new Date();
  const regles = await prisma.regleRelance.findMany({
    where: { actif: true },
    orderBy: { delaiJours: "asc" },
  });

  if (regles.length === 0) return [];

  const dossiersEnAttente = await prisma.dossierTiersPayant.findMany({
    where: {
      userId: user.id,
      statut: "EN_ATTENTE",
      relanceDesactivee: false,
      relanceCount: { lt: 3 },
      montant: { gt: 1 },
    },
    include: {
      relances: { orderBy: { createdAt: "desc" }, take: 5 },
      user: { select: { name: true, email: true } },
    },
  });

  const prevus: Array<{
    dossierId: string;
    reference: string;
    mutuelle: string;
    montant: number;
    dateEnvoi: string;
    joursEcoules: number;
    relanceCount: number;
    regle: { delaiJours: number; action: string };
    prochainRelance: string;
    createdBy: string;
    dernieresRelances: Array<{ type: string; delaiJours: number; createdAt: string }>;
  }> = [];

  for (const dossier of dossiersEnAttente) {
    const joursEcoules = Math.round((now.getTime() - dossier.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24));

    const reglesApplicables = regles.filter((r) => !r.mutuelle || r.mutuelle === dossier.mutuelle);
    const delaisDejaRelances = dossier.relances
      .filter((r) => r.statut === "envoyee")
      .map((r) => r.delaiJours);

    for (const regle of reglesApplicables) {
      if (joursEcoules >= regle.delaiJours && !delaisDejaRelances.includes(regle.delaiJours)) {
        prevus.push({
          dossierId: dossier.id,
          reference: dossier.reference,
          mutuelle: dossier.mutuelle,
          montant: dossier.montant,
          dateEnvoi: dossier.dateEnvoi.toISOString(),
          joursEcoules,
          relanceCount: dossier.relanceCount,
          regle: { delaiJours: regle.delaiJours, action: regle.action },
          prochainRelance: new Date(dossier.dateEnvoi.getTime() + regle.delaiJours * 24 * 60 * 60 * 1000).toISOString(),
          createdBy: dossier.user.name || dossier.user.email || "Inconnu",
          dernieresRelances: dossier.relances.map((r) => ({
            type: r.type,
            delaiJours: r.delaiJours,
            createdAt: r.createdAt.toISOString(),
          })),
        });
        break;
      }
    }
  }

  return prevus.sort((a, b) => b.joursEcoules - a.joursEcoules);
}

export async function executerRelance(dossierId: string, delaiJours: number, action: string) {
  const user = await checkAuth();

  const dossier = await prisma.dossierTiersPayant.findFirst({
    where: { id: dossierId, userId: user.id },
    select: { id: true, reference: true, relanceCount: true, mutuelle: true, montant: true, dateEnvoi: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");
  if (dossier.relanceCount >= 3) throw new Error("Maximum de 3 relances atteint pour ce dossier.");

  await prisma.$transaction([
    prisma.relanceLog.create({
      data: {
        dossierId,
        type: action,
        delaiJours,
        statut: "envoyee",
        datePrevu: new Date(),
        dateExecution: new Date(),
      },
    }),
    prisma.dossierTiersPayant.update({
      where: { id: dossierId },
      data: {
        relanceCount: { increment: 1 },
        derniereRelanceAt: new Date(),
      },
    }),
  ]);

  let emailSent = false;
  let emailTo: string | null = null;

  if (action === "email" || action === "both") {
    const escalationType =
      dossier.relanceCount === 0
        ? "amiable"
        : dossier.relanceCount === 1
          ? "ferme"
          : "mise_en_demeure";

    const template = await prisma.templateRelance.findFirst({
      where: {
        actif: true,
        OR: [
          { delaiJours },
          { type: escalationType },
        ],
      },
      orderBy: [
        { delaiJours: "asc" },
      ],
    });

    let bestTemplate = template;
    if (template && template.delaiJours !== null && template.delaiJours !== delaiJours) {
      const exactMatch = await prisma.templateRelance.findFirst({
        where: { actif: true, delaiJours },
      });
      if (exactMatch) bestTemplate = exactMatch;
    }

    const templateData = bestTemplate
      ? { objet: bestTemplate.objet, contenu: bestTemplate.contenu }
      : null;

    const result = await sendRelanceEmail(
      {
        reference: dossier.reference,
        mutuelle: dossier.mutuelle,
        montant: dossier.montant,
        dateEnvoi: dossier.dateEnvoi,
      },
      templateData,
      user.email ?? "contact@audibot.fr"
    );

    emailSent = result.sent;
    emailTo = result.to;
  }

  return { reference: dossier.reference, emailSent, emailTo };
}

export async function reporterRelance(dossierId: string, delaiJours: number) {
  const user = await checkAuth();

  const dossier = await prisma.dossierTiersPayant.findFirst({
    where: { id: dossierId, userId: user.id },
    select: { id: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const dateReportee = new Date();
  dateReportee.setDate(dateReportee.getDate() + 7);

  await prisma.relanceLog.create({
    data: {
      dossierId,
      type: "dashboard",
      delaiJours,
      statut: "reportee",
      datePrevu: dateReportee,
    },
  });

  return { dateReportee: dateReportee.toISOString() };
}

export async function getRelancesDossier(dossierId: string) {
  const user = await checkAuth();

  const dossier = await prisma.dossierTiersPayant.findFirst({
    where: { id: dossierId, userId: user.id },
    select: { id: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const relances = await prisma.relanceLog.findMany({
    where: { dossierId },
    orderBy: { createdAt: "desc" },
  });

  return relances.map((r) => ({
    id: r.id,
    type: r.type,
    delaiJours: r.delaiJours,
    statut: r.statut,
    datePrevu: r.datePrevu.toISOString(),
    dateExecution: r.dateExecution?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getRelancePortalData(dossierId: string) {
  const user = await checkAuth();

  const dossier = await prisma.dossierTiersPayant.findFirst({
    where: { id: dossierId, userId: user.id },
    select: { reference: true, mutuelle: true, montant: true, dateEnvoi: true, referenceInterne: true },
  });
  if (!dossier) throw new Error("Dossier introuvable.");

  const PORTAL_URLS: Record<string, string> = {
    CPAM: "https://www.ameli.fr",
    ALMERYS: "https://espace-pro.almerys.com",
    VIAMEDIS: "https://www.viamedis.net",
    ITELIS: "https://www.itelis.fr",
    KALIXIA: "https://pro.kalixia.com",
    CARTE_BLANCHE: "https://www.carte-blanche.com",
    SANTECLAIR: "https://www.santeclair.fr",
    SEVEANE: "https://www.seveane.com",
    SP_SANTE: "https://www.sp-sante.fr",
  };

  return {
    reference: dossier.reference,
    mutuelle: dossier.mutuelle,
    montant: dossier.montant,
    dateEnvoi: dossier.dateEnvoi.toISOString(),
    referenceInterne: dossier.referenceInterne,
    portalUrl: PORTAL_URLS[dossier.mutuelle] || null,
  };
}
