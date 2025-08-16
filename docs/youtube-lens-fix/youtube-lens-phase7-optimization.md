# YouTube Lens Phase 7: 최적화 & 확장

## 📌 개요
성능 최적화, 쿼터 관리 고도화, 팀 협업 기능 등 시스템을 안정화하고 확장성을 확보합니다.

## 🎯 목표
- API 쿼터 최적화 및 캐싱 전략
- 성능 병목 지점 개선
- 실시간 협업 기능
- 시스템 모니터링 및 안정성

## ⚡ 성능 최적화

### API 쿼터 최적화 전략

```typescript
// lib/optimization/quota-optimizer.ts
export class QuotaOptimizer {
  private cache: Map<string, CacheEntry> = new Map();
  private requestQueue: PriorityQueue<ApiRequest> = new PriorityQueue();
  
  // 지능형 캐싱 시스템
  async getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    // 캐시 유효성 검사
    if (cached && !this.isExpired(cached, options.ttl)) {
      return cached.data as T;
    }
    
    // 스테일 데이터 반환 + 백그라운드 갱신
    if (cached && options.staleWhileRevalidate) {
      this.backgroundRefresh(key, fetcher);
      return cached.data as T;
    }
    
    // 새로 가져오기
    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hitCount: 0
    });
    
    return data;
  }
  
  // 우선순위 기반 요청 큐
  async queueRequest(request: ApiRequest): Promise<any> {
    // 쿼터 체크
    const quotaAvailable = await this.checkQuota(request.cost);
    
    if (!quotaAvailable && request.priority < Priority.HIGH) {
      // 낮은 우선순위는 대기열에
      this.requestQueue.enqueue(request);
      return this.waitForQuota(request);
    }
    
    // 즉시 실행
    return this.executeRequest(request);
  }
  
  // 배치 처리 최적화
  async batchProcess<T>(
    items: T[],
    processor: (batch: T[]) => Promise<void>,
    batchSize = 50
  ): Promise<void> {
    const batches = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    
    // 병렬 처리 (최대 3개 동시)
    const concurrency = 3;
    for (let i = 0; i < batches.length; i += concurrency) {
      const chunk = batches.slice(i, i + concurrency);
      await Promise.all(chunk.map(batch => processor(batch)));
      
      // 쿼터 회복 대기
      await this.waitForQuotaRecovery();
    }
  }
  
  // 캐시 사전 예열
  async warmupCache(predictions: CachePrediction[]) {
    const highValue = predictions
      .filter(p => p.probability > 0.7)
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);
    
    for (const prediction of highValue) {
      if (!this.cache.has(prediction.key)) {
        await this.getCachedOrFetch(
          prediction.key,
          prediction.fetcher,
          { ttl: 3600000 } // 1시간
        );
      }
    }
  }
}
```

### 데이터베이스 최적화

```typescript
// lib/optimization/db-optimizer.ts
export class DatabaseOptimizer {
  // 연결 풀 관리
  private pool = new Pool({
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  // 쿼리 최적화
  async optimizedQuery(query: string, params: any[]): Promise<any> {
    // EXPLAIN ANALYZE로 쿼리 플랜 체크
    if (process.env.NODE_ENV === 'development') {
      const plan = await this.pool.query(`EXPLAIN ANALYZE ${query}`, params);
      this.logSlowQuery(query, plan);
    }
    
    return this.pool.query(query, params);
  }
  
  // 벌크 INSERT 최적화
  async bulkInsert(table: string, rows: any[]) {
    if (rows.length === 0) return;
    
    // COPY 명령 사용 (대량 데이터)
    if (rows.length > 1000) {
      return this.copyFrom(table, rows);
    }
    
    // 일반 INSERT (중간 규모)
    const chunks = [];
    for (let i = 0; i < rows.length; i += 100) {
      chunks.push(rows.slice(i, i + 100));
    }
    
    await Promise.all(chunks.map(chunk => 
      supabase.from(table).insert(chunk)
    ));
  }
  
  // 인덱스 사용 모니터링
  async analyzeIndexUsage() {
    const unusedIndexes = await this.pool.query(`
      SELECT schemaname, tablename, indexname, idx_scan
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      AND indexrelname NOT LIKE '%_pkey'
      ORDER BY schemaname, tablename;
    `);
    
    const missingIndexes = await this.pool.query(`
      SELECT schemaname, tablename, attname, n_distinct, correlation
      FROM pg_stats
      WHERE schemaname = 'public'
      AND n_distinct > 100
      AND correlation < 0.1
      ORDER BY n_distinct DESC;
    `);
    
    return { unusedIndexes, missingIndexes };
  }
  
  // 파티셔닝 관리
  async createMonthlyPartition(baseTable: string, date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const partitionName = `${baseTable}_${year}_${month}`;
    
    const sql = `
      CREATE TABLE IF NOT EXISTS ${partitionName}
      PARTITION OF ${baseTable}
      FOR VALUES FROM ('${year}-${month}-01')
      TO ('${year}-${String(Number(month) + 1).padStart(2, '0')}-01');
    `;
    
    await this.pool.query(sql);
    
    // 파티션별 인덱스 생성
    await this.createPartitionIndexes(partitionName);
  }
}
```

## 🚀 프론트엔드 최적화

### React 성능 최적화

```typescript
// hooks/useOptimizedState.ts
import { useCallback, useMemo, useRef, useState } from 'react';
import { debounce, throttle } from 'lodash';

// 최적화된 상태 관리 훅
export function useOptimizedState<T>(
  initialValue: T,
  options: OptimizationOptions = {}
) {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  
  // 디바운스된 setState
  const debouncedSetState = useMemo(
    () => debounce((value: T) => {
      setState(value);
      stateRef.current = value;
    }, options.debounceMs || 300),
    [options.debounceMs]
  );
  
  // 쓰로틀된 setState
  const throttledSetState = useMemo(
    () => throttle((value: T) => {
      setState(value);
      stateRef.current = value;
    }, options.throttleMs || 100),
    [options.throttleMs]
  );
  
  // 배치 업데이트
  const batchUpdate = useCallback((updates: Partial<T>[]) => {
    const newState = updates.reduce(
      (acc, update) => ({ ...acc, ...update }),
      stateRef.current
    );
    setState(newState);
    stateRef.current = newState;
  }, []);
  
  return {
    state,
    setState: options.debounce 
      ? debouncedSetState 
      : options.throttle 
      ? throttledSetState 
      : setState,
    batchUpdate,
    stateRef
  };
}
```

### 이미지 최적화

```tsx
// components/ui/optimized-image.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false
}: OptimizedImageProps) {
  const [isInView, setIsInView] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!imageRef.current || priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    observer.observe(imageRef.current);
    
    return () => observer.disconnect();
  }, [priority]);
  
  return (
    <div ref={imageRef} style={{ width, height }}>
      {(isInView || priority) ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL={generateBlurDataURL(src)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="bg-muted animate-pulse" style={{ width, height }} />
      )}
    </div>
  );
}

function generateBlurDataURL(src: string): string {
  // 간단한 블러 플레이스홀더 생성
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#888" filter="url(#b)"/>
    </svg>`
  ).toString('base64')}`;
}
```

## 👥 실시간 협업 기능

### Supabase Realtime 활용

```typescript
// lib/collaboration/realtime-manager.ts
export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  
  // 보드 협업 채널
  async joinBoardChannel(boardId: string, userId: string) {
    const channel = supabase
      .channel(`board:${boardId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        this.updateActiveUsers(boardId, state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        this.updateCursor(payload);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'board_items',
        filter: `board_id=eq.${boardId}`
      }, (payload) => {
        this.handleBoardChange(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userId,
            online_at: new Date().toISOString()
          });
        }
      });
    
    this.channels.set(boardId, channel);
    return channel;
  }
  
  // 커서 위치 브로드캐스트
  broadcastCursor(boardId: string, position: { x: number; y: number }) {
    const channel = this.channels.get(boardId);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          user_id: getCurrentUserId(),
          position,
          timestamp: Date.now()
        }
      });
    }
  }
  
  // 실시간 타이핑 인디케이터
  broadcastTyping(boardId: string, isTyping: boolean) {
    const channel = this.channels.get(boardId);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          user_id: getCurrentUserId(),
          isTyping,
          timestamp: Date.now()
        }
      });
    }
  }
  
  // 채널 정리
  leaveChannel(boardId: string) {
    const channel = this.channels.get(boardId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(boardId);
    }
  }
}
```

### 협업 UI 컴포넌트

```tsx
// components/features/collaboration/CollaborativeCursor.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Cursor {
  userId: string;
  position: { x: number; y: number };
  color: string;
  name: string;
}

export function CollaborativeCursors({ boardId }: { boardId: string }) {
  const [cursors, setCursors] = useState<Map<string, Cursor>>(new Map());
  const realtimeManager = useRealtimeManager();
  
  useEffect(() => {
    const channel = realtimeManager.joinBoardChannel(boardId, getCurrentUserId());
    
    channel.on('broadcast', { event: 'cursor' }, ({ payload }) => {
      setCursors(prev => {
        const next = new Map(prev);
        next.set(payload.user_id, {
          userId: payload.user_id,
          position: payload.position,
          color: getUserColor(payload.user_id),
          name: getUserName(payload.user_id)
        });
        return next;
      });
    });
    
    // 마우스 움직임 추적
    const handleMouseMove = throttle((e: MouseEvent) => {
      realtimeManager.broadcastCursor(boardId, {
        x: e.clientX,
        y: e.clientY
      });
    }, 50);
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      realtimeManager.leaveChannel(boardId);
    };
  }, [boardId]);
  
  return (
    <>
      {Array.from(cursors.values()).map((cursor) => (
        <motion.div
          key={cursor.userId}
          className="fixed pointer-events-none z-50"
          animate={{
            x: cursor.position.x,
            y: cursor.position.y
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        >
          <svg width="24" height="24">
            <path
              d="M5.5 3.21V20.8l6.15-6.15h4.94L5.5 3.21z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          <span
            className="absolute top-5 left-5 px-2 py-1 rounded text-xs text-white"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </span>
        </motion.div>
      ))}
    </>
  );
}
```

## 📊 모니터링 & 로깅

### 성능 모니터링

```typescript
// lib/monitoring/performance-monitor.ts
export class PerformanceMonitor {
  private metrics: Map<string, Metric[]> = new Map();
  
  // API 응답 시간 측정
  async measureApiCall<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.recordMetric(name, {
        type: 'api_call',
        duration,
        success: true,
        timestamp: Date.now()
      });
      
      // 느린 API 경고
      if (duration > 3000) {
        console.warn(`Slow API call: ${name} took ${duration}ms`);
        await this.reportSlowApi(name, duration);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.recordMetric(name, {
        type: 'api_call',
        duration,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  // 컴포넌트 렌더링 성능
  measureRender(componentName: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      
      this.recordMetric(`render_${componentName}`, {
        type: 'render',
        duration,
        timestamp: Date.now()
      });
      
      if (duration > 16) { // 60fps = 16ms per frame
        console.warn(`Slow render: ${componentName} took ${duration}ms`);
      }
    };
  }
  
  // 메트릭 집계
  getAggregatedMetrics(name: string, period: number = 3600000) {
    const metrics = this.metrics.get(name) || [];
    const recent = metrics.filter(
      m => m.timestamp > Date.now() - period
    );
    
    if (recent.length === 0) return null;
    
    const durations = recent.map(m => m.duration);
    
    return {
      count: recent.length,
      avg: durations.reduce((a, b) => a + b, 0) / recent.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      p50: this.percentile(durations, 0.5),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
      errorRate: recent.filter(m => !m.success).length / recent.length
    };
  }
  
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }
}
```

### 에러 추적

```typescript
// lib/monitoring/error-tracker.ts
export class ErrorTracker {
  // 전역 에러 핸들러
  setupGlobalHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.logError({
          type: 'javascript',
          message: event.message,
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          type: 'unhandled_promise',
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack
        });
      });
    }
  }
  
  // 에러 로깅
  async logError(error: ErrorLog) {
    // 로컬 저장
    await supabase
      .from('error_logs')
      .insert({
        ...error,
        user_id: getCurrentUserId(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date()
      });
    
    // 심각한 에러는 즉시 알림
    if (error.severity === 'critical') {
      await this.sendAlert(error);
    }
  }
  
  // 에러 패턴 분석
  async analyzeErrorPatterns() {
    const { data: errors } = await supabase
      .from('error_logs')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .order('timestamp', { ascending: false });
    
    // 에러 그룹화
    const grouped = this.groupErrors(errors);
    
    // 트렌드 분석
    const trends = this.detectTrends(grouped);
    
    return {
      topErrors: grouped.slice(0, 10),
      trends,
      totalCount: errors.length,
      affectedUsers: new Set(errors.map(e => e.user_id)).size
    };
  }
}
```

## 🔧 시스템 안정성

### Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    youtube_api: false,
    cache: false,
    storage: false,
    realtime: false
  };
  
  // Database 체크
  try {
    await supabase.from('profiles').select('count').single();
    checks.database = true;
  } catch (error) {
    console.error('Database check failed:', error);
  }
  
  // YouTube API 체크
  try {
    await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=dQw4w9WgXcQ&key=' + process.env.YOUTUBE_API_KEY);
    checks.youtube_api = true;
  } catch (error) {
    console.error('YouTube API check failed:', error);
  }
  
  // 전체 상태 판단
  const healthy = Object.values(checks).every(v => v);
  
  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString()
    },
    { status: healthy ? 200 : 503 }
  );
}
```

## ✅ 구현 체크리스트

- [ ] API 쿼터 최적화 시스템
- [ ] 지능형 캐싱 전략
- [ ] 데이터베이스 최적화
- [ ] 프론트엔드 성능 개선
- [ ] 실시간 협업 기능
- [ ] 성능 모니터링 시스템
- [ ] 에러 추적 및 분석
- [ ] Health Check 엔드포인트

## 📝 최종 점검 사항

### 성능 목표
- 페이지 로드: < 3초 (3G)
- API 응답: < 500ms (p95)
- 실시간 업데이트: < 100ms
- 쿼터 효율: 80% 이상

### 안정성 목표
- 가동시간: 99.9%
- 에러율: < 0.1%
- 데이터 정합성: 100%

### 확장성 목표
- 동시 사용자: 1,000+
- 일일 API 호출: 100만+
- 데이터 저장: 100GB+

## 🎉 프로젝트 완료

YouTube Lens의 모든 Phase가 완료되었습니다. 각 Phase 문서를 순차적으로 구현하면 완전한 YouTube Shorts 분석 플랫폼이 완성됩니다.