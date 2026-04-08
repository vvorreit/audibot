"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, Save, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";

interface BilanConfigData {
  nomMagasin: string;
  logoUrl: string;
  accentColor: string;
  welcomeTitle: string;
  welcomeMessage: string;
  footerText: string;
}

const DEFAULTS: BilanConfigData = {
  nomMagasin: "",
  logoUrl: "",
  accentColor: "#2563eb",
  welcomeTitle: "",
  welcomeMessage: "",
  footerText: "",
};

export default function BilanConfigPage() {
  const [config, setConfig] = useState<BilanConfigData>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopToken, setShopToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/bilan/config").then((r) => r.json()),
      fetch("/api/user/shop-token").then((r) => r.json()),
    ])
      .then(([cfg, shop]) => {
        setConfig({
          nomMagasin: cfg.nomMagasin ?? "",
          logoUrl: cfg.logoUrl ?? "",
          accentColor: cfg.accentColor ?? "#2563eb",
          welcomeTitle: cfg.welcomeTitle ?? "",
          welcomeMessage: cfg.welcomeMessage ?? "",
          footerText: cfg.footerText ?? "",
        });
        if (shop.shopToken) setShopToken(shop.shopToken);
      })
      .catch(() => setError("Impossible de charger la configuration"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/bilan/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200_000) {
      setError("Image trop volumineuse (max 200 KB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setConfig((prev) => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const update = (field: keyof BilanConfigData, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <DashboardShell innerClassName="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Personnaliser votre questionnaire bilan</h1>
          <p className="text-sm text-slate-700 mt-1">
            Ajoutez votre logo, vos couleurs et un message d&apos;accueil personnalisé.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-bold text-slate-700 hover:text-slate-700 transition-colors"
        >
          Retour
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        {/* Nom du magasin */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Nom du magasin</label>
          <input
            type="text"
            value={config.nomMagasin}
            onChange={(e) => update("nomMagasin", e.target.value)}
            placeholder="Optique Martin"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Logo</label>
          <div className="flex items-center gap-4">
            {config.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logoUrl} alt="Logo" className="h-12 object-contain rounded border border-slate-200 p-1" />
            )}
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={config.logoUrl.startsWith("data:") ? "(image uploadée)" : config.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
                placeholder="https://... ou uploader un fichier"
                readOnly={config.logoUrl.startsWith("data:")}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
              >
                Uploader
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
          {config.logoUrl.startsWith("data:") && (
            <button
              type="button"
              onClick={() => update("logoUrl", "")}
              className="mt-1.5 text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Supprimer l&apos;image
            </button>
          )}
        </div>

        {/* Couleur */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Couleur principale</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => update("accentColor", e.target.value)}
              className="w-12 h-10 border border-slate-200 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={config.accentColor}
              onChange={(e) => update("accentColor", e.target.value)}
              placeholder="#2563eb"
              className="w-32 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="w-8 h-8 rounded-full border border-slate-200" style={{ backgroundColor: config.accentColor }} />
          </div>
        </div>

        {/* Welcome Title */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Message de bienvenue personnalisé</label>
          <input
            type="text"
            value={config.welcomeTitle}
            onChange={(e) => update("welcomeTitle", e.target.value)}
            placeholder="Bienvenue chez nous !"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Welcome Message */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Texte d&apos;introduction</label>
          <textarea
            value={config.welcomeMessage}
            onChange={(e) => update("welcomeMessage", e.target.value)}
            placeholder="Répondez à quelques questions pour que votre audioprothésiste prépare les meilleures recommandations pour vous."
            rows={3}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Footer */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Texte de pied de page</label>
          <input
            type="text"
            value={config.footerText}
            onChange={(e) => update("footerText", e.target.value)}
            placeholder="Optique Martin — 12 rue de la Paix, Paris"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Actions */}
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>
        )}
        {saved && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            Configuration enregistrée !
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
          {shopToken && (
            <a
              href={`/bilan?shop=${shopToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Aperçu
            </a>
          )}
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Prévisualisation</h2>
        <div className="bg-slate-50 rounded-2xl p-8 flex flex-col items-center text-center space-y-4 border border-slate-100">
          {config.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.logoUrl} alt="Logo preview" className="max-h-16 object-contain" />
          ) : (
            <Eye className="w-12 h-12 text-blue-600" />
          )}
          <h3 className="text-2xl font-black text-slate-900">
            {config.welcomeTitle || "Bienvenue !"}
          </h3>
          <p className="text-slate-700 text-sm max-w-sm">
            {config.welcomeMessage || "Répondez à quelques questions pour que votre audioprothésiste prépare les meilleures recommandations pour vous."}
          </p>
          <button
            type="button"
            style={{ backgroundColor: config.accentColor || "#2563eb" }}
            className="px-8 py-3 text-white font-bold rounded-2xl text-sm"
          >
            Démarrer votre bilan
          </button>
          {config.footerText && (
            <p className="text-xs text-slate-600">{config.footerText}</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
