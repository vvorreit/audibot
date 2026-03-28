"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updatePassword, updateUserName, exportUserData } from "./actions";
import { getChurnRetentionOffer, submitChurnReason } from "./churn-actions";
import { schedulePlanDowngrade, cancelPlanDowngrade, createPortalSession } from "@/app/dashboard/actions";
import { Download, ShieldCheck, Pencil, Check, X as XIcon, Trash2, CreditCard, AlertTriangle, Smartphone, Lock } from "lucide-react";
import Link from "next/link";

interface AccountClientProps {
  dpaStatus: { current_version: string; accepted_version: string | null; accepted_at: string | null; is_current: boolean } | null;
}

export default function AccountClient({ dpaStatus }: AccountClientProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const [downgradeLoading, setDowngradeLoading] = useState<string | null>(null);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwConfirmTouched, setPwConfirmTouched] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  /* ── Churn modal state ─────────────────────────────────────────────────── */
  const [churnOpen, setChurnOpen] = useState(false);
  const [churnStep, setChurnStep] = useState<"reason" | "offer" | "done">("reason");
  const [churnReason, setChurnReason] = useState<"too_expensive" | "missing_feature" | "no_longer_needed" | null>(null);
  const [churnComment, setChurnComment] = useState("");
  const [churnOffer, setChurnOffer] = useState<{ offer: string | null; eligible: boolean; message: string } | null>(null);
  const [churnLoading, setChurnLoading] = useState(false);
  const [churnResult, setChurnResult] = useState<{ retained: boolean; message: string } | null>(null);

  /* ── 2FA state ────────────────────────────────────────────────────────── */
  const [tfaEnabled, setTfaEnabled]       = useState<boolean | null>(null);
  const [tfaStep, setTfaStep]             = useState<"idle" | "setup" | "verify" | "disable">("idle");
  const [tfaQr, setTfaQr]                 = useState<string | null>(null);
  const [tfaSecret, setTfaSecret]         = useState<string | null>(null);
  const [tfaCode, setTfaCode]             = useState("");
  const [tfaDisablePassword, setTfaDisablePassword] = useState("");
  const [tfaLoading, setTfaLoading]       = useState(false);
  const [tfaError, setTfaError]           = useState<string | null>(null);
  const [tfaSuccess, setTfaSuccess]       = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/2fa/status")
      .then(r => r.json())
      .then(d => setTfaEnabled(d.enabled ?? false))
      .catch(() => setTfaEnabled(false));
  }, []);

  const startTfaSetup = async () => {
    setTfaLoading(true); setTfaError(null);
    try {
      const res = await fetch("/api/user/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setTfaError(data.error ?? "Erreur"); return; }
      setTfaQr(data.qrCode);
      setTfaSecret(data.secret);
      setTfaStep("setup");
    } finally { setTfaLoading(false); }
  };

  const verifyTfaCode = async () => {
    setTfaLoading(true); setTfaError(null);
    try {
      const res = await fetch("/api/user/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tfaCode }),
      });
      const data = await res.json();
      if (!res.ok) { setTfaError(data.error ?? "Code incorrect"); return; }
      setTfaEnabled(true);
      setTfaStep("idle");
      setTfaCode("");
      setTfaQr(null);
      setTfaSecret(null);
      setTfaSuccess("Double authentification activée ✓");
      setTimeout(() => setTfaSuccess(null), 4000);
    } finally { setTfaLoading(false); }
  };

  const disableTfa = async () => {
    setTfaLoading(true); setTfaError(null);
    try {
      const res = await fetch("/api/user/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: tfaDisablePassword }),
      });
      const data = await res.json();
      if (!res.ok) { setTfaError(data.error ?? "Erreur"); return; }
      setTfaEnabled(false);
      setTfaStep("idle");
      setTfaDisablePassword("");
      setTfaSuccess("Double authentification désactivée.");
      setTimeout(() => setTfaSuccess(null), 4000);
    } finally { setTfaLoading(false); }
  };

  /* US-14 — Editable name */
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameToast, setNameToast] = useState<string | null>(null);

  const pwMatch = pwForm.next === pwForm.confirm;
  const pwCanSubmit = !pwLoading && pwForm.current.length > 0 && pwForm.next.length >= 8 && pwForm.confirm.length > 0 && pwMatch;

  const handleExport = async () => {
    setExportLoading(true);
    const result = await exportUserData();
    setExportLoading(false);
    if (result.error || !result.data) return alert(result.error ?? "Erreur lors de l'export.");

    const blob = new Blob([result.data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optibot-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwStatus({ type: "error", msg: "Les mots de passe ne correspondent pas." });
      return;
    }
    setPwLoading(true);
    const result = await updatePassword(pwForm.current, pwForm.next);
    setPwStatus(result.error
      ? { type: "error", msg: result.error }
      : { type: "success", msg: "Mot de passe mis à jour." }
    );
    if (!result.error) { setPwForm({ current: "", next: "", confirm: "" }); setPwConfirmTouched(false); }
    setPwLoading(false);
  };

  const openChurnModal = () => {
    setChurnOpen(true);
    setChurnStep("reason");
    setChurnReason(null);
    setChurnComment("");
    setChurnOffer(null);
    setChurnResult(null);
  };

  const handleChurnReasonSelect = async (reason: "too_expensive" | "missing_feature" | "no_longer_needed") => {
    setChurnReason(reason);
    setChurnLoading(true);
    try {
      const offer = await getChurnRetentionOffer(reason);
      setChurnOffer(offer);
    } catch {
      setChurnOffer({ offer: null, eligible: false, message: "Souhaitez-vous confirmer votre résiliation ?" });
    }
    setChurnStep("offer");
    setChurnLoading(false);
  };

  const handleChurnAcceptOffer = async () => {
    if (!churnReason || !churnOffer) return;
    setChurnLoading(true);
    try {
      const result = await submitChurnReason({
        reason: churnReason,
        comment: churnComment || undefined,
        acceptedOffer: true,
        retentionOffer: churnOffer.offer || undefined,
      });
      setChurnResult(result);
      setChurnStep("done");
    } catch {
      setChurnResult({ retained: false, message: "Une erreur est survenue." });
      setChurnStep("done");
    }
    setChurnLoading(false);
  };

  const handleChurnDeclineOffer = async () => {
    if (!churnReason) return;
    setChurnLoading(true);
    try {
      const result = await submitChurnReason({
        reason: churnReason,
        comment: churnComment || undefined,
        acceptedOffer: false,
      });
      setChurnResult(result);
      setChurnStep("done");
    } catch {
      setChurnResult({ retained: false, message: "Une erreur est survenue." });
      setChurnStep("done");
    }
    setChurnLoading(false);
  };

  const REASON_OPTIONS = [
    { value: "too_expensive" as const, label: "C'est trop cher", icon: "💰" },
    { value: "missing_feature" as const, label: "Il manque une fonctionnalité", icon: "🔧" },
    { value: "no_longer_needed" as const, label: "Je n'en ai plus besoin", icon: "👋" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        <h1 className="text-2xl font-black text-slate-900">Mon compte</h1>

        {/* Toast notification */}
        {nameToast && (
          <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl animate-fade-in">
            {nameToast}
          </div>
        )}

        {/* Infos */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8 space-y-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Informations</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">Nom</p>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-semibold focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    autoFocus
                    maxLength={100}
                  />
                  <button
                    onClick={async () => {
                      setNameLoading(true);
                      const res = await updateUserName(nameValue);
                      setNameLoading(false);
                      if (res.error) { setNameToast(res.error); setTimeout(() => setNameToast(null), 3000); return; }
                      setEditingName(false);
                      setNameToast("Nom mis à jour !");
                      setTimeout(() => setNameToast(null), 3000);
                      window.location.reload();
                    }}
                    disabled={nameLoading || nameValue.trim().length === 0}
                    className="px-3 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {nameLoading ? "..." : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="px-3 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 font-semibold">{user?.name || "—"}</p>
                  <button
                    onClick={() => { setNameValue(user?.name || ""); setEditingName(true); }}
                    className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">Email</p>
              <p className="text-slate-900 font-semibold">{user?.email || "—"}</p>
            </div>
          </div>
        </div>

        {/* Changer mot de passe — uniquement pour les comptes credentials */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Changer le mot de passe</h2>

          {pwStatus && (
            <div className={`mb-5 p-4 rounded-2xl text-sm font-semibold ${
              pwStatus.type === "success"
                ? "bg-green-50 border border-green-100 text-green-700"
                : "bg-red-50 border border-red-100 text-red-600"
            }`}>
              {pwStatus.msg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Mot de passe actuel</label>
              <input
                type="password"
                required
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Nouveau mot de passe</label>
              <input
                type="password"
                required
                minLength={8}
                value={pwForm.next}
                onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                placeholder="8 caractères minimum"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={pwForm.confirm}
                  onChange={(e) => { setPwForm({ ...pwForm, confirm: e.target.value }); if (!pwConfirmTouched) setPwConfirmTouched(true); }}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                />
                {pwConfirmTouched && pwForm.confirm.length > 0 && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {pwMatch
                      ? <Check className="w-5 h-5 text-green-500" />
                      : <XIcon className="w-5 h-5 text-red-500" />
                    }
                  </span>
                )}
              </div>
              {pwConfirmTouched && pwForm.confirm.length > 0 && !pwMatch && (
                <p className="text-xs font-semibold text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>
            <button
              type="submit"
              disabled={!pwCanSubmit}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pwLoading ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </form>
        </div>

        {/* ── 2FA ─────────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Double authentification (2FA)
          </h2>
          <p className="text-xs text-slate-400 font-medium mb-5">
            Optionnel — ajoutez une couche de sécurité supplémentaire avec une application comme Google Authenticator ou Authy.
          </p>

          {/* Toast 2FA */}
          {tfaSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-bold">
              {tfaSuccess}
            </div>
          )}
          {tfaError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold">
              {tfaError}
            </div>
          )}

          {/* État : chargement */}
          {tfaEnabled === null && (
            <p className="text-slate-400 text-sm font-medium">Chargement...</p>
          )}

          {/* État : désactivé — proposition d'activer */}
          {tfaEnabled === false && tfaStep === "idle" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-sm font-semibold text-slate-500">2FA non activé</span>
              </div>
              <button
                onClick={startTfaSetup}
                disabled={tfaLoading}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                {tfaLoading ? "..." : "Activer le 2FA"}
              </button>
            </div>
          )}

          {/* État : setup — affichage QR */}
          {tfaStep === "setup" && tfaQr && (
            <div className="space-y-5">
              <p className="text-sm font-medium text-slate-600">
                Scannez ce QR code avec <strong>Google Authenticator</strong> ou <strong>Authy</strong>.
              </p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tfaQr} alt="QR Code 2FA" className="w-44 h-44 rounded-xl border border-slate-100" />
              </div>
              {tfaSecret && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-2xs text-slate-400 font-bold uppercase tracking-widest mb-1">Code manuel</p>
                  <code className="text-sm font-black text-slate-700 tracking-widest">{tfaSecret}</code>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Entrez le code à 6 chiffres pour confirmer
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={tfaCode}
                    onChange={e => setTfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-black text-center text-xl tracking-[0.4em] focus-visible:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={verifyTfaCode}
                    disabled={tfaLoading || tfaCode.length !== 6}
                    className="px-5 py-3 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {tfaLoading ? "..." : "Valider"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setTfaStep("idle"); setTfaQr(null); setTfaSecret(null); setTfaCode(""); setTfaError(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          )}

          {/* État : activé */}
          {tfaEnabled === true && tfaStep === "idle" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-bold text-green-700">2FA activé</span>
              </div>
              <button
                onClick={() => { setTfaStep("disable"); setTfaError(null); }}
                className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Désactiver
              </button>
            </div>
          )}

          {/* État : désactivation — confirmation mot de passe */}
          {tfaStep === "disable" && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-600">
                Entrez votre mot de passe pour confirmer la désactivation du 2FA.
              </p>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={tfaDisablePassword}
                  onChange={e => setTfaDisablePassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={disableTfa}
                  disabled={tfaLoading || tfaDisablePassword.length === 0}
                  className="px-5 py-3 bg-red-600 text-white font-bold rounded-2xl text-sm hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {tfaLoading ? "..." : "Confirmer"}
                </button>
              </div>
              <button
                onClick={() => { setTfaStep("idle"); setTfaDisablePassword(""); setTfaError(null); }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Conformité légale */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Conformité légale
          </h2>
          {dpaStatus ? (
            <div className="space-y-3">
              {dpaStatus.accepted_version ? (
                <p className="text-slate-700 font-medium">
                  DPA version {dpaStatus.accepted_version} accepté le{" "}
                  <strong>{new Date(dpaStatus.accepted_at!).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</strong>
                  {!dpaStatus.is_current && (
                    <span className="ml-2 text-amber-600 font-bold">(nouvelle version {dpaStatus.current_version} disponible)</span>
                  )}
                </p>
              ) : (
                <p className="text-amber-600 font-semibold">DPA non accepté</p>
              )}
              <Link href="/legal/dpa" className="inline-block text-sm text-blue-600 font-bold hover:underline">
                Consulter l&apos;Accord de Traitement des Données (DPA)
              </Link>
            </div>
          ) : (
            <p className="text-slate-400 text-sm font-medium">Chargement...</p>
          )}
        </div>

        {/* Export RGPD */}
        <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Mes données personnelles</h2>
          <p className="text-sm font-medium text-slate-500 mb-5">
            Conformément à l&apos;<strong>article 20 du RGPD</strong>, vous pouvez télécharger l&apos;ensemble de vos données personnelles détenues par OptiBot au format JSON.
          </p>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exportLoading ? "Préparation..." : "Télécharger mes données"}
          </button>
          <p className="text-xs text-slate-400 font-medium mt-3">
            Données incluses : profil, abonnement, utilisation, équipe, fournisseurs OAuth connectés. Les données sensibles (mot de passe, tokens) sont exclues.
          </p>
        </div>

        {/* Abonnement — downgrade différé */}
        {user?.isPro && (
          <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Abonnement
            </h2>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Plan actuel</p>
                <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-full uppercase">
                  {user?.plan === "EQUIPE" || user?.plan === "TEAM_5" || user?.plan === "TEAM_3" ? "ÉQUIPE" : user?.plan}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    const { url } = await createPortalSession();
                    if (url) window.location.href = url;
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Download className="w-3 h-3" /> Factures
                </button>
                <button
                  onClick={openChurnModal}
                  className="flex items-center gap-1.5 text-xs font-black text-red-400 hover:text-red-600 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3" /> Résilier
                </button>
              </div>
            </div>

            {/* Annulation programmée via portail Stripe */}
            {user?.pendingPlan?.startsWith("FREE_AT_") && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 font-bold">
                  ⚠️ Abonnement résilié — actif jusqu&apos;au {user.pendingPlan.replace("FREE_AT_", "").replace("fin_periode", "fin de la période en cours")}
                </p>
                <p className="text-xs text-red-500 mt-1">Pour annuler la résiliation, utilisez le portail Stripe via le bouton &quot;Factures&quot;.</p>
              </div>
            )}

            {/* Downgrade planifié en attente */}
            {user?.pendingPlan && !user.pendingPlan.startsWith("FREE_AT_") && (
              <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
                <p className="text-sm text-amber-700 font-bold">
                  ⏳ Passage à <strong>{user.pendingPlan}</strong> prévu au prochain cycle de facturation
                </p>
                <button
                  onClick={async () => {
                    setDowngradeLoading("cancel");
                    try { await cancelPlanDowngrade(); window.location.reload(); }
                    catch (err: unknown) { alert(err instanceof Error ? err.message : "Erreur."); }
                    finally { setDowngradeLoading(null); }
                  }}
                  disabled={downgradeLoading !== null}
                  className="shrink-0 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-700 text-xs font-black hover:bg-amber-100 transition-colors disabled:opacity-50"
                >
                  {downgradeLoading === "cancel" ? "Chargement..." : "Annuler"}
                </button>
              </div>
            )}

            {/* Boutons downgrade — masqués si annulation ou downgrade déjà planifié */}
            {!user?.pendingPlan && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-semibold mb-3">Changer de plan (actif au prochain cycle) :</p>

                {/* Helper inline pour éviter la répétition */}
                {(() => {
                  const plan = user?.plan ?? "FREE";

                  // Matrice : plan actuel → downgrades disponibles
                  const options: { target: "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU"; label: string; price: string }[] = [];

                  if (plan === "PRO") {
                    options.push({ target: "ESSENTIEL", label: "Essentiel", price: "39,90€" });
                  }
                  if (plan === "CABINET") {
                    options.push({ target: "PRO",       label: "Pro",       price: "69,90€" });
                    options.push({ target: "ESSENTIEL", label: "Essentiel", price: "39,90€" });
                  }
                  if (plan === "RESEAU") {
                    options.push({ target: "CABINET",   label: "Cabinet",   price: "179€" });
                    options.push({ target: "PRO",       label: "Pro",       price: "69,90€" });
                    options.push({ target: "ESSENTIEL", label: "Essentiel", price: "39,90€" });
                  }
                  if (plan === "EQUIPE" || plan === "TEAM_5" || plan === "TEAM_3") {
                    options.push({ target: "RESEAU",    label: "Réseau",    price: "299€" });
                    options.push({ target: "CABINET",   label: "Cabinet",   price: "179€" });
                    options.push({ target: "PRO",       label: "Pro",       price: "69,90€" });
                    options.push({ target: "ESSENTIEL", label: "Essentiel", price: "39,90€" });
                  }

                  if (options.length === 0) return null;

                  return options.map(({ target, label, price }) => (
                    <button
                      key={target}
                      onClick={async () => {
                        if (!confirm(`Passer à ${label} au prochain cycle de facturation ?`)) return;
                        setDowngradeLoading(target);
                        try {
                          const { effectiveDate } = await schedulePlanDowngrade(target);
                          alert(`Downgrade planifié — actif le ${effectiveDate}`);
                          window.location.reload();
                        } catch (err: unknown) {
                          alert(err instanceof Error ? err.message : "Erreur.");
                        } finally {
                          setDowngradeLoading(null);
                        }
                      }}
                      disabled={downgradeLoading !== null}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-black hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      {downgradeLoading === target
                        ? "Chargement..."
                        : `Passer à ${label} — ${price} HT/mois (mois suivant)`}
                    </button>
                  ));
                })()}
              </div>
            )}
          </div>
        )}

        {/* Zone danger — suppression compte */}
        <div className="bg-white rounded-card border border-red-100 shadow-sm p-8">
          <h2 className="text-sm font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Supprimer mon compte
          </h2>
          <p className="text-sm font-medium text-slate-500 mb-5">
            La suppression est <strong>irréversible</strong>. Toutes vos données (scans, dossiers, historique) seront définitivement effacées conformément au RGPD Art. 17.
          </p>
          <Link
            href="/dashboard/supprimer-compte"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer mon compte
          </Link>
        </div>

      </div>

      {/* ── Churn Modal ────────────────────────────────────────────────────── */}
      {churnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setChurnOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>

            {/* Step 1: Raison */}
            {churnStep === "reason" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Avant de partir...</h2>
                  <p className="text-sm text-slate-500 mt-1">Dites-nous pourquoi vous souhaitez résilier.</p>
                </div>
                <div className="space-y-3">
                  {REASON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleChurnReasonSelect(opt.value)}
                      disabled={churnLoading}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left disabled:opacity-50"
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="font-bold text-slate-700 text-sm">{opt.label}</span>
                    </button>
                  ))}
                </div>
                {churnLoading && (
                  <p className="text-xs text-slate-400 text-center">Chargement...</p>
                )}
              </div>
            )}

            {/* Step 2: Offre de retention */}
            {churnStep === "offer" && churnOffer && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {churnOffer.eligible ? "On a une solution !" : "On comprend."}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">{churnOffer.message}</p>
                </div>

                {churnOffer.offer === "feature_request" && (
                  <textarea
                    value={churnComment}
                    onChange={(e) => setChurnComment(e.target.value)}
                    placeholder="Quelle fonctionnalité vous manque ?"
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium text-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                )}

                {churnOffer.offer === "pause" && (
                  <textarea
                    value={churnComment}
                    onChange={(e) => setChurnComment(e.target.value)}
                    placeholder="Un commentaire ? (facultatif)"
                    rows={2}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium text-sm focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                )}

                <div className="flex flex-col gap-3">
                  {churnOffer.eligible && churnOffer.offer && churnOffer.offer !== "pause" && (
                    <button
                      onClick={handleChurnAcceptOffer}
                      disabled={churnLoading}
                      className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {churnLoading ? "..." : churnOffer.offer === "free_month" ? "Accepter le mois offert" : "Envoyer mon retour et rester"}
                    </button>
                  )}
                  <button
                    onClick={handleChurnDeclineOffer}
                    disabled={churnLoading}
                    className="w-full px-6 py-3 bg-red-50 border border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors disabled:opacity-50 text-sm"
                  >
                    {churnLoading ? "..." : "Résilier quand même"}
                  </button>
                  <button
                    onClick={() => setChurnOpen(false)}
                    className="w-full px-6 py-3 text-slate-400 font-bold rounded-2xl hover:text-slate-600 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation finale */}
            {churnStep === "done" && churnResult && (
              <div className="space-y-6 text-center">
                <div className="text-4xl">{churnResult.retained ? "🎉" : "👋"}</div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {churnResult.retained ? "Content de vous garder !" : "À bientôt !"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-2">{churnResult.message}</p>
                </div>
                <button
                  onClick={() => { setChurnOpen(false); window.location.reload(); }}
                  className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors text-sm"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
