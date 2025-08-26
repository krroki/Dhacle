/sc:verify --seq --validate --think
"Phase 1-4 종합 검증: Critical Fixes 작업 완료 상태 확인"

# 🔍 Phase 1-4 Critical Fixes 종합 검증 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 검증 대상 경로
- API Routes: `src/app/api/*/route.ts`
- 타입 정의: `src/types/index.ts`
- API Client: `src/lib/api-client.ts`
- 인증 함수: `src/lib/api-auth.ts`
- DB 호출: `src/lib/youtube/pubsub.ts`
- 검증 스크립트: `scripts/verify-*.js`

### 프로젝트 컨텍스트 확인
```bash
# 현재 브랜치 확인
git branch --show-current

# 최근 커밋 확인
git log --oneline -10

# 검증 스크립트 목록
ls scripts/verify-*.js
```

## 📌 목적
**Phase 1-4 작업이 제대로 수행되었는지 체계적으로 검증**
- Phase 1: API 보안 긴급 조치 검증
- Phase 2: TypeScript 타입 시스템 복구 검증
- Phase 3: API 패턴 통일 검증
- Phase 4: 데이터베이스 호출 복원 검증

## 🤖 실행 AI 역할
품질 검증 전문가로서 각 Phase의 작업 완료 상태를 정량적으로 확인하고 문제점 발견 시 즉시 수정

## 📝 검증 내용

### Phase 1: API 보안 검증 (목표: 30개 API Route 100% 보호)

#### 1.1 requireAuth 적용 확인
```bash
# requireAuth 사용 현황 확인
echo "=== Phase 1: API Security Check ==="
echo "Total API routes:"
find src/app/api -name "route.ts" -type f | wc -l

echo "Routes with requireAuth:"
grep -l "requireAuth" src/app/api/*/route.ts src/app/api/*/*/route.ts 2>/dev/null | wc -l

echo "Routes without requireAuth (CRITICAL):"
for file in $(find src/app/api -name "route.ts" -type f); do
  if ! grep -q "requireAuth" "$file"; then
    echo "❌ Unprotected: $file"
  fi
done

# Expected: 30+ routes with requireAuth, 0 unprotected routes
```

#### 1.2 getSession 제거 확인
```bash
# getSession 사용 확인 (모두 getUser로 변경되어야 함)
echo "getSession usage (should be 0):"
grep -r "getSession" src/ --include="*.ts" --include="*.tsx" | grep -v "// " | wc -l

# getUser 사용 확인
echo "getUser usage (should be 30+):"
grep -r "getUser" src/ --include="*.ts" --include="*.tsx" | wc -l
```

#### 1.3 Admin Route 권한 확인
```bash
# Admin route requireRole 확인
echo "Admin routes with requireRole:"
grep -r "requireRole" src/app/api/admin/ --include="*.ts" | wc -l

# Expected: All admin routes should have requireRole
```

### Phase 2: TypeScript 타입 시스템 검증 (목표: 0 any 타입)

#### 2.1 any 타입 확인
```bash
echo "=== Phase 2: TypeScript Type System Check ==="
echo "Any type usage (should be 0):"
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "// " | wc -l

# 구체적 위치 확인
echo "Any type locations (if any):"
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "// "
```

#### 2.2 타입 import 확인
```bash
# @/types import 사용 확인
echo "Type imports from @/types:"
grep -r "from '@/types'" src/ --include="*.ts" --include="*.tsx" | wc -l

# Expected: 50+ imports
```

#### 2.3 TypeScript 컴파일 확인
```bash
# TypeScript 컴파일 체크
echo "TypeScript compilation check:"
npm run types:check

# Expected: 0 errors
```

#### 2.4 strict mode 확인
```bash
# tsconfig.json strict mode 확인
echo "Strict mode enabled:"
cat tsconfig.json | grep '"strict"'

# Expected: "strict": true
```

### Phase 3: API 패턴 통일 검증 (목표: 0 직접 fetch, 0 silent failure)

#### 3.1 직접 fetch 사용 확인
```bash
echo "=== Phase 3: API Pattern Unification Check ==="
echo "Direct fetch usage (should be 0):"
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client" | grep -v "// " | wc -l

# 구체적 위치 확인
echo "Direct fetch locations (if any):"
grep -r "fetch(" src/ --include="*.ts" --include="*.tsx" | grep -v "api-client" | grep -v "// "
```

#### 3.2 apiClient 사용 확인
```bash
# apiClient 사용 현황
echo "apiClient usage (should be 30+):"
grep -r "apiClient\." src/ --include="*.ts" --include="*.tsx" | wc -l
```

#### 3.3 Silent Failure 패턴 확인
```bash
# 빈 catch 블록 확인
echo "Empty catch blocks (should be 0):"
grep -r "catch.*{[[:space:]]*}" src/ --include="*.ts" --include="*.tsx" | wc -l

# catch 블록 without error handling
echo "Silent failures (detailed):"
grep -r "catch.*{" src/ --include="*.ts" --include="*.tsx" -A 2 | grep -B 1 "^[[:space:]]*}$"
```

#### 3.4 로깅 구현 확인
```bash
# logger 사용 확인
echo "Logger usage in API routes:"
grep -r "logger\." src/app/api/ --include="*.ts" | wc -l

# Expected: 50+ logger calls
```

### Phase 4: 데이터베이스 호출 복원 검증 (목표: 0 주석 처리된 DB 호출)

#### 4.1 주석 처리된 Supabase 호출 확인
```bash
echo "=== Phase 4: Database Call Restoration Check ==="
echo "Commented Supabase calls (should be 0):"
grep -r "// .*supabase\." src/ --include="*.ts" --include="*.tsx" | wc -l

# 구체적 위치 확인
echo "Commented DB call locations (if any):"
grep -r "// .*supabase\." src/ --include="*.ts" --include="*.tsx"
```

#### 4.2 테이블 존재 확인
```bash
# 데이터베이스 테이블 검증
echo "Database tables verification:"
node scripts/verify-with-service-role.js

# Expected: All required tables exist
```

#### 4.3 핵심 파일 DB 호출 활성화 확인
```bash
# YouTube PubSub DB 호출 확인
echo "YouTube PubSub active DB calls:"
grep -c "await.*supabase" src/lib/youtube/pubsub.ts

# Revenue Proof API DB 호출 확인
echo "Revenue Proof API active DB calls:"
grep -c "await.*supabase" src/app/api/revenue-proof/[id]/route.ts 2>/dev/null || echo "0"

# Expected: Multiple active DB calls in each file
```

### 종합 검증

#### 병렬 검증 실행
```bash
echo "=== Comprehensive Parallel Verification ==="
npm run verify:parallel

# Expected: 8/8 checks passed
```

#### 개별 Phase 검증
```bash
# Phase별 검증 스크립트 실행
echo "Phase 1 - Security:"
npm run verify:security

echo "Phase 2 - Types:"
npm run verify:types

echo "Phase 3 - API:"
npm run verify:api

echo "Phase 4 - Database:"
npm run verify:db

# Expected: All phases pass
```

#### 빌드 성공 확인
```bash
echo "=== Build Test ==="
npm run build

# Expected: Build succeeds without errors
```

## ✅ 완료 조건

### Phase 1: API 보안
- [ ] 30개 모든 API Route에 requireAuth 적용 ✅
- [ ] getSession 사용 0개 (모두 getUser로 변경) ✅
- [ ] Admin route에 requireRole 적용 ✅
- [ ] 401/403 응답 표준화 ✅

### Phase 2: TypeScript 타입 시스템
- [ ] any 타입 0개 ✅
- [ ] @/types import 50개 이상 ✅
- [ ] TypeScript 컴파일 에러 0개 ✅
- [ ] strict mode 활성화 ✅

### Phase 3: API 패턴 통일
- [ ] 직접 fetch 사용 0개 ✅
- [ ] apiClient 사용 30개 이상 ✅
- [ ] Silent failure 0개 ✅
- [ ] 모든 에러 로깅 구현 ✅

### Phase 4: 데이터베이스 호출 복원
- [ ] 주석 처리된 DB 호출 0개 ✅
- [ ] 필요한 테이블 모두 존재 ✅
- [ ] 핵심 파일 DB 호출 활성화 ✅
- [ ] RLS 정책 적용 ✅

## 📋 문제 발견 시 조치

### 검증 실패 유형별 대응

#### 1. API Route 미보호 발견
```typescript
// 즉시 수정: requireAuth 추가
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const user = await requireAuth(request);
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  // ... existing logic
}
```

#### 2. any 타입 발견
```typescript
// 즉시 수정: 구체적 타입 정의
// Before
const data: any = await response.json();

// After
import { ApiResponse, SpecificType } from '@/types';
const data: ApiResponse<SpecificType> = await response.json();
```

#### 3. 직접 fetch 발견
```typescript
// 즉시 수정: apiClient 사용
// Before
const response = await fetch('/api/endpoint');

// After
import { apiClient } from '@/lib/api-client';
const response = await apiClient.get<ResponseType>('/api/endpoint');
```

#### 4. Silent Failure 발견
```typescript
// 즉시 수정: 에러 처리 추가
// Before
try {
  await riskyOperation();
} catch {}

// After
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed:', error);
  toast.error('작업 실패');
  throw error; // or handle appropriately
}
```

#### 5. 주석 처리된 DB 호출 발견
```typescript
// 즉시 수정: 주석 해제 및 에러 처리 추가
// Before
// const { data } = await supabase.from('table').select();

// After
const { data, error } = await supabase.from('table').select();
if (error) {
  logger.error('DB query failed:', error);
  throw error;
}
```

## 🔄 롤백 계획
```bash
# 검증 실패로 롤백 필요 시
git status
git diff > verification-fixes.patch
git stash

# 이전 안정 버전으로 롤백
git checkout [last-stable-commit]

# 부분적 수정 적용
git apply --reject verification-fixes.patch
```

## 🔍 최종 검증 명령
```bash
# 모든 검증 통과 확인
npm run verify:all

# 성공 기준
echo "=== Final Verification Summary ==="
echo "✅ API Protection: 100%"
echo "✅ Type Safety: 0 any types"
echo "✅ API Pattern: Unified with apiClient"
echo "✅ Database: All calls active"
echo "✅ Build: Success"
echo "✅ Tests: Passing"
```

---

**⚠️ 주의사항**
1. **자동 스크립트 생성 금지**: 문제 발견 시 수동으로 수정
2. **임시방편 금지**: 모든 문제는 완전히 해결
3. **검증 후 커밋**: 모든 검증 통과 후에만 커밋

**예상 작업 시간**: 2-3시간
**성공 기준**: 모든 Phase 검증 항목 100% 통과

---

## 📊 검증 결과 보고 템플릿

```markdown
## Phase 1-4 검증 결과

### 📈 정량적 결과
| Phase | 항목 | 목표 | 실제 | 상태 |
|-------|------|------|------|------|
| Phase 1 | requireAuth 적용 | 30 | [실제값] | ✅/❌ |
| Phase 1 | getSession 제거 | 0 | [실제값] | ✅/❌ |
| Phase 2 | any 타입 | 0 | [실제값] | ✅/❌ |
| Phase 2 | TypeScript 에러 | 0 | [실제값] | ✅/❌ |
| Phase 3 | 직접 fetch | 0 | [실제값] | ✅/❌ |
| Phase 3 | Silent failure | 0 | [실제값] | ✅/❌ |
| Phase 4 | 주석 DB 호출 | 0 | [실제값] | ✅/❌ |

### 🔍 발견된 문제
1. [문제 설명 및 위치]
2. [해결 방법]

### ✅ 최종 상태
- [ ] 모든 검증 통과
- [ ] 빌드 성공
- [ ] 프로덕션 준비 완료
```