"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle, XCircle, Loader2, ScanLine, ImageIcon } from "lucide-react";
import { parseMutuelle, parseOrdonnance } from "@/lib/parsers";

type DocType = "mutuelle" | "ordonnance" | "auto";
type Step = "init" | "ready" | "select_type" | "scanning" | "preview" | "processing" | "idle" | "done" | "error";

interface ScannedItem {
  index: number;
  status: "ok" | "error";
  label: string;
}

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

export default function BatchScanPage({ params }: { params: Promise<{ batchId: string }> }) {
  const [step, setStep] = useState<Step>("init");
  const [error, setError] = useState<string | null>(null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [keyBase64, setKeyBase64] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [docType, setDocType] = useState<DocType>("auto");
  const [quality, setQuality] = useState({ brightness: 0, contrast: 0 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const [sendEnabled, setSendEnabled] = useState(false);

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
    params.then(({ batchId: bid }) => {
      setBatchId(bid);
      const hash = window.location.hash.replace("#", "");
      if (!hash) { setError("QR code invalide — clé manquante."); setStep("error"); return; }
      setKeyBase64(hash);
      setStep("ready");
    });
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, [params]);

  /* Attach stream to <video> */
  useEffect(() => {
    if ((step === "scanning" || step === "idle" || step === "processing") && streamRef.current && videoRef.current) {
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

  function cancelAutoCapture() {
    autoCaptureStartRef.current = null;
    setAutoCountdown(null);
    if (countdownIntervalRef.current) { clearInterval(countdownIntervalRef.current); countdownIntervalRef.current = null; }
  }

  async function startCamera() {
    if (streamRef.current) { setStep("scanning"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      setStep("scanning");
    } catch {
      setError("Impossible d'accéder à la caméra.");
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
      setStep("preview");
    } catch {
      setError("Impossible de lire l'image.");
      setStep("error");
    }
  }

  async function processAndSendBatch() {
    if (!capturedFileRef.current || !keyBase64 || !batchId) return;
    setStep("processing");
    try {
      const { processDocument } = await import("@/lib/ocr");
      const ocrResult = await processDocument(capturedFileRef.current);
      const rawText = ocrResult.text;

      const mutuelle = parseMutuelle(rawText);
      const ordonnance = parseOrdonnance(rawText);
      const payload = { mutuelle, ordonnance, docType };

      const encryptedBlob = await encryptPayload(payload, keyBase64);

      let syncToken: string | null = null;
      try {
        const authRaw = localStorage.getItem("optibot_auth");
        if (authRaw) syncToken = JSON.parse(authRaw)?.syncToken ?? null;
      } catch { /* */ }
      if (!syncToken) {
        setError("Connectez-vous sur optibot.fr depuis ce téléphone pour associer votre compte.");
        setStep("error");
        return;
      }

      const res = await fetch("/api/scan/batch/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, blob: encryptedBlob, syncToken, order: scannedItems.length }),
      });
      if (!res.ok) {
        const { error: e } = await res.json() as { error: string };
        throw new Error(e ?? "Erreur serveur");
      }

      const label =
        mutuelle.organisme ||
        mutuelle.nom ||
        (ordonnance.nomPatient ? `Ordo. ${ordonnance.nomPatient}` : `Scan #${scannedItems.length + 1}`);

      setScannedItems((prev) => [...prev, { index: prev.length, status: "ok", label }]);
      setPreviewUrl(null);
      capturedFileRef.current = null;
      setStep("idle");
    } catch (err) {
      setScannedItems((prev) => [
        ...prev,
        { index: prev.length, status: "error", label: `Erreur: ${err instanceof Error ? err.message : "inconnue"}` },
      ]);
      setPreviewUrl(null);
      capturedFileRef.current = null;
      setStep("idle");
    }
  }

  async function finishBatch() {
    if (!batchId) return;
    let syncToken: string | null = null;
    try {
      const authRaw = localStorage.getItem("optibot_auth");
      if (authRaw) syncToken = JSON.parse(authRaw)?.syncToken ?? null;
    } catch { /* */ }
    if (syncToken) {
      await fetch("/api/scan/batch/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, syncToken }),
      });
    }
    stopCamera();
    setStep("done");
  }

  const qualityColor = quality.brightness < 50 ? "#ef4444" : quality.brightness > 80 && quality.contrast > 30 ? "#22c55e" : "#f97316";
  const qualityText = quality.brightness < 50 ? "⚠️ Trop sombre — ajoutez de la lumière" : quality.brightness > 80 && quality.contrast > 30 ? "✅ Prêt à capturer" : "📷 Cadrez votre document";
  const qualityTextClass = quality.brightness < 50 ? "text-red-400" : quality.brightness > 80 && quality.contrast > 30 ? "text-green-400" : "text-orange-400";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <ScanLine className="w-7 h-7 text-blue-400" />
          <div>
            <h1 className="text-xl font-black">Scanner en lot</h1>
            <p className="text-xs text-slate-400 font-medium">Scannez plusieurs cartes à la suite</p>
          </div>
        </div>

        {step === "init" && (
          <div className="flex items-center gap-3 py-8">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-sm font-bold text-slate-400">Initialisation...</span>
          </div>
        )}

        {step === "ready" && (
          <div className="text-center">
            <p className="text-sm text-slate-400 font-medium mb-6">
              Caméra prête. Vous pourrez scanner jusqu&apos;à 20 cartes mutuelle ou ordonnances.
            </p>
            <button
              onClick={() => setStep("select_type")}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl text-lg flex items-center justify-center gap-3"
            >
              <Camera className="w-6 h-6" />
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
                onClick={processAndSendBatch}
                disabled={!sendEnabled}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ Envoyer
              </button>
            </div>
            {!sendEnabled && <p className="text-xs text-slate-500 mt-2">Vérifiez la netteté...</p>}
          </div>
        )}

        {(step === "scanning" || step === "idle" || step === "processing") && (
          <>
            <div className="relative rounded-2xl overflow-hidden bg-black mb-4">
              <video ref={videoRef} autoPlay playsInline muted className="w-full" />

              {/* Guide rectangle — scanning only */}
              {step === "scanning" && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div style={{ width: "85%", aspectRatio: "1.586", border: `3px solid ${qualityColor}`, borderRadius: "8px", transition: "border-color 0.3s" }} />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-black/60 ${qualityTextClass}`}>
                      {qualityText}
                    </span>
                  </div>
                  {autoCountdown === 0 && (
                    <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                      <span className="text-sm font-black text-green-400 bg-black/60 px-4 py-1.5 rounded-full animate-pulse">
                        ✅ Document cadré — appuyez pour capturer
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Processing overlay */}
              {step === "processing" && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                </div>
              )}

              {/* Idle overlay — scan success */}
              {step === "idle" && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                  <p className="text-lg font-black text-green-400">Document scanné !</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep("scanning")}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm"
                    >
                      Scanner le suivant
                    </button>
                    <button
                      onClick={finishBatch}
                      className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-sm"
                    >
                      Terminer
                    </button>
                  </div>
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />

            {step === "scanning" && (
              <div className="flex gap-3 mb-4">
                <button
                  onClick={captureFrame}
                  className={`flex-1 py-3 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                    autoCountdown === 0 ? "bg-green-500" : "bg-blue-600"
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  {autoCountdown === 0 ? "✅ Prêt — Capturer !" : "📸 Capturer"}
                </button>
                <button
                  onClick={finishBatch}
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl"
                >
                  Terminer
                </button>
              </div>
            )}

            {scannedItems.length > 0 && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
                  {scannedItems.length} scan{scannedItems.length > 1 ? "s" : ""} effectué{scannedItems.length > 1 ? "s" : ""}
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {scannedItems.map((item) => (
                    <div key={item.index} className="flex items-center gap-2 text-sm">
                      {item.status === "ok" ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className={`font-medium truncate ${item.status === "ok" ? "text-slate-300" : "text-red-400"}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-black mb-2">Lot terminé !</h2>
            <p className="text-slate-400 text-sm font-medium mb-2">
              {scannedItems.filter((i) => i.status === "ok").length} scan{scannedItems.filter((i) => i.status === "ok").length > 1 ? "s" : ""} envoyé{scannedItems.filter((i) => i.status === "ok").length > 1 ? "s" : ""}
            </p>
            <p className="text-slate-500 text-xs">
              Retrouvez-les dans la file d&apos;attente sur votre ordinateur.
            </p>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-8">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-bold mb-4">{error}</p>
            <button
              onClick={() => setStep("ready")}
              className="w-full py-3 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Hidden file input for gallery */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryFile} />
      </div>
    </div>
  );
}
