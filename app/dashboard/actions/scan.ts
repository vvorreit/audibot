"use server";

import { prisma } from "@/lib/db";
import { getSession } from "./helpers";

// generateAutofillPayload volontairement supprimé côté serveur.
// Le payload contient NSS, nom, prénom, données ordonnance — il ne doit jamais transiter par le serveur.
// Utiliser generatePayloadString() directement côté client (lib/autofill.ts).

export async function incrementClientCountInDB() {
  try {
    const session = await getSession();
    if (!session?.user?.email) throw new Error("Non autorisé");

    const currentUser = await prisma.user.findUnique({
      where: { id: (session?.user as {id: string})?.id ?? '' },
      select: { plan: true, monthlyScanCount: true, monthlyScanResetAt: true }
    });

    if (!currentUser) throw new Error("Utilisateur introuvable");

    // Reset compteur mensuel si nouveau mois, puis incrémenter atomiquement
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const needsReset = !currentUser.monthlyScanResetAt || currentUser.monthlyScanResetAt < monthStart;

    const user = await prisma.user.update({
      where: { id: (session?.user as {id: string})?.id ?? '' },
      data: {
        clientCount: { increment: 1 },
        monthlyScanCount: needsReset ? 1 : { increment: 1 },
        monthlyScanResetAt: now,
        lastActiveAt: now,
      }
    });

    return user.clientCount;
  } catch (error) {
    console.error("Erreur incrementClientCountInDB:", error);
    throw error;
  }
}

export async function logOcrScan(data: {
  type: string;
  success: boolean;
  ocrConfidence: number;
  dataScore: number;
  globalScore: number;
  level: string;
  fileName?: string;
}) {
  try {
    const session = await getSession();
    if (!session?.user?.email) return;

    const user = await prisma.user.findUnique({
      where: { id: (session?.user as {id: string})?.id ?? '' },
      select: { id: true },
    });
    if (!user) return;

    await prisma.ocrScanLog.create({
      data: {
        userId: user.id,
        type: data.type,
        success: data.success,
        ocrConfidence: data.ocrConfidence,
        dataScore: data.dataScore,
        globalScore: data.globalScore,
        level: data.level,
        fileName: data.fileName,
      },
    });
  } catch (error) {
    console.error("Erreur logOcrScan:", error);
  }
}
