"use client";

import { useEffect, useState, useCallback } from "react";
import { getRejetsAutoDetectes, marquerRejetTraite } from "./actions";
import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";
import {
  Zap, CheckCircle, XCircle, AlertTriangle, ExternalLink,
} from "lucide-react";
import TiersPayantNav from "@/components/TiersPayantNav";

interface Rejet {
  id: string;
  portail: string;
  numeroDossier: string | null;
  motif: string | null;
  dateRejet: string | null;
  montant: number | null;
  dossierId: string | null;
  matched: boolean;
  traite: boolean;
  createdAt: string;
}

export default function RejetsPage() {
  const [rejets, setRejets] = useState<Rejet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTraites, setShowTraites] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    getRejetsAutoDetectes(showTraites)
      .then(setRejets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [showTraites]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTraiter = async (id: string) => {
    try {
      await marquerRejetTraite(id);
      setSuccess("Rejet marque comme traite");
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Acces Refuse</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour</Link>
        </div>
      </div>
    );
  }

  const nonTraites = rejets.filter((r) => !r.traite);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1 text-slate-900 pb-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight">Rejets auto-detectes</h1>
                <p className="text-slate-500 font-medium text-sm">Rejets importes depuis l&apos;extension Chrome</p>
              </div>
              {nonTraites.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-2xl">
                  <Zap className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-black text-red-600">{nonTraites.length} nouveau{nonTraites.length > 1 ? "x" : ""}</span>
                </div>
              )}
            </div>
            <TiersPayantNav />
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowTraites(false)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${!showTraites ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              A traiter
            </button>
            <button
              onClick={() => setShowTraites(true)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showTraites ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-400 border border-slate-100"}`}
            >
              Historique
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 font-bold text-indigo-600">Chargement...</div>
          ) : rejets.length === 0 ? (
            <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100">
              <Zap className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">{showTraites ? "Aucun rejet dans l'historique." : "Aucun rejet detecte."}</p>
              <p className="text-slate-300 text-sm font-medium mt-1">Les rejets seront automatiquement importes par l&apos;extension Chrome.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Portail", "N. Dossier", "Motif", "Date rejet", "Montant", "Match", "Detecte le", ""].map((h, i) => (
                        <th key={i} className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rejets.map((r) => (
                      <tr key={r.id} className={`hover:bg-slate-50/50 transition-colors ${r.traite ? "opacity-50" : ""}`}>
                        <td className="px-5 py-4">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-indigo-100 text-indigo-700">{r.portail}</span>
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-700">{r.numeroDossier || "\u2014"}</td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-500 max-w-[200px] truncate">{r.motif || "\u2014"}</td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-500">
                          {r.dateRejet ? new Date(r.dateRejet).toLocaleDateString("fr-FR") : "\u2014"}
                        </td>
                        <td className="px-5 py-4 text-sm font-black">
                          {r.montant != null ? `${r.montant.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} EUR` : "\u2014"}
                        </td>
                        <td className="px-5 py-4">
                          {r.matched ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-black">
                              <CheckCircle className="w-3 h-3" /> Associe
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-black">
                              <AlertTriangle className="w-3 h-3" /> Non identifie
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-400">
                          {new Date(r.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="px-5 py-4">
                          {!r.traite && (
                            <div className="flex items-center gap-2">
                              {r.dossierId && (
                                <Link href="/tiers-payant" className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-500">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}
                              <button
                                onClick={() => handleTraiter(r.id)}
                                className="px-3 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-lg text-[10px] hover:bg-slate-200 transition-colors"
                              >
                                Traiter
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
