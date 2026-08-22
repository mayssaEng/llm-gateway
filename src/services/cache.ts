interface CacheEntry {
  response: any;
  expiresAt: number;
}

const cacheStore = new Map<string, CacheEntry>();
const TTL_MS = 5 * 60 * 1000; // 5 minutes

function buildCacheKey(model: string, messages: any[]): string {
  return JSON.stringify({ model, messages });
}

export function getCachedResponse(model: string, messages: any[]): any | null {
  const key = buildCacheKey(model, messages);
  const entry = cacheStore.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return null;
  }

  return entry.response;
}

export function setCachedResponse(model: string, messages: any[], response: any): void {
  const key = buildCacheKey(model, messages);
  cacheStore.set(key, {
    response,
    expiresAt: Date.now() + TTL_MS,
  });
}
