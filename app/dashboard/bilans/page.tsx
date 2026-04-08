"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, Clock, UserCheck, CheckCircle2, Loader2, Store, Download, RefreshCw, Settings, Upload, Link2, Copy, Check } from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode";
import type { BilanResult } from "@/types/bilan";
import { useFeature } from "@/hooks/useFeatures";
import DashboardShell from "@/components/DashboardShell";

interface QueueSession {
  id: string;
  status: "WAITING" | "IN_PROGRESS" | "DONE";
  createdAt: string;
  assignedToUserId: string | null;
  assignedToName: string | null;
  assignedAt: string | null;
  delivered: boolean;
  result: BilanResult | null;
  clientName: string | null;
  clientData: Record<string, string> | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export default function BilanQueuePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const hasBilanAccess = useFeature("bilanAuditif");
  const [sessions, setSessions] = useState<QueueSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [localDocIds, setLocalDocIds] = useState<Set<string>>(new Set());

  const isFirstLoad = useRef(true);
  const [loadedPatientId, setLoadedPatientId] = useState<string | null>(null);

  const userId = session?.user?.id;
  const syncToken = (session?.user as Record<string, unknown>)?.syncToken as string | undefined;

  // ── QR Entrée Magasin ──
  const [shopQrUrl, setShopQrUrl] = useState<string | null>(null);
  const [shopBilanUrl, setShopBilanUrl] = useState<string | null>(null);
  const [shopQrLoading, setShopQrLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const generateShopQr = useCallback(async () => {
    setShopQrLoading(true);
    try {
      const res = await fetch("/api/user/shop-token");
      const data = await res.json();
      const token = data.shopToken;
      const url = `${window.location.origin}/bilan?shop=${token}`;
      setShopBilanUrl(url);
      const dataUrl = await QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } });
      setShopQrUrl(dataUrl);
    } catch {
      setShopQrUrl(null);
      setShopBilanUrl(null);
    } finally {
      setShopQrLoading(false);
    }
  }, []);

  const regenerateShopToken = async () => {
    setShopQrLoading(true);
    try {
      const res = await fetch("/api/user/shop-token/regenerate", { method: "POST" });
      const data = await res.json();
      const token = data.shopToken;
      const url = `${window.location.origin}/bilan?shop=${token}`;
      setShopBilanUrl(url);
      const dataUrl = await QRCode.toDataURL(url, { width: 240, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } });
      setShopQrUrl(dataUrl);
    } catch {
      /* ignore */
    } finally {
      setShopQrLoading(false);
    }
  };

  const copyBilanLink = async () => {
    if (!shopBilanUrl) return;
    try {
      await navigator.clipboard.writeText(shopBilanUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    generateShopQr();
  }, [generateShopQr]);

  const fetchQueue = useCallback(async () => {
    if (document.hidden) return;
    try {
      const res = await fetch("/api/bilan/queue");
      if (!res.ok) return;
      const data = (await res.json()) as { sessions: QueueSession[] };
      setSessions(data.sessions);
      setLastUpdatedAt(new Date());
      isFirstLoad.current = false;
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    const handleVisibility = () => {
      if (!document.hidden) { fetchQueue(); }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', handleVisibility); };
  }, [fetchQueue]);

  useEffect(() => {
    (async () => {
      try {
        const { listDocuments } = await import('@/lib/documentStore');
        const localIds = await listDocuments();
        setLocalDocIds(new Set(localIds));
      } catch { /* silent */ }
    })();
  }, []);

  async function handleClaim(sessionId: string) {
    setClaimingId(sessionId);
    try {
      const res = await fetch(`/api/bilan/session/${sessionId}/claim`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erreur");
      }
      await fetchQueue();
    } finally {
      setClaimingId(null);
    }
  }

  async function handleComplete(sessionId: string) {
    setCompletingId(sessionId);
    try {
      const res = await fetch(`/api/bilan/session/${sessionId}/complete`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Erreur");
      }
      await fetchQueue();
    } finally {
      setCompletingId(null);
    }
  }

  function loadPatient(s: QueueSession) {
    if (!s.clientData) return;
    window.postMessage({
      type: "AUDIBOT_DATA",
      payload: { m: s.clientData },
    }, window.location.origin);
    setLoadedPatientId(s.id);
    setTimeout(() => setLoadedPatientId(null), 3000);
  }

  const waitingCount = sessions.filter((s) => s.status === "WAITING").length;
  const inProgressCount = sessions.filter((s) => s.status === "IN_PROGRESS").length;
  const totalActive = waitingCount + inProgressCount;

  // ADMIN ou super user bilanAuditif — sinon redirect
  if (session?.user?.role !== "ADMIN" && hasBilanAccess === false) {
    router.replace("/dashboard");
    return null;
  }
  if (session?.user?.role !== "ADMIN" && hasBilanAccess === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <Loader2 className="w-6 h-6 text-slate-600 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-black text-slate-900">File d&apos;attente bilans</h1>
          {totalActive > 0 && (
            <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-black rounded-full min-w-[24px] text-center">
              {totalActive}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdatedAt && (
            <span className="text-2xs text-slate-400 font-medium">
              Mis à jour {timeAgo(lastUpdatedAt.toISOString())}
            </span>
          )}
          <button onClick={fetchQueue} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600" title="Actualiser">
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wider">
            Béta Admin
          </span>
        </div>
      </div>

      {/* ── QR Entrée Magasin ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-slate-500" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">QR Entrée Magasin</h2>
            <p className="text-xs text-slate-500 font-medium">Affichez ce QR à l&apos;entrée — les clients remplissent leur bilan en attendant</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* QR Code */}
          <div className="shrink-0">
            {shopQrLoading ? (
              <div className="w-[160px] h-[160px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              </div>
            ) : shopQrUrl ? (
              <img src={shopQrUrl} alt="QR entrée magasin" className="w-[160px] h-[160px] rounded-xl border border-slate-200" />
            ) : (
              <div className="w-[160px] h-[160px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400 font-medium text-center p-4">
                QR non disponible
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 w-full">
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Ce QR code est permanent — il redirige vos clients vers le formulaire de bilan auditif. Imprimez-le et affichez-le dans votre magasin, ou intégrez le lien sur votre site internet.
            </p>

            {/* Lien copiable */}
            {shopBilanUrl && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <Link2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    readOnly
                    value={shopBilanUrl}
                    className="flex-1 min-w-0 bg-transparent text-xs text-slate-700 font-mono font-medium outline-none select-all truncate"
                    onFocus={(e) => e.target.select()}
                  />
                </div>
                <button
                  onClick={copyBilanLink}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    linkCopied
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {linkCopied ? "Copié !" : "Copier"}
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {shopQrUrl && (
                <a
                  href={shopQrUrl}
                  download="qr-magasin-audibot.png"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger le QR
                </a>
              )}
              <Link
                href="/dashboard/bilan-config"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs"
              >
                <Settings className="w-3.5 h-3.5" />
                Personnaliser
              </Link>
              <button
                onClick={regenerateShopToken}
                disabled={shopQrLoading}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${shopQrLoading ? "animate-spin" : ""}`} />
                Regénérer le lien
              </button>
            </div>
            <p className="text-2xs text-slate-400 font-medium">
              ⚠️ Regénérer invalide l&apos;ancien QR — à utiliser uniquement si compromis.
            </p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 text-slate-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">Chargement...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && (
        <div className="text-center py-16 bg-white rounded-card border border-slate-100">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-lg font-black text-slate-900 mb-2">Aucun bilan en attente</p>
          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto mb-6">
            Partagez le QR code ci-dessus avec vos clients. Les bilans remplis sur tablette apparaîtront ici automatiquement.
          </p>
          {shopBilanUrl && (
            <button onClick={copyBilanLink} className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors">
              {linkCopied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
              {linkCopied ? "Lien copié !" : "Copier le lien bilan"}
            </button>
          )}
        </div>
      )}

      {/* Session cards */}
      <div className="space-y-3">
        {sessions.map((s, i) => {
          const isWaiting = s.status === "WAITING";
          const isInProgress = s.status === "IN_PROGRESS";
          const isDone = s.status === "DONE";
          const isAssignedToMe = s.assignedToUserId === userId;

          return (
            <div
              key={s.id}
              className={`rounded-2xl border p-5 transition-all ${
                isWaiting
                  ? "border-slate-200 bg-white"
                  : isInProgress
                  ? "border-blue-100 bg-blue-50/30"
                  : "border-slate-100 bg-white opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black text-slate-800">
                      Bilan #{sessions.length - i}
                    </span>
                    {s.clientName && (
                      <span className="text-sm font-bold text-slate-600">
                        — {s.clientName}
                      </span>
                    )}

                    {/* Status badge */}
                    {isWaiting && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wider">
                        En attente
                      </span>
                    )}
                    {isInProgress && (
                      <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-[10px] font-black rounded-full uppercase tracking-wider">
                        {s.assignedToName ?? "Audioprothésiste"}
                      </span>
                    )}
                    {isDone && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wider">
                        Terminé
                      </span>
                    )}
                    {localDocIds.has(s.id) && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">📄 Document</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgo(s.createdAt)}
                    {s.delivered && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bilan soumis
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isWaiting && (
                    <button
                      onClick={() => handleClaim(s.id)}
                      disabled={claimingId === s.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60"
                    >
                      <UserCheck className="w-4 h-4" />
                      {claimingId === s.id ? "..." : "Je prends ce client"}
                    </button>
                  )}

                  {isInProgress && isAssignedToMe && (
                    <>
                      {s.clientData && (
                        <button
                          onClick={() => loadPatient(s)}
                          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-xl transition-all ${
                            loadedPatientId === s.id
                              ? "bg-green-600 text-white"
                              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                          }`}
                        >
                          {loadedPatientId === s.id ? (
                            <><CheckCircle2 className="w-4 h-4" /> Chargé !</>
                          ) : (
                            <><Upload className="w-4 h-4" /> Charger</>
                          )}
                        </button>
                      )}
                      {s.delivered && s.result && (
                        <button
                          onClick={() => router.push(`/dashboard/bilans/${s.id}`)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white text-blue-600 border border-blue-200 text-sm font-bold rounded-xl hover:bg-blue-50 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Résultats
                        </button>
                      )}
                      <button
                        onClick={() => handleComplete(s.id)}
                        disabled={completingId === s.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 active:scale-95 transition-all disabled:opacity-60"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        {completingId === s.id ? "..." : "Terminer"}
                      </button>
                    </>
                  )}

                  {isInProgress && !isAssignedToMe && (
                    <span className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl">
                      Pris par {s.assignedToName ?? "un audioprothésiste"}
                    </span>
                  )}

                  {isDone && s.delivered && s.result && (
                    <button
                      onClick={() => router.push(`/dashboard/bilans/${s.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white text-green-600 border border-green-200 text-sm font-bold rounded-xl hover:bg-green-50 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      Voir les résultats
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </DashboardShell>
  );
}
