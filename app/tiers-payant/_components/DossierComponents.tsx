"use client";

import { STATUT_CONFIG } from "./constants";
import type { DossierTP, HistoriqueEntry } from "./types";

export function StatusButtons({ dossier, onAction }: {
  dossier: DossierTP;
  onAction: (statut: string) => void;
}) {
  const availableStatuts = (["EN_ATTENTE", "RECU", "REJETE", "EN_LITIGE"] as const).filter(
    (s) => s !== dossier.statut
  );

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {availableStatuts.map((s) => {
        const cfg = STATUT_CONFIG[s];
        const Icon = cfg.icon;
        return (
          <button
            key={s}
            onClick={() => onAction(s)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-2xs font-black uppercase border transition-all ${cfg.bgBtn}`}
          >
            <Icon className="w-3 h-3" />
            {cfg.label}
          </button>
        );
      })}
    </div>
  );
}

export function HistoriquePanel({ historique }: { historique: HistoriqueEntry[] }) {
  if (historique.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {historique.map((h) => {
        const fromCfg = STATUT_CONFIG[h.ancienStatut] || STATUT_CONFIG.EN_ATTENTE;
        const toCfg = STATUT_CONFIG[h.nouveauStatut] || STATUT_CONFIG.EN_ATTENTE;
        return (
          <div key={h.id} className="flex items-start gap-3 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
            <div>
              <span className="font-bold text-slate-600">{h.auteurNom}</span>
              {" : "}
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black ${fromCfg.color}`}>{fromCfg.label}</span>
              <span className="mx-1 text-slate-700">{"\u2192"}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black ${toCfg.color}`}>{toCfg.label}</span>
              <span className="text-slate-700 ml-2">{new Date(h.createdAt).toLocaleString("fr-FR")}</span>
              {h.commentaire && (
                <p className="text-slate-600 mt-0.5 italic">&quot;{h.commentaire}&quot;</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
