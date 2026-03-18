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

interface DashboardFilters {
  statut?: string;
  mutuelle?: string;
  dateDebut?: string;
  dateFin?: string;
}

export async function getTPDashboardData(filters: DashboardFilters = {}) {
  const user = await checkAuth();

  const where: Record<string, unknown> = { userId: user.id };

  if (filters.statut && filters.statut !== "all") {
    where.statut = filters.statut;
  }
  if (filters.mutuelle && filters.mutuelle !== "all") {
    where.mutuelle = filters.mutuelle;
  }
  if (filters.dateDebut || filters.dateFin) {
    where.dateEnvoi = {};
    if (filters.dateDebut) (where.dateEnvoi as Record<string, unknown>).gte = new Date(filters.dateDebut);
    if (filters.dateFin) (where.dateEnvoi as Record<string, unknown>).lte = new Date(filters.dateFin);
  }

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where,
    select: {
      id: true,
      mutuelle: true,
      montant: true,
      montantRecu: true,
      statut: true,
      dateEnvoi: true,
      dateReception: true,
      createdAt: true,
    },
  });

  const now = new Date();

  const enAttente = dossiers.filter((d) => d.statut === "EN_ATTENTE");
  const recus = dossiers.filter((d) => d.statut === "RECU");
  const rejetes = dossiers.filter((d) => d.statut === "REJETE");
  const enLitige = dossiers.filter((d) => d.statut === "EN_LITIGE");

  const totalEnAttente = enAttente.reduce((sum, d) => sum + d.montant, 0);
  const totalRecu = recus.reduce((sum, d) => sum + (d.montantRecu ?? d.montant), 0);
  const totalRejete = rejetes.reduce((sum, d) => sum + d.montant, 0);
  const totalLitige = enLitige.reduce((sum, d) => sum + d.montant, 0);
  const montantMoyen = dossiers.length > 0 ? dossiers.reduce((s, d) => s + d.montant, 0) / dossiers.length : 0;

  const delaisRemboursement = recus
    .filter((d) => d.dateReception)
    .map((d) => Math.round((d.dateReception!.getTime() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)));
  const delaiMoyen = delaisRemboursement.length > 0
    ? Math.round(delaisRemboursement.reduce((s, v) => s + v, 0) / delaisRemboursement.length)
    : 0;

  const mutuelleMap = new Map<string, { montantAttente: number; nbDossiers: number; nbAttente: number; delais: number[] }>();
  for (const d of dossiers) {
    const key = d.mutuelle;
    if (!mutuelleMap.has(key)) {
      mutuelleMap.set(key, { montantAttente: 0, nbDossiers: 0, nbAttente: 0, delais: [] });
    }
    const entry = mutuelleMap.get(key)!;
    entry.nbDossiers++;
    if (d.statut === "EN_ATTENTE" || d.statut === "EN_LITIGE") {
      entry.montantAttente += d.montant;
      entry.nbAttente++;
    }
    if (d.statut === "RECU" && d.dateReception) {
      entry.delais.push(Math.round((d.dateReception.getTime() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }

  const parMutuelle = Array.from(mutuelleMap.entries())
    .map(([mutuelle, data]) => ({
      mutuelle,
      montantAttente: Math.round(data.montantAttente * 100) / 100,
      nbDossiers: data.nbDossiers,
      nbAttente: data.nbAttente,
      delaiMoyen: data.delais.length > 0
        ? Math.round(data.delais.reduce((s, v) => s + v, 0) / data.delais.length)
        : null,
    }))
    .sort((a, b) => b.montantAttente - a.montantAttente);

  const tranches = { "0-30": 0, "31-60": 0, "61-90": 0, ">90": 0 };
  const tranchesMontant = { "0-30": 0, "31-60": 0, "61-90": 0, ">90": 0 };
  for (const d of [...enAttente, ...enLitige]) {
    const jours = Math.round((now.getTime() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24));
    const tranche = jours <= 30 ? "0-30" : jours <= 60 ? "31-60" : jours <= 90 ? "61-90" : ">90";
    tranches[tranche]++;
    tranchesMontant[tranche] += d.montant;
  }

  const tranchesData = Object.entries(tranches).map(([label, count]) => ({
    label,
    count,
    montant: Math.round(tranchesMontant[label as keyof typeof tranchesMontant] * 100) / 100,
  }));

  const evolutionMap = new Map<string, { envoye: number; recu: number; rejete: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    evolutionMap.set(key, { envoye: 0, recu: 0, rejete: 0 });
  }

  for (const d of dossiers) {
    const key = `${d.dateEnvoi.getFullYear()}-${String(d.dateEnvoi.getMonth() + 1).padStart(2, "0")}`;
    if (evolutionMap.has(key)) {
      evolutionMap.get(key)!.envoye += d.montant;
    }
  }
  for (const d of recus) {
    if (!d.dateReception) continue;
    const key = `${d.dateReception.getFullYear()}-${String(d.dateReception.getMonth() + 1).padStart(2, "0")}`;
    if (evolutionMap.has(key)) {
      evolutionMap.get(key)!.recu += (d.montantRecu ?? d.montant);
    }
  }
  for (const d of rejetes) {
    const key = `${d.createdAt.getFullYear()}-${String(d.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (evolutionMap.has(key)) {
      evolutionMap.get(key)!.rejete += d.montant;
    }
  }

  const evolution = Array.from(evolutionMap.entries()).map(([mois, data]) => ({
    mois,
    envoye: Math.round(data.envoye * 100) / 100,
    recu: Math.round(data.recu * 100) / 100,
    rejete: Math.round(data.rejete * 100) / 100,
  }));

  return {
    kpis: {
      totalEnAttente: Math.round(totalEnAttente * 100) / 100,
      nbEnAttente: enAttente.length,
      totalRecu: Math.round(totalRecu * 100) / 100,
      nbRecu: recus.length,
      totalRejete: Math.round(totalRejete * 100) / 100,
      nbRejete: rejetes.length,
      totalLitige: Math.round(totalLitige * 100) / 100,
      nbLitige: enLitige.length,
      nbTotal: dossiers.length,
      montantMoyen: Math.round(montantMoyen * 100) / 100,
      delaiMoyen,
    },
    parMutuelle,
    tranches: tranchesData,
    evolution,
  };
}

export async function exportDossiersCSV(filters: DashboardFilters = {}) {
  const user = await checkAuth();

  const where: Record<string, unknown> = { userId: user.id };
  if (filters.statut && filters.statut !== "all") where.statut = filters.statut;
  if (filters.mutuelle && filters.mutuelle !== "all") where.mutuelle = filters.mutuelle;
  if (filters.dateDebut || filters.dateFin) {
    where.dateEnvoi = {};
    if (filters.dateDebut) (where.dateEnvoi as Record<string, unknown>).gte = new Date(filters.dateDebut);
    if (filters.dateFin) (where.dateEnvoi as Record<string, unknown>).lte = new Date(filters.dateFin);
  }

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where,
    orderBy: { dateEnvoi: "desc" },
    include: { user: { select: { name: true, email: true } } },
  });

  const headers = [
    "Reference", "Mutuelle", "Montant", "Montant Recu", "Date Envoi",
    "Date Reception", "Statut", "N. Adherent", "Ref. Interne",
    "Motif Rejet", "Commentaire", "Cree par", "Date Creation",
  ];

  const rows = dossiers.map((d) => [
    d.reference,
    d.mutuelle,
    d.montant.toFixed(2),
    d.montantRecu?.toFixed(2) ?? "",
    d.dateEnvoi.toISOString().slice(0, 10),
    d.dateReception?.toISOString().slice(0, 10) ?? "",
    d.statut,
    d.numeroAdherent ?? "",
    d.referenceInterne ?? "",
    d.motifRejet ?? "",
    d.commentaire ?? "",
    d.user.name || d.user.email || "",
    d.createdAt.toISOString().slice(0, 10),
  ]);

  const csvContent = [
    headers.join(";"),
    ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")),
  ].join("\n");

  return csvContent;
}
