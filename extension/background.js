"use strict";
(() => {
  // extension-src/background/index.js
  var ACTIVE_DOMAINS = [
    /* Portails mutuelles TP (25) */
    "livebyoptimum.com",
    "almerys.com",
    "be-almerys.com",
    "viamedis.net",
    "ism-tp.fr",
    "actil.com",
    "mutuelle-optique.fr",
    "wemind.io",
    "apgis.com",
    "ameli.fr",
    "solimut.fr",
    "ffl-promoteur.com",
    "spsante.fr",
    "services-fm.net",
    "mercernet.fr",
    "oxantis.net",
    "santeclair.fr",
    "generation.fr",
    "carteblanchepartenaires.fr",
    "kalixia.fr",
    "kalixia-partenaires.fr",
    "optistya.fr",
    "groupama.com",
    "korelio.com",
    "seveane.com",
    "tp-harmonie.net",
    "tp-isante.fr",
    "tp-eovi-mcd.net",
    "mysanteclair.fr",
    "tpcomplementaire.fr",
    /* ERP opticiens */
    "igestion.fr",
    "optiflex.fr",
    "winoptics.fr",
    "irium-software.fr",
    "lyra-optique.fr"
  ];
  var INACTIVITY_MINUTES = 15;
  var API_BASE = "https://optibot.fr";
  function isActiveDomain(url) {
    try {
      const hostname = new URL(url).hostname;
      return ACTIVE_DOMAINS.some(function(d) {
        return hostname.includes(d);
      });
    } catch (e) {
      return false;
    }
  }
  function drawIcon(size, color, callback) {
    var canvas = new OffscreenCanvas(size, size);
    var ctx = canvas.getContext("2d");
    var r = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "bold " + Math.round(size * 0.55) + "px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("O", size / 2, size / 2 + size * 0.03);
    var imageData = ctx.getImageData(0, 0, size, size);
    callback(imageData);
  }
  function updateIcon(tabId, url) {
    var active = isActiveDomain(url || "");
    var color = active ? "#2563eb" : "#94a3b8";
    var imageDataMap = {};
    var sizes = [16, 32];
    var done = 0;
    sizes.forEach(function(size) {
      drawIcon(size, color, function(imageData) {
        imageDataMap[size] = imageData;
        done++;
        if (done === sizes.length) {
          chrome.action.setIcon({ tabId, imageData: imageDataMap });
        }
      });
    });
  }
  chrome.tabs.onActivated.addListener(function(info) {
    chrome.tabs.get(info.tabId, function(tab) {
      if (tab && tab.url) {
        updateIcon(tab.id, tab.url);
        forwardPECToCosiumIfNeeded(tab);
      }
    });
  });
  function forwardPECToCosiumIfNeeded(tab) {
    chrome.storage.local.get(["optibot_cosium_url", "optibot_pec_pending"], function(result) {
      var cosiumUrl = result.optibot_cosium_url;
      var pec = result.optibot_pec_pending;
      if (!cosiumUrl || !pec || !tab.url) return;
      try {
        var cosiumOrigin = new URL(cosiumUrl).origin;
        if (!tab.url.startsWith(cosiumOrigin)) return;
      } catch (e) {
        return;
      }
      if (Date.now() - pec.ts > 30 * 60 * 1e3) {
        chrome.storage.local.remove("optibot_pec_pending");
        return;
      }
      chrome.tabs.sendMessage(tab.id, {
        type: "OPTIBOT_INJECT_PEC",
        pecData: pec.encryptedPayload
      }, function() {
        if (chrome.runtime.lastError) {
        }
      });
    });
  }
  var _pageLoadedTimers = {};
  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url || changeInfo.status === "complete") {
      updateIcon(tabId, tab.url || changeInfo.url || "");
    }
    if (changeInfo.status === "complete" && tab.url && isActiveDomain(tab.url)) {
      clearTimeout(_pageLoadedTimers[tabId]);
      _pageLoadedTimers[tabId] = setTimeout(function() {
        delete _pageLoadedTimers[tabId];
        chrome.tabs.sendMessage(tabId, { type: "OPTIBOT_PAGE_LOADED" }, function() {
          if (chrome.runtime.lastError) {
          }
        });
        chrome.storage.local.get(["optibot_rpa"], function(result) {
          var rpa = result.optibot_rpa;
          if (!rpa || !rpa.target) return;
          var knownDomains = {
            almerys: ["almerys.com", "be-almerys.com"],
            wemind: ["wemind.io"],
            generation: ["generation.fr"],
            oxantis: ["oxantis.net"],
            viamedis: ["viamedis.net"]
          };
          var domains = knownDomains[rpa.target] || [];
          var tabUrl = tab.url || "";
          var matches = domains.some(function(d) {
            return tabUrl.includes(d);
          });
          if (!matches && rpa.targetHostname) {
            matches = tabUrl.includes(rpa.targetHostname);
          }
          if (!matches && rpa.target.indexOf(".") !== -1) {
            matches = tabUrl.includes(rpa.target);
          }
          if (!matches) return;
          if (Date.now() - rpa.ts > 3e5) {
            chrome.storage.local.remove("optibot_rpa");
            return;
          }
          chrome.tabs.sendMessage(tabId, { type: "OPTIBOT_CHECK_RPA" }, function() {
            if (chrome.runtime.lastError) {
            }
          });
        });
      }, 800);
    }
  });
  function resetLockAlarm() {
    chrome.alarms.clear("optibot_lock", function() {
      chrome.alarms.create("optibot_lock", { delayInMinutes: INACTIVITY_MINUTES });
    });
    chrome.storage.local.set({ optibot_lock: { lockAt: Date.now() + INACTIVITY_MINUTES * 60 * 1e3 } });
  }
  resetLockAlarm();
  chrome.alarms.create("optibot_dynamic_parcours", { delayInMinutes: 1, periodInMinutes: 30 });
  function fetchAndCacheDynamicParcours() {
    chrome.storage.local.get(["optibot_auth"], function(result) {
      var auth = result.optibot_auth || {};
      if (!auth.syncToken) return;
      fetch(API_BASE + "/api/extension/parcours?handlers=true", {
        headers: { "Authorization": "Bearer " + auth.syncToken }
      }).then(function(r) {
        return r.json();
      }).then(function(data) {
        if (Array.isArray(data.handlers)) {
          chrome.storage.local.set({
            optibot_dynamic_parcours: { handlers: data.handlers, ts: Date.now() }
          });
        }
      }).catch(function(err) {
        console.warn("[OptiBot] dynamic parcours fetch failed:", err);
      });
    });
  }
  function fetchAndCacheSelectorOverrides() {
    fetch(API_BASE + "/api/extension/selectors").then(function(r) {
      return r.json();
    }).then(function(data) {
      if (data && data.overrides) {
        chrome.storage.local.set({
          optibot_selector_overrides: { overrides: data.overrides, version: data.version || 1, ts: Date.now() }
        });
      }
    }).catch(function(err) {
      console.warn("[OptiBot] selector overrides fetch failed:", err);
    });
  }
  var MAPPINGS_CHECK_ALARM = "optibot_mappings_check";
  chrome.alarms.create(MAPPINGS_CHECK_ALARM, { delayInMinutes: 2, periodInMinutes: 1440 });
  function fetchAndCacheMappings() {
    chrome.storage.local.get(["optibot_mappings", "optibot_auth"], function(result) {
      var auth = result.optibot_auth || {};
      var cached = result.optibot_mappings || {};
      var localVersion = cached.version || 0;
      var headers = { "Content-Type": "application/json" };
      if (auth.syncToken) headers["Authorization"] = "Bearer " + auth.syncToken;
      fetch(API_BASE + "/api/extension/mappings?version=" + localVersion, { headers }).then(function(r) {
        if (r.status === 304) {
          console.info("[OptiBot] Mappings a jour (version " + localVersion + ")");
          return null;
        }
        return r.json();
      }).then(function(data) {
        if (!data) return;
        if (data.version && data.sources) {
          chrome.storage.local.set({
            optibot_mappings: { version: data.version, sources: data.sources, ts: Date.now() }
          });
          console.info("[OptiBot] Mappings mis a jour \u2192 version " + data.version + " (" + data.sources.length + " sources)");
          chrome.tabs.query({ active: true }, function(tabs) {
            tabs.forEach(function(tab) {
              if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { type: "OPTIBOT_MAPPINGS_UPDATED", version: data.version }).catch(function() {
                });
              }
            });
          });
        }
      }).catch(function(err) {
        console.warn("[OptiBot] mappings fetch failed:", err);
      });
    });
  }
  var _sseReader = null;
  var _sseRetryCount = 0;
  var _sseRetryTimer = null;
  var _sseConnected = false;
  var SSE_RETRY_DELAYS = [5e3, 1e4, 3e4, 6e4];
  function connectSSE() {
    chrome.storage.local.get(["optibot_auth", "optibot_lock"], function(result) {
      var auth = result.optibot_auth || {};
      var lock = result.optibot_lock || {};
      if (!auth.syncToken) return;
      if (lock.lockAt && lock.lockAt < Date.now()) return;
      disconnectSSE();
      _sseConnected = true;
      var url = API_BASE + "/api/extension/sse";
      fetch(url, { headers: { "Authorization": "Bearer " + auth.syncToken } }).then(function(response) {
        if (!response.ok || !response.body) {
          throw new Error("SSE response " + response.status);
        }
        _sseReader = response.body.getReader();
        _sseRetryCount = 0;
        var decoder = new TextDecoder();
        var buffer = "";
        function read() {
          if (!_sseConnected) return;
          _sseReader.read().then(function(result2) {
            if (result2.done) {
              scheduleSSEReconnect();
              return;
            }
            buffer += decoder.decode(result2.value, { stream: true });
            var events = buffer.split("\n\n");
            buffer = events.pop();
            events.forEach(function(raw) {
              if (!raw || raw.trim().charAt(0) === ":") return;
              var dataLine = null;
              var lines = raw.split("\n");
              for (var i = 0; i < lines.length; i++) {
                if (lines[i].indexOf("data:") === 0) {
                  dataLine = lines[i].slice(5).trim();
                  break;
                }
              }
              if (!dataLine) return;
              try {
                var payload = JSON.parse(dataLine);
                handleSSEEvent(payload);
              } catch (e) {
              }
            });
            read();
          }).catch(function(err) {
            console.warn("[OptiBot] SSE read error:", err);
            if (_sseConnected) scheduleSSEReconnect();
          });
        }
        read();
      }).catch(function(err) {
        console.warn("[OptiBot] SSE connection error:", err);
        if (_sseConnected) scheduleSSEReconnect();
      });
    });
  }
  function disconnectSSE() {
    _sseConnected = false;
    if (_sseReader) {
      try {
        _sseReader.cancel();
      } catch (e) {
      }
      _sseReader = null;
    }
    if (_sseRetryTimer) {
      clearTimeout(_sseRetryTimer);
      _sseRetryTimer = null;
    }
  }
  function scheduleSSEReconnect() {
    if (_sseRetryTimer) return;
    var delay = SSE_RETRY_DELAYS[Math.min(_sseRetryCount, SSE_RETRY_DELAYS.length - 1)];
    _sseRetryCount++;
    _sseRetryTimer = setTimeout(function() {
      _sseRetryTimer = null;
      connectSSE();
    }, delay);
  }
  function handleSSEEvent(payload) {
    if (!payload || !payload.type) return;
    if (payload.type === "reconnect") {
      scheduleSSEReconnect();
      return;
    }
    if (payload.type === "connected") {
      return;
    }
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        if (tab.url && (isActiveDomain(tab.url) || tab.url.indexOf("optibot.fr") !== -1)) {
          chrome.tabs.sendMessage(tab.id, {
            type: "OPTIBOT_SSE_EVENT",
            payload
          }, function() {
            if (chrome.runtime.lastError) {
            }
          });
        }
      });
    });
  }
  chrome.alarms.create("optibot_sse_keepalive", { delayInMinutes: 20, periodInMinutes: 20 });
  chrome.storage.local.get(["optibot_cosium_url"], function(result) {
    if (result.optibot_cosium_url) {
      registerCosiumScripts(result.optibot_cosium_url);
    }
  });
  async function registerCosiumScripts(cosiumUrl) {
    try {
      var origin = new URL(cosiumUrl).origin + "/*";
      try {
        await chrome.scripting.unregisterContentScripts({ ids: ["optibot-cosium"] });
      } catch (e) {
      }
      await chrome.scripting.registerContentScripts([{
        id: "optibot-cosium",
        matches: [origin],
        js: ["crypto.js", "erp-bridge.js"],
        allFrames: true,
        runAt: "document_idle"
      }]);
      var cosiumDomain = new URL(cosiumUrl).hostname;
      if (!ACTIVE_DOMAINS.includes(cosiumDomain)) {
        ACTIVE_DOMAINS.push(cosiumDomain);
      }
      chrome.storage.local.set({ optibot_cosium_url: cosiumUrl });
    } catch (e) {
      console.warn("[OptiBot] Cosium script registration failed:", e);
    }
  }
  fetchAndCacheDynamicParcours();
  fetchAndCacheSelectorOverrides();
  fetchAndCacheMappings();
  connectSSE();
  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === "optibot_lock") {
      chrome.storage.local.set({ optibot_lock: { lockAt: Date.now() - 1e3 } });
      chrome.storage.local.remove(["optibot_cache", "optibot_rpa"]);
      disconnectSSE();
    }
    if (alarm.name === "optibot_dynamic_parcours") {
      fetchAndCacheDynamicParcours();
      fetchAndCacheSelectorOverrides();
    }
    if (alarm.name === MAPPINGS_CHECK_ALARM) {
      fetchAndCacheMappings();
    }
    if (alarm.name === "optibot_sse_keepalive") {
      if (!_sseConnected || !_sseReader) {
        connectSSE();
      }
    }
  });
  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg && msg.type === "OPTIBOT_OPEN_TAB" && msg.url) {
      chrome.tabs.create({ url: msg.url });
    }
    if (msg && msg.type === "OPTIBOT_RENEW_LOCK") {
      resetLockAlarm();
      if (!_sseConnected) connectSSE();
    }
    if (msg && msg.type === "OPTIBOT_FIELD_FEEDBACK" && msg.payload) {
      chrome.storage.local.get(["optibot_auth"], function(result) {
        var auth = result.optibot_auth || {};
        if (!auth.syncToken) {
          sendResponse({ ok: false, error: "not_authenticated" });
          return;
        }
        fetch(API_BASE + "/api/extension/field-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + auth.syncToken
          },
          body: JSON.stringify({
            selector: msg.payload.selector,
            fieldType: msg.payload.fieldType,
            portal: msg.payload.portal,
            url: msg.payload.url,
            ts: msg.payload.ts
          })
        }).then(function(r) {
          return r.json();
        }).then(function(data) {
          sendResponse({ ok: true, data });
        }).catch(function(err) {
          console.warn("[OptiBot] field-feedback failed:", err);
          sendResponse({ ok: false, error: err.message });
        });
      });
      return true;
    }
    if (msg && msg.type === "OPTIBOT_PING" && msg.payloads) {
      msg.payloads.forEach(function(p) {
        fetch(p.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p.body)
        }).catch(function(err) {
          console.warn("[OptiBot] ping relay failed:", err);
        });
      });
    }
    if (msg && msg.type === "OPTIBOT_SET_COSIUM_URL") {
      registerCosiumScripts(msg.url);
      sendResponse({ ok: true });
      return true;
    }
    if (msg && msg.type === "OPTIBOT_REJET_BADGE") {
      var badgeColor = msg.rejetType === "technique" ? "#f59e0b" : "#ef4444";
      var badgeText = msg.rejetType === "technique" ? "!" : "REJET";
      chrome.action.setBadgeText({ text: badgeText });
      chrome.action.setBadgeBackgroundColor({ color: badgeColor });
      setTimeout(function() {
        chrome.action.setBadgeText({ text: "" });
      }, 3e4);
    }
    if (msg && msg.type === "OPTIBOT_COSIUM_INJECT_NOTE") {
      chrome.storage.local.get(["optibot_cosium_url"], function(result) {
        if (!result.optibot_cosium_url) return;
        var cosiumOrigin = new URL(result.optibot_cosium_url).origin;
        chrome.tabs.query({}, function(tabs) {
          for (var i = 0; i < tabs.length; i++) {
            if (tabs[i].url && tabs[i].url.startsWith(cosiumOrigin)) {
              chrome.tabs.sendMessage(tabs[i].id, {
                type: "OPTIBOT_INJECT_REJET_NOTE",
                note: msg.note
              }, function() {
                if (chrome.runtime.lastError) {
                }
              });
              break;
            }
          }
        });
      });
    }
    if (msg && msg.type === "OPTIBOT_COSIUM_SCRAPED") {
      chrome.storage.local.set({
        optibot_cosium_status: { scraped: true, fields: msg.fields, ts: Date.now() }
      });
    }
    if (msg && msg.type === "OPTIBOT_PEC_CAPTURED") {
      chrome.storage.local.set({
        optibot_pec_pending: {
          encryptedPayload: msg.encryptedPayload,
          source: msg.source,
          ts: Date.now()
        }
      });
    }
    if (msg && msg.type === "OPTIBOT_SEND_STATUS") {
      chrome.storage.local.get(["optibot_auth"], function(result) {
        var auth = result.optibot_auth || {};
        if (!auth.syncToken) return;
        fetch(API_BASE + "/api/extension/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            syncToken: auth.syncToken,
            status: msg.status || "idle",
            portal: msg.portal || null,
            details: msg.details || null
          })
        }).catch(function(err) {
          console.warn("[OptiBot] status send failed:", err);
        });
      });
    }
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZXh0ZW5zaW9uLXNyYy9iYWNrZ3JvdW5kL2luZGV4LmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKiBPcHRpQm90IFx1MjAxNCBTZXJ2aWNlIFdvcmtlciA6IGljb25lIGR5bmFtaXF1ZSArIGxvY2sgaW5hY3Rpdml0ZSArIHJlbW90ZSBjb25maWcgKyBTU0UgKi9cblxuY29uc3QgQUNUSVZFX0RPTUFJTlMgPSBbXG4gIC8qIFBvcnRhaWxzIG11dHVlbGxlcyBUUCAoMjUpICovXG4gIFwibGl2ZWJ5b3B0aW11bS5jb21cIixcbiAgXCJhbG1lcnlzLmNvbVwiLFxuICBcImJlLWFsbWVyeXMuY29tXCIsXG4gIFwidmlhbWVkaXMubmV0XCIsXG4gIFwiaXNtLXRwLmZyXCIsXG4gIFwiYWN0aWwuY29tXCIsXG4gIFwibXV0dWVsbGUtb3B0aXF1ZS5mclwiLFxuICBcIndlbWluZC5pb1wiLFxuICBcImFwZ2lzLmNvbVwiLFxuICBcImFtZWxpLmZyXCIsXG4gIFwic29saW11dC5mclwiLFxuICBcImZmbC1wcm9tb3RldXIuY29tXCIsXG4gIFwic3BzYW50ZS5mclwiLFxuICBcInNlcnZpY2VzLWZtLm5ldFwiLFxuICBcIm1lcmNlcm5ldC5mclwiLFxuICBcIm94YW50aXMubmV0XCIsXG4gIFwic2FudGVjbGFpci5mclwiLFxuICBcImdlbmVyYXRpb24uZnJcIixcbiAgXCJjYXJ0ZWJsYW5jaGVwYXJ0ZW5haXJlcy5mclwiLFxuICBcImthbGl4aWEuZnJcIixcbiAgXCJrYWxpeGlhLXBhcnRlbmFpcmVzLmZyXCIsXG4gIFwib3B0aXN0eWEuZnJcIixcbiAgXCJncm91cGFtYS5jb21cIixcbiAgXCJrb3JlbGlvLmNvbVwiLFxuICBcInNldmVhbmUuY29tXCIsXG4gIFwidHAtaGFybW9uaWUubmV0XCIsXG4gIFwidHAtaXNhbnRlLmZyXCIsXG4gIFwidHAtZW92aS1tY2QubmV0XCIsXG4gIFwibXlzYW50ZWNsYWlyLmZyXCIsXG4gIFwidHBjb21wbGVtZW50YWlyZS5mclwiLFxuICAvKiBFUlAgb3B0aWNpZW5zICovXG4gIFwiaWdlc3Rpb24uZnJcIixcbiAgXCJvcHRpZmxleC5mclwiLFxuICBcIndpbm9wdGljcy5mclwiLFxuICBcImlyaXVtLXNvZnR3YXJlLmZyXCIsXG4gIFwibHlyYS1vcHRpcXVlLmZyXCIsXG5dO1xuXG5jb25zdCBJTkFDVElWSVRZX01JTlVURVMgPSAxNTtcbmNvbnN0IEFQSV9CQVNFID0gXCJodHRwczovL29wdGlib3QuZnJcIjtcblxuZnVuY3Rpb24gaXNBY3RpdmVEb21haW4odXJsKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgaG9zdG5hbWUgPSBuZXcgVVJMKHVybCkuaG9zdG5hbWU7XG4gICAgcmV0dXJuIEFDVElWRV9ET01BSU5TLnNvbWUoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGhvc3RuYW1lLmluY2x1ZGVzKGQpOyB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkcmF3SWNvbihzaXplLCBjb2xvciwgY2FsbGJhY2spIHtcbiAgdmFyIGNhbnZhcyA9IG5ldyBPZmZzY3JlZW5DYW52YXMoc2l6ZSwgc2l6ZSk7XG4gIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gIC8qIEZvbmQgYXJyb25kaSAqL1xuICB2YXIgciA9IHNpemUgKiAwLjI7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbyhyLCAwKTtcbiAgY3R4LmxpbmVUbyhzaXplIC0gciwgMCk7XG4gIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHNpemUsIDAsIHNpemUsIHIpO1xuICBjdHgubGluZVRvKHNpemUsIHNpemUgLSByKTtcbiAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oc2l6ZSwgc2l6ZSwgc2l6ZSAtIHIsIHNpemUpO1xuICBjdHgubGluZVRvKHIsIHNpemUpO1xuICBjdHgucXVhZHJhdGljQ3VydmVUbygwLCBzaXplLCAwLCBzaXplIC0gcik7XG4gIGN0eC5saW5lVG8oMCwgcik7XG4gIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKDAsIDAsIHIsIDApO1xuICBjdHguY2xvc2VQYXRoKCk7XG4gIGN0eC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgY3R4LmZpbGwoKTtcblxuICAvKiBMZXR0cmUgTyAqL1xuICBjdHguZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICBjdHguZm9udCA9IFwiYm9sZCBcIiArIE1hdGgucm91bmQoc2l6ZSAqIDAuNTUpICsgXCJweCBzYW5zLXNlcmlmXCI7XG4gIGN0eC50ZXh0QWxpZ24gPSBcImNlbnRlclwiO1xuICBjdHgudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgY3R4LmZpbGxUZXh0KFwiT1wiLCBzaXplIC8gMiwgc2l6ZSAvIDIgKyBzaXplICogMC4wMyk7XG5cbiAgdmFyIGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgc2l6ZSwgc2l6ZSk7XG4gIGNhbGxiYWNrKGltYWdlRGF0YSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUljb24odGFiSWQsIHVybCkge1xuICB2YXIgYWN0aXZlID0gaXNBY3RpdmVEb21haW4odXJsIHx8IFwiXCIpO1xuICB2YXIgY29sb3IgPSBhY3RpdmUgPyBcIiMyNTYzZWJcIiA6IFwiIzk0YTNiOFwiO1xuXG4gIHZhciBpbWFnZURhdGFNYXAgPSB7fTtcbiAgdmFyIHNpemVzID0gWzE2LCAzMl07XG4gIHZhciBkb25lID0gMDtcblxuICBzaXplcy5mb3JFYWNoKGZ1bmN0aW9uIChzaXplKSB7XG4gICAgZHJhd0ljb24oc2l6ZSwgY29sb3IsIGZ1bmN0aW9uIChpbWFnZURhdGEpIHtcbiAgICAgIGltYWdlRGF0YU1hcFtzaXplXSA9IGltYWdlRGF0YTtcbiAgICAgIGRvbmUrKztcbiAgICAgIGlmIChkb25lID09PSBzaXplcy5sZW5ndGgpIHtcbiAgICAgICAgY2hyb21lLmFjdGlvbi5zZXRJY29uKHsgdGFiSWQ6IHRhYklkLCBpbWFnZURhdGE6IGltYWdlRGF0YU1hcCB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qIE1ldHRyZSBhIGpvdXIgcXVhbmQgb24gY2hhbmdlIGQnb25nbGV0ICovXG5jaHJvbWUudGFicy5vbkFjdGl2YXRlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAoaW5mbykge1xuICBjaHJvbWUudGFicy5nZXQoaW5mby50YWJJZCwgZnVuY3Rpb24gKHRhYikge1xuICAgIGlmICh0YWIgJiYgdGFiLnVybCkge1xuICAgICAgdXBkYXRlSWNvbih0YWIuaWQsIHRhYi51cmwpO1xuICAgICAgZm9yd2FyZFBFQ1RvQ29zaXVtSWZOZWVkZWQodGFiKTtcbiAgICB9XG4gIH0pO1xufSk7XG5cbi8qIEZvcndhcmRpbmcgUEVDIHZlcnMgQ29zaXVtIHF1YW5kIG9uIGJhc2N1bGUgc3VyIGwnb25nbGV0IEVSUCAqL1xuZnVuY3Rpb24gZm9yd2FyZFBFQ1RvQ29zaXVtSWZOZWVkZWQodGFiKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2Nvc2l1bV91cmxcIiwgXCJvcHRpYm90X3BlY19wZW5kaW5nXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgY29zaXVtVXJsID0gcmVzdWx0Lm9wdGlib3RfY29zaXVtX3VybDtcbiAgICB2YXIgcGVjID0gcmVzdWx0Lm9wdGlib3RfcGVjX3BlbmRpbmc7XG4gICAgaWYgKCFjb3NpdW1VcmwgfHwgIXBlYyB8fCAhdGFiLnVybCkgcmV0dXJuO1xuICAgIHRyeSB7XG4gICAgICB2YXIgY29zaXVtT3JpZ2luID0gbmV3IFVSTChjb3NpdW1VcmwpLm9yaWdpbjtcbiAgICAgIGlmICghdGFiLnVybC5zdGFydHNXaXRoKGNvc2l1bU9yaWdpbikpIHJldHVybjtcbiAgICB9IGNhdGNoKGUpIHsgcmV0dXJuOyB9XG4gICAgLyogRnJhaWNoZXVyIDogbWF4IDMwIG1pbiAqL1xuICAgIGlmIChEYXRlLm5vdygpIC0gcGVjLnRzID4gMzAgKiA2MCAqIDEwMDApIHtcbiAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnJlbW92ZShcIm9wdGlib3RfcGVjX3BlbmRpbmdcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xuICAgICAgdHlwZTogXCJPUFRJQk9UX0lOSkVDVF9QRUNcIixcbiAgICAgIHBlY0RhdGE6IHBlYy5lbmNyeXB0ZWRQYXlsb2FkXG4gICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7fSAvKiBzaWxlbmNpZXV4ICovXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKiBNZXR0cmUgYSBqb3VyIHF1YW5kIGxhIHBhZ2UgY2hhbmdlICovXG52YXIgX3BhZ2VMb2FkZWRUaW1lcnMgPSB7fTtcbmNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikge1xuICBpZiAoY2hhbmdlSW5mby51cmwgfHwgY2hhbmdlSW5mby5zdGF0dXMgPT09IFwiY29tcGxldGVcIikge1xuICAgIHVwZGF0ZUljb24odGFiSWQsIHRhYi51cmwgfHwgY2hhbmdlSW5mby51cmwgfHwgXCJcIik7XG4gIH1cbiAgLyogQXV0by1yZXBsYXkgOiBub3RpZmllciBsZSBjb250ZW50IHNjcmlwdCBxdWFuZCB1bmUgcGFnZSBhY3RpdmUgZXN0IGNoYXJnZWUgKGRlYm91bmNlIDUwMG1zKSAqL1xuICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT09IFwiY29tcGxldGVcIiAmJiB0YWIudXJsICYmIGlzQWN0aXZlRG9tYWluKHRhYi51cmwpKSB7XG4gICAgY2xlYXJUaW1lb3V0KF9wYWdlTG9hZGVkVGltZXJzW3RhYklkXSk7XG4gICAgX3BhZ2VMb2FkZWRUaW1lcnNbdGFiSWRdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGRlbGV0ZSBfcGFnZUxvYWRlZFRpbWVyc1t0YWJJZF07XG4gICAgICAvKiBFbnZveWVyIE9QVElCT1RfUEFHRV9MT0FERUQgYXUgbm91dmVsIG9uZ2xldCAoZml4IGNyb3NzLWRvbWFpbiBBbG1lcnlzIHRhcmdldD1fYmxhbmspICovXG4gICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwgeyB0eXBlOiBcIk9QVElCT1RfUEFHRV9MT0FERURcIiB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge30gLyogc2lsZW5jaWV1eCAqL1xuICAgICAgfSk7XG4gICAgICAvKiBWMy0xMCA6IFByb3BhZ2VyIG9wdGlib3RfcnBhIFx1MjAxNCBtYXRjaGluZyBkeW5hbWlxdWUgc3VyIHRvdXQgZG9tYWluZSAqL1xuICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcIm9wdGlib3RfcnBhXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgdmFyIHJwYSA9IHJlc3VsdC5vcHRpYm90X3JwYTtcbiAgICAgICAgaWYgKCFycGEgfHwgIXJwYS50YXJnZXQpIHJldHVybjtcbiAgICAgICAgLyogTWFwcGluZyBjb25udSBwb3VyIGxlcyBib3RzIGNvZGVzIGVuIGR1ciAqL1xuICAgICAgICB2YXIga25vd25Eb21haW5zID0ge1xuICAgICAgICAgIGFsbWVyeXM6IFtcImFsbWVyeXMuY29tXCIsIFwiYmUtYWxtZXJ5cy5jb21cIl0sXG4gICAgICAgICAgd2VtaW5kOiBbXCJ3ZW1pbmQuaW9cIl0sXG4gICAgICAgICAgZ2VuZXJhdGlvbjogW1wiZ2VuZXJhdGlvbi5mclwiXSxcbiAgICAgICAgICBveGFudGlzOiBbXCJveGFudGlzLm5ldFwiXSxcbiAgICAgICAgICB2aWFtZWRpczogW1widmlhbWVkaXMubmV0XCJdXG4gICAgICAgIH07XG4gICAgICAgIHZhciBkb21haW5zID0ga25vd25Eb21haW5zW3JwYS50YXJnZXRdIHx8IFtdO1xuICAgICAgICB2YXIgdGFiVXJsID0gdGFiLnVybCB8fCBcIlwiO1xuICAgICAgICB2YXIgbWF0Y2hlcyA9IGRvbWFpbnMuc29tZShmdW5jdGlvbihkKSB7IHJldHVybiB0YWJVcmwuaW5jbHVkZXMoZCk7IH0pO1xuICAgICAgICAvKiBNYXRjaGluZyBkeW5hbWlxdWUgOiBzaSBsZSBSUEEgY29udGllbnQgdW4gdGFyZ2V0SG9zdG5hbWUsIG1hdGNoZXIgZGVzc3VzICovXG4gICAgICAgIGlmICghbWF0Y2hlcyAmJiBycGEudGFyZ2V0SG9zdG5hbWUpIHtcbiAgICAgICAgICBtYXRjaGVzID0gdGFiVXJsLmluY2x1ZGVzKHJwYS50YXJnZXRIb3N0bmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogRGVybmllciByZWNvdXJzIDogbWF0Y2hlciBsZSB0YXJnZXQgZGlyZWN0ZW1lbnQgY29tbWUgc291cy1jaGFpbmUgZHUgZG9tYWluZSAqL1xuICAgICAgICBpZiAoIW1hdGNoZXMgJiYgcnBhLnRhcmdldC5pbmRleE9mKFwiLlwiKSAhPT0gLTEpIHtcbiAgICAgICAgICBtYXRjaGVzID0gdGFiVXJsLmluY2x1ZGVzKHJwYS50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghbWF0Y2hlcykgcmV0dXJuO1xuICAgICAgICAvKiBEb25uXHUwMEU5ZXMgZnJhXHUwMEVFY2hlcyAoPCA1IG1pbikgXHUyMDE0IGRcdTAwRTljbGVuY2hlciBjaGVja0FuZFN0YXJ0UlBBIHZpYSBsZSBjb250ZW50IHNjcmlwdCAqL1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHJwYS50cyA+IDMwMDAwMCkgeyBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoXCJvcHRpYm90X3JwYVwiKTsgcmV0dXJuOyB9XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7IHR5cGU6IFwiT1BUSUJPVF9DSEVDS19SUEFcIiB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7fSAvKiBzaWxlbmNpZXV4ICovXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgODAwKTtcbiAgfVxufSk7XG5cbi8qIFx1MjUwMFx1MjUwMCBMb2NrIGQnaW5hY3Rpdml0ZSBhdmVjIGNocm9tZS5hbGFybXMgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG5mdW5jdGlvbiByZXNldExvY2tBbGFybSgpIHtcbiAgY2hyb21lLmFsYXJtcy5jbGVhcihcIm9wdGlib3RfbG9ja1wiLCBmdW5jdGlvbigpIHtcbiAgICBjaHJvbWUuYWxhcm1zLmNyZWF0ZShcIm9wdGlib3RfbG9ja1wiLCB7IGRlbGF5SW5NaW51dGVzOiBJTkFDVElWSVRZX01JTlVURVMgfSk7XG4gIH0pO1xuICAvKiBNZXR0cmUgYSBqb3VyIGxlIGxvY2tBdCBkYW5zIGxlIHN0b3JhZ2UgKi9cbiAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgb3B0aWJvdF9sb2NrOiB7IGxvY2tBdDogRGF0ZS5ub3coKSArIElOQUNUSVZJVFlfTUlOVVRFUyAqIDYwICogMTAwMCB9IH0pO1xufVxuXG4vKiBDcmVlciBsJ2FsYXJtZSBhdSBkZW1hcnJhZ2UgZHUgc2VydmljZSB3b3JrZXIgKi9cbnJlc2V0TG9ja0FsYXJtKCk7XG5cbi8qIFx1MjUwMFx1MjUwMCBQYXJjb3VycyBkeW5hbWlxdWVzIDogcmVmcmVzaCB0b3V0ZXMgbGVzIDMwIG1pbiBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmNocm9tZS5hbGFybXMuY3JlYXRlKFwib3B0aWJvdF9keW5hbWljX3BhcmNvdXJzXCIsIHsgZGVsYXlJbk1pbnV0ZXM6IDEsIHBlcmlvZEluTWludXRlczogMzAgfSk7XG5cbmZ1bmN0aW9uIGZldGNoQW5kQ2FjaGVEeW5hbWljUGFyY291cnMoKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2F1dGhcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgIHZhciBhdXRoID0gcmVzdWx0Lm9wdGlib3RfYXV0aCB8fCB7fTtcbiAgICBpZiAoIWF1dGguc3luY1Rva2VuKSByZXR1cm47XG4gICAgZmV0Y2goQVBJX0JBU0UgKyBcIi9hcGkvZXh0ZW5zaW9uL3BhcmNvdXJzP2hhbmRsZXJzPXRydWVcIiwge1xuICAgICAgaGVhZGVyczogeyBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyBhdXRoLnN5bmNUb2tlbiB9XG4gICAgfSlcbiAgICAudGhlbihmdW5jdGlvbihyKSB7IHJldHVybiByLmpzb24oKTsgfSlcbiAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhLmhhbmRsZXJzKSkge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICAgIG9wdGlib3RfZHluYW1pY19wYXJjb3VyczogeyBoYW5kbGVyczogZGF0YS5oYW5kbGVycywgdHM6IERhdGUubm93KCkgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KVxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIGR5bmFtaWMgcGFyY291cnMgZmV0Y2ggZmFpbGVkOlwiLCBlcnIpOyB9KTtcbiAgfSk7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBSZW1vdGUgU2VsZWN0b3IgT3ZlcnJpZGVzIDogbWVtZSBjeWNsZSBxdWUgbGVzIHBhcmNvdXJzIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuXG5mdW5jdGlvbiBmZXRjaEFuZENhY2hlU2VsZWN0b3JPdmVycmlkZXMoKSB7XG4gIGZldGNoKEFQSV9CQVNFICsgXCIvYXBpL2V4dGVuc2lvbi9zZWxlY3RvcnNcIilcbiAgICAudGhlbihmdW5jdGlvbihyKSB7IHJldHVybiByLmpzb24oKTsgfSlcbiAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoZGF0YSAmJiBkYXRhLm92ZXJyaWRlcykge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICAgIG9wdGlib3Rfc2VsZWN0b3Jfb3ZlcnJpZGVzOiB7IG92ZXJyaWRlczogZGF0YS5vdmVycmlkZXMsIHZlcnNpb246IGRhdGEudmVyc2lvbiB8fCAxLCB0czogRGF0ZS5ub3coKSB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycikgeyBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gc2VsZWN0b3Igb3ZlcnJpZGVzIGZldGNoIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG59XG5cbi8qIFx1MjUwMFx1MjUwMCBVUy05IDogUmVtb3RlIENvbmZpZyBNYXBwaW5ncyBcdTIwMTQgbWlzZSBhIGpvdXIgc2lsZW5jaWV1c2UgXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwICovXG4vKiBDaGFyZ2UgbGVzIG1hcHBpbmdzIGNvbXBsZXRzIChwb3J0YWlscyArIEVSUHMpIGRlcHVpcyBsZSBzZXJ2ZXVyLiAgICAgICAgICAgKi9cbi8qIEZvcm1hdCBKU09OIDogeyB2ZXJzaW9uLCBzb3VyY2VzOiBbIHsgc291cmNlLCB1cmxQYXR0ZXJuLCBmaWVsZHM6IHsuLi59IH0gXSB9ICovXG4vKiBDaHJvbWUgV2ViIFN0b3JlIGF1dG9yaXNlIGxlcyBkb25uZWVzIEpTT04gZGlzdGFudGVzLCBwYXMgbGUgY29kZSBKUy4gICAgICAgKi9cblxudmFyIE1BUFBJTkdTX0NIRUNLX0FMQVJNID0gXCJvcHRpYm90X21hcHBpbmdzX2NoZWNrXCI7XG4vKiBDcmVlciBsJ2FsYXJtZSA6IHZlcmlmIGF1IGRlbWFycmFnZSArIHRvdXRlcyBsZXMgMjRoICovXG5jaHJvbWUuYWxhcm1zLmNyZWF0ZShNQVBQSU5HU19DSEVDS19BTEFSTSwgeyBkZWxheUluTWludXRlczogMiwgcGVyaW9kSW5NaW51dGVzOiAxNDQwIH0pO1xuXG5mdW5jdGlvbiBmZXRjaEFuZENhY2hlTWFwcGluZ3MoKSB7XG4gIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X21hcHBpbmdzXCIsIFwib3B0aWJvdF9hdXRoXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgYXV0aCA9IHJlc3VsdC5vcHRpYm90X2F1dGggfHwge307XG4gICAgdmFyIGNhY2hlZCA9IHJlc3VsdC5vcHRpYm90X21hcHBpbmdzIHx8IHt9O1xuICAgIHZhciBsb2NhbFZlcnNpb24gPSBjYWNoZWQudmVyc2lvbiB8fCAwO1xuXG4gICAgdmFyIGhlYWRlcnMgPSB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH07XG4gICAgaWYgKGF1dGguc3luY1Rva2VuKSBoZWFkZXJzW1wiQXV0aG9yaXphdGlvblwiXSA9IFwiQmVhcmVyIFwiICsgYXV0aC5zeW5jVG9rZW47XG5cbiAgICBmZXRjaChBUElfQkFTRSArIFwiL2FwaS9leHRlbnNpb24vbWFwcGluZ3M/dmVyc2lvbj1cIiArIGxvY2FsVmVyc2lvbiwgeyBoZWFkZXJzOiBoZWFkZXJzIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyKSB7XG4gICAgICAgIC8qIDMwNCA9IHBhcyBkZSBjaGFuZ2VtZW50ICovXG4gICAgICAgIGlmIChyLnN0YXR1cyA9PT0gMzA0KSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKFwiW09wdGlCb3RdIE1hcHBpbmdzIGEgam91ciAodmVyc2lvbiBcIiArIGxvY2FsVmVyc2lvbiArIFwiKVwiKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gci5qc29uKCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICBpZiAoIWRhdGEpIHJldHVybjtcbiAgICAgICAgaWYgKGRhdGEudmVyc2lvbiAmJiBkYXRhLnNvdXJjZXMpIHtcbiAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgICAgICAgb3B0aWJvdF9tYXBwaW5nczogeyB2ZXJzaW9uOiBkYXRhLnZlcnNpb24sIHNvdXJjZXM6IGRhdGEuc291cmNlcywgdHM6IERhdGUubm93KCkgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhcIltPcHRpQm90XSBNYXBwaW5ncyBtaXMgYSBqb3VyIFx1MjE5MiB2ZXJzaW9uIFwiICsgZGF0YS52ZXJzaW9uICsgXCIgKFwiICsgZGF0YS5zb3VyY2VzLmxlbmd0aCArIFwiIHNvdXJjZXMpXCIpO1xuICAgICAgICAgIC8qIE5vdGlmaWVyIGxlcyBjb250ZW50IHNjcmlwdHMgYWN0aWZzICovXG4gICAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUgfSwgZnVuY3Rpb24odGFicykge1xuICAgICAgICAgICAgdGFicy5mb3JFYWNoKGZ1bmN0aW9uKHRhYikge1xuICAgICAgICAgICAgICBpZiAodGFiLmlkKSB7XG4gICAgICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFiLmlkLCB7IHR5cGU6IFwiT1BUSUJPVF9NQVBQSU5HU19VUERBVEVEXCIsIHZlcnNpb246IGRhdGEudmVyc2lvbiB9KVxuICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIG1hcHBpbmdzIGZldGNoIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gIH0pO1xufVxuXG4vKiBcdTI1MDBcdTI1MDAgU1NFIENsaWVudCAoQmlkaXJlY3Rpb25hbCBTeW5jKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbi8qIENocm9tZSBNVjMgc2VydmljZSB3b3JrZXJzIG5lIHN1cHBvcnRlbnQgcGFzIEV2ZW50U291cmNlLiAgICAgICAgICAgICAgICAgICAqL1xuLyogT24gdXRpbGlzZSBmZXRjaCArIFJlYWRhYmxlU3RyZWFtIHBvdXIgcGFyc2VyIGxlIHByb3RvY29sZSBTU0UgbWFudWVsbGVtZW50LiAqL1xuXG52YXIgX3NzZVJlYWRlciA9IG51bGw7XG52YXIgX3NzZVJldHJ5Q291bnQgPSAwO1xudmFyIF9zc2VSZXRyeVRpbWVyID0gbnVsbDtcbnZhciBfc3NlQ29ubmVjdGVkID0gZmFsc2U7XG52YXIgU1NFX1JFVFJZX0RFTEFZUyA9IFs1MDAwLCAxMDAwMCwgMzAwMDAsIDYwMDAwXTsgLyogYmFja29mZiBleHBvbmVudGllbCAqL1xuXG5mdW5jdGlvbiBjb25uZWN0U1NFKCkge1xuICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wib3B0aWJvdF9hdXRoXCIsIFwib3B0aWJvdF9sb2NrXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICB2YXIgYXV0aCA9IHJlc3VsdC5vcHRpYm90X2F1dGggfHwge307XG4gICAgdmFyIGxvY2sgPSByZXN1bHQub3B0aWJvdF9sb2NrIHx8IHt9O1xuXG4gICAgLyogTmUgcGFzIGNvbm5lY3RlciBzaSBwYXMgYXV0aGVudGlmaWUgb3UgdmVycm91aWxsZSAqL1xuICAgIGlmICghYXV0aC5zeW5jVG9rZW4pIHJldHVybjtcbiAgICBpZiAobG9jay5sb2NrQXQgJiYgbG9jay5sb2NrQXQgPCBEYXRlLm5vdygpKSByZXR1cm47XG5cbiAgICAvKiBGZXJtZXIgdG91dGUgY29ubmV4aW9uIGV4aXN0YW50ZSAqL1xuICAgIGRpc2Nvbm5lY3RTU0UoKTtcblxuICAgIF9zc2VDb25uZWN0ZWQgPSB0cnVlO1xuXG4gICAgdmFyIHVybCA9IEFQSV9CQVNFICsgXCIvYXBpL2V4dGVuc2lvbi9zc2VcIjtcbiAgICBmZXRjaCh1cmwsIHsgaGVhZGVyczogeyBcIkF1dGhvcml6YXRpb25cIjogXCJCZWFyZXIgXCIgKyBhdXRoLnN5bmNUb2tlbiB9IH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rIHx8ICFyZXNwb25zZS5ib2R5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU1NFIHJlc3BvbnNlIFwiICsgcmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgICBfc3NlUmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcbiAgICAgICAgX3NzZVJldHJ5Q291bnQgPSAwOyAvKiByZXNldCBiYWNrb2ZmIG9uIHN1Y2Nlc3NmdWwgY29ubmVjdCAqL1xuICAgICAgICB2YXIgZGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgICAgICB2YXIgYnVmZmVyID0gXCJcIjtcblxuICAgICAgICBmdW5jdGlvbiByZWFkKCkge1xuICAgICAgICAgIGlmICghX3NzZUNvbm5lY3RlZCkgcmV0dXJuO1xuICAgICAgICAgIF9zc2VSZWFkZXIucmVhZCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICAgICAgLyogU2VydmV1ciBhIGZlcm1lIGxhIGNvbm5leGlvbiwgcmVjb25uZWN0ZXIgKi9cbiAgICAgICAgICAgICAgc2NoZWR1bGVTU0VSZWNvbm5lY3QoKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnVmZmVyICs9IGRlY29kZXIuZGVjb2RlKHJlc3VsdC52YWx1ZSwgeyBzdHJlYW06IHRydWUgfSk7XG5cbiAgICAgICAgICAgIC8qIERlY291cGVyIHN1ciBsZXMgZG91YmxlIG5ld2xpbmVzIChwcm90b2NvbGUgU1NFKSAqL1xuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IGJ1ZmZlci5zcGxpdChcIlxcblxcblwiKTtcbiAgICAgICAgICAgIGJ1ZmZlciA9IGV2ZW50cy5wb3AoKTsgLyogZ2FyZGVyIGxlIGRlcm5pZXIgZnJhZ21lbnQgaW5jb21wbGV0ICovXG5cbiAgICAgICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHJhdykge1xuICAgICAgICAgICAgICBpZiAoIXJhdyB8fCByYXcudHJpbSgpLmNoYXJBdCgwKSA9PT0gXCI6XCIpIHJldHVybjsgLyogY29tbWVudGFpcmUga2VlcGFsaXZlICovXG4gICAgICAgICAgICAgIHZhciBkYXRhTGluZSA9IG51bGw7XG4gICAgICAgICAgICAgIHZhciBsaW5lcyA9IHJhdy5zcGxpdChcIlxcblwiKTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChsaW5lc1tpXS5pbmRleE9mKFwiZGF0YTpcIikgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgIGRhdGFMaW5lID0gbGluZXNbaV0uc2xpY2UoNSkudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICghZGF0YUxpbmUpIHJldHVybjtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgcGF5bG9hZCA9IEpTT04ucGFyc2UoZGF0YUxpbmUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZVNTRUV2ZW50KHBheWxvYWQpO1xuICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7IC8qIEpTT04gaW52YWxpZGUsIGlnbm9yZXIgKi8gfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlYWQoKTtcbiAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIltPcHRpQm90XSBTU0UgcmVhZCBlcnJvcjpcIiwgZXJyKTtcbiAgICAgICAgICAgIGlmIChfc3NlQ29ubmVjdGVkKSBzY2hlZHVsZVNTRVJlY29ubmVjdCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVhZCgpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIFNTRSBjb25uZWN0aW9uIGVycm9yOlwiLCBlcnIpO1xuICAgICAgICBpZiAoX3NzZUNvbm5lY3RlZCkgc2NoZWR1bGVTU0VSZWNvbm5lY3QoKTtcbiAgICAgIH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZGlzY29ubmVjdFNTRSgpIHtcbiAgX3NzZUNvbm5lY3RlZCA9IGZhbHNlO1xuICBpZiAoX3NzZVJlYWRlcikge1xuICAgIHRyeSB7IF9zc2VSZWFkZXIuY2FuY2VsKCk7IH0gY2F0Y2ggKGUpIHt9XG4gICAgX3NzZVJlYWRlciA9IG51bGw7XG4gIH1cbiAgaWYgKF9zc2VSZXRyeVRpbWVyKSB7XG4gICAgY2xlYXJUaW1lb3V0KF9zc2VSZXRyeVRpbWVyKTtcbiAgICBfc3NlUmV0cnlUaW1lciA9IG51bGw7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2NoZWR1bGVTU0VSZWNvbm5lY3QoKSB7XG4gIGlmIChfc3NlUmV0cnlUaW1lcikgcmV0dXJuO1xuICB2YXIgZGVsYXkgPSBTU0VfUkVUUllfREVMQVlTW01hdGgubWluKF9zc2VSZXRyeUNvdW50LCBTU0VfUkVUUllfREVMQVlTLmxlbmd0aCAtIDEpXTtcbiAgX3NzZVJldHJ5Q291bnQrKztcbiAgX3NzZVJldHJ5VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIF9zc2VSZXRyeVRpbWVyID0gbnVsbDtcbiAgICBjb25uZWN0U1NFKCk7XG4gIH0sIGRlbGF5KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlU1NFRXZlbnQocGF5bG9hZCkge1xuICBpZiAoIXBheWxvYWQgfHwgIXBheWxvYWQudHlwZSkgcmV0dXJuO1xuXG4gIGlmIChwYXlsb2FkLnR5cGUgPT09IFwicmVjb25uZWN0XCIpIHtcbiAgICAvKiBTZXJ2ZXVyIGRlbWFuZGUgdW5lIHJlY29ubmV4aW9uICovXG4gICAgc2NoZWR1bGVTU0VSZWNvbm5lY3QoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAocGF5bG9hZC50eXBlID09PSBcImNvbm5lY3RlZFwiKSB7XG4gICAgLyogQ29ubmV4aW9uIFNTRSBldGFibGllICovXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyogRGlzcGF0Y2hlciBsJ2V2ZW5lbWVudCBhIHRvdXMgbGVzIG9uZ2xldHMgYWN0aWZzICovXG4gIGNocm9tZS50YWJzLnF1ZXJ5KHt9LCBmdW5jdGlvbih0YWJzKSB7XG4gICAgdGFicy5mb3JFYWNoKGZ1bmN0aW9uKHRhYikge1xuICAgICAgaWYgKHRhYi51cmwgJiYgKGlzQWN0aXZlRG9tYWluKHRhYi51cmwpIHx8ICh0YWIudXJsLmluZGV4T2YoXCJvcHRpYm90LmZyXCIpICE9PSAtMSkpKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwge1xuICAgICAgICAgIHR5cGU6IFwiT1BUSUJPVF9TU0VfRVZFTlRcIixcbiAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkLFxuICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7fSAvKiBzaWxlbmNpZXV4ICovXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuLyogXHUyNTAwXHUyNTAwIEFsYXJtZSBTU0Uga2VlcGFsaXZlIChyZWNvbm5lY3RlIHNpIHNpbGVudCBkcm9wKSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmNocm9tZS5hbGFybXMuY3JlYXRlKFwib3B0aWJvdF9zc2Vfa2VlcGFsaXZlXCIsIHsgZGVsYXlJbk1pbnV0ZXM6IDIwLCBwZXJpb2RJbk1pbnV0ZXM6IDIwIH0pO1xuXG4vKiBcdTI1MDBcdTI1MDAgQ29zaXVtIEVSUCA6IHJlc3RhdXJlciBsZXMgc2NyaXB0cyBkeW5hbWlxdWVzIGF1IGRlbWFycmFnZSBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2Nvc2l1bV91cmxcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICBpZiAocmVzdWx0Lm9wdGlib3RfY29zaXVtX3VybCkge1xuICAgIHJlZ2lzdGVyQ29zaXVtU2NyaXB0cyhyZXN1bHQub3B0aWJvdF9jb3NpdW1fdXJsKTtcbiAgfVxufSk7XG5cbmFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyQ29zaXVtU2NyaXB0cyhjb3NpdW1VcmwpIHtcbiAgdHJ5IHtcbiAgICB2YXIgb3JpZ2luID0gbmV3IFVSTChjb3NpdW1VcmwpLm9yaWdpbiArIFwiLypcIjtcblxuICAgIC8qIERlc2luc2NyaXJlIGxlcyBhbmNpZW5zIHNjcmlwdHMgc2kgZXhpc3RhbnRzICovXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGNocm9tZS5zY3JpcHRpbmcudW5yZWdpc3RlckNvbnRlbnRTY3JpcHRzKHsgaWRzOiBbXCJvcHRpYm90LWNvc2l1bVwiXSB9KTtcbiAgICB9IGNhdGNoKGUpIHsgLyogcGFzIGVuY29yZSBlbnJlZ2lzdHJlICovIH1cblxuICAgIC8qIEVucmVnaXN0cmVyIGxlcyBzY3JpcHRzIENvc2l1bSAqL1xuICAgIGF3YWl0IGNocm9tZS5zY3JpcHRpbmcucmVnaXN0ZXJDb250ZW50U2NyaXB0cyhbe1xuICAgICAgaWQ6IFwib3B0aWJvdC1jb3NpdW1cIixcbiAgICAgIG1hdGNoZXM6IFtvcmlnaW5dLFxuICAgICAganM6IFtcImNyeXB0by5qc1wiLCBcImVycC1icmlkZ2UuanNcIl0sXG4gICAgICBhbGxGcmFtZXM6IHRydWUsXG4gICAgICBydW5BdDogXCJkb2N1bWVudF9pZGxlXCJcbiAgICB9XSk7XG5cbiAgICAvKiBBam91dGVyIGxlIGRvbWFpbmUgYSBBQ1RJVkVfRE9NQUlOUyBwb3VyIGwnaWNvbmUgYmxldWUgKi9cbiAgICB2YXIgY29zaXVtRG9tYWluID0gbmV3IFVSTChjb3NpdW1VcmwpLmhvc3RuYW1lO1xuICAgIGlmICghQUNUSVZFX0RPTUFJTlMuaW5jbHVkZXMoY29zaXVtRG9tYWluKSkge1xuICAgICAgQUNUSVZFX0RPTUFJTlMucHVzaChjb3NpdW1Eb21haW4pO1xuICAgIH1cblxuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IG9wdGlib3RfY29zaXVtX3VybDogY29zaXVtVXJsIH0pO1xuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gQ29zaXVtIHNjcmlwdCByZWdpc3RyYXRpb24gZmFpbGVkOlwiLCBlKTtcbiAgfVxufVxuXG4vKiBcdTI1MDBcdTI1MDAgQXBwZWxzIGluaXRpYXV4IGF1IGRlbWFycmFnZSBkdSBzZXJ2aWNlIHdvcmtlciBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmZldGNoQW5kQ2FjaGVEeW5hbWljUGFyY291cnMoKTtcbmZldGNoQW5kQ2FjaGVTZWxlY3Rvck92ZXJyaWRlcygpO1xuZmV0Y2hBbmRDYWNoZU1hcHBpbmdzKCk7XG5jb25uZWN0U1NFKCk7XG5cbi8qIFx1MjUwMFx1MjUwMCBBbGFybSBoYW5kbGVyIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMCAqL1xuY2hyb21lLmFsYXJtcy5vbkFsYXJtLmFkZExpc3RlbmVyKGZ1bmN0aW9uKGFsYXJtKSB7XG4gIGlmIChhbGFybS5uYW1lID09PSBcIm9wdGlib3RfbG9ja1wiKSB7XG4gICAgLyogTWFycXVlciBjb21tZSB2ZXJyb3VpbGxlIEVUIHN1cHByaW1lciBsZSBjYWNoZSBwYXRpZW50IChkb25uZWVzIGRlIHNhbnRlKSAqL1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IG9wdGlib3RfbG9jazogeyBsb2NrQXQ6IERhdGUubm93KCkgLSAxMDAwIH0gfSk7XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwucmVtb3ZlKFtcIm9wdGlib3RfY2FjaGVcIiwgXCJvcHRpYm90X3JwYVwiXSk7XG4gICAgZGlzY29ubmVjdFNTRSgpO1xuICB9XG4gIGlmIChhbGFybS5uYW1lID09PSBcIm9wdGlib3RfZHluYW1pY19wYXJjb3Vyc1wiKSB7XG4gICAgZmV0Y2hBbmRDYWNoZUR5bmFtaWNQYXJjb3VycygpO1xuICAgIGZldGNoQW5kQ2FjaGVTZWxlY3Rvck92ZXJyaWRlcygpO1xuICB9XG4gIGlmIChhbGFybS5uYW1lID09PSBNQVBQSU5HU19DSEVDS19BTEFSTSkge1xuICAgIGZldGNoQW5kQ2FjaGVNYXBwaW5ncygpO1xuICB9XG4gIGlmIChhbGFybS5uYW1lID09PSBcIm9wdGlib3Rfc3NlX2tlZXBhbGl2ZVwiKSB7XG4gICAgLyogUmVjb25uZWN0ZXIgc2kgbGEgY29ubmV4aW9uIFNTRSBlc3QgdG9tYmVlIHNpbGVuY2lldXNlbWVudCAqL1xuICAgIGlmICghX3NzZUNvbm5lY3RlZCB8fCAhX3NzZVJlYWRlcikge1xuICAgICAgY29ubmVjdFNTRSgpO1xuICAgIH1cbiAgfVxufSk7XG5cbi8qIFx1MjUwMFx1MjUwMCBNZXNzYWdlcyBkZXB1aXMgbGVzIGNvbnRlbnQgc2NyaXB0cyBldCBsYSBwb3B1cCBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDAgKi9cbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbihtc2csIHNlbmRlciwgc2VuZFJlc3BvbnNlKSB7XG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX09QRU5fVEFCJyAmJiBtc2cudXJsKSB7XG4gICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBtc2cudXJsIH0pO1xuICB9XG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX1JFTkVXX0xPQ0snKSB7XG4gICAgcmVzZXRMb2NrQWxhcm0oKTtcbiAgICAvKiBSZWNvbm5lY3RlciBTU0Ugc2kgZGVjb25uZWN0ZSBhcHJlcyBsb2NrICovXG4gICAgaWYgKCFfc3NlQ29ubmVjdGVkKSBjb25uZWN0U1NFKCk7XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgVVMtOCA6IEZlZWRiYWNrIExvb3AgXHUyMDE0IHNpZ25hbGVtZW50IGNoYW1wIG1hbCByZW1wbGkgXHUyNTAwXHUyNTAwICovXG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX0ZJRUxEX0ZFRURCQUNLJyAmJiBtc2cucGF5bG9hZCkge1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2F1dGhcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgdmFyIGF1dGggPSByZXN1bHQub3B0aWJvdF9hdXRoIHx8IHt9O1xuICAgICAgaWYgKCFhdXRoLnN5bmNUb2tlbikgeyBzZW5kUmVzcG9uc2UoeyBvazogZmFsc2UsIGVycm9yOiAnbm90X2F1dGhlbnRpY2F0ZWQnIH0pOyByZXR1cm47IH1cblxuICAgICAgZmV0Y2goQVBJX0JBU0UgKyBcIi9hcGkvZXh0ZW5zaW9uL2ZpZWxkLWZlZWRiYWNrXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIFwiQXV0aG9yaXphdGlvblwiOiBcIkJlYXJlciBcIiArIGF1dGguc3luY1Rva2VuXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBzZWxlY3RvcjogbXNnLnBheWxvYWQuc2VsZWN0b3IsXG4gICAgICAgICAgZmllbGRUeXBlOiBtc2cucGF5bG9hZC5maWVsZFR5cGUsXG4gICAgICAgICAgcG9ydGFsOiBtc2cucGF5bG9hZC5wb3J0YWwsXG4gICAgICAgICAgdXJsOiBtc2cucGF5bG9hZC51cmwsXG4gICAgICAgICAgdHM6IG1zZy5wYXlsb2FkLnRzXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocikgeyByZXR1cm4gci5qc29uKCk7IH0pXG4gICAgICAudGhlbihmdW5jdGlvbihkYXRhKSB7IHNlbmRSZXNwb25zZSh7IG9rOiB0cnVlLCBkYXRhOiBkYXRhIH0pOyB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLndhcm4oXCJbT3B0aUJvdF0gZmllbGQtZmVlZGJhY2sgZmFpbGVkOlwiLCBlcnIpO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyBvazogZmFsc2UsIGVycm9yOiBlcnIubWVzc2FnZSB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0cnVlOyAvKiBhc3luYyBzZW5kUmVzcG9uc2UgKi9cbiAgfVxuICAvKiBQcm94eSBmZXRjaCBwb3VyIGV2aXRlciBDT1JTIFx1MjAxNCBsZSBzZXJ2aWNlIHdvcmtlciBuJ2EgcGFzIGRlIHJlc3RyaWN0aW9ucyBDT1JTICovXG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX1BJTkcnICYmIG1zZy5wYXlsb2Fkcykge1xuICAgIG1zZy5wYXlsb2Fkcy5mb3JFYWNoKGZ1bmN0aW9uKHApIHtcbiAgICAgIGZldGNoKHAudXJsLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkocC5ib2R5KVxuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7IGNvbnNvbGUud2FybihcIltPcHRpQm90XSBwaW5nIHJlbGF5IGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gICAgfSk7XG4gIH1cbiAgLyogXHUyNTAwXHUyNTAwIENvc2l1bSBFUlAgXHUyNTAwXHUyNTAwICovXG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX1NFVF9DT1NJVU1fVVJMJykge1xuICAgIHJlZ2lzdGVyQ29zaXVtU2NyaXB0cyhtc2cudXJsKTtcbiAgICBzZW5kUmVzcG9uc2UoeyBvazogdHJ1ZSB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qIFx1MjUwMFx1MjUwMCBCYWRnZSByZWpldCByb3VnZSBcdTI1MDBcdTI1MDAgKi9cbiAgaWYgKG1zZyAmJiBtc2cudHlwZSA9PT0gJ09QVElCT1RfUkVKRVRfQkFER0UnKSB7XG4gICAgdmFyIGJhZGdlQ29sb3IgPSBtc2cucmVqZXRUeXBlID09PSBcInRlY2huaXF1ZVwiID8gXCIjZjU5ZTBiXCIgOiBcIiNlZjQ0NDRcIjtcbiAgICB2YXIgYmFkZ2VUZXh0ID0gbXNnLnJlamV0VHlwZSA9PT0gXCJ0ZWNobmlxdWVcIiA/IFwiIVwiIDogXCJSRUpFVFwiO1xuICAgIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogYmFkZ2VUZXh0IH0pO1xuICAgIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VCYWNrZ3JvdW5kQ29sb3IoeyBjb2xvcjogYmFkZ2VDb2xvciB9KTtcbiAgICAvKiBFZmZhY2VyIGxlIGJhZGdlIGFwcmVzIDMwIHNlY29uZGVzICovXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGNocm9tZS5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogXCJcIiB9KTtcbiAgICB9LCAzMDAwMCk7XG4gIH1cblxuICAvKiBcdTI1MDBcdTI1MDAgSW5qZWN0aW9uIG5vdGUgcmVqZXQgZGFucyBDb3NpdW0gXHUyNTAwXHUyNTAwICovXG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX0NPU0lVTV9JTkpFQ1RfTk9URScpIHtcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5nZXQoW1wib3B0aWJvdF9jb3NpdW1fdXJsXCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGlmICghcmVzdWx0Lm9wdGlib3RfY29zaXVtX3VybCkgcmV0dXJuO1xuICAgICAgdmFyIGNvc2l1bU9yaWdpbiA9IG5ldyBVUkwocmVzdWx0Lm9wdGlib3RfY29zaXVtX3VybCkub3JpZ2luO1xuICAgICAgLyogQ2hlcmNoZXIgdW4gb25nbGV0IENvc2l1bSBvdXZlcnQgZXQgaW5qZWN0ZXIgbGEgbm90ZSAqL1xuICAgICAgY2hyb21lLnRhYnMucXVlcnkoe30sIGZ1bmN0aW9uKHRhYnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YWJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHRhYnNbaV0udXJsICYmIHRhYnNbaV0udXJsLnN0YXJ0c1dpdGgoY29zaXVtT3JpZ2luKSkge1xuICAgICAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFic1tpXS5pZCwge1xuICAgICAgICAgICAgICB0eXBlOiBcIk9QVElCT1RfSU5KRUNUX1JFSkVUX05PVEVcIixcbiAgICAgICAgICAgICAgbm90ZTogbXNnLm5vdGUsXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge30gLyogc2lsZW5jaWV1eCAqL1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKG1zZyAmJiBtc2cudHlwZSA9PT0gJ09QVElCT1RfQ09TSVVNX1NDUkFQRUQnKSB7XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgIG9wdGlib3RfY29zaXVtX3N0YXR1czogeyBzY3JhcGVkOiB0cnVlLCBmaWVsZHM6IG1zZy5maWVsZHMsIHRzOiBEYXRlLm5vdygpIH1cbiAgICB9KTtcbiAgfVxuXG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX1BFQ19DQVBUVVJFRCcpIHtcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoe1xuICAgICAgb3B0aWJvdF9wZWNfcGVuZGluZzoge1xuICAgICAgICBlbmNyeXB0ZWRQYXlsb2FkOiBtc2cuZW5jcnlwdGVkUGF5bG9hZCxcbiAgICAgICAgc291cmNlOiBtc2cuc291cmNlLFxuICAgICAgICB0czogRGF0ZS5ub3coKVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyogRW52b3llciB1biBzdGF0dXQgYXUgc2VydmV1ciAoZXh0ZW5zaW9uIFx1MjE5MiBkYXNoYm9hcmQpICovXG4gIGlmIChtc2cgJiYgbXNnLnR5cGUgPT09ICdPUFRJQk9UX1NFTkRfU1RBVFVTJykge1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJvcHRpYm90X2F1dGhcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgdmFyIGF1dGggPSByZXN1bHQub3B0aWJvdF9hdXRoIHx8IHt9O1xuICAgICAgaWYgKCFhdXRoLnN5bmNUb2tlbikgcmV0dXJuO1xuICAgICAgZmV0Y2goQVBJX0JBU0UgKyBcIi9hcGkvZXh0ZW5zaW9uL3N0YXR1c1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHN5bmNUb2tlbjogYXV0aC5zeW5jVG9rZW4sXG4gICAgICAgICAgc3RhdHVzOiBtc2cuc3RhdHVzIHx8IFwiaWRsZVwiLFxuICAgICAgICAgIHBvcnRhbDogbXNnLnBvcnRhbCB8fCBudWxsLFxuICAgICAgICAgIGRldGFpbHM6IG1zZy5kZXRhaWxzIHx8IG51bGwsXG4gICAgICAgIH0pXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHsgY29uc29sZS53YXJuKFwiW09wdGlCb3RdIHN0YXR1cyBzZW5kIGZhaWxlZDpcIiwgZXJyKTsgfSk7XG4gICAgfSk7XG4gIH1c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
