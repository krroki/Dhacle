# 🔧 스크립트 실행 가이드

*검증 스크립트, SQL 실행, 타입 관리 - 자동 수정 스크립트 절대 금지*

---

## 🚨 테이블 누락 에러 즉시 해결 (Quick Access)

### 에러: "relation 'table_name' does not exist"
```bash
# 복사해서 즉시 실행 (table_name을 실제 이름으로 변경)
node scripts/supabase-sql-executor.js --method pg --sql "
CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY 'Users own records' ON table_name FOR ALL USING (auth.uid() = user_id);
"

# 또는 파일로 실행
node scripts/supabase-sql-executor.js --method pg --file migrations/create_table.sql

# 실행 후 타입 생성
npm run types:generate
```

### Database Agent 자동 활성화
- SQL 파일 수정 시 자동으로 RLS 검사
- 타입 생성 누락 시 경고
- 검증 스크립트 자동 실행 안내

---

## 🛑 스크립트 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **fix-*.js 스크립트 생성 → 중단**
- **코드 자동 변환 시도 → 중단**
- **일괄 수정 스크립트 → 중단**
- **컨텍스트 무시한 변경 → 중단**

### 2️⃣ MUST - 필수 행동
```bash
# 검증만 수행
node scripts/verify-*.js

# 문제 발견 시 수동 수정
# 1. 검증 결과 확인
# 2. 파일별 컨텍스트 파악
# 3. 개별 수동 수정
# 4. 재검증
```

### 3️⃣ CHECK - 검증 필수
```bash
# 스크립트 실행 후
npm run verify:parallel
npm run types:check
npm run build
```

## 🚫 자동 수정 스크립트 절대 금지

### ❌ 2025년 1월 재앙의 교훈
```javascript
// ❌ 절대 생성 금지
// fix-all-typescript-errors.js
// fix-api-consistency.js
// fix-any-types.js

// ✅ 검증만 허용
// verify-types.js
// check-api-routes.js
// validate-security.js
```

### 📝 스크립트 작성 원칙
1. **READ-ONLY**: 파일 읽기만, 수정 금지
2. **REPORT**: 문제 보고만, 자동 수정 금지
3. **MANUAL**: 모든 수정은 수동으로

---

## 🚨 자동 스크립트 절대 금지

### ❌ 절대 금지 - 코드 자동 변환
```bash
# 2025년 1월, 38개 자동 스크립트로 인한 "에러 지옥" 경험

❌ fix-all-errors.js         # 금지!
❌ migrate-to-snake-case.js   # 금지!
❌ auto-fix-types.js          # 금지!
❌ fix-api-consistency.js     # 금지!
❌ 기타 fix-*.js 스크립트     # 모두 금지!
```

### ✅ 허용 - 검증만 수행
```bash
✅ verify-*.js    # 검증만, 수정 없음
✅ check-*.js     # 체크만, 변경 없음
✅ validate-*.js  # 검사만, 수정 없음
```

### 교훈
> "파일별 컨텍스트를 무시한 일괄 변경은 프로젝트를 파괴한다"
> - 검증 → 수동 수정이 유일한 안전한 방법

---

## 📊 검증 스크립트

### 🆕 통합 검증 시스템 (Phase 5 - 2025-08-25)

#### 통합 성과
- **파일 통합**: 29개 레거시 스크립트 → 6개 모듈
- **실행 속도**: 56.3% 향상 (920ms → 400ms)
- **코드 효율**: 48.7% 개선 (4,334줄 → 2,225줄)
- **중복 제거**: 75% 감소 (40% → 10%)

#### 통합 모듈 구조
```
scripts/verify/
├── index.js           # 메인 검증 엔진
├── config.js          # 중앙 설정 파일
├── utils.js           # 공통 유틸리티
└── modules/
    ├── types.js       # TypeScript 타입 검증
    ├── api.js         # API 일관성 검증
    ├── security.js    # 보안 취약점 검증
    ├── ui.js          # UI 컴포넌트 검증
    ├── database.js    # DB 스키마 검증
    └── dependencies.js # 의존성 검증
```

### 병렬 실행 (56.3% 빠름)
```bash
# 모든 검증 병렬 실행
npm run verify:parallel

# 핵심 검증만 병렬
npm run verify:parallel:critical

# 품질 검증 병렬
npm run verify:parallel:quality

# 보안 검증 병렬
npm run verify:parallel:security
```

### 모듈별 검증
```bash
# 통합 엔진 기반 모듈 실행
npm run verify:types           # TypeScript 타입 검증
npm run verify:api             # API 일치성 검증

# 타입 시스템 검증
npm run verify:types

# UI 일관성 검증 (shadcn/ui, Tailwind)
npm run verify:ui

# 라우트 보호 검증 (세션 체크)
npm run verify:routes

# 런타임 설정 검증
npm run verify:runtime

# 의존성 취약점 검증
npm run verify:deps

# DB 스키마 일치성
npm run verify:db

# Import 구조 검증
npm run verify:imports

# 종합 리포트 생성
npm run verify:report          # JSON/HTML 리포트 생성
```

### 레거시 명령어 (Deprecated)
```bash
# ⚠️ 2025 Q2 제거 예정
npm run verify:legacy:api      # → npm run verify:api로 대체
npm run verify:legacy:types    # → npm run verify:types로 대체
npm run verify:legacy:all      # → npm run verify:all로 대체
```

### 검증 결과 해석
```bash
✅ PASS: 모든 검증 통과
⚠️  WARN: 경고 사항 존재 (수정 권장)
❌ FAIL: 오류 발견 (수정 필수)

# 상세 로그 확인
npm run verify:api -- --verbose
```

---

## 🗄️ SQL 실행 시스템

### 마스터 도구 (`supabase-sql-executor.js`)
```bash
# PostgreSQL 직접 연결 (권장)
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql

# 다른 방법들
--method cli   # Supabase CLI 사용
--method sdk   # Supabase SDK RPC 사용

# 옵션
--dry-run      # 실행 없이 검증만
--verbose      # 상세 로그 출력
--health       # 연결 상태 확인
```

### 사용 시나리오
```bash
# 1. 새 테이블 생성
node scripts/supabase-sql-executor.js --method pg --file migrations/create_tables.sql

# 2. RLS 정책 적용
node scripts/supabase-sql-executor.js --method pg --file migrations/apply_rls.sql

# 3. 인덱스 생성
node scripts/supabase-sql-executor.js --method pg --file migrations/create_indexes.sql

# 4. 데이터 마이그레이션
node scripts/supabase-sql-executor.js --method pg --file migrations/migrate_data.sql
```

### SQL 파일 구조
```sql
-- migrations/001_initial_setup.sql
BEGIN;

-- 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "users_own_posts" ON posts
  FOR ALL USING (auth.uid() = user_id);

-- 인덱스
CREATE INDEX idx_posts_user_id ON posts(user_id);

COMMIT;
```

---

## 📋 테이블 검증

### 테이블 상태 확인
```bash
# 모든 테이블 목록 및 상태
node scripts/verify-with-service-role.js

# 출력 예시:
📊 테이블 상태:
✅ users (RLS: ON, 행: 1,234)
✅ posts (RLS: ON, 행: 5,678)
⚠️  comments (RLS: OFF, 행: 9,012)
❌ missing_table (존재하지 않음)
```

### 누락 테이블 검사
```bash
# 필수 테이블 체크
node scripts/check-missing-tables.js

# 출력 예시:
🔍 필수 테이블 검사:
✅ 21/21 테이블 생성됨
❌ 누락된 테이블:
  - proof_likes
  - proof_comments
```

---

## 🔐 보안 스크립트

### 비밀키 스캔
```bash
# 전체 프로젝트 스캔
node scripts/security/scan-secrets.js

# 특정 폴더만
node scripts/security/scan-secrets.js --path src/

# 출력 예시:
🔍 비밀키 스캔 중...
❌ CRITICAL: API key found in src/config.ts:15
⚠️  HIGH: Hardcoded password in test.js:23
✅ Production code clean
```

### RLS 정책 적용
```bash
# 모든 테이블에 RLS 적용
node scripts/security/apply-rls-improved.js

# Dry-run 모드
node scripts/security/apply-rls-improved.js --dry-run

# 특정 테이블만
node scripts/security/apply-rls-improved.js --table users
```

### 세션 체크 검증
```bash
# API Route 세션 체크 확인
node scripts/security/verify-session-checks.js

# 출력 예시:
🔒 세션 체크 검증:
✅ 38/38 API Routes 보호됨
❌ 보호되지 않은 Routes:
  - /api/public/* (의도적)
```

---

## 🎯 타입 관리

### 타입 생성
```bash
# 프로덕션 DB에서 생성
npm run types:generate

# 로컬 DB에서 생성
npm run types:generate:local

# 생성 파일: src/types/database.generated.ts
```

### 타입 체크
```bash
# TypeScript 컴파일 체크
npm run types:check

# 상세 오류 확인
npx tsc --noEmit --pretty
```

### 타입 제안 (수동 수정용)
```bash
# 파일별 타입 제안
node scripts/type-suggester.js src/app/api/posts/route.ts

# 출력 예시:
📝 타입 제안:
Line 15: any → Post[]
Line 23: unknown → { error: string }
Line 45: any → NextResponse<PostResponse>
```

---

## ⚠️ 스크립트 작성 규칙

### 1. 파일 시스템 직접 수정 금지
```javascript
// ❌ 금지
fs.writeFileSync(filePath, newContent);

// ✅ 허용
console.log(`수정 필요: ${filePath}`);
console.log(`제안: ${suggestion}`);
```

### 2. 검증 결과만 출력
```javascript
// ✅ 올바른 패턴
function verifyPattern(file) {
  const issues = [];
  // 검증 로직...
  
  if (issues.length > 0) {
    console.log(`❌ ${file}: ${issues.length}개 문제 발견`);
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log(`✅ ${file}: 정상`);
  }
}
```

### 3. 수정 제안은 상세히
```javascript
// ✅ 구체적 제안
console.log(`
파일: ${filePath}
라인: ${lineNumber}
현재: ${currentCode}
제안: ${suggestedCode}
이유: ${reason}
`);
```

### 4. 진행상황 표시
```javascript
// ✅ 진행률 표시
const total = files.length;
files.forEach((file, index) => {
  console.log(`[${index + 1}/${total}] ${file}`);
  // 처리...
});
```

---

## 📂 스크립트 구조

```
scripts/
├── verify-*.js           # 검증 스크립트 (수정 없음)
├── check-*.js           # 체크 스크립트 (읽기 전용)
├── security/            # 보안 관련
│   ├── apply-rls-improved.js
│   ├── scan-secrets.js
│   └── verify-session-checks.js
├── supabase-sql-executor.js  # SQL 실행
├── verify-with-service-role.js  # DB 상태 확인
├── type-suggester.js    # 타입 제안
└── backup-unused-scripts-*/  # 금지된 스크립트들 (사용 금지!)
```

---

## 🚀 Pre-commit Hook

### 자동 실행 (.husky/pre-commit)
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 빠른 검증만 실행
npm run verify:quick

# staged 파일만 Biome 체크
npx biome check --staged-only

# 실패 시 커밋 차단
```

### 스킵하기 (긴급 시)
```bash
git commit --no-verify -m "긴급 수정"
# ⚠️ 주의: 검증 없이 커밋됨
```

---

## 📋 체크리스트

- [ ] 자동 수정 스크립트 사용 금지
- [ ] 검증 스크립트만 사용
- [ ] SQL 실행 전 백업
- [ ] 타입 생성 후 체크
- [ ] 보안 스캔 정기 실행
- [ ] 수동 수정 원칙 준수

---

## 📁 관련 파일

- 검증 설정: `/package.json` (scripts)
- Pre-commit: `/.husky/pre-commit`
- SQL 마이그레이션: `/supabase/migrations/`
- 백업 스크립트: `/scripts/backup-unused-scripts-*/`

---

*스크립트 작업 시 이 문서를 우선 참조하세요.*