# 🌉 CONTEXT_BRIDGE - 프로젝트 특화 규칙 전달 시스템

**목적**: Context 없는 AI가 디하클 프로젝트 작업 시 반드시 알아야 할 특화 규칙과 최신 변경사항

**우선순위**: 🔴 **최우선 - 이 문서 미확인 시 치명적 오류 발생 가능성 90%**

---

## 🚨 절대 금지사항 (위반 시 프로젝트 파괴)

### 1. 자동 변환 스크립트 생성 금지
```bash
# ❌ 절대 금지 - 2025년 1월 38개 스크립트로 인한 "에러 지옥" 재현
node scripts/fix-all-errors.js
node scripts/migrate-to-snake-case.js

# ✅ 필수 - 수동 수정만 허용
npm run verify:types  # 문제 확인
# 각 파일을 Read로 읽고 Edit로 수정
```

### 2. 구식 Supabase 패턴 사용 금지
```typescript
// ❌ 절대 금지 (2025-08-22 이전 패턴)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerClient } from '@supabase/ssr';

// ✅ 필수 사용 (2025-08-22 이후 패턴)
// API Route에서
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
const supabase = createRouteHandlerClient({ cookies });

// Server Component에서
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
const supabase = await createSupabaseServerClient();
```

### 3. 타입 시스템 직접 import 금지
```typescript
// ❌ 절대 금지
import { Database } from '@/types/database';
import { Database } from '@/types/database.generated';

// ✅ 필수 - @/types에서만 import
import { User, Course, snakeToCamelCase } from '@/types';
```

### 4. 인증 API 구식 패턴 금지
```typescript
// ❌ 절대 금지
const session = await supabase.auth.getSession();
return new Response(JSON.stringify(data));

// ✅ 필수
const { data: { user } } = await supabase.auth.getUser();
return NextResponse.json(data);
```

---

## 🔥 최신 변경사항 (반드시 반영)

### 2025-08-22 업데이트
- Supabase 클라이언트: auth-helpers → ssr 패턴 변경
- TypeScript 에러: 224개 → 0개 완전 해결
- 타입 파일: 9개 → 2개로 통합 (database.generated.ts, index.ts만 유지)
- `as any` 완전 제거, 타입 안전성 100%

### 2025-01-31 업데이트  
- 자동 스크립트 절대 금지 강화
- snake_case/camelCase: API 경계에서만 변환
- pre-commit: --write, --fix 사용 금지

---

## 📋 작업 전 필수 확인 명령어

```bash
# 1. 최신 패턴 확인
grep -r "createSupabaseServerClient" src/

# 2. 타입 import 검증 (0개여야 함)
grep -r "from '@/types/database'" src/

# 3. any 타입 검사 (0개여야 함)
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# 4. 자동 스크립트 존재 확인 (fix-*.js 없어야 함)
ls scripts/fix-*.js 2>/dev/null

# 5. 테이블 상태 확인
node scripts/verify-with-service-role.js
```

---

## 🏗️ 프로젝트 특화 규칙

### API 호출 규칙
- 모든 내부 API: `/lib/api-client.ts`의 `apiGet`, `apiPost`, `apiPut`, `apiDelete` 사용
- 직접 fetch() 호출 금지 (외부 API 제외)
- credentials: 'same-origin' 필수

### 스타일링 규칙
- Tailwind CSS만 사용
- styled-components, CSS 모듈, 인라인 스타일 모두 금지
- shadcn/ui 컴포넌트 우선 사용

### 파일 생성 규칙
- layout.tsx, page.tsx: 사용자 협의 필수
- 문서 파일(*.md): 임의 생성 금지
- 테스트/더미 데이터: 사용 금지

### 타입 관리 규칙
- any 타입: 절대 금지
- unknown 사용 후 타입 가드 필수
- Union 타입 활용 권장

### 보안 규칙
- 새 테이블: 즉시 RLS 적용
- 환경변수: 하드코딩 금지
- XSS: DOMPurify 사용

---

## 🔄 변환 시스템

### snake_case ↔ camelCase
```typescript
// DB (snake_case) → Frontend (camelCase)
import { snakeToCamelCase } from '@/types';
const userData = snakeToCamelCase(dbData);

// Frontend (camelCase) → DB (snake_case)
import { camelToSnakeCase } from '@/types';
await supabase.insert(camelToSnakeCase(userData));
```

### React 예약어 보호
- `key`, `ref`, `className` 등은 변환하지 않음
- API 경계에서만 자동 변환

---

## 🚀 올바른 작업 프로세스

1. **Read First**: 코드 수정 전 반드시 Read로 현재 코드 확인
2. **Check Patterns**: 위 필수 확인 명령어 실행
3. **Manual Fix**: 자동 스크립트 대신 수동 수정
4. **Verify**: 빌드 및 타입 체크 확인

---

## ⚠️ 위험 신호 (즉시 중단)

- "일괄 변경", "자동 수정" 단어 등장
- fix-*.js 파일 생성 시도
- createServerComponentClient import 시도
- database.generated.ts 직접 import
- any 타입 사용
- fetch() 직접 호출

---

## 📞 긴급 참조

- 타입 오류: `npm run types:check` → 수동 수정
- 빌드 오류: 환경변수 확인 → Supabase 패턴 확인
- 인증 오류: getUser() 사용 확인
- 스타일 오류: Tailwind 클래스 확인

---

*이 문서는 Context 없는 AI의 치명적 실수를 방지하는 마지막 방어선입니다.*
*작업 시작 전 반드시 전체 내용을 숙지하세요.*