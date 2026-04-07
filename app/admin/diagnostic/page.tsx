export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CopyButton, CopyHtmlButton } from "./copy-button";
import { DeleteLogButton, DeleteAllLogsButton } from "./delete-buttons";

/** Parse summary string like "SmartFill: 4 filled, 17 noData, 0 failed, 2 skipped / 31 fields" */
function parseSummary(summary: string | null): { filled: number; noData: number; failed: number; skipped: number; unmatched: number; total: number } {
  if (!summary) return { filled: 0, noData: 0, failed: 0, skipped: 0, unmatched: 0, total: 0 };
  const filled = parseInt(summary.match(/(\d+)\s*filled/)?.[1] || "0");
  const noData = parseInt(summary.match(/(\d+)\s*noData/)?.[1] || "0");
  // Legacy: old logs used "failed" for both noData + real failures
  const failed = parseInt(summary.match(/(\d+)\s*failed/)?.[1] || "0");
  const skipped = parseInt(summary.match(/(\d+)\s*skipped/)?.[1] || "0");
  const unmatched = parseInt(summary.match(/(\d+)\s*unmatched/)?.[1] || "0");
  const total = parseInt(summary.match(/\/\s*(\d+)\s*fields/)?.[1] || "0");
  return { filled, noData, failed, skipped, unmatched, total };
}

type SortMode = "date" | "failed" | "noData";

export default async function AdminDiagnosticPage({
  searchParams,
}: {
  searchParams: Promise<{ hostname?: string; userId?: string; trigger?: string; sort?: string; filter?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || session.user.role !== "ADMIN") redirect("/");

  const params = await searchParams;
  const hostnameFilter = params.hostname || "";
  const userIdFilter = params.userId || "";
  const triggerFilter = params.trigger || "";
  const sortMode = (params.sort || "failed") as SortMode;
  const issueFilter = params.filter || ""; // "failed" | "noData" | ""

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (hostnameFilter) where.hostname = { contains: hostnameFilter };
  if (userIdFilter) where.userId = userIdFilter;
  if (triggerFilter) where.trigger = triggerFilter;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let logs: any[] = [];
  let totalLogs = 0;
  let stats: { hostname: string; _count: number }[] = [];
  let triggerCounts: { trigger: string; _count: number }[] = [];

  try {
    logs = await prisma.diagnosticLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true, storeName: true } },
      },
    });

    totalLogs = await prisma.diagnosticLog.count();

    // groupBy en DB au lieu de fetch 10k rows en mémoire
    const [hostnameGroups, triggerGroups] = await Promise.all([
      prisma.diagnosticLog.groupBy({
        by: ["hostname"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),
      prisma.diagnosticLog.groupBy({
        by: ["trigger"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      }),
    ]);

    const triggerMap: Record<string, number> = {};
    for (const g of triggerGroups) {
      triggerMap[g.trigger] = g._count.id;
    }
    stats = hostnameGroups.map((g) => ({ hostname: g.hostname, _count: g._count.id }));
    triggerCounts = Object.entries(triggerMap)
      .map(([trigger, count]) => ({ trigger, _count: count }));
  } catch (e) {
    console.error("[admin/diagnostic] DB error:", e);
  }

  // Parse summaries and attach counts
  const logsWithCounts = logs.map((log) => ({
    ...log,
    _counts: parseSummary(log.summary),
  }));

  // Filter by issue type
  const filtered = issueFilter
    ? logsWithCounts.filter((log) => {
        if (issueFilter === "failed") return log._counts.failed > 0;
        if (issueFilter === "noData") return log._counts.noData > 0;
        return true;
      })
    : logsWithCounts;

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "failed") return (b._counts.failed + b._counts.noData) - (a._counts.failed + a._counts.noData);
    if (sortMode === "noData") return b._counts.noData - a._counts.noData;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Build query string helper
  function qs(overrides: Record<string, string>) {
    const p: Record<string, string> = {};
    if (hostnameFilter) p.hostname = hostnameFilter;
    if (triggerFilter) p.trigger = triggerFilter;
    if (sortMode !== "failed") p.sort = sortMode;
    if (issueFilter) p.filter = issueFilter;
    Object.assign(p, overrides);
    // Remove empty values
    for (const k of Object.keys(p)) { if (!p[k]) delete p[k]; }
    const s = new URLSearchParams(p).toString();
    return s ? `?${s}` : "";
  }

  return (
    <div className="space-y-8">

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {triggerCounts.map((t) => (
          <div
            key={t.trigger}
            className={`rounded-xl p-4 border ${
              t.trigger === "error"
                ? "bg-red-50 border-red-200"
                : t.trigger === "manual"
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div className="text-2xl font-bold">
              {t._count}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">
              {t.trigger === "auto" && "Auto (post-fill)"}
              {t.trigger === "manual" && "Manuel (support)"}
              {t.trigger === "error" && "Erreur JS"}
              {!["auto", "manual", "error"].includes(t.trigger) && t.trigger}
            </div>
          </div>
        ))}
        <div className="rounded-xl p-4 border bg-purple-50 border-purple-200">
          <div className="text-2xl font-bold">{stats.length}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            Portails distincts
          </div>
        </div>
      </div>

      {/* Top portails */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-3">
          Top portails
        </h2>
        <div className="flex flex-wrap gap-2">
          {stats.map((s) => (
            <Link
              key={s.hostname}
              href={`/admin/diagnostic${qs({ hostname: s.hostname === hostnameFilter ? "" : s.hostname })}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                hostnameFilter === s.hostname
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s.hostname}{" "}
              <span className="opacity-60">({s._count})</span>
            </Link>
          ))}
          {hostnameFilter && (
            <Link
              href={`/admin/diagnostic${qs({ hostname: "" })}`}
              className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
            >
              Effacer filtre
            </Link>
          )}
        </div>
      </div>

      {/* Filtres trigger + issue + tri */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Trigger filter */}
        <div className="flex gap-1.5">
          <span className="text-xs font-semibold text-gray-400 self-center mr-1">Trigger</span>
          {["", "auto", "manual", "error"].map((t) => (
            <Link
              key={t}
              href={`/admin/diagnostic${qs({ trigger: t })}`}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                triggerFilter === t
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {t === "" && "Tous"}
              {t === "auto" && "Auto"}
              {t === "manual" && "Manuel"}
              {t === "error" && "Erreur"}
            </Link>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Issue filter */}
        <div className="flex gap-1.5">
          <span className="text-xs font-semibold text-gray-400 self-center mr-1">Issue</span>
          {[
            { key: "", label: "Tous" },
            { key: "failed", label: "Failed > 0" },
            { key: "noData", label: "NoData > 0" },
          ].map((f) => (
            <Link
              key={f.key}
              href={`/admin/diagnostic${qs({ filter: f.key })}`}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                issueFilter === f.key
                  ? f.key === "failed" ? "bg-red-600 text-white border-red-600"
                  : f.key === "noData" ? "bg-amber-600 text-white border-amber-600"
                  : "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-200" />

        {/* Sort */}
        <div className="flex gap-1.5">
          <span className="text-xs font-semibold text-gray-400 self-center mr-1">Tri</span>
          {[
            { key: "failed", label: "Failed+NoData" },
            { key: "noData", label: "NoData" },
            { key: "date", label: "Date" },
          ].map((s) => (
            <Link
              key={s.key}
              href={`/admin/diagnostic${qs({ sort: s.key })}`}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                sortMode === s.key
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {s.label} ↓
            </Link>
          ))}
        </div>

        <DeleteAllLogsButton
          hostname={hostnameFilter || undefined}
          trigger={triggerFilter || undefined}
          count={sorted.length}
        />
        <span className="text-xs text-gray-400 ml-auto">{sorted.length} / {totalLogs} logs</span>
      </div>

      {/* Liste des logs */}
      <div className="space-y-3">
        {sorted.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            Aucun log de diagnostic.
          </div>
        )}
        {sorted.map((log) => (
          <details
            key={log.id}
            className="bg-white rounded-xl border hover:shadow-sm transition group"
          >
            <summary className="px-4 py-3 cursor-pointer flex items-center gap-3">
              <span
                className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                  log.trigger === "error"
                    ? "bg-red-500"
                    : log.trigger === "manual"
                    ? "bg-blue-500"
                    : "bg-green-500"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-mono font-semibold text-gray-900">
                    {log.hostname}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-500 truncate">
                    {log.user?.storeName || log.user?.name || log.user?.email || log.userId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                  <span>
                    {new Date(log.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      log.trigger === "error"
                        ? "bg-red-100 text-red-700"
                        : log.trigger === "manual"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {log.trigger}
                  </span>
                  {/* Counters badges */}
                  {log._counts.filled > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
                      {log._counts.filled} filled
                    </span>
                  )}
                  {log._counts.noData > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                      {log._counts.noData} noData
                    </span>
                  )}
                  {log._counts.failed > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                      {log._counts.failed} failed
                    </span>
                  )}
                  {log._counts.skipped > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600">
                      {log._counts.skipped} skipped
                    </span>
                  )}
                  {log._counts.unmatched > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
                      {log._counts.unmatched} unmatched
                    </span>
                  )}
                </div>
              </div>
              <DeleteLogButton logId={log.id} />
              <span className="text-gray-300 group-open:rotate-90 transition-transform">
                &#9656;
              </span>
            </summary>
            <div className="px-4 pb-4 space-y-3">
              {/* Logs */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-gray-500">
                    Trace logs
                  </span>
                  <CopyButton text={log.logs} label="Copier les logs" />
                </div>
                <pre className="bg-gray-900 text-green-400 text-[11px] leading-relaxed p-4 rounded-lg overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre font-mono">
                  {log.logs}
                </pre>
              </div>
              {/* HTML Snapshot */}
              {log.htmlSnapshot && (
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-semibold text-gray-500">
                      HTML de la page ({Math.round(log.htmlSnapshot.length / 1024)} KB)
                    </span>
                    <CopyHtmlButton html={log.htmlSnapshot} />
                  </div>
                  <pre className="bg-blue-950 text-blue-300 text-[10px] leading-relaxed p-4 rounded-lg overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre font-mono">
                    {log.htmlSnapshot.slice(0, 5000)}
                    {log.htmlSnapshot.length > 5000 && "\n\n... (" + Math.round(log.htmlSnapshot.length / 1024) + " KB total — cliquer Copier pour tout récupérer)"}
                  </pre>
                </div>
              )}
              {!log.htmlSnapshot && (
                <div className="text-xs text-gray-400 italic">
                  Pas de snapshot HTML pour ce log
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
