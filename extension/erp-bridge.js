"use strict";
(() => {
  // extension-src/erp-bridge/adapters.js
  var ADAPTERS = [];
  ADAPTERS.push({
    name: "cosium",
    displayName: "Cosium",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("cosium") !== -1 || hostname2.indexOf("cosiumshop") !== -1) return true;
      if (doc.querySelector("app-root[ng-version], cosium-app, [class*=cosium], [id*=cosium]")) return true;
      if (doc.querySelector("img[src*=cosium], link[href*=cosium]")) return true;
      return false;
    },
    framework: "angular",
    aliases: {
      nom: ["patient_nom", "client_nom", "nomBeneficiaire"],
      prenom: ["patient_prenom", "client_prenom", "prenomBeneficiaire"],
      numeroSecuriteSociale: ["nirAssure", "nirBeneficiaire"]
    },
    pecAliases: {},
    patientPageIndicators: [
      "[class*=patient-detail]",
      "[class*=patient-fiche]",
      "[class*=client-form]",
      "[class*=dossier-patient]",
      "[data-view*=patient]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2500,
    observerDebounce: 1500,
    searchIframes: true,
    searchShadowDOM: true,
    inputSelector: null,
    readOnlySelectors: null,
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "ioptics",
    displayName: "I-Optics (Cegid)",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("cegid") !== -1 || hostname2.indexOf("i-optics") !== -1 || hostname2.indexOf("ioptics") !== -1 || hostname2.indexOf("cristallin") !== -1) return true;
      if (doc.querySelector("[class*=cegid], [class*=cristallin], img[src*=cegid], img[src*=cristallin]")) return true;
      if (doc.querySelector("#__VIEWSTATE") && doc.querySelector("[id*=Patient], [id*=Client], [id*=Porteur]")) return true;
      var pageText = (doc.title || "").toLowerCase();
      if (pageText.indexOf("cristallin") !== -1 || pageText.indexOf("i-optics") !== -1) return true;
      return false;
    },
    framework: "auto",
    aliases: {
      nom: ["txtNom", "txtNomPatient", "ctl_nom", "ctl00_nom", "tbNom"],
      prenom: ["txtPrenom", "txtPrenomPatient", "ctl_prenom", "ctl00_prenom", "tbPrenom"],
      numeroSecuriteSociale: ["txtNSS", "txtNumSS", "ctl_nss", "txtImmat", "tbNSS"],
      dateNaissance: ["txtDateNaissance", "ctl_dateNaiss", "txtDDN", "tbDateNaiss"],
      telephone: ["txtTel", "txtTelephone", "ctl_tel", "tbTelMobile"],
      email: ["txtEmail", "txtMail", "ctl_email", "tbEmail"]
    },
    pecAliases: {
      numeroAccord: ["txtNumAccord", "tbAccord"],
      montantPEC: ["txtMontantPEC", "tbMontant"]
    },
    patientPageIndicators: [
      "#pnlPatient",
      "#divFicheClient",
      "[id*=PatientDetail]",
      "#ContentPlaceHolder",
      "[class*=porteur]",
      "[id*=FichePorteur]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1500,
    searchIframes: true,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: "span.aspNetDisabled, span.field-display, td.data-cell, .readonly-field",
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "pvo",
    displayName: "PVO (Ginkoia)",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("ginkoia") !== -1 || hostname2.indexOf("pvo") !== -1 || hostname2.indexOf("dlsoftware") !== -1) return true;
      if (doc.querySelector("[class*=ginkoia], [class*=pvo-], img[src*=ginkoia], img[src*=pvo]")) return true;
      if (doc.querySelector("meta[content*=ginkoia], meta[content*=PVO]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("pvo") !== -1 || title.indexOf("ginkoia") !== -1 || title.indexOf("points de vente") !== -1) return true;
      return false;
    },
    framework: "jquery",
    aliases: {
      nom: ["fld_nom_porteur", "porteur_nom", "nomPorteur", "input_nom_porteur"],
      prenom: ["fld_prenom_porteur", "porteur_prenom", "prenomPorteur"],
      numeroSecuriteSociale: ["fld_nss", "porteur_nss", "nssPorteur", "num_immat"],
      dateNaissance: ["fld_date_naiss", "porteur_ddn", "dateNaissPorteur"],
      organisme: ["fld_mutuelle", "porteur_mutuelle", "mutuelleName"]
    },
    pecAliases: {},
    patientPageIndicators: [
      "[class*=fiche-porteur]",
      "[class*=porteur-detail]",
      "#fichePorteur",
      "#porteurForm",
      "[class*=client-detail]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1500,
    searchIframes: true,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: ".porteur-info span, .data-display, td.valeur",
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "idmoptic",
    displayName: "IDM Optic",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("idm") !== -1 || hostname2.indexOf("axess") !== -1 || hostname2.indexOf("actu-gestion") !== -1 || hostname2.indexOf("actugestion") !== -1) return true;
      if (doc.querySelector("[class*=idm-], [class*=axess], img[src*=idm], img[src*=axess]")) return true;
      if (doc.querySelector("meta[content*=IDM], meta[content*=Axess]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("idm") !== -1 || title.indexOf("axess") !== -1) return true;
      return false;
    },
    framework: "auto",
    aliases: {
      nom: ["patient_lastname", "client_lastname", "beneficiaire_nom"],
      prenom: ["patient_firstname", "client_firstname", "beneficiaire_prenom"],
      numeroSecuriteSociale: ["patient_nir", "client_nir", "nir_patient"],
      dateNaissance: ["patient_birthdate", "client_birthdate", "ddn_patient"]
    },
    pecAliases: {},
    patientPageIndicators: [
      "[class*=patient-card]",
      "[class*=client-card]",
      "[class*=fiche-patient]",
      "[data-page=patient]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1200,
    searchIframes: false,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: null,
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "myeasyoptic",
    displayName: "MyEasyOptic",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("myeasyoptic") !== -1 || hostname2.indexOf("easyoptic") !== -1) return true;
      if (doc.querySelector("[class*=easyoptic], [class*=myeasy], img[src*=easyoptic], img[src*=myeasy]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("easyoptic") !== -1 || title.indexOf("myeasy") !== -1) return true;
      return false;
    },
    framework: "react",
    aliases: {
      nom: ["patient_name", "clientName", "beneficiary_name"],
      prenom: ["patient_firstname", "clientFirstname", "beneficiary_firstname"]
    },
    pecAliases: {},
    patientPageIndicators: [
      "[class*=patient-view]",
      "[class*=client-view]",
      "[data-route*=patient]",
      "[class*=fiche]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 1800,
    observerDebounce: 1200,
    searchIframes: false,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: null,
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "winoptics",
    displayName: "WinOptics",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("winoptics") !== -1) return true;
      if (doc.querySelector("[class*=winoptics], [id*=winoptics], img[src*=winoptics]")) return true;
      if (doc.querySelector("meta[content*=WinOptics]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("winoptics") !== -1) return true;
      return false;
    },
    framework: "jquery",
    aliases: {
      nom: ["txt_nom", "nom_porteur", "wo_nom", "input_nom"],
      prenom: ["txt_prenom", "prenom_porteur", "wo_prenom", "input_prenom"],
      numeroSecuriteSociale: ["txt_nss", "nss_porteur", "wo_nss"],
      dateNaissance: ["txt_ddn", "ddn_porteur", "wo_ddn"],
      telephone: ["txt_tel", "tel_porteur", "wo_tel"],
      organisme: ["txt_mutuelle", "mutuelle_porteur", "wo_mutuelle"]
    },
    pecAliases: {},
    patientPageIndicators: [
      "#ficheClient",
      "#formPorteur",
      "[class*=porteur]",
      "[class*=wo-patient]",
      "[id*=client]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1500,
    searchIframes: true,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: ".wo-display, .readonly, span.data, td.value",
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "optimum",
    displayName: "Optimum (CIT)",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("optimum") !== -1 || hostname2.indexOf("livebyoptimum") !== -1 || hostname2.indexOf("cit-") !== -1) return true;
      if (doc.querySelector("[class*=optimum], [class*=cit-app], img[src*=optimum], img[src*=cit]")) return true;
      if (doc.querySelector("[data-app=optimum], [id*=optimum]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("optimum") !== -1) return true;
      return false;
    },
    framework: "react",
    aliases: {
      nom: ["customerLastName", "clientLastName", "beneficiaryLastName"],
      prenom: ["customerFirstName", "clientFirstName", "beneficiaryFirstName"],
      numeroSecuriteSociale: ["socialSecurityNumber", "nirNumber", "customerNIR"],
      dateNaissance: ["customerBirthDate", "clientBirthDate"]
    },
    pecAliases: {},
    patientPageIndicators: [
      "[class*=customer-detail]",
      "[class*=client-sheet]",
      "[data-page=customer]",
      "[class*=patient-info]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1200,
    searchIframes: false,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: null,
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "osmose",
    displayName: "Osmose (Amonis)",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("osmose") !== -1 || hostname2.indexOf("amonis") !== -1) return true;
      if (doc.querySelector("[class*=osmose], [class*=amonis], img[src*=osmose], img[src*=amonis]")) return true;
      if (doc.querySelector("[data-app=osmose]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("osmose") !== -1 || title.indexOf("amonis") !== -1) return true;
      return false;
    },
    framework: "vue",
    aliases: {
      nom: ["patientNom", "clientNom", "beneficiaireNom", "last_name"],
      prenom: ["patientPrenom", "clientPrenom", "beneficiairePrenom", "first_name"],
      numeroSecuriteSociale: ["patientNir", "nirAssure", "nirBeneficiaire"],
      dateNaissance: ["patientDateNaissance", "dateNaissancePatient"]
    },
    pecAliases: {},
    patientPageIndicators: [
      "[class*=patient-fiche]",
      "[class*=dossier-client]",
      "[class*=fiche-beneficiaire]",
      "[data-view=patient]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1200,
    searchIframes: false,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: null,
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "acuitas",
    displayName: "Acuitas 3 (Ocuco)",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("ocuco") !== -1 || hostname2.indexOf("acuitas") !== -1) return true;
      if (doc.querySelector("[class*=ocuco], [class*=acuitas], img[src*=ocuco], img[src*=acuitas]")) return true;
      if (doc.querySelector("meta[content*=Ocuco], meta[content*=Acuitas]")) return true;
      if (doc.querySelector("script[src*=blazor], #blazor-error-ui") && doc.querySelector("[class*=patient], [class*=client]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("acuitas") !== -1 || title.indexOf("ocuco") !== -1) return true;
      return false;
    },
    framework: "auto",
    aliases: {
      nom: ["PatientSurname", "patient_surname", "Surname", "LastName", "FamilyName"],
      prenom: ["PatientForename", "patient_forename", "Forename", "FirstName", "GivenName"],
      numeroSecuriteSociale: ["PatientNIR", "NIR", "SocialSecurityNo", "SSN", "InsuranceNo"],
      dateNaissance: ["PatientDOB", "DOB", "DateOfBirth", "BirthDate"],
      telephone: ["PatientPhone", "MobilePhone", "HomePhone", "PhoneNo"],
      email: ["PatientEmail", "EmailAddress", "Email"],
      /* Ordonnance — Acuitas est fort sur l'optometrie */
      rpps: ["PrescriberId", "PrescriberNo", "RPPSNo", "PractitionerId"],
      nomOphtalmologue: ["PrescriberName", "PractitionerName", "ReferredBy"]
    },
    pecAliases: {
      numeroAccord: ["AuthorisationNo", "ApprovalNo", "PriorApproval"],
      montantPEC: ["AuthorisedAmount", "ApprovedAmount", "InsuranceAmount"]
    },
    patientPageIndicators: [
      "[class*=patient-record]",
      "[class*=patient-summary]",
      "[id*=PatientDetail]",
      "[class*=clinical-record]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2500,
    observerDebounce: 1500,
    searchIframes: true,
    searchShadowDOM: true,
    inputSelector: null,
    readOnlySelectors: ".display-field, .read-only, span.patient-data, td.data-value",
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "archimed",
    displayName: "Archimed",
    detect: function(hostname2, doc) {
      if (hostname2.indexOf("archimed") !== -1) return true;
      if (doc.querySelector("[class*=archimed], [id*=archimed], img[src*=archimed]")) return true;
      if (doc.querySelector("meta[content*=Archimed]")) return true;
      var title = (doc.title || "").toLowerCase();
      if (title.indexOf("archimed") !== -1) return true;
      return false;
    },
    framework: "jquery",
    aliases: {
      nom: ["fiche_nom", "porteur_nom", "arch_nom", "nom_fiche"],
      prenom: ["fiche_prenom", "porteur_prenom", "arch_prenom"],
      numeroSecuriteSociale: ["fiche_nss", "porteur_nss", "arch_nss", "num_secu_porteur"],
      dateNaissance: ["fiche_ddn", "porteur_ddn", "arch_ddn"],
      organisme: ["fiche_mutuelle", "porteur_mutuelle", "arch_mutuelle", "organisme_tp"],
      numeroAdherent: ["fiche_adherent", "porteur_adherent", "num_adherent_tp"]
    },
    pecAliases: {
      numeroAccord: ["arch_accord", "accord_tp", "num_accord_tp"],
      montantPEC: ["arch_montant", "montant_tp", "part_mutuelle"]
    },
    patientPageIndicators: [
      "#fichePorteur",
      "#formPatient",
      "[class*=arch-fiche]",
      "[class*=fiche-porteur]",
      "[id*=porteur]"
    ],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1500,
    searchIframes: true,
    searchShadowDOM: false,
    inputSelector: null,
    readOnlySelectors: ".arch-display, .fiche-value, td.valeur, span.data-porteur",
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  ADAPTERS.push({
    name: "generic",
    displayName: "ERP",
    detect: function() {
      return true;
    },
    framework: "auto",
    aliases: {},
    pecAliases: {},
    patientPageIndicators: [],
    minFieldsForPatientPage: 3,
    scrapeDelay: 2e3,
    observerDebounce: 1500,
    searchIframes: true,
    searchShadowDOM: true,
    inputSelector: null,
    readOnlySelectors: null,
    beforeScrape: null,
    afterScrape: null,
    transformValue: null
  });
  function detectAdapter(hostname2, doc) {
    for (var i = 0; i < ADAPTERS.length; i++) {
      if (ADAPTERS[i].name !== "generic") {
        try {
          if (ADAPTERS[i].detect(hostname2, doc)) return ADAPTERS[i];
        } catch (e) {
        }
      }
    }
    return ADAPTERS[ADAPTERS.length - 1];
  }

  // extension-src/erp-bridge/aliases.js
  var PATIENT_ALIASES = {
    nom: [
      /* francais standard */
      "nom",
      "nom_patient",
      "patient_nom",
      "nom_client",
      "client_nom",
      "nom_porteur",
      "nom_beneficiaire",
      "nom_assure",
      "assure_nom",
      "nom de famille",
      "nom assure",
      "nom beneficiaire",
      "nom_usage",
      "nom_naissance",
      "nom_jeune_fille",
      "patronyme",
      "identite_nom",
      "ben_nom",
      "nom_ben",
      "nom_pers",
      /* camelCase / formControlName */
      "nomPatient",
      "nomClient",
      "nomBeneficiaire",
      "nomAssure",
      "nomPorteur",
      "nomUsage",
      "nomNaissance",
      "nomJeuneFille",
      "familyName",
      "lastName",
      /* anglais */
      "lastname",
      "last_name",
      "name",
      "surname",
      "family_name",
      /* kebab-case */
      "nom-patient",
      "nom-client",
      "nom-beneficiaire",
      "nom-assure",
      "last-name",
      "family-name",
      /* data attributes */
      "data-nom",
      "data-lastname",
      "data-patient-nom",
      /* ERP specifiques */
      "nomassuree",
      "nomassur\xE9",
      "infos_client_nom",
      "adherent_nom",
      "nom_titulaire",
      "titulaire_nom",
      "nom_personne",
      "personne_nom",
      "nom_tiers",
      "tiers_nom",
      "nom_acheteur",
      "nom_destinataire",
      /* placeholders */
      "votre nom",
      "saisir le nom",
      "entrez le nom",
      "nom du patient",
      "nom du beneficiaire",
      "nom du client",
      /* abbreviations */
      "nm",
      "nom_p"
    ],
    prenom: [
      /* francais standard */
      "prenom",
      "prenom_patient",
      "patient_prenom",
      "prenom_client",
      "client_prenom",
      "prenom_porteur",
      "prenom_beneficiaire",
      "prenom_assure",
      "assure_prenom",
      "prenom beneficiaire",
      "prenom assure",
      "ben_prenom",
      "prenom_ben",
      "prenom_pers",
      /* camelCase / formControlName */
      "prenomPatient",
      "prenomClient",
      "prenomBeneficiaire",
      "prenomAssure",
      "givenName",
      "firstName",
      /* anglais */
      "firstname",
      "first_name",
      "given_name",
      "forename",
      /* kebab-case */
      "prenom-patient",
      "prenom-client",
      "prenom-beneficiaire",
      "first-name",
      "given-name",
      /* data attributes */
      "data-prenom",
      "data-firstname",
      "data-patient-prenom",
      /* ERP specifiques */
      "prenomassuree",
      "infos_client_prenom",
      "adherent_prenom",
      "prenom_titulaire",
      "titulaire_prenom",
      "prenom_personne",
      "prenom_tiers",
      "prenom_acheteur",
      "prenom_destinataire",
      /* placeholders */
      "votre prenom",
      "saisir le prenom",
      "entrez le prenom",
      "prenom du patient",
      "prenom du beneficiaire",
      /* abbreviations */
      "pnm",
      "prn",
      "prenom_p"
    ],
    numeroSecuriteSociale: [
      /* francais standard */
      "nss",
      "num_ss",
      "numss",
      "securite_sociale",
      "numero_secu",
      "immatriculation",
      "nirpp",
      "secu",
      "matricule",
      "n securite sociale",
      "numero securite sociale",
      "no_ss",
      "num_assure",
      "numero_ss",
      "nir",
      "numero_nir",
      "nir_assure",
      "immat",
      "num_immat",
      "cle_nss",
      /* camelCase / formControlName */
      "numeroSecuriteSociale",
      "numSS",
      "numSecu",
      "numInsee",
      "securiteSociale",
      "nirAssure",
      "numAssure",
      "numImmat",
      "numBenef",
      "beneficiaireNni",
      /* formes longues */
      "numero_securite_sociale",
      "numero de securite sociale",
      "no securite sociale",
      "numero_immatriculation",
      "immatriculation_assure",
      "numero_matricule",
      "matricule_assure",
      /* anglais */
      "social_security",
      "social_security_number",
      "ssn",
      "national_id",
      "national_insurance",
      /* kebab-case */
      "num-ss",
      "securite-sociale",
      "numero-secu",
      /* data attributes */
      "data-nss",
      "data-numss",
      "data-securite-sociale",
      /* ERP specifiques */
      "num_insee",
      "numinsee",
      "insee",
      "nni",
      "beneficiaire_nni",
      "num_benef",
      "numbenef",
      "nir_beneficiaire",
      "nir_ben",
      "immat_beneficiaire",
      "numero_assure_social",
      "num_regime",
      "numsecuritesociale",
      "numsecurite",
      /* avec accents (normalisés) */
      "n\xB0 securite sociale",
      /* placeholders */
      "votre numero de securite sociale",
      "numero secu",
      "saisir le numero ss",
      "numero nir",
      /* abbreviations */
      "ss",
      "nss_cle",
      "nirpp_cle"
    ],
    dateNaissance: [
      /* francais standard */
      "datenaissance",
      "date_naissance",
      "naissance",
      "ddn",
      "date_de_naissance",
      "datedenaissance",
      "ne_le",
      "nee_le",
      "date_nais",
      "datenais",
      "date de naissance",
      "naissance beneficiaire",
      "date naissance beneficiaire",
      /* camelCase / formControlName */
      "dateNaissance",
      "dateDeNaissance",
      "dateNais",
      "birthDate",
      "dateOfBirth",
      "naissanceAssure",
      "naissanceBeneficiaire",
      "dateNaissanceAssure",
      "dateNaissanceBeneficiaire",
      /* anglais */
      "birthdate",
      "birth_date",
      "dob",
      "date_of_birth",
      "datebirth",
      "borndate",
      "dateofbirth",
      "born_on",
      /* kebab-case */
      "date-naissance",
      "date-de-naissance",
      "birth-date",
      /* data attributes */
      "data-ddn",
      "data-naissance",
      "data-birthdate",
      /* ERP specifiques */
      "datennaissanceassure",
      "datennaissanceassuree",
      "datennaissancebenef",
      "date de naissance beneficiaire",
      "naissance_assure",
      "naissance_beneficiaire",
      "date_naissance_patient",
      "ddn_patient",
      "nele",
      "neele",
      "ne(e) le",
      /* placeholders */
      "votre date de naissance",
      "jj/mm/aaaa",
      "date de naissance (jj/mm/aaaa)",
      /* abbreviations */
      "dn",
      "d_nais",
      "d_naiss"
    ],
    telephone: [
      /* francais standard */
      "telephone",
      "tel",
      "phone",
      "mobile",
      "portable",
      "num_tel",
      "numero_telephone",
      "tel_portable",
      "tel_mobile",
      "gsm",
      "tel_fixe",
      "fixe",
      "tel_domicile",
      "tel_bureau",
      "tel_travail",
      "tel_pro",
      /* camelCase / formControlName */
      "telephoneMobile",
      "telephoneFixe",
      "telephonePortable",
      "phoneNumber",
      "mobilePhone",
      "numTel",
      "numTelephone",
      /* anglais */
      "cellphone",
      "cell_phone",
      "cell",
      "phone_number",
      "phonenumber",
      "mobile_phone",
      "home_phone",
      "work_phone",
      "landline",
      /* kebab-case */
      "tel-portable",
      "tel-mobile",
      "tel-fixe",
      "phone-number",
      /* data attributes */
      "data-tel",
      "data-phone",
      "data-telephone",
      /* ERP specifiques */
      "contact_tel",
      "infos_client_telephone",
      "numtelphone",
      "coordonnees_tel",
      "tel_contact",
      "telephone1",
      "tel1",
      "phone1",
      "tel2",
      "telephone2",
      "num_telephone_mobile",
      "num_telephone_fixe",
      "mobile_patient",
      "tel_patient",
      "portable_patient",
      /* avec accents (normalisés) */
      "numero de telephone",
      /* placeholders */
      "votre numero de telephone",
      "06xxxxxxxx",
      "telephone mobile",
      "telephone fixe",
      "telephone portable",
      /* abbreviations */
      "t",
      "tph",
      "telph"
    ],
    email: [
      /* standard */
      "email",
      "mail",
      "courriel",
      "adresse_email",
      "adresse_mail",
      "e-mail",
      "contact_email",
      /* camelCase / formControlName */
      "emailAddress",
      "adresseMail",
      "adresseEmail",
      /* anglais */
      "emailaddress",
      "email_address",
      /* kebab-case */
      "adresse-email",
      "adresse-mail",
      /* data attributes */
      "data-email",
      "data-mail",
      /* ERP specifiques */
      "adressemail",
      "adresse e-mail",
      "adressecourriel",
      "mail_patient",
      "email_patient",
      "mail_contact",
      "email_contact",
      "courriel_patient",
      "email_client",
      /* placeholders */
      "votre adresse email",
      "email@exemple.fr",
      "saisir l'email"
    ],
    adresse: [
      /* francais standard */
      "adresse",
      "adresse_postale",
      "adresse1",
      "adresse_ligne1",
      "ligne_1",
      "rue",
      "voie",
      "adresse postale",
      "adresse_patient",
      "adresse_client",
      /* camelCase / formControlName */
      "adressePostale",
      "adresseLigne1",
      "streetAddress",
      /* anglais */
      "address",
      "street",
      "street_address",
      "streetaddress",
      "address_line1",
      "address_line_1",
      "addressline1",
      "line1",
      "address1",
      /* kebab-case */
      "adresse-postale",
      "adresse-ligne1",
      "street-address",
      /* data attributes */
      "data-adresse",
      "data-address",
      "data-street",
      /* ERP specifiques */
      "adresseligne1",
      "ligne1",
      "adressepostale",
      "voie_patient",
      "rue_patient",
      "adresse_domicile",
      "num_voie",
      "numero_rue",
      "adresse_complete",
      /* placeholders */
      "votre adresse",
      "numero et nom de rue",
      "saisir l'adresse"
    ],
    codePostal: [
      /* francais standard */
      "codepostal",
      "code_postal",
      "cp",
      "code postal",
      "cp_ville",
      "code_post",
      /* camelCase / formControlName */
      "codePostal",
      "postalCode",
      "zipCode",
      /* anglais */
      "zipcode",
      "zip_code",
      "zip",
      "postal_code",
      "postalcode",
      "postcode",
      "post_code",
      /* kebab-case */
      "code-postal",
      "zip-code",
      "postal-code",
      /* data attributes */
      "data-cp",
      "data-codepostal",
      "data-zipcode",
      /* ERP specifiques */
      "cp_patient",
      "code_postal_patient",
      "cp_client",
      "cp_domicile",
      "code_postal_domicile",
      /* placeholders */
      "votre code postal",
      "ex: 75001"
    ],
    ville: [
      /* francais standard */
      "ville",
      "commune",
      "localite",
      "nom_ville",
      "ville_commune",
      "ville_patient",
      "ville_client",
      /* camelCase / formControlName */
      "villeCommune",
      "nomVille",
      "cityName",
      /* anglais */
      "city",
      "municipality",
      "town",
      "locality",
      "city_name",
      "cityname",
      /* kebab-case */
      "ville-commune",
      "city-name",
      /* data attributes */
      "data-ville",
      "data-city",
      /* ERP specifiques */
      "localit\xE9",
      "localite_patient",
      "commune_patient",
      "ville_domicile",
      "commune_domicile",
      /* placeholders */
      "votre ville",
      "nom de la commune",
      "ville ou commune"
    ],
    civilite: [
      /* francais standard */
      "civilite",
      "titre",
      "civ",
      "mr_mme",
      "sexe",
      "civilite_patient",
      "civilite_client",
      /* camelCase / formControlName */
      "civilitePatient",
      "titlePatient",
      "genderPatient",
      /* anglais */
      "title",
      "gender",
      "salutation",
      "prefix",
      "name_prefix",
      "honorific",
      /* kebab-case */
      "mr-mme",
      "name-prefix",
      /* data attributes */
      "data-civilite",
      "data-title",
      "data-gender",
      /* ERP specifiques */
      "titre_civilite",
      "civ_patient",
      "mme_m",
      "m_mme",
      "monsieur_madame",
      "genre",
      /* placeholders */
      "m. / mme",
      "monsieur ou madame"
    ]
  };
  var MUTUELLE_ALIASES = {
    organisme: [
      /* francais standard */
      "organisme",
      "mutuelle",
      "complementaire",
      "assureur",
      "caisse",
      "nom_mutuelle",
      "amc",
      "organisme_complementaire",
      "assurance",
      "libelle_organisme",
      "nom_organisme",
      "compagnie",
      "organisme_amc",
      "tiers_payant",
      "complementaire_sante",
      /* camelCase / formControlName */
      "nomMutuelle",
      "organismeComplementaire",
      "organismeAmc",
      "libelleOrganisme",
      "assureurComplementaire",
      /* anglais */
      "insurer",
      "insurance",
      "insurance_company",
      "insurance_provider",
      "health_fund",
      "mutual",
      /* kebab-case */
      "nom-mutuelle",
      "organisme-complementaire",
      /* data attributes */
      "data-organisme",
      "data-mutuelle",
      "data-assureur",
      /* ERP specifiques */
      "code_mutuelle",
      "mutuelle_nom",
      "organisme_rc",
      "rc_organisme",
      "organisme_tp",
      "tp_organisme",
      "caisse_complementaire",
      "regime_complementaire",
      "nom_caisse",
      "nom_assureur",
      "nom_compagnie",
      "oc",
      "organisme_oc",
      /* placeholders */
      "nom de la mutuelle",
      "organisme complementaire",
      "saisir la mutuelle",
      "rechercher une mutuelle"
    ],
    numeroAdherent: [
      /* francais standard */
      "numeroadherent",
      "num_adherent",
      "adherent",
      "numero_contrat",
      "contrat",
      "num_contrat",
      "no_contrat",
      "numero_membre",
      "num_membre",
      "reference_adherent",
      "ref_adherent",
      "numero adherent",
      "n contrat",
      /* camelCase / formControlName */
      "numeroAdherent",
      "numAdherent",
      "numContrat",
      "numeroContrat",
      "refAdherent",
      "idAdherent",
      /* anglais */
      "member_number",
      "member_id",
      "membership_number",
      "policy_number",
      "policynumber",
      "contract_number",
      "subscriber_id",
      "contract",
      /* kebab-case */
      "num-adherent",
      "numero-contrat",
      "num-contrat",
      /* data attributes */
      "data-adherent",
      "data-contrat",
      "data-num-adherent",
      /* ERP specifiques */
      "ncontrat",
      "numcontrat",
      "nocontrat",
      "id_adherent",
      "adherent_numero",
      "contrat_numero",
      "num_police",
      "numero_police",
      "ref_contrat",
      "reference_contrat",
      "immatriculation_adherent",
      "immat_adherent",
      /* placeholders */
      "numero d'adherent",
      "votre numero de contrat",
      "saisir le numero d'adherent",
      "n\xB0 contrat",
      /* abbreviations */
      "nad",
      "nadh"
    ],
    codeOrganisme: [
      /* francais standard */
      "code_organisme",
      "code_amc",
      "numero_amc",
      "num_amc",
      "code_mutuelle",
      "id_organisme",
      "num_organisme",
      "code_oc",
      /* camelCase / formControlName */
      "codeOrganisme",
      "codeAmc",
      "numeroAmc",
      "numAmc",
      "idOrganisme",
      "numOrganisme",
      /* anglais */
      "insurer_code",
      "insurance_code",
      "fund_code",
      "provider_code",
      /* kebab-case */
      "code-organisme",
      "code-amc",
      "num-amc",
      /* data attributes */
      "data-code-organisme",
      "data-code-amc",
      /* ERP specifiques */
      "amc",
      "numero_organisme",
      "ref_organisme",
      "reference_organisme",
      "code_caisse",
      "id_caisse",
      "code_regime_complementaire",
      "code_complementaire",
      "code_tp",
      "code_tiers_payant",
      /* placeholders */
      "code de l'organisme",
      "code amc",
      "saisir le code organisme"
    ]
  };
  var ORDONNANCE_ALIASES = {
    rpps: [
      /* francais standard */
      "rpps",
      "num_rpps",
      "numero_rpps",
      "code_rpps",
      "identifiant_rpps",
      "id_prescripteur",
      "adeli",
      "num_adeli",
      "numero_adeli",
      "finess",
      "num_finess",
      /* camelCase / formControlName */
      "numRpps",
      "numeroRpps",
      "codeRpps",
      "idPrescripteur",
      "numAdeli",
      "numAm",
      "numAmPrescripteur",
      /* anglais */
      "prescriber_id",
      "prescriber_code",
      "doctor_id",
      "provider_id",
      /* kebab-case */
      "num-rpps",
      "code-rpps",
      "id-prescripteur",
      /* data attributes */
      "data-rpps",
      "data-prescripteur",
      /* ERP specifiques */
      "numrpps",
      "n\xB0rpps",
      "numam",
      "num_am",
      "numero_am",
      "numamprescripteur",
      "rpps_prescripteur",
      "code_prescripteur",
      "identifiant_medecin",
      "id_medecin",
      /* placeholders */
      "numero rpps",
      "saisir le rpps",
      "identifiant rpps du prescripteur"
    ],
    dateOrdonnance: [
      /* francais standard */
      "dateordonnance",
      "date_ordonnance",
      "date_ordo",
      "date prescription",
      "date_prescription",
      "date ordonnance",
      "date de l'ordonnance",
      "date de prescription",
      /* camelCase / formControlName */
      "dateOrdonnance",
      "datePrescription",
      "dateOrdo",
      "ordonnanceDate",
      "prescriptionDate",
      "dateOrdonnanceEdit",
      /* anglais */
      "prescription_date",
      "order_date",
      "rx_date",
      /* kebab-case */
      "date-ordonnance",
      "date-prescription",
      "date-ordo",
      /* data attributes */
      "data-date-ordonnance",
      "data-date-prescription",
      /* ERP specifiques */
      "dateordo",
      "ordonnance_date",
      "dt_ordonnance",
      "dt_prescription",
      "date_ordo_edit",
      "dateordonnanceedit",
      "date_rx",
      /* placeholders */
      "date de la prescription",
      "jj/mm/aaaa",
      "date ordonnance (jj/mm/aaaa)"
    ],
    nomOphtalmologue: [
      /* francais standard */
      "ophtalmologue",
      "prescripteur",
      "nom_medecin",
      "medecin",
      "docteur",
      "nom prescripteur",
      "nom_prescripteur",
      "nom_ophtalmologue",
      "ophtalmo",
      "nom_docteur",
      /* camelCase / formControlName */
      "nomOphtalmologue",
      "nomMedecin",
      "nomPrescripteur",
      "nomDocteur",
      "medecinPrescripteur",
      /* anglais */
      "doctor",
      "prescriber",
      "prescriber_name",
      "doctor_name",
      "physician",
      "ophthalmologist",
      /* kebab-case */
      "nom-prescripteur",
      "nom-medecin",
      "nom-docteur",
      /* data attributes */
      "data-prescripteur",
      "data-medecin",
      /* ERP specifiques */
      "nommedecin",
      "medecin_prescripteur",
      "docteur prescripteur",
      "medecin_traitant",
      "ophtalmologiste",
      "nom_ophtalmo",
      "prescripteur_nom",
      "dr_nom",
      /* placeholders */
      "nom du prescripteur",
      "nom du medecin",
      "rechercher un prescripteur",
      "dr."
    ]
  };
  var OPTICAL_OD_ALIASES = {
    "lunettesOD.sphere": [
      /* francais standard avec lateralite */
      "sphere_od",
      "sph_od",
      "od_sph",
      "od_sphere",
      "sphere od",
      "sph od",
      "sphere_droit",
      "sph_droit",
      "sphere_d",
      "sph_d",
      /* VL (Vision de Loin) */
      "sphere_vl_od",
      "sph_vl_od",
      "vl_sph_od",
      "sphere_loin_od",
      "sph_loin_od",
      "spherevlod",
      "sphvlod",
      /* VP (Vision de Pres) */
      "sphere_vp_od",
      "sph_vp_od",
      "vp_sph_od",
      "sphere_pres_od",
      "sph_pres_od",
      "spherevpod",
      "sphvpod",
      /* camelCase / formControlName */
      "sphereOd",
      "sphOd",
      "sphereDroit",
      "sphDroit",
      "sphereOeilDroit",
      "sphereVlOd",
      "sphereVpOd",
      /* anglais */
      "sphere_right",
      "sph_right",
      "right_sphere",
      "sphere_re",
      "sph_re",
      "r_sphere",
      "r_sph",
      /* kebab-case */
      "sphere-od",
      "sph-od",
      "sphere-droit",
      /* data attributes */
      "data-sphere-od",
      "data-sph-od",
      /* ERP specifiques */
      "sphereod",
      "sphod",
      "od_sphere_vl",
      "od_sphere_vp",
      "sphere_verre_droit",
      "sphereverredroit",
      "rx_sphere_od",
      "rx_sph_od",
      "puissance_od",
      "pwr_od",
      "power_od",
      /* placeholders */
      "sph. od",
      "sphere oeil droit",
      /* abbreviations */
      "s_od",
      "sod"
    ],
    "lunettesOD.cylindre": [
      /* francais standard avec lateralite */
      "cylindre_od",
      "cyl_od",
      "od_cyl",
      "od_cylindre",
      "cylindre od",
      "cyl od",
      "cylindre_droit",
      "cyl_droit",
      "cylindre_d",
      "cyl_d",
      /* VL / VP */
      "cylindre_vl_od",
      "cyl_vl_od",
      "cylindre_vp_od",
      "cyl_vp_od",
      /* camelCase / formControlName */
      "cylindreOd",
      "cylOd",
      "cylindreDroit",
      "cylDroit",
      "cylindreOeilDroit",
      "cylindreVlOd",
      /* anglais */
      "cylinder_right",
      "cyl_right",
      "right_cylinder",
      "cylinder_re",
      "cyl_re",
      "r_cylindre",
      "r_cyl",
      /* kebab-case */
      "cylindre-od",
      "cyl-od",
      "cylindre-droit",
      /* data attributes */
      "data-cylindre-od",
      "data-cyl-od",
      /* ERP specifiques */
      "cylindreod",
      "cylod",
      "cylindre_verre_droit",
      "rx_cylindre_od",
      "rx_cyl_od",
      /* placeholders */
      "cyl. od",
      "cylindre oeil droit",
      /* abbreviations */
      "c_od",
      "cod"
    ],
    "lunettesOD.axe": [
      /* francais standard avec lateralite */
      "axe_od",
      "ax_od",
      "od_axe",
      "od_ax",
      "axe od",
      "ax od",
      "axe_droit",
      "ax_droit",
      "axe_d",
      "ax_d",
      /* VL / VP */
      "axe_vl_od",
      "ax_vl_od",
      "axe_vp_od",
      "ax_vp_od",
      /* camelCase / formControlName */
      "axeOd",
      "axOd",
      "axeDroit",
      "axDroit",
      "axeOeilDroit",
      "axeVlOd",
      /* anglais */
      "axis_right",
      "ax_right",
      "right_axis",
      "axis_re",
      "ax_re",
      "r_axe",
      "r_ax",
      /* kebab-case */
      "axe-od",
      "ax-od",
      "axe-droit",
      /* data attributes */
      "data-axe-od",
      "data-ax-od",
      /* ERP specifiques */
      "axeod",
      "axod",
      "axe_verre_droit",
      "rx_axe_od",
      "rx_ax_od",
      "orientation_od",
      "angle_od",
      /* placeholders */
      "axe oeil droit",
      "axe (\xB0)",
      /* abbreviations */
      "a_od",
      "aod"
    ],
    "lunettesOD.addition": [
      /* francais standard avec lateralite */
      "addition_od",
      "add_od",
      "od_add",
      "od_addition",
      "addition od",
      "add od",
      "addition_droit",
      "add_droit",
      "addition_d",
      "add_d",
      /* camelCase / formControlName */
      "additionOd",
      "addOd",
      "additionDroit",
      "addDroit",
      "additionOeilDroit",
      "addVpOd",
      /* anglais */
      "addition_right",
      "add_right",
      "right_addition",
      "addition_re",
      "add_re",
      "r_addition",
      "r_add",
      "near_add_right",
      "near_add_od",
      /* kebab-case */
      "addition-od",
      "add-od",
      "addition-droit",
      /* data attributes */
      "data-addition-od",
      "data-add-od",
      /* ERP specifiques */
      "additionod",
      "addod",
      "addition_verre_droit",
      "rx_addition_od",
      "rx_add_od",
      "addition_vp_od",
      "add_vp_od",
      /* placeholders */
      "add. od",
      "addition oeil droit",
      /* abbreviations */
      "ad_od",
      "adod"
    ]
  };
  var OPTICAL_OG_ALIASES = {
    "lunettesOG.sphere": [
      /* francais standard avec lateralite */
      "sphere_og",
      "sph_og",
      "og_sph",
      "og_sphere",
      "sphere og",
      "sph og",
      "sphere_gauche",
      "sph_gauche",
      "sphere_g",
      "sph_g",
      /* VL (Vision de Loin) */
      "sphere_vl_og",
      "sph_vl_og",
      "vl_sph_og",
      "sphere_loin_og",
      "sph_loin_og",
      "spherevlog",
      "sphvlog",
      /* VP (Vision de Pres) */
      "sphere_vp_og",
      "sph_vp_og",
      "vp_sph_og",
      "sphere_pres_og",
      "sph_pres_og",
      "spherevpog",
      "sphvpog",
      /* camelCase / formControlName */
      "sphereOg",
      "sphOg",
      "sphereGauche",
      "sphGauche",
      "sphereOeilGauche",
      "sphereVlOg",
      "sphereVpOg",
      /* anglais */
      "sphere_left",
      "sph_left",
      "left_sphere",
      "sphere_le",
      "sph_le",
      "l_sphere",
      "l_sph",
      /* kebab-case */
      "sphere-og",
      "sph-og",
      "sphere-gauche",
      /* data attributes */
      "data-sphere-og",
      "data-sph-og",
      /* ERP specifiques */
      "sphereog",
      "sphog",
      "og_sphere_vl",
      "og_sphere_vp",
      "sphere_verre_gauche",
      "sphereverregauche",
      "rx_sphere_og",
      "rx_sph_og",
      "puissance_og",
      "pwr_og",
      "power_og",
      /* placeholders */
      "sph. og",
      "sphere oeil gauche",
      /* abbreviations */
      "s_og",
      "sog"
    ],
    "lunettesOG.cylindre": [
      /* francais standard avec lateralite */
      "cylindre_og",
      "cyl_og",
      "og_cyl",
      "og_cylindre",
      "cylindre og",
      "cyl og",
      "cylindre_gauche",
      "cyl_gauche",
      "cylindre_g",
      "cyl_g",
      /* VL / VP */
      "cylindre_vl_og",
      "cyl_vl_og",
      "cylindre_vp_og",
      "cyl_vp_og",
      /* camelCase / formControlName */
      "cylindreOg",
      "cylOg",
      "cylindreGauche",
      "cylGauche",
      "cylindreOeilGauche",
      "cylindreVlOg",
      /* anglais */
      "cylinder_left",
      "cyl_left",
      "left_cylinder",
      "cylinder_le",
      "cyl_le",
      "l_cylindre",
      "l_cyl",
      /* kebab-case */
      "cylindre-og",
      "cyl-og",
      "cylindre-gauche",
      /* data attributes */
      "data-cylindre-og",
      "data-cyl-og",
      /* ERP specifiques */
      "cylindreog",
      "cylog",
      "cylindre_verre_gauche",
      "rx_cylindre_og",
      "rx_cyl_og",
      /* placeholders */
      "cyl. og",
      "cylindre oeil gauche",
      /* abbreviations */
      "c_og",
      "cog"
    ],
    "lunettesOG.axe": [
      /* francais standard avec lateralite */
      "axe_og",
      "ax_og",
      "og_axe",
      "og_ax",
      "axe og",
      "ax og",
      "axe_gauche",
      "ax_gauche",
      "axe_g",
      "ax_g",
      /* VL / VP */
      "axe_vl_og",
      "ax_vl_og",
      "axe_vp_og",
      "ax_vp_og",
      /* camelCase / formControlName */
      "axeOg",
      "axOg",
      "axeGauche",
      "axGauche",
      "axeOeilGauche",
      "axeVlOg",
      /* anglais */
      "axis_left",
      "ax_left",
      "left_axis",
      "axis_le",
      "ax_le",
      "l_axe",
      "l_ax",
      /* kebab-case */
      "axe-og",
      "ax-og",
      "axe-gauche",
      /* data attributes */
      "data-axe-og",
      "data-ax-og",
      /* ERP specifiques */
      "axeog",
      "axog",
      "axe_verre_gauche",
      "rx_axe_og",
      "rx_ax_og",
      "orientation_og",
      "angle_og",
      /* placeholders */
      "axe oeil gauche",
      "axe (\xB0)",
      /* abbreviations */
      "a_og",
      "aog"
    ],
    "lunettesOG.addition": [
      /* francais standard avec lateralite */
      "addition_og",
      "add_og",
      "og_add",
      "og_addition",
      "addition og",
      "add og",
      "addition_gauche",
      "add_gauche",
      "addition_g",
      "add_g",
      /* camelCase / formControlName */
      "additionOg",
      "addOg",
      "additionGauche",
      "addGauche",
      "additionOeilGauche",
      "addVpOg",
      /* anglais */
      "addition_left",
      "add_left",
      "left_addition",
      "addition_le",
      "add_le",
      "l_addition",
      "l_add",
      "near_add_left",
      "near_add_og",
      /* kebab-case */
      "addition-og",
      "add-og",
      "addition-gauche",
      /* data attributes */
      "data-addition-og",
      "data-add-og",
      /* ERP specifiques */
      "additionog",
      "addog",
      "addition_verre_gauche",
      "rx_addition_og",
      "rx_add_og",
      "addition_vp_og",
      "add_vp_og",
      /* placeholders */
      "add. og",
      "addition oeil gauche",
      /* abbreviations */
      "ad_og",
      "adog"
    ]
  };
  var PEC_ALIASES = {
    numeroAccord: [
      /* francais standard */
      "num_accord",
      "numero_accord",
      "accord",
      "reference_pec",
      "num_pec",
      "n_accord",
      "no_accord",
      "accord_pec",
      "ref_pec",
      "numero pec",
      "n accord",
      "numero accord",
      /* camelCase / formControlName */
      "numeroAccord",
      "numAccord",
      "refPec",
      "referencePec",
      "accordPec",
      "numPec",
      /* anglais */
      "agreement_number",
      "approval_number",
      "authorization_number",
      "auth_number",
      "approval_ref",
      "agreement_ref",
      /* kebab-case */
      "num-accord",
      "numero-accord",
      "ref-pec",
      /* data attributes */
      "data-accord",
      "data-num-accord",
      "data-pec",
      /* ERP specifiques */
      "numero_prise_en_charge",
      "ref_accord",
      "reference_accord",
      "id_pec",
      "id_accord",
      "numero_autorisation",
      "num_autorisation",
      "code_accord",
      "n_pec",
      /* placeholders */
      "numero d'accord",
      "reference de la pec",
      "saisir le numero d'accord"
    ],
    montantPEC: [
      /* francais standard */
      "montant_pec",
      "montant_accord",
      "montant_rc",
      "prise_en_charge",
      "montant_mutuelle",
      "part_complementaire",
      "montant rembourse",
      "montant pec",
      "montant accord",
      /* camelCase / formControlName */
      "montantPec",
      "montantAccord",
      "montantRc",
      "montantMutuelle",
      "partComplementaire",
      "montantRembourse",
      "priseEnCharge",
      /* anglais */
      "covered_amount",
      "reimbursement_amount",
      "insurance_amount",
      "approved_amount",
      "benefit_amount",
      /* kebab-case */
      "montant-pec",
      "montant-accord",
      "montant-rc",
      /* data attributes */
      "data-montant-pec",
      "data-montant-accord",
      /* ERP specifiques */
      "montant_prise_en_charge",
      "montant_remb",
      "montant_part_complementaire",
      "montant_amc",
      "mt_pec",
      "mt_accord",
      "mt_rc",
      "remboursement_mutuelle",
      "part_mutuelle",
      "montant_couvert",
      "base_remboursement_rc",
      /* placeholders */
      "montant de la prise en charge",
      "montant rembourse par la mutuelle"
    ],
    datePEC: [
      /* francais standard */
      "date_pec",
      "date_accord",
      "date_retour",
      "date_reponse",
      "date_validation",
      "date pec",
      "date accord",
      "date de la pec",
      "date de l'accord",
      /* camelCase / formControlName */
      "datePec",
      "dateAccord",
      "dateRetour",
      "dateReponse",
      "dateValidation",
      "dateApprobation",
      "datePriseEnCharge",
      /* anglais */
      "approval_date",
      "authorization_date",
      "agreement_date",
      "decision_date",
      /* kebab-case */
      "date-pec",
      "date-accord",
      "date-retour",
      /* data attributes */
      "data-date-pec",
      "data-date-accord",
      /* ERP specifiques */
      "dt_pec",
      "dt_accord",
      "dt_retour",
      "date_retour_pec",
      "date_retour_accord",
      "date_prise_en_charge",
      "date_decision",
      "date_emission_pec",
      "date_accord_mutuelle",
      /* placeholders */
      "date de la prise en charge",
      "date de l'accord mutuelle",
      "jj/mm/aaaa"
    ]
  };
  var REJET_NOTE_ALIASES = [
    /* francais standard */
    "remarques",
    "notes",
    "commentaire",
    "commentaires",
    "observations",
    "note",
    "memo",
    "note_interne",
    "remarque",
    "infos_comp",
    "informations_complementaires",
    "observation",
    "note_patient",
    "commentaire_dossier",
    "notes_dossier",
    /* camelCase / formControlName */
    "noteInterne",
    "commentaireDossier",
    "notesDossier",
    "notePatient",
    "infosComplementaires",
    "informationsComplementaires",
    "remarquesDossier",
    /* anglais */
    "comments",
    "comment",
    "remark",
    "remarks",
    "internal_note",
    "case_notes",
    "notes_field",
    /* kebab-case */
    "note-interne",
    "commentaire-dossier",
    "notes-dossier",
    /* ERP specifiques */
    "notes_cliniques",
    "note_libre",
    "texte_libre",
    "zone_commentaire",
    "zone_notes",
    "champ_libre",
    "notes_internes",
    "memo_patient",
    "memo_dossier",
    "annotation",
    "annotations",
    "message",
    "description",
    "detail",
    "details",
    "motif",
    "motif_rejet",
    "raison",
    "note_rejet",
    "commentaire_rejet",
    /* placeholders */
    "ajouter une note",
    "saisir un commentaire",
    "remarques complementaires",
    "notes supplementaires"
  ];
  function buildScrapingAliases() {
    var merged = {};
    var dicts = [PATIENT_ALIASES, MUTUELLE_ALIASES, ORDONNANCE_ALIASES, OPTICAL_OD_ALIASES, OPTICAL_OG_ALIASES];
    for (var d = 0; d < dicts.length; d++) {
      for (var key in dicts[d]) {
        merged[key] = dicts[d][key].slice();
      }
    }
    return merged;
  }
  function buildPecAliases() {
    var merged = {};
    for (var key in PEC_ALIASES) {
      merged[key] = PEC_ALIASES[key].slice();
    }
    return merged;
  }

  // extension-src/erp-bridge/core.js
  function querySelectorAllDeep(selector, root, depth) {
    root = root || document;
    depth = depth || 0;
    if (depth > 5) return [];
    var results = Array.from(root.querySelectorAll(selector));
    var all = root.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      if (all[i].shadowRoot) {
        results = results.concat(querySelectorAllDeep(selector, all[i].shadowRoot, depth + 1));
      }
    }
    if (root === document && depth === 0) {
      var iframes = document.querySelectorAll("iframe");
      for (var fi = 0; fi < iframes.length; fi++) {
        try {
          var iDoc = iframes[fi].contentDocument || iframes[fi].contentWindow && iframes[fi].contentWindow.document;
          if (iDoc) results = results.concat(querySelectorAllDeep(selector, iDoc, depth + 1));
        } catch (e) {
          console.info("[OptiBot] iframe cross-origin ignor\xE9e :", iframes[fi].src || "(no src)");
        }
      }
    }
    return results;
  }
  var _normalizeCache = {};
  function normalizeAlias(str) {
    var key = str || "";
    if (_normalizeCache[key] !== void 0) return _normalizeCache[key];
    var result = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\-_\.\/]/g, "");
    _normalizeCache[key] = result;
    return result;
  }
  function collectSignals(el) {
    var signals = [];
    var directAttrs = [
      el.name,
      el.id,
      el.placeholder,
      el.title,
      el.getAttribute("aria-label"),
      el.getAttribute("data-field"),
      el.getAttribute("data-name"),
      el.getAttribute("data-label"),
      el.getAttribute("data-testid"),
      el.getAttribute("data-bind"),
      el.getAttribute("data-key"),
      el.getAttribute("data-col"),
      el.getAttribute("formcontrolname"),
      el.getAttribute("ng-reflect-name"),
      el.getAttribute("ng-model"),
      el.getAttribute("v-model"),
      el.getAttribute("data-vv-as"),
      el.className
    ];
    for (var i = 0; i < directAttrs.length; i++) {
      if (directAttrs[i]) signals.push(directAttrs[i]);
    }
    var labelEl = el.id ? (el.getRootNode ? el.getRootNode() : document).querySelector('label[for="' + CSS.escape(el.id) + '"]') : null;
    if (!labelEl) {
      var labelledby = el.getAttribute("aria-labelledby");
      if (labelledby) {
        var parts = labelledby.split(/\s+/).map(function(id) {
          var ref = document.getElementById(id);
          return ref ? ref.textContent.trim() : "";
        }).filter(Boolean);
        if (parts.length) signals.push(parts.join(" "));
      }
    }
    if (!labelEl && el.closest) {
      labelEl = el.closest("label");
      if (!labelEl && el.parentElement) {
        labelEl = el.parentElement.querySelector("label");
      }
    }
    if (!labelEl) {
      var prev = el.previousElementSibling;
      if (prev && /^(label|span|div|p|th|td|dt|legend)$/i.test(prev.tagName) && prev.textContent.trim().length < 60) {
        signals.push(prev.textContent.trim());
      }
    }
    if (!labelEl) {
      var td = el.closest ? el.closest("td") : null;
      if (td) {
        var prevTd = td.previousElementSibling;
        if (prevTd && prevTd.textContent.trim().length < 60) {
          signals.push(prevTd.textContent.trim());
        }
      }
    }
    if (!labelEl) {
      var wrapper = el.closest ? el.closest(".form-group, .field, .input-group, .form-field, .field-row, .form-row") : null;
      if (wrapper) {
        var wrapperLabel = wrapper.querySelector("label, .label, .field-label, .form-label, legend");
        if (wrapperLabel && wrapperLabel.textContent.trim().length < 60) {
          signals.push(wrapperLabel.textContent.trim());
        }
      }
    }
    if (labelEl) signals.push(labelEl.textContent.trim());
    if (el.dataset) {
      var dataKeys = Object.keys(el.dataset);
      for (var dk = 0; dk < dataKeys.length; dk++) {
        var dv = el.dataset[dataKeys[dk]];
        if (dv && typeof dv === "string" && dv.length > 2 && dv.length < 50) {
          signals.push(dv);
        }
      }
    }
    return signals;
  }
  function matchFieldAgainst(el, aliasDict) {
    var signals = collectSignals(el);
    var normalizedSignals = signals.map(normalizeAlias).join(" ");
    var bestField = null;
    var bestScore = 0;
    for (var field in aliasDict) {
      var aliases = aliasDict[field];
      for (var a = 0; a < aliases.length; a++) {
        var norm = normalizeAlias(aliases[a]);
        if (normalizedSignals.indexOf(norm) !== -1) {
          var score = norm.length;
          if (score > bestScore) {
            bestScore = score;
            bestField = field;
          }
        }
      }
    }
    return bestField;
  }
  var _scrapingAliases = null;
  var _pecAliases = null;
  var _autoDetectionActive = false;
  function getScrapingAliases() {
    if (!_scrapingAliases) _scrapingAliases = buildScrapingAliases();
    return _scrapingAliases;
  }
  function getPecAliases() {
    if (!_pecAliases) _pecAliases = buildPecAliases();
    return _pecAliases;
  }
  function mergeAdapterAliases(adapter2) {
    if (!adapter2.aliases) return;
    var dict = getScrapingAliases();
    for (var field in adapter2.aliases) {
      if (!dict[field]) dict[field] = [];
      var extras = adapter2.aliases[field];
      for (var i = 0; i < extras.length; i++) {
        if (dict[field].indexOf(extras[i]) === -1) dict[field].push(extras[i]);
      }
    }
    if (!adapter2.pecAliases) return;
    var pec = getPecAliases();
    for (var pf in adapter2.pecAliases) {
      if (!pec[pf]) pec[pf] = [];
      var pe = adapter2.pecAliases[pf];
      for (var j = 0; j < pe.length; j++) {
        if (pec[pf].indexOf(pe[j]) === -1) pec[pf].push(pe[j]);
      }
    }
  }
  function loadLearnedAliases(adapter2) {
    var hostname2 = window.location.hostname;
    chrome.storage.local.get(["optibot_learned_aliases_erp"], function(result) {
      var cached = result.optibot_learned_aliases_erp;
      if (cached && cached.ts && Date.now() - cached.ts < 60 * 60 * 1e3) {
        mergeLearnedIntoDict(cached.aliases || {});
        return;
      }
      getSyncToken().then(function(token) {
        if (!token) return;
        fetch("https://optibot.fr/api/extension/smart-fill/aliases?hostname=" + encodeURIComponent(hostname2)).then(function(r) {
          return r.json();
        }).then(function(data) {
          var aliases = data.aliases || {};
          chrome.storage.local.set({ optibot_learned_aliases_erp: { aliases, ts: Date.now() } });
          mergeLearnedIntoDict(aliases);
        }).catch(function(err) {
          console.warn("[OptiBot] learned aliases fetch failed:", err);
        });
      });
    });
  }
  function mergeLearnedIntoDict(learned) {
    var scrape = getScrapingAliases();
    var pec = getPecAliases();
    for (var label in learned) {
      var field = learned[label];
      if (scrape[field] && scrape[field].indexOf(label) === -1) scrape[field].push(label);
      if (pec[field] && pec[field].indexOf(label) === -1) pec[field].push(label);
    }
  }
  function sendLearnSignal(hostname2, selector, label, oldVariable) {
    getSyncToken().then(function(syncToken) {
      if (!syncToken) return;
      fetch("https://optibot.fr/api/extension/smart-fill/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncToken, hostname: hostname2, selector, label, oldVariable })
      }).catch(function(err) {
        console.warn("[OptiBot] learn signal failed:", err);
      });
    });
  }
  var INPUT_SELECTOR = "input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=image]):not([type=reset]), select, textarea";
  function queryInputs(adapter2) {
    var sel = adapter2.inputSelector || INPUT_SELECTOR;
    return querySelectorAllDeep(sel);
  }
  async function smartScrape(adapter2) {
    var result = {};
    var dict = getScrapingAliases();
    var scanStart = performance.now();
    if (adapter2.beforeScrape) {
      try {
        adapter2.beforeScrape();
      } catch (e) {
      }
    }
    var inputs = queryInputs(adapter2);
    var labelMap = {};
    var labels = document.querySelectorAll("label[for]");
    for (var li = 0; li < labels.length; li++) {
      var forId = labels[li].getAttribute("for");
      if (forId) labelMap[forId] = labels[li].textContent.trim();
    }
    var CHUNK_SIZE = 40;
    for (var chunkStart = 0; chunkStart < inputs.length; chunkStart += CHUNK_SIZE) {
      var chunkEnd = Math.min(chunkStart + CHUNK_SIZE, inputs.length);
      for (var i = chunkStart; i < chunkEnd; i++) {
        var el = inputs[i];
        var val;
        if (el.tagName === "SELECT") {
          val = (el.options[el.selectedIndex] || {}).text || el.value || "";
        } else {
          val = el.value || "";
        }
        val = val.trim();
        if (!val || val.length > 200) continue;
        var field = matchFieldAgainst(el, dict);
        if (field && !result[field]) {
          result[field] = adapter2.transformValue ? adapter2.transformValue(field, val, el) : val;
        }
      }
      if (chunkEnd < inputs.length) {
        await new Promise(function(r) {
          setTimeout(r, 0);
        });
      }
    }
    var roSel = adapter2.readOnlySelectors || "dd, .field-value, [class*=value], [class*=display], [data-field], span.readonly, .form-control-plaintext";
    var containers = document.querySelectorAll(roSel);
    for (var t = 0; t < containers.length; t++) {
      var container = containers[t];
      var text = (container.textContent || "").trim();
      if (!text || text.length > 200 || text.length < 1) continue;
      var cf = matchFieldAgainst(container, dict);
      if (cf && !result[cf]) {
        result[cf] = adapter2.transformValue ? adapter2.transformValue(cf, text, container) : text;
      }
    }
    var scanDuration = Math.round(performance.now() - scanStart);
    if (scanDuration > 500) {
      console.info("[OptiBot] ERP scan: " + inputs.length + " fields in " + scanDuration + "ms");
    }
    if (adapter2.afterScrape) {
      try {
        adapter2.afterScrape(result);
      } catch (e) {
      }
    }
    return result;
  }
  async function isPatientPage(adapter2) {
    if (adapter2.patientPageIndicators && adapter2.patientPageIndicators.length) {
      for (var p = 0; p < adapter2.patientPageIndicators.length; p++) {
        if (document.querySelector(adapter2.patientPageIndicators[p])) {
          var scraped = await smartScrape(adapter2);
          return { isPatient: true, data: scraped, fieldCount: Object.keys(scraped).length };
        }
      }
    }
    var data = await smartScrape(adapter2);
    var count = Object.keys(data).length;
    var min = adapter2.minFieldsForPatientPage || 3;
    return { isPatient: count >= min, data, fieldCount: count };
  }
  async function performScrape(adapter2) {
    var check = await isPatientPage(adapter2);
    if (!check.isPatient) return;
    var s = check.data;
    var cacheObj = {
      current: {
        nom: (s.nom || "").toUpperCase(),
        prenom: s.prenom || "",
        numeroSecuriteSociale: s.numeroSecuriteSociale || "",
        dateNaissance: s.dateNaissance || "",
        telephone: s.telephone || "",
        email: s.email || "",
        adresse: s.adresse || "",
        codePostal: s.codePostal || "",
        ville: s.ville || "",
        civilite: s.civilite || "",
        organisme: s.organisme || "",
        numeroAdherent: s.numeroAdherent || "",
        codeOrganisme: s.codeOrganisme || "",
        ordonnance: {
          rpps: s.rpps || "",
          nomOphtalmologue: s.nomOphtalmologue || "",
          dateOrdonnance: s.dateOrdonnance || "",
          lunettesOD: {
            sphere: s["lunettesOD.sphere"] || "",
            cylindre: s["lunettesOD.cylindre"] || "",
            axe: s["lunettesOD.axe"] || "",
            addition: s["lunettesOD.addition"] || ""
          },
          lunettesOG: {
            sphere: s["lunettesOG.sphere"] || "",
            cylindre: s["lunettesOG.cylindre"] || "",
            axe: s["lunettesOG.axe"] || "",
            addition: s["lunettesOG.addition"] || ""
          }
        },
        source: adapter2.name,
        scrapedAt: Date.now()
      }
    };
    await writeEncryptedCache(cacheObj);
    chrome.runtime.sendMessage({ type: "OPTIBOT_COSIUM_SCRAPED", fields: check.fieldCount });
    showToast("ERP \u2713 \u2014 " + check.fieldCount + " champs lus", "success", adapter2);
  }
  async function injectPEC(encryptedPec, adapter2) {
    var pec = await decryptData(encryptedPec);
    if (!pec) return { ok: false, error: "decrypt_failed" };
    var pecDict = getPecAliases();
    var inputs = queryInputs(adapter2);
    var filled = 0;
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var field = matchFieldAgainst(el, pecDict);
      if (field && pec[field]) {
        ultraFill(el, pec[field], adapter2);
        el.setAttribute("data-optibot-filled", field);
        el.setAttribute("data-optibot-value", pec[field]);
        filled++;
      }
    }
    if (filled > 0) {
      showToast("PEC inject\xE9e \u2713 \u2014 " + filled + " champ(s)", "success", adapter2);
      chrome.storage.local.remove("optibot_pec_pending");
      return { ok: true, filled };
    }
    showToast("Aucun champ PEC d\xE9tect\xE9 sur cette page", "warn", adapter2);
    return { ok: false, error: "no_fields" };
  }
  function injectRejetNote(noteText, adapter2) {
    var inputs = document.querySelectorAll("textarea, input[type=text]");
    var target = null;
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var signals = collectSignals(el);
      var normalizedSignals = signals.map(normalizeAlias).join(" ");
      for (var a = 0; a < REJET_NOTE_ALIASES.length; a++) {
        if (normalizedSignals.indexOf(normalizeAlias(REJET_NOTE_ALIASES[a])) !== -1) {
          target = el;
          break;
        }
      }
      if (target) break;
    }
    if (target) {
      var existing = target.value || "";
      var sep = existing ? "\n---\n" : "";
      ultraFill(target, existing + sep + noteText, adapter2);
      showToast("Note rejet ajout\xE9e dans le dossier", "success", adapter2);
    } else {
      showToast("Rejet S\xE9cu : " + noteText.substring(0, 80), "warn", adapter2);
    }
  }
  function ultraFill(el, val, adapter2) {
    el.focus();
    el.dispatchEvent(new Event("focus", { bubbles: true }));
    if (el.tagName === "SELECT") {
      var best = null;
      var bestDist = Infinity;
      var target = (val || "").toLowerCase().trim();
      for (var oi = 0; oi < el.options.length; oi++) {
        var optText = (el.options[oi].text || "").toLowerCase().trim();
        var optVal = (el.options[oi].value || "").toLowerCase().trim();
        if (optText === target || optVal === target) {
          best = oi;
          break;
        }
        if (optText.indexOf(target) !== -1 || target.indexOf(optText) !== -1) {
          var dist = Math.abs(optText.length - target.length);
          if (dist < bestDist) {
            bestDist = dist;
            best = oi;
          }
        }
      }
      if (best !== null) {
        el.selectedIndex = best;
        el.dispatchEvent(new Event("change", { bubbles: true }));
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      el.dispatchEvent(new Event("blur", { bubbles: true }));
      return;
    }
    var proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var nativeSetter = Object.getOwnPropertyDescriptor(proto, "value");
    if (nativeSetter && nativeSetter.set) {
      nativeSetter.set.call(el, val);
    } else {
      el.value = val;
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new InputEvent("input", { bubbles: true, data: val, inputType: "insertText" }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new Event("blur", { bubbles: true }));
  }
  function showToast(message, type, adapter2) {
    var existing = document.getElementById("optibot-erp-toast");
    if (existing) existing.remove();
    var prefix = adapter2 && adapter2.displayName ? adapter2.displayName + " \u2014 " : "";
    var toast = document.createElement("div");
    toast.id = "optibot-erp-toast";
    toast.textContent = prefix + message;
    var bg = type === "success" ? "#059669" : type === "warn" ? "#d97706" : "#dc2626";
    toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:2147483647;background:" + bg + ";color:white;padding:12px 20px;border-radius:12px;font:700 13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.15);opacity:0;transition:opacity .3s ease;";
    document.body.appendChild(toast);
    requestAnimationFrame(function() {
      toast.style.opacity = "1";
    });
    setTimeout(function() {
      toast.style.opacity = "0";
      setTimeout(function() {
        toast.remove();
      }, 300);
    }, 4e3);
  }
  function setupAutoDetection(adapter2) {
    if (_autoDetectionActive) return;
    _autoDetectionActive = true;
    var scrapeTimer = null;
    var lastScrapeUrl = null;
    async function tryScrape() {
      var url = window.location.href;
      if (url === lastScrapeUrl) return;
      var check = await isPatientPage(adapter2);
      if (check.isPatient) {
        lastScrapeUrl = url;
        performScrape(adapter2);
      }
    }
    setTimeout(tryScrape, adapter2.scrapeDelay || 2e3);
    if (document.body) {
      var obs = new MutationObserver(function(mutations) {
        var hasNew = mutations.some(function(m) {
          return m.addedNodes.length > 0;
        });
        if (hasNew) {
          clearTimeout(scrapeTimer);
          scrapeTimer = setTimeout(tryScrape, adapter2.observerDebounce || 1500);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("pagehide", function() {
        if (obs) obs.disconnect();
      });
    }
    window.addEventListener("popstate", function() {
      setTimeout(tryScrape, 1e3);
    });
    window.addEventListener("hashchange", function() {
      setTimeout(tryScrape, 1e3);
    });
  }
  function setupPassiveLearning(adapter2) {
    document.addEventListener("change", function(e) {
      var el = e.target;
      if (!el || !el.tagName || ["INPUT", "SELECT", "TEXTAREA"].indexOf(el.tagName) === -1) return;
      var filledVar = el.getAttribute("data-optibot-filled");
      if (!filledVar) return;
      var oldValue = el.getAttribute("data-optibot-value");
      if (el.value === oldValue) return;
      var signals = collectSignals(el);
      var label = normalizeAlias(
        signals.filter(function(s) {
          return s && s.length > 2 && s.length < 50;
        })[0] || el.name || el.id || ""
      );
      if (label) {
        sendLearnSignal(window.location.hostname, el.id || el.name || "", label, filledVar);
      }
    }, true);
  }
  function setupMessageListeners(adapter2) {
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
      if (msg && msg.type === "OPTIBOT_INJECT_PEC") {
        injectPEC(msg.pecData, adapter2).then(function(result) {
          sendResponse(result);
        });
        return true;
      }
      if (msg && msg.type === "OPTIBOT_INJECT_REJET_NOTE") {
        injectRejetNote(msg.note, adapter2);
      }
    });
  }
  function initBridge(adapter2) {
    mergeAdapterAliases(adapter2);
    loadLearnedAliases(adapter2);
    setupAutoDetection(adapter2);
    setupPassiveLearning(adapter2);
    setupMessageListeners(adapter2);
  }

  // extension-src/erp-bridge/index.js
  var hostname = window.location.hostname.replace("www.", "");
  var adapter = detectAdapter(hostname, document);
  console.info("[OptiBot] ERP Bridge actif \u2014 adaptateur : " + adapter.displayName + " (" + adapter.name + ")");
  initBridge(adapter);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZXh0ZW5zaW9uLXNyYy9lcnAtYnJpZGdlL2FkYXB0ZXJzLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvZXJwLWJyaWRnZS9hbGlhc2VzLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvZXJwLWJyaWRnZS9jb3JlLmpzIiwgIi4uL2V4dGVuc2lvbi1zcmMvZXJwLWJyaWRnZS9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyogXHUyNTAwXHUyNTAwIE9wdGlCb3QgXHUyMDE0IEFkYXB0YXRldXJzIEVSUCBvcHRpcXVlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogQ2hhcXVlIGFkYXB0YXRldXIgY29uZmlndXJlIGxlIGJyaWRnZSBwb3VyIHVuIEVSUCBzcGVjaWZpcXVlLiAgICAgICAgICAqL1xuLyogTCdhdXRvLWRldGVjdGlvbiBpZGVudGlmaWUgbCdFUlAgYXUgY2hhcmdlbWVudCBkZSBsYSBwYWdlLiAgICAgICAgICAgICovXG5cbnZhciBBREFQVEVSUyA9IFtdO1xuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICAxLiBDT1NJVU0gKENvc2l1bVNob3ApXG4gKiAgTGVhZGVyIHRlY2huby4gU2FhUyBwdXIgKG5hdmlnYXRldXIpLiBBbmd1bGFyLWJhc2VkLlxuICogIEdyYW5kcyByZXNlYXV4IGV0IGNlbnRyZXMgbWl4dGVzIE9wdGlxdWUgKyBBdWRpby5cbiAqICBTdGFjayA6IEFuZ3VsYXIsIFR5cGVTY3JpcHQsIFJFU1QgQVBJLlxuICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG5BREFQVEVSUy5wdXNoKHtcbiAgbmFtZTogXCJjb3NpdW1cIixcbiAgZGlzcGxheU5hbWU6IFwiQ29zaXVtXCIsXG4gIGRldGVjdDogZnVuY3Rpb24oaG9zdG5hbWUsIGRvYykge1xuICAgIGlmIChob3N0bmFtZS5pbmRleE9mKFwiY29zaXVtXCIpICE9PSAtMSB8fCBob3N0bmFtZS5pbmRleE9mKFwiY29zaXVtc2hvcFwiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcImFwcC1yb290W25nLXZlcnNpb25dLCBjb3NpdW0tYXBwLCBbY2xhc3MqPWNvc2l1bV0sIFtpZCo9Y29zaXVtXVwiKSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGRvYy5xdWVyeVNlbGVjdG9yKFwiaW1nW3NyYyo9Y29zaXVtXSwgbGlua1tocmVmKj1jb3NpdW1dXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGZyYW1ld29yazogXCJhbmd1bGFyXCIsXG4gIGFsaWFzZXM6IHtcbiAgICBub206IFtcInBhdGllbnRfbm9tXCIsIFwiY2xpZW50X25vbVwiLCBcIm5vbUJlbmVmaWNpYWlyZVwiXSxcbiAgICBwcmVub206IFtcInBhdGllbnRfcHJlbm9tXCIsIFwiY2xpZW50X3ByZW5vbVwiLCBcInByZW5vbUJlbmVmaWNpYWlyZVwiXSxcbiAgICBudW1lcm9TZWN1cml0ZVNvY2lhbGU6IFtcIm5pckFzc3VyZVwiLCBcIm5pckJlbmVmaWNpYWlyZVwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge30sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiW2NsYXNzKj1wYXRpZW50LWRldGFpbF1cIiwgXCJbY2xhc3MqPXBhdGllbnQtZmljaGVdXCIsXG4gICAgXCJbY2xhc3MqPWNsaWVudC1mb3JtXVwiLCBcIltjbGFzcyo9ZG9zc2llci1wYXRpZW50XVwiLFxuICAgIFwiW2RhdGEtdmlldyo9cGF0aWVudF1cIixcbiAgXSxcbiAgbWluRmllbGRzRm9yUGF0aWVudFBhZ2U6IDMsXG4gIHNjcmFwZURlbGF5OiAyNTAwLFxuICBvYnNlcnZlckRlYm91bmNlOiAxNTAwLFxuICBzZWFyY2hJZnJhbWVzOiB0cnVlLFxuICBzZWFyY2hTaGFkb3dET006IHRydWUsXG4gIGlucHV0U2VsZWN0b3I6IG51bGwsXG4gIHJlYWRPbmx5U2VsZWN0b3JzOiBudWxsLFxuICBiZWZvcmVTY3JhcGU6IG51bGwsXG4gIGFmdGVyU2NyYXBlOiBudWxsLFxuICB0cmFuc2Zvcm1WYWx1ZTogbnVsbCxcbn0pO1xuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICAyLiBJLU9QVElDUyAoQ2VnaWQgLyBDcmlzdGFsbGluKVxuICogIFBpbGllciBkdSBtYXJjaGUuIFRyZXMgcm9idXN0ZS4gRXF1aXBlIGluZGVwZW5kYW50cyBldCBmcmFuY2hpc2VzLlxuICogIFN0YWNrIDogQVNQLk5FVCAvIEJsYXpvciBwb3VyIGxlcyB2ZXJzaW9ucyByZWNlbnRlcywgalF1ZXJ5IGxlZ2FjeS5cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwiaW9wdGljc1wiLFxuICBkaXNwbGF5TmFtZTogXCJJLU9wdGljcyAoQ2VnaWQpXCIsXG4gIGRldGVjdDogZnVuY3Rpb24oaG9zdG5hbWUsIGRvYykge1xuICAgIGlmIChob3N0bmFtZS5pbmRleE9mKFwiY2VnaWRcIikgIT09IC0xIHx8IGhvc3RuYW1lLmluZGV4T2YoXCJpLW9wdGljc1wiKSAhPT0gLTEgfHwgaG9zdG5hbWUuaW5kZXhPZihcImlvcHRpY3NcIikgIT09IC0xIHx8IGhvc3RuYW1lLmluZGV4T2YoXCJjcmlzdGFsbGluXCIpICE9PSAtMSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGRvYy5xdWVyeVNlbGVjdG9yKFwiW2NsYXNzKj1jZWdpZF0sIFtjbGFzcyo9Y3Jpc3RhbGxpbl0sIGltZ1tzcmMqPWNlZ2lkXSwgaW1nW3NyYyo9Y3Jpc3RhbGxpbl1cIikpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIiNfX1ZJRVdTVEFURVwiKSAmJiBkb2MucXVlcnlTZWxlY3RvcihcIltpZCo9UGF0aWVudF0sIFtpZCo9Q2xpZW50XSwgW2lkKj1Qb3J0ZXVyXVwiKSkgcmV0dXJuIHRydWU7XG4gICAgdmFyIHBhZ2VUZXh0ID0gKGRvYy50aXRsZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChwYWdlVGV4dC5pbmRleE9mKFwiY3Jpc3RhbGxpblwiKSAhPT0gLTEgfHwgcGFnZVRleHQuaW5kZXhPZihcImktb3B0aWNzXCIpICE9PSAtMSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBmcmFtZXdvcms6IFwiYXV0b1wiLFxuICBhbGlhc2VzOiB7XG4gICAgbm9tOiBbXCJ0eHROb21cIiwgXCJ0eHROb21QYXRpZW50XCIsIFwiY3RsX25vbVwiLCBcImN0bDAwX25vbVwiLCBcInRiTm9tXCJdLFxuICAgIHByZW5vbTogW1widHh0UHJlbm9tXCIsIFwidHh0UHJlbm9tUGF0aWVudFwiLCBcImN0bF9wcmVub21cIiwgXCJjdGwwMF9wcmVub21cIiwgXCJ0YlByZW5vbVwiXSxcbiAgICBudW1lcm9TZWN1cml0ZVNvY2lhbGU6IFtcInR4dE5TU1wiLCBcInR4dE51bVNTXCIsIFwiY3RsX25zc1wiLCBcInR4dEltbWF0XCIsIFwidGJOU1NcIl0sXG4gICAgZGF0ZU5haXNzYW5jZTogW1widHh0RGF0ZU5haXNzYW5jZVwiLCBcImN0bF9kYXRlTmFpc3NcIiwgXCJ0eHRERE5cIiwgXCJ0YkRhdGVOYWlzc1wiXSxcbiAgICB0ZWxlcGhvbmU6IFtcInR4dFRlbFwiLCBcInR4dFRlbGVwaG9uZVwiLCBcImN0bF90ZWxcIiwgXCJ0YlRlbE1vYmlsZVwiXSxcbiAgICBlbWFpbDogW1widHh0RW1haWxcIiwgXCJ0eHRNYWlsXCIsIFwiY3RsX2VtYWlsXCIsIFwidGJFbWFpbFwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge1xuICAgIG51bWVyb0FjY29yZDogW1widHh0TnVtQWNjb3JkXCIsIFwidGJBY2NvcmRcIl0sXG4gICAgbW9udGFudFBFQzogW1widHh0TW9udGFudFBFQ1wiLCBcInRiTW9udGFudFwiXSxcbiAgfSxcbiAgcGF0aWVudFBhZ2VJbmRpY2F0b3JzOiBbXG4gICAgXCIjcG5sUGF0aWVudFwiLCBcIiNkaXZGaWNoZUNsaWVudFwiLCBcIltpZCo9UGF0aWVudERldGFpbF1cIixcbiAgICBcIiNDb250ZW50UGxhY2VIb2xkZXJcIiwgXCJbY2xhc3MqPXBvcnRldXJdXCIsIFwiW2lkKj1GaWNoZVBvcnRldXJdXCIsXG4gIF0sXG4gIG1pbkZpZWxkc0ZvclBhdGllbnRQYWdlOiAzLFxuICBzY3JhcGVEZWxheTogMjAwMCxcbiAgb2JzZXJ2ZXJEZWJvdW5jZTogMTUwMCxcbiAgc2VhcmNoSWZyYW1lczogdHJ1ZSxcbiAgc2VhcmNoU2hhZG93RE9NOiBmYWxzZSxcbiAgaW5wdXRTZWxlY3RvcjogbnVsbCxcbiAgcmVhZE9ubHlTZWxlY3RvcnM6IFwic3Bhbi5hc3BOZXREaXNhYmxlZCwgc3Bhbi5maWVsZC1kaXNwbGF5LCB0ZC5kYXRhLWNlbGwsIC5yZWFkb25seS1maWVsZFwiLFxuICBiZWZvcmVTY3JhcGU6IG51bGwsXG4gIGFmdGVyU2NyYXBlOiBudWxsLFxuICB0cmFuc2Zvcm1WYWx1ZTogbnVsbCxcbn0pO1xuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICAzLiBQVk8gKFBvaW50cyBkZSBWZW50ZSBPcHRpcXVlIFx1MjAxNCBHaW5rb2lhIC8gREwgU29mdHdhcmUpXG4gKiAgUmVmZXJlbmNlIHBvdXIgcGlsb3RhZ2UgZGUgcmVzZWF1eC4gQWNoYXRzIGdyb3VwZXMsIHN0YXRzIG11bHRpLXNpdGVzLlxuICogIFN0YWNrIDogSmF2YS9KRUUgcHJvYmFibGUsIGludGVyZmFjZSB3ZWIgalF1ZXJ5L0Jvb3RzdHJhcC5cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwicHZvXCIsXG4gIGRpc3BsYXlOYW1lOiBcIlBWTyAoR2lua29pYSlcIixcbiAgZGV0ZWN0OiBmdW5jdGlvbihob3N0bmFtZSwgZG9jKSB7XG4gICAgaWYgKGhvc3RuYW1lLmluZGV4T2YoXCJnaW5rb2lhXCIpICE9PSAtMSB8fCBob3N0bmFtZS5pbmRleE9mKFwicHZvXCIpICE9PSAtMSB8fCBob3N0bmFtZS5pbmRleE9mKFwiZGxzb2Z0d2FyZVwiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIltjbGFzcyo9Z2lua29pYV0sIFtjbGFzcyo9cHZvLV0sIGltZ1tzcmMqPWdpbmtvaWFdLCBpbWdbc3JjKj1wdm9dXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZG9jLnF1ZXJ5U2VsZWN0b3IoXCJtZXRhW2NvbnRlbnQqPWdpbmtvaWFdLCBtZXRhW2NvbnRlbnQqPVBWT11cIikpIHJldHVybiB0cnVlO1xuICAgIHZhciB0aXRsZSA9IChkb2MudGl0bGUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodGl0bGUuaW5kZXhPZihcInB2b1wiKSAhPT0gLTEgfHwgdGl0bGUuaW5kZXhPZihcImdpbmtvaWFcIikgIT09IC0xIHx8IHRpdGxlLmluZGV4T2YoXCJwb2ludHMgZGUgdmVudGVcIikgIT09IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGZyYW1ld29yazogXCJqcXVlcnlcIixcbiAgYWxpYXNlczoge1xuICAgIG5vbTogW1wiZmxkX25vbV9wb3J0ZXVyXCIsIFwicG9ydGV1cl9ub21cIiwgXCJub21Qb3J0ZXVyXCIsIFwiaW5wdXRfbm9tX3BvcnRldXJcIl0sXG4gICAgcHJlbm9tOiBbXCJmbGRfcHJlbm9tX3BvcnRldXJcIiwgXCJwb3J0ZXVyX3ByZW5vbVwiLCBcInByZW5vbVBvcnRldXJcIl0sXG4gICAgbnVtZXJvU2VjdXJpdGVTb2NpYWxlOiBbXCJmbGRfbnNzXCIsIFwicG9ydGV1cl9uc3NcIiwgXCJuc3NQb3J0ZXVyXCIsIFwibnVtX2ltbWF0XCJdLFxuICAgIGRhdGVOYWlzc2FuY2U6IFtcImZsZF9kYXRlX25haXNzXCIsIFwicG9ydGV1cl9kZG5cIiwgXCJkYXRlTmFpc3NQb3J0ZXVyXCJdLFxuICAgIG9yZ2FuaXNtZTogW1wiZmxkX211dHVlbGxlXCIsIFwicG9ydGV1cl9tdXR1ZWxsZVwiLCBcIm11dHVlbGxlTmFtZVwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge30sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiW2NsYXNzKj1maWNoZS1wb3J0ZXVyXVwiLCBcIltjbGFzcyo9cG9ydGV1ci1kZXRhaWxdXCIsXG4gICAgXCIjZmljaGVQb3J0ZXVyXCIsIFwiI3BvcnRldXJGb3JtXCIsIFwiW2NsYXNzKj1jbGllbnQtZGV0YWlsXVwiLFxuICBdLFxuICBtaW5GaWVsZHNGb3JQYXRpZW50UGFnZTogMyxcbiAgc2NyYXBlRGVsYXk6IDIwMDAsXG4gIG9ic2VydmVyRGVib3VuY2U6IDE1MDAsXG4gIHNlYXJjaElmcmFtZXM6IHRydWUsXG4gIHNlYXJjaFNoYWRvd0RPTTogZmFsc2UsXG4gIGlucHV0U2VsZWN0b3I6IG51bGwsXG4gIHJlYWRPbmx5U2VsZWN0b3JzOiBcIi5wb3J0ZXVyLWluZm8gc3BhbiwgLmRhdGEtZGlzcGxheSwgdGQudmFsZXVyXCIsXG4gIGJlZm9yZVNjcmFwZTogbnVsbCxcbiAgYWZ0ZXJTY3JhcGU6IG51bGwsXG4gIHRyYW5zZm9ybVZhbHVlOiBudWxsLFxufSk7XG5cbi8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICogIDQuIElETSBPUFRJQyAoQXhlc3MgR3JvdXBlKVxuICogIEV4IEFjdHUtR2VzdGlvbi4gSW50ZXJmYWNlIGZsdWlkZSwgaGViZXJnZW1lbnQgSERTIEZyYW5jZS5cbiAqICBTdGFjayA6IFdlYiBtb2Rlcm5lLCBwcm9iYWJsZW1lbnQgVnVlLmpzIG91IFJlYWN0LCBBUEkgUkVTVC5cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwiaWRtb3B0aWNcIixcbiAgZGlzcGxheU5hbWU6IFwiSURNIE9wdGljXCIsXG4gIGRldGVjdDogZnVuY3Rpb24oaG9zdG5hbWUsIGRvYykge1xuICAgIGlmIChob3N0bmFtZS5pbmRleE9mKFwiaWRtXCIpICE9PSAtMSB8fCBob3N0bmFtZS5pbmRleE9mKFwiYXhlc3NcIikgIT09IC0xIHx8IGhvc3RuYW1lLmluZGV4T2YoXCJhY3R1LWdlc3Rpb25cIikgIT09IC0xIHx8IGhvc3RuYW1lLmluZGV4T2YoXCJhY3R1Z2VzdGlvblwiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIltjbGFzcyo9aWRtLV0sIFtjbGFzcyo9YXhlc3NdLCBpbWdbc3JjKj1pZG1dLCBpbWdbc3JjKj1heGVzc11cIikpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIm1ldGFbY29udGVudCo9SURNXSwgbWV0YVtjb250ZW50Kj1BeGVzc11cIikpIHJldHVybiB0cnVlO1xuICAgIHZhciB0aXRsZSA9IChkb2MudGl0bGUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodGl0bGUuaW5kZXhPZihcImlkbVwiKSAhPT0gLTEgfHwgdGl0bGUuaW5kZXhPZihcImF4ZXNzXCIpICE9PSAtMSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBmcmFtZXdvcms6IFwiYXV0b1wiLFxuICBhbGlhc2VzOiB7XG4gICAgbm9tOiBbXCJwYXRpZW50X2xhc3RuYW1lXCIsIFwiY2xpZW50X2xhc3RuYW1lXCIsIFwiYmVuZWZpY2lhaXJlX25vbVwiXSxcbiAgICBwcmVub206IFtcInBhdGllbnRfZmlyc3RuYW1lXCIsIFwiY2xpZW50X2ZpcnN0bmFtZVwiLCBcImJlbmVmaWNpYWlyZV9wcmVub21cIl0sXG4gICAgbnVtZXJvU2VjdXJpdGVTb2NpYWxlOiBbXCJwYXRpZW50X25pclwiLCBcImNsaWVudF9uaXJcIiwgXCJuaXJfcGF0aWVudFwiXSxcbiAgICBkYXRlTmFpc3NhbmNlOiBbXCJwYXRpZW50X2JpcnRoZGF0ZVwiLCBcImNsaWVudF9iaXJ0aGRhdGVcIiwgXCJkZG5fcGF0aWVudFwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge30sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiW2NsYXNzKj1wYXRpZW50LWNhcmRdXCIsIFwiW2NsYXNzKj1jbGllbnQtY2FyZF1cIixcbiAgICBcIltjbGFzcyo9ZmljaGUtcGF0aWVudF1cIiwgXCJbZGF0YS1wYWdlPXBhdGllbnRdXCIsXG4gIF0sXG4gIG1pbkZpZWxkc0ZvclBhdGllbnRQYWdlOiAzLFxuICBzY3JhcGVEZWxheTogMjAwMCxcbiAgb2JzZXJ2ZXJEZWJvdW5jZTogMTIwMCxcbiAgc2VhcmNoSWZyYW1lczogZmFsc2UsXG4gIHNlYXJjaFNoYWRvd0RPTTogZmFsc2UsXG4gIGlucHV0U2VsZWN0b3I6IG51bGwsXG4gIHJlYWRPbmx5U2VsZWN0b3JzOiBudWxsLFxuICBiZWZvcmVTY3JhcGU6IG51bGwsXG4gIGFmdGVyU2NyYXBlOiBudWxsLFxuICB0cmFuc2Zvcm1WYWx1ZTogbnVsbCxcbn0pO1xuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICA1LiBNWUVBU1lPUFRJQ1xuICogIENoYW1waW9uIGRlIGwnYWNjZXNzaWJpbGl0ZS4gV2ViIGFnaWxlLCBtb2Rlcm5lLCBpbmRlcGVuZGFudHMuXG4gKiAgU3RhY2sgOiBTYWFTIG1vZGVybmUsIHByb2JhYmxlbWVudCBSZWFjdCBvdSBWdWUuXG4gKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbkFEQVBURVJTLnB1c2goe1xuICBuYW1lOiBcIm15ZWFzeW9wdGljXCIsXG4gIGRpc3BsYXlOYW1lOiBcIk15RWFzeU9wdGljXCIsXG4gIGRldGVjdDogZnVuY3Rpb24oaG9zdG5hbWUsIGRvYykge1xuICAgIGlmIChob3N0bmFtZS5pbmRleE9mKFwibXllYXN5b3B0aWNcIikgIT09IC0xIHx8IGhvc3RuYW1lLmluZGV4T2YoXCJlYXN5b3B0aWNcIikgIT09IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZG9jLnF1ZXJ5U2VsZWN0b3IoXCJbY2xhc3MqPWVhc3lvcHRpY10sIFtjbGFzcyo9bXllYXN5XSwgaW1nW3NyYyo9ZWFzeW9wdGljXSwgaW1nW3NyYyo9bXllYXN5XVwiKSkgcmV0dXJuIHRydWU7XG4gICAgdmFyIHRpdGxlID0gKGRvYy50aXRsZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0aXRsZS5pbmRleE9mKFwiZWFzeW9wdGljXCIpICE9PSAtMSB8fCB0aXRsZS5pbmRleE9mKFwibXllYXN5XCIpICE9PSAtMSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBmcmFtZXdvcms6IFwicmVhY3RcIixcbiAgYWxpYXNlczoge1xuICAgIG5vbTogW1wicGF0aWVudF9uYW1lXCIsIFwiY2xpZW50TmFtZVwiLCBcImJlbmVmaWNpYXJ5X25hbWVcIl0sXG4gICAgcHJlbm9tOiBbXCJwYXRpZW50X2ZpcnN0bmFtZVwiLCBcImNsaWVudEZpcnN0bmFtZVwiLCBcImJlbmVmaWNpYXJ5X2ZpcnN0bmFtZVwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge30sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiW2NsYXNzKj1wYXRpZW50LXZpZXddXCIsIFwiW2NsYXNzKj1jbGllbnQtdmlld11cIixcbiAgICBcIltkYXRhLXJvdXRlKj1wYXRpZW50XVwiLCBcIltjbGFzcyo9ZmljaGVdXCIsXG4gIF0sXG4gIG1pbkZpZWxkc0ZvclBhdGllbnRQYWdlOiAzLFxuICBzY3JhcGVEZWxheTogMTgwMCxcbiAgb2JzZXJ2ZXJEZWJvdW5jZTogMTIwMCxcbiAgc2VhcmNoSWZyYW1lczogZmFsc2UsXG4gIHNlYXJjaFNoYWRvd0RPTTogZmFsc2UsXG4gIGlucHV0U2VsZWN0b3I6IG51bGwsXG4gIHJlYWRPbmx5U2VsZWN0b3JzOiBudWxsLFxuICBiZWZvcmVTY3JhcGU6IG51bGwsXG4gIGFmdGVyU2NyYXBlOiBudWxsLFxuICB0cmFuc2Zvcm1WYWx1ZTogbnVsbCxcbn0pO1xuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICA2LiBXSU5PUFRJQ1NcbiAqICBDaG9peCBoaXN0b3JpcXVlIGRlcyBpbmRlcGVuZGFudHMuIFJhcHBvcnQgcXVhbGl0ZS9wcml4LlxuICogIFN0YWNrIDogQXBwbGljYXRpb24gZGVza3RvcCBhdmVjIGNvbXBvc2FudGUgd2ViLCBwcm9iYWJsZW1lbnQgalF1ZXJ5LlxuICogIE5vdGUgOiBkb21haW5lIHdpbm9wdGljcy5mciBkZWphIGRhbnMgQUNUSVZFX0RPTUFJTlMuXG4gKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cbkFEQVBURVJTLnB1c2goe1xuICBuYW1lOiBcIndpbm9wdGljc1wiLFxuICBkaXNwbGF5TmFtZTogXCJXaW5PcHRpY3NcIixcbiAgZGV0ZWN0OiBmdW5jdGlvbihob3N0bmFtZSwgZG9jKSB7XG4gICAgaWYgKGhvc3RuYW1lLmluZGV4T2YoXCJ3aW5vcHRpY3NcIikgIT09IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZG9jLnF1ZXJ5U2VsZWN0b3IoXCJbY2xhc3MqPXdpbm9wdGljc10sIFtpZCo9d2lub3B0aWNzXSwgaW1nW3NyYyo9d2lub3B0aWNzXVwiKSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGRvYy5xdWVyeVNlbGVjdG9yKFwibWV0YVtjb250ZW50Kj1XaW5PcHRpY3NdXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICB2YXIgdGl0bGUgPSAoZG9jLnRpdGxlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKHRpdGxlLmluZGV4T2YoXCJ3aW5vcHRpY3NcIikgIT09IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGZyYW1ld29yazogXCJqcXVlcnlcIixcbiAgYWxpYXNlczoge1xuICAgIG5vbTogW1widHh0X25vbVwiLCBcIm5vbV9wb3J0ZXVyXCIsIFwid29fbm9tXCIsIFwiaW5wdXRfbm9tXCJdLFxuICAgIHByZW5vbTogW1widHh0X3ByZW5vbVwiLCBcInByZW5vbV9wb3J0ZXVyXCIsIFwid29fcHJlbm9tXCIsIFwiaW5wdXRfcHJlbm9tXCJdLFxuICAgIG51bWVyb1NlY3VyaXRlU29jaWFsZTogW1widHh0X25zc1wiLCBcIm5zc19wb3J0ZXVyXCIsIFwid29fbnNzXCJdLFxuICAgIGRhdGVOYWlzc2FuY2U6IFtcInR4dF9kZG5cIiwgXCJkZG5fcG9ydGV1clwiLCBcIndvX2RkblwiXSxcbiAgICB0ZWxlcGhvbmU6IFtcInR4dF90ZWxcIiwgXCJ0ZWxfcG9ydGV1clwiLCBcIndvX3RlbFwiXSxcbiAgICBvcmdhbmlzbWU6IFtcInR4dF9tdXR1ZWxsZVwiLCBcIm11dHVlbGxlX3BvcnRldXJcIiwgXCJ3b19tdXR1ZWxsZVwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge30sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiI2ZpY2hlQ2xpZW50XCIsIFwiI2Zvcm1Qb3J0ZXVyXCIsIFwiW2NsYXNzKj1wb3J0ZXVyXVwiLFxuICAgIFwiW2NsYXNzKj13by1wYXRpZW50XVwiLCBcIltpZCo9Y2xpZW50XVwiLFxuICBdLFxuICBtaW5GaWVsZHNGb3JQYXRpZW50UGFnZTogMyxcbiAgc2NyYXBlRGVsYXk6IDIwMDAsXG4gIG9ic2VydmVyRGVib3VuY2U6IDE1MDAsXG4gIHNlYXJjaElmcmFtZXM6IHRydWUsXG4gIHNlYXJjaFNoYWRvd0RPTTogZmFsc2UsXG4gIGlucHV0U2VsZWN0b3I6IG51bGwsXG4gIHJlYWRPbmx5U2VsZWN0b3JzOiBcIi53by1kaXNwbGF5LCAucmVhZG9ubHksIHNwYW4uZGF0YSwgdGQudmFsdWVcIixcbiAgYmVmb3JlU2NyYXBlOiBudWxsLFxuICBhZnRlclNjcmFwZTogbnVsbCxcbiAgdHJhbnNmb3JtVmFsdWU6IG51bGwsXG59KTtcblxuLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gKiAgNy4gT1BUSU1VTSAoQ0lUKVxuICogIE9yaWVudGUgRGlnaXRhbCBTdG9yZS4gRXhwZXJpZW5jZSBjbGllbnQgZW4gbWFnYXNpbi5cbiAqICBTdGFjayA6IFdlYiBtb2Rlcm5lLCBSZWFjdCBwcm9iYWJsZS4gbGl2ZWJ5b3B0aW11bS5jb20gZGVqYSBhY3RpZi5cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwib3B0aW11bVwiLFxuICBkaXNwbGF5TmFtZTogXCJPcHRpbXVtIChDSVQpXCIsXG4gIGRldGVjdDogZnVuY3Rpb24oaG9zdG5hbWUsIGRvYykge1xuICAgIGlmIChob3N0bmFtZS5pbmRleE9mKFwib3B0aW11bVwiKSAhPT0gLTEgfHwgaG9zdG5hbWUuaW5kZXhPZihcImxpdmVieW9wdGltdW1cIikgIT09IC0xIHx8IGhvc3RuYW1lLmluZGV4T2YoXCJjaXQtXCIpICE9PSAtMSkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGRvYy5xdWVyeVNlbGVjdG9yKFwiW2NsYXNzKj1vcHRpbXVtXSwgW2NsYXNzKj1jaXQtYXBwXSwgaW1nW3NyYyo9b3B0aW11bV0sIGltZ1tzcmMqPWNpdF1cIikpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIltkYXRhLWFwcD1vcHRpbXVtXSwgW2lkKj1vcHRpbXVtXVwiKSkgcmV0dXJuIHRydWU7XG4gICAgdmFyIHRpdGxlID0gKGRvYy50aXRsZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0aXRsZS5pbmRleE9mKFwib3B0aW11bVwiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgZnJhbWV3b3JrOiBcInJlYWN0XCIsXG4gIGFsaWFzZXM6IHtcbiAgICBub206IFtcImN1c3RvbWVyTGFzdE5hbWVcIiwgXCJjbGllbnRMYXN0TmFtZVwiLCBcImJlbmVmaWNpYXJ5TGFzdE5hbWVcIl0sXG4gICAgcHJlbm9tOiBbXCJjdXN0b21lckZpcnN0TmFtZVwiLCBcImNsaWVudEZpcnN0TmFtZVwiLCBcImJlbmVmaWNpYXJ5Rmlyc3ROYW1lXCJdLFxuICAgIG51bWVyb1NlY3VyaXRlU29jaWFsZTogW1wic29jaWFsU2VjdXJpdHlOdW1iZXJcIiwgXCJuaXJOdW1iZXJcIiwgXCJjdXN0b21lck5JUlwiXSxcbiAgICBkYXRlTmFpc3NhbmNlOiBbXCJjdXN0b21lckJpcnRoRGF0ZVwiLCBcImNsaWVudEJpcnRoRGF0ZVwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge30sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiW2NsYXNzKj1jdXN0b21lci1kZXRhaWxdXCIsIFwiW2NsYXNzKj1jbGllbnQtc2hlZXRdXCIsXG4gICAgXCJbZGF0YS1wYWdlPWN1c3RvbWVyXVwiLCBcIltjbGFzcyo9cGF0aWVudC1pbmZvXVwiLFxuICBdLFxuICBtaW5GaWVsZHNGb3JQYXRpZW50UGFnZTogMyxcbiAgc2NyYXBlRGVsYXk6IDIwMDAsXG4gIG9ic2VydmVyRGVib3VuY2U6IDEyMDAsXG4gIHNlYXJjaElmcmFtZXM6IGZhbHNlLFxuICBzZWFyY2hTaGFkb3dET006IGZhbHNlLFxuICBpbnB1dFNlbGVjdG9yOiBudWxsLFxuICByZWFkT25seVNlbGVjdG9yczogbnVsbCxcbiAgYmVmb3JlU2NyYXBlOiBudWxsLFxuICBhZnRlclNjcmFwZTogbnVsbCxcbiAgdHJhbnNmb3JtVmFsdWU6IG51bGwsXG59KTtcblxuLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gKiAgOC4gT1NNT1NFIChBbW9uaXMpXG4gKiAgTm91dmVsbGUgZ2VuZXJhdGlvbi4gRXJnb25vbWllIGludHVpdGl2ZS4gT3B0aXF1ZSArIEF1ZGlvIGZ1c2lvbm5lcy5cbiAqICBTdGFjayA6IFNhYVMgbW9kZXJuZSwgcHJvYmFibGVtZW50IFZ1ZS5qcyBvdSBSZWFjdC5cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwib3Ntb3NlXCIsXG4gIGRpc3BsYXlOYW1lOiBcIk9zbW9zZSAoQW1vbmlzKVwiLFxuICBkZXRlY3Q6IGZ1bmN0aW9uKGhvc3RuYW1lLCBkb2MpIHtcbiAgICBpZiAoaG9zdG5hbWUuaW5kZXhPZihcIm9zbW9zZVwiKSAhPT0gLTEgfHwgaG9zdG5hbWUuaW5kZXhPZihcImFtb25pc1wiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIltjbGFzcyo9b3Ntb3NlXSwgW2NsYXNzKj1hbW9uaXNdLCBpbWdbc3JjKj1vc21vc2VdLCBpbWdbc3JjKj1hbW9uaXNdXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZG9jLnF1ZXJ5U2VsZWN0b3IoXCJbZGF0YS1hcHA9b3Ntb3NlXVwiKSkgcmV0dXJuIHRydWU7XG4gICAgdmFyIHRpdGxlID0gKGRvYy50aXRsZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0aXRsZS5pbmRleE9mKFwib3Ntb3NlXCIpICE9PSAtMSB8fCB0aXRsZS5pbmRleE9mKFwiYW1vbmlzXCIpICE9PSAtMSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuICBmcmFtZXdvcms6IFwidnVlXCIsXG4gIGFsaWFzZXM6IHtcbiAgICBub206IFtcInBhdGllbnROb21cIiwgXCJjbGllbnROb21cIiwgXCJiZW5lZmljaWFpcmVOb21cIiwgXCJsYXN0X25hbWVcIl0sXG4gICAgcHJlbm9tOiBbXCJwYXRpZW50UHJlbm9tXCIsIFwiY2xpZW50UHJlbm9tXCIsIFwiYmVuZWZpY2lhaXJlUHJlbm9tXCIsIFwiZmlyc3RfbmFtZVwiXSxcbiAgICBudW1lcm9TZWN1cml0ZVNvY2lhbGU6IFtcInBhdGllbnROaXJcIiwgXCJuaXJBc3N1cmVcIiwgXCJuaXJCZW5lZmljaWFpcmVcIl0sXG4gICAgZGF0ZU5haXNzYW5jZTogW1wicGF0aWVudERhdGVOYWlzc2FuY2VcIiwgXCJkYXRlTmFpc3NhbmNlUGF0aWVudFwiXSxcbiAgfSxcbiAgcGVjQWxpYXNlczoge30sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiW2NsYXNzKj1wYXRpZW50LWZpY2hlXVwiLCBcIltjbGFzcyo9ZG9zc2llci1jbGllbnRdXCIsXG4gICAgXCJbY2xhc3MqPWZpY2hlLWJlbmVmaWNpYWlyZV1cIiwgXCJbZGF0YS12aWV3PXBhdGllbnRdXCIsXG4gIF0sXG4gIG1pbkZpZWxkc0ZvclBhdGllbnRQYWdlOiAzLFxuICBzY3JhcGVEZWxheTogMjAwMCxcbiAgb2JzZXJ2ZXJEZWJvdW5jZTogMTIwMCxcbiAgc2VhcmNoSWZyYW1lczogZmFsc2UsXG4gIHNlYXJjaFNoYWRvd0RPTTogZmFsc2UsXG4gIGlucHV0U2VsZWN0b3I6IG51bGwsXG4gIHJlYWRPbmx5U2VsZWN0b3JzOiBudWxsLFxuICBiZWZvcmVTY3JhcGU6IG51bGwsXG4gIGFmdGVyU2NyYXBlOiBudWxsLFxuICB0cmFuc2Zvcm1WYWx1ZTogbnVsbCxcbn0pO1xuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICA5LiBBQ1VJVEFTIDMgKE9jdWNvKVxuICogIEludGVybmF0aW9uYWwsIHBvaWRzIGxvdXJkLiBPcHRvbWV0cmllIHBvdXNzZWUuIEZsdXggbWVkaWNhdXggY29tcGxleGVzLlxuICogIFN0YWNrIDogLk5FVCAvIEJsYXpvciBwcm9iYWJsZSwgQW5ndWxhciBwb3NzaWJsZS5cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwiYWN1aXRhc1wiLFxuICBkaXNwbGF5TmFtZTogXCJBY3VpdGFzIDMgKE9jdWNvKVwiLFxuICBkZXRlY3Q6IGZ1bmN0aW9uKGhvc3RuYW1lLCBkb2MpIHtcbiAgICBpZiAoaG9zdG5hbWUuaW5kZXhPZihcIm9jdWNvXCIpICE9PSAtMSB8fCBob3N0bmFtZS5pbmRleE9mKFwiYWN1aXRhc1wiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIltjbGFzcyo9b2N1Y29dLCBbY2xhc3MqPWFjdWl0YXNdLCBpbWdbc3JjKj1vY3Vjb10sIGltZ1tzcmMqPWFjdWl0YXNdXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZG9jLnF1ZXJ5U2VsZWN0b3IoXCJtZXRhW2NvbnRlbnQqPU9jdWNvXSwgbWV0YVtjb250ZW50Kj1BY3VpdGFzXVwiKSkgcmV0dXJuIHRydWU7XG4gICAgLyogQmxhem9yLy5ORVQgbWFya2VycyAqL1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcInNjcmlwdFtzcmMqPWJsYXpvcl0sICNibGF6b3ItZXJyb3ItdWlcIikgJiYgZG9jLnF1ZXJ5U2VsZWN0b3IoXCJbY2xhc3MqPXBhdGllbnRdLCBbY2xhc3MqPWNsaWVudF1cIikpIHJldHVybiB0cnVlO1xuICAgIHZhciB0aXRsZSA9IChkb2MudGl0bGUgfHwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAodGl0bGUuaW5kZXhPZihcImFjdWl0YXNcIikgIT09IC0xIHx8IHRpdGxlLmluZGV4T2YoXCJvY3Vjb1wiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcbiAgZnJhbWV3b3JrOiBcImF1dG9cIixcbiAgYWxpYXNlczoge1xuICAgIG5vbTogW1wiUGF0aWVudFN1cm5hbWVcIiwgXCJwYXRpZW50X3N1cm5hbWVcIiwgXCJTdXJuYW1lXCIsIFwiTGFzdE5hbWVcIiwgXCJGYW1pbHlOYW1lXCJdLFxuICAgIHByZW5vbTogW1wiUGF0aWVudEZvcmVuYW1lXCIsIFwicGF0aWVudF9mb3JlbmFtZVwiLCBcIkZvcmVuYW1lXCIsIFwiRmlyc3ROYW1lXCIsIFwiR2l2ZW5OYW1lXCJdLFxuICAgIG51bWVyb1NlY3VyaXRlU29jaWFsZTogW1wiUGF0aWVudE5JUlwiLCBcIk5JUlwiLCBcIlNvY2lhbFNlY3VyaXR5Tm9cIiwgXCJTU05cIiwgXCJJbnN1cmFuY2VOb1wiXSxcbiAgICBkYXRlTmFpc3NhbmNlOiBbXCJQYXRpZW50RE9CXCIsIFwiRE9CXCIsIFwiRGF0ZU9mQmlydGhcIiwgXCJCaXJ0aERhdGVcIl0sXG4gICAgdGVsZXBob25lOiBbXCJQYXRpZW50UGhvbmVcIiwgXCJNb2JpbGVQaG9uZVwiLCBcIkhvbWVQaG9uZVwiLCBcIlBob25lTm9cIl0sXG4gICAgZW1haWw6IFtcIlBhdGllbnRFbWFpbFwiLCBcIkVtYWlsQWRkcmVzc1wiLCBcIkVtYWlsXCJdLFxuICAgIC8qIE9yZG9ubmFuY2UgXHUyMDE0IEFjdWl0YXMgZXN0IGZvcnQgc3VyIGwnb3B0b21ldHJpZSAqL1xuICAgIHJwcHM6IFtcIlByZXNjcmliZXJJZFwiLCBcIlByZXNjcmliZXJOb1wiLCBcIlJQUFNOb1wiLCBcIlByYWN0aXRpb25lcklkXCJdLFxuICAgIG5vbU9waHRhbG1vbG9ndWU6IFtcIlByZXNjcmliZXJOYW1lXCIsIFwiUHJhY3RpdGlvbmVyTmFtZVwiLCBcIlJlZmVycmVkQnlcIl0sXG4gIH0sXG4gIHBlY0FsaWFzZXM6IHtcbiAgICBudW1lcm9BY2NvcmQ6IFtcIkF1dGhvcmlzYXRpb25Ob1wiLCBcIkFwcHJvdmFsTm9cIiwgXCJQcmlvckFwcHJvdmFsXCJdLFxuICAgIG1vbnRhbnRQRUM6IFtcIkF1dGhvcmlzZWRBbW91bnRcIiwgXCJBcHByb3ZlZEFtb3VudFwiLCBcIkluc3VyYW5jZUFtb3VudFwiXSxcbiAgfSxcbiAgcGF0aWVudFBhZ2VJbmRpY2F0b3JzOiBbXG4gICAgXCJbY2xhc3MqPXBhdGllbnQtcmVjb3JkXVwiLCBcIltjbGFzcyo9cGF0aWVudC1zdW1tYXJ5XVwiLFxuICAgIFwiW2lkKj1QYXRpZW50RGV0YWlsXVwiLCBcIltjbGFzcyo9Y2xpbmljYWwtcmVjb3JkXVwiLFxuICBdLFxuICBtaW5GaWVsZHNGb3JQYXRpZW50UGFnZTogMyxcbiAgc2NyYXBlRGVsYXk6IDI1MDAsXG4gIG9ic2VydmVyRGVib3VuY2U6IDE1MDAsXG4gIHNlYXJjaElmcmFtZXM6IHRydWUsXG4gIHNlYXJjaFNoYWRvd0RPTTogdHJ1ZSxcbiAgaW5wdXRTZWxlY3RvcjogbnVsbCxcbiAgcmVhZE9ubHlTZWxlY3RvcnM6IFwiLmRpc3BsYXktZmllbGQsIC5yZWFkLW9ubHksIHNwYW4ucGF0aWVudC1kYXRhLCB0ZC5kYXRhLXZhbHVlXCIsXG4gIGJlZm9yZVNjcmFwZTogbnVsbCxcbiAgYWZ0ZXJTY3JhcGU6IG51bGwsXG4gIHRyYW5zZm9ybVZhbHVlOiBudWxsLFxufSk7XG5cbi8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICogIDEwLiBBUkNISU1FRFxuICogIEFjdGV1ciBzb2xpZGUuIFF1YWxpdGUgZHUgc3VwcG9ydC4gRm9ydCBzdXIgdGllcnMtcGF5YW50IC8gcmVqZXRzLlxuICogIFN0YWNrIDogQXBwbGljYXRpb24gd2ViIGNsYXNzaXF1ZSwgcHJvYmFibGVtZW50IEphdmEvSlNQIG91IFBIUC5cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwiYXJjaGltZWRcIixcbiAgZGlzcGxheU5hbWU6IFwiQXJjaGltZWRcIixcbiAgZGV0ZWN0OiBmdW5jdGlvbihob3N0bmFtZSwgZG9jKSB7XG4gICAgaWYgKGhvc3RuYW1lLmluZGV4T2YoXCJhcmNoaW1lZFwiKSAhPT0gLTEpIHJldHVybiB0cnVlO1xuICAgIGlmIChkb2MucXVlcnlTZWxlY3RvcihcIltjbGFzcyo9YXJjaGltZWRdLCBbaWQqPWFyY2hpbWVkXSwgaW1nW3NyYyo9YXJjaGltZWRdXCIpKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoZG9jLnF1ZXJ5U2VsZWN0b3IoXCJtZXRhW2NvbnRlbnQqPUFyY2hpbWVkXVwiKSkgcmV0dXJuIHRydWU7XG4gICAgdmFyIHRpdGxlID0gKGRvYy50aXRsZSB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmICh0aXRsZS5pbmRleE9mKFwiYXJjaGltZWRcIikgIT09IC0xKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG4gIGZyYW1ld29yazogXCJqcXVlcnlcIixcbiAgYWxpYXNlczoge1xuICAgIG5vbTogW1wiZmljaGVfbm9tXCIsIFwicG9ydGV1cl9ub21cIiwgXCJhcmNoX25vbVwiLCBcIm5vbV9maWNoZVwiXSxcbiAgICBwcmVub206IFtcImZpY2hlX3ByZW5vbVwiLCBcInBvcnRldXJfcHJlbm9tXCIsIFwiYXJjaF9wcmVub21cIl0sXG4gICAgbnVtZXJvU2VjdXJpdGVTb2NpYWxlOiBbXCJmaWNoZV9uc3NcIiwgXCJwb3J0ZXVyX25zc1wiLCBcImFyY2hfbnNzXCIsIFwibnVtX3NlY3VfcG9ydGV1clwiXSxcbiAgICBkYXRlTmFpc3NhbmNlOiBbXCJmaWNoZV9kZG5cIiwgXCJwb3J0ZXVyX2RkblwiLCBcImFyY2hfZGRuXCJdLFxuICAgIG9yZ2FuaXNtZTogW1wiZmljaGVfbXV0dWVsbGVcIiwgXCJwb3J0ZXVyX211dHVlbGxlXCIsIFwiYXJjaF9tdXR1ZWxsZVwiLCBcIm9yZ2FuaXNtZV90cFwiXSxcbiAgICBudW1lcm9BZGhlcmVudDogW1wiZmljaGVfYWRoZXJlbnRcIiwgXCJwb3J0ZXVyX2FkaGVyZW50XCIsIFwibnVtX2FkaGVyZW50X3RwXCJdLFxuICB9LFxuICBwZWNBbGlhc2VzOiB7XG4gICAgbnVtZXJvQWNjb3JkOiBbXCJhcmNoX2FjY29yZFwiLCBcImFjY29yZF90cFwiLCBcIm51bV9hY2NvcmRfdHBcIl0sXG4gICAgbW9udGFudFBFQzogW1wiYXJjaF9tb250YW50XCIsIFwibW9udGFudF90cFwiLCBcInBhcnRfbXV0dWVsbGVcIl0sXG4gIH0sXG4gIHBhdGllbnRQYWdlSW5kaWNhdG9yczogW1xuICAgIFwiI2ZpY2hlUG9ydGV1clwiLCBcIiNmb3JtUGF0aWVudFwiLCBcIltjbGFzcyo9YXJjaC1maWNoZV1cIixcbiAgICBcIltjbGFzcyo9ZmljaGUtcG9ydGV1cl1cIiwgXCJbaWQqPXBvcnRldXJdXCIsXG4gIF0sXG4gIG1pbkZpZWxkc0ZvclBhdGllbnRQYWdlOiAzLFxuICBzY3JhcGVEZWxheTogMjAwMCxcbiAgb2JzZXJ2ZXJEZWJvdW5jZTogMTUwMCxcbiAgc2VhcmNoSWZyYW1lczogdHJ1ZSxcbiAgc2VhcmNoU2hhZG93RE9NOiBmYWxzZSxcbiAgaW5wdXRTZWxlY3RvcjogbnVsbCxcbiAgcmVhZE9ubHlTZWxlY3RvcnM6IFwiLmFyY2gtZGlzcGxheSwgLmZpY2hlLXZhbHVlLCB0ZC52YWxldXIsIHNwYW4uZGF0YS1wb3J0ZXVyXCIsXG4gIGJlZm9yZVNjcmFwZTogbnVsbCxcbiAgYWZ0ZXJTY3JhcGU6IG51bGwsXG4gIHRyYW5zZm9ybVZhbHVlOiBudWxsLFxufSk7XG5cbi8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICogIEZBTExCQUNLIFx1MjAxNCBBZGFwdGF0ZXVyIGdlbmVyaXF1ZSBwb3VyIEVSUCBub24gcmVjb25udXNcbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuQURBUFRFUlMucHVzaCh7XG4gIG5hbWU6IFwiZ2VuZXJpY1wiLFxuICBkaXNwbGF5TmFtZTogXCJFUlBcIixcbiAgZGV0ZWN0OiBmdW5jdGlvbigpIHsgcmV0dXJuIHRydWU7IH0sXG4gIGZyYW1ld29yazogXCJhdXRvXCIsXG4gIGFsaWFzZXM6IHt9LFxuICBwZWNBbGlhc2VzOiB7fSxcbiAgcGF0aWVudFBhZ2VJbmRpY2F0b3JzOiBbXSxcbiAgbWluRmllbGRzRm9yUGF0aWVudFBhZ2U6IDMsXG4gIHNjcmFwZURlbGF5OiAyMDAwLFxuICBvYnNlcnZlckRlYm91bmNlOiAxNTAwLFxuICBzZWFyY2hJZnJhbWVzOiB0cnVlLFxuICBzZWFyY2hTaGFkb3dET006IHRydWUsXG4gIGlucHV0U2VsZWN0b3I6IG51bGwsXG4gIHJlYWRPbmx5U2VsZWN0b3JzOiBudWxsLFxuICBiZWZvcmVTY3JhcGU6IG51bGwsXG4gIGFmdGVyU2NyYXBlOiBudWxsLFxuICB0cmFuc2Zvcm1WYWx1ZTogbnVsbCxcbn0pO1xuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICBBVVRPLURFVEVDVElPTlxuICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZWN0QWRhcHRlcihob3N0bmFtZSwgZG9jKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgQURBUFRFUlMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoQURBUFRFUlNbaV0ubmFtZSAhPT0gXCJnZW5lcmljXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChBREFQVEVSU1tpXS5kZXRlY3QoaG9zdG5hbWUsIGRvYykpIHJldHVybiBBREFQVEVSU1tpXTtcbiAgICAgIH0gY2F0Y2goZSkgeyAvKiBkZXRlY3Rpb24gZXJyb3IsIHNraXAgKi8gfVxuICAgIH1cbiAgfVxuICByZXR1cm4gQURBUFRFUlNbQURBUFRFUlMubGVuZ3RoIC0gMV07XG59XG5cbmV4cG9ydCB7IEFEQVBURVJTIH07XG4iLCAiLyogXHUyNTAwXHUyNTAwIE9wdGlCb3QgXHUyMDE0IERpY3Rpb25uYWlyZXMgZCdhbGlhc2VzIHBvdXIgRVJQIG9wdGlxdWUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4vKiBDaGFxdWUgY2xlIGVzdCBsZSBub20gY2Fub25pcXVlIGR1IGNoYW1wIE9wdGlCb3QuICAgICAgICAgICAgICAgICAgICAgICovXG4vKiBMZXMgdmFsZXVycyBzb250IGxlcyB2YXJpYXRpb25zIGNvbm51ZXMgZGFucyBsZXMgRVJQIGR1IG1hcmNoZS4gICAgICAgICAqL1xuLyogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qIEVSUCBjb3V2ZXJ0cyA6IENvc2l1bSwgT3B0aWZpZCwgT3B0aW11bSAoTEJPKSwgRWFzeVZpc3RhLCBXaW5PcHRpY3MsICAgKi9cbi8qICAgaU8tc29mdCwgT3B0eW1vLCBWaXNpb25peCwgQ3Jvc3NPcCwgT3B0aXF1ZSssIEFtYWRlbGlzLCBMR1BJLCBldGMuICAqL1xuLyogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qIENvbnZlbnRpb24gOiB0b3V0ZXMgbGVzIHZhbGV1cnMgc29udCBlbiBtaW51c2N1bGVzLCBzYW5zIGFjY2VudHMuICAgICAgICovXG4vKiBMYSBub3JtYWxpc2F0aW9uIChhY2NlbnRzLCBzZXBhcmF0ZXVycykgZXN0IGdlcmVlIHBhciBub3JtYWxpemVBbGlhcygpLiAqL1xuXG4vKiBcdTI1MDBcdTI1MDAgQ2hhbXBzIFBhdGllbnQgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgdmFyIFBBVElFTlRfQUxJQVNFUyA9IHtcbiAgbm9tOiBbXG4gICAgLyogZnJhbmNhaXMgc3RhbmRhcmQgKi9cbiAgICBcIm5vbVwiLCBcIm5vbV9wYXRpZW50XCIsIFwicGF0aWVudF9ub21cIiwgXCJub21fY2xpZW50XCIsIFwiY2xpZW50X25vbVwiLFxuICAgIFwibm9tX3BvcnRldXJcIiwgXCJub21fYmVuZWZpY2lhaXJlXCIsIFwibm9tX2Fzc3VyZVwiLCBcImFzc3VyZV9ub21cIixcbiAgICBcIm5vbSBkZSBmYW1pbGxlXCIsIFwibm9tIGFzc3VyZVwiLCBcIm5vbSBiZW5lZmljaWFpcmVcIixcbiAgICBcIm5vbV91c2FnZVwiLCBcIm5vbV9uYWlzc2FuY2VcIiwgXCJub21famV1bmVfZmlsbGVcIiwgXCJwYXRyb255bWVcIixcbiAgICBcImlkZW50aXRlX25vbVwiLCBcImJlbl9ub21cIiwgXCJub21fYmVuXCIsIFwibm9tX3BlcnNcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmb3JtQ29udHJvbE5hbWUgKi9cbiAgICBcIm5vbVBhdGllbnRcIiwgXCJub21DbGllbnRcIiwgXCJub21CZW5lZmljaWFpcmVcIiwgXCJub21Bc3N1cmVcIixcbiAgICBcIm5vbVBvcnRldXJcIiwgXCJub21Vc2FnZVwiLCBcIm5vbU5haXNzYW5jZVwiLCBcIm5vbUpldW5lRmlsbGVcIixcbiAgICBcImZhbWlseU5hbWVcIiwgXCJsYXN0TmFtZVwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImxhc3RuYW1lXCIsIFwibGFzdF9uYW1lXCIsIFwibmFtZVwiLCBcInN1cm5hbWVcIiwgXCJmYW1pbHlfbmFtZVwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcIm5vbS1wYXRpZW50XCIsIFwibm9tLWNsaWVudFwiLCBcIm5vbS1iZW5lZmljaWFpcmVcIiwgXCJub20tYXNzdXJlXCIsXG4gICAgXCJsYXN0LW5hbWVcIiwgXCJmYW1pbHktbmFtZVwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1ub21cIiwgXCJkYXRhLWxhc3RuYW1lXCIsIFwiZGF0YS1wYXRpZW50LW5vbVwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwibm9tYXNzdXJlZVwiLCBcIm5vbWFzc3VyXHUwMEU5XCIsIFwiaW5mb3NfY2xpZW50X25vbVwiLCBcImFkaGVyZW50X25vbVwiLFxuICAgIFwibm9tX3RpdHVsYWlyZVwiLCBcInRpdHVsYWlyZV9ub21cIiwgXCJub21fcGVyc29ubmVcIiwgXCJwZXJzb25uZV9ub21cIixcbiAgICBcIm5vbV90aWVyc1wiLCBcInRpZXJzX25vbVwiLCBcIm5vbV9hY2hldGV1clwiLCBcIm5vbV9kZXN0aW5hdGFpcmVcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcInZvdHJlIG5vbVwiLCBcInNhaXNpciBsZSBub21cIiwgXCJlbnRyZXogbGUgbm9tXCIsXG4gICAgXCJub20gZHUgcGF0aWVudFwiLCBcIm5vbSBkdSBiZW5lZmljaWFpcmVcIiwgXCJub20gZHUgY2xpZW50XCIsXG4gICAgLyogYWJicmV2aWF0aW9ucyAqL1xuICAgIFwibm1cIiwgXCJub21fcFwiLFxuICBdLFxuXG4gIHByZW5vbTogW1xuICAgIC8qIGZyYW5jYWlzIHN0YW5kYXJkICovXG4gICAgXCJwcmVub21cIiwgXCJwcmVub21fcGF0aWVudFwiLCBcInBhdGllbnRfcHJlbm9tXCIsIFwicHJlbm9tX2NsaWVudFwiLFxuICAgIFwiY2xpZW50X3ByZW5vbVwiLCBcInByZW5vbV9wb3J0ZXVyXCIsIFwicHJlbm9tX2JlbmVmaWNpYWlyZVwiLFxuICAgIFwicHJlbm9tX2Fzc3VyZVwiLCBcImFzc3VyZV9wcmVub21cIiwgXCJwcmVub20gYmVuZWZpY2lhaXJlXCIsXG4gICAgXCJwcmVub20gYXNzdXJlXCIsIFwiYmVuX3ByZW5vbVwiLCBcInByZW5vbV9iZW5cIiwgXCJwcmVub21fcGVyc1wiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwicHJlbm9tUGF0aWVudFwiLCBcInByZW5vbUNsaWVudFwiLCBcInByZW5vbUJlbmVmaWNpYWlyZVwiLFxuICAgIFwicHJlbm9tQXNzdXJlXCIsIFwiZ2l2ZW5OYW1lXCIsIFwiZmlyc3ROYW1lXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiZmlyc3RuYW1lXCIsIFwiZmlyc3RfbmFtZVwiLCBcImdpdmVuX25hbWVcIiwgXCJmb3JlbmFtZVwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcInByZW5vbS1wYXRpZW50XCIsIFwicHJlbm9tLWNsaWVudFwiLCBcInByZW5vbS1iZW5lZmljaWFpcmVcIixcbiAgICBcImZpcnN0LW5hbWVcIiwgXCJnaXZlbi1uYW1lXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLXByZW5vbVwiLCBcImRhdGEtZmlyc3RuYW1lXCIsIFwiZGF0YS1wYXRpZW50LXByZW5vbVwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwicHJlbm9tYXNzdXJlZVwiLCBcImluZm9zX2NsaWVudF9wcmVub21cIiwgXCJhZGhlcmVudF9wcmVub21cIixcbiAgICBcInByZW5vbV90aXR1bGFpcmVcIiwgXCJ0aXR1bGFpcmVfcHJlbm9tXCIsIFwicHJlbm9tX3BlcnNvbm5lXCIsXG4gICAgXCJwcmVub21fdGllcnNcIiwgXCJwcmVub21fYWNoZXRldXJcIiwgXCJwcmVub21fZGVzdGluYXRhaXJlXCIsXG4gICAgLyogcGxhY2Vob2xkZXJzICovXG4gICAgXCJ2b3RyZSBwcmVub21cIiwgXCJzYWlzaXIgbGUgcHJlbm9tXCIsIFwiZW50cmV6IGxlIHByZW5vbVwiLFxuICAgIFwicHJlbm9tIGR1IHBhdGllbnRcIiwgXCJwcmVub20gZHUgYmVuZWZpY2lhaXJlXCIsXG4gICAgLyogYWJicmV2aWF0aW9ucyAqL1xuICAgIFwicG5tXCIsIFwicHJuXCIsIFwicHJlbm9tX3BcIixcbiAgXSxcblxuICBudW1lcm9TZWN1cml0ZVNvY2lhbGU6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwibnNzXCIsIFwibnVtX3NzXCIsIFwibnVtc3NcIiwgXCJzZWN1cml0ZV9zb2NpYWxlXCIsIFwibnVtZXJvX3NlY3VcIixcbiAgICBcImltbWF0cmljdWxhdGlvblwiLCBcIm5pcnBwXCIsIFwic2VjdVwiLCBcIm1hdHJpY3VsZVwiLFxuICAgIFwibiBzZWN1cml0ZSBzb2NpYWxlXCIsIFwibnVtZXJvIHNlY3VyaXRlIHNvY2lhbGVcIiwgXCJub19zc1wiLFxuICAgIFwibnVtX2Fzc3VyZVwiLCBcIm51bWVyb19zc1wiLCBcIm5pclwiLCBcIm51bWVyb19uaXJcIiwgXCJuaXJfYXNzdXJlXCIsXG4gICAgXCJpbW1hdFwiLCBcIm51bV9pbW1hdFwiLCBcImNsZV9uc3NcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmb3JtQ29udHJvbE5hbWUgKi9cbiAgICBcIm51bWVyb1NlY3VyaXRlU29jaWFsZVwiLCBcIm51bVNTXCIsIFwibnVtU2VjdVwiLCBcIm51bUluc2VlXCIsXG4gICAgXCJzZWN1cml0ZVNvY2lhbGVcIiwgXCJuaXJBc3N1cmVcIiwgXCJudW1Bc3N1cmVcIiwgXCJudW1JbW1hdFwiLFxuICAgIFwibnVtQmVuZWZcIiwgXCJiZW5lZmljaWFpcmVObmlcIixcbiAgICAvKiBmb3JtZXMgbG9uZ3VlcyAqL1xuICAgIFwibnVtZXJvX3NlY3VyaXRlX3NvY2lhbGVcIiwgXCJudW1lcm8gZGUgc2VjdXJpdGUgc29jaWFsZVwiLFxuICAgIFwibm8gc2VjdXJpdGUgc29jaWFsZVwiLFxuICAgIFwibnVtZXJvX2ltbWF0cmljdWxhdGlvblwiLCBcImltbWF0cmljdWxhdGlvbl9hc3N1cmVcIixcbiAgICBcIm51bWVyb19tYXRyaWN1bGVcIiwgXCJtYXRyaWN1bGVfYXNzdXJlXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwic29jaWFsX3NlY3VyaXR5XCIsIFwic29jaWFsX3NlY3VyaXR5X251bWJlclwiLCBcInNzblwiLFxuICAgIFwibmF0aW9uYWxfaWRcIiwgXCJuYXRpb25hbF9pbnN1cmFuY2VcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJudW0tc3NcIiwgXCJzZWN1cml0ZS1zb2NpYWxlXCIsIFwibnVtZXJvLXNlY3VcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtbnNzXCIsIFwiZGF0YS1udW1zc1wiLCBcImRhdGEtc2VjdXJpdGUtc29jaWFsZVwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwibnVtX2luc2VlXCIsIFwibnVtaW5zZWVcIiwgXCJpbnNlZVwiLCBcIm5uaVwiLFxuICAgIFwiYmVuZWZpY2lhaXJlX25uaVwiLCBcIm51bV9iZW5lZlwiLCBcIm51bWJlbmVmXCIsXG4gICAgXCJuaXJfYmVuZWZpY2lhaXJlXCIsIFwibmlyX2JlblwiLCBcImltbWF0X2JlbmVmaWNpYWlyZVwiLFxuICAgIFwibnVtZXJvX2Fzc3VyZV9zb2NpYWxcIiwgXCJudW1fcmVnaW1lXCIsXG4gICAgXCJudW1zZWN1cml0ZXNvY2lhbGVcIiwgXCJudW1zZWN1cml0ZVwiLFxuICAgIC8qIGF2ZWMgYWNjZW50cyAobm9ybWFsaXNcdTAwRTlzKSAqL1xuICAgIFwiblx1MDBCMCBzZWN1cml0ZSBzb2NpYWxlXCIsXG4gICAgLyogcGxhY2Vob2xkZXJzICovXG4gICAgXCJ2b3RyZSBudW1lcm8gZGUgc2VjdXJpdGUgc29jaWFsZVwiLCBcIm51bWVybyBzZWN1XCIsXG4gICAgXCJzYWlzaXIgbGUgbnVtZXJvIHNzXCIsIFwibnVtZXJvIG5pclwiLFxuICAgIC8qIGFiYnJldmlhdGlvbnMgKi9cbiAgICBcInNzXCIsIFwibnNzX2NsZVwiLCBcIm5pcnBwX2NsZVwiLFxuICBdLFxuXG4gIGRhdGVOYWlzc2FuY2U6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwiZGF0ZW5haXNzYW5jZVwiLCBcImRhdGVfbmFpc3NhbmNlXCIsIFwibmFpc3NhbmNlXCIsIFwiZGRuXCIsXG4gICAgXCJkYXRlX2RlX25haXNzYW5jZVwiLCBcImRhdGVkZW5haXNzYW5jZVwiLCBcIm5lX2xlXCIsIFwibmVlX2xlXCIsXG4gICAgXCJkYXRlX25haXNcIiwgXCJkYXRlbmFpc1wiLCBcImRhdGUgZGUgbmFpc3NhbmNlXCIsXG4gICAgXCJuYWlzc2FuY2UgYmVuZWZpY2lhaXJlXCIsIFwiZGF0ZSBuYWlzc2FuY2UgYmVuZWZpY2lhaXJlXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJkYXRlTmFpc3NhbmNlXCIsIFwiZGF0ZURlTmFpc3NhbmNlXCIsIFwiZGF0ZU5haXNcIiwgXCJiaXJ0aERhdGVcIixcbiAgICBcImRhdGVPZkJpcnRoXCIsIFwibmFpc3NhbmNlQXNzdXJlXCIsIFwibmFpc3NhbmNlQmVuZWZpY2lhaXJlXCIsXG4gICAgXCJkYXRlTmFpc3NhbmNlQXNzdXJlXCIsIFwiZGF0ZU5haXNzYW5jZUJlbmVmaWNpYWlyZVwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImJpcnRoZGF0ZVwiLCBcImJpcnRoX2RhdGVcIiwgXCJkb2JcIiwgXCJkYXRlX29mX2JpcnRoXCIsXG4gICAgXCJkYXRlYmlydGhcIiwgXCJib3JuZGF0ZVwiLCBcImRhdGVvZmJpcnRoXCIsIFwiYm9ybl9vblwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcImRhdGUtbmFpc3NhbmNlXCIsIFwiZGF0ZS1kZS1uYWlzc2FuY2VcIiwgXCJiaXJ0aC1kYXRlXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLWRkblwiLCBcImRhdGEtbmFpc3NhbmNlXCIsIFwiZGF0YS1iaXJ0aGRhdGVcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcImRhdGVubmFpc3NhbmNlYXNzdXJlXCIsIFwiZGF0ZW5uYWlzc2FuY2Vhc3N1cmVlXCIsXG4gICAgXCJkYXRlbm5haXNzYW5jZWJlbmVmXCIsIFwiZGF0ZSBkZSBuYWlzc2FuY2UgYmVuZWZpY2lhaXJlXCIsXG4gICAgXCJuYWlzc2FuY2VfYXNzdXJlXCIsIFwibmFpc3NhbmNlX2JlbmVmaWNpYWlyZVwiLFxuICAgIFwiZGF0ZV9uYWlzc2FuY2VfcGF0aWVudFwiLCBcImRkbl9wYXRpZW50XCIsXG4gICAgXCJuZWxlXCIsIFwibmVlbGVcIiwgXCJuZShlKSBsZVwiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwidm90cmUgZGF0ZSBkZSBuYWlzc2FuY2VcIiwgXCJqai9tbS9hYWFhXCIsXG4gICAgXCJkYXRlIGRlIG5haXNzYW5jZSAoamovbW0vYWFhYSlcIixcbiAgICAvKiBhYmJyZXZpYXRpb25zICovXG4gICAgXCJkblwiLCBcImRfbmFpc1wiLCBcImRfbmFpc3NcIixcbiAgXSxcblxuICB0ZWxlcGhvbmU6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwidGVsZXBob25lXCIsIFwidGVsXCIsIFwicGhvbmVcIiwgXCJtb2JpbGVcIiwgXCJwb3J0YWJsZVwiLFxuICAgIFwibnVtX3RlbFwiLCBcIm51bWVyb190ZWxlcGhvbmVcIiwgXCJ0ZWxfcG9ydGFibGVcIiwgXCJ0ZWxfbW9iaWxlXCIsXG4gICAgXCJnc21cIiwgXCJ0ZWxfZml4ZVwiLCBcImZpeGVcIiwgXCJ0ZWxfZG9taWNpbGVcIixcbiAgICBcInRlbF9idXJlYXVcIiwgXCJ0ZWxfdHJhdmFpbFwiLCBcInRlbF9wcm9cIixcbiAgICAvKiBjYW1lbENhc2UgLyBmb3JtQ29udHJvbE5hbWUgKi9cbiAgICBcInRlbGVwaG9uZU1vYmlsZVwiLCBcInRlbGVwaG9uZUZpeGVcIixcbiAgICBcInRlbGVwaG9uZVBvcnRhYmxlXCIsIFwicGhvbmVOdW1iZXJcIiwgXCJtb2JpbGVQaG9uZVwiLFxuICAgIFwibnVtVGVsXCIsIFwibnVtVGVsZXBob25lXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiY2VsbHBob25lXCIsIFwiY2VsbF9waG9uZVwiLCBcImNlbGxcIiwgXCJwaG9uZV9udW1iZXJcIixcbiAgICBcInBob25lbnVtYmVyXCIsIFwibW9iaWxlX3Bob25lXCIsIFwiaG9tZV9waG9uZVwiLFxuICAgIFwid29ya19waG9uZVwiLCBcImxhbmRsaW5lXCIsXG4gICAgLyoga2ViYWItY2FzZSAqL1xuICAgIFwidGVsLXBvcnRhYmxlXCIsIFwidGVsLW1vYmlsZVwiLCBcInRlbC1maXhlXCIsIFwicGhvbmUtbnVtYmVyXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLXRlbFwiLCBcImRhdGEtcGhvbmVcIiwgXCJkYXRhLXRlbGVwaG9uZVwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiY29udGFjdF90ZWxcIiwgXCJpbmZvc19jbGllbnRfdGVsZXBob25lXCIsXG4gICAgXCJudW10ZWxwaG9uZVwiLCBcImNvb3Jkb25uZWVzX3RlbFwiLCBcInRlbF9jb250YWN0XCIsXG4gICAgXCJ0ZWxlcGhvbmUxXCIsIFwidGVsMVwiLCBcInBob25lMVwiLCBcInRlbDJcIiwgXCJ0ZWxlcGhvbmUyXCIsXG4gICAgXCJudW1fdGVsZXBob25lX21vYmlsZVwiLCBcIm51bV90ZWxlcGhvbmVfZml4ZVwiLFxuICAgIFwibW9iaWxlX3BhdGllbnRcIiwgXCJ0ZWxfcGF0aWVudFwiLCBcInBvcnRhYmxlX3BhdGllbnRcIixcbiAgICAvKiBhdmVjIGFjY2VudHMgKG5vcm1hbGlzXHUwMEU5cykgKi9cbiAgICBcIm51bWVybyBkZSB0ZWxlcGhvbmVcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcInZvdHJlIG51bWVybyBkZSB0ZWxlcGhvbmVcIiwgXCIwNnh4eHh4eHh4XCIsXG4gICAgXCJ0ZWxlcGhvbmUgbW9iaWxlXCIsXG4gICAgXCJ0ZWxlcGhvbmUgZml4ZVwiLCBcInRlbGVwaG9uZSBwb3J0YWJsZVwiLFxuICAgIC8qIGFiYnJldmlhdGlvbnMgKi9cbiAgICBcInRcIiwgXCJ0cGhcIiwgXCJ0ZWxwaFwiLFxuICBdLFxuXG4gIGVtYWlsOiBbXG4gICAgLyogc3RhbmRhcmQgKi9cbiAgICBcImVtYWlsXCIsIFwibWFpbFwiLCBcImNvdXJyaWVsXCIsIFwiYWRyZXNzZV9lbWFpbFwiLCBcImFkcmVzc2VfbWFpbFwiLFxuICAgIFwiZS1tYWlsXCIsIFwiY29udGFjdF9lbWFpbFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiZW1haWxBZGRyZXNzXCIsIFwiYWRyZXNzZU1haWxcIiwgXCJhZHJlc3NlRW1haWxcIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJlbWFpbGFkZHJlc3NcIiwgXCJlbWFpbF9hZGRyZXNzXCIsXG4gICAgLyoga2ViYWItY2FzZSAqL1xuICAgIFwiYWRyZXNzZS1lbWFpbFwiLCBcImFkcmVzc2UtbWFpbFwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1lbWFpbFwiLCBcImRhdGEtbWFpbFwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiYWRyZXNzZW1haWxcIiwgXCJhZHJlc3NlIGUtbWFpbFwiLCBcImFkcmVzc2Vjb3VycmllbFwiLFxuICAgIFwibWFpbF9wYXRpZW50XCIsIFwiZW1haWxfcGF0aWVudFwiLCBcIm1haWxfY29udGFjdFwiLFxuICAgIFwiZW1haWxfY29udGFjdFwiLCBcImNvdXJyaWVsX3BhdGllbnRcIiwgXCJlbWFpbF9jbGllbnRcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcInZvdHJlIGFkcmVzc2UgZW1haWxcIixcbiAgICBcImVtYWlsQGV4ZW1wbGUuZnJcIiwgXCJzYWlzaXIgbCdlbWFpbFwiLFxuICBdLFxuXG4gIGFkcmVzc2U6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwiYWRyZXNzZVwiLCBcImFkcmVzc2VfcG9zdGFsZVwiLCBcImFkcmVzc2UxXCIsIFwiYWRyZXNzZV9saWduZTFcIixcbiAgICBcImxpZ25lXzFcIiwgXCJydWVcIiwgXCJ2b2llXCIsIFwiYWRyZXNzZSBwb3N0YWxlXCIsXG4gICAgXCJhZHJlc3NlX3BhdGllbnRcIiwgXCJhZHJlc3NlX2NsaWVudFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiYWRyZXNzZVBvc3RhbGVcIiwgXCJhZHJlc3NlTGlnbmUxXCIsIFwic3RyZWV0QWRkcmVzc1wiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImFkZHJlc3NcIiwgXCJzdHJlZXRcIiwgXCJzdHJlZXRfYWRkcmVzc1wiLCBcInN0cmVldGFkZHJlc3NcIixcbiAgICBcImFkZHJlc3NfbGluZTFcIiwgXCJhZGRyZXNzX2xpbmVfMVwiLCBcImFkZHJlc3NsaW5lMVwiLFxuICAgIFwibGluZTFcIiwgXCJhZGRyZXNzMVwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcImFkcmVzc2UtcG9zdGFsZVwiLCBcImFkcmVzc2UtbGlnbmUxXCIsIFwic3RyZWV0LWFkZHJlc3NcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtYWRyZXNzZVwiLCBcImRhdGEtYWRkcmVzc1wiLCBcImRhdGEtc3RyZWV0XCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJhZHJlc3NlbGlnbmUxXCIsIFwibGlnbmUxXCIsIFwiYWRyZXNzZXBvc3RhbGVcIixcbiAgICBcInZvaWVfcGF0aWVudFwiLCBcInJ1ZV9wYXRpZW50XCIsIFwiYWRyZXNzZV9kb21pY2lsZVwiLFxuICAgIFwibnVtX3ZvaWVcIiwgXCJudW1lcm9fcnVlXCIsIFwiYWRyZXNzZV9jb21wbGV0ZVwiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwidm90cmUgYWRyZXNzZVwiLFxuICAgIFwibnVtZXJvIGV0IG5vbSBkZSBydWVcIiwgXCJzYWlzaXIgbCdhZHJlc3NlXCIsXG4gIF0sXG5cbiAgY29kZVBvc3RhbDogW1xuICAgIC8qIGZyYW5jYWlzIHN0YW5kYXJkICovXG4gICAgXCJjb2RlcG9zdGFsXCIsIFwiY29kZV9wb3N0YWxcIiwgXCJjcFwiLCBcImNvZGUgcG9zdGFsXCIsXG4gICAgXCJjcF92aWxsZVwiLCBcImNvZGVfcG9zdFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiY29kZVBvc3RhbFwiLCBcInBvc3RhbENvZGVcIiwgXCJ6aXBDb2RlXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiemlwY29kZVwiLCBcInppcF9jb2RlXCIsIFwiemlwXCIsIFwicG9zdGFsX2NvZGVcIixcbiAgICBcInBvc3RhbGNvZGVcIiwgXCJwb3N0Y29kZVwiLCBcInBvc3RfY29kZVwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcImNvZGUtcG9zdGFsXCIsIFwiemlwLWNvZGVcIiwgXCJwb3N0YWwtY29kZVwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1jcFwiLCBcImRhdGEtY29kZXBvc3RhbFwiLCBcImRhdGEtemlwY29kZVwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiY3BfcGF0aWVudFwiLCBcImNvZGVfcG9zdGFsX3BhdGllbnRcIiwgXCJjcF9jbGllbnRcIixcbiAgICBcImNwX2RvbWljaWxlXCIsIFwiY29kZV9wb3N0YWxfZG9taWNpbGVcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcInZvdHJlIGNvZGUgcG9zdGFsXCIsIFwiZXg6IDc1MDAxXCIsXG4gIF0sXG5cbiAgdmlsbGU6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwidmlsbGVcIiwgXCJjb21tdW5lXCIsIFwibG9jYWxpdGVcIiwgXCJub21fdmlsbGVcIixcbiAgICBcInZpbGxlX2NvbW11bmVcIiwgXCJ2aWxsZV9wYXRpZW50XCIsIFwidmlsbGVfY2xpZW50XCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJ2aWxsZUNvbW11bmVcIiwgXCJub21WaWxsZVwiLCBcImNpdHlOYW1lXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiY2l0eVwiLCBcIm11bmljaXBhbGl0eVwiLCBcInRvd25cIiwgXCJsb2NhbGl0eVwiLFxuICAgIFwiY2l0eV9uYW1lXCIsIFwiY2l0eW5hbWVcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJ2aWxsZS1jb21tdW5lXCIsIFwiY2l0eS1uYW1lXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLXZpbGxlXCIsIFwiZGF0YS1jaXR5XCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJsb2NhbGl0XHUwMEU5XCIsIFwibG9jYWxpdGVfcGF0aWVudFwiLCBcImNvbW11bmVfcGF0aWVudFwiLFxuICAgIFwidmlsbGVfZG9taWNpbGVcIiwgXCJjb21tdW5lX2RvbWljaWxlXCIsXG4gICAgLyogcGxhY2Vob2xkZXJzICovXG4gICAgXCJ2b3RyZSB2aWxsZVwiLCBcIm5vbSBkZSBsYSBjb21tdW5lXCIsIFwidmlsbGUgb3UgY29tbXVuZVwiLFxuICBdLFxuXG4gIGNpdmlsaXRlOiBbXG4gICAgLyogZnJhbmNhaXMgc3RhbmRhcmQgKi9cbiAgICBcImNpdmlsaXRlXCIsIFwidGl0cmVcIiwgXCJjaXZcIiwgXCJtcl9tbWVcIiwgXCJzZXhlXCIsXG4gICAgXCJjaXZpbGl0ZV9wYXRpZW50XCIsIFwiY2l2aWxpdGVfY2xpZW50XCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJjaXZpbGl0ZVBhdGllbnRcIiwgXCJ0aXRsZVBhdGllbnRcIiwgXCJnZW5kZXJQYXRpZW50XCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwidGl0bGVcIiwgXCJnZW5kZXJcIiwgXCJzYWx1dGF0aW9uXCIsIFwicHJlZml4XCIsXG4gICAgXCJuYW1lX3ByZWZpeFwiLCBcImhvbm9yaWZpY1wiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcIm1yLW1tZVwiLCBcIm5hbWUtcHJlZml4XCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLWNpdmlsaXRlXCIsIFwiZGF0YS10aXRsZVwiLCBcImRhdGEtZ2VuZGVyXCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJ0aXRyZV9jaXZpbGl0ZVwiLCBcImNpdl9wYXRpZW50XCIsIFwibW1lX21cIixcbiAgICBcIm1fbW1lXCIsIFwibW9uc2lldXJfbWFkYW1lXCIsIFwiZ2VucmVcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcIm0uIC8gbW1lXCIsIFwibW9uc2lldXIgb3UgbWFkYW1lXCIsXG4gIF0sXG59O1xuXG4vKiBcdTI1MDBcdTI1MDAgQ2hhbXBzIE11dHVlbGxlIC8gQU1DIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IHZhciBNVVRVRUxMRV9BTElBU0VTID0ge1xuICBvcmdhbmlzbWU6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwib3JnYW5pc21lXCIsIFwibXV0dWVsbGVcIiwgXCJjb21wbGVtZW50YWlyZVwiLCBcImFzc3VyZXVyXCIsXG4gICAgXCJjYWlzc2VcIiwgXCJub21fbXV0dWVsbGVcIiwgXCJhbWNcIiwgXCJvcmdhbmlzbWVfY29tcGxlbWVudGFpcmVcIixcbiAgICBcImFzc3VyYW5jZVwiLCBcImxpYmVsbGVfb3JnYW5pc21lXCIsIFwibm9tX29yZ2FuaXNtZVwiLFxuICAgIFwiY29tcGFnbmllXCIsIFwib3JnYW5pc21lX2FtY1wiLCBcInRpZXJzX3BheWFudFwiLFxuICAgIFwiY29tcGxlbWVudGFpcmVfc2FudGVcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmb3JtQ29udHJvbE5hbWUgKi9cbiAgICBcIm5vbU11dHVlbGxlXCIsIFwib3JnYW5pc21lQ29tcGxlbWVudGFpcmVcIiwgXCJvcmdhbmlzbWVBbWNcIixcbiAgICBcImxpYmVsbGVPcmdhbmlzbWVcIiwgXCJhc3N1cmV1ckNvbXBsZW1lbnRhaXJlXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiaW5zdXJlclwiLCBcImluc3VyYW5jZVwiLCBcImluc3VyYW5jZV9jb21wYW55XCIsXG4gICAgXCJpbnN1cmFuY2VfcHJvdmlkZXJcIiwgXCJoZWFsdGhfZnVuZFwiLCBcIm11dHVhbFwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcIm5vbS1tdXR1ZWxsZVwiLCBcIm9yZ2FuaXNtZS1jb21wbGVtZW50YWlyZVwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1vcmdhbmlzbWVcIiwgXCJkYXRhLW11dHVlbGxlXCIsIFwiZGF0YS1hc3N1cmV1clwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiY29kZV9tdXR1ZWxsZVwiLCBcIm11dHVlbGxlX25vbVwiLCBcIm9yZ2FuaXNtZV9yY1wiLFxuICAgIFwicmNfb3JnYW5pc21lXCIsIFwib3JnYW5pc21lX3RwXCIsIFwidHBfb3JnYW5pc21lXCIsXG4gICAgXCJjYWlzc2VfY29tcGxlbWVudGFpcmVcIiwgXCJyZWdpbWVfY29tcGxlbWVudGFpcmVcIixcbiAgICBcIm5vbV9jYWlzc2VcIiwgXCJub21fYXNzdXJldXJcIiwgXCJub21fY29tcGFnbmllXCIsXG4gICAgXCJvY1wiLCBcIm9yZ2FuaXNtZV9vY1wiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwibm9tIGRlIGxhIG11dHVlbGxlXCIsIFwib3JnYW5pc21lIGNvbXBsZW1lbnRhaXJlXCIsXG4gICAgXCJzYWlzaXIgbGEgbXV0dWVsbGVcIiwgXCJyZWNoZXJjaGVyIHVuZSBtdXR1ZWxsZVwiLFxuICBdLFxuXG4gIG51bWVyb0FkaGVyZW50OiBbXG4gICAgLyogZnJhbmNhaXMgc3RhbmRhcmQgKi9cbiAgICBcIm51bWVyb2FkaGVyZW50XCIsIFwibnVtX2FkaGVyZW50XCIsIFwiYWRoZXJlbnRcIixcbiAgICBcIm51bWVyb19jb250cmF0XCIsIFwiY29udHJhdFwiLCBcIm51bV9jb250cmF0XCIsXG4gICAgXCJub19jb250cmF0XCIsIFwibnVtZXJvX21lbWJyZVwiLCBcIm51bV9tZW1icmVcIixcbiAgICBcInJlZmVyZW5jZV9hZGhlcmVudFwiLCBcInJlZl9hZGhlcmVudFwiLFxuICAgIFwibnVtZXJvIGFkaGVyZW50XCIsIFwibiBjb250cmF0XCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJudW1lcm9BZGhlcmVudFwiLCBcIm51bUFkaGVyZW50XCIsIFwibnVtQ29udHJhdFwiLFxuICAgIFwibnVtZXJvQ29udHJhdFwiLCBcInJlZkFkaGVyZW50XCIsIFwiaWRBZGhlcmVudFwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcIm1lbWJlcl9udW1iZXJcIiwgXCJtZW1iZXJfaWRcIiwgXCJtZW1iZXJzaGlwX251bWJlclwiLFxuICAgIFwicG9saWN5X251bWJlclwiLCBcInBvbGljeW51bWJlclwiLCBcImNvbnRyYWN0X251bWJlclwiLFxuICAgIFwic3Vic2NyaWJlcl9pZFwiLCBcImNvbnRyYWN0XCIsXG4gICAgLyoga2ViYWItY2FzZSAqL1xuICAgIFwibnVtLWFkaGVyZW50XCIsIFwibnVtZXJvLWNvbnRyYXRcIiwgXCJudW0tY29udHJhdFwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1hZGhlcmVudFwiLCBcImRhdGEtY29udHJhdFwiLCBcImRhdGEtbnVtLWFkaGVyZW50XCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJuY29udHJhdFwiLCBcIm51bWNvbnRyYXRcIiwgXCJub2NvbnRyYXRcIiwgXCJpZF9hZGhlcmVudFwiLFxuICAgIFwiYWRoZXJlbnRfbnVtZXJvXCIsIFwiY29udHJhdF9udW1lcm9cIiwgXCJudW1fcG9saWNlXCIsXG4gICAgXCJudW1lcm9fcG9saWNlXCIsIFwicmVmX2NvbnRyYXRcIiwgXCJyZWZlcmVuY2VfY29udHJhdFwiLFxuICAgIFwiaW1tYXRyaWN1bGF0aW9uX2FkaGVyZW50XCIsIFwiaW1tYXRfYWRoZXJlbnRcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcIm51bWVybyBkJ2FkaGVyZW50XCIsIFwidm90cmUgbnVtZXJvIGRlIGNvbnRyYXRcIixcbiAgICBcInNhaXNpciBsZSBudW1lcm8gZCdhZGhlcmVudFwiLCBcIm5cdTAwQjAgY29udHJhdFwiLFxuICAgIC8qIGFiYnJldmlhdGlvbnMgKi9cbiAgICBcIm5hZFwiLCBcIm5hZGhcIixcbiAgXSxcblxuICBjb2RlT3JnYW5pc21lOiBbXG4gICAgLyogZnJhbmNhaXMgc3RhbmRhcmQgKi9cbiAgICBcImNvZGVfb3JnYW5pc21lXCIsIFwiY29kZV9hbWNcIiwgXCJudW1lcm9fYW1jXCIsXG4gICAgXCJudW1fYW1jXCIsIFwiY29kZV9tdXR1ZWxsZVwiLCBcImlkX29yZ2FuaXNtZVwiLFxuICAgIFwibnVtX29yZ2FuaXNtZVwiLCBcImNvZGVfb2NcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmb3JtQ29udHJvbE5hbWUgKi9cbiAgICBcImNvZGVPcmdhbmlzbWVcIiwgXCJjb2RlQW1jXCIsIFwibnVtZXJvQW1jXCIsXG4gICAgXCJudW1BbWNcIiwgXCJpZE9yZ2FuaXNtZVwiLCBcIm51bU9yZ2FuaXNtZVwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImluc3VyZXJfY29kZVwiLCBcImluc3VyYW5jZV9jb2RlXCIsIFwiZnVuZF9jb2RlXCIsXG4gICAgXCJwcm92aWRlcl9jb2RlXCIsXG4gICAgLyoga2ViYWItY2FzZSAqL1xuICAgIFwiY29kZS1vcmdhbmlzbWVcIiwgXCJjb2RlLWFtY1wiLCBcIm51bS1hbWNcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtY29kZS1vcmdhbmlzbWVcIiwgXCJkYXRhLWNvZGUtYW1jXCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJhbWNcIiwgXCJudW1lcm9fb3JnYW5pc21lXCIsIFwicmVmX29yZ2FuaXNtZVwiLFxuICAgIFwicmVmZXJlbmNlX29yZ2FuaXNtZVwiLCBcImNvZGVfY2Fpc3NlXCIsIFwiaWRfY2Fpc3NlXCIsXG4gICAgXCJjb2RlX3JlZ2ltZV9jb21wbGVtZW50YWlyZVwiLCBcImNvZGVfY29tcGxlbWVudGFpcmVcIixcbiAgICBcImNvZGVfdHBcIiwgXCJjb2RlX3RpZXJzX3BheWFudFwiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwiY29kZSBkZSBsJ29yZ2FuaXNtZVwiLCBcImNvZGUgYW1jXCIsXG4gICAgXCJzYWlzaXIgbGUgY29kZSBvcmdhbmlzbWVcIixcbiAgXSxcbn07XG5cbi8qIFx1MjUwMFx1MjUwMCBPcmRvbm5hbmNlIC8gUHJlc2NyaXB0aW9uIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IHZhciBPUkRPTk5BTkNFX0FMSUFTRVMgPSB7XG4gIHJwcHM6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwicnBwc1wiLCBcIm51bV9ycHBzXCIsIFwibnVtZXJvX3JwcHNcIiwgXCJjb2RlX3JwcHNcIixcbiAgICBcImlkZW50aWZpYW50X3JwcHNcIiwgXCJpZF9wcmVzY3JpcHRldXJcIixcbiAgICBcImFkZWxpXCIsIFwibnVtX2FkZWxpXCIsIFwibnVtZXJvX2FkZWxpXCIsXG4gICAgXCJmaW5lc3NcIiwgXCJudW1fZmluZXNzXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJudW1ScHBzXCIsIFwibnVtZXJvUnBwc1wiLCBcImNvZGVScHBzXCIsXG4gICAgXCJpZFByZXNjcmlwdGV1clwiLCBcIm51bUFkZWxpXCIsIFwibnVtQW1cIixcbiAgICBcIm51bUFtUHJlc2NyaXB0ZXVyXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwicHJlc2NyaWJlcl9pZFwiLCBcInByZXNjcmliZXJfY29kZVwiLFxuICAgIFwiZG9jdG9yX2lkXCIsIFwicHJvdmlkZXJfaWRcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJudW0tcnBwc1wiLCBcImNvZGUtcnBwc1wiLCBcImlkLXByZXNjcmlwdGV1clwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1ycHBzXCIsIFwiZGF0YS1wcmVzY3JpcHRldXJcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcIm51bXJwcHNcIiwgXCJuXHUwMEIwcnBwc1wiLCBcIm51bWFtXCIsIFwibnVtX2FtXCIsXG4gICAgXCJudW1lcm9fYW1cIiwgXCJudW1hbXByZXNjcmlwdGV1clwiLFxuICAgIFwicnBwc19wcmVzY3JpcHRldXJcIiwgXCJjb2RlX3ByZXNjcmlwdGV1clwiLFxuICAgIFwiaWRlbnRpZmlhbnRfbWVkZWNpblwiLCBcImlkX21lZGVjaW5cIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcIm51bWVybyBycHBzXCIsIFwic2Fpc2lyIGxlIHJwcHNcIixcbiAgICBcImlkZW50aWZpYW50IHJwcHMgZHUgcHJlc2NyaXB0ZXVyXCIsXG4gIF0sXG5cbiAgZGF0ZU9yZG9ubmFuY2U6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwiZGF0ZW9yZG9ubmFuY2VcIiwgXCJkYXRlX29yZG9ubmFuY2VcIiwgXCJkYXRlX29yZG9cIixcbiAgICBcImRhdGUgcHJlc2NyaXB0aW9uXCIsIFwiZGF0ZV9wcmVzY3JpcHRpb25cIixcbiAgICBcImRhdGUgb3Jkb25uYW5jZVwiLCBcImRhdGUgZGUgbCdvcmRvbm5hbmNlXCIsXG4gICAgXCJkYXRlIGRlIHByZXNjcmlwdGlvblwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiZGF0ZU9yZG9ubmFuY2VcIiwgXCJkYXRlUHJlc2NyaXB0aW9uXCIsIFwiZGF0ZU9yZG9cIixcbiAgICBcIm9yZG9ubmFuY2VEYXRlXCIsIFwicHJlc2NyaXB0aW9uRGF0ZVwiLFxuICAgIFwiZGF0ZU9yZG9ubmFuY2VFZGl0XCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwicHJlc2NyaXB0aW9uX2RhdGVcIiwgXCJvcmRlcl9kYXRlXCIsIFwicnhfZGF0ZVwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcImRhdGUtb3Jkb25uYW5jZVwiLCBcImRhdGUtcHJlc2NyaXB0aW9uXCIsIFwiZGF0ZS1vcmRvXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLWRhdGUtb3Jkb25uYW5jZVwiLCBcImRhdGEtZGF0ZS1wcmVzY3JpcHRpb25cIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcImRhdGVvcmRvXCIsIFwib3Jkb25uYW5jZV9kYXRlXCIsIFwiZHRfb3Jkb25uYW5jZVwiLFxuICAgIFwiZHRfcHJlc2NyaXB0aW9uXCIsIFwiZGF0ZV9vcmRvX2VkaXRcIixcbiAgICBcImRhdGVvcmRvbm5hbmNlZWRpdFwiLCBcImRhdGVfcnhcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcImRhdGUgZGUgbGEgcHJlc2NyaXB0aW9uXCIsXG4gICAgXCJqai9tbS9hYWFhXCIsIFwiZGF0ZSBvcmRvbm5hbmNlIChqai9tbS9hYWFhKVwiLFxuICBdLFxuXG4gIG5vbU9waHRhbG1vbG9ndWU6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwib3BodGFsbW9sb2d1ZVwiLCBcInByZXNjcmlwdGV1clwiLCBcIm5vbV9tZWRlY2luXCIsXG4gICAgXCJtZWRlY2luXCIsIFwiZG9jdGV1clwiLCBcIm5vbSBwcmVzY3JpcHRldXJcIixcbiAgICBcIm5vbV9wcmVzY3JpcHRldXJcIiwgXCJub21fb3BodGFsbW9sb2d1ZVwiLFxuICAgIFwib3BodGFsbW9cIiwgXCJub21fZG9jdGV1clwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwibm9tT3BodGFsbW9sb2d1ZVwiLCBcIm5vbU1lZGVjaW5cIiwgXCJub21QcmVzY3JpcHRldXJcIixcbiAgICBcIm5vbURvY3RldXJcIiwgXCJtZWRlY2luUHJlc2NyaXB0ZXVyXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiZG9jdG9yXCIsIFwicHJlc2NyaWJlclwiLCBcInByZXNjcmliZXJfbmFtZVwiLFxuICAgIFwiZG9jdG9yX25hbWVcIiwgXCJwaHlzaWNpYW5cIiwgXCJvcGh0aGFsbW9sb2dpc3RcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJub20tcHJlc2NyaXB0ZXVyXCIsIFwibm9tLW1lZGVjaW5cIiwgXCJub20tZG9jdGV1clwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1wcmVzY3JpcHRldXJcIiwgXCJkYXRhLW1lZGVjaW5cIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcIm5vbW1lZGVjaW5cIiwgXCJtZWRlY2luX3ByZXNjcmlwdGV1clwiLFxuICAgIFwiZG9jdGV1ciBwcmVzY3JpcHRldXJcIiwgXCJtZWRlY2luX3RyYWl0YW50XCIsXG4gICAgXCJvcGh0YWxtb2xvZ2lzdGVcIiwgXCJub21fb3BodGFsbW9cIixcbiAgICBcInByZXNjcmlwdGV1cl9ub21cIiwgXCJkcl9ub21cIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcIm5vbSBkdSBwcmVzY3JpcHRldXJcIiwgXCJub20gZHUgbWVkZWNpblwiLFxuICAgIFwicmVjaGVyY2hlciB1biBwcmVzY3JpcHRldXJcIiwgXCJkci5cIixcbiAgXSxcbn07XG5cbi8qIFx1MjUwMFx1MjUwMCBDb3JyZWN0aW9ucyBvcHRpcXVlcyBPRCAoT2VpbCBEcm9pdCkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgdmFyIE9QVElDQUxfT0RfQUxJQVNFUyA9IHtcbiAgXCJsdW5ldHRlc09ELnNwaGVyZVwiOiBbXG4gICAgLyogZnJhbmNhaXMgc3RhbmRhcmQgYXZlYyBsYXRlcmFsaXRlICovXG4gICAgXCJzcGhlcmVfb2RcIiwgXCJzcGhfb2RcIiwgXCJvZF9zcGhcIiwgXCJvZF9zcGhlcmVcIixcbiAgICBcInNwaGVyZSBvZFwiLCBcInNwaCBvZFwiLCBcInNwaGVyZV9kcm9pdFwiLCBcInNwaF9kcm9pdFwiLFxuICAgIFwic3BoZXJlX2RcIiwgXCJzcGhfZFwiLFxuICAgIC8qIFZMIChWaXNpb24gZGUgTG9pbikgKi9cbiAgICBcInNwaGVyZV92bF9vZFwiLCBcInNwaF92bF9vZFwiLCBcInZsX3NwaF9vZFwiLFxuICAgIFwic3BoZXJlX2xvaW5fb2RcIiwgXCJzcGhfbG9pbl9vZFwiLFxuICAgIFwic3BoZXJldmxvZFwiLCBcInNwaHZsb2RcIixcbiAgICAvKiBWUCAoVmlzaW9uIGRlIFByZXMpICovXG4gICAgXCJzcGhlcmVfdnBfb2RcIiwgXCJzcGhfdnBfb2RcIiwgXCJ2cF9zcGhfb2RcIixcbiAgICBcInNwaGVyZV9wcmVzX29kXCIsIFwic3BoX3ByZXNfb2RcIixcbiAgICBcInNwaGVyZXZwb2RcIiwgXCJzcGh2cG9kXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJzcGhlcmVPZFwiLCBcInNwaE9kXCIsIFwic3BoZXJlRHJvaXRcIiwgXCJzcGhEcm9pdFwiLFxuICAgIFwic3BoZXJlT2VpbERyb2l0XCIsIFwic3BoZXJlVmxPZFwiLCBcInNwaGVyZVZwT2RcIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJzcGhlcmVfcmlnaHRcIiwgXCJzcGhfcmlnaHRcIiwgXCJyaWdodF9zcGhlcmVcIixcbiAgICBcInNwaGVyZV9yZVwiLCBcInNwaF9yZVwiLCBcInJfc3BoZXJlXCIsIFwicl9zcGhcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJzcGhlcmUtb2RcIiwgXCJzcGgtb2RcIiwgXCJzcGhlcmUtZHJvaXRcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtc3BoZXJlLW9kXCIsIFwiZGF0YS1zcGgtb2RcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcInNwaGVyZW9kXCIsIFwic3Bob2RcIiwgXCJvZF9zcGhlcmVfdmxcIiwgXCJvZF9zcGhlcmVfdnBcIixcbiAgICBcInNwaGVyZV92ZXJyZV9kcm9pdFwiLCBcInNwaGVyZXZlcnJlZHJvaXRcIixcbiAgICBcInJ4X3NwaGVyZV9vZFwiLCBcInJ4X3NwaF9vZFwiLFxuICAgIFwicHVpc3NhbmNlX29kXCIsIFwicHdyX29kXCIsIFwicG93ZXJfb2RcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcInNwaC4gb2RcIiwgXCJzcGhlcmUgb2VpbCBkcm9pdFwiLFxuICAgIC8qIGFiYnJldmlhdGlvbnMgKi9cbiAgICBcInNfb2RcIiwgXCJzb2RcIixcbiAgXSxcblxuICBcImx1bmV0dGVzT0QuY3lsaW5kcmVcIjogW1xuICAgIC8qIGZyYW5jYWlzIHN0YW5kYXJkIGF2ZWMgbGF0ZXJhbGl0ZSAqL1xuICAgIFwiY3lsaW5kcmVfb2RcIiwgXCJjeWxfb2RcIiwgXCJvZF9jeWxcIiwgXCJvZF9jeWxpbmRyZVwiLFxuICAgIFwiY3lsaW5kcmUgb2RcIiwgXCJjeWwgb2RcIiwgXCJjeWxpbmRyZV9kcm9pdFwiLCBcImN5bF9kcm9pdFwiLFxuICAgIFwiY3lsaW5kcmVfZFwiLCBcImN5bF9kXCIsXG4gICAgLyogVkwgLyBWUCAqL1xuICAgIFwiY3lsaW5kcmVfdmxfb2RcIiwgXCJjeWxfdmxfb2RcIiwgXCJjeWxpbmRyZV92cF9vZFwiLCBcImN5bF92cF9vZFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiY3lsaW5kcmVPZFwiLCBcImN5bE9kXCIsIFwiY3lsaW5kcmVEcm9pdFwiLCBcImN5bERyb2l0XCIsXG4gICAgXCJjeWxpbmRyZU9laWxEcm9pdFwiLCBcImN5bGluZHJlVmxPZFwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImN5bGluZGVyX3JpZ2h0XCIsIFwiY3lsX3JpZ2h0XCIsIFwicmlnaHRfY3lsaW5kZXJcIixcbiAgICBcImN5bGluZGVyX3JlXCIsIFwiY3lsX3JlXCIsIFwicl9jeWxpbmRyZVwiLCBcInJfY3lsXCIsXG4gICAgLyoga2ViYWItY2FzZSAqL1xuICAgIFwiY3lsaW5kcmUtb2RcIiwgXCJjeWwtb2RcIiwgXCJjeWxpbmRyZS1kcm9pdFwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1jeWxpbmRyZS1vZFwiLCBcImRhdGEtY3lsLW9kXCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJjeWxpbmRyZW9kXCIsIFwiY3lsb2RcIiwgXCJjeWxpbmRyZV92ZXJyZV9kcm9pdFwiLFxuICAgIFwicnhfY3lsaW5kcmVfb2RcIiwgXCJyeF9jeWxfb2RcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcImN5bC4gb2RcIiwgXCJjeWxpbmRyZSBvZWlsIGRyb2l0XCIsXG4gICAgLyogYWJicmV2aWF0aW9ucyAqL1xuICAgIFwiY19vZFwiLCBcImNvZFwiLFxuICBdLFxuXG4gIFwibHVuZXR0ZXNPRC5heGVcIjogW1xuICAgIC8qIGZyYW5jYWlzIHN0YW5kYXJkIGF2ZWMgbGF0ZXJhbGl0ZSAqL1xuICAgIFwiYXhlX29kXCIsIFwiYXhfb2RcIiwgXCJvZF9heGVcIiwgXCJvZF9heFwiLFxuICAgIFwiYXhlIG9kXCIsIFwiYXggb2RcIiwgXCJheGVfZHJvaXRcIiwgXCJheF9kcm9pdFwiLFxuICAgIFwiYXhlX2RcIiwgXCJheF9kXCIsXG4gICAgLyogVkwgLyBWUCAqL1xuICAgIFwiYXhlX3ZsX29kXCIsIFwiYXhfdmxfb2RcIiwgXCJheGVfdnBfb2RcIiwgXCJheF92cF9vZFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiYXhlT2RcIiwgXCJheE9kXCIsIFwiYXhlRHJvaXRcIiwgXCJheERyb2l0XCIsXG4gICAgXCJheGVPZWlsRHJvaXRcIiwgXCJheGVWbE9kXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiYXhpc19yaWdodFwiLCBcImF4X3JpZ2h0XCIsIFwicmlnaHRfYXhpc1wiLFxuICAgIFwiYXhpc19yZVwiLCBcImF4X3JlXCIsIFwicl9heGVcIiwgXCJyX2F4XCIsXG4gICAgLyoga2ViYWItY2FzZSAqL1xuICAgIFwiYXhlLW9kXCIsIFwiYXgtb2RcIiwgXCJheGUtZHJvaXRcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtYXhlLW9kXCIsIFwiZGF0YS1heC1vZFwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiYXhlb2RcIiwgXCJheG9kXCIsIFwiYXhlX3ZlcnJlX2Ryb2l0XCIsXG4gICAgXCJyeF9heGVfb2RcIiwgXCJyeF9heF9vZFwiLFxuICAgIFwib3JpZW50YXRpb25fb2RcIiwgXCJhbmdsZV9vZFwiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwiYXhlIG9laWwgZHJvaXRcIiwgXCJheGUgKFx1MDBCMClcIixcbiAgICAvKiBhYmJyZXZpYXRpb25zICovXG4gICAgXCJhX29kXCIsIFwiYW9kXCIsXG4gIF0sXG5cbiAgXCJsdW5ldHRlc09ELmFkZGl0aW9uXCI6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCBhdmVjIGxhdGVyYWxpdGUgKi9cbiAgICBcImFkZGl0aW9uX29kXCIsIFwiYWRkX29kXCIsIFwib2RfYWRkXCIsIFwib2RfYWRkaXRpb25cIixcbiAgICBcImFkZGl0aW9uIG9kXCIsIFwiYWRkIG9kXCIsIFwiYWRkaXRpb25fZHJvaXRcIiwgXCJhZGRfZHJvaXRcIixcbiAgICBcImFkZGl0aW9uX2RcIiwgXCJhZGRfZFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiYWRkaXRpb25PZFwiLCBcImFkZE9kXCIsIFwiYWRkaXRpb25Ecm9pdFwiLCBcImFkZERyb2l0XCIsXG4gICAgXCJhZGRpdGlvbk9laWxEcm9pdFwiLCBcImFkZFZwT2RcIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJhZGRpdGlvbl9yaWdodFwiLCBcImFkZF9yaWdodFwiLCBcInJpZ2h0X2FkZGl0aW9uXCIsXG4gICAgXCJhZGRpdGlvbl9yZVwiLCBcImFkZF9yZVwiLCBcInJfYWRkaXRpb25cIiwgXCJyX2FkZFwiLFxuICAgIFwibmVhcl9hZGRfcmlnaHRcIiwgXCJuZWFyX2FkZF9vZFwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcImFkZGl0aW9uLW9kXCIsIFwiYWRkLW9kXCIsIFwiYWRkaXRpb24tZHJvaXRcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtYWRkaXRpb24tb2RcIiwgXCJkYXRhLWFkZC1vZFwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiYWRkaXRpb25vZFwiLCBcImFkZG9kXCIsIFwiYWRkaXRpb25fdmVycmVfZHJvaXRcIixcbiAgICBcInJ4X2FkZGl0aW9uX29kXCIsIFwicnhfYWRkX29kXCIsXG4gICAgXCJhZGRpdGlvbl92cF9vZFwiLCBcImFkZF92cF9vZFwiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwiYWRkLiBvZFwiLCBcImFkZGl0aW9uIG9laWwgZHJvaXRcIixcbiAgICAvKiBhYmJyZXZpYXRpb25zICovXG4gICAgXCJhZF9vZFwiLCBcImFkb2RcIixcbiAgXSxcbn07XG5cbi8qIFx1MjUwMFx1MjUwMCBDb3JyZWN0aW9ucyBvcHRpcXVlcyBPRyAoT2VpbCBHYXVjaGUpIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IHZhciBPUFRJQ0FMX09HX0FMSUFTRVMgPSB7XG4gIFwibHVuZXR0ZXNPRy5zcGhlcmVcIjogW1xuICAgIC8qIGZyYW5jYWlzIHN0YW5kYXJkIGF2ZWMgbGF0ZXJhbGl0ZSAqL1xuICAgIFwic3BoZXJlX29nXCIsIFwic3BoX29nXCIsIFwib2dfc3BoXCIsIFwib2dfc3BoZXJlXCIsXG4gICAgXCJzcGhlcmUgb2dcIiwgXCJzcGggb2dcIiwgXCJzcGhlcmVfZ2F1Y2hlXCIsIFwic3BoX2dhdWNoZVwiLFxuICAgIFwic3BoZXJlX2dcIiwgXCJzcGhfZ1wiLFxuICAgIC8qIFZMIChWaXNpb24gZGUgTG9pbikgKi9cbiAgICBcInNwaGVyZV92bF9vZ1wiLCBcInNwaF92bF9vZ1wiLCBcInZsX3NwaF9vZ1wiLFxuICAgIFwic3BoZXJlX2xvaW5fb2dcIiwgXCJzcGhfbG9pbl9vZ1wiLFxuICAgIFwic3BoZXJldmxvZ1wiLCBcInNwaHZsb2dcIixcbiAgICAvKiBWUCAoVmlzaW9uIGRlIFByZXMpICovXG4gICAgXCJzcGhlcmVfdnBfb2dcIiwgXCJzcGhfdnBfb2dcIiwgXCJ2cF9zcGhfb2dcIixcbiAgICBcInNwaGVyZV9wcmVzX29nXCIsIFwic3BoX3ByZXNfb2dcIixcbiAgICBcInNwaGVyZXZwb2dcIiwgXCJzcGh2cG9nXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJzcGhlcmVPZ1wiLCBcInNwaE9nXCIsIFwic3BoZXJlR2F1Y2hlXCIsIFwic3BoR2F1Y2hlXCIsXG4gICAgXCJzcGhlcmVPZWlsR2F1Y2hlXCIsIFwic3BoZXJlVmxPZ1wiLCBcInNwaGVyZVZwT2dcIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJzcGhlcmVfbGVmdFwiLCBcInNwaF9sZWZ0XCIsIFwibGVmdF9zcGhlcmVcIixcbiAgICBcInNwaGVyZV9sZVwiLCBcInNwaF9sZVwiLCBcImxfc3BoZXJlXCIsIFwibF9zcGhcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJzcGhlcmUtb2dcIiwgXCJzcGgtb2dcIiwgXCJzcGhlcmUtZ2F1Y2hlXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLXNwaGVyZS1vZ1wiLCBcImRhdGEtc3BoLW9nXCIsXG4gICAgLyogRVJQIHNwZWNpZmlxdWVzICovXG4gICAgXCJzcGhlcmVvZ1wiLCBcInNwaG9nXCIsIFwib2dfc3BoZXJlX3ZsXCIsIFwib2dfc3BoZXJlX3ZwXCIsXG4gICAgXCJzcGhlcmVfdmVycmVfZ2F1Y2hlXCIsIFwic3BoZXJldmVycmVnYXVjaGVcIixcbiAgICBcInJ4X3NwaGVyZV9vZ1wiLCBcInJ4X3NwaF9vZ1wiLFxuICAgIFwicHVpc3NhbmNlX29nXCIsIFwicHdyX29nXCIsIFwicG93ZXJfb2dcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcInNwaC4gb2dcIiwgXCJzcGhlcmUgb2VpbCBnYXVjaGVcIixcbiAgICAvKiBhYmJyZXZpYXRpb25zICovXG4gICAgXCJzX29nXCIsIFwic29nXCIsXG4gIF0sXG5cbiAgXCJsdW5ldHRlc09HLmN5bGluZHJlXCI6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCBhdmVjIGxhdGVyYWxpdGUgKi9cbiAgICBcImN5bGluZHJlX29nXCIsIFwiY3lsX29nXCIsIFwib2dfY3lsXCIsIFwib2dfY3lsaW5kcmVcIixcbiAgICBcImN5bGluZHJlIG9nXCIsIFwiY3lsIG9nXCIsIFwiY3lsaW5kcmVfZ2F1Y2hlXCIsIFwiY3lsX2dhdWNoZVwiLFxuICAgIFwiY3lsaW5kcmVfZ1wiLCBcImN5bF9nXCIsXG4gICAgLyogVkwgLyBWUCAqL1xuICAgIFwiY3lsaW5kcmVfdmxfb2dcIiwgXCJjeWxfdmxfb2dcIiwgXCJjeWxpbmRyZV92cF9vZ1wiLCBcImN5bF92cF9vZ1wiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiY3lsaW5kcmVPZ1wiLCBcImN5bE9nXCIsIFwiY3lsaW5kcmVHYXVjaGVcIiwgXCJjeWxHYXVjaGVcIixcbiAgICBcImN5bGluZHJlT2VpbEdhdWNoZVwiLCBcImN5bGluZHJlVmxPZ1wiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImN5bGluZGVyX2xlZnRcIiwgXCJjeWxfbGVmdFwiLCBcImxlZnRfY3lsaW5kZXJcIixcbiAgICBcImN5bGluZGVyX2xlXCIsIFwiY3lsX2xlXCIsIFwibF9jeWxpbmRyZVwiLCBcImxfY3lsXCIsXG4gICAgLyoga2ViYWItY2FzZSAqL1xuICAgIFwiY3lsaW5kcmUtb2dcIiwgXCJjeWwtb2dcIiwgXCJjeWxpbmRyZS1nYXVjaGVcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtY3lsaW5kcmUtb2dcIiwgXCJkYXRhLWN5bC1vZ1wiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiY3lsaW5kcmVvZ1wiLCBcImN5bG9nXCIsIFwiY3lsaW5kcmVfdmVycmVfZ2F1Y2hlXCIsXG4gICAgXCJyeF9jeWxpbmRyZV9vZ1wiLCBcInJ4X2N5bF9vZ1wiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwiY3lsLiBvZ1wiLCBcImN5bGluZHJlIG9laWwgZ2F1Y2hlXCIsXG4gICAgLyogYWJicmV2aWF0aW9ucyAqL1xuICAgIFwiY19vZ1wiLCBcImNvZ1wiLFxuICBdLFxuXG4gIFwibHVuZXR0ZXNPRy5heGVcIjogW1xuICAgIC8qIGZyYW5jYWlzIHN0YW5kYXJkIGF2ZWMgbGF0ZXJhbGl0ZSAqL1xuICAgIFwiYXhlX29nXCIsIFwiYXhfb2dcIiwgXCJvZ19heGVcIiwgXCJvZ19heFwiLFxuICAgIFwiYXhlIG9nXCIsIFwiYXggb2dcIiwgXCJheGVfZ2F1Y2hlXCIsIFwiYXhfZ2F1Y2hlXCIsXG4gICAgXCJheGVfZ1wiLCBcImF4X2dcIixcbiAgICAvKiBWTCAvIFZQICovXG4gICAgXCJheGVfdmxfb2dcIiwgXCJheF92bF9vZ1wiLCBcImF4ZV92cF9vZ1wiLCBcImF4X3ZwX29nXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJheGVPZ1wiLCBcImF4T2dcIiwgXCJheGVHYXVjaGVcIiwgXCJheEdhdWNoZVwiLFxuICAgIFwiYXhlT2VpbEdhdWNoZVwiLCBcImF4ZVZsT2dcIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJheGlzX2xlZnRcIiwgXCJheF9sZWZ0XCIsIFwibGVmdF9heGlzXCIsXG4gICAgXCJheGlzX2xlXCIsIFwiYXhfbGVcIiwgXCJsX2F4ZVwiLCBcImxfYXhcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJheGUtb2dcIiwgXCJheC1vZ1wiLCBcImF4ZS1nYXVjaGVcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtYXhlLW9nXCIsIFwiZGF0YS1heC1vZ1wiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwiYXhlb2dcIiwgXCJheG9nXCIsIFwiYXhlX3ZlcnJlX2dhdWNoZVwiLFxuICAgIFwicnhfYXhlX29nXCIsIFwicnhfYXhfb2dcIixcbiAgICBcIm9yaWVudGF0aW9uX29nXCIsIFwiYW5nbGVfb2dcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcImF4ZSBvZWlsIGdhdWNoZVwiLCBcImF4ZSAoXHUwMEIwKVwiLFxuICAgIC8qIGFiYnJldmlhdGlvbnMgKi9cbiAgICBcImFfb2dcIiwgXCJhb2dcIixcbiAgXSxcblxuICBcImx1bmV0dGVzT0cuYWRkaXRpb25cIjogW1xuICAgIC8qIGZyYW5jYWlzIHN0YW5kYXJkIGF2ZWMgbGF0ZXJhbGl0ZSAqL1xuICAgIFwiYWRkaXRpb25fb2dcIiwgXCJhZGRfb2dcIiwgXCJvZ19hZGRcIiwgXCJvZ19hZGRpdGlvblwiLFxuICAgIFwiYWRkaXRpb24gb2dcIiwgXCJhZGQgb2dcIiwgXCJhZGRpdGlvbl9nYXVjaGVcIiwgXCJhZGRfZ2F1Y2hlXCIsXG4gICAgXCJhZGRpdGlvbl9nXCIsIFwiYWRkX2dcIixcbiAgICAvKiBjYW1lbENhc2UgLyBmb3JtQ29udHJvbE5hbWUgKi9cbiAgICBcImFkZGl0aW9uT2dcIiwgXCJhZGRPZ1wiLCBcImFkZGl0aW9uR2F1Y2hlXCIsIFwiYWRkR2F1Y2hlXCIsXG4gICAgXCJhZGRpdGlvbk9laWxHYXVjaGVcIiwgXCJhZGRWcE9nXCIsXG4gICAgLyogYW5nbGFpcyAqL1xuICAgIFwiYWRkaXRpb25fbGVmdFwiLCBcImFkZF9sZWZ0XCIsIFwibGVmdF9hZGRpdGlvblwiLFxuICAgIFwiYWRkaXRpb25fbGVcIiwgXCJhZGRfbGVcIiwgXCJsX2FkZGl0aW9uXCIsIFwibF9hZGRcIixcbiAgICBcIm5lYXJfYWRkX2xlZnRcIiwgXCJuZWFyX2FkZF9vZ1wiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcImFkZGl0aW9uLW9nXCIsIFwiYWRkLW9nXCIsIFwiYWRkaXRpb24tZ2F1Y2hlXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLWFkZGl0aW9uLW9nXCIsIFwiZGF0YS1hZGQtb2dcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcImFkZGl0aW9ub2dcIiwgXCJhZGRvZ1wiLCBcImFkZGl0aW9uX3ZlcnJlX2dhdWNoZVwiLFxuICAgIFwicnhfYWRkaXRpb25fb2dcIiwgXCJyeF9hZGRfb2dcIixcbiAgICBcImFkZGl0aW9uX3ZwX29nXCIsIFwiYWRkX3ZwX29nXCIsXG4gICAgLyogcGxhY2Vob2xkZXJzICovXG4gICAgXCJhZGQuIG9nXCIsIFwiYWRkaXRpb24gb2VpbCBnYXVjaGVcIixcbiAgICAvKiBhYmJyZXZpYXRpb25zICovXG4gICAgXCJhZF9vZ1wiLCBcImFkb2dcIixcbiAgXSxcbn07XG5cbi8qIFx1MjUwMFx1MjUwMCBQRUMgKFByaXNlIEVuIENoYXJnZSkgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgdmFyIFBFQ19BTElBU0VTID0ge1xuICBudW1lcm9BY2NvcmQ6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwibnVtX2FjY29yZFwiLCBcIm51bWVyb19hY2NvcmRcIiwgXCJhY2NvcmRcIixcbiAgICBcInJlZmVyZW5jZV9wZWNcIiwgXCJudW1fcGVjXCIsIFwibl9hY2NvcmRcIixcbiAgICBcIm5vX2FjY29yZFwiLCBcImFjY29yZF9wZWNcIiwgXCJyZWZfcGVjXCIsXG4gICAgXCJudW1lcm8gcGVjXCIsIFwibiBhY2NvcmRcIiwgXCJudW1lcm8gYWNjb3JkXCIsXG4gICAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gICAgXCJudW1lcm9BY2NvcmRcIiwgXCJudW1BY2NvcmRcIiwgXCJyZWZQZWNcIixcbiAgICBcInJlZmVyZW5jZVBlY1wiLCBcImFjY29yZFBlY1wiLCBcIm51bVBlY1wiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImFncmVlbWVudF9udW1iZXJcIiwgXCJhcHByb3ZhbF9udW1iZXJcIixcbiAgICBcImF1dGhvcml6YXRpb25fbnVtYmVyXCIsIFwiYXV0aF9udW1iZXJcIixcbiAgICBcImFwcHJvdmFsX3JlZlwiLCBcImFncmVlbWVudF9yZWZcIixcbiAgICAvKiBrZWJhYi1jYXNlICovXG4gICAgXCJudW0tYWNjb3JkXCIsIFwibnVtZXJvLWFjY29yZFwiLCBcInJlZi1wZWNcIixcbiAgICAvKiBkYXRhIGF0dHJpYnV0ZXMgKi9cbiAgICBcImRhdGEtYWNjb3JkXCIsIFwiZGF0YS1udW0tYWNjb3JkXCIsIFwiZGF0YS1wZWNcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcIm51bWVyb19wcmlzZV9lbl9jaGFyZ2VcIiwgXCJyZWZfYWNjb3JkXCIsXG4gICAgXCJyZWZlcmVuY2VfYWNjb3JkXCIsIFwiaWRfcGVjXCIsIFwiaWRfYWNjb3JkXCIsXG4gICAgXCJudW1lcm9fYXV0b3Jpc2F0aW9uXCIsIFwibnVtX2F1dG9yaXNhdGlvblwiLFxuICAgIFwiY29kZV9hY2NvcmRcIiwgXCJuX3BlY1wiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwibnVtZXJvIGQnYWNjb3JkXCIsIFwicmVmZXJlbmNlIGRlIGxhIHBlY1wiLFxuICAgIFwic2Fpc2lyIGxlIG51bWVybyBkJ2FjY29yZFwiLFxuICBdLFxuXG4gIG1vbnRhbnRQRUM6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwibW9udGFudF9wZWNcIiwgXCJtb250YW50X2FjY29yZFwiLCBcIm1vbnRhbnRfcmNcIixcbiAgICBcInByaXNlX2VuX2NoYXJnZVwiLCBcIm1vbnRhbnRfbXV0dWVsbGVcIixcbiAgICBcInBhcnRfY29tcGxlbWVudGFpcmVcIiwgXCJtb250YW50IHJlbWJvdXJzZVwiLFxuICAgIFwibW9udGFudCBwZWNcIiwgXCJtb250YW50IGFjY29yZFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwibW9udGFudFBlY1wiLCBcIm1vbnRhbnRBY2NvcmRcIiwgXCJtb250YW50UmNcIixcbiAgICBcIm1vbnRhbnRNdXR1ZWxsZVwiLCBcInBhcnRDb21wbGVtZW50YWlyZVwiLFxuICAgIFwibW9udGFudFJlbWJvdXJzZVwiLCBcInByaXNlRW5DaGFyZ2VcIixcbiAgICAvKiBhbmdsYWlzICovXG4gICAgXCJjb3ZlcmVkX2Ftb3VudFwiLCBcInJlaW1idXJzZW1lbnRfYW1vdW50XCIsXG4gICAgXCJpbnN1cmFuY2VfYW1vdW50XCIsIFwiYXBwcm92ZWRfYW1vdW50XCIsXG4gICAgXCJiZW5lZml0X2Ftb3VudFwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcIm1vbnRhbnQtcGVjXCIsIFwibW9udGFudC1hY2NvcmRcIiwgXCJtb250YW50LXJjXCIsXG4gICAgLyogZGF0YSBhdHRyaWJ1dGVzICovXG4gICAgXCJkYXRhLW1vbnRhbnQtcGVjXCIsIFwiZGF0YS1tb250YW50LWFjY29yZFwiLFxuICAgIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICAgIFwibW9udGFudF9wcmlzZV9lbl9jaGFyZ2VcIiwgXCJtb250YW50X3JlbWJcIixcbiAgICBcIm1vbnRhbnRfcGFydF9jb21wbGVtZW50YWlyZVwiLCBcIm1vbnRhbnRfYW1jXCIsXG4gICAgXCJtdF9wZWNcIiwgXCJtdF9hY2NvcmRcIiwgXCJtdF9yY1wiLFxuICAgIFwicmVtYm91cnNlbWVudF9tdXR1ZWxsZVwiLCBcInBhcnRfbXV0dWVsbGVcIixcbiAgICBcIm1vbnRhbnRfY291dmVydFwiLCBcImJhc2VfcmVtYm91cnNlbWVudF9yY1wiLFxuICAgIC8qIHBsYWNlaG9sZGVycyAqL1xuICAgIFwibW9udGFudCBkZSBsYSBwcmlzZSBlbiBjaGFyZ2VcIixcbiAgICBcIm1vbnRhbnQgcmVtYm91cnNlIHBhciBsYSBtdXR1ZWxsZVwiLFxuICBdLFxuXG4gIGRhdGVQRUM6IFtcbiAgICAvKiBmcmFuY2FpcyBzdGFuZGFyZCAqL1xuICAgIFwiZGF0ZV9wZWNcIiwgXCJkYXRlX2FjY29yZFwiLCBcImRhdGVfcmV0b3VyXCIsXG4gICAgXCJkYXRlX3JlcG9uc2VcIiwgXCJkYXRlX3ZhbGlkYXRpb25cIixcbiAgICBcImRhdGUgcGVjXCIsIFwiZGF0ZSBhY2NvcmRcIixcbiAgICBcImRhdGUgZGUgbGEgcGVjXCIsIFwiZGF0ZSBkZSBsJ2FjY29yZFwiLFxuICAgIC8qIGNhbWVsQ2FzZSAvIGZvcm1Db250cm9sTmFtZSAqL1xuICAgIFwiZGF0ZVBlY1wiLCBcImRhdGVBY2NvcmRcIiwgXCJkYXRlUmV0b3VyXCIsXG4gICAgXCJkYXRlUmVwb25zZVwiLCBcImRhdGVWYWxpZGF0aW9uXCIsXG4gICAgXCJkYXRlQXBwcm9iYXRpb25cIiwgXCJkYXRlUHJpc2VFbkNoYXJnZVwiLFxuICAgIC8qIGFuZ2xhaXMgKi9cbiAgICBcImFwcHJvdmFsX2RhdGVcIiwgXCJhdXRob3JpemF0aW9uX2RhdGVcIixcbiAgICBcImFncmVlbWVudF9kYXRlXCIsIFwiZGVjaXNpb25fZGF0ZVwiLFxuICAgIC8qIGtlYmFiLWNhc2UgKi9cbiAgICBcImRhdGUtcGVjXCIsIFwiZGF0ZS1hY2NvcmRcIiwgXCJkYXRlLXJldG91clwiLFxuICAgIC8qIGRhdGEgYXR0cmlidXRlcyAqL1xuICAgIFwiZGF0YS1kYXRlLXBlY1wiLCBcImRhdGEtZGF0ZS1hY2NvcmRcIixcbiAgICAvKiBFUlAgc3BlY2lmaXF1ZXMgKi9cbiAgICBcImR0X3BlY1wiLCBcImR0X2FjY29yZFwiLCBcImR0X3JldG91clwiLFxuICAgIFwiZGF0ZV9yZXRvdXJfcGVjXCIsIFwiZGF0ZV9yZXRvdXJfYWNjb3JkXCIsXG4gICAgXCJkYXRlX3ByaXNlX2VuX2NoYXJnZVwiLCBcImRhdGVfZGVjaXNpb25cIixcbiAgICBcImRhdGVfZW1pc3Npb25fcGVjXCIsIFwiZGF0ZV9hY2NvcmRfbXV0dWVsbGVcIixcbiAgICAvKiBwbGFjZWhvbGRlcnMgKi9cbiAgICBcImRhdGUgZGUgbGEgcHJpc2UgZW4gY2hhcmdlXCIsXG4gICAgXCJkYXRlIGRlIGwnYWNjb3JkIG11dHVlbGxlXCIsIFwiamovbW0vYWFhYVwiLFxuICBdLFxufTtcblxuLyogXHUyNTAwXHUyNTAwIE5vdGVzIC8gUmVqZXRzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuZXhwb3J0IHZhciBSRUpFVF9OT1RFX0FMSUFTRVMgPSBbXG4gIC8qIGZyYW5jYWlzIHN0YW5kYXJkICovXG4gIFwicmVtYXJxdWVzXCIsIFwibm90ZXNcIiwgXCJjb21tZW50YWlyZVwiLCBcImNvbW1lbnRhaXJlc1wiLFxuICBcIm9ic2VydmF0aW9uc1wiLCBcIm5vdGVcIiwgXCJtZW1vXCIsIFwibm90ZV9pbnRlcm5lXCIsXG4gIFwicmVtYXJxdWVcIiwgXCJpbmZvc19jb21wXCIsXG4gIFwiaW5mb3JtYXRpb25zX2NvbXBsZW1lbnRhaXJlc1wiLCBcIm9ic2VydmF0aW9uXCIsXG4gIFwibm90ZV9wYXRpZW50XCIsIFwiY29tbWVudGFpcmVfZG9zc2llclwiLCBcIm5vdGVzX2Rvc3NpZXJcIixcbiAgLyogY2FtZWxDYXNlIC8gZm9ybUNvbnRyb2xOYW1lICovXG4gIFwibm90ZUludGVybmVcIiwgXCJjb21tZW50YWlyZURvc3NpZXJcIiwgXCJub3Rlc0Rvc3NpZXJcIixcbiAgXCJub3RlUGF0aWVudFwiLCBcImluZm9zQ29tcGxlbWVudGFpcmVzXCIsXG4gIFwiaW5mb3JtYXRpb25zQ29tcGxlbWVudGFpcmVzXCIsIFwicmVtYXJxdWVzRG9zc2llclwiLFxuICAvKiBhbmdsYWlzICovXG4gIFwiY29tbWVudHNcIiwgXCJjb21tZW50XCIsIFwicmVtYXJrXCIsIFwicmVtYXJrc1wiLFxuICBcImludGVybmFsX25vdGVcIiwgXCJjYXNlX25vdGVzXCIsIFwibm90ZXNfZmllbGRcIixcbiAgLyoga2ViYWItY2FzZSAqL1xuICBcIm5vdGUtaW50ZXJuZVwiLCBcImNvbW1lbnRhaXJlLWRvc3NpZXJcIiwgXCJub3Rlcy1kb3NzaWVyXCIsXG4gIC8qIEVSUCBzcGVjaWZpcXVlcyAqL1xuICBcIm5vdGVzX2NsaW5pcXVlc1wiLCBcIm5vdGVfbGlicmVcIiwgXCJ0ZXh0ZV9saWJyZVwiLFxuICBcInpvbmVfY29tbWVudGFpcmVcIiwgXCJ6b25lX25vdGVzXCIsIFwiY2hhbXBfbGlicmVcIixcbiAgXCJub3Rlc19pbnRlcm5lc1wiLCBcIm1lbW9fcGF0aWVudFwiLCBcIm1lbW9fZG9zc2llclwiLFxuICBcImFubm90YXRpb25cIiwgXCJhbm5vdGF0aW9uc1wiLCBcIm1lc3NhZ2VcIixcbiAgXCJkZXNjcmlwdGlvblwiLCBcImRldGFpbFwiLCBcImRldGFpbHNcIixcbiAgXCJtb3RpZlwiLCBcIm1vdGlmX3JlamV0XCIsIFwicmFpc29uXCIsXG4gIFwibm90ZV9yZWpldFwiLCBcImNvbW1lbnRhaXJlX3JlamV0XCIsXG4gIC8qIHBsYWNlaG9sZGVycyAqL1xuICBcImFqb3V0ZXIgdW5lIG5vdGVcIiwgXCJzYWlzaXIgdW4gY29tbWVudGFpcmVcIixcbiAgXCJyZW1hcnF1ZXMgY29tcGxlbWVudGFpcmVzXCIsIFwibm90ZXMgc3VwcGxlbWVudGFpcmVzXCIsXG5dO1xuXG4vKiBcdTI1MDBcdTI1MDAgTWVyZ2UgYWxsIHBhdGllbnQtc2lkZSBhbGlhc2VzIGludG8gb25lIGRpY3QgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRTY3JhcGluZ0FsaWFzZXMoKSB7XG4gIHZhciBtZXJnZWQgPSB7fTtcbiAgdmFyIGRpY3RzID0gW1BBVElFTlRfQUxJQVNFUywgTVVUVUVMTEVfQUxJQVNFUywgT1JET05OQU5DRV9BTElBU0VTLCBPUFRJQ0FMX09EX0FMSUFTRVMsIE9QVElDQUxfT0dfQUxJQVNFU107XG4gIGZvciAodmFyIGQgPSAwOyBkIDwgZGljdHMubGVuZ3RoOyBkKyspIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGljdHNbZF0pIHtcbiAgICAgIG1lcmdlZFtrZXldID0gZGljdHNbZF1ba2V5XS5zbGljZSgpOyAvLyBjb3B5XG4gICAgfVxuICB9XG4gIHJldHVybiBtZXJnZWQ7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBCdWlsZCBQRUMgaW5qZWN0aW9uIGFsaWFzZXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRQZWNBbGlhc2VzKCkge1xuICB2YXIgbWVyZ2VkID0ge307XG4gIGZvciAodmFyIGtleSBpbiBQRUNfQUxJQVNFUykge1xuICAgIG1lcmdlZFtrZXldID0gUEVDX0FMSUFTRVNba2V5XS5zbGljZSgpO1xuICB9XG4gIHJldHVybiBtZXJnZWQ7XG59XG4iLCAiLyogXHUyNTAwXHUyNTAwIE9wdGlCb3QgXHUyMDE0IEVSUCBCcmlkZ2UgQ29yZSBFbmdpbmUgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5cbmltcG9ydCB7IGJ1aWxkU2NyYXBpbmdBbGlhc2VzLCBidWlsZFBlY0FsaWFzZXMsIFJFSkVUX05PVEVfQUxJQVNFUyB9IGZyb20gXCIuL2FsaWFzZXMuanNcIjtcblxuLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gKiAgREVFUCBRVUVSWSAoU2hhZG93IERPTSArIGlmcmFtZXMpXG4gKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cblxuZnVuY3Rpb24gcXVlcnlTZWxlY3RvckFsbERlZXAoc2VsZWN0b3IsIHJvb3QsIGRlcHRoKSB7XG4gIHJvb3QgPSByb290IHx8IGRvY3VtZW50O1xuICBkZXB0aCA9IGRlcHRoIHx8IDA7XG4gIGlmIChkZXB0aCA+IDUpIHJldHVybiBbXTtcbiAgdmFyIHJlc3VsdHMgPSBBcnJheS5mcm9tKHJvb3QucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xuICB2YXIgYWxsID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGwubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYWxsW2ldLnNoYWRvd1Jvb3QpIHtcbiAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChxdWVyeVNlbGVjdG9yQWxsRGVlcChzZWxlY3RvciwgYWxsW2ldLnNoYWRvd1Jvb3QsIGRlcHRoICsgMSkpO1xuICAgIH1cbiAgfVxuICBpZiAocm9vdCA9PT0gZG9jdW1lbnQgJiYgZGVwdGggPT09IDApIHtcbiAgICB2YXIgaWZyYW1lcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpZnJhbWVcIik7XG4gICAgZm9yICh2YXIgZmkgPSAwOyBmaSA8IGlmcmFtZXMubGVuZ3RoOyBmaSsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgaURvYyA9IGlmcmFtZXNbZmldLmNvbnRlbnREb2N1bWVudCB8fCAoaWZyYW1lc1tmaV0uY29udGVudFdpbmRvdyAmJiBpZnJhbWVzW2ZpXS5jb250ZW50V2luZG93LmRvY3VtZW50KTtcbiAgICAgICAgaWYgKGlEb2MpIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdChxdWVyeVNlbGVjdG9yQWxsRGVlcChzZWxlY3RvciwgaURvYywgZGVwdGggKyAxKSk7XG4gICAgICB9IGNhdGNoKGUpIHsgY29uc29sZS5pbmZvKFwiW09wdGlCb3RdIGlmcmFtZSBjcm9zcy1vcmlnaW4gaWdub3JcdTAwRTllIDpcIiwgaWZyYW1lc1tmaV0uc3JjIHx8IFwiKG5vIHNyYylcIik7IH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICogIE5PUk1BTElTQVRJT04gJiBTSUdOQUwgQ09MTEVDVElPTlxuICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG5cbnZhciBfbm9ybWFsaXplQ2FjaGUgPSB7fTtcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUFsaWFzKHN0cikge1xuICB2YXIga2V5ID0gc3RyIHx8IFwiXCI7XG4gIGlmIChfbm9ybWFsaXplQ2FjaGVba2V5XSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gX25vcm1hbGl6ZUNhY2hlW2tleV07XG4gIHZhciByZXN1bHQgPSBrZXlcbiAgICAudG9Mb3dlckNhc2UoKVxuICAgIC5ub3JtYWxpemUoXCJORkRcIikucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIilcbiAgICAucmVwbGFjZSgvW1xcc1xcLV9cXC5cXC9dL2csIFwiXCIpO1xuICBfbm9ybWFsaXplQ2FjaGVba2V5XSA9IHJlc3VsdDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbGxlY3RTaWduYWxzKGVsKSB7XG4gIHZhciBzaWduYWxzID0gW107XG5cbiAgLyogMS4gQXR0cmlidXRzIGRpcmVjdHMgKi9cbiAgdmFyIGRpcmVjdEF0dHJzID0gW1xuICAgIGVsLm5hbWUsIGVsLmlkLCBlbC5wbGFjZWhvbGRlciwgZWwudGl0bGUsXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiYXJpYS1sYWJlbFwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWZpZWxkXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcImRhdGEtbmFtZVwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWxhYmVsXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcImRhdGEtdGVzdGlkXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcImRhdGEtYmluZFwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtleVwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNvbFwiKSxcbiAgICBlbC5nZXRBdHRyaWJ1dGUoXCJmb3JtY29udHJvbG5hbWVcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwibmctcmVmbGVjdC1uYW1lXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcIm5nLW1vZGVsXCIpLFxuICAgIGVsLmdldEF0dHJpYnV0ZShcInYtbW9kZWxcIiksXG4gICAgZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS12di1hc1wiKSxcbiAgICBlbC5jbGFzc05hbWUsXG4gIF07XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyZWN0QXR0cnMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZGlyZWN0QXR0cnNbaV0pIHNpZ25hbHMucHVzaChkaXJlY3RBdHRyc1tpXSk7XG4gIH1cblxuICAvKiAyLiBMYWJlbCB2aWEgZm9yPSAqL1xuICB2YXIgbGFiZWxFbCA9IGVsLmlkID8gKGVsLmdldFJvb3ROb2RlID8gZWwuZ2V0Um9vdE5vZGUoKSA6IGRvY3VtZW50KS5xdWVyeVNlbGVjdG9yKCdsYWJlbFtmb3I9XCInICsgQ1NTLmVzY2FwZShlbC5pZCkgKyAnXCJdJykgOiBudWxsO1xuXG4gIC8qIDMuIGFyaWEtbGFiZWxsZWRieSAqL1xuICBpZiAoIWxhYmVsRWwpIHtcbiAgICB2YXIgbGFiZWxsZWRieSA9IGVsLmdldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxsZWRieVwiKTtcbiAgICBpZiAobGFiZWxsZWRieSkge1xuICAgICAgdmFyIHBhcnRzID0gbGFiZWxsZWRieS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgICB2YXIgcmVmID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICByZXR1cm4gcmVmID8gcmVmLnRleHRDb250ZW50LnRyaW0oKSA6IFwiXCI7XG4gICAgICB9KS5maWx0ZXIoQm9vbGVhbik7XG4gICAgICBpZiAocGFydHMubGVuZ3RoKSBzaWduYWxzLnB1c2gocGFydHMuam9pbihcIiBcIikpO1xuICAgIH1cbiAgfVxuXG4gIC8qIDQuIExhYmVsIHBhcmVudCBvdSBhbmNldHJlICovXG4gIGlmICghbGFiZWxFbCAmJiBlbC5jbG9zZXN0KSB7XG4gICAgbGFiZWxFbCA9IGVsLmNsb3Nlc3QoXCJsYWJlbFwiKTtcbiAgICBpZiAoIWxhYmVsRWwgJiYgZWwucGFyZW50RWxlbWVudCkge1xuICAgICAgbGFiZWxFbCA9IGVsLnBhcmVudEVsZW1lbnQucXVlcnlTZWxlY3RvcihcImxhYmVsXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8qIDUuIFNpYmxpbmcgcHJlY2VkZW50IChsYWJlbCwgc3BhbiwgZGl2LCBwLCB0aCwgdGQsIGR0LCBsZWdlbmQpICovXG4gIGlmICghbGFiZWxFbCkge1xuICAgIHZhciBwcmV2ID0gZWwucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICBpZiAocHJldiAmJiAvXihsYWJlbHxzcGFufGRpdnxwfHRofHRkfGR0fGxlZ2VuZCkkL2kudGVzdChwcmV2LnRhZ05hbWUpICYmIHByZXYudGV4dENvbnRlbnQudHJpbSgpLmxlbmd0aCA8IDYwKSB7XG4gICAgICBzaWduYWxzLnB1c2gocHJldi50ZXh0Q29udGVudC50cmltKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8qIDYuIENlbGx1bGUgZGUgdGFibGVhdSBwcmVjZWRlbnRlICovXG4gIGlmICghbGFiZWxFbCkge1xuICAgIHZhciB0ZCA9IGVsLmNsb3Nlc3QgPyBlbC5jbG9zZXN0KFwidGRcIikgOiBudWxsO1xuICAgIGlmICh0ZCkge1xuICAgICAgdmFyIHByZXZUZCA9IHRkLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XG4gICAgICBpZiAocHJldlRkICYmIHByZXZUZC50ZXh0Q29udGVudC50cmltKCkubGVuZ3RoIDwgNjApIHtcbiAgICAgICAgc2lnbmFscy5wdXNoKHByZXZUZC50ZXh0Q29udGVudC50cmltKCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qIDcuIFdyYXBwZXIgZGl2L3NwYW4gYXZlYyBjbGFzcyBjb250ZW5hbnQgZmllbGQsIGZvcm0tZ3JvdXAsIGlucHV0LWdyb3VwICovXG4gIGlmICghbGFiZWxFbCkge1xuICAgIHZhciB3cmFwcGVyID0gZWwuY2xvc2VzdCA/IGVsLmNsb3Nlc3QoXCIuZm9ybS1ncm91cCwgLmZpZWxkLCAuaW5wdXQtZ3JvdXAsIC5mb3JtLWZpZWxkLCAuZmllbGQtcm93LCAuZm9ybS1yb3dcIikgOiBudWxsO1xuICAgIGlmICh3cmFwcGVyKSB7XG4gICAgICB2YXIgd3JhcHBlckxhYmVsID0gd3JhcHBlci5xdWVyeVNlbGVjdG9yKFwibGFiZWwsIC5sYWJlbCwgLmZpZWxkLWxhYmVsLCAuZm9ybS1sYWJlbCwgbGVnZW5kXCIpO1xuICAgICAgaWYgKHdyYXBwZXJMYWJlbCAmJiB3cmFwcGVyTGFiZWwudGV4dENvbnRlbnQudHJpbSgpLmxlbmd0aCA8IDYwKSB7XG4gICAgICAgIHNpZ25hbHMucHVzaCh3cmFwcGVyTGFiZWwudGV4dENvbnRlbnQudHJpbSgpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpZiAobGFiZWxFbCkgc2lnbmFscy5wdXNoKGxhYmVsRWwudGV4dENvbnRlbnQudHJpbSgpKTtcblxuICAvKiA4LiBkYXRhLSogYXR0cmlidXRzIHN1cHBsZW1lbnRhaXJlcyAqL1xuICBpZiAoZWwuZGF0YXNldCkge1xuICAgIHZhciBkYXRhS2V5cyA9IE9iamVjdC5rZXlzKGVsLmRhdGFzZXQpO1xuICAgIGZvciAodmFyIGRrID0gMDsgZGsgPCBkYXRhS2V5cy5sZW5ndGg7IGRrKyspIHtcbiAgICAgIHZhciBkdiA9IGVsLmRhdGFzZXRbZGF0YUtleXNbZGtdXTtcbiAgICAgIGlmIChkdiAmJiB0eXBlb2YgZHYgPT09IFwic3RyaW5nXCIgJiYgZHYubGVuZ3RoID4gMiAmJiBkdi5sZW5ndGggPCA1MCkge1xuICAgICAgICBzaWduYWxzLnB1c2goZHYpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzaWduYWxzO1xufVxuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICBGSUVMRCBNQVRDSElOR1xuICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtYXRjaEZpZWxkQWdhaW5zdChlbCwgYWxpYXNEaWN0KSB7XG4gIHZhciBzaWduYWxzID0gY29sbGVjdFNpZ25hbHMoZWwpO1xuICB2YXIgbm9ybWFsaXplZFNpZ25hbHMgPSBzaWduYWxzLm1hcChub3JtYWxpemVBbGlhcykuam9pbihcIiBcIik7XG5cbiAgdmFyIGJlc3RGaWVsZCA9IG51bGw7XG4gIHZhciBiZXN0U2NvcmUgPSAwO1xuXG4gIGZvciAodmFyIGZpZWxkIGluIGFsaWFzRGljdCkge1xuICAgIHZhciBhbGlhc2VzID0gYWxpYXNEaWN0W2ZpZWxkXTtcbiAgICBmb3IgKHZhciBhID0gMDsgYSA8IGFsaWFzZXMubGVuZ3RoOyBhKyspIHtcbiAgICAgIHZhciBub3JtID0gbm9ybWFsaXplQWxpYXMoYWxpYXNlc1thXSk7XG4gICAgICBpZiAobm9ybWFsaXplZFNpZ25hbHMuaW5kZXhPZihub3JtKSAhPT0gLTEpIHtcbiAgICAgICAgdmFyIHNjb3JlID0gbm9ybS5sZW5ndGg7XG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xuICAgICAgICAgIGJlc3RGaWVsZCA9IGZpZWxkO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJlc3RGaWVsZDtcbn1cblxuLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gKiAgQUxJQVNFUyAobGF6eSBpbml0ICsgbGVhcm5lZCBtZXJnZSlcbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuXG52YXIgX3NjcmFwaW5nQWxpYXNlcyA9IG51bGw7XG52YXIgX3BlY0FsaWFzZXMgPSBudWxsO1xudmFyIF9hdXRvRGV0ZWN0aW9uQWN0aXZlID0gZmFsc2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY3JhcGluZ0FsaWFzZXMoKSB7XG4gIGlmICghX3NjcmFwaW5nQWxpYXNlcykgX3NjcmFwaW5nQWxpYXNlcyA9IGJ1aWxkU2NyYXBpbmdBbGlhc2VzKCk7XG4gIHJldHVybiBfc2NyYXBpbmdBbGlhc2VzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UGVjQWxpYXNlcygpIHtcbiAgaWYgKCFfcGVjQWxpYXNlcykgX3BlY0FsaWFzZXMgPSBidWlsZFBlY0FsaWFzZXMoKTtcbiAgcmV0dXJuIF9wZWNBbGlhc2VzO1xufVxuXG5mdW5jdGlvbiBtZXJnZUFkYXB0ZXJBbGlhc2VzKGFkYXB0ZXIpIHtcbiAgaWYgKCFhZGFwdGVyLmFsaWFzZXMpIHJldHVybjtcbiAgdmFyIGRpY3QgPSBnZXRTY3JhcGluZ0FsaWFzZXMoKTtcbiAgZm9yICh2YXIgZmllbGQgaW4gYWRhcHRlci5hbGlhc2VzKSB7XG4gICAgaWYgKCFkaWN0W2ZpZWxkXSkgZGljdFtmaWVsZF0gPSBbXTtcbiAgICB2YXIgZXh0cmFzID0gYWRhcHRlci5hbGlhc2VzW2ZpZWxkXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4dHJhcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGRpY3RbZmllbGRdLmluZGV4T2YoZXh0cmFzW2ldKSA9PT0gLTEpIGRpY3RbZmllbGRdLnB1c2goZXh0cmFzW2ldKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFhZGFwdGVyLnBlY0FsaWFzZXMpIHJldHVybjtcbiAgdmFyIHBlYyA9IGdldFBlY0FsaWFzZXMoKTtcbiAgZm9yICh2YXIgcGYgaW4gYWRhcHRlci5wZWNBbGlhc2VzKSB7XG4gICAgaWYgKCFwZWNbcGZdKSBwZWNbcGZdID0gW107XG4gICAgdmFyIHBlID0gYWRhcHRlci5wZWNBbGlhc2VzW3BmXTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHBlLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZiAocGVjW3BmXS5pbmRleE9mKHBlW2pdKSA9PT0gLTEpIHBlY1twZl0ucHVzaChwZVtqXSk7XG4gICAgfVxuICB9XG59XG5cbi8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICogIExFQVJORUQgQUxJQVNFU1xuICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkTGVhcm5lZEFsaWFzZXMoYWRhcHRlcikge1xuICB2YXIgaG9zdG5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWU7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2xlYXJuZWRfYWxpYXNlc19lcnBcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBjYWNoZWQgPSByZXN1bHQub3B0aWJvdF9sZWFybmVkX2FsaWFzZXNfZXJwO1xuICAgIGlmIChjYWNoZWQgJiYgY2FjaGVkLnRzICYmIERhdGUubm93KCkgLSBjYWNoZWQudHMgPCA2MCAqIDYwICogMTAwMCkge1xuICAgICAgbWVyZ2VMZWFybmVkSW50b0RpY3QoY2FjaGVkLmFsaWFzZXMgfHwge30pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBnZXRTeW5jVG9rZW4oKS50aGVuKGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICBpZiAoIXRva2VuKSByZXR1cm47XG4gICAgICBmZXRjaChcImh0dHBzOi8vb3B0aWJvdC5mci9hcGkvZXh0ZW5zaW9uL3NtYXJ0LWZpbGwvYWxpYXNlcz9ob3N0bmFtZT1cIiArIGVuY29kZVVSSUNvbXBvbmVudChob3N0bmFtZSkpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHIuanNvbigpOyB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIGFsaWFzZXMgPSBkYXRhLmFsaWFzZXMgfHwge307XG4gICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgb3B0aWJvdF9sZWFybmVkX2FsaWFzZXNfZXJwOiB7IGFsaWFzZXM6IGFsaWFzZXMsIHRzOiBEYXRlLm5vdygpIH0gfSk7XG4gICAgICAgICAgbWVyZ2VMZWFybmVkSW50b0RpY3QoYWxpYXNlcyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIGxlYXJuZWQgYWxpYXNlcyBmZXRjaCBmYWlsZWQ6XCIsIGVycik7IH0pO1xuICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VMZWFybmVkSW50b0RpY3QobGVhcm5lZCkge1xuICB2YXIgc2NyYXBlID0gZ2V0U2NyYXBpbmdBbGlhc2VzKCk7XG4gIHZhciBwZWMgPSBnZXRQZWNBbGlhc2VzKCk7XG4gIGZvciAodmFyIGxhYmVsIGluIGxlYXJuZWQpIHtcbiAgICB2YXIgZmllbGQgPSBsZWFybmVkW2xhYmVsXTtcbiAgICBpZiAoc2NyYXBlW2ZpZWxkXSAmJiBzY3JhcGVbZmllbGRdLmluZGV4T2YobGFiZWwpID09PSAtMSkgc2NyYXBlW2ZpZWxkXS5wdXNoKGxhYmVsKTtcbiAgICBpZiAocGVjW2ZpZWxkXSAmJiBwZWNbZmllbGRdLmluZGV4T2YobGFiZWwpID09PSAtMSkgcGVjW2ZpZWxkXS5wdXNoKGxhYmVsKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VuZExlYXJuU2lnbmFsKGhvc3RuYW1lLCBzZWxlY3RvciwgbGFiZWwsIG9sZFZhcmlhYmxlKSB7XG4gIGdldFN5bmNUb2tlbigpLnRoZW4oZnVuY3Rpb24oc3luY1Rva2VuKSB7XG4gICAgaWYgKCFzeW5jVG9rZW4pIHJldHVybjtcbiAgICBmZXRjaChcImh0dHBzOi8vb3B0aWJvdC5mci9hcGkvZXh0ZW5zaW9uL3NtYXJ0LWZpbGwvbGVhcm5cIiwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3luY1Rva2VuOiBzeW5jVG9rZW4sIGhvc3RuYW1lOiBob3N0bmFtZSwgc2VsZWN0b3I6IHNlbGVjdG9yLCBsYWJlbDogbGFiZWwsIG9sZFZhcmlhYmxlOiBvbGRWYXJpYWJsZSB9KVxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gbGVhcm4gc2lnbmFsIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gIH0pO1xufVxuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICBTTUFSVCBTQ1JBUEVcbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuXG52YXIgSU5QVVRfU0VMRUNUT1IgPSBcImlucHV0Om5vdChbdHlwZT1oaWRkZW5dKTpub3QoW3R5cGU9c3VibWl0XSk6bm90KFt0eXBlPWJ1dHRvbl0pOm5vdChbdHlwZT1jaGVja2JveF0pOm5vdChbdHlwZT1yYWRpb10pOm5vdChbdHlwZT1maWxlXSk6bm90KFt0eXBlPWltYWdlXSk6bm90KFt0eXBlPXJlc2V0XSksIHNlbGVjdCwgdGV4dGFyZWFcIjtcblxuZnVuY3Rpb24gcXVlcnlJbnB1dHMoYWRhcHRlcikge1xuICB2YXIgc2VsID0gYWRhcHRlci5pbnB1dFNlbGVjdG9yIHx8IElOUFVUX1NFTEVDVE9SO1xuICByZXR1cm4gcXVlcnlTZWxlY3RvckFsbERlZXAoc2VsKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNtYXJ0U2NyYXBlKGFkYXB0ZXIpIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICB2YXIgZGljdCA9IGdldFNjcmFwaW5nQWxpYXNlcygpO1xuICB2YXIgc2NhblN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cbiAgLyogSG9vayBwcmUtc2NyYXBlICovXG4gIGlmIChhZGFwdGVyLmJlZm9yZVNjcmFwZSkge1xuICAgIHRyeSB7IGFkYXB0ZXIuYmVmb3JlU2NyYXBlKCk7IH0gY2F0Y2goZSkge31cbiAgfVxuXG4gIC8qIDEuIElucHV0cyByZW1wbGlzICovXG4gIHZhciBpbnB1dHMgPSBxdWVyeUlucHV0cyhhZGFwdGVyKTtcblxuICAvKiBQcmUtY2FjaGUgbGFiZWxzICovXG4gIHZhciBsYWJlbE1hcCA9IHt9O1xuICB2YXIgbGFiZWxzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcImxhYmVsW2Zvcl1cIik7XG4gIGZvciAodmFyIGxpID0gMDsgbGkgPCBsYWJlbHMubGVuZ3RoOyBsaSsrKSB7XG4gICAgdmFyIGZvcklkID0gbGFiZWxzW2xpXS5nZXRBdHRyaWJ1dGUoXCJmb3JcIik7XG4gICAgaWYgKGZvcklkKSBsYWJlbE1hcFtmb3JJZF0gPSBsYWJlbHNbbGldLnRleHRDb250ZW50LnRyaW0oKTtcbiAgfVxuXG4gIHZhciBDSFVOS19TSVpFID0gNDA7XG4gIGZvciAodmFyIGNodW5rU3RhcnQgPSAwOyBjaHVua1N0YXJ0IDwgaW5wdXRzLmxlbmd0aDsgY2h1bmtTdGFydCArPSBDSFVOS19TSVpFKSB7XG4gICAgdmFyIGNodW5rRW5kID0gTWF0aC5taW4oY2h1bmtTdGFydCArIENIVU5LX1NJWkUsIGlucHV0cy5sZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaSA9IGNodW5rU3RhcnQ7IGkgPCBjaHVua0VuZDsgaSsrKSB7XG4gICAgICB2YXIgZWwgPSBpbnB1dHNbaV07XG4gICAgICB2YXIgdmFsO1xuICAgICAgaWYgKGVsLnRhZ05hbWUgPT09IFwiU0VMRUNUXCIpIHtcbiAgICAgICAgdmFsID0gKGVsLm9wdGlvbnNbZWwuc2VsZWN0ZWRJbmRleF0gfHwge30pLnRleHQgfHwgZWwudmFsdWUgfHwgXCJcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IGVsLnZhbHVlIHx8IFwiXCI7XG4gICAgICB9XG4gICAgICB2YWwgPSB2YWwudHJpbSgpO1xuICAgICAgaWYgKCF2YWwgfHwgdmFsLmxlbmd0aCA+IDIwMCkgY29udGludWU7XG5cbiAgICAgIHZhciBmaWVsZCA9IG1hdGNoRmllbGRBZ2FpbnN0KGVsLCBkaWN0KTtcbiAgICAgIGlmIChmaWVsZCAmJiAhcmVzdWx0W2ZpZWxkXSkge1xuICAgICAgICByZXN1bHRbZmllbGRdID0gYWRhcHRlci50cmFuc2Zvcm1WYWx1ZSA/IGFkYXB0ZXIudHJhbnNmb3JtVmFsdWUoZmllbGQsIHZhbCwgZWwpIDogdmFsO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjaHVua0VuZCA8IGlucHV0cy5sZW5ndGgpIHtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHIpIHsgc2V0VGltZW91dChyLCAwKTsgfSk7XG4gICAgfVxuICB9XG5cbiAgLyogMi4gQ29udGVuZXVycyByZWFkLW9ubHkgKi9cbiAgdmFyIHJvU2VsID0gYWRhcHRlci5yZWFkT25seVNlbGVjdG9ycyB8fCBcImRkLCAuZmllbGQtdmFsdWUsIFtjbGFzcyo9dmFsdWVdLCBbY2xhc3MqPWRpc3BsYXldLCBbZGF0YS1maWVsZF0sIHNwYW4ucmVhZG9ubHksIC5mb3JtLWNvbnRyb2wtcGxhaW50ZXh0XCI7XG4gIHZhciBjb250YWluZXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChyb1NlbCk7XG4gIGZvciAodmFyIHQgPSAwOyB0IDwgY29udGFpbmVycy5sZW5ndGg7IHQrKykge1xuICAgIHZhciBjb250YWluZXIgPSBjb250YWluZXJzW3RdO1xuICAgIHZhciB0ZXh0ID0gKGNvbnRhaW5lci50ZXh0Q29udGVudCB8fCBcIlwiKS50cmltKCk7XG4gICAgaWYgKCF0ZXh0IHx8IHRleHQubGVuZ3RoID4gMjAwIHx8IHRleHQubGVuZ3RoIDwgMSkgY29udGludWU7XG4gICAgdmFyIGNmID0gbWF0Y2hGaWVsZEFnYWluc3QoY29udGFpbmVyLCBkaWN0KTtcbiAgICBpZiAoY2YgJiYgIXJlc3VsdFtjZl0pIHtcbiAgICAgIHJlc3VsdFtjZl0gPSBhZGFwdGVyLnRyYW5zZm9ybVZhbHVlID8gYWRhcHRlci50cmFuc2Zvcm1WYWx1ZShjZiwgdGV4dCwgY29udGFpbmVyKSA6IHRleHQ7XG4gICAgfVxuICB9XG5cbiAgdmFyIHNjYW5EdXJhdGlvbiA9IE1hdGgucm91bmQocGVyZm9ybWFuY2Uubm93KCkgLSBzY2FuU3RhcnQpO1xuICBpZiAoc2NhbkR1cmF0aW9uID4gNTAwKSB7XG4gICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3RdIEVSUCBzY2FuOiBcIiArIGlucHV0cy5sZW5ndGggKyBcIiBmaWVsZHMgaW4gXCIgKyBzY2FuRHVyYXRpb24gKyBcIm1zXCIpO1xuICB9XG5cbiAgLyogSG9vayBwb3N0LXNjcmFwZSAqL1xuICBpZiAoYWRhcHRlci5hZnRlclNjcmFwZSkge1xuICAgIHRyeSB7IGFkYXB0ZXIuYWZ0ZXJTY3JhcGUocmVzdWx0KTsgfSBjYXRjaChlKSB7fVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGlzUGF0aWVudFBhZ2UoYWRhcHRlcikge1xuICAvKiBJbmRpY2F0ZXVycyByYXBpZGVzICovXG4gIGlmIChhZGFwdGVyLnBhdGllbnRQYWdlSW5kaWNhdG9ycyAmJiBhZGFwdGVyLnBhdGllbnRQYWdlSW5kaWNhdG9ycy5sZW5ndGgpIHtcbiAgICBmb3IgKHZhciBwID0gMDsgcCA8IGFkYXB0ZXIucGF0aWVudFBhZ2VJbmRpY2F0b3JzLmxlbmd0aDsgcCsrKSB7XG4gICAgICBpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihhZGFwdGVyLnBhdGllbnRQYWdlSW5kaWNhdG9yc1twXSkpIHtcbiAgICAgICAgdmFyIHNjcmFwZWQgPSBhd2FpdCBzbWFydFNjcmFwZShhZGFwdGVyKTtcbiAgICAgICAgcmV0dXJuIHsgaXNQYXRpZW50OiB0cnVlLCBkYXRhOiBzY3JhcGVkLCBmaWVsZENvdW50OiBPYmplY3Qua2V5cyhzY3JhcGVkKS5sZW5ndGggfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLyogRmFsbGJhY2sgOiBub21icmUgZGUgY2hhbXBzICovXG4gIHZhciBkYXRhID0gYXdhaXQgc21hcnRTY3JhcGUoYWRhcHRlcik7XG4gIHZhciBjb3VudCA9IE9iamVjdC5rZXlzKGRhdGEpLmxlbmd0aDtcbiAgdmFyIG1pbiA9IGFkYXB0ZXIubWluRmllbGRzRm9yUGF0aWVudFBhZ2UgfHwgMztcbiAgcmV0dXJuIHsgaXNQYXRpZW50OiBjb3VudCA+PSBtaW4sIGRhdGE6IGRhdGEsIGZpZWxkQ291bnQ6IGNvdW50IH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwZXJmb3JtU2NyYXBlKGFkYXB0ZXIpIHtcbiAgdmFyIGNoZWNrID0gYXdhaXQgaXNQYXRpZW50UGFnZShhZGFwdGVyKTtcbiAgaWYgKCFjaGVjay5pc1BhdGllbnQpIHJldHVybjtcblxuICB2YXIgcyA9IGNoZWNrLmRhdGE7XG4gIHZhciBjYWNoZU9iaiA9IHtcbiAgICBjdXJyZW50OiB7XG4gICAgICBub206IChzLm5vbSB8fCBcIlwiKS50b1VwcGVyQ2FzZSgpLFxuICAgICAgcHJlbm9tOiBzLnByZW5vbSB8fCBcIlwiLFxuICAgICAgbnVtZXJvU2VjdXJpdGVTb2NpYWxlOiBzLm51bWVyb1NlY3VyaXRlU29jaWFsZSB8fCBcIlwiLFxuICAgICAgZGF0ZU5haXNzYW5jZTogcy5kYXRlTmFpc3NhbmNlIHx8IFwiXCIsXG4gICAgICB0ZWxlcGhvbmU6IHMudGVsZXBob25lIHx8IFwiXCIsXG4gICAgICBlbWFpbDogcy5lbWFpbCB8fCBcIlwiLFxuICAgICAgYWRyZXNzZTogcy5hZHJlc3NlIHx8IFwiXCIsXG4gICAgICBjb2RlUG9zdGFsOiBzLmNvZGVQb3N0YWwgfHwgXCJcIixcbiAgICAgIHZpbGxlOiBzLnZpbGxlIHx8IFwiXCIsXG4gICAgICBjaXZpbGl0ZTogcy5jaXZpbGl0ZSB8fCBcIlwiLFxuICAgICAgb3JnYW5pc21lOiBzLm9yZ2FuaXNtZSB8fCBcIlwiLFxuICAgICAgbnVtZXJvQWRoZXJlbnQ6IHMubnVtZXJvQWRoZXJlbnQgfHwgXCJcIixcbiAgICAgIGNvZGVPcmdhbmlzbWU6IHMuY29kZU9yZ2FuaXNtZSB8fCBcIlwiLFxuICAgICAgb3Jkb25uYW5jZToge1xuICAgICAgICBycHBzOiBzLnJwcHMgfHwgXCJcIixcbiAgICAgICAgbm9tT3BodGFsbW9sb2d1ZTogcy5ub21PcGh0YWxtb2xvZ3VlIHx8IFwiXCIsXG4gICAgICAgIGRhdGVPcmRvbm5hbmNlOiBzLmRhdGVPcmRvbm5hbmNlIHx8IFwiXCIsXG4gICAgICAgIGx1bmV0dGVzT0Q6IHtcbiAgICAgICAgICBzcGhlcmU6ICAgc1tcImx1bmV0dGVzT0Quc3BoZXJlXCJdICAgfHwgXCJcIixcbiAgICAgICAgICBjeWxpbmRyZTogc1tcImx1bmV0dGVzT0QuY3lsaW5kcmVcIl0gfHwgXCJcIixcbiAgICAgICAgICBheGU6ICAgICAgc1tcImx1bmV0dGVzT0QuYXhlXCJdICAgICAgfHwgXCJcIixcbiAgICAgICAgICBhZGRpdGlvbjogc1tcImx1bmV0dGVzT0QuYWRkaXRpb25cIl0gfHwgXCJcIixcbiAgICAgICAgfSxcbiAgICAgICAgbHVuZXR0ZXNPRzoge1xuICAgICAgICAgIHNwaGVyZTogICBzW1wibHVuZXR0ZXNPRy5zcGhlcmVcIl0gICB8fCBcIlwiLFxuICAgICAgICAgIGN5bGluZHJlOiBzW1wibHVuZXR0ZXNPRy5jeWxpbmRyZVwiXSB8fCBcIlwiLFxuICAgICAgICAgIGF4ZTogICAgICBzW1wibHVuZXR0ZXNPRy5heGVcIl0gICAgICB8fCBcIlwiLFxuICAgICAgICAgIGFkZGl0aW9uOiBzW1wibHVuZXR0ZXNPRy5hZGRpdGlvblwiXSB8fCBcIlwiLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHNvdXJjZTogYWRhcHRlci5uYW1lLFxuICAgICAgc2NyYXBlZEF0OiBEYXRlLm5vdygpLFxuICAgIH1cbiAgfTtcblxuICBhd2FpdCB3cml0ZUVuY3J5cHRlZENhY2hlKGNhY2hlT2JqKTtcblxuICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZSh7IHR5cGU6IFwiT1BUSUJPVF9DT1NJVU1fU0NSQVBFRFwiLCBmaWVsZHM6IGNoZWNrLmZpZWxkQ291bnQgfSk7XG4gIHNob3dUb2FzdChcIkVSUCBcXHUyNzEzIFx1MjAxNCBcIiArIGNoZWNrLmZpZWxkQ291bnQgKyBcIiBjaGFtcHMgbHVzXCIsIFwic3VjY2Vzc1wiLCBhZGFwdGVyKTtcbn1cblxuLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gKiAgUEVDIElOSkVDVElPTlxuICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbmplY3RQRUMoZW5jcnlwdGVkUGVjLCBhZGFwdGVyKSB7XG4gIHZhciBwZWMgPSBhd2FpdCBkZWNyeXB0RGF0YShlbmNyeXB0ZWRQZWMpO1xuICBpZiAoIXBlYykgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogXCJkZWNyeXB0X2ZhaWxlZFwiIH07XG5cbiAgdmFyIHBlY0RpY3QgPSBnZXRQZWNBbGlhc2VzKCk7XG4gIHZhciBpbnB1dHMgPSBxdWVyeUlucHV0cyhhZGFwdGVyKTtcbiAgdmFyIGZpbGxlZCA9IDA7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZWwgPSBpbnB1dHNbaV07XG4gICAgdmFyIGZpZWxkID0gbWF0Y2hGaWVsZEFnYWluc3QoZWwsIHBlY0RpY3QpO1xuICAgIGlmIChmaWVsZCAmJiBwZWNbZmllbGRdKSB7XG4gICAgICB1bHRyYUZpbGwoZWwsIHBlY1tmaWVsZF0sIGFkYXB0ZXIpO1xuICAgICAgZWwuc2V0QXR0cmlidXRlKFwiZGF0YS1vcHRpYm90LWZpbGxlZFwiLCBmaWVsZCk7XG4gICAgICBlbC5zZXRBdHRyaWJ1dGUoXCJkYXRhLW9wdGlib3QtdmFsdWVcIiwgcGVjW2ZpZWxkXSk7XG4gICAgICBmaWxsZWQrKztcbiAgICB9XG4gIH1cblxuICBpZiAoZmlsbGVkID4gMCkge1xuICAgIHNob3dUb2FzdChcIlBFQyBpbmplY3RcXHUwMEU5ZSBcXHUyNzEzIFx1MjAxNCBcIiArIGZpbGxlZCArIFwiIGNoYW1wKHMpXCIsIFwic3VjY2Vzc1wiLCBhZGFwdGVyKTtcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoXCJvcHRpYm90X3BlY19wZW5kaW5nXCIpO1xuICAgIHJldHVybiB7IG9rOiB0cnVlLCBmaWxsZWQ6IGZpbGxlZCB9O1xuICB9XG4gIHNob3dUb2FzdChcIkF1Y3VuIGNoYW1wIFBFQyBkXFx1MDBFOXRlY3RcXHUwMEU5IHN1ciBjZXR0ZSBwYWdlXCIsIFwid2FyblwiLCBhZGFwdGVyKTtcbiAgcmV0dXJuIHsgb2s6IGZhbHNlLCBlcnJvcjogXCJub19maWVsZHNcIiB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5qZWN0UmVqZXROb3RlKG5vdGVUZXh0LCBhZGFwdGVyKSB7XG4gIHZhciBpbnB1dHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwidGV4dGFyZWEsIGlucHV0W3R5cGU9dGV4dF1cIik7XG4gIHZhciB0YXJnZXQgPSBudWxsO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGVsID0gaW5wdXRzW2ldO1xuICAgIHZhciBzaWduYWxzID0gY29sbGVjdFNpZ25hbHMoZWwpO1xuICAgIHZhciBub3JtYWxpemVkU2lnbmFscyA9IHNpZ25hbHMubWFwKG5vcm1hbGl6ZUFsaWFzKS5qb2luKFwiIFwiKTtcbiAgICBmb3IgKHZhciBhID0gMDsgYSA8IFJFSkVUX05PVEVfQUxJQVNFUy5sZW5ndGg7IGErKykge1xuICAgICAgaWYgKG5vcm1hbGl6ZWRTaWduYWxzLmluZGV4T2Yobm9ybWFsaXplQWxpYXMoUkVKRVRfTk9URV9BTElBU0VTW2FdKSkgIT09IC0xKSB7XG4gICAgICAgIHRhcmdldCA9IGVsO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRhcmdldCkgYnJlYWs7XG4gIH1cblxuICBpZiAodGFyZ2V0KSB7XG4gICAgdmFyIGV4aXN0aW5nID0gdGFyZ2V0LnZhbHVlIHx8IFwiXCI7XG4gICAgdmFyIHNlcCA9IGV4aXN0aW5nID8gXCJcXG4tLS1cXG5cIiA6IFwiXCI7XG4gICAgdWx0cmFGaWxsKHRhcmdldCwgZXhpc3RpbmcgKyBzZXAgKyBub3RlVGV4dCwgYWRhcHRlcik7XG4gICAgc2hvd1RvYXN0KFwiTm90ZSByZWpldCBham91dFxcdTAwRTllIGRhbnMgbGUgZG9zc2llclwiLCBcInN1Y2Nlc3NcIiwgYWRhcHRlcik7XG4gIH0gZWxzZSB7XG4gICAgc2hvd1RvYXN0KFwiUmVqZXQgU1xcdTAwRTljdSA6IFwiICsgbm90ZVRleHQuc3Vic3RyaW5nKDAsIDgwKSwgXCJ3YXJuXCIsIGFkYXB0ZXIpO1xuICB9XG59XG5cbi8qIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFxuICogIFVMVFJBIEZJTEwgXHUyMDE0IEZyYW1ld29yay1hd2FyZSB2YWx1ZSBpbmplY3Rpb25cbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdWx0cmFGaWxsKGVsLCB2YWwsIGFkYXB0ZXIpIHtcbiAgZWwuZm9jdXMoKTtcbiAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJmb2N1c1wiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuXG4gIC8qIFNlbGVjdCBlbGVtZW50ICovXG4gIGlmIChlbC50YWdOYW1lID09PSBcIlNFTEVDVFwiKSB7XG4gICAgdmFyIGJlc3QgPSBudWxsO1xuICAgIHZhciBiZXN0RGlzdCA9IEluZmluaXR5O1xuICAgIHZhciB0YXJnZXQgPSAodmFsIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIGZvciAodmFyIG9pID0gMDsgb2kgPCBlbC5vcHRpb25zLmxlbmd0aDsgb2krKykge1xuICAgICAgdmFyIG9wdFRleHQgPSAoZWwub3B0aW9uc1tvaV0udGV4dCB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgIHZhciBvcHRWYWwgPSAoZWwub3B0aW9uc1tvaV0udmFsdWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICBpZiAob3B0VGV4dCA9PT0gdGFyZ2V0IHx8IG9wdFZhbCA9PT0gdGFyZ2V0KSB7IGJlc3QgPSBvaTsgYnJlYWs7IH1cbiAgICAgIGlmIChvcHRUZXh0LmluZGV4T2YodGFyZ2V0KSAhPT0gLTEgfHwgdGFyZ2V0LmluZGV4T2Yob3B0VGV4dCkgIT09IC0xKSB7XG4gICAgICAgIHZhciBkaXN0ID0gTWF0aC5hYnMob3B0VGV4dC5sZW5ndGggLSB0YXJnZXQubGVuZ3RoKTtcbiAgICAgICAgaWYgKGRpc3QgPCBiZXN0RGlzdCkgeyBiZXN0RGlzdCA9IGRpc3Q7IGJlc3QgPSBvaTsgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoYmVzdCAhPT0gbnVsbCkge1xuICAgICAgZWwuc2VsZWN0ZWRJbmRleCA9IGJlc3Q7XG4gICAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImNoYW5nZVwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgICAgZWwuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xuICAgIH1cbiAgICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImJsdXJcIiwgeyBidWJibGVzOiB0cnVlIH0pKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKiBOYXRpdmUgcHJvcGVydHkgc2V0dGVyIChSZWFjdC9Bbmd1bGFyL1Z1ZSkgKi9cbiAgdmFyIHByb3RvID0gZWwudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiID8gSFRNTFRleHRBcmVhRWxlbWVudC5wcm90b3R5cGUgOiBIVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZTtcbiAgdmFyIG5hdGl2ZVNldHRlciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIFwidmFsdWVcIik7XG4gIGlmIChuYXRpdmVTZXR0ZXIgJiYgbmF0aXZlU2V0dGVyLnNldCkge1xuICAgIG5hdGl2ZVNldHRlci5zZXQuY2FsbChlbCwgdmFsKTtcbiAgfSBlbHNlIHtcbiAgICBlbC52YWx1ZSA9IHZhbDtcbiAgfVxuXG4gIC8qIEV2ZW50cyAqL1xuICBlbC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImlucHV0XCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gIGVsLmRpc3BhdGNoRXZlbnQobmV3IElucHV0RXZlbnQoXCJpbnB1dFwiLCB7IGJ1YmJsZXM6IHRydWUsIGRhdGE6IHZhbCwgaW5wdXRUeXBlOiBcImluc2VydFRleHRcIiB9KSk7XG4gIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiY2hhbmdlXCIsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gIGVsLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwiYmx1clwiLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xufVxuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICBUT0FTVFxuICogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93VG9hc3QobWVzc2FnZSwgdHlwZSwgYWRhcHRlcikge1xuICB2YXIgZXhpc3RpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm9wdGlib3QtZXJwLXRvYXN0XCIpO1xuICBpZiAoZXhpc3RpbmcpIGV4aXN0aW5nLnJlbW92ZSgpO1xuXG4gIHZhciBwcmVmaXggPSBhZGFwdGVyICYmIGFkYXB0ZXIuZGlzcGxheU5hbWUgPyBhZGFwdGVyLmRpc3BsYXlOYW1lICsgXCIgXHUyMDE0IFwiIDogXCJcIjtcbiAgdmFyIHRvYXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgdG9hc3QuaWQgPSBcIm9wdGlib3QtZXJwLXRvYXN0XCI7XG4gIHRvYXN0LnRleHRDb250ZW50ID0gcHJlZml4ICsgbWVzc2FnZTtcbiAgdmFyIGJnID0gdHlwZSA9PT0gXCJzdWNjZXNzXCIgPyBcIiMwNTk2NjlcIiA6IHR5cGUgPT09IFwid2FyblwiID8gXCIjZDk3NzA2XCIgOiBcIiNkYzI2MjZcIjtcbiAgdG9hc3Quc3R5bGUuY3NzVGV4dCA9IFwicG9zaXRpb246Zml4ZWQ7Ym90dG9tOjI0cHg7cmlnaHQ6MjRweDt6LWluZGV4OjIxNDc0ODM2NDc7YmFja2dyb3VuZDpcIiArIGJnICsgXCI7Y29sb3I6d2hpdGU7cGFkZGluZzoxMnB4IDIwcHg7Ym9yZGVyLXJhZGl1czoxMnB4O2ZvbnQ6NzAwIDEzcHgvMS40IC1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LHNhbnMtc2VyaWY7Ym94LXNoYWRvdzowIDhweCAyNHB4IHJnYmEoMCwwLDAsLjE1KTtvcGFjaXR5OjA7dHJhbnNpdGlvbjpvcGFjaXR5IC4zcyBlYXNlO1wiO1xuXG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodG9hc3QpO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnVuY3Rpb24oKSB7IHRvYXN0LnN0eWxlLm9wYWNpdHkgPSBcIjFcIjsgfSk7XG4gIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgdG9hc3Quc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRvYXN0LnJlbW92ZSgpOyB9LCAzMDApO1xuICB9LCA0MDAwKTtcbn1cblxuLyogXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXHUyNTUwXG4gKiAgQVVUTy1ERVRFQ1RJT04gJiBQQVNTSVZFIExFQVJOSU5HXG4gKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTAgKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwQXV0b0RldGVjdGlvbihhZGFwdGVyKSB7XG4gIGlmIChfYXV0b0RldGVjdGlvbkFjdGl2ZSkgcmV0dXJuO1xuICBfYXV0b0RldGVjdGlvbkFjdGl2ZSA9IHRydWU7XG5cbiAgdmFyIHNjcmFwZVRpbWVyID0gbnVsbDtcbiAgdmFyIGxhc3RTY3JhcGVVcmwgPSBudWxsO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIHRyeVNjcmFwZSgpIHtcbiAgICB2YXIgdXJsID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gICAgaWYgKHVybCA9PT0gbGFzdFNjcmFwZVVybCkgcmV0dXJuO1xuICAgIHZhciBjaGVjayA9IGF3YWl0IGlzUGF0aWVudFBhZ2UoYWRhcHRlcik7XG4gICAgaWYgKGNoZWNrLmlzUGF0aWVudCkge1xuICAgICAgbGFzdFNjcmFwZVVybCA9IHVybDtcbiAgICAgIHBlcmZvcm1TY3JhcGUoYWRhcHRlcik7XG4gICAgfVxuICB9XG5cbiAgLyogU2NyYXBlIGluaXRpYWwgKi9cbiAgc2V0VGltZW91dCh0cnlTY3JhcGUsIGFkYXB0ZXIuc2NyYXBlRGVsYXkgfHwgMjAwMCk7XG5cbiAgLyogTXV0YXRpb25PYnNlcnZlciAqL1xuICBpZiAoZG9jdW1lbnQuYm9keSkge1xuICAgIHZhciBvYnMgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihtdXRhdGlvbnMpIHtcbiAgICAgIHZhciBoYXNOZXcgPSBtdXRhdGlvbnMuc29tZShmdW5jdGlvbihtKSB7IHJldHVybiBtLmFkZGVkTm9kZXMubGVuZ3RoID4gMDsgfSk7XG4gICAgICBpZiAoaGFzTmV3KSB7XG4gICAgICAgIGNsZWFyVGltZW91dChzY3JhcGVUaW1lcik7XG4gICAgICAgIHNjcmFwZVRpbWVyID0gc2V0VGltZW91dCh0cnlTY3JhcGUsIGFkYXB0ZXIub2JzZXJ2ZXJEZWJvdW5jZSB8fCAxNTAwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBvYnMub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicGFnZWhpZGVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAob2JzKSBvYnMuZGlzY29ubmVjdCgpO1xuICAgIH0pO1xuICB9XG5cbiAgLyogU1BBIG5hdmlnYXRpb24gKi9cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBmdW5jdGlvbigpIHsgc2V0VGltZW91dCh0cnlTY3JhcGUsIDEwMDApOyB9KTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJoYXNoY2hhbmdlXCIsIGZ1bmN0aW9uKCkgeyBzZXRUaW1lb3V0KHRyeVNjcmFwZSwgMTAwMCk7IH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBQYXNzaXZlTGVhcm5pbmcoYWRhcHRlcikge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgZWwgPSBlLnRhcmdldDtcbiAgICBpZiAoIWVsIHx8ICFlbC50YWdOYW1lIHx8IFtcIklOUFVUXCIsIFwiU0VMRUNUXCIsIFwiVEVYVEFSRUFcIl0uaW5kZXhPZihlbC50YWdOYW1lKSA9PT0gLTEpIHJldHVybjtcbiAgICB2YXIgZmlsbGVkVmFyID0gZWwuZ2V0QXR0cmlidXRlKFwiZGF0YS1vcHRpYm90LWZpbGxlZFwiKTtcbiAgICBpZiAoIWZpbGxlZFZhcikgcmV0dXJuO1xuICAgIHZhciBvbGRWYWx1ZSA9IGVsLmdldEF0dHJpYnV0ZShcImRhdGEtb3B0aWJvdC12YWx1ZVwiKTtcbiAgICBpZiAoZWwudmFsdWUgPT09IG9sZFZhbHVlKSByZXR1cm47XG5cbiAgICB2YXIgc2lnbmFscyA9IGNvbGxlY3RTaWduYWxzKGVsKTtcbiAgICB2YXIgbGFiZWwgPSBub3JtYWxpemVBbGlhcyhcbiAgICAgIHNpZ25hbHMuZmlsdGVyKGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMgJiYgcy5sZW5ndGggPiAyICYmIHMubGVuZ3RoIDwgNTA7IH0pWzBdXG4gICAgICB8fCBlbC5uYW1lIHx8IGVsLmlkIHx8IFwiXCJcbiAgICApO1xuICAgIGlmIChsYWJlbCkge1xuICAgICAgc2VuZExlYXJuU2lnbmFsKHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZSwgZWwuaWQgfHwgZWwubmFtZSB8fCBcIlwiLCBsYWJlbCwgZmlsbGVkVmFyKTtcbiAgICB9XG4gIH0sIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBNZXNzYWdlTGlzdGVuZXJzKGFkYXB0ZXIpIHtcbiAgY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGZ1bmN0aW9uKG1zZywgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICBpZiAobXNnICYmIG1zZy50eXBlID09PSBcIk9QVElCT1RfSU5KRUNUX1BFQ1wiKSB7XG4gICAgICBpbmplY3RQRUMobXNnLnBlY0RhdGEsIGFkYXB0ZXIpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7IHNlbmRSZXNwb25zZShyZXN1bHQpOyB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAobXNnICYmIG1zZy50eXBlID09PSBcIk9QVElCT1RfSU5KRUNUX1JFSkVUX05PVEVcIikge1xuICAgICAgaW5qZWN0UmVqZXROb3RlKG1zZy5ub3RlLCBhZGFwdGVyKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKiBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcdTI1NTBcbiAqICBJTklUIFx1MjAxNCBjYWxsZWQgYnkgaW5kZXguanNcbiAqIFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MFx1MjU1MCAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEJyaWRnZShhZGFwdGVyKSB7XG4gIG1lcmdlQWRhcHRlckFsaWFzZXMoYWRhcHRlcik7XG4gIGxvYWRMZWFybmVkQWxpYXNlcyhhZGFwdGVyKTtcbiAgc2V0dXBBdXRvRGV0ZWN0aW9uKGFkYXB0ZXIpO1xuICBzZXR1cFBhc3NpdmVMZWFybmluZyhhZGFwdGVyKTtcbiAgc2V0dXBNZXNzYWdlTGlzdGVuZXJzKGFkYXB0ZXIpO1xufVxuIiwgIi8qIFx1MjUwMFx1MjUwMCBPcHRpQm90IFx1MjAxNCBFUlAgQnJpZGdlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuLyogSW5qZWN0ZSBkeW5hbWlxdWVtZW50IHN1ciBsJ1VSTCBFUlAgY29uZmlndXJlZSBwYXIgbCd1dGlsaXNhdGV1ci4gICAgICAqL1xuLyogQXV0by1kZXRlY3RlIGwnRVJQIGV0IGFjdGl2ZSBsJ2FkYXB0YXRldXIgY29ycmVzcG9uZGFudC4gICAgICAgICAgICAgICAqL1xuLyogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qIEVSUCBzdXBwb3J0ZXMgOiBDb3NpdW0sIEktT3B0aWNzIChDZWdpZCksIFBWTyAoR2lua29pYSksICAgICAgICAgICAgICAqL1xuLyogICBJRE0gT3B0aWMgKEF4ZXNzKSwgTXlFYXN5T3B0aWMsIFdpbk9wdGljcywgT3B0aW11bSAoQ0lUKSwgICAgICAgICAgICovXG4vKiAgIE9zbW9zZSAoQW1vbmlzKSwgQWN1aXRhcyAzIChPY3VjbyksIEFyY2hpbWVkICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qICAgKyBhZGFwdGF0ZXVyIGdlbmVyaXF1ZSBwb3VyIHRvdXQgRVJQIG5vbiByZWNvbm51LiAgICAgICAgICAgICAgICAgICAgKi9cblxuaW1wb3J0IHsgZGV0ZWN0QWRhcHRlciB9IGZyb20gXCIuL2FkYXB0ZXJzLmpzXCI7XG5pbXBvcnQgeyBpbml0QnJpZGdlIH0gZnJvbSBcIi4vY29yZS5qc1wiO1xuXG4vKiBcdTI1MDBcdTI1MDAgRGVtYXJyYWdlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xudmFyIGhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLnJlcGxhY2UoXCJ3d3cuXCIsIFwiXCIpO1xudmFyIGFkYXB0ZXIgPSBkZXRlY3RBZGFwdGVyKGhvc3RuYW1lLCBkb2N1bWVudCk7XG5cbmNvbnNvbGUuaW5mbyhcIltPcHRpQm90XSBFUlAgQnJpZGdlIGFjdGlmIFx1MjAxNCBhZGFwdGF0ZXVyIDogXCIgKyBhZGFwdGVyLmRpc3BsYXlOYW1lICsgXCIgKFwiICsgYWRhcHRlci5uYW1lICsgXCIpXCIpO1xuXG5pbml0QnJpZGdlKGFkYXB0ZXIpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBSUEsTUFBSSxXQUFXLENBQUM7QUFR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VSxVQUFVLEVBQUUsUUFBUSxHQUFHLE9BQU8sTUFBTSxHQUFJO0FBQ3RGLFVBQUksWUFBWSxHQUFHLGFBQWEscUJBQXFCO0FBQ3JELFVBQUksQ0FBQyxVQUFXO0FBQ2hCLFVBQUksV0FBVyxHQUFHLGFBQWEsb0JBQW9CO0FBQ25ELFVBQUksR0FBRyxVQUFVLFNBQVU7QUFFM0IsVUFBSSxVQUFVLGVBQWUsRUFBRTtBQUMvQixVQUFJLFFBQVE7QUFBQSxRQUNWLFFBQVEsT0FBTyxTQUFTLEdBQUc7QUFBRSxpQkFBTyxLQUFLLEVBQUUsU0FBUyxLQUFLLEVBQUUsU0FBUztBQUFBLFFBQUksQ0FBQyxFQUFFLENBQUMsS0FDekUsR0FBRyxRQUFRLEdBQUcsTUFBTTtBQUFBLE1BQ3pCO0FBQ0EsVUFBSSxPQUFPO0FBQ1Qsd0JBQWdCLE9BQU8sU0FBUyxVQUFVLEdBQUcsTUFBTSxHQUFHLFFBQVEsSUFBSSxPQUFPLFNBQVM7QUFBQSxNQUNwRjtBQUFBLElBQ0YsR0FBRyxJQUFJO0FBQUEsRUFDVDtBQUVPLFdBQVMsc0JBQXNCQSxVQUFTO0FBQzdDLFdBQU8sUUFBUSxVQUFVLFlBQVksU0FBUyxLQUFLLFFBQVEsY0FBYztBQUN2RSxVQUFJLE9BQU8sSUFBSSxTQUFTLHNCQUFzQjtBQUM1QyxrQkFBVSxJQUFJLFNBQVNBLFFBQU8sRUFBRSxLQUFLLFNBQVMsUUFBUTtBQUFFLHVCQUFhLE1BQU07QUFBQSxRQUFHLENBQUM7QUFDL0UsZUFBTztBQUFBLE1BQ1Q7QUFDQSxVQUFJLE9BQU8sSUFBSSxTQUFTLDZCQUE2QjtBQUNuRCx3QkFBZ0IsSUFBSSxNQUFNQSxRQUFPO0FBQUEsTUFDbkM7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBTU8sV0FBUyxXQUFXQSxVQUFTO0FBQ2xDLHdCQUFvQkEsUUFBTztBQUMzQix1QkFBbUJBLFFBQU87QUFDMUIsdUJBQW1CQSxRQUFPO0FBQzFCLHlCQUFxQkEsUUFBTztBQUM1QiwwQkFBc0JBLFFBQU87QUFBQSxFQUMvQjs7O0FDaG1CQSxNQUFJLFdBQVcsT0FBTyxTQUFTLFNBQVMsUUFBUSxRQUFRLEVBQUU7QUFDMUQsTUFBSSxVQUFVLGNBQWMsVUFBVSxRQUFRO0FBRTlDLFVBQVEsS0FBSyxvREFBK0MsUUFBUSxjQUFjLE9BQU8sUUFBUSxPQUFPLEdBQUc7QUFFM0csYUFBVyxPQUFPOyIsCiAgIm5hbWVzIjogWyJob3N0bmFtZSIsICJhZGFwdGVyIiwgImhvc3RuYW1lIl0KfQo=
