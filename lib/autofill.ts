import type { MutuelleData, OrdonnanceData } from "./parsers";

export interface AutofillPayload {
  mutuelle?: MutuelleData;
  ordonnance?: OrdonnanceData;
  syncToken?: string;
}

export function generatePayloadString(payload: AutofillPayload): string {
  const m = payload.mutuelle ?? {};
  const o = payload.ordonnance ?? {};
  const syncToken = payload.syncToken || "";
  return JSON.stringify({ m, o, syncToken });
}

/*
 * BOOKMARKLET AUDIBOT
 *
 * Formulaire 1 — Fiche patient Auditdata / logiciel audioprothésiste
 *   Remplit nom, prénom, DDN, NSS depuis le presse-papier JSON
 *
 * Formulaire 2 — Prescription ORL / Audiogramme
 *   Stratégie A : lignes de tableau dont la 1ère cellule contient la fréquence
 *                 (250Hz, 500Hz, 1kHz, 2kHz, 4kHz)
 *   Stratégie B (fallback) : attribut [name*=] avec conventions audiologiques
 *                 (od_hz250, hz500_od, oreilleDroite_250, etc.)
 *
 * Notes de minification :
 *   - Pas de commentaires // dans le template.
 *   - Utiliser uniquement des commentaires /* * / si nécessaire.
 *
 * TODO: Adapter les sélecteurs aux champs réels d'Auditdata une fois l'accès obtenu.
 */
export const STATIC_BOOKMARKLET = `javascript:(async function(){
  try {
    const text = await navigator.clipboard.readText();
    const d = JSON.parse(text);
    const m = d.m || {};
    const o = d.o || {};
    const nom = (m.nom || o.nomPatient || '').toUpperCase();
    const prenom = m.prenom || o.prenomPatient || '';

    function ultraFill(el, val) {
      if (!el || val === undefined || val === null || val === '') return false;
      el.focus();
      el.value = val;
      const evts = ['focus','input','change','keydown','keypress','keyup','blur'];
      for (let i = 0; i < evts.length; i++) {
        el.dispatchEvent(new Event(evts[i], { bubbles: true, cancelable: true }));
      }
      if (window.$ && window.$(el).trigger) {
        window.$(el).val(val).trigger('input').trigger('change').trigger('keyup');
      }
      return true;
    }

    function findElement(selector) {
      const sels = selector.split(',').map(s => s.trim());
      for (let s = 0; s < sels.length; s++) {
        let el = document.querySelector(sels[s]);
        if (el) return el;
        const iframes = document.querySelectorAll('iframe');
        for (let i = 0; i < iframes.length; i++) {
          try {
            el = iframes[i].contentDocument.querySelector(sels[s]);
            if (el) return el;
          } catch(e) {}
        }
      }
      return null;
    }

    const ddn = m.dateNaissance || o.dateNaissancePatient || '';
    const nss = m.numeroSecuriteSociale || '';
    let filled = 0;

    /* TODO: Remplacer ces sélecteurs par les vrais sélecteurs DOM Auditdata */
    const patientFields = [
      ['[data-field="lastName"],#lastName,[name="lastName"],input[placeholder*="Nom"]', nom],
      ['[data-field="firstName"],#firstName,[name="firstName"],input[placeholder*="Prénom"]', prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase()],
      ['[data-field="birthDate"],#birthDate,[name="birthDate"]', ddn],
      ['[data-field="nss"],#nss,[name="socialSecurityNumber"]', nss.slice(0, 13)]
    ];

    for (let i = 0; i < patientFields.length; i++) {
      if (ultraFill(findElement(patientFields[i][0]), patientFields[i][1])) filled++;
    }

    /* Audiogramme OD/OG par fréquence — TODO: mapper les vrais sélecteurs Auditdata */
    const od = o.oreilleDroite || {};
    const og = o.oreilleGauche || {};
    const freqs = [
      ['250', od.hz250, og.hz250],
      ['500', od.hz500, og.hz500],
      ['1000', od.hz1000, og.hz1000],
      ['2000', od.hz2000, og.hz2000],
      ['4000', od.hz4000, og.hz4000]
    ];

    for (let i = 0; i < freqs.length; i++) {
      const hz = freqs[i][0];
      const odSel = '[data-freq="'+hz+'"][data-ear="right"],[name*="od_hz'+hz+'"],[name*="hz'+hz+'_od"]';
      const ogSel = '[data-freq="'+hz+'"][data-ear="left"],[name*="og_hz'+hz+'"],[name*="hz'+hz+'_og"]';
      if (ultraFill(findElement(odSel), freqs[i][1])) filled++;
      if (ultraFill(findElement(ogSel), freqs[i][2])) filled++;
    }

    if (filled > 0) {
      alert('AudiBot \u2713 ' + filled + ' champ(s) rempli(s)');
    } else {
      alert('AudiBot : Aucun formulaire reconnu. V\u00E9rifiez les s\u00E9lecteurs.');
    }
  } catch (e) {
    alert('Erreur AudiBot : Copiez les donn\u00E9es d\'abord.');
  }
})();`.replace(/\n/g, '').replace(/\s\s+/g, ' ');
