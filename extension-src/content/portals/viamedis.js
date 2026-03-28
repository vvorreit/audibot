var PORTAL_KEY = "pro.viamedis.net";

export default {
  name: "Viamedis",
  isMatch: () => window.location.hostname.includes("viamedis.net") || window.location.hostname.includes("viamedis.fr"),
  actions: {
    formulaire: (data) => {
      var m = data.m || {};
      var o = data.o || {};
      var c = data.cached || {};
      var personnes = m.personnes || [];
      var p0 = personnes.length > 0 ? personnes[0] : {};
      var nom = m.nom || p0.nom || o.nomPatient || c.nom || "";
      var prenom = m.prenom || p0.prenom || o.prenomPatient || c.prenom || "";
      var foundNSS = m.numeroSecuriteSociale || "";
      if (!foundNSS) {
        for (var i = 0; i < personnes.length; i++) {
          var pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
          if (pNSS.length >= 13) { foundNSS = personnes[i].numeroSecuriteSociale; break; }
        }
      }
      var foundDOB = m.dateNaissance || "";
      if (!foundDOB) {
        for (var i = 0; i < personnes.length; i++) {
          if (personnes[i].dateNaissance) { foundDOB = personnes[i].dateNaissance; break; }
        }
      }
      var nss = foundNSS || c.nss || "";
      var dob = foundDOB || o.dateNaissancePatient || c.dob || "";
      var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);

      /* Viamedis utilise Angular — data-cy, aria-label, ng-reflect-name */

      /* Formulaire recherche beneficiaire */
      var nomEl = findElementTracked(PORTAL_KEY, "nom",
        'input[data-cy="nom"], input[ng-reflect-name="nom"], input[name="nom"], input[aria-label*="nom" i]');
      if (!nomEl) {
        /* Fallback : essayer via placeholder */
        nomEl = Array.from(document.querySelectorAll('input')).find(function(el) {
          return (el.placeholder || "").toLowerCase().includes("nom");
        });
      }
      if (!nomEl) return false;

      ultraFill(nomEl, nom.toUpperCase());
      ultraFill(findElementTracked(PORTAL_KEY, "prenom",
        'input[data-cy="prenom"], input[ng-reflect-name="prenom"], input[name="prenom"], input[aria-label*="prénom" i]'),
        capitalize(prenom));

      /* NSS / NIR — Viamedis utilise souvent nirp ou nir */
      var nssEl = findElementTracked(PORTAL_KEY, "nir",
        'input[data-cy="nir"], input[data-cy="nirp"], input[ng-reflect-name="nir"], input[ng-reflect-name="nirp"], input[name="nir"], input[name="nirp"], input[aria-label*="NIR" i], input[aria-label*="sécurité sociale" i]');
      ultraFill(nssEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));

      /* Date naissance */
      ultraFill(findElementTracked(PORTAL_KEY, "dateNaissance",
        'input[data-cy="dateNaissance"], input[ng-reflect-name="dateNaissance"], input[name="dateNaissance"], input[aria-label*="naissance" i]'),
        dob);

      return true;
    },
    synchroniser: async () => false
  }
};
