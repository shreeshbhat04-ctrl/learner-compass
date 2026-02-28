interface CacheValue<T> {
  expiresAt: number;
  value: T;
}

export class TtlLruCache<T> {
  private readonly storage = new Map<string, CacheValue<T>>();

  constructor(
    private readonly maxEntries: number,
    private readonly ttlMs: number,
  ) {}

  get(key: string): T | null {
    const entry = this.storage.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.storage.delete(key);
      return null;
    }

    // Refresh recency for LRU behavior.
    this.storage.delete(key);
    this.storage.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.storage.has(key)) {
      this.storage.delete(key);
    }

    this.storage.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });

    if (this.storage.size <= this.maxEntries) {
      return;
    }

    const oldestKey = this.storage.keys().next().value;
    if (oldestKey) {
      this.storage.delete(oldestKey);
    }
  }

  size(): number {
    return this.storage.size;
  }
}
