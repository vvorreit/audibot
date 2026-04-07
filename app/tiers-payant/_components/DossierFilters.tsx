"use client";
/** Filters bar for tiers-payant dossier list. Exports: DossierFilters. ~90 lignes */

import { inputCls } from "@/components/ui/Input";
import { MUTUELLES, STATUT_CONFIG } from "./constants";

const labelCls = "block text-2xs font-black uppercase tracking-widest text-slate-600 mb-1.5";

interface DossierFiltersProps {
  filterSearch: string;
  setFilterSearch: (v: string) => void;
  filterMutuelle: string;
  setFilterMutuelle: (v: string) => void;
  filterStatut: string;
  setFilterStatut: (v: string) => void;
  filterMode: string;
  setFilterMode: (v: string) => void;
  filterMinAmount: string;
  setFilterMinAmount: (v: string) => void;
  filterDateStart: string;
  setFilterDateStart: (v: string) => void;
  filterDateEnd: string;
  setFilterDateEnd: (v: string) => void;
  resetFilters: () => void;
  filteredCount: number;
  totalCount: number;
}

export function DossierFilters({
  filterSearch, setFilterSearch,
  filterMutuelle, setFilterMutuelle,
  filterStatut, setFilterStatut,
  filterMode, setFilterMode,
  filterMinAmount, setFilterMinAmount,
  filterDateStart, setFilterDateStart,
  filterDateEnd, setFilterDateEnd,
  resetFilters,
  filteredCount, totalCount,
}: DossierFiltersProps) {
  return (
    <div className="bg-white rounded-card shadow-sm border border-slate-100 p-5 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Recherche</label>
          <input type="text" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} placeholder="Réf, Adhérent..." className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Mutuelle</label>
          <select value={filterMutuelle} onChange={(e) => setFilterMutuelle(e.target.value)} className={inputCls}>
            <option value="">Toutes</option>
            {MUTUELLES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Statut</label>
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className={inputCls}>
            <option value="">Tous</option>
            {Object.entries(STATUT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Mode</label>
          <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className={inputCls}>
            <option value="">Tous</option>
            <option value="B2">B2</option>
            <option value="NOEMIE">NOEMIE</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Montant min (EUR)</label>
          <input type="number" value={filterMinAmount} onChange={(e) => setFilterMinAmount(e.target.value)} placeholder="Ex: 50" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Du (Envoi)</label>
          <input type="date" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Au (Envoi)</label>
          <input type="date" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} className={inputCls} />
        </div>
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>
      {filteredCount !== totalCount && (
        <p className="mt-4 text-xs font-bold text-blue-600">
          {filteredCount} dossier(s) trouvé(s) sur {totalCount} au total.
        </p>
      )}
    </div>
  );
}
