"use client";
/** Desktop table view for tiers-payant dossiers. Exports: DossierTable. ~130 lignes */

import { Fragment } from "react";
import {
  FileText, History, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import { STATUT_CONFIG, MOTIFS_REJET, getOrganismeLabel } from "./constants";
import { StatusButtons, HistoriquePanel } from "./DossierComponents";
import type { DossierTP, SortKey } from "./types";

interface DossierTableProps {
  dossiers: DossierTP[];
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  toggleSort: (key: SortKey) => void;
  expandedRow: string | null;
  setExpandedRow: (id: string | null) => void;
  onStatusAction: (dossier: DossierTP, statut: string) => void;
  emptyTotal: boolean;
}

const COLUMNS: { key: SortKey | null; label: string; hide: boolean }[] = [
  { key: "reference", label: "Référence", hide: false },
  { key: "mutuelle", label: "Mutuelle", hide: false },
  { key: "mode", label: "Mode", hide: true },
  { key: "montant", label: "Montant", hide: false },
  { key: "dateEnvoi", label: "Date envoi", hide: false },
  { key: "statut", label: "Statut", hide: false },
  { key: null, label: "Actions", hide: false },
  { key: null, label: "", hide: false },
];

export function DossierTable({
  dossiers, sortKey, sortDir, toggleSort,
  expandedRow, setExpandedRow, onStatusAction, emptyTotal,
}: DossierTableProps) {
  return (
    <div className="hidden md:block bg-white rounded-card shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {COLUMNS.map((col, i) => (
                <th key={i} className={`px-5 py-5 text-2xs font-black uppercase tracking-widest text-slate-600 ${col.hide ? "hidden lg:table-cell" : ""}`}>
                  {col.key ? (
                    <button
                      onClick={() => toggleSort(col.key!)}
                      className="inline-flex items-center gap-1 hover:text-slate-600 transition-colors group"
                    >
                      {col.label}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-blue-500" /> : <ArrowDown className="w-3 h-3 text-blue-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                      )}
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {dossiers.map((d) => {
              const statutCfg = STATUT_CONFIG[d.statut] || STATUT_CONFIG.EN_ATTENTE;
              const StatutIcon = statutCfg.icon;
              const mutLabel = getOrganismeLabel(d);
              const displayRef = d.referenceInterne && !d.referenceInterne.startsWith("ORG:") ? d.referenceInterne : d.reference;
              const isExpanded = expandedRow === d.id;
              const motifLabel = d.motifRejet ? MOTIFS_REJET.find((m) => m.value === d.motifRejet)?.label || d.motifRejet : null;

              return (
                <Fragment key={d.id}>
                  <tr className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        <div><span className="font-black text-sm">{displayRef}</span></div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700 align-top">
                      {mutLabel}
                      {d.numeroAdherent && <p className="text-2xs text-slate-600 font-medium">N. {d.numeroAdherent}</p>}
                    </td>
                    <td className="px-5 py-4 align-top hidden lg:table-cell">
                      {d.mode ? (
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-2xs font-black uppercase ${
                          d.mode === "B2" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}>{d.mode}</span>
                      ) : (
                        <span className="text-slate-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className="text-sm font-black">{d.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</span>
                      {d.montantRecu != null && (
                        <p className="text-2xs font-bold text-green-600">Reçu : {d.montantRecu.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700 align-top">
                      {new Date(d.dateEnvoi).toLocaleDateString("fr-FR")}
                      {d.dateReception && (
                        <p className="text-2xs font-bold text-green-600">Reçu le {new Date(d.dateReception).toLocaleDateString("fr-FR")}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-black uppercase ${statutCfg.color}`}>
                        <StatutIcon className="w-3 h-3" />
                        {statutCfg.label}
                      </span>
                      {motifLabel && <p className="text-2xs text-red-400 font-medium mt-1">Motif : {motifLabel}</p>}
                      {d.commentaire && <p className="text-2xs text-slate-600 italic mt-1 max-w-[200px] truncate">&quot;{d.commentaire}&quot;</p>}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <StatusButtons dossier={d} onAction={(statut) => onStatusAction(d, statut)} />
                    </td>
                    <td className="px-5 py-4 align-top">
                      {d.historique.length > 0 && (
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : d.id)}
                          className="flex items-center gap-1 text-2xs font-bold text-slate-600 hover:text-slate-600 transition-colors"
                        >
                          <History className="w-3 h-3" />
                          {d.historique.length}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} className="px-5 pb-4 pt-0">
                        <div className="bg-slate-50 rounded-2xl p-4">
                          <p className="text-2xs font-black uppercase tracking-widest text-slate-600 mb-2">Historique des changements</p>
                          <HistoriquePanel historique={d.historique} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {dossiers.length === 0 && emptyTotal && (
              <tr>
                <td colSpan={8} className="px-8 py-16 text-center">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-600 font-bold">Aucun dossier tiers payant enregistré.</p>
                  <p className="text-slate-700 text-sm font-medium mt-1">Cliquez sur &quot;Nouveau dossier&quot; pour commencer.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
