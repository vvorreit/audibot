"use client";

import { useEffect, useState, useRef } from "react";
import {
  Mail, Send, RefreshCw, Loader2, AlertCircle, CheckCircle,
  Search, CornerDownLeft, Inbox, Star, Clock,
} from "lucide-react";

interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  isRead: boolean;
  messageId: string;
}

function fmt(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function fmtFull(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function initials(from: string) {
  const name = from.split("<")[0].trim() || from;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
];

function avatarColor(from: string) {
  let hash = 0;
  for (const c of from) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function senderName(from: string) {
  const name = from.split("<")[0].trim();
  return name || from.replace(/<|>/g, "");
}

function senderEmail(from: string) {
  const m = from.match(/<(.+?)>/);
  return m ? m[1] : from;
}

export default function AdminInboxPage() {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EmailMessage | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replying, setReplying] = useState(false);
  const [replyResult, setReplyResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function load() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/inbox");
      const data = await res.json();
      if (data.notConfigured) {
        setNotConfigured(true);
      } else if (data.error) {
        setErrorMsg(data.error);
      } else {
        setEmails(data.emails ?? []);
      }
    } catch {
      setErrorMsg("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (replyOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyOpen]);

  const handleReply = async () => {
    if (!selected || !replyBody.trim()) return;
    setReplying(true);
    setReplyResult(null);
    try {
      const to = senderEmail(selected.from);
      const res = await fetch("/api/admin/inbox/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject: `Re: ${selected.subject}`,
          body: replyBody,
          inReplyTo: selected.messageId,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setReplyResult({ ok: true, msg: `Réponse envoyée à ${to}` });
        setReplyBody("");
        setReplyOpen(false);
      } else {
        setReplyResult({ ok: false, msg: data.error ?? "Erreur" });
      }
    } catch {
      setReplyResult({ ok: false, msg: "Erreur réseau" });
    } finally {
      setReplying(false);
    }
    setTimeout(() => setReplyResult(null), 5000);
  };

  const unread = emails.filter(e => !e.isRead).length;
  const filtered = emails.filter(e =>
    !search ||
    senderName(e.from).toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase())
  );

  // ── NOT CONFIGURED ────────────────────────────────────────────────────────
  if (notConfigured) {
    return (
      <div className="max-w-lg mx-auto mt-16">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">IMAP non configuré</h2>
          <p className="text-sm text-slate-500 mb-6">Ajoutez ces variables dans votre <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">.env</code></p>
          <pre className="bg-slate-950 text-emerald-400 rounded-2xl p-5 text-xs text-left leading-relaxed font-mono">
{`IMAP_HOST=imap.ionos.fr
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=contact@optibot.fr
IMAP_PASS=votre_mot_de_passe`}
          </pre>
        </div>
      </div>
    );
  }

  // ── MAIN LAYOUT ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] gap-0">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Inbox className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">Boîte de réception</h1>
            {!loading && (
              <p className="text-xs text-slate-400 font-medium">
                {unread > 0 ? <span className="text-blue-600 font-bold">{unread} non lu{unread > 1 ? "s" : ""}</span> : "Tout lu"} · {emails.length} message{emails.length > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Error banner */}
      {errorMsg && (
        <div className="mb-4 shrink-0 bg-red-50 border border-red-100 rounded-2xl px-5 py-3 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm font-bold text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Body */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <aside className="w-72 xl:w-80 shrink-0 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Email list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3.5 border-b border-slate-50 animate-pulse">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 bg-slate-100 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                <Mail className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-semibold">{search ? "Aucun résultat" : "Boîte vide"}</p>
              </div>
            ) : filtered.map(email => {
              const isActive = selected?.id === email.id;
              return (
                <button
                  key={email.id}
                  onClick={() => { setSelected(email); setReplyBody(""); setReplyResult(null); setReplyOpen(false); }}
                  className={`w-full px-4 py-3.5 text-left border-b border-slate-50 transition-all group ${
                    isActive
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0 ${avatarColor(email.from)}`}>
                      {initials(email.from)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs truncate ${!email.isRead ? "font-black text-slate-900" : "font-semibold text-slate-500"}`}>
                          {senderName(email.from)}
                        </p>
                        <span className="text-2xs text-slate-400 shrink-0 font-medium">{fmt(email.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!email.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                        <p className={`text-xs truncate ${!email.isRead ? "font-semibold text-slate-700" : "text-slate-400"}`}>
                          {email.subject}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ── Email detail ── */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
          {!selected ? (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-300 select-none">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-5">
                <Mail className="w-9 h-9" />
              </div>
              <p className="text-base font-bold text-slate-400">Sélectionnez un email</p>
              <p className="text-sm text-slate-300 mt-1">{emails.length} message{emails.length > 1 ? "s" : ""} dans la boîte</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">

              {/* Email header */}
              <div className="px-7 pt-6 pb-5 border-b border-slate-100 shrink-0">
                <h2 className="text-xl font-black text-slate-900 mb-4 leading-snug">{selected.subject}</h2>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0 ${avatarColor(selected.from)}`}>
                    {initials(selected.from)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{senderName(selected.from)}</p>
                    <p className="text-xs text-slate-400 font-medium truncate">{senderEmail(selected.from)}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {fmtFull(selected.date)}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-7 py-6">
                {selected.body.includes("<") && selected.body.includes(">") ? (
                  <iframe
                    sandbox=""
                    srcDoc={selected.body}
                    className="w-full border-0 min-h-[400px]"
                    style={{ height: "100%" }}
                    onLoad={(e) => {
                      const iframe = e.target as HTMLIFrameElement;
                      if (iframe.contentDocument?.body) {
                        iframe.style.height = iframe.contentDocument.body.scrollHeight + 40 + "px";
                      }
                    }}
                  />
                ) : (
                  <pre className="text-sm text-slate-700 font-sans whitespace-pre-wrap leading-7 bg-transparent p-0 m-0 border-0">
                    {selected.body}
                  </pre>
                )}
              </div>

              {/* Reply area */}
              <div className="border-t border-slate-100 shrink-0">
                {replyResult && (
                  <div className={`mx-6 mt-4 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 ${replyResult.ok ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                    {replyResult.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {replyResult.msg}
                  </div>
                )}

                {!replyOpen ? (
                  <div className="px-7 py-4">
                    <button
                      onClick={() => setReplyOpen(true)}
                      className="flex items-center gap-2.5 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-400 font-medium hover:bg-white hover:border-blue-300 hover:text-slate-600 transition-all text-left"
                    >
                      <CornerDownLeft className="w-4 h-4 text-slate-300" />
                      Répondre à {senderName(selected.from)}…
                    </button>
                  </div>
                ) : (
                  <div className="px-7 py-4 bg-slate-50/60">
                    <div className="flex items-center gap-2 mb-3">
                      <CornerDownLeft className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Répondre à {senderName(selected.from)}
                      </span>
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={replyBody}
                      onChange={e => setReplyBody(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Escape") { setReplyOpen(false); setReplyBody(""); }
                        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleReply();
                      }}
                      placeholder="Votre message…"
                      rows={5}
                      className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white shadow-sm"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-2xs text-slate-400 font-medium">⌘↵ pour envoyer · Échap pour annuler</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setReplyOpen(false); setReplyBody(""); }}
                          className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleReply}
                          disabled={replying || !replyBody.trim()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                          {replying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          {replying ? "Envoi…" : "Envoyer"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
