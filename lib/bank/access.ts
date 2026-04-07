/** Contrôle d'accès pour la connexion bancaire DSP2. Exports: hasBankAccess, requireBankAccess. */

import { prisma } from "@/lib/db";
import { requireTPUser, type TPUser } from "@/lib/tpAccess";

const BANK_PLANS: string[] = ["PRO", "EQUIPE", "CABINET", "RESEAU", "ENTERPRISE"];

export function hasBankAccess(role: string, plan: string): boolean {
  if (role === "ADMIN") return true;
  return BANK_PLANS.includes(plan);
}

/** Vérifie l'accès TP + plan payant. Throw si plan gratuit. */
export async function requireBankAccess(): Promise<TPUser> {
  const user = await requireTPUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true, role: true },
  });
  if (!dbUser || !hasBankAccess(dbUser.role, dbUser.plan)) {
    throw new Error("La connexion bancaire est disponible à partir du plan Pro.");
  }
  return user;
}
