import React from "react";
import { Smartphone, Download } from "lucide-react";

const CHROME_EXTENSION_URL = "https://chromewebstore.google.com/detail/audibot-multi-site/ccealihogdkolhpgfboaanjpoohkiekj";

interface SidebarWidgetsProps {
  onShowScanModal: () => void;
}

export function ExtensionAccessCard() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">🧩</span>
        <div>
          <p className="text-sm font-black text-blue-900 mb-1">Extension Chrome</p>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Installez l&apos;extension pour remplir automatiquement les portails mutuelles et synchroniser vos données patient.
          </p>
          <a
            href={CHROME_EXTENSION_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Installer depuis le Chrome Web Store
          </a>
          <p className="mt-2 text-2xs text-blue-600 font-medium">
            Compatible Chrome, Brave, Edge, Arc, Opera
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SidebarWidgets({ onShowScanModal }: SidebarWidgetsProps) {
  return (
    <div className="space-y-6">
      <ExtensionAccessCard />

      {/* Scan depuis téléphone */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
          <h3 className="text-sm font-black text-slate-900">Scanner depuis votre téléphone</h3>
        </div>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          Photographiez une ordonnance ou une carte mutuelle avec votre iPhone ou Android — les données arrivent instantanément ici.
        </p>
        <button
          onClick={onShowScanModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all text-sm"
        >
          <Smartphone className="w-4 h-4" />
          Générer le QR code
        </button>
      </div>
    </div>
  );
}
