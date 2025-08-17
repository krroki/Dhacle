# 📍 디하클(Dhacle) 프로젝트 현황

*목적: 프로젝트 현재 상태와 진행 상황 추적*
*최종 업데이트: 2025-01-22 (문서 정확성 검증 및 업데이트)*

## 🔴 필수: 새 세션 시작 체크리스트

**⚠️ 경고: AI 작업 시작 전 반드시 확인**

### 📋 필수 확인 문서
1. ☐ **이 문서** (`PROJECT.md`) - 현재 상태와 진행 상황
2. ☐ **`/CLAUDE.md`** - 프로젝트 규칙과 가이드라인
3. ☐ **`/README.md`** - 프로젝트 기본 정보

---

## 🎯 프로젝트 개요

- **프로젝트명**: 디하클 (Dhacle)
- **목적**: YouTube Shorts 크리에이터 교육 및 커뮤니티 플랫폼
- **아키텍처**: Next.js 15.4.6 + Supabase Auth + TypeScript

---

## 🔒 인증/오리진 불변식 (Authentication Invariants)

### 핵심 원칙
- **로컬 개발**: 반드시 `http://localhost:<port>`만 사용 (127.0.0.1 사용 금지)
- **프로덕션**: HTTPS 필수, `NEXT_PUBLIC_SITE_URL`은 실제 접근 도메인과 동일
- **세션 식별**: 항상 쿠키 + 서버 검사, 클라이언트에서 `userId` 전달 금지
- **내부 API**: 같은 오리진(`/api/...`) 사용, 별도 도메인 호출 금지 (쿠키 유지)

### 에러 정책 (표준)
- 401: `{ error: 'User not authenticated' }`
- 4xx/5xx: `{ error: string }` (단일 키)
- 프론트는 401 → 로그인 유도, 그 외 → 사용자 친화적 메시지 + 콘솔에 상세 로그

### 스모크 테스트 체크리스트
- [ ] 로컬 실행 시 `localhost:3000` 사용
- [ ] Network 탭에서 내부 `/api/...` 요청이 **Cookie** 포함
- [ ] 인기 Shorts/컴렉션/폴더 진입 시 200 응답
- [ ] 로그아웃 상태에서 접근 시 401 + 로그인 유도

---

## ✅ 프로젝트 상태

### YouTube Lens 상태
- ✅ **프로덕션 정상 작동** (2025-01-17 해결 완료)
- ✅ 모든 핵심 파일 구현 완료
- ✅ API 엔드포인트 정상 작동
- ✅ 환경변수 설정 완료

---

## 📊 반복 실수 추적

> **관리 규칙**: 발생 횟수만 누적, 패턴 파악용

| 실수 유형 | 발생 횟수 | 마지막 발생 |
|----------|----------|------------|
| className 직접 사용 | 0회 | - |
| any 타입 사용 | 0회 | - |
| 'use client' 남발 | 0회 | - |
| 임의 파일 생성 | 0회 | - |

---

## 🆕 최근 변경사항

> **관리 규칙**: 최신 7개만 유지, 오래된 항목 자동 삭제

1. **2025-01-22 (PM)**: YouTube Lens 에러 로깅 개선 및 API 키 처리 수정 ✅
2. **2025-01-22 (AM)**: 프로젝트 문서 정확성 검증 및 업데이트 완료
3. **2025-01-21 (Evening)**: Service Role Key 설정 및 모든 마이그레이션 100% 완료
4. **2025-01-21 (PM)**: YouTube Lens 컬렉션 기능 구현 완료 (Phase 3 100% 완료)
5. **2025-01-21 (AM)**: YouTube Lens Phase 1&3 핵심 기능 구현 (DB, 무키워드 검색, 지표 계산)
6. **2025-01-21**: 마이페이지 사이드바 중복 문제 해결
7. **2025-01-20**: Header 프로필 드롭다운 UI 개선

---

## 📈 Phase별 진행 요약

### 완료된 Phase (1-14) ✅
- **Phase 1-4**: 프로젝트 초기화, UI 재구축, 메인 페이지 구현
- **Phase 5-9**: 수익 인증, YouTube Lens, 강의 시스템, 결제, SEO
- **Phase 10-11**: OAuth→API Key 전환, TossPayments 마이그레이션
- **Phase 12-14**: 카테고리 시스템, 커뮤니티, Supabase CLI 자동화

### 진행 예정 Phase
- **Phase 15**: 알림 시스템, 실시간 채팅
- **Phase 16**: 이메일 인증, 사용자 성과 시스템

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15.4.6 (App Router)
- **UI Library**: shadcn/ui (Radix UI + Tailwind) - 28개 컴포넌트
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **State**: Zustand 5.0.7 (설치됨)
- **Form**: React Hook Form + Zod (설치됨)
- **Animation**: Framer Motion 12.23.12
- **Theme**: next-themes 0.4.6
- **Progress**: nprogress 0.2.0
- **Observer**: react-intersection-observer 9.16.0
- **Toast**: Sonner (Radix UI Toast 기반)
- **Editor**: TipTap (리치 텍스트 에디터)
- **Payment**: TossPayments (@tosspayments/payment-sdk) ✅ NEW
- **Video**: video.js (HLS 스트리밍 지원) ✅ NEW

### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + Kakao OAuth 2.0
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics (예정)

---

## 📁 프로젝트 구조

```
src/
├── app/                    # App Router
│   ├── layout.tsx         # Root Layout ✅ 구현 완료
│   ├── page.tsx          # 메인 페이지 ✅ 구현 완료
│   ├── globals.css       # 전역 스타일
│   ├── sitemap.ts        # 사이트맵 생성 ✅ NEW
│   ├── robots.ts         # robots.txt 생성 ✅ NEW
│   ├── (pages)/          # 페이지 그룹
│   │   ├── courses/      # 강의 페이지 ✅ 구현 완료
│   │   │   ├── [id]/     # 강의 상세 ✅ NEW
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── CourseDetailClient.tsx
│   │   │   │       └── PurchaseCard.tsx
│   │   │   ├── page.tsx  # 강의 목록
│   │   │   └── components/
│   │   │       ├── CourseGrid.tsx
│   │   │       └── InstructorFilter.tsx
│   │   ├── payment/      # 결제 페이지 ✅ NEW
│   │   │   ├── checkout/page.tsx
│   │   │   ├── success/page.tsx
│   │   │   └── cancel/page.tsx
│   │   ├── community/    # 커뮤니티 (예정)
│   │   ├── revenue-proof/ # 수익 인증 페이지 ✅
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── create/page.tsx
│   │   │   ├── guide/page.tsx
│   │   │   └── ranking/page.tsx
│   │   ├── tools/        # 도구
│   │   │   ├── page.tsx
│   │   │   ├── youtube-lens/page.tsx
│   │   │   ├── revenue-calculator/page.tsx
│   │   │   └── thumbnail-maker/page.tsx
│   │   ├── settings/     # 설정
│   │   │   └── api-keys/page.tsx
│   │   ├── docs/         # 문서
│   │   │   └── get-api-key/page.tsx
│   │   ├── privacy/page.tsx      # 개인정보처리방침
│   │   ├── terms/page.tsx        # 이용약관
│   │   ├── sitemap/page.tsx      # 사이트맵
│   │   └── accessibility/page.tsx # 접근성
│   ├── learn/            # 학습 페이지 ✅ NEW
│   │   └── [courseId]/[lessonId]/page.tsx
│   ├── admin/            # 관리자 페이지 ✅ NEW
│   │   ├── layout.tsx    # 관리자 레이아웃
│   │   ├── page.tsx      # 대시보드
│   │   ├── courses/      # 강의 관리
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── components/
│   │   │       └── CourseEditor.tsx
│   │   └── components/
│   │       └── AdminSidebar.tsx
│   ├── mypage/           # 마이페이지 ✅
│   │   ├── profile/      # 프로필
│   │   ├── courses/      # 내 강의
│   │   ├── badges/       # 뱃지
│   │   └── settings/     # 설정
│   ├── api/              # API Routes
│   │   ├── user/         # 사용자 API
│   │   │   ├── init-profile/ # 프로필 초기화 ✅
│   │   │   ├── generate-nickname/ # 닉네임 생성 ✅
│   │   │   └── naver-cafe/ # 네이버 카페 ✅
│   │   ├── payment/      # 결제 API ✅ NEW
│   │   │   ├── create-intent/route.ts
│   │   │   └── webhook/route.ts
│   │   ├── coupons/      # 쿠폰 API ✅ NEW
│   │   │   └── validate/route.ts
│   │   ├── revenue-proof/ # 수익 인증 API ✅
│   │   ├── youtube/      # YouTube API ✅
│   │   └── upload/       # 파일 업로드 ✅
│   └── auth/             # 인증 관련
│       ├── callback/     # OAuth callback
│       ├── error/        # 인증 에러
│       ├── login/        # 로그인 (구현 예정)
│       └── signup/       # 회원가입 (구현 예정)
├── components/            
│   ├── ui/               # shadcn/ui 컴포넌트 (28개) ✅ 확장
│   │   └── switch.tsx    # 토글 스위치 ✅ NEW
│   ├── layout/           # Header, Footer 등
│   └── features/         # 기능별 컴포넌트
│       ├── home/         # 메인 페이지 컴포넌트
│       ├── revenue-proof/ # 수익 인증 컴포넌트 ✅
│       └── tools/        # 도구 컴포넌트 ✅
│           └── youtube-lens/ # YouTube Lens 컴포넌트 ✅ UPDATED
│               ├── PopularShortsList.tsx # 인기 쇼츠 목록 ✅ NEW
│               ├── ChannelFolders.tsx # 채널 폴더 관리 ✅ NEW
│               ├── AlertRules.tsx # 알림 규칙 설정 ✅ NEW
│               ├── CollectionBoard.tsx # 컬렉션 보드 ✅ NEW
│               └── CollectionViewer.tsx # 컬렉션 뷰어 ✅ NEW
├── lib/
│   ├── supabase/         # Supabase 클라이언트
│   │   ├── browser-client.ts
│   │   ├── server-client.ts
│   │   └── migrations/   # SQL 마이그레이션 (17개) ✅
│   ├── stripe/           # Stripe 관련 ✅ NEW
│   │   └── client.ts     # Stripe 클라이언트 초기화
│   ├── auth/             # 인증 관련
│   ├── api/              # API 유틸리티 ✅
│   │   └── courses.ts    # 강의 API 함수
│   ├── validations/      # 유효성 검사 ✅
│   ├── youtube/          # YouTube API 관련 (12개 파일) ✅ UPDATED
│   │   ├── api-client.ts # YouTube API 클라이언트
│   │   ├── cache.ts      # 캐싱 시스템
│   │   ├── client-helper.ts # API 클라이언트 헬퍼
│   │   ├── collections.ts # 컬렉션 관리
│   │   ├── collections-server.ts # 컬렉션 서버
│   │   ├── crypto.ts     # 암호화 유틸리티
│   │   ├── env-check.ts  # 환경 변수 체크
│   │   ├── metrics.ts    # 지표 계산 엔진
│   │   ├── monitoring.ts # 채널 모니터링
│   │   ├── popular-shorts.ts # 무키워드 검색
│   │   ├── pubsub.ts     # PubSubHubbub
│   │   └── queue-manager.ts # 큐 관리
│   └── utils/            # 유틸리티 함수 ✅ 확장
├── types/                # TypeScript 타입 정의
│   ├── database.ts
│   ├── database.types.ts
│   ├── course.ts         # 강의 타입 정의 ✅ 수정
│   ├── revenue-proof.ts  # 수익 인증 타입 ✅
│   ├── youtube.ts        # YouTube 타입 ✅
│   └── youtube-lens.ts   # YouTube Lens 전체 타입 ✅ NEW
├── store/                # Zustand 상태 관리
│   ├── layout.ts         # 레이아웃 상태
│   └── youtube-lens.ts   # YouTube Lens 상태 ✅ NEW
└── hooks/                # Custom React Hooks
```

---

## 🔄 Supabase 마이그레이션 관리

### 현재 상태 (2025-01-21 - 완료)
- **연결 상태**: ✅ 프로젝트 연결됨 (golbwnsytwbyoneucunx)
- **적용 상태**: ✅ 모든 마이그레이션 성공적으로 완료
- **환경변수**: ✅ 모든 필수 키 설정 완료 (Service Role Key 포함)
- **테이블 생성**: ✅ 21개 핵심 테이블 100% 생성 완료

### 마이그레이션 파일 현황 (17개)

#### 기본 시스템 (13개)
1. `20250109000001_initial_schema.sql` - ⚠️ 일부 적용됨
2. `20250109000002_auth_triggers.sql`
3. `20250109000003_rls_policies.sql`
4. `20250109000004_kakao_auth_trigger.sql`
5. `20250109000005_course_system.sql`
6. `20250109000006_course_detail_enhancement.sql`
7. `20250109000007_revenue_proof_system.sql`
8. `20250109000008_naver_cafe_nickname.sql`
9. `20250109000009_youtube_lens.sql`
10. `20250109000010_youtube_lens_fix.sql`
11. `20250109000011_course_system_enhancement.sql`
12. `20250109000012_user_api_keys.sql`
13. `20250109000013_onboarding_update.sql`

#### 추가 기능 (5개)
14. `20250115000001_community_system.sql`
15. `20250121000001_youtube_lens_complete_schema.sql` - 🎯 YouTube Lens 핵심
16. `20250816075332_youtube_lens_pubsubhubbub.sql` - 🎯 PubSubHubbub
17. `20250816080000_youtube_lens_analytics.sql` - 🎯 Analytics

### 자동화 명령어
```bash
# 완벽한 마이그레이션 실행 (Service Role Key 활용)
npm run supabase:migrate-complete

# 테이블 검증
node scripts/verify-with-service-role.js  # 정확한 검증
npm run supabase:verify                   # 기본 검증

# 기존 명령어
npm run supabase:auto-migrate
npm run supabase:check
```

### Dashboard 직접 확인
- [Table Editor](https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/editor)
- [SQL Editor](https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/sql)
- [Database Settings](https://supabase.com/dashboard/project/golbwnsytwbyoneucunx/settings/database)

---

## 📋 Supabase 테이블 현황

### 21개 핵심 테이블 현황 ✅ 100% 생성 완료
#### 기본 테이블 (8개)
- ✅ **users** - 사용자 인증 정보 (Supabase Auth 기본)
- ✅ **profiles** - 사용자 프로필 정보 (닉네임 필드 추가됨)
- ✅ **courses** - 강의 정보
- ✅ **course_enrollments** - 강의 수강 정보
- ✅ **course_progress** - 강의 진행률
- ✅ **revenues** - 수익 인증 정보 (기존)
- ✅ **badges** - 뱃지 시스템
- ✅ **community_links** - 커뮤니티 링크

#### 수익 인증 시스템 테이블 (4개) ✅ NEW
- ✅ **revenue_proofs** - 수익 인증 메인 테이블
- ✅ **proof_likes** - 좋아요 기능
- ✅ **proof_comments** - 댓글 기능
- ✅ **proof_reports** - 신고 기능

#### 네이버 카페 연동 테이블 (1개) ✅ NEW
- ✅ **naver_cafe_verifications** - 카페 인증 로그

#### YouTube Lens 테이블 (15개) ✅ UPDATED
- ✅ **youtube_favorites** - YouTube 즐겨찾기
- ✅ **youtube_search_history** - 검색 히스토리
- ✅ **api_usage** - API 사용량 추적
- ✅ **user_api_keys** - 사용자 API 키 (AES-256 암호화)
- ✅ **videos** - 비디오 메타데이터 (Phase 1)
- ✅ **video_stats** - 비디오 통계 시계열 데이터 (Phase 1)
- ✅ **channels** - YouTube 채널 정보 (Phase 1)
- ✅ **source_folders** - 채널 폴더 관리 (Phase 1)
- ✅ **folder_channels** - 폴더-채널 매핑 (Phase 1)
- ✅ **alert_rules** - 모니터링 알림 규칙 (Phase 1)
- ✅ **alerts** - 트리거된 알림 (Phase 1)
- ✅ **collections** - 비디오 컬렉션 (Phase 3)
- ✅ **collection_items** - 컬렉션 아이템 (Phase 3)
- ✅ **saved_searches** - 저장된 검색 (Phase 1)
- ✅ **subscriptions** - 구독 플랜 관리 (Phase 1)

#### 커뮤니티 시스템 테이블 (3개) ✅ NEW (Phase 13)
- ✅ **community_posts** - 게시글 정보 (카테고리, 제목, 내용, 조회수)
- ✅ **community_comments** - 댓글 정보 (계층형 댓글 지원)
- ✅ **community_likes** - 좋아요 정보 (게시글별 좋아요)

### 추가 예정 테이블
- [ ] **course_reviews** - 강의 리뷰
- [ ] **notifications** - 알림 시스템
- [ ] **user_achievements** - 사용자 성과

---

## 🔑 환경 변수

`.env.local` 파일 필수 설정:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Kakao OAuth (Supabase Dashboard에서 설정)
# Authentication > Providers > Kakao

# API Key 암호화 (필수) ⚠️ 정확히 64자
# 생성: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=fc28f35efe5b90d34e54dfd342e6c3807c2d71d9054adb8dbba1b90a67ca7660

# YouTube API (Phase 10 이후 개인별 설정)
# 사용자가 /settings/api-keys 페이지에서 개별 등록

# TossPayments (결제 시스템) ✅ NEW
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...
# 옵션: Webhook 사용 시
# TOSS_WEBHOOK_SECRET=...

# Cloudflare Stream (비디오 스트리밍) - 예정
# CLOUDFLARE_ACCOUNT_ID=your_account_id
# CLOUDFLARE_STREAM_TOKEN=your_stream_token
```

---

## 📊 성능 벤치마크 목표

### Core Web Vitals 목표치
```yaml
LCP (Largest Contentful Paint): < 2.5s
FID (First Input Delay): < 100ms  
CLS (Cumulative Layout Shift): < 0.1
TTI (Time to Interactive): < 3.5s
Bundle Size: < 200KB per route
```

---

## 📦 의존성 체크리스트

### 작업 시작 전 필수 확인사항
- [ ] **인증 시스템**: ✅ 이미 구현됨 (Kakao OAuth)
- [ ] **DB 테이블**: 필요한 테이블 마이그레이션 확인
- [ ] **API 엔드포인트**: 필요한 API 경로 구현 여부
- [ ] **환경 변수**: `.env.local` 설정 완료
- [ ] **외부 서비스**: Supabase, Vercel 설정 확인

---

## 🚀 개발 가이드

### 빠른 시작
```bash
# 1. 개발 서버 실행
npm run dev

# 2. 타입 체크
npx tsc --noEmit

# 3. 빌드 테스트
npm run build

# 4. Supabase 로컬 실행 (선택)
npx supabase start
```

### 컴포넌트 개발 원칙
1. **shadcn/ui 우선 사용**: 커스텀보다 기존 컴포넌트 활용
2. **Tailwind 클래스만 사용**: inline style, CSS 모듈 금지
3. **타입 안정성**: any 타입 절대 금지, unknown 사용 후 타입 가드
4. **Server Component 우선**: 필요한 경우만 'use client'

### Git 커밋 규칙
```
feat: 새로운 기능
fix: 버그 수정
refactor: 코드 개선
style: 스타일 변경
docs: 문서 수정
test: 테스트 추가
chore: 기타 작업
```

### ✅ 검증된 무료 템플릿 소스

#### 컴포넌트 라이브러리
- **shadcn/ui** - https://ui.shadcn.com (최우선)
- **HyperUI** - https://hyperui.dev
- **Flowbite** - https://flowbite.com/blocks
- **DaisyUI** - https://daisyui.com
- **Preline** - https://preline.co (무료 버전)

#### 풀 템플릿
- **Vercel Templates** - https://vercel.com/templates
- **Next.js Examples** - https://github.com/vercel/next.js/tree/canary/examples
- **TailwindUI** - https://tailwindui.com (무료 섹션만)

#### 페이지별 추천 검색어
| 페이지 유형 | 검색어 | 추천 소스 |
|------------|--------|----------|
| 랜딩 | "SaaS landing hero" | HyperUI, Flowbite |
| 강의 상세 | "course detail sidebar" | TailGrids, Preline |
| 대시보드 | "admin dashboard" | shadcn/ui, Windmill |
| 로그인 | "auth form modal" | shadcn/ui, DaisyUI |
| 결제 | "checkout form" | Flowbite, Stripe |

---

## 📌 중요 참고사항

### ⚠️ 주의사항
1. **styled-components 코드 절대 금지**: 모두 제거됨
2. **any 타입 사용 금지**: TypeScript strict mode 활성화
3. **하드코딩 금지**: 환경 변수, 상수 활용
4. **중복 파일 금지**: 하나의 정식 버전만 유지
5. **Next.js 15 호환성**: useSearchParams는 Suspense boundary 필요

### 💡 개발 팁
- shadcn/ui 컴포넌트는 수정 가능 (src/components/ui/)
- Tailwind Intellisense 확장 설치 권장
- TypeScript 엄격 모드 활성화됨
- Supabase 타입은 자동 생성됨 (database.types.ts)

### 🔄 마이그레이션 매핑
- `StripeButton` → `Button` (shadcn/ui)
- `StripeCard` → `Card` + `CardContent`
- `StripeTypography` → Tailwind typography 클래스
- `styled.div` → `<div className="">`
- Theme tokens → Tailwind config

---

## 🔒 보안 체크리스트

### 필수 보안 검증 항목
- ✅ **XSS 방지**: React 자동 처리 확인
- ✅ **SQL Injection 방지**: Supabase RLS 설정
- ✅ **CSRF 보호**: Next.js 자동 처리
- ✅ **민감 정보 노출 방지**: 환경 변수 사용
- ✅ **인증/인가**: Supabase Auth + RLS
- ✅ **API 키 암호화**: AES-256 암호화 적용
- ✅ **세션 기반 인증**: 쿠키 + 서버 검사
- ✅ **401 에러 표준화**: JSON 형식 통일
- ✅ **입력값 검증**: Zod 스키마 적용
- [ ] **Rate Limiting**: API 엔드포인트 보호 (구현 예정)

---

## 📐 API 엔드포인트 패턴

### RESTful API 표준
```typescript
GET    /api/[resource]          // 목록 조회
GET    /api/[resource]/[id]     // 상세 조회  
POST   /api/[resource]          // 생성
PUT    /api/[resource]/[id]     // 수정
DELETE /api/[resource]/[id]     // 삭제
POST   /api/[resource]/[action] // 특수 액션
```

### 구현된 엔드포인트
#### 사용자 관련
- ✅ `/api/user/profile` - 프로필 관리
- ✅ `/api/user/check-username` - 사용자명 중복 체크
- ✅ `/api/user/init-profile` - 프로필 초기화
- ✅ `/api/user/generate-nickname` - 랜덤 닉네임 생성
- ✅ `/api/user/naver-cafe` - 네이버 카페 연동

#### 수익 인증 관련
- ✅ `/api/revenue-proof` - 수익 인증 CRUD
- ✅ `/api/revenue-proof/[id]` - 개별 수익 인증 관리
- ✅ `/api/revenue-proof/[id]/like` - 좋아요 기능
- ✅ `/api/revenue-proof/[id]/comment` - 댓글 기능
- ✅ `/api/revenue-proof/[id]/report` - 신고 기능
- ✅ `/api/revenue-proof/my` - 내 수익 인증
- ✅ `/api/revenue-proof/ranking` - 랭킹 시스템

#### 파일 관련
- ✅ `/api/upload` - 파일 업로드

#### YouTube Lens 관련
- ✅ `/api/youtube/search` - YouTube 검색
- ✅ `/api/youtube/auth/login` - Google OAuth 로그인
- ✅ `/api/youtube/auth/callback` - OAuth 콜백
- ✅ `/api/youtube/auth/logout` - 로그아웃
- ✅ `/api/youtube/auth/status` - 인증 상태
- ✅ `/api/youtube/favorites` - 즐겨찾기 관리
- ✅ `/api/youtube/favorites/[id]` - 개별 즐겨찾기
- ✅ `/api/youtube/popular` - 인기 Shorts 검색 ✅ NEW
- ✅ `/api/youtube/metrics` - 지표 조회 ✅ NEW
- ✅ `/api/youtube/collections` - 컬렉션 관리 ✅ NEW
- ✅ `/api/youtube/collections/items` - 컬렉션 아이템 관리 ✅ NEW

---

## 🧪 테스트 시나리오

### 작업 유형별 필수 테스트
```typescript
const testScenarios = {
  form: [
    "유효한 데이터 제출 → 성공",
    "필수 필드 비움 → 에러 메시지",
    "잘못된 형식 → 검증 에러",
    "네트워크 에러 → 재시도 옵션"
  ],
  list: [
    "초기 로딩 → 스켈레톤 UI",
    "데이터 로드 → 목록 표시",
    "빈 결과 → Empty State",
    "페이지네이션 → 다음 페이지"
  ],
  payment: [
    "결제 성공 → 완료 페이지",
    "결제 실패 → 에러 처리",
    "결제 취소 → 이전 페이지"
  ]
};
```

---

## 🔥 자주 발생하는 문제

### 1. TypeScript 에러
- **문제**: any 타입 사용 시 빌드 실패
- **해결**: unknown 타입 + 타입 가드 사용

### 2. Hydration 에러
- **문제**: Server/Client 불일치
- **해결**: 'use client' 적절히 사용, useEffect 활용

### 3. Supabase 연결 실패
- **문제**: 환경 변수 미설정
- **해결**: .env.local 확인, Vercel 환경 변수 설정

### 4. YouTube Lens 에러 메시지 불명확 (2025-01-22 해결됨)
- **문제**: "Failed to fetch --" 같은 불명확한 에러
- **해결**: 상세한 에러 로깅 추가, API 응답 형식 통일

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*