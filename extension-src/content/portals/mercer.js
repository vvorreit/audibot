export default {
  name: "Mercer",
  isMatch: () => window.location.hostname.includes("services-fm.net") || window.location.hostname.includes("mercernet.fr") || window.location.href.includes("PECMERPRO"),
  actions: {
    formulaire: (data) => {
      var ssEl = findElement('input[name="numeroSS"]');
      if (!ssEl) return false;
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
      var numAdherent = m.numeroAdherent || c.numeroAdherent || (c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent) || "";

      ultraFill(ssEl, effectiveNSS.replace(/\D/g, ""));
      ultraFill(findElement('#nom'), nom.toUpperCase());
      ultraFill(findElement('#prenom'), capitalize(prenom));
      if (dob) ultraFill(findElement('#dateNai'), dob);
      if (numAdherent) ultraFill(findElement('#numAdh'), numAdherent);
      return true;
    },
    synchroniser: async () => false
  }
};
