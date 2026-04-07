import { Personne, CorrectionOeil, CorrectionLentille } from "./types";

export function clean(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

export function findAfterKeyword(text: string, keywords: string[]): string {
  for (const kw of keywords) {
    const regex = new RegExp(`${kw}[:\\s.]+([A-Za-zÀ-ÖØ-öø-ÿ0-9\\s/\\-]+)`, "i");
    const m = text.match(regex);
    if (m) return clean(m[1].split("\n")[0]);
  }
  return "";
}

export function parseOpticalValue(s: string): string {
  if (!s) return "";
  const trimmed = s.trim();
  if (/^pl(ano)?$/i.test(trimmed)) return "0.00";
  return trimmed.replace(",", ".");
}

export function normalizeNSS(s: string): string {
  return s.replace(/\s/g, "");
}

export function pick(primary: string, secondary: string): string {
  if (primary.trim()) return primary;
  return secondary;
}

export function mergeCorrection(primary: CorrectionOeil, secondary: CorrectionOeil): CorrectionOeil {
  return {
    sphere: pick(primary.sphere, secondary.sphere),
    cylindre: pick(primary.cylindre, secondary.cylindre),
    axe: pick(primary.axe, secondary.axe),
    addition: pick(primary.addition, secondary.addition),
  };
}

export function mergeLentille(primary: CorrectionLentille, secondary: CorrectionLentille): CorrectionLentille {
  return {
    sphere: pick(primary.sphere, secondary.sphere),
    cylindre: pick(primary.cylindre, secondary.cylindre),
    axe: pick(primary.axe, secondary.axe),
    addition: pick(primary.addition, secondary.addition),
    rayonCourbure: pick(primary.rayonCourbure, secondary.rayonCourbure),
    diametre: pick(primary.diametre, secondary.diametre),
  };
}

export function mergePersonnes(primary: Personne[], secondary: Personne[]): Personne[] {
  const merged = [...primary];
  const seen = new Set(primary.map((p) => `${p.nom}-${p.prenom}`.toUpperCase()));

  for (const p of secondary) {
    const key = `${p.nom}-${p.prenom}`.toUpperCase();
    if (!seen.has(key)) {
      merged.push(p);
      seen.add(key);
    } else {
      const existing = merged.find((m) => `${m.nom}-${m.prenom}`.toUpperCase() === key);
      if (existing) {
        if (!existing.numeroSecuriteSociale && p.numeroSecuriteSociale) existing.numeroSecuriteSociale = p.numeroSecuriteSociale;
        if (!existing.dateNaissance && p.dateNaissance) existing.dateNaissance = p.dateNaissance;
      }
    }
  }
  return merged;
}

export const DATE_DDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/;
export const DATE_PATTERN = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/;
export const NUMERIC_OPTICAL = /^[+\-]?\d+[.,]\d+$|^0[.,]00$/;
