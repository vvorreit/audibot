"use client";

import { useEffect, useState } from "react";
import { getMutuelleEmailConfigs, updateMutuelleEmail } from "./actions";
import Link from "next/link";
import { Mail, CheckCircle, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { SkeletonPage } from "@/components/SkeletonRow";

const MUTUELLE_LABELS: Record<string, string> = {
  CPAM: "CPAM (Regime Obligatoire)",
  ALMERYS: "Almerys",
  VIAMEDIS: "Viamedis",
  ITELIS: "Itelis",
  KALIXIA: "Kalixia",
  CARTE_BLANCHE: "Carte Blanche",
  SANTECLAIR: "Santeclair",
  SEVEANE: "Seveane",
  SP_SANTE: "SP Sante",
  AUTRE: "Autre",
};

interface EmailConfig {
  id: string;
  mutuelle: string;
  emailDefaut: string;
  emailPerso: string | null;
  actif: boolean;
}

export default function EmailsConfigPage() {
  const [configs, setConfigs] = useState<EmailConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    getMutuelleEmailConfigs()
      .then((data) => {
        setConfigs(data);
        const vals: Record<string, string> = {};
        data.forEach((c) => { vals[c.id] = c.emailPerso || ""; });
        setEditValues(vals);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (config: EmailConfig) => {
    setSaving(config.id);
    try {
      const val = editValues[config.id]?.trim() || null;
      await updateMutuelleEmail(config.id, { emailPerso: val });
      setConfigs((prev) => prev.map((c) => c.id === config.id ? { ...c, emailPerso: val } : c));
      setSuccess(`Email ${MUTUELLE_LABELS[config.mutuelle]} mis a jour`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(null);
    }
  };

  const handleToggle = async (config: EmailConfig) => {
    try {
      await updateMutuelleEmail(config.id, { actif: !config.actif });
      setConfigs((prev) => prev.map((c) => c.id === config.id ? { ...c, actif: !c.actif } : c));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Accès Refusé</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link href="/dashboard" className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg">Retour</Link>
        </div>
      </div>
    );
  }

  return (
    <>


          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          {loading ? (
            <SkeletonPage />
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-700 font-medium">
                Les emails par defaut sont pre-remplis. Vous pouvez les surcharger avec une adresse personnalisee.
                L&apos;adresse personnalisee sera utilisee en priorite si elle est renseignee.
              </div>

              {configs.map((config) => {
                const label = MUTUELLE_LABELS[config.mutuelle] || config.mutuelle;
                const effectiveEmail = config.emailPerso || config.emailDefaut;
                const isModified = editValues[config.id] !== (config.emailPerso || "");

                return (
                  <div
                    key={config.id}
                    className={`bg-white rounded-card shadow-sm border p-6 transition-all ${
                      config.actif ? "border-slate-100" : "border-slate-50 opacity-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-sm">{label}</p>
                          <p className="text-2xs text-slate-400 font-medium">
                            Email actif : <span className="font-bold text-slate-600">{effectiveEmail || "Aucun"}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggle(config)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title={config.actif ? "Desactiver les relances email" : "Activer les relances email"}
                      >
                        {config.actif ? (
                          <ToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-300" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          Email par defaut
                        </label>
                        <input
                          type="email"
                          value={config.emailDefaut}
                          disabled
                          className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5">
                          Email personnalise
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            value={editValues[config.id] || ""}
                            onChange={(e) => setEditValues((prev) => ({ ...prev, [config.id]: e.target.value }))}
                            placeholder="Surcharger l'email..."
                            className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                          />
                          {isModified && (
                            <button
                              onClick={() => handleSave(config)}
                              disabled={saving === config.id}
                              className="px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0"
                            >
                              {saving === config.id ? "..." : <Save className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </>
  );
}
