/** Implémentation Powens (ex-Budget Insight) API. Exports: createPowensProvider. ~180 lignes */

import type { BankProvider, BankAccount, BankTransaction, ConnectResult, TokenPair } from "./types";

function getConfig() {
  const clientId = process.env.POWENS_CLIENT_ID;
  const clientSecret = process.env.POWENS_CLIENT_SECRET;
  const domain = process.env.POWENS_DOMAIN || "audibot.biapi.pro";
  if (!clientId || !clientSecret) {
    throw new Error("POWENS_CLIENT_ID et POWENS_CLIENT_SECRET requis");
  }
  return { clientId, clientSecret, domain, baseUrl: `https://${domain}/2.0` };
}

async function powensFetch(
  path: string,
  options: RequestInit & { accessToken?: string } = {}
): Promise<any> {
  const { baseUrl } = getConfig();
  const { accessToken, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(fetchOpts.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${baseUrl}${path}`, { ...fetchOpts, headers });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Powens API ${res.status}: ${body}`);
  }

  return res.json();
}

export function createPowensProvider(): BankProvider {
  return {
    name: "powens",

    async createConnectUrl({ email, redirectUri, state }) {
      const { clientId, clientSecret, domain } = getConfig();

      // 1. Créer un utilisateur + token permanent
      const auth = await powensFetch("/auth/init", {
        method: "POST",
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
      });

      // 2. Obtenir un code temporaire pour le webview
      const codeRes = await powensFetch("/auth/token/code", {
        accessToken: auth.auth_token,
      });

      // 3. Construire l'URL du webview Connect
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        code: codeRes.code || codeRes,
        state: JSON.stringify({ state, userId: String(auth.id_user), token: auth.auth_token }),
        account_types: "checking,card,savings",
      });

      return `https://${domain}/2.0/auth/webview/fr/connect?${params.toString()}`;
    },

    async handleCallback(code) {
      const { clientId, clientSecret } = getConfig();

      // Échanger le code temporaire contre un token permanent
      const auth = await powensFetch("/auth/token", {
        method: "POST",
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
        }),
      });

      const accessToken = auth.access_token;

      // Récupérer les comptes
      const accountsRes = await powensFetch("/users/me/accounts", { accessToken });
      const accounts: BankAccount[] = (accountsRes.accounts || []).map((a: any) => ({
        id: String(a.id),
        iban: a.iban || null,
        name: a.name || a.original_name || "Compte",
        bankName: a.connector?.name || "Banque",
      }));

      return {
        externalUserId: String(auth.id_user || ""),
        accessToken,
        accounts,
      };
    },

    async listAccounts(accessToken) {
      const res = await powensFetch("/users/me/accounts", { accessToken });
      return (res.accounts || []).map((a: any) => ({
        id: String(a.id),
        iban: a.iban || null,
        name: a.name || a.original_name || "Compte",
        bankName: a.connector?.name || "Banque",
      }));
    },

    async listTransactions(accessToken, accountId, since) {
      const transactions: BankTransaction[] = [];
      const sinceStr = since.toISOString().split("T")[0];
      let offset = 0;
      const limit = 100;

      while (true) {
        const res = await powensFetch(
          `/users/me/accounts/${accountId}/transactions?min_date=${sinceStr}&limit=${limit}&offset=${offset}`,
          { accessToken }
        );

        const txns = res.transactions || [];
        if (txns.length === 0) break;

        for (const t of txns) {
          transactions.push({
            id: String(t.id),
            date: new Date(t.date || t.application_date),
            label: t.original_wording || t.simplified_wording || t.value || "",
            amount: t.amount,
            reference: t.original_wording || null,
          });
        }

        if (txns.length < limit) break;
        offset += limit;
      }

      return transactions;
    },

    async refreshAccessToken(refreshToken) {
      // Powens : les tokens permanents n'expirent pas.
      // On retourne le même token. Si invalide, il faudra re-connecter.
      return { accessToken: refreshToken, refreshToken };
    },

    async deleteConnection(accessToken) {
      const res = await powensFetch("/users/me/connections", { accessToken });
      const connections = res.connections || [];
      for (const conn of connections) {
        await powensFetch(`/users/me/connections/${conn.id}`, {
          method: "DELETE",
          accessToken,
        });
      }
    },
  };
}
