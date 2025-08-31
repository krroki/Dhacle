# 프로젝트 구조 레퍼런스

## 📌 문서 관리 지침
**목적**: 프로젝트 구조 전체 맵 - 폴더, 파일 위치, 명명 규칙, 의존성 관계 종합 데이터
**대상**: 모든 AI (새로운 파일 생성이나 위치 확인이 필요한 경우)
**범위**: 구조와 위치 정보만 포함 (구현 방법이나 사용법 없음)
**업데이트 기준**: 폴더/파일 구조 변경 시 자동 업데이트
**최대 길이**: 15000 토큰 (현재 약 12000 토큰)
**연관 문서**: [컴포넌트 인벤토리](./component-inventory.md), [API 엔드포인트](./api-endpoints.md)

## ⚠️ 금지사항
- 파일 생성 방법이나 네이밍 가이드 추가 금지 (→ how-to/ 문서로 이관)
- 폴더 구성이나 아키텍처 설계 방법 추가 금지 (→ how-to/ 문서로 이관)
- 구조 설계 철학이나 배경 설명 추가 금지 (→ explanation/ 문서로 이관)

---

*파일 위치, 명명 규칙, 폴더 구조의 완전한 참조 가이드*

---

## 🏗️ 전체 구조 개요

```
📁 디하클 프로젝트 (C:\My_Claude_Project\9.Dhacle)
├── 📁 src/                    # 소스 코드
├── 📁 docs/                   # 문서 (Diátaxis 구조)  
├── 📁 supabase/               # 데이터베이스
├── 📁 scripts/                # 자동화 스크립트
├── 📁 tests/                  # 테스트 파일
├── 📁 public/                 # 정적 자산
├── 📄 package.json            # 의존성 관리
├── 📄 CLAUDE.md              # 프로젝트 총괄 가이드
└── 📄 README.md              # 프로젝트 소개
```

---

## 🔧 /src/ 디렉터리 구조

### 핵심 애플리케이션 구조
```
src/
├── 📁 app/                    # Next.js 15 App Router
│   ├── 📁 (pages)/            # 그룹 라우팅
│   │   ├── 📁 dashboard/      # 대시보드 페이지  
│   │   ├── 📁 profile/        # 프로필 페이지
│   │   └── 📄 CLAUDE.md      # Page Agent 지침
│   ├── 📁 api/               # API Routes
│   │   ├── 📁 auth/          # 인증 관련 API
│   │   ├── 📁 users/         # 사용자 관리 API
│   │   ├── 📁 youtube/       # YouTube 기능 API
│   │   └── 📄 CLAUDE.md      # API Route Agent 지침
│   ├── 📄 globals.css        # 전역 스타일
│   ├── 📄 layout.tsx         # 루트 레이아웃
│   ├── 📄 page.tsx           # 홈페이지  
│   └── 📄 sitemap.ts         # SEO 사이트맵
│
├── 📁 components/            # React 컴포넌트
│   ├── 📁 ui/                # shadcn/ui 컴포넌트 (수정 금지)
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx  
│   │   ├── 📄 input.tsx
│   │   └── ...
│   ├── 📁 features/          # 기능별 컴포넌트
│   │   ├── 📁 auth/          # 인증 관련
│   │   ├── 📁 dashboard/     # 대시보드
│   │   ├── 📁 profile/       # 프로필 관리
│   │   └── 📁 youtube-lens/  # YouTube 기능
│   ├── 📁 layout/            # 레이아웃 컴포넌트
│   │   ├── 📄 Header.tsx
│   │   ├── 📄 Footer.tsx
│   │   └── 📄 Navigation.tsx
│   ├── 📁 common/            # 공통 유틸리티
│   │   ├── 📄 LoadingSpinner.tsx
│   │   ├── 📄 ErrorBoundary.tsx
│   │   └── 📄 EmptyState.tsx
│   └── 📄 CLAUDE.md         # Component Agent 지침
│
├── 📁 hooks/                # React 커스텀 훅
│   ├── 📁 queries/          # React Query 훅
│   │   ├── 📄 useUserQueries.ts
│   │   ├── 📄 useAdminQueries.ts  
│   │   └── 📄 useCacheInvalidation.ts
│   ├── 📄 use-auth.ts       # 인증 관련 훅
│   └── 📄 CLAUDE.md         # Query Agent 지침
│
├── 📁 lib/                  # 라이브러리 및 유틸리티
│   ├── 📁 supabase/         # Supabase 클라이언트
│   │   ├── 📄 client.ts     # 클라이언트용
│   │   ├── 📄 server-client.ts # 서버용
│   │   └── 📄 CLAUDE.md
│   ├── 📁 security/         # 보안 관련
│   │   ├── 📄 validation-schemas.ts
│   │   ├── 📄 sanitizer.ts
│   │   └── 📄 CLAUDE.md     # Security Agent 지침
│   ├── 📁 youtube/          # YouTube API 관련
│   │   ├── 📄 api.ts
│   │   ├── 📄 collections.ts
│   │   ├── 📄 metrics.ts
│   │   └── 📄 monitoring.ts
│   ├── 📄 api-client.ts     # 통합 API 클라이언트
│   ├── 📄 query-keys.ts     # React Query 키
│   ├── 📄 utils.ts          # 공통 유틸리티
│   └── 📄 CLAUDE.md         # Lib Agent 지침
│
├── 📁 types/                # TypeScript 타입 정의
│   ├── 📄 index.ts          # 타입 중앙 집중화
│   ├── 📄 database.generated.ts # Supabase 자동 생성 (수정 금지)
│   └── 📄 CLAUDE.md         # Type Agent 지침
│
├── 📄 middleware.ts         # Next.js 미들웨어
└── 📄 env.ts               # 타입 안전 환경변수
```

---

## 📚 /docs/ 디렉터리 (Diátaxis 구조)

### 문서 체계 구조
```  
docs/
├── 📁 tutorial/             # 학습 중심 (Learning)
│   ├── 📄 01-quick-start.md # 30초 프로젝트 파악
│   ├── 📄 02-first-task.md  # 첫 번째 작업 체험  
│   ├── 📄 03-common-patterns.md # 핵심 패턴 학습
│   └── 📄 README.md         # 튜토리얼 가이드
│
├── 📁 how-to/              # 문제 해결 중심 (Problem-solving)
│   ├── 📁 api-development/
│   │   └── 📄 create-new-route.md
│   ├── 📁 component-development/  
│   │   └── 📄 create-component.md
│   ├── 📁 database-operations/
│   │   └── 📄 create-table.md
│   ├── 📁 testing/
│   │   └── 📄 write-unit-tests.md
│   └── 📄 README.md         # How-to 가이드
│
├── 📁 reference/           # 정보 중심 (Information)
│   ├── 📄 project-status.md # 현재 프로젝트 상태  
│   ├── 📄 verification-commands.md # 검증 명령어
│   ├── 📄 project-structure.md # 이 파일
│   ├── 📄 automation-systems.md # 자동화 현황
│   └── 📄 README.md         # Reference 가이드  
│
├── 📁 explanation/         # 이해 중심 (Understanding)
│   ├── 📄 mistake-patterns.md # 22가지 실수 패턴
│   └── 📄 README.md         # Explanation 가이드
│
└── 📄 CLAUDE.md            # Doc Agent 지침
```

---

## 🗄️ /supabase/ 데이터베이스 구조

### 데이터베이스 관련 파일
```
supabase/
├── 📁 migrations/          # SQL 마이그레이션
│   ├── 📄 20240101000000_initial.sql
│   ├── 📄 20240102000000_add_users.sql
│   └── 📄 CLAUDE.md        # Database Agent 지침
│
├── 📄 config.toml          # Supabase 설정
└── 📄 seed.sql            # 초기 데이터
```

### 주요 테이블 구조 (22개)
```sql
-- 사용자 관리
auth.users              # Supabase 내장 인증 테이블
public.users            # 사용자 확장 정보 (naver_cafe_nickname)
public.profiles         # 사용자 프로필 (VIEW)

-- YouTube 크리에이터 도구
public.yl_channels      # YouTube 채널 정보
public.yl_videos        # YouTube 영상 정보  
public.yl_keyword_trends # 키워드 트렌드 데이터

-- 알림 시스템
public.notifications    # 사용자 알림
```

---

## 📝 /scripts/ 자동화 스크립트

### 스크립트 카테고리별 분류
```
scripts/
├── 📄 supabase-sql-executor.js    # SQL 실행 엔진
├── 📄 verify-with-service-role.js # RLS 정책 검증
├── 📄 context-loader.js           # AI 컨텍스트 생성
├── 📄 daily-tracker.js            # 일일 상태 추적
├── 📄 health-monitor.js           # 시스템 건강도
├── 📄 asset-scanner.js            # 자산 현황 스캔
├── 📄 chart-visualizer.js         # 데이터 시각화
├── 📄 tracking-system.js          # 추적 시스템
└── 📄 CLAUDE.md                   # Script Agent 지침
```

---

## 🧪 /tests/ 테스트 구조

### 테스트 파일 조직
```
tests/
├── 📁 e2e/                # E2E 테스트 (Playwright)
│   ├── 📄 auth.spec.ts     # 인증 플로우
│   ├── 📄 dashboard.spec.ts # 대시보드 기능
│   └── 📄 youtube-lens.spec.ts # YouTube 기능
│
├── 📁 integration/        # 통합 테스트
│   ├── 📄 api-routes.test.ts
│   └── 📄 database.test.ts
│
├── 📁 unit/              # 유닛 테스트 (컴포넌트별)
│   ├── 📁 components/
│   ├── 📁 hooks/  
│   └── 📁 utils/
│
├── 📄 setup.ts           # 테스트 환경 설정
└── 📄 CLAUDE.md          # Test Agent 지침
```

---

## 📁 명명 규칙 (Naming Conventions)

### 파일명 규칙
```bash
# React 컴포넌트 (PascalCase)
UserProfile.tsx
CreateNoteForm.tsx  
YouTubeLensBoard.tsx

# API Routes (kebab-case)
create-new-route.md
user-management.ts

# 유틸리티 함수 (camelCase)
dateFormatter.ts
apiClient.ts
queryKeys.ts

# 상수/설정 파일 (SCREAMING_SNAKE_CASE 또는 kebab-case)
API_ENDPOINTS.ts
tailwind.config.ts
next.config.js

# 테스트 파일
Component.test.tsx      # 유닛 테스트
feature.spec.ts         # E2E 테스트
integration.test.ts     # 통합 테스트
```

### 폴더명 규칙
```bash
# kebab-case (대부분의 폴더)
api-development/
component-development/
database-operations/

# camelCase (React 관련)
components/
hooks/

# lowercase (루트 레벨)
src/
docs/
tests/
public/
```

---

## 🔍 파일 찾기 참조

### 자주 수정하는 파일 Top 15 (우선순위순)

| 순위 | 파일 위치 | 목적 | 중요도 |
|------|-----------|------|--------|
| 1 | `src/types/index.ts` | 중앙 타입 정의 (Single Source of Truth) | ⭐⭐⭐⭐⭐ |
| 2 | `src/lib/api-client.ts` | 클라이언트 API 래퍼 + snake_case 변환 | ⭐⭐⭐⭐⭐ |
| 3 | `src/env.ts` | 환경변수 타입 안전성 설정 | ⭐⭐⭐⭐⭐ |
| 4 | `src/lib/utils/case-converter.ts` | React 보호 변환 유틸리티 | ⭐⭐⭐⭐⭐ |
| 5 | `src/lib/youtube-api-auto-setup.ts` | YouTube API 자동 설정 | ⭐⭐⭐⭐⭐ |
| 6 | `src/app/api/auth/test-login/route.ts` | 개발자 테스트 로그인 | ⭐⭐⭐⭐⭐ |
| 7 | `src/lib/youtube-lens/shorts-detector.ts` | YouTube Shorts 자동 판별 라이브러리 | ⭐⭐⭐⭐ |
| 8 | `src/lib/youtube-lens/keyword-analyzer.ts` | 키워드 트렌드 분석 라이브러리 | ⭐⭐⭐⭐ |
| 9 | `src/lib/youtube-lens/format-number-ko.ts` | 한국어 숫자 포맷터 라이브러리 | ⭐⭐⭐ |
| 10 | `src/components/ErrorBoundary.tsx` | 에러 바운더리 컴포넌트 | ⭐⭐⭐⭐ |
| 11 | `src/app/layout.tsx` | 루트 레이아웃 (ErrorBoundary 적용) | ⭐⭐⭐⭐ |
| 12 | `next.config.ts` | Next.js 설정 (이미지 최적화) | ⭐⭐⭐⭐ |
| 13 | `src/app/auth/callback/route.ts` | 인증 콜백 | ⭐⭐⭐ |
| 14 | `src/app/(pages)/tools/youtube-lens/page.tsx` | YouTube Lens 메인 페이지 | ⭐⭐⭐ |
| 15 | `src/app/api/youtube-lens/keywords/trends/route.ts` | 키워드 트렌드 API | ⭐⭐⭐ |

### 추가 핵심 파일 위치
```bash
# 설정 파일
📄 /package.json              # 의존성 및 스크립트
📄 /tailwind.config.ts        # Tailwind 설정
📄 /tsconfig.json             # TypeScript 설정
📄 /biome.json                # Biome 린터 설정
📄 /playwright.config.ts      # Playwright E2E 테스트 설정

# 자동 생성 파일
📄 /src/types/database.generated.ts # Supabase DB 타입 (자동 생성)
📄 /asset-inventory.json      # 자산 현황 (asset-scanner.js 생성)
📄 /ai-context-warmup.md      # 30초 AI 온보딩 (context-loader.js 생성)

# 핵심 로직
📄 /src/middleware.ts         # Next.js 미들웨어
📄 /src/lib/utils.ts          # 공통 유틸리티
📄 /src/lib/supabase/server-client.ts # 서버용 Supabase 클라이언트

# 스타일링
📄 /src/app/globals.css       # 전역 CSS
📄 /src/components/ui/        # shadcn/ui 컴포넌트들

# 프로젝트 관리
📄 /CLAUDE.md                 # 프로젝트 총괄 지침
📄 /project-dna.json          # 프로젝트 DNA 파일
```

### Agent별 지침 파일 위치
```bash
📄 /CLAUDE.md                           # 프로젝트 총괄 조정자
📄 /src/app/api/CLAUDE.md              # API Route Agent  
📄 /src/components/CLAUDE.md           # Component Agent
📄 /src/types/CLAUDE.md                # Type Agent
📄 /src/lib/security/CLAUDE.md         # Security Agent
📄 /src/hooks/CLAUDE.md                # Query Agent
📄 /tests/CLAUDE.md                    # Test Agent
📄 /src/app/(pages)/CLAUDE.md          # Page Agent
📄 /src/lib/CLAUDE.md                  # Lib Agent  
📄 /scripts/CLAUDE.md                  # Script Agent
📄 /docs/CLAUDE.md                     # Doc Agent
📄 /supabase/migrations/CLAUDE.md      # Database Agent
```

---

## 📊 프로젝트 규모 현황

### 파일 수 통계
```bash
# 총 파일 수
find . -type f | wc -l        # 약 300+ 파일

# 소스 코드 파일
find src/ -name "*.ts" -o -name "*.tsx" | wc -l    # TypeScript 파일
find src/ -name "*.css" | wc -l                     # CSS 파일
find docs/ -name "*.md" | wc -l                     # 문서 파일

# 컴포넌트 및 API
find src/components/ -name "*.tsx" | wc -l          # React 컴포넌트  
find src/app/api/ -name "route.ts" | wc -l          # API Routes
find . -name "CLAUDE.md" | wc -l                    # Agent 지침 파일
```

### 자산 현황 (2025-08-31 기준)
- **전체 자산**: 136개
- **컴포넌트**: 96개
- **API Routes**: 40개  
- **데이터베이스 테이블**: 22개 (완전 구축)
- **React Query 훅**: 15개 구현
- **Zustand 스토어**: 5개
- **마이그레이션 파일**: 17개
- **CLAUDE.md 파일**: 16개
- **E2E 테스트**: 7개 모두 통과
- **검증 스크립트**: 12개 구축

---

## 🔗 연관 파일 매트릭스

### 기능별 파일 연관성
```
새 기능 추가 시 수정해야 할 파일들:

📊 YouTube 기능 추가
├── 📄 /src/app/api/youtube/[new-endpoint]/route.ts  # API
├── 📄 /src/components/features/youtube-lens/        # UI  
├── 📄 /src/hooks/queries/useYouTubeQueries.ts      # 데이터 페칭
├── 📄 /src/lib/youtube/                            # 비즈니스 로직
├── 📄 /supabase/migrations/[timestamp]_youtube.sql # DB 변경
└── 📄 /src/types/index.ts                          # 타입 추가

🔐 인증 기능 수정  
├── 📄 /src/middleware.ts                           # 라우팅 보호
├── 📄 /src/lib/supabase/server-client.ts          # 서버 인증
├── 📄 /src/components/features/auth/               # 인증 UI
└── 📄 /src/hooks/queries/useUserQueries.ts        # 사용자 상태

🎨 UI 컴포넌트 추가
├── 📄 /src/components/ui/                          # shadcn/ui (가능한 경우)
├── 📄 /src/components/features/[domain]/           # 기능별 컴포넌트
├── 📄 /src/components/common/                      # 공통 컴포넌트
└── 📄 /tailwind.config.ts                         # 스타일 설정 (필요시)
```

---

**💡 탐색 팁**: 
- VS Code에서 `Ctrl+P` → 파일명 검색
- `find . -name "*.tsx" | grep ComponentName` 로 특정 컴포넌트 찾기
- Agent 지침이 필요하면 해당 폴더의 `CLAUDE.md` 참조
- 구조가 헷갈리면 이 문서를 북마크하고 자주 참조하세요!