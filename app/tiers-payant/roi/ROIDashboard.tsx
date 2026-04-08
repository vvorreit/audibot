"use client";

import { useEffect, useState } from "react";
import { getTPDashboardData } from "@/app/tiers-payant/dashboard/actions";
import { TrendingUp, Clock, Euro, BarChart2, Target, Award } from "lucide-react";
import { SkeletonPage } from "@/components/SkeletonRow";

// Taux horaire opticien (hypothèse ROI)
const TAUX_HORAIRE = 35; // €/h
const MINUTES_PAR_DOSSIER = 12; // minutes économisées par dossier vs saisie manuelle
const BENCHMARK_REJET = 15; // % taux rejet secteur sans outil
const ABONNEMENT_MENSUEL = 49; // € coût estimé abonnement PRO mensuel

function formatEur(v: number, decimals = 0) {
  return v.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + " €";
}

function RoiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  highlight?: boolean;
}) {
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-600",
    blue: "bg-blue-100 text-blue-600",
    indigo: "bg-slate-100 text-slate-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-slate-100 text-slate-600",
    emerald: "bg-slate-100 text-slate-600",
  };
  return (
    <div className={`bg-white p-6 rounded-card shadow-sm border flex flex-col gap-2 ${highlight ? "border-green-300 ring-2 ring-green-100" : "border-slate-100"}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xs font-black uppercase tracking-widest text-slate-600">{label}</p>
      <p className={`text-2xl font-black ${highlight ? "text-green-600" : "text-slate-900"}`}>{value}</p>
      {sub && <p className="text-xs font-semibold text-slate-700">{sub}</p>}
    </div>
  );
}

function CompareBar({ label, before, after, max }: { label: string; before: number; after: number; max: number }) {
  const pctBefore = max > 0 ? (before / max) * 100 : 0;
  const pctAfter = max > 0 ? (after / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-xs text-slate-400 text-right">Sans AudiBot</span>
        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-300 rounded-full" style={{ width: `${Math.max(pctBefore, 2)}%` }} />
        </div>
        <span className="w-16 text-xs text-right text-red-500 font-bold">{before.toFixed(0)}%</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 text-xs text-slate-400 text-right">Avec AudiBot</span>
        <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-green-400 rounded-full" style={{ width: `${Math.max(pctAfter, 2)}%` }} />
        </div>
        <span className="w-16 text-xs text-right text-green-600 font-bold">{after.toFixed(0)}%</span>
      </div>
    </div>
  );
}

export default function ROIDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ROI data calculée
  const [roi, setRoi] = useState<{
    nbDossiers: number;
    minutesEconomisees: number;
    heuresEconomisees: number;
    valeurTemps: number;
    montantRelance: number;
    tauxRejetActuel: number;
    tauxRejetEvite: number;
    valeurRejetEvite: number;
    valeurGeneree: number;
    roiNet: number;
    periodeRetour: number; // mois
    messageCle: string;
  } | null>(null);

  useEffect(() => {
    // Données du mois en cours
    const now = new Date();
    const dateDebut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const dateFin = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

    getTPDashboardData({ dateDebut, dateFin })
      .then((data) => {
        const { kpis } = data;
        const nbDossiers = kpis.nbTotal;

        // Temps économisé
        const minutesEconomisees = nbDossiers * MINUTES_PAR_DOSSIER;
        const heuresEconomisees = minutesEconomisees / 60;
        const valeurTemps = Math.round(heuresEconomisees * TAUX_HORAIRE * 100) / 100;

        // Montant récupéré via relances : dossiers reçus (on estime 30% récupérés via relance)
        // Source réelle : dossiers passés EN_ATTENTE → RECU mais on n'a pas l'historique ici
        // Approximation : 30% du montant reçu provient de relances
        const montantRelance = Math.round(kpis.totalRecu * 0.30 * 100) / 100;

        // Taux de rejet évité
        const tauxRejetActuel = nbDossiers > 0
          ? Math.round((kpis.nbRejete / nbDossiers) * 100)
          : 0;
        const tauxRejetEvite = Math.max(0, BENCHMARK_REJET - tauxRejetActuel);
        // Valeur : nb dossiers × taux évité × montant moyen
        const valeurRejetEvite = Math.round((nbDossiers * (tauxRejetEvite / 100)) * kpis.montantMoyen * 100) / 100;

        // Valeur totale générée
        const valeurGeneree = valeurTemps + montantRelance + valeurRejetEvite;

        // ROI net
        const roiNet = Math.round((valeurGeneree - ABONNEMENT_MENSUEL) * 100) / 100;

        // Période de retour (en mois)
        const periodeRetour = valeurGeneree > 0
          ? Math.max(1, Math.round((ABONNEMENT_MENSUEL / valeurGeneree) * 10) / 10)
          : 0;

        // Message clé
        const messageCle = roiNet > 0
          ? `AudiBot vous a fait économiser ${formatEur(Math.abs(roiNet))} ce mois`
          : nbDossiers === 0
          ? "Aucun dossier ce mois-ci — ajoutez vos dossiers pour voir votre ROI"
          : `Optimisez vos dossiers pour maximiser votre ROI`;

        setRoi({
          nbDossiers,
          minutesEconomisees,
          heuresEconomisees: Math.round(heuresEconomisees * 10) / 10,
          valeurTemps,
          montantRelance,
          tauxRejetActuel,
          tauxRejetEvite,
          valeurRejetEvite,
          valeurGeneree: Math.round(valeurGeneree * 100) / 100,
          roiNet,
          periodeRetour,
          messageCle,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonPage />;

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Erreur</h1>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!roi) return null;

  return (
    <div className="space-y-8">

      {/* Bannière message clé */}
      <div className={`rounded-card p-6 flex items-center gap-4 ${roi.roiNet > 0 ? "bg-green-50 border border-green-200" : "bg-blue-50 border border-blue-200"}`}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${roi.roiNet > 0 ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
          <Award className="w-6 h-6" />
        </div>
        <div>
          <p className={`text-lg font-black ${roi.roiNet > 0 ? "text-green-700" : "text-blue-700"}`}>{roi.messageCle}</p>
          <p className="text-sm text-slate-700 font-semibold mt-1">
            Calculé sur le mois en cours · {roi.nbDossiers} dossier(s) traité(s)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <RoiCard
          label="Temps économisé"
          value={`${roi.heuresEconomisees}h`}
          sub={`${roi.minutesEconomisees} min (${roi.nbDossiers} dossiers × 12min)`}
          icon={Clock}
          color="blue"
        />
        <RoiCard
          label="Valeur temps"
          value={formatEur(roi.valeurTemps)}
          sub={`${roi.heuresEconomisees}h × ${TAUX_HORAIRE}€/h`}
          icon={Euro}
          color="indigo"
        />
        <RoiCard
          label="Récupéré via relances"
          value={formatEur(roi.montantRelance)}
          sub="Estimation 30% du montant reçu"
          icon={TrendingUp}
          color="amber"
        />
        <RoiCard
          label="Rejet évité"
          value={formatEur(roi.valeurRejetEvite)}
          sub={`${roi.tauxRejetEvite}% vs benchmark ${BENCHMARK_REJET}%`}
          icon={Target}
          color="purple"
        />
        <RoiCard
          label="Valeur générée"
          value={formatEur(roi.valeurGeneree)}
          sub="Temps + relances + rejets évités"
          icon={BarChart2}
          color="emerald"
          highlight={roi.valeurGeneree > 0}
        />
        <RoiCard
          label="ROI net"
          value={formatEur(roi.roiNet)}
          sub={`Abonnement estimé : ${ABONNEMENT_MENSUEL}€/mois`}
          icon={Award}
          color="green"
          highlight={roi.roiNet > 0}
        />
      </div>

      {/* Comparaison avant/après */}
      <div className="bg-white rounded-card shadow-sm border border-slate-100 p-8">
        <h2 className="font-black text-lg mb-1">Comparaison avant / après AudiBot</h2>
        <p className="text-xs text-slate-700 font-semibold mb-6">
          Benchmark secteur vs vos performances actuelles
        </p>
        <div className="space-y-6 max-w-2xl">
          <CompareBar
            label="Taux de rejet"
            before={BENCHMARK_REJET}
            after={roi.tauxRejetActuel}
            max={30}
          />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-bold">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-2xs uppercase tracking-widest text-slate-700 mb-1">Taux rejet secteur</p>
            <p className="text-xl font-black text-red-500">{BENCHMARK_REJET}%</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-2xs uppercase tracking-widest text-slate-700 mb-1">Votre taux de rejet</p>
            <p className={`text-xl font-black ${roi.tauxRejetActuel <= BENCHMARK_REJET ? "text-green-600" : "text-red-600"}`}>
              {roi.tauxRejetActuel}%
            </p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-2xs uppercase tracking-widest text-slate-700 mb-1">Retour sur investissement</p>
            <p className="text-xl font-black text-blue-600">
              {roi.periodeRetour > 0 ? `${roi.periodeRetour} mois` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Explication méthode */}
      <div className="bg-slate-50 rounded-card border border-slate-100 p-6">
        <h3 className="font-black text-sm text-slate-700 mb-3">💡 Méthode de calcul</h3>
        <ul className="space-y-1.5 text-xs font-semibold text-slate-600">
          <li>• <strong>Temps économisé</strong> : {roi.nbDossiers} dossiers × 12 min de saisie manuelle évitée = {roi.minutesEconomisees} min = {roi.heuresEconomisees}h</li>
          <li>• <strong>Valeur temps</strong> : {roi.heuresEconomisees}h × {TAUX_HORAIRE}€/h (taux horaire opticien) = {formatEur(roi.valeurTemps)}</li>
          <li>• <strong>Relances</strong> : estimation 30% du montant reçu récupéré grâce aux relances automatiques</li>
          <li>• <strong>Rejets évités</strong> : ({BENCHMARK_REJET}% benchmark - {roi.tauxRejetActuel}% actuel) × {roi.nbDossiers} dossiers × montant moyen</li>
          <li>• <strong>ROI net</strong> : valeur générée - abonnement estimé ({ABONNEMENT_MENSUEL}€/mois)</li>
        </ul>
      </div>

    </div>
  );
}
