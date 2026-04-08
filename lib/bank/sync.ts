/** Logique de synchronisation bancaire. Exports: syncConnection, syncAllConnections. ~150 lignes */

import { prisma } from "@/lib/db";
import { getProvider } from "./provider";
import { extractOrganisme } from "./organisme";
import { runMatching } from "./matching";
import { decrypt, encrypt, tryDecrypt } from "@/lib/serverCrypto";
import type { BankProviderName } from "./types";

interface SyncResult {
  connectionId: string;
  imported: number;
  error?: string;
}

interface SyncAllResult {
  results: SyncResult[];
  matchResults: { userId: string; total: number; autoConfirmed: number }[];
}

/** Sync une seule connexion bancaire. Retourne le nombre de lignes importées. */
export async function syncConnection(connectionId: string): Promise<SyncResult> {
  const connection = await (prisma as any).bankConnection.findUnique({
    where: { id: connectionId },
  });
  if (!connection || connection.status !== "ACTIVE") {
    return { connectionId, imported: 0, error: "Connexion inactive ou introuvable" };
  }

  const provider = getProvider(connection.provider as BankProviderName);
  const since = connection.lastSyncAt ?? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 jours par défaut

  try {
    // Déchiffrer le token (tryDecrypt pour migration progressive des tokens en clair)
    let accessToken = tryDecrypt(connection.accessToken) ?? connection.accessToken;

    // Tenter le refresh si le token pourrait être expiré
    if (connection.refreshToken) {
      try {
        const decryptedRefresh = tryDecrypt(connection.refreshToken) ?? connection.refreshToken;
        const tokens = await provider.refreshAccessToken(decryptedRefresh);
        accessToken = tokens.accessToken;
        await (prisma as any).bankConnection.update({
          where: { id: connectionId },
          data: {
            accessToken: encrypt(tokens.accessToken),
            ...(tokens.refreshToken ? { refreshToken: encrypt(tokens.refreshToken) } : {}),
          },
        });
      } catch {
        // Le refresh a échoué — on tente quand même avec le token actuel
      }
    }

    const transactions = await provider.listTransactions(
      accessToken,
      connection.externalAccountId,
      since
    );

    if (transactions.length === 0) {
      await (prisma as any).bankConnection.update({
        where: { id: connectionId },
        data: { lastSyncAt: new Date(), lastError: null },
      });
      return { connectionId, imported: 0 };
    }

    // Filtrer montants positifs (crédits = paiements reçus)
    const credits = transactions.filter((t) => t.amount > 0);

    const result = await (prisma as any).ligneReleveBancaire.createMany({
      data: credits.map((t) => ({
        userId: connection.userId,
        date: t.date,
        libelle: t.label,
        montant: t.amount,
        organisme: extractOrganisme(t.label),
        reference: t.reference,
        statut: "NON_RAPPROCHE",
        source: connection.provider,
        externalId: t.id,
        bankConnectionId: connectionId,
      })),
      skipDuplicates: true,
    });

    await (prisma as any).bankConnection.update({
      where: { id: connectionId },
      data: { lastSyncAt: new Date(), lastError: null },
    });

    return { connectionId, imported: result.count };
  } catch (err: any) {
    const errorMsg = err?.message || "Erreur inconnue";
    const isTokenError = /401|unauthorized|expired|invalid.*token/i.test(errorMsg);

    await (prisma as any).bankConnection.update({
      where: { id: connectionId },
      data: {
        lastError: errorMsg.slice(0, 500),
        ...(isTokenError ? { status: "EXPIRED" } : {}),
      },
    });

    return { connectionId, imported: 0, error: errorMsg };
  }
}

/** Sync toutes les connexions actives + lance le matching pour chaque user. */
export async function syncAllConnections(): Promise<SyncAllResult> {
  const connections = await (prisma as any).bankConnection.findMany({
    where: { status: "ACTIVE" },
    orderBy: { lastSyncAt: "asc" },
    take: 200,
  });

  const results: SyncResult[] = [];
  const usersSynced = new Set<string>();

  for (const conn of connections) {
    const result = await syncConnection(conn.id);
    results.push(result);
    if (result.imported > 0) {
      usersSynced.add(conn.userId);
    }
    // Throttle entre connexions
    await new Promise((r) => setTimeout(r, 200));
  }

  // Auto-matching pour chaque user qui a reçu de nouvelles transactions
  const matchResults: { userId: string; total: number; autoConfirmed: number }[] = [];
  for (const userId of usersSynced) {
    try {
      const match = await runMatching(userId);
      matchResults.push({ userId, total: match.total, autoConfirmed: match.autoConfirmed });
    } catch (err) {
      console.error(`[bank-sync] matching error for user ${userId}:`, err);
    }
  }

  return { results, matchResults };
}
