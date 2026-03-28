"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
} from "./actions";
import Link from "next/link";
import {
  Plus,
  FileText,
  Edit3,
  Trash2,
  Eye,
  CheckCircle,
  Download,
  X,
  Lock,
} from "lucide-react";
import { inputCls } from "@/components/ui/Input";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  amiable: { label: "Amiable", color: "bg-blue-100 text-blue-700" },
  ferme: { label: "Ferme", color: "bg-amber-100 text-amber-700" },
  mise_en_demeure: { label: "Mise en demeure", color: "bg-red-100 text-red-700" },
};

const VARIABLES_LIST = [
  { key: "{{reference}}", desc: "Référence du dossier" },
  { key: "{{mutuelle}}", desc: "Nom de la mutuelle" },
  { key: "{{montant}}", desc: "Montant du dossier" },
  { key: "{{dateEnvoi}}", desc: "Date d'envoi du dossier" },
  { key: "{{joursEcoules}}", desc: "Jours écoulés depuis l'envoi" },
  { key: "{{nomOpticien}}", desc: "Nom de l'opticien" },
  /* Compatibilité ancienne syntaxe */
  { key: "{{nom_mutuelle}}", desc: "Mutuelle (ancienne syntaxe)" },
  { key: "{{reference_dossier}}", desc: "Référence (ancienne syntaxe)" },
  { key: "{{nom_opticien}}", desc: "Opticien (ancienne syntaxe)" },
  { key: "{{adresse_magasin}}", desc: "Adresse magasin" },
  { key: "{{date_courrier}}", desc: "Date du courrier" },
];

/* Valeurs fictives pour l'aperçu temps réel */
const PREVIEW_VARS: Record<string, string> = {
  "{{reference}}": "TP-2026-0042",
  "{{mutuelle}}": "Almerys",
  "{{montant}}": "250.00",
  "{{dateEnvoi}}": new Date().toLocaleDateString("fr-FR"),
  "{{joursEcoules}}": "30",
  "{{nomOpticien}}": "Dr. Martin",
  "{{nom_mutuelle}}": "Almerys",
  "{{reference_dossier}}": "TP-2026-0042",
  "{{nom_opticien}}": "Dr. Martin",
  "{{adresse_magasin}}": "12 rue de la Paix, 75002 Paris",
  "{{date_courrier}}": new Date().toLocaleDateString("fr-FR"),
  "{{date_envoi}}": new Date().toLocaleDateString("fr-FR"),
};

function applyPreviewVars(text: string): string {
  let result = text;
  for (const [key, val] of Object.entries(PREVIEW_VARS)) {
    result = result.replaceAll(key, val);
  }
  return result;
}

interface Template {
  id: string;
  nom: string;
  type: string;
  objet: string;
  contenu: string;
  delaiJours: number | null;
  actif: boolean;
}

interface Props {
  isPro: boolean;
  plan: string;
}

export default function TemplatesClient({ isPro, plan }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<Template | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [preview, setPreview] = useState<{ objet: string; contenu: string } | null>(null);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const [formNom, setFormNom] = useState("");
  const [formType, setFormType] = useState("amiable");
  const [formObjet, setFormObjet] = useState("");
  const [formContenu, setFormContenu] = useState("");
  const [formDelai, setFormDelai] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    getTemplates()
      .then(setTemplates)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 5000);
  };

  const openEditor = (template?: Template) => {
    if (template) {
      setIsNew(false);
      setEditing(template);
      setFormNom(template.nom);
      setFormType(template.type);
      setFormObjet(template.objet);
      setFormContenu(template.contenu);
      setFormDelai(template.delaiJours?.toString() || "");
    } else {
      setIsNew(true);
      setEditing(null);
      setFormNom("");
      setFormType("amiable");
      setFormObjet("");
      setFormContenu("");
      setFormDelai("");
    }
    setFormError(null);
    setPreview(null);
  };

  const closeEditor = () => {
    setEditing(null);
    setIsNew(false);
    setPreview(null);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!formNom.trim()) {
      setFormError("Le nom est requis.");
      return;
    }
    if (!formObjet.trim()) {
      setFormError("L'objet est requis.");
      return;
    }
    if (!formContenu.trim()) {
      setFormError("Le contenu est requis.");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        await createTemplate({
          nom: formNom,
          type: formType,
          objet: formObjet,
          contenu: formContenu,
          delaiJours: formDelai ? parseInt(formDelai, 10) : undefined,
        });
        showSuccessMsg("Template créé");
      } else if (editing) {
        await updateTemplate(editing.id, {
          nom: formNom,
          type: formType,
          objet: formObjet,
          contenu: formContenu,
          delaiJours: formDelai ? parseInt(formDelai, 10) : null,
        });
        showSuccessMsg("Template mis à jour");
      }
      closeEditor();
      loadData();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce template ?")) return;
    try {
      await deleteTemplate(id);
      showSuccessMsg("Template supprimé");
      loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handlePreview = async (templateId: string) => {
    try {
      const result = await previewTemplate(templateId);
      setPreview(result);
      setPreviewTemplateId(templateId);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleExportPDF = () => {
    if (!preview) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${preview.objet}</title>
<style>
  body { font-family: 'Times New Roman', serif; max-width: 700px; margin: 40px auto; padding: 40px; color: #1e293b; line-height: 1.8; font-size: 14px; }
  h1 { font-size: 16px; font-weight: bold; margin-bottom: 24px; }
  pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
  @media print { body { margin: 0; padding: 20mm; } }
</style></head>
<body>
  <h1>${preview.objet}</h1>
  <pre>${preview.contenu}</pre>
</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-card border border-red-100 max-w-md">
          <h1 className="text-2xl font-black mb-4">Accès Refusé</h1>
          <p className="font-medium mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg"
          >
            Retour
          </Link>
        </div>
      </div>
    );
  }

  const labelCls = "block text-2xs font-black uppercase tracking-widest text-slate-400 mb-1.5";

  /* Aperçu temps réel dans l'éditeur */
  const livePreviewObjet = applyPreviewVars(formObjet);
  const livePreviewContenu = applyPreviewVars(formContenu);

  return (
    <>
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Templates de relance</h1>
                <p className="text-slate-500 font-medium text-sm">Courriers et emails pré-rédigés</p>
              </div>
              {isPro && (
                <button
                  onClick={() => openEditor()}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau template
                </button>
              )}
            </div>
          </div>

          {/* Bandeau plan gratuit */}
          {!isPro && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl">
              <Lock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Personnalisation disponible à partir du plan Pro</p>
                <p className="text-xs font-medium text-amber-700 mt-0.5">
                  Vous consultez les templates en lecture seule.{" "}
                  <Link href="/dashboard/account" className="underline hover:text-amber-900">
                    Passer au plan Pro
                  </Link>
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl font-bold text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-20 font-bold text-blue-600">
              Chargement...
            </div>
          ) : (editing || isNew) && isPro ? (
            /* Éditeur */
            <div className="bg-white rounded-card shadow-sm border border-slate-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-lg">
                  {isNew ? "Nouveau template" : `Modifier "${editing?.nom}"`}
                </h2>
                <button
                  onClick={closeEditor}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Nom du template *</label>
                      <input
                        type="text"
                        value={formNom}
                        onChange={(e) => setFormNom(e.target.value)}
                        placeholder="Ex: Relance amiable"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Type *</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className={inputCls}
                      >
                        <option value="amiable">Amiable (J+30)</option>
                        <option value="ferme">Ferme (J+60)</option>
                        <option value="mise_en_demeure">Mise en demeure (J+90)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Délai associé (jours)</label>
                    <input
                      type="number"
                      min="1"
                      value={formDelai}
                      onChange={(e) => setFormDelai(e.target.value)}
                      placeholder="Ex: 30"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Objet *</label>
                    <input
                      type="text"
                      value={formObjet}
                      onChange={(e) => setFormObjet(e.target.value)}
                      placeholder="Objet du courrier / email"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Contenu *</label>
                    <textarea
                      value={formContenu}
                      onChange={(e) => setFormContenu(e.target.value)}
                      placeholder="Rédigez votre courrier ici. Utilisez les variables {{reference}}, {{mutuelle}}, etc."
                      rows={12}
                      className={inputCls + " resize-y font-mono text-xs"}
                    />
                  </div>

                  {/* Aperçu temps réel */}
                  {(formObjet || formContenu) && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-3">
                        Aperçu temps réel (données fictives)
                      </p>
                      {livePreviewObjet && (
                        <p className="text-sm font-bold text-slate-700 mb-2">{livePreviewObjet}</p>
                      )}
                      <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                        {livePreviewContenu}
                      </pre>
                    </div>
                  )}

                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                      {formError}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                    >
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button
                      onClick={closeEditor}
                      className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </div>

                {/* Variables disponibles */}
                <div className="bg-slate-50 rounded-2xl p-5">
                  <h3 className="font-black text-sm mb-4">Variables disponibles</h3>
                  <div className="space-y-2.5">
                    {VARIABLES_LIST.map((v) => (
                      <button
                        key={v.key}
                        onClick={() => setFormContenu((prev) => prev + v.key)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-white transition-colors"
                      >
                        <code className="text-xs font-bold text-blue-600">{v.key}</code>
                        <p className="text-2xs text-slate-400 font-medium">{v.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Liste des templates */
            <div className="space-y-4">
              {templates.map((t) => {
                const typeCfg = TYPE_LABELS[t.type] || TYPE_LABELS.amiable;
                return (
                  <div
                    key={t.id}
                    className="bg-white rounded-card shadow-sm border border-slate-100 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                          <h3 className="font-black text-base">{t.nom}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-2xs font-black uppercase ${typeCfg.color}`}
                          >
                            {typeCfg.label}
                          </span>
                          {t.delaiJours && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-2xs font-black">
                              J+{t.delaiJours}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 font-medium mb-1">{t.objet}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {t.contenu.slice(0, 200)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => handlePreview(t.id)}
                          className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                          title="Prévisualiser"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isPro && (
                          <>
                            <button
                              onClick={() => openEditor(t)}
                              className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                              title="Modifier"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2.5 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {preview && previewTemplateId === t.id && (
                      <div className="mt-4 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-black text-sm">
                            Prévisualisation (données exemple)
                          </h4>
                          <div className="flex gap-2">
                            <button
                              onClick={handleExportPDF}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50"
                            >
                              <Download className="w-3 h-3" />
                              PDF
                            </button>
                            <button
                              onClick={() => {
                                setPreview(null);
                                setPreviewTemplateId(null);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-200"
                            >
                              <X className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-700 mb-3">{preview.objet}</p>
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                          {preview.contenu}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
              {templates.length === 0 && (
                <div className="bg-white rounded-card p-12 text-center border border-slate-100">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">Aucun template configuré.</p>
                </div>
              )}
            </div>
          )}
    </>
  );
}
