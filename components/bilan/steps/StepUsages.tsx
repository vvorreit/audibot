import React from "react";
import type { BilanFormData } from "@/types/bilan";
import { Q, Card, Chip } from "../BilanUI";

const ACTIVITY_OPTIONS = [
  { value: "bureau"   as const, label: "Bureau & Écrans",   icon: "💻" },
  { value: "exterieur"as const, label: "Extérieur & Sport", icon: "🌳" },
  { value: "mixte"    as const, label: "Mixte",             icon: "🔄" },
  { value: "conduite" as const, label: "Conduite surtout",  icon: "🚗" },
];

export default function StepUsages({ data, onChange, accent }: { data: BilanFormData; onChange: (d: Partial<BilanFormData>) => void; accent: string }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <div className="text-4xl mb-3">🌍</div>
        <h2 className="text-2xl font-black text-slate-900">Votre vie quotidienne</h2>
        <p className="text-slate-500 text-base">Pour des recommandations adaptées à vos usages</p>
      </div>
      <div>
        <Q>Combien d&apos;heures par jour sur écran ?</Q>
        <div className="space-y-3">
          <input type="range" min={0} max={16} step={1} value={data.screenTimeHours}
            onChange={(e) => onChange({ screenTimeHours: Number(e.target.value) })}
            className="w-full h-3 rounded-full accent-blue-600" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">0h</span>
            <span className="text-3xl font-black tabular-nums" style={{ color: accent }}>{data.screenTimeHours}h</span>
            <span className="text-sm text-slate-400">16h</span>
          </div>
        </div>
      </div>
      <div>
        <Q>Votre activité principale ?</Q>
        <div className="space-y-3">
          {ACTIVITY_OPTIONS.map((a) => (
            <Card key={a.value} accent={accent} selected={data.mainActivity === a.value} onClick={() => onChange({ mainActivity: a.value })} label={a.label} icon={a.icon} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Q>Sport régulier ?</Q>
          <div className="grid grid-cols-2 gap-2">
            <Chip accent={accent} selected={data.sport} onClick={() => onChange({ sport: true })}>Oui</Chip>
            <Chip accent={accent} selected={!data.sport} onClick={() => onChange({ sport: false })}>Non</Chip>
          </div>
        </div>
        <div>
          <Q>Conduite de nuit ?</Q>
          <div className="grid grid-cols-2 gap-2">
            <Chip accent={accent} selected={data.conduitNuit} onClick={() => onChange({ conduitNuit: true })}>Oui</Chip>
            <Chip accent={accent} selected={!data.conduitNuit} onClick={() => onChange({ conduitNuit: false })}>Non</Chip>
          </div>
        </div>
      </div>
      <div>
        <Q>Exposition au soleil</Q>
        <div className="space-y-3">
          {([
            { value: "rare" as const, label: "Rarement — principalement en intérieur", icon: "🏠" },
            { value: "moderee" as const, label: "Modérée — mixte intérieur / extérieur", icon: "⚖️" },
            { value: "elevee" as const, label: "Élevée — souvent dehors", icon: "☀️" },
          ]).map((e) => (
            <Card key={e.value} accent={accent} selected={data.expositionSoleil === e.value} onClick={() => onChange({ expositionSoleil: e.value })} label={e.label} icon={e.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
