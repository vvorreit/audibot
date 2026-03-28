"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, Building2 } from "lucide-react";
import { sendFranchiseEmail } from "./actions";

export default function FranchisePage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    const formData = new FormData(e.currentTarget);
    const result = await sendFranchiseEmail(formData);
    if (result.success) {
      setStatus("success");
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 px-4 pt-12">
      <div className="max-w-2xl mx-auto">

        <Link href="/#tarifs" className="inline-flex items-center gap-2 text-blue-600 font-bold mb-10 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour aux tarifs
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900">Offre Franchise</h1>
              <p className="text-slate-500 font-medium">10+ postes — tarif sur mesure</p>
            </div>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed">
            Vous gérez un réseau de magasins ? Parlez-nous de votre structure et nous vous proposerons une offre adaptée avec onboarding dédié, support prioritaire et intégrations sur mesure.
          </p>
        </div>

        {status === "success" ? (
          <div className="bg-white rounded-card border border-slate-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black mb-2">Demande envoyée !</h2>
            <p className="text-slate-500 font-medium mb-8">Nous vous recontacterons sous 24h avec une proposition adaptée.</p>
            <Link href="/" className="text-blue-600 font-bold text-sm underline">
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-card border border-slate-100 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom & Prénom <span className="text-red-400">*</span></label>
                  <input
                    required
                    name="name"
                    type="text"
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Email professionnel <span className="text-red-400">*</span></label>
                  <input
                    required
                    name="email"
                    type="email"
                    placeholder="jean@monreseau-optique.fr"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Téléphone <span className="text-red-400">*</span></label>
                  <input
                    required
                    name="phone"
                    type="tel"
                    placeholder="06 00 00 00 00"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom de l&apos;enseigne <span className="text-red-400">*</span></label>
                  <input
                    required
                    name="company"
                    type="text"
                    placeholder="Optique Mon Réseau"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre de magasins <span className="text-red-400">*</span></label>
                  <select
                    required
                    name="stores"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Sélectionnez</option>
                    <option value="10-20">10 à 20 magasins</option>
                    <option value="21-50">21 à 50 magasins</option>
                    <option value="51-100">51 à 100 magasins</option>
                    <option value="100+">100+ magasins</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre de postes estimé</label>
                  <input
                    name="seats"
                    type="number"
                    min="10"
                    placeholder="Ex: 35"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Nom du réseau</label>
                <input
                  name="reseau"
                  type="text"
                  placeholder="Ex: Optical Center Paris Nord"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">ERP utilisé(s)</label>
                <input
                  name="erp"
                  type="text"
                  placeholder="Ex: LBO, Optipro, logiciel interne..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Besoins spécifiques ou questions</label>
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Déploiement progressif, intégration spécifique, contraintes IT..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-slate-900 font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <button
                disabled={status === "sending"}
                className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 ${
                  status === "error" ? "bg-red-500" : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {status === "sending" ? "Envoi en cours..." : status === "error" ? "Erreur — réessayez" : (
                  <><Send className="w-5 h-5" /> Envoyer ma demande</>
                )}
              </button>

              <p className="text-xs text-slate-400 text-center font-medium">
                Nous vous recontacterons sous 24h ouvrées.
              </p>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}
