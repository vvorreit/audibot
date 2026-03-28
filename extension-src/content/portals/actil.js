export default {
  name: "Actil",
  isMatch: () => window.location.hostname.includes("actil.com"),
  actions: {
    formulaire: (data) => {
      var nomEl = findElement('input[name="nom"]');
      if (!nomEl) return false;

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

      ultraFill(nomEl, nom.toUpperCase());
      ultraFill(findElement('input[name="prenom"]'), capitalize(prenom));
      ultraFill(findElement('input[name="numInsee"]'), effectiveNSS.replace(/\D/g, ""));
      return true;
    },
    synchroniser: async () => false
  }
};
