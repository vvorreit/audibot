"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Link from "next/link";

const PORTALS = [
  { name: "Almerys",    url: "https://opticien.almerys.com", favicon: "https://www.google.com/s2/favicons?domain=almerys.com&sz=32" },
  { name: "Wemind",     url: "https://app.wemind.io",        favicon: "https://www.google.com/s2/favicons?domain=wemind.io&sz=32" },
  { name: "Viamedis",   url: "https://www.viamedis.net",     favicon: "https://www.google.com/s2/favicons?domain=viamedis.net&sz=32" },
  { name: "Generation", url: "https://www.generation.fr",    favicon: "https://www.google.com/s2/favicons?domain=generation.fr&sz=32" },
];

const AUTO_CLOSE_DELAY = 8000;

interface PostCopyDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export default function PostCopyDrawer({ visible, onClose }: PostCopyDrawerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(handleClose, AUTO_CLOSE_DELAY);
    return () => clearTimeout(timer);
  }, [visible, handleClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="max-w-lg mx-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="bg-white rounded-t-3xl shadow-2xl border border-slate-200 p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <p className="text-sm font-black text-slate-900 mb-4">
            Vous &ecirc;tes pr&ecirc;t 🤖 Ouvrez votre portail
          </p>

          <div className="flex gap-3 mb-4">
            {PORTALS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all flex-1 min-w-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.favicon} alt={p.name} width={24} height={24} className="rounded" />
                <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{p.name}</span>
              </a>
            ))}
          </div>

          <Link
            href="/portails"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Voir tous les portails &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
