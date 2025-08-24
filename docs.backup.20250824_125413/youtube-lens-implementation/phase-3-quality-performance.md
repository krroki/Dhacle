# Phase 3: 품질/성능/UX 고도화

## 🎯 목표
- **성능 최적화**: 캐싱, 배치 최적화, 쿼리 최적화
- **UX 개선**: 인터랙션, 애니메이션, 반응형 디자인
- **품질 보증**: 에러 처리, 로깅, 모니터링
- **접근성**: WCAG 2.1 AA 준수

## 📋 구현 작업 목록

### 1. 성능 최적화

#### 1.1 Redis 캐싱 레이어
```typescript
// src/lib/youtube-lens/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export class YLCache {
  private static TTL = {
    CHANNEL_STATS: 3600,      // 1시간
    TRENDING_KEYWORDS: 1800,   // 30분
    CATEGORY_STATS: 3600,      // 1시간
    DASHBOARD_SUMMARY: 300,    // 5분
  };

  /**
   * 캐시 키 생성
   */
  private static getKey(namespace: string, params: any): string {
    const sorted = Object.keys(params).sort().map(k => `${k}:${params[k]}`).join(':');
    return `yl:${namespace}:${sorted}`;
  }

  /**
   * 캐시 get with fallback
   */
  static async getOrSet<T>(
    namespace: string,
    params: any,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const key = this.getKey(namespace, params);
    
    try {
      // 캐시 확인
      const cached = await redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }

    // 캐시 미스 - 데이터 fetch
    const data = await fetcher();
    
    // 캐시 저장 (비동기)
    const finalTTL = ttl || this.TTL[namespace as keyof typeof this.TTL] || 300;
    redis.setex(key, finalTTL, JSON.stringify(data)).catch(err => 
      console.error('Cache write error:', err)
    );

    return data;
  }

  /**
   * 캐시 무효화
   */
  static async invalidate(namespace: string, params?: any): Promise<void> {
    if (params) {
      const key = this.getKey(namespace, params);
      await redis.del(key);
    } else {
      // 네임스페이스 전체 무효화
      const keys = await redis.keys(`yl:${namespace}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }

  /**
   * 배치 캐싱
   */
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const values = await redis.mget(keys);
    return values.map(v => v ? JSON.parse(v) : null);
  }

  static async mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    const pipeline = redis.pipeline();
    for (const item of items) {
      pipeline.setex(item.key, item.ttl || 300, JSON.stringify(item.value));
    }
    await pipeline.exec();
  }
}
```

#### 1.2 캐싱 적용 API
```typescript
// app/api/youtube-lens/trending-summary/route.ts 수정
import { YLCache } from '@/lib/youtube-lens/cache';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // 캐시 활용
    const data = await YLCache.getOrSet(
      'DASHBOARD_SUMMARY',
      { date: today, userId: user.id },
      async () => {
        // 기존 로직...
        const categoryStats = await fetchCategoryStats();
        const topDeltas = await fetchTopDeltas();
        const newcomers = await fetchNewcomers();
        const keywords = await fetchKeywords();
        
        return {
          categoryStats,
          topDeltas,
          newcomers,
          keywords,
          topShorts: [],
          followUpdates: [],
        };
      },
      300 // 5분 TTL
    );

    return NextResponse.json({
      success: true,
      data,
      cached: true,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
```

#### 1.3 DB 쿼리 최적화
```sql
-- 인덱스 추가
CREATE INDEX idx_yl_videos_published ON yl_videos(published_at DESC);
CREATE INDEX idx_yl_videos_shorts ON yl_videos(is_shorts) WHERE is_shorts = true;
CREATE INDEX idx_yl_delta_date_views ON yl_channel_daily_delta(date DESC, delta_views DESC);
CREATE INDEX idx_yl_keywords_date ON yl_trending_keywords(date DESC, growth_rate DESC);

-- Materialized View for 성능
CREATE MATERIALIZED VIEW yl_dashboard_summary AS
SELECT 
  c.category,
  c.subcategory,
  COUNT(DISTINCT c.channel_id) as channel_count,
  SUM(d.delta_views) as total_views,
  AVG(d.delta_views) as avg_views,
  MAX(d.delta_views) as max_views,
  d.date
FROM yl_channels c
LEFT JOIN yl_channel_daily_delta d ON c.channel_id = d.channel_id
WHERE c.approval_status = 'approved'
GROUP BY c.category, c.subcategory, d.date;

-- 1시간마다 새로고침
CREATE OR REPLACE FUNCTION refresh_dashboard_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY yl_dashboard_summary;
END;
$$ LANGUAGE plpgsql;
```

### 2. UX 개선

#### 2.1 스켈레톤 로딩
```typescript
// src/components/features/tools/youtube-lens/DashboardSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      {/* 카드 그리드 스켈레톤 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### 2.2 인터랙티브 차트
```typescript
// src/components/features/tools/youtube-lens/InteractiveChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumberKo } from '@/lib/youtube-lens/format-number-ko';

interface ChartData {
  date: string;
  value: number;
  label: string;
}

interface InteractiveChartProps {
  data: ChartData[];
  title: string;
  color?: string;
}

export function InteractiveChart({ 
  data, 
  title, 
  color = '#FF0000' 
}: InteractiveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 스케일
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) as number])
      .nice()
      .range([height, 0]);

    // 라인
    const line = d3.line<ChartData>()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // 그라디언트
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', y(0))
      .attr('x2', 0).attr('y2', y(d3.max(data, d => d.value) as number));

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.6);

    // 영역
    const area = d3.area<ChartData>()
      .x(d => x(new Date(d.date)))
      .y0(height)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('d', area);

    // 라인 그리기
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // 점
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(new Date(d.date)))
      .attr('cy', d => y(d.value))
      .attr('r', 4)
      .attr('fill', color)
      .on('mouseenter', function(event, d) {
        // 툴팁 표시
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`)
          .html(`
            <div class="font-semibold">${d.label}</div>
            <div class="text-sm">${formatNumberKo(d.value)}</div>
            <div class="text-xs text-muted-foreground">${d.date}</div>
          `);
        
        // 점 강조
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6);
      })
      .on('mouseleave', function() {
        // 툴팁 숨기기
        d3.select(tooltipRef.current).style('display', 'none');
        
        // 점 원복
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 4);
      });

    // 축
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%m/%d') as any));

    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => formatNumberKo(d as number)));

  }, [data, color]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg ref={svgRef} width="600" height="300" className="w-full h-auto" />
          <div 
            ref={tooltipRef}
            className="absolute hidden bg-white border rounded-lg shadow-lg p-2 z-10"
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

#### 2.3 실시간 업데이트 알림
```typescript
// src/components/features/tools/youtube-lens/RealtimeNotifications.tsx
'use client';

import { useEffect, useState } from 'react';
import { Bell, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  type: 'viral' | 'milestone' | 'alert' | 'update';
  title: string;
  message: string;
  timestamp: Date;
  channelId?: string;
}

export function RealtimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocket 연결
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
    
    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'subscribe', channel: 'yl-notifications' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'notification') {
        const notification: Notification = {
          id: Date.now().toString(),
          ...data.payload,
          timestamp: new Date(),
        };
        
        setNotifications(prev => [notification, ...prev].slice(0, 5));
        
        // 토스트 알림
        const icon = {
          viral: <TrendingUp className="w-4 h-4" />,
          milestone: <CheckCircle className="w-4 h-4" />,
          alert: <AlertCircle className="w-4 h-4" />,
          update: <Bell className="w-4 h-4" />,
        }[notification.type];
        
        toast(notification.title, {
          description: notification.message,
          icon,
        });
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 연결 상태 표시 */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-xs text-muted-foreground">
          {isConnected ? '실시간 연결됨' : '연결 끊김'}
        </span>
      </div>

      {/* 알림 리스트 */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className="bg-white border rounded-lg shadow-lg p-3 mb-2 max-w-sm"
          >
            <div className="flex items-start gap-2">
              <div className="mt-1">
                {notification.type === 'viral' && <TrendingUp className="w-4 h-4 text-red-500" />}
                {notification.type === 'milestone' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {notification.type === 'alert' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                {notification.type === 'update' && <Bell className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

### 3. 에러 처리 & 모니터링

#### 3.1 에러 바운더리
```typescript
// src/components/features/tools/youtube-lens/YLErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class YLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // 에러 로깅
    console.error('YouTube Lens Error:', error, errorInfo);
    
    // Sentry 전송
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: { componentStack: errorInfo.componentStack },
        },
      });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">문제가 발생했습니다</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              YouTube Lens 대시보드를 불러오는 중 오류가 발생했습니다.
              잠시 후 다시 시도해주세요.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </Button>
              <Button
                variant="outline"
                onClick={() => this.setState({ hasError: false })}
              >
                다시 시도
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs text-left w-full max-w-md">
                <summary className="cursor-pointer text-muted-foreground">
                  에러 상세 정보
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
```

#### 3.2 API 에러 핸들링
```typescript
// src/lib/youtube-lens/error-handler.ts

export enum YLErrorCode {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  CHANNEL_NOT_FOUND = 'CHANNEL_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_API_KEY = 'INVALID_API_KEY',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class YLError extends Error {
  code: YLErrorCode;
  details?: any;
  retryable: boolean;

  constructor(message: string, code: YLErrorCode, details?: any, retryable = false) {
    super(message);
    this.name = 'YLError';
    this.code = code;
    this.details = details;
    this.retryable = retryable;
  }
}

export function handleYouTubeAPIError(error: any): YLError {
  if (error.response?.status === 403) {
    const reason = error.response.data?.error?.errors?.[0]?.reason;
    
    if (reason === 'quotaExceeded') {
      return new YLError(
        'YouTube API 할당량을 초과했습니다. 내일 다시 시도해주세요.',
        YLErrorCode.QUOTA_EXCEEDED,
        error.response.data,
        false
      );
    }
    
    if (reason === 'forbidden') {
      return new YLError(
        'API 키가 유효하지 않거나 권한이 없습니다.',
        YLErrorCode.INVALID_API_KEY,
        error.response.data,
        false
      );
    }
  }
  
  if (error.response?.status === 429) {
    return new YLError(
      '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      YLErrorCode.RATE_LIMITED,
      error.response.data,
      true
    );
  }
  
  if (error.response?.status === 404) {
    return new YLError(
      '채널을 찾을 수 없습니다.',
      YLErrorCode.CHANNEL_NOT_FOUND,
      error.response.data,
      false
    );
  }
  
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new YLError(
      '네트워크 연결에 문제가 있습니다.',
      YLErrorCode.NETWORK_ERROR,
      error,
      true
    );
  }
  
  return new YLError(
    '알 수 없는 오류가 발생했습니다.',
    YLErrorCode.UNKNOWN,
    error,
    false
  );
}
```

### 4. 접근성 개선

#### 4.1 키보드 네비게이션
```typescript
// src/hooks/use-keyboard-navigation.ts
import { useEffect, useCallback } from 'react';

export function useKeyboardNavigation() {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 단축키 매핑
    const shortcuts = {
      'r': () => window.location.reload(), // R: 새로고침
      'd': () => document.getElementById('dashboard-tab')?.click(), // D: 대시보드
      's': () => document.getElementById('search-input')?.focus(), // S: 검색
      'f': () => document.getElementById('folders-tab')?.click(), // F: 폴더
      'c': () => document.getElementById('collections-tab')?.click(), // C: 컬렉션
      '?': () => document.getElementById('help-modal')?.click(), // ?: 도움말
    };

    // Ctrl/Cmd + 키 조합
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      const key = e.key.toLowerCase();
      if (key in shortcuts) {
        e.preventDefault();
        shortcuts[key as keyof typeof shortcuts]();
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

#### 4.2 ARIA 레이블 추가
```typescript
// 컴포넌트에 ARIA 속성 추가 예시
<Card
  role="region"
  aria-label="카테고리 점유율"
  aria-live="polite"
  aria-atomic="true"
>
  <CardHeader>
    <CardTitle id="category-chart-title">카테고리 점유율</CardTitle>
  </CardHeader>
  <CardContent aria-labelledby="category-chart-title">
    {/* 콘텐츠 */}
  </CardContent>
</Card>

// 스크린 리더 전용 텍스트
<span className="sr-only">
  총 {totalChannels}개 채널 중 {category.name}이 {category.share}%를 차지합니다
</span>
```

### 5. 성능 모니터링

#### 5.1 Performance Observer
```typescript
// src/lib/youtube-lens/performance-monitor.ts
export class PerformanceMonitor {
  private observer: PerformanceObserver;
  
  constructor() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // 느린 API 호출 감지
        if (entry.entryType === 'resource' && entry.duration > 1000) {
          console.warn('Slow API call:', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
          });
          
          // Analytics 전송
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'slow_api_call', {
              url: entry.name,
              duration: Math.round(entry.duration),
            });
          }
        }
        
        // LCP 추적
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
      }
    });
    
    // 옵저버 시작
    this.observer.observe({ 
      entryTypes: ['resource', 'largest-contentful-paint', 'first-input'] 
    });
  }
  
  measureApiCall(name: string, fn: () => Promise<any>) {
    const startMark = `api-start-${name}`;
    const endMark = `api-end-${name}`;
    
    performance.mark(startMark);
    
    return fn().finally(() => {
      performance.mark(endMark);
      performance.measure(name, startMark, endMark);
      
      const measure = performance.getEntriesByName(name)[0];
      if (measure && measure.duration > 500) {
        console.warn(`Slow API: ${name} took ${measure.duration}ms`);
      }
    });
  }
}
```

## 🧪 테스트 체크리스트

### 성능 테스트
- [ ] 대시보드 초기 로딩 < 3초
- [ ] API 응답 시간 < 500ms (캐시 히트)
- [ ] 메모리 사용량 < 100MB
- [ ] CPU 사용률 < 30%

### 접근성 테스트
- [ ] 키보드만으로 모든 기능 사용 가능
- [ ] 스크린 리더 호환성
- [ ] 색맹 모드 지원
- [ ] 포커스 표시 명확

### 에러 처리 테스트
- [ ] API 할당량 초과 시 적절한 메시지
- [ ] 네트워크 오류 시 재시도 옵션
- [ ] 데이터 없을 때 Empty State
- [ ] 에러 로깅 및 모니터링

### 브라우저 호환성
- [ ] Chrome 90+
- [ ] Safari 14+
- [ ] Firefox 88+
- [ ] Edge 90+

## ✅ Phase 3 완료 기준

- [ ] 페이지 로드 시간 < 3초
- [ ] Lighthouse 점수 > 90
- [ ] 에러율 < 1%
- [ ] 캐시 적중률 > 80%
- [ ] WCAG 2.1 AA 준수
- [ ] 모든 단축키 동작
- [ ] 실시간 알림 전달 < 1초

## 📌 배포 준비 체크리스트

### 환경 변수 설정
```env
# Production .env
YT_ADMIN_KEY=본인_운영_API_키
REDIS_URL=redis://production-redis-url
NEXT_PUBLIC_WS_URL=wss://production-websocket-url
ADMIN_EMAIL=admin@dhacle.com
SENTRY_DSN=sentry-dsn-url
```

### 배포 스크립트
```json
// package.json
{
  "scripts": {
    "build:prod": "NODE_ENV=production next build",
    "migrate:prod": "npx supabase db push",
    "deploy": "npm run migrate:prod && npm run build:prod && vercel --prod"
  }
}
```

### 모니터링 설정
- [ ] Sentry 에러 추적
- [ ] Google Analytics 4
- [ ] Uptime 모니터링
- [ ] API 사용량 대시보드

## 🎉 구현 완료

YouTube Lens 대시보드 개선이 완료되었습니다!

### 달성 사항
- ✅ 승인 채널 기반 Δ 랭킹
- ✅ Shorts 자동 판별
- ✅ 키워드 트렌드 분석
- ✅ 카테고리 통계
- ✅ 천/만 한국어 포맷
- ✅ 7필드 필수 표시
- ✅ RLS 보안 적용
- ✅ 캐싱 최적화
- ✅ 실시간 알림
- ✅ 접근성 준수