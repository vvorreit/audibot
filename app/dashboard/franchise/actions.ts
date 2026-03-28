"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function checkTeamOwner() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Non connecte.");
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, teamId: true, teamRole: true },
  });
  if (!user?.teamId || user.teamRole !== "OWNER")
    throw new Error("Acces reserve au proprietaire de l'equipe.");
  return { userId: user.id, teamId: user.teamId };
}

export interface FranchiseMember {
  id: string;
  name: string | null;
  email: string | null;
  storeName: string | null;
  scanCount: number;
  injectionCount: number;
  dossiersTotal: number;
  dossiersRejetes: number;
  montantEnAttente: number;
}

export interface FranchiseKPIs {
  totalScans: number;
  totalInjections: number;
  roiHeures: number;
  tauxRejet: number;
  montantEnAttente: number;
  montantRecu: number;
  members: FranchiseMember[];
  scansByDay: { date: string; count: number; memberId: string; memberName: string }[];
  rejetsByMutuelle: { mutuelle: string; count: number }[];
}

export async function getFranchiseAnalytics(
  period: "7d" | "30d" | "90d" | "all"
): Promise<FranchiseKPIs> {
  const { teamId } = await checkTeamOwner();

  const teamUsers = await prisma.user.findMany({
    where: { teamId },
    select: { id: true, name: true, email: true, storeName: true },
  });

  const memberIds = teamUsers.map((u) => u.id);

  const periodStart = period === "all" ? new Date(0) : new Date();
  if (period === "7d") periodStart.setDate(periodStart.getDate() - 7);
  else if (period === "30d") periodStart.setDate(periodStart.getDate() - 30);
  else if (period === "90d") periodStart.setDate(periodStart.getDate() - 90);

  const dateFilter = period === "all" ? {} : { createdAt: { gte: periodStart } };

  const [scanLogs, injectionLogs, dossiers] = await Promise.all([
    prisma.ocrScanLog.findMany({
      where: { userId: { in: memberIds }, ...dateFilter },
      select: { userId: true, createdAt: true },
    }),
    prisma.injectionLog.findMany({
      where: { userId: { in: memberIds }, ...dateFilter },
      select: { userId: true },
    }),
    prisma.dossierTiersPayant.findMany({
      where: { userId: { in: memberIds }, ...dateFilter },
      select: {
        userId: true,
        statut: true,
        montant: true,
        montantRecu: true,
        mutuelle: true,
      },
    }),
  ]);

  const memberMap = new Map(teamUsers.map((u) => [u.id, u]));

  const members: FranchiseMember[] = teamUsers.map((u) => {
    const userScans = scanLogs.filter((s) => s.userId === u.id);
    const userInjections = injectionLogs.filter((i) => i.userId === u.id);
    const userDossiers = dossiers.filter((d) => d.userId === u.id);
    const rejetes = userDossiers.filter((d) => d.statut === "REJETE");
    const enAttente = userDossiers.filter((d) => d.statut === "EN_ATTENTE");

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      storeName: u.storeName,
      scanCount: userScans.length,
      injectionCount: userInjections.length,
      dossiersTotal: userDossiers.length,
      dossiersRejetes: rejetes.length,
      montantEnAttente: enAttente.reduce((s, d) => s + d.montant, 0),
    };
  });

  const totalScans = scanLogs.length;
  const totalInjections = injectionLogs.length;
  const roiHeures = Math.round((totalScans * 3) / 60 * 10) / 10;

  const totalDossiers = dossiers.length;
  const totalRejetes = dossiers.filter((d) => d.statut === "REJETE").length;
  const tauxRejet = totalDossiers > 0
    ? Math.round((totalRejetes / totalDossiers) * 1000) / 10
    : 0;

  const montantEnAttente = dossiers
    .filter((d) => d.statut === "EN_ATTENTE")
    .reduce((s, d) => s + d.montant, 0);
  const montantRecu = dossiers
    .filter((d) => d.statut === "RECU")
    .reduce((s, d) => s + (d.montantRecu ?? d.montant), 0);

  const scansByDayMap = new Map<string, { count: number; memberId: string; memberName: string }>();
  for (const scan of scanLogs) {
    const date = scan.createdAt.toISOString().slice(0, 10);
    const member = memberMap.get(scan.userId);
    const key = `${date}__${scan.userId}`;
    const existing = scansByDayMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      scansByDayMap.set(key, {
        count: 1,
        memberId: scan.userId,
        memberName: member?.storeName ?? member?.name ?? "Inconnu",
      });
    }
  }
  const scansByDay = Array.from(scansByDayMap.entries()).map(
    ([key, val]) => ({
      date: key.split("__")[0],
      ...val,
    })
  );

  const rejetsByMutuelleMap = new Map<string, number>();
  for (const d of dossiers) {
    if (d.statut === "REJETE") {
      rejetsByMutuelleMap.set(
        d.mutuelle,
        (rejetsByMutuelleMap.get(d.mutuelle) ?? 0) + 1
      );
    }
  }
  const rejetsByMutuelle = Array.from(rejetsByMutuelleMap.entries())
    .map(([mutuelle, count]) => ({ mutuelle, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalScans,
    totalInjections,
    roiHeures,
    tauxRejet,
    montantEnAttente,
    montantRecu,
    members,
    scansByDay,
    rejetsByMutuelle,
  };
}
