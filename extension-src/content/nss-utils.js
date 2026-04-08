/* ── NSS & Droits Utilities ────────────────────────────────────────────── */

import { showRPAToast } from "./rpa-utils.js";

export function validateLuhnNSS(nss) {
  var digits = nss.replace(/\D/g, "");
  if (digits.length < 13) return false;
  var n = digits.slice(0, 13).replace(/2A/i, "19").replace(/2B/i, "18");
  var num = parseInt(n, 10);
  if (isNaN(num)) return false;
  if (digits.length >= 15) {
    var cle = parseInt(digits.slice(13, 15), 10);
    return (97 - (num % 97)) === cle;
  }
  return true;
}

export function isUnder18(dob) {
  /* Accepte DD/MM/YYYY ou YYYY-MM-DD */
  let d;
  if (dob.includes("/")) {
    const p = dob.split("/");
    d = new Date(p[2], p[1] - 1, p[0]);
  } else {
    d = new Date(dob);
  }
  if (isNaN(d.getTime())) return false;
  const age = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age < 18;
}

/**
 * Pour un mineur, retourne le NSS de l'ouvrant droit (mere en priorite = NSS commencant par 2).
 * Si le beneficiaire est majeur, retourne son propre NSS.
 */
export function getOuvrantDroitNSS(beneficiaireNSS, beneficiaireDOB, personnes) {
  if (!personnes || personnes.length <= 1) return beneficiaireNSS;
  if (!beneficiaireDOB || !isUnder18(beneficiaireDOB)) return beneficiaireNSS;

  /* Chercher la mere (NSS commence par 2, majeure) */
  for (var i = 0; i < personnes.length; i++) {
    var p = personnes[i];
    var pNSS = (p.numeroSecuriteSociale || "").replace(/\D/g, "");
    if (pNSS.startsWith("2") && pNSS.length >= 13 && p.dateNaissance && !isUnder18(p.dateNaissance)) {
      return p.numeroSecuriteSociale;
    }
  }
  /* Fallback : premier adulte avec un NSS valide */
  for (var i = 0; i < personnes.length; i++) {
    var p = personnes[i];
    var pNSS = (p.numeroSecuriteSociale || "").replace(/\D/g, "");
    if (pNSS.length >= 13 && p.dateNaissance && !isUnder18(p.dateNaissance)) {
      return p.numeroSecuriteSociale;
    }
  }
  return beneficiaireNSS;
}

/* ── checkDroitsMutuelle — alerte si droits expires ou bientot expires ── */
export function checkDroitsMutuelle(data) {
  var m = data.m || data || {};
  var dateFin = m.dateFinValidite || "";
  var dateDebut = m.dateDebutValidite || "";
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dateFin) {
    var parts = dateFin.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (parts) {
      var finDate = new Date(parseInt(parts[3]), parseInt(parts[2]) - 1, parseInt(parts[1]));
      if (finDate < today) {
        showRPAToast("\u26D4 Droits mutuelle expir\u00E9s depuis le " + dateFin, "error");
        return;
      }
      var diffDays = Math.ceil((finDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        showRPAToast("\u26A0\uFE0F Droits mutuelle expirent dans " + diffDays + " jour" + (diffDays > 1 ? "s" : "") + " (" + dateFin + ")", "warning");
        return;
      }
    }
  }

  if (dateDebut) {
    var partsD = dateDebut.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (partsD) {
      var debutDate = new Date(parseInt(partsD[3]), parseInt(partsD[2]) - 1, parseInt(partsD[1]));
      if (debutDate > today) {
        showRPAToast("\u26A0\uFE0F Droits mutuelle pas encore actifs (d\u00E9but : " + dateDebut + ")", "warning");
      }
    }
  }
}
