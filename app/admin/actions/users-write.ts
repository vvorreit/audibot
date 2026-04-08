"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { auditLog } from "@/lib/adminAudit";
import { checkAdmin } from "./auth";

const VALID_PLANS = ["FREE", "ESSENTIEL", "PRO", "CABINET", "RESEAU", "EQUIPE"] as const;

export async function setUserPlan(userId: string, plan: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");

  if (!VALID_PLANS.includes(plan as typeof VALID_PLANS[number])) {
    return { error: `Plan invalide. Valeurs acceptées : ${VALID_PLANS.join(", ")}` };
  }

  const isPro = plan !== "FREE";
  const user = await prisma.user.update({
    where: { id: userId },
    data: { plan, isPro },
    select: { email: true },
  });

  await auditLog({ userId: admin.id, action: "user.plan.change", target: userId, meta: { plan, email: user.email } });
  return { success: true };
}

export async function toggleUserAdminRole(userId: string, currentRole: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const self = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (self?.role !== "ADMIN") throw new Error("Accès refusé.");
  if (self?.id === userId) throw new Error("Vous ne pouvez pas modifier votre propre rôle.");
  const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
  const updated = await prisma.user.update({ where: { id: userId }, data: { role: newRole }, select: { id: true, role: true, email: true } });
  await auditLog({ userId: self.id, action: "user.role.change", target: userId, meta: { newRole, email: updated.email } });
  return updated;
}

export async function toggleUserProStatus(userId: string, currentStatus: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isPro: !currentStatus },
    select: { id: true, isPro: true, email: true }
  });
  await auditLog({ userId: admin.id, action: "user.pro.toggle", target: userId, meta: { isPro: updated.isPro, email: updated.email } });
  return updated;
}

export async function grantFreeMonths(
  userId: string,
  months: number,
  note?: string
): Promise<{ ok: boolean; freeUntil: string; stripeCredit: boolean }> {
  await checkAdmin();

  if (!Number.isInteger(months) || months <= 0 || months > 24) {
    throw new Error("Le nombre de mois doit être un entier entre 1 et 24.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true, stripeSubscriptionId: true, freeUntil: true, plan: true, email: true, name: true },
  });
  if (!user) throw new Error("Utilisateur introuvable");

  const base = user.freeUntil && user.freeUntil > new Date() ? user.freeUntil : new Date();
  const newFreeUntil = new Date(base);
  newFreeUntil.setMonth(newFreeUntil.getMonth() + months);

  await prisma.user.update({
    where: { id: userId },
    data: {
      freeUntil: newFreeUntil,
      freeMonthsNote: note || null,
      isPro: true,
    },
  });

  let stripeCredit = false;
  if (user.stripeCustomerId && user.stripeSubscriptionId) {
    try {
      const { stripe } = await import("@/lib/stripe");
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const monthlyAmount = subscription.items.data[0]?.price?.unit_amount || 0;
      if (monthlyAmount > 0) {
        await stripe.customers.createBalanceTransaction(user.stripeCustomerId, {
          amount: -(monthlyAmount * months),
          currency: "eur",
          description: `${months} mois offerts par OptiBot${note ? " — " + note : ""}`,
        });
        stripeCredit = true;
      }
    } catch (e) {
      console.warn("[grantFreeMonths] Stripe credit failed:", e);
    }
  }

  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    await auditLog({ userId: session.user.id, action: "user.free_months.grant", target: userId, meta: { months, note, freeUntil: newFreeUntil.toISOString(), stripeCredit, email: user.email } });
  }
  return { ok: true, freeUntil: newFreeUntil.toISOString(), stripeCredit };
}

export async function revokeFreeMonths(userId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
  await prisma.user.update({
    where: { id: userId },
    data: { freeUntil: null, freeMonthsNote: null },
  });
  await auditLog({ userId: admin.id, action: "user.free_months.revoke", target: userId, meta: { email: user?.email } });
}

export async function deleteUserAdmin(userId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Accès refusé.");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (admin?.role !== "ADMIN") throw new Error("Accès refusé.");
  if (admin.id === userId) throw new Error("Impossible de supprimer son propre compte.");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, stripeSubscriptionId: true, teamId: true, teamRole: true },
  });

  if (user?.stripeSubscriptionId) {
    try {
      const { stripe } = await import("@/lib/stripe");
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch (e) {
      console.warn("[ADMIN DELETE] Stripe cancel failed:", e);
    }
  }

  const ownedTeam = await prisma.team.findFirst({
    where: { ownerId: userId },
    select: { id: true, stripeSubscriptionId: true, users: { select: { id: true } } },
  });

  if (ownedTeam) {
    if (ownedTeam.stripeSubscriptionId) {
      try {
        const { stripe } = await import("@/lib/stripe");
        await stripe.subscriptions.cancel(ownedTeam.stripeSubscriptionId);
      } catch (e) {
        console.warn("[ADMIN DELETE] Team Stripe cancel failed:", e);
      }
    }
    const memberIds = ownedTeam.users.filter((m) => m.id !== userId).map((m) => m.id);
    if (memberIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: memberIds } } });
    }
    await prisma.team.delete({ where: { id: ownedTeam.id } });
  }

  await prisma.user.delete({ where: { id: userId } });
  await auditLog({ userId: admin.id, action: "user.delete", target: userId, meta: { email: user?.email } });
}

export async function banUserAdmin(userId: string, reason: string) {
  const admin = await checkAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, isBanned: true } });
  if (!user) throw new Error("Utilisateur introuvable");
  if (user.isBanned) throw new Error("Utilisateur déjà banni");

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: true, bannedAt: new Date(), bannedReason: reason || null, bannedBy: admin.id },
  });
  await auditLog({ userId: admin.id, action: "user.ban", target: userId, meta: { email: user.email, reason } });
}

export async function unbanUserAdmin(userId: string) {
  const admin = await checkAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, isBanned: true } });
  if (!user) throw new Error("Utilisateur introuvable");
  if (!user.isBanned) throw new Error("Utilisateur non banni");

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: false, bannedAt: null, bannedReason: null, bannedBy: null },
  });
  await auditLog({ userId: admin.id, action: "user.unban", target: userId, meta: { email: user.email } });
}

export async function assignUserToTeam(userId: string, teamId: string, role: string = "MEMBER") {
  const admin = await checkAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, teamId: true } });
  if (!user) throw new Error("Utilisateur introuvable");
  if (user.teamId) throw new Error("L'utilisateur est déjà dans une équipe. Retirez-le d'abord.");

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { users: { select: { id: true } } },
  });
  if (!team) throw new Error("Équipe introuvable");

  const owner = await prisma.user.findUnique({ where: { id: team.ownerId }, select: { plan: true } });
  const baseMap: Record<string, number> = { RESEAU: 5, EQUIPE: 5, TEAM_5: 5, CABINET: 3, TEAM_3: 3, PRO: 3 };
  const teamExtra = await prisma.team.findUnique({ where: { id: teamId }, select: { extraSeats: true } });
  const limit = (baseMap[owner?.plan ?? ""] ?? 1) + (owner?.plan === "RESEAU" ? (teamExtra?.extraSeats ?? 0) : 0);
  if (team.users.length >= limit) throw new Error(`Équipe pleine (${team.users.length}/${limit} postes).`);

  await prisma.user.update({
    where: { id: userId },
    data: { teamId, teamRole: role },
  });

  await auditLog({ userId: admin.id, action: "user.team.assign", target: userId, meta: { teamId, role, email: user.email } });
  return { success: true };
}

export async function removeUserFromTeam(userId: string) {
  const admin = await checkAdmin();

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, teamId: true, teamRole: true } });
  if (!user) throw new Error("Utilisateur introuvable");
  if (!user.teamId) throw new Error("L'utilisateur n'est dans aucune équipe.");

  const team = await prisma.team.findUnique({ where: { id: user.teamId }, select: { ownerId: true } });
  if (team?.ownerId === userId) throw new Error("Impossible de retirer le propriétaire de l'équipe.");

  await prisma.user.update({
    where: { id: userId },
    data: { teamId: null, teamRole: "MEMBER", storeId: null },
  });

  await auditLog({ userId: admin.id, action: "user.team.remove", target: userId, meta: { email: user.email } });
  return { success: true };
}

export async function purgeOrphanTeams(): Promise<{ count: number }> {
  await checkAdmin();
  const allTeams = await prisma.team.findMany({ select: { id: true }, take: 10000 });
  const teamsWithMembers = await prisma.user.groupBy({
    by: ["teamId"],
    where: { teamId: { not: null } },
  });
  const teamIdsWithMembers = new Set(teamsWithMembers.map(t => t.teamId));
  const orphanIds = allTeams.filter(t => !teamIdsWithMembers.has(t.id)).map(t => t.id);
  if (orphanIds.length > 0) {
    await prisma.team.deleteMany({ where: { id: { in: orphanIds } } });
  }
  return { count: orphanIds.length };
}
