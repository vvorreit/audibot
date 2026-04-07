import React from "react";
import { FileText, ShieldCheck, CreditCard, Camera, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface BilanDocScanProps {
  scanStep: "ask" | "consent" | "scan_mutuelle" | "scan_ordonnance" | "done" | null;
  setScanStep: (step: any) => void;
  accent: string;
  setShowDocScreen: (show: boolean) => void;
  scanPreview: string | null;
  scanLoading: boolean;
  scanMsg: { type: "success" | "warning"; text: string } | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onAnalyze: (type: "mutuelle" | "ordonnance") => void;
  onSkip: () => void;
}

export default function BilanDocScan({
  scanStep, setScanStep, accent, setShowDocScreen,
  scanPreview, scanLoading, scanMsg,
  onFileChange, onReset, onAnalyze, onSkip
}: BilanDocScanProps) {
  const ScanButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} className="w-full text-left px-5 py-5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.98] min-h-[72px] flex items-center gap-4">
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-6">
        {scanStep === null && (
          <>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: accent + "15" }}>
                <FileText className="w-8 h-8" style={{ color: accent }} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Vos documents</h2>
              <p className="text-slate-500 text-base">Avez-vous votre carte mutuelle ou ordonnance avec vous ?</p>
            </div>
            <div className="space-y-3">
              <ScanButton onClick={() => setScanStep("consent")}>
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-base font-bold text-slate-900">Oui, je les ai</div>
                  <div className="text-sm text-slate-500">Scan automatique en 10 secondes</div>
                </div>
              </ScanButton>
              <ScanButton onClick={() => setShowDocScreen(false)}>
                <span className="text-2xl">✏️</span>
                <div>
                  <div className="text-base font-bold text-slate-900">Non, je réponds manuellement</div>
                  <div className="text-sm text-slate-500">Quelques questions simples</div>
                </div>
              </ScanButton>
            </div>
          </>
        )}

        {scanStep === "consent" && (
          <>
            <div className="text-center space-y-3">
              <ShieldCheck className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-black text-slate-900">Vos données sont protégées</h2>
              <p className="text-slate-500 text-base leading-relaxed">
                Vos documents sont lus directement sur votre téléphone. Aucune donnée de santé n&apos;est envoyée sur nos serveurs — uniquement transmises de façon chiffrée à votre audioprothésiste.
              </p>
            </div>
            <button onClick={() => setScanStep("scan_mutuelle")} className="w-full text-white text-lg font-black py-4 rounded-2xl transition-all hover:opacity-90 active:scale-95 min-h-[56px]" style={{ backgroundColor: accent }}>
              J&apos;accepte et je continue
            </button>
            <button onClick={() => setShowDocScreen(false)} className="w-full text-slate-500 font-bold text-base py-3 hover:text-slate-700">
              Répondre manuellement
            </button>
          </>
        )}

        {(scanStep === "scan_mutuelle" || scanStep === "scan_ordonnance") && (() => {
          const isMutuelle = scanStep === "scan_mutuelle";
          return (
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: accent + "15" }}>
                  {isMutuelle ? <CreditCard className="w-7 h-7" style={{ color: accent }} /> : <FileText className="w-7 h-7" style={{ color: accent }} />}
                </div>
                <h2 className="text-xl font-black text-slate-900">{isMutuelle ? "Carte mutuelle" : "Ordonnance"}</h2>
                <p className="text-slate-500 text-sm">Optionnel — photographiez-la pour qu&apos;on la lise automatiquement</p>
              </div>

              {!scanPreview && !scanLoading && !scanMsg && (
                <div className="space-y-3">
                  <label className="block cursor-pointer">
                    <div className="w-full min-h-[56px] text-white text-lg font-black rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 py-4 transition-all" style={{ backgroundColor: accent }}>
                      <Camera className="w-5 h-5" /> Photographier
                    </div>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />
                  </label>
                  <button onClick={onSkip} className="w-full text-slate-500 font-bold text-base py-3 hover:text-slate-700">
                    Passer cette étape →
                  </button>
                </div>
              )}

              {scanPreview && !scanLoading && !scanMsg && (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={scanPreview} alt="Aperçu" className="w-full rounded-2xl border border-slate-200" />
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={onReset} className="py-3 border-2 border-slate-200 rounded-2xl text-slate-700 font-bold text-sm hover:bg-slate-50">Reprendre</button>
                    <button onClick={() => onAnalyze(isMutuelle ? "mutuelle" : "ordonnance")} className="py-3 rounded-2xl text-white font-bold text-sm" style={{ backgroundColor: accent }}>
                      Analyser ✓
                    </button>
                  </div>
                </div>
              )}

              {scanLoading && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-10 h-10 animate-spin" style={{ color: accent }} />
                  <p className="text-slate-700 font-bold text-base">Analyse en cours...</p>
                </div>
              )}

              {scanMsg && (
                <div className={`flex items-center gap-3 justify-center text-base font-bold py-6 ${scanMsg.type === "success" ? "text-green-600" : "text-amber-600"}`}>
                  {scanMsg.type === "success" ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                  {scanMsg.text}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
