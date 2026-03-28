"use client";

import { OrdonnanceData, CorrectionOeil, CorrectionLentille } from "@/lib/parsers";
import { Eye } from "lucide-react";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";

interface Props {
  data: OrdonnanceData;
  onChange: (data: OrdonnanceData) => void;
}

function Field({ label, value, onChange, placeholder, full, id, confidence }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; full?: boolean; id: string; confidence?: number;
}) {
  const isUncertain = confidence !== undefined && confidence > 0 && confidence < 0.70;
  return (
    <div className={full ? "col-span-full" : ""}>
      <Label htmlFor={id}>
        {label}
        {isUncertain && <span className="ml-1 text-amber-500 text-xs font-bold">&#9888; incertain</span>}
      </Label>
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ""}
        className={`text-center ${isUncertain ? "border-amber-400 bg-amber-50 focus:ring-amber-400" : ""}`}
      />
    </div>
  );
}

function OeilRow({ label, data, onChange, confidencePrefix, fieldConfidence }: {
  label: string;
  data: CorrectionOeil;
  onChange: (d: CorrectionOeil) => void;
  confidencePrefix?: string;
  fieldConfidence?: Record<string, number>;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 pr-3 text-xs font-bold text-slate-600 whitespace-nowrap">{label}</td>
      {(["sphere", "cylindre", "axe", "addition"] as const).map((field) => {
        const conf = confidencePrefix && fieldConfidence ? fieldConfidence[`${confidencePrefix}.${field}`] : undefined;
        const isUncertain = conf !== undefined && conf > 0 && conf < 0.70;
        return (
          <td key={field} className="py-2 px-1">
            <input
              type="text"
              value={data[field]}
              onChange={(e) => onChange({ ...data, [field]: e.target.value })}
              placeholder="—"
              aria-label={`${label} ${field}`}
              className={`w-full px-2 py-1.5 rounded-lg border text-sm text-center text-slate-800
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:border-transparent
                         placeholder:text-slate-300 transition-all ${isUncertain ? "border-amber-400 bg-amber-50 focus-visible:ring-amber-400" : "border-slate-200 focus-visible:ring-blue-500"}`}
            />
          </td>
        );
      })}
    </tr>
  );
}

function LentilleRow({ label, data, onChange }: {
  label: string;
  data: CorrectionLentille;
  onChange: (d: CorrectionLentille) => void;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2 pr-3 text-xs font-bold text-slate-600 whitespace-nowrap">{label}</td>
      {(["sphere", "cylindre", "axe", "addition", "rayonCourbure", "diametre"] as const).map((field) => (
        <td key={field} className="py-2 px-1">
          <input
            type="text"
            value={data[field]}
            onChange={(e) => onChange({ ...data, [field]: e.target.value })}
            placeholder="—"
            aria-label={`${label} ${field}`}
            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center text-slate-800
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent
                       placeholder:text-slate-300 transition-all"
          />
        </td>
      ))}
    </tr>
  );
}

export default function OrdonnanceForm({ data, onChange }: Props) {
  const showLunettes = data.typePrescription !== "lentilles";
  const showLentilles = data.typePrescription === "lentilles" || data.typePrescription === "les deux";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><Eye className="w-4 h-4" /></span> Ordonnance opticien
      </h2>

      {/* Prescripteur + patient */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Prescripteur & Patient</p>
        <div className="grid grid-cols-2 gap-3">
          <Field id="ordo-ophtalmo" label="Ophtalmologue" value={data.nomOphtalmologue}
            onChange={(v) => onChange({ ...data, nomOphtalmologue: v })} placeholder="Dr. Nom" full confidence={data.fieldConfidence?.["nomOphtalmologue"]} />
          <Field id="ordo-nom" label="Nom patient" value={data.nomPatient}
            onChange={(v) => onChange({ ...data, nomPatient: v })} placeholder="Nom" confidence={data.fieldConfidence?.["nomPatient"]} />
          <Field id="ordo-prenom" label="Prénom patient" value={data.prenomPatient}
            onChange={(v) => onChange({ ...data, prenomPatient: v })} placeholder="Prénom" confidence={data.fieldConfidence?.["prenomPatient"]} />
          <Field id="ordo-dob" label="Date de naissance" value={data.dateNaissancePatient}
            onChange={(v) => onChange({ ...data, dateNaissancePatient: v })} placeholder="JJ/MM/AAAA" confidence={data.fieldConfidence?.["dateNaissancePatient"]} />
          <Field id="ordo-date" label="Date ordonnance" value={data.dateOrdonnance}
            onChange={(v) => onChange({ ...data, dateOrdonnance: v })} placeholder="JJ/MM/AAAA" confidence={data.fieldConfidence?.["dateOrdonnance"]} />
          <Field id="ordo-validite" label="Valable jusqu'au" value={data.dateValidite}
            onChange={(v) => onChange({ ...data, dateValidite: v })} placeholder="JJ/MM/AAAA" confidence={data.fieldConfidence?.["dateValidite"]} />
          <Field id="ordo-dp" label="Distance pupillaire" value={data.distancePupillaire ?? ""}
            onChange={(v) => onChange({ ...data, distancePupillaire: v })} placeholder="ex : 67 mm" confidence={data.fieldConfidence?.["distancePupillaire"]} />
        </div>
      </div>

      {/* Type de prescription */}
      <div>
        <Label>Type de prescription</Label>
        <div className="flex gap-2 flex-wrap">
          {(["lunettes", "lentilles", "les deux"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...data, typePrescription: t })}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                ${data.typePrescription === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"}`}
            >
              {t === "lunettes" ? "🕶️ Lunettes" : t === "lentilles" ? "🔵 Lentilles" : "🕶️+🔵 Les deux"}
            </button>
          ))}
        </div>
      </div>

      {/* Correction lunettes */}
      {showLunettes && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Correction Lunettes</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-2 text-left text-slate-400 font-semibold w-10"></th>
                  {["Sphère", "Cylindre", "Axe", "Addition"].map((h) => (
                    <th key={h} className="py-2 px-1 text-center text-slate-400 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <OeilRow label="OD" data={data.lunettesOD}
                  onChange={(d) => onChange({ ...data, lunettesOD: d })}
                  confidencePrefix="lunettesOD" fieldConfidence={data.fieldConfidence} />
                <OeilRow label="OG" data={data.lunettesOG}
                  onChange={(d) => onChange({ ...data, lunettesOG: d })}
                  confidencePrefix="lunettesOG" fieldConfidence={data.fieldConfidence} />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Correction lentilles */}
      {showLentilles && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Correction Lentilles</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="py-2 text-left text-slate-400 font-semibold w-10"></th>
                  {["Sphère", "Cylindre", "Axe", "Addition", "BC", "DIA"].map((h) => (
                    <th key={h} className="py-2 px-1 text-center text-slate-400 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <LentilleRow label="OD" data={data.lentillesOD}
                  onChange={(d) => onChange({ ...data, lentillesOD: d })} />
                <LentilleRow label="OG" data={data.lentillesOG}
                  onChange={(d) => onChange({ ...data, lentillesOG: d })} />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Remarques */}
      <div>
        <Label htmlFor="ordo-remarques">Remarques</Label>
        <textarea
          id="ordo-remarques"
          value={data.remarques}
          onChange={(e) => onChange({ ...data, remarques: e.target.value })}
          placeholder="Observations, port permanent, VL seule..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent
                     placeholder:text-slate-300 transition-all resize-none"
        />
      </div>
    </div>
  );
}
