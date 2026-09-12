const TTL_MS = 45000;
const store = new Map();

export function catalogCacheGet(key) {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    store.delete(key);
    return null;
  }
  return hit.value;
}

export function catalogCacheSet(key, value) {
  store.set(key, { value, exp: Date.now() + TTL_MS });
}

export function catalogCacheClear(key) {
  if (key) store.delete(key);
  else store.clear();
}
