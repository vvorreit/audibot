"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function ConditionalAnalytics({ gaId }: { gaId: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("audibot_cookie_consent") === "accepted") {
      setEnabled(true);
    }
    const handler = () => setEnabled(true);
    window.addEventListener("audibot_consent_accepted", handler);
    return () => window.removeEventListener("audibot_consent_accepted", handler);
  }, []);

  if (!enabled) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
