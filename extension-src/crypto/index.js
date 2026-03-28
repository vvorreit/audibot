/* OptiBot — Chiffrement AES-256-GCM des donnees patient dans chrome.storage */
/* Cle derivee d'un secret local (jamais transmis) via PBKDF2                */
/* Salt aleatoire par device, genere une fois et stocke dans chrome.storage   */
/* Le syncToken sert UNIQUEMENT a l'authentification API — jamais au chiffrement */

/* Recuperer ou creer le salt aleatoire du device */
function getOrCreateSalt() {
  return new Promise(function(resolve) {
    chrome.storage.local.get(["optibot_crypto_salt"], function(result) {
      if (result.optibot_crypto_salt) {
        /* Reconvertir base64 → Uint8Array */
        var raw = atob(result.optibot_crypto_salt);
        var arr = new Uint8Array(raw.length);
        for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
        resolve(arr);
      } else {
        /* Generer un salt aleatoire de 32 bytes */
        var salt = crypto.getRandomValues(new Uint8Array(32));
        var b64 = btoa(String.fromCharCode.apply(null, salt));
        chrome.storage.local.set({ optibot_crypto_salt: b64 });
        resolve(salt);
      }
    });
  });
}

/* Secret local de chiffrement — genere une fois, ne quitte jamais le device */
function getOrCreateEncryptionSecret() {
  return new Promise(function(resolve) {
    chrome.storage.local.get(["optibot_encryption_secret"], function(result) {
      if (result.optibot_encryption_secret) {
        resolve(result.optibot_encryption_secret);
      } else {
        /* Generer un secret aleatoire de 64 chars hex */
        var arr = crypto.getRandomValues(new Uint8Array(32));
        var hex = Array.from(arr).map(function(b) { return b.toString(16).padStart(2, "0"); }).join("");
        chrome.storage.local.set({ optibot_encryption_secret: hex });
        resolve(hex);
      }
    });
  });
}

async function deriveKey(secret) {
  var enc = new TextEncoder();
  var salt = await getOrCreateSalt();
  var keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(secret), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 310000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/* Deriver une cle a partir de l'ancien syncToken (migration uniquement) */
async function deriveKeyLegacy(syncToken) {
  var enc = new TextEncoder();
  var salt = await getOrCreateSalt();
  var keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(syncToken), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt, iterations: 310000, hash: "SHA-256" },
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
    { name: "AES-GCM", iv: iv },
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
  /* Tenter de parser du JSON brut (donnees non chiffrees legacy) */
  try {
    var parsed = JSON.parse(encryptedStr);
    if (typeof parsed === "object") return parsed;
  } catch(e) { /* pas du JSON — c'est du base64 chiffre, continuer */ }

  var secret = await getOrCreateEncryptionSecret();
  try {
    var key = await deriveKey(secret);
    var raw = atob(encryptedStr);
    var combined = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) combined[i] = raw.charCodeAt(i);
    var iv = combined.slice(0, 12);
    var data = combined.slice(12);
    var decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    /* Tentative de migration : dechiffrer avec l'ancien syncToken */
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
      /* Re-chiffrer avec le nouveau secret local */
      var reEncrypted = await encryptData(result);
      if (reEncrypted) {
        chrome.storage.local.set({ optibot_cache: reEncrypted });
      }
      return result;
    } catch(e2) {
      return null;
    }
  }
}

/* Helper : lire le syncToken depuis le storage */
function getSyncToken() {
  return new Promise(function(resolve) {
    chrome.storage.local.get(["optibot_auth", "optibot_cache"], function(result) {
      /* Nouvelle cle optibot_auth */
      if (result.optibot_auth && result.optibot_auth.syncToken) {
        resolve(result.optibot_auth.syncToken);
        return;
      }
      /* Migration : ancienne cle dans optibot_cache.current.syncToken */
      var oldCache = result.optibot_cache;
      if (oldCache && typeof oldCache === "object" && oldCache.current && oldCache.current.syncToken) {
        var token = oldCache.current.syncToken;
        /* Migrer vers optibot_auth */
        chrome.storage.local.set({
          optibot_auth: {
            syncToken: token,
            plan: oldCache.current.plan || "FREE",
            isPro: oldCache.current.isPro || false,
            authAt: oldCache.current.authAt || Date.now(),
            authExpiresAt: oldCache.current.authExpiresAt || (Date.now() + 20 * 60 * 60 * 1000)
          }
        });
        resolve(token);
        return;
      }
      resolve(null);
    });
  });
}

/* Helper : lire et dechiffrer optibot_cache */
async function readEncryptedCache() {
  return new Promise(function(resolve) {
    chrome.storage.local.get(["optibot_cache"], async function(result) {
      var raw = result.optibot_cache;
      if (!raw) { resolve(null); return; }
      if (typeof raw === "object" && raw.current) {
        /* Donnees non chiffrees (migration depuis ancien format) */
        var migrated = JSON.parse(JSON.stringify(raw));
        if (migrated.current) {
          delete migrated.current.syncToken;
          delete migrated.current.plan;
          delete migrated.current.isPro;
          delete migrated.current.authAt;
          delete migrated.current.authExpiresAt;
        }
        /* Re-chiffrer avec le secret local */
        var encrypted = await encryptData(migrated);
        if (encrypted) chrome.storage.local.set({ optibot_cache: encrypted });
        resolve(migrated);
        return;
      }
      if (typeof raw === "string") {
        var decrypted = await decryptData(raw);
        if (decrypted) { resolve(decrypted); return; }
        /* Dechiffrement echoue — donnees corrompues ou cle changee */
        chrome.storage.local.remove("optibot_cache");
        resolve(null);
        return;
      }
      resolve(null);
    });
  });
}

/* Helper : chiffrer et ecrire optibot_cache */
async function writeEncryptedCache(cacheObj) {
  var encrypted = await encryptData(cacheObj);
  if (encrypted === null) {
    console.warn("[OptiBot] writeEncryptedCache: chiffrement échoué, données non sauvegardées.");
    return;
  }
  return new Promise(function(resolve) {
    chrome.storage.local.set({ optibot_cache: encrypted }, resolve);
  });
}

/* Expose les fonctions sur globalThis pour les autres scripts */
globalThis.getOrCreateSalt = getOrCreateSalt;
globalThis.getOrCreateEncryptionSecret = getOrCreateEncryptionSecret;
globalThis.deriveKey = deriveKey;
globalThis.encryptData = encryptData;
globalThis.decryptData = decryptData;
globalThis.getSyncToken = getSyncToken;
globalThis.readEncryptedCache = readEncryptedCache;
globalThis.writeEncryptedCache = writeEncryptedCache;
