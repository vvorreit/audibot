export const EMAIL_CATALOG = [
  { id: "welcome", label: "Bienvenue", category: "Onboarding", description: "Envoyé à l'inscription", trigger: "À l'inscription" },
  { id: "onboarding-j1", label: "Onboarding J+1", category: "Onboarding", description: "Rappel installation extension", trigger: "Cron J+1" },
  { id: "onboarding-j3", label: "Onboarding J+3", category: "Onboarding", description: "Relance si aucun scan", trigger: "Cron J+3" },
  { id: "nps", label: "NPS Satisfaction", category: "Engagement", description: "Enquête satisfaction J+14", trigger: "Cron J+14" },
  { id: "scan-limit-warning", label: "Alerte limite scans", category: "Engagement", description: "Alerte 80% quota atteint (64/80)", trigger: "Cron quotidien" },
  { id: "relance-tp", label: "Relance tiers-payant", category: "Tiers-Payant", description: "Relance vers mutuelle", trigger: "Cron relances-tp" },
  { id: "alerte-expiration", label: "Alerte expiration prescription", category: "Tiers-Payant", description: "Prescription audiologique expire bientôt", trigger: "Cron alertes-expiration" },
  { id: "webhook-stripe-failed", label: "Alerte webhook Stripe", category: "Alertes ops", description: "Alerte admin si webhook échoue", trigger: "Erreur webhook" },
  { id: "verify-email", label: "Vérification email", category: "Auth", description: "Confirmation adresse email", trigger: "À l'inscription" },
  { id: "smart-fill-stats", label: "Stats Smart Fill hebdo", category: "Engagement", description: "Résumé hebdomadaire", trigger: "Cron hebdomadaire" },
] as const;

export type EmailId = typeof EMAIL_CATALOG[number]["id"];
