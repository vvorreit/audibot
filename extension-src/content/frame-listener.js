/* ── Cross-domain postMessage listener & frame handling ───────────────── */

import { performSmartFill } from "./smart-fill/index.js";
import { performFill } from "./standard-fill/index.js";

/* iframes cross-domain postMessage listener */
export function initFrameListener() {
  window.addEventListener("message", function(e) {
    if (!e.data || e.data.type !== "AUDIBOT_FILL_FRAME" || !e.data.payload) return;
    if (globalThis.optiTrace) globalThis.optiTrace.log("IFRAME", "postMessage received: AUDIBOT_FILL_FRAME", { origin: e.origin });
    /* Valider l'origine : accepter same-origin + iframes enfants connues */
    if (e.origin !== window.location.origin) {
      var isKnownFrame = false;
      var frames = document.querySelectorAll("iframe");
      for (var i = 0; i < frames.length; i++) {
        try {
          if (frames[i].src && new URL(frames[i].src).origin === e.origin) {
            isKnownFrame = true;
            break;
          }
        } catch(err) {}
      }
      if (!isKnownFrame) {
        console.warn("[AudiBot] postMessage rejet\u00E9 \u2014 iframe non reconnue :", e.origin);
        return;
      }
    }
    /* Ecrire le payload dans le cache avant d'appeler performSmartFill (qui lit depuis le cache) */
    var payload = e.data.payload;
    var cachePromise = Promise.resolve();
    if (payload && (payload.m || payload.o)) {
      var nom = ((payload.m && payload.m.nom) || (payload.o && payload.o.nomPatient) || "").toUpperCase();
      if (nom) {
        var current = Object.assign({}, payload.m || {}, { ordonnance: payload.o || {}, updatedAt: Date.now() });
        cachePromise = globalThis.writeEncryptedCache({ current: current });
      }
    }
    cachePromise.then(function() {
      /* Utiliser le formulaire dedie du portail s'il existe, SmartFill en fallback */
      performFill().then(function() { performSmartFill(); }).catch(function() { performSmartFill(); });
    });
    /* Accuse de reception vers la source */
    if (e.source) {
      try { e.source.postMessage({ type: "AUDIBOT_FILL_FRAME_ACK", ok: true }, e.origin); } catch(err) {}
    }
  }, false);
}
