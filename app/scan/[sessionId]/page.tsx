"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle, XCircle, Loader2, ImageIcon } from "lucide-react";
import { parseMutuelle, parseOrdonnance } from "@/lib/parsers";

type DocType = "mutuelle" | "ordonnance" | "auto";
type Step = "init" | "ready" | "select_type" | "scanning" | "preview" | "sending" | "done" | "error";

/* ── Crypto helpers ──────────────────────────────────────────────── */

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
  combined.set(iv);
  combined.set(new Uint8Array(encryptedBuf), iv.length);
  let binary = "";
  for (let i = 0; i < combined.length; i++) binary += String.fromCharCode(combined[i]);
  return btoa(binary);
}

/* ── Image analysis ──────────────────────────────────────────────── */

function analyzeFrame(canvas: HTMLCanvasElement): { brightness: number; contrast: number } {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { brightness: 0, contrast: 0 };
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let sum = 0;
  let sumSq = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sum += lum;
    sumSq += lum * lum;
  }
  const mean = sum / n;
  const variance = sumSq / n - mean * mean;
  return { brightness: mean, contrast: Math.sqrt(variance) };
}

function enhanceCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const enhanced = Math.min(255, Math.max(0, (gray - 128) * 1.5 + 128));
    d[i] = d[i + 1] = d[i + 2] = enhanced;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/* ── Torch ───────────────────────────────────────────────────────── */

async function setTorch(stream: MediaStream, enable: boolean): Promise<void> {
  const track = stream.getVideoTracks()[0];
  if (!track) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const caps = (track as any).getCapabilities?.() as Record<string, unknown> | undefined;
    if (!caps?.torch) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await track.applyConstraints({ advanced: [{ torch: enable } as any] });
  } catch { /* torch not supported */ }
}

/* ── Component ───────────────────────────────────────────────────── */

export default function MobileScanPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [step, setStep] = useState<Step>("init");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [keyBase64, setKeyBase64] = useState<string | null>(null);
  const [syncTokenFromHash, setSyncTokenFromHash] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>("auto");
  const [quality, setQuality] = useState({ brightness: 0, contrast: 0 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const [sendEnabled, setSendEnabled] = useState(false);
  const [donePhase, setDonePhase] = useState<"processing" | "advice">("processing");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const capturedFileRef = useRef<File | null>(null);
  const qualityIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoCaptureStartRef = useRef<number | null>(null);
  const torchActiveRef = useRef(false);
  const torchCountRef = useRef(0);
  const captureFrameRef = useRef<() => void>(() => {});

  /* PWA meta tags */
  useEffect(() => {
    const metas: [string, string][] = [
      ["apple-mobile-web-app-capable", "yes"],
      ["apple-mobile-web-app-title", "OptiBot Scan"],
      ["theme-color", "#2563eb"],
    ];
    for (const [name, content] of metas) {
      if (!document.querySelector(`meta[name="${name}"]`)) {
        const el = document.createElement("meta");
        el.name = name;
        el.content = content;
        document.head.appendChild(el);
      }
    }
    if (!document.querySelector('link[rel="manifest"][href="/manifest-scan.json"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest-scan.json";
      document.head.appendChild(link);
    }
  }, []);

  /* Init: parse params + hash */
  useEffect(() => {
    params.then(({ sessionId: sid }) => {
      setSessionId(sid);
      const hash = window.location.hash.replace("#", "");
      if (!hash) { setError("QR code invalide — clé manquante."); setStep("error"); return; }
      const colonIdx = hash.indexOf(":");
      if (colonIdx === -1) { setError("QR code invalide — format incorrect."); setStep("error"); return; }
      setKeyBase64(hash.slice(0, colonIdx));
      setSyncTokenFromHash(hash.slice(colonIdx + 1));
      setStep("ready");
    });
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [params]);

  /* Attach stream to <video> */
  useEffect(() => {
    if (step === "scanning" && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [step]);

  /* Quality analysis during scanning */
  useEffect(() => {
    if (step !== "scanning") return;
    const ac = document.createElement("canvas");
    ac.width = 160;
    ac.height = 120;

    qualityIntervalRef.current = setInterval(() => {
      if (!videoRef.current || videoRef.current.readyState < 2) return;
      const ctx = ac.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoRef.current, 0, 0, 160, 120);
      const q = analyzeFrame(ac);
      setQuality(q);

      torchCountRef.current++;
      if (torchCountRef.current % 4 === 0 && streamRef.current) {
        if (q.brightness < 60 && !torchActiveRef.current) {
          setTorch(streamRef.current, true);
          torchActiveRef.current = true;
        } else if (q.brightness > 80 && torchActiveRef.current) {
          setTorch(streamRef.current, false);
          torchActiveRef.current = false;
        }
      }

      // Capture manuelle uniquement — pas de capture automatique
      const isReady = q.brightness > 80 && q.contrast > 30;
      setAutoCountdown(isReady ? 0 : -1); // -1 = pas prêt, 0 = prêt (bouton vert)
    }, 500);

    return () => {
      if (qualityIntervalRef.current) { clearInterval(qualityIntervalRef.current); qualityIntervalRef.current = null; }
      cancelAutoCapture();
    };
  }, [step]);

  /* Preview: 2s delay before send */
  useEffect(() => {
    if (step !== "preview") return;
    setSendEnabled(false);
    const t = setTimeout(() => setSendEnabled(true), 2000);
    return () => clearTimeout(t);
  }, [step]);

  /* Done: advice after 3s */
  useEffect(() => {
    if (step !== "done") return;
    setDonePhase("processing");
    const t = setTimeout(() => setDonePhase("advice"), 3000);
    return () => clearTimeout(t);
  }, [step]);

  function cancelAutoCapture() {
    autoCaptureStartRef.current = null;
    setAutoCountdown(null);
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      setStep("scanning");
    } catch {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setStep("error");
    }
  }

  function stopCamera() {
    if (torchActiveRef.current && streamRef.current) {
      setTorch(streamRef.current, false);
      torchActiveRef.current = false;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function captureFrame() {
    if (!videoRef.current || !canvasRef.current) return;
    cancelAutoCapture();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const SCALE = 2;
    canvas.width = video.videoWidth * SCALE;
    canvas.height = video.videoHeight * SCALE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    enhanceCanvas(canvas);
    setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    canvas.toBlob((b) => {
      if (b) capturedFileRef.current = new File([b], "scan.jpg", { type: "image/jpeg" });
    }, "image/jpeg", 0.9);
    setStep("preview");
  }
  captureFrameRef.current = captureFrame;

  async function handleGalleryFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const SCALE = bitmap.width < 1920 ? 2 : 1;
      canvas.width = bitmap.width * SCALE;
      canvas.height = bitmap.height * SCALE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      enhanceCanvas(canvas);
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas vide"))), "image/jpeg", 0.9)
      );
      capturedFileRef.current = new File([blob], "gallery.jpg", { type: "image/jpeg" });
      stopCamera();
      setStep("preview");
    } catch {
      setError("Impossible de lire l'image.");
      setStep("error");
    }
  }

  async function processAndSend() {
    if (!capturedFileRef.current || !keyBase64 || !sessionId) return;
    setStep("sending");
    stopCamera();
    try {
      const { processDocument } = await import("@/lib/ocr");
      const ocrResult = await processDocument(capturedFileRef.current);
      const rawText = ocrResult.text;
      setOcrText(rawText);

      const mutuelle = parseMutuelle(rawText);
      const ordonnance = parseOrdonnance(rawText);
      const payload = { mutuelle, ordonnance, docType };

      const encryptedBlob = await encryptPayload(payload, keyBase64);
      const syncToken = syncTokenFromHash;
      if (!syncToken) {
        setError("QR code invalide — token manquant. Régénérez le QR depuis le dashboard.");
        setStep("error");
        return;
      }

      const res = await fetch("/api/scan/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, blob: encryptedBlob, syncToken }),
      });
      if (!res.ok) {
        const { error: e } = await res.json() as { error: string };
        throw new Error(e ?? "Erreur serveur");
      }
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur OCR ou envoi");
      setStep("error");
    }
  }

  const qualityColor = quality.brightness < 50 ? "#ef4444" : quality.brightness > 80 && quality.contrast > 30 ? "#22c55e" : "#f97316";
  const qualityText = quality.brightness < 50 ? "⚠️ Trop sombre — ajoutez de la lumière" : quality.brightness > 80 && quality.contrast > 30 ? "✅ Prêt à capturer" : "📷 Cadrez votre document";
  const qualityTextClass = quality.brightness < 50 ? "text-red-400" : quality.brightness > 80 && quality.contrast > 30 ? "text-green-400" : "text-orange-400";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">O</div>
          <span className="text-xl font-black tracking-tight">OptiBot</span>
        </div>

        {step === "init" && (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-slate-400 font-medium">Chargement...</p>
          </div>
        )}

        {step === "ready" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-blue-400" />
            </div>
            <h1 className="text-2xl font-black mb-2">Scanner un document</h1>
            <p className="text-slate-400 font-medium text-sm mb-8">
              Photographiez une ordonnance ou une carte mutuelle. Les données seront envoyées chiffrées sur votre ordinateur — aucune info ne reste sur ce téléphone.
            </p>
            <button
              onClick={() => setStep("select_type")}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all text-lg"
            >
              Continuer
            </button>
          </div>
        )}

        {step === "select_type" && (
          <div className="text-center">
            <h2 className="text-xl font-black mb-6">Que souhaitez-vous scanner ?</h2>
            <div className="space-y-3 mb-8">
              {([
                { value: "mutuelle" as DocType, icon: "💳", label: "Carte mutuelle" },
                { value: "ordonnance" as DocType, icon: "👁️", label: "Ordonnance" },
                { value: "auto" as DocType, icon: "🔍", label: "Détecter automatiquement" },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDocType(opt.value)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-left flex items-center gap-3 transition-all ${
                    docType === opt.value
                      ? "bg-blue-600 text-white ring-2 ring-blue-400"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <span className="text-xl">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <button
                onClick={startCamera}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Ouvrir la caméra
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 active:scale-95 transition-all text-lg flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-5 h-5" />
                Depuis la galerie
              </button>
            </div>
          </div>
        )}

        {step === "scanning" && (
          <div className="text-center">
            <div className="relative rounded-2xl overflow-hidden mb-4 bg-slate-900" style={{ aspectRatio: "3/4" }}>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline autoPlay muted />

              {/* Guide rectangle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div style={{ width: "85%", aspectRatio: "1.586", border: `3px solid ${qualityColor}`, borderRadius: "8px", transition: "border-color 0.3s" }} />
              </div>

              {/* Quality text */}
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-black/60 ${qualityTextClass}`}>
                  {qualityText}
                </span>
              </div>

              {/* Indicateur "Prêt" quand qualité suffisante */}
              {autoCountdown === 0 && (
                <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                  <span className="text-sm font-black text-green-400 bg-black/60 px-4 py-1.5 rounded-full animate-pulse">
                    ✅ Document cadré — appuyez pour capturer
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={captureFrame}
              className={`w-full py-4 text-white font-black rounded-2xl active:scale-95 transition-all text-lg ${
                autoCountdown === 0
                  ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/30"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {autoCountdown === 0 ? "✅ Prêt — Capturer !" : "📸 Capturer"}
            </button>
          </div>
        )}

        {step === "preview" && previewUrl && (
          <div className="text-center">
            <div className="rounded-2xl overflow-hidden mb-4 bg-slate-900">
              <img src={previewUrl} alt="Aperçu du document" className="w-full" />
            </div>
            <p className="text-slate-300 font-bold mb-4">Le document est-il net ?</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPreviewUrl(null);
                  capturedFileRef.current = null;
                  if (streamRef.current) setStep("scanning");
                  else startCamera();
                }}
                className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors"
              >
                🔄 Reprendre
              </button>
              <button
                onClick={processAndSend}
                disabled={!sendEnabled}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ Envoyer
              </button>
            </div>
            {!sendEnabled && <p className="text-xs text-slate-500 mt-2">Vérifiez la netteté...</p>}
          </div>
        )}

        {step === "sending" && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="font-bold text-lg mb-2">Analyse en cours...</p>
            <p className="text-slate-400 text-sm">OCR + chiffrement + envoi</p>
            {ocrText && (
              <div className="mt-4 bg-slate-900 rounded-xl p-3 text-left">
                <p className="text-2xs font-bold text-slate-500 uppercase tracking-widest mb-1">Texte détecté</p>
                <p className="text-xs text-slate-300 font-mono leading-relaxed line-clamp-4">{ocrText.slice(0, 200)}</p>
              </div>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            {donePhase === "processing" ? (
              <>
                <h1 className="text-2xl font-black mb-2 text-green-400">Envoyé !</h1>
                <p className="text-slate-400 font-medium text-sm">
                  Document envoyé — traitement en cours sur votre ordinateur
                </p>
                <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-slate-500" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-black mb-2 text-green-400">Envoyé !</h1>
                <p className="text-slate-400 font-medium text-sm">
                  Les données ont été transmises chiffrées à votre ordinateur. Le formulaire est rempli automatiquement.
                </p>
                <p className="text-xs text-slate-500 mt-4 bg-slate-900 rounded-xl p-3">
                  📊 Si les données n&apos;apparaissent pas sur votre ordinateur dans 10s, retentez avec plus de lumière.
                </p>
              </>
            )}
            <p className="text-xs text-slate-600 mt-6">Aucune donnée patient n&apos;a transité en clair.</p>
          </div>
        )}

        {step === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-xl font-black mb-2 text-red-400">Erreur</h1>
            <p className="text-slate-400 font-medium text-sm mb-6">{error ?? "Une erreur est survenue."}</p>
            <button
              onClick={() => setStep("ready")}
              className="w-full py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Hidden elements */}
        <canvas ref={canvasRef} className="hidden" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFile} />
      </div>
    </div>
  );
}
