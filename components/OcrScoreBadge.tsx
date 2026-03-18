"use client";

import { useState } from "react";
import { OcrScoreResult } from "@/lib/ocrScore";

interface Props {
  score: OcrScoreResult;
}

const CONFIG = {
  high: {
    label: "Données fiables",
    icon: "\uD83D\uDFE2",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    barColor: "bg-green-500",
  },
  medium: {
    label: "Vérification recommandée",
    icon: "\uD83D\uDFE1",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    barColor: "bg-amber-500",
  },
  low: {
    label: "Saisie manuelle conseillée",
    icon: "\uD83D\uDD34",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    barColor: "bg-red-500",
  },
} as const;

export default function OcrScoreBadge({ score }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const c = CONFIG[score.level];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="flex items-center justify-between w-full gap-2"
      >
        <span className={`text-sm font-semibold ${c.text} flex items-center gap-2`}>
          <span>{c.icon}</span>
          {c.label}
        </span>
        <span className={`text-sm font-bold ${c.text}`}>{score.globalScore}%</span>
      </button>

      {showDetails && (
        <div className="mt-3 space-y-2 text-xs text-gray-600">
          <ScoreBar label="OCR" value={Math.round(score.ocrConfidence)} color={c.barColor} />
          <ScoreBar label="Données" value={Math.round(score.dataScore)} color={c.barColor} />
          <ScoreBar label="Global" value={score.globalScore} color={c.barColor} />
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 text-right font-medium">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-bold">{value}%</span>
    </div>
  );
}
