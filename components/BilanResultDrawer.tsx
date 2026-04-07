"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Info, Glasses, Eye, Sparkles, FileText } from "lucide-react";
import type { BilanResult } from "@/types/bilan";

interface FrameMatch {
  id: string;
  brand: string;
  model: string;
  shape: string;
  material: string;
  priceRange: string;
  style: string;
  imageUrl: string | null;
  score: number;
}

interface BilanResultDrawerProps {
  open: boolean;
  onClose: () => void;
  result: BilanResult;
  syncToken: string;
  sessionId?: string;
}

const PRIORITY_BADGE: Record<string, { label: string; classes: string }> = {
  must: { label: "Indispensable", classes: "bg-red-100 text-red-700" },
  recommended: { label: "Recommandé", classes: "bg-blue-100 text-blue-700" },
  optional: { label: "Option", classes: "bg-slate-100 text-slate-600" },
};

const OPPO_TYPE_BADGE: Record<string, string> = {
  verre: "Verre",
  monture: "Monture",
  paire_supplementaire: "2e paire",
  accessoire: "Accessoire",
};

export default function BilanResultDrawer({
  open,
  onClose,
  result,
  syncToken,
  sessionId,
}: BilanResultDrawerProps) {
  const [frames, setFrames] = useState<FrameMatch[]>([]);
  const [loadingFrames, setLoadingFrames] = useState(false);

  useEffect(() => {
    if (!open || !result) return;

    setLoadingFrames(true);
    const params = new URLSearchParams({
      filters: JSON.stringify(result.frameFilters),
    });

    fetch(`/api/bilan/frames/match?${params}`, {
      headers: { Authorization: `Bearer ${syncToken}` },
    })
      .then((res) => res.json())
      .then((data: { frames?: FrameMatch[] }) => {
        setFrames(data.frames ?? []);
      })
      .catch(() => setFrames([]))
      .finally(() => setLoadingFrames(false));
  }, [open, result, syncToken]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* 1. Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-black text-slate-900">Résultat bilan</h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                  result.complexiteScore >= 4
                    ? "bg-red-100 text-red-700"
                    : result.complexiteScore >= 3
                    ? "bg-orange-100 text-orange-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {result.complexiteLabel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {sessionId && (
                <a
                  href={`/bilan/rapport/${sessionId}?token=${syncToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Exporter PDF"
                >
                  <FileText className="w-5 h-5 text-blue-600" />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* 2. Synthèse */}
            <div className="bg-blue-50 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">Profil patient</span>
              </div>
              <p className="text-lg font-black text-blue-900 leading-tight">
                {result.profileText}
              </p>
            </div>

            {/* 3. Alertes */}
            {result.alertes.length > 0 && (
              <div className="space-y-2">
                {result.alertes.map((alt, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 border rounded-xl px-4 py-3 text-sm font-medium ${
                      alt.niveau === "urgent"
                        ? "bg-red-50 border-red-200 text-red-800"
                        : alt.niveau === "attention"
                        ? "bg-orange-50 border-orange-200 text-orange-800"
                        : "bg-blue-50 border-blue-200 text-blue-800"
                    }`}
                  >
                    {alt.niveau === "info" ? (
                      <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                    ) : (
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          alt.niveau === "urgent" ? "text-red-600" : "text-orange-600"
                        }`}
                      />
                    )}
                    <span>{alt.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Script conseil */}
            {result.scriptConseil.length > 0 && (
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <h3 className="font-black text-emerald-900 mb-3 text-sm">
                  Ce que vous pouvez lui dire
                </h3>
                <ul className="space-y-2">
                  {result.scriptConseil.map((script, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-emerald-800 font-medium leading-relaxed"
                    >
                      <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                      <span>{script}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 5. Recommandations verres */}
            {result.lensRecommendations.length > 0 && (
              <div>
                <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Recommandations verres
                </h3>
                <div className="space-y-2">
                  {result.lensRecommendations.map((rec, i) => {
                    const badge = PRIORITY_BADGE[rec.priority];
                    return (
                      <div
                        key={i}
                        className="rounded-xl px-4 py-3 bg-white border border-slate-200"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-black text-slate-800">
                            {rec.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider shrink-0 ${badge.classes}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5">{rec.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Opportunités commerciales */}
            {result.opportunites.length > 0 && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <h3 className="font-black text-amber-900 mb-3 text-sm">
                  À proposer
                </h3>
                <div className="space-y-2">
                  {result.opportunites.map((opp, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 bg-white rounded-xl px-4 py-3 border border-amber-100"
                    >
                      <div>
                        <div className="text-sm font-black text-slate-800">
                          {opp.label}
                        </div>
                        <p className="text-xs text-slate-700 mt-0.5">{opp.reason}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-wider shrink-0">
                        {OPPO_TYPE_BADGE[opp.type] ?? opp.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Montures suggérées */}
            <div>
              <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
                <Glasses className="w-4 h-4" />
                Montures suggérées
              </h3>

              {loadingFrames ? (
                <div className="text-center py-8 text-slate-600 text-sm">
                  Recherche des montures...
                </div>
              ) : frames.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">
                  Aucune monture correspondante en stock
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {frames.map((frame) => (
                    <div
                      key={frame.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3 hover:shadow-md transition-shadow"
                    >
                      {frame.imageUrl ? (
                        <img
                          src={frame.imageUrl}
                          alt={`${frame.brand} ${frame.model}`}
                          className="w-full h-24 object-contain rounded-xl bg-slate-50 mb-2"
                        />
                      ) : (
                        <div className="w-full h-24 bg-slate-100 rounded-xl mb-2 flex items-center justify-center">
                          <Glasses className="w-8 h-8 text-slate-700" />
                        </div>
                      )}
                      <div className="text-sm font-black text-slate-800 truncate">
                        {frame.brand}
                      </div>
                      <div className="text-xs text-slate-700 truncate">
                        {frame.model}
                      </div>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                          {frame.shape}
                        </span>
                        <span className="text-[10px] bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                          {frame.material}
                        </span>
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-bold">
                          {frame.priceRange}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl transition-colors min-h-[44px]"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
