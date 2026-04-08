"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MapPin } from "lucide-react";
import type { AddrSug } from "./types";

/* ── Primitives ─────────────────────────────────────────────────── */

export function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{children}</p>;
}

export function TextInput({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors" />
    </div>
  );
}

export function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className="flex items-center justify-between w-full text-sm text-slate-700 py-0.5 group">
      <span className="font-medium group-hover:text-slate-900 transition-colors">{label}</span>
      <span className={`relative w-8 h-4 rounded-full transition-colors shrink-0 ${value ? "bg-blue-600" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-4" : ""}`} />
      </span>
    </button>
  );
}

export function Chips({ label, options, values, onChange }: {
  label: string; options: { value: string; label: string }[]; values: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => values.includes(v) ? onChange(values.filter(x => x !== v)) : onChange([...values, v]);
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-all ${
              values.includes(opt.value) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}>{opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Segment({ label, options, value, onChange, wrap = false }: {
  label: string; options: { v: string; l: string }[]; value: string; onChange: (v: string) => void; wrap?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className={`flex gap-1 ${wrap ? "flex-wrap" : ""}`}>
        {options.map(o => (
          <button key={o.v} type="button" onClick={() => onChange(o.v)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
              value === o.v ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
            }`}>{o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Slider({ label, value, onChange, min = 0, max = 12, unit = "h" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          className="flex-1 h-1 appearance-none bg-slate-200 rounded-full [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer" />
        <span className="text-sm font-bold text-slate-700 w-10 text-right tabular-nums">{value}{unit}/j</span>
      </div>
    </div>
  );
}

export function AddressField({ value, onChange, onSelect }: {
  value: string; onChange: (v: string) => void; onSelect: (a: AddrSug) => void;
}) {
  const [sugs, setSugs] = useState<AddrSug[]>([]);
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const updateRect = () => {
    if (inputRef.current) setRect(inputRef.current.getBoundingClientRect());
  };

  const search = (q: string) => {
    onChange(q);
    if (debRef.current) clearTimeout(debRef.current);
    if (q.length < 3) { setSugs([]); setOpen(false); return; }
    debRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=5`);
        const data = await res.json();
        const r: AddrSug[] = (data.features ?? []).map((f: { properties: { label: string; name: string; postcode: string; city: string } }) => ({
          label: f.properties.label, name: f.properties.name, postcode: f.properties.postcode, city: f.properties.city,
        }));
        setSugs(r);
        if (r.length > 0) { updateRect(); setOpen(true); } else { setOpen(false); }
      } catch { setSugs([]); }
    }, 300);
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (inputRef.current?.contains(t) || listRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => { document.removeEventListener("mousedown", close); if (debRef.current) clearTimeout(debRef.current); };
  }, []);

  // Re-calc position on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const h = () => updateRect();
    window.addEventListener("scroll", h, true);
    window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h, true); window.removeEventListener("resize", h); };
  }, [open]);

  return (
    <div>
      <Label>Adresse</Label>
      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
        <input ref={inputRef} type="text" value={value}
          onChange={e => search(e.target.value)}
          onFocus={() => { if (sugs.length > 0) { updateRect(); setOpen(true); } }}
          placeholder="Rechercher une adresse..."
          className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors" />
      </div>
      {open && rect && typeof document !== "undefined" && createPortal(
        <ul ref={listRef}
          style={{ position: "fixed", top: rect.bottom + 4, left: rect.left, width: rect.width }}
          className="z-[9999] bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {sugs.map((s, i) => (
            <li key={i}>
              <button type="button" onClick={() => { onSelect(s); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors first:rounded-t-xl last:rounded-b-xl">
                {s.label}
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}

export function Accordion({ title, icon, children, open: defaultOpen = false }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; open?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left">
        <div className="flex items-center gap-2.5 text-slate-600">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>
      {open && <div className="pb-4 space-y-4">{children}</div>}
    </div>
  );
}
