"use client";

import { OrdonnanceData, AudiogrammeOreille, TypeAppareillage, ClasseAppareillage } from "@/lib/parsers";

interface Props {
  data: OrdonnanceData;
  onChange: (data: OrdonnanceData) => void;
}

const inputCls = `w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800
  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  placeholder:text-gray-300 transition-all text-center`;

const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

function Field({ label, value, onChange, placeholder, full }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; full?: boolean;
}) {
  return (
    <div className={full ? "col-span-full" : ""}>
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? ""}
        className={inputCls}
      />
    </div>
  );
}

const FREQS = ["250Hz", "500Hz", "1kHz", "2kHz", "4kHz"] as const;
const FREQ_KEYS = ["hz250", "hz500", "hz1000", "hz2000", "hz4000"] as const;

function AudiogrammeRow({ label, data, onChange }: {
  label: string;
  data: AudiogrammeOreille;
  onChange: (d: AudiogrammeOreille) => void;
}) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-2 pr-3 text-xs font-bold text-gray-600 whitespace-nowrap">{label}</td>
      {FREQ_KEYS.map((key) => (
        <td key={key} className="py-2 px-1">
          <input
            type="text"
            value={data[key]}
            onChange={(e) => onChange({ ...data, [key]: e.target.value })}
            placeholder="—"
            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center text-gray-800
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder:text-gray-300 transition-all"
          />
        </td>
      ))}
    </tr>
  );
}

export default function OrdonnanceForm({ data, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <span className="text-2xl">🦻</span> Prescription ORL
      </h2>

      {/* Prescripteur + patient */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">ORL / Médecin prescripteur & Patient</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="ORL / Médecin prescripteur" value={data.nomORL}
            onChange={(v) => onChange({ ...data, nomORL: v })} placeholder="Dr. Nom" full />
          <Field label="N° RPPS" value={data.rpps}
            onChange={(v) => onChange({ ...data, rpps: v })} placeholder="11 chiffres" />
          <Field label="Date de prescription" value={data.datePrescription}
            onChange={(v) => onChange({ ...data, datePrescription: v })} placeholder="JJ/MM/AAAA" />
          <Field label="Nom patient" value={data.nomPatient}
            onChange={(v) => onChange({ ...data, nomPatient: v })} placeholder="Nom" />
          <Field label="Prénom patient" value={data.prenomPatient}
            onChange={(v) => onChange({ ...data, prenomPatient: v })} placeholder="Prénom" />
          <Field label="Date de naissance" value={data.dateNaissancePatient}
            onChange={(v) => onChange({ ...data, dateNaissancePatient: v })} placeholder="JJ/MM/AAAA" />
        </div>
      </div>

      {/* Audiogramme */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Audiogramme (perte en dB)</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-2 text-left text-gray-400 font-semibold w-10"></th>
                {FREQS.map((h) => (
                  <th key={h} className="py-2 px-1 text-center text-gray-400 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AudiogrammeRow label="OD" data={data.oreilleDroite}
                onChange={(d) => onChange({ ...data, oreilleDroite: d })} />
              <AudiogrammeRow label="OG" data={data.oreilleGauche}
                onChange={(d) => onChange({ ...data, oreilleGauche: d })} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Classe d'appareillage */}
      <div>
        <p className={labelCls}>Classe d'appareillage</p>
        <div className="flex gap-2 flex-wrap">
          {(["1", "2"] as ClasseAppareillage[]).map((c) => (
            <button
              key={c}
              onClick={() => onChange({ ...data, classeAppareillage: data.classeAppareillage === c ? "" : c })}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${data.classeAppareillage === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-400"}`}
            >
              {c === "1" ? "🟢 Classe 1 (100% Santé)" : "🔵 Classe 2"}
            </button>
          ))}
        </div>
      </div>

      {/* Type d'appareillage */}
      <div>
        <p className={labelCls}>Type d'appareillage</p>
        <div className="flex gap-2 flex-wrap">
          {(["BTE", "ITE", "RIC"] as TypeAppareillage[]).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...data, typeAppareillage: data.typeAppareillage === t ? "" : t })}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                ${data.typeAppareillage === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-400"}`}
            >
              {t === "BTE" ? "🎧 Contour BTE" : t === "ITE" ? "👂 Intra ITE" : "🔵 Écouteur déporté RIC"}
            </button>
          ))}
        </div>
      </div>

      {/* Renouvellement */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange({ ...data, renouvellement: !data.renouvellement })}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
            ${data.renouvellement
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-gray-500 border-gray-200 hover:border-amber-400"}`}
        >
          🔄 Renouvellement
        </button>
        <span className="text-xs text-gray-400">{data.renouvellement ? "Oui — renouvellement de prescription" : "Non — première prescription"}</span>
      </div>

      {/* Remarques */}
      <div>
        <label className={labelCls}>Remarques</label>
        <textarea
          value={data.remarques}
          onChange={(e) => onChange({ ...data, remarques: e.target.value })}
          placeholder="Observations, port bilatéral, bilan auditif joint..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-gray-300 transition-all resize-none"
        />
      </div>
    </div>
  );
}
