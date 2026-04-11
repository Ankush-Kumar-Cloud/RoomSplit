/**
 * StorageModel
 * ─────────────────────────────────────────────────────────
 * Pure persistence layer. Wraps localStorage so every other
 * layer stays storage-agnostic. Swap this file to use a
 * remote API, IndexedDB, or Supabase without touching
 * controllers or views.
 *
 * All keys are namespaced with "rs_" to avoid collisions.
 */

const NS = 'rs_';

const StorageModel = {
  /** Read and JSON-parse a value. Returns null on miss or error. */
  get(key) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /** JSON-stringify and persist a value. */
  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
    } catch (e) {
      console.warn('[StorageModel] set failed:', e);
    }
  },

  /** Remove a key from storage. */
  remove(key) {
    try {
      localStorage.removeItem(NS + key);
    } catch { /* noop */ }
  },

  /** Load multiple keys in one call. Returns { key: value } map. */
  getMany(keys) {
    const result = {};
    keys.forEach(k => { result[k] = StorageModel.get(k); });
    return result;
  },

  /** Persist multiple key-value pairs. */
  setMany(map) {
    Object.entries(map).forEach(([k, v]) => StorageModel.set(k, v));
  },
};

export default StorageModel;
