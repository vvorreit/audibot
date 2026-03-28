"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ACTIONS = ["fill", "click", "select", "wait"] as const;
const SELECTOR_TYPES = ["css", "xpath"] as const;
const VARIABLES = [
  /* Patient */
  "{{nom}}", "{{prenom}}", "{{nss}}", "{{dateNaissance}}",
  /* Contact */
  "{{telephone}}", "{{email}}", "{{adresse}}", "{{codePostal}}", "{{ville}}",
  /* Mutuelle */
  "{{organisme}}", "{{numeroAdherent}}", "{{numeroAMC}}", "{{numeroTeletransmission}}",
  "{{critereSecondaire}}", "{{codeConvention}}",
  "{{dateDebutValidite}}", "{{dateFinValidite}}",
  /* Prescription */
  "{{dateOrdonnance}}", "{{nomOphtalmologue}}", "{{rpps}}",
  "{{distancePupillaire}}", "{{typePrescription}}",
  /* Lunettes OD/OG */
  "{{sphere_od}}", "{{cylindre_od}}", "{{axe_od}}", "{{addition_od}}",
  "{{sphere_og}}", "{{cylindre_og}}", "{{axe_og}}", "{{addition_og}}",
  "{{addition}}",
  /* Lentilles OD */
  "{{sphere_lentille_od}}", "{{cylindre_lentille_od}}", "{{axe_lentille_od}}", "{{addition_lentille_od}}",
  "{{rayon_od}}", "{{diametre_od}}",
  /* Lentilles OG */
  "{{sphere_lentille_og}}", "{{cylindre_lentille_og}}", "{{axe_lentille_og}}", "{{addition_lentille_og}}",
  "{{rayon_og}}", "{{diametre_og}}",
];

type Action = typeof ACTIONS[number];
type SelectorType = typeof SELECTOR_TYPES[number];

interface EtapeRPA {
  id: string;
  label: string;
  action: Action;
  selectorType: SelectorType;
  selector: string;
  variable: string | null;
  waitFor: string | null;
  timeout: number;
}

interface HistoryEntry {
  version: number;
  etapes: EtapeRPA[];
  savedAt: string;
}

interface ParcoursRPA {
  id: string;
  hostname: string;
  nom: string;
  etapes: EtapeRPA[];
  valide: boolean;
  version: number;
  history: HistoryEntry[] | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  viaExtension?: boolean;
}

function newEtape(index: number): EtapeRPA {
  return {
    id: `step_${Date.now()}_${index}`,
    label: "",
    action: "fill",
    selectorType: "css",
    selector: "",
    variable: "{{nom}}",
    waitFor: null,
    timeout: 5000,
  };
}

export default function AdminParcoursPage() {
  const [parcours, setParcours] = useState<ParcoursRPA[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formHostname, setFormHostname] = useState("");
  const [formNom, setFormNom] = useState("");
  const [formEtapes, setFormEtapes] = useState<EtapeRPA[]>([newEtape(0)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* P2 — Historique des versions */
  const [historyParcours, setHistoryParcours] = useState<ParcoursRPA | null>(null);
  const [restoringVersion, setRestoringVersion] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/parcours");
      const data = await res.json();
      const list = (data.parcours || []).map((p: ParcoursRPA) => ({
        ...p,
        viaExtension: !p.valide && !!p.createdBy,
      }));
      setParcours(list);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setFormHostname("");
    setFormNom("");
    setFormEtapes([newEtape(0)]);
    setEditId(null);
    setError(null);
    setShowForm(false);
  }

  function openEditForm(p: ParcoursRPA) {
    setFormHostname(p.hostname);
    setFormNom(p.nom);
    /* Normalisation : selectors[] → selector pour compat format extension */
    setFormEtapes(p.etapes.map((e) => {
      const etape = { ...e } as EtapeRPA & { selectors?: string[] };
      if ((!etape.selector || etape.selector.trim() === "") && Array.isArray(etape.selectors) && etape.selectors.length > 0) {
        etape.selector = etape.selectors[0];
      }
      /* Variable non-template → null */
      if (etape.variable && !etape.variable.startsWith("{{")) {
        etape.variable = null;
      }
      return etape;
    }));
    setEditId(p.id);
    setError(null);
    setShowForm(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const body = { hostname: formHostname, nom: formNom, etapes: formEtapes };
      const url = editId ? `/api/admin/parcours/${editId}` : "/api/admin/parcours";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error || "Erreur inconnue");
        return;
      }
      resetForm();
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleValidate(id: string, valide: boolean) {
    await fetch(`/api/admin/parcours/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valide }),
    });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce parcours ?")) return;
    await fetch(`/api/admin/parcours/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleRestore(parcoursId: string, version: number) {
    if (!confirm(`Restaurer la version ${version} ? L'état actuel sera sauvegardé dans l'historique.`)) return;
    setRestoringVersion(version);
    try {
      await fetch(`/api/admin/parcours/${parcoursId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restoreVersion: version }),
      });
      setHistoryParcours(null);
      await load();
    } finally {
      setRestoringVersion(null);
    }
  }

  function addEtape() {
    setFormEtapes((prev) => [...prev, newEtape(prev.length)]);
  }

  function removeEtape(index: number) {
    setFormEtapes((prev) => prev.filter((_, i) => i !== index));
  }

  function moveEtape(index: number, dir: -1 | 1) {
    setFormEtapes((prev) => {
      const next = [...prev];
      const swap = index + dir;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  }

  function updateEtape(index: number, field: keyof EtapeRPA, value: string | null | number) {
    setFormEtapes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === "action" && value !== "fill" && value !== "select") {
        next[index].variable = null;
      }
      if (field === "action" && (value === "fill" || value === "select")) {
        if (!next[index].variable) next[index].variable = "{{nom}}";
      }
      return next;
    });
  }

  /* ─── Shared input/select styles ─── */
  const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus:ring-2 focus:ring-blue-400 bg-white";
  const selectCls = "w-full border border-slate-300 rounded-lg px-2 py-2 text-sm text-slate-800 bg-white focus-visible:outline-none focus:ring-2 focus:ring-blue-400";
  const labelCls = "block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide";

  return (
    <>
      <div className="flex justify-end mb-6">
        <button onClick={() => { resetForm(); setShowForm(true); }} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm">
          + Nouveau parcours
        </button>
      </div>

        {/* Liste */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Chargement…</div>
        ) : parcours.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-medium">Aucun parcours. Créez le premier ↗</div>
        ) : (
          <div className="space-y-3">
            {parcours.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  {/* Ligne principale */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 text-base">{p.nom}</span>
                    {p.valide ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 rounded-full text-xs font-bold">En production</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-bold">Brouillon</span>
                    )}
                    {p.viaExtension && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 rounded-full text-xs font-bold">⏺ Via extension</span>
                    )}
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-semibold">v{p.version}</span>
                  </div>
                  {/* Ligne méta */}
                  <div className="text-sm text-slate-600 font-medium mt-1.5 flex gap-5 flex-wrap">
                    <span>🌐 <span className="text-slate-800">{p.hostname}</span></span>
                    <span>📋 <span className="text-slate-800">{p.etapes.length} étapes</span></span>
                    <span>🕐 <span className="text-slate-800">{new Date(p.updatedAt).toLocaleDateString("fr-FR")}</span></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap items-center">
                  <button
                    onClick={() => window.open(`https://${p.hostname}`, "_blank")}
                    className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition font-semibold"
                    title="Ouvrir le portail"
                  >
                    🔗 Tester
                  </button>
                  <button
                    onClick={() => openEditForm(p)}
                    className="px-3 py-1.5 text-xs bg-blue-50 text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-semibold"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleValidate(p.id, !p.valide)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition font-semibold border ${
                      p.valide
                        ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                        : "bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                    }`}
                  >
                    {p.valide ? "⏸ Invalider" : "✅ Valider"}
                  </button>
                  {p.history && p.history.length > 0 && (
                    <button
                      onClick={() => setHistoryParcours(p)}
                      className="px-3 py-1.5 text-xs bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition font-semibold"
                    >
                      🕐 Historique ({p.history.length})
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition font-semibold"
                  >
                    🗑 Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Formulaire (modal) ── */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {editId ? "Modifier le parcours" : "Nouveau parcours RPA"}
                </h2>
                <button onClick={resetForm} className="text-slate-500 hover:text-slate-800 text-xl font-bold">✕</button>
              </div>

              <div className="p-6 space-y-5">
                {error && (
                  <div className="px-4 py-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm font-medium">{error}</div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Hostname</label>
                    <input
                      type="text"
                      placeholder="almerys.com ou https://almerys.com/espace-pro"
                      value={formHostname}
                      onChange={(e) => setFormHostname(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Nom du parcours</label>
                    <input
                      type="text"
                      placeholder="Almerys — Demande TP"
                      value={formNom}
                      onChange={(e) => setFormNom(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Éditeur d'étapes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={labelCls}>Étapes ({formEtapes.length})</label>
                    <button
                      onClick={addEtape}
                      className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      + Ajouter étape
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formEtapes.map((etape, idx) => (
                      <div key={etape.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 shadow-sm">
                        {/* En-tête étape */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-slate-500 w-6">#{idx + 1}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveEtape(idx, -1)}
                              disabled={idx === 0}
                              className="w-7 h-7 text-xs bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-100 disabled:opacity-30 font-bold"
                            >▲</button>
                            <button
                              onClick={() => moveEtape(idx, 1)}
                              disabled={idx === formEtapes.length - 1}
                              className="w-7 h-7 text-xs bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-100 disabled:opacity-30 font-bold"
                            >▼</button>
                          </div>
                          <input
                            type="text"
                            placeholder="Label (ex: Remplir nom bénéficiaire)"
                            value={etape.label}
                            onChange={(e) => updateEtape(idx, "label", e.target.value)}
                            className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-medium"
                          />
                          <button
                            onClick={() => removeEtape(idx)}
                            className="text-red-500 hover:text-red-700 text-xl leading-none font-bold"
                          >✕</button>
                        </div>

                        {/* Champs étape */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <label className={labelCls}>Action</label>
                            <select
                              value={etape.action}
                              onChange={(e) => updateEtape(idx, "action", e.target.value)}
                              className={selectCls}
                            >
                              {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Type sélecteur</label>
                            <select
                              value={etape.selectorType}
                              onChange={(e) => updateEtape(idx, "selectorType", e.target.value)}
                              className={selectCls}
                            >
                              {SELECTOR_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className={labelCls}>Sélecteur CSS / XPath</label>
                            <input
                              type="text"
                              placeholder="[name='beneficiaire_nom'] ou button[type='submit']"
                              value={etape.selector}
                              onChange={(e) => updateEtape(idx, "selector", e.target.value)}
                              className={`${inputCls} font-mono`}
                            />
                          </div>
                          {(etape.action === "fill" || etape.action === "select") && (
                            <div>
                              <label className={labelCls}>Variable patient</label>
                              <select
                                value={etape.variable || ""}
                                onChange={(e) => updateEtape(idx, "variable", e.target.value || null)}
                                className={`${selectCls} font-mono`}
                              >
                                <option value="">— Choisir —</option>
                                {VARIABLES.map((v) => <option key={v} value={v}>{v}</option>)}
                              </select>
                            </div>
                          )}
                          <div>
                            <label className={labelCls}>Attendre après (waitFor)</label>
                            <input
                              type="text"
                              placeholder=".page-suivante (optionnel)"
                              value={etape.waitFor || ""}
                              onChange={(e) => updateEtape(idx, "waitFor", e.target.value || null)}
                              className={`${inputCls} font-mono`}
                            />
                          </div>
                          <div>
                            <label className={labelCls}>Timeout (ms)</label>
                            <input
                              type="number"
                              value={etape.timeout}
                              onChange={(e) => updateEtape(idx, "timeout", parseInt(e.target.value) || 5000)}
                              className={inputCls}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !formHostname || !formNom}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
                >
                  {saving ? "Enregistrement…" : editId ? "Mettre à jour" : "Créer le parcours"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal historique versions ── */}
        {historyParcours && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Historique des versions</h2>
                  <p className="text-sm text-slate-600 font-medium mt-0.5">{historyParcours.nom}</p>
                </div>
                <button onClick={() => setHistoryParcours(null)} className="text-slate-500 hover:text-slate-800 text-xl font-bold">✕</button>
              </div>
              <div className="p-6 space-y-3">
                {/* Version actuelle */}
                <div className="border border-blue-300 rounded-xl p-4 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-900">v{historyParcours.version} — Version actuelle</span>
                      <p className="text-sm text-blue-700 font-medium mt-1">
                        {historyParcours.etapes.length} étapes · modifié le {new Date(historyParcours.updatedAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Versions précédentes */}
                {historyParcours.history && historyParcours.history.length > 0 ? (
                  [...historyParcours.history].reverse().map((h) => (
                    <div key={h.version} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">v{h.version}</span>
                          <p className="text-sm text-slate-600 font-medium mt-1">
                            {Array.isArray(h.etapes) ? h.etapes.length : 0} étapes · sauvegardé le{" "}
                            {new Date(h.savedAt).toLocaleDateString("fr-FR")} à{" "}
                            {new Date(h.savedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRestore(historyParcours.id, h.version)}
                          disabled={restoringVersion === h.version}
                          className="px-3 py-1.5 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition font-semibold disabled:opacity-50"
                        >
                          {restoringVersion === h.version ? "Restauration…" : "↩ Restaurer"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 font-medium text-center py-4">Aucune version précédente.</p>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  );
}
