"use client";
/**
 * Bilan detail page: form editing, OCR import, result display, PDF export.
 * Exports: BilanDetailPage (default)
 * ~510 lines
 */

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertTriangle, Glasses, Eye, ArrowLeft,
  Activity, Upload, CheckCircle2, Save,
  Heart, Palette, Wallet, FileText, Info,
  FileDown,
} from "lucide-react";
import type { BilanResult, BilanFormData } from "@/types/bilan";
import type { MutuelleData, OrdonnanceData } from "@/lib/parsers";

import type { OcrDataPayload, FrameMatch } from "./_components/types";
import {
  CORRECTION_OPTIONS, GENE_OPTIONS, SENSIBILITY_OPTIONS,
  FREQ_OPTIONS, ACTIVITY_OPTIONS, SOLEIL_OPTIONS, STYLE_OPTIONS,
  FACE_OPTIONS, COLOR_OPTIONS, BUDGET_OPTIONS, VISITE_OPTIONS,
  PRIORITY_BADGE, OPPO_TYPE, DEFAULT_FORM,
} from "./_components/constants";
import {
  TextInput, Toggle, Chips, Segment, Slider, AddressField, Accordion,
} from "./_components/FormPrimitives";
import { OcrSection } from "./_components/OcrSection";

/* ══════════════════════════════════════════════════════════════════ */

export default function BilanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sess, status } = useSession();
  const syncToken = (sess?.user as { syncToken?: string })?.syncToken ?? "";

  const [result, setResult]             = useState<BilanResult | null>(null);
  const [originalData, setOriginalData] = useState<BilanFormData | null>(null);
  const [editData, setEditData]         = useState<BilanFormData>(DEFAULT_FORM);
  const [frames, setFrames]             = useState<FrameMatch[]>([]);
  const [ocrData, setOcrData]           = useState<OcrDataPayload | null>(null);
  const [editingOcr, setEditingOcr]     = useState<OcrDataPayload | null>(null);
  const [ocrEditing, setOcrEditing]     = useState(false);
  const [loading, setLoading]           = useState(true);
  const [loadingFrames, setLoadingFrames] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [patientLoaded, setPatientLoaded] = useState(false);
  const [saving, setSaving]             = useState(false);
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null);
  const [localPdf, setLocalPdf]         = useState<Uint8Array | null>(null);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const [pdfAvailable, setPdfAvailable] = useState<'local' | 'remote' | 'none'>('none');

  const isFormModified = originalData && JSON.stringify(editData) !== JSON.stringify({ ...DEFAULT_FORM, ...originalData });
  const isOcrModified = ocrEditing && editingOcr && ocrData && JSON.stringify(editingOcr) !== JSON.stringify(ocrData);
  const isModified = isFormModified || isOcrModified;

  const set = useCallback(<K extends keyof BilanFormData>(key: K, val: BilanFormData[K]) => {
    setEditData(prev => ({ ...prev, [key]: val }));
  }, []);

  useEffect(() => {
    if (!id || status === "loading") return;
    if (!syncToken) { setError("Token manquant."); setLoading(false); return; }
    fetch(`/api/bilan/session/${id}/poll`, { headers: { Authorization: `Bearer ${syncToken}` } })
      .then(async r => { if (!r.ok) { const b = await r.json().catch(() => null); throw new Error(b?.error ?? `Erreur ${r.status}`); } return r.json(); })
      .then((data: { waiting: boolean; result?: BilanResult; formData?: BilanFormData; ocrData?: OcrDataPayload }) => {
        if (!data.waiting && data.result) {
          setResult(data.result);
          if (data.formData) { setOriginalData(data.formData); setEditData({ ...DEFAULT_FORM, ...data.formData }); }
          if (data.ocrData) { setOcrData(data.ocrData); setEditingOcr(JSON.parse(JSON.stringify(data.ocrData))); }
        } else setError("Résultat non disponible.");
      })
      .catch(err => setError(err.message || "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [id, syncToken, status]);

  useEffect(() => {
    if (!result || !syncToken) return;
    setLoadingFrames(true);
    const params = new URLSearchParams({ filters: JSON.stringify(result.frameFilters) });
    fetch(`/api/bilan/frames/match?${params}`, { headers: { Authorization: `Bearer ${syncToken}` } })
      .then(r => r.json())
      .then((data: { frames?: FrameMatch[] }) => setFrames(data.frames ?? []))
      .catch(() => setFrames([]))
      .finally(() => setLoadingFrames(false));
  }, [result, syncToken]);

  // Document PDF: check IndexedDB then remote
  useEffect(() => {
    if (!id || !syncToken || status === "loading") return;
    let cancelled = false;
    (async () => {
      try {
        setPdfLoading(true);
        const { getDocument, storeDocument } = await import('@/lib/documentStore');
        const local = await getDocument(id);
        if (local) {
          if (!cancelled) { setLocalPdf(local); setPdfAvailable('local'); setPdfLoading(false); }
          return;
        }
        // Try remote
        const res = await fetch(`/api/bilan/document/${id}`, { headers: { Authorization: `Bearer ${syncToken}` } });
        if (!res.ok) { if (!cancelled) setPdfLoading(false); return; }
        const data = await res.json();
        if (data.notAvailable) { if (!cancelled) setPdfLoading(false); return; }
        // Decrypt with shop token
        const shopRes = await fetch('/api/user/shop-token');
        if (!shopRes.ok) { if (!cancelled) setPdfLoading(false); return; }
        const { shopToken } = await shopRes.json();
        if (!shopToken) { if (!cancelled) setPdfLoading(false); return; }
        const { decryptWithKey } = await import('@/lib/clientCrypto');
        const decrypted = await decryptWithKey(data.blob, shopToken) as { mutuelle?: MutuelleData | null; ordonnance?: OrdonnanceData | null };
        const { generateDocumentPdf } = await import('@/lib/generateDocumentPdf');
        const pdfBytes = await generateDocumentPdf({
          bilanId: id,
          mutuelle: decrypted.mutuelle,
          ordonnance: decrypted.ordonnance,
          bilanResult: result,
          generatedAt: new Date(),
        });
        await storeDocument(id, pdfBytes);
        if (!cancelled) { setLocalPdf(pdfBytes); setPdfAvailable('remote'); }
      } catch { /* silent */ }
      finally { if (!cancelled) setPdfLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [id, syncToken, status, result]);

  const downloadPdf = () => {
    if (!localPdf) return;
    const blob = new Blob([localPdf as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bilan-${id}-audibot.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { formData: editData };
      if (editingOcr) body.ocrData = editingOcr;
      const res = await fetch(`/api/bilan/session/${id}/update`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${syncToken}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const b = await res.json().catch(() => null); throw new Error(b?.error ?? "Erreur"); }
      setOriginalData({ ...editData });
      if (editingOcr) setOcrData(JSON.parse(JSON.stringify(editingOcr)));
      setOcrEditing(false);
      setToast({ msg: "Sauvegardé", ok: true });
    } catch (err: unknown) {
      setToast({ msg: err instanceof Error ? err.message : "Erreur", ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const loadInExtension = () => {
    window.postMessage({
      type: "AUDIBOT_DATA",
      payload: {
        m: {
          civilite: editData.civilite || "", nom: editData.nom || "", prenom: editData.prenom || "",
          nomNaissance: editData.nomNaissance || "", telephone: editData.telephone || "",
          email: editData.email || "", adresse: editData.adresse || "",
          codePostal: editData.codePostal || "", ville: editData.ville || "",
        },
        bilan: {
          correctionType: editData.correctionType, isProgressive: editData.isProgressive,
          portLentilles: editData.portLentilles, genesActuelles: editData.genesActuelles,
          lunettesBienSupportees: editData.lunettesBienSupportees, frequencePort: editData.frequencePort,
          screenTimeHours: editData.screenTimeHours, mainActivity: editData.mainActivity,
          sport: editData.sport, conduitNuit: editData.conduitNuit, expositionSoleil: editData.expositionSoleil,
          sensitivities: editData.sensitivities, antecedentsFamiliaux: editData.antecedentsFamiliaux,
          derniereVisite: editData.derniereVisite, stylePreference: editData.stylePreference,
          faceShape: editData.faceShape, colorPreference: editData.colorPreference,
          budgetRange: editData.budgetRange, projetSecondairesPaires: editData.projetSecondairesPaires,
          mutuelleConnue: editData.mutuelleConnue,
        },
      },
    }, window.location.origin);
    setPatientLoaded(true);
    setTimeout(() => setPatientLoaded(false), 2500);
  };

  const patientName = [editData.civilite === "M" ? "M." : editData.civilite === "Mme" ? "Mme" : "", editData.prenom, editData.nom].filter(Boolean).join(" ");

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );
  if (error || !result) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3">
      <p className="text-slate-600 text-sm">{error ?? "Résultat introuvable"}</p>
      <Link href="/dashboard/bilans" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Retour aux bilans</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg text-white transition-all ${toast.ok ? "bg-slate-900" : "bg-red-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/dashboard/bilans" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Bilans
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold text-slate-900 truncate">{patientName || "Bilan sans nom"}</span>
            <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide bg-slate-100 text-slate-500">
              {result.complexiteLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a href={`/bilan/rapport/${id}?token=${syncToken}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FileText className="w-3.5 h-3.5" /> PDF
            </a>
            {pdfAvailable !== 'none' && (
              <button onClick={downloadPdf} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-colors">
                <FileDown className="w-3.5 h-3.5" />
                Document
              </button>
            )}
            {pdfAvailable === 'none' && !pdfLoading && (
              <span className="text-[10px] text-slate-400">Aucun document</span>
            )}
            {isModified && (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50">
                <Save className="w-3.5 h-3.5" />{saving ? "..." : "Sauver"}
              </button>
            )}
            <button onClick={loadInExtension}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                patientLoaded ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
              }`}>
              {patientLoaded ? <><CheckCircle2 className="w-3.5 h-3.5" /> Chargé</> : <><Upload className="w-3.5 h-3.5" /> Charger</>}
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 py-6 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:items-start">

        {/* ── LEFT — Analyse ─────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Profil + alertes */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-50">
              <p className="text-lg font-bold text-slate-900 leading-snug">{result.profileText}</p>
            </div>

            {result.alertes.length > 0 && (
              <div className="divide-y divide-slate-100">
                {result.alertes.map((alt, i) => (
                  <div key={i} className={`flex items-start gap-3 px-6 py-3.5 text-sm ${
                    alt.niveau === "urgent"
                      ? "bg-red-50 text-red-700"
                      : alt.niveau === "attention"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-slate-50 text-slate-600"
                  }`}>
                    {alt.niveau === "info"
                      ? <Info className="w-4 h-4 shrink-0 mt-0.5 opacity-50" />
                      : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 opacity-60" />}
                    <span className="font-medium leading-snug">{alt.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Script */}
          {result.scriptConseil.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">À dire au patient</p>
              <ul className="divide-y divide-slate-50">
                {result.scriptConseil.map((s, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed py-2.5 first:pt-0 last:pb-0">
                    <span className="text-slate-300 shrink-0 mt-0.5 font-bold">›</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommandations + opportunités */}
          {(result.lensRecommendations.length > 0 || result.opportunites.length > 0) && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 space-y-5">
              {result.lensRecommendations.length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> Verres
                  </p>
                  <div className="divide-y divide-slate-50">
                    {result.lensRecommendations.map((rec, i) => {
                      const badge = PRIORITY_BADGE[rec.priority];
                      return (
                        <div key={i} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{rec.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{rec.reason}</p>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full ${badge.classes}`}>{badge.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {result.opportunites.length > 0 && (
                <>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-50">
                    <span>À proposer</span>
                  </p>
                  <div className="divide-y divide-slate-50">
                    {result.opportunites.map((opp, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{opp.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{opp.reason}</p>
                        </div>
                        <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500">
                          {OPPO_TYPE[opp.type] ?? opp.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Montures */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
              <Glasses className="w-3.5 h-3.5" /> Montures suggérées
            </p>
            {loadingFrames ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
              </div>
            ) : frames.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Aucune monture en stock</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {frames.map(frame => (
                  <div key={frame.id} className="rounded-xl border border-slate-100 p-3 hover:border-slate-200 transition-colors">
                    {frame.imageUrl
                      ? <img src={frame.imageUrl} alt={`${frame.brand} ${frame.model}`} className="w-full h-20 object-contain rounded-lg bg-slate-50 mb-2.5" />
                      : <div className="w-full h-20 bg-slate-50 rounded-lg mb-2.5 flex items-center justify-center"><Glasses className="w-7 h-7 text-slate-300" /></div>
                    }
                    <p className="text-sm font-bold text-slate-800 truncate">{frame.brand}</p>
                    <p className="text-xs text-slate-500 truncate mb-1.5">{frame.model}</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{frame.shape}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{frame.material}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{frame.priceRange}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Documents scannés (OCR) ─────────────────────────────── */}
          {ocrData && (
            <OcrSection
              ocrData={ocrData}
              editingOcr={editingOcr}
              setEditingOcr={setEditingOcr}
              ocrEditing={ocrEditing}
              setOcrEditing={setOcrEditing}
              saving={saving}
              handleSave={handleSave}
            />
          )}
        </div>

        {/* ── RIGHT — Données patient ─────────────────────────────────── */}
        <div className="mt-6 lg:mt-0 lg:sticky lg:top-[56px] lg:max-h-[calc(100vh-3.5rem)] lg:overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

            {/* Identité — ouvert par défaut */}
            <div className="px-5 pt-5 pb-2">
              <div className="flex gap-1.5 mb-4">
                {(["M", "Mme"] as const).map(c => (
                  <button key={c} type="button" onClick={() => set("civilite", c)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      editData.civilite === c ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                    }`}>{c === "M" ? "M." : "Mme"}
                  </button>
                ))}
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <TextInput label="Nom" value={editData.nom || ""} onChange={v => set("nom", v)} />
                  <TextInput label="Prénom" value={editData.prenom || ""} onChange={v => set("prenom", v)} />
                </div>
                <TextInput label="Nom de naissance" value={editData.nomNaissance || ""} onChange={v => set("nomNaissance", v)} />
                <TextInput label="Date de naissance" value={editData.dateNaissance || ""} onChange={v => set("dateNaissance", v)} type="date" />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput label="Tél." value={editData.telephone || ""} onChange={v => set("telephone", v)} type="tel" />
                  <TextInput label="Email" value={editData.email || ""} onChange={v => set("email", v)} type="email" />
                </div>
                <AddressField
                  value={editData.adresse || ""}
                  onChange={v => set("adresse", v)}
                  onSelect={a => { set("adresse", a.name); set("codePostal", a.postcode); set("ville", a.city); }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput label="Code postal" value={editData.codePostal || ""} onChange={v => set("codePostal", v)} />
                  <TextInput label="Ville" value={editData.ville || ""} onChange={v => set("ville", v)} />
                </div>
              </div>
            </div>

            {/* Sections accordéon */}
            <div className="px-5 pt-2 divide-y divide-slate-100">

              <Accordion title="Vision" icon={<Eye className="w-4 h-4 text-slate-400" />}>
                <Chips label="Correction" options={CORRECTION_OPTIONS} values={editData.correctionType}
                  onChange={v => set("correctionType", v as BilanFormData["correctionType"])} />
                <Toggle label="Progressifs" value={editData.isProgressive} onChange={v => set("isProgressive", v)} />
                <Toggle label="Port de lentilles" value={editData.portLentilles} onChange={v => set("portLentilles", v)} />
                <Segment label="Fréquence de port" options={FREQ_OPTIONS} value={editData.frequencePort}
                  onChange={v => set("frequencePort", v as BilanFormData["frequencePort"])} />
              </Accordion>

              <Accordion title="Gênes" icon={<AlertTriangle className="w-4 h-4 text-slate-400" />}>
                <Chips label="Gênes rapportées" options={GENE_OPTIONS} values={editData.genesActuelles}
                  onChange={v => set("genesActuelles", v as BilanFormData["genesActuelles"])} />
                <Toggle label="Lunettes bien supportées" value={editData.lunettesBienSupportees} onChange={v => set("lunettesBienSupportees", v)} />
              </Accordion>

              <Accordion title="Usages" icon={<Activity className="w-4 h-4 text-slate-400" />}>
                <Slider label="Temps écran" value={editData.screenTimeHours} onChange={v => set("screenTimeHours", v)} />
                <Segment label="Activité principale" options={ACTIVITY_OPTIONS} value={editData.mainActivity}
                  onChange={v => set("mainActivity", v as BilanFormData["mainActivity"])} />
                <Segment label="Exposition soleil" options={SOLEIL_OPTIONS} value={editData.expositionSoleil}
                  onChange={v => set("expositionSoleil", v as BilanFormData["expositionSoleil"])} />
                <Toggle label="Sport" value={editData.sport} onChange={v => set("sport", v)} />
                <Toggle label="Conduite de nuit" value={editData.conduitNuit} onChange={v => set("conduitNuit", v)} />
              </Accordion>

              <Accordion title="Santé" icon={<Heart className="w-4 h-4 text-slate-400" />}>
                <Chips label="Sensibilités" options={SENSIBILITY_OPTIONS} values={editData.sensitivities}
                  onChange={v => set("sensitivities", v as BilanFormData["sensitivities"])} />
                <Toggle label="Antécédents familiaux" value={editData.antecedentsFamiliaux} onChange={v => set("antecedentsFamiliaux", v)} />
                <Segment label="Dernière visite ophtalmo" options={VISITE_OPTIONS} value={editData.derniereVisite}
                  onChange={v => set("derniereVisite", v as BilanFormData["derniereVisite"])} />
              </Accordion>

              <Accordion title="Esthétique" icon={<Palette className="w-4 h-4 text-slate-400" />}>
                <Segment label="Style" options={STYLE_OPTIONS} value={editData.stylePreference}
                  onChange={v => set("stylePreference", v as BilanFormData["stylePreference"])} wrap />
                <Segment label="Forme du visage" options={FACE_OPTIONS} value={editData.faceShape}
                  onChange={v => set("faceShape", v as BilanFormData["faceShape"])} wrap />
                <Segment label="Couleur" options={COLOR_OPTIONS} value={editData.colorPreference}
                  onChange={v => set("colorPreference", v as BilanFormData["colorPreference"])} />
              </Accordion>

              <Accordion title="Budget & projet" icon={<Wallet className="w-4 h-4 text-slate-400" />}>
                <Segment label="Budget" options={BUDGET_OPTIONS} value={editData.budgetRange}
                  onChange={v => set("budgetRange", v as BilanFormData["budgetRange"])} wrap />
                <Toggle label="2e paire envisagée" value={editData.projetSecondairesPaires} onChange={v => set("projetSecondairesPaires", v)} />
                <Toggle label="Mutuelle connue" value={editData.mutuelleConnue} onChange={v => set("mutuelleConnue", v)} />
              </Accordion>
            </div>

            {/* Action */}
            <div className="p-4 border-t border-slate-100 flex gap-2">
              <button onClick={loadInExtension}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  patientLoaded ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                }`}>
                {patientLoaded ? <><CheckCircle2 className="w-4 h-4" /> Chargé</> : <><Upload className="w-4 h-4" /> Charger dans AudiBot</>}
              </button>
              {isModified && (
                <button onClick={handleSave} disabled={saving}
                  className="px-3 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors disabled:opacity-50">
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
