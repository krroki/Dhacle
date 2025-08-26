# 🛠️ 기술 스택 마스터 가이드

> **최종 업데이트**: 2025-02-01  
> **버전**: v1.0  
> **목적**: 프로젝트 기술 선택 가이드 및 의존성 관리

---

## 🎯 Tool Selection Matrix (작업별 도구 선택)

| 작업 유형 | 우선 사용 | 대안 도구 | NPM 명령어 | 파일 위치 |
|----------|----------|----------|-----------|----------|
| **컴포넌트 테스트** | Vitest | Testing Library | `npm run test` | `/src/**/*.test.tsx` |
| **E2E 테스트** | Playwright | - | `npm run e2e` | `/tests/e2e/` |
| **API 모킹** | MSW | - | - | `/src/mocks/` |
| **상태 관리(서버)** | TanStack Query v5 | - | - | `/src/hooks/queries/` |
| **상태 관리(클라이언트)** | Zustand v5 | - | - | `/src/store/` |
| **폼 처리** | React Hook Form + Zod | - | - | - |
| **환경변수** | T3 Env | - | - | `/src/env.ts` |
| **애니메이션** | Framer Motion v12 | - | - | - |
| **캐러셀** | Embla Carousel | - | - | - |
| **리치 에디터** | Tiptap v3 | - | - | - |
| **XSS 방지** | DOMPurify | - | - | - |
| **날짜 처리** | date-fns v4 | - | - | - |
| **리스트 최적화** | React Window | - | - | - |
| **번들 분석** | Bundle Analyzer | - | `npm run analyze` | - |
| **결제** | TossPayments SDK | - | - | `/src/lib/payments/` |
| **백엔드 서비스** | Supabase | - | - | `/src/lib/supabase/` |
| **큐 시스템** | BullMQ | - | - | `/src/lib/queue/` |
| **캐싱** | Redis (ioredis) | LRU Cache | - | `/src/lib/cache/` |

---

## 📦 Dependencies by Category (78개)

### UI Framework & Core (3개)
- **react**: ^19.1.1 - React 라이브러리
- **react-dom**: ^19.1.1 - React DOM 렌더링
- **next**: 15.4.6 - Next.js 프레임워크

### UI Components - Radix UI (21개)
- **@radix-ui/react-accordion**: ^1.2.11 - 아코디언 컴포넌트
- **@radix-ui/react-alert-dialog**: ^1.1.14 - 경고 대화상자
- **@radix-ui/react-avatar**: ^1.1.10 - 아바타 컴포넌트
- **@radix-ui/react-checkbox**: ^1.3.2 - 체크박스
- **@radix-ui/react-dialog**: ^1.1.14 - 대화상자
- **@radix-ui/react-dropdown-menu**: ^2.1.15 - 드롭다운 메뉴
- **@radix-ui/react-label**: ^2.1.7 - 레이블
- **@radix-ui/react-navigation-menu**: ^1.2.13 - 네비게이션 메뉴
- **@radix-ui/react-popover**: ^1.1.14 - 팝오버
- **@radix-ui/react-progress**: ^1.1.7 - 진행률 표시
- **@radix-ui/react-radio-group**: ^1.3.7 - 라디오 그룹
- **@radix-ui/react-scroll-area**: ^1.2.9 - 스크롤 영역
- **@radix-ui/react-select**: ^2.2.5 - 선택 컴포넌트
- **@radix-ui/react-separator**: ^1.1.7 - 구분선
- **@radix-ui/react-slider**: ^1.3.6 - 슬라이더
- **@radix-ui/react-slot**: ^1.2.3 - 슬롯 컴포넌트
- **@radix-ui/react-switch**: ^1.2.6 - 스위치
- **@radix-ui/react-tabs**: ^1.1.12 - 탭
- **@radix-ui/react-toast**: ^1.2.15 - 토스트 알림
- **@radix-ui/react-tooltip**: ^1.2.7 - 툴팁

### 상태 관리 & 데이터 페칭 (3개)
- **@tanstack/react-query**: ^5.85.0 - 서버 상태 관리
- **@tanstack/react-query-devtools**: ^5.85.0 - React Query 개발 도구
- **zustand**: ^5.0.7 - 클라이언트 상태 관리

### 백엔드 & 인증 (2개)
- **@supabase/ssr**: ^0.5.2 - Supabase SSR 지원
- **@supabase/supabase-js**: ^2.51.0 - Supabase 클라이언트

### 폼 & 검증 (3개)
- **react-hook-form**: ^7.62.0 - 폼 관리
- **@hookform/resolvers**: ^5.2.1 - 폼 검증 리졸버
- **zod**: ^4.0.17 - 스키마 검증

### 에디터 (5개)
- **@tiptap/react**: ^3.1.0 - Tiptap 에디터 React
- **@tiptap/starter-kit**: ^3.1.0 - Tiptap 기본 확장
- **@tiptap/extension-image**: ^3.1.0 - 이미지 확장
- **@tiptap/extension-link**: ^3.1.0 - 링크 확장
- **@tiptap/extension-placeholder**: ^3.1.0 - 플레이스홀더

### 애니메이션 & 시각효과 (3개)
- **framer-motion**: ^12.23.12 - 애니메이션 라이브러리
- **canvas-confetti**: ^1.9.3 - 컨페티 효과
- **embla-carousel-react**: ^8.6.0 - 캐러셀
- **embla-carousel-autoplay**: ^8.6.0 - 캐러셀 자동재생

### 유틸리티 (9개)
- **clsx**: ^2.1.1 - 클래스명 유틸리티
- **tailwind-merge**: ^2.2.0 - Tailwind 클래스 병합
- **class-variance-authority**: ^0.7.1 - 클래스 변형 권한
- **date-fns**: ^4.1.0 - 날짜 유틸리티
- **lodash.debounce**: ^4.0.8 - 디바운스 유틸리티
- **nprogress**: ^0.2.0 - 진행률 표시
- **lucide-react**: ^0.469.0 - 아이콘 라이브러리
- **react-intersection-observer**: ^9.16.0 - Intersection Observer
- **dotenv**: ^17.2.1 - 환경변수 관리

### 보안 (3개)
- **dompurify**: ^3.2.6 - XSS 방지
- **isomorphic-dompurify**: ^2.26.0 - 동형 DOMPurify
- **crypto-js**: ^4.2.0 - 암호화 유틸리티

### 성능 & 최적화 (5개)
- **react-window**: ^1.8.11 - 가상 스크롤
- **react-window-infinite-loader**: ^1.0.10 - 무한 스크롤
- **react-virtualized-auto-sizer**: ^1.0.26 - 자동 크기 조정
- **masonic**: ^4.1.0 - 메이슨리 레이아웃
- **lru-cache**: ^11.1.0 - LRU 캐시

### 미디어 (3개)
- **hls.js**: ^1.6.9 - HLS 비디오 스트리밍
- **react-image-crop**: ^11.0.10 - 이미지 크롭
- **react-signature-canvas**: ^1.1.0-alpha.2 - 서명 캔버스

### 백엔드 인프라 (4개)
- **bullmq**: ^5.58.0 - 큐 시스템
- **ioredis**: ^5.7.0 - Redis 클라이언트
- **pg**: ^8.16.3 - PostgreSQL 클라이언트
- **googleapis**: ^156.0.0 - Google APIs

### 결제 (1개)
- **@tosspayments/payment-sdk**: ^1.9.1 - 토스페이먼츠 SDK

### 모니터링 & 분석 (3개)
- **@vercel/analytics**: ^1.5.0 - Vercel Analytics
- **@vercel/speed-insights**: ^1.2.0 - Vercel Speed Insights
- **web-vitals**: ^5.1.0 - Web Vitals 측정

### 기타 (4개)
- **@t3-oss/env-nextjs**: ^0.13.8 - 환경변수 타입 안전
- **tailwindcss-animate**: ^1.0.7 - Tailwind 애니메이션
- **next-themes**: ^0.4.6 - 테마 관리
- **sonner**: ^2.0.7 - 토스트 알림
- **react-error-boundary**: ^6.0.0 - 에러 바운더리
- **@react-hook/window-size**: ^3.1.1 - 윈도우 크기 훅

### 타입 정의 (6개)
- **@types/canvas-confetti**: ^1.9.0
- **@types/dompurify**: ^3.0.5
- **@types/lodash.debounce**: ^4.0.9
- **@types/nprogress**: ^0.2.3
- **@types/crypto-js**: ^4.2.2
- **@types/react-window**: ^1.8.8
- **@types/react-window-infinite-loader**: ^1.0.9

---

## \ud83d\udd27 \uac80\uc99d \uc2dc\uc2a4\ud15c \uc544\ud0a4\ud14d\ucc98 (Phase 5 \ud1b5\ud569 - 2025-08-25)

### \ud1b5\ud569 \uac80\uc99d \uc5d4\uc9c4 (VerificationEngine)

```javascript
// \uc911\uc559\uc9d1\uc911\uc2dd \uac80\uc99d \uc544\ud0a4\ud14d\ucc98
\uc544\ud0a4\ud14d\ucc98 = {
  \ud575\uc2ec: {
    VerificationEngine: 'scripts/verify/index.js',    // \uba54\uc778 \uc5d4\uc9c4
    Config: 'scripts/verify/config.js',               // \uc911\uc559 \uc124\uc815
    Utils: 'scripts/verify/utils.js'                  // \uacf5\ud1b5 \uc720\ud2f8\ub9ac\ud2f0
  },
  \ubaa8\ub4c8: {
    TypeVerifier: 'scripts/verify/modules/types.js',
    ApiVerifier: 'scripts/verify/modules/api.js',
    SecurityVerifier: 'scripts/verify/modules/security.js',
    UiVerifier: 'scripts/verify/modules/ui.js',
    DatabaseVerifier: 'scripts/verify/modules/database.js',
    DependencyVerifier: 'scripts/verify/modules/dependencies.js'
  },
  \uc131\uacfc: {
    '\ud30c\uc77c \ud1b5\ud569': '29\uac1c \u2192 9\uac1c (-69%)',
    '\ucf54\ub4dc \ud6a8\uc728': '4,334\uc904 \u2192 2,225\uc904 (-48.7%)',
    '\uc2e4\ud589 \uc18d\ub3c4': '920ms \u2192 400ms (-56.3%)',
    '\uc911\ubcf5 \ucf54\ub4dc': '40% \u2192 10% (-75%)'
  }
}
```

### \ubaa8\ub4c8 \uc778\ud130\ud398\uc774\uc2a4

```javascript
class BaseVerifier {
  constructor(options) {
    this.tracker = new IssueTracker();
    this.scanner = new FileScanner();
  }
  
  async verify(options) {
    const files = this.scanner.scanWithContent();
    for (const file of files) {
      await this.verifyFile(file);
    }
    return {
      success: !this.tracker.hasErrors(),
      errors: this.tracker.getStats().errors,
      warnings: this.tracker.getStats().warnings
    };
  }
}
```

### \ubcd1\ub82c \uc2e4\ud589 \uc804\ub7b5

| \uc2e4\ud589 \ubaa8\ub4dc | \uba85\ub839\uc5b4 | \uc18c\uc694 \uc2dc\uac04 | \uc801\ud569 \uc0c1\ud669 |
|----------|---------|----------|----------|
| **\ubcd1\ub82c** | `npm run verify:parallel` | ~400ms | \uac1c\ubc1c \uc911 \ube60\ub978 \ud53c\ub4dc\ubc31 |
| **\uc21c\ucc28** | `npm run verify:sequential` | ~600ms | \ub514\ubc84\uae45, \uc0c1\uc138 \ub85c\uadf8 |
| **\ud575\uc2ec\ub9cc** | `npm run verify:critical` | ~200ms | \ucee4\ubc0b \uc804 \ud544\uc218 \uac80\uc99d |
| **\ub9ac\ud3ec\ud2b8** | `npm run verify:report` | ~800ms | CI/CD, \ud488\uc9c8 \ubcf4\uace0\uc11c |

### \ub9c8\uc774\uadf8\ub808\uc774\uc158 \uac00\uc774\ub4dc

```bash
# \ub808\uac70\uc2dc \uba85\ub839\uc5b4 \u2192 \uc2e0\uaddc \uba85\ub839\uc5b4
verify-types.js        \u2192 npm run verify:types
verify-api-consistency.js \u2192 npm run verify:api
verify-routes.js       \u2192 npm run verify:api
verify-ui-consistency.js \u2192 npm run verify:ui
verify-database.js     \u2192 npm run verify:database
verify-dependencies.js \u2192 npm run verify:dependencies
verify-parallel.js all \u2192 npm run verify:parallel
```

---

## 🔧 DevDependencies by Category (29개)

### 빌드 & 번들링 (3개)
- **@next/bundle-analyzer**: ^15.5.0 - 번들 분석
- **sharp**: ^0.34.3 - 이미지 최적화
- **cross-env**: ^10.0.0 - 크로스 플랫폼 환경변수

### 테스팅 (7개)
- **vitest**: ^3.2.4 - 테스트 러너
- **@vitejs/plugin-react**: ^5.0.1 - Vite React 플러그인
- **@vitest/ui**: ^3.2.4 - Vitest UI
- **@testing-library/react**: ^16.3.0 - React 테스팅
- **@testing-library/jest-dom**: ^6.7.0 - Jest DOM 매처
- **@testing-library/user-event**: ^14.6.1 - 사용자 이벤트
- **jsdom**: ^26.1.0 - JSDOM

### E2E 테스팅 (1개)
- **@playwright/test**: ^1.54.2 - E2E 테스트

### API 모킹 (1개)
- **msw**: ^2.10.5 - API 모킹

### 코드 품질 (3개)
- **@biomejs/biome**: ^2.2.0 - 코드 포맷터/린터
- **eslint**: ^9 - ESLint
- **eslint-config-next**: 15.4.6 - Next.js ESLint 설정
- **eslint-config-prettier**: ^10.1.8 - Prettier 호환

### 타입스크립트 (3개)
- **typescript**: ^5 - TypeScript
- **@types/node**: ^22 - Node.js 타입
- **@types/react**: ^19 - React 타입
- **@types/react-dom**: ^19 - React DOM 타입

### CSS (3개)
- **tailwindcss**: ^3.4.17 - Tailwind CSS
- **postcss**: ^8 - PostCSS
- **autoprefixer**: ^10 - 자동 벤더 프리픽스

### 유틸리티 (3개)
- **rimraf**: ^6.0.1 - 파일 삭제
- **glob**: ^11.0.3 - 파일 패턴 매칭
- **husky**: ^9.1.7 - Git 훅

---

## 🔧 Version Compatibility Matrix

| 패키지 | 현재 버전 | 호환 버전 | 주의사항 |
|--------|----------|----------|----------|
| **Next.js** | 15.4.6 | 15.x | App Router 필수, React 19 지원 |
| **React** | 19.1.1 | 19.x | Server Components 지원 |
| **TypeScript** | 5.x | >=5.0 | strict mode 활성화 |
| **TanStack Query** | 5.85.0 | 5.x | v4에서 마이그레이션 완료 |
| **Zustand** | 5.0.7 | 5.x | TypeScript 개선 |
| **Tiptap** | 3.1.0 | 3.x | v2에서 업그레이드 |
| **Framer Motion** | 12.23.12 | 12.x | React 19 호환 |
| **Radix UI** | Latest | 1.x | 모든 컴포넌트 최신 버전 |
| **Supabase** | 2.51.0 | 2.x | SSR 지원 포함 |
| **Vitest** | 3.2.4 | 3.x | Vite 5 기반 |
| **Playwright** | 1.54.2 | 1.x | 모든 브라우저 지원 |

---

## 📊 기술 스택 선택 기준

### 1. Framework & Runtime
- **Next.js 15**: App Router, Server Components, Edge Runtime 지원
- **React 19**: Concurrent Features, Server Components, Suspense 개선

### 2. 상태 관리 전략
- **서버 상태**: TanStack Query (캐싱, 동기화, 백그라운드 업데이트)
- **클라이언트 상태**: Zustand (간단하고 타입 안전)
- **폼 상태**: React Hook Form (성능 최적화)

### 3. UI 컴포넌트 전략
- **Radix UI**: 접근성 보장, Headless 컴포넌트
- **shadcn/ui**: Radix UI 기반 스타일드 컴포넌트
- **Tailwind CSS**: 유틸리티 우선 스타일링

### 4. 테스팅 전략
- **단위 테스트**: Vitest (빠른 실행, ESM 지원)
- **통합 테스트**: Testing Library (사용자 중심)
- **E2E 테스트**: Playwright (크로스 브라우저)
- **API 모킹**: MSW (네트워크 레벨 모킹)

### 5. 성능 최적화
- **번들 크기**: Bundle Analyzer로 모니터링
- **가상화**: React Window (대용량 리스트)
- **이미지**: Sharp (Next.js 이미지 최적화)
- **캐싱**: Redis + LRU Cache 하이브리드

### 6. 보안
- **XSS 방지**: DOMPurify (사용자 입력 정화)
- **타입 안전**: TypeScript + Zod (런타임 검증)
- **환경변수**: T3 Env (타입 안전 환경변수)

---

## 🚀 기술 스택 활용 가이드

### 개발 시작
```bash
# 개발 서버 시작
npm run dev

# Turbo 모드 (더 빠른 HMR)
npm run dev:turbo
```

### 코드 품질
```bash
# Biome로 린팅/포맷팅
npm run lint:biome
npm run format:biome

# TypeScript 타입 체크
npm run types:check
```

### 테스팅
```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run e2e

# 테스트 커버리지
npm run test:coverage
```

### 빌드 & 배포
```bash
# 프로덕션 빌드
npm run build

# 번들 분석
npm run analyze
```

---

## 📚 관련 문서

- [NPM Scripts 가이드](./NPM_SCRIPTS_GUIDE.md) - 119개 스크립트 상세 설명
- [Tool Decision Tree](./TOOL_DECISION_TREE.md) - 도구 선택 의사결정 트리
- [프로젝트 구조](./CODEMAP.md) - 파일 및 폴더 구조

---

*이 문서는 package.json과 100% 동기화되어 있습니다.*