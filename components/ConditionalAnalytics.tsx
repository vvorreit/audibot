"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

export default function ConditionalAnalytics({ gaId }: { gaId: string }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Vérifie le consentement existant au chargement
    if (localStorage.getItem("optibot_cookie_consent") === "accepted") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabled(true);
    }
    // Écoute le consentement donné via le bandeau
    const handler = () => setEnabled(true);
    window.addEventListener("optibot_consent_accepted", handler);
    return () => window.removeEventListener("optibot_consent_accepted", handler);
  }, []);

  if (!enabled) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
