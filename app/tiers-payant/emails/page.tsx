"use client";

import { useEffect, useState } from "react";
import { getMutuelleEmailConfigs, updateMutuelleEmail } from "./actions";
import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";
import {
  Mail, CheckCircle, ToggleLeft, ToggleRight, Save, Info,
} from "lucide-react";
import TiersPayantNav from "@/components/TiersPayantNav";

interface MutuelleConfig {
  id: string;
  mutuelle: string;
  emailDefaut: string;
  emailPerso: string | null;
  actif: boolean;
}

export default function EmailsPage() {
  const [configs, setConfigs] = useState<MutuelleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    getMutuelleEmailConfigs()
      .then(setConfigs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleToggle = async (config: MutuelleConfig) => {
    try {
      await updateMutuelleEmail(config.id, { actif: !config.actif });
      setLoading(true);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveEmail = async (config: MutuelleConfig) => {
    setSaving(true);
    try {
      await updateMutuelleEmail(config.id, { emailPerso: editEmail || null });
      setSuccess(`Email mis a jour pour ${config.mutuelle}`);
      setEditingId(null);
      setEditEmail("");
      setLoading(true);
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && configs.length === 0) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-indigo-600">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Acces Refuse</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour au dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1 text-slate-900 pb-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight">Emails mutuelles</h1>
                <p className="text-slate-500 font-medium text-sm">Configuration des adresses email pour les relances automatiques</p>
              </div>
            </div>
            <TiersPayantNav />
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-sm font-medium text-indigo-700">
              <p className="font-bold mb-1">Comment ca fonctionne ?</p>
              <p>Chaque mutuelle a une adresse email par defaut. Vous pouvez la personnaliser si vous connaissez une adresse plus directe. Desactivez une mutuelle pour ne pas recevoir de relances automatiques.</p>
            </div>
          </div>

          <div className="space-y-4">
            {configs.map((config) => {
              const isEditing = editingId === config.id;
              const emailActuel = config.emailPerso || config.emailDefaut;

              return (
                <div key={config.id} className={`bg-white rounded-[28px] shadow-sm border border-slate-100 p-6 transition-opacity ${!config.actif ? "opacity-50" : ""}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-black text-sm">{config.mutuelle}</h3>
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder={config.emailDefaut}
                              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                            />
                            <button
                              onClick={() => handleSaveEmail(config)}
                              disabled={saving}
                              className="px-3 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditEmail(""); }}
                              className="px-3 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-400 font-medium">{emailActuel}</p>
                            {config.emailPerso && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-green-100 text-green-700">Personnalise</span>
                            )}
                            <button
                              onClick={() => { setEditingId(config.id); setEditEmail(config.emailPerso || ""); }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Modifier
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(config)}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0"
                      title={config.actif ? "Desactiver" : "Activer"}
                    >
                      {config.actif ? (
                        <ToggleRight className="w-6 h-6 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-300" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {configs.length === 0 && (
              <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100">
                <Mail className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Aucune configuration email.</p>
                <p className="text-slate-300 text-sm font-medium mt-1">Les configurations seront generees automatiquement.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
