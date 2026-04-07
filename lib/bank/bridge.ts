/** Implémentation Bridge (Bankin) API v3. Exports: createBridgeProvider. ~180 lignes */

import type { BankProvider, BankAccount, BankTransaction, ConnectResult, TokenPair } from "./types";

const BASE_URL = "https://api.bridgeapi.io";
const API_VERSION = "2025-01-15";

function getCredentials() {
  const clientId = process.env.BRIDGE_CLIENT_ID;
  const clientSecret = process.env.BRIDGE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("BRIDGE_CLIENT_ID et BRIDGE_CLIENT_SECRET requis");
  }
  return { clientId, clientSecret };
}

async function bridgeFetch(
  path: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<any> {
  const { clientId, clientSecret } = getCredentials();
  const { accessToken, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Bridge-Version": API_VERSION,
    "Client-Id": clientId,
    "Client-Secret": clientSecret,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(fetchOpts.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...fetchOpts, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Bridge API ${res.status}: ${body}`);
  }

  return res.json();
}

export function createBridgeProvider(): BankProvider {
  return {
    name: "bridge",

    async createConnectUrl({ email, redirectUri, state }) {
      // 1. Créer un utilisateur Bridge
      const user = await bridgeFetch("/v3/aggregation/users", {
        method: "POST",
        body: JSON.stringify({ external_user_id: state }),
      });

      // 2. Obtenir un access token pour cet utilisateur
      const auth = await bridgeFetch("/v3/aggregation/authorization/token", {
        method: "POST",
        body: JSON.stringify({ user_uuid: user.uuid }),
      });

      // 3. Créer une connect session
      const session = await bridgeFetch("/v3/aggregation/connect-sessions", {
        method: "POST",
        accessToken: auth.access_token,
        body: JSON.stringify({
          user_email: email,
          callback_url: `${redirectUri}?state=${encodeURIComponent(state)}&user_uuid=${user.uuid}`,
          country: "fr",
        }),
      });

      return session.url;
    },

    async handleCallback(callbackQuery) {
      const params = new URLSearchParams(callbackQuery);
      const userUuid = params.get("user_uuid") || callbackQuery;

      // Obtenir un token pour l'utilisateur
      const auth = await bridgeFetch("/v3/aggregation/authorization/token", {
        method: "POST",
        body: JSON.stringify({ user_uuid: userUuid }),
      });

      const accessToken = auth.access_token;

      // Récupérer les comptes
      const accountsRes = await bridgeFetch("/v3/aggregation/accounts", { accessToken });
      const accounts: BankAccount[] = (accountsRes.resources || []).map((a: any) => ({
        id: String(a.id),
        iban: a.iban || null,
        name: a.name || "Compte",
        bankName: a.bank_name || "Banque",
      }));

      return {
        externalUserId: userUuid,
        accessToken,
        refreshToken: userUuid, // Bridge n'a pas de refresh token — on stocke le uuid pour ré-authentifier
        accounts,
      };
    },

    async listAccounts(accessToken) {
      const res = await bridgeFetch("/v3/aggregation/accounts", { accessToken });
      return (res.resources || []).map((a: any) => ({
        id: String(a.id),
        iban: a.iban || null,
        name: a.name || "Compte",
        bankName: a.bank_name || "Banque",
      }));
    },

    async listTransactions(accessToken, accountId, since) {
      const transactions: BankTransaction[] = [];
      const sinceStr = since.toISOString().split("T")[0];
      let path: string | null = `/v3/aggregation/accounts/${accountId}/transactions?min_date=${sinceStr}&limit=100`;

      while (path) {
        const res = await bridgeFetch(path, { accessToken });
        for (const t of res.resources || []) {
          transactions.push({
            id: String(t.id),
            date: new Date(t.date),
            label: t.clean_description || t.provider_description || "",
            amount: t.amount,
            reference: t.provider_description || null,
          });
        }
        path = res.pagination?.next_uri || null;
      }

      return transactions;
    },

    async refreshAccessToken(refreshToken) {
      // Bridge : pas de refresh token, on ré-authentifie avec le user_uuid
      const auth = await bridgeFetch("/v3/aggregation/authorization/token", {
        method: "POST",
        body: JSON.stringify({ user_uuid: refreshToken }),
      });
      return {
        accessToken: auth.access_token,
        refreshToken, // uuid reste le même
      };
    },

    async deleteConnection(accessToken) {
      // Supprimer tous les items (connexions bancaires) de l'utilisateur
      const items = await bridgeFetch("/v3/aggregation/items", { accessToken });
      for (const item of items.resources || []) {
        await bridgeFetch(`/v3/aggregation/items/${item.id}`, {
          method: "DELETE",
          accessToken,
        });
      }
    },
  };
}
