/* ── NSS (Numero Securite Sociale) Utility Functions ───────────────────── */

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

/**
 * Pour un mineur, retourne le NSS de l'ouvrant droit (mère en priorité = NSS commençant par 2).
 * Si le bénéficiaire est majeur, retourne son propre NSS.
 */
export function getOuvrantDroitNSS(beneficiaireNSS, beneficiaireDOB, personnes) {
  if (!personnes || personnes.length <= 1) return beneficiaireNSS;
  if (!beneficiaireDOB || !isUnder18(beneficiaireDOB)) return beneficiaireNSS;

  /* Chercher la mère (NSS commence par 2, majeure) */
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
