/* ── Recorder State ────────────────────────────────────────────────────── */

export var recorderState = null; /* null = inactif, sinon { etapes: [], hostname: "", paused: false } */

/* Sauvegarder l'état du recorder dans chrome.storage après chaque étape */
export function saveRecorderState() {
  if (!recorderState) return;
  var etapesSansHtml = recorderState.etapes.map(function(e) {
    var copy = Object.assign({}, e);
    delete copy.htmlSnapshot;
    return copy;
  });
  var pages = [];
  var seenUrls = {};
  for (var pi = 0; pi < recorderState.etapes.length; pi++) {
    var u = recorderState.etapes[pi].url;
    if (u && !seenUrls[u]) { seenUrls[u] = true; pages.push(u); }
  }
  chrome.storage.local.set({ audibot_recorder: {
    active: true,
    etapes: etapesSansHtml,
    hostname: recorderState.hostname,
    startTime: recorderState.startTime,
    pages: pages,
  }});
}

/* RGPD — Anonymise le snapshot HTML avant envoi */
export function anonymizeHtmlSnapshot() {
  try {
    var clone = document.documentElement.cloneNode(true);
    var inputs = clone.querySelectorAll("input, textarea, select");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = "";
      inputs[i].removeAttribute("value");
    }
    var scripts = clone.querySelectorAll("script");
    for (var s = 0; s < scripts.length; s++) { scripts[s].remove(); }
    var dataEls = clone.querySelectorAll("[data-nss], [data-nom], [data-prenom], [data-secu], [data-patient]");
    for (var d = 0; d < dataEls.length; d++) {
      ["data-nss","data-nom","data-prenom","data-secu","data-patient"].forEach(function(attr) {
        dataEls[d].removeAttribute(attr);
      });
    }
    return clone.outerHTML;
  } catch(e) {
    return "";
  }
}

export function normalizeForMatch(val) {
  return (val || "").replace(/[\s\-\.\/]/g, "").toLowerCase();
}

export function normalizeDateForMatch(dateStr) {
  if (!dateStr) return [];
  var d = dateStr.replace(/\D/g, "");
  if (d.length === 8) {
    return [d, d.slice(4) + d.slice(2, 4) + d.slice(0, 2), d.slice(0, 2) + d.slice(2, 4) + d.slice(4)];
  }
  return [d];
}

/* ── Détection par label — quand la valeur ne matche pas, inférer la variable depuis le label du champ ── */

var LABEL_TO_VARIABLE = [
  /* ── Patient / Bénéficiaire ── */
  { patterns: ["nom", "last.?name", "surname", "family.?name", "nom.?famille", "nom.?assure", "nom.?benef", "nom.?patient"], variable: "{{nom}}" },
  { patterns: ["pr[eé]nom", "first.?name", "given.?name", "prenom.?assure", "prenom.?benef", "prenom.?patient"], variable: "{{prenom}}" },
  { patterns: ["n[°o].?s[eé]cu", "nss", "nir", "immatriculation", "s[eé]curit[eé].?sociale", "num.?insee", "n[°o].?assur", "matricule"], variable: "{{nss}}" },
  { patterns: ["date.?naissance", "date.?of.?birth", "dob", "n[eé]\\(?e?\\)?.?le"], variable: "{{dateNaissance}}" },

  /* ── Contact patient ── */
  { patterns: ["t[eé]l[eé]phone", "tel$", "phone", "mobile", "portable", "gsm", "cellphone"], variable: "{{telephone}}" },
  { patterns: ["e.?mail", "courriel", "adresse.?mail"], variable: "{{email}}" },
  { patterns: ["adresse", "address", "rue", "ligne.?1", "street", "voie"], variable: "{{adresse}}" },
  { patterns: ["code.?postal", "cp$", "zip", "postal.?code"], variable: "{{codePostal}}" },
  { patterns: ["ville", "city", "localit[eé]", "commune"], variable: "{{ville}}" },

  /* ── Mutuelle / Tiers-payant ── */
  { patterns: ["organisme", "mutuelle", "compl[eé]mentaire", "caisse", "assureur"], variable: "{{organisme}}" },
  { patterns: ["n[°o].?adh[eé]rent", "num.?adherent", "adherent", "n[°o].?membre", "n[°o].?contrat", "num.?contrat"], variable: "{{numeroAdherent}}" },
  { patterns: ["n[°o].?amc", "num.?amc", "code.?amc", "code.?organisme"], variable: "{{numeroAMC}}" },
  { patterns: ["t[eé]l[eé]transmission", "num.?tp", "n[°o].?tp"], variable: "{{numeroTeletransmission}}" },
  { patterns: ["crit[eè]re.?secondaire"], variable: "{{critereSecondaire}}" },
  { patterns: ["code.?convention"], variable: "{{codeConvention}}" },
  { patterns: ["d[eé]but.?validit[eé]", "date.?d[eé]but", "d[eé]but.?contrat"], variable: "{{dateDebutValidite}}" },
  { patterns: ["fin.?validit[eé]", "date.?fin", "expiration", "fin.?contrat"], variable: "{{dateFinValidite}}" },

  /* ── Ordonnance / Prescription ── */
  { patterns: ["date.?ordonnance", "date.?prescription", "prescrit.?le", "date.?presc", "date.?ordo"], variable: "{{dateOrdonnance}}" },
  { patterns: ["prescripteur", "ophtalmologue", "ophtalmo", "m[eé]decin", "docteur", "nom.?prescripteur"], variable: "{{nomOphtalmologue}}" },
  { patterns: ["rpps", "num.?rpps", "identifiant.?rpps", "adeli", "num.?am"], variable: "{{rpps}}" },
  { patterns: ["distance.?pupillaire", "dp$", "ecart.?pupillaire", "inter.?pupillaire"], variable: "{{distancePupillaire}}" },
  { patterns: ["type.?prescription", "type.?vision", "type.?[eé]quipement", "nature.?[eé]quipement"], variable: "{{typePrescription}}" },

  /* ── Correction lunettes OD ── */
  { patterns: ["sph[eè]re.*d", "sphere.*od", "sph.*od", "sph.*droit"], variable: "{{sphere_od}}" },
  { patterns: ["cylindre.*d", "cyl.*od", "cyl.*droit"], variable: "{{cylindre_od}}" },
  { patterns: ["axe.*d", "ax.*od", "axe.*droit"], variable: "{{axe_od}}" },
  { patterns: ["addition.*d", "add.*od", "add.*droit"], variable: "{{addition_od}}" },

  /* ── Correction lunettes OG ── */
  { patterns: ["sph[eè]re.*g", "sphere.*og", "sph.*og", "sph.*gauche"], variable: "{{sphere_og}}" },
  { patterns: ["cylindre.*g", "cyl.*og", "cyl.*gauche"], variable: "{{cylindre_og}}" },
  { patterns: ["axe.*g", "ax.*og", "axe.*gauche"], variable: "{{axe_og}}" },
  { patterns: ["addition.*g", "add.*og", "add.*gauche"], variable: "{{addition_og}}" },

  /* ── Addition générique (quand non spécifié OD/OG) ── */
  { patterns: ["addition$", "^add$"], variable: "{{addition}}" },

  /* ── Correction lentilles OD ── */
  { patterns: ["sph.*lentille.*d", "lentille.*od.*sph", "lod.*sph"], variable: "{{sphere_lentille_od}}" },
  { patterns: ["cyl.*lentille.*d", "lentille.*od.*cyl", "lod.*cyl"], variable: "{{cylindre_lentille_od}}" },
  { patterns: ["axe.*lentille.*d", "lentille.*od.*axe", "lod.*ax"], variable: "{{axe_lentille_od}}" },
  { patterns: ["add.*lentille.*d", "lentille.*od.*add"], variable: "{{addition_lentille_od}}" },
  { patterns: ["rayon.*od", "base.?curve.*od", "rb.*od", "bc.*od"], variable: "{{rayon_od}}" },
  { patterns: ["diam[eè]tre.*od", "dia.*od"], variable: "{{diametre_od}}" },

  /* ── Correction lentilles OG ── */
  { patterns: ["sph.*lentille.*g", "lentille.*og.*sph", "log.*sph"], variable: "{{sphere_lentille_og}}" },
  { patterns: ["cyl.*lentille.*g", "lentille.*og.*cyl", "log.*cyl"], variable: "{{cylindre_lentille_og}}" },
  { patterns: ["axe.*lentille.*g", "lentille.*og.*axe", "log.*ax"], variable: "{{axe_lentille_og}}" },
  { patterns: ["add.*lentille.*g", "lentille.*og.*add"], variable: "{{addition_lentille_og}}" },
  { patterns: ["rayon.*og", "base.?curve.*og", "rb.*og", "bc.*og"], variable: "{{rayon_og}}" },
  { patterns: ["diam[eè]tre.*og", "dia.*og"], variable: "{{diametre_og}}" },
];

export function detectVariableByLabel(label, name, placeholder, ariaLabel) {
  var candidates = [label, name, placeholder, ariaLabel].filter(Boolean);
  if (candidates.length === 0) return null;

  var combined = candidates.join(" ").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (var i = 0; i < LABEL_TO_VARIABLE.length; i++) {
    var entry = LABEL_TO_VARIABLE[i];
    for (var j = 0; j < entry.patterns.length; j++) {
      try {
        if (new RegExp(entry.patterns[j], "i").test(combined)) {
          return entry.variable;
        }
      } catch(e) {}
    }
  }

  return null;
}

/* Détecte si une valeur correspond à une variable patient (depuis cache local).
   Si la détection par valeur échoue, tente la détection par label. */
export async function detectVariable(value, fieldInfo) {
  if (!value || value.length < 2) {
    if (fieldInfo) return detectVariableByLabel(fieldInfo.label, fieldInfo.name, fieldInfo.placeholder, fieldInfo.ariaLabel);
    return null;
  }

  var cache = await readEncryptedCache();
  if (!cache || !cache.current) {
    if (fieldInfo) return detectVariableByLabel(fieldInfo.label, fieldInfo.name, fieldInfo.placeholder, fieldInfo.ariaLabel);
    return null;
  }

  var m = cache.current;
  var o = m.ordonnance || {};
  var od = o.lunettesOD || {};
  var og = o.lunettesOG || {};
  var p0 = (m.personnes && m.personnes[0]) || {};

  var normalizedValue = normalizeForMatch(value);

  var pres = m.prescription || {};
  var regimes = m.regimes || {};
  var rc1 = regimes.rc1 || {};
  var lod = o.lentillesOD || {};
  var log = o.lentillesOG || {};

  /* Champs simples — comparaison normalisée */
  var mapping = [
    /* Patient */
    { variable: "{{nss}}", value: m.numeroSecuriteSociale || m.nss || "" },
    { variable: "{{nom}}", value: m.nom || p0.nom || "" },
    { variable: "{{prenom}}", value: m.prenom || p0.prenom || "" },
    /* Contact */
    { variable: "{{telephone}}", value: m.phone || m.telephone || "" },
    { variable: "{{email}}", value: m.email || "" },
    { variable: "{{adresse}}", value: m.address || m.adresse || "" },
    { variable: "{{codePostal}}", value: m.zipCode || m.codePostal || "" },
    { variable: "{{ville}}", value: m.city || m.ville || "" },
    /* Mutuelle */
    { variable: "{{organisme}}", value: m.organisme || rc1.nom || "" },
    { variable: "{{numeroAdherent}}", value: m.numeroAdherent || rc1.numeroAdherent || "" },
    { variable: "{{numeroAMC}}", value: m.numeroAMC || "" },
    { variable: "{{numeroTeletransmission}}", value: m.numeroTeletransmission || rc1.numeroTeletransmission || "" },
    { variable: "{{critereSecondaire}}", value: m.critereSecondaire || rc1.critereSecondaire || "" },
    { variable: "{{codeConvention}}", value: m.codeConvention || rc1.codeConvention || "" },
    /* Prescription */
    { variable: "{{nomOphtalmologue}}", value: o.nomOphtalmologue || pres.prescripteur || "" },
    { variable: "{{rpps}}", value: o.rpps || pres.rpps || "" },
    { variable: "{{distancePupillaire}}", value: o.distancePupillaire || "" },
    { variable: "{{typePrescription}}", value: o.typePrescription || pres.typeVision || "" },
    /* Lunettes OD */
    { variable: "{{sphere_od}}", value: od.sphere || "" },
    { variable: "{{cylindre_od}}", value: od.cylindre || "" },
    { variable: "{{axe_od}}", value: od.axe || "" },
    { variable: "{{addition_od}}", value: od.addition || "" },
    /* Lunettes OG */
    { variable: "{{sphere_og}}", value: og.sphere || "" },
    { variable: "{{cylindre_og}}", value: og.cylindre || "" },
    { variable: "{{axe_og}}", value: og.axe || "" },
    { variable: "{{addition_og}}", value: og.addition || "" },
    /* Addition générique */
    { variable: "{{addition}}", value: od.addition || og.addition || "" },
    /* Lentilles OD */
    { variable: "{{sphere_lentille_od}}", value: lod.sphere || "" },
    { variable: "{{cylindre_lentille_od}}", value: lod.cylindre || "" },
    { variable: "{{axe_lentille_od}}", value: lod.axe || "" },
    { variable: "{{addition_lentille_od}}", value: lod.addition || "" },
    { variable: "{{rayon_od}}", value: lod.rayonCourbure || "" },
    { variable: "{{diametre_od}}", value: lod.diametre || "" },
    /* Lentilles OG */
    { variable: "{{sphere_lentille_og}}", value: log.sphere || "" },
    { variable: "{{cylindre_lentille_og}}", value: log.cylindre || "" },
    { variable: "{{axe_lentille_og}}", value: log.axe || "" },
    { variable: "{{addition_lentille_og}}", value: log.addition || "" },
    { variable: "{{rayon_og}}", value: log.rayonCourbure || "" },
    { variable: "{{diametre_og}}", value: log.diametre || "" },
  ];

  for (var i = 0; i < mapping.length; i++) {
    var candidate = normalizeForMatch(mapping[i].value);
    if (candidate && candidate.length >= 2 && normalizedValue === candidate) {
      return mapping[i].variable;
    }
  }

  /* Dates — essayer plusieurs formats normalisés */
  var dateFields = [
    { variable: "{{dateNaissance}}", value: m.dateNaissance || m.dob || "" },
    { variable: "{{dateOrdonnance}}", value: o.dateOrdonnance || pres.datePrescription || "" },
    { variable: "{{dateDebutValidite}}", value: m.dateDebutValidite || rc1.dateDebut || "" },
    { variable: "{{dateFinValidite}}", value: m.dateFinValidite || rc1.dateFin || "" },
  ];
  for (var j = 0; j < dateFields.length; j++) {
    var variants = normalizeDateForMatch(dateFields[j].value);
    for (var k = 0; k < variants.length; k++) {
      if (variants[k] && variants[k].length >= 6 && normalizedValue === variants[k]) {
        return dateFields[j].variable;
      }
    }
  }

  /* Fallback : détection par label si aucune correspondance de valeur */
  if (fieldInfo) {
    return detectVariableByLabel(fieldInfo.label, fieldInfo.name, fieldInfo.placeholder, fieldInfo.ariaLabel);
  }

  return null;
}
