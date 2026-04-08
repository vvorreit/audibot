import React from "react";
import type { BilanFormData } from "@/types/bilan";
import { Q, Sub, Card, Chip } from "../BilanUI";

const STYLE_OPTIONS = [
  { value: "discret"  as const, label: "Discret",  icon: "🕶️" },
  { value: "moderne"  as const, label: "Moderne",  icon: "⚡" },
  { value: "classique"as const, label: "Classique",icon: "🎩" },
  { value: "original" as const, label: "Original", icon: "🎨" },
  { value: "sport"       as const, label: "Sport",          icon: "🏃" },
  { value: "ne_sais_pas"as const, label: "Je ne sais pas", icon: "🤷" },
];

const FACE_OPTIONS = [
  { value: "ovale"       as const, label: "Ovale" },
  { value: "rond"        as const, label: "Rond" },
  { value: "carre"       as const, label: "Carré" },
  { value: "allonge"     as const, label: "Allongé" },
  { value: "triangulaire"as const, label: "Triangulaire" },
  { value: "inconnu"     as const, label: "Je ne sais pas" },
];

export default function StepStyle({ data, onChange, accent }: { data: BilanFormData; onChange: (d: Partial<BilanFormData>) => void; accent: string }) {
  const selectedStyles = data.stylePreferences ?? (data.stylePreference !== "ne_sais_pas" ? [data.stylePreference] : []);

  const toggleStyle = (val: typeof STYLE_OPTIONS[number]["value"]) => {
    if (val === "ne_sais_pas") {
      onChange({ stylePreferences: ["ne_sais_pas"], stylePreference: "ne_sais_pas" });
      return;
    }
    const without = selectedStyles.filter(v => v !== "ne_sais_pas");
    const next = without.includes(val) ? without.filter(v => v !== val) : [...without, val];
    onChange({
      stylePreferences: next.length > 0 ? next : ["ne_sais_pas"],
      stylePreference: next[0] ?? "ne_sais_pas",
    });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-1 mb-6">
        <div className="text-4xl mb-3">✨</div>
        <h2 className="text-2xl font-black text-slate-900">Votre style</h2>
        <p className="text-slate-500 text-base">Des lunettes à votre image</p>
      </div>
      <div>
        <Q>Quel style préférez-vous ?</Q>
        <Sub>Vous pouvez en choisir plusieurs</Sub>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {STYLE_OPTIONS.map((s) => (
            <Card key={s.value} accent={accent} selected={selectedStyles.includes(s.value)} onClick={() => toggleStyle(s.value)} label={s.label} icon={s.icon} />
          ))}
        </div>
      </div>
      <div>
        <Q>Forme de votre visage</Q>
        <div className="grid grid-cols-3 gap-3">
          {FACE_OPTIONS.map((f) => (
            <Chip key={f.value} accent={accent} selected={data.faceShape === f.value} onClick={() => onChange({ faceShape: f.value })}>{f.label}</Chip>
          ))}
        </div>
      </div>
      <div>
        <Q>Préférence de couleur</Q>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "sombre" as const,           label: "Sombre",           icon: "🖤" },
            { value: "clair" as const,             label: "Claire",           icon: "🤍" },
            { value: "colore" as const,            label: "Colorée",          icon: "🌈" },
            { value: "sans_preference" as const,   label: "Sans préférence",  icon: "✨" },
          ]).map((c) => (
            <Chip key={c.value} accent={accent} selected={data.colorPreference === c.value} onClick={() => onChange({ colorPreference: c.value })}>
              <span className="mr-1">{c.icon}</span> {c.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
