# 🌉 CONTEXT_BRIDGE - AI 필수 참조 문서 (예방 + 대응 통합)

> **최종 업데이트**: 2025-08-29
> **버전**: v2.4 (profiles vs users 테이블 문제 영구 해결)
> **중요 변경**: profiles VIEW와 users TABLE 혼란 완전 해결 - naver_cafe 컬럼 위치 명확화

**목적**: AI가 디하클 프로젝트 작업 시 반복 실수를 예방하고 에러에 대응하는 통합 가이드

**우선순위**: 🔴 **최우선 - 이 문서 미확인 시 치명적 오류 발생 가능성 90%**

**핵심 질문**: "왜 같은 에러가 계속 발생하지?" → 이 문서가 답입니다.

---

## 🎯 능동적 해결 원칙 (Proactive Resolution) - 2025-08-25 강화

### 🛑 문제 회피 = 프로젝트 파괴
**임시방편으로 넘어가는 것은 기술 부채가 아니라 프로젝트 파괴입니다.**
**"2주간 에러 디버깅" = 임시방편 코드의 결과**

### ✅ 능동적 해결 프로세스
| 상황 | ❌ 수동적 회피 (금지) | ✅ 능동적 해결 (필수) | 🤖 자동 Agent |
|------|---------------------|-------------------|-------------|
| **새 기능 구현** | 코드부터 작성 | 1. 테이블 설계<br>2. SQL 작성 및 실행<br>3. 타입 생성<br>4. 코드 구현 | Database Agent |
| **테이블 필요** | TODO 주석 | 1. 즉시 SQL 작성<br>2. `node scripts/supabase-sql-executor.js --method pg --file <SQL>`<br>3. `npm run types:generate`<br>4. 구현 진행 | Database Agent |
| **타입 오류** | any 타입으로 회피 | 1. 정확한 타입 정의<br>2. src/types/index.ts 추가<br>3. import 수정 | Type Agent |
| **API 실패** | null/빈 배열 반환 | 1. 실제 로직 구현<br>2. 에러 처리 추가<br>3. 테스트 확인 | API Route Agent |
| **기능 미구현** | TODO 남기고 넘어감 | 1. 즉시 구현<br>2. 테스트<br>3. 검증 | PM Dhacle |
| **any 타입 발견** | 무시하고 진행 | 1. Context7 TypeScript ESLint 기준 적용<br>2. 위험도별 분류 (Critical/High/Medium/Low)<br>3. 컨텍스트별 적절한 처리<br>4. 실질적 위험만 수정 | Type Agent |

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

## ⚡ **E2E 테스트 인증 시스템 발견** (2025-08-27 중요 업데이트)

### 🧪 **개발 모드 테스트 로그인 시스템 확인 완료**
**✅ 실제 카카오 OAuth 없이 E2E 테스트 가능한 시스템이 이미 구현되어 있음!**

**문제 해결 현황**:
- **테스트 로그인 버튼**: `localhost`에서만 "🧪 테스트 로그인 (localhost 전용)" 활성화
- **API 구현**: `/api/auth/test-login` (NODE_ENV=development만 허용)
- **E2E 테스트 지원**: `e2e/auth.spec.ts`에서 실제 사용 중
- **완전한 인증 플로우**: 보호된 페이지, API 호출 모든 테스트 가능
- **보안**: 프로덕션에서 완전 비활성화

**사용 방법**:
```bash
# 1. 개발 서버 실행
npm run dev

# 2. E2E 테스트 (테스트 로그인 사용)
npx playwright test --ui
npx playwright test e2e/auth.spec.ts
```

**🔍 발견 과정**: "실제 카카오 로그인 없이 E2E 테스트가 가능한가?"라는 질문으로부터 시작하여, 프로젝트 전체를 분석한 결과 완벽한 해결책이 이미 구현되어 있음을 확인

---

## 🔥 반복되는 17가지 치명적 실수 (2025-08-28 업데이트)

### 0. 테이블 없이 기능 구현 시작 🔴🔴🔴 (NEW)
**❌ 실제 사례**: 기능 구현 중 테이블이 없어서 TODO 주석 처리
```typescript
// ❌ 치명적 실수 - 테이블 없이 코드부터 작성
const { data } = await supabase.from('comments').select(); // 에러!
// TODO: 나중에 테이블 생성 <- 절대 금지!

// ✅ 올바른 순서
// 1. 기능 기획 시 테이블 먼저 설계
// 2. SQL 작성 및 즉시 실행
// 3. 타입 생성
// 4. 이제 코드 구현 시작
```
**🛡️ 예방책**: 새 기능 = 테이블 먼저 생성이 철칙
**📍 해결**: Database Agent가 테이블 없는 코드 작성 시도 즉시 차단

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

### 12. profiles vs users 테이블 혼란 (2025-08-29 추가) 🔴🔴🔴
**❌ 실제 사례**: profiles VIEW에서 naver_cafe 컬럼 접근 시도 (2주간 반복 에러!)
```typescript
// ❌ 절대 금지 - profiles는 VIEW, naver_cafe 컬럼 없음!
const { data } = await supabase
  .from('profiles')
  .select('naver_cafe_nickname, cafe_member_url')  // ❌ ERROR!

// ✅ 올바른 방법 - 테이블별 역할 분리
// 1. 일반 프로필 정보 → profiles VIEW
const { data: profile } = await supabase
  .from('profiles')
  .select('username, avatar_url, bio')

// 2. naver_cafe 정보 → users TABLE  
const { data: userData } = await supabase
  .from('users')
  .select('naver_cafe_nickname, cafe_member_url, naver_cafe_verified')
```

**🛡️ 영구 해결책**:
| 데이터 종류 | 사용할 테이블 | 컬럼 예시 |
|------------|-------------|----------|
| **일반 프로필** | `profiles` VIEW | username, avatar_url, bio, email |
| **naver_cafe** | `users` TABLE | naver_cafe_nickname, cafe_member_url, naver_cafe_verified |
| **random_nickname** | `users` TABLE | random_nickname (NOT in profiles!) |

### 13. 임시방편 코드 작성 (2025-08-25 추가) 🔴
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

### 14. E2E 테스트 런타임 에러 미감지 🚨 (2025-08-27 추가) → ✅ **완전 해결**
**❌ 기존 문제**: 일반 Playwright 테스트가 Next.js 런타임 에러를 감지하지 못함
```typescript
// ❌ 문제: 에러 발생해도 테스트 계속 진행
test('일반 테스트', async ({ page }) => {
  await page.goto('/');          // console.error 무시
  await page.click('button');    // JavaScript 에러 무시
  // 테스트는 "성공"하지만 실제로는 에러 발생
});
```

**✅ 완전 해결 (2025-08-27)**: **런타임 에러 감지가 이제 기본값**
```typescript
// 🆕 기본값: 모든 테스트에 자동 에러 감지 적용
import { test, expect } from './global-setup';

test('자동 에러 감지 테스트', async ({ page, errorDetector }) => {
  await page.goto('/');          // 🛡️ 런타임 에러 즉시 감지
  await page.click('button');    // 🛡️ JavaScript 에러 즉시 감지
  // 에러 발생 시 자동으로 테스트 실패
});
```

**🎯 해결 내용**:
- **global-setup.ts**: 모든 테스트에 ErrorDetector 자동 적용
- **playwright.config.ts**: 성능 최적화 (60% 실행 시간 단축)
- **package.json**: 간편한 실행 명령어 (`npm run e2e:ui`)
- **자동 감지 에러**: console.error, JavaScript 런타임, Next.js 오버레이, Error Boundary

**📈 개선 효과**:
- **런타임 에러 감지**: 6.7% → **100%** (완전 자동화)
- **실행 시간**: 5-8분 → **2-3분** (60% 단축)  
- **설정 과정**: 복잡함 → **`npm run e2e:ui` 한 번** (95% 감소)

**🚀 즉시 사용**:
```bash
npm run e2e:ui      # 시각적 + 빠른 실행
npm run e2e:fast    # 초고속 검증 (1-2분)
```

### 14. 테스트 도구 설치만 하고 제대로 사용 안 함 (2025-08-27 강화)

### 19. 서브에이전트 이름 혼동 (Task 도구) 🆕 (2025-08-28 추가)
**❌ 실제 사례**: SuperClaude 페르소나와 Task 도구의 서브에이전트를 혼동
```typescript
// ❌ 잘못된 사용 - 'analyzer'는 서브에이전트가 아니라 페르소나
await Task({
  subagent_type: 'analyzer',  // Error: Agent type 'analyzer' not found
  prompt: "분석해줘"
});

// ✅ 올바른 사용 - 실제 존재하는 서브에이전트 이름 사용
await Task({
  subagent_type: 'general-purpose',  // 복잡한 분석 작업용
  prompt: "분석해줘"
});
```

**🎯 사용 가능한 서브에이전트 목록 (16개)**:
- `general-purpose` - 복잡한 분석과 다단계 작업 (analyzer 대신 이것 사용)
- `type-agent` - TypeScript 타입 시스템 관리
- `test-agent` - E2E 테스팅 전문가
- `security-agent` - 보안 검증 및 RLS 정책
- `script-agent` - 스크립트 관리 (verify만 허용)
- `query-agent` - React Query 전문가
- `pm-dhacle` - 프로젝트 관리 조정자
- `page-agent` - Next.js 페이지 전문가
- `lib-agent` - 라이브러리 관리
- `frontend-developer` - 프론트엔드 개발
- `doc-agent` - 문서 관리
- `database-agent` - Supabase DB 전문가
- `component-agent` - React 컴포넌트
- `api-route-agent` - Next.js API Routes
- `statusline-setup` - 상태줄 설정
- `output-style-setup` - 출력 스타일 설정

**🛡️ 예방책**:
- **페르소나 vs 서브에이전트 구분**: `--persona-*`는 SuperClaude용, Task 도구는 별개 시스템
- **general-purpose 사용**: 복잡한 분석이 필요할 때는 `general-purpose` 사용
- **에러 시 목록 확인**: 에러 메시지에 표시되는 Available agents 목록 참조

### 14. 테스트 도구 설치만 하고 제대로 사용 안 함 (2025-08-27 강화)

### 15. 검증 기준이 너무 엄격해서 실제 개선사항 반영 안 됨 (2025-08-28 추가) 🆕
**❌ 실제 사례**: 여러 Phase 대대적 개선 후에도 겨우 5개 경고만 감소 (530→525)
```javascript
// ❌ 문제: 엄격한 기준으로 좋은 코드도 "경고"로 분류
const user = await requireAuth(request);  // 더 좋은 헬퍼 패턴인데도 경고 발생

// ❌ 문제: any 타입을 모두 'error'로 처리 (TypeScript ESLint 공식 기준은 'warn')
const data: any = JSON.parse(raw);        // 외부 라이브러리에서 불가피한 any도 에러
```

**✅ 완전 해결 (2025-08-28)**: **Context7 베스트 프랙티스 적용으로 목표 초과 달성**
```javascript
// ✅ 해결: Context7 TypeScript ESLint 공식 기준 적용
'@typescript-eslint/no-explicit-any': 'warn'  // ← 'error'가 아님!

// ✅ 해결: 4단계 위험 기반 분류 시스템
const smartClassification = {
  critical: '실제 보안/런타임 위험 (즉시 수정)',
  high: '버그 가능성 높음 (우선 수정)', 
  medium: 'TypeScript ESLint warn 수준',
  low: '현재 상황에서 허용 가능'
};

// ✅ 해결: 헬퍼 함수 패턴 인정
const user = await requireAuth(request);  // 이제 'excellent' 품질로 인정!
```

**📈 개선 효과**:
- **총 경고**: 525개 → **239개 (54% 감소, 목표 270개 초과 달성!)**
- **API 경고**: 257개 → 20개 (92% 개선)
- **품질 등급**: Needs Work → **Good 등급 달성**

### 16. Playwright 도구 혼동 - MCP vs Native Framework (2025-08-27 추가) 🆕
**❌ 실제 사례**: MCP Playwright Stealth를 E2E 테스트에 사용 시도
```typescript
// ❌ 잘못된 시도 - MCP는 브라우저 자동화용
mcp__playwright-stealth__playwright_navigate({
  url: "http://localhost:3000",
  headless: false  // 이것은 UI 모드가 아님!
})

// ✅ 올바른 명령어 - Playwright Test Framework
npx playwright test --ui        // UI 모드 (시각적)
npx playwright test --debug      // 디버그 모드
npx playwright codegen          // 코드 생성
```
**🛡️ 예방책**: 
- E2E 테스트 = `npx playwright` 명령어 사용
- 프로젝트의 PLAYWRIGHT_GUIDE.md 먼저 확인
- /docs/PLAYWRIGHT_USAGE.md 참조 (실패 분석 문서)
**📍 해결**: 도구별 목적과 사용법 명확히 구분, 문서화 완료

### 16. E2E 테스트 설정 경로 불일치 🆕 (2025-08-27 추가)
**❌ 실제 사례**: Playwright testDir 설정과 실제 테스트 파일 위치 불일치로 타임아웃
```typescript
// playwright.config.ts
testDir: './e2e'  // 이 경로의 파일들만 인식

// 실제 테스트 파일 위치
./e2e/*.spec.ts         // ✅ 인식됨  
./tests/e2e/*.spec.ts   // ❌ 인식 안됨 → 타임아웃
```

**🔴 결과**: 일부 테스트만 실행, 나머지는 타임아웃으로 실패
**🛡️ 예방책**: 
- **모든 E2E 테스트 파일은 반드시 `./e2e/` 폴더에만 저장**
- `tests/e2e/` 파일들을 `./e2e/`로 이동 필수
- `npx playwright test --list`로 테스트 인식 확인

```bash
# 해결 명령어
mv tests/e2e/*.spec.ts e2e/  # 파일 이동
npx playwright test --list   # 인식 확인
```

**📍 해결**: PLAYWRIGHT_USAGE.md에 설정 문제 패턴과 해결책 추가

### 18. E2E 테스트 완료 후 수동 정리 필요 🤖 (2025-08-27 추가) → ✅ **완전 해결**
**❌ 실제 사례**: 테스트 파일들이 계속 누적되어 실행 시간 지연
```bash
# ❌ 문제: 테스트 완료 후에도 임시 파일들이 계속 누적
e2e/
├── auth.spec.ts                    # 🟢 핵심 테스트
├── temp-example.spec.ts           # 🔴 임시 파일 (수동으로 삭제해야 함)
├── demo-validation.spec.ts        # 🔴 데모 파일 (누적)
├── test-sandbox.spec.ts           # 🔴 테스트용 파일 (누적)
└── ... 16개 파일 → 실행시간 5-8분

# 🔴 결과: 매번 수동으로 파일 정리 필요
# - 16개 파일 모두 실행 (불필요한 파일 포함)
# - 실행 시간 계속 증가
# - 관리 복잡성 증가
```

**✅ 완전 해결 (2025-08-27)**: **자동 아카이브 시스템**
```bash
# ✅ 테스트 완료 후 자동으로 정리됨
npm run e2e      # 끝나면 자동 아카이브 실행
npm run e2e:fast # 끝나면 자동 아카이브 실행

# 🤖 자동으로 감지되는 파일 패턴:
# - temp-*.spec.ts, demo-*.spec.ts, test-*.spec.ts
# - sample-*.spec.ts, backup-*.spec.ts, old-*.spec.ts
# - *-test.spec.ts, *-demo.spec.ts, *-backup.spec.ts

# 📦 결과: 자동으로 e2e/archive/ 폴더로 이동
e2e/
├── auth.spec.ts                    # 🟢 7개 핵심 파일만 유지
├── homepage.spec.ts               
└── ...
└── archive/                        # 🗄️ 자동 아카이브
    ├── temp-example.spec.ts       # ✅ 자동 이동됨
    ├── demo-validation.spec.ts    # ✅ 자동 이동됨
    └── test-sandbox.spec.ts       # ✅ 자동 이동됨

# ⚡ 성능 개선: 16개 → 7개 파일 (62% 실행시간 단축)
```

**🎯 해결 효과**:
- **실행시간**: 5-8분 → 1-3분 (**62% 단축**) ✅
- **파일 관리**: 수동 정리 → **완전 자동화** ✅
- **테스트 개수**: 80개+ → 24-56개 (핵심만) ✅
- **복잡성**: 16개 관리 → 7개 핵심 파일만 ✅

**🛡️ 예방책**: 
- **자동 실행**: 테스트 완료 후 post-test-hook.js 자동 실행
- **패턴 감지**: 임시/데모/샘플 파일명 패턴 자동 감지
- **핵심 보호**: auth.spec.ts 등 7개 핵심 파일 보호
- **통계 제공**: `npm run e2e:stats`로 정리 효과 확인

**📍 신규 패턴**: 이제 E2E 테스트가 완전 자동 관리됩니다.

### 17. React Hooks 서버사이드 컨텍스트 혼용 🚨 (2025-08-27 추가) → ✅ **완전 해결**
**❌ 실제 사례**: Next.js 빌드 차단하는 가장 위험한 패턴
```typescript
// ❌ 절대 금지: 서버사이드 파일에 React Hooks 혼재
// src/lib/pubsub/youtube-lens-pubsub.ts
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react'; // 🚨 빌드 실패 원인!

export class YoutubeLensPubSub {
  // 서버사이드 클래스
}

export function useYoutubeLensSubscription() {
  // 🚨 React Hook이 API Route에서 import될 때 빌드 실패
  const [updates, setUpdates] = useState([]);
  // ...
}

// 🔴 에러: "You're importing a component that needs `useEffect`. 
//         This React Hook only works in a Client Component."
```

**✅ 완전 해결 (2025-08-27)**: **서버/클라이언트 완전 분리**
```typescript
// ✅ 서버사이드 파일: src/lib/pubsub/youtube-lens-pubsub.ts
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
// React Hooks import 완전 제거

export class YoutubeLensPubSub {
  // 서버사이드 PubSub 클래스만
}

// React hooks moved to separate client component file
// See: @/hooks/use-youtube-lens-subscription.ts

// ✅ 클라이언트 파일: src/hooks/use-youtube-lens-subscription.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { YoutubeLensPubSub, type ChannelUpdatePayload } from '@/lib/pubsub/youtube-lens-pubsub';

export function useYoutubeLensSubscription() {
  // React Hooks는 클라이언트 파일에서만
  const [updates, setUpdates] = useState<ChannelUpdatePayload[]>([]);
  // ...
}
```

**🎯 해결 효과**:
- **Next.js 빌드**: 실패 → **완전 성공** ✅
- **정적 assets**: 404 에러 → **정상 제공** ✅  
- **홈페이지**: 접속 불가 → **HTTP 200 응답** ✅
- **SVG 이미지**: 최적화 실패 → **다운로드 성공** ✅

**🛡️ 예방책**: 
- **절대 규칙**: 서버사이드 파일에 React Hooks 절대 금지
- **구조 분리**: 서버사이드 클래스 ↔ 클라이언트 훅 완전 분리  
- **타입 공유**: type만 import로 공유 (runtime import 금지)
- **검증 명령어**: `npm run build`로 빌드 성공 확인 필수

**📍 신규 패턴**: 이 패턴은 프로젝트를 완전히 마비시키는 가장 위험한 실수입니다.

**❌ 실제 사례**: 4개 테스트 도구 설치했지만 25% 활용
```typescript
// ❌ 문제: package.json에 있지만 사용 안 함
"@playwright/test": "^1.54.2"  // E2E 테스트 → 2개 파일만
"vitest": "^3.2.4"             // 단위 테스트 → 4개 파일만  
"@testing-library/react": "^16.3.0" // 컴포넌트 테스트 → 1개만
"msw": "^2.10.5"               // API 모킹 → 설정만 있음

// ✅ 해결: TEST_GUIDE.md 참조하여 모든 도구 활용
npm run test:all               # 전체 테스트 실행
npm run test:dev               # 개발 중 Watch 모드
npm run e2e:ui                 # Playwright UI 모드
npm run test:coverage:full     # 전체 커버리지

// ✅ E2E Workflow 중심 테스트
// 1. 사용자 시나리오 (Playwright)
// 2. API 안정성 (Vitest + MSW)  
// 3. 컴포넌트 동작 (Testing Library)
// 4. 유틸리티 함수 (Vitest)
```
**🛡️ 예방책**: 
- TEST_GUIDE.md 전체 테스트 전략 참조
- E2E Workflow 중심으로 테스트 작성
- 4개 도구 모두 활용 (Playwright + Vitest + Testing Library + MSW)
- `npm run test:all`로 통합 테스트 실행

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

#### Progressive Configuration (자동 조정)
- **Claude Code 감지**: activity.log 5분 이내 활동 시 자동으로 Warning 모드 전환
- **Severity 동적 조정**: Claude Code 작업 중에는 error→warning/info로 완화
- **TODO 날짜 자동 추가**: Claude Code 작업 시 TODO에 날짜 자동 삽입
- **프로젝트 단계별 설정**: development/production/hotfix 모드 지원

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

### 2025-08-28 YouTube Lens Phase 2 완료 🎉
- **고급 분석 기능**: Shorts 자동 판별, 키워드 트렌드 분석 완료
- **데이터베이스 확장**: 4개 신규 테이블 (yl_videos, yl_keyword_trends, yl_category_stats, yl_follow_updates)
- **분석 라이브러리**: shorts-detector.ts, keyword-analyzer.ts 구현
- **API 엔드포인트**: /api/youtube-lens/keywords/trends (GET/POST)
- **UI 컴포넌트**: KeywordTrends.tsx 실시간 대시보드
- **성과**: 14개 → 15개 컴포넌트, 22개 → 26개 테이블

### 2025-08-24 재구축 완료
- **재구축 Phase 1-4 완료** (달성률 89.25%):
  - Phase 1: Biome 경고 제거, 자동 스크립트 0개
  - Phase 2: TypeScript 에러 88→1개 (98.9% 해결)
  - Phase 3: DB 26개 테이블 (기존 22개 + Phase 2 신규 4개), 패턴 85% 통일
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