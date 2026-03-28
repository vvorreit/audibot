"use client";
import { Shield, Trash2, Clock } from "lucide-react";

export default function RgpdContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" /> Conformité RGPD
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-black text-green-800">Purge comptes inactifs</p>
            </div>
            <p className="text-2xs text-green-600 font-medium">Cron quotidien — 30 jours après résiliation</p>
            <p className="text-2xs text-green-500 mt-1">RGPD Art. 17 — Droit à l'effacement</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Trash2 className="w-4 h-4 text-green-600" />
              <p className="text-sm font-black text-green-800">Purge dossiers TP</p>
            </div>
            <p className="text-2xs text-green-600 font-medium">Cron mensuel — 3 ans après création</p>
            <p className="text-2xs text-green-500 mt-1">Durée conservation données comptables</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-600" />
              <p className="text-sm font-black text-green-800">Purge logs techniques</p>
            </div>
            <p className="text-2xs text-green-600 font-medium">Cron hebdo — 90 jours</p>
            <p className="text-2xs text-green-500 mt-1">OcrScanLog, InjectionLog, RpaLog</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-card border border-slate-100 shadow-sm p-6">
        <h2 className="font-black text-lg text-slate-900 mb-3">Documents légaux</h2>
        <div className="space-y-2">
          {[
            { label: "REGISTRE_TRAITEMENTS_ART30.md", path: "docs/legal/REGISTRE_TRAITEMENTS_ART30.md" },
            { label: "DPIA.md", path: "docs/legal/DPIA.md" },
            { label: "PROCEDURE_INCIDENT.md", path: "docs/legal/PROCEDURE_INCIDENT.md" },
          ].map((doc) => (
            <div key={doc.label} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-bold text-slate-700">{doc.label}</span>
              <span className="text-2xs text-green-600 font-black px-2 py-1 bg-green-50 rounded-full">Présent</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
