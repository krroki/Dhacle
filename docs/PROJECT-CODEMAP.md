# 📊 디하클(Dhacle) 프로젝트 코드맵

*최종 업데이트: 2025-01-13 (수익 인증 & 마이페이지 구현)*

## 🎯 프로젝트 개요

- **프로젝트명**: 디하클 (Dhacle)
- **목적**: YouTube Shorts 크리에이터를 위한 교육 및 커뮤니티 플랫폼
- **위치**: `C:\My_Claude_Project\9.Dhacle`
- **현재 상태**: Phase 5 수익 인증 시스템 & 마이페이지 구현 🚧
- **백업 위치**: `C:\My_Claude_Project\dhacle-backup`

---

## 🆕 최근 업데이트 (2025-01-13)

### Phase 5: 수익 인증 시스템 & 마이페이지 구현 🚧
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
  - Component Library: shadcn/ui (Radix UI 기반)
  - CSS Framework: Tailwind CSS 3.4.1
  - CSS Processing: PostCSS
  - Animations: Tailwind Animate 1.0.7
  - Utilities: clsx 2.1.1, tailwind-merge 2.2.0
  
State & Forms:
  - Form Management: React Hook Form 7.x (설치됨)
  - Validation: Zod 3.x + @hookform/resolvers (설치됨)
  - State Management: Zustand 5.0.7 (설치됨)
  - Utilities: class-variance-authority 0.7.1

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
│   │
│   ├── (pages)/              # 페이지 그룹
│   │   ├── courses/          # 강의 관련 페이지
│   │   ├── community/        # 커뮤니티 페이지
│   │   ├── revenue-proof/    # 수익 인증 페이지 ✅ NEW
│   │   │   ├── [id]/page.tsx  # 상세 페이지
│   │   │   ├── create/page.tsx # 생성 페이지
│   │   │   ├── ranking/page.tsx # 랭킹 페이지
│   │   │   └── page.tsx       # 목록 페이지
│   │   └── tools/           # 도구 페이지
│   │
│   ├── mypage/              # 마이페이지 ✅ NEW
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
│   │   │   └── naver-cafe/      # 네이버 카페 ✅ NEW
│   │   ├── revenue-proof/  # 수익 인증 API ✅ NEW
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts      # CRUD
│   │   │   │   ├── like/route.ts # 좋아요
│   │   │   │   ├── comment/route.ts # 댓글
│   │   │   │   └── report/route.ts # 신고
│   │   │   ├── my/route.ts      # 내 수익 인증
│   │   │   ├── ranking/route.ts # 랭킹
│   │   │   └── route.ts         # 목록
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
│   ├── ui/                  # shadcn/ui 컴포넌트 (22개) ✅ 확장
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
│   │   └── tiptap-editor.tsx # 리치 텍스트 에디터 ✅ NEW
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
│       └── revenue-proof/  # 수익 인증 컴포넌트 ✅ NEW
│           ├── RevenueProofCard.tsx
│           ├── RevenueProofDetail.tsx
│           ├── RankingDashboard.tsx
│           ├── LiveRankingSidebar.tsx
│           └── FilterBar.tsx
│
├── lib/                     # 라이브러리 및 유틸리티
│   ├── supabase/           # Supabase 설정
│   │   ├── browser-client.ts  # 브라우저 클라이언트
│   │   ├── server-client.ts   # 서버 클라이언트
│   │   ├── client.ts          # 공통 클라이언트
│   │   └── migrations/        # DB 마이그레이션 (9개) ✅ 추가
│   │       ├── ALL_MIGRATIONS_COMBINED.sql
│   │       ├── 001_initial_schema.sql
│   │       ├── 002_initial_triggers.sql
│   │       ├── 003_revenue_proofs.sql
│   │       ├── 004_community_links.sql
│   │       ├── 005_course_system.sql
│   │       ├── 006_course_detail_enhancement.sql
│   │       ├── 007_revenue_proof_system.sql ✅ NEW
│   │       └── 007_naver_cafe_nickname.sql ✅ NEW
│   │
│   ├── auth/               # 인증 관련 ✅ 구현 완료
│   │   ├── AuthProvider.tsx  # 인증 프로바이더 (Legacy)
│   │   └── AuthContext.tsx   # 인증 컨텍스트 (현재 사용)
│   │
│   ├── layout/             # 레이아웃 관련 ✅ 구현 완료
│   │   └── LayoutContext.tsx # 레이아웃 컨텍스트 프로바이더
│   │
│   ├── api/               # API 유틸리티 ✅ NEW
│   ├── validations/       # 유효성 검사 ✅ NEW
│   └── utils/             # 유틸리티 함수 ✅ 확장
│
├── store/                   # Zustand 상태 관리 ✅ 구현 완료
│   └── layout.ts           # 레이아웃 전역 상태 (배너, 사이드바, 헤더 등)
│
├── types/                   # TypeScript 타입 정의
│   ├── database.ts         # 데이터베이스 타입
│   ├── database.types.ts   # Supabase 생성 타입
│   └── revenue-proof.ts    # 수익 인증 타입 ✅ NEW
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
├── package.json            # 프로젝트 의존성
├── middleware.ts           # Next.js 미들웨어
├── README.md              # 프로젝트 README
├── CLAUDE.md              # Claude AI 가이드
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
- **수익 인증 시스템**: 완전한 CRUD, 랭킹, 상호작용 기능
- **마이페이지**: 프로필, 강의, 뱃지, 설정 관리
- **네이버 카페 연동**: 닉네임 인증 및 랜덤 닉네임 생성
- **파일 업로드**: 이미지 업로드 API

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

### 현재 상태 (2025-01-13 업데이트)
- **총 파일 수**: ~150개+ (수익 인증 & 마이페이지 추가)
- **shadcn/ui 컴포넌트**: 22개 설치됨 (7개 추가)
- **레이아웃 컴포넌트**: 8개 완성
- **메인 페이지 컴포넌트**: 21개 구현 (8개 섹션 + 공유 컴포넌트)
- **수익 인증 컴포넌트**: 5개 구현
- **마이페이지**: 5개 페이지 구현
- **Provider 시스템**: 3개 (Theme, Auth, Layout)
- **상태 관리**: Zustand store 구현 완료
- **API Routes**: 17개 (user 5개, revenue-proof 11개, upload 1개)
- **DB 마이그레이션**: 9개 (2개 추가)
- **DB 테이블**: 13개 (5개 추가)
- **환경 변수**: 3개 필수
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
- ✅ shadcn/ui 설치
- ✅ Supabase 설정 복원
- ✅ 인증 시스템 복원
- ✅ 레이아웃 시스템 구현
- ✅ 메인 페이지 UI 완성
- ✅ 수익 인증 시스템 구현
- ✅ 마이페이지 구현
- ✅ 네이버 카페 연동

### 진현 중
- 🚧 수익 인증 시스템 테스트 및 완성
- 🚧 마이페이지 기능 테스트

### 진행 예정
- [ ] 강의 시스템 페이지
- [ ] 커뮤니티 기능
- [ ] 결제 시스템 연동

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