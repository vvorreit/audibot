/* ── Data Utility Functions & Constants ─────────────────────────────────── */

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
  var o = data.o || {};

  /* Priorité : données mutuelle sur la carte, sinon ordonnance */
  var p = (m.personnes && m.personnes[0]) || {};
  /* Extraire les données du régime rc1 (TP Plus / mutuelle) */
  var rc1 = (m.regimes && m.regimes.rc1) || {};

  return {
    organisme:              m.organisme || rc1.nom || "",
    numeroAMC:              m.numeroAMC || rc1.numeroAMC || "",
    numeroAdherent:         m.numeroAdherent || rc1.numeroAdherent || rc1.numeroContrat || "",
    numeroTeletransmission: m.numeroTeletransmission || rc1.numeroTeletransmission || "",
    typeConv:               m.typeConv || rc1.codeConvention || "",
    dateDebutValidite:      m.dateDebutValidite || rc1.dateDebut || "",
    dateFinValidite:        m.dateFinValidite || rc1.dateFin || "",
    nom:                    (m.nom || p.nom || o.nomPatient || "").toUpperCase(),
    prenom:                 m.prenom || p.prenom || o.prenomPatient || "",
    numeroSecuriteSociale:  m.numeroSecuriteSociale || m.nss || p.numeroSecuriteSociale || "",
    dateNaissance:          m.dateNaissance || m.dob || p.dateNaissance || o.dateNaissancePatient || "",
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

/* ── Smart Fill — dictionnaire d'alias par champ OCR ───────────────────── */
export var SMART_FILL_ALIASES = {
  /* ══════════════════════════════════════════════════════════════════════
   *  MUTUELLE / TIERS-PAYANT
   * ══════════════════════════════════════════════════════════════════════ */
  organisme: [
    "organisme", "mutuelle", "caisse", "assureur", "compagnie", "complementaire", "assurance",
    "organisme_complementaire", "nom_mutuelle", "libelle_organisme", "nom_organisme",
    "organisme_amc", "caisse_complementaire", "assurance_complementaire", "complementaire_sante",
    "regime_complementaire", "tiers_payant", "organisme_tp", "tp_organisme", "organisme_rc",
    "rc_organisme", "nom_caisse", "nom_assureur", "nom_compagnie", "code_mutuelle",
    "mutuelle_nom", "oc", "organisme_oc", "insurer", "insurance", "insurance_company",
    "insurance_provider", "health_fund", "mutual", "fund_name", "payer",
    "insurerName", "organismeComplementaire", "libelleOrganisme", "nomMutuelle",
  ],
  numeroAMC: [
    /* standard */
    "numeroamc", "num_amc", "amc", "code_amc", "code_organisme", "id_organisme", "num_organisme",
    "numero_organisme", "code_caisse", "numero_amc", "codeAmc", "amcCode", "amcNumber",
    "code_complementaire", "id_amc", "ref_amc",
    /* variations portails */
    "code_oc", "num_oc", "id_oc", "numero_oc", "identifiant_oc",
    "code_complementaire_sante", "code_mutuelle", "id_mutuelle",
    "code_assureur", "num_assureur", "identifiant_mutuelle",
    "codeAMC", "numAMC", "idAMC", "amcIdentifier",
    /* Almerys */
    "codeOrganisme", "idOrganisme", "numOrganisme",
    /* Viamedis */
    "vm-amc", "vm-code-oc",
    /* data-testid */
    "amc-code", "organisme-code", "mutuelle-code",
  ],
  numeroAdherent: [
    /* standard */
    "numeroadherent", "num_adherent", "adherent", "numero_contrat", "num_contrat", "numcontrat",
    "nocontrat", "no_contrat", "id_adherent", "ref_adherent", "numero_membre", "contrat",
    "contract", "n contrat", "ncontrat", "reference_adherent", "numero_carte", "num_carte",
    "id_contrat", "ref_contrat", "numero_adherent", "n_adherent", "no_adherent",
    "subscriber_id", "member_id", "member_number", "policy_number", "policynumber",
    "subscriberId", "memberId", "memberNumber", "contractNumber", "numeroContrat",
    /* variations portails */
    "num_beneficiaire", "id_beneficiaire", "ref_beneficiaire",
    "numero_beneficiaire", "n_beneficiaire", "no_beneficiaire",
    "identifiant_adherent", "id_assuré", "num_assuré", "numero_assuré",
    "carte_adherent", "num_carte_adherent", "carte_mutuelle",
    "adherent_number", "adherent_id", "adherent_ref",
    /* Almerys ROC */
    "numAdherent", "idAdherent", "refAdherent", "beneficiaireNumero",
    /* Wemind v3 */
    "membershipNumber", "enrollmentId", "vm-adherent",
    /* Viamedis */
    "numBeneficiaire", "vm-beneficiaire",
    /* ERP */
    "txtNumAdherent", "fld_adherent", "input_adherent",
    /* data-testid */
    "adherent-number", "member-id", "subscriber-id", "beneficiary-id",
  ],
  numeroTeletransmission: [
    /* standard */
    "numeroteletransmission", "num_teletransmission", "teletransmission", "num_tp", "numero_tp",
    "ref_tp", "code_teletransmission", "teletrans", "num_teletrans",
    /* variations portails */
    "no_tp", "n_tp", "reference_tp", "id_tp", "num_teletp",
    "teletransmission_number", "tp_reference", "tp_num",
    "numero_emission", "num_emission", "code_destinataire",
    "num_destinataire", "destinataire_tp", "num_routage",
    "code_routage", "routage", "n_emission",
    /* Almerys */
    "numTP", "refTP", "numTeletransmission",
    /* Viamedis */
    "numeroDestinataire", "codeDestinataire",
    /* camelCase */
    "numeroTeletransmission", "numTeletrans", "refTeletrans",
    /* ERP */
    "txtNumTP", "fld_num_tp", "input_tp",
    /* data-testid */
    "teletransmission-number", "tp-number", "tp-ref",
  ],
  typeConv: [
    /* standard */
    "typeconv", "type_conv", "type_convention", "convention", "regime", "type_regime",
    "code_convention", "codeconvention", "regimeType",
    /* variations portails */
    "nature_convention", "codeConvention", "type_prise_en_charge",
    "mode_remboursement", "type_roc", "type_tp", "type_tiers_payant",
    "code_regime", "regime_code", "regime_obligatoire", "ro",
    "convention_code", "code_conv", "nature_pec", "type_couverture",
    "modality", "convention_type", "regime_assurance",
    /* Almerys ROC */
    "typeConvention", "modeGestion", "naturePEC",
    /* Wemind v3 */
    "coverageType", "planType", "benefitType",
    /* camelCase */
    "typeConv", "codeConv", "regimeType", "conventionType",
    /* data-testid */
    "convention-type", "regime-type", "coverage-type",
  ],
  dateDebutValidite: [
    "datedebutvalidite", "debut_validite", "date_debut", "validite_debut", "date_debut_validite",
    "start_date", "startdate", "valid_from", "validfrom", "effective_date",
    "dateDebut", "debutValidite", "dateEffet",
  ],
  dateFinValidite: [
    "datefinvalidite", "fin_validite", "date_fin", "validite_fin", "date_fin_validite",
    "date_expiration", "expiration", "end_date", "enddate", "valid_until", "validuntil",
    "expiry_date", "expirydate", "dateFin", "finValidite", "dateExpiration",
  ],

  /* ══════════════════════════════════════════════════════════════════════
   *  PATIENT / BENEFICIAIRE — IDENTITE
   * ══════════════════════════════════════════════════════════════════════ */
  nom: [
    /* français */
    "nom", "nom_patient", "patient_nom", "nom_client", "client_nom", "nom_beneficiaire",
    "beneficiaire_nom", "nom_assure", "assure_nom", "nom_porteur", "nom_usage",
    "nom_naissance", "nom_jeune_fille", "patronyme", "nom_pers", "nom_titulaire",
    "adherent_nom", "infos_client_nom", "nom de famille", "nom beneficiaire", "nom assure",
    "nomassuree", "identite_nom", "ben_nom", "nom_ben",
    /* anglais */
    "lastname", "last_name", "surname", "family_name", "familyname", "last-name", "family-name",
    /* camelCase / frameworks */
    "nomPatient", "nomClient", "nomBeneficiaire", "nomAssure", "nomPorteur", "nomUsage",
    "lastName", "familyName", "patientLastName", "customerLastName", "clientLastName",
    "beneficiaryLastName", "PatientSurname", "Surname",
    /* ERP specifiques */
    "txtNom", "txtNomPatient", "ctl_nom", "ctl00_nom", "tbNom", "fld_nom",
    "input_nom", "champ_nom", "field_nom", "wo_nom", "arch_nom", "fiche_nom",
    /* Cosium / iGestion */
    "fiche_patient_nom", "pat_nom", "patient_last_name",
    /* Wemind v3 */
    "patientBirthName", "patient_birth_name", "vm-nom",
    /* data-testid React/Next */
    "patient-lastname", "patient-name", "beneficiary-lastname",
    /* data attributes */
    "input-lastname", "input-last-name", "input-nom",
  ],
  prenom: [
    /* français */
    "prenom", "prenom_patient", "patient_prenom", "prenom_client", "client_prenom",
    "prenom_beneficiaire", "beneficiaire_prenom", "prenom_assure", "prenom_porteur",
    "prenom_usage", "prenom_pers", "prenom_titulaire", "adherent_prenom",
    "infos_client_prenom", "prenom beneficiaire", "prenom assure", "prenomassuree",
    "ben_prenom", "prenom_ben",
    /* anglais */
    "firstname", "first_name", "given_name", "givenname", "forename", "first-name", "given-name",
    /* camelCase / frameworks */
    "prenomPatient", "prenomClient", "prenomBeneficiaire", "prenomAssure", "prenomPorteur",
    "firstName", "givenName", "patientFirstName", "customerFirstName", "clientFirstName",
    "beneficiaryFirstName", "PatientForename", "Forename", "GivenName",
    /* ERP specifiques */
    "txtPrenom", "txtPrenomPatient", "ctl_prenom", "ctl00_prenom", "tbPrenom", "fld_prenom",
    "input_prenom", "champ_prenom", "field_prenom", "wo_prenom", "arch_prenom", "fiche_prenom",
    /* Cosium / iGestion */
    "fiche_patient_prenom", "pat_prenom", "patient_first_name",
    /* Wemind v3 */
    "vm-prenom",
    /* data-testid React/Next */
    "patient-firstname", "patient-given-name", "beneficiary-firstname",
    /* data attributes */
    "input-firstname", "input-first-name", "input-prenom",
  ],
  numeroSecuriteSociale: [
    /* français standard */
    "numerosecuritesociale", "nss", "num_ss", "numss", "securite_sociale", "numero_secu",
    "num_secu", "immatriculation", "nirpp", "secu", "matricule", "numsecurite",
    "numero_securite_sociale", "numero de securite sociale", "n securite sociale",
    "no securite sociale", "numero_immatriculation", "immatriculation_assure",
    "numero_matricule", "matricule_assure", "nir", "numero_nir", "nir_assure",
    "num_immat", "immat", "num_nir", "nir_complet", "nir_beneficiaire", "nir_ben",
    "immat_beneficiaire", "cle_nss", "nss_cle", "nirpp_cle", "beneficiaire_nni", "nni",
    "numbenef", "num_benef", "numinsee", "num_insee", "insee",
    /* anglais */
    "ssn", "social_security", "social_security_number", "socialsecuritynumber",
    "national_id", "national_insurance", "insurance_number",
    /* camelCase / frameworks */
    "numeroSecuriteSociale", "numSS", "numSecu", "numInsee", "securiteSociale",
    "nirAssure", "numAssure", "nirBeneficiaire", "socialSecurityNumber",
    "PatientNIR", "NIR", "SocialSecurityNo", "SSN", "InsuranceNo",
    /* ERP specifiques */
    "txtNSS", "txtNumSS", "ctl_nss", "txtImmat", "tbNSS", "fld_nss",
    "input_nss", "champ_nss", "wo_nss", "arch_nss",
    /* data / placeholder patterns */
    "input-ssn", "input-nss", "numero secu", "numero ss", "n de secu",
    /* Almerys ROC nouveau portail */
    "beneficiaireNni", "nirComplet", "rangNaissance", "codeCaisse", "nir_rang",
    /* Wemind v3 */
    "subscriberNIR", "insuredId", "insured_id", "beneficiary_nir",
    /* Viamedis Angular (prefixe vm-) */
    "vm-nir", "vm-nss", "vm-secu",
    /* data-testid patterns React/Next */
    "patient-nss", "beneficiary-nir", "insured-nir", "nir-input",
  ],
  dateNaissance: [
    /* français */
    "datenaissance", "date_naissance", "naissance", "ddn", "date_de_naissance",
    "datedenaissance", "ne_le", "nee_le", "nele", "neele", "date_nais", "datenais",
    "date de naissance", "naissance beneficiaire", "date naissance beneficiaire",
    "datennaissanceassure", "datennaissanceassuree", "naissanceassure",
    "datennaissancebenef", "date de naissance beneficiaire", "dt_naiss", "date_naiss",
    "ddn_patient", "ddn_beneficiaire", "ddn_assure",
    /* anglais */
    "birthdate", "birth_date", "dateofbirth", "date_of_birth", "birthday", "dob",
    "datebirth", "borndate", "born_date", "birth_day",
    /* camelCase / frameworks */
    "dateNaissance", "dateNaissancePatient", "dateNaissanceBeneficiaire",
    "dateNaissanceAssure", "dateOfBirth", "birthDate", "patientDOB", "DOB",
    "PatientDOB", "BirthDate", "customerBirthDate", "clientBirthDate",
    /* ERP specifiques */
    "txtDateNaissance", "ctl_dateNaiss", "txtDDN", "tbDateNaiss", "fld_date_naiss",
    "input_datenaissance", "wo_ddn", "arch_ddn",
    /* Almerys ROC */
    "rangNaissanceAssure", "dateNaissanceAssure", "ddn_assuré",
    /* Wemind v3 */
    "patientDob", "patient_dob", "vm-datenaissance",
    /* Cosium / iGestion */
    "fiche_patient_ddn", "pat_ddn",
    /* data-testid React/Next */
    "patient-dob", "patient-birthdate", "beneficiary-dob",
    /* data attributes */
    "input-dob", "input-birthdate", "input-datenaissance",
  ],

  /* ══════════════════════════════════════════════════════════════════════
   *  CONTACT PATIENT
   * ══════════════════════════════════════════════════════════════════════ */
  telephone: [
    "telephone", "tel", "phone", "mobile", "portable", "gsm", "cellphone",
    "num_tel", "numero_telephone", "tel_portable", "tel_mobile", "tel_fixe",
    "tel_domicile", "tel_pro", "telephone_domicile", "telephone_portable",
    "telephone_mobile", "contact_tel", "infos_client_telephone", "coordonnees_tel",
    "tel_contact", "tel1", "telephone1", "phone1", "numtel",
    "phone_number", "phonenumber", "mobile_phone", "cell_phone", "home_phone",
    "phoneNumber", "mobilePhone", "cellPhone", "homePhone", "contactPhone",
    "PatientPhone", "MobilePhone", "HomePhone", "PhoneNo",
    "txtTel", "txtTelephone", "ctl_tel", "tbTelMobile", "fld_tel",
    "input_telephone", "champ_tel", "wo_tel",
    "input-phone", "input-tel", "input-mobile",
  ],
  email: [
    "email", "mail", "courriel", "adresse_email", "adresse_mail", "e-mail",
    "contact_email", "emailaddress", "email_address", "adressemail", "adresse e-mail",
    "adresse_e_mail", "email_patient", "mail_patient", "e_mail",
    "emailAddress", "PatientEmail", "EmailAddress",
    "txtEmail", "txtMail", "ctl_email", "tbEmail", "fld_email",
    "input_email", "champ_email",
    "input-email", "input-mail",
  ],
  adresse: [
    "adresse", "address", "rue", "voie", "adresse_postale", "adressepostale",
    "ligne_1", "adresse_ligne1", "adresse1", "adresse_1", "numero_rue",
    "street", "street_address", "streetaddress", "address_line1", "address_line_1",
    "ligne1", "adresseligne1", "adresse_domicile", "ligne_adresse",
    "txtAdresse", "ctl_adresse", "fld_adresse", "adr",
    "input_adresse", "champ_adresse",
    "input-address", "input-adresse",
  ],
  codePostal: [
    "codepostal", "code_postal", "cp", "zipcode", "zip_code", "zip",
    "postal_code", "postalcode", "code postal", "cp_ville", "cdpostal",
    "postcode", "post_code",
    "txtCP", "ctl_cp", "fld_cp",
    "input_cp", "champ_cp",
    "input-zip", "input-zipcode", "input-cp",
  ],
  ville: [
    "ville", "city", "localite", "commune", "municipality", "town",
    "nom_ville", "ville_commune", "commune_residence", "locality",
    "txtVille", "ctl_ville", "fld_ville",
    "input_ville", "champ_ville",
    "input-city", "input-ville",
  ],

  /* ══════════════════════════════════════════════════════════════════════
   *  ORDONNANCE / PRESCRIPTION
   * ══════════════════════════════════════════════════════════════════════ */
  nomOphtalmologue: [
    "nomophtalmologue", "nom_medecin", "medecin", "prescripteur", "nom_prescripteur",
    "docteur", "ophtalmologue", "ophtalmo", "nom_docteur", "nommedecin",
    "medecin_prescripteur", "nom prescripteur", "docteur prescripteur",
    "nom_ophtalmo", "dr", "nom_dr", "prescriber", "doctor",
    "PrescriberName", "PractitionerName", "ReferredBy",
    "txtPrescripteur", "ctl_prescripteur",
  ],
  rpps: [
    /* standard */
    "rpps", "num_rpps", "numero_rpps", "identifiant_rpps", "code_rpps", "n_rpps",
    "id_prescripteur", "numrpps", "adeli", "num_adeli", "numero_adeli",
    "numam", "num_am", "numero_am", "numamprescripteur", "finess",
    "num_prescripteur", "prescriber_id",
    /* variations portails */
    "rpps_prescripteur", "no_rpps", "n_rpps_prescripteur", "codeRPPS",
    "rpps_medecin", "rpps_ophtalmologue", "rpps_ophtalmo", "rppsNumber",
    "rpps_dr", "num_am_prescripteur", "id_am", "numero_am_medecin",
    "numamprescribeur", "numeroadeli", "identifiant_am",
    "identifiant_professionnel", "id_professionnel", "num_professionnel",
    "num_finess", "finess_prescripteur",
    /* camelCase / frameworks */
    "PrescriberId", "PrescriberNo", "RPPSNo", "PractitionerId",
    "prescripteurRpps", "medecinRpps", "numRPPS", "codeAm",
    /* Almerys ROC */
    "numPrescripteur", "idPrescripteur", "codePraticien",
    /* ERP */
    "txtRPPS", "ctl_rpps", "fld_rpps", "wo_rpps",
    /* data-testid */
    "prescriber-rpps", "doctor-rpps", "prescriber-id",
  ],
  dateOrdonnance: [
    /* standard */
    "dateordonnance", "date_ordonnance", "ordonnance_date", "prescription_date",
    "date_prescription", "date_ordo", "dateordo", "date ordonnance",
    "date de l'ordonnance", "date de lordonnance", "date prescription",
    "dateordonnanceedit", "dt_ordonnance", "date_presc", "date_rx", "rx_date",
    /* variations portails */
    "date_ordo_patient", "dateordonnancedeprescription", "date_emission",
    "date_etablissement", "date_redaction", "dateprescription",
    "date_etablissement_ordonnance", "dateemissionordonnance",
    "date_de_prescription", "date_de_lordonnance",
    "ordonnance_etablie_le", "ordo_date", "date_rédaction",
    /* anglais */
    "prescription_date", "prescriptionDate", "rx_date", "order_date",
    "issue_date", "issuance_date", "script_date",
    /* camelCase / frameworks */
    "dateOrdonnance", "datePrescription", "dateRx", "rxDate",
    "prescriptionDate", "orderDate", "issuedDate",
    /* Almerys ROC / Wemind */
    "datePrescriptionOrdonnance", "dateDelivrance", "dateEmission",
    /* ERP */
    "txtDateOrdo", "ctl_dateOrdo", "fld_date_ordo", "wo_dateordo",
    /* data-testid */
    "prescription-date", "ordonnance-date", "rx-date",
  ],
  dateValidite: [
    "datevalidite", "date_validite", "validite", "validite_ordonnance",
    "date validite", "date de validite", "expiry", "validity_date",
  ],
  nomPatient: [
    "nompatient", "nom_patient", "patient_nom", "patient_name", "patientName",
    "patient_last_name", "patientLastName",
  ],
  prenomPatient: [
    "prenompatient", "prenom_patient", "patient_prenom", "patient_first_name",
    "patientFirstName", "patientForename",
  ],
  dateNaissancePatient: [
    "datennaissancepatient", "datenaissance_patient", "patient_ddn", "patient_naissance",
    "patientDOB", "patient_date_of_birth", "patient_birthdate",
  ],
  distancePupillaire: [
    /* standard */
    "distancepupillaire", "dp", "dist_pupillaire", "ecart_pupillaire", "pupille",
    "distance_pupillaire", "ecartpupillaire", "ecart inter-pupillaire",
    "distance interpupillaire",
    /* variations */
    "dist_pupil", "dp_total", "dp_od", "dp_og", "ecart_pupil",
    "ecartpupil", "interpupillaire", "inter_pupillaire",
    "distancepupillaire_loin", "dpvl", "dp_vl", "distancepupillaireVL",
    "distancepupillaire_pres", "dpvp", "dp_vp", "distancepupillaireVP",
    "eip", "eip_vl", "eip_vp", "ecartinterpupillaire",
    /* anglais */
    "pd", "pupillary_distance", "ipd", "inter_pupillary", "interpupillary",
    "pupil_distance", "inter_pupil_distance", "binocular_pd",
    /* camelCase / frameworks */
    "distancePupillaire", "distancePD", "pupillaryDistance", "interpupillaryDistance",
    /* Almerys / Wemind */
    "epd", "dist_interpupillaire",
    /* ERP */
    "txtDP", "fld_dp", "input_dp", "champ_dp",
    /* data-testid */
    "pupillary-distance", "pd-input", "dp-input",
  ],
  typePrescription: [
    "typeprescription", "type_prescription", "type_equipement", "equipement",
    "type_verre", "typeequipement", "nature_equipement", "prescription_type",
    "equipment_type", "lens_type", "nature_dossier", "naturedossier",
  ],
  remarques: [
    "remarques", "notes", "commentaire", "observations", "note", "commentaires",
    "informations_complementaires", "infos_comp", "memo", "note_interne",
    "remarque", "notes_dossier", "notes_internes", "observation",
    "txtNotes", "ctl_notes", "notes_libres",
  ],

  /* ══════════════════════════════════════════════════════════════════════
   *  CORRECTIONS LUNETTES OD (Oeil Droit)
   * ══════════════════════════════════════════════════════════════════════ */
  "lunettesOD.sphere": [
    "sphere_od", "sph_od", "od_sph", "sphereod", "sphere od", "sph od",
    "sphere_verre_droit", "sphereverredroit", "od_sphere", "r_sphere",
    "sph_droit", "sphere_d", "sphere_vl_od", "sphere_loin_od", "svl_od",
    "sph_r", "sphod", "right_sphere", "sphereRight", "sphere_oeil_droit",
    "re_sph", "sphere_vp_od", "droit_sphere",
    /* Almerys ROC / Wemind v3 */
    "sphOD", "sphereOD", "SphOD", "SphereOD", "sph_vl_od",
    "verre_droit_sph", "vd_sph", "VD_sphere", "oeilDroit_sphere",
    /* LBO / Optimum */
    "od_sphere_vl", "sphereVLOD", "sph_od_vl",
    /* data-testid */
    "od-sphere", "right-sphere", "sphere-od",
  ],
  "lunettesOD.cylindre": [
    "cylindre_od", "cyl_od", "od_cyl", "cylindreod", "cyl od", "cylindre od",
    "cylindre_verre_droit", "r_cylindre", "cyl_droit", "cylindre_d",
    "cyl_r", "cylod", "right_cylinder", "cylinderRight", "cyl_vl_od",
    "od_cylindre", "droit_cylindre", "re_cyl",
    /* Almerys ROC / Wemind v3 */
    "cylOD", "cylindreOD", "CylOD", "CylindreOD",
    "verre_droit_cyl", "vd_cyl", "VD_cylindre", "oeilDroit_cylindre",
    /* data-testid */
    "od-cylindre", "right-cylinder", "cylindre-od",
  ],
  "lunettesOD.axe": [
    "axe_od", "ax_od", "od_axe", "axeod", "axe od", "ax od",
    "axe_verre_droit", "r_axe", "axe_droit", "axe_d", "ax_r", "axod",
    "right_axis", "axisRight", "axe_vl_od", "od_ax", "droit_axe",
    "axis_od", "re_ax",
    /* Almerys ROC / Wemind v3 */
    "axeOD", "AxeOD", "verre_droit_axe", "vd_axe", "VD_axe",
    "oeilDroit_axe", "axe_correction_od",
    /* data-testid */
    "od-axe", "right-axis", "axe-od",
  ],
  "lunettesOD.addition": [
    "addition_od", "add_od", "od_add", "additionod", "add od", "addition od",
    "r_addition", "add_droit", "addition_d", "add_r", "addod",
    "right_addition", "addRight", "add_vp_od", "od_addition",
    "droit_addition", "re_add",
    /* Almerys ROC / Wemind v3 */
    "addOD", "additionOD", "AddOD", "verre_droit_add", "vd_add",
    "oeilDroit_addition", "add_vp",
    /* data-testid */
    "od-addition", "right-addition", "addition-od",
  ],

  /* ══════════════════════════════════════════════════════════════════════
   *  CORRECTIONS LUNETTES OG (Oeil Gauche)
   * ══════════════════════════════════════════════════════════════════════ */
  "lunettesOG.sphere": [
    "sphere_og", "sph_og", "og_sph", "sphereog", "sphere og", "sph og",
    "sphere_verre_gauche", "l_sphere", "sph_gauche", "sphere_g",
    "sphere_vl_og", "sphere_loin_og", "svl_og", "sph_l", "sphog",
    "left_sphere", "sphereLeft", "sphere_oeil_gauche", "le_sph",
    "sphere_vp_og", "gauche_sphere",
    /* Almerys ROC / Wemind v3 */
    "sphOG", "sphereOG", "SphOG", "SphereOG", "sph_vl_og",
    "verre_gauche_sph", "vg_sph", "VG_sphere", "oeilGauche_sphere",
    /* LBO / Optimum */
    "og_sphere_vl", "sphereVLOG", "sph_og_vl",
    /* data-testid */
    "og-sphere", "left-sphere", "sphere-og",
  ],
  "lunettesOG.cylindre": [
    "cylindre_og", "cyl_og", "og_cyl", "cylindreog", "cyl og", "cylindre og",
    "cylindre_verre_gauche", "l_cylindre", "cyl_gauche", "cylindre_g",
    "cyl_l", "cylog", "left_cylinder", "cylinderLeft", "cyl_vl_og",
    "og_cylindre", "gauche_cylindre", "le_cyl",
    /* Almerys ROC / Wemind v3 */
    "cylOG", "cylindreOG", "CylOG", "CylindreOG",
    "verre_gauche_cyl", "vg_cyl", "VG_cylindre", "oeilGauche_cylindre",
    /* data-testid */
    "og-cylindre", "left-cylinder", "cylindre-og",
  ],
  "lunettesOG.axe": [
    "axe_og", "ax_og", "og_axe", "axeog", "axe og", "ax og",
    "axe_verre_gauche", "l_axe", "axe_gauche", "axe_g", "ax_l", "axog",
    "left_axis", "axisLeft", "axe_vl_og", "og_ax", "gauche_axe",
    "axis_og", "le_ax",
    /* Almerys ROC / Wemind v3 */
    "axeOG", "AxeOG", "verre_gauche_axe", "vg_axe", "VG_axe",
    "oeilGauche_axe", "axe_correction_og",
    /* data-testid */
    "og-axe", "left-axis", "axe-og",
  ],
  "lunettesOG.addition": [
    "addition_og", "add_og", "og_add", "additionog", "add og", "addition og",
    "l_addition", "add_gauche", "addition_g", "add_l", "addog",
    "left_addition", "addLeft", "add_vp_og", "og_addition",
    "gauche_addition", "le_add",
    /* Almerys ROC / Wemind v3 */
    "addOG", "additionOG", "AddOG", "verre_gauche_add", "vg_add",
    "oeilGauche_addition",
    /* data-testid */
    "og-addition", "left-addition", "addition-og",
  ],

  /* ══════════════════════════════════════════════════════════════════════
   *  CORRECTIONS LENTILLES OD
   * ══════════════════════════════════════════════════════════════════════ */
  "lentillesOD.sphere":   ["sphere_lentille_od", "sph_lentille_od", "lentille_od_sphere", "lod_sph", "contact_sphere_od", "cl_sph_od"],
  "lentillesOD.cylindre": ["cylindre_lentille_od", "cyl_lentille_od", "lentille_od_cyl", "lod_cyl", "contact_cyl_od", "cl_cyl_od"],
  "lentillesOD.axe":      ["axe_lentille_od", "ax_lentille_od", "lentille_od_axe", "lod_ax", "contact_axe_od", "cl_ax_od"],
  "lentillesOD.addition": ["addition_lentille_od", "add_lentille_od", "lentille_od_add", "contact_add_od", "cl_add_od"],
  "lentillesOD.rayonCourbure": ["rayon_od", "rayoncourbure_od", "bc_od", "base_curve_od", "rb_od", "rayon_courbure_od", "basecurve_od"],
  "lentillesOD.diametre": ["diametre_od", "dia_od", "diam_od", "diameter_od", "diametre_lentille_od"],

  /* ══════════════════════════════════════════════════════════════════════
   *  CORRECTIONS LENTILLES OG
   * ══════════════════════════════════════════════════════════════════════ */
  "lentillesOG.sphere":   ["sphere_lentille_og", "sph_lentille_og", "lentille_og_sphere", "log_sph", "contact_sphere_og", "cl_sph_og"],
  "lentillesOG.cylindre": ["cylindre_lentille_og", "cyl_lentille_og", "lentille_og_cyl", "log_cyl", "contact_cyl_og", "cl_cyl_og"],
  "lentillesOG.axe":      ["axe_lentille_og", "ax_lentille_og", "lentille_og_axe", "log_ax", "contact_axe_og", "cl_ax_og"],
  "lentillesOG.addition": ["addition_lentille_og", "add_lentille_og", "lentille_og_add", "contact_add_og", "cl_add_og"],
  "lentillesOG.rayonCourbure": ["rayon_og", "rayoncourbure_og", "bc_og", "base_curve_og", "rb_og", "rayon_courbure_og", "basecurve_og"],
  "lentillesOG.diametre": ["diametre_og", "dia_og", "diam_og", "diameter_og", "diametre_lentille_og"],
};

/* Champs à ne jamais remplir automatiquement (autocomplete, lookups, champs sensibles) */
export var SMART_FILL_BLACKLIST = [
  /* Champs autocomplete / recherche — gérés manuellement */
  "assureur",
  "organisme_search",
  "search",
  "recherche",
  "autocomplete",
  /* Authentification — NE JAMAIS remplir */
  "password",
  "mot_de_passe",
  "mdp",
  "passwd",
  "pwd",
  "username",
  "login",
  "identifiant",
  "user_id",
  "userid",
  /* 2FA / codes de vérification */
  "otp",
  "code_otp",
  "code_verification",
  "verification_code",
  "code_sms",
  "totp",
  "pin",
  /* Données bancaires — critique RGPD */
  "numerocartebancaire",
  "carte_bancaire",
  "numero_carte_bancaire",
  "card_number",
  "cardnumber",
  "cvv",
  "cvc",
  "cvv2",
  "expiry",
  "expiry_date",
  "card_expiry",
  "iban",
  "bic",
  "rib",
  "numiban",
  /* Champs de recherche d'adresse (Google Maps, etc.) */
  "address_search",
  "adresse_recherche",
  "code_postal_recherche",
  "ville_recherche",
  "search_address",
  /* Captcha */
  "captcha",
  "g-recaptcha",
  "recaptcha",
  "hcaptcha",
];

/* ── Page context detection ─────────────────────────────────────────────── */
export function detectPageContext() {
  var text = (window.location.href + " " + document.title + " " + ((document.querySelector("h1,h2")||{}).textContent||"")).toLowerCase();
  if (/login|connexion|signin|mot.de.passe/.test(text)) return "login";
  if (/recherche|search/.test(text)) return "search";
  if (/beneficiaire|adherent/.test(text)) return "beneficiaire";
  if (/prise.en.charge|pec|demande/.test(text)) return "pec";
  if (/devis|cotation/.test(text)) return "devis";
  return "unknown";
}

/* ── Visible fields detection ───────────────────────────────────────────── */
export function getVisibleFields() {
  var selector = "input:not([type=hidden]), select, textarea";
  var fields = Array.from(document.querySelectorAll(selector));
  /* Inclure les champs dans les iframes accessibles */
  var iframes = document.querySelectorAll("iframe");
  for (var i = 0; i < iframes.length; i++) {
    try {
      var iDoc = iframes[i].contentDocument || (iframes[i].contentWindow && iframes[i].contentWindow.document);
      if (iDoc) fields = fields.concat(Array.from(iDoc.querySelectorAll(selector)));
    } catch(e) {}
  }
  return fields.filter(function(el) {
    try {
      var cs = (el.ownerDocument.defaultView || window).getComputedStyle(el);
      return cs.display !== "none" && cs.visibility !== "hidden" && cs.opacity !== "0"
        && !el.disabled && !el.readOnly && el.getBoundingClientRect().height > 0;
    } catch(e) { return false; }
  });
}
