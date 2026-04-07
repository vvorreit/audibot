const DB_NAME = 'audibot-documents'
const STORE_NAME = 'documents'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'bilanId' })
      }
    }
    req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = e => reject((e.target as IDBOpenDBRequest).error)
  })
}

export async function storeDocument(bilanId: string, pdfBytes: Uint8Array): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ bilanId, pdfBytes, storedAt: Date.now() })
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = e => { db.close(); reject((e.target as IDBTransaction).error) }
  })
}

export async function getDocument(bilanId: string): Promise<Uint8Array | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(bilanId)
    req.onsuccess = e => {
      db.close()
      const r = (e.target as IDBRequest).result
      resolve(r ? r.pdfBytes : null)
    }
    req.onerror = e => { db.close(); reject((e.target as IDBRequest).error) }
  })
}

export async function listDocuments(): Promise<string[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAllKeys()
    req.onsuccess = e => { db.close(); resolve((e.target as IDBRequest).result as string[]) }
    req.onerror = e => { db.close(); reject((e.target as IDBRequest).error) }
  })
}

export async function deleteDocument(bilanId: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(bilanId)
    tx.oncomplete = () => { db.close(); resolve() }
    tx.onerror = e => { db.close(); reject((e.target as IDBTransaction).error) }
  })
}
