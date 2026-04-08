/* ── AudiBot — Adaptateurs ERP optique ───────────────────────────────── */
/* Chaque adaptateur configure le bridge pour un ERP specifique.          */
/* L'auto-detection identifie l'ERP au chargement de la page.            */

var ADAPTERS = [];

/* ══════════════════════════════════════════════════════════════════════════
 *  1. COSIUM (CosiumShop)
 *  Leader techno. SaaS pur (navigateur). Angular-based.
 *  Grands reseaux et centres mixtes Optique + Audio.
 *  Stack : Angular, TypeScript, REST API.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "cosium",
  displayName: "Cosium",
  detect: function(hostname, doc) {
    if (hostname.indexOf("cosium") !== -1 || hostname.indexOf("cosiumshop") !== -1) return true;
    if (doc.querySelector("app-root[ng-version], cosium-app, [class*=cosium], [id*=cosium]")) return true;
    if (doc.querySelector("img[src*=cosium], link[href*=cosium]")) return true;
    return false;
  },
  framework: "angular",
  aliases: {
    nom: ["patient_nom", "client_nom", "nomBeneficiaire"],
    prenom: ["patient_prenom", "client_prenom", "prenomBeneficiaire"],
    numeroSecuriteSociale: ["nirAssure", "nirBeneficiaire"],
  },
  pecAliases: {},
  patientPageIndicators: [
    "[class*=patient-detail]", "[class*=patient-fiche]",
    "[class*=client-form]", "[class*=dossier-patient]",
    "[data-view*=patient]",
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
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  2. I-OPTICS (Cegid / Cristallin)
 *  Pilier du marche. Tres robuste. Equipe independants et franchises.
 *  Stack : ASP.NET / Blazor pour les versions recentes, jQuery legacy.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "ioptics",
  displayName: "I-Optics (Cegid)",
  detect: function(hostname, doc) {
    if (hostname.indexOf("cegid") !== -1 || hostname.indexOf("i-optics") !== -1 || hostname.indexOf("ioptics") !== -1 || hostname.indexOf("cristallin") !== -1) return true;
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
    email: ["txtEmail", "txtMail", "ctl_email", "tbEmail"],
  },
  pecAliases: {
    numeroAccord: ["txtNumAccord", "tbAccord"],
    montantPEC: ["txtMontantPEC", "tbMontant"],
  },
  patientPageIndicators: [
    "#pnlPatient", "#divFicheClient", "[id*=PatientDetail]",
    "#ContentPlaceHolder", "[class*=porteur]", "[id*=FichePorteur]",
  ],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1500,
  searchIframes: true,
  searchShadowDOM: false,
  inputSelector: null,
  readOnlySelectors: "span.aspNetDisabled, span.field-display, td.data-cell, .readonly-field",
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  3. PVO (Points de Vente Optique — Ginkoia / DL Software)
 *  Reference pour pilotage de reseaux. Achats groupes, stats multi-sites.
 *  Stack : Java/JEE probable, interface web jQuery/Bootstrap.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "pvo",
  displayName: "PVO (Ginkoia)",
  detect: function(hostname, doc) {
    if (hostname.indexOf("ginkoia") !== -1 || hostname.indexOf("pvo") !== -1 || hostname.indexOf("dlsoftware") !== -1) return true;
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
    organisme: ["fld_mutuelle", "porteur_mutuelle", "mutuelleName"],
  },
  pecAliases: {},
  patientPageIndicators: [
    "[class*=fiche-porteur]", "[class*=porteur-detail]",
    "#fichePorteur", "#porteurForm", "[class*=client-detail]",
  ],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1500,
  searchIframes: true,
  searchShadowDOM: false,
  inputSelector: null,
  readOnlySelectors: ".porteur-info span, .data-display, td.valeur",
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  4. IDM OPTIC (Axess Groupe)
 *  Ex Actu-Gestion. Interface fluide, hebergement HDS France.
 *  Stack : Web moderne, probablement Vue.js ou React, API REST.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "idmoptic",
  displayName: "IDM Optic",
  detect: function(hostname, doc) {
    if (hostname.indexOf("idm") !== -1 || hostname.indexOf("axess") !== -1 || hostname.indexOf("actu-gestion") !== -1 || hostname.indexOf("actugestion") !== -1) return true;
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
    dateNaissance: ["patient_birthdate", "client_birthdate", "ddn_patient"],
  },
  pecAliases: {},
  patientPageIndicators: [
    "[class*=patient-card]", "[class*=client-card]",
    "[class*=fiche-patient]", "[data-page=patient]",
  ],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1200,
  searchIframes: false,
  searchShadowDOM: false,
  inputSelector: null,
  readOnlySelectors: null,
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  5. MYEASYOPTIC
 *  Champion de l'accessibilite. Web agile, moderne, independants.
 *  Stack : SaaS moderne, probablement React ou Vue.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "myeasyoptic",
  displayName: "MyEasyOptic",
  detect: function(hostname, doc) {
    if (hostname.indexOf("myeasyoptic") !== -1 || hostname.indexOf("easyoptic") !== -1) return true;
    if (doc.querySelector("[class*=easyoptic], [class*=myeasy], img[src*=easyoptic], img[src*=myeasy]")) return true;
    var title = (doc.title || "").toLowerCase();
    if (title.indexOf("easyoptic") !== -1 || title.indexOf("myeasy") !== -1) return true;
    return false;
  },
  framework: "react",
  aliases: {
    nom: ["patient_name", "clientName", "beneficiary_name"],
    prenom: ["patient_firstname", "clientFirstname", "beneficiary_firstname"],
  },
  pecAliases: {},
  patientPageIndicators: [
    "[class*=patient-view]", "[class*=client-view]",
    "[data-route*=patient]", "[class*=fiche]",
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
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  6. WINOPTICS
 *  Choix historique des independants. Rapport qualite/prix.
 *  Stack : Application desktop avec composante web, probablement jQuery.
 *  Note : domaine winoptics.fr deja dans ACTIVE_DOMAINS.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "winoptics",
  displayName: "WinOptics",
  detect: function(hostname, doc) {
    if (hostname.indexOf("winoptics") !== -1) return true;
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
    organisme: ["txt_mutuelle", "mutuelle_porteur", "wo_mutuelle"],
  },
  pecAliases: {},
  patientPageIndicators: [
    "#ficheClient", "#formPorteur", "[class*=porteur]",
    "[class*=wo-patient]", "[id*=client]",
  ],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1500,
  searchIframes: true,
  searchShadowDOM: false,
  inputSelector: null,
  readOnlySelectors: ".wo-display, .readonly, span.data, td.value",
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  7. OPTIMUM (CIT)
 *  Oriente Digital Store. Experience client en magasin.
 *  Stack : Web moderne, React probable. livebyoptimum.com deja actif.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "optimum",
  displayName: "Optimum (CIT)",
  detect: function(hostname, doc) {
    if (hostname.indexOf("optimum") !== -1 || hostname.indexOf("livebyoptimum") !== -1 || hostname.indexOf("cit-") !== -1) return true;
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
    dateNaissance: ["customerBirthDate", "clientBirthDate"],
  },
  pecAliases: {},
  patientPageIndicators: [
    "[class*=customer-detail]", "[class*=client-sheet]",
    "[data-page=customer]", "[class*=patient-info]",
  ],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1200,
  searchIframes: false,
  searchShadowDOM: false,
  inputSelector: null,
  readOnlySelectors: null,
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  8. OSMOSE (Amonis)
 *  Nouvelle generation. Ergonomie intuitive. Optique + Audio fusionnes.
 *  Stack : SaaS moderne, probablement Vue.js ou React.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "osmose",
  displayName: "Osmose (Amonis)",
  detect: function(hostname, doc) {
    if (hostname.indexOf("osmose") !== -1 || hostname.indexOf("amonis") !== -1) return true;
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
    dateNaissance: ["patientDateNaissance", "dateNaissancePatient"],
  },
  pecAliases: {},
  patientPageIndicators: [
    "[class*=patient-fiche]", "[class*=dossier-client]",
    "[class*=fiche-beneficiaire]", "[data-view=patient]",
  ],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1200,
  searchIframes: false,
  searchShadowDOM: false,
  inputSelector: null,
  readOnlySelectors: null,
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  9. ACUITAS 3 (Ocuco)
 *  International, poids lourd. Optometrie poussee. Flux medicaux complexes.
 *  Stack : .NET / Blazor probable, Angular possible.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "acuitas",
  displayName: "Acuitas 3 (Ocuco)",
  detect: function(hostname, doc) {
    if (hostname.indexOf("ocuco") !== -1 || hostname.indexOf("acuitas") !== -1) return true;
    if (doc.querySelector("[class*=ocuco], [class*=acuitas], img[src*=ocuco], img[src*=acuitas]")) return true;
    if (doc.querySelector("meta[content*=Ocuco], meta[content*=Acuitas]")) return true;
    /* Blazor/.NET markers */
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
    nomOphtalmologue: ["PrescriberName", "PractitionerName", "ReferredBy"],
  },
  pecAliases: {
    numeroAccord: ["AuthorisationNo", "ApprovalNo", "PriorApproval"],
    montantPEC: ["AuthorisedAmount", "ApprovedAmount", "InsuranceAmount"],
  },
  patientPageIndicators: [
    "[class*=patient-record]", "[class*=patient-summary]",
    "[id*=PatientDetail]", "[class*=clinical-record]",
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
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  10. ARCHIMED
 *  Acteur solide. Qualite du support. Fort sur tiers-payant / rejets.
 *  Stack : Application web classique, probablement Java/JSP ou PHP.
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "archimed",
  displayName: "Archimed",
  detect: function(hostname, doc) {
    if (hostname.indexOf("archimed") !== -1) return true;
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
    numeroAdherent: ["fiche_adherent", "porteur_adherent", "num_adherent_tp"],
  },
  pecAliases: {
    numeroAccord: ["arch_accord", "accord_tp", "num_accord_tp"],
    montantPEC: ["arch_montant", "montant_tp", "part_mutuelle"],
  },
  patientPageIndicators: [
    "#fichePorteur", "#formPatient", "[class*=arch-fiche]",
    "[class*=fiche-porteur]", "[id*=porteur]",
  ],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1500,
  searchIframes: true,
  searchShadowDOM: false,
  inputSelector: null,
  readOnlySelectors: ".arch-display, .fiche-value, td.valeur, span.data-porteur",
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  FALLBACK — Adaptateur generique pour ERP non reconnus
 * ══════════════════════════════════════════════════════════════════════════ */
ADAPTERS.push({
  name: "generic",
  displayName: "ERP",
  detect: function() { return true; },
  framework: "auto",
  aliases: {},
  pecAliases: {},
  patientPageIndicators: [],
  minFieldsForPatientPage: 3,
  scrapeDelay: 2000,
  observerDebounce: 1500,
  searchIframes: true,
  searchShadowDOM: true,
  inputSelector: null,
  readOnlySelectors: null,
  beforeScrape: null,
  afterScrape: null,
  transformValue: null,
});

/* ══════════════════════════════════════════════════════════════════════════
 *  AUTO-DETECTION
 * ══════════════════════════════════════════════════════════════════════════ */
export function detectAdapter(hostname, doc) {
  for (var i = 0; i < ADAPTERS.length; i++) {
    if (ADAPTERS[i].name !== "generic") {
      try {
        if (ADAPTERS[i].detect(hostname, doc)) return ADAPTERS[i];
      } catch(e) { /* detection error, skip */ }
    }
  }
  return ADAPTERS[ADAPTERS.length - 1];
}

export { ADAPTERS };
