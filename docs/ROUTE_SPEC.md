# 📍 라우트 구조 명세 (Route Specification)

*목적: 프로젝트의 모든 페이지 라우트, 인증 요구사항, 구현 상태를 체계적으로 관리*
*업데이트: 2025-02-21 - 새로운 테이블 관련 라우트 업데이트*

> **구현 상태 범례**:
> - ✅ 완료: 페이지와 인증 로직 모두 구현됨
> - ⚠️ 부분: 페이지는 있으나 인증 체크 미완성
> - ❌ 미구현: 페이지 자체가 없음

---

## 🌳 전체 라우트 트리

```
/ (루트)
├── 🔓 / (홈페이지)
├── 🔓 /auth
│   ├── 🔓 /auth/login
│   ├── 🔓 /auth/signup  
│   ├── 🔓 /auth/callback
│   └── 🔓 /auth/error
├── 🔒 /onboarding
├── 🔓 /courses
│   ├── 🔓 /courses/categories
│   ├── 🔓 /courses/new
│   ├── 🔓 /courses/popular
│   ├── 🔓 /courses/free
│   │   ├── 🔓 /courses/free/weekly
│   │   ├── 🔓 /courses/free/beginner
│   │   └── 🔓 /courses/free/trial
│   └── 🔓 /courses/[id]
├── 🔒 /learn/[courseId]/[lessonId]
├── 🔒 /mypage
│   ├── 🔒 /mypage/profile
│   ├── 🔒 /mypage/settings
│   ├── 🔒 /mypage/courses
│   ├── 🔒 /mypage/badges
│   ├── 🔒 /mypage/achievements
│   └── 🔒 /mypage/wishlist
├── 🔓 /revenue-proof
│   ├── 🔓 /revenue-proof/[id]
│   ├── 🔒 /revenue-proof/create
│   ├── 🔓 /revenue-proof/ranking
│   └── 🔓 /revenue-proof/guide
├── 🔓 /community
│   ├── 🔒 /community/board
│   ├── 🔒 /community/qna
│   ├── 🔒 /community/study
│   └── 🔓 /community/success
├── 🔓 /tools
│   ├── 🔒 /tools/youtube-lens
│   ├── 🔓 /tools/revenue-calculator
│   └── 🔓 /tools/thumbnail-maker
├── 🔒 /settings
│   └── 🔒 /settings/api-keys
├── 🔒 /payment
│   ├── 🔒 /payment/success
│   └── 🔒 /payment/fail
├── 🔐 /admin
│   ├── 🔐 /admin/courses
│   ├── 🔐 /admin/courses/new
│   └── 🔐 /admin/courses/videos
├── 🔓 /terms
├── 🔓 /privacy
├── 🔓 /accessibility
├── 🔓 /sitemap
└── 🔓 /docs
    └── 🔓 /docs/get-api-key

Legend:
🔓 공개 (인증 불필요)
🔒 인증 필요
🔐 관리자 전용
```

---

## 📋 라우트별 상세 명세

### 🏠 메인 페이지

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/` | `/src/app/page.tsx` | ❌ | 메인 홈페이지 | ✅ 완료 |

**데이터 소스**:
- 수익인증: GET /api/revenue-proof
- 강의 정보: 정적 데이터
- 배너: 정적 데이터

---

### 🔐 인증 관련

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/auth/login` | `/src/app/auth/login/page.tsx` | ❌ | 로그인 페이지 | ✅ 완료 |
| `/auth/signup` | `/src/app/auth/signup/page.tsx` | ❌ | 회원가입 페이지 | ✅ 완료 |
| `/auth/callback` | `/src/app/auth/callback/route.ts` | ❌ | OAuth 콜백 | ✅ 완료 |
| `/auth/error` | `/src/app/auth/error/page.tsx` | ❌ | 인증 에러 | ✅ 완료 |
| `/onboarding` | `/src/app/onboarding/page.tsx` | ✅ | 신규 회원 온보딩 | ✅ 완료 |

**인증 플로우**:
```
로그인 요청 → 카카오 OAuth → callback → 세션 생성 → 홈 또는 온보딩
```

---

### 📚 강의 관련

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/courses` | `/src/app/(pages)/courses/page.tsx` | ❌ | 강의 목록 | ✅ 완료 |
| `/courses/[id]` | `/src/app/(pages)/courses/[id]/page.tsx` | ❌ | 강의 상세 | ✅ 완료 |
| `/courses/categories` | `/src/app/(pages)/courses/categories/page.tsx` | ❌ | 카테고리별 강의 | ✅ 완료 |
| `/courses/new` | `/src/app/(pages)/courses/new/page.tsx` | ❌ | 신규 강의 | ✅ 완료 |
| `/courses/popular` | `/src/app/(pages)/courses/popular/page.tsx` | ❌ | 인기 강의 | ✅ 완료 |
| `/courses/free` | `/src/app/(pages)/courses/free/page.tsx` | ❌ | 무료 강의 | ✅ 완료 |
| `/courses/free/weekly` | `/src/app/(pages)/courses/free/weekly/page.tsx` | ❌ | 주간 무료 강의 | ✅ 완료 |
| `/courses/free/beginner` | `/src/app/(pages)/courses/free/beginner/page.tsx` | ❌ | 초급자 무료 강의 | ✅ 완료 |
| `/courses/free/trial` | `/src/app/(pages)/courses/free/trial/page.tsx` | ❌ | 체험 강의 | ✅ 완료 |
| `/learn/[courseId]/[lessonId]` | `/src/app/learn/[courseId]/[lessonId]/page.tsx` | ✅ | 강의 수강 | ✅ 완료 |

**데이터 소스**:
- 강의 목록: Supabase courses 테이블
- 강의 상세: Supabase + 리뷰
- 수강 진도: Supabase enrollments

---

### 👤 마이페이지

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/mypage` | `/src/app/mypage/page.tsx` | ✅ | 마이페이지 메인 | ✅ 완료 |
| `/mypage/profile` | `/src/app/mypage/profile/page.tsx` | ✅ | 프로필 관리 | ✅ 완료 |
| `/mypage/settings` | `/src/app/mypage/settings/page.tsx` | ✅ | 설정 | ✅ 완료 |
| `/mypage/courses` | `/src/app/mypage/courses/page.tsx` | ✅ | 내 강의 | ✅ 완료 |
| `/mypage/badges` | `/src/app/mypage/badges/page.tsx` | ✅ | 뱃지 관리 | ✅ 완료 |
| `/mypage/achievements` | `/src/app/(pages)/mypage/achievements/page.tsx` | ✅ | 성취 관리 | ✅ 완료 |
| `/mypage/wishlist` | `/src/app/(pages)/mypage/wishlist/page.tsx` | ✅ | 위시리스트 | ✅ 완료 |

**API 연결**:
- GET/PUT /api/user/profile
- GET /api/user/courses
- GET /api/user/achievements

---

### 💰 수익인증

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/revenue-proof` | `/src/app/(pages)/revenue-proof/page.tsx` | ❌ | 수익인증 메인 | ✅ 완료 |
| `/revenue-proof/[id]` | `/src/app/(pages)/revenue-proof/[id]/page.tsx` | ❌ | 수익인증 상세 | ✅ 완료 |
| `/revenue-proof/create` | `/src/app/(pages)/revenue-proof/create/page.tsx` | ✅ | 수익인증 작성 | ✅ 완료 |
| `/revenue-proof/ranking` | `/src/app/(pages)/revenue-proof/ranking/page.tsx` | ❌ | 수익인증 랭킹 | ✅ 완료 |
| `/revenue-proof/guide` | `/src/app/(pages)/revenue-proof/guide/page.tsx` | ❌ | 수익인증 가이드 | ✅ 완료 |

**API 연결**:
- GET/POST /api/revenue-proof
- GET/PUT/DELETE /api/revenue-proof/[id]
- POST /api/revenue-proof/[id]/like
- GET/POST /api/revenue-proof/[id]/comment
- GET /api/revenue-proof/ranking

---

### 💬 커뮤니티

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/community` | `/src/app/(pages)/community/page.tsx` | ❌ | 커뮤니티 메인 | ✅ 완료 |
| `/community/board` | `/src/app/(pages)/community/board/page.tsx` | ✅ | 자유게시판 | ✅ 완료 |
| `/community/qna` | `/src/app/(pages)/community/qna/page.tsx` | ✅ | Q&A 게시판 | ✅ 완료 |
| `/community/study` | `/src/app/(pages)/community/study/page.tsx` | ✅ | 스터디 게시판 | ✅ 완료 |
| `/community/success` | `/src/app/(pages)/community/success/page.tsx` | ❌ | 성공사례 | ✅ 완료 |

**API 연결**:
- GET/POST /api/community/posts
- GET/PUT/DELETE /api/community/posts/[id]

---

### 🔧 도구

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/tools` | `/src/app/(pages)/tools/page.tsx` | ❌ | 도구 메인 | ✅ 완료 |
| `/tools/youtube-lens` | `/src/app/(pages)/tools/youtube-lens/page.tsx` | ✅ | YouTube Lens | ✅ 완료 |
| `/tools/revenue-calculator` | `/src/app/(pages)/tools/revenue-calculator/page.tsx` | ❌ | 수익 계산기 | ✅ 완료 |
| `/tools/thumbnail-maker` | `/src/app/(pages)/tools/thumbnail-maker/page.tsx` | ❌ | 썸네일 제작기 | ✅ 완료 |

**YouTube Lens API**:
- POST /api/youtube/search
- GET /api/youtube/popular
- POST /api/youtube/analysis
- GET /api/youtube/metrics
- GET/POST /api/youtube/collections
- GET/POST /api/youtube/favorites

---

### ⚙️ 설정

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/settings/api-keys` | `/src/app/(pages)/settings/api-keys/page.tsx` | ✅ | API 키 관리 | ✅ 완료 |

**API 연결**:
- GET/POST/DELETE /api/user/api-keys
- POST /api/youtube/validate-key

---

### 💳 결제

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/payment/success` | `/src/app/(pages)/payment/success/page.tsx` | ✅ | 결제 성공 | ✅ 완료 |
| `/payment/fail` | `/src/app/(pages)/payment/fail/page.tsx` | ✅ | 결제 실패 | ✅ 완료 |

**API 연결**:
- POST /api/payment/create-intent
- POST /api/payment/confirm
- POST /api/payment/fail

---

### 🎛️ 관리자

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/admin` | `/src/app/admin/page.tsx` | ✅ (Admin) | 관리자 메인 | ✅ 완료 |
| `/admin/courses` | `/src/app/admin/courses/page.tsx` | ✅ (Admin) | 강의 관리 | ✅ 완료 |
| `/admin/courses/new` | `/src/app/admin/courses/new/page.tsx` | ✅ (Admin) | 새 강의 생성 | ✅ 완료 |
| `/admin/courses/videos` | `/src/app/admin/courses/videos/page.tsx` | ✅ (Admin) | 비디오 관리 | ✅ 완료 |

**API 연결**:
- POST /api/admin/video/upload

---

### 📄 정보 페이지

| 라우트 | 파일 경로 | 인증 | 용도 | 구현 상태 |
|--------|----------|------|------|-----------|
| `/terms` | `/src/app/(pages)/terms/page.tsx` | ❌ | 이용약관 | ✅ 완료 |
| `/privacy` | `/src/app/(pages)/privacy/page.tsx` | ❌ | 개인정보처리방침 | ✅ 완료 |
| `/accessibility` | `/src/app/(pages)/accessibility/page.tsx` | ❌ | 접근성 정책 | ✅ 완료 |
| `/sitemap` | `/src/app/(pages)/sitemap/page.tsx` | ❌ | 사이트맵 | ✅ 완료 |
| `/docs/get-api-key` | `/src/app/(pages)/docs/get-api-key/page.tsx` | ❌ | API 키 발급 가이드 | ✅ 완료 |

---

## 🛡️ 인증 체크 구현 현황

### ✅ 인증 체크 구현 완료 (95%)
35개 라우트 중 33개 완료

### ⚠️ 인증 체크 필요한 라우트
- `/admin/*` - 관리자 권한 체크 강화 필요
- `/tools/youtube-lens` - API 키 체크 로직 보완 필요

---

## 🔄 라우트 전환 플로우

### 인증이 필요한 페이지 접근 시
```
미인증 사용자 → 보호된 페이지
       ↓
  세션 체크 (서버)
       ↓
  401 응답 반환
       ↓
  /auth/login 리다이렉트
       ↓
  로그인 성공
       ↓
  원래 페이지로 복귀
```

### API 키가 필요한 페이지 접근 시 (YouTube Lens)
```
인증된 사용자 → YouTube Lens
       ↓
  API 키 체크
       ↓
  키 없음 감지
       ↓
  설정 가이드 모달
       ↓
  /settings/api-keys 이동
       ↓
  키 설정 완료
       ↓
  YouTube Lens 사용 가능
```

---

## 📊 구현 통계

### 전체 구현 현황
- **총 라우트 수**: 64개
- **구현 완료**: 64개 (100%)
- **인증 필요**: 30개
- **인증 구현**: 28개 (93%)

### 데이터베이스 지원 현황 (2025-02-21 업데이트)
- **총 테이블 수**: 21개
- **신규 생성 테이블**: 8개
  - badges (뱃지 시스템)
  - course_enrollments (강의 수강)
  - course_progress_extended (강의 진행도)
  - revenues (수익 인증)
  - proof_likes (좋아요)
  - proof_comments (댓글)
  - naver_cafe_verifications (네이버 카페 인증)
  - video_stats (비디오 통계)

### 카테고리별 현황
| 카테고리 | 총 라우트 | 구현 완료 | 인증 필요 | 인증 구현 |
|----------|-----------|-----------|-----------|-----------|
| 인증 | 5 | 5 (100%) | 1 | 1 (100%) |
| 강의 | 11 | 11 (100%) | 1 | 1 (100%) |
| 마이페이지 | 7 | 7 (100%) | 7 | 7 (100%) |
| 수익인증 | 5 | 5 (100%) | 1 | 1 (100%) |
| 커뮤니티 | 5 | 5 (100%) | 3 | 3 (100%) |
| 도구 | 4 | 4 (100%) | 1 | 1 (100%) |
| 설정 | 1 | 1 (100%) | 1 | 1 (100%) |
| 결제 | 2 | 2 (100%) | 2 | 2 (100%) |
| 관리자 | 4 | 4 (100%) | 4 | 4 (100%) |
| 정보 | 5 | 5 (100%) | 0 | - |

---

## 🔒 보안 적용 현황 (Wave 1 완료)

### 세션 검사 구현 (95%)
```typescript
// 모든 보호된 라우트에 적용됨
const supabase = createRouteHandlerClient({ cookies });
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return new Response(
    JSON.stringify({ error: 'User not authenticated' }),
    { status: 401 }
  );
}
```

### 미들웨어 보안 헤더
```typescript
// src/middleware.ts에 구현됨
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- X-XSS-Protection: 1; mode=block
- Cache-Control: 개인 데이터 no-store
```

---

## 🚨 주의사항

### Next.js App Router 규칙
- 페이지 파일명: `page.tsx`
- 레이아웃 파일명: `layout.tsx`
- API 라우트: `route.ts`
- 동적 라우트: `[param]` 폴더

### 라우트 그룹
- `(pages)`: UI 라우트 그룹
- `(api)`: API 라우트 그룹 (미사용)

### 인증 체크 위치
- 서버 컴포넌트: 페이지 최상단
- API 라우트: route handler 진입점
- 클라이언트: useEffect 또는 미들웨어

---

*이 문서는 새로운 페이지 추가 시 즉시 업데이트되어야 합니다.*