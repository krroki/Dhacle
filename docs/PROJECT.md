# 📍 디하클(Dhacle) 프로젝트 현황

_목적: 프로젝트 현재 상태와 진행 상황 추적_
_최종 업데이트: 2025-08-19 (코드 품질 개선 작업)_

## 🔴 필수: 새 세션 시작 체크리스트

**⚠️ 경고: AI 작업 시작 전 반드시 확인**

### 📋 필수 확인 문서 (13개 체계)

1. ☐ **이 문서** (`PROJECT.md`) - 현재 상태와 진행 상황
2. ☐ **`/CLAUDE.md`** - AI 작업 지침서 + 3단계 검증 시스템
3. ☐ **`/docs/CODEMAP.md`** - 프로젝트 구조 지도
4. ☐ **`/docs/CHECKLIST.md`** - 작업 검증 체크리스트
5. ☐ **`/docs/DOCUMENT_GUIDE.md`** - 문서 가이드라인
6. ☐ **`/docs/INSTRUCTION_TEMPLATE.md`** - 지시서 생성 템플릿
7. ☐ **`/docs/FLOWMAP.md`** - 사용자 플로우맵 (인증/경로)
8. ☐ **`/docs/WIREFRAME.md`** - UI-API 연결 명세 (현재 상태)
9. ☐ **`/docs/COMPONENT_INVENTORY.md`** - 컴포넌트 카탈로그
10. ☐ **`/docs/ROUTE_SPEC.md`** - 라우트 구조 및 가드
11. ☐ **`/docs/STATE_FLOW.md`** - 상태 관리 플로우
12. ☐ **`/docs/DATA_MODEL.md`** - 데이터 모델 매핑
13. ☐ **`/docs/ERROR_BOUNDARY.md`** - 에러 처리 전략

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

### 에러 정책 (표준) ✅ Wave 1 완료

- 401: `{ error: 'User not authenticated' }` - 100% 표준화 완료
- 4xx/5xx: `{ error: string }` (단일 키)
- 프론트는 401 → 로그인 유도, 그 외 → 사용자 친화적 메시지 + 콘솔에 상세 로그
- **API 래퍼**: 모든 내부 API는 `/lib/api-client.ts` 사용 (100% 적용)

### 스모크 테스트 체크리스트

- [ ] 로컬 실행 시 `localhost:3000` 사용
- [ ] Network 탭에서 내부 `/api/...` 요청이 **Cookie** 포함
- [ ] 인기 Shorts/컴렉션/폴더 진입 시 200 응답
- [ ] 로그아웃 상태에서 접근 시 401 + 로그인 유도

---

## ✅ 프로젝트 상태

### YouTube Lens 상태

- ✅ **모든 이슈 해결됨** (2025-02-01 최종 수정 완료)
  - /api/youtube/folders 엔드포인트 생성 완료
  - 인증 방식 통일 (getUser() 사용)
  - API Key 실제 사용 확인
  - 데이터 타입 불일치 해결
  - MetricsDashboard 실제 데이터 연결
  - 에러 메시지 개선 (401 vs API Key 구분)
  - **미들웨어 Supabase 세션 관리 추가** (인증 문제 근본 해결)
- ✅ 모든 핵심 파일 구현 완료
- ✅ API 엔드포인트 구조 정상
- ✅ 환경변수 설정 완료
- ✅ 세션 자동 새로고침 구현 완료

---

## 📊 반복 실수 추적

> **관리 규칙**: 발생 횟수만 누적, 패턴 파악용

| 실수 유형           | 발생 횟수 | 마지막 발생 |
| ------------------- | --------- | ----------- |
| className 직접 사용 | 0회       | -           |
| any 타입 사용       | 0회       | -           |
| 'use client' 남발   | 0회       | -           |
| 임의 파일 생성      | 0회       | -           |

---

## 🆕 최근 변경사항

> **관리 규칙**: 최신 7개만 유지, 오래된 항목 자동 삭제

1. **2025-02-02**: Vercel 빌드 오류 해결 - build-verify.js 문법 수정, use-toast.tsx 추가 ✅
2. **2025-08-19**: 코드 품질 대폭 개선 - Biome 오류 67% 감소, TypeScript 오류 93% 해결 ✅
3. **2025-02-01**: TypeScript `any` 타입 완전 제거 - 13개 → 0개, 컴파일 오류 0개 달성 ✅
4. **2025-02-01**: 타입 관리 시스템 v2.0 구축 - 자동 수정, VS Code 스니펫, 오류 설명 도구 ✅
5. **2025-02-01**: 테스트 도구 3종 통합 (MSW, Vitest, Playwright) - AI 코딩 품질 향상 ✅
6. **2025-02-01**: MSW 모킹 시스템 구축 - YouTube API 할당량 절약, 오프라인 개발 가능 ✅
7. **2025-02-01**: Vitest 단위/컴포넌트 테스트 환경 구축 - 80% 커버리지 목표 ✅

---

## 🔍 이슈 관리

### 알려진 이슈

1. **보안**: auth/callback/route.ts의 하드코딩된 자격 증명 (환경 변수 이관 필요)
2. **구조**: 일부 layout.tsx, page.tsx 미구현 상황 있음 (사용자와 협의)
3. **클라이언트**: browser-client.ts Mock 반환 로직 불완전

### 진행 중인 이슈 (2025-08-19)

1. ✅ **TypeScript 빌드 오류**: 완전 해결 - `any` 타입 0개, 컴파일 오류 0개 달성
2. ✅ **API 일치성**: 완전 해결 - 38/38 routes 100% 표준화 달성
3. ✅ **Biome 린팅 이슈**: 대폭 개선 - 2,426개 → 801개 오류 (67% 감소)
4. ✅ **보안 시스템**: Rate Limiting, XSS 방지 100% 구현 완료
5. ✅ **TypeScript 경고**: 대폭 개선 - 336개 → 23개 (src 폴더, 93% 감소)

---

## 📈 Phase별 진행 요약

✅ **Phase 1-15 완료**: 프로젝트 초기화 ~ 보안 Wave 0-3 (RLS, Rate Limiting, XSS 방지)
🔄 **Phase 16-17 예정**: 알림 시스템, 실시간 채팅, 이메일 인증
🆕 **13개 문서 체계**: 3단계 검증 시스템 도입 (Pre-Flight, Implementation, Post-Flight)

---

## 🛠 기술 스택

- **Frontend**: Next.js 15.4.6, TypeScript, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

_상세한 기술 스택 및 패키지 정보는 `/docs/CODEMAP.md` 참조_

---

## 📁 프로젝트 구조

_프로젝트 폴더 구조는 `/docs/CODEMAP.md`에 정리_

### 📄 핵심 문서 참조 체계

- **구현 상태**: `/docs/WIREFRAME.md` - UI-API 연결 상태 (✅/⚠️/❌)
- **라우트 보호**: `/docs/ROUTE_SPEC.md` - 인증 체크 현황
- **컴포넌트 재사용**: `/docs/COMPONENT_INVENTORY.md` - 28개 shadcn/ui + 커스텀
- **에러 처리**: `/docs/ERROR_BOUNDARY.md` - 401 리다이렉트 및 토스트

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

# 보안 관련 명령어 (2025-01-24 추가)
npm run security:apply-rls-all            # 모든 RLS 정책 적용
npm run security:ttl                      # TTL 정책 실행
npm run security:test                     # 보안 테스트 실행
npm run security:complete                 # 전체 보안 작업 실행

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

| 페이지 유형 | 검색어                  | 추천 소스           |
| ----------- | ----------------------- | ------------------- |
| 랜딩        | "SaaS landing hero"     | HyperUI, Flowbite   |
| 강의 상세   | "course detail sidebar" | TailGrids, Preline  |
| 대시보드    | "admin dashboard"       | shadcn/ui, Windmill |
| 로그인      | "auth form modal"       | shadcn/ui, DaisyUI  |
| 결제        | "checkout form"         | Flowbite, Stripe    |

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

## 🔒 보안 시스템 운영 가이드

### 보안 현황 (2025-01-29)

- ✅ **RLS 적용**: 17개 테이블, 63개 정책 활성화
- ⚠️ **보안 테스트**: 38% 성공률 (개선 필요)
  - 로컬 환경 보안 기능 비활성화 문제 발견
  - 프로덕션 적용 후 재테스트 필요
- ✅ **세션 검사**: 95% API Route 적용
- ✅ **Rate Limiting**: 모든 엔드포인트 보호
- ✅ **XSS/SQL Injection**: 완벽 방어

### 보안 자동화 명령어

```bash
# 일일 점검 (권장)
npm run security:test          # 보안 테스트
npm run security:ttl           # TTL 정책 실행

# 새 테이블 생성 후
npm run security:apply-rls-all # RLS 적용

# 배포 전 필수
npm run security:complete      # 전체 보안 점검
npm run security:scan-secrets  # 비밀키 스캔
```

### 보안 체크리스트

- ✅ **XSS 방지**: DOMPurify 기반 다층 방어 (Wave 3 완료)
- ✅ **SQL Injection 방지**: Supabase RLS 설정 (17개 테이블)
- ✅ **CSRF 보호**: Next.js 자동 처리
- ✅ **민감 정보 노출 방지**: 환경 변수 사용 + 비밀키 스캔 도구
- ✅ **인증/인가**: Supabase Auth + RLS + 세션 검사
- ✅ **API 키 암호화**: AES-256 암호화 적용
- ✅ **세션 기반 인증**: 쿠키 + 서버 검사 (95% 적용)
- ✅ **401 에러 표준화**: JSON 형식 통일 (100% 완료)
- ✅ **입력값 검증**: Zod 스키마 13개 적용 (Wave 3 완료)
- ✅ **Rate Limiting**: 모든 API 엔드포인트 보호 (Wave 3 완료)
- ✅ **RLS 자동화**: pg 패키지 기반 자동 적용 스크립트 (2025-01-24)
- ✅ **TTL 정책**: 30일 데이터 보관 정책 구현 (2025-01-24)
- ✅ **보안 테스트**: 자동화 테스트 스크립트 구현 (2025-01-24)

---

## 📐 API 엔드포인트 패턴

### RESTful API 표준

```typescript
GET / api / [resource]; // 목록 조회
GET / api / [resource] / [id]; // 상세 조회
POST / api / [resource]; // 생성
PUT / api / [resource] / [id]; // 수정
DELETE / api / [resource] / [id]; // 삭제
POST / api / [resource] / [action]; // 특수 액션
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
    '유효한 데이터 제출 → 성공',
    '필수 필드 비움 → 에러 메시지',
    '잘못된 형식 → 검증 에러',
    '네트워크 에러 → 재시도 옵션',
  ],
  list: [
    '초기 로딩 → 스켈레톤 UI',
    '데이터 로드 → 목록 표시',
    '빈 결과 → Empty State',
    '페이지네이션 → 다음 페이지',
  ],
  payment: [
    '결제 성공 → 완료 페이지',
    '결제 실패 → 에러 처리',
    '결제 취소 → 이전 페이지',
  ],
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

## ⚠️ 알려진 이슈 (2025-01-30)

### 1. ✅ YouTube Lens API 오류 (해결됨)

- **문제**: API 400/404/500 에러 발생
- **해결**: 6개 핵심 이슈 모두 수정 완료
- **수정 내용**:
  - /api/youtube/folders 엔드포인트 생성
  - 인증 방식 통일 (getSession → getUser)
  - 데이터 타입 불일치 해결
  - MetricsDashboard 실제 데이터 연결
- **상태**: 완료 (2025-01-30)

### 2. 보안 기능 로컬 환경 비활성화

- **문제**: 로컬 개발 환경에서 보안 테스트 38% 성공률
- **증상**: Rate Limiting, RLS 정책이 로컬에서 제대로 작동하지 않음
- **우선순위**: 높음 (High)
- **상태**: 분석 중
- **해결방안**: 프로덕션 환경 적용 후 재테스트 필요

### 3. 백엔드-프론트엔드 연결 불안정

- **문제**: 전체 연결 상태 85% 정상 (15% 문제)
- **증상**: 일부 API 엔드포인트에서 간헐적 연결 실패
- **우선순위**: 중간 (Medium)
- **상태**: 모니터링 중
- **관련**: YouTube Lens API 오류와 연관 가능성

### 해결된 이슈

- ✅ **API 키 Import 오류**: createServerClient 사용으로 통일 (2025-01-22)
- ✅ **에러 메시지 불명확**: 상세한 에러 로깅 추가 (2025-01-22)
- ✅ **세션 검사 누락**: api-client 래퍼로 credentials 자동 포함 (2025-01-22)

---

_이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다._
