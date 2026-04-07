import React from "react";
import type { BilanFormData } from "@/types/bilan";
import { Q, Sub, Card, Chip } from "../BilanUI";

const CORRECTION_TYPES = [
  { value: "myopie"        as const, label: "Myopie",        desc: "Vision de loin floue",         emoji: "🔭" },
  { value: "hypermétropie" as const, label: "Hypermétropie", desc: "Vision de près floue",          emoji: "📖" },
  { value: "astigmatisme"  as const, label: "Astigmatisme",  desc: "Vision déformée",               emoji: "🌀" },
  { value: "presbytie"     as const, label: "Presbytie",     desc: "Lecture difficile (+40 ans)",   emoji: "📅" },
  { value: "aucune"        as const, label: "Aucun",         desc: "Je n'ai pas de trouble connu",  emoji: "✅" },
];

export default function StepVision({ data, onChange, accent }: { data: BilanFormData; onChange: (d: Partial<BilanFormData>) => void; accent: string }) {
  const toggle = (val: BilanFormData["correctionType"][number]) => {
    if (val === "aucune") { onChange({ correctionType: data.correctionType.includes("aucune") ? [] : ["aucune"] }); return; }
    const without = data.correctionType.filter((v) => v !== "aucune");
    onChange({ correctionType: without.includes(val) ? without.filter((v) => v !== val) : [...without, val] });
  };
  return (
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <div className="text-4xl mb-3">👁️</div>
        <h2 className="text-2xl font-black text-slate-900">Votre vision</h2>
        <p className="text-slate-500 text-base">Comment voyez-vous le monde ?</p>
      </div>
      <div>
        <Q>Avez-vous un trouble visuel ?</Q>
        <Sub>Vous pouvez en sélectionner plusieurs</Sub>
        <div className="space-y-3">
          {CORRECTION_TYPES.map((c) => (
            <Card key={c.value} accent={accent} selected={data.correctionType.includes(c.value)} onClick={() => toggle(c.value)} label={c.label} desc={c.desc} icon={c.emoji} />
          ))}
        </div>
      </div>
      <div>
        <Q>Portez-vous des verres progressifs ?</Q>
        <div className="grid grid-cols-2 gap-3">
          <Chip accent={accent} selected={data.isProgressive} onClick={() => onChange({ isProgressive: true })}>Oui</Chip>
          <Chip accent={accent} selected={!data.isProgressive} onClick={() => onChange({ isProgressive: false })}>Non</Chip>
        </div>
      </div>
      <div>
        <Q>Portez-vous des lentilles de contact ?</Q>
        <div className="grid grid-cols-2 gap-3">
          <Chip accent={accent} selected={data.portLentilles} onClick={() => onChange({ portLentilles: true })}>Oui</Chip>
          <Chip accent={accent} selected={!data.portLentilles} onClick={() => onChange({ portLentilles: false })}>Non</Chip>
        </div>
      </div>
    </div>
  );
}
