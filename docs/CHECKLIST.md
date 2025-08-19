# ✅ 디하클(Dhacle) 프로젝트 체크리스트

_목적: 작업 완료 후 검증해야 할 항목들_
_업데이트: 새로운 검증 항목 추가 시_

> **관련 문서**:
>
> - 프로젝트 현황: `/docs/PROJECT.md`
> - 프로젝트 구조: `/docs/CODEMAP.md`
> - AI 작업 지침: `/CLAUDE.md`

---

## 🆕 새 파일 생성 시 보안 자동 적용 체크리스트

### API Route 생성 시 (필수)

- [ ] **세션 검사 코드 추가** (파일 최상단)
  ```typescript
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not authenticated' }), {
      status: 401,
    });
  }
  ```
- [ ] **Zod 스키마 추가** (`/lib/security/validation-schemas.ts`)
- [ ] **입력 검증 적용**
- [ ] **에러 형식 통일** (`{ error: string }`)

### 새 테이블 생성 시 (필수)

- [ ] **RLS 즉시 활성화**
  ```sql
  ALTER TABLE 테이블명 ENABLE ROW LEVEL SECURITY;
  ```
- [ ] **기본 정책 4개 생성** (select, insert, update, delete)
- [ ] **user_id 컬럼 포함**
- [ ] **created_at, updated_at 추가**

### 사용자 입력 처리 시 (필수)

- [ ] **XSS 방지 적용**
  ```typescript
  import { sanitizeRichHTML } from '@/lib/security/sanitizer';
  const safeContent = sanitizeRichHTML(userInput);
  ```
- [ ] **입력 길이 제한**
- [ ] **특수문자 이스케이프**

---

## 🔧 개발 작업 체크리스트

### 기능 구현 후

- [ ] TypeScript 타입 체크: `npx tsc --noEmit`
- [ ] ESLint 검사: `npm run lint`
- [ ] 빌드 테스트: `npm run build`
- [ ] 콘솔 에러 없음 확인
- [ ] Network 탭 API 응답 확인

### TypeScript 빌드 체크리스트 (2025-08-19 강화)

- [ ] `any` 타입 사용 여부 검사 (**ESLint 에러 0개 달성**)
- [ ] API 함수 반환 타입 명시 확인 (**76개 async 함수 타입 추가 완료**)
- [ ] ZodError.issues 사용 확인 (`.errors` 아님)
- [ ] unknown 타입 적절한 처리 (타입 가드 사용)
- [ ] npm run build 성공
- [ ] npm run lint 에러 없음 (**2025-08-19 0개 달성**)

### API 작업 후

- [ ] 세션 검사 구현 (서버 라우트)
- [ ] 401 에러 표준 형식: `{ error: 'User not authenticated' }`
- [ ] api-client.ts 래퍼 사용 (클라이언트)
- [ ] Zod 스키마 검증 적용
- [ ] Rate Limiting 설정 확인
- [ ] **API 일치성 검사** (2025-08-19 100% 달성):

  ```bash
  # 자동 검사 (빌드에 통합됨)
  npm run verify:api  # 38/38 routes 표준화 완료

  # ⚠️ 경고: 자동 수정 스크립트 사용 금지 (비활성화됨)
  # fix-api-consistency.js는 DEPRECATED - 수동 수정 필수
  # 문제 발견 시 각 파일을 개별적으로 검토하고 수동으로 수정
  ```

- [ ] **올바른 Supabase 클라이언트 사용**:
  - ✅ `createRouteHandlerClient` from '@supabase/auth-helpers-nextjs'
  - ❌ `createServerClient` (사용 금지)
  - ❌ `createServerComponentClient` (사용 금지)

### 템플릿 기반 작업 검증 (2025-01-30 추가)

**DEVELOPMENT-INSTRUCTION-TEMPLATE.md 사용 후 필수 확인**

#### 빠른 검증 명령어

```bash
# API 엔드포인트 존재 확인
test -f "src/app/api/youtube/folders/route.ts" && echo "✅ 존재" || echo "❌ 누락"

# 컴포넌트가 API를 호출하는지 확인
grep -r "apiGet.*'/api/youtube/folders'" --include="*.tsx" --include="*.ts"

# 빌드 테스트
npm run build
```

#### 체크리스트

- [ ] 지시서의 모든 API 엔드포인트 파일 존재 확인
- [ ] 컴포넌트에 실제 데이터 props 전달 확인 (더미 데이터 ❌)
- [ ] WIREFRAME.md의 ✅ 표시가 실제 구현과 일치
- [ ] 빌드 성공 (`npm run build`)

---

## 🔍 자동 검증 시스템 (2025-01-31 업데이트)

### 코드 일관성 검증 명령어 (2025-01-31 추가)

```bash
# 전체 일관성 검증 (5개 스크립트 모두 실행)
npm run verify:all

# 핵심 검증만 (API + Routes + Types)
npm run verify:critical

# 개별 검증
npm run verify:api       # API 인증 일치성
npm run verify:ui        # UI 컴포넌트 일관성
npm run verify:types     # TypeScript 타입 안정성
npm run verify:routes    # 라우트 보호 상태
npm run verify:runtime   # 런타임 설정 및 환경 변수
```

### 개발 시 자동 검증

```bash
# 개발 서버 시작 (자동 검증 포함)
npm run dev

# 검증 없이 개발
npm run dev:no-verify
```

### 빌드 시 종합 검증

```bash
# 로컬 전체 테스트 (검증 + 빌드)
npm run build:local

# Vercel 배포용 (환경 자동 감지)
npm run build

# 검증만 실행
npm run verify
```

### 누락 API 자동 수정

```bash
# 누락된 엔드포인트 자동 생성
npm run fix:missing-apis
```

### 검증 항목 체크리스트

- [ ] **API 일관성**: createRouteHandlerClient 사용, getUser() 사용
- [ ] **UI 일관성**: shadcn/ui 컴포넌트, Tailwind CSS, api-client 사용
- [ ] **타입 안정성**: any 타입 제거, Promise 반환 타입 명시
- [ ] **라우트 보호**: 인증 체크, 401 응답 형식 통일
- [ ] **런타임 설정**: 환경 변수 관리, runtime 설정
- [ ] **TypeScript**: 타입 체크 통과
- [ ] **ESLint**: 검사 통과
- [ ] **빌드 성공**: 로컬 환경에서 빌드 완료

---

## 🔒 보안 체크리스트

### 코드 작성 시

- [ ] 환경 변수 하드코딩 없음
- [ ] any 타입 사용 없음
- [ ] 민감 정보 로깅 없음
- [ ] XSS 방지 (DOMPurify 사용)

### 보안 검증

```bash
# 비밀키 스캔
node scripts/security/scan-secrets.js

# RLS 정책 확인
npm run security:apply-rls-dry

# 보안 테스트 (목표: 100% 통과)
npm run security:test

# 현재 성공률: 38% (2025-01-29 기준)
# 필수 개선 항목: Rate Limiting, XSS 방지, 입력 검증
```

---

## 🔍 YouTube Lens 검증 체크리스트 (2025-01-29 추가)

### API 연결 확인

- [ ] API 키 설정 확인
- [ ] 인기 Shorts 조회 테스트
- [ ] 채널 폴더 기능 테스트
- [ ] 컴렉션 CRUD 테스트

### 오류 해결

- [ ] 400/404/500 에러 해결
- [ ] api-client.ts 사용 통일
- [ ] 세션 검사 적용 확인

---

## 🚀 배포 전 체크리스트

### 환경 설정

- [ ] `.env.local` 모든 필수 키 설정
- [ ] Vercel 환경 변수 설정
- [ ] `localhost` 사용 (127.0.0.1 금지)

### Supabase 검증

```bash
# 테이블 검증
node scripts/verify-with-service-role.js

# 누락된 테이블 확인
node scripts/check-missing-tables.js

# 마이그레이션 적용
npm run supabase:migrate-complete
node scripts/verify-with-service-role.js

# 마이그레이션 상태
npm run supabase:check
```

### 최종 테스트

- [ ] 로컬 개발 환경: `npm run dev`
- [ ] 프로덕션 빌드: `npm run build`
- [ ] 실제 사이트 테스트: https://dhacle.com

---

## 📝 Git 작업 체크리스트

### 커밋 전

- [ ] 변경사항 확인: `git status`
- [ ] 불필요한 파일 제외 (.gitignore)
- [ ] 커밋 메시지 규칙 준수

### 커밋 메시지 규칙

```
feat: 새로운 기능
fix: 버그 수정
refactor: 코드 개선
style: 스타일 변경
docs: 문서 수정
test: 테스트 추가
chore: 기타 작업
```

### PR 생성 전

- [ ] 브랜치명 규칙 준수
- [ ] 충돌 해결 완료
- [ ] 리뷰어 지정

---

## 📊 성능 체크리스트

### Core Web Vitals

- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Bundle Size < 200KB per route

### 최적화 확인

- [ ] 이미지 최적화 (Next.js Image)
- [ ] 코드 스플리팅 적용
- [ ] 불필요한 re-render 방지

---

## 📋 문서 작업 체크리스트

### 문서 수정 시

- [ ] 기존 내용 함부로 삭제 금지
- [ ] 중복 내용 확인
- [ ] 관련 문서 참조 업데이트
- [ ] 문서 역할 준수 (DOCUMENT_GUIDE.md 참조)

### 새 기능 추가 시

- [ ] CODEMAP.md - 파일 위치 업데이트
- [ ] PROJECT.md - 최근 변경사항 추가 (최신 7개만 유지)
- [ ] CLAUDE.md - 새로운 규칙/금지사항 추가
- [ ] WIREFRAME.md - UI-API 연결 상태 업데이트
- [ ] COMPONENT_INVENTORY.md - 새 컴포넌트 추가 시

## 🔍 Pre-commit 검증 체크리스트 (2025-08-19 추가)

### Git 커밋 전 자동 검증

- [ ] **Pre-commit Hook 활성화** (husky 설치 완료)
- [ ] API 일치성 검증 통과
- [ ] TypeScript 타입 검증 통과
- [ ] Staged 파일 검증 완료
- [ ] 코드 포맷팅 자동 적용

### 검증 우회 (긴급 시에만)

```bash
# Pre-commit 검증 건너뛰기
git commit --no-verify -m "fix: 긴급 수정"
```

---

_이 체크리스트는 작업 품질 보증을 위한 검증 도구입니다._
