"use client";
/** Mobile card view for tiers-payant dossiers. Exports: DossierMobileList. ~60 lignes */

import { FileText } from "lucide-react";
import { STATUT_CONFIG, getOrganismeLabel } from "./constants";
import { StatusButtons } from "./DossierComponents";
import type { DossierTP } from "./types";

interface DossierMobileListProps {
  dossiers: DossierTP[];
  onStatusAction: (dossier: DossierTP, statut: string) => void;
}

export function DossierMobileList({ dossiers, onStatusAction }: DossierMobileListProps) {
  if (dossiers.length === 0) {
    return (
      <div className="bg-white rounded-card p-12 text-center border border-slate-100">
        <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-600 font-bold">Aucun dossier tiers payant enregistré.</p>
      </div>
    );
  }

  return (
    <>
      {dossiers.map((d) => {
        const statutCfg = STATUT_CONFIG[d.statut] || STATUT_CONFIG.EN_ATTENTE;
        const StatutIcon = statutCfg.icon;
        const mutLabel = getOrganismeLabel(d);
        const displayRef = d.referenceInterne && !d.referenceInterne.startsWith("ORG:") ? d.referenceInterne : d.reference;
        return (
          <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-black text-sm">{displayRef}</span>
              </div>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-black uppercase ${statutCfg.color}`}>
                <StatutIcon className="w-3 h-3" />
                {statutCfg.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-2xs font-black text-slate-600 uppercase">Mutuelle</p>
                <p className="font-bold text-slate-700">{mutLabel}</p>
              </div>
              <div>
                <p className="text-2xs font-black text-slate-600 uppercase">Montant</p>
                <p className="font-black">{d.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</p>
              </div>
              <div>
                <p className="text-2xs font-black text-slate-600 uppercase">Date envoi</p>
                <p className="font-bold text-slate-700">{new Date(d.dateEnvoi).toLocaleDateString("fr-FR")}</p>
              </div>
              {d.montantRecu != null && (
                <div>
                  <p className="text-2xs font-black text-slate-600 uppercase">Reçu</p>
                  <p className="font-bold text-green-600">{d.montantRecu.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</p>
                </div>
              )}
            </div>
            <StatusButtons dossier={d} onAction={(statut) => onStatusAction(d, statut)} />
          </div>
        );
      })}
    </>
  );
}
