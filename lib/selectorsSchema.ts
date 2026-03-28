import { z } from "zod";

/**
 * Schéma de validation pour les overrides de sélecteurs.
 * Garantit que les sélecteurs injectés dans l'extension respectent un format strict.
 */
export const SelectorSchema = z.object({
  portal: z.string().min(3).max(100),
  selectorName: z.string().min(2).max(50),
  selector: z.string().min(1).max(500),
  version: z.string().optional(),
});

export type SelectorInput = z.infer<typeof SelectorSchema>;

/**
 * Liste des noms de sélecteurs connus et autorisés.
 * Évite l'injection de sélecteurs arbitraires non gérés par le script content.js.
 */
export const ALLOWED_SELECTOR_NAMES = [
  "nomAdherent",
  "prenomAdherent",
  "nssAdherent",
  "dateNaissanceAdherent",
  "numeroAMC",
  "dateDebutValidite",
  "dateFinValidite",
  "boutonSuivant",
  "boutonValider",
  "champRecherche",
  "selectBeneficiaire",
] as const;

export function validateSelector(input: unknown) {
  return SelectorSchema.safeParse(input);
}
