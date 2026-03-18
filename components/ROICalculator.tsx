"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TAUX_OPTIONS = [30, 40, 50, 60];
const COUT_ANNUEL = 69.9 * 12;

export default function ROICalculator() {
  const [heures, setHeures] = useState(7);
  const [taux, setTaux] = useState(40);

  const heuresEconomisees = Math.round(heures * 0.9 * 52);
  const valeurEconomisee = Math.round(heures * 0.9 * 52 * taux);
  const roi = Math.round(((valeurEconomisee - COUT_ANNUEL) / COUT_ANNUEL) * 100);

  return (
    <div className="bg-white rounded-2xl p-8 md:p-12 border border-slate-100 shadow-sm max-w-3xl mx-auto">
      <div className="space-y-10">
        {/* Slider heures */}
        <div>
          <label className="block text-sm font-black text-slate-800 mb-3">
            Combien d'heures par semaine passez-vous à saisir les dossiers audioprothèse ?
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={30}
              value={heures}
              onChange={(e) => setHeures(Number(e.target.value))}
              className="flex-1 h-2 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="text-2xl font-black text-indigo-600 w-16 text-right">{heures}h</span>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
            <span>1h</span>
            <span>30h</span>
          </div>
        </div>

        {/* Taux horaire */}
        <div>
          <label className="block text-sm font-black text-slate-800 mb-3">
            Quel est votre taux horaire estimé ?
          </label>
          <div className="flex gap-3">
            {TAUX_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTaux(t)}
                className={`px-5 py-3 rounded-xl text-sm font-black transition-all ${
                  taux === t
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}€/h
              </button>
            ))}
          </div>
        </div>

        {/* Résultats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <p className="text-2xl md:text-3xl font-black text-indigo-600">{heuresEconomisees}h</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Heures économisées/an</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <p className="text-2xl md:text-3xl font-black text-indigo-600">{valeurEconomisee.toLocaleString("fr-FR")}€</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Valeur économisée/an</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl md:text-3xl font-black text-slate-400">{COUT_ANNUEL.toLocaleString("fr-FR")}€</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Coût AudiBot/an</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl md:text-3xl font-black text-green-600">{roi}%</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">ROI</p>
          </div>
        </div>

        {/* Texte dynamique */}
        <p className="text-center text-slate-700 font-bold text-lg">
          Vous économisez <span className="text-indigo-600">{heuresEconomisees} heures</span> et{" "}
          <span className="text-indigo-600">{valeurEconomisee.toLocaleString("fr-FR")}€</span> par an
          — soit un ROI de <span className="text-green-600">{roi}%</span>.
        </p>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 text-lg uppercase tracking-widest group active:scale-95"
          >
            Commencer l'essai gratuit 14j
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
