import React from "react";
import type { BilanFormData } from "@/types/bilan";
import { Q, Sub, Chip } from "../BilanUI";

const GENE_OPTIONS = [
  { value: "halos_nuit"       as const, label: "Halos la nuit",        emoji: "🌙" },
  { value: "fatigue_visuelle" as const, label: "Fatigue des yeux",     emoji: "😴" },
  { value: "maux_de_tete"     as const, label: "Maux de tête",         emoji: "🤕" },
  { value: "vision_floue_pres"as const, label: "Flou de près",         emoji: "📱" },
  { value: "vision_floue_loin"as const, label: "Flou de loin",         emoji: "🏔️" },
  { value: "eblouissement"    as const, label: "Éblouissements",       emoji: "☀️" },
  { value: "aucune"           as const, label: "Aucune gêne",          emoji: "😊" },
];

export default function StepGenes({ data, onChange, accent }: { data: BilanFormData; onChange: (d: Partial<BilanFormData>) => void; accent: string }) {
  const toggle = (val: BilanFormData["genesActuelles"][number]) => {
    if (val === "aucune") { onChange({ genesActuelles: data.genesActuelles.includes("aucune") ? [] : ["aucune"] }); return; }
    const without = data.genesActuelles.filter((v) => v !== "aucune");
    onChange({ genesActuelles: without.includes(val) ? without.filter((v) => v !== val) : [...without, val] });
  };
  const hasLunettes = data.correctionType.length > 0 && !data.correctionType.includes("aucune");
  return (
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <div className="text-4xl mb-3">💬</div>
        <h2 className="text-2xl font-black text-slate-900">Ce que vous ressentez</h2>
        <p className="text-slate-500 text-base">Vos gênes du quotidien</p>
      </div>
      <div>
        <Q>Quelles gênes ressentez-vous actuellement ?</Q>
        <Sub>Sélectionnez tout ce qui s&apos;applique</Sub>
        <div className="grid grid-cols-2 gap-3">
          {GENE_OPTIONS.map((g) => (
            <Chip key={g.value} accent={accent} selected={data.genesActuelles.includes(g.value)} onClick={() => toggle(g.value)}>
              <span className="mr-1">{g.emoji}</span> {g.label}
            </Chip>
          ))}
        </div>
      </div>
      {hasLunettes && (
        <>
          <div>
            <Q>Vos lunettes sont confortables à porter ?</Q>
            <div className="grid grid-cols-2 gap-3">
              <Chip accent={accent} selected={data.lunettesBienSupportees} onClick={() => onChange({ lunettesBienSupportees: true })}>Oui, globalement</Chip>
              <Chip accent={accent} selected={!data.lunettesBienSupportees} onClick={() => onChange({ lunettesBienSupportees: false })}>Non, souvent inconfort</Chip>
            </div>
          </div>
          <div>
            <Q>Vous portez vos lunettes...</Q>
            <div className="grid grid-cols-2 gap-3">
              {(["toujours", "souvent", "parfois", "rarement"] as const).map((f) => (
                <Chip key={f} accent={accent} selected={data.frequencePort === f} onClick={() => onChange({ frequencePort: f })}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Chip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
