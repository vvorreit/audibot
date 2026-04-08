export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { tpUserFilter, requireTPUser } from "@/lib/tpAccess";
import RapportPDFClient from "./RapportPDFClient";

interface PageProps {
  searchParams: Promise<{ month?: string; token?: string }>;
}

export default async function RapportPDFPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { month, token } = params;

  // Auth : soit session active, soit token de sync (pour accès via email cron)
  let userId: string | null = null;
  let userName: string | null = null;
  let userEmail: string | null = null;

  if (token) {
    const user = await prisma.user.findFirst({
      where: { syncToken: token },
      select: { id: true, name: true, email: true, isPro: true, plan: true, role: true },
    });
    if (user) {
      userId = user.id;
      userName = user.name;
      userEmail = user.email;
    }
  }

  if (!userId) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/auth/signin");
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, isPro: true, plan: true, role: true, teamId: true },
    });
    if (!user) redirect("/auth/signin");
    const hasAccess = user.role === "ADMIN" || user.isPro || ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"].includes(user.plan);
    if (!hasAccess) redirect("/dashboard");
    userId = user.id;
    userName = user.name;
    userEmail = user.email;
  }

  // Calcul de la période
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetMonth = now.getMonth() + 1;

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    targetYear = y;
    targetMonth = m;
  }

  const dateDebut = new Date(targetYear, targetMonth - 1, 1);
  const dateFin = new Date(targetYear, targetMonth, 1);

  // Récupérer les dossiers du mois pour cet utilisateur
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, teamId: true },
  });
  if (!userRecord) redirect("/auth/signin");

  const tpUser = { id: userRecord.id, name: userRecord.name, email: userRecord.email!, role: userRecord.role, teamId: userRecord.teamId };
  const baseWhere = await tpUserFilter(tpUser);

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where: {
      ...baseWhere,
      dateEnvoi: { gte: dateDebut, lt: dateFin },
    },
    orderBy: { dateEnvoi: "asc" },
    select: {
      id: true,
      reference: true,
      mutuelle: true,
      montant: true,
      montantRecu: true,
      statut: true,
      dateEnvoi: true,
      dateReception: true,
    },
  });

  // KPIs
  const nbTotal = dossiers.length;
  const totalSoumis = dossiers.reduce((s, d) => s + d.montant, 0);
  const recus = dossiers.filter((d) => d.statut === "RECU");
  const rejetes = dossiers.filter((d) => d.statut === "REJETE");
  const totalRecu = recus.reduce((s, d) => s + (d.montantRecu ?? d.montant), 0);
  const tauxRejet = nbTotal > 0 ? Math.round((rejetes.length / nbTotal) * 100) : 0;

  const delais = recus
    .filter((d) => d.dateReception)
    .map((d) => Math.round((d.dateReception!.getTime() - d.dateEnvoi.getTime()) / (1000 * 60 * 60 * 24)));
  const delaiMoyen = delais.length > 0 ? Math.round(delais.reduce((s, v) => s + v, 0) / delais.length) : 0;

  // Par mutuelle
  const mutuelleMap = new Map<string, { nbDossiers: number; montantSoumis: number; montantRecu: number; nbRejetes: number }>();
  for (const d of dossiers) {
    if (!mutuelleMap.has(d.mutuelle)) {
      mutuelleMap.set(d.mutuelle, { nbDossiers: 0, montantSoumis: 0, montantRecu: 0, nbRejetes: 0 });
    }
    const entry = mutuelleMap.get(d.mutuelle)!;
    entry.nbDossiers++;
    entry.montantSoumis += d.montant;
    if (d.statut === "RECU") entry.montantRecu += (d.montantRecu ?? d.montant);
    if (d.statut === "REJETE") entry.nbRejetes++;
  }

  const parMutuelle = Array.from(mutuelleMap.entries())
    .map(([mutuelle, data]) => ({
      mutuelle,
      nbDossiers: data.nbDossiers,
      montantSoumis: Math.round(data.montantSoumis * 100) / 100,
      montantRecu: Math.round(data.montantRecu * 100) / 100,
      nbRejetes: data.nbRejetes,
    }))
    .sort((a, b) => b.montantSoumis - a.montantSoumis);

  const monthLabel = dateDebut.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const reportData = {
    userName: userName ?? userEmail ?? "Utilisateur",
    monthLabel,
    month: `${targetYear}-${String(targetMonth).padStart(2, "0")}`,
    kpis: {
      nbTotal,
      totalSoumis: Math.round(totalSoumis * 100) / 100,
      totalRecu: Math.round(totalRecu * 100) / 100,
      tauxRejet,
      delaiMoyen,
    },
    parMutuelle,
    generatedAt: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  };

  return <RapportPDFClient data={reportData} />;
}
