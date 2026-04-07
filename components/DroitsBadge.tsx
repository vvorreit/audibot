"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldX, ShieldQuestion } from "lucide-react";

interface DroitsData {
  droitsOuverts: boolean | null;
  dateFinDroits: string | null;
  tauxPEC: string | null;
  organisme: string | null;
  portal: string;
  createdAt: string;
}

interface Props {
  nss: string;
  syncToken?: string | null;
  compact?: boolean;
}

export default function DroitsBadge({ nss, syncToken, compact = false }: Props) {
  const [data, setData] = useState<DroitsData | null | undefined>(undefined);

  useEffect(() => {
    if (!nss || !syncToken) { setData(null); return; }
    fetch(`/api/extension/droits-verifies?token=${encodeURIComponent(syncToken)}&nss=${encodeURIComponent(nss)}`)
      .then((r) => r.json())
      .then((d) => setData(d.record ?? null))
      .catch(() => setData(null));
  }, [nss, syncToken]);

  if (data === undefined) return null; // loading
  if (!data) {
    if (compact) return null;
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
        <ShieldQuestion className="w-3.5 h-3.5" />
        Non vérifiés
      </span>
    );
  }

  const date = new Date(data.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

  if (data.droitsOuverts) {
    return (
      <span
        title={[data.tauxPEC && `Taux : ${data.tauxPEC}`, data.dateFinDroits && `Fin : ${data.dateFinDroits}`, `Via ${data.portal} · ${date}`].filter(Boolean).join(" — ")}
        className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        {compact ? "Droits ✓" : `Droits ouverts · ${date}`}
      </span>
    );
  }

  return (
    <span
      title={[data.dateFinDroits && `Fin : ${data.dateFinDroits}`, `Via ${data.portal} · ${date}`].filter(Boolean).join(" — ")}
      className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full"
    >
      <ShieldX className="w-3.5 h-3.5" />
      {compact ? "Droits ✗" : `Droits fermés · ${date}`}
    </span>
  );
}
