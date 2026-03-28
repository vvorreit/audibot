import { getBrand } from "./brand";

const IS_DEV = process.env.NODE_ENV === "development";

export function getCorsHeaders(origin?: string | null) {
  const brand = getBrand();
  const allowed =
    origin?.startsWith("chrome-extension://") ||
    origin?.includes("optibot.fr") ||
    origin?.includes("audibot.fr") ||
    (IS_DEV && origin?.includes("localhost"));
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : `https://${brand.domain}`,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/**
 * CORS ouverts pour les routes appelées depuis les portails mutuelles tiers.
 * Utilisé par : /api/bookmarklet/ping, /api/extension/parcours/save, /api/extension/log-injection
 * L'extension envoie ces requêtes depuis le contexte du portail (pas depuis optibot.fr).
 */
export function getPortalCorsHeaders(origin?: string | null) {
  // Autoriser toute origine pour ces routes spécifiques car elles viennent des portails mutuelles
  // La sécurité est assurée par le syncToken / rate limiting — pas par CORS
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
