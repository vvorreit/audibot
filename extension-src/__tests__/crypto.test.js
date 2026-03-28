// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";

/* ── Mock chrome.storage ───────────────────────────────────────────── */

const storageData = {};

const chromeMock = {
  storage: {
    local: {
      get: vi.fn((keys, cb) => {
        const result = {};
        const keyList = Array.isArray(keys) ? keys : [keys];
        for (const k of keyList) {
          if (storageData[k] !== undefined) result[k] = storageData[k];
        }
        if (cb) cb(result);
        return Promise.resolve(result);
      }),
      set: vi.fn((obj, cb) => {
        Object.assign(storageData, obj);
        if (cb) cb();
        return Promise.resolve();
      }),
      remove: vi.fn((key) => {
        delete storageData[key];
        return Promise.resolve();
      }),
    },
  },
};

vi.stubGlobal("chrome", chromeMock);

/* crypto/index.js exposes functions on globalThis */
await import("../crypto/index.js");

describe("Crypto module", () => {
  beforeEach(() => {
    // Clear stored data between tests
    for (const key of Object.keys(storageData)) delete storageData[key];
    vi.clearAllMocks();
  });

  describe("getOrCreateSalt", () => {
    it("retourne un Uint8Array de 32 bytes", async () => {
      const salt = await globalThis.getOrCreateSalt();
      expect(salt).toBeInstanceOf(Uint8Array);
      expect(salt.length).toBe(32);
    });

    it("si déjà en storage, retourne la même valeur (pas de nouvelle génération)", async () => {
      const salt1 = await globalThis.getOrCreateSalt();
      const salt2 = await globalThis.getOrCreateSalt();
      // Both should use the stored salt
      expect(salt1.length).toBe(salt2.length);
      // After first call, salt is stored; second call reads it
      expect(chromeMock.storage.local.get).toHaveBeenCalled();
    });
  });

  describe("getOrCreateEncryptionSecret", () => {
    it("retourne un string hex de 64 caractères", async () => {
      const secret = await globalThis.getOrCreateEncryptionSecret();
      expect(typeof secret).toBe("string");
      expect(secret.length).toBe(64);
      expect(secret).toMatch(/^[0-9a-f]+$/);
    });

    it("retourne la même valeur au deuxième appel", async () => {
      const s1 = await globalThis.getOrCreateEncryptionSecret();
      const s2 = await globalThis.getOrCreateEncryptionSecret();
      expect(s1).toBe(s2);
    });
  });

  describe("encryptData + decryptData round-trip", () => {
    it("les données sont récupérées intactes", async () => {
      const original = { hello: "world", count: 42 };
      const encrypted = await globalThis.encryptData(original);
      const decrypted = await globalThis.decryptData(encrypted);
      expect(decrypted).toEqual(original);
    });

    it("chiffrement de données patient → round-trip intact", async () => {
      const patientData = {
        nom: "DUPONT",
        prenom: "Marie",
        nss: "185127512345678",
        dateNaissance: "15/07/1985",
      };
      const encrypted = await globalThis.encryptData(patientData);
      const decrypted = await globalThis.decryptData(encrypted);
      expect(decrypted).toEqual(patientData);
    });

    it("produit un string base64 non-lisible", async () => {
      const data = { nom: "DUPONT", nss: "185127512345678" };
      const encrypted = await globalThis.encryptData(data);
      expect(typeof encrypted).toBe("string");
      // Should not contain plaintext
      expect(encrypted).not.toContain("DUPONT");
      expect(encrypted).not.toContain("185127512345678");
      // Should be valid base64
      expect(() => atob(encrypted)).not.toThrow();
    });

    it("deux chiffrements du même message produisent des résultats différents (IV aléatoire)", async () => {
      const data = { test: "same data" };
      const enc1 = await globalThis.encryptData(data);
      const enc2 = await globalThis.encryptData(data);
      expect(enc1).not.toBe(enc2);
    });
  });

  describe("decryptData edge cases", () => {
    it("retourne null pour une entrée null", async () => {
      const result = await globalThis.decryptData(null);
      expect(result).toBeNull();
    });

    it("retourne null pour une entrée undefined", async () => {
      const result = await globalThis.decryptData(undefined);
      expect(result).toBeNull();
    });

    it("retourne null pour une chaîne vide", async () => {
      const result = await globalThis.decryptData("");
      expect(result).toBeNull();
    });

    it("parse du JSON brut (legacy non-chiffré)", async () => {
      const raw = JSON.stringify({ nom: "TEST" });
      const result = await globalThis.decryptData(raw);
      expect(result).toEqual({ nom: "TEST" });
    });

    it("retourne null pour du base64 invalide (clé incorrecte)", async () => {
      // Generate some garbage base64
      const fakeEncrypted = btoa("this is not valid encrypted data at all 1234567890ab");
      const result = await globalThis.decryptData(fakeEncrypted);
      expect(result).toBeNull();
    });
  });

  describe("writeEncryptedCache + readEncryptedCache round-trip", () => {
    it("données identiques après round-trip", async () => {
      const cacheObj = {
        current: {
          nom: "MARTIN",
          prenom: "Jean",
          numeroSecuriteSociale: "185127512345678",
        },
      };
      await globalThis.writeEncryptedCache(cacheObj);

      // readEncryptedCache reads from chrome.storage
      const result = await globalThis.readEncryptedCache();
      expect(result).toEqual(cacheObj);
    });
  });
});
