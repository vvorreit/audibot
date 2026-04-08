"use client";
/** Modal listing NOEMIE rejection codes. Exports: NoemieModal. ~50 lignes */

import { X } from "lucide-react";
import FocusTrap from "focus-trap-react";
import { NOEMIE_CODES } from "./constants";

interface NoemieModalProps {
  onClose: () => void;
}

export function NoemieModal({ onClose }: NoemieModalProps) {
  return (
    <FocusTrap focusTrapOptions={{ escapeDeactivates: true, onDeactivate: onClose }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="noemie-modal-title"
          className="bg-white rounded-card shadow-2xl border border-slate-100 w-full max-w-md mx-4 p-8 max-h-[80vh] overflow-y-auto relative z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 id="noemie-modal-title" className="text-lg font-black text-slate-900">Codes NOEMIE</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <div className="space-y-3 text-xs">
            {NOEMIE_CODES.map((n) => (
              <div key={n.code} className="flex gap-2">
                <span className="shrink-0 w-10 text-center font-black text-red-500 bg-red-50 rounded px-1 py-0.5">{n.code}</span>
                <div>
                  <p className="font-bold text-slate-700 leading-tight">{n.label}</p>
                  <p className="text-slate-600 text-2xs leading-tight">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
