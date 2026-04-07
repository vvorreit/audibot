/** Extraction d'organisme (mutuelle) depuis un libellé bancaire. Exports: ORGANISME_PATTERNS, extractOrganisme. */

const ORGANISME_PATTERNS: { regex: RegExp; name: string }[] = [
  { regex: /ALMERYS/i, name: "ALMERYS" },
  { regex: /VIAMEDIS/i, name: "VIAMEDIS" },
  { regex: /CPAM|CAISSE\s+PRIMAIRE/i, name: "CPAM" },
  { regex: /HARMONIE/i, name: "HARMONIE" },
  { regex: /SANTECLAIR/i, name: "SANTECLAIR" },
  { regex: /WEMIND/i, name: "WEMIND" },
  { regex: /ITELIS/i, name: "ITELIS" },
  { regex: /KALIXIA/i, name: "KALIXIA" },
  { regex: /CARTE\s*BLANCHE/i, name: "CARTE_BLANCHE" },
  { regex: /SEVEANE/i, name: "SEVEANE" },
  { regex: /SP\s*SANT[EÉ]/i, name: "SP_SANTE" },
  { regex: /APICIL/i, name: "APICIL" },
  { regex: /AESIO/i, name: "AESIO" },
  { regex: /GROUPAMA/i, name: "GROUPAMA" },
  { regex: /MALAKOFF/i, name: "MALAKOFF" },
  { regex: /AG2R/i, name: "AG2R" },
  { regex: /KLESIA/i, name: "KLESIA" },
  { regex: /MUTEX/i, name: "MUTEX" },
  { regex: /QUATREM/i, name: "QUATREM" },
];

export function extractOrganisme(libelle: string): string | null {
  for (const { regex, name } of ORGANISME_PATTERNS) {
    if (regex.test(libelle)) return name;
  }
  return null;
}
