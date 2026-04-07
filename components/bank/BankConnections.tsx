"use client";

/** Section connexions bancaires DSP2 (Bridge/Powens). Exports: BankConnections. ~280 lignes */

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Link2,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  Lock,
  Zap,
  Crown,
} from "lucide-react";

interface Connection {
  id: string;
  provider: string;
  bankName: string | null;
  iban: string | null;
  label: string | null;
  status: string;
  lastSyncAt: string | null;
  lastError: string | null;
  createdAt: string;
}

interface Props {
  hasBankSync: boolean;
  onSyncComplete?: () => void;
  showToast: (msg: string, type: "success" | "error") => void;
}

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-green-100", text: "text-green-700", label: "Actif" },
  EXPIRED: { bg: "bg-amber-100", text: "text-amber-700", label: "Expiré" },
  ERROR: { bg: "bg-red-100", text: "text-red-700", label: "Erreur" },
};

export function BankConnections({ hasBankSync, onSyncComplete, showToast }: Props) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [showProviderChoice, setShowProviderChoice] = useState(false);

  const loadConnections = useCallback(async () => {
    if (!hasBankSync) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bank/accounts");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [hasBankSync]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // Détecter le retour de callback OAuth
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bankConnected = params.get("bank_connected");
    const bankError = params.get("bank_error");
    if (bankConnected) {
      showToast(`${bankConnected} compte(s) bancaire(s) connecté(s)`, "success");
      loadConnections();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (bankError) {
      showToast("Erreur lors de la connexion bancaire", "error");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [showToast, loadConnections]);

  const handleConnect = async (provider: "bridge" | "powens") => {
    setConnectingProvider(provider);
    setShowProviderChoice(false);
    try {
      const res = await fetch("/api/bank/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        showToast(data.error || "Erreur connexion", "error");
      }
    } catch {
      showToast("Erreur réseau", "error");
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/bank/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        const parts = [];
        if (data.imported > 0) parts.push(`${data.imported} transaction(s) importée(s)`);
        if (data.autoConfirmed > 0) parts.push(`${data.autoConfirmed} auto-rapproché(s)`);
        showToast(parts.length > 0 ? parts.join(", ") : "Aucune nouvelle transaction", "success");
        loadConnections();
        if (data.imported > 0) onSyncComplete?.();
      } else {
        showToast(data.error || "Erreur sync", "error");
      }
    } catch {
      showToast("Erreur réseau", "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer la connexion ${name || "bancaire"} ? Les transactions déjà importées seront conservées.`)) return;
    try {
      const res = await fetch(`/api/bank/accounts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Connexion supprimée", "success");
        setConnections((prev) => prev.filter((c) => c.id !== id));
      } else {
        showToast("Erreur suppression", "error");
      }
    } catch {
      showToast("Erreur réseau", "error");
    }
  };

  // ── Teaser pour les utilisateurs gratuits ──
  if (!hasBankSync) {
    return (
      <div className="relative mb-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 opacity-60 blur-[1px] pointer-events-none select-none">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-black text-slate-900">Connexion bancaire automatique</p>
              <p className="text-xs text-slate-600">Synchronisez vos comptes via Bridge ou Powens</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-12 bg-slate-100 rounded-xl flex-1" />
            <div className="h-12 bg-slate-100 rounded-xl flex-1" />
          </div>
        </div>
        {/* Overlay CTA */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 px-6 py-4 text-center max-w-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="font-black text-sm text-slate-900 uppercase tracking-wider">PRO</span>
            </div>
            <p className="text-sm font-bold text-slate-700 mb-3">
              Connectez votre banque et recevez vos transactions automatiquement.
            </p>
            <a
              href="/dashboard/subscription"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Passer au plan Pro
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Version complète pour les abonnés payants ──
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-black text-slate-900">Connexion bancaire</p>
            <p className="text-xs text-slate-600 font-medium">
              {connections.length > 0
                ? `${connections.length} compte(s) connecté(s)`
                : "Aucun compte connecté"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {connections.length > 0 && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Sync..." : "Synchroniser"}
            </button>
          )}
          <button
            onClick={() => setShowProviderChoice(!showProviderChoice)}
            disabled={!!connectingProvider}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <Link2 className="w-3.5 h-3.5" />
            {connectingProvider ? "Connexion..." : "Connecter"}
          </button>
        </div>
      </div>

      {/* Provider choice dropdown */}
      {showProviderChoice && (
        <div className="flex gap-2 mb-4 p-3 bg-slate-50 rounded-2xl">
          <button
            onClick={() => handleConnect("bridge")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <span className="font-black text-sm text-slate-700">Bridge</span>
            <span className="text-xs text-slate-600">(Bankin)</span>
          </button>
          <button
            onClick={() => handleConnect("powens")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
          >
            <span className="font-black text-sm text-slate-700">Powens</span>
            <span className="text-xs text-slate-600">(Budget Insight)</span>
          </button>
        </div>
      )}

      {/* Connected accounts list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : connections.length > 0 ? (
        <div className="space-y-2">
          {connections.map((conn) => {
            const badge = STATUS_BADGE[conn.status] || STATUS_BADGE.ERROR;
            return (
              <div
                key={conn.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                    <Building2 className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-700 truncate">
                        {conn.bankName || conn.label || "Compte bancaire"}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-black ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      {conn.iban && <span className="font-mono">{conn.iban}</span>}
                      <span className="capitalize">{conn.provider}</span>
                      {conn.lastSyncAt && (
                        <span>
                          Sync {new Date(conn.lastSyncAt).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </div>
                    {conn.lastError && conn.status !== "ACTIVE" && (
                      <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {conn.lastError.slice(0, 80)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(conn.id, conn.bankName || conn.label || "")}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Lock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">
            Connectez votre banque pour automatiser l&apos;import des transactions.
          </p>
          <p className="text-xs text-slate-700 mt-1">
            99% des banques françaises supportées via DSP2.
          </p>
        </div>
      )}
    </div>
  );
}
