# 🔧 스크립트 실행 가이드

*검증 스크립트, SQL 실행, 타입 관리 - 자동 수정 스크립트 절대 금지*

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

### 병렬 실행 (60-70% 빠름)
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

### 개별 검증
```bash
# API 일치성 검증 (인증 패턴 통일)
npm run verify:api

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