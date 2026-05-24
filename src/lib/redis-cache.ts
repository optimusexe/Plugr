import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || process.env.NEXT_PUBLIC_REDIS_URL || null;

let client: Redis | null = null;

function getClient(): Redis | null {
  if (!REDIS_URL) return null;
  if (!client) {
    client = new Redis(REDIS_URL);
    client.on("error", (err) => {
      // keep a console warning but don't throw — fallbacks will be used
      console.warn("redis connection error:", err?.message || err);
    });
  }
  return client;
}

export async function getCachedAsync<T>(key: string): Promise<T | null> {
  const c = getClient();
  if (!c) {
    // defer to in-memory simple cache
    const mod = await import("./simple-cache");
    return mod.getCached<T>(key);
  }
  const v = await c.get(key);
  if (v == null) return null;
  try {
    return JSON.parse(v) as T;
  } catch {
    return (v as unknown) as T;
  }
}

export async function setCachedAsync<T>(key: string, value: T, ttlMs = 30000): Promise<void> {
  const c = getClient();
  if (!c) {
    const mod = await import("./simple-cache");
    return mod.setCached<T>(key, value, ttlMs as number);
  }
  const serialized = JSON.stringify(value);
  // Use PX for millisecond TTL; fall back to SETEX if needed
  await c.set(key, serialized, "PX", ttlMs);
}

export async function delCached(key: string): Promise<void> {
  const c = getClient();
  if (!c) {
    const mod = await import("./simple-cache");
    try {
      // simple-cache has no delete export; access map via hack - not ideal
      // but we can skip deletion in fallback mode.
    } catch {}
    return;
  }
  await c.del(key);
}

export function redisAvailable(): boolean {
  return Boolean(REDIS_URL);
}

export default getClient;
