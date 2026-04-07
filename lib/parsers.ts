// ─── Mutuelle ────────────────────────────────────────────────────────────────

export interface Personne {
  nom: string;
  prenom: string;
  numeroSecuriteSociale: string;
  dateNaissance: string;
}

export interface MutuelleData {
  // Organisme
  organisme: string;
  numeroAMC: string;
  numeroAdherent: string;
  numeroTeletransmission: string;
  typeConv: string;
  dateDebutValidite: string;
  dateFinValidite: string;
  // Personne sélectionnée
  nom: string;
  prenom: string;
  numeroSecuriteSociale: string;
  dateNaissance: string;
  // Toutes les personnes détectées
  personnes: Personne[];
  fieldConfidence?: Record<string, number>; // 0-1 par champ, absent = non rempli
}

// ─── Ordonnance opticien ──────────────────────────────────────────────────────

export interface CorrectionOeil {
  sphere: string;
  cylindre: string;
  axe: string;
  addition: string;
}

export interface CorrectionLentille {
  sphere: string;
  cylindre: string;
  axe: string;
  addition: string;
  rayonCourbure: string;
  diametre: string;
}

export interface OrdonnanceData {
  nomOphtalmologue: string;
  rpps: string;
  adeli: string;
  dateOrdonnance: string;
  dateValidite: string;
  nomPatient: string;
  prenomPatient: string;
  dateNaissancePatient: string;
  distancePupillaire: string;
  typePrescription: "lunettes" | "lentilles" | "les deux" | "";
  lunettesOD: CorrectionOeil;
  lunettesOG: CorrectionOeil;
  lentillesOD: CorrectionLentille;
  lentillesOG: CorrectionLentille;
  remarques: string;
  fieldConfidence?: Record<string, number>; // 0-1 par champ, absent = non rempli
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clean(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}

function findAfterKeyword(text: string, keywords: string[]): string {
  for (const kw of keywords) {
    const regex = new RegExp(`${kw}[:\\s.]+([A-Za-zÀ-ÖØ-öø-ÿ0-9\\s/\\-]+)`, "i");
    const m = text.match(regex);
    if (m) return clean(m[1].split("\n")[0]);
  }
  return "";
}

function parseOpticalValue(s: string): string {
  if (!s) return "";
  const trimmed = s.trim();
  if (/^pl(ano)?$/i.test(trimmed)) return "0.00";
  return trimmed.replace(",", ".");
}

function extractBC(text: string): string {
  const m = text.match(/(?:bc|r[. ]?b|rayon[^,\n]{0,10}?|base curve)[^\d]*(\d{1,2}[.,]\d{1})/i);
  return m ? m[1].replace(",", ".") : "";
}

function extractDia(text: string): string {
  const m = text.match(/(?:dia(?:m[eè]tre)?)[^\d]*(\d{2}[.,]\d{1})/i);
  return m ? m[1].replace(",", ".") : "";
}

// ─── Helpers mutuelle ─────────────────────────────────────────────────────────

function normalizeNSS(s: string): string {
  return s.replace(/\s/g, "");
}

// Abréviations parasites qui peuvent apparaître collées au nom dans le OCR
// ou dans les colonnes de tableau (tiers-payant, PEC = prise en charge, IDB = label, …)
const NOISE_TOKENS = new Set([
  "TM", "TC", "VM", "OC", "ROC", "CSR", "STS", "SV", "DRE", "AMC", "RSS",
  "PEC", "IDB", "CLC", "ROC", "SP", "IT", "IS",
]);

// Mots-clés de structure de carte qui ne sont jamais des noms de personnes
const NAME_BLACKLIST = /^(VALIDIT|P[ÉE]RIODE|[ÉE]DIT[ÉE]|B[ÉE]N[ÉE]FICIAIRES|ORGANISME|TIERS|PAYANT|RENSEIGNEMENTS|ASSUREUR|CARTE|SP[ÉE]CIALIT[ÉE]|AUXILIAIRES|CONSULTATIONS|HOSPITALISATION|LABORATOIRES|PHARMACIE|TRANSPORT|OPTIQUE|DENTAIRE)/i;

function cleanPersonneName(name: string): string {
  return name.split(/\s+/).filter(t => !NOISE_TOKENS.has(t)).join(" ").trim();
}

/** Découpe un nom complet (tout en majuscules) en nom/prénom.
 *  Les tokens entièrement en majuscules → NOM, les autres → prénom.
 *  Fallback : dernier mot = prénom. */
function splitNomPrenom(fullName: string): { nom: string; prenom: string } {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nom: "", prenom: "" };
  if (parts.length === 1) return { nom: parts[0], prenom: "" };

  const nomParts = parts.filter((p) => /^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));
  const prenomParts = parts.filter((p) => !/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));

  if (nomParts.length > 0 && prenomParts.length > 0) {
    return { nom: nomParts.join(" "), prenom: prenomParts.join(" ") };
  }
  // Fallback : dernier mot = prénom
  return { nom: parts.slice(0, -1).join(" "), prenom: parts[parts.length - 1] };
}

function addPersonne(
  fullName: string,
  nss: string,
  dob: string,
  personnes: Personne[],
  seen: Set<string>
): void {
  const cleaned = cleanPersonneName(fullName);
  if (!cleaned || NAME_BLACKLIST.test(cleaned)) return;
  const key = `${cleaned}-${nss || dob}`;
  if (seen.has(key)) return;
  seen.add(key);
  const { nom, prenom } = splitNomPrenom(clean(cleaned));
  personnes.push({ nom, prenom, numeroSecuriteSociale: nss, dateNaissance: dob });
}

const DATE_DDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/;

// ─── Confidence helpers ───────────────────────────────────────────────────

function computeMutuelleConfidence(data: Omit<MutuelleData, "fieldConfidence">): Record<string, number> {
  const conf: Record<string, number> = {};
  const set = (key: string, val: string, score: number) => {
    if (val.trim()) conf[key] = score;
  };

  // numeroSecuriteSociale : 15 chiffres → 0.92, sinon → 0.55
  if (data.numeroSecuriteSociale.trim()) {
    conf["numeroSecuriteSociale"] = /^\d{13,15}$/.test(data.numeroSecuriteSociale.replace(/\s/g, "")) ? 0.92 : 0.55;
  }
  // numeroAMC : 8-9 chiffres → 0.88, sinon → 0.55
  if (data.numeroAMC.trim()) {
    conf["numeroAMC"] = /^\d{8,9}$/.test(data.numeroAMC.replace(/\s/g, "")) ? 0.88 : 0.55;
  }
  // dates : format reconnu → 0.85, sinon → 0.58
  if (data.dateDebutValidite.trim()) {
    conf["dateDebutValidite"] = DATE_DDMMYYYY.test(data.dateDebutValidite.trim()) ? 0.85 : 0.58;
  }
  if (data.dateFinValidite.trim()) {
    conf["dateFinValidite"] = DATE_DDMMYYYY.test(data.dateFinValidite.trim()) ? 0.85 : 0.58;
  }
  // organisme : texte libre → 0.75
  set("organisme", data.organisme, 0.75);
  // autres champs → 0.70
  set("numeroAdherent", data.numeroAdherent, 0.70);
  set("numeroTeletransmission", data.numeroTeletransmission, 0.70);
  set("typeConv", data.typeConv, 0.70);
  set("nom", data.nom, 0.70);
  set("prenom", data.prenom, 0.70);
  if (data.dateNaissance.trim()) {
    conf["dateNaissance"] = DATE_DDMMYYYY.test(data.dateNaissance.trim()) ? 0.85 : 0.58;
  }

  return conf;
}

const DATE_PATTERN = /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/;
const NUMERIC_OPTICAL = /^[+\-]?\d+[.,]\d+$|^0[.,]00$/;

function computeOrdonnanceConfidence(data: Omit<OrdonnanceData, "fieldConfidence">): Record<string, number> {
  const conf: Record<string, number> = {};
  const set = (key: string, val: string, score: number) => {
    if (val.trim()) conf[key] = score;
  };

  // dateOrdonnance
  if (data.dateOrdonnance.trim()) {
    conf["dateOrdonnance"] = DATE_PATTERN.test(data.dateOrdonnance.trim()) ? 0.88 : 0.60;
  }
  set("nomOphtalmologue", data.nomOphtalmologue, 0.72);
  set("nomPatient", data.nomPatient, 0.72);
  set("prenomPatient", data.prenomPatient, 0.72);
  if (data.dateNaissancePatient.trim()) {
    conf["dateNaissancePatient"] = DATE_PATTERN.test(data.dateNaissancePatient.trim()) ? 0.88 : 0.60;
  }
  if (data.dateValidite.trim()) {
    conf["dateValidite"] = DATE_PATTERN.test(data.dateValidite.trim()) ? 0.88 : 0.60;
  }
  set("distancePupillaire", data.distancePupillaire, 0.70);
  set("remarques", data.remarques, 0.70);

  // lunettes OD/OG — clés plates
  for (const side of ["OD", "OG"] as const) {
    const oeil = side === "OD" ? data.lunettesOD : data.lunettesOG;
    for (const field of ["sphere", "cylindre", "axe", "addition"] as const) {
      const v = oeil[field].trim();
      if (v) {
        conf[`lunettes${side}.${field}`] = NUMERIC_OPTICAL.test(v) || /^\d{1,3}$/.test(v) ? 0.90 : 0.60;
      }
    }
  }

  return conf;
}

// ─── Parser mutuelle ──────────────────────────────────────────────────────────

const ORGA_KEYWORDS =
  "MUTUELLE|MUTUALISTE|HUMANIS|PRÉVOYANCE|SANTÉ|ASSURANCE|QUALIOPEE|HENNER|" +
  "MALAKOFF|HARMONIE|MGEN|MNH|ALMERYS|VIAMEDIS|ALPTIS|ACTIL|SOGAREP|GEREP|" +
  "AXA|EOVI|AG2R|KLESIA|APICIL|MAAF|GMF|MAIF|SWISSLIFE|MUTEX|GROUPAMA|" +
  "AESIO|ISTYA|INTÉRIALE|ADREA|OCIANE|MUTEX|COVEA|PRÉVOIR|SMATIS|SMACL|MNT|MFPS";

export function parseMutuelle(text: string): MutuelleData {
  const t = text;

  // N° AMC (peut contenir des espaces : "69 9 0612 1")
  const amcMatch = t.match(/(?:n[°o\.]\s*amc|amc)\s*[:\s]+([\d\s]+)/i);
  const numeroAMC = amcMatch ? normalizeNSS(amcMatch[1]).replace(/\s+$/, "") : "";

  // N° adhérent / N° assuré (alphanumérique, min 5 chars pour éviter faux positifs)
  const adherentMatch = t.match(
    /(?:n[°o\.]\s*adh[eé]rent|n[°o\.]\s*assur[eé])\s*[:\s]+([A-Z0-9]{5,})/i
  );
  const numeroAdherent = adherentMatch ? adherentMatch[1] : "";

  // N° Télétransmission
  const teleMatch = t.match(
    /(?:t[eé]l[eé]transmission|n[°o\.]\s*t[eé]l[eé]trans)\s*[:\s]+(\d+)/i
  );
  const numeroTeletransmission = teleMatch ? teleMatch[1] : "";

  // Type convention
  const typeConvMatch = t.match(/type\s+conv[^:\n]*[:\s]+([^\n]+)/i);
  const typeConv = typeConvMatch ? clean(typeConvMatch[1].split(/[(\n]/)[0]) : "";

  // Organisme
  const organismeMatch = t.match(
    new RegExp(
      `([A-ZÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\\s0-9]+(?:${ORGA_KEYWORDS})[A-Za-zÀ-ÖØ-öø-ÿ\\s0-9]*)`,
      "i"
    )
  );
  const organisme = organismeMatch ? clean(organismeMatch[1]) : "";

  // Période de validité
  const debutMatch = t.match(
    /(?:du|valable\s+du|p[eé]riode[^\n]{0,20}?du|p[eé]riode\s+de)\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i
  );
  const finMatch = t.match(/(?:au|jusqu'au|validit[eé])\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  let dateDebutValidite = debutMatch ? debutMatch[1] : "";
  let dateFinValidite = finMatch ? finMatch[1] : "";

  // Fallback : pattern "DD/MM/YYYY au DD/MM/YYYY" (SOGAREP, GEREP sans "du" explicite)
  if (!dateDebutValidite) {
    const rangeDateMatch = t.match(
      /(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\s+au\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i
    );
    if (rangeDateMatch) {
      dateDebutValidite = rangeDateMatch[1];
      if (!dateFinValidite) dateFinValidite = rangeDateMatch[2];
    }
  }

  // N° INSEE (format SP Santé / GEREP : "N° INSEE : 2 85 09 69 388 168 56")
  const inseeMatch = t.match(/n[°o\.]\s*insee\s*[:\s]+([\d\s]{13,22})/i);
  const inseeNSS = inseeMatch ? normalizeNSS(inseeMatch[1]).slice(0, 15) : "";

  // ── Détection des personnes ───────────────────────────────────────────────

  const personnes: Personne[] = [];
  const seen = new Set<string>();

  // Format 1 – NSS compact sur la même ligne : "NOM PRENOM 1234567890123 DD/MM/YYYY"
  // (Qualiopee / Viamedis, GEREP bénéficiaire assuré)
  // Espace littéral (pas \s) pour éviter de traverser les sauts de ligne
  const fmt1 =
    /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{1,40}?) +(\d{13,15}) +(\d{2}[\/\-]\d{2}[\/\-]\d{4})/g;
  let m: RegExpExecArray | null;
  while ((m = fmt1.exec(t)) !== null) {
    addPersonne(m[1], m[2], m[3], personnes, seen);
  }

  // Format 2 – NSS avec espaces sur la ligne suivante :
  // "NOM PRENOM\nDD/MM/YYYY RANG NSS(espaces)"
  // (AXA/SOGAREP)
  const fmt2 =
    /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1,2}\s+([12][\d\s]{14,25})/g;
  while ((m = fmt2.exec(t)) !== null) {
    const nss = normalizeNSS(m[3]).slice(0, 15);
    if (nss.length >= 13) addPersonne(m[1], nss, m[2], personnes, seen);
  }

  // Format "TABLE-NSS" – Nom suivi de données sur la même ligne, date+rang+NSS ligne suivante
  // (SOGAREP/AXA avec colonnes de taux collées au nom)
  // Ex : "REBILLARD JUSTINE   100/100/100 IDB PEC …\n03/09/1993    1    2 93 09 69 266 044 53"
  const fmtTableNSS =
    /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})[^\n]+\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1,2}\s+([12][\d\s]{14,25})/g;
  while ((m = fmtTableNSS.exec(t)) !== null) {
    const nss = normalizeNSS(m[3]).slice(0, 15);
    if (nss.length >= 13) addPersonne(m[1], nss, m[2], personnes, seen);
  }

  // Format 2b – ACTIL/Alptis : "NOM PRENOM\nCODE_ALPHANUM...DATE RANG NSS(espaces)"
  // La ligne suivant le nom contient un code arbitraire avant la date de naissance
  // Espace littéral dans le nom pour ne pas traverser les sauts de ligne
  const fmt2b =
    /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})\n[^\n]{0,80}?(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1,2}\s+([12][\d\s]{14,25})/g;
  while ((m = fmt2b.exec(t)) !== null) {
    const nss = normalizeNSS(m[3]).slice(0, 15);
    if (nss.length >= 13) addPersonne(m[1], nss, m[2], personnes, seen);
  }

  // Format "TABLE-NoNSS" – Nom + données tiers-payant sur même ligne, date+rang ligne suivante
  // (GEREP multi-bénéficiaires : "REBILLARD LEA   (7)   (10)…\n27/02/2014    1")
  if (personnes.length === 0) {
    const fmtTableNoNSS =
      /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})[^\n]+\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1}/g;
    while ((m = fmtTableNoNSS.exec(t)) !== null) {
      const nss = personnes.length === 0 ? inseeNSS : "";
      addPersonne(m[1], nss, m[2], personnes, seen);
    }
  }

  // Format 3 – Personnes sans NSS individuel (GEREP bénéficiaires tableau) :
  // "NOM PRENOM\nDD/MM/YYYY RANG" ou "NOM PRENOM   DD/MM/YYYY  RANG" (même ligne)
  if (personnes.length === 0) {
    // Même ligne avec espaces multiples (pdfjs layout-aware)
    const fmt3a =
      /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40}?) {2,}(\d{2}[\/\-]\d{2}[\/\-]\d{4}) +\d{1,2}/g;
    while ((m = fmt3a.exec(t)) !== null) {
      const nss = personnes.length === 0 ? inseeNSS : "";
      addPersonne(m[1], nss, m[2], personnes, seen);
    }
    // Ligne séparée
    if (personnes.length === 0) {
      const fmt3b =
        /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1}/g;
      while ((m = fmt3b.exec(t)) !== null) {
        const nss = personnes.length === 0 ? inseeNSS : "";
        addPersonne(m[1], nss, m[2], personnes, seen);
      }
    }
  }

  // Fallback – assuré principal (AXA : "Assuré principal AMC : REBILLARD JUSTINE")
  if (personnes.length === 0) {
    const assureMatch = t.match(
      /assur[eé](?:\s+(?:social|principal(?:\s+amc)?))\s*[:\s]+([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i
    );
    if (assureMatch) {
      addPersonne(clean(assureMatch[1].split("\n")[0]), inseeNSS, "", personnes, seen);
    }
  }

  const first = personnes[0] ?? {
    nom: "",
    prenom: "",
    numeroSecuriteSociale: "",
    dateNaissance: "",
  };

  const result: Omit<MutuelleData, "fieldConfidence"> = {
    organisme,
    numeroAMC,
    numeroAdherent,
    numeroTeletransmission,
    typeConv,
    dateDebutValidite,
    dateFinValidite,
    nom: first.nom,
    prenom: first.prenom,
    numeroSecuriteSociale: first.numeroSecuriteSociale,
    dateNaissance: first.dateNaissance,
    personnes,
  };
  return { ...result, fieldConfidence: computeMutuelleConfidence(result) };
}

// ─── Parser ordonnance opticien ───────────────────────────────────────────────

const EMPTY_OEIL: CorrectionOeil = { sphere: "", cylindre: "", axe: "", addition: "" };
const EMPTY_LENTILLE: CorrectionLentille = {
  sphere: "",
  cylindre: "",
  axe: "",
  addition: "",
  rayonCourbure: "",
  diametre: "",
};

/**
 * Extrait la section de texte correspondant à un œil (droit ou gauche).
 * Capture depuis "Oeil droit/gauche" (ou OD/OG) jusqu'à l'œil opposé ou fin.
 */
function extractEyeSection(text: string, side: "droit" | "gauche"): string {
  const thisSide =
    side === "droit"
      ? "(?:oeil\\s+droit|\\bO\\.?D\\.?\\b)"
      : "(?:oeil\\s+gauche|\\bO\\.?G\\.?\\b)";
  const otherSide =
    side === "droit"
      ? "(?:oeil\\s+gauche|\\bO\\.?G\\.?\\b)"
      : "(?:oeil\\s+droit|\\bO\\.?D\\.?\\b)";

  const re = new RegExp(`${thisSide}[:\\s]+(.+?)(?=${otherSide}|$)`, "is");
  const m = text.match(re);
  return m ? m[1].slice(0, 300) : "";
}

/**
 * Parse les valeurs optiques depuis une section de texte d'un œil.
 * Gère les formats :
 *   - "+5,00 (-3,00 à 125°)"
 *   - "-3.75 (-1.50) 90°"
 *   - "Prescription finale : +0.50 (-0.25) 75°"
 *   - "+0.50" (sphère seule)
 *   - "+0.00 (-0.50) 130° Addition : +2.50"
 */
function parseEyeSection(section: string): CorrectionOeil {
  let sphere = "",
    cylindre = "",
    axe = "",
    addition = "";

  // Correction principale : sph (cyl [à] axe°) ou sph (cyl) axe°
  // sph peut être un nombre ou "plano"
  // Formats couverts :
  //   "+2.50 (-0.75 à 180°)"   — séparateur "à"
  //   "+2.50 (-0.75 x 180°)"   — séparateur "x" (notation anglosaxonne)
  //   "+2.50 (-0.75) 180°"     — axe hors parenthèse
  //   "plano (-0.50 x 90°)"    — plano en sphère
  const corMatch = section.match(
    /(plano|[+\-]?\d+[.,]\d+)\s*\(\s*([+\-]?\d+[.,]\d+)(?:\s*(?:à|a|[xX])\s*(\d{1,3})°?)?\s*\)(?:\s*(\d{1,3})°)?/i
  );
  if (corMatch) {
    sphere = parseOpticalValue(corMatch[1]);
    cylindre = parseOpticalValue(corMatch[2]);
    axe = corMatch[3] || corMatch[4] || "";
  } else {
    // Sphère seule (ex : "Prescription finale : +0.50")
    const sphMatch = section.match(/(?:finale\s*:?\s*)?([+\-]?\d+[.,]\d+)/i);
    if (sphMatch) sphere = parseOpticalValue(sphMatch[1]);
  }

  // Addition (peut être sur la même ligne)
  const addMatch = section.match(/[Aa]ddition\s*[:\s]+([+\-]?\d+[.,]\d+)/);
  if (addMatch) addition = parseOpticalValue(addMatch[1]);

  return { sphere, cylindre, axe, addition };
}

export function parseOrdonnance(text: string): OrdonnanceData {
  // ── Ophtalmologue ──────────────────────────────────────────────────────────
  const medecinMatch = text.match(
    /(?:Dr\.?|Docteur|Ophtalmologue|Ophtalmo\.?)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i
  );
  const nomOphtalmologue = medecinMatch ? clean(medecinMatch[1].split("\n")[0]) : "";

  // ── Date ordonnance ────────────────────────────────────────────────────────
  const dateMatch =
    text.match(
      /(?:le\s+|date\s*:?\s*|fait\s+le\s+)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
    ) ||
    // Format "le 11 mars 2021" ou "le 17/12/2025"
    text.match(
      /(?:le\s+)(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i
    ) ||
    text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/);
  const dateOrdonnance = dateMatch ? dateMatch[1] : "";

  const dateValiditeMatch = text.match(
    /(?:valable|validit[eé]|jusqu|[eé]ch[eé]ance)[^\n]*?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
  );
  const dateValidite = dateValiditeMatch ? dateValiditeMatch[1] : "";

  // ── Patient : Monsieur / Madame / M. / Mme / Enfant ───────────────────────
  let nomPatient = "";
  let prenomPatient = "";

  const civMatch = text.match(
    /(?:Monsieur|Madame|M\.\s+|Mme\.?\s+|Enfant\s+)\s*([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i
  );
  if (civMatch) {
    const fullName = clean(civMatch[1].split("\n")[0]);
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      // Tokens tout-majuscules → NOM, sinon → prénom
      const nomParts = parts.filter((p) => /^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));
      const prenomParts = parts.filter((p) => !/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));
      if (nomParts.length > 0 && prenomParts.length > 0) {
        nomPatient = nomParts.join(" ");
        prenomPatient = prenomParts.join(" ");
      } else {
        nomPatient = parts.slice(0, -1).join(" ");
        prenomPatient = parts[parts.length - 1];
      }
    } else {
      nomPatient = fullName;
    }
  } else {
    // Fallback ancien comportement
    const patientMatch = text.match(
      /(?:patient|nom\s*:?|m\.?\s|mme\.?\s)\s*:?\s*([A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i
    );
    if (patientMatch) nomPatient = clean(patientMatch[1].split("\n")[0]);
    prenomPatient = findAfterKeyword(text, ["pr[eé]nom"]);
  }

  const dnMatch = text.match(
    /(?:n[eé][e]?\s+le|date\s+de\s+naissance|d\.?n\.?b?)[^\d]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i
  );
  const dateNaissancePatient = dnMatch ? dnMatch[1] : "";

  // ── Distance pupillaire ────────────────────────────────────────────────────
  const dpMatch = text.match(
    /(?:distance\s+pupillaire|[eé]cart\s+inter.?pupillaire|\bDP\b)[^\d]*(\d{2}(?:[.,]\d)?)\s*mm/i
  );
  const distancePupillaire = dpMatch ? dpMatch[1].replace(",", ".") : "";

  // ── Type prescription ──────────────────────────────────────────────────────
  const hasLunettes = /lunettes|verres?|monture/i.test(text);
  const hasLentilles = /lentilles?|lc\b|contact/i.test(text);
  let typePrescription: OrdonnanceData["typePrescription"] = "";
  if (hasLunettes && hasLentilles) typePrescription = "les deux";
  else if (hasLunettes) typePrescription = "lunettes";
  else if (hasLentilles) typePrescription = "lentilles";

  // ── Extraction OD / OG ────────────────────────────────────────────────────
  const odSection = extractEyeSection(text, "droit");
  const ogSection = extractEyeSection(text, "gauche");

  let lunettesOD: CorrectionOeil = EMPTY_OEIL;
  let lunettesOG: CorrectionOeil = EMPTY_OEIL;

  if (odSection) {
    lunettesOD = parseEyeSection(odSection);
  }
  if (ogSection) {
    lunettesOG = parseEyeSection(ogSection);
  }

  // Fallback : si aucune section "Oeil droit/gauche" détectée,
  // utiliser l'ancienne méthode par mots-clés (sphère/cylindre/axe séparés)
  if (!odSection && !ogSection) {
    lunettesOD = fallbackOD(text);
    lunettesOG = fallbackOG(text);
  }

  // ── Lentilles ─────────────────────────────────────────────────────────────
  const bcOD = extractBC(text);
  const diaOD = extractDia(text);
  const lentillesOD: CorrectionLentille = {
    ...EMPTY_LENTILLE,
    ...lunettesOD,
    rayonCourbure: bcOD,
    diametre: diaOD,
  };
  const lentillesOG: CorrectionLentille = {
    ...EMPTY_LENTILLE,
    ...lunettesOG,
    rayonCourbure: bcOD,
    diametre: diaOD,
  };

  // ── Remarques ─────────────────────────────────────────────────────────────
  const remarquesMatch = text.match(
    /(?:remarques?|observations?|notes?|commentaires?)[^\n]*?\n([^\n]+)/i
  );
  const remarques = remarquesMatch ? clean(remarquesMatch[1]) : "";

  const result: Omit<OrdonnanceData, "fieldConfidence"> = {
    nomOphtalmologue,
    rpps: "",
    adeli: "",
    dateOrdonnance,
    dateValidite,
    nomPatient,
    prenomPatient,
    dateNaissancePatient,
    distancePupillaire,
    typePrescription,
    lunettesOD,
    lunettesOG,
    lentillesOD,
    lentillesOG,
    remarques,
  };
  return { ...result, fieldConfidence: computeOrdonnanceConfidence(result) };
}

// ── Scoring ─────────────────────────────────────────────────────────────────

export function scoreMutuelle(data: MutuelleData): number {
  const fields = [
    data.organisme,
    data.numeroAMC,
    data.numeroAdherent,
    data.nom,
    data.prenom,
    data.numeroSecuriteSociale,
    data.dateDebutValidite,
    data.dateFinValidite,
  ];
  let score = fields.filter((f) => f.trim().length > 0).length * 12.5;

  if (data.numeroSecuriteSociale.trim() && !/^\d{13}$/.test(data.numeroSecuriteSociale.replace(/\s/g, ""))) {
    score -= 20;
  }
  if (data.dateDebutValidite.trim() && !DATE_DDMMYYYY.test(data.dateDebutValidite.trim())) {
    score -= 10;
  }
  if (data.dateFinValidite.trim() && !DATE_DDMMYYYY.test(data.dateFinValidite.trim())) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreOrdonnance(data: OrdonnanceData): number {
  const fields = [
    data.nomOphtalmologue,
    data.dateOrdonnance,
    data.nomPatient,
    data.typePrescription,
    data.lunettesOD.sphere,
    data.lunettesOG.sphere,
  ];
  let score = fields.filter((f) => f.trim().length > 0).length * (100 / 6);

  if (data.lunettesOD.sphere.trim() && isNaN(parseFloat(data.lunettesOD.sphere))) {
    score -= 15;
  }
  if (data.lunettesOG.sphere.trim() && isNaN(parseFloat(data.lunettesOG.sphere))) {
    score -= 15;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ── Fallback : ancienne méthode ligne par ligne (si pas de "Oeil droit/gauche") ─

function extractODOGLine(text: string, keyword: string): [string, string] {
  const lines = text.split("\n");
  for (const line of lines) {
    if (new RegExp(keyword, "i").test(line)) {
      const values = line.match(/([+\-]?\d{1,2}[.,]\d{2}|pl(?:ano)?|\d{1,3}°)/gi);
      if (values && values.length >= 2)
        return [parseOpticalValue(values[0]), parseOpticalValue(values[1])];
      if (values?.length === 1) return [parseOpticalValue(values[0]), ""];
    }
  }
  return ["", ""];
}

function fallbackOD(text: string): CorrectionOeil {
  const [sphOD] = extractODOGLine(text, "sph[eè]?r?e?");
  const [cylOD] = extractODOGLine(text, "cyl(?:indre)?");
  const [axeOD_raw] = extractODOGLine(text, "ax[e]?(?:is)?");
  const [addOD] = extractODOGLine(text, "add(?:ition)?");
  return {
    sphere: sphOD,
    cylindre: cylOD,
    axe: axeOD_raw.replace(/[^\d]/g, ""),
    addition: addOD,
  };
}

function fallbackOG(text: string): CorrectionOeil {
  const [, sphOG] = extractODOGLine(text, "sph[eè]?r?e?");
  const [, cylOG] = extractODOGLine(text, "cyl(?:indre)?");
  const [, axeOG_raw] = extractODOGLine(text, "ax[e]?(?:is)?");
  const [, addOG] = extractODOGLine(text, "add(?:ition)?");
  return {
    sphere: sphOG,
    cylindre: cylOG,
    axe: axeOG_raw.replace(/[^\d]/g, ""),
    addition: addOG,
  };
}

// ── Merge de deux résultats OCR ─────────────────────────────────────────────
// Combine les résultats de deux moteurs OCR (PaddleOCR + Tesseract).
// Stratégie : pour chaque champ, garder la valeur non-vide.
// En cas de conflit, préférer le résultat du moteur "primary" (score plus élevé).

function pick(primary: string, secondary: string): string {
  if (primary.trim()) return primary;
  return secondary;
}

function mergeCorrection(primary: CorrectionOeil, secondary: CorrectionOeil): CorrectionOeil {
  return {
    sphere: pick(primary.sphere, secondary.sphere),
    cylindre: pick(primary.cylindre, secondary.cylindre),
    axe: pick(primary.axe, secondary.axe),
    addition: pick(primary.addition, secondary.addition),
  };
}

function mergeLentille(primary: CorrectionLentille, secondary: CorrectionLentille): CorrectionLentille {
  return {
    sphere: pick(primary.sphere, secondary.sphere),
    cylindre: pick(primary.cylindre, secondary.cylindre),
    axe: pick(primary.axe, secondary.axe),
    addition: pick(primary.addition, secondary.addition),
    rayonCourbure: pick(primary.rayonCourbure, secondary.rayonCourbure),
    diametre: pick(primary.diametre, secondary.diametre),
  };
}

/** Fusionne deux listes de personnes par nom/prénom. */
function mergePersonnes(primary: Personne[], secondary: Personne[]): Personne[] {
  const merged = [...primary];
  const seen = new Set(primary.map((p) => `${p.nom}-${p.prenom}`.toUpperCase()));

  for (const p of secondary) {
    const key = `${p.nom}-${p.prenom}`.toUpperCase();
    if (!seen.has(key)) {
      merged.push(p);
      seen.add(key);
    } else {
      /* Compléter les champs manquants de la personne déjà présente */
      const existing = merged.find((m) => `${m.nom}-${m.prenom}`.toUpperCase() === key);
      if (existing) {
        if (!existing.numeroSecuriteSociale && p.numeroSecuriteSociale) existing.numeroSecuriteSociale = p.numeroSecuriteSociale;
        if (!existing.dateNaissance && p.dateNaissance) existing.dateNaissance = p.dateNaissance;
      }
    }
  }
  return merged;
}

/** Fusionne deux résultats mutuelle. `primary` = moteur avec meilleur score. */
export function mergeMutuelle(primary: MutuelleData, secondary: MutuelleData): MutuelleData {
  const personnes = mergePersonnes(primary.personnes, secondary.personnes);
  const first = personnes[0] ?? { nom: "", prenom: "", numeroSecuriteSociale: "", dateNaissance: "" };

  const merged: Omit<MutuelleData, "fieldConfidence"> = {
    organisme: pick(primary.organisme, secondary.organisme),
    numeroAMC: pick(primary.numeroAMC, secondary.numeroAMC),
    numeroAdherent: pick(primary.numeroAdherent, secondary.numeroAdherent),
    numeroTeletransmission: pick(primary.numeroTeletransmission, secondary.numeroTeletransmission),
    typeConv: pick(primary.typeConv, secondary.typeConv),
    dateDebutValidite: pick(primary.dateDebutValidite, secondary.dateDebutValidite),
    dateFinValidite: pick(primary.dateFinValidite, secondary.dateFinValidite),
    nom: pick(primary.nom, first.nom),
    prenom: pick(primary.prenom, first.prenom),
    numeroSecuriteSociale: pick(primary.numeroSecuriteSociale, first.numeroSecuriteSociale),
    dateNaissance: pick(primary.dateNaissance, first.dateNaissance),
    personnes,
  };
  return { ...merged, fieldConfidence: computeMutuelleConfidence(merged) };
}

/** Fusionne deux résultats ordonnance. `primary` = moteur avec meilleur score. */
export function mergeOrdonnance(primary: OrdonnanceData, secondary: OrdonnanceData): OrdonnanceData {
  const merged: Omit<OrdonnanceData, "fieldConfidence"> = {
    nomOphtalmologue: pick(primary.nomOphtalmologue, secondary.nomOphtalmologue),
    rpps: pick(primary.rpps, secondary.rpps),
    adeli: pick(primary.adeli, secondary.adeli),
    dateOrdonnance: pick(primary.dateOrdonnance, secondary.dateOrdonnance),
    dateValidite: pick(primary.dateValidite, secondary.dateValidite),
    nomPatient: pick(primary.nomPatient, secondary.nomPatient),
    prenomPatient: pick(primary.prenomPatient, secondary.prenomPatient),
    dateNaissancePatient: pick(primary.dateNaissancePatient, secondary.dateNaissancePatient),
    distancePupillaire: pick(primary.distancePupillaire, secondary.distancePupillaire),
    typePrescription: primary.typePrescription || secondary.typePrescription,
    lunettesOD: mergeCorrection(primary.lunettesOD, secondary.lunettesOD),
    lunettesOG: mergeCorrection(primary.lunettesOG, secondary.lunettesOG),
    lentillesOD: mergeLentille(primary.lentillesOD, secondary.lentillesOD),
    lentillesOG: mergeLentille(primary.lentillesOG, secondary.lentillesOG),
    remarques: pick(primary.remarques, secondary.remarques),
  };
  return { ...merged, fieldConfidence: computeOrdonnanceConfidence(merged) };
}
