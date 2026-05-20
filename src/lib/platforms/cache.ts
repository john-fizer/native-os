// Simple in-process cache — survives page loads, resets on server restart
// TTL: 5 minutes for platform data (avoid hammering APIs)

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry || Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttlSeconds = 300) {
  store.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 })
}

export async function cachedFetch<T>(key: string, fn: () => Promise<T>, ttlSeconds = 300): Promise<T> {
  const cached = cacheGet<T>(key)
  if (cached !== null) return cached
  const data = await fn()
  cacheSet(key, data, ttlSeconds)
  return data
}
