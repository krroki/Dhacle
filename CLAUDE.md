# 📋 Claude AI 작업 지침서

*목적: AI가 디하클(Dhacle) 프로젝트 작업 시 따라야 할 규칙과 프로세스*
*업데이트: 새로운 작업 패턴이나 금지사항 발견 시에만*

---

## 🚨 최우선 필수 수칙 (반드시 먼저 읽기)

### 🔴 AI 필수 행동 수칙
- **코드 수정 전 반드시 Read 도구로 현재 코드 확인** - 추측 기반 해결책 제시 금지
- **문서 내용보다 실제 코드를 우선 신뢰** - "문서는 참고, 코드가 진실"
- **확실하지 않으면 "추정", "아마도" 명시** - 과도한 자신감 금지
- **이미 올바른 코드는 수정하지 않기** - 최소 수정 원칙
- **테스트 파일은 테스트 완료 시 반드시 삭제** - 임시 테스트 파일 방치 금지

### 🚫 코드 자동 변환 스크립트 절대 금지 (2025-01-31 추가, 2025-02-21 강화)
**❌ 절대 금지: 코드를 일괄 변경하는 자동 스크립트 생성**
- **위험한 점**:
  1. 일괄 변경: 파일별 컨텍스트 무시하고 패턴만 보고 바꿔버림
  2. 예측 불가: 어떤 부수효과가 생길지 모름
  3. 되돌리기 어려움: Git에 커밋 안했으면 복구 힘듦
  4. **역사적 교훈**: 2025년 1월, 38개 자동 스크립트로 인한 "에러 지옥" 경험

**📚 필독 문서**:
- `docs/CRITICAL_TYPE_SYSTEM_RECOVERY_PLAN.md` - 타입 시스템 복구 계획
- `docs/AUTOMATION_SCRIPT_GUIDELINES.md` - 자동화 스크립트 가이드라인

**✅ 허용되는 것**:
- 검증 스크립트 (verify-*.js): 문제 찾기만 하고 수정 안함
- 검사 스크립트 (check-*.js): 상태 확인만 함
- 수동 수정: 파일 컨텍스트 이해하고 필요한 부분만 수정

**올바른 접근법**:
```bash
# ❌ 금지: 자동 변환 스크립트
node scripts/fix-all-errors.js  # 금지!
node scripts/migrate-to-snake-case.js  # 금지!

# ✅ 권장: 검증 후 수동 수정
npm run verify:types  # 문제 확인
# 각 파일을 Read로 읽고 컨텍스트 이해 후 Edit로 수정
```

### ⚡ 빌드 오류 시 긴급 대응 (2025-08-22 업데이트)

#### 🔴 Vercel 빌드 실패 시 체크리스트
1. **먼저 확인**: Vercel이 어떤 커밋을 빌드하는지 확인
   - Vercel Dashboard에서 Building commit 해시 확인
   - 로컬과 동일한지 확인: `git log --oneline -1`
2. **커밋 불일치 시**: 
   - 로컬 변경사항 커밋: `git add . && git commit -m "fix: ..."`
   - 푸시: `git push origin <branch>`
3. **DB 테이블 오류 시**:
   ```bash
   node scripts/verify-with-service-role.js  # 테이블 확인
   node scripts/supabase-sql-executor.js --method pg --file <SQL파일>
   npm run types:generate  # 타입 재생성
   ```
4. **TypeScript 오류 시**:
   - ❌ 자동 수정 스크립트 사용 금지!
   - ✅ 각 파일 Read로 읽고 컨텍스트 이해 후 수정
   - API Route는 반드시 `Promise<NextResponse>` 반환 타입 명시

> **교훈**: "4일간 디버깅" 문제는 대부분 Vercel이 오래된 커밋을 빌드하기 때문!

### 🔥 snake_case/camelCase 변환 시스템 (2025-08-22 React Hook 이슈 해결 완료)
**API 경계에서만 자동 변환 - React 예약어 보호**
```bash
# ⚠️ 주의: React Hook은 반드시 camelCase 유지!
# use_carousel (❌) → useCarousel (✅) - 2025-08-22 수정 완료

# snake_case 일관성 검증 (최우선 실행)
node scripts/verify-case-consistency.js  # 전체 검증
node scripts/demo-case-conversion.js     # 변환 시연

# 핵심 파일 위치
src/lib/api-client.ts        # API 경계 자동 변환
src/lib/utils/case-converter.ts  # React 보호 변환 유틸
.husky/pre-commit            # snake_case 차단 Hook
src/components/ui/carousel.tsx  # React Hook 수정 완료 (useCarousel)
```

### 🤖 Claude Code 자동 스크립트 사용 체계
**상황별 자동 실행 스크립트 (AI가 자동으로 사용)**
```bash
# DB 관련 오류/이슈 발생 시
node scripts/supabase-sql-executor.js --method pg --file <SQL파일>  # SQL 실행
node scripts/verify-with-service-role.js                             # 테이블 검증
node scripts/security/validate-rls.js                                # RLS 상태 확인

# TypeScript 타입 오류 시
npm run types:generate    # DB에서 타입 재생성
npm run types:check       # 타입 체크
# npm run types:auto-fix  # ⚠️ 주의: 자동 수정 사용 신중히

# 보안 점검 필요 시
npm run security:test            # 보안 테스트
npm run security:apply-rls-all   # RLS 정책 적용
node scripts/security/validate-rls.js  # RLS 검증

# API 일치성 문제 시
node scripts/verify-api-consistency.js  # API 일치성 검사
# node scripts/fix-api-consistency.js   # ❌ 삭제됨 (2025-01-31)

# 빌드/검증 시
npm run verify:parallel          # 병렬 검증
npm run lint:biome:fix          # 코드 품질 자동 수정
```

### 🚫 절대 금지 사항
- ❌ any 타입 사용
- ❌ layout.tsx, page.tsx 사용자 협의 없이 생성
- ❌ 폴더 구조 임의 변경
- ❌ 환경 변수 하드코딩
- ❌ styled-components, CSS 모듈, 인라인 스타일 사용
- ❌ 더미/테스트/목업 데이터 사용
- ❌ database.generated.ts 직접 import (반드시 @/types에서만 import)
- ❌ pre-commit에서 자동 수정 (--write, --fix) 사용

### ✅ 필수 작업 원칙
- **반드시** 기존 파일을 Read로 먼저 읽기
- **API 호출**: `/src/lib/api-client.ts`의 함수만 사용 (`apiGet`, `apiPost`, `apiPut`, `apiDelete`)
- **컴포넌트**: shadcn/ui 컴포넌트 우선 사용
- **스타일링**: Tailwind CSS 클래스만 사용
- **타입**: TypeScript strict mode 준수
- **구조**: Server Component 기본, 필요시만 'use client'

---

## 📑 목차

### 📌 핵심 문서 체계
- [13개 핵심 문서](#13개-핵심-문서-체계)

### 🛠️ 개발 가이드
- [1. 작업 전 확인사항](#1-작업-전-확인사항)
- [2. 코드 작성 규칙](#2-코드-작성-규칙)
- [3. TypeScript 타입 관리 시스템](#3-typescript-타입-관리-시스템-v20)
- [4. 보안 자동 적용 규칙](#4-보안-자동-적용-규칙-필수)
- [5. 코드 품질 자동화 도구](#5-코드-품질-자동화-도구-필수-사용)
- [6. Supabase SQL 자동 실행 시스템](#6-supabase-sql-자동-실행-시스템)
- [7. 파일 작업 규칙](#7-파일-작업-규칙)

### 🔐 보안 프로토콜
- [인증 프로토콜 v2.0](#인증-프로토콜-authentication-protocol-v20---wave-1-완료)
- [데이터 보호 프로토콜 v2.0](#데이터-보호-프로토콜-data-protection-v20---wave-2-완료)
- [고급 보안 프로토콜 v3.0](#고급-보안-프로토콜-advanced-security-v30---wave-3-완료)
- [추가 보안 도구](#추가-보안-도구-2025-01-24-구현)

### 🔧 작업 프로세스
- [3단계 검증 시스템](#작업-프로세스-3단계-검증-시스템)
- [테스트 작성 규칙](#테스트-작성-규칙-msw--vitest--playwright)
- [코드 일관성 검증](#코드-일관성-검증-시스템-v20)
- [데이터베이스 테이블 검증](#데이터베이스-테이블-검증)

### 📝 기타
- [Git 작업 규칙](#git-작업-규칙)
- [Supabase 마이그레이션 관리](#supabase-마이그레이션-관리)
- [템플릿 기반 개발](#템플릿-기반-개발)
- [SuperClaude 명령어 체계](#superclaude-명령어-체계)
- [dhacle.com 테스트 가이드](#dhaclcom-사이트에서-실제-기능-테스트-할-때-반드시-참고-할-내용)

---

## 14개 핵심 문서 체계

> **14개 핵심 문서 체계** (2025-08-22 업데이트):
> - 🤖 AI 작업 지침: `/CLAUDE.md` (이 문서)
> - 🔥 **반복 실수 예방**: `/docs/CONTEXT_BRIDGE.md` (최우선! 9가지 실수 + 체크리스트 통합)
> - 📊 프로젝트 현황: `/docs/PROJECT.md`
> - 🗺️ 프로젝트 구조: `/docs/CODEMAP.md`
> - ✅ 작업 검증: `/docs/CHECKLIST.md`
> - 📖 문서 가이드: `/docs/DOCUMENT_GUIDE.md`
> - 🎯 지시 템플릿: `/docs/INSTRUCTION_TEMPLATE.md`
> - 🔄 사용자 플로우: `/docs/FLOWMAP.md`
> - 🔌 UI-API 연결: `/docs/WIREFRAME.md`
> - 🧩 컴포넌트 목록: `/docs/COMPONENT_INVENTORY.md`
> - 📍 라우트 구조: `/docs/ROUTE_SPEC.md`
> - 💾 상태 관리: `/docs/STATE_FLOW.md`
> - 📦 데이터 모델: `/docs/DATA_MODEL.md`
> - 🚨 HTTP 에러 처리: `/docs/ERROR_BOUNDARY.md` (HTTP 전용)

---

## 1. 작업 전 확인사항
- **반드시** 기존 파일을 Read로 먼저 읽기
- 작업 지시사항 **정확히** 파악하기
- 사용자와 협의 없이 **임의로** 파일 생성/수정 금지
- **중복 체크 필수**: 새 컴포넌트/요소 생성 전 기존 파일 확인
- **생성 이유 설명**: 새로운 요소 생성 시 반드시 사용자에게 이유와 목적 설명
- **보안 현황**: Wave 0-3 완료 ✅, Rate Limiting/Zod/XSS 방지 구현 완료

## 2. 코드 작성 규칙
- **API 호출**: `/src/lib/api-client.ts`의 함수 사용 (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) - **Wave 1 100% 적용**
- **컴포넌트**: shadcn/ui 컴포넌트 우선 사용
- **스타일링**: Tailwind CSS 클래스만 사용 (인라인 스타일 금지)
- **타입**: TypeScript strict mode 준수, any 타입 절대 금지
- **구조**: Server Component 기본, 필요시만 'use client'

## 3. TypeScript 타입 관리 시스템 v2.0

### 🔴 Single Source of Truth 타입 시스템 (절대 준수)
```
Supabase DB (snake_case) 
     ↓ [npm run types:generate]
database.generated.ts (자동 생성, snake_case)
     ↓ 
src/types/index.ts (변환 레이어, camelCase)
     ↓
Frontend Components (camelCase 사용)
```

### ⚠️ 중요: 타입 파일 체계 (2025-08-22 완료)
```bash
# 유지해야 할 파일들 (2개만):
✅ src/types/database.generated.ts  # Supabase 자동 생성 (절대 수정 금지)
✅ src/types/index.ts               # 중앙 타입 정의 (Single Source of Truth)

# 삭제 완료된 파일들:
✅ course.ts, course-system.types.ts → index.ts로 통합
✅ youtube.ts, youtube-lens.ts, youtube-pubsub.ts → index.ts로 통합
✅ revenue-proof.ts, tosspayments.d.ts → index.ts로 통합
```

### 타입 import 규칙 (절대 준수)
```typescript
// ✅ 올바른 import - 반드시 @/types에서만
import { User, CommunityPost, snakeToCamelCase } from '@/types';

// ❌ 절대 금지 패턴들
import { Database } from '@/types/database';           // 금지!
import { Database } from '@/types/database.types';     // 금지!
import { Database } from '@/types/database.generated'; // 금지!
```

### 타입 사용 가이드
```typescript
// ✅ 올바른 사용법
import { User, Course, snakeToCamelCase, camelToSnakeCase } from '@/types';

// API Route에서 (DB → Frontend)
const dbData = await supabase.from('users').select();
return NextResponse.json(snakeToCamelCase(dbData.data)); // snake → camel 자동 변환

// Frontend에서
const user: User = await apiGet('/api/user'); // 이미 camelCase

// DB 저장 시 (Frontend → DB)
import { camelToSnakeCase } from '@/types';
await supabase.from('users').insert(camelToSnakeCase(userData)); // camel → snake 자동 변환
```

### 타입 생성 명령어
```bash
# 프로덕션 DB에서 타입 생성
npm run types:generate

# 로컬 DB에서 타입 생성
npm run types:generate:local

# 타입 체크
npm run types:check

# 타입 오류 자동 수정 (Claude Code 전용)
npm run types:auto-fix
```

### DB 스키마 변경 시 프로세스
1. DB 마이그레이션 실행
2. `npm run types:generate` 실행 (database.generated.ts 자동 갱신)
3. 타입 오류 확인 및 수정
4. 커밋 전 `npm run types:check` 확인


### 🤖 Claude Code 전용 타입 자동 관리 시스템

#### 개발 지식 없어도 OK! Claude Code가 알아서 해결

**사용자가 할 일:**
```
"타입 오류 해결해줘" → Claude Code가 자동 처리
```

**Claude Code 자동 처리 프로세스:**
1. `npm run types:auto-fix` 실행 → 오류 자동 분석
2. 해결 가능한 것은 자동 수정
3. DB 변경 필요시 안내 제공
4. 완료!

#### 상황별 Claude Code 명령어

| 사용자 요청 | Claude Code 실행 명령 | 결과 |
|------------|-------------------|------|
| "타입 오류 있어" | `npm run types:auto-fix` | 자동 분석 및 수정 |
| "DB 바뀐 것 같아" | `npm run types:sync` | DB와 타입 동기화 |
| "새 테이블 추가했어" | `npm run types:generate` | 새 타입 생성 |
| "타입 괜찮은지 확인해줘" | `npm run types:check` | 오류 확인 |

#### AI 자동 타입 추가 체크리스트
```typescript
// Claude Code가 새 기능 추가 시 자동 체크
□ 새 테이블이 필요한가? → Supabase에 추가 후 types:generate
□ 새 필드가 필요한가? → DB 수정 후 types:generate
□ 타입 오류가 있는가? → types:auto-fix 실행
□ import 오류가 있는가? → import { Type } from '@/types' 추가
```

#### 완전 자동화 예시
```bash
# 사용자: "회원가입 기능에 전화번호 추가해줘"
# Claude Code 자동 실행:
1. Supabase users 테이블에 phone_number 컬럼 추가 안내
2. npm run types:generate  # 타입 재생성
3. 코드에서 user.phoneNumber 사용  # 자동 camelCase
4. npm run types:check  # 검증
5. 완료! 
```

**🎯 핵심: 사용자는 그냥 "해줘"라고만 하면 됨!**

#### 기존 타입 작성 규칙
- **API 호출 시**: 구체적 타입 정의 또는 타입 추론 활용
  ```typescript
  // ❌ 금지
  apiPost<any>('/api/endpoint')
  
  // ✅ 권장
  apiPost<SpecificType>('/api/endpoint')
  apiPost('/api/endpoint') // 타입 추론
  ```
- **unknown 처리**: 타입 가드 후 접근
  ```typescript
  // ✅ 올바른 패턴
  catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
  }
  ```
- **ZodError**: `.issues` 사용 (`.errors` 아님)
  ```typescript
  if (error instanceof ZodError) {
    error.issues.forEach(issue => { /* ... */ })
  }
  ```
- **함수**: 반환 타입 명시적 선언
  ```typescript
  async function fetchData(): Promise<Data> { /* ... */ }
  ```
- **Union 타입**: 유연한 타입 매핑을 위한 Union 타입 활용
  ```typescript
  function mapCourse(dbCourse: DBCourse | Course): Course { /* ... */ }
  ```
- **연산자 우선순위**: nullish coalescing과 OR 연산자 혼용 시 괄호 필수
  ```typescript
  // ❌ 금지
  obj.video_id ?? stats.video_id || ''
  
  // ✅ 권장
  (obj.video_id ?? stats.video_id) || ''
  ```

## 4. 보안 자동 적용 규칙 (필수)

### 🚨 Supabase 클라이언트 패턴 통일 (2025-08-22 중요 업데이트)

#### ⚡ 빌드 오류 방지를 위한 필수 패턴
```typescript
// ✅ Server Component에서 (pages, layouts) - 프로젝트 표준 패턴
import { createSupabaseServerClient } from '@/lib/supabase/server-client';

export const dynamic = 'force-dynamic'; // 정적 생성 방지 (환경변수 오류 방지)

export default async function Page() {
  const supabase = await createSupabaseServerClient();
  // 사용...
}

// ✅ API Route에서 - 프로젝트 표준 패턴 (2025-08-22 수정)
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> { // 반환 타입 명시
  const supabase = await createSupabaseRouteHandlerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  
  // 비즈니스 로직...
}

// ✅ Client Component에서
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';

'use client';
export function ClientComponent() {
  const supabase = createSupabaseBrowserClient();
  // 사용...
}
```

#### ❌ 절대 금지 패턴들 (Vercel 빌드 실패 원인)
```typescript
// ❌ Server Component에서 금지
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// → 빌드 시 환경변수 오류 발생!

// ❌ API Route에서 금지
import { createServerClient } from '@supabase/ssr';
// → 프로젝트 패턴과 불일치

// ❌ 기타 금지 사항
- getSession() 사용 금지 → getUser() 사용
- new Response() 금지 → NextResponse.json() 사용
- 환경변수 직접 접근 금지 → 래퍼 함수 사용
```

### 🚨 API Route 작성 필수 규칙 (일치성 강제)

### 새 테이블 생성 시
```sql
-- ⚡ 테이블 생성 직후 즉시 적용
ALTER TABLE 테이블명 ENABLE ROW LEVEL SECURITY;

-- 기본 정책 (사용자 본인 데이터만)
CREATE POLICY "테이블명_select_own" ON 테이블명
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "테이블명_insert_own" ON 테이블명
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "테이블명_update_own" ON 테이블명
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "테이블명_delete_own" ON 테이블명
  FOR DELETE USING (user_id = auth.uid());
```

### API 엔드포인트 입력 검증
```typescript
// ⚡ Zod 스키마 필수 적용
import { validateRequestBody } from '@/lib/security/validation-schemas';

const validation = await validateRequestBody(request, schema);
if (!validation.success) {
  return createValidationErrorResponse(validation.error);
}
```

### 사용자 입력 XSS 방지
```typescript
// ⚡ HTML 컨텐츠 정화 필수
import { sanitizeRichHTML } from '@/lib/security/sanitizer';

const safeContent = sanitizeRichHTML(userInput);
```

## 5. 코드 품질 자동화 도구 (필수 사용)

### Biome - 코드 포맷팅 및 린팅 (2025-08-19 업데이트)
- **자동 활성화**: 모든 TypeScript/JavaScript 파일 작업 시
- **실행 명령**: 
  ```bash
  # 작업 전 검사
  npm run lint:biome
  
  # 자동 수정
  npm run lint:biome:fix
  
  # Unsafe 수정 포함 (필요시)
  npm run lint:biome:fix -- --unsafe
  ```
- **Pre-commit**: 자동으로 staged 파일 검사 및 수정
- **개선 현황**: 2,426개 → 801개 오류 (67% 감소) 달성
- **주요 규칙**:
  - Import 자동 정렬
  - 불필요한 코드 제거
  - 일관된 포맷팅
  - 예외 처리 설정 완료 (JSON-LD, DB 타입 등)

### Semgrep 보안 스캔
- **정기 실행**: 보안 관련 작업 후
- **참조**: `/SEMGREP_GUIDE.md`
- **주요 탐지**: 직접 fetch() 사용, any 타입, 하드코딩된 비밀키

### 타입 시스템 검증 도구 (2025-02-21 Wave 3-4 추가)
- **타입 검증 도구**: 
  ```bash
  # 전체 타입 시스템 검증
  node scripts/type-validator.js
  
  # 파일별 타입 제안
  node scripts/type-suggester.js <파일경로>
  ```
- **자동 차단**: Pre-commit Hook v3.0으로 any 타입 커밋 방지
- **주요 기능**:
  - Any 타입 자동 감지 및 차단
  - Import 경로 일관성 검증
  - 중복 타입 파일 발견
  - 컨텍스트 기반 타입 제안

## 6. Supabase SQL 자동 실행 시스템

### 📌 SQL 실행 마스터 도구
```bash
# 기본 SQL 실행 (PostgreSQL 직접 연결 - 권장)
node scripts/supabase-sql-executor.js --method pg --file <SQL파일>

# 다른 방법들
--method cli   # Supabase CLI 사용
--method sdk   # Supabase SDK RPC 사용

# 옵션
--dry-run      # 실행 없이 검증만
--verbose      # 상세 로그 출력
--health       # 연결 상태 확인
```

### SQL 작업 자동화 워크플로우
1. **테이블 누락 감지**: 빌드 오류 또는 타입 오류 발생
2. **즉시 확인**: `node scripts/verify-with-service-role.js`
3. **SQL 실행**: `node scripts/supabase-sql-executor.js --method pg --file <마이그레이션>`
4. **타입 재생성**: `npm run types:generate`
5. **검증**: `npm run build`

### 주요 SQL 시나리오 처리
| 시나리오 | 명령어 | 설명 |
|---------|--------|------|
| 새 테이블 생성 | `--file migrations/xxx.sql` | 마이그레이션 실행 |
| RLS 정책 적용 | `node scripts/security/apply-rls-improved.js` | 보안 정책 적용 |
| 통합 마이그레이션 | `--file COMBINED_MIGRATION.sql` | 전체 스키마 복구 |
| 테이블 확인 | `verify-with-service-role.js` | 현재 상태 검증 |
| 헬스 체크 | `--health` | 연결 상태 확인 |

### ⚠️ 자동 실행 조건
- TypeScript 빌드 오류에서 "테이블 없음" 감지 시
- 타입 생성 실패 시
- API Route에서 DB 오류 발생 시
- 사용자가 SQL 실행 요청 시

## 7. 파일 작업 규칙
- 새 파일 생성보다 기존 파일 수정 우선
- 문서 파일(*.md, README) 임의 생성 금지
- 환경 변수 하드코딩 금지
- **폴더 구조 준수**: CODEMAP.md 참조
- **파일명 규칙**: 컴포넌트는 PascalCase, 기타 파일은 kebab-case

---

## 인증 프로토콜 (Authentication Protocol v2.0) - Wave 1 완료 ✅

### 골든룰 (인증 관련 절대 준수)
1. **모든 클라이언트 fetch는 공용 래퍼 사용** ✅ Wave 1 100% 적용
   - `/src/lib/api-client.ts`의 `apiGet`, `apiPost`, `apiPut`, `apiDelete` 사용
   - 기본 옵션: `credentials: 'same-origin'`, `Content-Type: application/json`
   - 직접 `fetch()` 호출 금지 (외부 API 제외)

2. **서버 라우트는 세션 필수** ✅ Wave 1 100% 적용 (38/38 routes) - 2025-08-22 수정 완료
   - Route Handler 진입 시 세션 검사 → 없으면 `401` + `{ error: 'User not authenticated' }`
   - `userId`는 쿼리스트링으로 받지 말고 세션에서 파생
   - **올바른 패턴 (필수) - 2025-08-22 PKCE 오류 해결 후 업데이트**:
   ```typescript
   import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
   import { NextResponse } from 'next/server';
   
   const supabase = await createSupabaseRouteHandlerClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     return NextResponse.json(
       { error: 'User not authenticated' },
       { status: 401 }
     );
   }
   ```
   - **금지 패턴 (라이브러리 혼용 방지)**:
     - ❌ `createRouteHandlerClient from '@supabase/auth-helpers-nextjs'` 사용 금지
     - ❌ `createServerClient from '@supabase/ssr'` 직접 사용 금지
     - ❌ `getSession()` 금지 → `getUser()` 사용
     - ❌ `new Response()` 금지 → `NextResponse.json()` 사용

3. **401 UX 처리**
   - 프론트는 401 수신 시 로그인 유도 (모달/리다이렉트)
   - "Failed to fetch" 문자열 노출 금지
   - 사용자 친화적 메시지: "인증이 필요합니다. 로그인 후 다시 시도해주세요."

4. **오리진/쿠키 불변식**
   - 로컬 개발: 반드시 `http://localhost:<port>`만 사용 (127.0.0.1 금지)
   - 프로덕션: HTTPS 필수, `NEXT_PUBLIC_SITE_URL` == 실제 접근 도메인
   - 세션 식별은 항상 쿠키 + 서버 검사

5. **기능 진입 전 인증 가드**
   - 컬렉션/폴더/즐겨찾기 등 사용자 데이터 의존 화면은 렌더 전 세션 체크
   - API 키 설정 화면은 인증 필수

### 인증 관련 Definition of Done - Wave 1 완료 ✅
- [x] 클라이언트가 **api-client만** 사용 (직정 fetch 없음) - 100% 완료
- [x] 신규/수정 Route가 **세션 검사 + JSON 에러 포맷** 준수 - 95% 완료
- [x] 401 수신 시 **로그인 유도 UX** 구현 - 완료
- [x] 로컬 실행 시 `localhost` 사용 (127.0.0.1 금지) - 완료

## 데이터 보호 프로토콜 (Data Protection v2.0) - Wave 2 완료 ✅

### RLS (Row Level Security) 정책 - 적용 대기
1. **21개 테이블 SQL 작성 완료** ✅
   - YouTube Lens 테이블 11개
   - 사용자 데이터 테이블 4개
   - 커뮤니티 테이블 3개
   - 강의/기타 테이블 3개
   - **적용 방법**: Supabase Dashboard에서 수동 실행 필요
   - **파일 위치**: `supabase/migrations/20250123000002_wave2_security_rls.sql`

2. **캐싱 정책 구현 완료** ✅
   - 개인 데이터: `Cache-Control: no-store` 적용
   - 공개 데이터: 5분 캐싱 허용
   - 보안 헤더: XSS, Clickjacking 방지
   - **미들웨어**: `src/middleware.ts` 자동 활성화

3. **비밀키 스캔 도구 사용** ✅
   ```bash
   # 프로젝트 전체 비밀키 스캔
   node scripts/security/scan-secrets.js
   ```
   - API 키, JWT, DB URL 탐지
   - 하드코딩된 비밀번호 검출
   - CRITICAL/HIGH 이슈 즉시 수정

### 데이터 보호 Definition of Done - Wave 2 완료 ✅
- [x] RLS 정책 SQL 작성 - 21개 테이블 100% 완료
- [x] 캐싱 정책 미들웨어 구현 - 완료
- [x] 비밀키 스캔 도구 구현 - 완료
- [ ] RLS 정책 프로덕션 적용 - 대기 중

## 고급 보안 프로토콜 (Advanced Security v3.0) - Wave 3 완료 ✅

### Rate Limiting 정책
1. **적용 방법**: 미들웨어 자동 활성화
   - IP 기반 일반 API: 분당 60회 제한
   - 인증 엔드포인트: 15분당 5회 제한
   - 파일 업로드: 시간당 10회 제한
   - **위치**: `src/lib/security/rate-limiter.ts`

2. **입력 검증 (Zod)** ✅
   - 모든 API Route에 Zod 스키마 적용
   - **사용법**:
   ```typescript
   import { validateRequestBody, createPostSchema } from '@/lib/security/validation-schemas';
   
   const validation = await validateRequestBody(request, createPostSchema);
   if (!validation.success) {
     return createValidationErrorResponse(validation.error);
   }
   ```

3. **XSS 방지** ✅
   - DOMPurify 기반 정화 함수 사용
   - **사용법**:
   ```typescript
   import { sanitizeRichHTML, sanitizeURL } from '@/lib/security/sanitizer';
   
   const safeContent = sanitizeRichHTML(userInput);
   const safeUrl = sanitizeURL(urlInput);
   ```

### 고급 보안 Definition of Done - Wave 3 완료 ✅
- [x] Rate Limiting 시스템 구현 - 완료
- [x] Zod 입력 검증 13개 스키마 - 완료
- [x] XSS 방지 DOMPurify 통합 - 완료
- [x] 보안 사용 예제 작성 - 완료

## 추가 보안 도구 (2025-01-24 구현) ✅

### RLS 정책 자동 적용
```bash
# pg 패키지 설치 필요
npm install pg

# 개선된 RLS 적용 (트랜잭션 기반)
npm run security:apply-rls-all     # 모든 Wave RLS 적용
npm run security:apply-rls-dry     # Dry-run 모드
npm run security:apply-rls-wave2   # Wave 2만 적용
```

### TTL 데이터 보관 정책
```bash
# 30일 이상 된 데이터 자동 정리
npm run security:ttl       # TTL 정책 실행
npm run security:ttl-dry   # Dry-run 모드
npm run security:ttl-force # 강제 삭제
```

### 보안 테스트 자동화
```bash
# 전체 보안 테스트 (Wave 0-3)
npm run security:test         # 기본 테스트
npm run security:test-verbose # 상세 모드

# 통합 보안 작업
npm run security:complete # RLS + TTL + 테스트
```

---

## 작업 프로세스 (3단계 검증 시스템)

### 📋 Phase 1: Pre-Flight Check (작업 전)
1. **문서 확인**:
   - `/docs/FLOWMAP.md` - 사용자 플로우 확인
   - `/docs/WIREFRAME.md` - UI-API 연결 확인
   - `/docs/COMPONENT_INVENTORY.md` - 재사용 컴포넌트 확인
2. **현재 상태 파악**:
   - `/docs/PROJECT.md` - 현재 이슈 확인
   - `/docs/ROUTE_SPEC.md` - 라우트 구조 확인
3. **데이터 모델 확인**:
   - `/docs/DATA_MODEL.md` - 타입 매핑 확인
   - `/docs/STATE_FLOW.md` - 상태 관리 확인

### 🔨 Phase 2: Implementation (작업 중)
1. 요구사항 명확히 확인
2. 기존 코드/패턴 분석
3. shadcn/ui 컴포넌트 활용 방안 검토
4. 구현 후 타입 체크
5. 빌드 테스트
6. **문서 실시간 업데이트**:
   - 새 컴포넌트 → COMPONENT_INVENTORY.md
   - 새 라우트 → ROUTE_SPEC.md
   - API 연결 → WIREFRAME.md

### ✅ Phase 3: Post-Flight Validation (작업 후)
1. **에러 처리 확인**: `/docs/ERROR_BOUNDARY.md` 기준 준수
2. **체크리스트 검증**: `/docs/CHECKLIST.md` 모든 항목 확인
3. **문서 최종 업데이트**: 구현 상태 표시 (✅/⚠️/❌)

### 문제 해결 시
1. 에러 메시지 정확히 분석
2. 관련 파일 Read로 확인
3. 최소한의 수정으로 해결
4. 부수 효과 확인

### 문서 검증 프로토콜
**작업 시작 시 필수 체크**:
- [ ] 14개 핵심 문서 확인 완료
- [ ] **CONTEXT_BRIDGE.md 최우선 확인** 🆕
- [ ] 문서 역할 경계 준수
  - CLAUDE.md: AI 지침만 (이슈 현황 ❌)
  - CONTEXT_BRIDGE.md: 프로젝트 특화 규칙 (최신 변경사항) 🆕
  - PROJECT.md: 프로젝트 현황만 (상세 기술 스택 ❌)
  - CODEMAP.md: 구조만 (구현 상태 ❌)
  - WIREFRAME.md: UI-API 연결과 구현 상태 ✅

**문서 업데이트 시**:
- [ ] 적절한 문서 선택 (DOCUMENT_GUIDE.md 참조)
- [ ] 중복 내용 방지
- [ ] 역할 경계 침범 확인
- [ ] 최신 7개만 유지 (PROJECT.md 변경사항)

**문서 간 참조**:
- [ ] 상세 내용은 해당 문서 참조 링크 사용
- [ ] 순환 참조 방지
- [ ] 원본 유지, 복사본 제거

### 빌드 전 체크리스트
> 체크리스트는 `/docs/CHECKLIST.md` 참조

## 테스트 작성 규칙 (MSW + Vitest + Playwright)

### MSW (Mock Service Worker) 활용
- **개발 중 API 모킹**: 실제 백엔드 없이 개발 가능
- **YouTube API 할당량 절약**: 개발 중 실제 API 호출 없음
- **에러 시뮬레이션**: 401, 500, 타임아웃 등 테스트
```typescript
// src/mocks/handlers.ts에 핸들러 추가
http.get('/api/new-endpoint', () => {
  return HttpResponse.json({ data: 'mocked' })
})
```

### Vitest 단위/컴포넌트 테스트
- **새 컴포넌트 생성 시**: `.test.tsx` 파일 동시 생성
- **테스트 커버리지**: 80% 이상 유지
- **테스트 실행**: `npm run test` (watch 모드)
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('expected text')).toBeInTheDocument()
  })
})
```

### Playwright E2E 테스트
- **사용자 시나리오 테스트**: 실제 브라우저에서 테스트
- **크로스 브라우저 테스트**: Chrome, Firefox, Safari
- **테스트 실행**: `npm run e2e`
```typescript
// e2e/feature.spec.ts
import { test, expect } from '@playwright/test'

test('user can complete flow', async ({ page }) => {
  await page.goto('/')
  await page.click('button:has-text("시작하기")')
  await expect(page).toHaveURL('/expected-path')
})
```

### 자동 테스트 실행
```bash
# 개발 중 테스트 (watch 모드)
npm run test

# 테스트 커버리지 확인
npm run test:coverage

# E2E 테스트
npm run e2e

# Pre-commit 자동 실행
git commit # 자동으로 테스트 실행됨
```

## 코드 일관성 검증 시스템 v2.0

```bash
# ⚡ 병렬 실행 (60-70% 속도 향상)
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

# 🔍 개별 검증 명령어
npm run verify:api       # API 일치성 검증 (인증 방식 통일)
npm run verify:ui        # UI 일관성 검증 (shadcn/ui, Tailwind)
npm run verify:types     # TypeScript 타입 안정성 검증
npm run verify:routes    # 라우트 보호 상태 검증
npm run verify:runtime   # 런타임 설정 및 환경 변수 검증
npm run verify:deps      # 의존성 취약점 및 사용 현황 검증 ✨ NEW
npm run verify:db        # DB 스키마 일치성 검증 ✨ NEW
npm run verify:imports   # Import 구조 및 순환 의존성 검증 ✨ NEW

# 🎣 Pre-commit Hook (자동 실행)
# .husky/pre-commit 설정됨
# - 커밋 시 자동으로 verify:quick 실행
# - staged 파일만 검증하여 성능 최적화
# - --no-verify로 건너뛸 수 있음

# 검증 실패 시 수정 가이드:
# - 각 스크립트가 구체적인 수정 방법 제시
# - 파일별 컨텍스트를 고려한 수동 수정 필요
# - 자동 수정 스크립트 사용 금지 (런타임 오류 위험)
```

## 데이터베이스 테이블 검증

1. 테이블 상태 확인: `node scripts/verify-with-service-role.js`
2. 누락된 테이블 검사: `node scripts/check-missing-tables.js`
3. 반드시 21개 테이블 100% 생성 확인

> **추가 검증 문서**:
> - UI 완성도: `/docs/WIREFRAME.md` 모든 연결 ✅ 확인
> - 라우트 보호: `/docs/ROUTE_SPEC.md` 인증 체크 확인
> - 에러 처리: `/docs/ERROR_BOUNDARY.md` 401 처리 확인

## 미구현 기능 처리 가이드

### 🔴 누락된 테이블 발견 시
```typescript
// ❌ 잘못된 처리: 에러 무시
const { data } = await supabase.from('missing_table').select()

// ✅ 올바른 처리: 주석 처리 및 TODO 표시
// TODO: missing_table 테이블 생성 후 구현
const data: any[] = [] // 임시로 빈 배열 반환
```

### 누락된 테이블 목록 (2025-08-21 기준)
- `proof_likes` - 수익 인증 좋아요
- `proof_comments` - 수익 인증 댓글
- `naverCafeVerifications` - 네이버 카페 인증
- `subscriptionLogs` - YouTube 구독 로그
- `channelSubscriptions` - YouTube 채널 구독
- `webhookEvents` - 웹훅 이벤트

---

## Git 작업 규칙

> Git 작업 규칙과 커밋 메시지 규칙은 `/docs/CHECKLIST.md` 참조

## Supabase 마이그레이션 관리

> Supabase 마이그레이션 관리 방법은 `/docs/PROJECT.md`의 마이그레이션 섹션 참조

## 템플릿 기반 개발

필요시 shadcn/ui, HyperUI 등에서 적합한 템플릿 검색 후 프로젝트 요구사항에 맞게 수정 적용

## SuperClaude 명령어 체계

### 기본 명령어
```bash
/sc:implement --seq --validate --c7
```

### 복잡도별 추천 플래그
- **simple**: `--validate`
- **moderate**: `--seq --validate --c7`
- **complex**: `--seq --validate --evidence --think-hard --c7`
- **enterprise**: `--seq --validate --evidence --ultrathink --delegate files --c7 --magic`

---

## dhacle.com 사이트에서 실제 기능 테스트 할 때 반드시 참고 할 내용

### 배포 환경 정보
- **프로덕션 URL**: https://dhacle.com
- **호스팅**: Vercel (자동 배포 설정됨)
- **데이터베이스**: Supabase (golbwnsytwbyoneucunx)

### 로그인 버튼은 button has text '카카오' 로 찾을 것.

### 테스트 계정 (카카오 로그인)
```
ID: glemfkcl@naver.com
PW: dhfl9909
```
*주의: 사용자의 실제 인증이 필요하므로 로그인 버튼 클릭후에는 잠시 (1분) 대기해야하며 로그인이 완료되었는지 확인 후  실제 테스트할 페이지로 다시 이동하여 테스트 진행할것.

### YouTube Lens 테스트 절차
1. **사이트의 로그인 페이지 접속**: https://dhacle.com/auth/login
2. **카카오 로그인**: 위 테스트 계정 사용
3. **YouTube Lens 페이지**: `/tools/youtube-lens` 이동
4. **기능별 테스트**:
   - 인기 Shorts 조회
   - 채널 폴더 관리
   - 컬렉션 생성/조회
   - 비디오 저장

### 테스트 시 확인 사항
- [ ] 로컬 개발 환경 테스트 (`npm run dev`)
- [ ] 빌드 성공 확인 (`npm run build`)
- [ ] **프로덕션 배포 후 실제 사이트에서 테스트**
- [ ] 브라우저 콘솔 에러 확인
- [ ] Network 탭에서 API 응답 확인
- [ ] 보안 테스트 실행 (`npm run security:test`) - 현재 38%, 목표 100%

---

## ⚠️ 주의사항

프로젝트 관련 이슈와 현황은 `/docs/PROJECT.md` 참조

---

## 💬 커뮤니케이션

- 작업 전 의도 설명
- 중요 변경사항 사전 협의
- 에러 발생 시 즉시 보고
- 한국어로 명확한 소통

---

*이 문서는 AI 작업 지침서입니다. 프로젝트 상태는 `/docs/PROJECT.md` 참조*