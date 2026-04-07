"use client";

import { useEffect, useState } from "react";
import { getOcrScanHistory } from "@/app/dashboard/actions";
import HistoriqueClient from "@/app/dashboard/historique/HistoriqueClient";
import { Loader2 } from "lucide-react";

export default function OcrStatsPanel() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getOcrScanHistory>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOcrScanHistory()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!data || data.scans.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 font-medium">
        Aucun scan OCR pour le moment.
      </div>
    );
  }

  return (
    <HistoriqueClient
      scans={data.scans}
      isPlanLimite={data.isPlanLimite}
      plan={data.plan}
    />
  );
}
