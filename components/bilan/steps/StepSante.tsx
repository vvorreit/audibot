import React from "react";
import type { BilanFormData } from "@/types/bilan";
import { Q, Sub, Card, Chip } from "../BilanUI";

const SENSITIVITY_OPTIONS = [
  { value: "nickel"         as const, label: "Allergie au nickel" },
  { value: "plastique"      as const, label: "Peau sensible au plastique" },
  { value: "poids"          as const, label: "Gêné par le poids" },
  { value: "pression_tempes"as const, label: "Pression sur les tempes" },
  { value: "nez_sensible"   as const, label: "Nez sensible" },
];

export default function StepSante({ data, onChange, accent }: { data: BilanFormData; onChange: (d: Partial<BilanFormData>) => void; accent: string }) {
  const toggle = (val: BilanFormData["sensitivities"][number]) => {
    onChange({ sensitivities: data.sensitivities.includes(val) ? data.sensitivities.filter((v) => v !== val) : [...data.sensitivities, val] });
  };
  return (
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <div className="text-4xl mb-3">🏥</div>
        <h2 className="text-2xl font-black text-slate-900">Votre santé visuelle</h2>
        <p className="text-slate-500 text-base">Pour mieux vous conseiller</p>
      </div>
      <div>
        <Q>Des contraintes pour votre monture ?</Q>
        <Sub>Sélectionnez tout ce qui s&apos;applique</Sub>
        <div className="grid grid-cols-2 gap-3">
          {SENSITIVITY_OPTIONS.map((s) => (
            <Chip key={s.value} accent={accent} selected={data.sensitivities.includes(s.value)} onClick={() => toggle(s.value)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Q>Antécédents familiaux oculaires ?</Q>
        <Sub>DMLA, glaucome, cataracte...</Sub>
        <div className="grid grid-cols-2 gap-3">
          <Chip accent={accent} selected={data.antecedentsFamiliaux === true} onClick={() => onChange({ antecedentsFamiliaux: true })}>Oui</Chip>
          <Chip accent={accent} selected={data.antecedentsFamiliaux === false} onClick={() => onChange({ antecedentsFamiliaux: false })}>Non / Je ne sais pas</Chip>
        </div>
      </div>
      <div>
        <Q>Votre dernière visite chez l&apos;ophtalmo ?</Q>
        <div className="space-y-3">
          {([
            { value: "moins_1an" as const, label: "Il y a moins d'un an",     icon: "🟢" },
            { value: "1_2ans"    as const, label: "Il y a 1 à 2 ans",         icon: "🟡" },
            { value: "plus_2ans" as const, label: "Il y a plus de 2 ans",     icon: "🟠" },
            { value: "jamais"    as const, label: "Je n'y suis jamais allé(e)",icon: "⚪" },
          ]).map((v) => (
            <Card key={v.value} accent={accent} selected={data.derniereVisite === v.value} onClick={() => onChange({ derniereVisite: v.value })} label={v.label} icon={v.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
