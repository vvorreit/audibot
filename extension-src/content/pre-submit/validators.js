/* ── AudiBot Pre-Submit Validators ──────────────────────────────────────── */
/* Static validation functions for form data before submission.             */
/* Each returns { valid, type, message, fix? } or null if OK.              */

import { validateLuhnNSS } from "../utils/nss.js";

/* ── LPP Plafonds connus ─────────────────────────────────────────────────── */

var LPP_PLAFONDS = {
  "2261874": 470,   // Monture adulte
  "2200443": 150,   // Monture enfant
  "2287916": 420,   // Verre unifocal
  "2252814": 350,   // Verre progressif classe A
  "2259966": 590,   // Verre progressif classe B
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function parseFRDate(dateStr) {
  if (!dateStr) return null;
  var str = String(dateStr).trim();
  /* DD/MM/YYYY */
  var parts = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (parts) {
    var d = new Date(parseInt(parts[3], 10), parseInt(parts[2], 10) - 1, parseInt(parts[1], 10));
    return isNaN(d.getTime()) ? null : d;
  }
  /* YYYY-MM-DD */
  var iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    var d2 = new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
    return isNaN(d2.getTime()) ? null : d2;
  }
  return null;
}

function diffYears(from, to) {
  return (to.getTime() - from.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

/* ── 1. Validate NSS ────────────────────────────────────────────────────── */

export function validateNSS(nss) {
  if (!nss) return null;
  var cleaned = String(nss).replace(/\s/g, "");
  if (cleaned.length === 0) return null;

  /* Check basic format: 13 digits (with optional 2A/2B for Corsica) + 2 digit key */
  var corseAdjusted = cleaned.replace(/2A/gi, "19").replace(/2B/gi, "18");
  var digits = corseAdjusted.replace(/\D/g, "");

  if (digits.length < 13) {
    return { valid: false, type: "error", message: "NSS trop court (" + digits.length + " chiffres, 13+2 attendus)", fix: "Verifier le numero de securite sociale — doit contenir 13 chiffres + 2 chiffres de cle" };
  }

  if (digits.length >= 15) {
    var num = parseInt(digits.slice(0, 13), 10);
    var cle = parseInt(digits.slice(13, 15), 10);
    var expectedCle = 97 - (num % 97);
    if (cle !== expectedCle) {
      return { valid: false, type: "error", message: "Cle NSS invalide (cle " + cle + ", attendu " + expectedCle + ")", fix: "Verifier le numero de securite sociale — la cle de controle ne correspond pas" };
    }
  } else if (digits.length > 13 && digits.length < 15) {
    return { valid: false, type: "error", message: "NSS incomplet (" + digits.length + " chiffres, 15 attendus)", fix: "Le NSS doit comporter 13 chiffres + 2 chiffres de cle" };
  }

  /* Also run the existing Luhn-based check for extra safety */
  if (!validateLuhnNSS(nss)) {
    return { valid: false, type: "error", message: "NSS invalide (echec de la validation)", fix: "Verifier le numero de securite sociale" };
  }

  return null;
}

/* ── 2. Validate RPPS ───────────────────────────────────────────────────── */

export function validateRPPS(rpps) {
  if (!rpps) return null;
  var cleaned = String(rpps).replace(/\s/g, "").replace(/\D/g, "");
  if (cleaned.length === 0) return null;

  if (cleaned.length !== 11) {
    return { valid: false, type: "error", message: "RPPS invalide (" + cleaned.length + " chiffres, 11 attendus)", fix: "Le numero RPPS doit comporter exactement 11 chiffres" };
  }

  /* Luhn check */
  var sum = 0;
  for (var i = 0; i < cleaned.length; i++) {
    var digit = parseInt(cleaned.charAt(cleaned.length - 1 - i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  if (sum % 10 !== 0) {
    return { valid: false, type: "error", message: "RPPS invalide (echec du controle Luhn)", fix: "Verifier le numero RPPS du prescripteur" };
  }

  return null;
}

/* ── 3. Validate Date Ordonnance ────────────────────────────────────────── */

export function validateDateOrdonnance(dateStr, isLentilles) {
  if (!dateStr) return null;
  var date = parseFRDate(dateStr);
  if (!date) {
    return { valid: false, type: "error", message: "Date d'ordonnance invalide : \"" + dateStr + "\"", fix: "Saisir une date au format JJ/MM/AAAA" };
  }

  var now = new Date();
  if (date > now) {
    return { valid: false, type: "error", message: "Date d'ordonnance dans le futur", fix: "La date d'ordonnance ne peut pas etre dans le futur" };
  }

  var ageYears = diffYears(date, now);

  if (isLentilles) {
    if (ageYears > 1) {
      return { valid: false, type: "error", message: "Ordonnance lentilles expiree (" + Math.floor(ageYears * 12) + " mois, max 12 mois)", fix: "L'ordonnance pour lentilles ne doit pas avoir plus de 1 an" };
    }
  } else {
    /* Verres */
    if (ageYears > 5) {
      return { valid: false, type: "error", message: "Ordonnance verres expiree (" + Math.floor(ageYears) + " ans, max 5 ans)", fix: "L'ordonnance pour verres ne doit pas avoir plus de 5 ans" };
    }
    if (ageYears > 3) {
      return { valid: false, type: "warning", message: "Ordonnance verres ancienne (" + Math.floor(ageYears) + " ans)", fix: "L'ordonnance a plus de 3 ans — verifier qu'elle est toujours valide" };
    }
  }

  return null;
}

/* ── 4. NSS / Date de naissance concordance ─────────────────────────────── */

export function validateNSSDateConcordance(nss, dateNaissance) {
  if (!nss || !dateNaissance) return null;
  var cleaned = String(nss).replace(/\s/g, "");
  var corseAdjusted = cleaned.replace(/2A/gi, "19").replace(/2B/gi, "18");
  var digits = corseAdjusted.replace(/\D/g, "");
  if (digits.length < 7) return null;

  var nssYear = digits.slice(1, 3);
  var nssMonth = digits.slice(3, 5);

  var dob = parseFRDate(dateNaissance);
  if (!dob) return null;

  var dobYear = String(dob.getFullYear()).slice(-2);
  var dobMonth = String(dob.getMonth() + 1).padStart(2, "0");

  if (nssYear !== dobYear) {
    return { valid: false, type: "error", message: "NSS/date de naissance : annee discordante (NSS=" + nssYear + ", naissance=" + dobYear + ")", fix: "L'annee dans le NSS ne correspond pas a la date de naissance" };
  }

  if (nssMonth !== dobMonth) {
    return { valid: false, type: "error", message: "NSS/date de naissance : mois discordant (NSS=" + nssMonth + ", naissance=" + dobMonth + ")", fix: "Le mois dans le NSS ne correspond pas a la date de naissance" };
  }

  return null;
}

/* ── 5. NSS / Civilite concordance ──────────────────────────────────────── */

var CIVILITE_HOMME = ["m.", "mr", "mr.", "monsieur", "m", "1"];
var CIVILITE_FEMME = ["mme", "mme.", "madame", "mademoiselle", "mlle", "mlle.", "2"];

export function validateNSSCiviliteConcordance(nss, civilite) {
  if (!nss || !civilite) return null;
  var cleaned = String(nss).replace(/\s/g, "");
  if (cleaned.length === 0) return null;

  var firstDigit = cleaned.charAt(0);
  if (firstDigit !== "1" && firstDigit !== "2") return null;

  var civNorm = String(civilite).trim().toLowerCase();
  var isHomme = CIVILITE_HOMME.indexOf(civNorm) !== -1;
  var isFemme = CIVILITE_FEMME.indexOf(civNorm) !== -1;

  if (!isHomme && !isFemme) return null; /* civilite inconnue, pas de check */

  if (firstDigit === "1" && isFemme) {
    return { valid: false, type: "error", message: "NSS commence par 1 (homme) mais civilite = \"" + civilite + "\"", fix: "Verifier la concordance entre le NSS et la civilite du beneficiaire" };
  }
  if (firstDigit === "2" && isHomme) {
    return { valid: false, type: "error", message: "NSS commence par 2 (femme) mais civilite = \"" + civilite + "\"", fix: "Verifier la concordance entre le NSS et la civilite du beneficiaire" };
  }

  return null;
}

/* ── 6. Montant / Plafond LPP ───────────────────────────────────────────── */

export function validateMontantPlafond(montant, codeActe, portail) {
  if (!montant || !codeActe) return null;
  var val = parseFloat(String(montant).replace(",", ".").replace(/[^\d.]/g, ""));
  if (isNaN(val)) return null;

  var code = String(codeActe).replace(/\s/g, "");
  var plafond = LPP_PLAFONDS[code];
  if (plafond === undefined) return null;

  if (val > plafond) {
    return { valid: false, type: "warning", message: "Montant " + val.toFixed(2) + " EUR depasse le plafond LPP " + plafond + " EUR (code " + code + ")", fix: "Verifier le montant — le plafond LPP pour ce code est de " + plafond + " EUR" };
  }

  return null;
}

/* ── 7. Champs requis ───────────────────────────────────────────────────── */

var CHAMPS_REQUIS_DEFAULT = ["nss", "dateNaissance", "nom", "prenom"];

export function validateChampsRequis(fields, portail) {
  if (!fields) return null;
  var missing = [];
  var required = CHAMPS_REQUIS_DEFAULT;

  for (var i = 0; i < required.length; i++) {
    var key = required[i];
    var val = fields[key];
    if (val === undefined || val === null || String(val).trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    return { valid: false, type: "error", message: "Champs requis manquants : " + missing.join(", "), fix: "Remplir les champs obligatoires avant de soumettre" };
  }

  return null;
}

/* ── 8. Validate Optical Ranges (#5) ───────────────────────────────────── */

var OPTICAL_RANGES = {
  sphere:   { min: -25, max: 25, label: "Sph\u00e8re" },
  cylindre: { min: -10, max: 10, label: "Cylindre" },
  axe:      { min: 0,   max: 180, label: "Axe" },
  addition: { min: 0.25, max: 4, label: "Addition" }
};

export function validateOpticalValues(formData) {
  var warnings = [];
  var opticalFields = [
    { key: "lunettesOD.sphere", type: "sphere" }, { key: "lunettesOG.sphere", type: "sphere" },
    { key: "lunettesOD.cylindre", type: "cylindre" }, { key: "lunettesOG.cylindre", type: "cylindre" },
    { key: "lunettesOD.axe", type: "axe" }, { key: "lunettesOG.axe", type: "axe" },
    { key: "lunettesOD.addition", type: "addition" }, { key: "lunettesOG.addition", type: "addition" },
    { key: "lentillesOD.sphere", type: "sphere" }, { key: "lentillesOG.sphere", type: "sphere" },
    { key: "lentillesOD.cylindre", type: "cylindre" }, { key: "lentillesOG.cylindre", type: "cylindre" },
    { key: "lentillesOD.axe", type: "axe" }, { key: "lentillesOG.axe", type: "axe" },
    { key: "lentillesOD.addition", type: "addition" }, { key: "lentillesOG.addition", type: "addition" }
  ];

  /* Helper pour accéder aux clés imbriquées (ex: "lunettesOD.sphere" → formData.lunettesOD.sphere) */
  function getNestedValue(obj, path) {
    var parts = path.split(".");
    var current = obj;
    for (var pi = 0; pi < parts.length; pi++) {
      if (current === null || current === undefined) return undefined;
      current = current[parts[pi]];
    }
    return current;
  }

  for (var i = 0; i < opticalFields.length; i++) {
    var field = opticalFields[i];
    /* Essayer d'abord la clé plate (champ de formulaire nommé "lunettesOD.sphere"),
       puis la clé imbriquée (objet JS avec formData.lunettesOD.sphere) */
    var val = formData[field.key] || getNestedValue(formData, field.key);
    if (!val) continue;
    var num = parseFloat(String(val).replace(",", "."));
    if (isNaN(num)) continue;
    var range = OPTICAL_RANGES[field.type];
    if (num < range.min || num > range.max) {
      warnings.push({ valid: false, type: "warning", message: range.label + " hors plage : " + val + " (" + field.key + "), attendu " + range.min + " \u00e0 " + range.max, fix: "V\u00e9rifier la valeur " + range.label + " — elle semble hors des plages habituelles" });
    }
  }
  return warnings.length > 0 ? warnings : null;
}

/* ── 9. Cross-field validation (#4) ───────────────────────────────────── */

export function validateCrossFields(formData) {
  var results = [];

  /* NSS + DOB + Civilité combinés */
  var nssResult = validateNSSDateConcordance(formData.nss || formData.numeroSecuriteSociale, formData.dateNaissance);
  if (nssResult) results.push(nssResult);

  var civResult = validateNSSCiviliteConcordance(formData.nss || formData.numeroSecuriteSociale, formData.civilite);
  if (civResult) results.push(civResult);

  /* Optique */
  var optResults = validateOpticalValues(formData);
  if (optResults) results = results.concat(optResults);

  return results;
}

/* ── 10. Run All Validations ────────────────────────────────────────────── */

export function runAllValidations(formData, portail) {
  var errors = [];
  var warnings = [];
  var passed = [];

  var checks = [
    { name: "NSS", fn: function() { return validateNSS(formData.nss); } },
    { name: "RPPS", fn: function() { return validateRPPS(formData.rpps); } },
    { name: "Date ordonnance", fn: function() { return validateDateOrdonnance(formData.dateOrdonnance, formData.isLentilles); } },
    { name: "NSS / Date naissance", fn: function() { return validateNSSDateConcordance(formData.nss, formData.dateNaissance); } },
    { name: "NSS / Civilite", fn: function() { return validateNSSCiviliteConcordance(formData.nss, formData.civilite); } },
    { name: "Montant / Plafond LPP", fn: function() { return validateMontantPlafond(formData.montant, formData.codeActe, portail); } },
    { name: "Champs requis", fn: function() { return validateChampsRequis(formData, portail); } },
    { name: "Valeurs optiques", fn: function() { var r = validateOpticalValues(formData); return r ? r[0] : null; } },
  ];

  for (var i = 0; i < checks.length; i++) {
    var check = checks[i];
    try {
      var result = check.fn();
      if (result === null) {
        passed.push({ name: check.name, message: "OK" });
      } else if (result.type === "error") {
        errors.push({ name: check.name, message: result.message, fix: result.fix || null });
      } else if (result.type === "warning") {
        warnings.push({ name: check.name, message: result.message, fix: result.fix || null });
      }
    } catch (err) {
      errors.push({ name: check.name, message: "Erreur interne : " + err.message, fix: null });
    }
  }

  return { errors: errors, warnings: warnings, passed: passed };
}
