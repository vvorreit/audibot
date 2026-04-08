"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ScanLine, Copy, MousePointerClick, X } from "lucide-react";

const STORAGE_KEY = "audibot_welcome_seen";

export default function WelcomeModal() {
  const [show, setShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  const close = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }, []);

  useEffect(() => {
    if (!show) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusFirst = () => {
      const first = dialog.querySelector<HTMLElement>(focusableSelector);
      first?.focus();
    };
    focusFirst();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, close]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={close} aria-hidden="true" />
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title" className="bg-white rounded-card shadow-2xl p-6 sm:p-10 w-full max-w-lg relative z-10 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={close}
          aria-label="Fermer"
          className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <span className="text-6xl block mb-4">🎉</span>
          <h2 id="welcome-modal-title" className="text-2xl font-black text-slate-900 mb-2">Bienvenue sur AudiBot !</h2>
          <p className="text-slate-500 font-medium">Voici comment gagner du temps dès aujourd&apos;hui</p>
        </div>

        <div className="space-y-5 mb-8">
          {[
            { icon: ScanLine, label: "Scannez une carte mutuelle ou ordonnance" },
            { icon: Copy, label: "Copiez les données en 1 clic" },
            { icon: MousePointerClick, label: "Le bot remplit le formulaire pour vous" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <step.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">{step.label}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            window.open("/extension", "_blank");
            close();
          }}
          className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-sm uppercase tracking-widest shadow-xl shadow-blue-200 mb-3"
        >
          Installer l&apos;extension →
        </button>
        <button
          onClick={close}
          className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors font-medium"
        >
          Je l&apos;ai déjà, aller au dashboard
        </button>
      </div>
    </div>
  );
}
