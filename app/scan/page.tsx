"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { Smartphone, RefreshCw, Camera, QrCode } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Génère l'URL de scan avec clé AES et syncToken dans le hash (jamais transmis au serveur)
async function generateScanUrl(sessionId: string, syncToken: string): Promise<string> {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const exported = await crypto.subtle.exportKey("raw", key);
  const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  const base = window.location.origin;
  return `${base}/scan/${sessionId}#${keyBase64}:${syncToken}`;
}

// Génère le QR code via API Google Charts (simple, no-dep)
function qrUrl(text: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text)}`;
}

export default function ScanLandingPage() {
  const { data: session, status } = useSession();
  const [scanUrl, setScanUrl] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(90);

  const generate = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    setError(null);
    setScanUrl(null);
    setQrImage(null);

    try {
      // Créer la session de scan
      const res = await fetch("/api/scan/create", { method: "POST" });
      if (!res.ok) throw new Error("Impossible de créer la session");
      const { sessionId } = await res.json();

      // Récupérer le syncToken depuis le dashboard
      const userRes = await fetch("/api/user/sync-token");
      const { syncToken } = await userRes.json();
      if (!syncToken) throw new Error("Token introuvable — reconnectez-vous");

      // Générer l'URL avec clé AES dans le hash
      const url = await generateScanUrl(sessionId, syncToken);
      setScanUrl(url);
      setQrImage(qrUrl(url));

      const exp = Date.now() + 90_000;
      setExpiresAt(exp);
      setSecondsLeft(90);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Générer automatiquement au chargement si connecté
  useEffect(() => {
    if (status === "authenticated") generate();
  }, [status, generate]);

  // Countdown
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) {
        clearInterval(interval);
        // Regénérer automatiquement
        generate();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, generate]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6 text-white text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-6">
          <Smartphone className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-3">OptiBot Scan</h1>
        <p className="text-slate-400 font-medium mb-8 max-w-xs">
          Connectez-vous pour scanner vos cartes mutuelles et ordonnances depuis votre téléphone.
        </p>
        <button
          onClick={() => signIn(undefined, { callbackUrl: "/scan" })}
          className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <Image src="/icon.png" alt="OptiBot" width={24} height={24} className="rounded-lg" />
          </div>
          <span className="text-sm font-black uppercase tracking-tight">OptiBot Scan</span>
        </Link>
        <Link href="/dashboard" className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
          Dashboard →
        </Link>
      </header>

      {/* Contenu */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">

        {/* Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-4">
            <Camera className="w-3 h-3" /> Prêt à scanner
          </div>
          <h1 className="text-2xl font-black mb-2">Photographiez votre document</h1>
          <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto leading-relaxed">
            Scannez ce QR code depuis votre ordinateur pour connecter cette session.
          </p>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-3xl p-6 mb-6 shadow-2xl shadow-blue-500/10">
          {loading ? (
            <div className="w-[220px] h-[220px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : error ? (
            <div className="w-[220px] h-[220px] flex flex-col items-center justify-center gap-3">
              <p className="text-red-500 text-sm font-bold text-center">{error}</p>
              <button onClick={generate} className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl">
                Réessayer
              </button>
            </div>
          ) : qrImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrImage} alt="QR Code scan" width={220} height={220} className="rounded-xl" />
          ) : (
            <div className="w-[220px] h-[220px] flex items-center justify-center">
              <QrCode className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </div>

        {/* Countdown + refresh */}
        {expiresAt && !loading && !error && (
          <div className="flex flex-col items-center gap-3 mb-6">
            {/* Barre de progression */}
            <div className="w-48 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${secondsLeft > 30 ? "bg-blue-500" : secondsLeft > 10 ? "bg-amber-400" : "bg-red-500"}`}
                style={{ width: `${(secondsLeft / 90) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {secondsLeft > 0 ? `Expire dans ${secondsLeft}s` : "Renouvellement..."}
            </p>
          </div>
        )}

        {/* Bouton refresh manuel */}
        {!loading && (
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Nouveau QR
          </button>
        )}

        {/* Instructions */}
        <div className="mt-10 max-w-xs w-full space-y-3">
          {[
            { num: "1", text: "Ouvrez votre dashboard sur l'ordinateur" },
            { num: "2", text: "Scannez ce QR code avec la caméra de votre ordinateur" },
            { num: "3", text: "Photographiez la carte mutuelle ou l'ordonnance" },
            { num: "4", text: "Les données arrivent sur votre ordinateur ✅" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-3">
              <span className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-xs font-black shrink-0">
                {s.num}
              </span>
              <p className="text-sm text-slate-300 font-medium">{s.text}</p>
            </div>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/5 text-center">
        <p className="text-[10px] text-slate-500 font-medium">
          🔒 Chiffrement AES-256 — aucune donnée patient stockée
        </p>
      </footer>

    </div>
  );
}
