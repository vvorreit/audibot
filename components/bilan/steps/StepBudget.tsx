import React from "react";
import type { BilanFormData } from "@/types/bilan";
import { Q, Sub, Card, Chip } from "../BilanUI";

const BUDGET_OPTIONS = [
  { value: "moins_150"as const, label: "< 150 €",         desc: "Entrée de gamme" },
  { value: "150_300"  as const, label: "150 – 300 €",     desc: "Milieu de gamme" },
  { value: "300_500"  as const, label: "300 – 500 €",     desc: "Haut de gamme" },
  { value: "plus_500"    as const, label: "> 500 €",         desc: "Premium" },
  { value: "ne_sais_pas"as const, label: "Je ne sais pas", desc: "Mon audioprothésiste me guidera" },
];

export default function StepBudget({ data, onChange, accent }: { data: BilanFormData; onChange: (d: Partial<BilanFormData>) => void; accent: string }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <div className="text-4xl mb-3">💰</div>
        <h2 className="text-2xl font-black text-slate-900">Budget & Projet</h2>
        <p className="text-slate-500 text-base">Pour des recommandations dans vos moyens</p>
      </div>
      <div>
        <Q>Votre budget monture ?</Q>
        <Sub>Hors verres et traitements optiques</Sub>
        <div className="space-y-3">
          {BUDGET_OPTIONS.map((b) => (
            <Card key={b.value} accent={accent} selected={data.budgetRange === b.value} onClick={() => onChange({ budgetRange: b.value })} label={b.label} desc={b.desc} />
          ))}
        </div>
      </div>
      <div>
        <Q>Intéressé(e) par une 2e paire ou des solaires ?</Q>
        <div className="grid grid-cols-2 gap-3">
          <Chip accent={accent} selected={data.projetSecondairesPaires === true} onClick={() => onChange({ projetSecondairesPaires: true })}>Oui, tout à fait 😍</Chip>
          <Chip accent={accent} selected={data.projetSecondairesPaires === false} onClick={() => onChange({ projetSecondairesPaires: false })}>Peut-être / Non</Chip>
        </div>
      </div>
      <div>
        <Q>Savez-vous ce que rembourse votre mutuelle ?</Q>
        <div className="grid grid-cols-2 gap-3">
          <Chip accent={accent} selected={data.mutuelleConnue === true} onClick={() => onChange({ mutuelleConnue: true })}>Oui, je sais 👍</Chip>
          <Chip accent={accent} selected={data.mutuelleConnue === false} onClick={() => onChange({ mutuelleConnue: false })}>Non, pas vraiment</Chip>
        </div>
      </div>

      <div className="rounded-2xl p-5 space-y-2" style={{ backgroundColor: accent + "08", border: `1px solid ${accent}30` }}>
        <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: accent }}>Votre profil en résumé</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700">
          <span>👁️ {data.correctionType.length > 0 ? data.correctionType.join(", ") : "Aucun trouble"}</span>
          <span>💻 {data.screenTimeHours}h/jour d&apos;écran</span>
          <span>🎨 Style {data.stylePreference}</span>
          <span>💰 {BUDGET_OPTIONS.find(b => b.value === data.budgetRange)?.label}</span>
        </div>
      </div>
    </div>
  );
}
