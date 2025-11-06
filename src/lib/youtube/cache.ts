/**
 * YouTube API 罹먯떛 ?쒖뒪??
 * 2-?덈꺼 罹먯떛: 硫붾え由?LRU) + Redis
 */

import crypto from 'node:crypto';
import Redis from 'ioredis';
import { LRUCache } from 'lru-cache';
import { env } from '@/env';

// Redis ?대씪?댁뼵??(議곌굔遺 ?앹꽦)
let redis: Redis | null = null;

// Redis ?곌껐 ?쒕룄 (媛쒕컻 ?섍꼍?먯꽌???좏깮??
if (env.REDIS_HOST) {
  try {
    redis = new Redis({
      host: env.REDIS_HOST || 'localhost',
      port: Number.parseInt(env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: () => null, // ?ъ떆??鍮꾪솢?깊솕
    });

    // ?먮윭 ?몃뱾???깅줉
    redis.on('error', (err) => {
      console.error('[Cache] Redis connection failed, using memory cache only:', err.message);
      redis = null;
    });
  } catch (error) {
    console.error('[Cache] Redis initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    console.log('[Cache] Using memory cache only');
    redis = null;
  }
} else {
  console.log('Redis not configured, using memory cache only');
}

// 罹먯떆 ?듭뀡 ?명꽣?섏씠??
export interface CacheOptions {
  ttl?: number; // Time To Live (ms)
  stale?: number; // Stale while revalidate (ms)
  namespace?: string; // 罹먯떆 ?ㅼ엫?ㅽ럹?댁뒪
  compress?: boolean; // ?뺤텞 ?щ?
}

// 罹먯떆 ?듦퀎
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

// 罹먯떆 ??ぉ ?명꽣?섏씠??
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// 罹먯떆 留ㅻ땲? ?대옒??
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: LRUCache<string, CacheItem<unknown>>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };
  private redisConnected = false;

  private constructor() {
    // LRU 罹먯떆 ?ㅼ젙 (硫붾え由?
    this.memoryCache = new LRUCache<string, CacheItem<unknown>>({
      max: 500, // 理쒕? 500媛???ぉ
      maxSize: 50 * 1024 * 1024, // 理쒕? 50MB
      sizeCalculation: (value) => {
        return JSON.stringify(value).length;
      },
      ttl: 5 * 60 * 1000, // 湲곕낯 TTL 5遺?
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    // Redis ?곌껐 ?뺤씤
    this.connectRedis();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Redis ?곌껐
  private async connectRedis(): Promise<void> {
    if (!redis) {
      this.redisConnected = false;
      return;
    }

    try {
      await redis.connect();
      this.redisConnected = true;
      console.log('[Cache] Redis connected for caching');
    } catch (error) {
      console.error('[Cache] Redis connection failed:', error instanceof Error ? error.message : 'Unknown error');
      console.log('[Cache] Falling back to memory cache only');
      this.redisConnected = false;
      redis = null; // Redis 鍮꾪솢?깊솕
    }
  }

  // 罹먯떆 ???앹꽦
  generateKey(type: string, params: unknown): string {
    const normalized = this.normalizeParams(params);
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex')
      .substring(0, 16);

    return `youtube:${type}:${hash}`;
  }

  // ?뚮씪誘명꽣 ?뺢퇋??
  private normalizeParams(params: unknown): Record<string, unknown> {
    if (!params || typeof params !== 'object' || params === null) {
      return {};
    }

    // Type assertion after type guard
    const params_obj = params as Record<string, unknown>;

    // 媛앹껜 ???뺣젹
    const sorted: Record<string, unknown> = {};
    Object.keys(params_obj)
      .sort()
      .forEach((key) => {
        if (params_obj[key] !== undefined && params_obj[key] !== null) {
          sorted[key] = params_obj[key];
        }
      });

    return sorted;
  }

  // 罹먯떆 媛?몄삤湲?
  async get<T>(key: string): Promise<T | null> {
    // 1. 硫붾え由?罹먯떆 ?뺤씤
    const memory_item = this.memoryCache.get(key);
    if (memory_item) {
      this.stats.hits++;
      this.updateHitRate();
      console.log(`Memory cache hit: ${key}`);
      return memory_item.data as T;
    }

    // 2. Redis 罹먯떆 ?뺤씤 (?곌껐??寃쎌슦)
    if (this.redisConnected && redis) {
      try {
        const redis_data = await redis.get(key);
        if (redis_data) {
          const item = JSON.parse(redis_data) as CacheItem<T>;

          // TTL ?뺤씤
          if (Date.now() - item.timestamp < item.ttl) {
            this.stats.hits++;
            this.updateHitRate();

            // 硫붾え由?罹먯떆?먮룄 ???
            this.memoryCache.set(key, item as CacheItem<unknown>);

            console.log(`Redis cache hit: ${key}`);
            return item.data;
          }
          // 留뚮즺????ぉ ??젣
          await redis.del(key);
        }
      } catch (error) {
        console.warn('[Cache] Redis get/del failed, using memory cache only:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  // 罹먯떆 ???
  async set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    // 1. 硫붾え由?罹먯떆 ???
    this.memoryCache.set(key, item as CacheItem<unknown>);

    // 2. Redis 罹먯떆 ???(?곌껐??寃쎌슦)
    if (this.redisConnected && redis) {
      try {
        await redis.setex(key, Math.floor(ttl / 1000), JSON.stringify(item));
      } catch (error) {
        console.warn('[Cache] Redis set failed, data saved to memory cache only:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    this.stats.sets++;
    console.log(`Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  // 罹먯떆 ??젣
  async delete(key: string): Promise<void> {
    // 1. 硫붾え由?罹먯떆 ??젣
    this.memoryCache.delete(key);

    // 2. Redis 罹먯떆 ??젣 (?곌껐??寃쎌슦)
    if (this.redisConnected && redis) {
      try {
        await redis.del(key);
      } catch (error) {
        console.warn('[Cache] Redis delete failed, deleted from memory cache only:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    this.stats.deletes++;
    console.log(`Cache deleted: ${key}`);
  }

  // ?⑦꽩?쇰줈 罹먯떆 ??젣
  async deletePattern(pattern: string): Promise<void> {
    // 硫붾え由?罹먯떆?먯꽌 ?⑦꽩 留ㅼ묶 ??젣
    for (const [key] of this.memoryCache.entries()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        this.stats.deletes++;
      }
    }

    // Redis?먯꽌 ?⑦꽩 留ㅼ묶 ??젣
    if (this.redisConnected && redis) {
      try {
        const keys = await redis.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
          this.stats.deletes += keys.length;
        }
      } catch (error) {
        console.warn('[Cache] Redis pattern delete failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log(`Cache pattern deleted: ${pattern}`);
  }

  // 罹먯떆 珥덇린??
  async clear(): Promise<void> {
    // 硫붾え由?罹먯떆 珥덇린??
    this.memoryCache.clear();

    // Redis 罹먯떆 珥덇린??(YouTube 愿?⑤쭔)
    if (this.redisConnected && redis) {
      try {
        const keys = await redis.keys('youtube:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        console.warn('[Cache] Redis clear failed:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    // ?듦퀎 珥덇린??
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };

    console.log('Cache cleared');
  }

  // 罹먯떆 ?뚮컢??
  async warmup(items: Array<{ key: string; data: unknown; ttl?: number }>): Promise<void> {
    console.log(`Warming up cache with ${items.length} items...`);

    for (const item of items) {
      await this.set(item.key, item.data, item.ttl);
    }

    console.log('Cache warmup completed');
  }

  // 罹먯떆 ?듦퀎 議고쉶
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // 罹먯떆 ?ш린 議고쉶
  getSize(): { memory: number; redis?: number | string } {
    const result: { memory: number; redis?: number | string } = {
      memory: this.memoryCache.size,
    };

    if (this.redisConnected) {
      // Redis ?ш린??鍮꾨룞湲곕줈 議고쉶 ?꾩슂
      result.redis = 'Check async';
    }

    return result;
  }

  // ?덊듃???낅뜲?댄듃
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    if (total > 0) {
      this.stats.hitRate = (this.stats.hits / total) * 100;
    }
  }

  // TTL ?꾨왂
  static getTTL(data_type: string): number {
    const ttl_map: Record<string, number> = {
      search: 5 * 60 * 1000, // 5遺?
      video: 10 * 60 * 1000, // 10遺?
      channel: 60 * 60 * 1000, // 1?쒓컙
      playlist: 30 * 60 * 1000, // 30遺?
      stats: 5 * 60 * 1000, // 5遺?
      trending: 15 * 60 * 1000, // 15遺?
      popular: 10 * 60 * 1000, // 10遺?
    };

    return ttl_map[data_type] || 5 * 60 * 1000;
  }

  // 罹먯떆 媛???щ? ?뺤씤
  static isCacheable(response: unknown): boolean {
    // Type guard to check if response is an object
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Type assertion after type guard
    const response_obj = response as { error?: unknown; items?: unknown[] };

    // ?먮윭 ?묐떟? 罹먯떆?섏? ?딆쓬
    if (response_obj.error) {
      return false;
    }

    // 鍮?寃곌낵??吏㏐쾶 罹먯떆
    if (
      !response_obj.items ||
      !Array.isArray(response_obj.items) ||
      response_obj.items.length === 0
    ) {
      return true; // ?섏?留?TTL??吏㏐쾶
    }

    // ?뺤긽 ?묐떟? 罹먯떆
    return true;
  }

  // 醫낅즺 泥섎━
  async shutdown(): Promise<void> {
    if (this.redisConnected && redis) {
      await redis.quit();
    }

    this.memoryCache.clear();
    console.log('Cache manager shut down');
  }
}

// 罹먯떆 ?곗퐫?덉씠??(?⑥닔 ?섑븨??
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options?: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  const cache = CacheManager.getInstance();

  return (async (...args: Parameters<T>) => {
    // 罹먯떆 ???앹꽦
    const key = options?.keyGenerator
      ? options.keyGenerator(...args)
      : cache.generateKey(fn.name, args);

    // 罹먯떆 ?뺤씤
    const cached = await cache.get(key);
    if (cached) {
      return cached;
    }

    // ?⑥닔 ?ㅽ뻾
    const result = await fn(...args);

    // 寃곌낵 罹먯떛
    if (CacheManager.isCacheable(result)) {
      const ttl = options?.ttl || CacheManager.getTTL(fn.name);
      await cache.set(key, result, ttl);
    }

    return result;
  }) as T;
}

// ?깃????몄뒪?댁뒪 export
export const cacheManager = CacheManager.getInstance();


