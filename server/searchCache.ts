import type Redis from "ioredis";
import { TtlLruCache } from "./cache";

interface SearchCacheOptions {
  ttlMs: number;
  maxEntries: number;
  redis?: Redis;
  redisKeyPrefix: string;
}

export class SearchCache<T> {
  private readonly localCache: TtlLruCache<T>;
  private readonly ttlSeconds: number;

  constructor(private readonly options: SearchCacheOptions) {
    this.localCache = new TtlLruCache<T>(options.maxEntries, options.ttlMs);
    this.ttlSeconds = Math.max(1, Math.ceil(options.ttlMs / 1000));
  }

  async get(key: string): Promise<T | null> {
    const localHit = this.localCache.get(key);
    if (localHit) {
      return localHit;
    }

    if (!this.options.redis) {
      return null;
    }

    try {
      const serialized = await this.options.redis.get(this.redisKey(key));
      if (!serialized) {
        return null;
      }

      const parsed = JSON.parse(serialized) as T;
      this.localCache.set(key, parsed);
      return parsed;
    } catch {
      return null;
    }
  }

  async set(key: string, value: T): Promise<void> {
    this.localCache.set(key, value);
    if (!this.options.redis) {
      return;
    }

    try {
      await this.options.redis.set(this.redisKey(key), JSON.stringify(value), "EX", this.ttlSeconds);
    } catch {
      // Do not fail requests on cache store errors.
    }
  }

  size(): number {
    return this.localCache.size();
  }

  kind(): "memory" | "hybrid" {
    return this.options.redis ? "hybrid" : "memory";
  }

  private redisKey(key: string): string {
    return `${this.options.redisKeyPrefix}${key}`;
  }
}
