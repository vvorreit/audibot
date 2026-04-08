import Link from "next/link";
import { CheckCircle, Wand2, Video } from "lucide-react";
import { FaviconWithFallback } from "./FaviconWithFallback";
import type { Portail, RecorderStatus } from "./portails-data";

/* ── Cellules ── */
function RecorderCell({ status }: { status: RecorderStatus }) {
  if (status === "Disponible")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black whitespace-nowrap">
        <CheckCircle className="w-3.5 h-3.5" /> Disponible
      </span>
    );
  if (status === "Enregistr\u00e9")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-black whitespace-nowrap">
        <CheckCircle className="w-3.5 h-3.5" /> Enregistr&eacute; ✨
      </span>
    );
  return (
    <Link
      href="/extension#recorder"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-500 border border-slate-200 rounded-full text-xs font-black whitespace-nowrap hover:bg-slate-50 transition-colors"
    >
      <Video className="w-3.5 h-3.5" /> Enregistrez-le →
    </Link>
  );
}

function SmartFillCell() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-black whitespace-nowrap">
      <Wand2 className="w-3.5 h-3.5" /> Universel
    </span>
  );
}

export function PortailMatrix({ items, label }: { items: Portail[]; label: string }) {
  return (
    <div>
      {/* En-t&ecirc;te section */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</p>
        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
          {items.length}
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-600">
                Portail
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" /> Recorder
                </span>
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" /> Smart Fill
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.name} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                {/* Portail */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <FaviconWithFallback name={p.name} favicon={p.favicon} />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-600 font-medium">{p.url}</div>
                    </div>
                  </div>
                </td>
                {/* Recorder */}
                <td className="px-6 py-4 text-center">
                  <RecorderCell status={p.recorder} />
                </td>
                {/* Smart Fill */}
                <td className="px-6 py-4 text-center">
                  <SmartFillCell />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
