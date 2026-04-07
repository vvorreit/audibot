"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for /scan pages.
 * The manifest is handled server-side in app/scan/layout.tsx (reads cookie for deviceToken).
 */
export default function ScanPWAHead() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let intervalId: ReturnType<typeof setInterval>;

    navigator.serviceWorker
      .register("/sw-scan.js", { scope: "/scan" })
      .then((reg) => {
        intervalId = setInterval(() => reg.update(), 60_000);
      })
      .catch((err) => console.warn("[SW] Registration failed:", err));

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
