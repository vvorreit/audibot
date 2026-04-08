"use client";

import { useState, useEffect } from "react";

export type FeatureName = "bilanAuditif" | "rapprochement" | "bankSync";

interface Features {
  bilanAuditif: boolean;
  rapprochement: boolean;
  bankSync: boolean;
}

const DEFAULT: Features = { bilanAuditif: false, rapprochement: false, bankSync: false };

/**
 * Hook client-side pour recuperer les features d'un super user.
 * ADMIN a toujours acces a tout (gere cote API).
 */
export function useFeatures() {
  const [features, setFeatures] = useState<Features>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/features")
      .then(r => r.json())
      .then((data: Partial<Features>) => setFeatures({ ...DEFAULT, ...data }))
      .catch(() => setFeatures(DEFAULT))
      .finally(() => setLoading(false));
  }, []);

  return { features, loading };
}

/**
 * Hook pour verifier l'acces a une feature specifique.
 * Retourne null pendant le chargement, puis true/false.
 */
export function useFeature(feature: FeatureName): boolean | null {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/user/features")
      .then(r => r.json())
      .then((data: Partial<Features>) => setHasAccess(data[feature] ?? false))
      .catch(() => setHasAccess(false));
  }, [feature]);

  return hasAccess;
}
