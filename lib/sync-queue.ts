"use client";

/**
 * Client-side helper to queue failed scan uploads for Background Sync.
 * When a scan upload fails (network error), call `queueScanForSync()`
 * to store it in IndexedDB. The service worker will replay it when
 * connectivity returns via the "sync-scans" event.
 *
 * Usage in a catch block:
 *   try { await fetch("/api/scan/relay", opts); }
 *   catch { await queueScanForSync("/api/scan/relay", headers, body); }
 */

const DB_NAME = "audibot-sync";
const STORE_NAME = "audibot-scan-queue";

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function queueScanForSync(
  url: string,
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  try {
    const db = await openSyncDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({
      id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url,
      headers,
      body,
      createdAt: Date.now(),
    });

    /* Ask the service worker to retry when online */
    const reg = await navigator.serviceWorker?.ready;
    if (reg && "sync" in reg) {
      await (reg as unknown as { sync: { register: (tag: string) => Promise<void> } })
        .sync.register("sync-scans");
    }
    return true;
  } catch {
    return false;
  }
}
