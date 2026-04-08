import { getBrand } from "./brand";

const IS_DEV = process.env.NODE_ENV === "development";

export function getCorsHeaders(origin?: string | null) {
  const brand = getBrand();
  const allowed =
    origin?.startsWith("chrome-extension://") ||
    origin?.includes("audibot.fr") ||
    (IS_DEV && origin?.includes("localhost"));
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : `https://${brand.domain}`,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

/**
 * CORS pour les routes appelées depuis les portails mutuelles tiers.
 * Utilisé par : /api/bookmarklet/ping, /api/extension/parcours/save, /api/extension/log-injection
 * L'extension envoie ces requêtes depuis le contexte du portail (pas depuis audibot.fr).
 * Autorise chrome-extension:// et audibot.fr uniquement — la sécurité est aussi assurée par syncToken / rate limiting.
 */
export function getPortalCorsHeaders(origin?: string | null) {
  const allowed = origin && (
    origin.startsWith("chrome-extension://") ||
    /^https?:\/\/([\w-]+\.)?audibot\.fr$/.test(origin) ||
    (IS_DEV && origin.includes("localhost"))
  );
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://audibot.fr",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

/**
 * CORS restreint pour les routes bilan (submit, document upload).
 * Autorise uniquement audibot.fr, *.audibot.fr, et localhost en dev.
 */
export function getBilanCorsHeaders(origin?: string | null) {
  const BILAN_DOMAINS = /^([\w-]+\.)?audibot\.fr$/;
  let allowed = false;
  if (origin) {
    try {
      const url = new URL(origin);
      allowed =
        BILAN_DOMAINS.test(url.hostname) ||
        (IS_DEV && url.hostname === "localhost");
    } catch {
      allowed = false;
    }
  }
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "https://audibot.fr",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
    "Access-Control-Max-Age": "86400",
  };
}
