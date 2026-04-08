"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useFeature } from "@/hooks/useFeatures";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Euro,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { ToastContainer, useToast } from "@/components/Toast";

interface LigneReleve {
  id: string;
  date: string;
  libelle: string;
  montant: number;
  organisme: string | null;
  statut: string;
}

interface Rapprochement {
  id: string;
  score: number;
  methode: string;
  confirme: boolean;
  createdAt: string;
  ligne: LigneReleve;
  dossier: {
    id: string;
    reference: string;
    mutuelle: string;
    montant: number;
    dateEnvoi: string;
    statut: string;
  };
}

type Tab = "import" | "confirmer" | "historique";

const SCORE_COLOR: Record<string, string> = {
  "1.0": "bg-green-100 text-green-700",
  "0.8": "bg-amber-100 text-amber-700",
  "0.6": "bg-blue-100 text-blue-700",
};

function scoreColor(score: number) {
  if (score >= 1.0) return SCORE_COLOR["1.0"];
  if (score >= 0.8) return SCORE_COLOR["0.8"];
  return SCORE_COLOR["0.6"];
}

function scoreLabel(score: number) {
  if (score >= 1.0) return "Auto";
  if (score >= 0.8) return "Montant ✓";
  return "Approx";
}

export default function RapprochementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasRapprochementAccess = useFeature("rapprochement");

  const [tab, setTab] = useState<Tab>("import");
  const [dragging, setDragging] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; lignes: LigneReleve[] } | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<{ total: number; autoConfirmed: number } | null>(null);
  const [rapprochements, setRapprochements] = useState<Rapprochement[]>([]);
  const [loadingRap, setLoadingRap] = useState(false);
  const [totalEncaisse, setTotalEncaisse] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toasts, showToast, dismissToast } = useToast();

  const loadRapprochements = useCallback(async (confirmeFilter?: boolean) => {
    setLoadingRap(true);
    try {
      const url =
        confirmeFilter !== undefined
          ? `/api/tiers-payant/rapprochement?confirme=${confirmeFilter}`
          : "/api/tiers-payant/rapprochement";
      const res = await fetch(url);
      const data = await res.json();
      setRapprochements(data.rapprochements || []);
      if (confirmeFilter === true) {
        const total = (data.rapprochements || []).reduce(
          (acc: number, r: Rapprochement) => acc + r.ligne.montant,
          0
        );
        setTotalEncaisse(total);
      }
    } finally {
      setLoadingRap(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading" || hasRapprochementAccess === null) return;
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
    if (!session || (!isAdmin && !hasRapprochementAccess)) {
      router.replace("/tiers-payant");
    }
  }, [session, status, router, hasRapprochementAccess]);

  useEffect(() => {
    if (tab === "confirmer") loadRapprochements(false);
    if (tab === "historique") loadRapprochements(true);
  }, [tab, loadRapprochements]);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  if (status === "loading" || hasRapprochementAccess === null || !session || (!isAdmin && !hasRapprochementAccess)) {
    return null;
  }

  const handleFile = async (file: File) => {
    setImportLoading(true);
    setImportResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/tiers-payant/releve", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erreur import", "error");
      } else {
        setImportResult(data);
        showToast(`${data.imported} ligne(s) importée(s)`, "success");
      }
    } catch {
      showToast("Erreur réseau", "error");
    } finally {
      setImportLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const runMatching = async () => {
    setMatchLoading(true);
    setMatchResult(null);
    try {
      const res = await fetch("/api/tiers-payant/rapprochement", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erreur matching", "error");
      } else {
        setMatchResult(data);
        showToast(`${data.total} rapprochement(s) trouvé(s), ${data.autoConfirmed} auto-confirmé(s)`, "success");
        if (data.total > 0) setTab("confirmer");
      }
    } catch {
      showToast("Erreur réseau", "error");
    } finally {
      setMatchLoading(false);
    }
  };

  const handleAction = async (id: string, confirme: boolean) => {
    try {
      const res = await fetch(`/api/tiers-payant/rapprochement/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirme }),
      });
      if (res.ok) {
        showToast(confirme ? "Rapprochement confirmé — dossier encaissé" : "Rapprochement rejeté", "success");
        setRapprochements((prev) => prev.filter((r) => r.id !== id));
      } else {
        const d = await res.json();
        showToast(d.error || "Erreur", "error");
      }
    } catch {
      showToast("Erreur réseau", "error");
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "import", label: "Import" },
    { key: "confirmer", label: "À confirmer" },
    { key: "historique", label: "Historique" },
  ];

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/tiers-payant"
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rapprochement Bancaire</h1>
          <p className="text-sm text-slate-600 font-medium">Tiers-Payant — import &amp; matching automatique</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-8 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-700 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Import ── */}
      {tab === "import" && (
        <div className="space-y-6">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all ${
              dragging
                ? "border-blue-400 bg-blue-50"
                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.ofx,.qfx"
              className="hidden"
              onChange={handleFileChange}
            />
            {importLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="font-bold text-slate-700">Import en cours...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <p className="font-black text-slate-700 text-lg">Déposez votre fichier ici</p>
                  <p className="text-slate-600 text-sm font-medium mt-1">
                    CSV (date;libelle;montant) ou OFX/QFX
                  </p>
                  <p className="text-slate-700 text-xs mt-0.5">ou cliquez pour sélectionner</p>
                </div>
              </div>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-black text-slate-900">{importResult.imported} ligne(s) importée(s)</p>
                  <p className="text-xs text-slate-600 font-medium">Seules les lignes montant &gt; 0 sont conservées</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {importResult.lignes.slice(0, 20).map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700 truncate">{l.libelle}</p>
                      <p className="text-xs text-slate-600">
                        {new Date(l.date).toLocaleDateString("fr-FR")}
                        {l.organisme && <span className="ml-2 text-blue-500 font-bold">{l.organisme}</span>}
                      </p>
                    </div>
                    <span className="font-black text-green-600 ml-4 shrink-0">
                      +{l.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </span>
                  </div>
                ))}
                {importResult.lignes.length > 20 && (
                  <p className="text-xs text-slate-600 text-center py-2">
                    … et {importResult.lignes.length - 20} autres
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Match result summary */}
          {matchResult && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm font-bold text-amber-700">
                {matchResult.total} rapprochement(s) trouvé(s) — {matchResult.autoConfirmed} confirmé(s) automatiquement.
                {matchResult.total - matchResult.autoConfirmed > 0 && (
                  <button onClick={() => setTab("confirmer")} className="ml-2 underline">
                    Voir les {matchResult.total - matchResult.autoConfirmed} à confirmer
                  </button>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: À confirmer ── */}
      {tab === "confirmer" && (
        <div>
          {loadingRap ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : rapprochements.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
              <CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-slate-600">Aucun rapprochement à confirmer.</p>
              <p className="text-sm text-slate-700 mt-1">Importez un relevé et lancez le matching.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rapprochements.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Score badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-2xs font-black uppercase ${scoreColor(r.score)}`}>
                          Score {Math.round(r.score * 100)}% — {scoreLabel(r.score)}
                        </span>
                        <span className="text-xs text-slate-700 font-medium">{r.methode}</span>
                      </div>

                      {/* Dossier info */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-2xs font-black text-slate-600 uppercase mb-1">Dossier TP</p>
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="font-black text-slate-700">{r.dossier.reference}</span>
                          </div>
                          <p className="text-xs text-slate-700 font-medium mt-0.5">{r.dossier.mutuelle}</p>
                          <p className="text-xs font-black text-slate-700 mt-1">
                            {r.dossier.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(r.dossier.dateEnvoi).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                          <p className="text-2xs font-black text-slate-600 uppercase mb-1">Ligne relevé</p>
                          <p className="font-bold text-slate-700 text-xs truncate">{r.ligne.libelle}</p>
                          {r.ligne.organisme && (
                            <p className="text-xs text-blue-500 font-bold">{r.ligne.organisme}</p>
                          )}
                          <p className="text-xs font-black text-green-600 mt-1">
                            +{r.ligne.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                          </p>
                          <p className="text-xs text-slate-600">
                            {new Date(r.ligne.date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleAction(r.id, true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white font-bold rounded-xl text-sm hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmer
                    </button>
                    <button
                      onClick={() => handleAction(r.id, false)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Historique ── */}
      {tab === "historique" && (
        <div>
          {/* Total encaissé */}
          <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                <Euro className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xs font-black text-slate-600 uppercase">Total encaissé via rapprochement</p>
                <p className="text-2xl font-black text-green-600">
                  {totalEncaisse.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-600 font-medium">{rapprochements.length} dossier(s)</span>
          </div>

          {loadingRap ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : rapprochements.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center">
              <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-slate-600">Aucun rapprochement confirmé pour l&apos;instant.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rapprochements.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      <span className="font-black text-sm text-slate-700">{r.dossier.reference}</span>
                      <span className="text-xs text-slate-600 font-medium">{r.dossier.mutuelle}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate ml-6">{r.ligne.libelle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-green-600 text-sm">
                      +{r.ligne.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                    </p>
                    <p className="text-2xs text-slate-600">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating button — Lancer le matching */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={runMatching}
          disabled={matchLoading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm"
        >
          {matchLoading ? (
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          {matchLoading ? "Matching en cours..." : "▶ Lancer le matching"}
        </button>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
