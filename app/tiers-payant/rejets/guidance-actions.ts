"use server";

import { prisma } from "@/lib/db";

interface GuidanceResult {
  id: string;
  titre: string;
  description: string;
  actionType: string;
  actionUrl: string | null;
  portail: string;
}

export async function getGuidanceForRejet(
  motif: string | null,
  portail: string
): Promise<GuidanceResult | null> {
  if (!motif) return null;

  const allGuidances = await prisma.rejetGuidance.findMany({
    where: { actif: true, portail },
    orderBy: { priorite: "desc" },
  });

  const motifLower = motif.toLowerCase();
  const match = allGuidances.find((g) =>
    motifLower.includes(g.motifPattern.toLowerCase())
  );

  if (!match) return null;

  return {
    id: match.id,
    titre: match.titre,
    description: match.description,
    actionType: match.actionType,
    actionUrl: match.actionUrl,
    portail: match.portail,
  };
}

export async function getGuidancesForRejets(
  rejets: { id: string; motif: string | null; portail: string }[]
): Promise<Record<string, GuidanceResult>> {
  const guidances = await prisma.rejetGuidance.findMany({
    where: { actif: true },
    orderBy: { priorite: "desc" },
  });

  const result: Record<string, GuidanceResult> = {};

  for (const rejet of rejets) {
    if (!rejet.motif) continue;
    const motifLower = rejet.motif.toLowerCase();
    const match = guidances.find(
      (g) =>
        g.portail === rejet.portail &&
        motifLower.includes(g.motifPattern.toLowerCase())
    );
    if (match) {
      result[rejet.id] = {
        id: match.id,
        titre: match.titre,
        description: match.description,
        actionType: match.actionType,
        actionUrl: match.actionUrl,
        portail: match.portail,
      };
    }
  }

  return result;
}
