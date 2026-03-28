/* ── OptiBot — Dictionnaires d'aliases pour ERP optique ──────────────── */
/* Chaque cle est le nom canonique du champ OptiBot.                      */
/* Les valeurs sont les variations connues dans les ERP du marche.         */
/*                                                                         */
/* ERP couverts : Cosium, Optifid, Optimum (LBO), EasyVista, WinOptics,   */
/*   iO-soft, Optymo, Visionix, CrossOp, Optique+, Amadelis, LGPI, etc.  */
/*                                                                         */
/* Convention : toutes les valeurs sont en minuscules, sans accents.       */
/* La normalisation (accents, separateurs) est geree par normalizeAlias(). */

/* ── Champs Patient ────────────────────────────────────────────────────── */
export var PATIENT_ALIASES = {
  nom: [
    /* francais standard */
    "nom", "nom_patient", "patient_nom", "nom_client", "client_nom",
    "nom_porteur", "nom_beneficiaire", "nom_assure", "assure_nom",
    "nom de famille", "nom assure", "nom beneficiaire",
    "nom_usage", "nom_naissance", "nom_jeune_fille", "patronyme",
    "identite_nom", "ben_nom", "nom_ben", "nom_pers",
    /* camelCase / formControlName */
    "nomPatient", "nomClient", "nomBeneficiaire", "nomAssure",
    "nomPorteur", "nomUsage", "nomNaissance", "nomJeuneFille",
    "familyName", "lastName",
    /* anglais */
    "lastname", "last_name", "name", "surname", "family_name",
    /* kebab-case */
    "nom-patient", "nom-client", "nom-beneficiaire", "nom-assure",
    "last-name", "family-name",
    /* data attributes */
    "data-nom", "data-lastname", "data-patient-nom",
    /* ERP specifiques */
    "nomassuree", "nomassuré", "infos_client_nom", "adherent_nom",
    "nom_titulaire", "titulaire_nom", "nom_personne", "personne_nom",
    "nom_tiers", "tiers_nom", "nom_acheteur", "nom_destinataire",
    /* placeholders */
    "votre nom", "saisir le nom", "entrez le nom",
    "nom du patient", "nom du beneficiaire", "nom du client",
    /* abbreviations */
    "nm", "nom_p",
  ],

  prenom: [
    /* francais standard */
    "prenom", "prenom_patient", "patient_prenom", "prenom_client",
    "client_prenom", "prenom_porteur", "prenom_beneficiaire",
    "prenom_assure", "assure_prenom", "prenom beneficiaire",
    "prenom assure", "ben_prenom", "prenom_ben", "prenom_pers",
    /* camelCase / formControlName */
    "prenomPatient", "prenomClient", "prenomBeneficiaire",
    "prenomAssure", "givenName", "firstName",
    /* anglais */
    "firstname", "first_name", "given_name", "forename",
    /* kebab-case */
    "prenom-patient", "prenom-client", "prenom-beneficiaire",
    "first-name", "given-name",
    /* data attributes */
    "data-prenom", "data-firstname", "data-patient-prenom",
    /* ERP specifiques */
    "prenomassuree", "infos_client_prenom", "adherent_prenom",
    "prenom_titulaire", "titulaire_prenom", "prenom_personne",
    "prenom_tiers", "prenom_acheteur", "prenom_destinataire",
    /* placeholders */
    "votre prenom", "saisir le prenom", "entrez le prenom",
    "prenom du patient", "prenom du beneficiaire",
    /* abbreviations */
    "pnm", "prn", "prenom_p",
  ],

  numeroSecuriteSociale: [
    /* francais standard */
    "nss", "num_ss", "numss", "securite_sociale", "numero_secu",
    "immatriculation", "nirpp", "secu", "matricule",
    "n securite sociale", "numero securite sociale", "no_ss",
    "num_assure", "numero_ss", "nir", "numero_nir", "nir_assure",
    "immat", "num_immat", "cle_nss",
    /* camelCase / formControlName */
    "numeroSecuriteSociale", "numSS", "numSecu", "numInsee",
    "securiteSociale", "nirAssure", "numAssure", "numImmat",
    "numBenef", "beneficiaireNni",
    /* formes longues */
    "numero_securite_sociale", "numero de securite sociale",
    "no securite sociale",
    "numero_immatriculation", "immatriculation_assure",
    "numero_matricule", "matricule_assure",
    /* anglais */
    "social_security", "social_security_number", "ssn",
    "national_id", "national_insurance",
    /* kebab-case */
    "num-ss", "securite-sociale", "numero-secu",
    /* data attributes */
    "data-nss", "data-numss", "data-securite-sociale",
    /* ERP specifiques */
    "num_insee", "numinsee", "insee", "nni",
    "beneficiaire_nni", "num_benef", "numbenef",
    "nir_beneficiaire", "nir_ben", "immat_beneficiaire",
    "numero_assure_social", "num_regime",
    "numsecuritesociale", "numsecurite",
    /* avec accents (normalisés) */
    "n° securite sociale",
    /* placeholders */
    "votre numero de securite sociale", "numero secu",
    "saisir le numero ss", "numero nir",
    /* abbreviations */
    "ss", "nss_cle", "nirpp_cle",
  ],

  dateNaissance: [
    /* francais standard */
    "datenaissance", "date_naissance", "naissance", "ddn",
    "date_de_naissance", "datedenaissance", "ne_le", "nee_le",
    "date_nais", "datenais", "date de naissance",
    "naissance beneficiaire", "date naissance beneficiaire",
    /* camelCase / formControlName */
    "dateNaissance", "dateDeNaissance", "dateNais", "birthDate",
    "dateOfBirth", "naissanceAssure", "naissanceBeneficiaire",
    "dateNaissanceAssure", "dateNaissanceBeneficiaire",
    /* anglais */
    "birthdate", "birth_date", "dob", "date_of_birth",
    "datebirth", "borndate", "dateofbirth", "born_on",
    /* kebab-case */
    "date-naissance", "date-de-naissance", "birth-date",
    /* data attributes */
    "data-ddn", "data-naissance", "data-birthdate",
    /* ERP specifiques */
    "datennaissanceassure", "datennaissanceassuree",
    "datennaissancebenef", "date de naissance beneficiaire",
    "naissance_assure", "naissance_beneficiaire",
    "date_naissance_patient", "ddn_patient",
    "nele", "neele", "ne(e) le",
    /* placeholders */
    "votre date de naissance", "jj/mm/aaaa",
    "date de naissance (jj/mm/aaaa)",
    /* abbreviations */
    "dn", "d_nais", "d_naiss",
  ],

  telephone: [
    /* francais standard */
    "telephone", "tel", "phone", "mobile", "portable",
    "num_tel", "numero_telephone", "tel_portable", "tel_mobile",
    "gsm", "tel_fixe", "fixe", "tel_domicile",
    "tel_bureau", "tel_travail", "tel_pro",
    /* camelCase / formControlName */
    "telephoneMobile", "telephoneFixe",
    "telephonePortable", "phoneNumber", "mobilePhone",
    "numTel", "numTelephone",
    /* anglais */
    "cellphone", "cell_phone", "cell", "phone_number",
    "phonenumber", "mobile_phone", "home_phone",
    "work_phone", "landline",
    /* kebab-case */
    "tel-portable", "tel-mobile", "tel-fixe", "phone-number",
    /* data attributes */
    "data-tel", "data-phone", "data-telephone",
    /* ERP specifiques */
    "contact_tel", "infos_client_telephone",
    "numtelphone", "coordonnees_tel", "tel_contact",
    "telephone1", "tel1", "phone1", "tel2", "telephone2",
    "num_telephone_mobile", "num_telephone_fixe",
    "mobile_patient", "tel_patient", "portable_patient",
    /* avec accents (normalisés) */
    "numero de telephone",
    /* placeholders */
    "votre numero de telephone", "06xxxxxxxx",
    "telephone mobile",
    "telephone fixe", "telephone portable",
    /* abbreviations */
    "t", "tph", "telph",
  ],

  email: [
    /* standard */
    "email", "mail", "courriel", "adresse_email", "adresse_mail",
    "e-mail", "contact_email",
    /* camelCase / formControlName */
    "emailAddress", "adresseMail", "adresseEmail",
    /* anglais */
    "emailaddress", "email_address",
    /* kebab-case */
    "adresse-email", "adresse-mail",
    /* data attributes */
    "data-email", "data-mail",
    /* ERP specifiques */
    "adressemail", "adresse e-mail", "adressecourriel",
    "mail_patient", "email_patient", "mail_contact",
    "email_contact", "courriel_patient", "email_client",
    /* placeholders */
    "votre adresse email",
    "email@exemple.fr", "saisir l'email",
  ],

  adresse: [
    /* francais standard */
    "adresse", "adresse_postale", "adresse1", "adresse_ligne1",
    "ligne_1", "rue", "voie", "adresse postale",
    "adresse_patient", "adresse_client",
    /* camelCase / formControlName */
    "adressePostale", "adresseLigne1", "streetAddress",
    /* anglais */
    "address", "street", "street_address", "streetaddress",
    "address_line1", "address_line_1", "addressline1",
    "line1", "address1",
    /* kebab-case */
    "adresse-postale", "adresse-ligne1", "street-address",
    /* data attributes */
    "data-adresse", "data-address", "data-street",
    /* ERP specifiques */
    "adresseligne1", "ligne1", "adressepostale",
    "voie_patient", "rue_patient", "adresse_domicile",
    "num_voie", "numero_rue", "adresse_complete",
    /* placeholders */
    "votre adresse",
    "numero et nom de rue", "saisir l'adresse",
  ],

  codePostal: [
    /* francais standard */
    "codepostal", "code_postal", "cp", "code postal",
    "cp_ville", "code_post",
    /* camelCase / formControlName */
    "codePostal", "postalCode", "zipCode",
    /* anglais */
    "zipcode", "zip_code", "zip", "postal_code",
    "postalcode", "postcode", "post_code",
    /* kebab-case */
    "code-postal", "zip-code", "postal-code",
    /* data attributes */
    "data-cp", "data-codepostal", "data-zipcode",
    /* ERP specifiques */
    "cp_patient", "code_postal_patient", "cp_client",
    "cp_domicile", "code_postal_domicile",
    /* placeholders */
    "votre code postal", "ex: 75001",
  ],

  ville: [
    /* francais standard */
    "ville", "commune", "localite", "nom_ville",
    "ville_commune", "ville_patient", "ville_client",
    /* camelCase / formControlName */
    "villeCommune", "nomVille", "cityName",
    /* anglais */
    "city", "municipality", "town", "locality",
    "city_name", "cityname",
    /* kebab-case */
    "ville-commune", "city-name",
    /* data attributes */
    "data-ville", "data-city",
    /* ERP specifiques */
    "localité", "localite_patient", "commune_patient",
    "ville_domicile", "commune_domicile",
    /* placeholders */
    "votre ville", "nom de la commune", "ville ou commune",
  ],

  civilite: [
    /* francais standard */
    "civilite", "titre", "civ", "mr_mme", "sexe",
    "civilite_patient", "civilite_client",
    /* camelCase / formControlName */
    "civilitePatient", "titlePatient", "genderPatient",
    /* anglais */
    "title", "gender", "salutation", "prefix",
    "name_prefix", "honorific",
    /* kebab-case */
    "mr-mme", "name-prefix",
    /* data attributes */
    "data-civilite", "data-title", "data-gender",
    /* ERP specifiques */
    "titre_civilite", "civ_patient", "mme_m",
    "m_mme", "monsieur_madame", "genre",
    /* placeholders */
    "m. / mme", "monsieur ou madame",
  ],
};

/* ── Champs Mutuelle / AMC ─────────────────────────────────────────────── */
export var MUTUELLE_ALIASES = {
  organisme: [
    /* francais standard */
    "organisme", "mutuelle", "complementaire", "assureur",
    "caisse", "nom_mutuelle", "amc", "organisme_complementaire",
    "assurance", "libelle_organisme", "nom_organisme",
    "compagnie", "organisme_amc", "tiers_payant",
    "complementaire_sante",
    /* camelCase / formControlName */
    "nomMutuelle", "organismeComplementaire", "organismeAmc",
    "libelleOrganisme", "assureurComplementaire",
    /* anglais */
    "insurer", "insurance", "insurance_company",
    "insurance_provider", "health_fund", "mutual",
    /* kebab-case */
    "nom-mutuelle", "organisme-complementaire",
    /* data attributes */
    "data-organisme", "data-mutuelle", "data-assureur",
    /* ERP specifiques */
    "code_mutuelle", "mutuelle_nom", "organisme_rc",
    "rc_organisme", "organisme_tp", "tp_organisme",
    "caisse_complementaire", "regime_complementaire",
    "nom_caisse", "nom_assureur", "nom_compagnie",
    "oc", "organisme_oc",
    /* placeholders */
    "nom de la mutuelle", "organisme complementaire",
    "saisir la mutuelle", "rechercher une mutuelle",
  ],

  numeroAdherent: [
    /* francais standard */
    "numeroadherent", "num_adherent", "adherent",
    "numero_contrat", "contrat", "num_contrat",
    "no_contrat", "numero_membre", "num_membre",
    "reference_adherent", "ref_adherent",
    "numero adherent", "n contrat",
    /* camelCase / formControlName */
    "numeroAdherent", "numAdherent", "numContrat",
    "numeroContrat", "refAdherent", "idAdherent",
    /* anglais */
    "member_number", "member_id", "membership_number",
    "policy_number", "policynumber", "contract_number",
    "subscriber_id", "contract",
    /* kebab-case */
    "num-adherent", "numero-contrat", "num-contrat",
    /* data attributes */
    "data-adherent", "data-contrat", "data-num-adherent",
    /* ERP specifiques */
    "ncontrat", "numcontrat", "nocontrat", "id_adherent",
    "adherent_numero", "contrat_numero", "num_police",
    "numero_police", "ref_contrat", "reference_contrat",
    "immatriculation_adherent", "immat_adherent",
    /* placeholders */
    "numero d'adherent", "votre numero de contrat",
    "saisir le numero d'adherent", "n° contrat",
    /* abbreviations */
    "nad", "nadh",
  ],

  codeOrganisme: [
    /* francais standard */
    "code_organisme", "code_amc", "numero_amc",
    "num_amc", "code_mutuelle", "id_organisme",
    "num_organisme", "code_oc",
    /* camelCase / formControlName */
    "codeOrganisme", "codeAmc", "numeroAmc",
    "numAmc", "idOrganisme", "numOrganisme",
    /* anglais */
    "insurer_code", "insurance_code", "fund_code",
    "provider_code",
    /* kebab-case */
    "code-organisme", "code-amc", "num-amc",
    /* data attributes */
    "data-code-organisme", "data-code-amc",
    /* ERP specifiques */
    "amc", "numero_organisme", "ref_organisme",
    "reference_organisme", "code_caisse", "id_caisse",
    "code_regime_complementaire", "code_complementaire",
    "code_tp", "code_tiers_payant",
    /* placeholders */
    "code de l'organisme", "code amc",
    "saisir le code organisme",
  ],
};

/* ── Ordonnance / Prescription ─────────────────────────────────────────── */
export var ORDONNANCE_ALIASES = {
  rpps: [
    /* francais standard */
    "rpps", "num_rpps", "numero_rpps", "code_rpps",
    "identifiant_rpps", "id_prescripteur",
    "adeli", "num_adeli", "numero_adeli",
    "finess", "num_finess",
    /* camelCase / formControlName */
    "numRpps", "numeroRpps", "codeRpps",
    "idPrescripteur", "numAdeli", "numAm",
    "numAmPrescripteur",
    /* anglais */
    "prescriber_id", "prescriber_code",
    "doctor_id", "provider_id",
    /* kebab-case */
    "num-rpps", "code-rpps", "id-prescripteur",
    /* data attributes */
    "data-rpps", "data-prescripteur",
    /* ERP specifiques */
    "numrpps", "n°rpps", "numam", "num_am",
    "numero_am", "numamprescripteur",
    "rpps_prescripteur", "code_prescripteur",
    "identifiant_medecin", "id_medecin",
    /* placeholders */
    "numero rpps", "saisir le rpps",
    "identifiant rpps du prescripteur",
  ],

  dateOrdonnance: [
    /* francais standard */
    "dateordonnance", "date_ordonnance", "date_ordo",
    "date prescription", "date_prescription",
    "date ordonnance", "date de l'ordonnance",
    "date de prescription",
    /* camelCase / formControlName */
    "dateOrdonnance", "datePrescription", "dateOrdo",
    "ordonnanceDate", "prescriptionDate",
    "dateOrdonnanceEdit",
    /* anglais */
    "prescription_date", "order_date", "rx_date",
    /* kebab-case */
    "date-ordonnance", "date-prescription", "date-ordo",
    /* data attributes */
    "data-date-ordonnance", "data-date-prescription",
    /* ERP specifiques */
    "dateordo", "ordonnance_date", "dt_ordonnance",
    "dt_prescription", "date_ordo_edit",
    "dateordonnanceedit", "date_rx",
    /* placeholders */
    "date de la prescription",
    "jj/mm/aaaa", "date ordonnance (jj/mm/aaaa)",
  ],

  nomOphtalmologue: [
    /* francais standard */
    "ophtalmologue", "prescripteur", "nom_medecin",
    "medecin", "docteur", "nom prescripteur",
    "nom_prescripteur", "nom_ophtalmologue",
    "ophtalmo", "nom_docteur",
    /* camelCase / formControlName */
    "nomOphtalmologue", "nomMedecin", "nomPrescripteur",
    "nomDocteur", "medecinPrescripteur",
    /* anglais */
    "doctor", "prescriber", "prescriber_name",
    "doctor_name", "physician", "ophthalmologist",
    /* kebab-case */
    "nom-prescripteur", "nom-medecin", "nom-docteur",
    /* data attributes */
    "data-prescripteur", "data-medecin",
    /* ERP specifiques */
    "nommedecin", "medecin_prescripteur",
    "docteur prescripteur", "medecin_traitant",
    "ophtalmologiste", "nom_ophtalmo",
    "prescripteur_nom", "dr_nom",
    /* placeholders */
    "nom du prescripteur", "nom du medecin",
    "rechercher un prescripteur", "dr.",
  ],
};

/* ── Corrections optiques OD (Oeil Droit) ──────────────────────────────── */
export var OPTICAL_OD_ALIASES = {
  "lunettesOD.sphere": [
    /* francais standard avec lateralite */
    "sphere_od", "sph_od", "od_sph", "od_sphere",
    "sphere od", "sph od", "sphere_droit", "sph_droit",
    "sphere_d", "sph_d",
    /* VL (Vision de Loin) */
    "sphere_vl_od", "sph_vl_od", "vl_sph_od",
    "sphere_loin_od", "sph_loin_od",
    "spherevlod", "sphvlod",
    /* VP (Vision de Pres) */
    "sphere_vp_od", "sph_vp_od", "vp_sph_od",
    "sphere_pres_od", "sph_pres_od",
    "spherevpod", "sphvpod",
    /* camelCase / formControlName */
    "sphereOd", "sphOd", "sphereDroit", "sphDroit",
    "sphereOeilDroit", "sphereVlOd", "sphereVpOd",
    /* anglais */
    "sphere_right", "sph_right", "right_sphere",
    "sphere_re", "sph_re", "r_sphere", "r_sph",
    /* kebab-case */
    "sphere-od", "sph-od", "sphere-droit",
    /* data attributes */
    "data-sphere-od", "data-sph-od",
    /* ERP specifiques */
    "sphereod", "sphod", "od_sphere_vl", "od_sphere_vp",
    "sphere_verre_droit", "sphereverredroit",
    "rx_sphere_od", "rx_sph_od",
    "puissance_od", "pwr_od", "power_od",
    /* placeholders */
    "sph. od", "sphere oeil droit",
    /* abbreviations */
    "s_od", "sod",
  ],

  "lunettesOD.cylindre": [
    /* francais standard avec lateralite */
    "cylindre_od", "cyl_od", "od_cyl", "od_cylindre",
    "cylindre od", "cyl od", "cylindre_droit", "cyl_droit",
    "cylindre_d", "cyl_d",
    /* VL / VP */
    "cylindre_vl_od", "cyl_vl_od", "cylindre_vp_od", "cyl_vp_od",
    /* camelCase / formControlName */
    "cylindreOd", "cylOd", "cylindreDroit", "cylDroit",
    "cylindreOeilDroit", "cylindreVlOd",
    /* anglais */
    "cylinder_right", "cyl_right", "right_cylinder",
    "cylinder_re", "cyl_re", "r_cylindre", "r_cyl",
    /* kebab-case */
    "cylindre-od", "cyl-od", "cylindre-droit",
    /* data attributes */
    "data-cylindre-od", "data-cyl-od",
    /* ERP specifiques */
    "cylindreod", "cylod", "cylindre_verre_droit",
    "rx_cylindre_od", "rx_cyl_od",
    /* placeholders */
    "cyl. od", "cylindre oeil droit",
    /* abbreviations */
    "c_od", "cod",
  ],

  "lunettesOD.axe": [
    /* francais standard avec lateralite */
    "axe_od", "ax_od", "od_axe", "od_ax",
    "axe od", "ax od", "axe_droit", "ax_droit",
    "axe_d", "ax_d",
    /* VL / VP */
    "axe_vl_od", "ax_vl_od", "axe_vp_od", "ax_vp_od",
    /* camelCase / formControlName */
    "axeOd", "axOd", "axeDroit", "axDroit",
    "axeOeilDroit", "axeVlOd",
    /* anglais */
    "axis_right", "ax_right", "right_axis",
    "axis_re", "ax_re", "r_axe", "r_ax",
    /* kebab-case */
    "axe-od", "ax-od", "axe-droit",
    /* data attributes */
    "data-axe-od", "data-ax-od",
    /* ERP specifiques */
    "axeod", "axod", "axe_verre_droit",
    "rx_axe_od", "rx_ax_od",
    "orientation_od", "angle_od",
    /* placeholders */
    "axe oeil droit", "axe (°)",
    /* abbreviations */
    "a_od", "aod",
  ],

  "lunettesOD.addition": [
    /* francais standard avec lateralite */
    "addition_od", "add_od", "od_add", "od_addition",
    "addition od", "add od", "addition_droit", "add_droit",
    "addition_d", "add_d",
    /* camelCase / formControlName */
    "additionOd", "addOd", "additionDroit", "addDroit",
    "additionOeilDroit", "addVpOd",
    /* anglais */
    "addition_right", "add_right", "right_addition",
    "addition_re", "add_re", "r_addition", "r_add",
    "near_add_right", "near_add_od",
    /* kebab-case */
    "addition-od", "add-od", "addition-droit",
    /* data attributes */
    "data-addition-od", "data-add-od",
    /* ERP specifiques */
    "additionod", "addod", "addition_verre_droit",
    "rx_addition_od", "rx_add_od",
    "addition_vp_od", "add_vp_od",
    /* placeholders */
    "add. od", "addition oeil droit",
    /* abbreviations */
    "ad_od", "adod",
  ],
};

/* ── Corrections optiques OG (Oeil Gauche) ─────────────────────────────── */
export var OPTICAL_OG_ALIASES = {
  "lunettesOG.sphere": [
    /* francais standard avec lateralite */
    "sphere_og", "sph_og", "og_sph", "og_sphere",
    "sphere og", "sph og", "sphere_gauche", "sph_gauche",
    "sphere_g", "sph_g",
    /* VL (Vision de Loin) */
    "sphere_vl_og", "sph_vl_og", "vl_sph_og",
    "sphere_loin_og", "sph_loin_og",
    "spherevlog", "sphvlog",
    /* VP (Vision de Pres) */
    "sphere_vp_og", "sph_vp_og", "vp_sph_og",
    "sphere_pres_og", "sph_pres_og",
    "spherevpog", "sphvpog",
    /* camelCase / formControlName */
    "sphereOg", "sphOg", "sphereGauche", "sphGauche",
    "sphereOeilGauche", "sphereVlOg", "sphereVpOg",
    /* anglais */
    "sphere_left", "sph_left", "left_sphere",
    "sphere_le", "sph_le", "l_sphere", "l_sph",
    /* kebab-case */
    "sphere-og", "sph-og", "sphere-gauche",
    /* data attributes */
    "data-sphere-og", "data-sph-og",
    /* ERP specifiques */
    "sphereog", "sphog", "og_sphere_vl", "og_sphere_vp",
    "sphere_verre_gauche", "sphereverregauche",
    "rx_sphere_og", "rx_sph_og",
    "puissance_og", "pwr_og", "power_og",
    /* placeholders */
    "sph. og", "sphere oeil gauche",
    /* abbreviations */
    "s_og", "sog",
  ],

  "lunettesOG.cylindre": [
    /* francais standard avec lateralite */
    "cylindre_og", "cyl_og", "og_cyl", "og_cylindre",
    "cylindre og", "cyl og", "cylindre_gauche", "cyl_gauche",
    "cylindre_g", "cyl_g",
    /* VL / VP */
    "cylindre_vl_og", "cyl_vl_og", "cylindre_vp_og", "cyl_vp_og",
    /* camelCase / formControlName */
    "cylindreOg", "cylOg", "cylindreGauche", "cylGauche",
    "cylindreOeilGauche", "cylindreVlOg",
    /* anglais */
    "cylinder_left", "cyl_left", "left_cylinder",
    "cylinder_le", "cyl_le", "l_cylindre", "l_cyl",
    /* kebab-case */
    "cylindre-og", "cyl-og", "cylindre-gauche",
    /* data attributes */
    "data-cylindre-og", "data-cyl-og",
    /* ERP specifiques */
    "cylindreog", "cylog", "cylindre_verre_gauche",
    "rx_cylindre_og", "rx_cyl_og",
    /* placeholders */
    "cyl. og", "cylindre oeil gauche",
    /* abbreviations */
    "c_og", "cog",
  ],

  "lunettesOG.axe": [
    /* francais standard avec lateralite */
    "axe_og", "ax_og", "og_axe", "og_ax",
    "axe og", "ax og", "axe_gauche", "ax_gauche",
    "axe_g", "ax_g",
    /* VL / VP */
    "axe_vl_og", "ax_vl_og", "axe_vp_og", "ax_vp_og",
    /* camelCase / formControlName */
    "axeOg", "axOg", "axeGauche", "axGauche",
    "axeOeilGauche", "axeVlOg",
    /* anglais */
    "axis_left", "ax_left", "left_axis",
    "axis_le", "ax_le", "l_axe", "l_ax",
    /* kebab-case */
    "axe-og", "ax-og", "axe-gauche",
    /* data attributes */
    "data-axe-og", "data-ax-og",
    /* ERP specifiques */
    "axeog", "axog", "axe_verre_gauche",
    "rx_axe_og", "rx_ax_og",
    "orientation_og", "angle_og",
    /* placeholders */
    "axe oeil gauche", "axe (°)",
    /* abbreviations */
    "a_og", "aog",
  ],

  "lunettesOG.addition": [
    /* francais standard avec lateralite */
    "addition_og", "add_og", "og_add", "og_addition",
    "addition og", "add og", "addition_gauche", "add_gauche",
    "addition_g", "add_g",
    /* camelCase / formControlName */
    "additionOg", "addOg", "additionGauche", "addGauche",
    "additionOeilGauche", "addVpOg",
    /* anglais */
    "addition_left", "add_left", "left_addition",
    "addition_le", "add_le", "l_addition", "l_add",
    "near_add_left", "near_add_og",
    /* kebab-case */
    "addition-og", "add-og", "addition-gauche",
    /* data attributes */
    "data-addition-og", "data-add-og",
    /* ERP specifiques */
    "additionog", "addog", "addition_verre_gauche",
    "rx_addition_og", "rx_add_og",
    "addition_vp_og", "add_vp_og",
    /* placeholders */
    "add. og", "addition oeil gauche",
    /* abbreviations */
    "ad_og", "adog",
  ],
};

/* ── PEC (Prise En Charge) ─────────────────────────────────────────────── */
export var PEC_ALIASES = {
  numeroAccord: [
    /* francais standard */
    "num_accord", "numero_accord", "accord",
    "reference_pec", "num_pec", "n_accord",
    "no_accord", "accord_pec", "ref_pec",
    "numero pec", "n accord", "numero accord",
    /* camelCase / formControlName */
    "numeroAccord", "numAccord", "refPec",
    "referencePec", "accordPec", "numPec",
    /* anglais */
    "agreement_number", "approval_number",
    "authorization_number", "auth_number",
    "approval_ref", "agreement_ref",
    /* kebab-case */
    "num-accord", "numero-accord", "ref-pec",
    /* data attributes */
    "data-accord", "data-num-accord", "data-pec",
    /* ERP specifiques */
    "numero_prise_en_charge", "ref_accord",
    "reference_accord", "id_pec", "id_accord",
    "numero_autorisation", "num_autorisation",
    "code_accord", "n_pec",
    /* placeholders */
    "numero d'accord", "reference de la pec",
    "saisir le numero d'accord",
  ],

  montantPEC: [
    /* francais standard */
    "montant_pec", "montant_accord", "montant_rc",
    "prise_en_charge", "montant_mutuelle",
    "part_complementaire", "montant rembourse",
    "montant pec", "montant accord",
    /* camelCase / formControlName */
    "montantPec", "montantAccord", "montantRc",
    "montantMutuelle", "partComplementaire",
    "montantRembourse", "priseEnCharge",
    /* anglais */
    "covered_amount", "reimbursement_amount",
    "insurance_amount", "approved_amount",
    "benefit_amount",
    /* kebab-case */
    "montant-pec", "montant-accord", "montant-rc",
    /* data attributes */
    "data-montant-pec", "data-montant-accord",
    /* ERP specifiques */
    "montant_prise_en_charge", "montant_remb",
    "montant_part_complementaire", "montant_amc",
    "mt_pec", "mt_accord", "mt_rc",
    "remboursement_mutuelle", "part_mutuelle",
    "montant_couvert", "base_remboursement_rc",
    /* placeholders */
    "montant de la prise en charge",
    "montant rembourse par la mutuelle",
  ],

  datePEC: [
    /* francais standard */
    "date_pec", "date_accord", "date_retour",
    "date_reponse", "date_validation",
    "date pec", "date accord",
    "date de la pec", "date de l'accord",
    /* camelCase / formControlName */
    "datePec", "dateAccord", "dateRetour",
    "dateReponse", "dateValidation",
    "dateApprobation", "datePriseEnCharge",
    /* anglais */
    "approval_date", "authorization_date",
    "agreement_date", "decision_date",
    /* kebab-case */
    "date-pec", "date-accord", "date-retour",
    /* data attributes */
    "data-date-pec", "data-date-accord",
    /* ERP specifiques */
    "dt_pec", "dt_accord", "dt_retour",
    "date_retour_pec", "date_retour_accord",
    "date_prise_en_charge", "date_decision",
    "date_emission_pec", "date_accord_mutuelle",
    /* placeholders */
    "date de la prise en charge",
    "date de l'accord mutuelle", "jj/mm/aaaa",
  ],
};

/* ── Notes / Rejets ────────────────────────────────────────────────────── */
export var REJET_NOTE_ALIASES = [
  /* francais standard */
  "remarques", "notes", "commentaire", "commentaires",
  "observations", "note", "memo", "note_interne",
  "remarque", "infos_comp",
  "informations_complementaires", "observation",
  "note_patient", "commentaire_dossier", "notes_dossier",
  /* camelCase / formControlName */
  "noteInterne", "commentaireDossier", "notesDossier",
  "notePatient", "infosComplementaires",
  "informationsComplementaires", "remarquesDossier",
  /* anglais */
  "comments", "comment", "remark", "remarks",
  "internal_note", "case_notes", "notes_field",
  /* kebab-case */
  "note-interne", "commentaire-dossier", "notes-dossier",
  /* ERP specifiques */
  "notes_cliniques", "note_libre", "texte_libre",
  "zone_commentaire", "zone_notes", "champ_libre",
  "notes_internes", "memo_patient", "memo_dossier",
  "annotation", "annotations", "message",
  "description", "detail", "details",
  "motif", "motif_rejet", "raison",
  "note_rejet", "commentaire_rejet",
  /* placeholders */
  "ajouter une note", "saisir un commentaire",
  "remarques complementaires", "notes supplementaires",
];

/* ── Merge all patient-side aliases into one dict ──────────────────────── */
export function buildScrapingAliases() {
  var merged = {};
  var dicts = [PATIENT_ALIASES, MUTUELLE_ALIASES, ORDONNANCE_ALIASES, OPTICAL_OD_ALIASES, OPTICAL_OG_ALIASES];
  for (var d = 0; d < dicts.length; d++) {
    for (var key in dicts[d]) {
      merged[key] = dicts[d][key].slice(); // copy
    }
  }
  return merged;
}

/* ── Build PEC injection aliases ───────────────────────────────────────── */
export function buildPecAliases() {
  var merged = {};
  for (var key in PEC_ALIASES) {
    merged[key] = PEC_ALIASES[key].slice();
  }
  return merged;
}
