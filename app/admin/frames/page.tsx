"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Glasses, Save, X } from "lucide-react";

interface Frame {
  id: string;
  brand: string;
  model: string;
  shape: string;
  material: string;
  weightCategory: string;
  progressiveCompatible: boolean;
  strongCorrectionOk: boolean;
  priceRange: string;
  style: string;
  targetGender: string;
  imageUrl: string | null;
  inStock: boolean;
}

const SHAPES = ["Ronde", "Carrée", "Rectangulaire", "Ovale", "Pilote", "Papillon", "Pantos"];
const MATERIALS = ["Acétate", "Métal", "Titane", "TR90"];
const WEIGHTS = ["Léger", "Moyen", "Lourd"];
const PRICES = ["Entrée", "Moyen", "Premium"];
const STYLES = ["Classique", "Moderne", "Sport", "Original", "Discret"];
const GENDERS = ["Homme", "Femme", "Mixte"];

const EMPTY_FRAME: Omit<Frame, "id"> = {
  brand: "",
  model: "",
  shape: "Ronde",
  material: "Acétate",
  weightCategory: "Moyen",
  progressiveCompatible: true,
  strongCorrectionOk: true,
  priceRange: "Moyen",
  style: "Classique",
  targetGender: "Mixte",
  imageUrl: null,
  inStock: true,
};

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function AdminFramesPage() {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFrame, setEditingFrame] = useState<(Omit<Frame, "id"> & { id?: string }) | null>(null);
  const [saving, setSaving] = useState(false);

  const loadFrames = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/frames");
      if (!res.ok) return;
      const data = (await res.json()) as { frames: Frame[] };
      setFrames(data.frames);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFrames(); }, [loadFrames]);

  const handleSave = async () => {
    if (!editingFrame) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFrame),
      });
      if (res.ok) {
        setEditingFrame(null);
        loadFrames();
      }
    } catch { /* ignore */ } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof Frame>(key: K, val: Frame[K]) => {
    setEditingFrame((prev) => (prev ? { ...prev, [key]: val } : null));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-700 font-medium">{frames.length} appareil{frames.length > 1 ? "s" : ""}</p>
        <button
          onClick={() => setEditingFrame({ ...EMPTY_FRAME })}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Edit form */}
      {editingFrame && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-900">
              {editingFrame.id ? "Modifier l'appareil" : "Nouvel appareil"}
            </h2>
            <button onClick={() => setEditingFrame(null)} className="p-1.5 hover:bg-slate-100 rounded-xl">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marque *</label>
              <input
                value={editingFrame.brand}
                onChange={(e) => updateField("brand", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Ray-Ban"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Modèle *</label>
              <input
                value={editingFrame.model}
                onChange={(e) => updateField("model", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Clubmaster"
              />
            </div>
            <SelectField label="Forme" value={editingFrame.shape} options={SHAPES} onChange={(v) => updateField("shape", v)} />
            <SelectField label="Matériau" value={editingFrame.material} options={MATERIALS} onChange={(v) => updateField("material", v)} />
            <SelectField label="Poids" value={editingFrame.weightCategory} options={WEIGHTS} onChange={(v) => updateField("weightCategory", v)} />
            <SelectField label="Gamme" value={editingFrame.priceRange} options={PRICES} onChange={(v) => updateField("priceRange", v)} />
            <SelectField label="Style" value={editingFrame.style} options={STYLES} onChange={(v) => updateField("style", v)} />
            <SelectField label="Genre" value={editingFrame.targetGender} options={GENDERS} onChange={(v) => updateField("targetGender", v)} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">URL image</label>
              <input
                value={editingFrame.imageUrl ?? ""}
                onChange={(e) => updateField("imageUrl", e.target.value || null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={editingFrame.progressiveCompatible}
                onChange={(e) => updateField("progressiveCompatible", e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Compatible progressifs</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={editingFrame.strongCorrectionOk}
                onChange={(e) => updateField("strongCorrectionOk", e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">Correction forte OK</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer self-end pb-2">
              <input
                type="checkbox"
                checked={editingFrame.inStock}
                onChange={(e) => updateField("inStock", e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-sm font-medium text-slate-700">En stock</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditingFrame(null)}
              className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !editingFrame.brand || !editingFrame.model}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-600 text-sm">Chargement…</div>
      ) : frames.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Glasses className="w-12 h-12 text-slate-200 mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Aucun appareil dans le catalogue</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 font-black text-slate-700 text-xs">Marque / Modèle</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 text-xs">Forme</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 text-xs">Matériau</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 text-xs">Gamme</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 text-xs">Style</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 text-xs">Stock</th>
                  <th className="text-right px-4 py-3 font-black text-slate-700 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {frames.map((frame) => (
                  <tr key={frame.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{frame.brand}</div>
                      <div className="text-xs text-slate-600">{frame.model}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{frame.shape}</td>
                    <td className="px-4 py-3 text-slate-600">{frame.material}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        frame.priceRange === "Premium" ? "bg-purple-100 text-purple-700" :
                        frame.priceRange === "Moyen" ? "bg-blue-100 text-blue-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {frame.priceRange}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{frame.style}</td>
                    <td className="px-4 py-3">
                      <span className={`w-2 h-2 rounded-full inline-block ${frame.inStock ? "bg-green-500" : "bg-red-400"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditingFrame(frame)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
