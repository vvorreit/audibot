"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for /dashboard pages.
 * Enables stale-while-revalidate caching and offline support.
 */
export default function DashboardPWAHead() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let intervalId: ReturnType<typeof setInterval>;

    navigator.serviceWorker
      .register("/sw-dashboard.js", { scope: "/dashboard" })
      .then((reg) => {
        intervalId = setInterval(() => reg.update(), 60_000);
      })
      .catch((err) => console.warn("[SW-Dashboard] Registration failed:", err));

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
