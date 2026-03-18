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

const TYPES_VALIDES = ["amiable", "ferme", "mise_en_demeure"] as const;

export async function getTemplates() {
  await checkAuth();
  const templates = await prisma.templateRelance.findMany({
    orderBy: { delaiJours: "asc" },
  });
  return templates.map((t) => ({
    id: t.id,
    nom: t.nom,
    type: t.type,
    objet: t.objet,
    contenu: t.contenu,
    delaiJours: t.delaiJours,
    actif: t.actif,
  }));
}

interface CreateTemplateInput {
  nom: string;
  type: string;
  objet: string;
  contenu: string;
  delaiJours?: number;
}

export async function createTemplate(input: CreateTemplateInput) {
  await checkAuth();

  if (!input.nom.trim()) throw new Error("Le nom est requis.");
  if (!input.objet.trim()) throw new Error("L'objet est requis.");
  if (!input.contenu.trim()) throw new Error("Le contenu est requis.");
  if (!TYPES_VALIDES.includes(input.type as typeof TYPES_VALIDES[number])) {
    throw new Error("Type de template invalide.");
  }

  return prisma.templateRelance.create({
    data: {
      nom: input.nom.trim(),
      type: input.type,
      objet: input.objet.trim(),
      contenu: input.contenu,
      delaiJours: input.delaiJours ?? null,
      actif: true,
    },
  });
}

export async function updateTemplate(id: string, data: {
  nom?: string;
  type?: string;
  objet?: string;
  contenu?: string;
  delaiJours?: number | null;
  actif?: boolean;
}) {
  await checkAuth();
  return prisma.templateRelance.update({
    where: { id },
    data,
  });
}

export async function deleteTemplate(id: string) {
  await checkAuth();
  return prisma.templateRelance.delete({ where: { id } });
}

const VARIABLES = [
  "nom_mutuelle", "montant", "date_envoi", "reference_dossier",
  "nom_audioprothesiste", "adresse_cabinet", "date_courrier",
] as const;

export async function previewTemplate(templateId: string, dossierId?: string) {
  const user = await checkAuth();

  const template = await prisma.templateRelance.findUnique({ where: { id: templateId } });
  if (!template) throw new Error("Template introuvable.");

  let vars: Record<string, string> = {
    nom_mutuelle: "Almerys",
    montant: "250.00",
    date_envoi: new Date().toLocaleDateString("fr-FR"),
    reference_dossier: "TP-2026-0042",
    nom_audioprothesiste: "Cabinet Martin",
    adresse_cabinet: "12 rue de la Paix, 75002 Paris",
    date_courrier: new Date().toLocaleDateString("fr-FR"),
  };

  if (dossierId) {
    const dossier = await prisma.dossierTiersPayant.findFirst({
      where: { id: dossierId, userId: user.id },
      include: { user: { select: { name: true } } },
    });
    if (dossier) {
      vars = {
        nom_mutuelle: dossier.mutuelle,
        montant: dossier.montant.toFixed(2),
        date_envoi: dossier.dateEnvoi.toLocaleDateString("fr-FR"),
        reference_dossier: dossier.reference,
        nom_audioprothesiste: dossier.user.name || "L'audioprothesiste",
        adresse_cabinet: process.env.ADRESSE_CABINET || "Adresse du cabinet",
        date_courrier: new Date().toLocaleDateString("fr-FR"),
      };
    }
  }

  let objet = template.objet;
  let contenu = template.contenu;

  for (const key of VARIABLES) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    objet = objet.replace(regex, vars[key] || `{{${key}}}`);
    contenu = contenu.replace(regex, vars[key] || `{{${key}}}`);
  }

  return { objet, contenu, variables: VARIABLES as unknown as string[] };
}
