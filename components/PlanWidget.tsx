"use client";

/**
 * PlanWidget — Bloc abonnement du dashboard
 * Gère : trial, FREE, ESSENTIEL, PRO, CABINET, RESEAU, EQUIPE
 * Affiche les upgrades contextuels + la logique de facturation annuelle
 */

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle, FileText, ArrowUpRight, Users, Network,
  Building2, Zap, AlertTriangle,
} from "lucide-react";
import { createCheckoutSession, upgradePlan, createPortalSession } from "@/app/dashboard/actions";

/* ─── Types ─── */
interface PlanWidgetProps {
  userData: {
    isPro: boolean;
    plan: string;
    role: string;
    createdAt: string | Date;
    monthlyScanCount: number;
    monthlyScanResetAt: string | Date | null;
    pendingPlan?: string | null;
    isFreeActive?: boolean;
  };
  onRefresh: () => void;
}

/* ─── Helpers ─── */
const TRIAL_DAYS = 14;
const ESSENTIEL_SCAN_LIMIT = Number(process.env.NEXT_PUBLIC_ESSENTIEL_SCAN_LIMIT ?? 80);

const PLAN_LABELS: Record<string, string> = {
  FREE: "Gratuit",
  ESSENTIEL: "Essentiel",
  PRO: "Pro",
  CABINET: "Cabinet",
  RESEAU: "Réseau",
  EQUIPE: "Équipe",
};

const PLAN_COLORS: Record<string, string> = {
  FREE:     "bg-slate-100 text-slate-500",
  ESSENTIEL:"bg-blue-100 text-blue-700",
  PRO:      "bg-indigo-100 text-indigo-700",
  CABINET:  "bg-violet-100 text-violet-700",
  RESEAU:   "bg-blue-100 text-blue-800",
  EQUIPE:   "bg-blue-900 text-white",
};

/* ─── Sous-composant : carte d'upgrade ─── */
function UpgradeCard({
  icon: Icon,
  label,
  price,
  annualPrice,
  highlight,
  sub,
  color,
  isAnnual,
  loading,
  onSelect,
}: {
  icon: React.ElementType;
  label: string;
  price: string;
  annualPrice: string;
  highlight?: boolean;
  sub?: string;
  color: "blue" | "violet" | "indigo";
  isAnnual: boolean;
  loading: boolean;
  onSelect: () => void;
}) {
  const colors = {
    blue:   { bg: "bg-blue-600 hover:bg-blue-700",   border: "border-blue-200",   badge: "bg-blue-50 text-blue-700" },
    violet: { bg: "bg-violet-600 hover:bg-violet-700", border: "border-violet-200", badge: "bg-violet-50 text-violet-700" },
    indigo: { bg: "bg-indigo-600 hover:bg-indigo-700", border: "border-indigo-200", badge: "bg-indigo-50 text-indigo-700" },
  }[color];

  return (
    <div className={`relative rounded-2xl border ${highlight ? `border-2 ${colors.border}` : "border-slate-100"} bg-white p-4 flex flex-col gap-3`}>
      {highlight && (
        <div className={`absolute -top-3 left-4 px-3 py-0.5 text-2xs font-black uppercase tracking-widest rounded-full ${colors.badge}`}>
          Recommandé
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors.badge}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-900">{label}</p>
          {sub && <p className="text-2xs text-slate-400 font-medium">{sub}</p>}
        </div>
      </div>
      <div>
        <p className="text-lg font-black text-slate-900">
          {isAnnual ? annualPrice : price}
          <span className="text-xs text-slate-400 font-bold"> HT/mois</span>
        </p>
        {isAnnual && (
          <p className="text-2xs text-green-600 font-bold">−15% · Facturé annuellement</p>
        )}
      </div>
      <button
        onClick={onSelect}
        disabled={loading}
        className={`w-full py-2.5 rounded-xl text-white text-2xs font-black uppercase tracking-widest transition-all disabled:opacity-50 ${colors.bg}`}
      >
        {loading ? "Chargement..." : `Choisir ${label}`}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   WIDGET PRINCIPAL
   ═══════════════════════════════════════════ */
export default function PlanWidget({ userData, onRefresh }: PlanWidgetProps) {
  const [isAnnual, setIsAnnual] = useState(false);
  const [stripeLoading, setStripeLoading] = useState<string | null>(null);

  const plan = userData.plan || "FREE";
  const isPro = userData.isPro;

  /* Trial */
  const trialDaysLeft = Math.max(
    0,
    TRIAL_DAYS - Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / 86_400_000)
  );
  const isTrialExpired = !isPro && trialDaysLeft <= 0;
  const trialPct = ((TRIAL_DAYS - trialDaysLeft) / TRIAL_DAYS) * 100;

  /* Scans ESSENTIEL */
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthlyScanCount =
    userData.monthlyScanResetAt && new Date(userData.monthlyScanResetAt) >= monthStart
      ? userData.monthlyScanCount
      : 0;
  const scanPct = Math.min(100, (monthlyScanCount / ESSENTIEL_SCAN_LIMIT) * 100);
  const scanNearLimit = monthlyScanCount >= ESSENTIEL_SCAN_LIMIT * 0.8;
  const scanLimitReached = monthlyScanCount >= ESSENTIEL_SCAN_LIMIT;

  /* Checkout helper */
  const checkout = async (targetPlan: string, billing?: "monthly" | "annual") => {
    setStripeLoading(targetPlan);
    try {
      const { url } = await createCheckoutSession(
        targetPlan as "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU" | "EQUIPE",
        billing ?? (isAnnual ? "annual" : "monthly")
      );
      if (url) window.location.href = url;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur Stripe. Réessayez.");
    } finally {
      setStripeLoading(null);
    }
  };

  const upgrade = async (targetPlan: string) => {
    setStripeLoading(targetPlan);
    try {
      await upgradePlan(targetPlan as "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU" | "EQUIPE");
      onRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors de la mise à niveau.");
    } finally {
      setStripeLoading(null);
    }
  };

  /* ─── TRIAL / FREE ─── */
  if (!isPro) {
    return (
      <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400">
              {isTrialExpired ? "Essai expiré" : "Essai gratuit"}
            </p>
            <p className={`text-2xl font-black mt-0.5 ${isTrialExpired ? "text-red-500" : "text-slate-900"}`}>
              {isTrialExpired ? "Expiré" : `${trialDaysLeft}j restant${trialDaysLeft > 1 ? "s" : ""}`}
            </p>
          </div>
          {isTrialExpired && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-2xs font-black text-red-600">Accès bloqué</span>
            </div>
          )}
        </div>

        {/* Barre de progression trial */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isTrialExpired ? "bg-red-500" : "bg-blue-600"}`}
            style={{ width: `${trialPct}%` }}
          />
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3">
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400 flex-1">Choisir un plan</p>
          <button
            onClick={() => setIsAnnual((v) => !v)}
            className="flex items-center gap-1.5 text-2xs font-black"
          >
            <span className={isAnnual ? "text-slate-400" : "text-slate-700"}>Mensuel</span>
            <div className={`relative w-8 h-4 rounded-full transition-colors ${isAnnual ? "bg-blue-600" : "bg-slate-200"}`}>
              <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${isAnnual ? "translate-x-4 left-0.5" : "left-0.5"}`} />
            </div>
            <span className={isAnnual ? "text-blue-600" : "text-slate-400"}>Annuel <span className="text-green-600">−15%</span></span>
          </button>
        </div>

        {/* Plan suivant uniquement */}
        <div>
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-3">Passer à l'étape suivante</p>
          <button
            onClick={() => checkout("ESSENTIEL")}
            disabled={stripeLoading !== null}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <div className="text-left">
              <p className="text-xs font-black">Essentiel</p>
              <p className="text-2xs text-blue-200">80 scans/mois · 1 poste</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black">{isAnnual ? "33,92€" : "39,90€"}<span className="text-2xs text-blue-200">/mois</span></p>
            </div>
          </button>
        </div>

        <Link
          href="/pricing"
          className="text-center text-2xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          Voir le comparatif complet →
        </Link>
      </div>
    );
  }

  /* ─── ESSENTIEL (payant) ─── */
  if (plan === "ESSENTIEL") {
    return (
      <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Plan actuel</p>
            <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-black uppercase ${PLAN_COLORS.ESSENTIEL}`}>
              Essentiel
            </span>
          </div>
          <button
            onClick={async () => { const { url } = await createPortalSession(); if (url) window.location.href = url; }}
            className="flex items-center gap-1.5 text-2xs font-black text-slate-400 hover:text-blue-600 transition-colors"
          >
            <FileText className="w-3 h-3" /> Factures
          </button>
        </div>

        {/* Jauge scans */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <p className={`text-2xs font-bold uppercase tracking-wide ${scanNearLimit ? "text-orange-500" : "text-slate-400"}`}>
              {monthlyScanCount}/{ESSENTIEL_SCAN_LIMIT} scans ce mois
            </p>
            {scanNearLimit && !scanLimitReached && (
              <span className="text-2xs font-black text-orange-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Limite proche
              </span>
            )}
            {scanLimitReached && (
              <span className="text-2xs font-black text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Limite atteinte
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${scanLimitReached ? "bg-red-500" : scanNearLimit ? "bg-orange-400" : "bg-blue-600"}`}
              style={{ width: `${scanPct}%` }}
            />
          </div>
        </div>

        {/* Plan suivant uniquement */}
        <div>
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-3">
            {scanLimitReached ? "⚠️ Limite atteinte — passez au Pro" : "Passer à la vitesse supérieure"}
          </p>
          <button
            onClick={() => upgrade("PRO")}
            disabled={stripeLoading !== null}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <div className="text-left">
              <p className="text-xs font-black flex items-center gap-1.5"><Zap className="w-3 h-3" /> Pro</p>
              <p className="text-2xs text-indigo-200">Suivi TP · Relances · Support prioritaire</p>
            </div>
            <p className="text-sm font-black">69,90€<span className="text-2xs text-indigo-200">/mois</span></p>
          </button>
        </div>

        <Link href="/pricing" className="text-center text-2xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
          Voir tous les plans →
        </Link>
      </div>
    );
  }

  /* ─── PRO (payant, solo) ─── */
  if (plan === "PRO") {
    return (
      <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Plan actuel</p>
            <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-black uppercase ${PLAN_COLORS.PRO}`}>
              Pro
            </span>
          </div>
          <button
            onClick={async () => { const { url } = await createPortalSession(); if (url) window.location.href = url; }}
            className="flex items-center gap-1.5 text-2xs font-black text-slate-400 hover:text-blue-600 transition-colors"
          >
            <FileText className="w-3 h-3" /> Factures & résiliation
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-100 rounded-xl">
          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
          <p className="text-xs font-bold text-green-700">Scans illimités · RPA avancé activé</p>
        </div>

        {/* Plan suivant uniquement */}
        <div>
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-3">Vous gérez une équipe ?</p>
          <button
            onClick={() => checkout("CABINET")}
            disabled={stripeLoading !== null}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-violet-100 bg-violet-50 hover:bg-violet-100 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-left">
              <Users className="w-3.5 h-3.5 text-violet-600" />
              <div>
                <p className="text-xs font-black text-violet-800">Cabinet</p>
                <p className="text-2xs text-violet-500">3 postes inclus · 179€/mois</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-violet-400" />
          </button>
        </div>
      </div>
    );
  }

  /* ─── CABINET ─── */
  if (plan === "CABINET") {
    return (
      <div className="bg-white rounded-card border border-violet-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Plan actuel</p>
            <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-black uppercase ${PLAN_COLORS.CABINET}`}>
              Cabinet
            </span>
          </div>
          <button
            onClick={async () => { const { url } = await createPortalSession(); if (url) window.location.href = url; }}
            className="flex items-center gap-1.5 text-2xs font-black text-slate-400 hover:text-blue-600 transition-colors"
          >
            <FileText className="w-3 h-3" /> Factures
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 bg-violet-50 border border-violet-100 rounded-xl">
          <Users className="w-4 h-4 text-violet-600 shrink-0" />
          <p className="text-xs font-bold text-violet-700">3 postes inclus · Scans illimités</p>
        </div>

        {/* Upgrade → Réseau */}
        <div>
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Votre équipe grandit ?
          </p>
          <button
            onClick={() => checkout("RESEAU")}
            disabled={stripeLoading !== null}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-left">
              <Network className="w-4 h-4" />
              <div>
                <p className="text-xs font-black">Passer au Réseau</p>
                <p className="text-2xs text-blue-200">5 postes + 30€/poste suppl.</p>
              </div>
            </div>
            <p className="text-sm font-black">299€<span className="text-2xs text-blue-200">/mois</span></p>
          </button>
        </div>
      </div>
    );
  }

  /* ─── RESEAU ─── */
  if (plan === "RESEAU") {
    return (
      <div className="bg-white rounded-card border border-blue-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Plan actuel</p>
            <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-black uppercase ${PLAN_COLORS.RESEAU}`}>
              Réseau
            </span>
          </div>
          <button
            onClick={async () => { const { url } = await createPortalSession(); if (url) window.location.href = url; }}
            className="flex items-center gap-1.5 text-2xs font-black text-slate-400 hover:text-blue-600 transition-colors"
          >
            <FileText className="w-3 h-3" /> Factures
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
          <Network className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="text-xs font-bold text-blue-700">5 postes inclus · Multi-magasins actif</p>
        </div>

        {/* Upgrade → Franchise */}
        <div>
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">
            Vous gérez +10 magasins ?
          </p>
          <Link
            href="/franchise"
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-300" />
              <div>
                <p className="text-xs font-black">Franchise — Sur devis</p>
                <p className="text-2xs text-slate-400">Postes illimités · Contrat annuel</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    );
  }

  /* ─── EQUIPE (legacy) ─── */
  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xs font-black uppercase tracking-widest text-slate-400">Plan actuel</p>
          <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-black uppercase ${PLAN_COLORS.EQUIPE}`}>
            {PLAN_LABELS[plan] ?? plan}
          </span>
        </div>
        <button
          onClick={async () => { const { url } = await createPortalSession(); if (url) window.location.href = url; }}
          className="flex items-center gap-1.5 text-2xs font-black text-slate-400 hover:text-blue-600 transition-colors"
        >
          <FileText className="w-3 h-3" /> Factures & résiliation
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-green-50 border border-green-100 rounded-xl">
        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
        <p className="text-xs font-bold text-green-700">Accès complet · Scans illimités · Équipe</p>
      </div>
    </div>
  );
}
