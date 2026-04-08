import React from "react";
import { Check } from "lucide-react";

export function Chip({
  selected, onClick, children, accent,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode; accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-4 rounded-2xl text-base font-bold transition-all border-2 min-h-[56px] active:scale-95 ${
        selected ? "text-white border-transparent shadow-lg" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
      }`}
      style={selected ? { backgroundColor: accent, borderColor: accent } : {}}
    >
      {children}
    </button>
  );
}

export function Card({
  selected, onClick, label, desc, icon, accent,
}: {
  selected: boolean; onClick: () => void; label: string; desc?: string; icon?: string; accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all min-h-[64px] active:scale-[0.98] ${
        selected ? "shadow-md" : "bg-white border-slate-200 hover:border-slate-300"
      }`}
      style={selected ? { backgroundColor: accent + "12", borderColor: accent } : {}}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <div className={`text-base font-bold ${selected ? "" : "text-slate-800"}`} style={selected ? { color: accent } : {}}>
            {label}
          </div>
          {desc && <div className="text-sm text-slate-500 mt-0.5">{desc}</div>}
        </div>
        {selected && (
          <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accent }}>
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
    </button>
  );
}

export function Q({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-black text-slate-900 mb-4 leading-snug">{children}</h3>;
}

export function Sub({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-500 -mt-2 mb-4">{children}</p>;
}
