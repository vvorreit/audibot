/**
 * Wrapper analytics RGPD-compliant.
 * Tracking opt-in uniquement — vérifie le consentement cookie avant tout envoi.
 * Aucune donnée de santé ne transite ici.
 */

type AnalyticsEvent =
  | "onboarding_started"
  | "onboarding_step_completed"
  | "document_uploaded"
  | "data_copied"
  | "extension_opened"
  | "checkout_initiated"
  | "checkout_completed"
  | "scan_mobile_generated"
  | "trial_expired_view"
  | "web_vital"
  | "example_mutuelle_loaded";

type EventProps = Record<string, string | number | boolean | undefined>;

function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("optibot_analytics_consent") === "granted";
  } catch {
    return false;
  }
}

export function track(event: AnalyticsEvent, props?: EventProps): void {
  if (!hasAnalyticsConsent()) return;

  // PostHog (si disponible côté client)
  if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).posthog) {
    const ph = (window as unknown as Record<string, { capture?: (e: string, p?: EventProps) => void }>).posthog;
    ph.capture?.(event, props);
    return;
  }

  // Dev : log console
  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event}`, props);
  }
}
