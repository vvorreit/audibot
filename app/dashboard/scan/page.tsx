"use client";

import { useState, useEffect, useRef } from "react";
import { Smartphone, QrCode, CheckCircle, XCircle, Loader2 } from "lucide-react";
import BatchQueuePanel from "@/components/BatchQueuePanel";

type ScanState = "idle" | "loading" | "waiting" | "success" | "error" | "timeout";

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function decryptBlob(blob: string, keyBase64: string): Promise<unknown> {
  const combinedRaw = base64ToUint8Array(blob);
  const combined = combinedRaw.buffer.slice(combinedRaw.byteOffset, combinedRaw.byteOffset + combinedRaw.byteLength) as ArrayBuffer;
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const rawKeyArr = base64ToUint8Array(keyBase64);
  const rawKey = rawKeyArr.buffer.slice(rawKeyArr.byteOffset, rawKeyArr.byteOffset + rawKeyArr.byteLength) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(iv) }, cryptoKey, data);
  return JSON.parse(new TextDecoder().decode(decrypted));
}

export default function ScanPage() {
  const [state, setState] = useState<ScanState>("idle");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const keyBase64Ref = useRef<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function startScan() {
    setState("loading");
    setError(null);
    setQrDataUrl(null);

    try {
      // 1. Créer la session côté serveur
      const res = await fetch("/api/scan/create", { method: "POST" });
      if (!res.ok) throw new Error("Impossible de créer la session");
      const { sessionId } = await res.json() as { sessionId: string };
      sessionIdRef.current = sessionId;

      // 2. Générer clé AES aléatoire (ne quitte JAMAIS ce navigateur)
      const rawKey = crypto.getRandomValues(new Uint8Array(32));
      const keyB64 = uint8ArrayToBase64(rawKey);
      keyBase64Ref.current = keyB64;

      // 3. Récupérer le syncToken de l'user connecté
      const authRes = await fetch("/api/user/sync-token");
      if (!authRes.ok) throw new Error("Impossible de récupérer le token de session");
      const { syncToken } = await authRes.json() as { syncToken: string };

      // 4. Construire URL mobile — clé AES + syncToken dans le #hash (jamais envoyés au serveur)
      const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const url = `${base}/scan/${sessionId}#${keyB64}:${syncToken}`;

      // 5. Générer QR code
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: "#1e293b", light: "#ffffff" } });
      setQrDataUrl(dataUrl);
      setState("waiting");

      // 6. Écouter SSE
      const es = new EventSource(`/api/scan/poll/${sessionId}`);
      eventSourceRef.current = es;

      es.onmessage = async (event) => {
        const data = event.data as string;
        if (data === "ping") return;
        if (data === "expired") {
          es.close();
          setState("timeout");
          return;
        }

        // Blob reçu — déchiffrer localement
        try {
          const payload = await decryptBlob(data, keyBase64Ref.current!);
          es.close();
          setState("success");
          // Injecter dans le dashboard
          window.dispatchEvent(new CustomEvent("optibot_scan_received", { detail: payload }));
          // Fermer après 2s
          setTimeout(() => setState("idle"), 2000);
        } catch {
          es.close();
          setError("Erreur de déchiffrement");
          setState("error");
        }
      };

      es.onerror = () => {
        es.close();
        if (state !== "success") setState("error");
      };

      // Timeout 90s
      timeoutRef.current = setTimeout(() => {
        es.close();
        setState("timeout");
      }, 90_000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setState("error");
    }
  }

  function reset() {
    eventSourceRef.current?.close();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState("idle");
    setQrDataUrl(null);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
    <div className="bg-white rounded-card border border-slate-100 shadow-sm p-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Smartphone className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-black text-slate-900">Scanner depuis votre téléphone</h2>
      </div>

      {state === "idle" && (
        <>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Photographiez une ordonnance ou une carte mutuelle depuis n&apos;importe quel smartphone (iPhone, Android...) — les données arrivent chiffrées directement dans le formulaire.
          </p>
          <button
            onClick={startScan}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <QrCode className="w-5 h-5" />
            Générer le QR code
          </button>
        </>
      )}

      {state === "loading" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-500">Génération du QR code...</p>
        </div>
      )}

      {state === "waiting" && qrDataUrl && (
        <>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Scannez ce QR code avec votre smartphone (iPhone, Android...)
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="QR code scan mobile" className="mx-auto rounded-2xl border border-slate-100" width={220} height={220} />
          <div className="flex items-center justify-center gap-2 mt-4">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
            <p className="text-xs font-bold text-slate-400">En attente du scan... (90s)</p>
          </div>
          <button onClick={reset} className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline">
            Annuler
          </button>
        </>
      )}

      {state === "success" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
          <p className="text-sm font-bold text-green-600">Données reçues !</p>
          <p className="text-xs text-slate-400">Le formulaire a été rempli automatiquement.</p>
        </div>
      )}

      {(state === "error" || state === "timeout") && (
        <div className="flex flex-col items-center gap-3 py-4">
          <XCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm font-bold text-red-600">
            {state === "timeout" ? "Délai expiré (90s)" : (error ?? "Erreur")}
          </p>
          <button onClick={reset} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
            Réessayer
          </button>
        </div>
      )}
    </div>
    <BatchQueuePanel />
    </div>
  );
}
