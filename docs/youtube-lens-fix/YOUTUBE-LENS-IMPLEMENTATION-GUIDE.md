# 📋 YouTube Lens 100% 구현 가이드

## 🎯 목표: 제안서 100% 구현을 위한 완전한 로드맵

---

## 🚀 Quick Start (즉시 시작)

```bash
# 1. 데이터베이스 마이그레이션
npx supabase migration new youtube_lens_complete
# Phase 1 문서의 SQL 복사하여 적용
npx supabase db push

# 2. 타입 생성
npx supabase gen types typescript --local > src/types/supabase.ts

# 3. 환경 변수 설정
# .env.local에 추가
YOUTUBE_API_KEY=your_key
ENCRYPTION_KEY=your_32_char_key
TOSSPAYMENTS_CLIENT_KEY=your_key
TOSSPAYMENTS_SECRET_KEY=your_secret

# 4. 의존성 설치
npm install @google/generative-ai pubsubhubbub crypto-js
```

---

## 📊 구현 순서 및 우선순위

### 🟢 Phase 1: 기초 인프라 (3일)
**현재: 100% → 목표: 100% ✅ 완료!**

#### Day 1: 데이터베이스
- [x] 11개 테이블 마이그레이션 실행 (`20250121000001_youtube_lens_complete_schema.sql`)
- [x] RLS 정책 모두 적용
- [x] 인덱스 생성 확인
- [x] 타입 자동 생성 (`src/types/youtube-lens.ts`)

#### Day 2: 기본 설정
- [x] 환경 변수 모두 설정
- [x] Supabase 클라이언트 설정
- [x] 암호화 유틸리티 구현
- [x] 에러 핸들링 체계

#### Day 3: 검증
- [x] RLS 정책 충돌 해결 (DROP POLICY IF EXISTS 추가)
- [x] 타입 안정성 확인
- [x] googleapis 패키지 설치

**검증 스크립트:**
```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('videos', 'video_stats', 'channels', 'source_folders', 
                   'alert_rules', 'alerts', 'collections', 'saved_searches', 
                   'subscriptions');
```

---

### 🟡 Phase 3: 핵심 기능 (5일) - 최우선!
**현재: 80% → 목표: 100%**

#### Day 4-5: 무키워드 검색 (핵심!)
- [x] `src/lib/youtube/popular-shorts.ts` 구현 ✅
- [x] 빈 쿼리 우회 전략 테스트 (6가지 전략)
- [x] 다중 검색 전략 구현 (병렬 처리)
- [x] Shorts 필터링 로직 (60초 이하)
- [x] API 라우트 `/api/youtube/popular` ✅

#### Day 6: 지표 계산
- [x] `src/lib/youtube/metrics.ts` 구현 ✅
- [x] VPH 계산 함수
- [x] 참여율 계산
- [x] 바이럴 점수 알고리즘 (가중치 기반)
- [x] 채널 정규화 지표
- [x] calculateMetrics() 함수 추가 ✅
- [x] API 라우트 `/api/youtube/metrics` ✅

#### Day 7: 모니터링 시스템
- [x] `src/lib/youtube/monitoring.ts` 구현 ✅
- [x] 채널 폴더 CRUD (ChannelFolderManager)
- [x] 정기 체크 스케줄러 (MonitoringScheduler)
- [x] 알림 규칙 엔진 (AlertRuleEngine)

#### Day 8: UI 구현
- [x] `PopularShortsList.tsx` 컴포넌트 ✅
- [x] `ChannelFolders.tsx` 컴포넌트 ✅
- [ ] `AlertRules.tsx` 컴포넌트
- [ ] 메인 대시보드 통합

#### Day 9: TypeScript 에러 수정
- [ ] 속성명 통일 (viralScore → viral_score)
- [ ] 타입 불일치 해결 (37개 에러)

**테스트 체크포인트:**
```typescript
// 무키워드 검색 테스트
const result = await getPopularShortsWithoutKeyword({
  regionCode: 'KR',
  period: '7d'
});
console.assert(result.length > 0, 'No shorts found');
console.assert(result[0].metrics?.vph > 0, 'VPH not calculated');
```

---

### 🟢 Phase 2: API 통합 (3일)
**현재: 30% → 목표: 100%**

#### Day 9: PubSubHubbub
- [ ] 웹훅 엔드포인트 구현
- [ ] 구독 관리 시스템
- [ ] 실시간 업데이트 처리

#### Day 10: 배치 처리
- [ ] 큐 시스템 구현
- [ ] 스케줄러 설정
- [ ] API 쿼터 관리

#### Day 11: 캐싱 전략
- [ ] Redis/Memory 캐시 설정
- [ ] 캐시 무효화 로직
- [ ] TTL 관리

---

### 🔵 Phase 5: UI/UX (2일)
**현재: 20% → 목표: 100%**

#### Day 12: 브랜드 적용
- [ ] 컬러 시스템 컴포넌트 적용
- [ ] 다크모드 토글
- [ ] 커스텀 테마 변수

#### Day 13: 대시보드
- [ ] 메인 대시보드 레이아웃
- [ ] 데이터 시각화 차트
- [ ] 반응형 디자인

**브랜드 컬러 적용:**
```tsx
// tailwind.config.ts 수정
theme: {
  extend: {
    colors: {
      primary: 'hsl(245, 58%, 61%)',
      secondary: 'hsl(0, 100%, 71%)',
      accent: 'hsl(161, 94%, 50%)'
    }
  }
}
```

---

### 🟣 Phase 4: 고급 분석 (3일)
**현재: 0% → 목표: 100%**

#### Day 14: 이상치 탐지
- [ ] z-MAD 알고리즘 구현
- [ ] 이상치 점수 계산
- [ ] 랭킹 시스템

#### Day 15: 엔티티 레이더
- [ ] 키워드 추출 엔진
- [ ] 트렌드 분석
- [ ] 외부 API 연동

#### Day 16: 예측 모델
- [ ] 성장 예측 알고리즘
- [ ] 패턴 인식
- [ ] 추천 시스템

---

### 💰 Phase 6: 비즈니스 기능 (3일)
**현재: 0% → 목표: 100%**

#### Day 17: 구독 시스템
- [ ] 플랜 관리 (Free/Pro/Team)
- [ ] 사용량 제한
- [ ] 업그레이드 플로우

#### Day 18: 결제 연동
- [ ] TossPayments SDK 설정
- [ ] 빌링키 관리
- [ ] 웹훅 처리

#### Day 19: 팀 기능
- [ ] 조직 관리
- [ ] 멤버 초대
- [ ] 권한 관리

---

## 🔍 구현 검증 체크리스트

### 데이터베이스 (11/11 테이블) ✅
```bash
# 확인 명령
npx supabase db query "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
# 예상: 11개 이상
```

- [x] videos
- [x] video_stats  
- [x] channels
- [x] source_folders
- [x] folder_channels
- [x] alert_rules
- [x] alerts
- [x] collections
- [x] collection_items
- [x] saved_searches
- [x] subscriptions

### 핵심 기능 (4/5)
- [x] 무키워드 인기 Shorts 검색 ✅
- [x] 채널 폴더링 & 모니터링 ✅
- [x] 임계치 알림 시스템 ✅
- [x] VPH/Delta 지표 계산 ✅
- [ ] 컬렉션/보드 관리

### API 엔드포인트 (2/10)
- [x] POST `/api/youtube/popular` - 인기 검색 ✅
- [ ] GET/POST `/api/youtube/folders` - 폴더 관리
- [ ] GET/POST `/api/youtube/alerts` - 알림 규칙
- [ ] POST `/api/youtube/monitor` - 모니터링
- [x] GET `/api/youtube/metrics` - 지표 조회 ✅
- [ ] POST `/api/youtube/webhook` - PubSubHubbub
- [ ] GET/POST `/api/youtube/collections` - 컬렉션
- [ ] POST `/api/youtube/search/save` - 검색 저장
- [ ] GET `/api/youtube/export` - 데이터 내보내기
- [ ] POST `/api/subscription/upgrade` - 플랜 업그레이드

### UI 컴포넌트 (2/8)
- [x] PopularShortsList - 인기 목록 ✅
- [x] ChannelFolders - 폴더 관리 ✅
- [ ] AlertRules - 알림 설정
- [ ] MetricsDashboard - 지표 대시보드
- [ ] VideoCard - 영상 카드 (기본 구현)
- [ ] CollectionBoard - 컬렉션 보드
- [ ] SubscriptionPlans - 구독 플랜
- [ ] TeamManagement - 팀 관리

---

## 📈 진행 상황 모니터링

### Week 1 (Day 1-7)
- **목표**: 인프라 + 핵심 기능 50%
- **산출물**: DB 완성, 무키워드 검색 작동

### Week 2 (Day 8-14)
- **목표**: 핵심 기능 완성 + UI 구현
- **산출물**: 모든 핵심 기능 작동, 브랜드 적용

### Week 3 (Day 15-19)
- **목표**: 고급 기능 + 비즈니스 모델
- **산출물**: 전체 기능 100% 구현

---

## 🚨 위험 요소 및 대응

### 1. YouTube API 쿼터 제한
**문제**: 일일 10,000 유닛 제한
**해결**:
- 적극적 캐싱 (5-10분)
- 배치 요청 최적화
- 사용자별 API 키 사용

### 2. 빈 쿼리 검색 제한
**문제**: YouTube API가 빈 쿼리 거부
**해결**:
- 공백 문자 전략
- 카테고리 ID 활용
- 해시태그 우회

### 3. 실시간 업데이트
**문제**: PubSubHubbub 설정 복잡
**해결**:
- 폴링 백업 전략
- 정기 체크 병행
- 웹훅 재시도 로직

---

## 🎉 완료 기준

### 기능적 완료 (Functional)
- ✅ 무키워드로 인기 Shorts 검색 가능
- ✅ 채널 모니터링 및 알림 작동
- ✅ 모든 지표 정확히 계산
- ✅ 팀 협업 기능 작동

### 기술적 완료 (Technical)
- ✅ TypeScript 에러 0개
- ✅ 모든 API 테스트 통과
- ✅ 빌드 성공
- ✅ 배포 가능 상태

### 비즈니스 완료 (Business)
- ✅ 구독 플랜 작동
- ✅ 결제 시스템 연동
- ✅ 사용량 제한 적용

---

## 📞 지원 및 참고

### 핵심 문서
- Phase 1: `youtube-lens-phase1-infrastructure-enhanced.md`
- Phase 3: `youtube-lens-phase3-core-features-enhanced.md`
- 원본 제안: `youtube-lens-fix.md`

### 트러블슈팅
```bash
# DB 리셋
npx supabase db reset

# 타입 재생성
npx supabase gen types typescript --local > src/types/supabase.ts

# 캐시 클리어
npm run clean:cache
```

### 테스트 명령
```bash
# 통합 테스트
npm run test:youtube-lens

# API 테스트
npm run test:api

# UI 테스트
npm run test:ui
```

---

**🎯 최종 목표: 2025년 2월 10일까지 100% 구현 완료**