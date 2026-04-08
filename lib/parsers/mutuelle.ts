import { MutuelleData, Personne } from "./types";
import { clean, normalizeNSS, mergePersonnes, pick, DATE_DDMMYYYY } from "./utils";

const ORGA_KEYWORDS =
  "MUTUELLE|MUTUALISTE|HUMANIS|PRÉVOYANCE|SANTÉ|ASSURANCE|QUALIOPEE|HENNER|" +
  "MALAKOFF|HARMONIE|MGEN|MNH|ALMERYS|VIAMEDIS|ALPTIS|ACTIL|SOGAREP|GEREP|" +
  "AXA|EOVI|AG2R|KLESIA|APICIL|MAAF|GMF|MAIF|SWISSLIFE|MUTEX|GROUPAMA|" +
  "AESIO|ISTYA|INTÉRIALE|ADREA|OCIANE|MUTEX|COVEA|PRÉVOIR|SMATIS|SMACL|MNT|MFPS";

const NOISE_TOKENS = new Set([
  "TM", "TC", "VM", "OC", "ROC", "CSR", "STS", "SV", "DRE", "AMC", "RSS",
  "PEC", "IDB", "CLC", "ROC", "SP", "IT", "IS",
]);

const NAME_BLACKLIST = /^(VALIDIT|P[ÉE]RIODE|[ÉE]DIT[ÉE]|B[ÉE]N[ÉE]FICIAIRES|ORGANISME|TIERS|PAYANT|RENSEIGNEMENTS|ASSUREUR|CARTE|SP[ÉE]CIALIT[ÉE]|AUXILIAIRES|CONSULTATIONS|HOSPITALISATION|LABORATOIRES|PHARMACIE|TRANSPORT|OPTIQUE|DENTAIRE)/i;

function cleanPersonneName(name: string): string {
  return name.split(/\s+/).filter(t => !NOISE_TOKENS.has(t)).join(" ").trim();
}

function splitNomPrenom(fullName: string): { nom: string; prenom: string } {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { nom: "", prenom: "" };
  if (parts.length === 1) return { nom: parts[0], prenom: "" };
  const nomParts = parts.filter((p) => /^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));
  const prenomParts = parts.filter((p) => !/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));
  if (nomParts.length > 0 && prenomParts.length > 0) return { nom: nomParts.join(" "), prenom: prenomParts.join(" ") };
  return { nom: parts.slice(0, -1).join(" "), prenom: parts[parts.length - 1] };
}

function addPersonne(fullName: string, nss: string, dob: string, personnes: Personne[], seen: Set<string>): void {
  const cleaned = cleanPersonneName(fullName);
  if (!cleaned || NAME_BLACKLIST.test(cleaned)) return;
  const key = `${cleaned}-${nss || dob}`;
  if (seen.has(key)) return;
  seen.add(key);
  const { nom, prenom } = splitNomPrenom(clean(cleaned));
  personnes.push({ nom, prenom, numeroSecuriteSociale: nss, dateNaissance: dob });
}

export function computeMutuelleConfidence(data: Omit<MutuelleData, "fieldConfidence">): Record<string, number> {
  const conf: Record<string, number> = {};
  const set = (key: string, val: string, score: number) => { if (val.trim()) conf[key] = score; };
  if (data.numeroSecuriteSociale.trim()) conf["numeroSecuriteSociale"] = /^\d{13,15}$/.test(data.numeroSecuriteSociale.replace(/\s/g, "")) ? 0.92 : 0.55;
  if (data.numeroAMC.trim()) conf["numeroAMC"] = /^\d{8,9}$/.test(data.numeroAMC.replace(/\s/g, "")) ? 0.88 : 0.55;
  if (data.dateDebutValidite.trim()) conf["dateDebutValidite"] = DATE_DDMMYYYY.test(data.dateDebutValidite.trim()) ? 0.85 : 0.58;
  if (data.dateFinValidite.trim()) conf["dateFinValidite"] = DATE_DDMMYYYY.test(data.dateFinValidite.trim()) ? 0.85 : 0.58;
  set("organisme", data.organisme, 0.75);
  set("numeroAdherent", data.numeroAdherent, 0.70);
  set("numeroTeletransmission", data.numeroTeletransmission, 0.70);
  set("typeConv", data.typeConv, 0.70);
  set("nom", data.nom, 0.70);
  set("prenom", data.prenom, 0.70);
  if (data.dateNaissance.trim()) conf["dateNaissance"] = DATE_DDMMYYYY.test(data.dateNaissance.trim()) ? 0.85 : 0.58;
  return conf;
}

export function parseMutuelle(text: string): MutuelleData {
  const t = text;
  const amcMatch = t.match(/(?:n[°o\.]\s*amc|amc)\s*[:\s]+([\d\s]+)/i);
  const numeroAMC = amcMatch ? normalizeNSS(amcMatch[1]).replace(/\s+$/, "") : "";
  const adherentMatch = t.match(/(?:n[°o\.]\s*adh[eé]rent|n[°o\.]\s*assur[eé])\s*[:\s]+([A-Z0-9]{5,})/i);
  const numeroAdherent = adherentMatch ? adherentMatch[1] : "";
  const teleMatch = t.match(/(?:t[eé]l[eé]transmission|n[°o\.]\s*t[eé]l[eé]trans)\s*[:\s]+(\d+)/i);
  const numeroTeletransmission = teleMatch ? teleMatch[1] : "";
  const typeConvMatch = t.match(/type\s+conv[^:\n]*[:\s]+([^\n]+)/i);
  const typeConv = typeConvMatch ? clean(typeConvMatch[1].split(/[(\n]/)[0]) : "";
  const organismeMatch = t.match(new RegExp(`([A-ZÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\\s0-9]+(?:${ORGA_KEYWORDS})[A-Za-zÀ-ÖØ-öø-ÿ\\s0-9]*)`, "i"));
  const organisme = organismeMatch ? clean(organismeMatch[1]) : "";
  const debutMatch = t.match(/(?:du|valable\s+du|p[eé]riode[^\n]{0,20}?du|p[eé]riode\s+de)\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  const finMatch = t.match(/(?:au|jusqu'au|validit[eé])\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
  let dateDebutValidite = debutMatch ? debutMatch[1] : "";
  let dateFinValidite = finMatch ? finMatch[1] : "";
  if (!dateDebutValidite) {
    const rangeDateMatch = t.match(/(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})\s+au\s+(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4})/i);
    if (rangeDateMatch) { dateDebutValidite = rangeDateMatch[1]; if (!dateFinValidite) dateFinValidite = rangeDateMatch[2]; }
  }
  const inseeMatch = t.match(/n[°o\.]\s*insee\s*[:\s]+([\d\s]{13,22})/i);
  const inseeNSS = inseeMatch ? normalizeNSS(inseeMatch[1]).slice(0, 15) : "";

  const personnes: Personne[] = [];
  const seen = new Set<string>();
  const MAX_REGEX_ITER = 500;
  const fmt1 = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{1,40}?) +(\d{13,15}) +(\d{2}[\/\-]\d{2}[\/\-]\d{4})/g;
  let m: RegExpExecArray | null;
  let iter = 0;
  while ((m = fmt1.exec(t)) !== null && iter++ < MAX_REGEX_ITER) addPersonne(m[1], m[2], m[3], personnes, seen);
  const fmt2 = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1,2}\s+([12][\d\s]{14,25})/g;
  iter = 0; while ((m = fmt2.exec(t)) !== null && iter++ < MAX_REGEX_ITER) { const nss = normalizeNSS(m[3]).slice(0, 15); if (nss.length >= 13) addPersonne(m[1], nss, m[2], personnes, seen); }
  const fmtTableNSS = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})[^\n]+\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1,2}\s+([12][\d\s]{14,25})/g;
  iter = 0; while ((m = fmtTableNSS.exec(t)) !== null && iter++ < MAX_REGEX_ITER) { const nss = normalizeNSS(m[3]).slice(0, 15); if (nss.length >= 13) addPersonne(m[1], nss, m[2], personnes, seen); }
  const fmt2b = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})\n[^\n]{0,80}?(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1,2}\s+([12][\d\s]{14,25})/g;
  iter = 0; while ((m = fmt2b.exec(t)) !== null && iter++ < MAX_REGEX_ITER) { const nss = normalizeNSS(m[3]).slice(0, 15); if (nss.length >= 13) addPersonne(m[1], nss, m[2], personnes, seen); }
  if (personnes.length === 0) {
    const fmtTableNoNSS = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})[^\n]+\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1}/g;
    iter = 0; while ((m = fmtTableNoNSS.exec(t)) !== null && iter++ < MAX_REGEX_ITER) { const nss = personnes.length === 0 ? inseeNSS : ""; addPersonne(m[1], nss, m[2], personnes, seen); }
  }
  if (personnes.length === 0) {
    const fmt3a = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40}?) {2,}(\d{2}[\/\-]\d{2}[\/\-]\d{4}) +\d{1,2}/g;
    iter = 0; while ((m = fmt3a.exec(t)) !== null && iter++ < MAX_REGEX_ITER) { const nss = personnes.length === 0 ? inseeNSS : ""; addPersonne(m[1], nss, m[2], personnes, seen); }
    if (personnes.length === 0) {
      const fmt3b = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ -]{2,40})\n(\d{2}[\/\-]\d{2}[\/\-]\d{4})\s+\d{1}/g;
      iter = 0; while ((m = fmt3b.exec(t)) !== null && iter++ < MAX_REGEX_ITER) { const nss = personnes.length === 0 ? inseeNSS : ""; addPersonne(m[1], nss, m[2], personnes, seen); }
    }
  }
  if (personnes.length === 0) {
    const assureMatch = t.match(/assur[eé](?:\s+(?:social|principal(?:\s+amc)?))\s*[:\s]+([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ][A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i);
    if (assureMatch) addPersonne(clean(assureMatch[1].split("\n")[0]), inseeNSS, "", personnes, seen);
  }

  const first = personnes[0] ?? { nom: "", prenom: "", numeroSecuriteSociale: "", dateNaissance: "" };
  const result: Omit<MutuelleData, "fieldConfidence"> = { organisme, numeroAMC, numeroAdherent, numeroTeletransmission, typeConv, dateDebutValidite, dateFinValidite, nom: first.nom, prenom: first.prenom, numeroSecuriteSociale: first.numeroSecuriteSociale, dateNaissance: first.dateNaissance, personnes };
  return { ...result, fieldConfidence: computeMutuelleConfidence(result) };
}

export function scoreMutuelle(data: MutuelleData): number {
  const fields = [data.organisme, data.numeroAMC, data.numeroAdherent, data.nom, data.prenom, data.numeroSecuriteSociale, data.dateDebutValidite, data.dateFinValidite];
  let score = fields.filter((f) => f.trim().length > 0).length * 12.5;
  if (data.numeroSecuriteSociale.trim() && !/^\d{13}$/.test(data.numeroSecuriteSociale.replace(/\s/g, ""))) score -= 20;
  if (data.dateDebutValidite.trim() && !DATE_DDMMYYYY.test(data.dateDebutValidite.trim())) score -= 10;
  if (data.dateFinValidite.trim() && !DATE_DDMMYYYY.test(data.dateFinValidite.trim())) score -= 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function mergeMutuelle(primary: MutuelleData, secondary: MutuelleData): MutuelleData {
  const personnes = mergePersonnes(primary.personnes, secondary.personnes);
  const first = personnes[0] ?? { nom: "", prenom: "", numeroSecuriteSociale: "", dateNaissance: "" };
  const merged: Omit<MutuelleData, "fieldConfidence"> = { organisme: pick(primary.organisme, secondary.organisme), numeroAMC: pick(primary.numeroAMC, secondary.numeroAMC), numeroAdherent: pick(primary.numeroAdherent, secondary.numeroAdherent), numeroTeletransmission: pick(primary.numeroTeletransmission, secondary.numeroTeletransmission), typeConv: pick(primary.typeConv, secondary.typeConv), dateDebutValidite: pick(primary.dateDebutValidite, secondary.dateDebutValidite), dateFinValidite: pick(primary.dateFinValidite, secondary.dateFinValidite), nom: pick(primary.nom, first.nom), prenom: pick(primary.prenom, first.prenom), numeroSecuriteSociale: pick(primary.numeroSecuriteSociale, first.numeroSecuriteSociale), dateNaissance: pick(primary.dateNaissance, first.dateNaissance), personnes };
  return { ...merged, fieldConfidence: computeMutuelleConfidence(merged) };
}
