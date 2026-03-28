"use client";

import { MutuelleData, Personne } from "@/lib/parsers";
import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/Input";
import Label from "@/components/ui/Label";

interface Props {
  data: MutuelleData;
  onChange: (data: MutuelleData) => void;
}

function Field({ label, value, onChange, placeholder, colSpan, id, confidence }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; colSpan?: boolean; id: string; confidence?: number;
}) {
  const isUncertain = confidence !== undefined && confidence > 0 && confidence < 0.70;
  return (
    <div className={colSpan ? "sm:col-span-2" : ""}>
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
        className={isUncertain ? "border-amber-400 bg-amber-50 focus:ring-amber-400" : ""}
      />
    </div>
  );
}

function selectPersonne(data: MutuelleData, p: Personne): MutuelleData {
  return { ...data, nom: p.nom, prenom: p.prenom, numeroSecuriteSociale: p.numeroSecuriteSociale, dateNaissance: p.dateNaissance };
}

function isSelected(data: MutuelleData, p: Personne): boolean {
  return data.nom === p.nom && data.prenom === p.prenom;
}

export default function MutuelleForm({ data, onChange }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0"><CreditCard className="w-4 h-4" /></span> Carte Mutuelle
      </h2>

      {/* Infos organisme */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Organisme</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="mut-organisme" label="Organisme" value={data.organisme}
            onChange={(v) => onChange({ ...data, organisme: v })}
            placeholder="MALAKOFF HUMANIS..." colSpan confidence={data.fieldConfidence?.["organisme"]} />
          <Field id="mut-amc" label="N° AMC" value={data.numeroAMC}
            onChange={(v) => onChange({ ...data, numeroAMC: v })} placeholder="75949776" confidence={data.fieldConfidence?.["numeroAMC"]} />
          <Field id="mut-adherent" label="N° Adhérent" value={data.numeroAdherent}
            onChange={(v) => onChange({ ...data, numeroAdherent: v })} placeholder="13486638" confidence={data.fieldConfidence?.["numeroAdherent"]} />
          <Field id="mut-teletrans" label="N° Télétransmission" value={data.numeroTeletransmission}
            onChange={(v) => onChange({ ...data, numeroTeletransmission: v })} placeholder="75990010" confidence={data.fieldConfidence?.["numeroTeletransmission"]} />
          <Field id="mut-typeconv" label="Type convention" value={data.typeConv}
            onChange={(v) => onChange({ ...data, typeConv: v })} placeholder="VM / ROC : OC" confidence={data.fieldConfidence?.["typeConv"]} />
          <Field id="mut-debut" label="Validité du" value={data.dateDebutValidite}
            onChange={(v) => onChange({ ...data, dateDebutValidite: v })} placeholder="01/01/2026" confidence={data.fieldConfidence?.["dateDebutValidite"]} />
          <Field id="mut-fin" label="Validité au" value={data.dateFinValidite}
            onChange={(v) => onChange({ ...data, dateFinValidite: v })} placeholder="31/12/2026" confidence={data.fieldConfidence?.["dateFinValidite"]} />
        </div>
      </div>

      {/* Sélecteur de personne */}
      {data.personnes.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Choisir la personne ({data.personnes.length} détectée{data.personnes.length > 1 ? "s" : ""})
          </p>
          <div className="flex flex-col gap-2">
            {data.personnes.map((p, i) => {
              const selected = isSelected(data, p);
              return (
                <button
                  key={i}
                  onClick={() => onChange(selectPersonne(data, p))}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all
                    ${selected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                >
                  <div>
                    <span className={`text-sm font-bold ${selected ? "text-blue-700" : "text-slate-700"}`}>
                      {p.prenom} {p.nom}
                    </span>
                    <span className="ml-3 text-xs text-slate-400 font-mono">{p.numeroSecuriteSociale}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">né(e) le {p.dateNaissance}</span>
                    {selected && (
                      <span className="text-blue-500 text-sm">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Personne sélectionnée */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Assuré sélectionné</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id="mut-nom" label="Nom" value={data.nom}
            onChange={(v) => onChange({ ...data, nom: v })} placeholder="NOM" confidence={data.fieldConfidence?.["nom"]} />
          <Field id="mut-prenom" label="Prénom" value={data.prenom}
            onChange={(v) => onChange({ ...data, prenom: v })} placeholder="Prénom" confidence={data.fieldConfidence?.["prenom"]} />
          <Field id="mut-nss" label="N° Sécurité Sociale" value={data.numeroSecuriteSociale}
            onChange={(v) => onChange({ ...data, numeroSecuriteSociale: v })} placeholder="13 chiffres" colSpan confidence={data.fieldConfidence?.["numeroSecuriteSociale"]} />
          <Field id="mut-dob" label="Date de naissance" value={data.dateNaissance}
            onChange={(v) => onChange({ ...data, dateNaissance: v })} placeholder="JJ/MM/AAAA" confidence={data.fieldConfidence?.["dateNaissance"]} />
        </div>
      </div>
    </div>
  );
}
