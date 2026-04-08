import { OrdonnanceData, CorrectionOeil, CorrectionLentille } from "./types";
import { clean, findAfterKeyword, parseOpticalValue, pick, mergeCorrection, mergeLentille, DATE_PATTERN, NUMERIC_OPTICAL } from "./utils";

const EMPTY_OEIL: CorrectionOeil = { sphere: "", cylindre: "", axe: "", addition: "" };
const EMPTY_LENTILLE: CorrectionLentille = { sphere: "", cylindre: "", axe: "", addition: "", rayonCourbure: "", diametre: "" };

function extractEyeSection(text: string, side: "droit" | "gauche"): string {
  const thisSide = side === "droit" ? "(?:oeil\\s+droit|\\bO\\.?D\\.?\\b)" : "(?:oeil\\s+gauche|\\bO\\.?G\\.?\\b)";
  const otherSide = side === "droit" ? "(?:oeil\\s+gauche|\\bO\\.?G\\.?\\b)" : "(?:oeil\\s+droit|\\bO\\.?D\\.?\\b)";
  const re = new RegExp(`${thisSide}[:\\s]+(.+?)(?=${otherSide}|$)`, "is");
  const m = text.match(re);
  return m ? m[1].slice(0, 300) : "";
}

function parseEyeSection(section: string): CorrectionOeil {
  let sphere = "", cylindre = "", axe = "", addition = "";
  const corMatch = section.match(/(plano|[+\-]?\d+[.,]\d+)\s*\(\s*([+\-]?\d+[.,]\d+)(?:\s*(?:à|a|[xX])\s*(\d{1,3})°?)?\s*\)(?:\s*(\d{1,3})°)?/i);
  if (corMatch) {
    sphere = parseOpticalValue(corMatch[1]);
    cylindre = parseOpticalValue(corMatch[2]);
    axe = corMatch[3] || corMatch[4] || "";
  } else {
    const sphMatch = section.match(/(?:finale\s*:?\s*)?([+\-]?\d+[.,]\d+)/i);
    if (sphMatch) sphere = parseOpticalValue(sphMatch[1]);
  }
  const addMatch = section.match(/[Aa]ddition\s*[:\s]+([+\-]?\d+[.,]\d+)/);
  if (addMatch) addition = parseOpticalValue(addMatch[1]);
  return { sphere, cylindre, axe, addition };
}

function extractODOGLine(text: string, keyword: string): [string, string] {
  const lines = text.split("\n");
  for (const line of lines) {
    if (new RegExp(keyword, "i").test(line)) {
      const values = line.match(/([+\-]?\d{1,2}[.,]\d{2}|pl(?:ano)?|\d{1,3}°)/gi);
      if (values && values.length >= 2) return [parseOpticalValue(values[0]), parseOpticalValue(values[1])];
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
  return { sphere: sphOD, cylindre: cylOD, axe: axeOD_raw.replace(/[^\d]/g, ""), addition: addOD };
}

function fallbackOG(text: string): CorrectionOeil {
  const [, sphOG] = extractODOGLine(text, "sph[eè]?r?e?");
  const [, cylOG] = extractODOGLine(text, "cyl(?:indre)?");
  const [, axeOG_raw] = extractODOGLine(text, "ax[e]?(?:is)?");
  const [, addOG] = extractODOGLine(text, "add(?:ition)?");
  return { sphere: sphOG, cylindre: cylOG, axe: axeOG_raw.replace(/[^\d]/g, ""), addition: addOG };
}

export function computeOrdonnanceConfidence(data: Omit<OrdonnanceData, "fieldConfidence">): Record<string, number> {
  const conf: Record<string, number> = {};
  const set = (key: string, val: string, score: number) => { if (val.trim()) conf[key] = score; };
  if (data.dateOrdonnance.trim()) conf["dateOrdonnance"] = DATE_PATTERN.test(data.dateOrdonnance.trim()) ? 0.88 : 0.60;
  set("nomOphtalmologue", data.nomOphtalmologue, 0.72);
  if (data.rpps.trim()) conf["rpps"] = /^\d{11}$/.test(data.rpps.trim()) ? 0.92 : 0.55;
  if (data.adeli.trim()) conf["adeli"] = /^\d{9}$/.test(data.adeli.trim()) ? 0.90 : 0.55;
  set("nomPatient", data.nomPatient, 0.72);
  set("prenomPatient", data.prenomPatient, 0.72);
  if (data.dateNaissancePatient.trim()) conf["dateNaissancePatient"] = DATE_PATTERN.test(data.dateNaissancePatient.trim()) ? 0.88 : 0.60;
  if (data.dateValidite.trim()) conf["dateValidite"] = DATE_PATTERN.test(data.dateValidite.trim()) ? 0.88 : 0.60;
  set("distancePupillaire", data.distancePupillaire, 0.70);
  set("remarques", data.remarques, 0.70);
  for (const side of ["OD", "OG"] as const) {
    const oeil = side === "OD" ? data.lunettesOD : data.lunettesOG;
    for (const field of ["sphere", "cylindre", "axe", "addition"] as const) {
      const v = oeil[field].trim();
      if (v) conf[`lunettes${side}.${field}`] = NUMERIC_OPTICAL.test(v) || /^\d{1,3}$/.test(v) ? 0.90 : 0.60;
    }
  }
  return conf;
}

export function parseOrdonnance(text: string): OrdonnanceData {
  const medecinMatch = text.match(/(?:Dr\.?|Docteur|Ophtalmologue|Ophtalmo\.?)\s+([A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i);
  const nomOphtalmologue = medecinMatch ? clean(medecinMatch[1].split("\n")[0]) : "";
  const rppsMatch = text.match(/(?:RPPS|R\.?P\.?P\.?S\.?)[^\d]*(\d{11})/i);
  const rpps = rppsMatch ? rppsMatch[1] : "";
  const adeliMatch = text.match(/(?:ADELI|Ad[eé]li|N[°o]\s*AM)[^\d]*(\d{9})/i);
  const adeli = adeliMatch ? adeliMatch[1] : "";
  const dateMatch = text.match(/(?:le\s+|date\s*:?\s*|fait\s+le\s+)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i) ||
    text.match(/(?:le\s+)(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i) ||
    text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/);
  const dateOrdonnance = dateMatch ? dateMatch[1] : "";
  const dateValiditeMatch = text.match(/(?:valable|validit[eé]|jusqu|[eé]ch[eé]ance)[^\n]*?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  const dateValidite = dateValiditeMatch ? dateValiditeMatch[1] : "";

  let nomPatient = "", prenomPatient = "";
  const civMatch = text.match(/(?:Monsieur|Madame|M\.\s+|Mme\.?\s+|Enfant\s+)\s*([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i);
  if (civMatch) {
    const fullName = clean(civMatch[1].split("\n")[0]);
    const parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const nomParts = parts.filter((p) => /^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));
      const prenomParts = parts.filter((p) => !/^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜÇ\-]+$/.test(p));
      if (nomParts.length > 0 && prenomParts.length > 0) { nomPatient = nomParts.join(" "); prenomPatient = prenomParts.join(" "); }
      else { nomPatient = parts.slice(0, -1).join(" "); prenomPatient = parts[parts.length - 1]; }
    } else nomPatient = fullName;
  } else {
    const patientMatch = text.match(/(?:patient|nom\s*:?|m\.?\s|mme\.?\s)\s*:?\s*([A-Za-zÀ-ÖØ-öø-ÿ\s\-]+)/i);
    if (patientMatch) nomPatient = clean(patientMatch[1].split("\n")[0]);
    prenomPatient = findAfterKeyword(text, ["pr[eé]nom"]);
  }
  const dnMatch = text.match(/(?:n[eé][e]?\s+le|date\s+de\s+naissance|d\.?n\.?b?)[^\d]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})/i);
  const dateNaissancePatient = dnMatch ? dnMatch[1] : "";
  const dpMatch = text.match(/(?:distance\s+pupillaire|[eé]cart\s+inter.?pupillaire|\bDP\b)[^\d]*(\d{2}(?:[.,]\d)?)\s*mm/i);
  const distancePupillaire = dpMatch ? dpMatch[1].replace(",", ".") : "";
  const hasLunettes = /lunettes|verres?|monture/i.test(text), hasLentilles = /lentilles?|lc\b|contact/i.test(text);
  let typePrescription: OrdonnanceData["typePrescription"] = "";
  if (hasLunettes && hasLentilles) typePrescription = "les deux"; else if (hasLunettes) typePrescription = "lunettes"; else if (hasLentilles) typePrescription = "lentilles";

  const odSection = extractEyeSection(text, "droit"), ogSection = extractEyeSection(text, "gauche");
  let lunettesOD = EMPTY_OEIL, lunettesOG = EMPTY_OEIL;
  if (odSection) lunettesOD = parseEyeSection(odSection);
  if (ogSection) lunettesOG = parseEyeSection(ogSection);
  if (!odSection && !ogSection) { lunettesOD = fallbackOD(text); lunettesOG = fallbackOG(text); }

  const bcOD = text.match(/(?:bc|r[. ]?b|rayon[^,\n]{0,10}?|base curve)[^\d]*(\d{1,2}[.,]\d{1})/i)?.[1].replace(",", ".") || "";
  const diaOD = text.match(/(?:dia(?:m[eè]tre)?)[^\d]*(\d{2}[.,]\d{1})/i)?.[1].replace(",", ".") || "";
  const lentillesOD: CorrectionLentille = { ...EMPTY_LENTILLE, ...lunettesOD, rayonCourbure: bcOD, diametre: diaOD };
  const lentillesOG: CorrectionLentille = { ...EMPTY_LENTILLE, ...lunettesOG, rayonCourbure: bcOD, diametre: diaOD };
  const remarquesMatch = text.match(/(?:remarques?|observations?|notes?|commentaires?)[^\n]*?\n([^\n]+)/i);
  const remarques = remarquesMatch ? clean(remarquesMatch[1]) : "";

  const result: Omit<OrdonnanceData, "fieldConfidence"> = { nomOphtalmologue, rpps, adeli, dateOrdonnance, dateValidite, nomPatient, prenomPatient, dateNaissancePatient, distancePupillaire, typePrescription, lunettesOD, lunettesOG, lentillesOD, lentillesOG, remarques };
  return { ...result, fieldConfidence: computeOrdonnanceConfidence(result) };
}

export function scoreOrdonnance(data: OrdonnanceData): number {
  const fields = [data.nomOphtalmologue, data.dateOrdonnance, data.nomPatient, data.typePrescription, data.lunettesOD.sphere, data.lunettesOG.sphere];
  let score = fields.filter((f) => f.trim().length > 0).length * (100 / 6);
  if (data.lunettesOD.sphere.trim() && isNaN(parseFloat(data.lunettesOD.sphere))) score -= 15;
  if (data.lunettesOG.sphere.trim() && isNaN(parseFloat(data.lunettesOG.sphere))) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

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
