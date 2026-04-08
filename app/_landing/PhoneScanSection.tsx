import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";

export default function PhoneScanSection() {
  return (
    <section className="py-20 bg-slate-50 px-6 border-y border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Smartphone className="w-3.5 h-3.5" /> Scan t&eacute;l&eacute;phone
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-tight">
              Photographiez depuis votre t&eacute;l&eacute;phone.
            </h2>
            <p className="text-slate-700 font-medium text-lg leading-relaxed mb-8">
              Scannez un QR code sur votre dashboard, photographiez la prescription ORL ou la carte mutuelle avec votre iPhone ou Android &mdash; les donn&eacute;es arrivent instantan&eacute;ment sur votre ordinateur.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Aucune application \u00e0 installer",
                "Fonctionne sur iPhone & Android",
                "Transmission chiffr\u00e9e AES-256 \u2014 z\u00e9ro donn\u00e9e stock\u00e9e",
                "Guide de cadrage + capture automatique",
                "Am\u00e9lioration image automatique avant lecture",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-xs font-black">✓</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-xs uppercase tracking-widest">
              Essayer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-slate-900 rounded-card p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[80px]" />
            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-white/10 rounded-3xl mx-auto flex items-center justify-center mb-4">
                  <Smartphone className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-xl font-black">Scan en 3 secondes</p>
                <p className="text-slate-600 text-sm font-medium mt-1">iPhone, Android, ou tout smartphone</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: "QR code", icon: "1️⃣" },
                  { label: "Photo", icon: "2️⃣" },
                  { label: "Donn\u00e9es", icon: "3️⃣" },
                ].map((s) => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className="text-xs font-black text-slate-700">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl px-4 py-3 text-center">
                <p className="text-green-300 text-xs font-black">✓ Donn&eacute;es jamais stock&eacute;es sur nos serveurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
