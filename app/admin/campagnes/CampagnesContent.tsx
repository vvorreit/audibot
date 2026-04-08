"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mail, RefreshCw, Upload, Send, Loader2, UserX, Eye, Trash2, TestTube,
  BarChart3, X, Download, ChevronDown, User, GitCompareArrows,
  AlertCircle, Clock, MousePointerClick, CheckCircle2, CalendarClock,
  ShieldAlert, FileText, Repeat,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ──────────────────── Types ──────────────────── */

interface Campaign {
  id: string;
  name: string;
  subject: string | null;
  sendingAt: string | null;
  sentAt: string | null;
  scheduledAt: string | null;
  drip_enabled: boolean;
  drip_delay_days: number;
  drip_subject: string | null;
  drip_sent_at: string | null;
  createdAt: string;
  totalEmails: number;
  sentCount: number;
  errorCount: number;
  pendingCount: number;
  uniqueOpens: number;
  uniqueClicks: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  ctor: number;
  avgOpenDelayHours: number | null;
  hasVariants: boolean;
}

interface RiskAnalysis {
  total: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
}

interface StatsData {
  opensByDay: { date: string; opens: number; clicks: number }[];
  opensByHour: { hour: number; count: number }[];
  variantStats: {
    A: { total: number; sent: number; opens: number; clicks: number };
    B: { total: number; sent: number; opens: number; clicks: number };
  } | null;
}

interface SegmentData {
  count: number;
  pct: number;
  contacts: { email: string; firstName: string | null; lastName: string | null }[];
}

interface SegmentsResponse {
  total: number;
  segments: {
    opened_clicked: SegmentData;
    opened_only: SegmentData;
    not_opened: SegmentData;
    errors: SegmentData;
    unsubscribed: SegmentData;
  };
}

interface ContactProfile {
  email: string;
  totalCampaigns: number;
  engaged: number;
  unsubscribedAt: string | null;
  campaigns: {
    campaignId: string;
    campaignName: string;
    sentAt: string | null;
    status: string;
    opened: boolean;
    clicked: boolean;
    openCount: number;
    clickCount: number;
  }[];
}

/* ──────────────────── Helpers ──────────────────── */

function personalizeHtmlClient(html: string, token: string, firstName: string): string {
  const greeting = firstName || "Bonjour";
  let result = html.replace(/\[Prénom\]/gi, greeting);

  result = result.replace(
    /href="(https?:\/\/[^"]*(?:audibot)\.fr[^"]*)"/gi,
    (_match, url) => `href="${url}"`,
  );

  const footer = `<p style="font-size:11px;color:#999;margin-top:24px;text-align:center;">Vous recevez cet email car vous êtes professionnel indépendant. <a href="#" style="color:#999;text-decoration:underline;">Me désinscrire</a></p>`;
  if (result.includes("</body>")) {
    result = result.replace("</body>", `${footer}</body>`);
  } else {
    result += footer;
  }
  return result;
}

function campaignStatus(c: Campaign): { label: string; color: string } {
  if (c.sendingAt && !c.sentAt) {
    return { label: "Envoi en cours", color: "bg-blue-100 text-blue-700" };
  }
  if (c.sentAt) {
    if (c.drip_enabled && !c.drip_sent_at) {
      return { label: "Relance en attente", color: "bg-amber-100 text-amber-700" };
    }
    return { label: "Terminée", color: "bg-green-100 text-green-700" };
  }
  if (c.scheduledAt && !c.sendingAt) {
    return { label: "Programmée", color: "bg-purple-100 text-purple-700" };
  }
  return { label: "En attente", color: "bg-slate-100 text-slate-600" };
}

function pct(num: number, den: number) {
  if (den === 0) return "—";
  return `${((num / den) * 100).toFixed(1)}%`;
}

/* ──────────────────── Main Component ──────────────────── */

export default function CampagnesContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  /* Import CSV state */
  const [importName, setImportName] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Send state */
  const [sendCampaignId, setSendCampaignId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);

  /* A/B test state */
  const [abEnabled, setAbEnabled] = useState(false);
  const [subjectA, setSubjectA] = useState("");
  const [subjectB, setSubjectB] = useState("");
  const [splitPercent, setSplitPercent] = useState(50);

  /* Scheduled send state */
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [bestOpenHour, setBestOpenHour] = useState<number | null>(null);

  /* Drip state */
  const [dripEnabled, setDripEnabled] = useState(false);
  const [dripDelayDays, setDripDelayDays] = useState(3);
  const [dripSubject, setDripSubject] = useState("");
  const [dripHtmlBody, setDripHtmlBody] = useState("");

  /* Risk analysis state */
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [excludeHighRisk, setExcludeHighRisk] = useState(false);

  /* Compare state */
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCompare, setShowCompare] = useState(false);

  /* Detail panel state */
  const [detailId, setDetailId] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [segments, setSegments] = useState<SegmentsResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  /* Contact profile */
  const [contactProfile, setContactProfile] = useState<ContactProfile | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);

  /* Export */
  const [exportSegment, setExportSegment] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/campagnes");
      const data = await res.json();
      setCampaigns(data.campaigns ?? []);
      if (data.bestOpenHour != null) setBestOpenHour(data.bestOpenHour);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Auto-refresh every 10s if any campaign is actively sending */
  useEffect(() => {
    const hasSending = campaigns.some((c) => c.sendingAt && !c.sentAt);
    if (!hasSending) return;
    const interval = setInterval(load, 10_000);
    return () => clearInterval(interval);
  }, [campaigns, load]);

  /* ── Import ── */
  async function handleImport() {
    if (!importFile || !importName.trim()) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.append("file", importFile);
      fd.append("name", importName.trim());
      const res = await fetch("/api/admin/campagnes/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setImportResult(`Erreur : ${data.error}`);
      } else {
        setImportResult(`${data.imported} contacts importés (campagne ${data.campaignId})`);
        setImportName("");
        setImportFile(null);
        if (fileRef.current) fileRef.current.value = "";
        load();
      }
    } catch {
      setImportResult("Erreur réseau");
    } finally {
      setImporting(false);
    }
  }

  /* ── Send ── */
  async function handleSend() {
    if (!sendCampaignId || !htmlBody.trim()) return;
    if (!abEnabled && !subject.trim()) return;
    if (abEnabled && (!subjectA.trim() || !subjectB.trim())) return;
    if (scheduleEnabled && !scheduledAt) return;
    const confirmMsg = scheduleEnabled
      ? `Programmer l'envoi pour le ${new Date(scheduledAt).toLocaleString("fr-FR")} ?`
      : "Envoyer la campagne ? Cette action est irréversible.";
    if (!confirm(confirmMsg)) return;
    setSending(true);
    setSendResult(null);
    try {
      const baseBody = abEnabled
        ? { subjectA: subjectA.trim(), subjectB: subjectB.trim(), splitPercent, htmlBody: htmlBody.trim() }
        : { subject: subject.trim(), htmlBody: htmlBody.trim() };

      const body = {
        ...baseBody,
        ...(scheduleEnabled ? { scheduledAt } : {}),
        ...(excludeHighRisk ? { excludeHighRisk: true } : {}),
        ...(dripEnabled ? {
          dripEnabled: true,
          dripDelayDays,
          dripSubject: dripSubject.trim() || undefined,
          dripHtmlBody: dripHtmlBody.trim() || undefined,
        } : {}),
      };

      const res = await fetch(`/api/admin/campagnes/${sendCampaignId}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult(`Erreur : ${data.error}`);
      } else {
        const parts = [`${data.queued} emails mis en file d'attente`];
        if (data.scheduled) parts.push(`Programmé : ${new Date(data.scheduled).toLocaleString("fr-FR")}`);
        if (data.skippedHighRisk > 0) parts.push(`${data.skippedHighRisk} contacts à risque exclus`);
        if (data.abTest) parts.push(`A/B : "${data.subjectA}" vs "${data.subjectB}" (${data.splitPercent}/${100 - data.splitPercent})`);
        setSendResult(parts.join(" — "));
        load();
      }
    } catch {
      setSendResult("Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  /* ── Risk analysis ── */
  async function handleRiskAnalysis() {
    if (!sendCampaignId) return;
    setLoadingRisk(true);
    setRiskAnalysis(null);
    try {
      const res = await fetch(`/api/admin/campagnes/${sendCampaignId}/risk`);
      const data = await res.json();
      if (res.ok) setRiskAnalysis(data);
    } finally {
      setLoadingRisk(false);
    }
  }

  /* ── Test send ── */
  async function handleTestSend() {
    if (!sendCampaignId || !subject.trim() || !htmlBody.trim()) return;
    setTestSending(true);
    try {
      const res = await fetch(`/api/admin/campagnes/${sendCampaignId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject.trim(), htmlBody: htmlBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendResult(`Erreur test : ${data.error}`);
      } else {
        setSendResult("Email de test envoyé à votre adresse.");
      }
    } catch {
      setSendResult("Erreur réseau");
    } finally {
      setTestSending(false);
    }
  }

  /* ── Preview ── */
  function handlePreview() {
    if (!htmlBody.trim()) return;
    const preview = personalizeHtmlClient(htmlBody, "PREVIEW_TOKEN", "Jean");
    const blob = new Blob([preview], { type: "text/html" });
    window.open(URL.createObjectURL(blob));
  }

  /* ── Delete ── */
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer la campagne "${name}" et tous ses emails ? Cette action est irréversible.`)) return;
    try {
      const res = await fetch("/api/admin/campagnes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) load();
    } catch { /* ignore */ }
  }

  /* ── Detail panel ── */
  async function openDetail(id: string) {
    setDetailId(id);
    setLoadingDetail(true);
    setStats(null);
    setSegments(null);
    setContactProfile(null);
    try {
      const [statsRes, segRes] = await Promise.all([
        fetch(`/api/admin/campagnes/${id}/stats`),
        fetch(`/api/admin/campagnes/${id}/segments`),
      ]);
      const [statsData, segData] = await Promise.all([statsRes.json(), segRes.json()]);
      setStats(statsData);
      setSegments(segData);
    } finally {
      setLoadingDetail(false);
    }
  }

  /* ── Contact profile ── */
  async function openContactProfile(email: string) {
    setLoadingContact(true);
    try {
      const res = await fetch(`/api/admin/contacts/${encodeURIComponent(email)}`);
      const data = await res.json();
      setContactProfile(data);
    } finally {
      setLoadingContact(false);
    }
  }

  /* ── Export ── */
  function handleExport(id: string, segment: string) {
    window.open(`/api/admin/campagnes/${id}/export?segment=${segment}`, "_blank");
  }

  /* ── Compare toggle ── */
  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 3) {
        next.add(id);
      }
      return next;
    });
  }

  /* Only show campaigns that can still be sent */
  const sendable = campaigns.filter(
    (c) => c.pendingCount > 0 && !(c.sendingAt && !c.sentAt),
  );

  const selectedCampaign = campaigns.find((c) => c.id === sendCampaignId);
  const isSendingSelected = selectedCampaign?.sendingAt && !selectedCampaign?.sentAt;
  const selectedCampaigns = campaigns.filter((c) => selectedIds.has(c.id));
  const detailCampaign = campaigns.find((c) => c.id === detailId);

  return (
    <div className="space-y-10">
      <div className="flex justify-end gap-2 mb-6">
        {selectedIds.size >= 2 && (
          <button onClick={() => setShowCompare(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-sm">
            <GitCompareArrows className="w-3.5 h-3.5" /> Comparer ({selectedIds.size})
          </button>
        )}
        <Link href="/admin/unsubscribes" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <UserX className="w-3.5 h-3.5" /> Désinscrits
        </Link>
        <button onClick={() => load()} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* ═══ Compare Panel ═══ */}
      {showCompare && selectedCampaigns.length >= 2 && (
        <ComparePanel campaigns={selectedCampaigns} onClose={() => setShowCompare(false)} />
      )}

      {/* ═══ Import CSV ═══ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <Upload className="w-4 h-4" /> Importer un CSV
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nom de la campagne"
            value={importName}
            onChange={(e) => setImportName(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm file:mr-3 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 file:text-xs file:font-bold"
          />
          <button
            onClick={handleImport}
            disabled={importing || !importFile || !importName.trim()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Importer
          </button>
        </div>
        {importResult && (
          <p className={`text-xs font-medium ${importResult.startsWith("Erreur") ? "text-red-600" : "text-green-600"}`}>
            {importResult}
          </p>
        )}
      </div>

      {/* ═══ Send Campaign ═══ */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <Send className="w-4 h-4" /> Envoyer une campagne
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <select
            value={sendCampaignId ?? ""}
            onChange={(e) => setSendCampaignId(e.target.value || null)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner une campagne…</option>
            {sendable.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.pendingCount} en attente)
              </option>
            ))}
          </select>

          {!abEnabled && (
            <input
              type="text"
              placeholder="Objet du mail"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}

          {/* A/B toggle */}
          <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none self-center">
            <input
              type="checkbox"
              checked={abEnabled}
              onChange={(e) => setAbEnabled(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="font-bold">Test A/B</span>
          </label>
        </div>

        {abEnabled && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Sujet A"
                value={subjectA}
                onChange={(e) => setSubjectA(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Sujet B"
                value={subjectB}
                onChange={(e) => setSubjectB(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-500">Split :</label>
              <input
                type="range"
                min={10}
                max={90}
                step={10}
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className="w-40"
              />
              <span className="text-xs font-bold text-slate-600 tabular-nums">
                A:{splitPercent}% / B:{100 - splitPercent}%
              </span>
            </div>
          </div>
        )}

        <textarea
          placeholder={"Corps HTML du mail\nUtilisez [Prénom] pour personnaliser.\nLes liens audibot.fr seront automatiquement trackés."}
          value={htmlBody}
          onChange={(e) => setHtmlBody(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />

        {/* Scheduling */}
        <div className="border border-slate-100 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="rounded border-slate-300"
            />
            <CalendarClock className="w-4 h-4 text-purple-500" />
            Programmer l&apos;envoi
          </label>
          {scheduleEnabled && (
            <div className="space-y-2 pl-6">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {bestOpenHour != null && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <span>Vos contacts ouvrent surtout a {bestOpenHour}h — programmer a cette heure ?</span>
                  <button
                    onClick={() => {
                      const d = scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86_400_000);
                      d.setHours(bestOpenHour, 0, 0, 0);
                      if (d <= new Date()) d.setDate(d.getDate() + 1);
                      setScheduledAt(d.toISOString().slice(0, 16));
                    }}
                    className="px-2 py-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    Utiliser {bestOpenHour}h
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drip / Relance automatique */}
        <div className="border border-slate-100 rounded-xl p-4 space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dripEnabled}
              onChange={(e) => setDripEnabled(e.target.checked)}
              className="rounded border-slate-300"
            />
            <Repeat className="w-4 h-4 text-amber-500" />
            Relance automatique (drip)
          </label>
          {dripEnabled && (
            <div className="space-y-3 pl-6">
              <p className="text-xs text-slate-500">
                Envoie un email de relance aux contacts qui n&apos;ont pas ouvert l&apos;email initial.
              </p>
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500">Delai :</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={dripDelayDays}
                  onChange={(e) => setDripDelayDays(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-xs text-slate-500">jours apres l&apos;envoi</span>
              </div>
              <input
                type="text"
                placeholder="Sujet de la relance"
                value={dripSubject}
                onChange={(e) => setDripSubject(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <textarea
                placeholder="Contenu HTML de la relance"
                value={dripHtmlBody}
                onChange={(e) => setDripHtmlBody(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y"
              />
            </div>
          )}
        </div>

        {/* Risk Analysis */}
        {sendCampaignId && (
          <div className="border border-slate-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleRiskAnalysis}
                disabled={loadingRisk || !sendCampaignId}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold hover:bg-orange-100 disabled:opacity-50 transition-colors"
              >
                {loadingRisk ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                Analyser les risques
              </button>
              {riskAnalysis && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg font-bold">
                    {riskAnalysis.highRisk} risque eleve
                  </span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg font-bold">
                    {riskAnalysis.mediumRisk} moyen
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-bold">
                    {riskAnalysis.lowRisk} faible
                  </span>
                </div>
              )}
            </div>
            {riskAnalysis && riskAnalysis.highRisk > 0 && (
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none pl-1">
                <input
                  type="checkbox"
                  checked={excludeHighRisk}
                  onChange={(e) => setExcludeHighRisk(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="font-bold">Exclure les {riskAnalysis.highRisk} contacts a risque eleve (score &lt; 20)</span>
              </label>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSend}
            disabled={
              sending || !sendCampaignId || !htmlBody.trim() || !!isSendingSelected
              || (!abEnabled && !subject.trim())
              || (abEnabled && (!subjectA.trim() || !subjectB.trim()))
              || (scheduleEnabled && !scheduledAt)
            }
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : scheduleEnabled ? <CalendarClock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            {scheduleEnabled ? "Programmer" : "Envoyer la campagne"}
          </button>
          <button
            onClick={handleTestSend}
            disabled={testSending || !sendCampaignId || !subject.trim() || !htmlBody.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
            M&apos;envoyer un test
          </button>
          <button
            onClick={handlePreview}
            disabled={!htmlBody.trim()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Eye className="w-4 h-4" />
            Aperçu
          </button>
          {sendResult && (
            <p className={`text-xs font-medium ${sendResult.startsWith("Erreur") ? "text-red-600" : "text-green-600"}`}>
              {sendResult}
            </p>
          )}
        </div>
      </div>

      {/* ═══ Campaigns Table ═══ */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">Chargement…</div>
        ) : campaigns.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">Aucune campagne pour l&apos;instant.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-3 py-4 text-center w-10"></th>
                  <th className="px-4 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Campagne</th>
                  <th className="px-4 py-4 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Statut</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Progress.</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Délivr.</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Ouvert.</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Clics</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">CTOR</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Err.</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Désinscr.</th>
                  <th className="px-4 py-4 text-right text-2xs font-black uppercase tracking-widest text-slate-400">Délai ouv.</th>
                  <th className="px-4 py-4 text-center text-2xs font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const st = campaignStatus(c);
                  const isSending = !!(c.sendingAt && !c.sentAt);
                  return (
                    <tr key={c.id} className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.has(c.id) ? "bg-indigo-50" : ""}`}>
                      <td className="px-3 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(c.id)}
                          onChange={() => toggleSelect(c.id)}
                          disabled={!selectedIds.has(c.id) && selectedIds.size >= 3}
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-800">{c.name}</div>
                        <div className="text-2xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-1">
                          {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "2-digit",
                          })}
                          {c.hasVariants && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-bold">A/B</span>}
                          {c.drip_enabled && <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-bold">Drip</span>}
                          {c.scheduledAt && !c.sendingAt && !c.sentAt && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-bold">
                              {new Date(c.scheduledAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-2xs font-black ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="tabular-nums text-slate-600 text-xs">
                            {c.sentCount}/{c.totalEmails}
                          </span>
                          {isSending && c.totalEmails > 0 && (
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${Math.round((c.sentCount / c.totalEmails) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <RateBadge rate={c.deliveryRate} thresholds={[0.95, 0.90]} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-2xs text-slate-500 mr-1">{c.uniqueOpens}</span>
                        <RateBadge rate={c.openRate} thresholds={[0.30, 0.15]} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-2xs text-slate-500 mr-1">{c.uniqueClicks}</span>
                        <RateBadge rate={c.clickRate} thresholds={[0.10, 0.05]} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <RateBadge rate={c.ctor} thresholds={[0.35, 0.20]} />
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {c.errorCount > 0 ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-2xs font-black bg-red-100 text-red-700">
                            {c.errorCount}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {c.unsubscribed > 0 ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-2xs font-black bg-red-100 text-red-700">
                            {c.unsubscribed}
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-slate-500 tabular-nums whitespace-nowrap">
                        {c.avgOpenDelayHours != null ? `${c.avgOpenDelayHours.toFixed(1)}h` : "—"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openDetail(c.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Détails & stats"
                          >
                            <BarChart3 className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => window.open(`/api/admin/campagnes/${c.id}/report`, "_blank")}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Rapport HTML (Ctrl+P pour PDF)"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleExport(c.id, "all")}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Exporter CSV"
                          >
                            <Download className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ Detail Panel ═══ */}
      {detailId && detailCampaign && (
        <DetailPanel
          campaign={detailCampaign}
          stats={stats}
          segments={segments}
          loading={loadingDetail}
          contactProfile={contactProfile}
          loadingContact={loadingContact}
          exportSegment={exportSegment}
          onExportSegmentChange={setExportSegment}
          onExport={(seg) => handleExport(detailCampaign.id, seg)}
          onContactClick={openContactProfile}
          onClose={() => { setDetailId(null); setContactProfile(null); }}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   Sub-components
   ══════════════════════════════════════════════════ */

function RateBadge({ rate, thresholds }: { rate: number; thresholds: [number, number] }) {
  const colorClass =
    rate >= thresholds[0] ? "bg-green-100 text-green-700"
    : rate >= thresholds[1] ? "bg-amber-100 text-amber-700"
    : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-2xs font-black ${colorClass}`}>
      {(rate * 100).toFixed(1)}%
    </span>
  );
}

/* ── Compare Panel (Feature 1) ── */

function ComparePanel({ campaigns, onClose }: { campaigns: Campaign[]; onClose: () => void }) {
  type MetricRow = {
    label: string;
    values: number[];
    format: (v: number, idx: number) => string;
    higherIsBetter: boolean;
  };

  const rows: MetricRow[] = [
    { label: "Envoyés", values: campaigns.map((c) => c.sentCount), format: (v) => String(v), higherIsBetter: true },
    { label: "Taux délivrabilité", values: campaigns.map((c) => c.deliveryRate), format: (v) => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
    { label: "Taux d'ouverture", values: campaigns.map((c) => c.openRate), format: (v) => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
    { label: "Taux de clic", values: campaigns.map((c) => c.clickRate), format: (v) => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
    { label: "CTOR", values: campaigns.map((c) => c.ctor), format: (v) => `${(v * 100).toFixed(1)}%`, higherIsBetter: true },
    {
      label: "Désinscriptions",
      values: campaigns.map((c) => c.unsubscribed),
      format: (v, i) => `${v} (${campaigns[i].sentCount > 0 ? ((v / campaigns[i].sentCount) * 100).toFixed(1) : 0}%)`,
      higherIsBetter: false,
    },
    { label: "Erreurs", values: campaigns.map((c) => c.errorCount), format: (v) => String(v), higherIsBetter: false },
  ];

  function getCellColor(row: MetricRow, idx: number): string {
    const vals = row.values;
    const v = vals[idx];
    const best = row.higherIsBetter ? Math.max(...vals) : Math.min(...vals);
    const worst = row.higherIsBetter ? Math.min(...vals) : Math.max(...vals);
    if (vals.every((x) => x === v)) return "";
    if (v === best) return "bg-green-50 text-green-700 font-black";
    if (v === worst) return "bg-red-50 text-red-700 font-black";
    return "";
  }

  return (
    <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <GitCompareArrows className="w-4 h-4 text-indigo-600" /> Comparaison
        </h2>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-3 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Métrique</th>
              {campaigns.map((c) => (
                <th key={c.id} className="px-4 py-3 text-right text-2xs font-black uppercase tracking-widest text-slate-400">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold text-slate-700">{row.label}</td>
                {row.values.map((_, idx) => (
                  <td key={idx} className={`px-4 py-3 text-right tabular-nums ${getCellColor(row, idx)}`}>
                    {row.format(row.values[idx], idx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Detail Panel (Features 3, 4, 5, 6, 7) ── */

function DetailPanel({
  campaign,
  stats,
  segments,
  loading,
  contactProfile,
  loadingContact,
  exportSegment,
  onExportSegmentChange,
  onExport,
  onContactClick,
  onClose,
}: {
  campaign: Campaign;
  stats: StatsData | null;
  segments: SegmentsResponse | null;
  loading: boolean;
  contactProfile: ContactProfile | null;
  loadingContact: boolean;
  exportSegment: string;
  onExportSegmentChange: (v: string) => void;
  onExport: (seg: string) => void;
  onContactClick: (email: string) => void;
  onClose: () => void;
}) {
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-sm text-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
      </div>
    );
  }

  const segmentLabels: Record<string, { label: string; icon: typeof Eye; color: string }> = {
    opened_clicked: { label: "Ouvert + cliqué", icon: MousePointerClick, color: "text-green-600 bg-green-50" },
    opened_only: { label: "Ouvert sans clic", icon: Eye, color: "text-blue-600 bg-blue-50" },
    not_opened: { label: "Non ouvert", icon: Mail, color: "text-slate-600 bg-slate-100" },
    errors: { label: "Erreurs", icon: AlertCircle, color: "text-red-600 bg-red-50" },
    unsubscribed: { label: "Désinscrits", icon: UserX, color: "text-orange-600 bg-orange-50" },
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-700 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" /> {campaign.name}
        </h2>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Metric badges (Feature 2) */}
      <div className="flex flex-wrap gap-2">
        <MetricBadge icon={CheckCircle2} label="Délivrabilité" value={`${(campaign.deliveryRate * 100).toFixed(1)}%`} color="bg-green-50 text-green-700" />
        <MetricBadge icon={Eye} label="Ouverture" value={`${(campaign.openRate * 100).toFixed(1)}%`} color="bg-blue-50 text-blue-700" />
        <MetricBadge icon={MousePointerClick} label="Clic" value={`${(campaign.clickRate * 100).toFixed(1)}%`} color="bg-purple-50 text-purple-700" />
        <MetricBadge icon={BarChart3} label="CTOR" value={`${(campaign.ctor * 100).toFixed(1)}%`} color="bg-indigo-50 text-indigo-700" />
        {campaign.errorCount > 0 && (
          <MetricBadge icon={AlertCircle} label="Erreurs" value={String(campaign.errorCount)} color="bg-red-50 text-red-700" />
        )}
        {campaign.avgOpenDelayHours != null && (
          <MetricBadge icon={Clock} label="Délai moy. ouverture" value={`${campaign.avgOpenDelayHours.toFixed(1)}h`} color="bg-amber-50 text-amber-700" />
        )}
      </div>

      {/* Charts (Features 3 + 6) */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opens/Clicks by day */}
          <div>
            <h3 className="text-xs font-black text-slate-500 mb-3">Ouvertures / Clics par jour</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.opensByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="opens" name="Ouvertures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clicks" name="Clics" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap horaire (Feature 6) */}
          <div>
            <h3 className="text-xs font-black text-slate-500 mb-3">Distribution horaire des ouvertures</h3>
            <HeatmapHour data={stats.opensByHour} />
          </div>
        </div>
      )}

      {/* A/B Variant Stats (Feature 8 display) */}
      {stats?.variantStats && (
        <div>
          <h3 className="text-xs font-black text-slate-500 mb-3">Résultats A/B Test</h3>
          <ABCompare variantStats={stats.variantStats} />
        </div>
      )}

      {/* Export (Feature 5) */}
      <div className="flex items-center gap-3">
        <select
          value={exportSegment}
          onChange={(e) => onExportSegmentChange(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous</option>
          <option value="opened">Ouverts</option>
          <option value="not_opened">Non ouverts</option>
          <option value="clicked">Cliqués</option>
          <option value="errors">Erreurs</option>
        </select>
        <button
          onClick={() => onExport(exportSegment)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Exporter CSV
        </button>
      </div>

      {/* Segments (Feature 4) */}
      {segments && (
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-500">Segments</h3>
          {(Object.entries(segments.segments) as [string, SegmentData][]).map(([key, seg]) => {
            const meta = segmentLabels[key];
            if (!meta) return null;
            const Icon = meta.icon;
            const exportKey = key === "opened_clicked" ? "clicked" : key === "opened_only" ? "opened" : key;
            return (
              <div key={key} className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSegment(expandedSegment === key ? null : key)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{meta.label}</span>
                    <span className="text-xs text-slate-400 tabular-nums">
                      {seg.count} ({(seg.pct * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={(e) => { e.stopPropagation(); onExport(exportKey); }}
                      className="text-2xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      Exporter
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSegment === key ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {expandedSegment === key && seg.contacts.length > 0 && (
                  <div className="border-t border-slate-100 px-4 py-3 max-h-60 overflow-y-auto">
                    <div className="space-y-1">
                      {seg.contacts.map((contact) => (
                        <button
                          key={contact.email}
                          onClick={() => onContactClick(contact.email)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 rounded-lg transition-colors group"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" />
                          <span className="text-xs text-slate-600 group-hover:text-blue-600">
                            {contact.firstName} {contact.lastName} — {contact.email}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Profile (Feature 7) */}
      {loadingContact && (
        <div className="text-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-slate-400 mx-auto" />
        </div>
      )}
      {contactProfile && !loadingContact && (
        <ContactProfileCard profile={contactProfile} />
      )}
    </div>
  );
}

/* ── Metric Badge ── */

function MetricBadge({ icon: Icon, label, value, color }: {
  icon: typeof Eye;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-2xs font-bold">{label}</span>
      <span className="text-xs font-black">{value}</span>
    </div>
  );
}

/* ── Heatmap horaire (Feature 6) ── */

function HeatmapHour({ data }: { data: { hour: number; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  return (
    <div>
      <div className="grid grid-cols-12 gap-1">
        {data.map(({ hour, count }) => {
          const intensity = count / maxCount;
          const bg =
            count === 0 ? "bg-slate-100 text-slate-400"
            : intensity < 0.25 ? "bg-blue-100 text-blue-600"
            : intensity < 0.5 ? "bg-blue-200 text-blue-700"
            : intensity < 0.75 ? "bg-blue-400 text-white"
            : "bg-blue-600 text-white";
          return (
            <div
              key={hour}
              className={`h-8 rounded text-center text-[10px] flex items-center justify-center ${bg}`}
              title={`${hour}h : ${count} ouvertures`}
            >
              {count > 0 ? count : ""}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 mt-1 px-0.5">
        <span>0h</span>
        <span>6h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    </div>
  );
}

/* ── A/B Compare (Feature 8 display) ── */

function ABCompare({
  variantStats,
}: {
  variantStats: {
    A: { total: number; sent: number; opens: number; clicks: number };
    B: { total: number; sent: number; opens: number; clicks: number };
  };
}) {
  const a = variantStats.A;
  const b = variantStats.B;

  const metrics = [
    { label: "Envoyés", aVal: a.sent, bVal: b.sent, isPct: false },
    { label: "Taux ouverture", aVal: a.sent > 0 ? a.opens / a.sent : 0, bVal: b.sent > 0 ? b.opens / b.sent : 0, isPct: true },
    { label: "Taux clic", aVal: a.sent > 0 ? a.clicks / a.sent : 0, bVal: b.sent > 0 ? b.clicks / b.sent : 0, isPct: true },
    { label: "CTOR", aVal: a.opens > 0 ? a.clicks / a.opens : 0, bVal: b.opens > 0 ? b.clicks / b.opens : 0, isPct: true },
  ];

  function fmtVal(v: number, isPct: boolean) {
    return isPct ? `${(v * 100).toFixed(1)}%` : String(v);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-4 py-2 text-left text-2xs font-black uppercase tracking-widest text-slate-400">Métrique</th>
            <th className="px-4 py-2 text-right text-2xs font-black uppercase tracking-widest text-purple-500">Variant A</th>
            <th className="px-4 py-2 text-right text-2xs font-black uppercase tracking-widest text-orange-500">Variant B</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => {
            const aColor = m.aVal > m.bVal ? "text-green-700 font-black" : m.aVal < m.bVal ? "text-red-600" : "";
            const bColor = m.bVal > m.aVal ? "text-green-700 font-black" : m.bVal < m.aVal ? "text-red-600" : "";
            return (
              <tr key={m.label} className="border-t border-slate-100">
                <td className="px-4 py-2 font-bold text-slate-700">{m.label}</td>
                <td className={`px-4 py-2 text-right tabular-nums ${aColor}`}>
                  {fmtVal(m.aVal, m.isPct)}
                </td>
                <td className={`px-4 py-2 text-right tabular-nums ${bColor}`}>
                  {fmtVal(m.bVal, m.isPct)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Contact Profile Card (Feature 7) ── */

function ContactProfileCard({ profile }: { profile: ContactProfile }) {
  return (
    <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-black text-slate-700">{profile.email}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-bold">
          Engagé dans {profile.engaged}/{profile.totalCampaigns} campagne{profile.totalCampaigns !== 1 ? "s" : ""}
        </span>
        {profile.unsubscribedAt && (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-lg font-bold">
            Désinscrit le {new Date(profile.unsubscribedAt).toLocaleDateString("fr-FR")}
          </span>
        )}
      </div>
      <div className="space-y-1">
        {profile.campaigns.map((c) => (
          <div key={c.campaignId} className="flex items-center gap-2 text-xs text-slate-600">
            <span className={`w-2 h-2 rounded-full shrink-0 ${c.opened ? (c.clicked ? "bg-green-500" : "bg-blue-400") : "bg-slate-300"}`} />
            <span className="font-medium truncate max-w-[200px]">{c.campaignName}</span>
            <span className="text-slate-400 whitespace-nowrap">
              {c.opened ? (c.clicked ? "ouvert + cliqué" : "ouvert") : "ignoré"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
