# ✅ 디하클(Dhacle) 프로젝트 체크리스트

_목적: 세션별/작업별 품질 검증 가이드_
_핵심 질문: "지금 무엇을 확인해야 하나?"_
_업데이트: 2025-08-29 - YouTube Lens E2E 테스트 4대 에러 검증 체크리스트 추가_

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

# 4. 반복 실수 예방 체크 (CONTEXT_BRIDGE.md 기반)
grep -r "createServerComponentClient" src/ | wc -l # → 0이어야 함 (구식 패턴)
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l # → 0이어야 함 🔴
grep -r "from '@/types/database'" src/ | wc -l # → 0이어야 함 (직접 import)
grep -r "// TODO" src/ --include="*.ts" --include="*.tsx" | wc -l # → 최소화 (Hook이 차단)
grep -r "@ts-ignore" src/ --include="*.ts" --include="*.tsx" | wc -l # → 0이어야 함 🆕

# 5. Claude Code Hook System 체크 (2025-08-26) 🆕
node .claude/hooks/test-hooks.js # → 4/4 테스트 통과
test -f .claude/settings.json && echo "✅ Hook 설정 존재" || echo "❌ Hook 미설정"
test -f .claude/hooks/config.json && echo "✅ Hook 활성화" || echo "❌ Hook 비활성화"

# 6. snake_case/camelCase 일관성 체크 (2025-08-22 추가)
grep -r "use_[a-z]" src/ --include="*.tsx" | wc -l # → 0이어야 함 (React Hook 위반)
node scripts/verify-case-consistency.js # → Pass: 일관성 확인

# 6.5. YouTube API camelCase 체크 (2025-08-29 추가) 🆕
grep -r "snippet\?\.\(channel_id\|channel_title\|published_at\)" src/lib/youtube/ | wc -l # → 0이어야 함
grep -r "statistics\?\.\(view_count\|like_count\|comment_count\)" src/lib/youtube/ | wc -l # → 0이어야 함
test -f scripts/verify-youtube-api-fix.js && node scripts/verify-youtube-api-fix.js # → Pass: YouTube API 정상

# 7. E2E 테스트 환경 체크 (2025-08-27 최적화 완료) 🧪
test -f TEST_GUIDE.md && echo "✅ 테스트 통합 가이드 존재" || echo "❌ 가이드 없음"
test -f e2e/auth.spec.ts && echo "✅ 인증 테스트 존재" || echo "❌ 인증 테스트 없음"
test -f e2e/payment-flow.spec.ts && echo "✅ 결제 테스트 존재" || echo "❌ 결제 테스트 없음"
test -f e2e/youtube-lens.spec.ts && echo "✅ YouTube Lens 테스트 존재" || echo "❌ 테스트 없음"
test -f e2e/global-setup.ts && echo "✅ 런타임 에러 감지 시스템 구축" || echo "❌ 에러 감지 시스템 없음"
test -f E2E_OPTIMIZATION_GUIDE.md && echo "✅ E2E 최적화 가이드 존재" || echo "❌ 최적화 가이드 없음"
ls src/**/*.test.ts* 2>/dev/null | wc -l # → 10개 이상이어야 함 (현재 개수)
npx vitest --version # → 3.2.4 이상
npx playwright --version # → 1.54.2 이상

# 8. Playwright 최적화 검증 (2025-08-27 업데이트) 🎭
npx playwright test --list --project=smoke | wc -l # → Smoke 테스트 개수 확인 (24개)
npx playwright test --list --project=chromium | head -5 # → Chromium 프로젝트 정상 설정
find tests/e2e -name "*.spec.ts" 2>/dev/null | wc -l # → 0이어야 함 (잘못된 경로)
find e2e -name "*.spec.ts" 2>/dev/null | wc -l # → 실제 테스트 개수 (15개)
grep "webServer.*timeout.*15.*1000" playwright.config.ts # → 15초 타임아웃 설정 확인
grep "workers.*4" playwright.config.ts # → 병렬 처리 최적화 확인

# 9. E2E 테스트 실행 성능 체크 (2025-08-27 추가) ⚡
echo "🚀 빠른 실행 명령어 테스트"
npm run e2e:fast --dry-run 2>&1 | grep "smoke" # → Smoke 프로젝트 설정 확인
npm run e2e:ui --dry-run 2>&1 | grep "chromium" # → Chromium 전용 설정 확인
echo "실행 시간 목표: 2-3분 (이전 5-8분에서 60% 단축)"

# 10. 서브에이전트 시스템 체크 (2025-08-28 활성화) 🤖
test -d .claude/agents && echo "✅ 에이전트 디렉토리 존재" || echo "❌ 에이전트 디렉토리 없음"
ls .claude/agents/*.md 2>/dev/null | wc -l # → 16개 에이전트 파일 존재
test -f .claude/settings.json && echo "✅ 에이전트 설정 존재" || echo "❌ 설정 파일 없음"
grep -c "enabled.*true" .claude/settings.json # → 1 이상 (활성화 상태)
find .claude/agents -name "*.md" -exec grep -l "CORE PRINCIPLE" {} \; | wc -l # → 16개 (모든 에이전트)
find .claude/agents -name "*.md" -exec grep -l "Stop Triggers" {} \; | wc -l # → 16개 (모든 에이전트)
echo "서브에이전트 자동 활성화: Edit/Write/MultiEdit 시 파일 패턴 매칭으로 자동 실행"
echo "⚠️ Task 도구 사용 시: 'analyzer' 아님, 'general-purpose' 사용"
```

#### 체크 항목
- [ ] Git 상태 깨끗함 또는 의도된 변경사항만 존재
- [ ] TypeScript 컴파일 가능 상태
- [ ] 환경 변수 파일 존재
- [ ] 의존성 정상 설치됨
- [ ] **CONTEXT_BRIDGE.md 반복 실수 체크 통과** 🆕
- [ ] **Claude Code Hook System 정상 작동** 🆕
- [ ] **E2E 테스트 파일 존재 (auth.spec.ts, full-journey.spec.ts)** 🎭

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
# 통합 검증 시스템 (2025-08-25 Phase 5 완료)
npm run verify:parallel        # → 병렬 검증 (56.3% 빠름) 🔥
npm run verify:critical        # → 핵심 검증 통과
npm run verify:report          # → 상세 리포트 생성 🆕

# any 타입 검증 (2025-08-25 추가) 🔴
npx biome check src/ --apply  # → any 타입 자동 감지
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l # → 0이어야 함

npm run build                  # → 빌드 성공
git diff --stat               # → 변경 파일 확인

# 통합 검증 시스템 성과:
# - 29개 레거시 스크립트 → 6개 모듈 통합
# - 실행 시간: 920ms → 400ms (56.3% 개선)
# - 코드 라인: 4,334줄 → 2,225줄 (48.7% 감소)
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
- [ ] **TypeScript strict mode 준수 (any 타입 절대 금지)** 🔴
- [ ] **임시방편 코드 금지 (TODO, 주석 처리, @ts-ignore)** 🔴
- [ ] Tailwind CSS만 사용 (인라인 스타일 금지)
- [ ] API Route에서 `snakeToCamelCase` 사용 (DB→Frontend 변환)
- [ ] Components는 camelCase 필드만 사용
- [ ] 변수명은 camelCase 사용 (snake_case 금지)
- [ ] **실제 작동 확인 (빈 배열, null 반환 금지)** 🆕

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

### 🚀 배포 준비 (Deployment)

#### 배포 전 검증
```bash
# 필수 검증 (2025-08-28 업데이트: 검증 기준 조정 반영)
npm run verify:parallel       # → 239개 경고 (목표 270개 달성)
npm run build                 # → 빌드 성공
npm run security:test         # → 보안 테스트 통과

# E2E 테스트 실행 (2025-08-27 추가) 🎭
npm run e2e                   # → Playwright E2E 테스트 통과
npm run e2e:ui                # → UI 모드로 시각적 확인
npm run test:coverage         # → 커버리지 80% 이상

# 환경 변수 확인
grep "NEXT_PUBLIC" .env.local | wc -l # → 필수 환경변수 개수
```

#### 배포 체크리스트
- [ ] **React Hooks 서버/클라이언트 분리 검증** 🚨 2025-08-27 추가
- [ ] 모든 검증 통과 (`npm run verify:all`)
- [ ] **빌드 성공 (`npm run build`)** - 정적 assets 생성 확인 필수
- [ ] **E2E 테스트 통과 (`npm run e2e`)** 🎭
- [ ] **SVG 이미지 최적화 동작 확인** 🖼️ 2025-08-27 추가
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 보안 테스트 통과

---

## 🔍 영역별 검증 체크리스트 (Domain-Based Validation)

### 📚 TypeScript 타입 시스템

#### 검증 명령어
```bash
# 타입 시스템 검증 (2025-08-28 업데이트: 스마트 분류 적용)
npm run verify:types           # → 139개 경고 (TypeScript ESLint 'warn' 기준)
npm run verify:parallel        # → 전체 검증: 239개 경고 (목표 270개 달성)
npx tsc --noEmit              # → 타입 에러 0개

# 타입 제안 (필요시)
node scripts/type-suggester.js <파일> # → 타입 개선 제안
```

#### 통과 기준
- [x] 중복 타입 파일 0개 (9개→2개 완료) ✅
- [x] Import 경로 `@/types`에서만 ✅
- [x] TypeScript 중요 오류 0개 (플레이스홀더 13개만 남음) ✅
- [x] **Any 타입 완전 제거 (0개 목표)** 🔴 2025-08-25 강화

### 🔒 API 일관성 및 보안

#### API 검증 명령어
```bash
# API 일관성 검사
npm run verify:api            # → 0 errors, 0 warnings

# snake_case 변환 확인
node scripts/verify-case-consistency.js # → 0 violations

# 보안 검사
node scripts/security/scan-secrets.js # → No secrets found
```

#### 통과 기준
- [x] 모든 Route에 세션 검사 (createSupabaseRouteHandlerClient 사용) ✅
- [x] 401 표준 형식: `{ error: 'User not authenticated' }` ✅
- [x] api-client.ts 래퍼 사용 ✅
- [x] Supabase 클라이언트 패턴 통일 (2025-08-22: 44개 파일 수정 완료) ✅
- [ ] Zod 스키마 적용
- [ ] 비밀키 하드코딩 없음

### 🎨 UI/UX 일관성

#### UI 검증 명령어
```bash
# UI 일관성 검사
npm run verify:ui             # → 0 violations

# 컴포넌트 확인
ls src/components/ui/         # → shadcn/ui 컴포넌트 확인
```

#### 통과 기준
- [ ] shadcn/ui 컴포넌트 우선 사용
- [ ] Tailwind CSS만 사용
- [ ] 인라인 스타일 금지
- [ ] Server Component 기본, 필요시만 'use client'

### 🎭 E2E 테스트 (2025-08-27 업데이트) - 완전 자동화 달성

#### E2E 테스트 명령어 🚀 **최적화 완료**
```bash
# 🤖 자동 관리 시스템 (권장) - 테스트 완료 후 자동 정리
npm run e2e                   # → Chromium 실행 + 자동 아카이브
npm run e2e:fast              # → Smoke 테스트 + 자동 아카이브 (1-2분) ⭐추천
npm run e2e:ui                # → UI 모드 (시각적 테스트)

# 🛠️ 수동 관리 (필요시)
npm run e2e:cleanup           # → 즉시 아카이브 실행
npm run e2e:stats             # → 테스트 파일 통계 확인
npm run e2e:archive temp.spec.ts  # → 특정 파일 아카이브

# 🔍 고급 테스트
npm run e2e:debug             # → 디버그 모드 (단계별 실행)
npm run e2e:all-browsers      # → 모든 브라우저 테스트

# 테스트 코드 자동 생성
npx playwright codegen localhost:3000  # → 브라우저 조작으로 코드 생성!

# 리포트 확인
npx playwright show-report    # → HTML 리포트 열기
```

#### 자동 관리 시스템 검증 🤖 **2025-08-27 추가**
- [ ] **테스트 완료 후 자동 아카이브 실행** (`post-test-hook.js`)
- [ ] **임시 파일 자동 감지** (`temp-*.spec.ts`, `demo-*.spec.ts`)
- [ ] **7개 핵심 파일만 유지** (auth, homepage, payment-flow 등)
- [ ] **아카이브 폴더 자동 생성** (`e2e/archive/`)
- [ ] **실행시간 단축 확인** (16개→7개 파일, 62% 단축)
- [ ] **통계 정보 생성** (`npm run e2e:stats` 동작)

#### 런타임 에러 감지 검증 🛡️ **기본값 설정 완료**
- [ ] **모든 테스트에 ErrorDetector 자동 적용** (`global-setup.ts`)
- [ ] **Console/Page/Web 에러 즉시 감지 및 테스트 실패**
- [ ] **Next.js 에러 오버레이 자동 감지**
- [ ] **React Error Boundary 활성화 감지**
- [ ] **에러 발생 시 자동 스크린샷 저장**

#### 통과 기준
- [ ] auth.spec.ts - 로그인/로그아웃 테스트 통과
- [ ] full-journey.spec.ts - 전체 사용자 시나리오 통과
- [ ] 테스트 로그인 버튼 정상 작동 (개발 모드)
- [ ] **실행시간 3분 이내 완료** (최적화 효과 확인)
- [ ] **임시 테스트 파일 자동 정리됨** (archive 폴더 이동)

### 🗜️ 데이터베이스

#### DB 검증 명령어
```bash
# 테이블 상태 확인
node scripts/verify-with-service-role.js # → 21개 테이블 확인

# 타입 동기화
npm run types:generate        # → 타입 재생성 성공

# RLS 정책 확인
npm run security:apply-rls-dry # → RLS 적용 상태
```

#### 통과 기준
- [ ] 필수 테이블 모두 존재
- [ ] RLS 정책 활성화
- [ ] 타입 동기화 완료
- [ ] 인덱스 설정 확인

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

### 📦 상태 관리 체크리스트 (2025-02-01 추가)

#### 상태 관리 원칙
- [ ] 서버 상태는 React Query로 관리되는가?
- [ ] 클라이언트 상태는 Zustand로 관리되는가?
- [ ] 불필요한 전역 상태가 없는가?
- [ ] 상태 영속성이 필요한 곳에 persist가 적용되어 있는가?

#### React Query 사용 체크
```bash
# React Query hooks 사용 확인
ls src/hooks/queries/*.ts | wc -l  # → 17개 Hook 파일 존재
grep -r "useQuery\|useMutation" src/components/ | wc -l  # → Hook 사용 확인
```

#### Zustand Store 체크
```bash
# Zustand stores 확인
ls src/store/*.ts | wc -l  # → 4개 스토어 파일
grep -r "persist" src/store/ | wc -l  # → persist 사용 확인
```

### ⚡ 성능 최적화 체크리스트 (2025-02-01 추가)

#### 성능 측정
```bash
# 번들 크기 분석
npm run build:analyze  # → 번들 크기 확인

# 이미지 최적화 확인
grep -r "Image from 'next/image'" src/ | wc -l  # → Next.js Image 사용

# 지연 로딩 확인
ls src/components/lazy/*.tsx 2>/dev/null | wc -l  # → 지연 로딩 컴포넌트
```

#### 최적화 항목
- [ ] 이미지가 최적화되어 있는가? (sharp 사용)
- [ ] 번들 크기를 분석했는가? (`npm run analyze`)
- [ ] Core Web Vitals를 모니터링하는가?
- [ ] 코드 스플리팅이 적용되어 있는가?
- [ ] 지연 로딩이 필요한 곳에 적용되어 있는가?

### 🔐 환경변수 체크리스트 (2025-02-01 추가)

#### 환경변수 검증
```bash
# env.ts 파일 존재 확인
test -f src/env.ts && echo "✅ 타입 안전 환경변수" || echo "❌ 미구현"

# process.env 직접 접근 검사
grep -r "process\\.env\\." src/ --include="*.ts" --include="*.tsx" | grep -v "env.ts" | wc -l  # → 0이어야 함
```

#### 환경변수 체크리스트
- [ ] `src/env.ts` 파일 존재
- [ ] 모든 환경변수가 Zod 스키마로 정의됨
- [ ] process.env 직접 접근 없음
- [ ] 빌드 시 환경변수 검증 통과

### 🛡️ 에러 처리 체크리스트 (2025-02-01 추가)

#### 에러 바운더리 확인
```bash
# ErrorBoundary 컴포넌트 확인
test -f src/components/ErrorBoundary.tsx && echo "✅ 에러 바운더리 구현" || echo "❌ 미구현"

# app/layout.tsx에 적용 확인
grep "ErrorBoundary" src/app/layout.tsx | wc -l  # → 1 이상이어야 함
```

#### 에러 처리 체크리스트
- [ ] ErrorBoundary 컴포넌트 구현됨
- [ ] 전역 레이아웃에 적용됨
- [ ] 개발/프로덕션 환경 분기 처리
- [ ] 에러 복구 UI 제공

### 🧪 테스트 체크리스트 (2025-02-01 추가)

#### 테스트 실행
```bash
# 단위 테스트
npm run test        # → Vitest 실행
npm run test:coverage  # → 커버리지 확인

# E2E 테스트
npm run e2e:fast    # → Smoke 테스트 (1-2분) ⭐추천
npm run e2e         # → 전체 테스트 (2-3분)
```

#### 테스트 항목
- [ ] 새 컴포넌트에 테스트 파일 존재
- [ ] 테스트 커버리지 80% 이상
- [ ] API 모킹 (MSW) 설정됨
- [ ] 주요 사용자 플로우 E2E 테스트 존재

---

## 🛡️ Claude Code Hook System 검증 (2025-08-26 추가)

### Hook 시스템 상태 확인
```bash
# Hook 정상 작동 테스트
node .claude/hooks/test-hooks.js

# 개별 Hook 상태
grep "enabled.*true" .claude/hooks/config.json | wc -l  # → 3 이상 (활성화된 Hook)

# Emergency disable 준비 상태
test -f .claude/hooks/emergency-disable.js && echo "✅ Emergency 준비됨" || echo "❌"
```

### Hook 검증 항목
- [ ] 3개 핵심 Hook 모두 활성화 (any, TODO, empty catch)
- [ ] 테스트 4/4 통과
- [ ] Emergency disable 스크립트 준비
- [ ] 환경변수 비활성화 방법 숙지

---

## 🔍 자동 검증 시스템 (2025-08-24 완전 재구축)

### 🚀 검증 시스템 12개 + 보안 도구 5개

```bash
# ⚡ 병렬 검증 (60-70% 속도 향상) - 권장
npm run verify:parallel           # 모든 검증 병렬 실행
npm run verify:parallel:critical  # 핵심 검증만 병렬
npm run verify:parallel:quality   # 품질 검증 병렬
npm run verify:parallel:security  # 보안 검증 병렬

# 📋 그룹별 검증
npm run verify:all        # 모든 검증 (8개 스크립트)
npm run verify:critical   # 핵심 검증 (API + Routes + Types)
npm run verify:quick      # 빠른 검증 (API + Types)
npm run verify:security   # 보안 검증 (Routes + Runtime + Deps)
npm run verify:quality    # 품질 검증 (UI + Types + Imports)
npm run verify:infra      # 인프라 검증 (DB + Deps)

# 🔍 개별 검증 (12개)
npm run verify:api        # API 일치성 (인증 통일)
npm run verify:ui         # UI 컴포넌트 일관성
npm run verify:types      # TypeScript 타입 안정성
npm run verify:routes     # 라우트 보호 상태
npm run verify:runtime    # 런타임 설정 검증
npm run verify:deps       # 의존성 취약점
npm run verify:db         # DB 스키마 일치성
npm run verify:imports    # Import 구조 검증
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

## 🚨 Runtime Error 검증 체크리스트 (2025-08-27 추가)

### React Hooks 서버/클라이언트 분리 검증

#### 검증 명령어
```bash
# 🔴 가장 중요: Next.js 빌드 성공 확인
npm run build

# React Hooks import 검사 (lib/ 폴더에서)
grep -r "useEffect\|useState\|useRef" src/lib/ --include="*.ts" --include="*.tsx"
# → lib/ 폴더에서는 결과가 0이어야 함

# 서버사이드 파일에서 'use client' 검사
grep -r "'use client'" src/lib/ --include="*.ts" --include="*.tsx"
# → lib/ 폴더에서는 결과가 0이어야 함 (서버사이드)

# hooks/ 폴더에서 'use client' 확인
grep -r "'use client'" src/hooks/ --include="*.ts" --include="*.tsx" | wc -l
# → 1 이상이어야 함 (클라이언트 사이드)
```

#### 분리 검증 체크리스트 🚨 **빌드 차단 방지 필수**
- [ ] **Next.js 빌드 성공** (`npm run build`)
- [ ] **lib/ 폴더에 React Hooks import 없음**  
- [ ] **lib/ 폴더에 'use client' 없음**
- [ ] **hooks/ 폴더에 'use client' 선언 있음**
- [ ] **타입만 import (runtime import 금지)**
- [ ] **정적 assets 정상 생성** (`.next/static/` 존재)

### SVG 이미지 최적화 검증

#### 검증 명령어
```bash
# next.config.ts에서 SVG 설정 확인
grep -A5 "dangerouslyAllowSVG" next.config.ts
# → true 설정 확인

# Dicebear 도메인 설정 확인
grep "api.dicebear.com" next.config.ts
# → remotePatterns에 포함 확인

# 개발 서버에서 이미지 로드 테스트
curl -I "http://localhost:3000/api/dicebear/avatar/test"
# → HTTP 200 OK 응답 확인
```

#### SVG 최적화 체크리스트 🖼️
- [ ] **next.config.ts에 dangerouslyAllowSVG: true**
- [ ] **contentDispositionType: 'attachment'**  
- [ ] **CSP 보안 정책 설정**
- [ ] **Dicebear 도메인 remotePatterns 등록**
- [ ] **개발 서버에서 SVG 이미지 로드 성공**

### E2E 테스트 설정 검증

#### 검증 명령어
```bash
# Playwright 설정에서 baseURL 확인
grep "baseURL" playwright*.config.ts
# → 실제 서버 포트와 일치 확인

# 개발 서버 포트 확인
lsof -i :3000 | grep LISTEN
# → Next.js 서버 실행 확인

# 테스트 실행 확인
npx playwright test --list | head -5
# → 테스트 파일 인식 확인
```

#### E2E 설정 체크리스트 🎭
- [ ] **baseURL이 실제 서버 포트와 일치**
- [ ] **개발 서버 정상 실행 (port 3000)**
- [ ] **모든 테스트 파일 ./e2e/ 폴더에 위치**
- [ ] **Playwright가 모든 테스트 인식**
- [ ] **임시 설정 파일 정리** (playwright.temp.config.ts)

---

## ⚡ E2E 테스트 환경별 설정 검증 (2025-08-29 추가) 🆕

### YouTube Lens E2E 테스트 4대 에러 검증 명령어
```bash
# 1️⃣ Admin API 403 Forbidden 검증
grep -A10 "getAdminEmails" src/app/api/youtube-lens/admin/channels/route.ts
grep -A10 "getAdminEmails" src/app/api/youtube-lens/admin/channel-stats/route.ts  
grep "TEST_ADMIN_EMAIL" src/env.ts
# → 환경별 관리자 이메일 동적 설정 확인

# 2️⃣ Rate Limiting 429 검증  
grep -A5 "NODE_ENV.*production" src/app/api/auth/test-login/route.ts
grep "Rate limiting completely bypassed" src/app/api/auth/test-login/route.ts
# → 개발 환경 Rate Limiting 우회 확인

# 3️⃣ WebKit 브라우저 인증 검증
grep -A10 "browserName.*webkit" e2e/youtube-lens-practical.spec.ts
grep -A10 "browserName.*webkit" e2e/youtube-lens-dynamic.spec.ts
grep "actionTimeout.*30.*1000" playwright.config.ts
# → WebKit 전용 타임아웃 설정 확인

# 4️⃣ 페이지 제목 로딩 타이밍 검증
grep -A5 "waitForFunction" e2e/youtube-lens-practical.spec.ts
grep -A5 "waitForFunction" e2e/youtube-lens-dynamic.spec.ts  
grep "YouTube.*title" e2e/youtube-lens-*.spec.ts
# → 비동기 제목 로딩 대기 패턴 확인
```

### 환경별 설정 체크리스트
- [ ] **개발/테스트 환경**: 테스트 관리자 이메일 추가
- [ ] **개발/테스트 환경**: Rate Limiting 완전 비활성화
- [ ] **WebKit 브라우저**: 5초 대기 + 쿠키 검증
- [ ] **모든 브라우저**: waitForFunction 제목 로딩 대기
- [ ] **프로덕션 환경**: 환경변수만 사용, Rate Limiting 활성화

### E2E 테스트 실행 검증
```bash
# 브라우저별 테스트 실행
npx playwright test --project=chromium e2e/youtube-lens-practical.spec.ts
npx playwright test --project=webkit e2e/youtube-lens-practical.spec.ts
npx playwright test --project=firefox e2e/youtube-lens-practical.spec.ts

# 테스트 로그인 API 상태 확인
curl -X POST http://localhost:3000/api/auth/test-login -H "Content-Type: application/json"
# → 개발 환경에서 200 OK 응답 확인

# Admin API 접근 테스트 (테스트 계정으로)
curl -X GET "http://localhost:3000/api/youtube-lens/admin/channels" \
  -H "Cookie: sb-access-token=test_token"
# → 403에서 200으로 변경 확인
```

### 환경 설정 매트릭스 검증
| 환경 | 관리자 인증 검증 | Rate Limiting 검증 | WebKit 타임아웃 검증 | 제목 대기 검증 |
|------|-----------------|-------------------|---------------------|----------------|
| **개발** | ✅ TEST_ADMIN_EMAIL 포함 | ✅ 완전 우회 | ✅ 5초 대기 | ✅ waitForFunction |
| **테스트** | ✅ TEST_ADMIN_EMAIL 포함 | ✅ 완전 우회 | ✅ 5초 대기 | ✅ waitForFunction |
| **프로덕션** | ✅ 환경변수만 | ✅ 완전 활성화 | ✅ 기본값 | ✅ waitForFunction |

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
- [ ] 번들 분석 실행 (`npm run build:analyze`) 🆕 2025-08-23
- [ ] 사용하지 않는 라이브러리 제거 확인

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

## 🔍 Pre-commit 검증 체크리스트 (2025-08-19 추가, 2025-08-22 개선)

### Git 커밋 전 자동 검증

- [ ] **Pre-commit Hook 활성화** (husky 설치 완료)
- [ ] API 일치성 검증 통과
- [ ] TypeScript 타입 검증 통과
- [ ] Staged 파일 검증 완료
- [ ] 코드 포맷팅 자동 적용
- [ ] **CONTEXT_BRIDGE.md 9가지 실수 패턴 체크** 🆕
  - [ ] any 타입 사용 금지
  - [ ] 구식 Supabase 패턴 금지
  - [ ] 직접 database.generated import 금지
  - [ ] 직접 fetch() 호출 금지

### 검증 우회 (긴급 시에만)

```bash
# Pre-commit 검증 건너뛰기
git commit --no-verify -m "fix: 긴급 수정"
```

---

## 📌 요약: 핵심 체크리스트

### 🎯 매 세션 필수 실행
```bash
# 시작 시
git status && npx tsc --noEmit

# 작업 중 (30분마다)
npm run verify:critical

# 종료 시
npm run build
```

### ✅ 성공 기준
- TypeScript 컴파일: 오류 0개
- API 일관성: 오류 0개, 경고 5개 이하
- 빌드: 성공
- 보안: 비밀키 0개

---

_이 체크리스트는 세션별/작업별 품질 검증을 위한 범용 가이드입니다._
_특정 시점의 상태가 아닌 언제든 실행 가능한 검증 항목으로 구성되었습니다._
