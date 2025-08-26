# 📋 NPM Scripts 가이드 (113개)

> **최종 업데이트**: 2025-02-01  
> **버전**: v1.0  
> **목적**: NPM 스크립트 명령어 체계적 정리 및 활용 가이드

---

## 🚀 개발 명령어 (5개)

```bash
npm run dev              # 개발 서버 시작
npm run dev:clean        # 캐시 정리 후 개발 서버
npm run dev:no-verify    # 검증 없이 개발 서버
npm run dev:turbo        # Turbo 모드 개발 서버 (더 빠른 HMR)
npm start                # 프로덕션 서버 시작
```

### 사용 시나리오
- **일반 개발**: `npm run dev`
- **캐시 문제 발생**: `npm run dev:clean`
- **빠른 시작 필요**: `npm run dev:no-verify`
- **대규모 프로젝트**: `npm run dev:turbo`

---

## 🏗️ 빌드 명령어 (7개)

```bash
npm run build            # 프로덕션 빌드
npm run build:local      # 검증 후 빌드
npm run build:clean      # 캐시 정리 후 빌드
npm run build:analyze    # 번들 분석과 함께 빌드
npm run build:no-verify  # 검증 없이 빌드
npm run build:quick      # Supabase 검증 후 빌드
npm run analyze          # 번들 크기 분석
npm run analyze:browser  # 브라우저에서 분석 결과 열기
```

### 사용 시나리오
- **배포 전**: `npm run build:local`
- **번들 최적화**: `npm run analyze`
- **긴급 배포**: `npm run build:quick`

---

## ✅ 검증 명령어 (19개)

### 통합 검증
```bash
npm run verify           # 기본 검증 (빌드 제외)
npm run verify:full      # 전체 검증 (빌드 포함)
npm run verify:dev       # 개발 환경 검증
npm run verify:all       # 모든 개별 검증 순차 실행
```

### 병렬 검증 (성능 최적화)
```bash
npm run verify:parallel           # 모든 검증 병렬 실행 ⚡
npm run verify:parallel:critical  # 중요 검증만 병렬
npm run verify:parallel:quality   # 품질 검증 병렬
npm run verify:parallel:security  # 보안 검증 병렬
```

### 개별 검증
```bash
npm run verify:api       # API Routes 검증
npm run verify:ui        # UI 컴포넌트 검증
npm run verify:types     # TypeScript 타입 검증
npm run verify:routes    # 라우트 구조 검증
npm run verify:runtime   # 런타임 검증
npm run verify:deps      # 의존성 검증
npm run verify:db        # 데이터베이스 검증
npm run verify:imports   # Import 구조 검증
```

### 조합 검증
```bash
npm run verify:critical  # API + Routes + Types
npm run verify:quick     # API + Types
npm run verify:security  # Routes + Runtime + Deps
npm run verify:quality   # UI + Types + Imports
npm run verify:infra     # DB + Deps
npm run verify:complete  # 병렬 검증 + Biome + 임시 코드 검사
npm run verify:with-test # 빠른 검증 + 테스트
```

---

## 🧪 테스트 명령어 (15개)

### 단위 테스트 (Vitest)
```bash
npm run test             # Vitest 테스트 실행
npm run test:ui          # Vitest UI 모드
npm run test:run         # 테스트 1회 실행
npm run test:coverage    # 커버리지 리포트
npm run test:watch       # Watch 모드
npm run verify:test      # 테스트 검증 (패스 없이)
```

### E2E 테스트 (Playwright)
```bash
npm run e2e              # Playwright E2E 테스트
npm run e2e:ui           # Playwright UI 모드
npm run e2e:debug        # 디버그 모드
npm run e2e:headed       # 브라우저 표시 모드
npm run e2e:install      # Playwright 설치
```

### 브라우저별 E2E
```bash
npm run e2e:chromium     # Chromium 테스트
npm run e2e:firefox      # Firefox 테스트
npm run e2e:webkit       # WebKit 테스트
npm run e2e:mobile       # 모바일 브라우저 테스트
```

---

## 🔒 보안 명령어 (17개)

### RLS (Row Level Security)
```bash
npm run security:apply-rls          # RLS 정책 적용
npm run security:apply-rls-dry      # RLS 드라이런
npm run security:apply-rls-wave0    # Wave 0 RLS 적용
npm run security:apply-rls-wave2    # Wave 2 RLS 적용
npm run security:apply-rls-all      # 모든 Wave RLS 적용
npm run security:apply-rls-psql     # PSQL로 직접 적용
```

### 보안 테스트 및 검증
```bash
npm run security:test                # 보안 테스트
npm run security:test-verbose        # 상세 보안 테스트
npm run security:verify-sessions    # 세션 검증
npm run security:scan-secrets        # 시크릿 스캔
npm run test:security:wave0         # Wave 0 보안 테스트
```

### TTL 정책
```bash
npm run security:ttl                 # TTL 정책 적용
npm run security:ttl-dry            # TTL 드라이런
npm run security:ttl-force          # TTL 강제 적용
```

### 통합 보안
```bash
npm run security:standardize-errors  # 에러 표준화
npm run security:wave0               # Wave 0 전체 실행
npm run security:complete            # 모든 보안 작업 실행
```

---

## 🗄️ Supabase 명령어 (15개)

### 기본 명령어
```bash
npm run supabase         # Supabase CLI
npm run supabase:start   # 로컬 Supabase 시작
npm run supabase:stop    # 로컬 Supabase 중지
npm run supabase:status  # Supabase 상태 확인
npm run supabase:link    # 프로젝트 연결
```

### 데이터베이스 관리
```bash
npm run supabase:db:push   # DB 변경사항 푸시
npm run supabase:db:reset  # DB 초기화
npm run db:seed            # 시드 데이터 추가
```

### 마이그레이션
```bash
npm run supabase:migration:new     # 새 마이그레이션 생성
npm run supabase:migration:up      # 마이그레이션 실행
npm run supabase:migration:list    # 마이그레이션 목록
npm run supabase:migrate           # 자동 마이그레이션
npm run supabase:auto-migrate      # 자동 마이그레이션
npm run supabase:check             # 마이그레이션 체크
npm run supabase:validate          # 마이그레이션 검증
npm run supabase:migrate-complete  # 마이그레이션 완료
```

---

## 📝 타입 관리 (9개)

```bash
npm run types:generate       # Supabase 타입 생성 (원격)
npm run types:generate:local # Supabase 타입 생성 (로컬)
npm run types:watch         # 타입 생성 후 확인
npm run types:check         # TypeScript 타입 체크
npm run types:auto-fix      # 타입 오류 자동 수정
npm run types:sync          # DB와 타입 동기화
npm run types:help          # 타입 명령어 도움말
npm run types:explain       # 타입 에러 설명
npm run type-check          # 타입 체크 (별칭)
```

---

## 🎨 코드 품질 (9개)

### Biome (코드 포맷터/린터)
```bash
npm run lint:biome       # Biome 린팅
npm run lint:biome:fix   # Biome 자동 수정
npm run format:biome     # Biome 포맷팅
npm run biome:ci         # CI용 Biome 체크
```

### ESLint
```bash
npm run lint             # Next.js 린팅
npm run lint:fix         # 린트 자동 수정
```

### 통합
```bash
npm run fix:all          # 모든 자동 수정 실행
npm run check:temp       # 임시 코드 검사
npm run check:temporary  # 임시 코드 검사 (별칭)
```

---

## 🧹 정리 명령어 (3개)

```bash
npm run clean            # 캐시 정리 (.next, node_modules/.cache)
npm run clean:all        # 전체 정리 (out 포함)
npm run fresh            # 완전 재시작 (정리 + 설치 + 개발)
```

---

## 🔧 유틸리티 (5개)

```bash
npm run fix:missing-apis     # 누락 API 수정
npm run fix:api:DEPRECATED  # 비활성화된 자동 수정
npm run fix:api:OLD         # 이전 API 수정 도구
npm run prepare             # Husky 준비
npm run predeploy           # 배포 전 자동 마이그레이션
```

---

## 📊 미분류/특수 목적 (2개)

```bash
npm run security:semgrep    # Semgrep 보안 스캔 (별도 설치 필요)
npm run predev             # 개발 전 훅 (현재 비어있음)
npm run prebuild           # 빌드 전 훅 (현재 비어있음)
```

---

## 🎯 작업별 추천 조합

### 개발 시작
```bash
# 처음 시작
npm run fresh

# 일반 시작
npm run dev

# 문제 발생 시
npm run clean && npm run dev
```

### 커밋 전
```bash
# 빠른 검증
npm run verify:quick

# 완전한 검증
npm run verify:parallel

# 품질 + 보안
npm run verify:complete
```

### 배포 전
```bash
# 1. 보안 검증
npm run security:test

# 2. 전체 검증
npm run verify:parallel

# 3. 빌드
npm run build:local

# 4. E2E 테스트
npm run e2e
```

### 문제 해결
```bash
# 타입 오류
npm run types:sync

# 캐시 문제
npm run clean:all

# API 문제
npm run verify:api

# 전체 리셋
npm run fresh
```

---

## ⚡ 성능 최적화 팁

### 병렬 실행 활용
```bash
# 느림 (순차 실행)
npm run verify:all  # ~45초

# 빠름 (병렬 실행)
npm run verify:parallel  # ~15초
```

### 선택적 검증
```bash
# API 작업 시
npm run verify:api

# UI 작업 시
npm run verify:ui

# 타입 작업 시
npm run verify:types
```

### Turbo 모드 활용
```bash
# 일반 개발
npm run dev

# 대규모 프로젝트
npm run dev:turbo  # 더 빠른 HMR
```

---

## 📝 자주 사용하는 워크플로우

### 1. 새 기능 개발
```bash
npm run dev
# 개발...
npm run verify:quick
npm run test
git commit
```

### 2. 버그 수정
```bash
npm run verify:api  # 현재 상태 확인
# 수정...
npm run test:watch  # 테스트 확인
npm run verify:parallel
git commit
```

### 3. 성능 최적화
```bash
npm run analyze  # 번들 분석
# 최적화...
npm run build:analyze  # 결과 확인
npm run verify:parallel
```

### 4. 보안 강화
```bash
npm run security:test
npm run security:apply-rls-dry  # 드라이런
npm run security:apply-rls-all  # 적용
npm run security:complete  # 최종 확인
```

---

## 🚨 주의사항

### 자동 수정 도구
- `fix:api:DEPRECATED` - 사용 금지 (38개 스크립트 에러 경험)
- 검증 도구만 사용, 수정은 수동으로

### 병렬 실행
- CPU 코어 수에 따라 성능 차이
- 메모리 부족 시 순차 실행 권장

### 보안 명령어
- Production에서는 드라이런 먼저 실행
- RLS 적용 전 백업 필수

---

## 📚 관련 문서

- [기술 스택 가이드](./TECH_STACK.md) - 도구별 상세 설명
- [도구 의사결정 트리](./TOOL_DECISION_TREE.md) - 상황별 도구 선택
- [프로젝트 체크리스트](./CHECKLIST.md) - 작업 검증 가이드

---

*이 문서는 package.json의 scripts 섹션과 100% 동기화되어 있습니다.*