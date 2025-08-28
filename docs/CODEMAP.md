# 📊 디하클(Dhacle) 프로젝트 코드맵

_목적: 파일과 폴더 구조의 빠른 참조_
_핵심 질문: "어디에 뭐가 있지?"_
_업데이트: 새 파일/폴더 추가 또는 구조 변경 시_
_최종 수정: 2025-01-31 - DOCUMENT_GUIDE 지침 반영_

> **14개 핵심 문서 체계**:
>
> - 🤖 AI 작업 지침: `/CLAUDE.md`
> - 📊 프로젝트 현황: `/docs/PROJECT.md`
> - 🗺️ 프로젝트 구조: `/docs/CODEMAP.md` (이 문서)
> - ✅ 작업 검증: `/docs/CHECKLIST.md`
> - 📖 문서 가이드: `/docs/DOCUMENT_GUIDE.md`
> - 🎯 지시 템플릿: `/docs/INSTRUCTION_TEMPLATE.md`
> - 🔄 사용자 플로우: `/docs/FLOWMAP.md`
> - 🔌 UI-API 연결: `/docs/WIREFRAME.md`
> - 🧩 컴포넌트 목록: `/docs/COMPONENT_INVENTORY.md`
> - 📍 라우트 구조: `/docs/ROUTE_SPEC.md`
> - 💾 상태 관리: `/docs/STATE_FLOW.md`
> - 📦 데이터 모델: `/docs/DATA_MODEL.md`
> - 🚨 HTTP 에러 처리: `/docs/ERROR_BOUNDARY.md`
> - 🔥 반복 실수 예방: `/docs/CONTEXT_BRIDGE.md`

---

## 📚 목차 (Table of Contents)

### 빠른 참조
- [🚀 빠른 시작 (최상단 필수)](#-빠른-시작-최상단-필수)
  - [자주 사용하는 명령어](#자주-사용하는-명령어)
  - [🔥 자주 수정하는 파일 Top 10](#-자주-수정하는-파일-top-10)

### 핵심 설정
- [🔐 공용 유틸/핵심 위치 (Authentication & API)](#-공용-유틸핵심-위치-authentication--api)
- [📁 프로젝트 구조](#-프로젝트-구조)

### 기술 스택
- [📦 사용 패키지](#-사용-패키지)
- [🎮 테스트 환경 설정](#-테스트-환경-설정)
- [🔧 프로젝트 설정 파일](#-프로젝트-설정-파일)

### 폴더 구조
- [📂 폴더 상세 설명](#-폴더-상세-설명)
- [🎯 파일 명명 규칙](#-파일-명명-규칙)
- [🍃 환경 변수](#-환경-변수)

### 통계 및 보안
- [📊 프로젝트 통계](#-프로젝트-통계)
- [🔒 보안 설정](#-보안-설정)

---

## 🚀 빠른 시작 (최상단 필수)

### 자주 사용하는 명령어

```bash
# 🚨 빌드 오류 시 긴급 명령어 (2025-08-24 업데이트)
npm run verify:parallel          # 병렬 검증 (60% 빠름) 🔥
npm run verify:critical         # 핵심 검증 (API + Routes + Types)
npm run verify:quick            # 빠른 검증 (API + Types)
npm run types:generate          # DB에서 타입 재생성
npm run build                   # 빌드 테스트

# 🔥 검증 시스템 (12개 scripts) - 2025-08-24
npm run verify:all              # 모든 검증 (8개 스크립트)
npm run verify:api              # API 일치성 (인증 통일)
npm run verify:types            # TypeScript 타입 안정성
npm run verify:routes           # 라우트 보호 상태

# 개발 명령어
npm run dev                     # 개발 서버 시작 (자동 검증 포함)
npm run dev:no-verify          # 검증 없이 개발 서버 시작
npm run build                   # 빌드 (Vercel용, 환경 감지)
npm run build:local            # 로컬 전체 테스트 (검증 + 빌드)
npm run build:no-verify        # 검증 없이 빌드
npm run build:analyze          # 번들 분석기 실행 (ANALYZE=true) 🆕 2025-08-23
npx tsc --noEmit               # TypeScript 체크
npm run lint                    # ESLint 검사

# 🧪 E2E 테스트 명령어 (2025-08-27 최적화) ⚡
npm run e2e:ui                 # 추천! 시각적 + 빠른 실행 (Chromium만)
npm run e2e:fast               # 초고속 검증 (Smoke 테스트, 1-2분)
npm run e2e                    # 기본 실행 (Chromium만, 60% 빠름)
npm run e2e:debug              # 디버그 모드 (단계별 실행)
npm run e2e:all-browsers       # 전체 브라우저 테스트 (기존 방식)

# 🔧 보안 도구 (5개) - 2025-08-24
npm run security:test           # 보안 테스트
npm run security:apply-rls-all  # RLS 정책 적용
npm run security:ttl            # TTL 정책 실행
npm run security:scan-secrets   # 비밀키 스캔
npm run security:complete       # 전체 보안 점검

# 🎯 코드 품질 도구 (2025-08-20 추가)
npm run lint:biome             # Biome 코드 검사
npm run lint:biome:fix         # Biome 자동 수정 (import 정렬, 포맷팅)
npm run format:biome           # Biome 코드 포맷팅
npm run verify:complete        # 전체 검증 (기존 + Biome)
npm run fix:all                # 모든 자동 수정 한번에

# 🧪 단위/통합 테스트 명령어 (Vitest)
npm run test                   # Vitest 테스트 실행 (watch 모드)
npm run test:coverage          # 테스트 커버리지 확인
npm run test:ui                # Vitest UI 실행

# 🎬 테스트 코드 생성 도구
npx playwright codegen localhost:3000  # 테스트 코드 자동 생성!
npx playwright install         # Playwright 브라우저 설치

# Supabase 마이그레이션 (100% 완료 ✅)
npm run supabase:migrate-complete # Service Role Key 활용 완벽 실행 ✅
npm run supabase:verify           # 테이블 생성 검증
node scripts/verify-with-service-role.js # RLS 우회 정확한 검증

# 🔐 보안 운영 명령어 (일일 실행 권장)
npm run security:test          # 보안 테스트 (100% 통과 목표)
npm run security:ttl           # TTL 정책 실행
npm run security:apply-rls-all # 새 테이블 RLS 적용
npm run security:scan-secrets  # 비밀키 스캔
npm run security:complete      # 전체 보안 점검 (배포 전 필수)

# 🎯 TypeScript 타입 관리 (2025-02-21 Wave 3-4 추가)
npm run types:generate         # 프로덕션 DB에서 타입 생성
npm run types:generate:local   # 로컬 DB에서 타입 생성
npm run types:check            # 타입 오류 체크
npm run types:sync             # DB와 타입 동기화
npm run types:auto-fix         # 타입 오류 자동 분석 및 수정
node scripts/type-validator.js  # 타입 시스템 검증 도구 (Wave 3)
node scripts/type-suggester.js <파일>  # 타입 제안 도구 (Wave 3)
# Single Source of Truth: Supabase DB → database.generated.ts → index.ts
# 사용법: import { User, CommunityPost } from '@/types';
```

### 🔥 자주 수정하는 파일 Top 10

1. `src/types/index.ts` - 중앙 타입 정의 (Single Source of Truth) ⭐⭐⭐⭐⭐
2. `src/lib/api-client.ts` - 클라이언트 API 래퍼 + snake_case 변환 ⭐⭐⭐⭐⭐
3. `src/env.ts` - 환경변수 타입 안전성 설정 🆕 2025-08-23 ⭐⭐⭐⭐⭐
4. `src/lib/utils/case-converter.ts` - React 보호 변환 유틸리티 ⭐⭐⭐⭐⭐
5. **🆕 `src/lib/youtube-lens/shorts-detector.ts`** - YouTube Shorts 자동 판별 라이브러리 (2025-08-28) ⭐⭐⭐⭐
6. **🆕 `src/lib/youtube-lens/keyword-analyzer.ts`** - 키워드 트렌드 분석 라이브러리 (2025-08-28) ⭐⭐⭐⭐
7. **🆕 `src/lib/youtube-lens/format-number-ko.ts`** - 한국어 숫자 포맷터 라이브러리 (2025-08-28) ⭐⭐⭐
8. `src/components/ErrorBoundary.tsx` - 에러 바운더리 컴포넌트 🆕 2025-08-23 ⭐⭐⭐⭐
9. `src/app/layout.tsx` - 루트 레이아웃 (ErrorBoundary 적용) ⭐⭐⭐⭐
10. `next.config.ts` - Next.js 설정 (이미지 최적화) ⭐⭐⭐⭐
11. `src/app/auth/callback/route.ts` - 인증 콜백
12. `src/app/(pages)/tools/youtube-lens/page.tsx` - YouTube Lens (키워드 트렌드 탭 추가)
13. **🆕 `src/app/api/youtube-lens/keywords/trends/route.ts`** - 키워드 트렌드 API (2025-08-28)

---

## 🔐 공용 유틸/핵심 위치 (Authentication & API)

### 클라이언트 API 래퍼

- **위치**: `src/lib/api-client.ts`
- **함수**: `apiGet()`, `apiPost()`, `apiPut()`, `apiDelete()`, `apiPatch()`
- **특징**: 자동 `credentials: 'same-origin'` 포함, 401 에러 처리
- **사용법**:

```typescript
import { apiGet, apiPost, ApiError } from '@/lib/api-client';

try {
  const data = await apiGet('/api/youtube/popular');
} catch (error) {
  if (error instanceof ApiError && error.status === 401) {
    // 로그인 유도
  }
}
```

### 서버 Route 템플릿 패턴 (2025-08-19 표준화 완료)

- **세션 검사 필수**:

```typescript
// app/api/**/route.ts (2025-08-24 표준 패턴)
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const supabase = await createSupabaseRouteHandlerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  // 비즈니스 로직...
}
```

---

## 📁 프로젝트 구조

> **🔗 관련 문서 링크**:
>
> - 컴포넌트 재사용: `/docs/COMPONENT_INVENTORY.md`
> - 라우트 가드: `/docs/ROUTE_SPEC.md`
> - 상태 관리: `/docs/STATE_FLOW.md`
> - 데이터 타입: `/docs/DATA_MODEL.md`

### src/ 디렉토리 (2025-02-01 업데이트)
```
src/
├── app/                    # Next.js App Router
│   ├── (pages)/           # 페이지 그룹
│   ├── api/               # API Routes
│   └── layout.tsx         # 루트 레이아웃
├── components/
│   ├── ErrorBoundary.tsx  # ✨ NEW: 에러 바운더리 (react-error-boundary)
│   ├── WebVitals.tsx      # ✨ NEW: 성능 모니터링 (@vercel/analytics)
│   ├── lazy/              # ✨ NEW: 지연 로딩 컴포넌트
│   ├── providers/
│   │   └── Providers.tsx  # ✨ UPDATED: React Query Provider 추가
│   └── ui/                # shadcn/ui 컴포넌트
├── env.ts                 # ✨ NEW: 환경변수 타입 정의 (@t3-oss/env-nextjs)
├── hooks/
│   ├── queries/           # ✨ NEW: React Query hooks (17개)
│   │   ├── useYouTubeSearch.ts
│   │   ├── useYouTubePopular.ts
│   │   ├── useYouTubeFavorites.ts
│   │   ├── useYouTubeQueries.ts
│   │   ├── useChannelFolders.ts
│   │   ├── useUserProfile.ts
│   │   ├── useUserQueries.ts
│   │   ├── useCommunityPosts.ts
│   │   ├── useCommunityQueries.ts
│   │   ├── useRevenueProof.ts
│   │   ├── useRevenueProofQueries.ts
│   │   ├── useCourseQueries.ts
│   │   ├── useNotifications.ts
│   │   ├── useNotificationQueries.ts
│   │   ├── useAdminQueries.ts
│   │   ├── useCacheInvalidation.ts
│   │   └── index.ts
│   └── use-*.ts           # 기타 Custom Hooks
├── lib/
│   ├── api-client.ts      # API 클라이언트
│   ├── query-keys.ts      # ✨ NEW: React Query 키 관리
│   └── ...
├── store/                 # ✨ UPDATED: Zustand 스토어 (4개로 확대)
│   ├── user.ts           # ✨ NEW: 사용자 상태
│   ├── notifications.ts  # ✨ NEW: 알림 상태
│   ├── youtube-lens.ts   # YouTube Lens 상태
│   └── layout.ts         # 레이아웃 상태
└── types/
    ├── database.generated.ts  # Supabase 자동 생성 타입
    └── index.ts              # 중앙 타입 정의 (Single Source of Truth)
```

### 주요 변경사항
- **환경변수**: `env.ts` 파일로 타입 안전성 확보
- **React Query**: `hooks/queries/` 디렉토리에 17개 Custom Hooks
- **Zustand**: `store/` 디렉토리 4개 스토어로 확대
- **에러 처리**: `ErrorBoundary.tsx` 컴포넌트 추가
- **성능 모니터링**: `WebVitals.tsx` 컴포넌트 추가

```
9.Dhacle/
├── .claude/                       # 🤖 Claude Code 서브에이전트 시스템 🆕 2025-08-28
│   ├── agents/                   # 12개 전문 에이전트 (pm-dhacle + 11개)
│   │   ├── pm-dhacle.md          # 프로젝트 매니저 (총괄 조정)
│   │   ├── api-route-agent.md    # API 라우트 전문가
│   │   ├── component-agent.md    # React 컴포넌트 전문가
│   │   ├── type-agent.md         # TypeScript 타입 수호자
│   │   ├── database-agent.md     # Supabase DB 전문가
│   │   ├── security-agent.md     # 보안 수호자
│   │   ├── query-agent.md        # React Query 전문가
│   │   ├── test-agent.md         # E2E 테스트 전문가
│   │   ├── script-agent.md       # 스크립트 관리자
│   │   ├── lib-agent.md          # 라이브러리 관리자
│   │   ├── page-agent.md         # Next.js 페이지 전문가
│   │   └── doc-agent.md          # 문서 관리자
│   ├── settings.json             # 에이전트 설정 및 자동 활성화 규칙
│   └── hooks/                    # Claude Code 훅 디렉토리
├── install-agents.sh              # 서브에이전트 시스템 설치/검증 스크립트 🆕
├── .semgrep.yml                   # Semgrep 보안 규칙 🆕 2025-08-20
├── biome.json                     # Biome 설정 파일 🆕 2025-08-20
├── SEMGREP_GUIDE.md              # Semgrep 사용 가이드 🆕 2025-08-20
├── PLAYWRIGHT_GUIDE.md           # 🎭 Playwright 사용 가이드 🆕 2025-08-27
├── TEST_GUIDE.md                 # 🧪 테스트 통합 가이드 🔥 2025-08-27
├── E2E_ERROR_DETECTION.md        # 🛡️ E2E 런타임 에러 감지 가이드 🆕 2025-08-27
├── E2E_ERROR_DETECTION_VALIDATION.md # 🔍 E2E 에러 감지 검증 결과 🆕 2025-08-27
├── E2E_OPTIMIZATION_GUIDE.md     # 🚀 E2E 테스트 최적화 완전 가이드 🔥 2025-08-27
├── playwright.config.ts          # 🎭 Playwright 설정 (최적화 완료) 🔥 2025-08-27
├── playwright.temp.config.ts     # 🆕 임시 테스트 설정 (디버깅용) 2025-08-27
├── next.config.ts                # 🆕 SVG 최적화 설정 포함 (2025-08-27)
├── src/
│   ├── middleware.ts              # 캐싱 정책 & 보안 헤더 ✅ Wave 2
│   ├── app/
│   │   ├── (pages)/              # 페이지 그룹
│   │   │   ├── courses/           # 강의 시스템 ✅
│   │   │   │   ├── [id]/         # 강의 상세
│   │   │   │   ├── free/         # 무료 강의 ✅
│   │   │   │   ├── popular/      # 인기 강의 ✅
│   │   │   │   └── new/          # 신규 강의 ✅
│   │   │   ├── mypage/            # 마이페이지 ✅
│   │   │   │   ├── profile/       # 프로필
│   │   │   │   ├── courses/       # 내 강의
│   │   │   │   └── components/    # MyPageSidebar
│   │   │   ├── revenue-proofs/    # 수익 인증 ✅
│   │   │   ├── youtube-lens/      # YouTube 도구 ✅
│   │   │   └── community/         # 커뮤니티 ✅
│   │   ├── admin/                 # 관리자 페이지 ✅
│   │   │   ├── courses/           # 강의 관리
│   │   │   └── videos/            # 비디오 업로드
│   │   ├── api/                   # API Routes
│   │   │   ├── user/              # 사용자 API
│   │   │   │   ├── profile/       # 프로필 관리
│   │   │   │   └── api-keys/      # API Key 관리 ✅
│   │   │   ├── youtube/           # YouTube API ✅
│   │   │   ├── payment/           # 결제 API (TossPayments) ✅
│   │   │   └── community/         # 커뮤니티 API ✅
│   │   ├── auth/                  # 인증 관련
│   │   │   ├── callback/          # Kakao OAuth 콜백
│   │   │   └── error/             # 인증 에러
│   │   ├── payment/               # 결제 페이지 ✅
│   │   │   ├── success/           # 성공
│   │   │   └── fail/              # 실패
│   │   ├── layout.tsx             # Root Layout ✅
│   │   ├── page.tsx               # 메인 페이지 ✅
│   │   ├── globals.css            # 전역 스타일
│   │   ├── sitemap.ts             # SEO 사이트맵 ✅
│   │   └── robots.ts              # SEO robots ✅
│   ├── mocks/                     # MSW 모킹 시스템 ✅ NEW (2025-02-01)
│   │   ├── handlers.ts            # API 모킹 핸들러
│   │   ├── browser.ts             # 브라우저 워커 설정
│   │   └── server.ts              # Node.js 서버 설정
│   ├── providers/
│   │   ├── MSWProvider.tsx        # MSW Provider 컴포넌트 ✅ NEW
│   │   └── Providers.tsx          # React Query Provider 통합 🆕 2025-08-23
│   ├── store/                     # Zustand 스토어 (4개로 확대) 🆕
│   │   ├── layout.ts              # 레이아웃 상태
│   │   ├── youtube-lens.ts        # YouTube Lens 상태
│   │   ├── user.ts                # 사용자 상태 🆕 2025-08-23
│   │   └── notifications.ts       # 알림 상태 🆕 2025-08-23
│   ├── hooks/                     # Custom Hooks
│   │   ├── use-youtube-lens-subscription.ts  # 🆕 클라이언트 PubSub Hook (2025-08-27)
│   │   └── queries/               # React Query Hooks 🆕 2025-08-23 (17개)
│   │       ├── index.ts           # Export barrel
│   │       └── ... (16개 Hook 파일)
│   ├── test/                      # 테스트 설정 ✅ NEW (2025-02-01)
│   │   └── setup.ts               # Vitest 테스트 셋업
│   ├── types/                     # TypeScript 타입 시스템 ✅ (2025-02-02)
│   │   ├── database.generated.ts  # Supabase 자동 생성 타입 (snake_case)
│   │   └── index.ts               # 중앙 타입 정의 (camelCase 변환)
│   ├── components/
│   │   ├── ui/                    # shadcn/ui (29개 컴포넌트)
│   │   ├── layout/                # 레이아웃 컴포넌트
│   │   ├── ErrorBoundary.tsx      # 에러 바운더리 🆕 2025-08-23
│   │   ├── WebVitals.tsx          # 성능 모니터링 🆕 2025-08-23
│   │   ├── lazy/                  # 지연 로딩 컴포넌트 🆕
│   │   │   └── index.tsx          # LazyYouTubeLens, LazyRevenueProof
│   │   └── features/              # 기능별 컴포넌트
│   │       ├── HeroCarousel.tsx   # 메인 캐러셀
│   │       ├── RevenueGallery.tsx # 수익 갤러리
│   │       ├── CourseGrid.tsx     # 강의 그리드
│   │       └── VideoPlayer.tsx    # 비디오 플레이어
│   ├── env.ts                     # 환경변수 타입 정의 🆕 2025-08-23
│   └── lib/
│       ├── pubsub/                # 🆕 PubSub 시스템 (2025-08-27)
│       │   └── youtube-lens-pubsub.ts  # 서버사이드 Realtime PubSub
│       ├── supabase/              # Supabase 설정
│       │   ├── browser-client.ts  # 브라우저 클라이언트
│       │   └── server-client.ts   # 서버 클라이언트
│       ├── security/              # 보안 모듈 ✅ Wave 3
│       │   ├── rate-limiter.ts    # Rate Limiting 시스템
│       │   ├── validation-schemas.ts # Zod 검증 스키마 (13개)
│       │   ├── sanitizer.ts       # XSS 방지 (DOMPurify)
│       │   └── example-usage.ts   # 보안 사용 예제
│       ├── query-keys.ts          # React Query 키 관리 🆕
│       ├── api-keys.ts            # API Key 관리 (2025-01-22 수정) ✅
│       ├── youtube/               # YouTube 통합
│       ├── tosspayments/          # TossPayments ✅
│       │   └── client.ts          # 결제 클라이언트
│       └── utils.ts               # 유틸리티
├── supabase/
│   ├── migrations/                # DB 마이그레이션 (18개)
│   │   ├── 20250109000001_initial_schema.sql
│   │   ├── 20250121000001_youtube_lens_complete_schema.sql 🎯
│   │   ├── 20250816075332_youtube_lens_pubsubhubbub.sql 🎯
│   │   ├── 20250816080000_youtube_lens_analytics.sql 🎯
│   │   └── ... (14개 추가 파일)
│   ├── migrations/
│   │   ├── 20250123000001_wave0_security_rls.sql # Wave 0 RLS 정책 ✅
│   │   ├── 20250123000002_wave2_security_rls.sql # Wave 2 RLS 정책 ✅ NEW
│   │   └── ... (기존 마이그레이션 파일들)
│   └── config.toml                # Supabase 설정
├── e2e/                          # 🎭 E2E 테스트 (Playwright) - 2025-08-27 확대
│   ├── helpers/                  # 🆕 E2E 테스트 헬퍼 (2025-08-27)
│   │   └── error-detector.ts     # 🛡️ 런타임 에러 감지 시스템
│   ├── auth.spec.ts              # 인증 플로우 테스트 (로그인/로그아웃)
│   ├── full-journey.spec.ts      # 10분 사용자 시나리오 테스트
│   ├── payment-flow.spec.ts      # 🆕 결제 프로세스 E2E 테스트
│   ├── youtube-lens.spec.ts      # 🆕 YouTube Lens 기능 테스트
│   ├── auth-enhanced.spec.ts     # 🚀 런타임 에러 감지 강화 인증 테스트 (2025-08-27)
│   ├── error-detection-validation.spec.ts # 🆕 에러 감지 검증 테스트
│   ├── error-safe-example.spec.ts        # 🆕 에러 감지 예시
│   ├── comprehensive-e2e-with-error-detection.spec.ts # 🆕 종합 테스트
│   ├── global-setup.ts           # 🛡️ 전역 에러 감지 설정 (2025-08-27)
│   ├── demo-error-detection.js   # 🆕 에러 감지 데모 스크립트
│   └── fixtures/                 # 테스트 데이터/설정
├── tests/                        # 단위/통합 테스트 (Vitest)
│   ├── setup.ts                  # 테스트 설정
│   └── helpers/                  # 🆕 테스트 헬퍼 함수
├── scripts/                      # 자동화 스크립트 (검증 스크립트만 유지)
│   ├── backup-unused-scripts-20250131/  # 자동 변환 스크립트 백업 (38개) ⚠️ 사용 금지
│   │   ├── fix-type-system.js    # ❌ 자동 변환 금지
│   │   ├── fix-type-system-v2.js # ❌ 자동 변환 금지
│   │   ├── fix-all-typescript-errors.js # ❌ 자동 변환 금지
│   │   └── ... (35개 추가 자동 변환 스크립트)
│   ├── security/                 # 보안 스크립트 (검증만)
│   │   ├── validate-rls.js       # RLS 상태 검증 도구 ✅
│   │   └── apply-rls-wave2.js    # Wave 2 RLS 적용 (검증용) ✅
│   ├── verify-api-consistency.js  # API 일치성 검사 ✅
│   ├── verify-case-consistency.js # snake_case 일관성 검증 ✅ (2025-01-31)
│   ├── demo-case-conversion.js    # 변환 시연 (읽기 전용) ✅
│   ├── verify-with-service-role.js # RLS 우회 정확한 검증 ✅
│   ├── verify-database.js         # DB 연결 및 테이블 검증 ✅
│   ├── verify-dependencies.js    # 패키지 의존성 검증 ✅
│   ├── verify-imports.js          # import 문 일관성 검증 ✅
│   ├── verify-parallel.js         # 병렬 검증 실행기 ✅
│   ├── verify-routes.js           # 라우트 보호 검증 ✅
│   ├── verify-runtime.js          # 런타임 환경 검증 ✅
│   ├── verify-types.js            # TypeScript 타입 검증 ✅
│   ├── verify-ui-consistency.js   # UI 일관성 검증 ✅
│   ├── supabase-sql-executor.js   # SQL 실행 도구 ✅
│   └── seed.js                    # DB 시드 데이터
├── public/                        # 정적 파일
│   ├── images/                    # 이미지
│   └── icons/                     # 아이콘
├── docs/                          # 프로젝트 문서 (13개 핵심 문서 체계)
│   ├── security/                  # 보안 문서 ✅ Wave 0-3
│   │   ├── coverage.md            # 보안 커버리지 매트릭스
│   │   ├── security_refactor_plan.md # 보안 리팩토링 계획
│   │   └── WAVE3_IMPLEMENTATION_REPORT.md # Wave 3 구현 보고서 ✅ NEW
│   ├── PROJECT.md                 # 프로젝트 현황
│   ├── CODEMAP.md                 # 프로젝트 구조 (이 문서)
│   ├── CHECKLIST.md               # 작업 검증 체크리스트
│   ├── DOCUMENT_GUIDE.md          # 문서화 가이드라인
│   ├── INSTRUCTION_TEMPLATE.md    # 지시서 생성 템플릿
│   ├── FLOWMAP.md                 # 사용자 플로우맵
│   ├── WIREFRAME.md               # UI-API 연결 명세
│   ├── COMPONENT_INVENTORY.md     # 컴포넌트 카탈로그
│   ├── ROUTE_SPEC.md              # 라우트 구조 명세
│   ├── STATE_FLOW.md              # 상태 관리 플로우
│   ├── DATA_MODEL.md              # 데이터 모델 명세
│   ├── ERROR_BOUNDARY.md          # HTTP 에러 처리 전략
│   └── CONTEXT_BRIDGE.md          # 반복 실수 예방 통합 가이드
├── .husky/                        # Git hooks (2025-08-19 추가)
│   ├── _/                         # Husky 내부 파일
│   └── pre-commit                 # Pre-commit 검증 스크립트
└── package.json                   # 의존성 관리 (husky 추가)
```

---

## 🛠 기술 스택 상세

### Frontend

```yaml
Core:
  - Framework: Next.js 15.4.6 (App Router)
  - Runtime: React 19.1.1
  - Language: TypeScript 5.x (strict mode)

UI & Styling:
  - Component Library: shadcn/ui (24개 컴포넌트)
  - CSS Framework: Tailwind CSS 3.4.1
  - Animations: Tailwind Animate 1.0.7
  - Utilities: clsx 2.1.1, tailwind-merge 2.2.0

State & Forms:
  - State Management: Zustand 5.0.7 (4 stores with persist)
  - Server State: @tanstack/react-query 5.85.0 (9 custom hooks) 🆕
  - Form Management: React Hook Form 7.x
  - Validation: Zod 3.x + @hookform/resolvers

Payment:
  - TossPayments: @tosspayments/payment-sdk 1.9.1
  - 7가지 한국 결제 수단 지원

Video & Media:
  - Video Player: video.js 8.19.2
  - Streaming: HLS support
  - YouTube Integration: API Key based

Animations & UX:
  - Motion: framer-motion 12.23.12
  - Theme: next-themes 0.4.6
  - Progress: nprogress 0.2.0
  - Observer: react-intersection-observer 9.16.0

Icons:
  - Icons: lucide-react 0.469.0
```

### Backend

```yaml
Database & Auth:
  - Platform: Supabase (PostgreSQL)
  - Authentication: Supabase Auth + Kakao OAuth 2.0
  - Session: Supabase SSR 0.5.2

API:
  - Routes: Next.js App Router
  - Client: @supabase/supabase-js 2.51.0
  - Type Safety: Generated types

Storage:
  - Files: Supabase Storage
  - Images: Next.js Image Optimization

Security:
  - Encryption: AES-256-CBC (API Keys)
  - RLS: Row Level Security
```

### Development

```yaml
Tools:
  - Package Manager: npm
  - Linter: ESLint + Prettier + Biome (warnings 0)
  - Type Checking: TypeScript (strict, errors 88→1)
  - Bundle Analysis: @next/bundle-analyzer 15.5.0 🆕
  - CLI: Supabase CLI
  - Environment Safety: @t3-oss/env-nextjs 0.13.8 (100% type-safe) ✅
  - Error Boundaries: react-error-boundary 4.1.2 ✅
  - Web Vitals: web-vitals 5.1.0 + Vercel Analytics ✅

Build & Deploy:
  - Build: Next.js build system (8 seconds)
  - Deploy: Vercel-ready with Analytics
  - Node: 22.15.1
  - Verification: 12 scripts + 5 security tools ✅
```

---

## 📊 DB 테이블 구조 (21개 테이블)

### 인증 & 사용자
- `profiles` - 사용자 프로필 (이름, 채널 정보)
- `users` - Supabase 인증 사용자

### 강의 시스템
- `courses` - 강의 정보 (제목, 가격, 강사)
- `lessons` - 강의 레슨 (비디오, 자료)
- `course_enrollments` - 수강 신청 ✨ NEW
- `course_progress` - 학습 진도
- `course_progress_extended` - 확장 진도 정보 ✨ NEW
- `course_qna` - 강의 Q&A
- `course_weeks` - 주차별 구성

### YouTube Lens (2025-08-28 Phase 2 확장)
- `videos` - YouTube 비디오 정보
- `video_stats` - 비디오 통계 ✨ NEW
- `collections` - 비디오 컬렉션
- `source_folders` - 채널 폴더 관리
- **🆕 `yl_videos`** - Phase 2 비디오 메타데이터 (Shorts 분석)
- **🆕 `yl_keyword_trends`** - Phase 2 키워드 트렌드 분석
- **🆕 `yl_category_stats`** - Phase 2 카테고리 통계
- **🆕 `yl_follow_updates`** - Phase 2 팔로우 알림

### 수익 인증
- `revenue_proofs` - 수익 인증 게시글
- `revenues` - 수익 데이터 ✨ NEW
- `proof_likes` - 인증 좋아요 ✨ NEW
- `proof_comments` - 인증 댓글 ✨ NEW

### 커뮤니티
- `community_posts` - 게시글
- `community_comments` - 댓글
- `community_likes` - 좋아요

### 기타
- `badges` - 사용자 뱃지 ✨ NEW
- `naver_cafe_verifications` - 네이버 카페 인증 ✨ NEW
- `payments` - 결제 내역

---

## 🔗 API 엔드포인트

### 사용자 관리

- `GET /api/user/profile` - 프로필 조회
- `PUT /api/user/profile` - 프로필 수정
- `POST /api/user/cafe-verify` - 네이버 카페 인증
- `GET/POST/DELETE /api/user/api-keys` - API Key CRUD

### YouTube API (전체 12개 엔드포인트)

- `GET /api/youtube/search` - 동영상 검색
- `GET/POST /api/youtube/favorites` - 즐겨찾기 관리
- `DELETE /api/youtube/favorites/[id]` - 즐겨찾기 삭제
- `GET /api/youtube/validate-key` - API Key 검증
- `GET /api/youtube/popular` - 인기 Shorts 조회
- `GET /api/youtube/metrics` - 지표 조회
- `GET/POST /api/youtube/collections` - 컬렉션 관리
- `GET/POST /api/youtube/collections/items` - 컬렉션 아이템
- `POST /api/youtube/subscribe` - 구독 관리
- `GET /api/youtube/analysis` - 분석 데이터
- `POST /api/youtube/batch` - 배치 처리
- `POST /api/youtube/webhook` - Webhook 처리

### 강의 시스템

- `GET /api/courses` - 강의 목록
- `GET /api/courses/[id]` - 강의 상세
- `POST /api/courses/enroll` - 수강 신청
- `PUT /api/courses/progress` - 진도 업데이트

### 커뮤니티

- `GET/POST /api/community/posts` - 게시글 목록/작성
- `GET/PUT/DELETE /api/community/posts/[id]` - 게시글 CRUD
- `POST /api/community/posts/[id]/like` - 좋아요
- `POST /api/community/posts/[id]/comment` - 댓글

### 결제 (TossPayments)

- `POST /api/payment/request` - 결제 요청
- `POST /api/payment/confirm` - 결제 승인
- `POST /api/coupons/validate` - 쿠폰 검증

---

## 🎨 주요 컴포넌트

### shadcn/ui 컴포넌트 (29개)

Accordion, Alert, AlertDialog, Avatar, Badge, Button, Card, Carousel, Checkbox, Dialog, DropdownMenu, Input, Label, NavigationMenu, Popover, Progress, RadioGroup, ScrollArea, Select, Separator, Skeleton, Slider, Sonner, Switch, Tabs, Textarea, TiptapEditor, Toast, Tooltip, useToast

### 레이아웃 컴포넌트

- Header - 동적 스크롤 헤더
- Sidebar - 인프런 스타일 사이드바
- Footer - 전체 푸터
- MobileNav - 하단 고정 모바일 네비
- TopBanner - 그라데이션 배너

### 기능 컴포넌트

- HeroCarousel - 메인 캐러셀 (자동재생)
- RevenueGallery - 수익 갤러리 (무한스크롤)
- CourseGrid - 강의 그리드 (필터/정렬)
- VideoPlayer - HLS 비디오 플레이어
- PaymentMethodSelector - 결제 수단 선택

---

## 🔐 환경 변수

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Kakao OAuth
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=
NEXT_PUBLIC_KAKAO_REST_API_KEY=

# TossPayments
NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY=
TOSSPAYMENTS_SECRET_KEY=

# Security
ENCRYPTION_KEY= # 64자 hex (필수!)
```

---

_이 문서는 프로젝트 구조도입니다. 현재 상태는 `/docs/PROJECT.md` 참조_
