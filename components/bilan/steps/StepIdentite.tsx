import React from "react";
import type { BilanFormData } from "@/types/bilan";
import { Q, Chip } from "../BilanUI";

export default function StepIdentite({ data, onChange, accent }: { data: BilanFormData; onChange: (d: Partial<BilanFormData>) => void; accent: string }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 mb-6">
        <div className="text-4xl mb-3">👤</div>
        <h2 className="text-2xl font-black text-slate-900">Faisons connaissance</h2>
        <p className="text-slate-500 text-base">Vos coordonnées pour que l&apos;audioprothésiste puisse vous retrouver</p>
      </div>

      <div>
        <Q>Comment souhaitez-vous être appelé(e) ?</Q>
        <div className="grid grid-cols-2 gap-3">
          <Chip accent={accent} selected={data.civilite === "M"} onClick={() => onChange({ civilite: "M" })}>Monsieur</Chip>
          <Chip accent={accent} selected={data.civilite === "Mme"} onClick={() => onChange({ civilite: "Mme" })}>Madame</Chip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Nom *", key: "nom", placeholder: "Dupont", auto: "family-name" },
          { label: "Prénom *", key: "prenom", placeholder: "Marie", auto: "given-name" },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{f.label}</label>
            <input
              type="text"
              value={((data as unknown) as Record<string, string>)[f.key] || ""}
              onChange={(e) => onChange({ [f.key]: e.target.value } as Partial<BilanFormData>)}
              placeholder={f.placeholder}
              autoComplete={f.auto}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Téléphone", key: "telephone", placeholder: "06 12 34 56 78", type: "tel", auto: "tel" },
          { label: "Email", key: "email", placeholder: "marie@email.com", type: "email", auto: "email" },
        ].map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">{f.label}</label>
            <input
              type={f.type}
              value={((data as unknown) as Record<string, string>)[f.key] || ""}
              onChange={(e) => onChange({ [f.key]: e.target.value } as Partial<BilanFormData>)}
              placeholder={f.placeholder}
              autoComplete={f.auto}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Date de naissance</label>
        <input
          type="date"
          value={((data as unknown) as Record<string, string>).dateNaissance || ""}
          onChange={(e) => onChange({ dateNaissance: e.target.value } as Partial<BilanFormData>)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl text-base font-medium focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}
