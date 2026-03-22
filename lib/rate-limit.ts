const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function assertRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const item = memoryStore.get(key);

  if (!item || item.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (item.count >= limit) {
    throw new Error("Too many requests. Please try again shortly.");
  }

  item.count += 1;
  memoryStore.set(key, item);
}
