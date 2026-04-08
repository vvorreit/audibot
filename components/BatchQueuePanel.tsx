"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  SkipForward,
  QrCode,
} from "lucide-react";

interface BatchItem {
  id: string;
  blob: string;
  status: string;
  orderIndex: number;
  processedAt: string | null;
  createdAt: string;
}

interface BatchInfo {
  id: string;
  status: string;
  itemCount: number;
  createdAt: string;
  expiresAt: string;
}

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
  const combined = combinedRaw.buffer.slice(
    combinedRaw.byteOffset,
    combinedRaw.byteOffset + combinedRaw.byteLength
  ) as ArrayBuffer;
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const rawKeyArr = base64ToUint8Array(keyBase64);
  const rawKey = rawKeyArr.buffer.slice(
    rawKeyArr.byteOffset,
    rawKeyArr.byteOffset + rawKeyArr.byteLength
  ) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, [
    "decrypt",
  ]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    cryptoKey,
    data
  );
  return JSON.parse(new TextDecoder().decode(decrypted));
}

export default function BatchQueuePanel() {
  const [batches, setBatches] = useState<
    { batch: BatchInfo; items: BatchItem[] }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [creatingBatch, setCreatingBatch] = useState(false);

  const loadBatches = useCallback(async () => {
    /* Lire les cles sauvegardees */
    const keysRaw = localStorage.getItem("audibot_batch_keys");
    if (!keysRaw) return;
    const keys: Record<string, string> = JSON.parse(keysRaw);
    const batchIds = Object.keys(keys);
    if (batchIds.length === 0) return;

    setLoading(true);
    const results: { batch: BatchInfo; items: BatchItem[] }[] = [];

    for (const bid of batchIds) {
      try {
        const res = await fetch(`/api/scan/batch/${bid}/items`);
        if (!res.ok) continue;
        const data = (await res.json()) as { batch: BatchInfo; items: BatchItem[] };
        /* Ne montrer que les batchs avec des items PENDING */
        const hasPending = data.items.some((i) => i.status === "PENDING");
        if (hasPending || data.batch.status === "OPEN") {
          results.push(data);
        } else {
          /* Batch entierement traite — nettoyer la cle */
          delete keys[bid];
          localStorage.setItem("audibot_batch_keys", JSON.stringify(keys));
        }
      } catch {
        /* batch pas accessible */
      }
    }

    setBatches(results);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  async function startBatchScan() {
    setCreatingBatch(true);
    try {
      const res = await fetch("/api/scan/batch/create", { method: "POST" });
      if (!res.ok) throw new Error("Erreur creation batch");
      const { batchId } = (await res.json()) as { batchId: string };

      const rawKey = crypto.getRandomValues(new Uint8Array(32));
      const keyB64 = uint8ArrayToBase64(rawKey);

      /* Sauvegarder la cle dans localStorage */
      const keysRaw = localStorage.getItem("audibot_batch_keys");
      const keys: Record<string, string> = keysRaw ? JSON.parse(keysRaw) : {};
      keys[batchId] = keyB64;
      localStorage.setItem("audibot_batch_keys", JSON.stringify(keys));

      const base = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      const url = `${base}/scan/batch/${batchId}#${keyB64}`;

      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: { dark: "#1e293b", light: "#ffffff" },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setCreatingBatch(false);
    }
  }

  async function processItem(batchId: string, item: BatchItem) {
    const keysRaw = localStorage.getItem("audibot_batch_keys");
    if (!keysRaw) return;
    const keys: Record<string, string> = JSON.parse(keysRaw);
    const key = keys[batchId];
    if (!key) return;

    setProcessing(item.id);
    try {
      const payload = await decryptBlob(item.blob, key);
      /* Injecter dans le dashboard */
      window.dispatchEvent(
        new CustomEvent("audibot_scan_received", { detail: payload })
      );

      /* Marquer comme traite */
      await fetch(`/api/scan/batch/${batchId}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PROCESSED" }),
      });

      loadBatches();
    } catch {
      alert("Erreur de dechiffrement — cle incorrecte ?");
    } finally {
      setProcessing(null);
    }
  }

  async function skipItem(batchId: string, itemId: string) {
    await fetch(`/api/scan/batch/${batchId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SKIPPED" }),
    });
    loadBatches();
  }

  const totalPending = batches.reduce(
    (s, b) => s + b.items.filter((i) => i.status === "PENDING").length,
    0
  );

  if (!qrDataUrl && totalPending === 0 && !loading) {
    return (
      <div className="bg-white rounded-card border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-5 h-5 text-violet-600" />
          <h3 className="text-sm font-black text-slate-700">Scanner en lot</h3>
        </div>
        <p className="text-xs text-slate-400 font-medium mb-4">
          Scannez plusieurs cartes mutuelle depuis votre telephone en fin de journee.
        </p>
        <button
          onClick={startBatchScan}
          disabled={creatingBatch}
          className="w-full py-3 bg-violet-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {creatingBatch ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <QrCode className="w-4 h-4" />
          )}
          Generer le QR code lot
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <Layers className="w-5 h-5 text-violet-600" />
        <h3 className="text-sm font-black text-slate-700">
          File d&apos;attente
          {totalPending > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-2xs font-black bg-violet-100 text-violet-700">
              {totalPending}
            </span>
          )}
        </h3>
        <div className="flex-1" />
        <button
          onClick={startBatchScan}
          disabled={creatingBatch}
          className="px-3 py-1.5 bg-violet-50 text-violet-600 font-bold rounded-lg text-2xs border border-violet-200 hover:bg-violet-100"
        >
          + Nouveau lot
        </button>
      </div>

      {qrDataUrl && (
        <div className="text-center mb-4 p-4 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 font-medium mb-3">
            Scannez ce QR code avec votre telephone
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code batch scan"
            className="mx-auto rounded-xl border border-slate-200"
            width={200}
            height={200}
          />
          <button
            onClick={() => {
              setQrDataUrl(null);
              loadBatches();
            }}
            className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Fermer
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />
          <span className="text-xs text-slate-400 font-bold">Chargement...</span>
        </div>
      ) : (
        batches.map((b) => {
          const pendingItems = b.items.filter((i) => i.status === "PENDING");
          if (pendingItems.length === 0) return null;
          return (
            <div key={b.batch.id} className="mb-4">
              <p className="text-2xs font-black text-slate-400 uppercase tracking-wider mb-2">
                Lot du{" "}
                {new Date(b.batch.createdAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                — {pendingItems.length}/{b.batch.itemCount} restant{pendingItems.length > 1 ? "s" : ""}
              </p>
              <div className="space-y-2">
                {pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                  >
                    <span className="text-xs font-bold text-slate-500">
                      #{item.orderIndex + 1}
                    </span>
                    <span className="flex-1 text-xs font-medium text-slate-600 truncate">
                      {new Date(item.createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      onClick={() => processItem(b.batch.id, item)}
                      disabled={processing === item.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-2xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processing === item.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      Traiter
                    </button>
                    <button
                      onClick={() => skipItem(b.batch.id, item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                      title="Ignorer"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
