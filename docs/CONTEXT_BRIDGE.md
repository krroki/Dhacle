# 🌉 CONTEXT_BRIDGE - AI 필수 참조 문서 (예방 + 대응 통합)

**목적**: AI가 디하클 프로젝트 작업 시 반복 실수를 예방하고 에러에 대응하는 통합 가이드

**우선순위**: 🔴 **최우선 - 이 문서 미확인 시 치명적 오류 발생 가능성 90%**

**핵심 질문**: "왜 같은 에러가 계속 발생하지?" → 이 문서가 답입니다.

---

## 🔥 반복되는 10가지 치명적 실수 (작업 전 반드시 확인!)

### 1. React Hook 명명 규칙 위반 🆕 
**❌ 실제 사례**: snake_case 마이그레이션 시 React Hook까지 변환
```typescript
// ❌ 잘못된 코드 (2025-08-22 빌드 실패 원인)
function use_carousel() {
  const context = React.useContext(CarouselContext);

// ✅ 올바른 코드 (2025-08-22 해결 - 커밋 0216489)
function useCarousel() {
  const context = React.useContext(CarouselContext);
```
**🛡️ 예방책**: React Hook은 반드시 `use`로 시작하는 camelCase 유지
**📍 해결**: carousel.tsx의 모든 use_carousel 호출을 useCarousel로 수정 완료

### 2. TypeScript 컴파일 에러
**❌ 실제 사례**: `categoryBenchmarks` vs `category_benchmarks` 혼용
```typescript
// ❌ 잘못된 코드 (방금 수정한 실제 사례)
benchmarks: typeof categoryBenchmarks.percentiles

// ✅ 올바른 코드
benchmarks: typeof category_benchmarks.percentiles
```
**🛡️ 예방책**: 변수명 작성 전 주변 코드 확인, snake_case 일관성 유지

### 3. 런타임 환경 변수 에러
**❌ 실제 사례**: Vercel 빌드 시 환경변수 없음
```typescript
// ❌ 문제 코드
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// 빌드 시 "NEXT_PUBLIC_SUPABASE_URL required" 에러

// ✅ 해결 코드
export const dynamic = 'force-dynamic';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
```
**🛡️ 예방책**: Server Component에 `force-dynamic` 추가

### 4. ESLint 에러 (any 타입)
**❌ 실제 사례**: 타입 모르면 any 사용
```typescript
// ❌ 금지
const data: any = await fetch();

// ✅ 올바른 방법
import { User } from '@/types';
const data = await apiGet<User>('/api/user');
```
**🛡️ 예방책**: @/types에서 타입 import, 없으면 unknown + 타입가드

### 5. snake_case/camelCase 혼용
**❌ 실제 사례**: DB 필드명 그대로 사용
```typescript
// ❌ 문제: DB는 snake_case, 프론트는 camelCase
user.created_at // DB 필드명
user.createdAt // 프론트엔드 필드명

// ✅ 해결: 변환 함수 사용
import { snakeToCamelCase } from '@/types';
const userData = snakeToCamelCase(dbData);
```
**🛡️ 예방책**: API 경계에서 항상 변환

### 6. API 연동 미흡
**❌ 실제 사례**: 직접 fetch 사용
```typescript
// ❌ 금지
const res = await fetch('/api/data');

// ✅ 필수
import { apiGet } from '@/lib/api-client';
const data = await apiGet('/api/data');
```
**🛡️ 예방책**: api-client.ts 함수만 사용

### 7. DB 값 무시하고 임의 생성
**❌ 실제 사례**: 더미 데이터 사용
```typescript
// ❌ 금지
const mockData = { id: 1, name: 'Test' };

// ✅ 필수
const { data } = await supabase.from('table').select();
```
**🛡️ 예방책**: 실제 DB 데이터만 사용

### 8. any 타입 남발
**❌ 실제 사례**: 에러 처리 시 any
```typescript
// ❌ 금지
catch (error: any) { console.log(error.message) }

// ✅ 올바른 방법
catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
}
```
**🛡️ 예방책**: unknown 사용 후 타입 체크

### 9. 파일 컨텍스트 무시
**❌ 실제 사례**: Read 없이 수정
```typescript
// ❌ 금지: 추측으로 코드 수정
// "아마 이럴 것이다" 방식

// ✅ 필수: Read → 이해 → Edit
// 1. Read로 파일 확인
// 2. 주변 패턴 파악
// 3. 일관성 있게 수정
```
**🛡️ 예방책**: 수정 전 반드시 Read 실행

### 10. Supabase 패턴 혼용
**❌ 실제 사례**: 구식/신식 혼용
```typescript
// ❌ 구식 (2025-08-22 이전)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// ✅ 신식 (현재 표준)
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
```
**🛡️ 예방책**: 프로젝트 표준 패턴만 사용

### 11. OAuth PKCE 라이브러리 불일치 🆕
**❌ 실제 사례**: Kakao 로그인 PKCE 에러 (2025-08-22)
```typescript
// ❌ 문제 원인: auth-helpers-nextjs와 @supabase/ssr 혼용
// auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// ✅ 해결: 프로젝트 표준 패턴 통일 (커밋 해시 추가 예정)
// auth/callback/route.ts
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
// middleware.ts - @supabase/ssr 직접 사용
import { createServerClient } from '@supabase/ssr';
```
**🛡️ 예방책**: OAuth 플로우 전체에서 동일한 Supabase 클라이언트 라이브러리 사용
**📍 증상**: "code challenge does not match previously saved code verifier" 에러

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

### 2025-08-22 업데이트 (최신)
- **Kakao 로그인 PKCE 오류 해결** (44개 파일 수정 완료):
  - 원인: `@supabase/auth-helpers-nextjs`와 `@supabase/ssr` 라이브러리 혼용
  - 증상: "code challenge does not match previously saved code verifier" 에러
  - 해결: 전체 프로젝트 Supabase 클라이언트 패턴 통일
    - API Routes: `createSupabaseRouteHandlerClient()` 사용
    - Client Components: `createBrowserClient()` 사용
    - 44개 파일 모두 `@supabase/auth-helpers-nextjs` 제거 완료
  - 교훈: OAuth 플로우 전체에서 동일한 Supabase 클라이언트 라이브러리 사용 필수

- **Vercel 빌드 실패 완전 해결** (커밋 0216489):
  - React Hook 명명 규칙 위반 수정: `use_carousel` → `useCarousel`
  - TypeScript 타입 가드 추가: unknown 타입 접근 시 명시적 체크
  - typed-client.ts: result 객체 검증 로직 강화
  - youtube/api-client.ts: API 응답 배열 타입 가드 추가

- **YouTube Lens Popular Shorts 개선**:
  - Silent 에러 처리 제거 → 모든 catch 블록에 console.error 추가
  - YouTube API mostPopular 차트 전략 추가 (키워드 없는 검색 해결)
  - Shorts 필터링 60초 → 90초로 완화 (더 많은 콘텐츠 포착)
  - API 키 환경변수 fallback 로직 추가
- **React Hook 명명 규칙 위반 수정**: use_carousel → useCarousel (빌드 실패 해결)
- **API Route 내부 함수 반환 타입 추가**: Promise 타입 명시로 TypeScript 에러 해결
- **Unknown 타입 가드 추가**: typed-client.ts에 null/undefined 체크 로직 추가
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

## 🎯 에러 처리 패턴 (2025-08-22 추가)

### TypeScript Unknown 타입 가드 패턴
```typescript
// ❌ 금지 - unknown 타입 직접 접근
const result = await someFunction() as unknown;
result.data; // TypeScript 에러!

// ✅ 필수 - 타입 가드 사용
const result = await someFunction();
if (result && typeof result === 'object' && 'data' in result) {
  const typedResult = result as { data?: unknown };
  if (typedResult.data !== null && typedResult.data !== undefined) {
    // 안전하게 접근
  }
}
```

### Silent 에러 금지
```typescript
// ❌ 절대 금지 - Silent failure
try {
  await someOperation();
} catch (error) {
  // 아무것도 안함 - 문제를 숨김!
}

// ✅ 필수 - 상세한 로깅
try {
  await someOperation();
} catch (error: unknown) {
  console.error('[Context] Operation failed:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context: { /* 관련 정보 */ }
  });
  // 필요시 재시도 또는 fallback
}
```

### API 전략 패턴 (Fallback)
```typescript
// ✅ 여러 전략 시도 패턴
enum Strategy {
  PRIMARY = 'primary',
  FALLBACK = 'fallback',
  EMERGENCY = 'emergency'
}

async function fetchWithStrategy() {
  const strategies = [Strategy.PRIMARY, Strategy.FALLBACK, Strategy.EMERGENCY];
  
  for (const strategy of strategies) {
    try {
      return await executeStrategy(strategy);
    } catch (error) {
      console.error(`[Strategy ${strategy}] Failed:`, error);
      // 다음 전략 시도
    }
  }
  throw new Error('All strategies failed');
}
```

### 환경변수 Fallback
```typescript
// ✅ 환경변수 우선순위 패턴
const apiKey = 
  userApiKey ||                    // 1. 사용자 설정 키
  process.env.YOUTUBE_API_KEY ||   // 2. 환경변수
  null;                            // 3. 없으면 에러

if (!apiKey) {
  console.error('[API] No API key available:', {
    hasUserKey: Boolean(userApiKey),
    hasEnvKey: Boolean(process.env.YOUTUBE_API_KEY)
  });
  throw new Error('API key required');
}

---

## 🚀 올바른 작업 프로세스

1. **Read First**: 코드 수정 전 반드시 Read로 현재 코드 확인
2. **Check Patterns**: 위 필수 확인 명령어 실행
3. **Manual Fix**: 자동 스크립트 대신 수동 수정
4. **Verify**: 빌드 및 타입 체크 확인

---

## 📝 작업 시점별 필수 체크리스트

### 🔨 기능 구현 시작 전
```bash
□ Read로 관련 파일 확인
□ 주변 코드 패턴 파악 (snake_case? camelCase?)
□ @/types에서 필요한 타입 확인
□ api-client.ts 함수 확인 (apiGet, apiPost 등)
□ DB 테이블 존재 여부 확인
```

### 🐛 버그 수정 시작 전
```bash
□ 에러 메시지 정확히 읽기
□ Read로 해당 파일 전체 컨텍스트 확인
□ 관련 import 경로 확인
□ 타입 정의 위치 확인 (@/types만!)
□ 환경변수 관련이면 force-dynamic 확인
```

### 📦 컴파일/빌드 전
```bash
□ npx tsc --noEmit 실행 (타입 체크)
□ any 타입 검색: grep -r ": any" src/
□ 구식 패턴 검색: grep -r "createServerComponentClient"
□ 직접 import 검색: grep -r "database.generated"
□ fetch 직접 사용 검색: grep -r "fetch(" src/
```

### 🚀 배포/커밋 전
```bash
□ npm run build 성공 확인
□ npm run lint:biome 실행
□ npm run verify:types 실행
□ 테스트 파일 삭제 확인
□ 더미 데이터 제거 확인
```

### 💥 에러 발생 시
```bash
□ ERROR_BOUNDARY.md의 9가지 패턴 확인
□ snake_case/camelCase 문제인지 확인
□ Supabase 패턴 문제인지 확인
□ 타입 import 경로 문제인지 확인
□ 환경변수 문제인지 확인
```

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