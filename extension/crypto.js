"use strict";
(() => {
  // extension-src/crypto/index.js
  function getOrCreateSalt() {
    return new Promise(function(resolve) {
      chrome.storage.local.get(["audibot_crypto_salt"], function(result) {
        if (result.audibot_crypto_salt) {
          var raw = atob(result.audibot_crypto_salt);
          var arr = new Uint8Array(raw.length);
          for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
          resolve(arr);
        } else {
          var salt = crypto.getRandomValues(new Uint8Array(32));
          var b64 = btoa(String.fromCharCode.apply(null, salt));
          chrome.storage.local.set({ audibot_crypto_salt: b64 });
          resolve(salt);
        }
      });
    });
  }
  function getOrCreateEncryptionSecret() {
    return new Promise(function(resolve) {
      chrome.storage.local.get(["audibot_encryption_secret"], function(result) {
        if (result.audibot_encryption_secret) {
          resolve(result.audibot_encryption_secret);
        } else {
          var arr = crypto.getRandomValues(new Uint8Array(32));
          var hex = Array.from(arr).map(function(b) {
            return b.toString(16).padStart(2, "0");
          }).join("");
          chrome.storage.local.set({ audibot_encryption_secret: hex });
          resolve(hex);
        }
      });
    });
  }
  async function deriveKey(secret) {
    var enc = new TextEncoder();
    var salt = await getOrCreateSalt();
    var keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 31e4, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  async function deriveKeyLegacy(syncToken) {
    var enc = new TextEncoder();
    var salt = await getOrCreateSalt();
    var keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(syncToken),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 31e4, hash: "SHA-256" },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }
  async function encryptData(data) {
    var secret = await getOrCreateEncryptionSecret();
    var key = await deriveKey(secret);
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var enc = new TextEncoder();
    var encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(JSON.stringify(data))
    );
    var combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode.apply(null, combined));
  }
  async function decryptData(encryptedStr) {
    if (!encryptedStr || typeof encryptedStr !== "string") return null;
    try {
      var parsed = JSON.parse(encryptedStr);
      if (typeof parsed === "object") return parsed;
    } catch (e) {
    }
    var secret = await getOrCreateEncryptionSecret();
    try {
      var key = await deriveKey(secret);
      var raw = atob(encryptedStr);
      var combined = new Uint8Array(raw.length);
      for (var i = 0; i < raw.length; i++) combined[i] = raw.charCodeAt(i);
      var iv = combined.slice(0, 12);
      var data = combined.slice(12);
      var decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (e) {
      var syncToken = await getSyncToken();
      if (!syncToken) return null;
      try {
        var legacyKey = await deriveKeyLegacy(syncToken);
        var rawL = atob(encryptedStr);
        var combinedL = new Uint8Array(rawL.length);
        for (var j = 0; j < rawL.length; j++) combinedL[j] = rawL.charCodeAt(j);
        var ivL = combinedL.slice(0, 12);
        var dataL = combinedL.slice(12);
        var decryptedL = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivL }, legacyKey, dataL);
        var result = JSON.parse(new TextDecoder().decode(decryptedL));
        var reEncrypted = await encryptData(result);
        if (reEncrypted) {
          chrome.storage.local.set({ audibot_cache: reEncrypted });
        }
        return result;
      } catch (e2) {
        return null;
      }
    }
  }
  function getSyncToken() {
    return new Promise(function(resolve) {
      chrome.storage.local.get(["audibot_auth", "audibot_cache"], function(result) {
        if (result.audibot_auth && result.audibot_auth.syncToken) {
          resolve(result.audibot_auth.syncToken);
          return;
        }
        var oldCache = result.audibot_cache;
        if (oldCache && typeof oldCache === "object" && oldCache.current && oldCache.current.syncToken) {
          var token = oldCache.current.syncToken;
          chrome.storage.local.set({
            audibot_auth: {
              syncToken: token,
              plan: oldCache.current.plan || "FREE",
              isPro: oldCache.current.isPro || false,
              authAt: oldCache.current.authAt || Date.now(),
              authExpiresAt: oldCache.current.authExpiresAt || Date.now() + 20 * 60 * 60 * 1e3
            }
          });
          resolve(token);
          return;
        }
        resolve(null);
      });
    });
  }
  async function readEncryptedCache() {
    return new Promise(function(resolve) {
      chrome.storage.local.get(["audibot_cache"], async function(result) {
        var raw = result.audibot_cache;
        if (!raw) {
          resolve(null);
          return;
        }
        if (typeof raw === "object" && raw.current) {
          var migrated = JSON.parse(JSON.stringify(raw));
          if (migrated.current) {
            delete migrated.current.syncToken;
            delete migrated.current.plan;
            delete migrated.current.isPro;
            delete migrated.current.authAt;
            delete migrated.current.authExpiresAt;
          }
          var encrypted = await encryptData(migrated);
          if (encrypted) chrome.storage.local.set({ audibot_cache: encrypted });
          resolve(migrated);
          return;
        }
        if (typeof raw === "string") {
          var decrypted = await decryptData(raw);
          if (decrypted) {
            resolve(decrypted);
            return;
          }
          chrome.storage.local.remove("audibot_cache");
          resolve(null);
          return;
        }
        resolve(null);
      });
    });
  }
  async function writeEncryptedCache(cacheObj) {
    var encrypted = await encryptData(cacheObj);
    if (encrypted === null) {
      console.warn("[AudiBot] writeEncryptedCache: chiffrement \xE9chou\xE9, donn\xE9es non sauvegard\xE9es.");
      return;
    }
    return new Promise(function(resolve) {
      chrome.storage.local.set({ audibot_cache: encrypted }, resolve);
    });
  }
  globalThis.getOrCreateSalt = getOrCreateSalt;
  globalThis.getOrCreateEncryptionSecret = getOrCreateEncryptionSecret;
  globalThis.deriveKey = deriveKey;
  globalThis.encryptData = encryptData;
  globalThis.decryptData = decryptData;
  globalThis.getSyncToken = getSyncToken;
  globalThis.readEncryptedCache = readEncryptedCache;
  globalThis.writeEncryptedCache = writeEncryptedCache;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vZXh0ZW5zaW9uLXNyYy9jcnlwdG8vaW5kZXguanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qIEF1ZGlCb3QgXHUyMDE0IENoaWZmcmVtZW50IEFFUy0yNTYtR0NNIGRlcyBkb25uZWVzIHBhdGllbnQgZGFucyBjaHJvbWUuc3RvcmFnZSAqL1xuLyogQ2xlIGRlcml2ZWUgZCd1biBzZWNyZXQgbG9jYWwgKGphbWFpcyB0cmFuc21pcykgdmlhIFBCS0RGMiAgICAgICAgICAgICAgICAqL1xuLyogU2FsdCBhbGVhdG9pcmUgcGFyIGRldmljZSwgZ2VuZXJlIHVuZSBmb2lzIGV0IHN0b2NrZSBkYW5zIGNocm9tZS5zdG9yYWdlICAgKi9cbi8qIExlIHN5bmNUb2tlbiBzZXJ0IFVOSVFVRU1FTlQgYSBsJ2F1dGhlbnRpZmljYXRpb24gQVBJIFx1MjAxNCBqYW1haXMgYXUgY2hpZmZyZW1lbnQgKi9cblxuLyogUmVjdXBlcmVyIG91IGNyZWVyIGxlIHNhbHQgYWxlYXRvaXJlIGR1IGRldmljZSAqL1xuZnVuY3Rpb24gZ2V0T3JDcmVhdGVTYWx0KCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X2NyeXB0b19zYWx0XCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGlmIChyZXN1bHQuYXVkaWJvdF9jcnlwdG9fc2FsdCkge1xuICAgICAgICAvKiBSZWNvbnZlcnRpciBiYXNlNjQgXHUyMTkyIFVpbnQ4QXJyYXkgKi9cbiAgICAgICAgdmFyIHJhdyA9IGF0b2IocmVzdWx0LmF1ZGlib3RfY3J5cHRvX3NhbHQpO1xuICAgICAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkocmF3Lmxlbmd0aCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmF3Lmxlbmd0aDsgaSsrKSBhcnJbaV0gPSByYXcuY2hhckNvZGVBdChpKTtcbiAgICAgICAgcmVzb2x2ZShhcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogR2VuZXJlciB1biBzYWx0IGFsZWF0b2lyZSBkZSAzMiBieXRlcyAqL1xuICAgICAgICB2YXIgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMzIpKTtcbiAgICAgICAgdmFyIGI2NCA9IGJ0b2EoU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBzYWx0KSk7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IGF1ZGlib3RfY3J5cHRvX3NhbHQ6IGI2NCB9KTtcbiAgICAgICAgcmVzb2x2ZShzYWx0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qIFNlY3JldCBsb2NhbCBkZSBjaGlmZnJlbWVudCBcdTIwMTQgZ2VuZXJlIHVuZSBmb2lzLCBuZSBxdWl0dGUgamFtYWlzIGxlIGRldmljZSAqL1xuZnVuY3Rpb24gZ2V0T3JDcmVhdGVFbmNyeXB0aW9uU2VjcmV0KCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X2VuY3J5cHRpb25fc2VjcmV0XCJdLCBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGlmIChyZXN1bHQuYXVkaWJvdF9lbmNyeXB0aW9uX3NlY3JldCkge1xuICAgICAgICByZXNvbHZlKHJlc3VsdC5hdWRpYm90X2VuY3J5cHRpb25fc2VjcmV0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIEdlbmVyZXIgdW4gc2VjcmV0IGFsZWF0b2lyZSBkZSA2NCBjaGFycyBoZXggKi9cbiAgICAgICAgdmFyIGFyciA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMzIpKTtcbiAgICAgICAgdmFyIGhleCA9IEFycmF5LmZyb20oYXJyKS5tYXAoZnVuY3Rpb24oYikgeyByZXR1cm4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpOyB9KS5qb2luKFwiXCIpO1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBhdWRpYm90X2VuY3J5cHRpb25fc2VjcmV0OiBoZXggfSk7XG4gICAgICAgIHJlc29sdmUoaGV4KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlcml2ZUtleShzZWNyZXQpIHtcbiAgdmFyIGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICB2YXIgc2FsdCA9IGF3YWl0IGdldE9yQ3JlYXRlU2FsdCgpO1xuICB2YXIga2V5TWF0ZXJpYWwgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmltcG9ydEtleShcbiAgICBcInJhd1wiLCBlbmMuZW5jb2RlKHNlY3JldCksIFwiUEJLREYyXCIsIGZhbHNlLCBbXCJkZXJpdmVLZXlcIl1cbiAgKTtcbiAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZGVyaXZlS2V5KFxuICAgIHsgbmFtZTogXCJQQktERjJcIiwgc2FsdDogc2FsdCwgaXRlcmF0aW9uczogMzEwMDAwLCBoYXNoOiBcIlNIQS0yNTZcIiB9LFxuICAgIGtleU1hdGVyaWFsLFxuICAgIHsgbmFtZTogXCJBRVMtR0NNXCIsIGxlbmd0aDogMjU2IH0sXG4gICAgZmFsc2UsXG4gICAgW1wiZW5jcnlwdFwiLCBcImRlY3J5cHRcIl1cbiAgKTtcbn1cblxuLyogRGVyaXZlciB1bmUgY2xlIGEgcGFydGlyIGRlIGwnYW5jaWVuIHN5bmNUb2tlbiAobWlncmF0aW9uIHVuaXF1ZW1lbnQpICovXG5hc3luYyBmdW5jdGlvbiBkZXJpdmVLZXlMZWdhY3koc3luY1Rva2VuKSB7XG4gIHZhciBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgdmFyIHNhbHQgPSBhd2FpdCBnZXRPckNyZWF0ZVNhbHQoKTtcbiAgdmFyIGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgXCJyYXdcIiwgZW5jLmVuY29kZShzeW5jVG9rZW4pLCBcIlBCS0RGMlwiLCBmYWxzZSwgW1wiZGVyaXZlS2V5XCJdXG4gICk7XG4gIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICB7IG5hbWU6IFwiUEJLREYyXCIsIHNhbHQ6IHNhbHQsIGl0ZXJhdGlvbnM6IDMxMDAwMCwgaGFzaDogXCJTSEEtMjU2XCIgfSxcbiAgICBrZXlNYXRlcmlhbCxcbiAgICB7IG5hbWU6IFwiQUVTLUdDTVwiLCBsZW5ndGg6IDI1NiB9LFxuICAgIGZhbHNlLFxuICAgIFtcImVuY3J5cHRcIiwgXCJkZWNyeXB0XCJdXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGVuY3J5cHREYXRhKGRhdGEpIHtcbiAgdmFyIHNlY3JldCA9IGF3YWl0IGdldE9yQ3JlYXRlRW5jcnlwdGlvblNlY3JldCgpO1xuICB2YXIga2V5ID0gYXdhaXQgZGVyaXZlS2V5KHNlY3JldCk7XG4gIHZhciBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoMTIpKTtcbiAgdmFyIGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICB2YXIgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgIHsgbmFtZTogXCJBRVMtR0NNXCIsIGl2OiBpdiB9LFxuICAgIGtleSxcbiAgICBlbmMuZW5jb2RlKEpTT04uc3RyaW5naWZ5KGRhdGEpKVxuICApO1xuICB2YXIgY29tYmluZWQgPSBuZXcgVWludDhBcnJheShpdi5sZW5ndGggKyBlbmNyeXB0ZWQuYnl0ZUxlbmd0aCk7XG4gIGNvbWJpbmVkLnNldChpdik7XG4gIGNvbWJpbmVkLnNldChuZXcgVWludDhBcnJheShlbmNyeXB0ZWQpLCBpdi5sZW5ndGgpO1xuICByZXR1cm4gYnRvYShTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGNvbWJpbmVkKSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREYXRhKGVuY3J5cHRlZFN0cikge1xuICBpZiAoIWVuY3J5cHRlZFN0ciB8fCB0eXBlb2YgZW5jcnlwdGVkU3RyICE9PSBcInN0cmluZ1wiKSByZXR1cm4gbnVsbDtcbiAgLyogVGVudGVyIGRlIHBhcnNlciBkdSBKU09OIGJydXQgKGRvbm5lZXMgbm9uIGNoaWZmcmVlcyBsZWdhY3kpICovXG4gIHRyeSB7XG4gICAgdmFyIHBhcnNlZCA9IEpTT04ucGFyc2UoZW5jcnlwdGVkU3RyKTtcbiAgICBpZiAodHlwZW9mIHBhcnNlZCA9PT0gXCJvYmplY3RcIikgcmV0dXJuIHBhcnNlZDtcbiAgfSBjYXRjaChlKSB7IC8qIHBhcyBkdSBKU09OIFx1MjAxNCBjJ2VzdCBkdSBiYXNlNjQgY2hpZmZyZSwgY29udGludWVyICovIH1cblxuICB2YXIgc2VjcmV0ID0gYXdhaXQgZ2V0T3JDcmVhdGVFbmNyeXB0aW9uU2VjcmV0KCk7XG4gIHRyeSB7XG4gICAgdmFyIGtleSA9IGF3YWl0IGRlcml2ZUtleShzZWNyZXQpO1xuICAgIHZhciByYXcgPSBhdG9iKGVuY3J5cHRlZFN0cik7XG4gICAgdmFyIGNvbWJpbmVkID0gbmV3IFVpbnQ4QXJyYXkocmF3Lmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByYXcubGVuZ3RoOyBpKyspIGNvbWJpbmVkW2ldID0gcmF3LmNoYXJDb2RlQXQoaSk7XG4gICAgdmFyIGl2ID0gY29tYmluZWQuc2xpY2UoMCwgMTIpO1xuICAgIHZhciBkYXRhID0gY29tYmluZWQuc2xpY2UoMTIpO1xuICAgIHZhciBkZWNyeXB0ZWQgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoeyBuYW1lOiBcIkFFUy1HQ01cIiwgaXY6IGl2IH0sIGtleSwgZGF0YSk7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGRlY3J5cHRlZCkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLyogVGVudGF0aXZlIGRlIG1pZ3JhdGlvbiA6IGRlY2hpZmZyZXIgYXZlYyBsJ2FuY2llbiBzeW5jVG9rZW4gKi9cbiAgICB2YXIgc3luY1Rva2VuID0gYXdhaXQgZ2V0U3luY1Rva2VuKCk7XG4gICAgaWYgKCFzeW5jVG9rZW4pIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICB2YXIgbGVnYWN5S2V5ID0gYXdhaXQgZGVyaXZlS2V5TGVnYWN5KHN5bmNUb2tlbik7XG4gICAgICB2YXIgcmF3TCA9IGF0b2IoZW5jcnlwdGVkU3RyKTtcbiAgICAgIHZhciBjb21iaW5lZEwgPSBuZXcgVWludDhBcnJheShyYXdMLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJhd0wubGVuZ3RoOyBqKyspIGNvbWJpbmVkTFtqXSA9IHJhd0wuY2hhckNvZGVBdChqKTtcbiAgICAgIHZhciBpdkwgPSBjb21iaW5lZEwuc2xpY2UoMCwgMTIpO1xuICAgICAgdmFyIGRhdGFMID0gY29tYmluZWRMLnNsaWNlKDEyKTtcbiAgICAgIHZhciBkZWNyeXB0ZWRMID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KHsgbmFtZTogXCJBRVMtR0NNXCIsIGl2OiBpdkwgfSwgbGVnYWN5S2V5LCBkYXRhTCk7XG4gICAgICB2YXIgcmVzdWx0ID0gSlNPTi5wYXJzZShuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZGVjcnlwdGVkTCkpO1xuICAgICAgLyogUmUtY2hpZmZyZXIgYXZlYyBsZSBub3V2ZWF1IHNlY3JldCBsb2NhbCAqL1xuICAgICAgdmFyIHJlRW5jcnlwdGVkID0gYXdhaXQgZW5jcnlwdERhdGEocmVzdWx0KTtcbiAgICAgIGlmIChyZUVuY3J5cHRlZCkge1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBhdWRpYm90X2NhY2hlOiByZUVuY3J5cHRlZCB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSBjYXRjaChlMikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG5cbi8qIEhlbHBlciA6IGxpcmUgbGUgc3luY1Rva2VuIGRlcHVpcyBsZSBzdG9yYWdlICovXG5mdW5jdGlvbiBnZXRTeW5jVG9rZW4oKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFtcImF1ZGlib3RfYXV0aFwiLCBcImF1ZGlib3RfY2FjaGVcIl0sIGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgLyogTm91dmVsbGUgY2xlIGF1ZGlib3RfYXV0aCAqL1xuICAgICAgaWYgKHJlc3VsdC5hdWRpYm90X2F1dGggJiYgcmVzdWx0LmF1ZGlib3RfYXV0aC5zeW5jVG9rZW4pIHtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQuYXVkaWJvdF9hdXRoLnN5bmNUb2tlbik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8qIE1pZ3JhdGlvbiA6IGFuY2llbm5lIGNsZSBkYW5zIGF1ZGlib3RfY2FjaGUuY3VycmVudC5zeW5jVG9rZW4gKi9cbiAgICAgIHZhciBvbGRDYWNoZSA9IHJlc3VsdC5hdWRpYm90X2NhY2hlO1xuICAgICAgaWYgKG9sZENhY2hlICYmIHR5cGVvZiBvbGRDYWNoZSA9PT0gXCJvYmplY3RcIiAmJiBvbGRDYWNoZS5jdXJyZW50ICYmIG9sZENhY2hlLmN1cnJlbnQuc3luY1Rva2VuKSB7XG4gICAgICAgIHZhciB0b2tlbiA9IG9sZENhY2hlLmN1cnJlbnQuc3luY1Rva2VuO1xuICAgICAgICAvKiBNaWdyZXIgdmVycyBhdWRpYm90X2F1dGggKi9cbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICBhdWRpYm90X2F1dGg6IHtcbiAgICAgICAgICAgIHN5bmNUb2tlbjogdG9rZW4sXG4gICAgICAgICAgICBwbGFuOiBvbGRDYWNoZS5jdXJyZW50LnBsYW4gfHwgXCJGUkVFXCIsXG4gICAgICAgICAgICBpc1Bybzogb2xkQ2FjaGUuY3VycmVudC5pc1BybyB8fCBmYWxzZSxcbiAgICAgICAgICAgIGF1dGhBdDogb2xkQ2FjaGUuY3VycmVudC5hdXRoQXQgfHwgRGF0ZS5ub3coKSxcbiAgICAgICAgICAgIGF1dGhFeHBpcmVzQXQ6IG9sZENhY2hlLmN1cnJlbnQuYXV0aEV4cGlyZXNBdCB8fCAoRGF0ZS5ub3coKSArIDIwICogNjAgKiA2MCAqIDEwMDApXG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmVzb2x2ZSh0b2tlbik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKiBIZWxwZXIgOiBsaXJlIGV0IGRlY2hpZmZyZXIgYXVkaWJvdF9jYWNoZSAqL1xuYXN5bmMgZnVuY3Rpb24gcmVhZEVuY3J5cHRlZENhY2hlKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChbXCJhdWRpYm90X2NhY2hlXCJdLCBhc3luYyBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIHZhciByYXcgPSByZXN1bHQuYXVkaWJvdF9jYWNoZTtcbiAgICAgIGlmICghcmF3KSB7IHJlc29sdmUobnVsbCk7IHJldHVybjsgfVxuICAgICAgaWYgKHR5cGVvZiByYXcgPT09IFwib2JqZWN0XCIgJiYgcmF3LmN1cnJlbnQpIHtcbiAgICAgICAgLyogRG9ubmVlcyBub24gY2hpZmZyZWVzIChtaWdyYXRpb24gZGVwdWlzIGFuY2llbiBmb3JtYXQpICovXG4gICAgICAgIHZhciBtaWdyYXRlZCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocmF3KSk7XG4gICAgICAgIGlmIChtaWdyYXRlZC5jdXJyZW50KSB7XG4gICAgICAgICAgZGVsZXRlIG1pZ3JhdGVkLmN1cnJlbnQuc3luY1Rva2VuO1xuICAgICAgICAgIGRlbGV0ZSBtaWdyYXRlZC5jdXJyZW50LnBsYW47XG4gICAgICAgICAgZGVsZXRlIG1pZ3JhdGVkLmN1cnJlbnQuaXNQcm87XG4gICAgICAgICAgZGVsZXRlIG1pZ3JhdGVkLmN1cnJlbnQuYXV0aEF0O1xuICAgICAgICAgIGRlbGV0ZSBtaWdyYXRlZC5jdXJyZW50LmF1dGhFeHBpcmVzQXQ7XG4gICAgICAgIH1cbiAgICAgICAgLyogUmUtY2hpZmZyZXIgYXZlYyBsZSBzZWNyZXQgbG9jYWwgKi9cbiAgICAgICAgdmFyIGVuY3J5cHRlZCA9IGF3YWl0IGVuY3J5cHREYXRhKG1pZ3JhdGVkKTtcbiAgICAgICAgaWYgKGVuY3J5cHRlZCkgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHsgYXVkaWJvdF9jYWNoZTogZW5jcnlwdGVkIH0pO1xuICAgICAgICByZXNvbHZlKG1pZ3JhdGVkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiByYXcgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgdmFyIGRlY3J5cHRlZCA9IGF3YWl0IGRlY3J5cHREYXRhKHJhdyk7XG4gICAgICAgIGlmIChkZWNyeXB0ZWQpIHsgcmVzb2x2ZShkZWNyeXB0ZWQpOyByZXR1cm47IH1cbiAgICAgICAgLyogRGVjaGlmZnJlbWVudCBlY2hvdWUgXHUyMDE0IGRvbm5lZXMgY29ycm9tcHVlcyBvdSBjbGUgY2hhbmdlZSAqL1xuICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5yZW1vdmUoXCJhdWRpYm90X2NhY2hlXCIpO1xuICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXNvbHZlKG51bGwpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuLyogSGVscGVyIDogY2hpZmZyZXIgZXQgZWNyaXJlIGF1ZGlib3RfY2FjaGUgKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlRW5jcnlwdGVkQ2FjaGUoY2FjaGVPYmopIHtcbiAgdmFyIGVuY3J5cHRlZCA9IGF3YWl0IGVuY3J5cHREYXRhKGNhY2hlT2JqKTtcbiAgaWYgKGVuY3J5cHRlZCA9PT0gbnVsbCkge1xuICAgIGNvbnNvbGUud2FybihcIltBdWRpQm90XSB3cml0ZUVuY3J5cHRlZENhY2hlOiBjaGlmZnJlbWVudCBcdTAwRTljaG91XHUwMEU5LCBkb25uXHUwMEU5ZXMgbm9uIHNhdXZlZ2FyZFx1MDBFOWVzLlwiKTtcbiAgICByZXR1cm47XG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBhdWRpYm90X2NhY2hlOiBlbmNyeXB0ZWQgfSwgcmVzb2x2ZSk7XG4gIH0pO1xufVxuXG4vKiBFeHBvc2UgbGVzIGZvbmN0aW9ucyBzdXIgZ2xvYmFsVGhpcyBwb3VyIGxlcyBhdXRyZXMgc2NyaXB0cyAqL1xuZ2xvYmFsVGhpcy5nZXRPckNyZWF0ZVNhbHQgPSBnZXRPckNyZWF0ZVNhbHQ7XG5nbG9iYWxUaGlzLmdldE9yQ3JlYXRlRW5jcnlwdGlvblNlY3JldCA9IGdldE9yQ3JlYXRlRW5jcnlwdGlvblNlY3JldDtcbmdsb2JhbFRoaXMuZGVyaXZlS2V5ID0gZGVyaXZlS2V5O1xuZ2xvYmFsVGhpcy5lbmNyeXB0RGF0YSA9IGVuY3J5cHREYXRhO1xuZ2xvYmFsVGhpcy5kZWNyeXB0RGF0YSA9IGRlY3J5cHREYXRhO1xuZ2xvYmFsVGhpcy5nZXRTeW5jVG9rZW4gPSBnZXRTeW5jVG9rZW47XG5nbG9iYWxUaGlzLnJlYWRFbmNyeXB0ZWRDYWNoZSA9IHJlYWRFbmNyeXB0ZWRDYWNoZTtcbmdsb2JhbFRoaXMud3JpdGVFbmNyeXB0ZWRDYWNoZSA9IHdyaXRlRW5jcnlwdGVkQ2FjaGU7XG4iXSwKICAibWFwcGluZ3MiOiAiOzs7QUFNQSxXQUFTLGtCQUFrQjtBQUN6QixXQUFPLElBQUksUUFBUSxTQUFTLFNBQVM7QUFDbkMsYUFBTyxRQUFRLE1BQU0sSUFBSSxDQUFDLHFCQUFxQixHQUFHLFNBQVMsUUFBUTtBQUNqRSxZQUFJLE9BQU8scUJBQXFCO0FBRTlCLGNBQUksTUFBTSxLQUFLLE9BQU8sbUJBQW1CO0FBQ3pDLGNBQUksTUFBTSxJQUFJLFdBQVcsSUFBSSxNQUFNO0FBQ25DLG1CQUFTLElBQUksR0FBRyxJQUFJLElBQUksUUFB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
