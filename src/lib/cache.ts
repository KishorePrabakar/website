const TTL = 60 * 60 * 1000

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > TTL) { localStorage.removeItem(key); return null }
    return data as T
  } catch { return null }
}

export function cacheSet(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })) } catch {}
}
