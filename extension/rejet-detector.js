"use strict";
(() => {
  // extension-src/rejet-detector/index.js
  (function() {
    "use strict";
    var API_BASE = "https://optibot.fr";
    var CONFIG_URL = API_BASE + "/api/extension/rejet-config";
    var REJET_URL = API_BASE + "/api/extension/rejet-detecte";
    var CHECK_INTERVAL = 1e4;
    var config = null;
    var currentPortail = null;
    var detectedRejets = /* @__PURE__ */ new Set();
    var enabled = true;
    function getPortailFromUrl(url) {
      if (url.includes("almerys.com") || url.includes("be-almerys.com")) return "ALMERYS";
      if (url.includes("viamedis.net")) return "VIAMEDIS";
      if (url.includes("ism-tp.fr")) return "ITELIS";
      if (url.includes("actil.com")) return "KALIXIA";
      if (url.includes("oxantis.net")) return "OXANTIS";
      if (url.includes("generation.fr")) return "GENERATION";
      if (url.includes("ffl-promoteur.com") || url.includes("spsante.fr")) return "SP_SANTE";
      if (url.includes("santeclair.fr")) return "SANTECLAIR";
      if (url.includes("livebyoptimum.com")) return "LBO";
      if (url.includes("solimut.fr")) return "SOLIMUT";
      if (url.includes("mercernet.fr") || url.includes("services-fm.net")) return "MERCER";
      if (url.includes("wemind.io")) return "WEMIND";
      if (url.includes("ameli.fr")) return "AMELI";
      if (url.includes("carteblanchepartenaires.fr")) return "CARTE_BLANCHE";
      if (url.includes("kalixia.fr") || url.includes("kalixia-partenaires.fr")) return "KALIXIA";
      if (url.includes("optistya.fr")) return "OPTISTYA";
      if (url.includes("groupama.com")) return "GROUPAMA";
      if (url.includes("korelio.com")) return "KORELIO";
      if (url.includes("seveane.com")) return "SEVEANE";
      if (url.includes("tp-harmonie.net")) return "HARMONIE";
      if (url.includes("tp-isante.fr")) return "ISANTE";
      if (url.includes("tp-eovi-mcd.net")) return "AESIO";
      if (url.includes("mysanteclair.fr")) return "SANTECLAIR";
      if (url.includes("tpcomplementaire.fr")) return "INTERAMC";
      return null;
    }
    function getSyncToken() {
      return new Promise(function(resolve) {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(["optibot_auth"], function(result) {
            if (result.optibot_auth && result.optibot_auth.syncToken) {
              resolve(result.optibot_auth.syncToken);
              return;
            }
            resolve(null);
          });
        } else {
          resolve(null);
        }
      });
    }
    function loadConfig() {
      return fetch(CONFIG_URL).then(function(res) {
        return res.json();
      }).then(function(data) {
        config = data;
        return data;
      }).catch(function(err) {
        console.warn("[OptiBot Rejet] Config fetch failed:", err);
        return null;
      });
    }
    function extractText(el, selector) {
      if (!selector) return null;
      var selectors = selector.split(",").map(function(s) {
        return s.trim();
      });
      for (var i = 0; i < selectors.length; i++) {
        var found = el.querySelector(selectors[i]);
        if (found) return (found.textContent || "").trim();
      }
      return null;
    }
    var AMELI_REJET_PATTERNS = [
      { re: /rejet[eé]?\b/i, type: "definitif" },
      { re: /refus[eé]?\b/i, type: "definitif" },
      { re: /paiement\s+refus/i, type: "definitif" },
      { re: /non\s+conforme/i, type: "definitif" },
      { re: /droits?\s+(clos|ferm|expir)/i, type: "definitif" },
      { re: /beneficiaire\s+(inconnu|non\s+identif)/i, type: "definitif" },
      { re: /prescripteur\s+(inconnu|non\s+identif)/i, type: "definitif" },
      { re: /rejet\s+noemie/i, type: "definitif" },
      { re: /signalement\s+d['']anomalie/i, type: "definitif" },
      { re: /erreur\s+technique/i, type: "technique" },
      { re: /indisponible/i, type: "technique" },
      { re: /timeout|time.?out/i, type: "technique" },
      { re: /veuillez\s+r[eé]essayer/i, type: "technique" }
    ];
    function scanAmeliRejets() {
      var rejets = [];
      var candidates = document.querySelectorAll(
        ".alert, .notification, .message, .erreur, .error, .warning, [class*=alert], [class*=error], [class*=rejet], [class*=refus], [role=alert], [role=status], .resultat, .retour, .statut, [class*=statut]"
      );
      for (var i = 0; i < candidates.length; i++) {
        var el = candidates[i];
        var elText = (el.textContent || "").trim();
        if (!elText || elText.length < 5 || elText.length > 500) continue;
        for (var p = 0; p < AMELI_REJET_PATTERNS.length; p++) {
          var pattern = AMELI_REJET_PATTERNS[p];
          if (!pattern.re.test(elText)) continue;
          var key = "AMELI|" + elText.substring(0, 80);
          if (detectedRejets.has(key)) break;
          detectedRejets.add(key);
          var dossierMatch = (el.parentElement ? el.parentElement.textContent : elText).match(/(?:dossier|fse|lot|n[°o])\s*[:=]?\s*([A-Z0-9\-]{4,20})/i);
          var dateMatch = (el.parentElement ? el.parentElement.textContent : elText).match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
          var montantMatch = (el.parentElement ? el.parentElement.textContent : elText).match(/(\d+[.,]\d{2}\s*(?:€|EUR)?)/);
          var rejet = {
            portail: "AMELI",
            numeroDossier: dossierMatch ? dossierMatch[1] : null,
            motif: elText.substring(0, 200),
            dateRejet: dateMatch ? dateMatch[1] : null,
            montant: montantMatch ? montantMatch[1] : null,
            rejetType: pattern.type
          };
          rejets.push(rejet);
          storeRejetLocally(rejet);
          notifyBadgeRejet(rejet);
          if (pattern.type === "definitif") injectRejetNoteCosium(rejet);
          break;
        }
      }
      return rejets;
    }
    function storeRejetLocally(rejet) {
      chrome.storage.local.get(["optibot_rejet_history"], function(result) {
        var history = result.optibot_rejet_history || [];
        history.unshift({
          portail: rejet.portail,
          motif: rejet.motif,
          type: rejet.rejetType || "definitif",
          numeroDossier: rejet.numeroDossier,
          date: rejet.dateRejet,
          ts: Date.now()
        });
        if (history.length > 100) history = history.slice(0, 100);
        chrome.storage.local.set({ optibot_rejet_history: history });
      });
    }
    function notifyBadgeRejet(rejet) {
      chrome.runtime.sendMessage({
        type: "OPTIBOT_REJET_BADGE",
        rejetType: rejet.rejetType || "definitif"
      });
    }
    function injectRejetNoteCosium(rejet) {
      var noteText = "REJET SECU \u2014 " + (rejet.motif || "Motif non precise").substring(0, 100) + (rejet.numeroDossier ? " | Dossier : " + rejet.numeroDossier : "") + " | " + (/* @__PURE__ */ new Date()).toLocaleDateString("fr-FR");
      chrome.runtime.sendMessage({ type: "OPTIBOT_COSIUM_INJECT_NOTE", note: noteText });
    }
    function scanForRejets() {
      if (!enabled) return;
      var rejets = [];
      if (config && currentPortail) {
        var portailConfig = config.portails[currentPortail];
        if (portailConfig && portailConfig.enabled && portailConfig.selectors) {
          var sel = portailConfig.selectors;
          var containers = document.querySelectorAll(sel.rejetContainer);
          containers.forEach(function(container) {
            var rows = container.querySelectorAll(sel.rejetRow);
            rows.forEach(function(row) {
              var numeroDossier = extractText(row, sel.numeroDossier);
              var motif = extractText(row, sel.motif);
              var dateRejet = extractText(row, sel.dateRejet);
              var montant = extractText(row, sel.montant);
              var key = [currentPortail, numeroDossier, dateRejet, montant].join("|");
              if (detectedRejets.has(key)) return;
              if (numeroDossier || motif) {
                detectedRejets.add(key);
                var r = { portail: currentPortail, numeroDossier, motif, dateRejet, montant };
                rejets.push(r);
                storeRejetLocally(r);
                notifyBadgeRejet(r);
              }
            });
          });
        }
      }
      if (currentPortail === "AMELI") {
        var ameliRejets = scanAmeliRejets();
        for (var a = 0; a < ameliRejets.length; a++) rejets.push(ameliRejets[a]);
      }
      var toSend = rejets.filter(function(r) {
        return r.rejetType !== "technique";
      });
      if (toSend.length > 0) sendRejets(toSend);
    }
    function sendRejets(rejets) {
      getSyncToken().then(function(syncToken) {
        if (!syncToken) {
          console.warn("[OptiBot Rejet] Pas de syncToken, rejets non envoyes");
          return;
        }
        rejets.forEach(function(rejet) {
          fetch(REJET_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              syncToken,
              portail: rejet.portail,
              numeroDossier: rejet.numeroDossier,
              motif: rejet.motif,
              dateRejet: rejet.dateRejet,
              montant: rejet.montant
            })
          }).then(function(res) {
            return res.json();
          }).then(function(data) {
            if (data.ok) {
              console.info("[OptiBot Rejet] Rejet envoye:", rejet.numeroDossier, data.matched ? "(match)" : "(no match)");
            }
          }).catch(function() {
          });
        });
      });
    }
    function init() {
      currentPortail = getPortailFromUrl(window.location.href);
      if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(["optibot_rejet_enabled", "optibot_rejet_consent"], function(result) {
          if (result.optibot_rejet_enabled === false) {
            enabled = false;
            return;
          }
          if (result.optibot_rejet_consent !== true) {
            enabled = false;
            return;
          }
          startDetection();
        });
      } else {
        startDetection();
      }
    }
    function startDetection() {
      loadConfig().then(function() {
        setTimeout(scanForRejets, 3e3);
        setInterval(scanForRejets, CHECK_INTERVAL);
        var _scanTimer = null;
        var observer = new MutationObserver(function() {
          clearTimeout(_scanTimer);
          _scanTimer = setTimeout(scanForRejets, 1e3);
        });
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  })();
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZXh0ZW5zaW9uLXNyYy9yZWpldC1kZXRlY3Rvci9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiLyogT3B0aUJvdCBcdTIwMTQgUmVqZXQgRGV0ZWN0b3IgdjEuMFxuICAgQ29udGVudCBzY3JpcHQgZm9yIGF1dG8tZGV0ZWN0aW5nIHJlamVjdGlvbnMgb24gbXV0dWFsIGluc3VyYW5jZSBwb3J0YWxzLlxuICAgRmV0Y2hlcyBzZWxlY3RvciBjb25maWcgZnJvbSByZW1vdGUgQVBJIGFuZCBzY2FucyBwYWdlcyBmb3IgcmVqZWN0aW9ucy5cbiAgIFJHUEQ6IE5vIHNlbnNpdGl2ZSBkYXRhIHN0b3JlZCBsb2NhbGx5LiBEYXRhIHNlbnQgdG8gT3B0aUJvdCBBUEkgb25seS4gKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIEFQSV9CQVNFID0gXCJodHRwczovL29wdGlib3QuZnJcIjtcbiAgdmFyIENPTkZJR19VUkwgPSBBUElfQkFTRSArIFwiL2FwaS9leHRlbnNpb24vcmVqZXQtY29uZmlnXCI7XG4gIHZhciBSRUpFVF9VUkwgPSBBUElfQkFTRSArIFwiL2FwaS9leHRlbnNpb24vcmVqZXQtZGV0ZWN0ZVwiO1xuICB2YXIgQ0hFQ0tfSU5URVJWQUwgPSAxMDAwMDsgLyogMTAgc2Vjb25kcyAqL1xuICB2YXIgY29uZmlnID0gbnVsbDtcbiAgdmFyIGN1cnJlbnRQb3J0YWlsID0gbnVsbDtcbiAgdmFyIGRldGVjdGVkUmVqZXRzID0gbmV3IFNldCgpO1xuICB2YXIgZW5hYmxlZCA9IHRydWU7XG5cbiAgZnVuY3Rpb24gZ2V0UG9ydGFpbEZyb21VcmwodXJsKSB7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcImFsbWVyeXMuY29tXCIpIHx8IHVybC5pbmNsdWRlcyhcImJlLWFsbWVyeXMuY29tXCIpKSByZXR1cm4gXCJBTE1FUllTXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcInZpYW1lZGlzLm5ldFwiKSkgcmV0dXJuIFwiVklBTUVESVNcIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiaXNtLXRwLmZyXCIpKSByZXR1cm4gXCJJVEVMSVNcIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiYWN0aWwuY29tXCIpKSByZXR1cm4gXCJLQUxJWElBXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIm94YW50aXMubmV0XCIpKSByZXR1cm4gXCJPWEFOVElTXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcImdlbmVyYXRpb24uZnJcIikpIHJldHVybiBcIkdFTkVSQVRJT05cIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwiZmZsLXByb21vdGV1ci5jb21cIikgfHwgdXJsLmluY2x1ZGVzKFwic3BzYW50ZS5mclwiKSkgcmV0dXJuIFwiU1BfU0FOVEVcIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwic2FudGVjbGFpci5mclwiKSkgcmV0dXJuIFwiU0FOVEVDTEFJUlwiO1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJsaXZlYnlvcHRpbXVtLmNvbVwiKSkgcmV0dXJuIFwiTEJPXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcInNvbGltdXQuZnJcIikpIHJldHVybiBcIlNPTElNVVRcIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwibWVyY2VybmV0LmZyXCIpIHx8IHVybC5pbmNsdWRlcyhcInNlcnZpY2VzLWZtLm5ldFwiKSkgcmV0dXJuIFwiTUVSQ0VSXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIndlbWluZC5pb1wiKSkgcmV0dXJuIFwiV0VNSU5EXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcImFtZWxpLmZyXCIpKSByZXR1cm4gXCJBTUVMSVwiO1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJjYXJ0ZWJsYW5jaGVwYXJ0ZW5haXJlcy5mclwiKSkgcmV0dXJuIFwiQ0FSVEVfQkxBTkNIRVwiO1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJrYWxpeGlhLmZyXCIpIHx8IHVybC5pbmNsdWRlcyhcImthbGl4aWEtcGFydGVuYWlyZXMuZnJcIikpIHJldHVybiBcIktBTElYSUFcIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwib3B0aXN0eWEuZnJcIikpIHJldHVybiBcIk9QVElTVFlBXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcImdyb3VwYW1hLmNvbVwiKSkgcmV0dXJuIFwiR1JPVVBBTUFcIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwia29yZWxpby5jb21cIikpIHJldHVybiBcIktPUkVMSU9cIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwic2V2ZWFuZS5jb21cIikpIHJldHVybiBcIlNFVkVBTkVcIjtcbiAgICBpZiAodXJsLmluY2x1ZGVzKFwidHAtaGFybW9uaWUubmV0XCIpKSByZXR1cm4gXCJIQVJNT05JRVwiO1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJ0cC1pc2FudGUuZnJcIikpIHJldHVybiBcIklTQU5URVwiO1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJ0cC1lb3ZpLW1jZC5uZXRcIikpIHJldHVybiBcIkFFU0lPXCI7XG4gICAgaWYgKHVybC5pbmNsdWRlcyhcIm15c2FudGVjbGFpci5mclwiKSkgcmV0dXJuIFwiU0FOVEVDTEFJUlwiO1xuICAgIGlmICh1cmwuaW5jbHVkZXMoXCJ0cGNvbXBsZW1lbnRhaXJlLmZyXCIpKSByZXR1cm4gXCJJTlRFUkFNQ1wiO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0U3luY1Rva2VuKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgaWYgKHR5cGVvZiBjaHJvbWUgIT09IFwidW5kZWZpbmVkXCIgJiYgY2hyb21lLnN0b3JhZ2UgJiYgY2hyb21lLnN0b3JhZ2UubG9jYWwpIHtcbiAgICAgICAgLyogTGlyZSBkZXB1aXMgb3B0aWJvdF9hdXRoIChjbFx1MDBFOSBwcmluY2lwYWxlIGRlcHVpcyBsYSBtaWdyYXRpb24gY2hpZmZyZW1lbnQpICovXG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2F1dGhcIl0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICBpZiAocmVzdWx0Lm9wdGlib3RfYXV0aCAmJiByZXN1bHQub3B0aWJvdF9hdXRoLnN5bmNUb2tlbikge1xuICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQub3B0aWJvdF9hdXRoLnN5bmNUb2tlbik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRDb25maWcoKSB7XG4gICAgcmV0dXJuIGZldGNoKENPTkZJR19VUkwpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzKSB7IHJldHVybiByZXMuanNvbigpOyB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgY29uZmlnID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiW09wdGlCb3QgUmVqZXRdIENvbmZpZyBmZXRjaCBmYWlsZWQ6XCIsIGVycik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBleHRyYWN0VGV4dChlbCwgc2VsZWN0b3IpIHtcbiAgICBpZiAoIXNlbGVjdG9yKSByZXR1cm4gbnVsbDtcbiAgICB2YXIgc2VsZWN0b3JzID0gc2VsZWN0b3Iuc3BsaXQoXCIsXCIpLm1hcChmdW5jdGlvbiAocykgeyByZXR1cm4gcy50cmltKCk7IH0pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZWN0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZm91bmQgPSBlbC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yc1tpXSk7XG4gICAgICBpZiAoZm91bmQpIHJldHVybiAoZm91bmQudGV4dENvbnRlbnQgfHwgXCJcIikudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBBbWVsaSBQcm8gcmVqZWN0aW9uIHBhdHRlcm5zIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICB2YXIgQU1FTElfUkVKRVRfUEFUVEVSTlMgPSBbXG4gICAgeyByZTogL3JlamV0W2VcdTAwRTldP1xcYi9pLCB0eXBlOiBcImRlZmluaXRpZlwiIH0sXG4gICAgeyByZTogL3JlZnVzW2VcdTAwRTldP1xcYi9pLCB0eXBlOiBcImRlZmluaXRpZlwiIH0sXG4gICAgeyByZTogL3BhaWVtZW50XFxzK3JlZnVzL2ksIHR5cGU6IFwiZGVmaW5pdGlmXCIgfSxcbiAgICB7IHJlOiAvbm9uXFxzK2NvbmZvcm1lL2ksIHR5cGU6IFwiZGVmaW5pdGlmXCIgfSxcbiAgICB7IHJlOiAvZHJvaXRzP1xccysoY2xvc3xmZXJtfGV4cGlyKS9pLCB0eXBlOiBcImRlZmluaXRpZlwiIH0sXG4gICAgeyByZTogL2JlbmVmaWNpYWlyZVxccysoaW5jb25udXxub25cXHMraWRlbnRpZikvaSwgdHlwZTogXCJkZWZpbml0aWZcIiB9LFxuICAgIHsgcmU6IC9wcmVzY3JpcHRldXJcXHMrKGluY29ubnV8bm9uXFxzK2lkZW50aWYpL2ksIHR5cGU6IFwiZGVmaW5pdGlmXCIgfSxcbiAgICB7IHJlOiAvcmVqZXRcXHMrbm9lbWllL2ksIHR5cGU6IFwiZGVmaW5pdGlmXCIgfSxcbiAgICB7IHJlOiAvc2lnbmFsZW1lbnRcXHMrZFsnJ11hbm9tYWxpZS9pLCB0eXBlOiBcImRlZmluaXRpZlwiIH0sXG4gICAgeyByZTogL2VycmV1clxccyt0ZWNobmlxdWUvaSwgdHlwZTogXCJ0ZWNobmlxdWVcIiB9LFxuICAgIHsgcmU6IC9pbmRpc3BvbmlibGUvaSwgdHlwZTogXCJ0ZWNobmlxdWVcIiB9LFxuICAgIHsgcmU6IC90aW1lb3V0fHRpbWUuP291dC9pLCB0eXBlOiBcInRlY2huaXF1ZVwiIH0sXG4gICAgeyByZTogL3ZldWlsbGV6XFxzK3JbZVx1MDBFOV1lc3NheWVyL2ksIHR5cGU6IFwidGVjaG5pcXVlXCIgfSxcbiAgXTtcblxuICBmdW5jdGlvbiBzY2FuQW1lbGlSZWpldHMoKSB7XG4gICAgdmFyIHJlamV0cyA9IFtdO1xuICAgIC8qIENpYmxlciBsZXMgZWxlbWVudHMgZCdhbGVydGUvc3RhdHV0IFx1MjAxNCBwYXMgdG91cyBsZXMgZWxlbWVudHMgZHUgRE9NICovXG4gICAgdmFyIGNhbmRpZGF0ZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgXCIuYWxlcnQsIC5ub3RpZmljYXRpb24sIC5tZXNzYWdlLCAuZXJyZXVyLCAuZXJyb3IsIC53YXJuaW5nLCBcIiArXG4gICAgICBcIltjbGFzcyo9YWxlcnRdLCBbY2xhc3MqPWVycm9yXSwgW2NsYXNzKj1yZWpldF0sIFtjbGFzcyo9cmVmdXNdLCBcIiArXG4gICAgICBcIltyb2xlPWFsZXJ0XSwgW3JvbGU9c3RhdHVzXSwgLnJlc3VsdGF0LCAucmV0b3VyLCAuc3RhdHV0LCBbY2xhc3MqPXN0YXR1dF1cIlxuICAgICk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbmRpZGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IGNhbmRpZGF0ZXNbaV07XG4gICAgICB2YXIgZWxUZXh0ID0gKGVsLnRleHRDb250ZW50IHx8IFwiXCIpLnRyaW0oKTtcbiAgICAgIGlmICghZWxUZXh0IHx8IGVsVGV4dC5sZW5ndGggPCA1IHx8IGVsVGV4dC5sZW5ndGggPiA1MDApIGNvbnRpbnVlO1xuXG4gICAgICBmb3IgKHZhciBwID0gMDsgcCA8IEFNRUxJX1JFSkVUX1BBVFRFUk5TLmxlbmd0aDsgcCsrKSB7XG4gICAgICAgIHZhciBwYXR0ZXJuID0gQU1FTElfUkVKRVRfUEFUVEVSTlNbcF07XG4gICAgICAgIGlmICghcGF0dGVybi5yZS50ZXN0KGVsVGV4dCkpIGNvbnRpbnVlO1xuXG4gICAgICAgIHZhciBrZXkgPSBcIkFNRUxJfFwiICsgZWxUZXh0LnN1YnN0cmluZygwLCA4MCk7XG4gICAgICAgIGlmIChkZXRlY3RlZFJlamV0cy5oYXMoa2V5KSkgYnJlYWs7XG4gICAgICAgIGRldGVjdGVkUmVqZXRzLmFkZChrZXkpO1xuXG4gICAgICAgIHZhciBkb3NzaWVyTWF0Y2ggPSAoZWwucGFyZW50RWxlbWVudCA/IGVsLnBhcmVudEVsZW1lbnQudGV4dENvbnRlbnQgOiBlbFRleHQpLm1hdGNoKC8oPzpkb3NzaWVyfGZzZXxsb3R8bltcdTAwQjBvXSlcXHMqWzo9XT9cXHMqKFtBLVowLTlcXC1dezQsMjB9KS9pKTtcbiAgICAgICAgdmFyIGRhdGVNYXRjaCA9IChlbC5wYXJlbnRFbGVtZW50ID8gZWwucGFyZW50RWxlbWVudC50ZXh0Q29udGVudCA6IGVsVGV4dCkubWF0Y2goLyhcXGR7Mn1bXFwvXFwtXVxcZHsyfVtcXC9cXC1dXFxkezR9KS8pO1xuICAgICAgICB2YXIgbW9udGFudE1hdGNoID0gKGVsLnBhcmVudEVsZW1lbnQgPyBlbC5wYXJlbnRFbGVtZW50LnRleHRDb250ZW50IDogZWxUZXh0KS5tYXRjaCgvKFxcZCtbLixdXFxkezJ9XFxzKig/Olx1MjBBQ3xFVVIpPykvKTtcblxuICAgICAgICB2YXIgcmVqZXQgPSB7XG4gICAgICAgICAgcG9ydGFpbDogXCJBTUVMSVwiLFxuICAgICAgICAgIG51bWVyb0Rvc3NpZXI6IGRvc3NpZXJNYXRjaCA/IGRvc3NpZXJNYXRjaFsxXSA6IG51bGwsXG4gICAgICAgICAgbW90aWY6IGVsVGV4dC5zdWJzdHJpbmcoMCwgMjAwKSxcbiAgICAgICAgICBkYXRlUmVqZXQ6IGRhdGVNYXRjaCA/IGRhdGVNYXRjaFsxXSA6IG51bGwsXG4gICAgICAgICAgbW9udGFudDogbW9udGFudE1hdGNoID8gbW9udGFudE1hdGNoWzFdIDogbnVsbCxcbiAgICAgICAgICByZWpldFR5cGU6IHBhdHRlcm4udHlwZSxcbiAgICAgICAgfTtcblxuICAgICAgICByZWpldHMucHVzaChyZWpldCk7XG4gICAgICAgIHN0b3JlUmVqZXRMb2NhbGx5KHJlamV0KTtcbiAgICAgICAgbm90aWZ5QmFkZ2VSZWpldChyZWpldCk7XG4gICAgICAgIGlmIChwYXR0ZXJuLnR5cGUgPT09IFwiZGVmaW5pdGlmXCIpIGluamVjdFJlamV0Tm90ZUNvc2l1bShyZWpldCk7XG5cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZWpldHM7XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgSGlzdG9yaXF1ZSBsb2NhbCAocGFzIGNvdGUgc2VydmV1ciBwb3VyIGxlcyB0ZWNobmlxdWVzKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgZnVuY3Rpb24gc3RvcmVSZWpldExvY2FsbHkocmVqZXQpIHtcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wib3B0aWJvdF9yZWpldF9oaXN0b3J5XCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHZhciBoaXN0b3J5ID0gcmVzdWx0Lm9wdGlib3RfcmVqZXRfaGlzdG9yeSB8fCBbXTtcbiAgICAgIGhpc3RvcnkudW5zaGlmdCh7XG4gICAgICAgIHBvcnRhaWw6IHJlamV0LnBvcnRhaWwsIG1vdGlmOiByZWpldC5tb3RpZiwgdHlwZTogcmVqZXQucmVqZXRUeXBlIHx8IFwiZGVmaW5pdGlmXCIsXG4gICAgICAgIG51bWVyb0Rvc3NpZXI6IHJlamV0Lm51bWVyb0Rvc3NpZXIsIGRhdGU6IHJlamV0LmRhdGVSZWpldCwgdHM6IERhdGUubm93KClcbiAgICAgIH0pO1xuICAgICAgaWYgKGhpc3RvcnkubGVuZ3RoID4gMTAwKSBoaXN0b3J5ID0gaGlzdG9yeS5zbGljZSgwLCAxMDApO1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgb3B0aWJvdF9yZWpldF9oaXN0b3J5OiBoaXN0b3J5IH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIEJhZGdlIHJvdWdlIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuICBmdW5jdGlvbiBub3RpZnlCYWRnZVJlamV0KHJlamV0KSB7XG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogXCJPUFRJQk9UX1JFSkVUX0JBREdFXCIsXG4gICAgICByZWpldFR5cGU6IHJlamV0LnJlamV0VHlwZSB8fCBcImRlZmluaXRpZlwiLFxuICAgIH0pO1xuICB9XG5cbiAgLyogXHUyNTAwXHUyNTAwIEluamVjdGlvbiBub3RlIGRhbnMgRVJQIChDb3NpdW0vT3B0aW11bS9ldGMuKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbiAgZnVuY3Rpb24gaW5qZWN0UmVqZXROb3RlQ29zaXVtKHJlamV0KSB7XG4gICAgdmFyIG5vdGVUZXh0ID0gXCJSRUpFVCBTRUNVIFx1MjAxNCBcIiArIChyZWpldC5tb3RpZiB8fCBcIk1vdGlmIG5vbiBwcmVjaXNlXCIpLnN1YnN0cmluZygwLCAxMDApICtcbiAgICAgIChyZWpldC5udW1lcm9Eb3NzaWVyID8gXCIgfCBEb3NzaWVyIDogXCIgKyByZWpldC5udW1lcm9Eb3NzaWVyIDogXCJcIikgK1xuICAgICAgXCIgfCBcIiArIG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKFwiZnItRlJcIik7XG4gICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyB0eXBlOiBcIk9QVElCT1RfQ09TSVVNX0lOSkVDVF9OT1RFXCIsIG5vdGU6IG5vdGVUZXh0IH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbkZvclJlamV0cygpIHtcbiAgICBpZiAoIWVuYWJsZWQpIHJldHVybjtcbiAgICB2YXIgcmVqZXRzID0gW107XG5cbiAgICAvKiAxLiBDb25maWctYmFzZWQgc2NhbiAocG9ydGFpbHMgYXZlYyBzZWxlY3RldXJzIGNvbm51cykgKi9cbiAgICBpZiAoY29uZmlnICYmIGN1cnJlbnRQb3J0YWlsKSB7XG4gICAgICB2YXIgcG9ydGFpbENvbmZpZyA9IGNvbmZpZy5wb3J0YWlsc1tjdXJyZW50UG9ydGFpbF07XG4gICAgICBpZiAocG9ydGFpbENvbmZpZyAmJiBwb3J0YWlsQ29uZmlnLmVuYWJsZWQgJiYgcG9ydGFpbENvbmZpZy5zZWxlY3RvcnMpIHtcbiAgICAgICAgdmFyIHNlbCA9IHBvcnRhaWxDb25maWcuc2VsZWN0b3JzO1xuICAgICAgICB2YXIgY29udGFpbmVycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsLnJlamV0Q29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVycy5mb3JFYWNoKGZ1bmN0aW9uIChjb250YWluZXIpIHtcbiAgICAgICAgICB2YXIgcm93cyA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKHNlbC5yZWpldFJvdyk7XG4gICAgICAgICAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgIHZhciBudW1lcm9Eb3NzaWVyID0gZXh0cmFjdFRleHQocm93LCBzZWwubnVtZXJvRG9zc2llcik7XG4gICAgICAgICAgICB2YXIgbW90aWYgPSBleHRyYWN0VGV4dChyb3csIHNlbC5tb3RpZik7XG4gICAgICAgICAgICB2YXIgZGF0ZVJlamV0ID0gZXh0cmFjdFRleHQocm93LCBzZWwuZGF0ZVJlamV0KTtcbiAgICAgICAgICAgIHZhciBtb250YW50ID0gZXh0cmFjdFRleHQocm93LCBzZWwubW9udGFudCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gW2N1cnJlbnRQb3J0YWlsLCBudW1lcm9Eb3NzaWVyLCBkYXRlUmVqZXQsIG1vbnRhbnRdLmpvaW4oXCJ8XCIpO1xuICAgICAgICAgICAgaWYgKGRldGVjdGVkUmVqZXRzLmhhcyhrZXkpKSByZXR1cm47XG4gICAgICAgICAgICBpZiAobnVtZXJvRG9zc2llciB8fCBtb3RpZikge1xuICAgICAgICAgICAgICBkZXRlY3RlZFJlamV0cy5hZGQoa2V5KTtcbiAgICAgICAgICAgICAgdmFyIHIgPSB7IHBvcnRhaWw6IGN1cnJlbnRQb3J0YWlsLCBudW1lcm9Eb3NzaWVyOiBudW1lcm9Eb3NzaWVyLCBtb3RpZjogbW90aWYsIGRhdGVSZWpldDogZGF0ZVJlamV0LCBtb250YW50OiBtb250YW50IH07XG4gICAgICAgICAgICAgIHJlamV0cy5wdXNoKHIpO1xuICAgICAgICAgICAgICBzdG9yZVJlamV0TG9jYWxseShyKTtcbiAgICAgICAgICAgICAgbm90aWZ5QmFkZ2VSZWpldChyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogMi4gQW1lbGkgUHJvIHNjYW4gKi9cbiAgICBpZiAoY3VycmVudFBvcnRhaWwgPT09IFwiQU1FTElcIikge1xuICAgICAgdmFyIGFtZWxpUmVqZXRzID0gc2NhbkFtZWxpUmVqZXRzKCk7XG4gICAgICBmb3IgKHZhciBhID0gMDsgYSA8IGFtZWxpUmVqZXRzLmxlbmd0aDsgYSsrKSByZWpldHMucHVzaChhbWVsaVJlamV0c1thXSk7XG4gICAgfVxuXG4gICAgLyogRW52b3llciBsZXMgcmVqZXRzIGRlZmluaXRpZnMgYSBsJ0FQSSAqL1xuICAgIHZhciB0b1NlbmQgPSByZWpldHMuZmlsdGVyKGZ1bmN0aW9uKHIpIHsgcmV0dXJuIHIucmVqZXRUeXBlICE9PSBcInRlY2huaXF1ZVwiOyB9KTtcbiAgICBpZiAodG9TZW5kLmxlbmd0aCA+IDApIHNlbmRSZWpldHModG9TZW5kKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNlbmRSZWpldHMocmVqZXRzKSB7XG4gICAgZ2V0U3luY1Rva2VuKCkudGhlbihmdW5jdGlvbiAoc3luY1Rva2VuKSB7XG4gICAgICBpZiAoIXN5bmNUb2tlbikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJbT3B0aUJvdCBSZWpldF0gUGFzIGRlIHN5bmNUb2tlbiwgcmVqZXRzIG5vbiBlbnZveWVzXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlamV0cy5mb3JFYWNoKGZ1bmN0aW9uIChyZWpldCkge1xuICAgICAgICBmZXRjaChSRUpFVF9VUkwsIHtcbiAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBzeW5jVG9rZW46IHN5bmNUb2tlbixcbiAgICAgICAgICAgIHBvcnRhaWw6IHJlamV0LnBvcnRhaWwsXG4gICAgICAgICAgICBudW1lcm9Eb3NzaWVyOiByZWpldC5udW1lcm9Eb3NzaWVyLFxuICAgICAgICAgICAgbW90aWY6IHJlamV0Lm1vdGlmLFxuICAgICAgICAgICAgZGF0ZVJlamV0OiByZWpldC5kYXRlUmVqZXQsXG4gICAgICAgICAgICBtb250YW50OiByZWpldC5tb250YW50LFxuICAgICAgICAgIH0pLFxuICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHsgcmV0dXJuIHJlcy5qc29uKCk7IH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLm9rKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIltPcHRpQm90IFJlamV0XSBSZWpldCBlbnZveWU6XCIsIHJlamV0Lm51bWVyb0Rvc3NpZXIsIGRhdGEubWF0Y2hlZCA/IFwiKG1hdGNoKVwiIDogXCIobm8gbWF0Y2gpXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHsgLyogc2lsZW50ICovIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIGN1cnJlbnRQb3J0YWlsID0gZ2V0UG9ydGFpbEZyb21Vcmwod2luZG93LmxvY2F0aW9uLmhyZWYpO1xuXG4gICAgaWYgKHR5cGVvZiBjaHJvbWUgIT09IFwidW5kZWZpbmVkXCIgJiYgY2hyb21lLnN0b3JhZ2UgJiYgY2hyb21lLnN0b3JhZ2UubG9jYWwpIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X3JlamV0X2VuYWJsZWRcIiwgXCJvcHRpYm90X3JlamV0X2NvbnNlbnRcIl0sIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgaWYgKHJlc3VsdC5vcHRpYm90X3JlamV0X2VuYWJsZWQgPT09IGZhbHNlKSB7IGVuYWJsZWQgPSBmYWxzZTsgcmV0dXJuOyB9XG4gICAgICAgIGlmIChyZXN1bHQub3B0aWJvdF9yZWpldF9jb25zZW50ICE9PSB0cnVlKSB7IGVuYWJsZWQgPSBmYWxzZTsgcmV0dXJuOyB9XG4gICAgICAgIHN0YXJ0RGV0ZWN0aW9uKCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnREZXRlY3Rpb24oKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdGFydERldGVjdGlvbigpIHtcbiAgICBsb2FkQ29uZmlnKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAvKiBEZXRlY3Rpb24gYWN0aXZlIG1lbWUgc2FucyBjb25maWcgKHNjYW4gQW1lbGkvZ2VuZXJpcXVlKSAqL1xuICAgICAgc2V0VGltZW91dChzY2FuRm9yUmVqZXRzLCAzMDAwKTtcbiAgICAgIHNldEludGVydmFsKHNjYW5Gb3JSZWpldHMsIENIRUNLX0lOVEVSVkFMKTtcblxuICAgICAgLyogRGVib3VuY2VkIE11dGF0aW9uT2JzZXJ2ZXIgKi9cbiAgICAgIHZhciBfc2NhblRpbWVyID0gbnVsbDtcbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KF9zY2FuVGltZXIpO1xuICAgICAgICBfc2NhblRpbWVyID0gc2V0VGltZW91dChzY2FuRm9yUmVqZXRzLCAxMDAwKTtcbiAgICAgIH0pO1xuICAgICAgaWYgKGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudC5ib2R5LCB7IGNoaWxkTGlzdDogdHJ1ZSwgc3VidHJlZTogdHJ1ZSB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qIFdhaXQgZm9yIHBhZ2UgdG8gYmUgcmVhZHkgKi9cbiAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdCk7XG4gIH0gZWxzZSB7XG4gICAgaW5pdCgpO1xuICB9XG59KSgpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7O0FBS0EsR0FBQyxXQUFZO0FBQ1g7QUFFQSxRQUFJLFdBQVc7QUFDZixRQUFJLGFBQWEsV0FBVztBQUM1QixRQUFJLFlBQVksV0FBVztBQUMzQixRQUFJLGlCQUFpQjtBQUNyQixRQUFJLFNBQVM7QUFDYixRQUFJLGlCQUFpQjtBQUNyQixRQUFJLGlCQUFpQixvQkFBSSxJQUFJO0FBQzdCLFFBQUksVUFBVTtBQUVkLGFBQVMsa0JBQWtCLEtBQUs7QUFDOUIsVUFBSSxJQUFJLFNBQVMsYUFBYSxLQUFLLElBQUksU0FBUyxnQkFBZ0IsRUFBRyxRQUFPO0FBQzFFLFVBQUksSUFBSSxTQUFTLGNBQWMsRUFBRyxRQUFPO0FBQ3pDLFVBQUksSUFBSSxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBQ3RDLFVBQUksSUFBSSxTQUFTLFdBQVcsRUFBRyxRQUFPO0FBQ3RDLFVBQUksSUFBSSxTQUFTLGFBQWEsRUFBRyxRQUFPO0FBQ3hDLFVBQUksSUFBSSxTQUFTLGVBQWUsRUFBRyxRQUFPO0FBQzFDLFVBQUksSUFBSSxTQUFTLG1CQUFtQixLQUFLLElBQUksU0FBUyxZQUFZLEVBQUcsUUFBTztBQUM1RSxVQUFJLElBQUksU0FBUyxlQUFlLEVBQUcsUUFBTztBQUMxQyxVQUFJLElBQUksU0FBUyxtQkFBbUIsRUFBRyxRQUFPO0FBQzlDLFVBQUksSUFBSSxTQUFTLFlBQVksRUFBRyxRQUFPO0FBQ3ZDLFVBQUksSUFBSSxTQUFTLGNBQWMsS0FBSyxJQUFJLFNBQVMsaUJBQWlCLEVBQUcsUUFBTztBQUM1RSxVQUFJLElBQUksU0FBUyxXQUFXLEVBQUcsUUFBTztBQUN0QyxVQUFJLElBQUksU0FBUyxVQUFVLEVBQUcsUUFBTztBQUNyQyxVQUFJLElBQUksU0FBUyw0QkFBNEIsRUFBRyxRQUFPO0FBQ3ZELFVBQUksSUFBSSxTQUFT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
