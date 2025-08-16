/**
 * YouTube API 캐싱 시스템
 * 2-레벨 캐싱: 메모리(LRU) + Redis
 */

import { LRUCache } from 'lru-cache';
import Redis from 'ioredis';
import crypto from 'crypto';

// Redis 클라이언트
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

// 캐시 옵션 인터페이스
export interface CacheOptions {
  ttl?: number;          // Time To Live (ms)
  stale?: number;        // Stale while revalidate (ms)
  namespace?: string;    // 캐시 네임스페이스
  compress?: boolean;    // 압축 여부
}

// 캐시 통계
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

// 캐시 항목 인터페이스
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// 캐시 매니저 클래스
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: LRUCache<string, CacheItem<any>>;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };
  private redisConnected: boolean = false;

  private constructor() {
    // LRU 캐시 설정 (메모리)
    this.memoryCache = new LRUCache<string, CacheItem<any>>({
      max: 500,                        // 최대 500개 항목
      maxSize: 50 * 1024 * 1024,      // 최대 50MB
      sizeCalculation: (value) => {
        return JSON.stringify(value).length;
      },
      ttl: 5 * 60 * 1000,              // 기본 TTL 5분
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    // Redis 연결 확인
    this.connectRedis();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Redis 연결
  private async connectRedis(): Promise<void> {
    try {
      await redis.connect();
      this.redisConnected = true;
      console.log('Redis connected for caching');
    } catch (error) {
      console.warn('Redis connection failed, using memory cache only:', error);
      this.redisConnected = false;
    }
  }

  // 캐시 키 생성
  generateKey(type: string, params: any): string {
    const normalized = this.normalizeParams(params);
    const hash = crypto
      .createHash('sha256')
      .update(JSON.stringify(normalized))
      .digest('hex')
      .substring(0, 16);
    
    return `youtube:${type}:${hash}`;
  }

  // 파라미터 정규화
  private normalizeParams(params: any): any {
    if (!params) return {};
    
    // 객체 키 정렬
    const sorted: any = {};
    Object.keys(params)
      .sort()
      .forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          sorted[key] = params[key];
        }
      });
    
    return sorted;
  }

  // 캐시 가져오기
  async get<T>(key: string): Promise<T | null> {
    // 1. 메모리 캐시 확인
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem) {
      this.stats.hits++;
      this.updateHitRate();
      console.log(`Memory cache hit: ${key}`);
      return memoryItem.data;
    }

    // 2. Redis 캐시 확인 (연결된 경우)
    if (this.redisConnected) {
      try {
        const redisData = await redis.get(key);
        if (redisData) {
          const item = JSON.parse(redisData) as CacheItem<T>;
          
          // TTL 확인
          if (Date.now() - item.timestamp < item.ttl) {
            this.stats.hits++;
            this.updateHitRate();
            
            // 메모리 캐시에도 저장
            this.memoryCache.set(key, item);
            
            console.log(`Redis cache hit: ${key}`);
            return item.data;
          } else {
            // 만료된 항목 삭제
            await redis.del(key);
          }
        }
      } catch (error) {
        console.error('Redis get error:', error);
      }
    }

    this.stats.misses++;
    this.updateHitRate();
    return null;
  }

  // 캐시 저장
  async set<T>(
    key: string, 
    data: T, 
    ttl: number = 5 * 60 * 1000
  ): Promise<void> {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    // 1. 메모리 캐시 저장
    this.memoryCache.set(key, item);

    // 2. Redis 캐시 저장 (연결된 경우)
    if (this.redisConnected) {
      try {
        await redis.setex(
          key,
          Math.floor(ttl / 1000),
          JSON.stringify(item)
        );
      } catch (error) {
        console.error('Redis set error:', error);
      }
    }

    this.stats.sets++;
    console.log(`Cache set: ${key} (TTL: ${ttl}ms)`);
  }

  // 캐시 삭제
  async delete(key: string): Promise<void> {
    // 1. 메모리 캐시 삭제
    this.memoryCache.delete(key);

    // 2. Redis 캐시 삭제 (연결된 경우)
    if (this.redisConnected) {
      try {
        await redis.del(key);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }

    this.stats.deletes++;
    console.log(`Cache deleted: ${key}`);
  }

  // 패턴으로 캐시 삭제
  async deletePattern(pattern: string): Promise<void> {
    // 메모리 캐시에서 패턴 매칭 삭제
    for (const [key] of this.memoryCache.entries()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
        this.stats.deletes++;
      }
    }

    // Redis에서 패턴 매칭 삭제
    if (this.redisConnected) {
      try {
        const keys = await redis.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
          this.stats.deletes += keys.length;
        }
      } catch (error) {
        console.error('Redis pattern delete error:', error);
      }
    }

    console.log(`Cache pattern deleted: ${pattern}`);
  }

  // 캐시 초기화
  async clear(): Promise<void> {
    // 메모리 캐시 초기화
    this.memoryCache.clear();

    // Redis 캐시 초기화 (YouTube 관련만)
    if (this.redisConnected) {
      try {
        const keys = await redis.keys('youtube:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        console.error('Redis clear error:', error);
      }
    }

    // 통계 초기화
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };

    console.log('Cache cleared');
  }

  // 캐시 워밍업
  async warmup(items: Array<{ key: string; data: any; ttl?: number }>): Promise<void> {
    console.log(`Warming up cache with ${items.length} items...`);
    
    for (const item of items) {
      await this.set(item.key, item.data, item.ttl);
    }
    
    console.log('Cache warmup completed');
  }

  // 캐시 통계 조회
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // 캐시 크기 조회
  getSize(): { memory: number; redis?: number } {
    const result: any = {
      memory: this.memoryCache.size,
    };

    if (this.redisConnected) {
      // Redis 크기는 비동기로 조회 필요
      result.redis = 'Check async';
    }

    return result;
  }

  // 히트율 업데이트
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    if (total > 0) {
      this.stats.hitRate = (this.stats.hits / total) * 100;
    }
  }

  // TTL 전략
  static getTTL(dataType: string): number {
    const ttlMap: Record<string, number> = {
      'search': 5 * 60 * 1000,           // 5분
      'video': 10 * 60 * 1000,           // 10분
      'channel': 60 * 60 * 1000,         // 1시간
      'playlist': 30 * 60 * 1000,        // 30분
      'stats': 5 * 60 * 1000,            // 5분
      'trending': 15 * 60 * 1000,        // 15분
      'popular': 10 * 60 * 1000,         // 10분
    };

    return ttlMap[dataType] || 5 * 60 * 1000;
  }

  // 캐시 가능 여부 확인
  static isCacheable(response: any): boolean {
    // 에러 응답은 캐시하지 않음
    if (response.error) return false;
    
    // 빈 결과는 짧게 캐시
    if (!response.items || response.items.length === 0) {
      return true; // 하지만 TTL을 짧게
    }

    // 정상 응답은 캐시
    return true;
  }

  // 종료 처리
  async shutdown(): Promise<void> {
    if (this.redisConnected) {
      await redis.quit();
    }
    
    this.memoryCache.clear();
    console.log('Cache manager shut down');
  }
}

// 캐시 데코레이터 (함수 래핑용)
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  const cache = CacheManager.getInstance();
  
  return (async (...args: Parameters<T>) => {
    // 캐시 키 생성
    const key = options?.keyGenerator 
      ? options.keyGenerator(...args)
      : cache.generateKey(fn.name, args);
    
    // 캐시 확인
    const cached = await cache.get(key);
    if (cached) {
      return cached;
    }
    
    // 함수 실행
    const result = await fn(...args);
    
    // 결과 캐싱
    if (CacheManager.isCacheable(result)) {
      const ttl = options?.ttl || CacheManager.getTTL(fn.name);
      await cache.set(key, result, ttl);
    }
    
    return result;
  }) as T;
}

// 싱글톤 인스턴스 export
export const cacheManager = CacheManager.getInstance();