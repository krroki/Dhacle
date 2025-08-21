# ✅ 디하클(Dhacle) 프로젝트 체크리스트

_목적: 세션별/작업별 품질 검증 가이드_
_핵심 질문: "지금 무엇을 확인해야 하나?"_
_업데이트: 2025-02-21 - 범용적 체크리스트로 전면 개편_

> **체크리스트 사용 원칙**:
> - ✅ 실행 가능한 명령어 중심
> - ✅ Pass/Fail 명확한 기준 제시
> - ✅ 세션 타입별 구분 (시작/중간/완료)
> - ✅ 작업 타입별 구분 (새기능/버그수정/리팩토링/배포)
> - ❌ 특정 시점 상태값 기록 금지 (예: "28개 오류")

> **관련 문서**:
> - 프로젝트 현황: `/docs/PROJECT.md`
> - 프로젝트 구조: `/docs/CODEMAP.md`
> - AI 작업 지침: `/CLAUDE.md`

---

## 🎯 세션별 체크리스트 (Session-Based Checklists)

### 🌅 세션 시작 시 (Session Start)

#### 필수 확인 명령어
```bash
# 1. 프로젝트 상태 확인
git status                    # → Unstaged changes 확인
git branch                    # → 현재 브랜치 확인

# 2. 타입 시스템 상태
npx tsc --noEmit 2>&1 | wc -l # → 타입 오류 개수 확인
node scripts/type-validator.js # → Pass: 타입 시스템 정상

# 3. 의존성 및 환경
test -f .env.local && echo "✅" || echo "❌" # → .env.local 존재 확인
npm ls --depth=0 2>&1 | grep "UNMET" | wc -l # → 0이어야 함
```

#### 체크 항목
- [ ] Git 상태 깨끗함 또는 의도된 변경사항만 존재
- [ ] TypeScript 컴파일 가능 상태
- [ ] 환경 변수 파일 존재
- [ ] 의존성 정상 설치됨

### 🔨 작업 중 (During Work)

#### 주기적 검증 (30분마다)
```bash
# 빠른 타입 체크
npx tsc --noEmit              # → 에러 없어야 함

# API 일관성 (API 작업 시)
npm run verify:api             # → 0 errors 확인

# snake_case 일관성 (데이터 작업 시)
node scripts/verify-case-consistency.js # → 0 violations
```

### ✅ 세션 종료 시 (Session End)

#### 최종 검증 명령어
```bash
# 종합 검증
npm run verify:critical        # → 모든 검증 통과
npm run build                  # → 빌드 성공
git diff --stat               # → 변경 파일 확인
```

---

## 📝 작업 타입별 체크리스트 (Task-Based Checklists)

### 🆕 새 기능 개발 (New Feature)

#### 시작 전 체크
```bash
# 기존 코드 확인
grep -r "similar_feature" --include="*.tsx" # → 유사 기능 참고
ls src/components/features/    # → 재사용 가능 컴포넌트 확인
```

#### 구현 중 체크
- [ ] `src/lib/api-client.ts` 함수 사용 (직접 fetch 금지)
- [ ] shadcn/ui 컴포넌트 우선 사용
- [ ] TypeScript strict mode 준수 (any 타입 금지)
- [ ] Tailwind CSS만 사용 (인라인 스타일 금지)

#### 완료 후 체크
```bash
npx tsc --noEmit              # → 타입 에러 0개
npm run lint                   # → 린트 에러 0개
npm run build                  # → 빌드 성공
```

### 🐛 버그 수정 (Bug Fix)

#### 원인 파악
```bash
# 에러 로그 확인
git log --oneline -10        # → 최근 변경사항
git diff HEAD~1               # → 마지막 커밋과 비교
```

#### 수정 검증
- [ ] 문제 재현 가능
- [ ] 수정 후 문제 해결 확인
- [ ] 부수효과 없음 확인
- [ ] 테스트 추가 (가능한 경우)

#### 완료 체크
```bash
npm run test                  # → 관련 테스트 통과
npm run build                 # → 빌드 성공
```

### ♻️ 리팩토링 (Refactoring)

#### 리팩토링 전
```bash
# 영향 범위 확인
grep -r "old_function" --include="*.ts*" | wc -l # → 사용처 개수
npm run test                  # → 현재 테스트 상태
```

#### 리팩토링 원칙
- [ ] 기능 변경 없음 (동작 유지)
- [ ] 테스트 계속 통과
- [ ] 성능 저하 없음
- [ ] 가독성 향상

#### 완료 검증
```bash
npm run test                  # → 모든 테스트 통과
npm run build                 # → 빌드 성공
git diff --stat              # → 변경 범위 확인
```

---

## 🔧 개발 작업 체크리스트

### 기능 구현 후

- [ ] TypeScript 타입 체크: `npx tsc --noEmit`
- [ ] ESLint 검사: `npm run lint`
- [ ] 빌드 테스트: `npm run build`
- [ ] 콘솔 에러 없음 확인
- [ ] Network 탭 API 응답 확인

### TypeScript 빌드 체크리스트 (2025-02-21 Wave 3-4 완료)

- [ ] **타입 시스템 검증**: `node scripts/type-validator.js` (Wave 3-4 도구)
  - Any 타입 자동 감지 및 차단
  - Import 경로 일관성 검증
  - 중복 타입 파일 발견
- [ ] **타입 제안 도구**: `node scripts/type-suggester.js <파일>`
  - 파일별 맞춤 타입 제안
  - 컨텍스트 기반 타입 추론
- [ ] TypeScript 타입 체크: `npm run types:check` (**28개 에러 - 91% 해결**)
  - ✅ Wave 1: 변수명 오타 42개 해결
  - ✅ Wave 2: 타입 시스템 확장 완료
  - ✅ Wave 3: 검증 도구 구축 완료
  - ✅ Wave 4: 재발 방지 체계 완료 (Pre-commit Hook v3.0)
- [ ] API 함수 반환 타입 명시 확인
- [ ] ZodError.issues 사용 확인 (`.errors` 아님)
- [ ] unknown 타입 적절한 처리 (타입 가드 사용)
- [ ] npm run build 테스트

### TypeScript 타입 관리 시스템 v2.0 (2025-02-01 추가)

**자동 타입 관리 체크리스트**

- [ ] **타입 오류 자동 수정**: `npm run types:auto-fix`
  - import 문 자동 추가
  - snake_case ↔ camelCase 자동 변환
  - null/undefined 체크 자동 추가
  - any 타입을 unknown으로 자동 변경
  
- [ ] **타입 오류 상세 설명**: `npm run types:explain`
  - 오류별 구체적 해결 방법 제시
  - 예시 코드 제공
  - 자동 수정 가능 여부 표시

- [ ] **DB 타입 동기화**: `npm run types:sync`
  - DB 스키마 변경 시 자동 타입 생성
  - 24시간 경과 시 자동 재생성 알림

- [ ] **VS Code 스니펫 활용**
  - `impt` → import types from @/types
  - `apiroute` → API route with auth
  - `s2c` → snake to camel conversion

- [ ] **Pre-commit Hook 타입 체크**
  - 커밋 시 자동 타입 검증
  - 오류 발생 시 친절한 안내 메시지

### 코드 품질 체크리스트 (2025-08-20 Biome 통합)

- [ ] **Biome 린팅 통과**: `npm run lint:biome`
- [ ] **Import 정렬 확인**: 자동 정렬 적용됨
- [ ] **코드 포맷팅**: `npm run format:biome` 실행
- [ ] **불필요한 코드 제거**: 사용하지 않는 변수/import 제거
- [ ] **snake_case 검토**: DB 매핑 필요 시 유지, 아니면 camelCase 변환
- [ ] **Pre-commit 자동 검사**: Git 커밋 시 자동 실행됨

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

## 🔍 자동 검증 시스템 (2025-02-01 업데이트)

### 코드 일관성 검증 명령어 (2025-01-31 추가)

```bash
# 전체 일관성 검증 (8개 스크립트 모두 실행)
npm run verify:all

# 핵심 검증만 (API + Routes + Types)
npm run verify:critical

# 개별 검증
npm run verify:api       # API 인증 일치성
npm run verify:ui        # UI 컴포넌트 일관성
npm run verify:types     # TypeScript 타입 안정성
npm run verify:routes    # 라우트 보호 상태
npm run verify:runtime   # 런타임 설정 및 환경 변수
npm run verify:deps      # 의존성 취약점 및 사용 현황
npm run verify:db        # DB 스키마 일치성
npm run verify:imports   # Import 구조 및 순환 의존성
```

### 타입 관리 자동화 (2025-02-01 추가)

```bash
# 타입 오류 자동 수정
npm run types:auto-fix   # v2.0 - 실제 자동 수정 기능

# 타입 오류 상세 설명
npm run types:explain    # 오류별 해결 방법 제시

# DB 타입 동기화
npm run types:sync       # DB와 TypeScript 타입 동기화
npm run types:generate   # Supabase에서 타입 생성
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

### 데이터베이스 체크리스트 (2025-02-21 추가)

- [ ] **테이블 존재 확인**: `node scripts/verify-with-service-role.js`
  - 21개 테이블 모두 생성 확인
  - badges, course_enrollments, revenues 등 8개 신규 테이블 확인
- [ ] **타입 동기화**: `npm run types:generate`
- [ ] **TypeScript 빌드**: `npm run build`
- [ ] **누락 테이블 발견 시**:
  ```bash
  # SQL 실행
  node scripts/supabase-sql-executor.js --method pg --file <SQL파일>
  # 타입 재생성
  npm run types:generate
  ```

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
