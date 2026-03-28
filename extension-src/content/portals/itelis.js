var PORTAL_KEY = "pro.ism-tp.fr";

export default {
  name: "Itelis",
  isMatch: () => window.location.hostname.includes("ism-tp.fr") || window.location.hostname.includes("itelis.fr"),
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

      /* Itelis — formulaire recherche beneficiaire */
      var nomEl = findElementTracked(PORTAL_KEY, "nom_assuree",
        'input[name="nom_assuree"], input[name="nom"], input[id*="nom"][id*="assure"], input[data-cy="input-lastName"]');
      if (!nomEl) return false;

      ultraFill(nomEl, nom.toUpperCase());
      ultraFill(findElementTracked(PORTAL_KEY, "prenom_assuree",
        'input[name="prenom_assuree"], input[name="prenom"], input[data-cy="input-firstName"]'),
        capitalize(prenom));
      ultraFill(findElementTracked(PORTAL_KEY, "nss",
        'input[name="nss"], input[name="nirp"], input[name="numInsee"], input[name="nir"], input[data-cy="input-nir"]'),
        effectiveNSS.replace(/\D/g, ""));
      ultraFill(findElementTracked(PORTAL_KEY, "dateNaissance",
        'input[name="dateNaissance"], input[name="date_naissance"], input[data-cy="input-dob"]'),
        dob);
      ultraFill(findElementTracked(PORTAL_KEY, "adherent",
        'input[name="adherent"], input[name="num_adherent"], input[name="numAdherent"]'),
        m.numeroAdherent || "");

      return true;
    },
    synchroniser: async () => false
  }
};
