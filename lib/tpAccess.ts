import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Plans ayant accès au module Tiers Payant (suivi TP, relances, alertes rejets, export CSV)
const TP_PLANS: string[] = ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"];

export function hasTPAccess(role: string, isPro: boolean, plan: string): boolean {
  if (role === "ADMIN") return true;
  if (isPro) return true;
  return TP_PLANS.includes(plan);
}

export interface TPUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  teamId: string | null;
}

/** Vérifie l'accès TP et retourne l'utilisateur avec ses infos d'équipe. */
export async function requireTPUser(): Promise<TPUser> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Acces refuse. Non connecte.");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true, role: true, isPro: true, plan: true, teamId: true },
  });
  if (!user) throw new Error("Utilisateur introuvable.");

  if (!hasTPAccess(user.role, user.isPro, user.plan)) {
    throw new Error("Le module Tiers Payant est disponible a partir du plan Pro.");
  }

  return { id: user.id, name: user.name, email: user.email!, role: user.role, teamId: user.teamId };
}

/** Construit le filtre Prisma `userId` pour isoler les données TP.
 *  - ADMIN : pas de filtre (voit tout)
 *  - Équipe : voit les dossiers de tous les membres
 *  - Solo : voit uniquement ses propres dossiers */
export async function tpUserFilter(user: TPUser): Promise<Record<string, unknown>> {
  if (user.role === "ADMIN") return {};

  if (user.teamId) {
    const teamMembers = await prisma.user.findMany({
      where: { teamId: user.teamId },
      select: { id: true },
    });
    return { userId: { in: teamMembers.map((m) => m.id) } };
  }

  return { userId: user.id };
}
