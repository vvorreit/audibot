/* ── Data Extraction Functions ──────────────────────────────────────────── */
/* Exports: getCachedClient, getSmartFillData. ~100 lignes */

export async function getCachedClient(data) {
  var cache = await readEncryptedCache();
  if (!cache) return null;
  return cache.current || null;
}

export async function getSmartFillData() {
  var data = {};
  try {
    var text = await navigator.clipboard.readText();
    var parsed = JSON.parse(text);
    if (parsed.m || parsed.o) data = parsed;
  } catch(e) {}
  var cached = await getCachedClient(data);
  var m = cached || data.m || {};
  var o = data.o || (cached && cached.ordonnance) || {};

  /* Priorité : données mutuelle sur la carte, sinon ordonnance */
  var p = (m.personnes && m.personnes[0]) || {};
  /* Extraire les données du régime rc1 (TP Plus / mutuelle) */
  var rc1 = (m.regimes && m.regimes.rc1) || {};
  /* Extraire les données du régime obligatoire (RO) */
  var ro = (m.regimes && m.regimes.ro) || {};

  return {
    organisme:              m.organisme || rc1.nom || "",
    numeroAMC:              m.numeroAMC || rc1.numeroAMC || "",
    numeroAdherent:         m.numeroAdherent || rc1.numeroAdherent || rc1.numeroContrat || "",
    numeroTeletransmission: m.numeroTeletransmission || rc1.numeroTeletransmission || "",
    typeConv:               m.typeConv || rc1.codeConvention || "",
    dateDebutValidite:      m.dateDebutValidite || rc1.dateDebut || "",
    dateFinValidite:        m.dateFinValidite || rc1.dateFin || "",
    /* Régime obligatoire */
    regimeObligatoire:             ro.nom || "",
    roCodeRegime:                  ro.codeRegime || "",
    roCodeCentre:                  ro.codeCentre || "",
    roTauxPEC:                     ro.tauxPEC || "",
    roExoneration:                 ro.exonerationLabel || ro.exonerationTypeId || "",
    roPieceJustificative:          ro.pieceJustificativeLabel || ro.pieceJustificativeTypeId || "",
    roNatureAssurance:             ro.natureAssuranceLabel || ro.natureAssuranceTypeId || "",
    civilite:               cached.civilite || "",
    nom:                    (m.nom || p.nom || o.nomPatient || "").toUpperCase(),
    prenom:                 m.prenom || p.prenom || o.prenomPatient || "",
    nomNaissance:           cached.nomNaissance || cached.nomJeuneFille || "",
    nomAssure:              cached.nomAssure || "",
    numeroSecuriteSociale:  m.numeroSecuriteSociale || m.nss || p.numeroSecuriteSociale || "",
    dateNaissance:          m.dateNaissance || m.dob || p.dateNaissance || o.dateNaissancePatient || "",
    rangNaissance:          cached.rangNaissance || "",
    numeroContrat:          cached.numeroContrat || "",
    telephone: (function() {
      var raw = m.telephone || m.phone || "";
      if (!raw) return "";
      var digits = raw.replace(/\D/g, "");
      if (digits.length === 11 && digits.startsWith("33")) digits = "0" + digits.slice(2);
      if (digits.length === 12 && digits.startsWith("330")) digits = "0" + digits.slice(3);
      var result = digits.slice(0, 10);
      return result;
    })(),
    email:                  m.email || "",
    adresse:                m.adresse || m.address || "",
    codePostal:             m.codePostal || m.zipCode || "",
    ville:                  m.ville || m.city || "",
    dateValidite:           o.dateValidite || "",
    nomPatient:             o.nomPatient || "",
    prenomPatient:          o.prenomPatient || "",
    dateNaissancePatient:   o.dateNaissancePatient || "",
    distancePupillaire:     o.distancePupillaire || "",
    typePrescription:       o.typePrescription || (m.prescription && m.prescription.typeVision) || "",
    remarques:              o.remarques || "",
    /* Ordonnance — fallback m.prescription (format LiveByOptimum/TP Plus) */
    dateOrdonnance:         o.dateOrdonnance || (m.prescription && m.prescription.datePrescription) || "",
    nomOphtalmologue:       o.nomOphtalmologue || (m.prescription && m.prescription.prescripteur) || "",
    rpps:                   o.rpps || (m.prescription && m.prescription.rpps) || "",
    "lunettesOD.sphere":    (o.lunettesOD && o.lunettesOD.sphere) ? String(o.lunettesOD.sphere) : (m.prescription && m.prescription.od && m.prescription.od.sphere) ? String(m.prescription.od.sphere) : "",
    "lunettesOD.cylindre":  (o.lunettesOD && o.lunettesOD.cylindre) ? String(o.lunettesOD.cylindre) : (m.prescription && m.prescription.od && m.prescription.od.cylindre) ? String(m.prescription.od.cylindre) : "",
    "lunettesOD.axe":       (o.lunettesOD && o.lunettesOD.axe) ? String(o.lunettesOD.axe) : (m.prescription && m.prescription.od && m.prescription.od.axe) ? String(m.prescription.od.axe) : "",
    "lunettesOD.addition":  (o.lunettesOD && o.lunettesOD.addition) ? String(o.lunettesOD.addition) : (m.prescription && m.prescription.od && m.prescription.od.addition) ? String(m.prescription.od.addition) : "",
    "lunettesOG.sphere":    (o.lunettesOG && o.lunettesOG.sphere) ? String(o.lunettesOG.sphere) : (m.prescription && m.prescription.og && m.prescription.og.sphere) ? String(m.prescription.og.sphere) : "",
    "lunettesOG.cylindre":  (o.lunettesOG && o.lunettesOG.cylindre) ? String(o.lunettesOG.cylindre) : (m.prescription && m.prescription.og && m.prescription.og.cylindre) ? String(m.prescription.og.cylindre) : "",
    "lunettesOG.axe":       (o.lunettesOG && o.lunettesOG.axe) ? String(o.lunettesOG.axe) : (m.prescription && m.prescription.og && m.prescription.og.axe) ? String(m.prescription.og.axe) : "",
    "lunettesOG.addition":  (o.lunettesOG && o.lunettesOG.addition) ? String(o.lunettesOG.addition) : (m.prescription && m.prescription.og && m.prescription.og.addition) ? String(m.prescription.og.addition) : "",
    "lentillesOD.sphere":   (o.lentillesOD && o.lentillesOD.sphere) ? String(o.lentillesOD.sphere) : "",
    "lentillesOD.cylindre": (o.lentillesOD && o.lentillesOD.cylindre) ? String(o.lentillesOD.cylindre) : "",
    "lentillesOD.axe":      (o.lentillesOD && o.lentillesOD.axe) ? String(o.lentillesOD.axe) : "",
    "lentillesOD.addition": (o.lentillesOD && o.lentillesOD.addition) ? String(o.lentillesOD.addition) : "",
    "lentillesOD.rayonCourbure": (o.lentillesOD && o.lentillesOD.rayonCourbure) ? String(o.lentillesOD.rayonCourbure) : "",
    "lentillesOD.diametre": (o.lentillesOD && o.lentillesOD.diametre) ? String(o.lentillesOD.diametre) : "",
    "lentillesOG.sphere":   (o.lentillesOG && o.lentillesOG.sphere) ? String(o.lentillesOG.sphere) : "",
    "lentillesOG.cylindre": (o.lentillesOG && o.lentillesOG.cylindre) ? String(o.lentillesOG.cylindre) : "",
    "lentillesOG.axe":      (o.lentillesOG && o.lentillesOG.axe) ? String(o.lentillesOG.axe) : "",
    "lentillesOG.addition": (o.lentillesOG && o.lentillesOG.addition) ? String(o.lentillesOG.addition) : "",
    "lentillesOG.rayonCourbure": (o.lentillesOG && o.lentillesOG.rayonCourbure) ? String(o.lentillesOG.rayonCourbure) : "",
    "lentillesOG.diametre": (o.lentillesOG && o.lentillesOG.diametre) ? String(o.lentillesOG.diametre) : "",
  };
}
