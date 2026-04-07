/** Types partagés pour l'intégration bancaire DSP2. Exports: BankAccount, BankTransaction, BankProvider. */

export type BankProviderName = "bridge" | "powens";

export interface BankAccount {
  id: string;
  iban: string | null;
  name: string;
  bankName: string;
}

export interface BankTransaction {
  id: string;
  date: Date;
  label: string;
  amount: number;
  reference: string | null;
}

export interface ConnectResult {
  externalUserId: string;
  accessToken: string;
  refreshToken?: string;
  accounts: BankAccount[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

export interface BankProvider {
  name: BankProviderName;
  /** Génère l'URL du widget de connexion bancaire. */
  createConnectUrl(params: {
    email: string;
    redirectUri: string;
    state: string;
  }): Promise<string>;
  /** Traite le callback OAuth après connexion. */
  handleCallback(code: string): Promise<ConnectResult>;
  /** Liste les comptes bancaires d'un utilisateur connecté. */
  listAccounts(accessToken: string): Promise<BankAccount[]>;
  /** Liste les transactions d'un compte depuis une date. */
  listTransactions(
    accessToken: string,
    accountId: string,
    since: Date
  ): Promise<BankTransaction[]>;
  /** Rafraîchit le token d'accès. */
  refreshAccessToken(refreshToken: string): Promise<TokenPair>;
  /** Supprime la connexion chez le provider. */
  deleteConnection(accessToken: string): Promise<void>;
}
