// Récupérer le keyMaterial brut depuis un token string (PBKDF2)
async function getKeyMaterial(token: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  return crypto.subtle.importKey('raw', enc.encode(token), 'PBKDF2', false, ['deriveKey'])
}

// Dériver clé AES-256 depuis keyMaterial + salt
async function deriveAesKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: 600000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

// Format blob: [salt(16)][iv(12)][ciphertext]

// Chiffrer payload → base64 string (salt aléatoire par opération)
export async function encryptWithKey(payload: unknown, token: string): Promise<string> {
  const keyMaterial = await getKeyMaterial(token)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveAesKey(keyMaterial, salt)
  const encoded = new TextEncoder().encode(JSON.stringify(payload))
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  const combined = new Uint8Array(16 + 12 + encrypted.byteLength)
  combined.set(salt)
  combined.set(iv, 16)
  combined.set(new Uint8Array(encrypted), 28)
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < combined.length; i += chunkSize) {
    binary += String.fromCharCode(...combined.subarray(i, Math.min(i + chunkSize, combined.length)));
  }
  return btoa(binary)
}

// Déchiffrer base64 string → payload (extrait salt du blob)
export async function decryptWithKey(blob: string, token: string): Promise<unknown> {
  const keyMaterial = await getKeyMaterial(token)
  const combined = Uint8Array.from(atob(blob), c => c.charCodeAt(0))
  const salt = combined.slice(0, 16)
  const iv = combined.slice(16, 28)
  const data = combined.slice(28)
  const key = await deriveAesKey(keyMaterial, salt)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
  return JSON.parse(new TextDecoder().decode(decrypted))
}
