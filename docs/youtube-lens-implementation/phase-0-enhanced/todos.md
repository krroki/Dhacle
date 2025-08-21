# 📋 YouTube Lens Phase 0 Enhanced - 구현 작업 목록

**목적**: YouTube Lens Phase 0 Enhanced 구현을 위한 체계적 작업 지시서
**원칙**: 실제 구현 검증 > 문서 신뢰, 증거 기반 작업, TypeScript any 타입 절대 금지

---

## 🚨 절대 준수 사항

### ❌ 금지 사항
1. **TypeScript any 타입 절대 사용 금지** → unknown 타입 + 타입 가드 사용
2. **추측 기반 작업** → 반드시 파일 내용 확인 후 작업
3. **부분 코드 제시** → 전체 파일 내용만 제공
4. **"..." 사용** → 완전한 코드만 작성
5. **문서 맹신** → 실제 코드 검증 우선

### ✅ 필수 원칙
1. **증거 우선**: 모든 결정에 실제 파일 내용 근거
2. **완전성**: 전체 파일, 전체 프로세스
3. **투명성**: 실패는 실패로, 모름은 모름으로
4. **검증 가능**: 구체적 명령과 예상 결과
5. **타입 안전성**: strict mode 준수

---

## 1️⃣ 프로젝트 온보딩 및 구조 파악

### 13개 핵심 문서 체계 확인
- [x] `/CLAUDE.md` - AI 작업 지침서 확인
- [x] `/docs/PROJECT.md` - 프로젝트 현황 파악
- [x] `/docs/CODEMAP.md` - 프로젝트 구조 확인
- [ ] `/docs/DATA_MODEL.md` - 데이터 모델과 타입 시스템 확인
- [ ] `/docs/FLOWMAP.md` - 사용자 플로우와 인증 경로 확인
- [ ] `/docs/WIREFRAME.md` - UI-API 연결 상태 확인
- [ ] `/docs/ROUTE_SPEC.md` - 라우트 구조와 보호 상태 확인
- [ ] `/docs/COMPONENT_INVENTORY.md` - 재사용 가능 컴포넌트 확인
- [ ] `/docs/STATE_FLOW.md` - 상태 관리 패턴 확인
- [ ] `/docs/ERROR_BOUNDARY.md` - 에러 처리 전략 확인
- [ ] `/docs/CHECKLIST.md` - 작업 검증 체크리스트 확인
- [ ] `/docs/DOCUMENT_GUIDE.md` - 문서 가이드라인 확인
- [ ] `/docs/INSTRUCTION_TEMPLATE.md` - 지시서 템플릿 확인

### 기술 파일 확인
```bash
# 실행 명령
cat package.json | grep -E '"next"|"typescript"|"tailwind"|"supabase"'
cat tsconfig.json | grep '"strict"'
test -f tailwind.config.js && echo "Tailwind 설정 존재"
test -f .env.example && echo "환경 변수 구조 존재"
```

### 프로젝트 특성 파악
- [ ] Next.js 버전: 15.4.6 (App Router 확인)
- [ ] TypeScript strict mode: true 확인
- [ ] Tailwind CSS 설정 확인
- [ ] Supabase 연동 확인
- [ ] Zustand 상태 관리 확인

---

## 2️⃣ Stage 1: Implementation Verification (구현 검증)

### 컴포넌트 존재 확인
```bash
#!/bin/bash
# validate-components.sh
COMPONENTS=(
  "VideoGrid"
  "SearchBar"
  "QuotaStatus"
  "YouTubeLensErrorBoundary"
  "PopularShortsList"
  "ChannelFolders"
  "CollectionBoard"
  "AlertRules"
  "MetricsDashboard"
)

for component in "${COMPONENTS[@]}"; do
  FILE_PATH="src/components/features/tools/youtube-lens/${component}.tsx"
  if test -f "$FILE_PATH"; then
    echo "✅ ${component} 존재"
    npx tsc --noEmit "$FILE_PATH" 2>/dev/null && echo "   └─ 타입 안전"
  else
    echo "❌ ${component} 없음 - 생성 필요"
  fi
done
```

### 컴포넌트별 작업 목록

#### [ ] VideoGrid.tsx
- [ ] 파일 존재 확인
- [ ] TypeScript 타입 안전성 검증
- [ ] API 호출 로직 확인
- [ ] 에러 처리 구현 확인
- [ ] 반응형 디자인 확인

#### [ ] SearchBar.tsx
- [ ] 파일 존재 확인
- [ ] 검색 디바운싱 구현 확인
- [ ] 입력 검증 로직 확인
- [ ] 검색 히스토리 저장 확인

#### [ ] QuotaStatus.tsx
- [ ] 파일 존재 확인
- [ ] 실시간 쿼터 표시 확인
- [ ] 경고 임계값 구현 확인
- [ ] 시각적 표시 (프로그레스바) 확인

#### [ ] YouTubeLensErrorBoundary.tsx
- [ ] 파일 존재 확인
- [ ] 에러 캐칭 로직 확인
- [ ] 폴백 UI 구현 확인
- [ ] 에러 로깅 구현 확인
- [ ] 강화된 에러 처리 구현:
  ```typescript
  // 에러 바운더리 강화 구현
  import React, { ErrorInfo, ReactNode } from 'react';
  
  type ErrorCategory = 'quotaExceeded' | 'unauthorized' | 'networkError' | 'typeError' | 'unknown';
  
  interface RecoveryStrategy {
    action: 'wait' | 'redirect' | 'retry' | 'report';
    message?: string;
    target?: string;
    attempts?: number;
    delay?: number;
  }
  
  class YouTubeLensErrorBoundary extends React.Component<
    { children: ReactNode },
    { hasError: boolean; error: Error | null; category: ErrorCategory }
  > {
    private errorPatterns = {
      quotaExceeded: /quota.*exceeded/i,
      unauthorized: /401|unauthorized/i,
      networkError: /network|fetch/i,
      typeError: /cannot read|undefined/i
    };
    
    state = {
      hasError: false,
      error: null,
      category: 'unknown' as ErrorCategory
    };
    
    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }
    
    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      const category = this.categorizeError(error);
      this.setState({ category });
      
      // 에러 로깅
      console.error('YouTubeLens Error:', {
        category,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
      
      // 선택적: 에러 보고 서비스로 전송
      // sendToErrorReportingService({ error, errorInfo, category });
    }
    
    categorizeError(error: Error): ErrorCategory {
      const message = error.message.toLowerCase();
      
      for (const [category, pattern] of Object.entries(this.errorPatterns)) {
        if (pattern.test(message)) {
          return category as ErrorCategory;
        }
      }
      
      return 'unknown';
    }
    
    getRecoveryStrategy(category: ErrorCategory): RecoveryStrategy {
      switch (category) {
        case 'quotaExceeded':
          return { 
            action: 'wait', 
            message: 'API 할당량 초과. 24시간 후 재시도해주세요.' 
          };
        case 'unauthorized':
          return { 
            action: 'redirect', 
            target: '/auth/login',
            message: '인증이 필요합니다. 로그인 페이지로 이동합니다.'
          };
        case 'networkError':
          return { 
            action: 'retry', 
            attempts: 3, 
            delay: 1000,
            message: '네트워크 오류. 자동으로 재시도합니다.'
          };
        default:
          return { 
            action: 'report', 
            target: '/error-report',
            message: '예기치 않은 오류가 발생했습니다.'
          };
      }
    }
    
    handleRecovery = () => {
      const strategy = this.getRecoveryStrategy(this.state.category);
      
      switch (strategy.action) {
        case 'redirect':
          window.location.href = strategy.target || '/';
          break;
        case 'retry':
          setTimeout(() => {
            this.setState({ hasError: false, error: null });
          }, strategy.delay || 1000);
          break;
        case 'report':
          // 에러 리포트 페이지로 이동 또는 모달 표시
          break;
        default:
          // wait 또는 기타 액션
          break;
      }
    };
    
    render() {
      if (this.state.hasError) {
        const strategy = this.getRecoveryStrategy(this.state.category);
        
        return (
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-bold text-red-600">
                오류가 발생했습니다
              </h2>
              <p className="mb-4 text-gray-600">{strategy.message}</p>
              <div className="flex gap-2">
                <button
                  onClick={this.handleRecovery}
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  {strategy.action === 'retry' ? '재시도' : '확인'}
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>
        );
      }
      
      return this.props.children;
    }
  }
  
  export default YouTubeLensErrorBoundary;
  ```

#### [ ] PopularShortsList.tsx
- [ ] 파일 존재 확인
- [ ] 인기 Shorts API 연동 확인
- [ ] 무한 스크롤 구현 확인
- [ ] 로딩 상태 처리 확인

#### [ ] ChannelFolders.tsx
- [ ] 파일 존재 확인
- [ ] 폴더 CRUD 기능 확인
- [ ] 드래그 앤 드롭 구현 확인
- [ ] 로컬 스토리지 동기화 확인

#### [ ] CollectionBoard.tsx
- [ ] 파일 존재 확인
- [ ] 컬렉션 관리 기능 확인
- [ ] 비디오 추가/제거 기능 확인
- [ ] 공유 기능 구현 확인

#### [ ] AlertRules.tsx
- [ ] 파일 존재 확인
- [ ] 알림 규칙 설정 UI 확인
- [ ] 조건 설정 로직 확인
- [ ] 알림 트리거 구현 확인

#### [ ] MetricsDashboard.tsx
- [ ] 파일 생성 필요 (없을 가능성 높음)
- [ ] 채널 통계 표시 구현
- [ ] 차트 라이브러리 통합
- [ ] 실시간 업데이트 구현

---

## 3️⃣ Stage 2: API Endpoint Gap Analysis

### 기존 API 엔드포인트 검증
```bash
# API 엔드포인트 확인 스크립트
ENDPOINTS=("popular" "search" "folders" "collections" "favorites" "metrics")
for endpoint in "${ENDPOINTS[@]}"; do
  FILE="src/app/api/youtube-lens/${endpoint}/route.ts"
  if test -f "$FILE"; then
    echo "✅ /api/youtube-lens/${endpoint} 존재"
    grep -q "getUser()" "$FILE" && echo "   └─ 인증 구현됨"
  else
    echo "❌ /api/youtube-lens/${endpoint} 없음"
  fi
done
```

### API 엔드포인트 작업 목록

#### 기존 엔드포인트 수정
- [ ] `/api/youtube-lens/popular/route.ts` - 인증 방식 확인
- [ ] `/api/youtube-lens/search/route.ts` - 쿼터 체크 추가
- [ ] `/api/youtube-lens/folders/route.ts` - CRUD 완성도 확인
- [ ] `/api/youtube-lens/collections/route.ts` - 권한 체크 확인
- [ ] `/api/youtube-lens/favorites/route.ts` - 중복 방지 로직 확인
- [ ] `/api/youtube-lens/metrics/route.ts` - 완전 교체 필요

#### 신규 엔드포인트 생성
- [ ] `/api/youtube-lens/trending-summary/route.ts`
  ```typescript
  // 구현 내용
  export async function GET(request: Request) {
    // 공개 API (인증 불필요)
    // 캐싱: 6시간
    // 승인된 채널만 조회
  }
  ```

- [ ] `/api/youtube-lens/ranking/route.ts`
  ```typescript
  // 구현 내용
  export async function GET(request: Request) {
    // 공개 API (인증 불필요)
    // 캐싱: 1시간
    // 일일/주간/성장률 순위
  }
  ```

- [ ] `/api/youtube-lens/admin/channels/route.ts`
  ```typescript
  // 구현 내용
  export async function GET() { /* 목록 조회 */ }
  export async function POST() { /* 채널 추가 */ }
  export async function PUT() { /* 승인 상태 변경 */ }
  ```

- [ ] `/api/youtube-lens/admin/approval-logs/route.ts`
  ```typescript
  // 구현 내용
  export async function GET() {
    // 관리자 전용
    // 승인/거절 로그 조회
  }
  ```

---

## 4️⃣ Stage 3: Database Schema Implementation

### 테이블 생성 작업
```sql
-- 실행 명령: node scripts/supabase-sql-executor.js --method pg --file migrations/yl_tables.sql
```

#### [ ] yl_channels 테이블
```sql
CREATE TABLE IF NOT EXISTS yl_channels (
  channel_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  handle TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  subscriber_count BIGINT DEFAULT 0,
  view_count_total BIGINT DEFAULT 0,
  category TEXT,
  subcategory TEXT,
  dominant_format TEXT CHECK (dominant_format IN ('shorts', 'longform', 'live', 'mixed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_yl_approval_status ON yl_channels(approval_status);
CREATE INDEX idx_yl_category ON yl_channels(category, subcategory);
CREATE INDEX idx_yl_dominant_format ON yl_channels(dominant_format);
```

#### [ ] yl_channel_daily_snapshot 테이블
```sql
CREATE TABLE IF NOT EXISTS yl_channel_daily_snapshot (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  view_count_total BIGINT NOT NULL DEFAULT 0,
  subscriber_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  shorts_count INTEGER DEFAULT 0,
  PRIMARY KEY(channel_id, date)
);
```

#### [ ] yl_channel_daily_delta 테이블
```sql
CREATE TABLE IF NOT EXISTS yl_channel_daily_delta (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  delta_views BIGINT NOT NULL DEFAULT 0,
  delta_subscribers BIGINT DEFAULT 0,
  growth_rate DECIMAL(5,2) DEFAULT 0.00,
  PRIMARY KEY(channel_id, date)
);

-- 인덱스 생성
CREATE INDEX idx_date_delta ON yl_channel_daily_delta(date DESC, delta_views DESC);
```

### DB 트리거 및 자동 갱신 함수
```sql
-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- yl_channels 테이블에 트리거 적용
CREATE TRIGGER update_yl_channels_updated_at
  BEFORE UPDATE ON yl_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 파티셔닝 고려사항 (월별 파티션 - 선택적)
-- yl_channel_daily_snapshot 테이블을 월별로 파티셔닝할 경우
-- CREATE TABLE yl_channel_daily_snapshot_2025_01 PARTITION OF yl_channel_daily_snapshot
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### RLS 정책 적용
```sql
-- RLS 활성화
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channel_daily_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Admin only write" ON yl_channels
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
  
CREATE POLICY "Public read approved" ON yl_channels
  FOR SELECT USING (approval_status = 'approved');

-- Snapshot 테이블 정책
CREATE POLICY "Public read snapshots" ON yl_channel_daily_snapshot
  FOR SELECT USING (true);

-- Delta 테이블 정책  
CREATE POLICY "Public read deltas" ON yl_channel_daily_delta
  FOR SELECT USING (true);
```

---

## 5️⃣ TypeScript Type Safety Implementation

### 타입 정의 파일 생성

#### [ ] src/types/youtube-lens-v2.ts
```typescript
// 새로운 타입 정의 (any 타입 절대 금지!)
export interface YLChannel {
  channelId: string;
  title: string;
  handle?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  subscriberCount: number;
  viewCountTotal: number;
  category?: string;
  subcategory?: string;
  dominantFormat: 'shorts' | 'longform' | 'live' | 'mixed';
  createdAt: string;
  updatedAt: string;
}

export interface YLChannelDailySnapshot {
  channelId: string;
  date: string;
  viewCountTotal: number;
  subscriberCount: number;
  videoCount: number;
  shortsCount: number;
}

export interface YLChannelDailyDelta {
  channelId: string;
  date: string;
  deltaViews: number;
  deltaSubscribers: number;
  growthRate: number;
}

// API Response 타입 (unknown 사용 후 타입 가드)
export interface YLApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// 타입 가드 함수
export function isYLChannel(data: unknown): data is YLChannel {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.channelId === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.subscriberCount === 'number'
  );
}
```

### 타입 안전성 검증 스크립트
```bash
# 실행: npm run phase0:types
npx tsc --noEmit
grep -r "any" src/app/api/youtube-lens/ src/components/features/tools/youtube-lens/
grep -r "as " src/app/api/youtube-lens/ src/components/features/tools/youtube-lens/
```

---

## 6️⃣ Zustand Store Implementation

### [ ] src/store/youtube-lens-v2.ts
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { YLChannel, YLChannelDailyDelta } from '@/types/youtube-lens-v2';

interface YouTubeLensStoreV2 {
  // 새로운 상태 (v2 prefix로 충돌 방지)
  v2_approvedChannels: Map<string, YLChannel>;
  v2_channelDeltas: Map<string, YLChannelDailyDelta>;
  v2_dashboardMetrics: {
    totalChannels: number;
    totalViews: number;
    averageGrowth: number;
    lastUpdated: string;
  };
  
  // 액션
  v2_setApprovedChannels: (channels: YLChannel[]) => void;
  v2_updateChannelDelta: (channelId: string, delta: YLChannelDailyDelta) => void;
  v2_updateDashboardMetrics: (metrics: Partial<typeof v2_dashboardMetrics>) => void;
  
  // 셀렉터
  v2_getChannelById: (channelId: string) => YLChannel | undefined;
  v2_getTopGrowthChannels: (limit: number) => YLChannel[];
}

export const useYouTubeLensStoreV2 = create<YouTubeLensStoreV2>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      v2_approvedChannels: new Map(),
      v2_channelDeltas: new Map(),
      v2_dashboardMetrics: {
        totalChannels: 0,
        totalViews: 0,
        averageGrowth: 0,
        lastUpdated: new Date().toISOString()
      },
      
      // 액션 구현
      v2_setApprovedChannels: (channels) => {
        const channelMap = new Map(channels.map(ch => [ch.channelId, ch]));
        set({ v2_approvedChannels: channelMap });
      },
      
      v2_updateChannelDelta: (channelId, delta) => {
        set((state) => {
          const newDeltas = new Map(state.v2_channelDeltas);
          newDeltas.set(channelId, delta);
          return { v2_channelDeltas: newDeltas };
        });
      },
      
      v2_updateDashboardMetrics: (metrics) => {
        set((state) => ({
          v2_dashboardMetrics: { ...state.v2_dashboardMetrics, ...metrics }
        }));
      },
      
      // 셀렉터 구현
      v2_getChannelById: (channelId) => {
        return get().v2_approvedChannels.get(channelId);
      },
      
      v2_getTopGrowthChannels: (limit) => {
        const channels = Array.from(get().v2_approvedChannels.values());
        const deltas = get().v2_channelDeltas;
        
        return channels
          .map(ch => ({
            ...ch,
            growth: deltas.get(ch.channelId)?.growthRate || 0
          }))
          .sort((a, b) => b.growth - a.growth)
          .slice(0, limit)
          .map(({ growth, ...ch }) => ch);
      }
    }),
    {
      name: 'youtube-lens-v2-store'
    }
  )
);
```

---

## 7️⃣ API Quota Simulation & Optimization

### [ ] 쿼터 계산 및 최적화 구현
```typescript
// src/lib/youtube-lens/quota-calculator.ts
export class QuotaCalculator {
  private readonly DAILY_QUOTA = 10000;
  private readonly costs = {
    'channels.list': 1,
    'playlistItems.list': 1,
    'videos.list': 1,
    'search.list': 100 // 절대 사용 금지!
  };

  calculateDailyUsage(channelCount: number): {
    total: number;
    percentage: number;
    safe: boolean;
  } {
    const batchSize = 50;
    const batches = Math.ceil(channelCount / batchSize);
    
    const usage = {
      channels: batches * this.costs['channels.list'],
      videos: Math.ceil(channelCount * 0.02) * this.costs['videos.list'],
      total: 0
    };
    
    usage.total = usage.channels + usage.videos;
    const percentage = (usage.total / this.DAILY_QUOTA) * 100;
    
    return {
      total: usage.total,
      percentage,
      safe: percentage < 1 // 1% 미만이면 안전
    };
  }
}
```

### [ ] 캐싱 전략 구현
```typescript
// src/lib/youtube-lens/cache-strategy.ts
export const cacheConfig = {
  channelStats: 24 * 60 * 60 * 1000,     // 24시간
  videoDetails: 7 * 24 * 60 * 60 * 1000, // 7일
  deltaCalculations: 60 * 60 * 1000,     // 1시간
  rankings: 6 * 60 * 60 * 1000            // 6시간
};
```

### [ ] 유틸리티 함수 구현
```typescript
// src/lib/youtube-lens/utils/format-ko.ts
export function formatNumberKo(n: number): string {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toString();
}

// src/lib/youtube-lens/utils/shorts-detector.ts
export function detectShorts(video: VideoData): boolean {
  const duration = video.contentDetails?.duration;
  if (!duration) return false;
  
  // PT1M = 1분, PT60S = 60초
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return false;
  
  const minutes = parseInt(match[1] || '0');
  const seconds = parseInt(match[2] || '0');
  const totalSeconds = minutes * 60 + seconds;
  
  return totalSeconds <= 60; // 60초 이하 = Shorts
}

// src/lib/youtube-lens/utils/delta-calculator.ts
interface DeltaResult {
  absolute: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  formatted: string;
}

export function calculateDelta(
  current: number, 
  previous: number,
  options: { clipNegative?: boolean } = {}
): DeltaResult {
  const delta = current - previous;
  const percentChange = previous > 0 ? (delta / previous) * 100 : 0;
  
  return {
    absolute: options.clipNegative ? Math.max(0, delta) : delta,
    percentage: percentChange,
    trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'stable',
    formatted: formatNumberKo(Math.abs(delta))
  };
}

// src/lib/youtube-lens/utils/batch-processor.ts
export class BatchProcessor<T> {
  constructor(
    private batchSize: number = 50,
    private delayMs: number = 100
  ) {}
  
  async processBatches<R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
      
      // Rate limiting delay
      if (i + this.batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, this.delayMs));
      }
    }
    
    return results;
  }
}
```

---

## 8️⃣ Integration Testing

### 자동 검증 스크립트 설정

#### [ ] package.json 스크립트 추가
```json
{
  "scripts": {
    "phase0:validate": "npm run phase0:components && npm run phase0:api && npm run phase0:db && npm run phase0:types && npm run phase0:quota",
    "phase0:components": "bash scripts/validate-components.sh",
    "phase0:api": "ts-node scripts/validate-api-endpoints.ts",
    "phase0:db": "node scripts/supabase-sql-executor.js --method pg --file scripts/validate-schema.sql",
    "phase0:types": "ts-node scripts/validate-types.ts",
    "phase0:quota": "ts-node scripts/simulate-quota.ts",
    "phase0:report": "ts-node scripts/generate-phase0-report.ts"
  }
}
```

### 통합 테스트 체크리스트
- [ ] 컴포넌트 검증 통과 (9/9)
- [ ] API 엔드포인트 검증 통과 (10/10)
- [ ] DB 스키마 검증 통과 (3/3 테이블)
- [ ] TypeScript 타입 안전성 100%
- [ ] API 쿼터 사용량 < 1%
- [ ] 전체 빌드 성공 (`npm run build`)

---

## 9️⃣ Phase 0 완료 기준

### 완료 체크리스트
- [ ] 모든 필수 컴포넌트 구현 완료
- [ ] 모든 API 엔드포인트 구현 완료
- [ ] DB 스키마 및 RLS 정책 적용 완료
- [ ] TypeScript any 타입 0개
- [ ] API 쿼터 시뮬레이션 안전 범위
- [ ] 자동 검증 스크립트 100% 통과
- [ ] Phase 0 완료 리포트 생성

### 성공 기준
```
================================================
          PHASE 0 COMPLETION REPORT
================================================

종합 점수: 95.0% 이상

상태: READY

✅ Phase 1 진입 준비 완료!
```

---

## 🚨 리스크 매트릭스 & 영향도 분석

### 리스크 레벨 정의
- **P1**: 즉시 대응 필요 (서비스 중단 가능성)
- **P2**: 24시간 내 대응 (기능 저하)
- **P3**: 1주일 내 대응 (사용자 경험 저하)
- **P4**: 계획적 대응 (개선 사항)

### 상세 리스크 분석
| 리스크 | 레벨 | 확률 | 영향 | 완화 전략 | 검증 방법 |
|-------|------|-----|-----|---------|---------|
| API 통계 지연/부정확 | P3 | 높음 | 중간 | Δ "추정치" 라벨, 7일 트렌드 표시 | A/B 테스트 |
| 기존 기능 충돌 | P1 | 낮음 | 높음 | v2 네임스페이스, 별도 테이블 | 통합 테스트 |
| 쿼터 초과 | P2 | 중간 | 높음 | 배치 최적화, 24h 캐싱 | 모니터링 대시보드 |
| RLS 정책 누출 | P1 | 낮음 | 치명적 | 이중 체크, admin 역할 분리 | 펜테스트 |
| 타입 불일치 | P2 | 중간 | 중간 | strict mode, unknown 사용 | tsc --noEmit |
| 성능 저하 | P3 | 중간 | 낮음 | 인덱싱, 페이지네이션 | Lighthouse |
| YouTube API 에러 | P2 | 중간 | 높음 | Circuit breaker, 재시도 로직 | 에러 로깅 |
| DB 트랜잭션 실패 | P1 | 낮음 | 높음 | 롤백 메커니즘, 트랜잭션 격리 | 트랜잭션 테스트 |

### 영향도 분석 매트릭스
| 파일 경로 | 영향도 | 변경 내용 | 리스크 | 백업 전략 |
|----------|--------|----------|--------|----------|
| `/tools/youtube-lens/page.tsx` | 🟡 Major | 대시보드 탭 내용 교체 | 기존 탭 보존 필수 | Git 브랜치 |
| `/MetricsDashboard.tsx` | 🔴 Critical | 완전 교체 | 백업 필수 | 파일 복사본 |
| `/store/youtube-lens.ts` | 🟡 Major | 상태 추가 (v2 prefix) | 네임스페이스 충돌 | 별도 스토어 |
| `/api/youtube-lens/*` | 🟢 Minor | 신규 라우트 추가 | 기존 라우트 영향 없음 | - |
| 기타 컴포넌트들 | ⚪ None | 변경 없음 | 없음 | - |

### YouTube API 에러 처리 매트릭스
| 에러 코드 | 원인 | 해결 방법 | 예방책 |
|----------|-----|----------|-------|
| 403 | 쿼터 초과 | 24시간 대기 or 키 교체 | 배치 최적화, 캐싱 |
| 404 | 채널/비디오 없음 | Soft delete 처리 | 존재 확인 로직 |
| 401 | API 키 무효 | 키 재발급 | 키 로테이션 |
| 500 | YouTube 서버 에러 | 재시도 (exponential backoff) | Circuit breaker |

---

## 🔴 실패 시 대응

### 컴포넌트 누락
- MetricsDashboard.tsx 생성 필요
- 기존 컴포넌트 재사용 가능성 검토
- shadcn/ui 컴포넌트 활용

### API 구현 실패
- 에러 로그 확인
- 인증 방식 통일 (getUser() 사용)
- 401 에러 표준 형식 준수

### DB 스키마 오류
- node scripts/supabase-sql-executor.js 사용
- RLS 정책 반드시 적용
- 트리거 설정 확인

### 타입 안전성 문제
- any 타입 → unknown + 타입 가드
- 타입 단언(as) 최소화
- strict mode 활성화 확인

---

## 📝 진행 상황 추적

### 현재 진행률: 0%
- [ ] Stage 1: Implementation Verification (0/9)
- [ ] Stage 2: API Gap Analysis (0/10)
- [ ] Stage 3: Database Implementation (0/3)
- [ ] Stage 4: Type Safety (0/2)
- [ ] Stage 5: Store Implementation (0/1)
- [ ] Stage 6: Quota Optimization (0/2)
- [ ] Stage 7: Integration Testing (0/6)
- [ ] Stage 8: Phase 0 Completion (0/7)

### 다음 작업
1. 컴포넌트 존재 확인 스크립트 실행
2. 누락된 컴포넌트 생성
3. API 엔드포인트 구현
4. DB 마이그레이션 실행

---

## 🎬 SC 명령어 실행 시퀀스

### Phase 0 완전 자동화 실행 명령
```bash
# 1단계: 전체 감사 (구조 파악 및 현황 분석)
/sc:analyze --seq --ultrathink --delegate files --c7
"Phase 0 YouTube Lens 감사 실행. INSTRUCTION_TEMPLATE.md 원칙 적용"

# 2단계: 컴포넌트 검증 (재사용 가능성 평가)
/sc:implement --seq --validate --think
"기존 YouTube Lens 컴포넌트 동작 검증 및 재사용성 평가"

# 3단계: DB 준비 (테이블 및 RLS 설정)
/sc:build --seq --validate --c7
"yl_channels, yl_channel_daily_snapshot, yl_channel_daily_delta 테이블 생성"

# 4단계: API 엔드포인트 구현 (신규 및 수정)
/sc:implement --seq --validate --think-hard --c7
"trending-summary, ranking, admin/channels 엔드포인트 구현"

# 5단계: 최종 검증 (Phase 1 진입 준비)
/sc:fix --seq --validate --introspect
"Phase 0 체크리스트 검증 및 Phase 1 진입 준비"
```

### 예상 실행 시간 및 결과
| 단계 | 예상 시간 | 성공 지표 | 실패 시 대응 |
|-----|----------|---------|------------|
| 1단계 | 10-15분 | 13개 문서 확인 완료 | 누락 문서 생성 |
| 2단계 | 15-20분 | 9개 컴포넌트 검증 | 컴포넌트 생성 |
| 3단계 | 5-10분 | 3개 테이블 생성 | SQL 수동 실행 |
| 4단계 | 20-30분 | 10개 API 구현 | 개별 수정 |
| 5단계 | 5-10분 | 95% 이상 통과 | 실패 항목 수정 |

---

## 📝 문서 업데이트 요구사항

### Phase 0 완료 시 필수 업데이트 문서
1. **WIREFRAME.md** 
   - YouTube Lens 섹션에 새 대시보드 UI 추가
   - 승인된 채널 관리 화면 추가
   - 순위 시스템 화면 추가

2. **COMPONENT_INVENTORY.md**
   - 신규 컴포넌트: MetricsDashboard.tsx (신규)
   - 수정 컴포넌트: YouTubeLensErrorBoundary.tsx (강화)
   - 유틸리티 함수: 4개 추가

3. **ROUTE_SPEC.md**
   - 신규 라우트 4개 추가
     - `/api/youtube-lens/trending-summary`
     - `/api/youtube-lens/ranking`
     - `/api/youtube-lens/admin/channels`
     - `/api/youtube-lens/admin/approval-logs`
   - 수정 라우트 1개
     - `/api/youtube-lens/metrics` (완전 교체)

4. **DATA_MODEL.md**
   - 신규 타입 추가
     - YLChannel
     - YLChannelDailySnapshot
     - YLChannelDailyDelta
   - Store 확장
     - YouTubeLensStoreV2

5. **PROJECT.md**
   - Phase 0 완료 상태 기록
   - 진행률 업데이트
   - 이슈 해결 현황
   - 다음 단계 계획

### 문서 업데이트 체크리스트
- [ ] 각 문서의 버전 정보 갱신 (날짜, 버전 번호)
- [ ] 구현 상태 표시 (✅ 완료, ⚠️ 진행중, ❌ 미구현)
- [ ] 관련 문서 간 상호 참조 링크 확인
- [ ] 중복 내용 제거 및 통합
- [ ] Phase 1 진입을 위한 준비 사항 명시

---

## ✅ Phase 0 완료 최종 검증 체크리스트

### 구현 완료 확인
- [ ] 9개 컴포넌트 모두 구현 및 동작 확인
- [ ] 10개 API 엔드포인트 구현 및 인증 처리
- [ ] 3개 DB 테이블 생성 및 RLS 정책 적용
- [ ] TypeScript any 타입 0개 확인
- [ ] 유틸리티 함수 4개 구현
- [ ] Zustand Store V2 구현
- [ ] ErrorBoundary 강화 구현

### 자동 검증 통과
- [ ] `npm run phase0:validate` 100% 통과
- [ ] `npm run build` 성공
- [ ] `npm run types:check` 오류 없음
- [ ] API 쿼터 시뮬레이션 < 1%

### 문서 업데이트 완료
- [ ] 5개 핵심 문서 업데이트
- [ ] Phase 0 완료 리포트 생성
- [ ] Phase 1 진입 계획 문서화

### 리스크 관리
- [ ] P1 레벨 리스크 모두 해결
- [ ] P2 레벨 리스크 완화 전략 구현
- [ ] 백업 및 롤백 계획 준비

---

*작성일: 2025-02-02*
*최종 개선: 2025-02-02*
*작성자: Claude Code with SuperClaude Framework*
*원칙: 실제 구현 검증 > 문서 신뢰, TypeScript any 타입 절대 금지*