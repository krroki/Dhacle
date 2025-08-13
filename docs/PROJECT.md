# 📍 디하클(Dhacle) 프로젝트 현황

*최종 업데이트: 2025-01-14 오후*

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
- **현재 상태**: 완전 재구축 진행 중 (styled-components → shadcn/ui)
- **백업 위치**: `../dhacle-backup/` (기존 코드 모두 보존)

## 🚨 현재 재구축 상황 (2025-01-14)

### 🔄 마이그레이션 진행 상황

#### Phase 1: 프로젝트 초기화 ✅ 완료
- ✅ 기존 프로젝트 백업 (45개+ 핵심 파일)
- ✅ 새 프로젝트 구조 생성 (src 기반)
- ✅ 필수 패키지 설치 (Next.js 15.4.6, React 19.1.1)
- ✅ shadcn/ui 설치 (15개 컴포넌트)

#### Phase 2: 핵심 기능 복원 ✅ 완료
- ✅ Supabase 설정 복원 (7개 마이그레이션 파일)
- ✅ Kakao OAuth 인증 로직 복원
- ✅ API Routes 복원 (`/api/user/*`)
- ✅ 타입 정의 복원 (`database.types.ts`)

#### Phase 3: UI 재구축 ✅ 완료
- ✅ Root Layout 설정 (layout.tsx 구현)
- ✅ 네비게이션 헤더 구현 (Header.tsx)
- ✅ 레이아웃 컴포넌트 전체 구현 (8개)
  - TopBanner (그라데이션 배경)
  - Header (스크롤 동적 높이)
  - Sidebar (인프런 스타일)
  - Footer (전체 섹션)
  - MobileNav (하단 고정)
  - ScrollToTop, ProgressBar, NotificationDropdown

#### Phase 4: 메인 페이지 구현 ✅ 완료 (2025-01-14)
- ✅ **메인 페이지 구현** (page.tsx)
- ✅ **8개 섹션 완성**
  - HeroCarousel (자동재생, YouTube 최적화)
  - InstructorCategories (12명 강사)
  - RevenueGallery (무한 스크롤 애니메이션)
  - FreeCoursesCarousel (무료 강의 8개)
  - FreeCoursesSchedule (캘린더 그리드)
  - NewCoursesCarousel (신규 강의 4개)
  - EbookSection (무료/유료 탭)
  - FAQSection (아코디언)
- ✅ **성능 최적화**
  - Suspense & 스켈레톤 UI (7종)
  - YouTube 썸네일 최적화
  - 이미지 최적화 (Next/Image)
- ✅ **더미 데이터 구현** (676줄, 8종류)
- ✅ **반응형 디자인** (모바일/태블릿/데스크톱)

#### Phase 5: 페이지 구현 🚧 다음 단계
- [ ] 강의 목록 페이지
- [ ] 강의 상세 페이지
- [ ] 커뮤니티 페이지
- [ ] 사용자 대시보드
- [ ] 프로필 설정 페이지

### 📊 기존 문제점 분석 (재구축 이유)
- **스타일링 혼재**: styled-components + Tailwind + inline styles (955개 className)
- **타입 안정성**: any 타입 남용, TypeScript 에러 다수
- **코드 일관성**: 컴포넌트 구조 불일치, 디자인 시스템 미통합
- **성능 이슈**: 번들 크기 과다, 불필요한 re-render

### 🎯 재구축 목표
1. **통일된 UI 시스템**: shadcn/ui 기반 일관된 컴포넌트
2. **타입 안정성**: TypeScript strict mode, any 타입 제거
3. **성능 최적화**: 번들 크기 감소, SSR/SSG 활용
4. **유지보수성**: 명확한 폴더 구조, 재사용 가능한 컴포넌트

### ⚠️ 알려진 이슈 (2025-01-14 오후 업데이트)

#### 🔴 보안 취약점 (우선 해결 필요)
- **문제**: `src/app/auth/callback/route.ts`에 Supabase 자격 증명 하드코딩
- **위치**: 라인 29-35
- **영향**: 프로덕션 배포 시 보안 위험
- **해결 방안**: 환경 변수로 완전 이관 필요, fallback 로직 제거

#### 🟡 구조적 이슈
1. **미구현 기능 (TODO 주석 추가됨)**
   - 검색 기능: Header.tsx에 TODO 추가
   - 알림 시스템: NotificationDropdown.tsx에 TODO 추가
   - 뉴스레터: Footer.tsx에 TODO 추가

2. **Supabase 클라이언트 구현 불완전**
   - **파일**: `src/lib/supabase/browser-client.ts`
   - **문제**: Mock 클라이언트 반환 로직, 불완전한 구현 (50라인에서 중단)
   - **해결 방안**: 환경 변수 설정 후 전체 구현 필요

3. **빈 디렉토리 구조**
   - `src/app/(pages)/` - 페이지 그룹 (courses, community, tools 포함)
   - `src/app/auth/login/` - 로그인 페이지 구현 예정
   - `src/app/auth/signup/` - 회원가입 페이지 구현 예정
   - **참고**: Phase 5에서 구현 예정

#### ✅ 해결된 이슈
- **폴더 구조**: `src/app/main` → `src/app/(pages)` 변경 완료 (2025-01-13)
- **미들웨어 에러 처리**: NextResponse.redirect 사용으로 수정 완료 (2025-01-13)
- **타입 정의**: database.types.ts re-export 패턴 유지 (호환성 보장)
- **UI 컴포넌트**: Card 컴포넌트 시맨틱 HTML 개선 (h3, p 태그 사용)
- **ESLint 설정**: eslint-config-prettier 설치 완료 (2025-01-14)
- **레이아웃 시스템**: 전체 레이아웃 구현 완료 (2025-01-14)
- **미사용 import**: 모든 경고 제거 완료 (2025-01-14)
- **InstructorCategories onClick 에러**: 수정 완료 (2025-01-14)
- **HeroCarousel import 순서**: 정리 완료 (2025-01-14)
- **TypeScript 빌드 에러**: 모두 해결 (2025-01-14)

---

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15.4.6 (App Router)
- **UI Library**: shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict mode)
- **State**: Zustand 5.0.7 (설치됨)
- **Form**: React Hook Form + Zod (설치됨)
- **Animation**: Framer Motion 12.23.12
- **Theme**: next-themes 0.4.6
- **Progress**: nprogress 0.2.0
- **Observer**: react-intersection-observer 9.16.0

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
│   ├── layout.tsx         # Root Layout (작업 예정)
│   ├── page.tsx          # 메인 페이지 (작업 예정)
│   ├── globals.css       # 전역 스타일
│   ├── (pages)/          # 페이지 그룹 (main에서 변경됨)
│   │   ├── courses/      # 강의 페이지
│   │   ├── community/    # 커뮤니티
│   │   └── tools/        # 도구
│   ├── api/              # API Routes
│   │   └── user/         # 사용자 API
│   └── auth/             # 인증 관련
│       ├── callback/     # OAuth callback
│       ├── error/        # 인증 에러
│       ├── login/        # 로그인 (구현 예정)
│       └── signup/       # 회원가입 (구현 예정)
├── components/            
│   ├── ui/               # shadcn/ui 컴포넌트 (14개)
│   ├── layout/           # Header, Footer 등
│   └── features/         # 기능별 컴포넌트
├── lib/
│   ├── supabase/         # Supabase 클라이언트
│   │   ├── browser-client.ts
│   │   ├── server-client.ts
│   │   └── migrations/   # SQL 마이그레이션 (7개)
│   ├── auth/             # 인증 관련
│   └── utils.ts          # 유틸리티 함수
├── types/                # TypeScript 타입 정의
│   ├── database.ts
│   └── database.types.ts
└── hooks/                # Custom React Hooks
```

---

## 📋 Supabase 테이블 현황

### 8개 기본 테이블
- ✅ **users** - 사용자 인증 정보 (Supabase Auth 기본)
- ✅ **profiles** - 사용자 프로필 정보
- ✅ **courses** - 강의 정보
- ✅ **course_enrollments** - 강의 수강 정보
- ✅ **course_progress** - 강의 진행률
- ✅ **revenues** - 수익 인증 정보
- ✅ **badges** - 뱃지 시스템
- ✅ **community_links** - 커뮤니티 링크

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
2. **any 타입 사용 금지**: ESLint 에러 발생
3. **하드코딩 금지**: 환경 변수, 상수 활용
4. **중복 파일 금지**: 하나의 정식 버전만 유지

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
- [ ] **XSS 방지**: React 자동 처리 확인
- [ ] **SQL Injection 방지**: Supabase RLS 설정
- [ ] **CSRF 보호**: Next.js 자동 처리
- [ ] **민감 정보 노출 방지**: 환경 변수 사용
- [ ] **Rate Limiting**: API 엔드포인트 보호
- [ ] **입력값 검증**: Zod 스키마 적용
- [ ] **인증/인가**: Supabase Auth + RLS

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
- ✅ `/api/user/profile` - 프로필 관리
- ✅ `/api/user/check-username` - 사용자명 중복 체크

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

---

*이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.*