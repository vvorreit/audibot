"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink, Plug } from "lucide-react";
import {
  toggleUserAdminRole, setUserPlan, grantFreeMonths, revokeFreeMonths, deleteUserAdmin
} from "../../actions";
import { ShieldCheck, ShieldOff, Trash2, Gift, Loader2 } from "lucide-react";
import type { getUserDetail } from "@/app/admin/actions";

type UserDetail = Awaited<ReturnType<typeof getUserDetail>>;

const PLAN_COLORS: Record<string, string> = {
  FREE:      "bg-slate-100 text-slate-500",
  ESSENTIEL: "bg-green-100 text-green-700",
  PRO:       "bg-purple-100 text-purple-700",
  CABINET:   "bg-violet-100 text-violet-700",
  RESEAU:    "bg-blue-100 text-blue-800",
  EQUIPE:    "bg-blue-100 text-blue-700",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

function fmt(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR");
}

function fmtFull(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function initials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return (email ?? "??").slice(0, 2).toUpperCase();
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-1">
      <p className="text-2xs font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      {sub && <p className="text-xs font-semibold text-slate-400">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-black text-slate-800 mb-4 mt-8">{children}</h2>;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Modal Offrir mois
  const [freeMonthsModal, setFreeMonthsModal] = useState(false);
  const [freeMonthsCount, setFreeMonthsCount] = useState(1);
  const [freeMonthsNote, setFreeMonthsNote] = useState("");

  const load = useCallback(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setUser(data);
      })
      .catch(e => setError(e.message ?? "Erreur"));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleToggleAdmin = async () => {
    if (!user) return;
    if (!confirm(user.role === "ADMIN" ? "Rétrograder en utilisateur standard ?" : "Promouvoir en administrateur ?")) return;
    setLoadingAction("role");
    try {
      await toggleUserAdminRole(user.id, user.role);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setLoadingAction(null); }
  };

  const handleSetPlan = async (plan: string) => {
    if (!user) return;
    setLoadingAction("plan");
    try {
      await setUserPlan(user.id, plan);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setLoadingAction(null); }
  };

  const handleGrantFreeMonths = async () => {
    if (!user) return;
    setLoadingAction("free");
    try {
      await grantFreeMonths(user.id, freeMonthsCount, freeMonthsNote || undefined);
      setFreeMonthsModal(false);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setLoadingAction(null); }
  };

  const handleRevokeFreeMonths = async () => {
    if (!user) return;
    if (!confirm("Révoquer l'accès gratuit ?")) return;
    setLoadingAction("free");
    try {
      await revokeFreeMonths(user.id);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setLoadingAction(null); }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!confirm(`Supprimer définitivement le compte de ${user.email ?? user.id} ?\n\nCette action est irréversible.`)) return;
    setLoadingAction("delete");
    try {
      await deleteUserAdmin(user.id);
      router.push("/admin/users");
    } catch (err: any) { alert(err.message); setLoadingAction(null); }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-bold text-lg">{error}</p>
        <Link href="/admin/users" className="mt-4 text-blue-600 font-bold hover:underline inline-block">← Retour à la liste</Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-white rounded-2xl border border-slate-100" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100" />)}
        </div>
        <div className="h-48 bg-white rounded-2xl border border-slate-100" />
      </div>
    );
  }

  const cgv = user.legalAcceptances.find(a => a.documentType === "CGV");
  const dpa = user.legalAcceptances.find(a => a.documentType === "DPA");
  const freeUntilFuture = user.freeUntil && new Date(user.freeUntil) > new Date();

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Utilisateurs
      </Link>

      {/* ── Header ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-black shrink-0">
          {initials(user.name, user.email)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-slate-900 truncate">{user.name ?? "—"}</h1>
            <div className="flex gap-2">
              <select
                value={user.plan}
                onChange={(e) => handleSetPlan(e.target.value)}
                disabled={loadingAction === "plan"}
                className={`px-3 py-0.5 rounded-full text-xs font-black uppercase outline-none focus:ring-2 focus:ring-blue-500 ${PLAN_COLORS[user.plan] ?? "bg-slate-100 text-slate-500"}`}
              >
                {["FREE", "ESSENTIEL", "PRO", "CABINET", "RESEAU", "EQUIPE"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <span className={`px-3 py-0.5 rounded-full text-xs font-black uppercase ${user.role === "ADMIN" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400"}`}>
                {user.role}
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-400 font-medium mt-0.5">{user.email ?? "—"}</p>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAdmin}
            disabled={!!loadingAction}
            className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            title={user.role === "ADMIN" ? "Rétrograder" : "Promouvoir Admin"}
          >
            {loadingAction === "role" ? <Loader2 className="w-5 h-5 animate-spin" /> : user.role === "ADMIN" ? <ShieldOff className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setFreeMonthsModal(true)}
            disabled={!!loadingAction}
            className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
            title="Offrir des mois"
          >
            <Gift className="w-5 h-5" />
          </button>
          <button
            onClick={handleDeleteUser}
            disabled={!!loadingAction}
            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            title="Supprimer l'utilisateur"
          >
            {loadingAction === "delete" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Modal offrir mois */}
      {freeMonthsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFreeMonthsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 mb-6">Offrir des mois gratuits</h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {[1, 2, 3, 6, 12].map(m => (
                <button key={m} onClick={() => setFreeMonthsCount(m)} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${freeMonthsCount === m ? "bg-green-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{m} mois</button>
              ))}
            </div>
            <input type="text" value={freeMonthsNote} onChange={e => setFreeMonthsNote(e.target.value)} placeholder="Note interne..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium mb-6 focus:ring-2 focus:ring-green-500 outline-none" />
            <div className="flex gap-3">
              <button onClick={handleGrantFreeMonths} disabled={loadingAction === "free"} className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-black text-sm hover:bg-green-700 disabled:opacity-50">Confirmer</button>
              <button onClick={() => setFreeMonthsModal(false)} className="px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KpiCard
          label="Total scans"
          value={user.totalScans}
          sub={`${user.scansThisMonth} ce mois`}
        />
        <KpiCard
          label="Taux réussite OCR"
          value={`${user.successRate}%`}
          sub="score ≥ 60"
        />
        <KpiCard
          label="Remplissages ext."
          value={user.extensionStats.totalInjections}
          sub={`${user.extensionStats.injections30d} sur 30j`}
        />
        <KpiCard
          label="Dossiers TP"
          value={user.totalDossiers}
          sub={`${user.dossiersEnAttente} en attente`}
        />
        <KpiCard
          label="Dernière activité"
          value={user.lastActiveAt ? relativeTime(user.lastActiveAt) : "—"}
          sub={fmt(user.lastActiveAt)}
        />
      </div>

      {/* ── Abonnement ── */}
      <SectionTitle>Abonnement</SectionTitle>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Plan actuel</p>
            <span className={`px-3 py-1 rounded-full text-sm font-black uppercase ${PLAN_COLORS[user.plan] ?? "bg-slate-100 text-slate-500"}`}>
              {user.plan}
            </span>
          </div>
          {user.pendingPlan && (
            <div>
              <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Plan en attente</p>
              <p className="text-sm font-bold text-amber-600">{user.pendingPlan}</p>
            </div>
          )}
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Début abonnement</p>
            <p className="text-sm font-bold text-slate-700">{fmt(user.subscriptionStartDate)}</p>
          </div>
          {user.stripeCustomerId && (
            <div>
              <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Customer Stripe</p>
              <p className="text-sm font-mono text-slate-600">{user.stripeCustomerId}</p>
            </div>
          )}
        </div>

        {user.stripeSubscriptionId && (
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-1">Subscription Stripe</p>
            <a
              href={`https://dashboard.stripe.com/subscriptions/${user.stripeSubscriptionId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline"
            >
              {user.stripeSubscriptionId}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}

        {freeUntilFuture && (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-black text-green-800">Accès gratuit jusqu&apos;au {fmt(user.freeUntil)}</p>
                {user.freeMonthsNote && <p className="text-xs text-green-600 font-medium">{user.freeMonthsNote}</p>}
              </div>
            </div>
            <button onClick={handleRevokeFreeMonths} className="text-xs font-black text-red-600 hover:underline">Révoquer</button>
          </div>
        )}

        {/* Historique changements de plan */}
        {user.subscriptionHistory.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-3">Historique des changements</p>
            <div className="space-y-2">
              {user.subscriptionHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-medium shrink-0">{fmtFull(h.date)}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-black">{h.plan || "—"}</span>
                  <span className="text-slate-500 font-medium">{h.event}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Extension Usage ── */}
      <SectionTitle>Usage extension ({user.extensionStats.totalInjections} remplissages — {user.extensionStats.successRate}% succès)</SectionTitle>
      {user.recentInjections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-400 font-bold text-sm">
          Aucun remplissage enregistré.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Date", "Site", "Champs", "Statut"].map(h => (
                    <th key={h} className="px-5 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {user.recentInjections.map((inj) => (
                  <tr key={inj.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 font-medium whitespace-nowrap">{fmtFull(inj.createdAt)}</td>
                    <td className="px-5 py-3 font-bold text-slate-700 truncate max-w-[200px]">{inj.site}</td>
                    <td className="px-5 py-3 font-black text-slate-600">{inj.fieldsCount}</td>
                    <td className="px-5 py-3">
                      {inj.success
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Emails envoyés ── */}
      <SectionTitle>Emails envoyés ({user.emailsSent.length})</SectionTitle>
      {user.emailsSent.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-400 font-bold text-sm">
          Aucun email envoyé.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Date", "Type", "Sujet"].map(h => (
                    <th key={h} className="px-5 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {user.emailsSent.map((e, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 font-medium whitespace-nowrap">{fmtFull(e.sentAt)}</td>
                    <td className="px-5 py-3 font-bold text-slate-700">{e.type}</td>
                    <td className="px-5 py-3 text-slate-600">{e.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Scans récents ── */}
      <SectionTitle>Scans OCR récents ({user.recentScans.length})</SectionTitle>
      {user.recentScans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 text-slate-400 font-bold text-sm">
          Aucun scan.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Date", "Type", "Score", "Statut"].map(h => (
                    <th key={h} className="px-5 py-4 text-2xs font-black uppercase tracking-widest text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {user.recentScans.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 font-medium whitespace-nowrap">{fmtFull(s.createdAt)}</td>
                    <td className="px-5 py-3 font-bold text-slate-700 capitalize">{s.type}</td>
                    <td className="px-5 py-3">
                      {s.score !== null
                        ? <span className={`font-black ${s.score >= 60 ? "text-green-600" : "text-red-500"}`}>{Math.round(s.score)}%</span>
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      {s.success
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <XCircle className="w-5 h-5 text-red-400" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Légal ── */}
      <SectionTitle>Acceptations légales</SectionTitle>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CGV */}
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">CGV</p>
            {cgv ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">Version {cgv.documentVersion}</p>
                <p className="text-xs text-slate-500">{fmtFull(cgv.createdAt)}</p>
                {cgv.ipAddress && <p className="text-xs text-slate-400 font-mono">IP : {cgv.ipAddress}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium">Non acceptée</p>
            )}
          </div>
          {/* DPA */}
          <div>
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-2">DPA</p>
            {dpa ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700">Version {dpa.documentVersion}</p>
                <p className="text-xs text-slate-500">{fmtFull(dpa.createdAt)}</p>
                {dpa.ipAddress && <p className="text-xs text-slate-400 font-mono">IP : {dpa.ipAddress}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400 font-medium">Non acceptée</p>
            )}
          </div>
        </div>

        {/* CGV pending */}
        {user.needsCgvAcceptance && (
          <div className="px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold">
            Acceptation CGV en attente (version {user.cgvVersion ?? "?"})
          </div>
        )}

        {/* Toutes les acceptances (si plus que CGV+DPA) */}
        {user.legalAcceptances.length > 2 && (
          <div className="pt-3 border-t border-slate-100">
            <p className="text-2xs font-black uppercase tracking-widest text-slate-400 mb-3">Autres acceptances</p>
            <div className="space-y-2">
              {user.legalAcceptances
                .filter(a => a.documentType !== "CGV" && a.documentType !== "DPA")
                .map((a, i) => (
                  <div key={i} className="flex items-center gap-4 text-xs">
                    <span className="font-black text-slate-600 uppercase">{a.documentType}</span>
                    <span className="text-slate-400">v{a.documentVersion}</span>
                    <span className="text-slate-400">{fmtFull(a.createdAt)}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
