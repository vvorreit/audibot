export default {
  name: "SP Sante",
  isMatch: () => (window.location.hostname.includes("ffl-promoteur.com") && !window.location.hostname.includes("optique-tpplus")) || window.location.hostname.includes("spsante.fr"),
  actions: {
    formulaire: (data) => {
      var nomEl = findElement('#mat-input-0');
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
      var digits = effectiveNSS.replace(/\D/g, "");
      var numAdherent = m.numeroAdherent || c.numeroAdherent || (c.regimes && c.regimes.rc1 && c.regimes.rc1.numeroAdherent) || "";

      ultraFill(nomEl, nom.toUpperCase());
      ultraFill(findElement('#mat-input-1'), capitalize(prenom));
      if (dob) ultraFill(findElement('#mat-input-2'), dob);
      if (numAdherent) {
        ultraFill(findElement('#mat-input-7'), numAdherent);
        ultraFill(findElement('#mat-input-8'), numAdherent);
      }
      ultraFill(findElement('#mat-input-9'), digits.slice(0, 13));
      ultraFill(findElement('#mat-input-10'), digits.slice(13, 15));
      return true;
    },
    synchroniser: async () => false
  }
};
