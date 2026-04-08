"use server";

import { prisma } from "@/lib/db";
import { checkAdmin } from "./auth";

export async function getFranchiseLeads() {
  await checkAdmin();
  const leads = await (prisma as any).franchiseLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { statusHistory: { orderBy: { createdAt: "asc" } } },
  });
  return (leads as any[]).map((l) => ({
    id: l.id as string,
    name: l.name as string,
    email: l.email as string,
    phone: l.phone as string,
    company: l.company as string,
    stores: l.stores as string,
    seats: l.seats as string | null,
    erp: l.erp as string | null,
    message: l.message as string | null,
    status: l.status as string,
    notes: l.notes as string | null,
    reseau: l.reseau as string | null,
    nbMagasins: l.nbMagasins as string | null,
    createdAt: (l.createdAt as Date).toISOString(),
    statusHistory: (l.statusHistory as any[]).map((h) => ({
      id: h.id as string,
      oldStatus: h.oldStatus as string,
      newStatus: h.newStatus as string,
      note: h.note as string | null,
      createdAt: (h.createdAt as Date).toISOString(),
    })),
  }));
}

export async function updateFranchiseLeadStatus(leadId: string, status: string, notes?: string) {
  await checkAdmin();
  const STATUTS = ["NEW", "CONTACTED", "QUALIFIED", "CLOSED_WON", "CLOSED_LOST"] as const;
  if (!STATUTS.includes(status as typeof STATUTS[number])) throw new Error("Statut invalide.");

  const current = await (prisma as any).franchiseLead.findUnique({
    where: { id: leadId },
    select: { status: true },
  });
  const oldStatus = (current?.status as string) ?? "NEW";

  const [, updated] = await (prisma as any).$transaction([
    (prisma as any).franchiseLeadStatusHistory.create({
      data: { leadId, oldStatus, newStatus: status, note: notes ?? null },
    }),
    (prisma as any).franchiseLead.update({
      where: { id: leadId },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
      select: { id: true, status: true },
    }),
  ]);
  return updated;
}

export async function getFranchiseAlerts() {
  await checkAdmin();
  const threshold = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const count = await (prisma as any).franchiseLead.count({
    where: { status: "NEW", createdAt: { lt: threshold } },
  });
  return { count } as { count: number };
}
