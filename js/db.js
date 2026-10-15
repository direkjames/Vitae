// Vitae — tiny IndexedDB key/value store (falls back to localStorage)
// Author: direk james

const DB_NAME = 'vitae';
const STORE = 'kv';
let dbPromise = null;

function open() {
  if (!('indexedDB' in window)) return Promise.reject(new Error('no-idb'));
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function dbGet(key) {
  try {
    const db = await open();
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE).objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      const raw = localStorage.getItem('vitae:' + key);
      return raw ? JSON.parse(raw) : undefined;
    } catch {
      return undefined;
    }
  }
}

export async function dbSet(key, value) {
  try {
    const db = await open();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    try {
      localStorage.setItem('vitae:' + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}

// Ask the browser not to evict our data under storage pressure.
export function requestPersistence() {
  try {
    navigator.storage?.persist?.();
  } catch {
    /* ignore */
  }
}
