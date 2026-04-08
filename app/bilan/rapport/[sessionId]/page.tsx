export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import type { BilanResult } from "@/types/bilan";
import PrintButton from "./PrintButton";

export default async function BilanRapportPage({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { sessionId } = await params;
  const { token } = await searchParams;

  let authorized = false;
  if (token) {
    const user = await prisma.user.findUnique({ where: { syncToken: token }, select: { id: true } });
    if (user) authorized = true;
  }
  if (!authorized) {
    const session = await getServerSession(authOptions);
    if (session?.user?.id && session.user.role === "ADMIN") authorized = true;
  }
  if (!authorized) notFound();

  const bilanSession = await prisma.bilanSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true, payload: true, delivered: true, createdAt: true, clientEmail: true,
      user: { select: { bilanConfig: { select: { nomMagasin: true, logoUrl: true, accentColor: true, footerText: true } } } },
    },
  });

  if (!bilanSession?.delivered || !bilanSession.payload) notFound();

  let result: BilanResult;
  try { result = JSON.parse(bilanSession.payload) as BilanResult; }
  catch { notFound(); }

  const config = bilanSession.user.bilanConfig;
  const accent = config?.accentColor ?? "#2563eb";

  const date = bilanSession.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const clientLabel = bilanSession.clientEmail ? bilanSession.clientEmail.split("@")[0] : "Patient";

  /* ── Severity mappings ── */
  const complexiteClasses =
    result.complexiteScore >= 4
      ? { badge: "bg-red-50 text-red-600",    dot: "bg-red-500"    }
      : result.complexiteScore >= 3
      ? { badge: "bg-amber-50 text-amber-600", dot: "bg-amber-500"  }
      : { badge: "bg-green-50 text-green-700", dot: "bg-green-500"  };

  const PRIORITY: Record<string, { badge: string }> = {
    must:        { badge: "bg-red-50 text-red-700"        },
    recommended: { badge: "bg-blue-50 text-blue-700"      },
    optional:    { badge: "bg-slate-100 text-slate-500"   },
  };
  const PRIORITY_LABEL: Record<string, string> = {
    must: "Indispensable", recommended: "Recommandé", optional: "Option",
  };

  const ALERT: Record<string, { wrap: string; bar: string; text: string; prefix: string }> = {
    urgent:    { wrap: "bg-red-50 border border-red-200",    bar: "bg-red-500",    text: "text-red-800",    prefix: "⚠️" },
    attention: { wrap: "bg-amber-50 border border-amber-200", bar: "bg-amber-500",  text: "text-amber-900",  prefix: "⚡" },
    info:      { wrap: "bg-blue-50 border border-blue-200",   bar: "bg-blue-500",   text: "text-blue-800",   prefix: "ℹ️" },
  };

  const OPPO: Record<string, { badge: string; label: string }> = {
    verre:                { badge: "bg-blue-50 text-blue-700",   label: "Verre"      },
    monture:              { badge: "bg-slate-100 text-slate-600", label: "Monture"  },
    paire_supplementaire: { badge: "bg-green-50 text-green-700", label: "2e paire"  },
    accessoire:           { badge: "bg-amber-50 text-amber-700", label: "Accessoire" },
  };

  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <div className="max-w-2xl mx-auto px-5 py-8 print:py-4 space-y-4 text-slate-800">

        {/* Bouton impression */}
        <div className="flex justify-end no-print">
          <PrintButton accent={accent} />
        </div>

        {/* ── Header card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {config?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.logoUrl} alt="" className="max-h-12 max-w-[140px] object-contain" />
              ) : (
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: accent }}
                >
                  <span className="text-white font-black text-xl">O</span>
                </div>
              )}
              <div>
                <p className="text-lg font-black text-slate-900 leading-tight">Bilan auditif</p>
                <p className="text-sm text-slate-500 mt-0.5">{config?.nomMagasin ?? "AudiBot"} · {date}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${complexiteClasses.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${complexiteClasses.dot}`} />
                {result.complexiteLabel}
              </span>
              <span className="text-sm text-slate-500 font-semibold">👤 {clientLabel}</span>
            </div>
          </div>
        </div>

        {/* ── Profil patient ── */}
        <div
          className="rounded-2xl p-5 border"
          style={{ background: accent + "12", borderColor: accent + "30" }}
        >
          <p className="text-2xs font-black uppercase tracking-widest mb-2" style={{ color: accent }}>
            Profil patient
          </p>
          <p className="text-base font-bold text-slate-900 leading-relaxed">{result.profileText}</p>
        </div>

        {/* ── Alertes cliniques ── */}
        {result.alertes.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-4">Alertes cliniques</p>
            <div className="space-y-2.5">
              {result.alertes.map((alt, i) => {
                const cfg = ALERT[alt.niveau] ?? ALERT.info;
                return (
                  <div key={i} className={`flex gap-3 rounded-xl overflow-hidden ${cfg.wrap}`}>
                    <div className={`w-1 shrink-0 rounded-l-xl ${cfg.bar}`} />
                    <p className={`py-3 pr-4 text-sm font-semibold leading-relaxed ${cfg.text}`}>
                      {cfg.prefix} {alt.message}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Recommandations verres ── */}
        {result.lensRecommendations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-4">Recommandations verres</p>
            <div className="space-y-2">
              {result.lensRecommendations.map((rec, i) => {
                const cfg = PRIORITY[rec.priority] ?? PRIORITY.optional;
                const label = PRIORITY_LABEL[rec.priority] ?? "Option";
                return (
                  <div key={i} className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{rec.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{rec.reason}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wide ${cfg.badge}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Opportunités commerciales ── */}
        {result.opportunites.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-4">Opportunités commerciales</p>
            <div className="space-y-2">
              {result.opportunites.map((opp, i) => {
                const cfg = OPPO[opp.type] ?? OPPO.accessoire;
                return (
                  <div key={i} className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="font-bold text-sm text-slate-900">{opp.label}</p>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-black ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-snug">{opp.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Script conseil ── */}
        {result.scriptConseil.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-4">Script conseil</p>
            <ul className="space-y-2.5">
              {result.scriptConseil.map((script, i) => (
                <li key={i} className="flex gap-2.5 items-start text-sm text-slate-700 leading-relaxed">
                  <span className="mt-0.5 shrink-0 font-black" style={{ color: accent }}>›</span>
                  <span>{script}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-slate-400 pt-2 pb-6">
          {config?.nomMagasin ?? "Mon magasin"} · Généré par AudiBot
          {config?.footerText && <><br />{config.footerText}</>}
        </p>

      </div>
    </div>
  );
}
