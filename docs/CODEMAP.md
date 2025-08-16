# 📊 디하클(Dhacle) 프로젝트 코드맵

*목적: 현재 프로젝트의 파일/폴더 구조와 기술 스택*
*업데이트: 새 파일/폴더 추가 또는 구조 변경 시*

> **관련 문서**:
> - AI 작업 지침: `/CLAUDE.md`
> - 프로젝트 현황: `/docs/PROJECT.md`

---

## 🚀 빠른 시작 (최상단 필수)

### 자주 사용하는 명령어
```bash
npm run dev                     # 개발 서버 시작 (localhost:3000)
npm run build                   # 빌드 테스트
npx tsc --noEmit               # TypeScript 체크
npm run lint                    # ESLint 검사
npm run supabase:db:push       # DB 마이그레이션 적용
npm run supabase:migration:new # 새 마이그레이션 생성
```

### 🔥 자주 수정하는 파일 Top 10
1. `src/app/page.tsx` - 메인 페이지
2. `src/app/auth/callback/route.ts` - 인증 콜백
3. `src/lib/supabase/browser-client.ts` - Supabase 클라이언트
4. `src/components/layout/Header.tsx` - 헤더 컴포넌트
5. `src/app/(pages)/courses/page.tsx` - 강의 목록
6. `src/app/(pages)/youtube-lens/page.tsx` - YouTube Lens
7. `src/app/(pages)/mypage/page.tsx` - 마이페이지
8. `src/lib/types/database.types.ts` - DB 타입 정의
9. `src/app/globals.css` - 전역 스타일
10. `.env.local` - 환경 변수

---

## 📁 프로젝트 구조

```
9.Dhacle/
├── src/
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
│   ├── components/
│   │   ├── ui/                    # shadcn/ui (24개 컴포넌트)
│   │   ├── layout/                # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx         # 헤더 (스크롤 동적)
│   │   │   ├── Sidebar.tsx        # 사이드바 (인프런 스타일)
│   │   │   ├── Footer.tsx         # 푸터
│   │   │   ├── TopBanner.tsx      # 상단 배너
│   │   │   └── MobileNav.tsx      # 모바일 네비게이션
│   │   └── features/              # 기능별 컴포넌트
│   │       ├── HeroCarousel.tsx   # 메인 캐러셀
│   │       ├── RevenueGallery.tsx # 수익 갤러리
│   │       ├── CourseGrid.tsx     # 강의 그리드
│   │       └── VideoPlayer.tsx    # 비디오 플레이어
│   └── lib/
│       ├── supabase/              # Supabase 설정
│       │   ├── browser-client.ts  # 브라우저 클라이언트
│       │   └── server-client.ts   # 서버 클라이언트
│       ├── types/                 # 타입 정의
│       │   ├── database.types.ts  # DB 타입 (자동 생성)
│       │   └── revenue-proof.ts   # 수익 인증 타입
│       ├── api-keys/              # API Key 관리 ✅
│       │   ├── crypto.ts          # AES-256 암호화
│       │   └── index.ts           # Key 관리 함수
│       ├── youtube/               # YouTube 통합
│       ├── tosspayments/          # TossPayments ✅
│       │   └── client.ts          # 결제 클라이언트
│       └── utils.ts               # 유틸리티
├── supabase/
│   ├── migrations/                # DB 마이그레이션 (12개)
│   │   ├── 20250109000001_initial_schema.sql
│   │   └── ...
│   └── config.toml                # Supabase 설정
├── public/                        # 정적 파일
│   ├── images/                    # 이미지
│   └── icons/                     # 아이콘
├── docs/                          # 프로젝트 문서
└── package.json                   # 의존성 관리
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
  - State Management: Zustand 5.0.2
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
  - Linter: ESLint + Prettier
  - Type Checking: TypeScript (strict)
  - CLI: Supabase CLI
  
Build & Deploy:
  - Build: Next.js build system
  - Deploy: Vercel-ready
  - Node: 18+
```

---

## 📊 DB 테이블 구조

### 인증 & 사용자
- `users` - 사용자 프로필 (이름, 이메일, 카페 인증)
- `user_api_keys` - API Key 관리 (암호화 저장)

### 강의 시스템
- `courses` - 강의 정보 (제목, 가격, 강사)
- `lessons` - 강의 레슨 (비디오, 자료)
- `enrollments` - 수강 신청
- `progress` - 학습 진도
- `course_reviews` - 강의 리뷰

### YouTube Lens
- `youtube_favorites` - 즐겨찾기 동영상
- `youtube_history` - 검색 기록
- `youtube_usage` - API 사용량 추적

### 수익 인증
- `revenue_proofs` - 수익 인증 게시글
- `revenue_comments` - 댓글
- `revenue_likes` - 좋아요

### 커뮤니티
- `community_posts` - 게시글
- `community_comments` - 댓글
- `community_likes` - 좋아요

### 결제
- `payments` - 결제 내역 (TossPayments)
- `coupons` - 쿠폰 시스템

---

## 🔗 API 엔드포인트

### 사용자 관리
- `GET /api/user/profile` - 프로필 조회
- `PUT /api/user/profile` - 프로필 수정
- `POST /api/user/cafe-verify` - 네이버 카페 인증
- `GET/POST/DELETE /api/user/api-keys` - API Key CRUD

### YouTube API
- `GET /api/youtube/search` - 동영상 검색
- `POST /api/youtube/favorites` - 즐겨찾기 추가
- `GET /api/youtube/history` - 검색 기록 조회
- `GET /api/youtube/validate-key` - API Key 검증

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

### shadcn/ui 컴포넌트 (24개)
Alert, AlertDialog, Badge, Button, Card, Checkbox, Dialog, DropdownMenu, Form, Input, Label, Progress, RadioGroup, ScrollArea, Select, Separator, Sheet, Skeleton, Switch, Tabs, Textarea, Toast, Tooltip

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

*이 문서는 프로젝트 구조도입니다. 현재 상태는 `/docs/PROJECT.md` 참조*