import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from "crypto";

/**
 * Utilitaire de chiffrement serveur pour les données en base de données (Encryption at Rest).
 * Utilise AES-256-GCM avec une MASTER_KEY définie en variable d'environnement.
 *
 * L'initialisation est lazy pour éviter un crash au build Next.js
 * (le module est évalué pendant "Collecting page data" sans les secrets).
 */

const ALGORITHM = "aes-256-gcm";

let _key: Buffer | null = null;

function getKey(): Buffer {
  if (_key) return _key;

  const MASTER_KEY = process.env.MASTER_KEY;

  if (!MASTER_KEY && process.env.NODE_ENV === "production") {
    throw new Error("MASTER_KEY must be defined in production environment");
  }

  const salt = createHash("sha256").update(MASTER_KEY || "dev").digest().subarray(0, 16);
  _key = scryptSync(MASTER_KEY || "dev-secret-do-not-use-in-prod", salt, 32) as Buffer;
  return _key;
}

/**
 * Chiffre une chaîne de caractères.
 * Format de sortie : iv:authTag:encryptedData (le tout en base64)
 */
export function encrypt(text: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag().toString("base64");

  return `${iv.toString("base64")}:${authTag}:${encrypted}`;
}

/**
 * Déchiffre une chaîne de caractères chiffrée par la fonction encrypt.
 */
export function decrypt(encryptedText: string): string {
  const [ivPart, authTagPart, encryptedPart] = encryptedText.split(":");
  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error("[ServerCrypto] Format invalide — donnée non chiffrée ou corrompue");
  }

  const iv = Buffer.from(ivPart, "base64");
  const authTag = Buffer.from(authTagPart, "base64");
  const encrypted = Buffer.from(encryptedPart, "base64");

  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted as unknown as string, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/** Version tolérante pour la migration — retourne null si pas déchiffrable */
export function tryDecrypt(encryptedText: string): string | null {
  try { return decrypt(encryptedText); } catch { return null; }
}
