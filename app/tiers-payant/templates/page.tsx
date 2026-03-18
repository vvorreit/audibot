"use client";

import { useEffect, useState } from "react";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate, previewTemplate } from "./actions";
import NavMenu from "@/components/NavMenu";
import AppFooter from "@/components/AppFooter";
import Link from "next/link";
import {
  Plus, FileText, Trash2, Edit3, Eye, X, Check, ToggleLeft, ToggleRight,
} from "lucide-react";
import TiersPayantNav from "@/components/TiersPayantNav";

interface Template {
  id: string;
  nom: string;
  type: string;
  objet: string;
  contenu: string;
  delaiJours: number | null;
  actif: boolean;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  amiable: { label: "Amiable", color: "bg-green-100 text-green-700" },
  ferme: { label: "Ferme", color: "bg-amber-100 text-amber-700" },
  mise_en_demeure: { label: "Mise en demeure", color: "bg-red-100 text-red-700" },
};

const VARIABLES_LIST = [
  { key: "{{nom_mutuelle}}", desc: "Nom de la mutuelle" },
  { key: "{{montant}}", desc: "Montant du" },
  { key: "{{date_envoi}}", desc: "Date d'envoi du dossier" },
  { key: "{{reference_dossier}}", desc: "Reference du dossier TP" },
  { key: "{{nom_audioprothesiste}}", desc: "Nom de l'audioprothesiste" },
  { key: "{{adresse_cabinet}}", desc: "Adresse du cabinet" },
  { key: "{{date_courrier}}", desc: "Date du courrier" },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [nom, setNom] = useState("");
  const [type, setType] = useState("amiable");
  const [objet, setObjet] = useState("");
  const [contenu, setContenu] = useState("");
  const [delaiJours, setDelaiJours] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [previewData, setPreviewData] = useState<{ objet: string; contenu: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadTemplates = () => {
    getTemplates()
      .then(setTemplates)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTemplates(); }, []);

  const resetForm = () => {
    setNom("");
    setType("amiable");
    setObjet("");
    setContenu("");
    setDelaiJours("");
    setFormError(null);
    setEditingId(null);
  };

  const openEdit = (t: Template) => {
    setNom(t.nom);
    setType(t.type);
    setObjet(t.objet);
    setContenu(t.contenu);
    setDelaiJours(t.delaiJours != null ? String(t.delaiJours) : "");
    setEditingId(t.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      if (editingId) {
        await updateTemplate(editingId, {
          nom: nom.trim(),
          type,
          objet: objet.trim(),
          contenu,
          delaiJours: delaiJours ? parseInt(delaiJours, 10) : null,
        });
        setSuccess("Template mis a jour");
      } else {
        await createTemplate({
          nom: nom.trim(),
          type,
          objet: objet.trim(),
          contenu,
          delaiJours: delaiJours ? parseInt(delaiJours, 10) : undefined,
        });
        setSuccess("Template cree");
      }
      resetForm();
      setShowForm(false);
      setLoading(true);
      loadTemplates();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce template ?")) return;
    try {
      await deleteTemplate(id);
      setSuccess("Template supprime");
      setLoading(true);
      loadTemplates();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggle = async (t: Template) => {
    try {
      await updateTemplate(t.id, { actif: !t.actif });
      setLoading(true);
      loadTemplates();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePreview = async (templateId: string) => {
    setPreviewLoading(true);
    setPreviewData(null);
    try {
      const result = await previewTemplate(templateId);
      setPreviewData({ objet: result.objet, contenu: result.contenu });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading && templates.length === 0) {
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

  const labelCls = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5";
  const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavMenu />
      <main className="flex-1 text-slate-900 pb-20">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight">Templates de relance</h1>
                <p className="text-slate-500 font-medium text-sm">Modeles de courriers pour les relances mutuelles</p>
              </div>
              <button
                onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Nouveau template
              </button>
            </div>
            <TiersPayantNav />
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <Check className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          {showForm && (
            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 mb-8">
              <h2 className="text-lg font-black mb-6">{editingId ? "Modifier le template" : "Creer un template"}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Nom du template *</label>
                    <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Relance amiable J+30" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Type *</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                      <option value="amiable">Amiable</option>
                      <option value="ferme">Ferme</option>
                      <option value="mise_en_demeure">Mise en demeure</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Delai (jours apres envoi)</label>
                    <input type="number" min="1" value={delaiJours} onChange={(e) => setDelaiJours(e.target.value)} placeholder="Ex: 30" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Objet du courrier *</label>
                    <input type="text" value={objet} onChange={(e) => setObjet(e.target.value)} placeholder="Ex: Relance - Dossier {{reference_dossier}}" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Contenu du courrier *</label>
                  <textarea
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    placeholder="Redigez le contenu du courrier. Utilisez les variables ci-dessous..."
                    rows={10}
                    className={inputCls + " resize-none font-mono text-xs"}
                  />
                </div>

                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Variables disponibles</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {VARIABLES_LIST.map((v) => (
                      <div key={v.key} className="flex items-center gap-2 text-xs">
                        <code className="px-2 py-1 bg-white rounded-lg border border-slate-200 font-mono font-bold text-indigo-600">{v.key}</code>
                        <span className="text-slate-400 font-medium">{v.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">{formError}</div>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <button type="submit" disabled={submitting} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50">
                    {submitting ? "Enregistrement..." : editingId ? "Mettre a jour" : "Creer le template"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {previewData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPreviewData(null)}>
              <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-2xl mx-4 p-8 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-black text-lg">Apercu du courrier</h2>
                  <button onClick={() => setPreviewData(null)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Objet</p>
                    <p className="text-sm font-bold text-slate-700 bg-slate-50 rounded-xl px-4 py-3">{previewData.objet}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contenu</p>
                    <div className="text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                      {previewData.contenu}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {templates.map((t) => {
              const typeCfg = TYPE_LABELS[t.type] || TYPE_LABELS.amiable;
              return (
                <div key={t.id} className={`bg-white rounded-[28px] shadow-sm border border-slate-100 p-6 transition-opacity ${!t.actif ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-sm truncate">{t.nom}</h3>
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${typeCfg.color}`}>
                            {typeCfg.label}
                          </span>
                          {t.delaiJours != null && (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-slate-100 text-slate-500">
                              J+{t.delaiJours}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium truncate">{t.objet}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handlePreview(t.id)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Apercu"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(t)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggle(t)}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                        title={t.actif ? "Desactiver" : "Activer"}
                      >
                        {t.actif ? (
                          <ToggleRight className="w-5 h-5 text-indigo-600" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {templates.length === 0 && (
              <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">Aucun template de relance.</p>
                <p className="text-slate-300 text-sm font-medium mt-1">Cliquez sur &quot;Nouveau template&quot; pour commencer.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
