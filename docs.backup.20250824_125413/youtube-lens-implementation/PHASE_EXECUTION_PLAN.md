# 📋 YouTube Lens Delta System - Phase별 실행 계획

## 🎯 구현 목표
YouTube Lens를 기존 메트릭 대시보드에서 **일일 델타(Δ) 추적 시스템**으로 완전 전환

### 핵심 요구사항
1. ✅ **승인된 채널만** 대상 (전체 YouTube 스캔 금지)
2. ✅ **일일 델타(Δ)** 계산 및 표시
3. ✅ **7필드 필수** 표시 (모든 UI 요소)
4. ✅ **한국어 숫자** 포맷 (천/만 단위만)
5. ✅ **이중 API키** 시스템 (관리자/사용자)
6. ✅ **30일 데이터** 보관 정책

---

## 📊 Phase 진행 현황

### ✅ Phase 0: Foundation (기반 구축) - 100% 완료
```
상태: ✅ COMPLETED
기간: 2025-02-01
```
- ✅ DB 스키마 생성 (9개 테이블)
- ✅ RLS 정책 적용 (모든 테이블)
- ✅ 환경 변수 설정
- ✅ formatNumberKo 유틸리티 구현

**산출물:**
- `/supabase/migrations/20250201000001_youtube_lens_delta_system.sql`
- `/src/lib/youtube-lens/format-number-ko.ts`

---

### ✅ Phase 1: Admin Core (관리자 핵심) - 100% 완료
```
상태: ✅ COMPLETED
기간: 2025-02-01
```
- ✅ 관리자 인증 시스템 (이메일 화이트리스트)
- ✅ 채널 승인 콘솔 UI
- ✅ 채널 CRUD API (4개 엔드포인트)
- ✅ 승인 로그 시스템 (감사 추적)

**산출물:**
- `/src/components/features/tools/youtube-lens/admin/ChannelApprovalConsole.tsx`
- `/src/app/api/youtube-lens/admin/channels/route.ts`
- `/src/app/api/youtube-lens/admin/channels/[channelId]/route.ts`
- `/src/app/api/youtube-lens/admin/approval-logs/[channelId]/route.ts`

---

### ✅ Phase 2: Data Collection (데이터 수집) - 90% 완료
```
상태: ⚠️ ALMOST COMPLETE
기간: 2025-02-01
미완료: Supabase 크론 스케줄 설정
```
- ✅ YouTube API 통합
- ✅ Supabase Edge Function 구현
- ✅ 스냅샷 저장 로직
- ✅ 델타 계산 로직
- ✅ 30일 자동 삭제
- ⚠️ **크론 스케줄 설정 필요**

**산출물:**
- `/supabase/functions/yl-daily-batch/index.ts`

**🚨 즉시 필요한 작업:**
```sql
-- Supabase Dashboard에서 실행
SELECT cron.schedule(
  'yl-daily-batch',
  '0 20 * * *', -- UTC 20:00 = KST 05:00
  $$
  SELECT net.http_post(
    url := 'https://[PROJECT_ID].supabase.co/functions/v1/yl-daily-batch',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || '[SERVICE_ROLE_KEY]',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

---

## 🔥 Phase 3: User Dashboard (사용자 대시보드) - 다음 작업
```
상태: ⏳ IN PROGRESS
예상 기간: 4시간
우선순위: 🔴 CRITICAL
```

### 작업 1: DeltaDashboard 컴포넌트 생성 (2시간)
**파일**: `/src/components/features/tools/youtube-lens/DeltaDashboard.tsx`

#### 6블록 레이아웃
1. **카테고리 점유율** (좌상단)
   - 파이 차트 또는 도넛 차트
   - 카테고리별 채널 수와 조회수 비율

2. **급상승 키워드** (우상단)
   - 워드 클라우드 또는 리스트
   - 전일 대비 언급 증가율

3. **신흥 채널** (좌중단)
   - 최근 30일 내 급성장 채널
   - 성장률 기준 정렬

4. **Top 쇼츠** (우중단)
   - 일일 조회수 Δ 상위 Shorts
   - 썸네일과 7필드 표시

5. **팔로우 채널** (좌하단)
   - 사용자가 팔로우한 채널
   - 오늘의 델타 표시

6. **아이디어 보드** (우하단)
   - 트렌드 기반 콘텐츠 제안
   - AI 생성 아이디어

#### 7필드 카드 구현
```typescript
interface ChannelCard {
  channelName: string;      // 채널명
  subscribers: string;       // 구독자 (formatNumberKo)
  dailyViews: string;       // 일일 조회수 Δ (+표시)
  totalViews: string;       // 총 조회수
  category: string;         // 카테고리
  subcategory?: string;     // 세부 카테고리
  format: '쇼츠' | '롱폼' | '라이브';  // 형식
}
```

### 작업 2: 백엔드 API 구현 (1시간)
**파일**: `/src/app/api/youtube-lens/trending-summary/route.ts`

```typescript
// Response 구조
{
  categoryStats: {
    category: string;
    channelCount: number;
    totalDelta: number;
    share: number; // 점유율 %
  }[],
  trendingKeywords: {
    keyword: string;
    count: number;
    growth: number; // 성장률 %
  }[],
  newcomers: {
    channelId: string;
    title: string;
    dailyDelta: number;
    growthRate: number;
  }[],
  topShorts: {
    videoId: string;
    title: string;
    channelTitle: string;
    viewDelta: number;
  }[]
}
```

### 작업 3: 통합 및 테스트 (1시간)
- [ ] MetricsDashboard 제거
- [ ] DeltaDashboard 임포트
- [ ] React Query 설정 (캐시 키: 'yl/*')
- [ ] E2E 테스트 작성

---

## 📅 Phase 4: Advanced Features (고급 기능) - 예정
```
상태: 📋 PLANNED
예상 기간: 1일
우선순위: 🟡 MEDIUM
```

### 작업 1: Shorts 탐지 알고리즘
**파일**: `/src/lib/youtube-lens/shorts-detector.ts`
- 60초 이하 영상 필터링
- 키워드 탐지 (#shorts, #쇼츠)
- 9:16 세로 비율 확인
- 관리자 오버라이드

### 작업 2: 트렌딩 키워드 추출
**파일**: `/src/lib/youtube-lens/keyword-extractor.ts`
- 제목/설명 파싱
- 형태소 분석 (한국어)
- TF-IDF 계산
- 급상승 탐지

### 작업 3: 신흥 채널 알고리즘
**파일**: `/src/lib/youtube-lens/newcomer-detector.ts`
- 30일 이내 생성 채널
- 일일 성장률 >10%
- 바이럴 가능성 점수

---

## 📈 Phase 5: Optimization (최적화) - 예정
```
상태: 📋 PLANNED
예상 기간: 1일
우선순위: 🟢 LOW
```

### 작업 1: 성능 최적화
- React.memo 적용
- 가상 스크롤링
- 이미지 lazy loading
- 번들 크기 최적화

### 작업 2: 캐싱 전략
- React Query staleTime 조정
- 브라우저 캐싱 헤더
- CDN 통합

### 작업 3: 모니터링
- Sentry 에러 추적
- Google Analytics 이벤트
- 성능 메트릭 수집

---

## 🚀 실행 명령어 모음

### 개발 환경
```bash
# 로컬 개발 서버
npm run dev

# 타입 체크
npm run types:check

# 보안 테스트
npm run security:test

# 빌드
npm run build
```

### Supabase 관리
```bash
# Edge Function 배포
supabase functions deploy yl-daily-batch

# 마이그레이션 실행
supabase db push

# 로그 확인
supabase functions logs yl-daily-batch
```

### 수동 배치 실행
```bash
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/yl-daily-batch \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

---

## ✅ 체크리스트

### Phase 3 시작 전
- [ ] Supabase 크론 스케줄 설정
- [ ] YT_ADMIN_KEY 환경 변수 확인
- [ ] 관리자 이메일 설정 확인
- [ ] 테스트 채널 1개 이상 승인

### Phase 3 완료 기준
- [ ] DeltaDashboard 6블록 모두 렌더링
- [ ] 7필드 모든 카드에 표시
- [ ] 한국어 숫자 포맷 적용
- [ ] 5분 캐싱 작동
- [ ] 401 에러 처리

### 최종 검증
- [ ] 프로덕션 빌드 성공
- [ ] dhacle.com 배포 확인
- [ ] 카카오 로그인 테스트
- [ ] 대시보드 데이터 표시
- [ ] 30일 데이터 삭제 확인

---

## 📞 문의사항

- **기술 문의**: YouTube Lens Delta System 관련
- **관리자 권한**: admin@dhacle.com, glemfkcl@naver.com
- **API 키 관리**: YT_ADMIN_KEY (통계), 사용자 개별 키 (검색)

---

*작성일: 2025-02-01*
*작성자: Claude Code Assistant*
*버전: 1.0.0*