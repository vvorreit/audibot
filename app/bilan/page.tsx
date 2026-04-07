"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, ChevronRight, ChevronLeft, Check, Loader2, Star, UserCircle, AlertCircle, Activity, Heart, Palette, Wallet } from "lucide-react";
import type { BilanFormData, BilanResult } from "@/types/bilan";
import type { MutuelleData, OrdonnanceData } from "@/lib/parsers";
import { parseMutuelle, parseOrdonnance } from "@/lib/parsers";
import { processDocument } from "@/lib/ocr";

import StepIdentite from "@/components/bilan/steps/StepIdentite";
import StepVision from "@/components/bilan/steps/StepVision";
import StepGenes from "@/components/bilan/steps/StepGenes";
import StepUsages from "@/components/bilan/steps/StepUsages";
import StepSante from "@/components/bilan/steps/StepSante";
import StepStyle from "@/components/bilan/steps/StepStyle";
import StepBudget from "@/components/bilan/steps/StepBudget";
import AmslerTest from "@/components/bilan/AmslerTest";
import BilanDocScan from "@/components/bilan/BilanDocScan";

interface BilanBrandingConfig {
  nomMagasin: string | null; logoUrl: string | null; accentColor: string | null;
  welcomeTitle: string | null; welcomeMessage: string | null; footerText: string | null;
}

type ScanStep = "ask" | "consent" | "scan_mutuelle" | "scan_ordonnance" | "done";

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function encryptPayload(payload: unknown, keyBase64: string): Promise<string> {
  const rawKeyArr = base64ToUint8Array(keyBase64);
  const rawKey = rawKeyArr.buffer.slice(rawKeyArr.byteOffset, rawKeyArr.byteOffset + rawKeyArr.byteLength) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const encryptedBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as BufferSource }, cryptoKey, encoded);
  const combined = new Uint8Array(iv.length + encryptedBuf.byteLength);
  combined.set(iv); combined.set(new Uint8Array(encryptedBuf), iv.length);
  let binary = ""; for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i]);
  return btoa(binary);
}

const STEPS = [
  { label: "Vous", icon: UserCircle, emoji: "👤" },
  { label: "Vision", icon: Eye, emoji: "👁️" },
  { label: "Gênes", icon: AlertCircle, emoji: "💬" },
  { label: "Usages", icon: Activity, emoji: "🌍" },
  { label: "Santé", icon: Heart, emoji: "🏥" },
  { label: "Style", icon: Palette, emoji: "✨" },
  { label: "Budget", icon: Wallet, emoji: "💰" },
] as const;

const TOTAL_STEPS = 7;

const INITIAL_DATA: BilanFormData = {
  correctionType: [], isProgressive: false, portLentilles: false, genesActuelles: [],
  lunettesBienSupportees: true, frequencePort: "souvent", screenTimeHours: 4,
  mainActivity: "bureau", sport: false, conduitNuit: false, expositionSoleil: "moderee",
  sensitivities: [], antecedentsFamiliaux: false, derniereVisite: "moins_1an",
  stylePreference: "classique", faceShape: "inconnu", colorPreference: "sans_preference",
  budgetRange: "150_300", projetSecondairesPaires: false, mutuelleConnue: false,
};

export default function BilanPage() {
  const [step, setStep] = useState(-1);
  const [data, setData] = useState<BilanFormData>(INITIAL_DATA);
  const [showAmsler, setShowAmsler] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<BilanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bilanConfig, setBilanConfig] = useState<BilanBrandingConfig | null>(null);
  const [showNps, setShowNps] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsComment, setNpsComment] = useState("");
  const [npsSending, setNpsSending] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep | null>(null);
  const [scanData, setScanData] = useState<{ mutuelle: MutuelleData | null; ordonnance: OrdonnanceData | null }>({ mutuelle: null, ordonnance: null });
  const [scanImages, setScanImages] = useState<{ mutuelle: string | null; ordonnance: string | null }>({ mutuelle: null, ordonnance: null });
  const [showDocScreen, setShowDocScreen] = useState(true);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanMsg, setScanMsg] = useState<{ type: "success" | "warning"; text: string } | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const sessionParamRef = useRef<string | null>(null);
  const shopTokenRef = useRef<string | null>(null);
  const accent = bilanConfig?.accentColor ?? "#2563eb";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    tokenRef.current = params.get("token"); sessionParamRef.current = params.get("session");
    shopTokenRef.current = params.get("shop"); const shop = params.get("shop");
    if (shop) {
      fetch(`/api/bilan/config/public?shop=${shop}`).then((r) => r.ok ? r.json() : null)
        .then((cfg: BilanBrandingConfig | null) => { if (cfg) setBilanConfig(cfg); });
    }
  }, []);

  const startBilan = async () => {
    if (sessionParamRef.current) { setSessionId(sessionParamRef.current); setStep(0); return; }
    const shop = shopTokenRef.current;
    if (shop) {
      try {
        const validateRes = await fetch(`/api/bilan/shop/${shop}`);
        if (!validateRes.ok) { setError("QR code invalide"); return; }
        const { shopName: name } = await validateRes.json(); setShopName(name);
        const res = await fetch(`/api/bilan/session/create?shop=${shop}`, { method: "POST" });
        if (!res.ok) { setError("Impossible de créer la session"); return; }
        const { sessionId: sid } = await res.json(); setSessionId(sid); setStep(0);
      } catch { setError("Erreur de connexion"); } return;
    }
    const token = tokenRef.current; if (!token) { setError("Lien invalide"); return; }
    try {
      const res = await fetch("/api/bilan/session/create", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setError("Impossible de créer la session"); return; }
      const { sessionId: sid } = await res.json(); setSessionId(sid); setStep(0);
    } catch { setError("Erreur de connexion"); }
  };

  const onChange = useCallback((partial: Partial<BilanFormData>) => setData((prev) => ({ ...prev, ...partial })), []);
  const resetScan = useCallback(() => { if (scanPreview) URL.revokeObjectURL(scanPreview); setScanFile(null); setScanPreview(null); setScanMsg(null); setScanLoading(false); }, [scanPreview]);

  const finishDocScreen = useCallback((ordonnanceOverride?: OrdonnanceData | null) => {
    const mut = scanData.mutuelle; const ord = ordonnanceOverride ?? scanData.ordonnance;
    setData((prev) => {
      const updates: Partial<BilanFormData> = {};
      if (mut?.nom && !prev.nom) updates.nom = mut.nom; if (mut?.prenom && !prev.prenom) updates.prenom = mut.prenom;
      if (mut?.dateNaissance && !prev.dateNaissance) updates.dateNaissance = mut.dateNaissance;
      if (!updates.nom && ord?.nomPatient && !prev.nom) updates.nom = ord.nomPatient;
      if (ord) {
        const sOD = parseFloat(ord.lunettesOD?.sphere || "0") || 0, sOG = parseFloat(ord.lunettesOG?.sphere || "0") || 0;
        const add = Math.max(parseFloat(ord.lunettesOD?.addition || "0") || 0, parseFloat(ord.lunettesOG?.addition || "0") || 0);
        const ct: any[] = []; if (sOD < -0.25 || sOG < -0.25) ct.push("myopie"); if (sOD > 0.25 || sOG > 0.25) ct.push("hypermétropie");
        if (add > 0) ct.push("presbytie"); if (ct.length > 0) { updates.correctionType = ct; updates.isProgressive = add > 0; }
        if (ord.typePrescription === "lentilles" || ord.typePrescription === "les deux") updates.portLentilles = true;
      }
      if (mut?.organisme) updates.mutuelleConnue = true;
      return { ...prev, ...updates };
    });
    setShowDocScreen(false);
  }, [scanData]);

  const handleScanFileChange = (e: any) => { const f = e.target.files?.[0]; if (f) { setScanFile(f); setScanPreview(URL.createObjectURL(f)); } };
  const handleAnalyze = async (docType: "mutuelle" | "ordonnance") => {
    if (!scanFile) return; setScanLoading(true);
    try {
      const reader = new FileReader();
      const b64 = await new Promise<string>((res) => { reader.onload = () => res(reader.result as string); reader.readAsDataURL(scanFile); });
      setScanImages((prev) => ({ ...prev, [docType]: b64 }));
      const result = await processDocument(scanFile);
      if (docType === "mutuelle") {
        const parsed = parseMutuelle(result.text); setScanData((p) => ({ ...p, mutuelle: parsed }));
        setScanMsg({ type: "success", text: `Carte lue : ${parsed.organisme || "OK"}` });
        setTimeout(() => { resetScan(); setScanStep("scan_ordonnance"); }, 1500);
      } else {
        const parsed = parseOrdonnance(result.text); setScanData((p) => ({ ...p, ordonnance: parsed }));
        setScanMsg({ type: "success", text: "Ordonnance lue ✓" });
        setTimeout(() => { resetScan(); setScanStep("done"); finishDocScreen(parsed); }, 1500);
      }
    } catch { setScanMsg({ type: "warning", text: "Échec lecture" }); setTimeout(() => { resetScan(); if (docType === "ordonnance") finishDocScreen(); else setScanStep("scan_ordonnance"); }, 2000); }
    finally { setScanLoading(false); }
  };

  const [validationError, setValidationError] = useState<string | null>(null);
  const handleNext = () => {
    if (step === 1 && data.correctionType.length === 0) { setValidationError("Indiquez votre trouble visuel"); return; }
    setValidationError(null);
    if (step === 2 && !showAmsler) { setShowAmsler(true); window.scrollTo(0,0); return; }
    if (step < TOTAL_STEPS - 1) { setStep(step + 1); window.scrollTo(0,0); }
  };

  const handleSubmit = async () => {
    if (!sessionId) return; setSubmitting(true);
    try {
      const ocrMeta: any = {}; if (scanData.mutuelle) ocrMeta.mutuelle = scanData.mutuelle; if (scanData.ordonnance) ocrMeta.ordonnance = scanData.ordonnance;
      const res = await fetch(`/api/bilan/session/${sessionId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payload: data, ocrData: ocrMeta }) });
      const json = await res.json(); setResult(json.result);
      const hash = window.location.hash.replace("#", "");
      if (hash && hash.includes(":")) {
        const [keyB64, syncToken] = hash.split(":");
        const encryptedBlob = await encryptPayload({ type: "bilan_ocr", ...scanData }, keyB64);
        await fetch("/api/scan/relay", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, blob: encryptedBlob, syncToken }) });
      }
      setShowNps(true);
    } catch { setError("Erreur envoi"); } finally { setSubmitting(false); }
  };

  const handleNpsSubmit = async () => {
    setNpsSending(true);
    await fetch(`/api/bilan/session/${sessionId}/nps`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: npsScore, comment: npsComment }) });
    setNpsSending(false); setShowNps(false); setDone(true);
  };

  if (step === -1) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: `linear-gradient(135deg, ${accent}08 0%, #ffffff 60%)` }}>
      <div className="max-w-sm w-full text-center space-y-8">
        <div className="space-y-4">
          {bilanConfig?.logoUrl ? <img src={bilanConfig.logoUrl} alt="" className="max-h-16 mx-auto" /> : <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl" style={{ backgroundColor: accent }}><Eye className="w-10 h-10 text-white" /></div>}
          <h1 className="text-3xl font-black text-slate-900 leading-tight">{bilanConfig?.welcomeTitle ?? (shopName ? `Bienvenue chez\n${shopName}` : "Bienvenue !")}</h1>
          <p className="text-lg text-slate-600">{bilanConfig?.welcomeMessage ?? "Répondez à quelques questions pour votre audioprothésiste."}</p>
        </div>
        {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>}
        <button onClick={startBilan} className="w-full text-white text-xl font-black py-5 rounded-2xl shadow-xl flex items-center justify-center gap-2" style={{ backgroundColor: accent }}>Commencer mon bilan <ChevronRight /></button>
      </div>
    </div>
  );

  if (showNps) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-center space-y-8">
      <div className="text-5xl">😊</div><h1 className="text-2xl font-black">Une dernière chose</h1><p className="text-slate-500">Recommanderiez-vous votre audioprothésiste ?</p>
      <div className="flex justify-center gap-2">{[1,2,3,4,5].map(i => <button key={i} onClick={() => setNpsScore(i)}><Star className="w-10 h-10" style={{ fill: npsScore && i <= npsScore ? accent : "transparent", stroke: npsScore && i <= npsScore ? accent : "#d1d5db" }} /></button>)}</div>
      {npsScore && <div className="w-full max-w-xs space-y-4"><textarea value={npsComment} onChange={e => setNpsComment(e.target.value)} placeholder="Votre avis..." className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500" rows={3} /><button onClick={handleNpsSubmit} disabled={npsSending} className="w-full text-white font-black py-4 rounded-2xl" style={{ backgroundColor: accent }}>{npsSending ? "Envoi..." : "Envoyer"}</button></div>}
      <button onClick={() => { setShowNps(false); setDone(true); }} className="text-sm text-slate-400">Passer</button>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl" style={{ backgroundColor: accent }}><Check className="w-12 h-12 text-white" /></div>
      <h1 className="text-3xl font-black">{bilanConfig?.nomMagasin ? `Merci — ${bilanConfig.nomMagasin}` : "Bilan envoyé !"}</h1>
      <p className="text-lg text-slate-600">{shopName ? "Votre audioprothésiste a été notifié." : "Vos réponses ont été transmises."}</p>
      {result && <div className="rounded-2xl p-5 text-left space-y-3 bg-slate-50 border border-slate-200"><p className="font-bold text-sm" style={{ color: accent }}>{result.profileText}</p></div>}
    </div>
  );

  if (showAmsler) return (
    <div className="min-h-screen bg-white flex flex-col"><div className="flex-1 flex items-center justify-center"><AmslerTest onComplete={() => { setShowAmsler(false); setStep(3); }} accent={accent} /></div><div className="p-6 flex justify-between"><button onClick={() => setShowAmsler(false)} className="font-bold">Retour</button></div></div>
  );

  if (showDocScreen && step >= 0) return (
    <BilanDocScan scanStep={scanStep} setScanStep={setScanStep} accent={accent} setShowDocScreen={setShowDocScreen} scanPreview={scanPreview} scanLoading={scanLoading} scanMsg={scanMsg} onFileChange={handleScanFileChange} onReset={resetScan} onAnalyze={handleAnalyze} onSkip={() => { setScanStep("done"); finishDocScreen(); }} />
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="sticky top-0 z-10 bg-white border-b px-5 py-4">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-black">{STEPS[step].emoji} {STEPS[step].label}</span><span className="text-xs font-semibold text-slate-400">{step + 1}/{TOTAL_STEPS}</span></div>
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full transition-all duration-500" style={{ width: `${((step + 1)/TOTAL_STEPS)*100}%`, backgroundColor: accent }} /></div>
      </div>
      <div className="flex-1 px-6 py-6 max-w-xl mx-auto w-full pb-32">
        {step === 0 && <StepIdentite data={data} onChange={onChange} accent={accent} />}
        {step === 1 && <StepVision data={data} onChange={onChange} accent={accent} />}
        {step === 2 && <StepGenes data={data} onChange={onChange} accent={accent} />}
        {step === 3 && <StepUsages data={data} onChange={onChange} accent={accent} />}
        {step === 4 && <StepSante data={data} onChange={onChange} accent={accent} />}
        {step === 5 && <StepStyle data={data} onChange={onChange} accent={accent} />}
        {step === 6 && <StepBudget data={data} onChange={onChange} accent={accent} />}
        {validationError && <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-2xl flex items-center gap-2"><AlertCircle className="w-4 h-4" />{validationError}</div>}
      </div>
      <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
        <button onClick={() => setStep(step - 1)} disabled={step === 0} className="px-5 py-3 rounded-2xl font-bold text-sm border disabled:opacity-0"><ChevronLeft /></button>
        <button onClick={step === TOTAL_STEPS - 1 ? handleSubmit : handleNext} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-black" style={{ backgroundColor: accent }}>{submitting ? "Envoi..." : (step === TOTAL_STEPS - 1 ? "Envoyer" : "Suivant")} <ChevronRight /></button>
      </div>
    </div>
  );
}
