import type { StateStorage } from 'zustand/middleware'

const DB_NAME = 'asaje-piano'
const STORE_NAME = 'keyval'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode)
    const request = run(tx.objectStore(STORE_NAME))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const supported = typeof indexedDB !== 'undefined'

/**
 * Adaptateur de persistance IndexedDB pour zustand (repli silencieux si non
 * disponible, ex. environnement de test).
 */
export const idbStorage: StateStorage = {
  getItem: async (name) => {
    if (!supported) return null
    try {
      const value = await withStore<string | undefined>(
        'readonly',
        (store) => store.get(name) as IDBRequest<string | undefined>,
      )
      return value ?? null
    } catch {
      return null
    }
  },
  setItem: async (name, value) => {
    if (!supported) return
    try {
      await withStore('readwrite', (store) => store.put(value, name))
    } catch {
      /* ignore */
    }
  },
  removeItem: async (name) => {
    if (!supported) return
    try {
      await withStore('readwrite', (store) => store.delete(name))
    } catch {
      /* ignore */
    }
  },
}
