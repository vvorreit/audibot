"use client";

import { useState, useEffect } from "react";
import { X, ScanLine } from "lucide-react";

const DISMISS_KEY = "audibot_reengagement_dismissed_at";

interface Props {
  lastActiveAt: string | Date | null;
  clientCount: number;
  isPro: boolean;
  trialExpired: boolean;
}

export default function ReengagementBanner({ lastActiveAt, clientCount, isPro, trialExpired }: Props) {
  const [show, setShow] = useState(false);
  const [daysSince, setDaysSince] = useState(0);

  useEffect(() => {
    if (!lastActiveAt || clientCount <= 0) return;
    if (trialExpired && !isPro) return;

    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissedDays = Math.floor((Date.now() - parseInt(dismissedAt, 10)) / 86_400_000);
      if (dismissedDays < 7) return;
    }

    const days = Math.floor((Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000);
    if (days >= 7) {
      setDaysSince(days);
      setShow(true);
    }
  }, [lastActiveAt, clientCount, isPro, trialExpired]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  };

  const handleScan = () => {
    dismiss();
    const dropzone = document.getElementById("audibot-fill-btn") || document.querySelector("[data-dropzone='mutuelle']");
    if (dropzone) {
      dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (!show) return null;

  return (
    <div className="bg-blue-50 border-b border-blue-100 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-blue-800 flex-1">
          Vous n&apos;avez pas utilis&eacute; AudiBot depuis <strong>{daysSince} jour{daysSince > 1 ? "s" : ""}</strong> &mdash; votre prochain client vous attend.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleScan}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ScanLine className="w-3.5 h-3.5" />
            Scanner maintenant
          </button>
          <button
            onClick={dismiss}
            className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
