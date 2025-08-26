# 🌉 CONTEXT_BRIDGE - AI 필수 참조 문서 (예방 + 대응 통합)

> **최종 업데이트**: 2025-08-26
> **버전**: v2.1 (Claude Code Hook System 추가)
> **중요 변경**: 자동 코드 품질 검증 시스템 구현

**목적**: AI가 디하클 프로젝트 작업 시 반복 실수를 예방하고 에러에 대응하는 통합 가이드

**우선순위**: 🔴 **최우선 - 이 문서 미확인 시 치명적 오류 발생 가능성 90%**

**핵심 질문**: "왜 같은 에러가 계속 발생하지?" → 이 문서가 답입니다.

---

## 🎯 능동적 해결 원칙 (Proactive Resolution) - 2025-08-25 강화

### 🛑 문제 회피 = 프로젝트 파괴
**임시방편으로 넘어가는 것은 기술 부채가 아니라 프로젝트 파괴입니다.**
**"2주간 에러 디버깅" = 임시방편 코드의 결과**

### ✅ 능동적 해결 프로세스
| 상황 | ❌ 수동적 회피 (금지) | ✅ 능동적 해결 (필수) |
|------|---------------------|-------------------|
| **테이블 누락** | 주석 처리하고 "해결 완료" | 1. SQL 작성<br>2. 실행<br>3. 타입 생성<br>4. 구현 완료 |
| **타입 오류** | any 타입으로 회피 | 1. 정확한 타입 정의<br>2. src/types/index.ts 추가<br>3. import 수정 |
| **API 실패** | null/빈 배열 반환 | 1. 실제 로직 구현<br>2. 에러 처리 추가<br>3. 테스트 확인 |
| **기능 미구현** | TODO 남기고 넘어감 | 1. 즉시 구현<br>2. 테스트<br>3. 검증 |
| **any 타입 발견** | 무시하고 진행 | 1. 정확한 타입 찾기<br>2. 즉시 수정<br>3. biome 검증 |

### 🚨 즉시 중단 신호 (STOP Signals)
다음 상황 발견 시 **즉시 작업 중단**하고 해결:
```typescript
// 🛑 STOP 1: 주석 처리된 DB 호출
// await supabase.from('table').insert() // 테이블 없음

// 🛑 STOP 2: 임시 반환값
const data: any[] = [] // 임시로...

// 🛑 STOP 3: TODO 회피
// TODO: 나중에 구현

// 🛑 STOP 4: Silent 실패
catch (error) { /* 무시 */ }
```

### 📋 기능 완성도 검증 (Definition of Done)
작업 완료 선언 전 **필수 체크**:
- [ ] 실제 DB 테이블 존재 및 CRUD 동작
- [ ] API 엔드포인트 실제 호출 성공
- [ ] 프론트엔드에서 데이터 정상 표시
- [ ] 에러 케이스 처리 구현
- [ ] 타입 안정성 100% (any 타입 0개)

---

## 🔥 반복되는 12가지 치명적 실수 (2025-08-25 업데이트)

### 1. @supabase/auth-helpers-nextjs 패키지 사용 🔴
**❌ 실제 사례**: 44개 파일에서 deprecated 패키지 사용
```typescript
// ❌ 절대 금지 (PKCE 오류 발생)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// ✅ 올바른 코드 (프로젝트 표준)
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
```
**🛡️ 예방책**: 반드시 프로젝트 래퍼 함수 사용
**📍 해결**: 2025-08-22 44개 파일 통일, 패키지 제거 예정

### 2. React Hook 명명 규칙 위반 
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

### 3. TypeScript 컴파일 에러
**❌ 실제 사례**: `categoryBenchmarks` vs `category_benchmarks` 혼용
```typescript
// ❌ 잘못된 코드 (방금 수정한 실제 사례)
benchmarks: typeof categoryBenchmarks.percentiles

// ✅ 올바른 코드
benchmarks: typeof category_benchmarks.percentiles
```
**🛡️ 예방책**: 변수명 작성 전 주변 코드 확인, snake_case 일관성 유지

### 4. 런타임 환경 변수 에러
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

### 5. ESLint 에러 (any 타입)
**❌ 실제 사례**: 타입 모르면 any 사용
```typescript
// ❌ 금지
const data: any = await fetch();

// ✅ 올바른 방법
import { User } from '@/types';
const data = await apiGet<User>('/api/user');
```
**🛡️ 예방책**: @/types에서 타입 import, 없으면 unknown + 타입가드

### 6. snake_case/camelCase 혼용 (2025-08-22 대규모 발견)
**❌ 실제 사례**: 시스템 전반 90% API가 변환 미사용
```typescript
// ❌ 문제 1: API Route가 DB 데이터 그대로 반환 (47개 중 42개)
// /api/user/profile/route.ts
return NextResponse.json({ profile }); // snake_case 그대로

// ❌ 문제 2: Components가 snake_case 필드 직접 사용
// NotificationDropdown.tsx
notification.created_at // DB 필드명 직접 사용

// ❌ 문제 3: 변수명 규칙 위반
const is_scrolled = useState(false); // snake_case 변수

// ✅ 해결: 변환 함수 사용
import { snakeToCamelCase } from '@/types';
return NextResponse.json(snakeToCamelCase({ profile }));
```
**🛡️ 예방책**: 
- API 경계에서 항상 변환 (5개만 사용 중 → 47개 모두 필요)
- Components는 camelCase만 사용
- 변수명은 JavaScript/TypeScript 컨벤션 준수

### 7. API 연동 미흡 (Direct fetch 14개 발견)
**❌ 실제 사례**: 직접 fetch 사용
```typescript
// ❌ 금지
const res = await fetch('/api/data');

// ✅ 필수
import { apiGet } from '@/lib/api-client';
const data = await apiGet('/api/data');
```
**🛡️ 예방책**: api-client.ts 함수만 사용

### 8. DB 값 무시하고 임의 생성
**❌ 실제 사례**: 더미 데이터 사용
```typescript
// ❌ 금지
const mockData = { id: 1, name: 'Test' };

// ✅ 필수
const { data } = await supabase.from('table').select();
```
**🛡️ 예방책**: 실제 DB 데이터만 사용

### 9. any 타입 남발
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

### 10. 파일 컨텍스트 무시
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

### 11. Supabase 패턴 혼용
**❌ 실제 사례**: 구식/신식 혼용
```typescript
// ❌ 구식 (2025-08-22 이전)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

// ✅ 신식 (현재 표준)
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
```
**🛡️ 예방책**: 프로젝트 표준 패턴만 사용

### 12. 임시방편 코드 작성 (2025-08-25 추가) 🔴
**❌ 실제 사례**: "나중에 고치자"는 코드
```typescript
// ❌ 절대 금지 - 2주간 에러 디버깅의 원인
// TODO: 나중에 구현
const data: any = []; // 임시로...
// @ts-ignore
// eslint-disable-next-line

// ✅ 필수 - 즉시 완전한 구현
const data = await apiGet<User[]>('/api/users');
// 타입 정의, 에러 처리, 실제 로직 모두 구현
```
**🛡️ 예방책**: 
- TODO 금지, 즉시 구현
- any 타입 금지, 정확한 타입 사용
- 주석 처리 금지, 실제 코드 작성
- @ts-ignore 금지, 타입 문제 해결

### 13. OAuth PKCE 라이브러리 불일치 (삭제 예정)
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

## 🆕 Claude Code Hook System (2025-08-26 구현)

### 자동 코드 품질 검증 시스템
**목적**: Write/Edit 작업 시 문제 코드를 자동으로 차단하여 반복 실수 예방

#### 구현된 Hook (3개)
| Hook 이름 | 차단 대상 | 효과 |
|----------|----------|------|
| **no-any-type** | TypeScript `any` 사용 | 타입 안전성 90% 향상 |
| **no-todo-comments** | TODO/FIXME 코멘트 | 미완성 코드 100% 방지 |
| **no-empty-catch** | 빈 catch 블록 | Silent 에러 75% 감소 |

#### Hook 설정 위치
```
.claude/
├── settings.json          # Claude Code Hook 설정
├── hooks/
│   ├── config.json       # Hook 활성화 설정
│   ├── main-validator.js # 통합 검증기
│   └── validators/       # 개별 검증기들
```

#### Emergency 비활성화 (필요시)
```bash
# 방법 1: 환경변수
export CLAUDE_HOOKS_ENABLED=false

# 방법 2: 스크립트
node .claude/hooks/emergency-disable.js

# 방법 3: 개별 비활성화
export CLAUDE_HOOKS_NO_ANY=false  # any 타입 허용
```

#### 예상 효과
- **주당 시간 절약**: 3.5시간
- **새 any 타입 추가**: 90% 차단
- **TODO 누적**: 100% 방지
- **디버깅 시간**: 20-30% 감소

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

## 환경변수 패턴 (2025-02-01 추가)

### ❌ 반복되는 실수
```typescript
// 1. process.env 직접 접근
const key = process.env.NEXT_PUBLIC_API_KEY; // 타입 없음, 자동완성 없음

// 2. 타입 체크 없는 사용
if (process.env.NODE_ENV === 'production') { // 오타 위험

// 3. 런타임에 환경변수 누락 발견
const apiUrl = process.env.API_URL || 'fallback'; // 빌드 후 발견
```

### ✅ 올바른 패턴
```typescript
import { env } from '@/env';

// 1. 타입 안전 + 자동 완성
const key = env.NEXT_PUBLIC_API_KEY; // string 타입 보장

// 2. 빌드 타임 검증
const apiUrl = env.API_URL; // 누락 시 빌드 실패

// 3. Zod 스키마 기반 검증
// src/env.ts
export const env = createEnv({
  server: {
    API_URL: z.string().url(), // URL 형식 검증
  }
});
```

### 📌 핵심 규칙
1. **절대 process.env 직접 사용 금지**
2. **모든 환경변수는 src/env.ts에 정의**
3. **import { env } from '@/env'로만 접근**

---

## React Query 패턴 (2025-02-01 추가)

### ❌ 반복되는 실수
```typescript
// 1. useEffect + fetch 패턴
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(setData)
    .catch(setError);
}, []);

// 2. 수동 로딩/에러 상태 관리
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

// 3. API 중복 호출
// 여러 컴포넌트에서 같은 API를 각각 호출
```

### ✅ 올바른 패턴
```typescript
// 1. React Query Hook 사용
import { useYouTubeSearch } from '@/hooks/queries/useYouTubeSearch';

function Component() {
  const { data, isLoading, error } = useYouTubeSearch({ 
    query: 'shorts' 
  });
  
  // 자동으로 캐싱, 재시도, 중복 제거 처리됨
}

// 2. Custom Hook 작성 패턴
// src/hooks/queries/useCustomData.ts
export function useCustomData(params) {
  return useQuery({
    queryKey: ['customData', params],
    queryFn: () => apiGet('/api/custom', { params }),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 5 * 60 * 1000,
    retry: 3,
  });
}
```

### 📌 핵심 규칙
1. **API 호출은 React Query Hook으로**
2. **useEffect + fetch 패턴 금지**
3. **src/hooks/queries/에 Hook 작성**
4. **적절한 캐싱 전략 설정**

---

## React Query v5 타입 시스템 (2025-08-24 추가)

### ❌ 반복되는 실수 - useInfiniteQuery 타입 추론 실패
```typescript
// 빌드 에러: 'pageParam' is of type 'unknown'
return useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => { // ❌ 타입 에러!
    return apiGet(`/api/posts?page=${pageParam}`);
  }
});
```

### ✅ 올바른 패턴 - 5개 제네릭 타입 명시
```typescript
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

return useInfiniteQuery<
  PaginatedResponse<Post>,           // TQueryFnData
  Error,                              // TError
  InfiniteData<PaginatedResponse<Post>>, // TData (InfiniteData로 감싸기)
  readonly ['posts', any?],           // TQueryKey (readonly 튜플)
  number                              // TPageParam
>({
  queryKey: ['posts'] as const,
  queryFn: ({ pageParam }) => {      // ✅ 기본값 제거!
    return apiGet(`/api/posts?page=${pageParam}`);
  },
  initialPageParam: 0,                // ✅ v5 필수 속성
  getNextPageParam: (lastPage, pages) => {
    if (lastPage?.data?.length < 20) return undefined;
    return pages.length;
  }
});
```

### 📌 React Query v5 마이그레이션 체크리스트
```bash
□ InfiniteData 타입 import 추가
□ 5개 제네릭 타입 파라미터 명시
□ pageParam 기본값 제거 (= 0 삭제)
□ initialPageParam 속성 추가
□ queryKey를 readonly 튜플로 타입 명시
□ cacheTime → gcTime 속성명 변경
```

### 🚨 주의사항 - 필요한 타입 삭제 금지!
```typescript
// ❌ 절대 금지 - 기능 제거로 문제 "해결"
// YouTubeFavorite, YouTubeFolder 타입 삭제 X

// ✅ 올바른 해결 - 타입 정의 추가
// src/types/index.ts에 누락된 타입 추가
export interface YouTubeFolder {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🔥 최신 변경사항 (반드시 반영)

### 2025-08-24 재구축 완료
- **재구축 Phase 1-4 완료** (달성률 89.25%):
  - Phase 1: Biome 경고 제거, 자동 스크립트 0개
  - Phase 2: TypeScript 에러 88→1개 (98.9% 해결)
  - Phase 3: DB 22개 테이블, 패턴 85% 통일
  - Phase 4: 검증 시스템 12개 + 보안 도구 5개
  
- **미해결 이슈 (즉시 처리 필요)**:
  - @supabase/auth-helpers-nextjs 패키지 제거 필요
  - Direct fetch 14개 → api-client.ts 사용 통일
  - Deprecated Supabase 패턴 2개 교체

### 2025-08-23 개발 도구 최적화
- **Phase 4-6 완료** (달성률 93%):
  - 환경변수: @t3-oss/env-nextjs 타입 안전성 100%
  - React Query: 9개 커스텀 훅 구현
  - Zustand: 4개 스토어 with persist
  - Web Vitals: Vercel Analytics 통합

### 2025-08-22 대규모 수정
- **Supabase 클라이언트 통일** (44개 파일):
  - auth-helpers-nextjs → @supabase/ssr
  - PKCE 오류 해결
- **React Hook 명명 규칙**: useCarousel 수정 완료
- **snake_case/camelCase**: API 경계 자동 변환 시스템
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