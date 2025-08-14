# 📊 디하클(Dhacle) 프로젝트 코드맵

*최종 업데이트: 2025-01-16 (Phase 10 완료: YouTube Lens API Key 전환)*

## 🎯 프로젝트 개요

- **프로젝트명**: 디하클 (Dhacle)
- **목적**: YouTube Shorts 크리에이터를 위한 교육 및 커뮤니티 플랫폼
- **위치**: `C:\My_Claude_Project\9.Dhacle`
- **현재 상태**: Phase 10 완료 ✅ (YouTube Lens API Key 전환 완료)
- **백업 위치**: `C:\My_Claude_Project\dhacle-backup`
- **도메인**: https://dhacle.com (배포 준비 완료)

---

## 🆕 최근 업데이트 (2025-01-16)

### Phase 10: YouTube Lens API Key 전환 ✅ 완료 (2025-01-16)
- **OAuth 시스템 제거**: 
  - `/api/youtube/auth/*` 엔드포인트 모두 삭제 (5개 파일)
  - `/lib/youtube/oauth.ts` 제거
  - Google OAuth 환경 변수 제거
- **API Key 시스템 구현**: 
  - 사용자별 API Key 관리 시스템
  - AES-256-CBC 암호화 (64자 hex key)
  - Key 마스킹 (앞 8자 + 뒤 4자)
- **새 DB 테이블**: 
  - `user_api_keys` 테이블 추가 (마이그레이션 011)
  - RLS 정책으로 사용자 격리
- **성능 개선**: 
  - 사용자당 10,000 units (100배 증가)
  - 운영 비용 0원 (사용자 개인 할당량)

### Phase 9: SEO 및 메타데이터 최적화 ✅ 완료 (2025-01-14)
- **sitemap.ts**: 동적 사이트맵 생성 (`/app/sitemap.ts`)
- **robots.ts**: 검색 엔진 크롤링 규칙 (`/app/robots.ts`)
- **Switch 컴포넌트**: shadcn/ui 토글 스위치 추가

### Phase 8: 결제 시스템 구현 ✅ 완료 (2025-01-14)
- **Stripe 결제 연동**: PaymentIntent API, Webhook 처리
- **쿠폰 시스템**: 할인 코드 검증 및 적용
- **결제 페이지**: checkout, success, cancel 페이지
- **API 엔드포인트**: `/api/payment/*`, `/api/coupons/*`

### Phase 7: 강의 시스템 구현 ✅ 완료 (2025-01-14)
- **강의 목록/상세**: CourseGrid, CourseDetailClient 컴포넌트
- **비디오 플레이어**: HLS 스트리밍, 진도 저장
- **관리자 시스템**: 강의 생성/편집, 대시보드
- **학습 페이지**: `/learn/[courseId]/[lessonId]` 구현

### Phase 6: YouTube Lens 도구 구현 ✅ 완료
- **YouTube Lens 도구**: YouTube 검색, 분석, 즐겨찾기 시스템
- **~~Google OAuth 2.0~~**: ~~YouTube API 인증 연동~~ → API Key 시스템으로 전환 (Phase 10)
- **데이터베이스 확장**: 5개 테이블 (youtube_favorites, search_history, api_usage, ~~youtube_api_keys~~, user_api_keys)
- **API 통합**: YouTube Data API v3 완전 통합
- **상태 관리**: Zustand 기반 YouTube Lens store

### Phase 5: 수익 인증 시스템 & 마이페이지 구현 ✅
- **수익 인증 시스템**: 전체 CRUD, 랭킹, 좋아요, 댓글, 신고 기능
- **마이페이지**: 프로필, 강의, 뱃지, 설정 페이지
- **네이버 카페 연동**: 닉네임 인증 시스템
- **파일 업로드**: 이미지 업로드 API
- **데이터베이스**: 5개 새 테이블 추가

### 메인 페이지 구현 완료 ✅ (Phase 4)
- **8개 섹션 완성**: HeroCarousel, InstructorCategories, RevenueGallery, FreeCoursesCarousel, FreeCoursesSchedule, NewCoursesCarousel, EbookSection, FAQSection
- **성능 최적화**: Suspense, 스켈레톤 UI, YouTube 최적화 구현
- **더미 데이터**: 완전한 더미 데이터 세트 구현
- **반응형 디자인**: 모바일/태블릿/데스크톱 완벽 대응
- **TypeScript**: 에러 0개, 타입 안정성 100%

### 새로 추가된 파일 (Phase 7-9 - 강의/결제/SEO)
```
src/
├── app/
│   ├── sitemap.ts              # 사이트맵 생성 ✅ NEW
│   ├── robots.ts               # robots.txt 생성 ✅ NEW
│   ├── (pages)/
│   │   ├── courses/            # 강의 페이지 ✅ NEW
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── CourseDetailClient.tsx
│   │   │   │       └── PurchaseCard.tsx
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── CourseGrid.tsx
│   │   │       └── InstructorFilter.tsx
│   │   └── payment/            # 결제 페이지 ✅ NEW
│   │       ├── checkout/page.tsx
│   │       ├── success/page.tsx
│   │       └── cancel/page.tsx
│   ├── learn/                  # 학습 페이지 ✅ NEW
│   │   └── [courseId]/[lessonId]/page.tsx
│   ├── admin/                  # 관리자 페이지 ✅ NEW
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── courses/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── components/
│   │   │       └── CourseEditor.tsx
│   │   └── components/
│   │       └── AdminSidebar.tsx
│   └── api/
│       ├── payment/            # 결제 API ✅ NEW
│       │   ├── create-intent/route.ts
│       │   └── webhook/route.ts
│       └── coupons/            # 쿠폰 API ✅ NEW
│           └── validate/route.ts
├── components/
│   └── ui/
│       └── switch.tsx          # 토글 스위치 ✅ NEW
├── lib/
│   ├── stripe/                 # Stripe 클라이언트 ✅ NEW
│   │   └── client.ts
│   └── api/
│       └── courses.ts          # 강의 API 함수 ✅ NEW
└── types/
    └── course.ts               # 강의 타입 정의 ✅ 수정
```

### 새로 추가된 파일 (Phase 10 - API Key 전환)
```
src/
├── app/
│   ├── (pages)/
│   │   ├── settings/            # 설정 페이지
│   │   │   └── api-keys/        # API Key 관리
│   │   │       └── page.tsx     # API Key 설정 UI
│   │   └── docs/                # 문서 페이지
│   │       └── get-api-key/     # API Key 발급 가이드
│   │           └── page.tsx     # 가이드 페이지
│   └── api/
│       ├── user/                # 사용자 API
│       │   └── api-keys/        # API Key 관리
│       │       └── route.ts     # CRUD 엔드포인트
│       └── youtube/             # YouTube API (수정됨)
│           ├── validate-key/    # Key 유효성 검증
│           │   └── route.ts     # 검증 엔드포인트
│           └── search/route.ts  # 검색 (API Key 기반)
├── lib/
│   ├── api-keys/                # API Key 유틸리티
│   │   ├── crypto.ts           # AES-256 암호화
│   │   └── manager.ts          # Key 관리 함수
│   └── supabase/migrations/
│       └── 011_user_api_keys.sql # API Key 테이블
```

### 새로 추가된 파일 (Phase 6 - YouTube Lens 초기)
```
src/
├── app/
│   ├── (pages)/tools/           # 도구 페이지 그룹
│   │   └── youtube-lens/        # YouTube Lens 도구
│   │       ├── layout.tsx       # 레이아웃
│   │       └── page.tsx         # 메인 페이지
│   └── api/youtube/             # YouTube API 엔드포인트
│       ├── ~~auth/~~            # ~~OAuth 인증~~ (Phase 10에서 제거)
│       ├── search/route.ts      # YouTube 검색
│       └── favorites/           # 즐겨찾기 관리
│           ├── route.ts         # 목록/생성
│           └── [id]/route.ts    # 개별 관리
├── components/features/tools/   # 도구 컴포넌트
│   └── youtube-lens/           # YouTube Lens 컴포넌트
│       ├── components/         # UI 컴포넌트
│       │   ├── SearchBar.tsx   # 검색바
│       │   ├── VideoCard.tsx   # 비디오 카드
│       │   ├── VideoGrid.tsx   # 비디오 그리드
│       │   └── QuotaStatus.tsx # API 할당량 상태
│       └── index.ts            # 익스포트
├── lib/
│   ├── youtube/                # YouTube 관련 유틸리티
│   └── supabase/migrations/    
│       └── 008_youtube_lens.sql # YouTube Lens 테이블
├── store/
│   └── youtube-lens.ts         # Zustand 상태 관리
└── types/
    └── youtube.ts              # YouTube 타입 정의
```

### 새로 추가된 파일 (Phase 5)
```
src/
├── app/
│   ├── (pages)/revenue-proof/   # 수익 인증 페이지 그룹
│   │   ├── [id]/page.tsx       # 상세 페이지
│   │   ├── create/page.tsx     # 생성 페이지
│   │   ├── ranking/page.tsx    # 랭킹 페이지
│   │   └── page.tsx            # 목록 페이지
│   ├── mypage/                 # 마이페이지
│   │   ├── profile/page.tsx    # 프로필
│   │   ├── courses/page.tsx    # 내 강의
│   │   ├── badges/page.tsx     # 뱃지
│   │   └── settings/page.tsx   # 설정
│   └── api/                    # 새 API 엔드포인트
│       ├── revenue-proof/      # 수익 인증 API (7개 route)
│       ├── upload/route.ts     # 파일 업로드
│       └── user/               # 사용자 API (3개 추가)
├── components/
│   ├── ui/                     # 새 shadcn/ui 컴포넌트 (7개 추가)
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── checkbox.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── sonner.tsx
│   │   └── tiptap-editor.tsx
│   └── features/revenue-proof/  # 수익 인증 컴포넌트
│       ├── RevenueProofCard.tsx
│       ├── RevenueProofDetail.tsx
│       ├── RankingDashboard.tsx
│       ├── LiveRankingSidebar.tsx
│       └── FilterBar.tsx
├── lib/
│   ├── api/                    # API 유틸리티
│   ├── validations/            # 유효성 검사
│   └── supabase/migrations/    # 새 마이그레이션 (2개)
│       ├── 007_revenue_proof_system.sql
│       └── 007_naver_cafe_nickname.sql
└── types/
    └── revenue-proof.ts         # 수익 인증 타입 정의
```

---

## 🛠 기술 스택 상세

### Frontend 스택
```yaml
Core:
  - Framework: Next.js 15.4.6 (App Router)
  - Runtime: React 19.1.1
  - Language: TypeScript 5.x (strict mode)
  
UI & Styling:
  - Component Library: shadcn/ui (Radix UI 기반) - 24개 컴포넌트
  - CSS Framework: Tailwind CSS 3.4.1
  - CSS Processing: PostCSS
  - Animations: Tailwind Animate 1.0.7
  - Utilities: clsx 2.1.1, tailwind-merge 2.2.0
  
State & Forms:
  - Form Management: React Hook Form 7.x (설치됨)
  - Validation: Zod 3.x + @hookform/resolvers (설치됨)
  - State Management: Zustand 5.0.7 (설치됨)
  - Utilities: class-variance-authority 0.7.1

Payment & Commerce:
  - Payment: @stripe/stripe-js 5.5.0 ✅ NEW
  - Stripe SDK: stripe 17.5.0 ✅ NEW
  - Checkout: Stripe Elements

Video & Media:
  - Video Player: video.js 8.17.3 ✅ NEW
  - Streaming: HLS 지원
  - Thumbnails: YouTube 최적화

Animations & UX:
  - Motion: framer-motion 12.23.12
  - Theme: next-themes 0.4.6  
  - Progress: nprogress 0.2.0
  - Observer: react-intersection-observer 9.16.0

Icons & Assets:
  - Icons: lucide-react 0.469.0
  - Images: Next/Image optimization
  - Fonts: Local font loading (Geist)
```

### Backend 스택
```yaml
Database & Auth:
  - Database: Supabase (PostgreSQL)
  - Authentication: Supabase Auth
  - OAuth Provider: Kakao OAuth 2.0
  - Session Management: Supabase SSR 0.5.2
  
API:
  - API Routes: Next.js App Router
  - Client: @supabase/supabase-js 2.51.0
  - Type Safety: Generated types from Supabase
  
Storage:
  - File Storage: Supabase Storage
  - Image Optimization: Next.js Image
```

### DevOps & Tools
```yaml
Development:
  - Package Manager: npm
  - Linter: ESLint (Next.js config + eslint-config-prettier)
  - Formatter: Prettier
  - Type Checking: TypeScript (strict mode, no errors)
  
Build & Deploy:
  - Build Tool: Next.js build system
  - Deployment: Vercel
  - Environment: Node.js 18+
  
Quality Assurance:
  - Type Safety: TypeScript strict mode
  - Component Testing: (예정)
  - E2E Testing: (예정)
```

---

## 📁 디렉토리 구조 상세

### `/src` - 소스 코드
```
src/
├── app/                       # Next.js App Router
│   ├── layout.tsx            # Root Layout (전역 레이아웃) ✅ 구현 완료
│   ├── page.tsx              # 메인 페이지 ✅ 구현 완료
│   ├── globals.css           # 전역 스타일 (CSS 변수, 애니메이션, NProgress)
│   ├── sitemap.ts            # 사이트맵 생성 ✅ NEW
│   ├── robots.ts             # robots.txt 생성 ✅ NEW
│   │
│   ├── (pages)/              # 페이지 그룹
│   │   ├── courses/          # 강의 관련 페이지 ✅ 구현 완료
│   │   │   ├── [id]/         # 강의 상세
│   │   │   │   ├── page.tsx
│   │   │   │   └── components/
│   │   │   │       ├── CourseDetailClient.tsx
│   │   │   │       └── PurchaseCard.tsx
│   │   │   ├── page.tsx      # 강의 목록
│   │   │   └── components/
│   │   │       ├── CourseGrid.tsx
│   │   │       └── InstructorFilter.tsx
│   │   ├── payment/          # 결제 페이지 ✅ NEW
│   │   │   ├── checkout/page.tsx
│   │   │   ├── success/page.tsx
│   │   │   └── cancel/page.tsx
│   │   ├── community/        # 커뮤니티 페이지 (예정)
│   │   ├── revenue-proof/    # 수익 인증 페이지 ✅
│   │   │   ├── [id]/page.tsx  # 상세 페이지
│   │   │   ├── create/page.tsx # 생성 페이지
│   │   │   ├── ranking/page.tsx # 랭킹 페이지
│   │   │   └── page.tsx       # 목록 페이지
│   │   └── tools/           # 도구 페이지 ✅
│   │       └── youtube-lens/ # YouTube Lens 도구
│   │           ├── layout.tsx
│   │           └── page.tsx
│   │
│   ├── learn/               # 학습 페이지 ✅ NEW
│   │   └── [courseId]/
│   │       └── [lessonId]/
│   │           └── page.tsx  # 비디오 플레이어 페이지
│   │
│   ├── admin/               # 관리자 페이지 ✅ NEW
│   │   ├── layout.tsx       # 관리자 레이아웃
│   │   ├── page.tsx         # 대시보드
│   │   ├── courses/         # 강의 관리
│   │   │   ├── page.tsx     # 강의 목록
│   │   │   ├── new/page.tsx # 강의 생성
│   │   │   └── components/
│   │   │       └── CourseEditor.tsx
│   │   └── components/
│   │       └── AdminSidebar.tsx
│   │
│   ├── mypage/              # 마이페이지 ✅
│   │   ├── profile/page.tsx  # 프로필 페이지
│   │   ├── courses/page.tsx  # 내 강의 관리
│   │   ├── badges/page.tsx   # 뱃지 시스템
│   │   ├── settings/page.tsx # 설정 페이지
│   │   └── layout.tsx        # 마이페이지 레이아웃
│   │
│   ├── api/                  # API Routes
│   │   ├── user/            # 사용자 관련 API
│   │   │   ├── check-username/  # 사용자명 중복 체크
│   │   │   ├── profile/         # 프로필 관리
│   │   │   ├── init-profile/    # 프로필 초기화 ✅ NEW
│   │   │   ├── generate-nickname/ # 닉네임 생성 ✅ NEW
│   │   │   ├── naver-cafe/      # 네이버 카페 ✅ NEW
│   │   │   └── api-keys/        # API Key 관리 ✅ NEW (Phase 10)
│   │   ├── payment/        # 결제 API ✅ NEW
│   │   │   ├── create-intent/route.ts # PaymentIntent 생성
│   │   │   └── webhook/route.ts       # Stripe Webhook
│   │   ├── coupons/        # 쿠폰 API ✅ NEW
│   │   │   └── validate/route.ts      # 쿠폰 검증
│   │   ├── revenue-proof/  # 수익 인증 API ✅
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts      # CRUD
│   │   │   │   ├── like/route.ts # 좋아요
│   │   │   │   ├── comment/route.ts # 댓글
│   │   │   │   └── report/route.ts # 신고
│   │   │   ├── my/route.ts      # 내 수익 인증
│   │   │   ├── ranking/route.ts # 랭킹
│   │   │   └── route.ts         # 목록
│   │   ├── youtube/         # YouTube API ✅ 수정됨 (Phase 10)
│   │   │   ├── ~~auth/~~    # ~~OAuth 인증~~ (Phase 10에서 제거)
│   │   │   ├── validate-key/ # Key 유효성 검증 ✅ NEW (Phase 10)
│   │   │   │   └── route.ts
│   │   │   ├── search/route.ts    # 검색 (API Key 기반)
│   │   │   └── favorites/         # 즐겨찾기
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   └── upload/          # 파일 업로드 ✅ NEW
│   │       └── route.ts
│   │
│   └── auth/                 # 인증 관련 라우트
│       ├── callback/         # OAuth 콜백 처리
│       │   └── route.ts     # Kakao OAuth 콜백 핸들러
│       ├── error/           # 인증 에러 페이지
│       │   └── page.tsx     # 에러 표시 UI
│       ├── login/           # 로그인 페이지 (구현 예정)
│       └── signup/          # 회원가입 페이지 (구현 예정)
│
├── components/               # React 컴포넌트
│   ├── ui/                  # shadcn/ui 컴포넌트 (24개) ✅ 확장
│   │   ├── alert-dialog.tsx # 알림 다이얼로그
│   │   ├── badge.tsx        # 뱃지
│   │   ├── button.tsx       # 버튼
│   │   ├── card.tsx         # 카드
│   │   ├── carousel.tsx     # 캐러셀
│   │   ├── dialog.tsx       # 다이얼로그
│   │   ├── dropdown-menu.tsx # 드롭다운 메뉴
│   │   ├── input.tsx        # 입력 필드
│   │   ├── label.tsx        # 레이블
│   │   ├── navigation-menu.tsx # 네비게이션 메뉴
│   │   ├── select.tsx       # 선택 박스
│   │   ├── separator.tsx    # 구분선
│   │   ├── tabs.tsx         # 탭
│   │   ├── textarea.tsx     # 텍스트 영역
│   │   ├── scroll-area.tsx  # 스크롤 영역
│   │   ├── alert.tsx        # 알림 ✅ NEW
│   │   ├── avatar.tsx       # 아바타 ✅ NEW
│   │   ├── checkbox.tsx     # 체크박스 ✅ NEW
│   │   ├── progress.tsx     # 프로그레스 바 ✅ NEW
│   │   ├── radio-group.tsx  # 라디오 그룹 ✅ NEW
│   │   ├── sonner.tsx       # 토스트 알림 ✅ NEW
│   │   ├── tiptap-editor.tsx # 리치 텍스트 에디터 ✅ NEW
│   │   ├── popover.tsx      # 팝오버 ✅ NEW
│   │   └── switch.tsx       # 토글 스위치 ✅ NEW
│   │
│   ├── layout/              # 레이아웃 컴포넌트 ✅ 전체 구현 완료
│   │   ├── TopBanner.tsx    # 상단 배너 (그라디언트, sessionStorage)
│   │   ├── Header.tsx       # 헤더 (스크롤 동적 높이, 검색, 테마)
│   │   ├── Sidebar.tsx      # 사이드바 (인프런 스타일, 아코디언)
│   │   ├── Footer.tsx       # 푸터 (전체 섹션, 뉴스레터)
│   │   ├── MobileNav.tsx    # 모바일 하단 네비게이션
│   │   ├── ScrollToTop.tsx  # 맨 위로 버튼
│   │   ├── ProgressBar.tsx  # 페이지 전환 & 스크롤 프로그레스
│   │   └── NotificationDropdown.tsx # 알림 드롭다운
│   │
│   ├── providers/           # Provider 컴포넌트 ✅ 구현 완료
│   │   └── Providers.tsx    # 통합 Provider (Theme, Auth, Layout)
│   │
│   └── features/            # 기능별 컴포넌트
│       ├── auth/           # 인증 관련
│       ├── course/         # 강의 관련
│       ├── community/      # 커뮤니티 관련
│       ├── home/           # 메인 페이지 컴포넌트
│       ├── revenue-proof/  # 수익 인증 컴포넌트 ✅ NEW
│       │   ├── RevenueProofCard.tsx
│       │   ├── RevenueProofDetail.tsx
│       │   ├── RankingDashboard.tsx
│       │   ├── LiveRankingSidebar.tsx
│       │   └── FilterBar.tsx
│       └── tools/          # 도구 컴포넌트 ✅ NEW
│           └── youtube-lens/  # YouTube Lens
│               ├── components/
│               │   ├── SearchBar.tsx
│               │   ├── VideoCard.tsx
│               │   ├── VideoGrid.tsx
│               │   └── QuotaStatus.tsx
│               └── index.ts
│
├── lib/                     # 라이브러리 및 유틸리티
│   ├── supabase/           # Supabase 설정
│   │   ├── browser-client.ts  # 브라우저 클라이언트
│   │   ├── server-client.ts   # 서버 클라이언트
│   │   ├── client.ts          # 공통 클라이언트
│   │   └── migrations/        # DB 마이그레이션 (10개) ✅ 추가
│   │       ├── ALL_MIGRATIONS_COMBINED.sql
│   │       ├── 001_initial_schema.sql
│   │       ├── 002_initial_triggers.sql
│   │       ├── 003_revenue_proofs.sql
│   │       ├── 004_community_links.sql
│   │       ├── 005_course_system.sql
│   │       ├── 006_course_detail_enhancement.sql
│   │       ├── 007_revenue_proof_system.sql ✅ NEW
│   │       ├── 007_naver_cafe_nickname.sql ✅ NEW
│   │       ├── 008_youtube_lens.sql ✅ NEW
│   │       ├── 009_payment_system.sql ✅ NEW
│   │       ├── 010_course_improvements.sql ✅ NEW
│   │       └── 011_user_api_keys.sql ✅ NEW (Phase 10)
│   │
│   ├── auth/               # 인증 관련 ✅ 구현 완료
│   │   ├── AuthProvider.tsx  # 인증 프로바이더 (Legacy)
│   │   └── AuthContext.tsx   # 인증 컨텍스트 (현재 사용)
│   │
│   ├── layout/             # 레이아웃 관련 ✅ 구현 완료
│   │   └── LayoutContext.tsx # 레이아웃 컨텍스트 프로바이더
│   │
│   ├── api/               # API 유틸리티 ✅
│   │   └── courses.ts     # 강의 API 함수 ✅ NEW
│   ├── validations/       # 유효성 검사 ✅
│   ├── stripe/            # Stripe 클라이언트 ✅ NEW
│   │   └── client.ts      # Stripe 초기화
│   ├── youtube/           # YouTube 유틸리티 ✅ NEW (Phase 10 수정)
│   │   ├── api-client.ts  # YouTube API 클라이언트 (API Key 기반)
│   │   └── ~~oauth.ts~~   # ~~OAuth 인증~~ (Phase 10에서 제거)
│   ├── api-keys/          # API Key 관리 ✅ NEW (Phase 10)
│   │   ├── crypto.ts      # AES-256 암호화/복호화
│   │   └── manager.ts     # Key 관리 함수
│   └── utils/             # 유틸리티 함수 ✅ 확장
│
├── store/                   # Zustand 상태 관리 ✅ 구현 완료
│   ├── layout.ts           # 레이아웃 전역 상태 (배너, 사이드바, 헤더 등)
│   └── youtube-lens.ts     # YouTube Lens 상태 ✅ NEW
│
├── types/                   # TypeScript 타입 정의
│   ├── database.ts         # 데이터베이스 타입
│   ├── database.types.ts   # Supabase 생성 타입
│   ├── course.ts           # 강의 타입 ✅ 수정
│   ├── revenue-proof.ts    # 수익 인증 타입 ✅
│   └── youtube.ts          # YouTube 타입 ✅
│
└── hooks/                   # Custom React Hooks
    ├── use-auth.ts         # 인증 훅 (예정)
    └── use-supabase.ts     # Supabase 훅 (예정)
```

### `/public` - 정적 자산
```
public/
├── images/                  # 이미지 자산
│   ├── logo/               # 로고 이미지
│   │   └── dhacle-logo.png
│   └── carousel/           # 캐러셀 이미지
│       ├── carousel-01.jpg
│       ├── carousel-02.jpg
│       ├── carousel-03.jpg
│       └── carousel-04.jpg
└── fonts/                  # 폰트 파일 (필요시)
```

### `/docs` - 문서
```
docs/
├── PROJECT.md              # 프로젝트 현황
├── PROJECT-CODEMAP.md      # 이 문서
├── DEVELOPMENT-INSTRUCTION-TEMPLATE.md  # 개발 템플릿
```

### 루트 설정 파일
```
/
├── .env.local              # 환경 변수 (Git 제외)
├── .env.local.example      # 환경 변수 예시
├── next.config.ts          # Next.js 설정
├── tailwind.config.ts      # Tailwind CSS 설정
├── tsconfig.json           # TypeScript 설정
├── postcss.config.mjs      # PostCSS 설정
├── components.json         # shadcn/ui 설정
├── package.json            # 프로젝트 의존성 (Stripe, video.js 추가)
├── package-lock.json       # 의존성 잠금 파일
├── middleware.ts           # Next.js 미들웨어
├── README.md              # 프로젝트 README
├── CLAUDE.md              # Claude AI 가이드 (업데이트됨)
└── vercel.json            # Vercel 배포 설정
```

---

## 🔑 핵심 파일 설명

### 레이아웃 시스템 ✨ NEW
- **`layout.tsx`**: Root Layout with 완벽한 메타데이터
- **`globals.css`**: CSS 변수, 애니메이션, 다크모드 지원
- **`Providers.tsx`**: 통합 Provider (Theme + Auth + Layout)
- **`layout.ts` (store)**: Zustand 기반 전역 상태 관리
- **`LayoutContext.tsx`**: 레이아웃 컨텍스트 프로바이더

### 인증 시스템
- **`browser-client.ts`**: 클라이언트 사이드 Supabase 접속
- **`server-client.ts`**: 서버 사이드 Supabase 접속
- **`middleware.ts`**: 보호된 라우트 처리
- **`auth/callback/route.ts`**: Kakao OAuth 콜백 처리
- **`AuthContext.tsx`**: 인증 컨텍스트 (현재 사용)

### 데이터베이스
- **`ALL_MIGRATIONS_COMBINED.sql`**: 전체 DB 스키마
- **`database.types.ts`**: TypeScript 타입 정의
- 9개 개별 마이그레이션 파일
- **`007_revenue_proof_system.sql`**: 수익 인증 시스템 (4개 테이블)
- **`007_naver_cafe_nickname.sql`**: 네이버 카페 연동

### UI 컴포넌트
- **shadcn/ui**: 22개 컴포넌트 (7개 추가 설치)
- **레이아웃 컴포넌트**: 8개 완성 (TopBanner, Header, Sidebar 등)
- **수익 인증 컴포넌트**: 5개 (Card, Detail, Ranking, Filter 등)
- 모든 컴포넌트는 수정 가능
- Radix UI primitives 기반

### 새로 추가된 시스템
- **강의 시스템**: 목록, 상세, 비디오 플레이어, 진도 관리
- **결제 시스템**: Stripe 연동, PaymentIntent, Webhook, 쿠폰
- **관리자 시스템**: 강의 관리, 대시보드, CourseEditor
- **수익 인증 시스템**: 완전한 CRUD, 랭킹, 상호작용 기능
- **마이페이지**: 프로필, 강의, 뱃지, 설정 관리
- **네이버 카페 연동**: 닉네임 인증 및 랜덤 닉네임 생성
- **YouTube Lens**: YouTube 검색, 분석, 즐겨찾기
- **SEO 최적화**: sitemap.ts, robots.ts 구현

---

## 🚀 개발 플로우

### 1. 컴포넌트 개발
```bash
# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]

# 커스텀 컴포넌트 생성
# src/components/features/[feature]/[ComponentName].tsx
```

### 2. 페이지 개발
```bash
# 새 페이지 생성
# src/app/[page-name]/page.tsx

# 동적 라우트
# src/app/[dynamic]/[id]/page.tsx
```

### 3. API 개발
```bash
# API Route 생성
# src/app/api/[endpoint]/route.ts

# HTTP 메소드별 함수
export async function GET() {}
export async function POST() {}
export async function PUT() {}
export async function DELETE() {}
```

### 4. 타입 안정성
```bash
# 타입 체크
npx tsc --noEmit

# Supabase 타입 생성
npx supabase gen types typescript --local
```

---

## 📊 프로젝트 통계

### 현재 상태 (2025-01-16 업데이트)
- **총 파일 수**: ~230개+ (API Key 시스템 추가)
- **shadcn/ui 컴포넌트**: 24개 설치됨 (switch 추가)
- **레이아웃 컴포넌트**: 8개 완성
- **메인 페이지 컴포넌트**: 21개 구현 (8개 섹션 + 공유 컴포넌트)
- **강의 시스템 컴포넌트**: 6개 구현 (Grid, Detail, Purchase, Editor 등)
- **관리자 컴포넌트**: 2개 구현 (Sidebar, CourseEditor)
- **수익 인증 컴포넌트**: 5개 구현
- **YouTube Lens 컴포넌트**: 4개 구현 (OAuth UI 제거)
- **API Key 시스템**: 3개 페이지, 4개 API 엔드포인트 구현
- **마이페이지**: 5개 페이지 구현
- **Provider 시스템**: 3개 (Theme, Auth, Layout)
- **상태 관리**: Zustand store 2개 (layout, youtube-lens)
- **API Routes**: 35개+ (API Key 관련 4개 추가)
- **DB 마이그레이션**: 11개 (user_api_keys 추가)
- **DB 테이블**: 18개 (user_api_keys 추가, youtube_api_keys 제거)
- **환경 변수**: 7개 필수 (YouTube OAuth 3개 제거, ENCRYPTION_KEY 추가)
- **NPM 패키지**: 60개+ (@stripe/stripe-js, stripe, video.js 추가)
- **더미 데이터**: 8종류 (총 676줄)

### 코드 품질 지표
- **TypeScript**: Strict mode 활성화, 에러 0개
- **ESLint**: Next.js 권장 설정, 경고/에러 0개
- **Prettier**: 코드 포맷팅 적용
- **빌드 상태**: ✅ 성공
- **번들 사이즈**: First Load JS 205KB (최적화됨)

---

## 🔄 마이그레이션 추적

### 완료된 마이그레이션
- ✅ 프로젝트 구조 재설계
- ✅ shadcn/ui 설치 (24개 컴포넌트)
- ✅ Supabase 설정 복원
- ✅ 인증 시스템 복원
- ✅ 레이아웃 시스템 구현
- ✅ 메인 페이지 UI 완성
- ✅ 수익 인증 시스템 구현
- ✅ 마이페이지 구현
- ✅ 네이버 카페 연동
- ✅ YouTube Lens 도구 구현
- ✅ 강의 시스템 구현 (목록, 상세, 플레이어)
- ✅ 결제 시스템 연동 (Stripe)
- ✅ 관리자 시스템 구현
- ✅ SEO 최적화 (sitemap, robots)
- ✅ YouTube Lens API Key 전환 (OAuth → API Key)

### 진행 중
- 🚧 환경 변수 설정 (Stripe, Cloudflare)
- 🚧 배포 준비 (Vercel)

### 진행 예정
- [ ] 커뮤니티 기능
- [ ] 알림 시스템
- [ ] 실시간 채팅
- [ ] 이메일 인증

---

## 📌 주의사항

### ❌ 금지 사항
1. styled-components 사용
2. any 타입 사용
3. inline styles 남용
4. 환경 변수 하드코딩

### ✅ 권장 사항
1. shadcn/ui 컴포넌트 우선 사용
2. Server Components 기본 사용
3. TypeScript strict mode 준수
4. Tailwind 유틸리티 클래스 사용

---

*이 문서는 코드베이스 변경 시 지속적으로 업데이트됩니다.*