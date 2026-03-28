export default {
  name: "Ameli",
  isMatch: () => window.location.hostname.includes("ameli.fr"),
  actions: {
    formulaire: (data) => {
      var nirEl = findElement('#nir');
      if (!nirEl) return false;
      var m = data.m || {};
      var personnes = m.personnes || [];
      var p0 = personnes.length > 0 ? personnes[0] : {};
      var foundNSS = m.numeroSecuriteSociale || "";
      if (!foundNSS) {
        for (var i = 0; i < personnes.length; i++) {
          var pNSS = (personnes[i].numeroSecuriteSociale || "").replace(/\D/g, "");
          if (pNSS.length >= 13) { foundNSS = personnes[i].numeroSecuriteSociale; break; }
        }
      }
      var dob = m.dateNaissance || p0.dateNaissance || "";
      var c = data.cached || {};
      var nss = foundNSS || c.nss || "";
      var effectiveNSS = getOuvrantDroitNSS(nss, dob, personnes);
      ultraFill(nirEl, effectiveNSS.replace(/\D/g, "").slice(0, 13));
      return true;
    },
    synchroniser: async () => false
  }
};
