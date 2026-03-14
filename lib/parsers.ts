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
}

// ─── Prescription ORL audioprothésiste ───────────────────────────────────────

export interface AudiogrammeOreille {
  hz250: string;   // Perte en dB à 250 Hz
  hz500: string;   // Perte en dB à 500 Hz
  hz1000: string;  // Perte en dB à 1 kHz
  hz2000: string;  // Perte en dB à 2 kHz
  hz4000: string;  // Perte en dB à 4 kHz
}

export type TypeAppareillage = "BTE" | "ITE" | "RIC" | "RITE" | "";
export type ClasseAppareillage = "1" | "2" | "";

export interface OrdonnanceData {
  // Prescripteur
  nomORL: string;
  rpps: string;
  datePrescription: string;
  // Patient
  nomPatient: string;
  prenomPatient: string;
  dateNaissancePatient: string;
  // Audiogramme
  oreilleDroite: AudiogrammeOreille;
  oreilleGauche: AudiogrammeOreille;
  // Appareillage
  classeAppareillage: ClasseAppareillage;
  typeAppareillage: TypeAppareillage;
  renouvellement: boolean;
  remarques: string;
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
const NOISE_TOKENS = new Set([
  "TM", "TC", "VM", "OC", "ROC", "CSR", "STS", "SV", "DRE", "AMC", "RSS",
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
  const dateDebutValidite = debutMatch ? debutMatch[1] : "";
  const dateFinValidite = finMatch ? finMatch[1] : "";

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

  // Format 2b – ACTIL/Alptis : "NOM PRENOM\nCODE_ALPHANUM...DATE RANG NSS(espaces)"
  // La ligne suivant le nom contient un code arbitraire avant la date de naissance
  // Espace littéral dans le nom pour ne pas traverser les sauts de ligne
  const fmt2b =
    /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})\n[^\n]{0,80}?(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1,2}\s+([12][\d\s]{14,25})/g;
  while ((m = fmt2b.exec(t)) !== null) {
    const nss = normalizeNSS(m[3]).slice(0, 15);
    if (nss.length >= 13) addPersonne(m[1], nss, m[2], personnes, seen);
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

  return {
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
}

// ─── Parser prescription ORL audioprothésiste ─────────────────────────────────

const EMPTY_AUDIOGRAMME: AudiogrammeOreille = {
  hz250: "",
  hz500: "",
  hz1000: "",
  hz2000: "",
  hz4000: "",
};

/**
 * Extrait la section de texte correspondant à une oreille (droite ou gauche).
 * Capture depuis "Oreille droite/gauche" (ou OD/OG) jusqu'à l'oreille opposée ou fin.
 */
function extractEarSection(text: string, side: "droite" | "gauche"): string {
  const thisSide =
    side === "droite"
      ? "(?:oreille\\s+droite|\\bO\\.?D\\.?\\b)"
      : "(?:oreille\\s+gauche|\\bO\\.?G\\.?\\b)";
  const otherSide =
    side === "droite"
      ? "(?:oreille\\s+gauche|\\bO\\.?G\\.?\\b)"
      : "(?:oreille\\s+droite|\\bO\\.?D\\.?\\b)";

  const re = new RegExp(`${thisSide}[:\\s]+(.+?)(?=${otherSide}|$)`, "is");
  const m = text.match(re);
  return m ? m[1].slice(0, 500) : "";
}

/**
 * Extrait les pertes auditives en dB depuis une section audiogramme.
 * Formats supportés :
 *   - "250Hz : 45dB" ou "250 Hz 45"
 *   - Tableau : "250 500 1000 2000 4000\n45 60 70 75 80"
 *   - "250 Hz = 45 dB"
 */
function parseAudiogramme(section: string): AudiogrammeOreille {
  function extractHz(hz: number): string {
    // Cherche la valeur dB associée à la fréquence
    const patterns = [
      // "250Hz : 45dB" ou "250Hz 45dB" ou "250 Hz = 45 dB"
      new RegExp(`${hz}\\s*[Hh][Zz]?\\s*[:=\\s]+\\s*(\\d{1,3})\\s*(?:dB)?`, "i"),
      // "250 : 45" (format tableau simple)
      new RegExp(`\\b${hz}\\b[\\s:=]+(\\d{1,3})\\b`),
    ];
    for (const re of patterns) {
      const m = section.match(re);
      if (m) return m[1];
    }
    return "";
  }

  // Tentative d'extraction par fréquence individuelle
  const hz250 = extractHz(250);
  const hz500 = extractHz(500);
  const hz1000 = extractHz(1000);
  const hz2000 = extractHz(2000);
  const hz4000 = extractHz(4000);

  // Fallback : tableau de valeurs numériques sur une ligne (ex: "45 60 70 75 80")
  if (!hz250 && !hz500) {
    const tableMatch = section.match(/\b(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\b/);
    if (tableMatch) {
      return {
        hz250: tableMatch[1],
        hz500: tableMatch[2],
        hz1000: tableMatch[3],
        hz2000: tableMatch[4],
        hz4000: tableMatch[5],
      };
    }
  }

  return { hz250, hz500, hz1000, hz2000, hz4000 };
}

/**
 * Parse une prescription ORL audioprothésiste française.
 * Extrait : prescripteur ORL, patient, audiogramme OD/OG,
 *           classe et type d'appareillage, renouvellement.
 */
export function parseOrdonnance(text: string): OrdonnanceData {
  // ── ORL / Médecin prescripteur ────────────────────────────────────────────
  const medecinMatch = text.match(
    /(?:Dr\.?|Docteur|ORL|Oto-rhino|Médecin\s+prescripteur)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i
  );
  const nomORL = medecinMatch ? clean(medecinMatch[1].split("\n")[0]) : "";

  // ── RPPS ──────────────────────────────────────────────────────────────────
  const rppsMatch = text.match(/(?:RPPS|n[°o\.]\s*RPPS)[:\s]+(\d{11})/i);
  const rpps = rppsMatch ? rppsMatch[1] : "";

  // ── Date de prescription ──────────────────────────────────────────────────
  const dateMatch =
    text.match(/(?:le\s+|date\s*:?\s*|fait\s+le\s+|prescrit\s+le\s+)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) ||
    text.match(/(?:le\s+)(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i) ||
    text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/);
  const datePrescription = dateMatch ? dateMatch[1] : "";

  // ── Patient ───────────────────────────────────────────────────────────────
  let nomPatient = "";
  let prenomPatient = "";

  const civMatch = text.match(
    /(?:Monsieur|Madame|M\.\s+|Mme\.?\s+|Patient\s*:?\s*)\s*([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i
  );
  if (civMatch) {
    const fullName = clean(civMatch[1].split("\n")[0]);
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
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
    const patientMatch = text.match(/(?:nom\s*:?)\s*:?\s*([A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i);
    if (patientMatch) nomPatient = clean(patientMatch[1].split("\n")[0]);
    prenomPatient = findAfterKeyword(text, ["pr[eé]nom"]);
  }

  const dnMatch = text.match(
    /(?:n[eé][e]?\s+le|date\s+de\s+naissance|d\.?n\.?b?)[^\d]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i
  );
  const dateNaissancePatient = dnMatch ? dnMatch[1] : "";

  // ── Audiogramme OD / OG ───────────────────────────────────────────────────
  const odSection = extractEarSection(text, "droite");
  const ogSection = extractEarSection(text, "gauche");

  const oreilleDroite = odSection ? parseAudiogramme(odSection) : { ...EMPTY_AUDIOGRAMME };
  const oreilleGauche = ogSection ? parseAudiogramme(ogSection) : { ...EMPTY_AUDIOGRAMME };

  // Fallback : si la structure n'est pas séparée par oreille, essai sur le texte global
  if (!odSection && !ogSection) {
    // Cherche un tableau à 2 lignes de valeurs (OD puis OG)
    const rows = [...text.matchAll(/\b(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\b/g)];
    if (rows.length >= 2) {
      oreilleDroite.hz250 = rows[0][1]; oreilleDroite.hz500 = rows[0][2];
      oreilleDroite.hz1000 = rows[0][3]; oreilleDroite.hz2000 = rows[0][4]; oreilleDroite.hz4000 = rows[0][5];
      oreilleGauche.hz250 = rows[1][1]; oreilleGauche.hz500 = rows[1][2];
      oreilleGauche.hz1000 = rows[1][3]; oreilleGauche.hz2000 = rows[1][4]; oreilleGauche.hz4000 = rows[1][5];
    }
  }

  // ── Classe d'appareillage ─────────────────────────────────────────────────
  // Classe 1 = entrée de gamme / Classe 2 = premium (100% Santé = Classe 1)
  let classeAppareillage: ClasseAppareillage = "";
  const classeMatch = text.match(/[Cc]lasse\s*([12])/);
  if (classeMatch) {
    classeAppareillage = classeMatch[1] as ClasseAppareillage;
  } else if (/100\s*%\s*sant[eé]|sans\s+reste[\s\-]à[\s\-]charge|srac/i.test(text)) {
    classeAppareillage = "1";
  }

  // ── Type d'appareillage ───────────────────────────────────────────────────
  let typeAppareillage: TypeAppareillage = "";
  if (/\b(?:ric|rite|écouteur\s+déporté|receiver\s+in\s+(?:canal|ear))\b/i.test(text)) {
    typeAppareillage = "RIC";
  } else if (/\b(?:ite|intra[\s\-]?auriculaire|intra[\s\-]?canal|in[\s\-]?the[\s\-]?ear)\b/i.test(text)) {
    typeAppareillage = "ITE";
  } else if (/\b(?:bte|contour[\s\-]?d['']?oreille|behind[\s\-]?the[\s\-]?ear)\b/i.test(text)) {
    typeAppareillage = "BTE";
  }

  // ── Renouvellement ────────────────────────────────────────────────────────
  const renouvellement = /renouvellement|renouvel|renouvelle/i.test(text);

  // ── Remarques ─────────────────────────────────────────────────────────────
  const remarquesMatch = text.match(
    /(?:remarques?|observations?|notes?|commentaires?)[^\n]*?\n([^\n]+)/i
  );
  const remarques = remarquesMatch ? clean(remarquesMatch[1]) : "";

  return {
    nomORL,
    rpps,
    datePrescription,
    nomPatient,
    prenomPatient,
    dateNaissancePatient,
    oreilleDroite,
    oreilleGauche,
    classeAppareillage,
    typeAppareillage,
    renouvellement,
    remarques,
  };
}
