"use client";

import { useState, useEffect } from "react";
import { EMAIL_CATALOG } from "./email-catalog";
import { getEmailTemplate, saveEmailTemplate, resetEmailTemplate, sendTestEmail, getSmtpStatus } from "./actions";
import { Mail, Send, Copy, CheckCircle, AlertCircle, Loader2, ChevronRight, Pencil, Eye, RotateCcw, Save } from "lucide-react";

type CatalogItem = typeof EMAIL_CATALOG[number];
type Mode = "preview" | "edit";

export default function EmailsClient() {
  const [selected, setSelected] = useState<string>(EMAIL_CATALOG[0].id);
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [mode, setMode] = useState<Mode>("preview");
  const [editHtml, setEditHtml] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [smtpOk, setSmtpOk] = useState<boolean | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; to?: string; error?: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const grouped = EMAIL_CATALOG.reduce<Record<string, CatalogItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const selectedItem = EMAIL_CATALOG.find(e => e.id === selected);

  useEffect(() => {
    getSmtpStatus().then(r => setSmtpOk(r.configured)).catch(() => setSmtpOk(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    setMode("preview");
    setTestResult(null);
    setSaveResult(null);
    getEmailTemplate(selected)
      .then(r => {
        setHtmlPreview(r.html);
        setSubject(r.subject);
        setIsCustom(r.isCustom);
        setEditHtml(r.html);
        setEditSubject(r.subject);
      })
      .catch(() => { setHtmlPreview(null); setSubject(""); })
      .finally(() => setLoading(false));
  }, [selected]);

  const handleTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const r = await sendTestEmail(selected);
      setTestResult({ ok: true, to: r.to });
    } catch (err) {
      setTestResult({ ok: false, error: err instanceof Error ? err.message : "Erreur inconnue" });
    } finally {
      setTestLoading(false);
    }
    setTimeout(() => setTestResult(null), 5000);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setSaveResult(null);
    try {
      await saveEmailTemplate(selected, editSubject, editHtml);
      setHtmlPreview(editHtml);
      setSubject(editSubject);
      setIsCustom(true);
      setMode("preview");
      setSaveResult({ ok: true, msg: "Template sauvegardé" });
    } catch (err) {
      setSaveResult({ ok: false, msg: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSaveLoading(false);
    }
    setTimeout(() => setSaveResult(null), 4000);
  };

  const handleReset = async () => {
    if (!confirm("Réinitialiser ce template au contenu par défaut ?")) return;
    setResetLoading(true);
    try {
      await resetEmailTemplate(selected);
      const r = await getEmailTemplate(selected);
      setHtmlPreview(r.html);
      setSubject(r.subject);
      setEditHtml(r.html);
      setEditSubject(r.subject);
      setIsCustom(false);
      setMode("preview");
      setSaveResult({ ok: true, msg: "Template réinitialisé" });
    } catch (err) {
      setSaveResult({ ok: false, msg: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setResetLoading(false);
    }
    setTimeout(() => setSaveResult(null), 4000);
  };

  const handleCopy = () => {
    const content = mode === "edit" ? editHtml : (htmlPreview ?? "");
    if (content) navigator.clipboard.writeText(content);
  };

  return (
    <>
      
      <div className="flex h-[calc(100vh-180px)] bg-white rounded-card border border-slate-100 shadow-sm overflow-hidden">

        {/* Sidebar */}
        <aside className="w-72 border-r border-slate-100 overflow-y-auto shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" /> Emails plateforme
            </h2>
            {smtpOk !== null && (
              <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold ${smtpOk ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {smtpOk ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                {smtpOk ? "Resend connecté" : "Resend non configuré"}
              </div>
            )}
          </div>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="px-4 py-2 text-2xs font-black uppercase tracking-widest text-slate-400">{category}</p>
              {items.map(item => (
                <button key={item.id} onClick={() => setSelected(item.id)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${selected === item.id ? "bg-blue-50 border-r-2 border-blue-600" : ""}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-bold ${selected === item.id ? "text-blue-700" : "text-slate-700"}`}>{item.label}</p>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{item.trigger}</p>
                  </div>
                  <ChevronRight className={`w-3 h-3 shrink-0 ${selected === item.id ? "text-blue-500" : "text-slate-300"}`} />
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Main zone */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-black text-slate-900">{selectedItem?.label}</h3>
                {isCustom && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-black bg-amber-100 text-amber-700">Modifié</span>
                )}
              </div>
              {mode === "edit" ? (
                <input
                  type="text"
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  className="text-xs text-slate-600 font-medium border border-slate-200 rounded-lg px-2 py-1 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Objet de l'email"
                />
              ) : (
                <p className="text-xs text-slate-400 font-medium">{subject}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Mode toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                <button onClick={() => setMode("preview")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "preview" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                  <Eye className="w-3.5 h-3.5" /> Aperçu
                </button>
                <button onClick={() => setMode("edit")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === "edit" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                  <Pencil className="w-3.5 h-3.5" /> Éditer
                </button>
              </div>

              {mode === "edit" ? (
                <>
                  <button onClick={handleSave} disabled={saveLoading}
                    className="px-4 py-2 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 flex items-center gap-2 disabled:opacity-60">
                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder
                  </button>
                  {isCustom && (
                    <button onClick={handleReset} disabled={resetLoading}
                      className="px-3 py-2 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 flex items-center gap-2 disabled:opacity-60" title="Réinitialiser au défaut">
                      {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button onClick={handleCopy} className="px-3 py-2 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={handleTest} disabled={testLoading}
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60">
                    {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {testLoading ? "Envoi..." : "Tester"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feedback */}
          {(testResult || saveResult) && (
            <div className={`mx-6 mt-3 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
              (testResult?.ok ?? saveResult?.ok) ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}>
              {(testResult?.ok ?? saveResult?.ok) ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {testResult ? (testResult.ok ? `Email envoyé à ${testResult.to}` : `Erreur : ${testResult.error}`) : saveResult?.msg}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-hidden p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : mode === "edit" ? (
              <textarea
                value={editHtml}
                onChange={e => setEditHtml(e.target.value)}
                className="w-full h-full font-mono text-xs text-slate-700 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-50"
                spellCheck={false}
              />
            ) : (
              <iframe
                srcDoc={htmlPreview ?? ""}
                className="w-full h-full rounded-xl border border-slate-100"
                sandbox="allow-same-origin"
                title="Aperçu email"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
