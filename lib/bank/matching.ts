/** Algorithme de rapprochement bancaire. Exports: runMatching, MatchResult. ~120 lignes */

import { prisma } from "@/lib/db";

export interface MatchResult {
  total: number;
  autoConfirmed: number;
  rapprochements: any[];
}

function daysDiff(a: Date, b: Date): number {
  return Math.abs((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function organismeMatch(ligneOrg: string | null, dossierMutuelle: string): boolean {
  if (!ligneOrg) return false;
  const l = ligneOrg.toUpperCase();
  const m = dossierMutuelle.toUpperCase();
  return l === m || l.includes(m) || m.includes(l);
}

/**
 * Lance le matching entre lignes bancaires non rapprochées et dossiers TP en attente.
 * Auto-confirme les matches avec score >= 1.0.
 */
export async function runMatching(userId: string): Promise<MatchResult> {
  const lignes = await (prisma as any).ligneReleveBancaire.findMany({
    where: { userId, statut: "NON_RAPPROCHE" },
    take: 500,
  });

  const dossiers = await prisma.dossierTiersPayant.findMany({
    where: {
      userId,
      statut: { in: ["EN_ATTENTE", "RECU", "EN_LITIGE"] },
    },
    take: 500,
  });

  const existingRapprochements = await (prisma as any).rapprochementBancaire.findMany({
    where: { userId },
    select: { ligneId: true, dossierId: true },
    take: 5000,
  });
  const existingSet = new Set(
    existingRapprochements.map((r: any) => `${r.ligneId}:${r.dossierId}`)
  );

  const created: any[] = [];
  const autoConfirmed: string[] = [];

  for (const ligne of lignes) {
    for (const dossier of dossiers) {
      if (existingSet.has(`${ligne.id}:${dossier.id}`)) continue;

      const ligneDate = new Date(ligne.date);
      const dossierDate = new Date(dossier.dateEnvoi);
      const diff = daysDiff(ligneDate, dossierDate);
      const montantDiff = Math.abs(ligne.montant - dossier.montant);
      const orgMatch = organismeMatch(ligne.organisme, dossier.mutuelle);

      let score = 0;
      let methode = "";

      if (montantDiff <= 0.01 && orgMatch && diff <= 7) {
        score = 1.0;
        methode = "exact_organisme_date7";
      } else if (montantDiff <= 0.01 && diff <= 15) {
        score = 0.8;
        methode = "exact_date15";
      } else if (montantDiff <= 2 && orgMatch) {
        score = 0.6;
        methode = "approx_organisme";
      }

      if (score < 0.5) continue;

      if (score >= 1.0) {
        // Transaction atomique : créer le rapprochement + mettre à jour dossier et ligne
        const [rap] = await prisma.$transaction([
          (prisma as any).rapprochementBancaire.create({
            data: { userId, ligneId: ligne.id, dossierId: dossier.id, score, methode, confirme: true },
          }),
          prisma.dossierTiersPayant.update({
            where: { id: dossier.id },
            data: { statut: "ENCAISSE" },
          }),
          (prisma as any).ligneReleveBancaire.update({
            where: { id: ligne.id },
            data: { statut: "RAPPROCHE" },
          }),
        ]);
        created.push(rap);
        autoConfirmed.push(rap.id);
      } else {
        const rap = await (prisma as any).rapprochementBancaire.create({
          data: { userId, ligneId: ligne.id, dossierId: dossier.id, score, methode, confirme: false },
        });
        created.push(rap);
      }
    }
  }

  return {
    total: created.length,
    autoConfirmed: autoConfirmed.length,
    rapprochements: created,
  };
}
