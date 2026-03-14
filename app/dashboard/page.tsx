"use client";

import { useState, useCallback, useEffect } from "react";
import DropZone from "@/components/DropZone";
import MutuelleForm from "@/components/MutuelleForm";
import OrdonnanceForm from "@/components/OrdonnanceForm";
import { processDocument } from "@/lib/ocr";
import { parseMutuelle, parseOrdonnance, MutuelleData, OrdonnanceData, Personne } from "@/lib/parsers";
import { STATIC_BOOKMARKLET } from "@/lib/autofill";
import { getUserDashboardData, incrementClientCountInDB, createCheckoutSession, createPortalSession, generateAutofillPayload, upgradePlan } from "./actions";
import { Copy, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";


const EMPTY_MUTUELLE: MutuelleData = {
  organisme: "", numeroAMC: "", numeroAdherent: "", numeroTeletransmission: "",
  typeConv: "", dateDebutValidite: "", dateFinValidite: "",
  nom: "", prenom: "", numeroSecuriteSociale: "", dateNaissance: "",
  personnes: [],
};

const EMPTY_AUDIOGRAMME = { hz250: "", hz500: "", hz1000: "", hz2000: "", hz4000: "" };

const EMPTY_ORDONNANCE: OrdonnanceData = {
  nomORL: "", rpps: "", datePrescription: "",
  nomPatient: "", prenomPatient: "", dateNaissancePatient: "",
  oreilleDroite: { ...EMPTY_AUDIOGRAMME },
  oreilleGauche: { ...EMPTY_AUDIOGRAMME },
  classeAppareillage: "",
  typeAppareillage: "",
  renouvellement: false,
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

function BookmarkletInstallButton() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center space-y-3">
      <p className="text-sm font-bold text-blue-900">1. Installation (Une seule fois)</p>
      <p className="text-xs text-blue-600">
        Créez un favori nommé "AudiBot" et collez ce code comme URL :
      </p>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(STATIC_BOOKMARKLET);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className={`w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all shadow-sm
          ${copied ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}`}
      >
        {copied ? "✓ Code du favori copié !" : "Copier le code du favori"}
      </button>
    </div>
  );
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
  
  const [userData, setUserData] = useState<{
    clientCount: number;
    isPro: boolean;
    plan: string;
    role: string;
    syncToken: string | null;
  } | null>(null);

  const FREE_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_LIMIT ?? 10);
  const isLimitReached = !userData?.isPro && (userData?.clientCount ?? 0) >= FREE_LIMIT;

  const refreshData = useCallback(async () => {
    const data = await getUserDashboardData();
    if (data) setUserData(data);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCheckout = async (plan: "SOLO" | "DUO") => {
    setIsStripeLoading(plan);
    try {
      const { url } = await createCheckoutSession(plan);
      if (url) window.location.href = url;
    } catch (err: any) {
      alert(err?.message || "Erreur lors du paiement. Réessayez.");
    } finally {
      setIsStripeLoading(null);
    }
  };

  const incrementLimit = async () => {
    const newCount = await incrementClientCountInDB();
    setUserData(prev => prev ? { ...prev, clientCount: newCount } : null);
  };

  const hasMutuelle = mutuelle.personnes.length > 0 || mutuelle.organisme !== "";
  const hasOrdonnance = ordonnance.nomORL !== "" || ordonnance.nomPatient !== "" || ordonnance.oreilleDroite.hz1000 !== "";

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
  }, [ordonnance.nomPatient, ordonnance.prenomPatient, mutuelle.personnes, hasMutuelle, hasOrdonnance]);

  const handleFile = useCallback(async (file: File, type: DocType) => {
    if (isLimitReached) {
      alert("Limite atteinte ! Passez à la version PRO pour continuer.");
      return;
    }
    setDocState((prev) => ({ ...prev, [type]: { loading: true, progress: 0, fileName: file.name } }));
    try {
      const text = await processDocument(file, (progress) => {
        setDocState((prev) => ({ ...prev, [type]: { ...prev[type], progress } }));
      });
      setRawText((prev) => ({ ...prev, [type]: text }));
      if (type === "mutuelle") setMutuelle(parseMutuelle(text));
      else setOrdonnance(parseOrdonnance(text));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'analyse.");
    } finally {
      setDocState((prev) => ({ ...prev, [type]: { ...prev[type], loading: false, progress: 100 } }));
    }
  }, [isLimitReached]);

  const copyData = async () => {
    if (isLimitReached) return;
    try {
      const payload = await generateAutofillPayload({
        mutuelle,
        ordonnance,
        syncToken: userData?.syncToken ?? undefined,
      });
      await navigator.clipboard.writeText(payload);
      setIsDataCopied(true);
      await incrementLimit();
      setTimeout(() => setIsDataCopied(false), 3000);
    } catch (err) {
      console.error("Erreur lors de la copie ou de l'incrémentation:", err);
    }
  };

  const canValidate = hasMutuelle || hasOrdonnance;

  return (
    <main className="bg-slate-50 text-slate-900 pb-10">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 items-stretch">
          <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center relative overflow-hidden">
            <div>
              <h1 className="text-3xl font-black mb-2">Tableau de bord</h1>
              <p className="text-slate-500 font-medium">Prêt pour votre prochain client ?</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-3">
               <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Votre Usage</p>
                  <p className="text-2xl font-black">
                    {userData?.clientCount || 0}
                    {!userData?.isPro && <span className="text-slate-300 mx-1">/</span>}
                    {!userData?.isPro && <span>{FREE_LIMIT}</span>}
                    <span className="text-sm text-slate-400 font-bold ml-1">scans</span>
                  </p>
               </div>
               {userData?.isPro && (
                 <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter mb-1">
                   {userData.plan === "DUO" ? "DUO" : "SOLO"}
                 </span>
               )}
            </div>
            {!userData?.isPro && (
              <>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${isLimitReached ? 'bg-red-500' : 'bg-blue-600'}`}
                    style={{ width: `${((userData?.clientCount || 0) / FREE_LIMIT) * 100}%` }}
                  ></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Passer au PRO</p>
                  <button
                    onClick={() => handleCheckout("SOLO")}
                    disabled={isStripeLoading !== null}
                    className="w-full px-3 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-black hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isStripeLoading === "SOLO" ? "Chargement..." : "Solo — 32,90€/mois"}
                  </button>
                  <button
                    onClick={() => handleCheckout("DUO")}
                    disabled={isStripeLoading !== null}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isStripeLoading === "DUO" ? "Chargement..." : "Duo — 49,90€/mois"}
                  </button>
                </div>
              </>
            )}
            {userData?.isPro && (
              <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-tight">Utilisation illimitée activée</p>
                  <button
                    onClick={async () => {
                      const { url } = await createPortalSession();
                      if (url) window.location.href = url;
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Factures
                  </button>
                </div>
                {userData.plan === "SOLO" && (
                  <button
                    onClick={async () => {
                      setIsStripeLoading("DUO");
                      try {
                        await upgradePlan("DUO");
                        await refreshData();
                      } catch (err: any) {
                        alert(err?.message || "Erreur lors de la montée en gamme.");
                      } finally {
                        setIsStripeLoading(null);
                      }
                    }}
                    disabled={isStripeLoading !== null}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-black hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    {isStripeLoading === "DUO" ? "Chargement..." : "Passer au Duo — 49,90€/mois"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(["mutuelle", "ordonnance"] as DocType[]).map((type) => (
                <div key={type} className={isLimitReached ? "opacity-40 grayscale pointer-events-none" : ""}>
                  <DropZone
                    label={type === "mutuelle" ? "Carte Mutuelle" : "Prescription ORL"}
                    icon={type === "mutuelle" ? "💳" : "🦻"}
                    onFile={(f) => handleFile(f, type)}
                    isLoading={docState[type].loading}
                    progress={docState[type].progress}
                    fileName={docState[type].fileName}
                  />
                </div>
              ))}
            </div>

            {(hasMutuelle || hasOrdonnance) && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
                <span className="text-lg mt-0.5 shrink-0">⚠️</span>
                <p className="text-xs font-semibold leading-relaxed">
                  <span className="font-black">Vérifiez et corrigez les données avant de les utiliser.</span>{" "}
                  La lecture automatique peut comporter des erreurs (mauvaise qualité de scan, mise en page complexe...).
                  AudiBot n&apos;est pas responsable en cas de saisie incorrecte.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                {hasMutuelle && <MutuelleForm data={mutuelle} onChange={setMutuelle} />}
              </div>
              <div className="space-y-6">
                {hasOrdonnance && <OrdonnanceForm data={ordonnance} onChange={setOrdonnance} />}
              </div>
            </div>

            {/* Debug : Texte Brut */}
            {(rawText.mutuelle || rawText.ordonnance) && (
              <div className="mt-4">
                <button 
                  onClick={() => setShowRaw(showRaw ? null : (rawText.mutuelle ? "mutuelle" : "ordonnance"))}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showRaw ? "✕ Masquer le texte brut" : "👁 Voir le texte brut extrait"}
                </button>
                {showRaw && (
                  <pre className="mt-2 p-4 bg-slate-100 rounded-xl text-[10px] font-mono text-slate-600 overflow-x-auto whitespace-pre-wrap border border-slate-200">
                    {rawText[showRaw]}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area (Validation & Installation) */}
          <div className="space-y-6">
            <BookmarkletInstallButton />
            
            {canValidate && (
              <div className="p-8 rounded-[32px] shadow-xl space-y-6 bg-blue-600 shadow-blue-200">
                <div className="text-left space-y-2">
                  <h2 className="text-xl font-bold text-white leading-tight">
                    Prêt pour le remplissage !
                  </h2>
                  <p className="text-blue-100 text-[10px] font-medium leading-relaxed">
                    Cliquez ci-dessous pour copier les données et les utiliser avec l'extension.
                  </p>
                </div>
                <div className="relative">
                  <button 
                    onClick={copyData} 
                    className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                      isDataCopied 
                      ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-900/20 scale-105" 
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    }`}
                  >
                    {isDataCopied ? <ShieldCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span className="font-bold">{isDataCopied ? "Copié !" : "Copier"}</span>
                  </button>
                  
                  {isDataCopied && (
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-green-600 text-[10px] font-black py-2 px-4 rounded-full shadow-xl whitespace-nowrap animate-bounce">
                      ✓ PRÊT À COLLER
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
