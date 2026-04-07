"use client";

import { useState } from "react";

interface HotPatch {
  id: string;
  name: string;
  type: string;
  hostnames: string[];
  data: unknown;
  active: boolean;
  priority: number;
  description: string | null;
  createdAt: Date;
}

export function HotPatchActions({ patches: initialPatches }: { patches: HotPatch[] }) {
  const [patches, setPatches] = useState(initialPatches);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState("js");
  const [hostnames, setHostnames] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);
  // JS type
  const [jsCode, setJsCode] = useState("");
  // Selector type
  const [selectorPortal, setSelectorPortal] = useState("");
  const [selectorJson, setSelectorJson] = useState("{}");
  // Alias type
  const [aliasField, setAliasField] = useState("");
  const [aliasValues, setAliasValues] = useState("");

  async function handleCreate() {
    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = {};
    if (type === "js") data = { code: jsCode };
    else if (type === "selector_override") {
      try { data = { portal: selectorPortal, selectors: JSON.parse(selectorJson) }; }
      catch { data = { portal: selectorPortal, selectors: {} }; }
    }
    else if (type === "alias_add") data = { field: aliasField, aliases: aliasValues.split(",").map(s => s.trim()).filter(Boolean) };

    const res = await fetch("/api/admin/hotpatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, hostnames: hostnames.split(",").map(s => s.trim()).filter(Boolean), data, description, priority }),
    });
    if (res.ok) {
      const result = await res.json();
      setPatches([result.patch, ...patches]);
      setShowForm(false);
      setName(""); setJsCode(""); setDescription(""); setHostnames("");
    }
    setSaving(false);
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch("/api/admin/hotpatch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    setPatches(patches.map(p => p.id === id ? { ...p, active } : p));
  }

  async function deletePatch(id: string) {
    if (!confirm("Supprimer ce patch ?")) return;
    await fetch("/api/admin/hotpatch", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPatches(patches.filter(p => p.id !== id));
  }

  return (
    <div>
      {/* Bouton créer */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
      >
        {showForm ? "Annuler" : "+ Nouveau patch"}
      </button>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nom</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Fix sélecteur Almerys nom" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label htmlFor="hotpatch-type" className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
              <select id="hotpatch-type" value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="js">Code JS</option>
                <option value="selector_override">Override sélecteur</option>
                <option value="alias_add">Ajout alias smart-fill</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Hostnames ciblés (séparés par virgule, * = tous)</label>
            <input value={hostnames} onChange={e => setHostnames(e.target.value)} placeholder="almerys.com, be-almerys.com" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Priorité (plus haut = exécuté en premier)</label>
            <input type="number" value={priority} onChange={e => setPriority(parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 border rounded-lg text-sm" />
          </div>

          {/* Champs selon le type */}
          {type === "js" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Code JavaScript</label>
              <textarea value={jsCode} onChange={e => setJsCode(e.target.value)} rows={10} placeholder={`// Exemple : override la fonction ultraFill pour un portail\nvar originalUF = globalThis.ultraFill;\n// ...`} className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-gray-900 text-green-400" />
            </div>
          )}

          {type === "selector_override" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Clé portail</label>
                <input value={selectorPortal} onChange={e => setSelectorPortal(e.target.value)} placeholder="mutuelle-almerys.com" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Sélecteurs (JSON)</label>
                <textarea value={selectorJson} onChange={e => setSelectorJson(e.target.value)} rows={5} placeholder='{"nom_beneficiaire": "#new_selector", "prenom": ".new-class input"}' className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
              </div>
            </div>
          )}

          {type === "alias_add" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Champ smart-fill</label>
                <input value={aliasField} onChange={e => setAliasField(e.target.value)} placeholder="roCodeRegime" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Aliases (séparés par virgule)</label>
                <input value={aliasValues} onChange={e => setAliasValues(e.target.value)} placeholder="code_regime, ro_code_regime, regime_code" className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description / notes</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Contexte du fix..." className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>

          <button onClick={handleCreate} disabled={saving || !name} className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition">
            {saving ? "Enregistrement..." : "Créer le patch"}
          </button>
        </div>
      )}

      {/* Liste des patches */}
      <div className="space-y-3">
        {patches.length === 0 && (
          <div className="text-center text-gray-400 py-16">Aucun hot-patch.</div>
        )}
        {patches.map(patch => (
          <div key={patch.id} className={`bg-white rounded-xl border p-4 ${!patch.active ? "opacity-50" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${patch.active ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="font-semibold text-sm text-gray-900">{patch.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    patch.type === "js" ? "bg-purple-100 text-purple-700" :
                    patch.type === "selector_override" ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {patch.type}
                  </span>
                  {patch.priority > 0 && (
                    <span className="text-[10px] text-gray-400">P{patch.priority}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {patch.hostnames.map(h => (
                    <span key={h} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-mono">{h}</span>
                  ))}
                </div>
                {patch.description && (
                  <p className="text-xs text-gray-500 mt-1">{patch.description}</p>
                )}
                <pre className="mt-2 text-[10px] text-gray-400 font-mono bg-gray-50 p-2 rounded max-h-24 overflow-auto">
                  {JSON.stringify(patch.data, null, 2)}
                </pre>
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleActive(patch.id, !patch.active)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold ${
                    patch.active ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {patch.active ? "Désactiver" : "Activer"}
                </button>
                <button
                  onClick={() => deletePatch(patch.id)}
                  className="px-3 py-1 rounded text-[11px] font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
