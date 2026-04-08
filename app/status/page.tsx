"use client";

import { useEffect, useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  latencyMs?: number;
  checkedAt: string;
  note?: string;
}

interface HealthData {
  status: string;
  services: ServiceStatus[];
  checkedAt: string;
}

const STATUS_CONFIG = {
  operational: { label: "Op\u00e9rationnel", color: "bg-green-500", textColor: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle },
  degraded: { label: "D\u00e9grad\u00e9", color: "bg-orange-500", textColor: "text-orange-700", bgColor: "bg-orange-50", icon: AlertTriangle },
  down: { label: "Indisponible", color: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

export default function StatusPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = () => {
    setLoading(true);
    setError(false);
    fetch("/api/health")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStatus(); }, []);

  const overallCfg = data ? STATUS_CONFIG[data.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.operational : STATUS_CONFIG.operational;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm">O</div>
              <span className="text-lg font-black tracking-tight text-slate-900">AudiBot</span>
            </Link>
            <h1 className="text-3xl font-black text-slate-900">Statut des services</h1>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Overall status */}
        {data && !error && (
          <div className={`${overallCfg.bgColor} rounded-card p-6 mb-8 flex items-center gap-4`}>
            <div className={`w-4 h-4 rounded-full ${overallCfg.color}`} />
            <div>
              <p className={`text-lg font-black ${overallCfg.textColor}`}>
                {data.status === "operational"
                  ? "Tous les syst\u00e8mes sont op\u00e9rationnels"
                  : data.status === "degraded"
                    ? "Certains services sont d\u00e9grad\u00e9s"
                    : "Des services sont indisponibles"}
              </p>
              <p className="text-xs font-medium text-slate-400 mt-1">
                Derni\u00e8re v\u00e9rification : {new Date(data.checkedAt).toLocaleString("fr-FR")}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-card p-6 mb-8 text-center">
            <p className="text-red-600 font-bold">Impossible de charger le statut. Veuillez r\u00e9essayer.</p>
          </div>
        )}

        {/* Services */}
        {data && !error && (
          <div className="bg-white rounded-card border border-slate-100 shadow-sm divide-y divide-slate-100">
            {data.services.map((service) => {
              const cfg = STATUS_CONFIG[service.status];
              const Icon = cfg.icon;
              return (
                <div key={service.name} className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${cfg.textColor}`} />
                    <span className="font-bold text-slate-900">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.note && (
                      <span className="text-2xs font-medium text-slate-400 italic">{service.note}</span>
                    )}
                    {service.latencyMs !== undefined && (
                      <span className="text-2xs font-medium text-slate-400">{service.latencyMs}ms</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-2xs font-black ${cfg.bgColor} ${cfg.textColor}`}>
                      {cfg.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && !data && (
          <div className="bg-white rounded-card border border-slate-100 shadow-sm p-12 text-center">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Chargement...</p>
          </div>
        )}

        <p className="text-center text-xs text-slate-400 font-medium mt-10">
          <Link href="/" className="hover:text-blue-600 transition-colors">Retour \u00e0 l&apos;accueil</Link>
          {" \u00b7 "}
          <Link href="/legal/confidentialite" className="hover:text-blue-600 transition-colors">Confidentialit\u00e9</Link>
        </p>
      </div>
    </div>
  );
}
