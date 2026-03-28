"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import DropZone from "@/components/DropZone";
import MutuelleForm from "@/components/MutuelleForm";
import OrdonnanceForm from "@/components/OrdonnanceForm";
import { processDocument } from "@/lib/ocr";
import { parseMutuelle, parseOrdonnance, scoreMutuelle, scoreOrdonnance, mergeMutuelle, mergeOrdonnance, MutuelleData, OrdonnanceData, Personne } from "@/lib/parsers";
import { computeScore, OcrScoreResult } from "@/lib/ocrScore";
import OcrScoreBadge from "@/components/OcrScoreBadge";
import { generatePayloadString } from "@/lib/autofill";
import { getUserDashboardData, incrementClientCountInDB, createCheckoutSession, logOcrScan, getMonthlyStats } from "./actions";
import { acceptCgv } from "@/app/actions/legal";
import { Copy, ShieldCheck, Timer, AlertCircle, Smartphone, CreditCard, Eye, ScanLine } from "lucide-react";
import Link from "next/link";
import { track } from "@/lib/analytics";
import dynamic from "next/dynamic";
const ScanPage = dynamic(() => import("@/app/dashboard/scan/page"), { ssr: false });
import OnboardingChecklist from "@/components/OnboardingChecklist";
import WelcomeModal from "@/components/WelcomeModal";
import PlanWidget from "@/components/PlanWidget";
import ReengagementBanner from "@/components/ReengagementBanner";
import FocusTrap from "focus-trap-react";
import PostCopyDrawer from "@/components/PostCopyDrawer";
import { updateOnboardingStep } from "@/app/actions/onboarding";


const EMPTY_MUTUELLE: MutuelleData = {
  organisme: "", numeroAMC: "", numeroAdherent: "", numeroTeletransmission: "",
  typeConv: "", dateDebutValidite: "", dateFinValidite: "",
  nom: "", prenom: "", numeroSecuriteSociale: "", dateNaissance: "",
  personnes: [],
};

const EXEMPLE_MUTUELLE: MutuelleData = {
  organisme: "Harmonie Mutuelle",
  numeroAMC: "123456",
  numeroAdherent: "HM-2026-001",
  numeroTeletransmission: "789012",
  typeConv: "TP",
  dateDebutValidite: "01/01/2026",
  dateFinValidite: "31/12/2026",
  nom: "DUPONT",
  prenom: "Jean",
  numeroSecuriteSociale: "1 85 12 75 123 456 78",
  dateNaissance: "15/12/1985",
  personnes: [
    { nom: "DUPONT", prenom: "Jean", numeroSecuriteSociale: "1 85 12 75 123 456 78", dateNaissance: "15/12/1985" }
  ],
};

const EMPTY_OEIL = { sphere: "", cylindre: "", axe: "", addition: "" };
const EMPTY_LENTILLE = { sphere: "", cylindre: "", axe: "", addition: "", rayonCourbure: "", diametre: "" };

const EMPTY_ORDONNANCE: OrdonnanceData = {
  nomOphtalmologue: "", dateOrdonnance: "", dateValidite: "",
  nomPatient: "", prenomPatient: "", dateNaissancePatient: "",
  distancePupillaire: "",
  typePrescription: "",
  lunettesOD: { ...EMPTY_OEIL }, lunettesOG: { ...EMPTY_OEIL },
  lentillesOD: { ...EMPTY_LENTILLE }, lentillesOG: { ...EMPTY_LENTILLE },
  remarques: "",
};

type DocType = "mutuelle" | "ordonnance";

interface DocState {
  loading: boolean;
  progress: number;
  fileName?: string;
}

function normalizeName(s: string): string {
  return s.toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z\s]/g, "")
    .trim();
}

function matchPatient(patientRaw: string, personnes: Personne[]): Personne | null {
  if (!patientRaw || personnes.length === 0) return null;
  const patientWords = normalizeName(patientRaw).split(/\s+/).filter((w) => w.length > 1);
  if (patientWords.length === 0) return null;

  let best: { personne: Personne; score: number } | null = null;
  for (const p of personnes) {
    const personWords = normalizeName(`${p.nom} ${p.prenom}`).split(/\s+/);
    const score = patientWords.filter((w) => personWords.includes(w)).length;
    if (score > 0 && (!best || score > best.score)) best = { personne: p, score };
  }
  return best?.personne ?? null;
}


export default function Dashboard() {
  const [mutuelle, setMutuelle] = useState<MutuelleData>(EMPTY_MUTUELLE);
  const [ordonnance, setOrdonnance] = useState<OrdonnanceData>(EMPTY_ORDONNANCE);
  const [docState, setDocState] = useState<Record<DocType, DocState>>({
    mutuelle: { loading: false, progress: 0 },
    ordonnance: { loading: false, progress: 0 },
  });
  const [isDataCopied, setIsDataCopied] = useState(false);
  const [isStripeLoading, setIsStripeLoading] = useState<string | null>(null);
  const [rawText, setRawText] = useState<{ mutuelle: string; ordonnance: string }>({ mutuelle: "", ordonnance: "" });
  const [showRaw, setShowRaw] = useState<DocType | null>(null);
  const [ocrScores, setOcrScores] = useState<{ mutuelle: OcrScoreResult | null; ordonnance: OcrScoreResult | null }>({ mutuelle: null, ordonnance: null });
  
  const [userData, setUserData] = useState<{
    clientCount: number;
    isPro: boolean;
    plan: string;
    role: string;
    syncToken: string | null;
    createdAt: string | Date;
    onboardingStep: number;
    monthlyScanCount: number;
    monthlyScanResetAt: string | Date | null;
    needsCgvAcceptance: boolean;
    cgvVersion: string | null;
    pendingPlan: string | null;
    lastActiveAt: string | Date;
    freeUntil: string | Date | null;
    isFreeActive: boolean;
  } | null>(null);

  const lastCopyTimestamp = useRef(0);

  const TRIAL_DAYS = 14;
  const trialDaysLeft = userData?.createdAt
    ? Math.max(0, TRIAL_DAYS - Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / 86_400_000))
    : TRIAL_DAYS;
  const isLimitReached = !userData?.isPro && trialDaysLeft <= 0;

  // Track vue essai expiré (une seule fois par session)
  const trialExpiredTracked = useRef(false);
  useEffect(() => {
    if (isLimitReached && !trialExpiredTracked.current) {
      trialExpiredTracked.current = true;
      track("trial_expired_view");
    }
  }, [isLimitReached]);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(false);
  useEffect(() => {
    setWelcomeSeen(!!localStorage.getItem("optibot_welcome_seen"));
  }, []);
  useEffect(() => {
    if (!userData?.createdAt) return;
    const accountAgeDays = Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / 86_400_000);
    const shouldShow = accountAgeDays < 14 && (userData?.onboardingStep ?? 0) < 4;
    setShowOnboarding(shouldShow);
    if (shouldShow && (userData?.onboardingStep ?? 0) === 0) track("onboarding_started");
  }, [userData?.createdAt, userData?.onboardingStep, isLimitReached]);

  const showActivationHero = userData !== null && userData.clientCount === 0 && (userData.onboardingStep ?? 0) < 2 && welcomeSeen;

  const [monthlyStats, setMonthlyStats] = useState<{ scansThisMonth: number; dossiersThisMonth: number; montantTPThisMonth: number } | null>(null);

  const refreshData = useCallback(async () => {
    const [data, stats] = await Promise.all([getUserDashboardData(), getMonthlyStats()]);
    if (data) setUserData(data);
    if (stats) setMonthlyStats(stats);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  /* US-28 — Track checkout_completed au retour Stripe (?success=true) */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      track("checkout_completed");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  /* Dès que userData est chargé → envoyer le syncToken à l'extension pour débloquer la popup */
  useEffect(() => {
    if (!userData?.syncToken) return;
    const rpaEnabled = userData.isPro || ["PRO","CABINET","RESEAU","EQUIPE"].includes(userData.plan) || userData.role === "ADMIN";
    window.postMessage({
      type: "OPTIBOT_AUTH",
      syncToken: userData.syncToken,
      plan: userData.plan,
      isPro: userData.isPro,
      rpaEnabled,
      expiresAt: Date.now() + 20 * 60 * 60 * 1000, // 20h
    }, "*");
  }, [userData?.syncToken, userData?.isPro, userData?.plan, userData?.role]);

  /* Fix 1 — Auto-check step 1 quand l'extension confirme via postMessage */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "OPTIBOT_AUTH" && (userData?.onboardingStep ?? 0) < 1) {
        updateOnboardingStep(1);
        setUserData(prev => prev ? { ...prev, onboardingStep: 1 } : null);
        track("onboarding_step_completed", { step: 1 });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [userData?.onboardingStep]);

  /* Refresh automatique du token toutes les 30 min quand l'utilisateur est actif */
  useEffect(() => {
    if (!userData?.syncToken) return;

    const refreshIfNeeded = () => {
      const rpaEnabled = userData.isPro || ["PRO","CABINET","RESEAU","EQUIPE"].includes(userData.plan) || userData.role === "ADMIN";
      window.postMessage({
        type: "OPTIBOT_AUTH",
        syncToken: userData.syncToken,
        plan: userData.plan,
        isPro: userData.isPro,
        rpaEnabled,
        expiresAt: Date.now() + 20 * 60 * 60 * 1000,
      }, "*");
    };

    const interval = setInterval(refreshIfNeeded, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userData?.syncToken, userData?.plan, userData?.isPro]);

  const ESSENTIEL_SCAN_LIMIT = 80;
  const isEssentiel = userData?.plan === "ESSENTIEL";
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthlyScanCount = userData?.monthlyScanResetAt && new Date(userData.monthlyScanResetAt) >= monthStart
    ? userData.monthlyScanCount : 0;
  const essentielLimitReached = isEssentiel && monthlyScanCount >= ESSENTIEL_SCAN_LIMIT;

  const handleCheckout = async (plan: "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU" | "EQUIPE", billing: "monthly" | "annual" = "monthly") => {
    // Vérifier si les CGV sont acceptées
    const cgvOk = userData?.cgvVersion === "1.1" && !userData?.needsCgvAcceptance;
    if (!cgvOk) {
      setPendingCheckout({ plan, billing });
      setCgvChecked(false);
      setShowCgvModal(true);
      return;
    }
    setIsStripeLoading(plan);
    track("checkout_initiated", { plan });
    try {
      const { url } = await createCheckoutSession(plan, billing);
      if (url) window.location.href = url;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur lors du paiement. Réessayez.");
    } finally {
      setIsStripeLoading(null);
    }
  };

  const handleCgvAcceptAndCheckout = async () => {
    if (!cgvChecked || !pendingCheckout) return;
    setCgvLoading(true);
    try {
      await acceptCgv("1.1");
      await refreshData();
      setShowCgvModal(false);
      const { plan, billing } = pendingCheckout;
      setPendingCheckout(null);
      setIsStripeLoading(plan);
      track("checkout_initiated", { plan });
      const { url } = await createCheckoutSession(plan, billing);
      if (url) window.location.href = url;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erreur. Réessayez.");
    } finally {
      setCgvLoading(false);
      setIsStripeLoading(null);
    }
  };

  const incrementLimit = async () => {
    const newCount = await incrementClientCountInDB();
    setUserData(prev => prev ? { ...prev, clientCount: newCount } : null);
  };

  // Écouter les données reçues depuis le scan mobile
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ mutuelle?: MutuelleData; ordonnance?: OrdonnanceData }>).detail;
      if (detail?.mutuelle) setMutuelle(detail.mutuelle);
      if (detail?.ordonnance) setOrdonnance(detail.ordonnance);
    };
    window.addEventListener("optibot_scan_received", handler);
    return () => window.removeEventListener("optibot_scan_received", handler);
  }, []);

  const [showScanModal, setShowScanModal] = useState(false);
  const [showPostCopyDrawer, setShowPostCopyDrawer] = useState(false);
  const [isAnnualBilling, setIsAnnualBilling] = useState(false);
  const [showCgvModal, setShowCgvModal] = useState(false);
  const [cgvChecked, setCgvChecked] = useState(false);
  const [cgvLoading, setCgvLoading] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState<{ plan: "ESSENTIEL" | "PRO" | "CABINET" | "RESEAU" | "EQUIPE"; billing: "monthly" | "annual" } | null>(null);

  const hasMutuelle = mutuelle.personnes.length > 0 || mutuelle.organisme !== "";
  const hasOrdonnance = ordonnance.nomOphtalmologue !== "" || ordonnance.nomPatient !== "" || ordonnance.lunettesOD.sphere !== "";

  useEffect(() => {
    if (!hasMutuelle || !hasOrdonnance) return;
    const patientFull = `${ordonnance.nomPatient} ${ordonnance.prenomPatient}`.trim();
    const matched = matchPatient(patientFull, mutuelle.personnes);
    if (matched) {
      const alreadySelected = mutuelle.nom === matched.nom && mutuelle.prenom === matched.prenom;
      if (!alreadySelected) {
        setMutuelle((prev) => ({
          ...prev,
          nom: matched.nom, prenom: matched.prenom,
          numeroSecuriteSociale: matched.numeroSecuriteSociale,
          dateNaissance: matched.dateNaissance,
        }));
      }
    }
  }, [ordonnance.nomPatient, ordonnance.prenomPatient, mutuelle.personnes, mutuelle.nom, mutuelle.prenom, hasMutuelle, hasOrdonnance]);

  const handleFile = useCallback(async (file: File, type: DocType) => {
    if (isLimitReached) {
      alert("Période d'essai terminée. Passez à un plan payant pour continuer.");
      return;
    }
    if (essentielLimitReached) {
      alert("Limite de 80 scans/mois atteinte. Passez au plan Pro pour un usage illimité.");
      return;
    }
    setDocState((prev) => ({ ...prev, [type]: { loading: true, progress: 0, fileName: file.name } }));
    try {
      /* ── Tentative OCR serveur (PaddleOCR) ─────────────────────────── */
      let text = "";
      let confidence = 0;
      let parsed: MutuelleData | OrdonnanceData | null = null;
      let score: OcrScoreResult | null = null;
      let usedServer = false;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        const res = await fetch("/api/ocr/process", { method: "POST", body: formData });
        if (res.ok) {
          const data = await res.json();
          text = data.text;
          confidence = data.confidence;
          parsed = data.parsed;
          score = data.score;
          usedServer = true;
        }
      } catch {
        /* Service OCR indisponible — fallback client-side ci-dessous */
      }

      /* ── Fallback ou compétition Tesseract client-side ────────────── */
      const OCR_COMPETITION_THRESHOLD = 70;
      const shouldRetryClient = !usedServer || (score && score.globalScore < OCR_COMPETITION_THRESHOLD);
      let didCompetitionMerge = false;

      if (shouldRetryClient) {
        try {
          const result = await processDocument(file, (progress) => {
            setDocState((prev) => ({ ...prev, [type]: { ...prev[type], progress } }));
          });
          const clientText = result.text;
          const clientConfidence = result.confidence;
          let clientParsed: MutuelleData | OrdonnanceData;
          let clientScore: OcrScoreResult;

          if (type === "mutuelle") {
            clientParsed = parseMutuelle(clientText);
            clientScore = computeScore(clientConfidence, scoreMutuelle(clientParsed as MutuelleData));
          } else {
            clientParsed = parseOrdonnance(clientText);
            clientScore = computeScore(clientConfidence, scoreOrdonnance(clientParsed as OrdonnanceData));
          }

          if (!usedServer) {
            /* Pas de résultat serveur → utiliser le client directement */
            text = clientText;
            confidence = clientConfidence;
            parsed = clientParsed;
            score = clientScore;
          } else if (score && clientScore.globalScore > score.globalScore) {
            /* Client meilleur → fusionner en priorisant le client */
            if (process.env.NODE_ENV === 'development') console.log(`[OCR] Client Tesseract (${clientScore.globalScore}) > PaddleOCR (${score.globalScore}) — merge`);
            if (type === "mutuelle") {
              parsed = mergeMutuelle(clientParsed as MutuelleData, parsed as MutuelleData);
              score = computeScore(clientConfidence, scoreMutuelle(parsed as MutuelleData));
            } else {
              parsed = mergeOrdonnance(clientParsed as OrdonnanceData, parsed as OrdonnanceData);
              score = computeScore(clientConfidence, scoreOrdonnance(parsed as OrdonnanceData));
            }
            text = clientText;
            confidence = clientConfidence;
            didCompetitionMerge = true;
          } else if (score && parsed) {
            /* PaddleOCR meilleur → fusionner en priorisant PaddleOCR, compléter les trous avec Tesseract */
            if (process.env.NODE_ENV === 'development') console.log(`[OCR] PaddleOCR (${score.globalScore}) >= Client (${clientScore.globalScore}) — merge complémentaire`);
            if (type === "mutuelle") {
              parsed = mergeMutuelle(parsed as MutuelleData, clientParsed as MutuelleData);
              score = computeScore(confidence, scoreMutuelle(parsed as MutuelleData));
            } else {
              parsed = mergeOrdonnance(parsed as OrdonnanceData, clientParsed as OrdonnanceData);
              score = computeScore(confidence, scoreOrdonnance(parsed as OrdonnanceData));
            }
            didCompetitionMerge = true;
          }
        } catch (err) {
          console.warn("[OCR] Client-side retry failed:", err);
        }
      }

      setRawText((prev) => ({ ...prev, [type]: text }));
      if (type === "mutuelle" && parsed) {
        setMutuelle(parsed as MutuelleData);
      } else if (parsed) {
        setOrdonnance(parsed as OrdonnanceData);
      }
      if (score) {
        setOcrScores((prev) => ({ ...prev, [type]: score }));
        if (!usedServer || didCompetitionMerge) {
          logOcrScan({ type, success: score.globalScore >= 50, ocrConfidence: score.ocrConfidence, dataScore: score.dataScore, globalScore: score.globalScore, level: score.level, fileName: file.name });
        }
      }
      track("document_uploaded", { type });
    } catch (err: unknown) {
      console.error("OCR error:", err);
      alert(`Erreur lors de l'analyse : ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDocState((prev) => ({ ...prev, [type]: { ...prev[type], loading: false, progress: 100 } }));
    }
  }, [isLimitReached, essentielLimitReached]);

  const [feedbackModal, setFeedbackModal] = useState<{ open: boolean; type: DocType | null; text: string; sending: boolean; sent: boolean }>({ open: false, type: null, text: "", sending: false, sent: false });

  const handleOcrFeedback = (type: DocType) => {
    setFeedbackModal({ open: true, type, text: "", sending: false, sent: false });
  };

  const submitOcrFeedback = async () => {
    if (!feedbackModal.type || !feedbackModal.text.trim()) return;
    setFeedbackModal((prev) => ({ ...prev, sending: true }));
    try {
      await fetch("/api/feedback/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: feedbackModal.type,
          // rawText supprimé — zéro donnée santé côté serveur (RGPD)
          message: feedbackModal.text,
          fileName: docState[feedbackModal.type].fileName,
        }),
      });
      setFeedbackModal((prev) => ({ ...prev, sent: true, sending: false }));
      setTimeout(() => setFeedbackModal({ open: false, type: null, text: "", sending: false, sent: false }), 2000);
    } catch {
      setFeedbackModal((prev) => ({ ...prev, sending: false }));
    }
  };

  const copyData = async () => {
    if (isLimitReached) return;
    try {
      // Génération 100% client-side — aucune donnée patient ne transite par le serveur
      const payload = generatePayloadString({
        mutuelle,
        ordonnance,
        syncToken: userData?.syncToken ?? undefined,
      });
      await navigator.clipboard.writeText(payload);

      // Envoi direct à l'extension via bridge.js
      const parsed = JSON.parse(payload);
      window.postMessage({ type: 'OPTIBOT_DATA', payload: parsed }, '*');

      window.dispatchEvent(new Event("optibot_data_copied"));

      // Onboarding step 3 (copié)
      if ((userData?.onboardingStep ?? 0) < 3) {
        updateOnboardingStep(3);
        track("onboarding_step_completed", { step: 3 });
      }

      setIsDataCopied(true);
      setShowPostCopyDrawer(true);
      track("data_copied");

      // Déduplication : cooldown 10s sur le compteur — optimistic UI
      const now = Date.now();
      if (now - lastCopyTimestamp.current >= 10000) {
        lastCopyTimestamp.current = now;
        // Optimistic: update locale immédiate
        const prevCount = userData?.clientCount ?? 0;
        setUserData(prev => prev ? { ...prev, clientCount: prev.clientCount + 1 } : null);
        // Appel serveur en arrière-plan avec rollback silencieux
        incrementLimit().catch(() => {
          setUserData(prev => prev ? { ...prev, clientCount: prevCount } : null);
        });
        /* cooldown hit — counter not incremented */
      } else {
        /* cooldown active — skip increment */
      }

      setTimeout(() => setIsDataCopied(false), 3000);
    } catch (err) {
      console.error("Erreur lors de la copie ou de l'incrémentation:", err);
    }
  };

  const loadExampleMutuelle = useCallback(() => {
    setMutuelle(EXEMPLE_MUTUELLE);
    track("example_mutuelle_loaded");
  }, []);

  const canValidate = hasMutuelle || hasOrdonnance;

  return (
    <>
    {userData && (
      <ReengagementBanner
        lastActiveAt={userData.lastActiveAt}
        clientCount={userData.clientCount}
        isPro={userData.isPro}
        trialExpired={isLimitReached}
      />
    )}
    <main className="bg-slate-50 text-slate-900 pb-10">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 lg:pb-10">

        {userData !== null && (userData.onboardingStep ?? 0) === 0 && !showActivationHero && <WelcomeModal />}
        {showOnboarding && <OnboardingChecklist clientCount={userData?.clientCount} onboardingStep={userData?.onboardingStep ?? 0} />}

        {/* Bandeau CGV */}
        {userData?.needsCgvAcceptance && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
            <p className="text-sm font-semibold text-blue-800">
              Les CGV ont été mises à jour. Veuillez les accepter pour continuer.{" "}
              <a href="/legal/cgv" className="underline hover:text-blue-600">Lire les CGV</a>
            </p>
            <button
              onClick={async () => {
                await acceptCgv("1.1");
                await refreshData();
              }}
              className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              J&apos;accepte les CGV v1.1
            </button>
          </div>
        )}

        {/* Header & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 items-stretch">
          <div className="lg:col-span-2 bg-white p-6 rounded-card shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden">
            <div className="w-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-2xl font-black">Tableau de bord</h1>
                  <p className="text-2xs text-slate-400 font-medium mt-0.5">
                    {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                  </p>
                </div>
                {userData && userData.clientCount > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-xl border border-green-100">
                    <Timer className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs font-black text-green-700">
                      {userData.clientCount * 7 >= 60
                        ? `${Math.floor((userData.clientCount * 7) / 60)}h${String((userData.clientCount * 7) % 60).padStart(2, "0")}`
                        : `${userData.clientCount * 7} min`} économisées
                    </span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-4">
                  <p className="text-2xs font-black text-blue-200 uppercase tracking-widest mb-1.5">Scans ce mois</p>
                  <p className="text-2xl font-black text-white">{monthlyStats?.scansThisMonth ?? "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Dossiers TP</p>
                  <p className="text-2xl font-black text-slate-900">{monthlyStats?.dossiersThisMonth ?? "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-2xs font-black text-slate-400 uppercase tracking-widest mb-1.5">Montant géré</p>
                  <p className="text-2xl font-black text-slate-900">
                    {monthlyStats ? `${monthlyStats.montantTPThisMonth.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €` : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-[220px]">
            {!userData ? (
              <div className="bg-white rounded-card border border-slate-100 shadow-sm p-5 space-y-3 animate-pulse">
                <div className="h-3 w-24 bg-slate-100 rounded" />
                <div className="h-7 w-32 bg-slate-100 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded-full" />
                <div className="h-10 w-full bg-slate-100 rounded-xl" />
                <div className="h-10 w-full bg-slate-100 rounded-xl" />
              </div>
            ) : (
              <>
                {/* Accès offert — badge cadeau */}
                {userData.isFreeActive && userData.freeUntil && (
                  <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-green-50 border border-green-200 rounded-xl">
                    <span className="text-lg">🎁</span>
                    <div>
                      <p className="text-xs font-black text-green-800">Accès offert</p>
                      <p className="text-2xs text-green-600 font-medium">
                        Valable jusqu&apos;au {new Date(userData.freeUntil).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Downgrade planifié */}
                {userData.pendingPlan && (
                  <div className="flex items-center justify-between px-3 py-2 mb-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-2xs text-amber-700 font-bold">
                      ⏳ Passage à {userData.pendingPlan} au prochain cycle
                    </p>
                    <a href="/dashboard/account" className="text-2xs text-amber-600 underline font-semibold shrink-0">
                      Gérer
                    </a>
                  </div>
                )}

                <PlanWidget userData={userData} onRefresh={refreshData} />
              </>
            )}
          </div>
        </div>



        {/* US-25 — Hero d'activation */}
        {showActivationHero && (
          <div className="mb-10 bg-white rounded-card border border-blue-100 shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ScanLine className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Votre premier client en 30 secondes</h2>
            <p className="text-slate-500 font-medium text-sm mb-8 max-w-md mx-auto">
              Scannez une carte mutuelle ou une ordonnance. OptiBot extrait les données instantanément.
            </p>
            <label className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 active:scale-95 transition-all text-sm uppercase tracking-widest shadow-xl shadow-blue-200 cursor-pointer">
              <ScanLine className="w-5 h-5" />
              Scanner un document
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f, "mutuelle");
                }}
              />
            </label>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["mutuelle", "ordonnance"] as DocType[]).map((type) => (
                <div key={type} className={isLimitReached || essentielLimitReached ? "opacity-40 grayscale pointer-events-none" : ""}>
                  <DropZone
                    label={type === "mutuelle" ? "Carte Mutuelle" : "Ordonnance opticien"}
                    icon={type === "mutuelle" ? <CreditCard className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    onFile={(f) => handleFile(f, type)}
                    isLoading={docState[type].loading}
                    progress={docState[type].progress}
                    fileName={docState[type].fileName}
                    hint={type === "mutuelle" ? "Carte vitale, carte de mutuelle, attestation de droits" : "Ordonnance de l'ophtalmologue (verres ou lentilles)"}
                    emptyHint={type === "mutuelle" ? "Commencez ici — scannez la carte mutuelle" : "Ensuite — ajoutez l'ordonnance"}
                    ariaLabel={type === "mutuelle" ? "Déposer une carte mutuelle" : "Déposer une ordonnance"}
                    onExample={type === "mutuelle" ? loadExampleMutuelle : undefined}
                  />
                </div>
              ))}
            </div>

            {/* US-35 — Badge RGPD */}
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium group relative">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Traitement 100% local &mdash; aucune donn&eacute;e patient envoy&eacute;e</span>
              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-slate-800 text-white text-2xs font-medium px-4 py-3 rounded-xl shadow-xl max-w-xs z-10 leading-relaxed">
                L&apos;OCR s&apos;ex&eacute;cute enti&egrave;rement dans votre navigateur. Aucune donn&eacute;e de sant&eacute; ne transite par nos serveurs.{" "}
                <a href="/legal/confidentialite" className="underline text-blue-300 hover:text-blue-200">Politique de confidentialit&eacute;</a>
              </div>
            </div>

            {/* ScanStatusBanner — un seul bandeau de statut */}
            {(hasMutuelle || hasOrdonnance) && (
              isDataCopied ? (
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold">
                  <span>✅ Donn&eacute;es copi&eacute;es &mdash;</span>
                  <span className="font-black">Ouvrez votre portail mutuelle et cliquez 🤖 Remplir</span>
                  <Link href="/portails" className="ml-auto text-green-600 underline text-xs font-black shrink-0">Voir les portails &rarr;</Link>
                </div>
              ) : (
                <div className="flex items-start gap-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold">
                  <span className="text-lg mt-0.5 shrink-0">⚠️</span>
                  <p className="text-xs font-semibold leading-relaxed">
                    <span className="font-black">V&eacute;rifiez les donn&eacute;es, puis cliquez Copier.</span>{" "}
                    La lecture automatique peut comporter des erreurs.
                  </p>
                </div>
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                {hasMutuelle && (
                  <>
                    {ocrScores.mutuelle && <OcrScoreBadge score={ocrScores.mutuelle} />}
                    <MutuelleForm data={mutuelle} onChange={setMutuelle} />
                    <button
                      onClick={() => handleOcrFeedback("mutuelle")}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-2 flex items-center gap-1 min-h-[44px] px-2"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Données incorrectes ?
                    </button>
                  </>
                )}
              </div>
              <div className="space-y-6">
                {hasOrdonnance && (
                  <>
                    {ocrScores.ordonnance && <OcrScoreBadge score={ocrScores.ordonnance} />}
                    <OrdonnanceForm data={ordonnance} onChange={setOrdonnance} />
                    <button
                      onClick={() => handleOcrFeedback("ordonnance")}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors mt-2 flex items-center gap-1 min-h-[44px] px-2"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Données incorrectes ?
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Debug : Texte Brut */}
            {(rawText.mutuelle || rawText.ordonnance) && (
              <div className="mt-4">
                <button
                  onClick={() => setShowRaw(showRaw ? null : (rawText.mutuelle ? "mutuelle" : "ordonnance"))}
                  aria-label={showRaw ? "Masquer le texte brut extrait" : "Afficher le texte brut extrait"}
                  aria-expanded={!!showRaw}
                  className="text-2xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showRaw ? "✕ Masquer le texte brut" : "👁 Voir le texte brut extrait"}
                </button>
                {showRaw && (
                  <pre className="mt-2 p-4 bg-slate-100 rounded-xl text-2xs font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap border border-slate-200">
                    {rawText[showRaw]}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area (Validation & Installation) */}
          <div className="space-y-6">

            {/* Bloc scan mobile */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600 shrink-0" />
                <h3 className="text-sm font-black text-slate-900">Scanner depuis votre téléphone</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Vous pouvez photographier une ordonnance ou une carte mutuelle directement depuis votre smartphone
                (iPhone, Android, ou tout appareil avec un navigateur récent) et importer les données ici en un clic.
              </p>
              <ul className="space-y-1">
                {[
                  "Aucune app à installer",
                  "Fonctionne sur iPhone & Android",
                  "Données chiffrées — jamais stockées",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setShowScanModal(true); track("scan_mobile_generated"); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all text-sm"
              >
                <Smartphone className="w-4 h-4" />
                Générer le QR code
              </button>
            </div>


            {/* Extension Chrome — en attente validation Store */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">🔌</span>
                <div>
                  <p className="text-sm font-black text-amber-900 mb-1">Extension Chrome — validation en cours</p>
                  <p className="text-xs text-amber-700 font-medium leading-relaxed">
                    L&apos;extension est en cours de validation sur le Chrome Web Store (2-7 jours).
                    Pour l&apos;installer dès maintenant, contactez-nous.
                  </p>
                  <a
                    href="mailto:contact@optibot.fr?subject=Installation extension OptiBot"
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    Demander l&apos;accès anticipé
                  </a>
                </div>
              </div>
            </div>

            {/* Bloc validation — toujours visible, ghost state si pas de document */}
            <div className={`p-8 rounded-card border-2 border-blue-600 bg-white shadow-xl space-y-6 transition-all duration-300 ${canValidate ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              <div className="text-left space-y-2">
                <h2 className="text-xl font-bold text-blue-600 leading-tight">
                  {canValidate ? "Prêt pour le remplissage !" : "En attente d'un document"}
                </h2>
                <p className="text-slate-600 text-2xs font-medium leading-relaxed">
                  {canValidate
                    ? "Cliquez ci-dessous pour copier les données et les utiliser avec l'extension."
                    : "Scannez un document pour débloquer"}
                </p>
              </div>
              <div className="relative">
                <button
                  onClick={copyData}
                  disabled={!canValidate}
                  className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                    isDataCopied
                      ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-900/20 scale-105"
                      : "bg-blue-600 border-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isDataCopied ? <ShieldCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  <span className="font-bold">{isDataCopied ? "Copié !" : "Copier"}</span>
                </button>

                {isDataCopied && (
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-green-600 text-2xs font-black py-2 px-4 rounded-full shadow-xl whitespace-nowrap animate-bounce">
                    ✓ PRÊT À COLLER
                  </div>
                )}
              </div>

              {/* RPA Wemind/Almerys — déplacé dans l'extension Chrome */}
            </div>
          </div>

        </div>

      </div>

      {/* Sticky Copier — mobile uniquement, quand canValidate */}

      {/* Modal Feedback OCR */}
      {feedbackModal.open && (
        <FocusTrap focusTrapOptions={{ escapeDeactivates: true, onDeactivate: () => setFeedbackModal({ open: false, type: null, text: "", sending: false, sent: false }) }}>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" onClick={() => setFeedbackModal({ open: false, type: null, text: "", sending: false, sent: false })} />
          <div role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title" className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4 relative z-10">
            {feedbackModal.sent ? (
              <p className="text-center text-green-600 font-semibold py-4">
                Merci, votre retour nous aide à améliorer la lecture.
              </p>
            ) : (
              <>
                <h3 id="feedback-modal-title" className="text-lg font-bold text-slate-900">
                  Signaler une erreur ({feedbackModal.type === "mutuelle" ? "Mutuelle" : "Ordonnance"})
                </h3>
                <textarea
                  id="feedback-text"
                  aria-label="Décrivez l'erreur de lecture"
                  value={feedbackModal.text}
                  onChange={(e) => setFeedbackModal((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="Ex: le nom est mal lu, le NSS est tronqué..."
                  className="w-full h-28 border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none focus-visible:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setFeedbackModal({ open: false, type: null, text: "", sending: false, sent: false })}
                    className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitOcrFeedback}
                    disabled={feedbackModal.sending || !feedbackModal.text.trim()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {feedbackModal.sending ? "Envoi..." : "Envoyer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        </FocusTrap>
      )}
      {/* Modale Scan Mobile */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm">
            <ScanPage />
            <button
              onClick={() => setShowScanModal(false)}
              className="w-full mt-3 py-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      <PostCopyDrawer visible={showPostCopyDrawer} onClose={() => setShowPostCopyDrawer(false)} />

      {/* Sticky Copier — mobile uniquement */}
      {canValidate && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-slate-100 shadow-lg">
          <button
            onClick={copyData}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all active:scale-95 ${
              isDataCopied ? "bg-green-500 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isDataCopied ? <ShieldCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {isDataCopied ? "Copié !" : "Copier les données"}
          </button>
        </div>
      )}
    </main>

    {/* ── Modale CGV ── */}
    {showCgvModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-900">Accepter les CGV</h2>
            <p className="text-sm text-slate-500 font-medium">
              Veuillez lire et accepter nos Conditions Générales de Vente avant de souscrire.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-800 space-y-1">
            <p className="font-bold">CGV v1.1 — Points clés :</p>
            <ul className="list-disc list-inside space-y-1 text-xs font-medium">
              <li>Abonnement mensuel ou annuel sans engagement minimum</li>
              <li>Résiliation possible à tout moment depuis votre espace</li>
              <li>Facturation automatique via Stripe</li>
              <li>Les données patients restent sur votre poste</li>
              <li>Tarifs mis à jour — voir CGV complètes</li>
            </ul>
            <a href="/legal/cgv" className="text-blue-600 underline text-xs font-bold" target="_blank">
              Lire les CGV complètes →
            </a>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={cgvChecked}
              onChange={e => setCgvChecked(e.target.checked)}
              className="mt-1 w-4 h-4 accent-blue-600 shrink-0"
            />
            <span className="text-sm text-slate-700 font-medium">
              J&apos;ai lu et j&apos;accepte les{" "}
              <a href="/legal/cgv" className="text-blue-600 underline" target="_blank">
                Conditions Générales de Vente v1.1
              </a>{" "}
              d&apos;OptiBot.
            </span>
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowCgvModal(false); setPendingCheckout(null); }}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleCgvAcceptAndCheckout}
              disabled={!cgvChecked || cgvLoading}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {cgvLoading ? "Chargement..." : "Accepter et payer"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
