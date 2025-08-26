# YouTube Lens Delta System - 통합 테스트 계획서

## 📋 테스트 체크리스트 (실제 수행 가능)

### Phase 0: 환경 준비 ✅
- [ ] Supabase 프로젝트 연결 확인
- [ ] 환경 변수 설정 확인 (`YT_ADMIN_KEY`, `ADMIN_EMAIL`)
- [ ] 마이그레이션 실행: `npx supabase db push`
- [ ] Edge Function 배포: `supabase functions deploy yl-daily-batch`
- [ ] 관리자 이메일 DB 설정: `ALTER DATABASE postgres SET app.admin_emails = 'admin@dhacle.com';`

### Phase 1: DB 및 RLS 테스트 ✅
```sql
-- 1. 테이블 생성 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'yl_%';

-- 2. RLS 정책 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies WHERE tablename LIKE 'yl_%';

-- 3. 테스트 데이터 삽입 (관리자로)
INSERT INTO yl_channels (channel_id, title, approval_status, subscriber_count, category)
VALUES 
  ('UCtest001', '테스트 승인 채널', 'approved', 100000, '게임'),
  ('UCtest002', '테스트 미승인 채널', 'pending', 50000, '음악');

-- 4. 일반 사용자로 조회 (승인된 것만 보여야 함)
SELECT * FROM yl_channels; -- 1개만 나와야 함

-- 5. 30일 이상 데이터 자동 삭제 테스트
INSERT INTO yl_channel_daily_snapshot (channel_id, date, view_count_total)
VALUES ('UCtest001', CURRENT_DATE - INTERVAL '31 days', 1000);
-- Edge Function 실행 후 삭제 확인
```

### Phase 2: API 엔드포인트 테스트 ✅

#### 2.1 배치 수집 테스트
```bash
# Edge Function 직접 호출
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/yl-daily-batch \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"

# 응답 확인
{
  "success": true,
  "processed": 2,
  "errors": [],
  "timestamp": "2025-02-01T..."
}
```

#### 2.2 대시보드 API 테스트
```typescript
// /api/youtube-lens/trending-summary 테스트
const response = await fetch('/api/youtube-lens/trending-summary', {
  credentials: 'include'
});
const data = await response.json();

// 필수 필드 확인
expect(data).toHaveProperty('data.categoryStats');
expect(data).toHaveProperty('data.topDeltas');
expect(data).toHaveProperty('data.newcomers');
expect(data).toHaveProperty('data.keywords');
```

#### 2.3 카테고리 통계 테스트
```typescript
// /api/youtube-lens/category-stats 테스트
const response = await fetch('/api/youtube-lens/category-stats?date=2025-02-01');
const data = await response.json();

// 카테고리별 점유율 합 = 100% 확인
const totalShare = data.data.reduce((sum, cat) => sum + parseFloat(cat.share), 0);
expect(totalShare).toBeCloseTo(100, 1);
```

### Phase 3: UI 컴포넌트 테스트 ✅

#### 3.1 숫자 포맷 테스트
```typescript
import { formatNumberKo } from '@/lib/youtube-lens/format-number-ko';

describe('formatNumberKo', () => {
  test('천 단위', () => {
    expect(formatNumberKo(1234)).toBe('1.2천');
    expect(formatNumberKo(9999)).toBe('10천');
  });
  
  test('만 단위', () => {
    expect(formatNumberKo(10000)).toBe('1만');
    expect(formatNumberKo(123456)).toBe('12.3만');
    expect(formatNumberKo(9999999)).toBe('1000만');
  });
  
  test('음수 처리', () => {
    expect(formatNumberKo(-1234)).toBe('-1.2천');
    expect(formatNumberKo(-10000)).toBe('-1만');
  });
});
```

#### 3.2 Shorts 판별 테스트
```typescript
import { detectShorts } from '@/lib/youtube-lens/shorts-detector';

describe('detectShorts', () => {
  test('60초 이하 + 키워드 = Shorts', () => {
    expect(detectShorts({
      duration: 45,
      title: '재밌는 #shorts 영상',
      description: ''
    })).toBe(true);
  });
  
  test('60초 초과 = Not Shorts', () => {
    expect(detectShorts({
      duration: 61,
      title: '#shorts',
      description: ''
    })).toBe(false);
  });
  
  test('관리자 오버라이드', () => {
    expect(detectShorts({
      duration: 90,
      title: '일반 영상',
      description: '',
      channelOverride: true
    })).toBe(true);
  });
});
```

#### 3.3 대시보드 렌더링 테스트
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { DeltaDashboard } from '@/components/features/tools/youtube-lens/DeltaDashboard';

describe('DeltaDashboard', () => {
  test('6블록 모두 렌더링', async () => {
    render(<DeltaDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('카테고리 점유율')).toBeInTheDocument();
      expect(screen.getByText('급상승 키워드')).toBeInTheDocument();
      expect(screen.getByText('신흥 채널')).toBeInTheDocument();
      expect(screen.getByText('Top 쇼츠')).toBeInTheDocument();
      expect(screen.getByText('팔로우 채널')).toBeInTheDocument();
      expect(screen.getByText('아이디어 보드')).toBeInTheDocument();
    });
  });
  
  test('7필드 표시 확인', async () => {
    render(<DeltaDashboard />);
    
    await waitFor(() => {
      const channelCard = screen.getByTestId('channel-card-0');
      expect(channelCard).toHaveTextContent(/채널명/);
      expect(channelCard).toHaveTextContent(/구독/);
      expect(channelCard).toHaveTextContent(/\+[\d.]+[천만]/); // 일일 조회수
      expect(channelCard).toHaveTextContent(/총/);
      expect(channelCard).toHaveTextContent(/카테고리/);
      expect(channelCard).toHaveTextContent(/세부/);
      expect(channelCard).toHaveTextContent(/쇼츠|롱폼|라이브/);
    });
  });
});
```

### Phase 4: 성능 테스트 ✅

#### 4.1 API 응답 시간
```typescript
const startTime = performance.now();
const response = await fetch('/api/youtube-lens/trending-summary');
const endTime = performance.now();

expect(endTime - startTime).toBeLessThan(500); // 500ms 이내
```

#### 4.2 배치 처리 성능
```sql
-- 1000개 채널 테스트 데이터 생성
INSERT INTO yl_channels (channel_id, title, approval_status)
SELECT 
  'UC' || generate_series(1, 1000),
  'Channel ' || generate_series(1, 1000),
  'approved';

-- Edge Function 실행 시간 측정
-- 목표: 1000개 채널 < 30초
```

#### 4.3 캐싱 효과 측정
```typescript
// 첫 번째 호출 (캐시 미스)
const start1 = Date.now();
await fetch('/api/youtube-lens/trending-summary');
const time1 = Date.now() - start1;

// 두 번째 호출 (캐시 히트)
const start2 = Date.now();
await fetch('/api/youtube-lens/trending-summary');
const time2 = Date.now() - start2;

expect(time2).toBeLessThan(time1 * 0.2); // 80% 속도 향상
```

### Phase 5: E2E 시나리오 테스트 ✅

#### 5.1 관리자 채널 승인 플로우
```typescript
test('관리자 채널 승인 플로우', async ({ page }) => {
  // 1. 관리자 로그인
  await page.goto('/auth/login');
  await page.fill('[name="email"]', 'admin@dhacle.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button:has-text("로그인")');
  
  // 2. 관리자 페이지 이동
  await page.goto('/tools/youtube-lens/admin/channels');
  
  // 3. 채널 추가
  await page.fill('[placeholder="YouTube 채널 ID"]', 'UCxxxxxxxx');
  await page.click('button:has-text("채널 추가")');
  
  // 4. 승인 상태 변경
  await page.selectOption('select', 'approved');
  
  // 5. 대시보드에서 확인
  await page.goto('/tools/youtube-lens');
  await page.click('[value="dashboard"]');
  expect(await page.textContent('.channel-title')).toContain('Test Channel');
});
```

#### 5.2 일반 사용자 대시보드 조회
```typescript
test('일반 사용자는 승인된 채널만 볼 수 있음', async ({ page }) => {
  // 1. 일반 사용자 로그인
  await page.goto('/auth/login');
  // 카카오 로그인...
  
  // 2. YouTube Lens 이동
  await page.goto('/tools/youtube-lens');
  
  // 3. 대시보드 탭 클릭
  await page.click('[value="dashboard"]');
  
  // 4. 미승인 채널 없음 확인
  const channels = await page.$$('.channel-card');
  for (const channel of channels) {
    const status = await channel.getAttribute('data-status');
    expect(status).toBe('approved');
  }
});
```

### Phase 6: 보안 테스트 ✅

#### 6.1 RLS 우회 시도
```sql
-- 일반 사용자로 미승인 채널 접근 시도
SET ROLE authenticated_user;
SELECT * FROM yl_channels WHERE approval_status = 'pending';
-- 결과: 0 rows (RLS가 제대로 작동)

-- 직접 INSERT 시도
INSERT INTO yl_channels (channel_id, title) VALUES ('UCxxxxx', 'Hack');
-- 결과: permission denied
```

#### 6.2 API 인증 테스트
```typescript
// 인증 없이 API 호출
const response = await fetch('/api/youtube-lens/trending-summary', {
  credentials: 'omit'
});
expect(response.status).toBe(401);
expect(await response.json()).toEqual({ error: 'User not authenticated' });
```

## 📊 테스트 커버리지 목표

| 영역 | 목표 | 현재 | 상태 |
|-----|------|------|------|
| 단위 테스트 | 80% | - | ⏳ |
| 통합 테스트 | 70% | - | ⏳ |
| E2E 테스트 | 60% | - | ⏳ |
| 성능 테스트 | 100% | - | ⏳ |
| 보안 테스트 | 100% | - | ⏳ |

## 🚀 테스트 실행 명령어

```bash
# 단위 테스트
npm run test:unit

# 통합 테스트
npm run test:integration

# E2E 테스트
npm run test:e2e

# 성능 테스트
npm run test:performance

# 전체 테스트
npm run test:all

# 테스트 커버리지
npm run test:coverage
```

## ⚠️ 주의사항

1. **테스트 DB 사용**: 프로덕션 DB가 아닌 테스트 DB 사용
2. **API 키 관리**: 테스트용 YouTube API 키 별도 사용
3. **데이터 정리**: 테스트 후 생성된 데이터 삭제
4. **병렬 실행 주의**: DB 트랜잭션 충돌 방지

## ✅ 최종 체크리스트

### 배포 전 필수 확인
- [ ] 모든 마이그레이션 적용됨
- [ ] Edge Function 배포됨
- [ ] 환경 변수 설정됨
- [ ] RLS 정책 활성화됨
- [ ] 관리자 이메일 설정됨
- [ ] 30일 데이터 삭제 확인됨
- [ ] 캐싱 시스템 작동됨
- [ ] 모든 테스트 통과됨

### 프로덕션 모니터링
- [ ] Sentry 에러 추적 설정
- [ ] Google Analytics 이벤트 설정
- [ ] API 사용량 모니터링
- [ ] 성능 메트릭 수집
- [ ] 사용자 피드백 채널