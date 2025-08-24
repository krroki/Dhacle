# 📊 Phase 0: YouTube Lens 코드/데이터 감사 & 연구 설계 (강화버전)

*실제 구현 검증 > 문서 신뢰 원칙 기반의 체계적 감사 지시서*

---

## 🔴 필수 준수사항
**모든 작업 시 다음 문구 필수 포함:**
- "TypeScript any 타입 절대 사용 금지"
- "타입을 제대로 정의하거나 unknown을 쓰고 타입 가드를 쓸 것"
- "실제 파일 검증 후 문서 확인 - 문서는 거짓일 수 있음!"

---

## 🎯 Phase 0 핵심 목표
1. **기존 YouTube Lens 구현 자산 전수 조사** (문서가 아닌 실제 코드 기준)
2. **API 호출 계획 및 쿼터 예산 수립** (실측 기반)
3. **재사용 가능 컴포넌트 식별** (실제 동작 검증 필수)
4. **충돌 방지 계획 수립** (네임스페이스 완전 분리)
5. **리스크 사전 제거** (보안, 성능, 타입 안정성)

---

## 🔄 3단계 감사 프로토콜

### 🔴 Stage 1: Implementation Verification (실제 구현 검증)

#### 1.1 기존 컴포넌트 실제 존재 확인
```bash
# SC 명령어
/sc:analyze --seq --ultrathink --delegate files

# 실제 파일 존재 확인 스크립트
echo "=== YouTube Lens 컴포넌트 검증 ==="
for component in VideoGrid SearchBar QuotaStatus YouTubeLensErrorBoundary PopularShortsList ChannelFolders CollectionBoard AlertRules MetricsDashboard; do
  if test -f "src/components/features/tools/youtube-lens/${component}.tsx"; then
    echo "✅ ${component} 존재"
  else
    echo "❌ ${component} 없음 - 생성 필요"
  fi
done

# API 엔드포인트 검증
echo "=== API 엔드포인트 검증 ==="
for endpoint in popular search folders collections favorites metrics; do
  if test -f "src/app/api/youtube-lens/${endpoint}/route.ts"; then
    echo "✅ /api/youtube-lens/${endpoint} 존재"
  else
    echo "❌ /api/youtube-lens/${endpoint} 없음"
  fi
done
```

#### 1.2 실제 동작 테스트 매트릭스
```typescript
// 각 컴포넌트 동작 검증 체크리스트
interface ComponentValidation {
  component: string;
  tests: {
    renders: boolean;      // 렌더링 되는가?
    apiCalls: boolean;     // API 호출하는가?
    errorHandles: boolean; // 에러 처리하는가?
    responsive: boolean;   // 반응형인가?
    typesSafe: boolean;    // 타입 안전한가?
  };
  issues: string[];
  reusability: 'full' | 'partial' | 'none';
}

// 검증 명령어
const validationTests = [
  "npm run dev && curl http://localhost:3000/tools/youtube-lens",
  "npm run build",
  "npx tsc --noEmit",
  "npm run verify:types",
  "npm run verify:api"
];
```

#### 1.3 Zustand Store 실제 상태 검증
```typescript
// 실제 store 파일 읽기 및 분석
// Read src/store/youtube-lens.ts

// 필수 검증 항목
const requiredStates = [
  'videos',           // 기존 - 검증 필요
  'searchHistory',    // 기존 - 검증 필요
  'favoriteVideos',   // 기존 - 검증 필요
  'approvedChannels', // 신규 - 추가 필요
  'channelDeltas',    // 신규 - 추가 필요
  'dashboardMetrics'  // 신규 - 추가 필요
];

// 상태 타입 검증
interface StoreValidation {
  exists: boolean;
  type: string;
  hasActions: string[];
  hasSelectors: string[];
}
```

### 🔵 Stage 2: Gap Analysis (갭 분석)

#### 2.1 DB 스키마 갭 분석 (실제 vs 필요)
```sql
-- 실제 테이블 확인 쿼리
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'yl_%';

-- 필요한 새 테이블 (승인된 채널 관리)
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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 인덱스 추가
  INDEX idx_approval_status (approval_status),
  INDEX idx_category (category, subcategory),
  INDEX idx_dominant_format (dominant_format)
);

-- RLS 정책 필수!
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin only write" ON yl_channels
  FOR ALL USING (auth.uid() IN (SELECT user_id FROM admin_users));
CREATE POLICY "Public read approved" ON yl_channels
  FOR SELECT USING (approval_status = 'approved');

-- 일일 스냅샷 테이블
CREATE TABLE IF NOT EXISTS yl_channel_daily_snapshot (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  view_count_total BIGINT NOT NULL DEFAULT 0,
  subscriber_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  shorts_count INTEGER DEFAULT 0,
  PRIMARY KEY(channel_id, date),
  
  -- 파티셔닝 고려 (월별)
  PARTITION BY RANGE (date)
);

-- 일일 델타 계산 테이블
CREATE TABLE IF NOT EXISTS yl_channel_daily_delta (
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  delta_views BIGINT NOT NULL DEFAULT 0,
  delta_subscribers BIGINT DEFAULT 0,
  growth_rate DECIMAL(5,2) DEFAULT 0.00,
  PRIMARY KEY(channel_id, date),
  
  -- 인덱스 최적화
  INDEX idx_date_delta (date DESC, delta_views DESC)
);

-- 트리거: updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_yl_channels_updated_at
  BEFORE UPDATE ON yl_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

#### 2.2 API 엔드포인트 갭 분석
```typescript
// 기존 엔드포인트 vs 필요 엔드포인트 매핑
const endpointGapAnalysis = {
  existing: [
    '/api/youtube-lens/popular',     // 검증 필요
    '/api/youtube-lens/search',      // 검증 필요
    '/api/youtube-lens/folders',     // 검증 필요
    '/api/youtube-lens/collections', // 검증 필요
    '/api/youtube-lens/favorites'    // 검증 필요
  ],
  required: [
    '/api/youtube-lens/trending-summary',    // 신규
    '/api/youtube-lens/ranking',            // 신규
    '/api/youtube-lens/admin/channels',     // 신규
    '/api/youtube-lens/admin/approval-logs' // 신규
  ],
  modifications: [
    '/api/youtube-lens/metrics' // 완전 교체 필요
  ]
};

// 각 엔드포인트별 구현 계획
interface EndpointPlan {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  auth: 'required' | 'optional' | 'admin';
  rateLimit: number; // requests per minute
  cache: boolean;
  implementation: string;
}
```

### 🟢 Stage 3: Implementation Planning (구현 계획)

#### 3.1 API 호출 최적화 계획
```typescript
// YouTube Data API v3 쿼터 계산기
class QuotaCalculator {
  private readonly DAILY_QUOTA = 10000;
  private readonly costs = {
    'channels.list': 1,
    'playlistItems.list': 1,
    'videos.list': 1,
    'search.list': 100 // 회피!
  };

  calculateDailyUsage(channelCount: number): QuotaUsage {
    const batchSize = 50; // 최대 배치 크기
    const batches = Math.ceil(channelCount / batchSize);
    
    return {
      channels: batches * this.costs['channels.list'],      // ~20 units
      playlists: channelCount * 0.01 * this.costs['playlistItems.list'], // ~10 units (선택적)
      videos: channelCount * 0.02 * this.costs['videos.list'],    // ~20 units (상위만)
      total: 50, // 일일 할당량의 0.5%
      percentage: 0.5
    };
  }

  // 캐싱 전략
  getCachingStrategy() {
    return {
      channelStats: '24 hours',      // 채널 통계
      videoDetails: '7 days',        // 비디오 상세
      deltaCalculations: '1 hour',   // 델타 계산
      rankings: '6 hours'             // 순위
    };
  }
}
```

#### 3.2 충돌 방지 네임스페이스 전략
```typescript
// React Query 키 네임스페이스 완전 분리
export const ylQueryKeys = {
  // 새로운 대시보드 키
  dash: {
    summary: (date: string) => ['yl/v2/dash/summary', date] as const,
    trending: (params: TrendingParams) => ['yl/v2/dash/trending', params] as const,
    deltas: (channelIds: string[]) => ['yl/v2/dash/deltas', channelIds] as const
  },
  
  // 순위 시스템
  ranking: {
    daily: (date: string, category?: string) => ['yl/v2/ranking/daily', date, category] as const,
    weekly: (weekOf: string) => ['yl/v2/ranking/weekly', weekOf] as const,
    growth: (period: string) => ['yl/v2/ranking/growth', period] as const
  },
  
  // 관리자 전용
  admin: {
    channels: (params: AdminChannelParams) => ['yl/v2/admin/channels', params] as const,
    approvals: (status: string) => ['yl/v2/admin/approvals', status] as const,
    logs: (channelId: string) => ['yl/v2/admin/logs', channelId] as const
  },
  
  // 기존 키는 그대로 유지 (하위 호환성)
  legacy: {
    popular: ['yl/popular'] as const,
    search: (query: string) => ['yl/search', query] as const,
    folders: ['yl/folders'] as const
  }
};

// Zustand Store 네임스페이스
interface YouTubeLensStoreV2 {
  // 새로운 상태 (v2 prefix)
  v2_approvedChannels: Map<string, Channel>;
  v2_channelDeltas: Map<string, DeltaData>;
  v2_dashboardMetrics: DashboardData;
  v2_rankingCache: RankingCache;
  
  // 기존 상태 유지
  videos: Video[];
  searchHistory: SearchHistory[];
  favoriteVideos: FavoriteVideo[];
}
```

#### 3.3 재사용 가능 유틸리티 구현
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

## 📊 영향도 분석 매트릭스

### 영향도 등급 정의
- 🔴 **Critical**: 기존 기능 중단 가능성
- 🟡 **Major**: 주요 변경 필요
- 🟢 **Minor**: 부분 수정만 필요
- ⚪ **None**: 영향 없음

### 파일별 영향도
| 파일 경로 | 영향도 | 변경 내용 | 리스크 |
|----------|--------|----------|--------|
| `/tools/youtube-lens/page.tsx` | 🟡 Major | 대시보드 탭 내용 교체 | 기존 탭 보존 필수 |
| `/MetricsDashboard.tsx` | 🔴 Critical | 완전 교체 | 백업 필수 |
| `/store/youtube-lens.ts` | 🟡 Major | 상태 추가 (v2 prefix) | 네임스페이스 충돌 |
| `/api/youtube-lens/*` | 🟢 Minor | 신규 라우트 추가 | 기존 라우트 영향 없음 |
| 기타 컴포넌트들 | ⚪ None | 변경 없음 | 없음 |

---

## 🚨 리스크 매트릭스 & 완화 전략

### 리스크 레벨 정의
- **P1**: 즉시 대응 필요 (서비스 중단)
- **P2**: 24시간 내 대응 (기능 저하)
- **P3**: 1주일 내 대응 (사용자 경험)
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

---

## ✅ Phase 0 완료 체크리스트 (자동 검증 가능)

### 필수 검증 항목
```bash
# 자동 검증 스크립트
#!/bin/bash

echo "=== Phase 0 Validation Starting ==="

# 1. 재사용 컴포넌트 검증
echo "[1/6] 컴포넌트 검증..."
COMPONENTS_OK=true
for comp in VideoGrid SearchBar QuotaStatus; do
  test -f "src/components/features/tools/youtube-lens/${comp}.tsx" || COMPONENTS_OK=false
done
[ "$COMPONENTS_OK" = true ] && echo "✅ Pass" || echo "❌ Fail"

# 2. DB 마이그레이션 파일
echo "[2/6] DB 마이그레이션..."
test -f "supabase/migrations/*_yl_channels.sql" && echo "✅ Pass" || echo "❌ Fail"

# 3. API 쿼터 계산
echo "[3/6] API 쿼터 예산..."
node -e "console.log(new QuotaCalculator().calculateDailyUsage(1000).percentage < 1 ? '✅ Pass' : '❌ Fail')"

# 4. 환경 변수
echo "[4/6] 환경 변수..."
grep -q "YT_ADMIN_KEY" .env.local && echo "✅ Pass" || echo "❌ Fail"

# 5. 충돌 방지
echo "[5/6] 네임스페이스 충돌..."
grep -r "yl/v2" src/ > /dev/null && echo "✅ Pass" || echo "❌ Fail"

# 6. TypeScript 검증
echo "[6/6] TypeScript 타입..."
npx tsc --noEmit && echo "✅ Pass" || echo "❌ Fail"

echo "=== Validation Complete ==="
```

### 수동 검증 항목
- [ ] 재사용 컴포넌트 실제 동작 확인
- [ ] DB RLS 정책 적용 확인
- [ ] API 응답 시간 < 200ms
- [ ] 에러 핸들링 401/404/500 처리
- [ ] 관리자 권한 분리 확인

---

## 📌 Phase 1 진입 조건

### 필수 달성 기준
1. **코드 검증**: 모든 재사용 컴포넌트 동작 확인 ✅
2. **DB 준비**: 3개 신규 테이블 + RLS 정책 ✅
3. **API 예산**: 일일 쿼터 1% 미만 ✅
4. **충돌 방지**: v2 네임스페이스 100% 분리 ✅
5. **타입 안전**: any 타입 0개, strict mode ✅

### Quality Gates
```typescript
interface Phase0CompletionCriteria {
  codeAudit: {
    reusableComponents: number; // >= 8
    workingEndpoints: number;   // >= 5
    typeErrors: number;         // === 0
  };
  database: {
    newTables: number;          // === 3
    rlsPolicies: number;        // >= 12
    indexes: number;            // >= 5
  };
  api: {
    dailyQuotaUsage: number;    // < 1%
    cachingStrategy: boolean;   // === true
    rateLimiting: boolean;      // === true
  };
  testing: {
    unitTests: number;          // >= 10
    integrationTests: number;   // >= 5
    e2eTests: number;          // >= 3
  };
}
```

---

## 🔍 에러 디버깅 가이드 (Phase 0 특화)

### YouTube API 에러 처리
| 에러 코드 | 원인 | 해결 방법 | 예방책 |
|----------|-----|----------|-------|
| 403 | 쿼터 초과 | 24시간 대기 or 키 교체 | 배치 최적화, 캐싱 |
| 404 | 채널/비디오 없음 | Soft delete 처리 | 존재 확인 로직 |
| 401 | API 키 무효 | 키 재발급 | 키 로테이션 |
| 500 | YouTube 서버 에러 | 재시도 (exponential backoff) | Circuit breaker |

### 컴포넌트 에러 패턴
```typescript
// 에러 바운더리 강화
class YouTubeLensErrorBoundary extends ErrorBoundary {
  private errorPatterns = {
    quotaExceeded: /quota.*exceeded/i,
    unauthorized: /401|unauthorized/i,
    networkError: /network|fetch/i,
    typeError: /cannot read|undefined/i
  };
  
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
        return { action: 'wait', message: 'API 할당량 초과. 24시간 후 재시도' };
      case 'unauthorized':
        return { action: 'redirect', target: '/auth/login' };
      case 'networkError':
        return { action: 'retry', attempts: 3, delay: 1000 };
      default:
        return { action: 'report', target: '/error-report' };
    }
  }
}
```

---

## 🎬 SC 명령어 실행 시퀀스

### Phase 0 완전 자동화 실행
```bash
# 1단계: 전체 감사
/sc:analyze --seq --ultrathink --delegate files --c7
"Phase 0 YouTube Lens 감사 실행. INSTRUCTION_TEMPLATE.md 원칙 적용"

# 2단계: 컴포넌트 검증
/sc:implement --seq --validate --think
"기존 YouTube Lens 컴포넌트 동작 검증 및 재사용성 평가"

# 3단계: DB 준비
/sc:build --seq --validate --c7
"yl_channels, yl_channel_daily_snapshot, yl_channel_daily_delta 테이블 생성"

# 4단계: API 엔드포인트 구현
/sc:implement --seq --validate --think-hard --c7
"trending-summary, ranking, admin/channels 엔드포인트 구현"

# 5단계: 최종 검증
/sc:fix --seq --validate --introspect
"Phase 0 체크리스트 검증 및 Phase 1 진입 준비"
```

---

## 📝 문서 업데이트 요구사항

### Phase 0 완료 시 업데이트 필수 문서
1. **WIREFRAME.md**: YouTube Lens 섹션에 새 대시보드 추가
2. **COMPONENT_INVENTORY.md**: 신규/수정 컴포넌트 반영
3. **ROUTE_SPEC.md**: 신규 API 라우트 추가
4. **DATA_MODEL.md**: Channel, Delta 타입 추가
5. **PROJECT.md**: Phase 0 완료 상태 기록

---

*이 문서는 INSTRUCTION_TEMPLATE.md 원칙과 phase-0-audit.md 내용을 완전 통합한 강화 버전입니다*
*작성일: 2025-02-01 | 버전: 2.0 Enhanced*