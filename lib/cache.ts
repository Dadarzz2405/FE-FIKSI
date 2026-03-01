/**
 * Simple client-side cache using localStorage
 * Caches API responses with TTL (time-to-live)
 */

const CACHE_PREFIX = "fiksi_cache_"
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

type CacheEntry<T> = {
  data: T
  timestamp: number
  ttl: number
}

export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key)
    if (!cached) return null

    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()

    // Check if cache is expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }

    return entry.data
  } catch {
    return null
  }
}

export function setCachedData<T>(key: string, data: T, ttl = DEFAULT_TTL): void {
  if (typeof window === "undefined") return

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch (e) {
    // Handle quota exceeded or other errors silently
    console.warn("Cache write failed:", e)
  }
}

export function invalidateCache(key: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(CACHE_PREFIX + key)
}

export function clearAllCache(): void {
  if (typeof window === "undefined") return
  
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key)
    }
  })
}
