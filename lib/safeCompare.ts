import { timingSafeEqual } from "crypto";

/**
 * Comparaison timing-safe de deux strings.
 * Empêche les timing attacks sur les secrets (CRON_SECRET, etc.).
 */
export function safeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
