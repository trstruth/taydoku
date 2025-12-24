import type { Model } from "./model"

const DB_NAME = "taydoku"
const STORE = "state"
const KEY = "current"

const openDb = () =>
    new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1)
        req.onupgradeneeded = () => {
            req.result.createObjectStore(STORE)
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })

export const loadState = async (): Promise<Model | null> => {
    const db = await openDb()
    return new Promise(resolve => {
        const tx = db.transaction(STORE, "readonly")
        const store = tx.objectStore(STORE)
        const req = store.get(KEY)
        req.onsuccess = () => resolve((req.result as Model) ?? null)
        req.onerror = () => resolve(null)
    })
}

export const saveState = async (model: Model): Promise<void> => {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite")
        const store = tx.objectStore(STORE)
        const req = store.put(model, KEY)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
    })
}

export const clearState = async (): Promise<void> => {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite")
        const store = tx.objectStore(STORE)
        const req = store.delete(KEY)
        req.onsuccess = () => resolve()
        req.onerror = () => reject(req.error)
    })
}
