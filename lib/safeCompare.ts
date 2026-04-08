import { timingSafeEqual, createHmac } from "crypto";

/**
 * Comparaison timing-safe de deux strings.
 * Empêche les timing attacks sur les secrets (CRON_SECRET, etc.).
 * Utilise un HMAC pour normaliser la longueur et éviter la fuite d'information sur la taille.
 */
export function safeCompare(a: string, b: string): boolean {
  const key = "audibot-safe-compare";
  const ha = createHmac("sha256", key).update(a).digest();
  const hb = createHmac("sha256", key).update(b).digest();
  return timingSafeEqual(ha, hb);
}
