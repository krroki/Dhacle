/sc:implement --seq --validate --think-hard --delegate files
"Phase 1: TypeScript 타입 시스템 완전 복구 - any 타입 23개 제거, 컴파일 에러 24개 수정"

# Phase 1: TypeScript 타입 시스템 완전 복구

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 타입 정의: `src/types/index.ts`
- 주요 문제 파일:
  - `src/lib/query-keys.ts`
  - `src/lib/youtube/pubsub.ts`
  - `src/lib/youtube/monitoring.ts`
  - `src/lib/supabase/client-wrapper.ts`
  - `src/app/api/youtube/folders/route.ts`
  - `src/app/api/youtube/metrics/route.ts`
  - `src/app/api/youtube/subscribe/route.ts`
  - `src/app/api/youtube/webhook/route.ts`
  - `src/app/learn/[courseId]/[lessonId]/page.tsx`

### 프로젝트 컨텍스트 확인
```bash
# TypeScript 설정 확인
cat tsconfig.json | grep "strict"  # "strict": true 확인

# 현재 any 타입 개수
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "//" | wc -l  # 23개

# TypeScript 에러 확인
npm run types:check 2>&1 | head -50
```

## 📌 목적
TypeScript 타입 시스템을 완전히 복구하여 타입 안정성을 확보하고 빌드 가능한 상태로 만들기

## 🤖 실행 AI 역할
TypeScript 전문가로서 모든 any 타입을 제거하고 컴파일 에러를 완전히 해결하는 역할

## 📝 작업 내용

### 1단계: any 타입 23개 제거

#### 1.1 `src/lib/query-keys.ts:151` 수정
```typescript
// 현재 (잘못됨)
const keyFunction = (moduleKeys as any)[subKey];

// 수정 후
// moduleKeys의 타입을 정확히 정의
type ModuleKeysType = {
  [key: string]: (...args: any[]) => readonly unknown[];
};
const keyFunction = (moduleKeys as ModuleKeysType)[subKey];
```

#### 1.2 `src/lib/youtube/pubsub.ts:517` 수정
```typescript
// 현재 (잘못됨)
private async logSubscriptionAction(
  supabase: any,
  subscriptionId: string,

// 수정 후
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.generated';

private async logSubscriptionAction(
  supabase: SupabaseClient<Database>,
  subscriptionId: string,
```

#### 1.3 `src/lib/youtube/monitoring.ts:204-208` 수정
```typescript
// 현재 (잘못됨)
ruleType: data.rule_type as any,
metric: data.metric as any,
metricType: data.metric as any,
condition: data.condition as any,
comparisonOperator: data.condition as any,

// 수정 후
import { RuleType, MetricType, ConditionType } from '@/types';

ruleType: data.rule_type as RuleType,
metric: data.metric as MetricType,
metricType: data.metric as MetricType,
condition: data.condition as ConditionType,
comparisonOperator: data.condition as ConditionType,
```

#### 1.4 나머지 any 타입들 처리
```typescript
// 각 any 타입에 대해:
// 1. 실제 사용되는 타입 확인
// 2. src/types/index.ts에 타입 정의 추가
// 3. any를 구체적 타입으로 교체
```

### 2단계: TypeScript 컴파일 에러 24개 수정

#### 2.1 undefined 타입 처리 (8개)
```typescript
// 예시: src/app/api/youtube/webhook/route.ts:82
// 현재
crypto.createHmac('sha1', process.env.YOUTUBE_WEBHOOK_SECRET)

// 수정 후
import { env } from '@/env';
crypto.createHmac('sha1', env.YOUTUBE_WEBHOOK_SECRET || '')

// 또는 에러 처리 추가
const secret = process.env.YOUTUBE_WEBHOOK_SECRET;
if (!secret) {
  return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
}
crypto.createHmac('sha1', secret)
```

#### 2.2 타입 불일치 수정 (6개)
```typescript
// 예시: src/app/api/youtube/folders/route.ts:58
// 문제: FolderWithChannels 타입과 실제 데이터 불일치

// src/types/index.ts에 타입 수정
export interface FolderWithChannels {
  channel_count: number | null;  // null 허용
  // ... 기타 필드
}
```

#### 2.3 함수 인자 불일치 (4개)
```typescript
// 예시: src/app/api/youtube/subscribe/route.ts:32
// 현재
await requireAuth()  // 인자 누락

// 수정 후
await requireAuth(request)  // request 인자 추가
```

#### 2.4 미사용 변수 제거 (6개)
```typescript
// 예시: src/app/api/user/naver-cafe/route.ts:88
// 현재
const supabase = await createSupabaseRouteHandlerClient();  // 미사용

// 수정 후
// 삭제하거나 실제 사용
```

### 3단계: 타입 정의 보강

#### 3.1 `src/types/index.ts` 업데이트
```typescript
// 누락된 타입들 추가
export type RuleType = 'threshold' | 'trend' | 'anomaly';
export type MetricType = 'views' | 'likes' | 'comments' | 'engagement';
export type ConditionType = 'gt' | 'lt' | 'eq' | 'gte' | 'lte';

// API Response 타입 정의
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// 기타 필요한 타입들 추가
```

### 4단계: 타입 가드 구현

```typescript
// src/lib/type-guards.ts 생성
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

// 사용 예시
if (isDefined(value)) {
  // value는 undefined가 아님이 보장됨
}
```

## ✅ 완료 조건

### 필수 체크리스트
- [ ] any 타입 0개 확인
  ```bash
  grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "//" | wc -l  # 0 expected
  ```
- [ ] TypeScript 컴파일 성공
  ```bash
  npm run types:check  # 0 errors expected
  ```
- [ ] 빌드 성공
  ```bash
  npm run build  # Success expected
  ```
- [ ] 타입 검증 스크립트 통과
  ```bash
  node scripts/verify-types.js  # All pass expected
  ```

### 품질 기준
- [ ] 모든 함수에 반환 타입 명시
- [ ] 모든 매개변수에 타입 명시
- [ ] unknown 사용 시 타입 가드 구현
- [ ] null/undefined 체크 완료

## 📋 QA 테스트 시나리오

### 타입 안정성 테스트
```bash
# 1. TypeScript 컴파일러 체크
npm run types:check

# 2. 개별 파일 타입 체크
npx tsc --noEmit src/lib/query-keys.ts
npx tsc --noEmit src/lib/youtube/pubsub.ts

# 3. 빌드 테스트
npm run build
```

### 런타임 테스트
```bash
# 개발 서버 실행
npm run dev

# 주요 기능 테스트
# 1. API 호출 테스트
curl http://localhost:3000/api/health

# 2. 페이지 로드 테스트
# 브라우저에서 주요 페이지 접속
```

## 🔄 롤백 계획

### 실패 시 롤백
```bash
# 변경사항 확인
git status
git diff

# 문제 발생 시 롤백
git checkout -- src/lib/query-keys.ts
git checkout -- src/lib/youtube/pubsub.ts
git checkout -- src/lib/youtube/monitoring.ts
git checkout -- src/types/index.ts

# 또는 전체 롤백
git reset --hard HEAD
```

## 🚨 주의사항

### 절대 금지
- ❌ `any` 타입 사용
- ❌ `@ts-ignore` 사용
- ❌ `@ts-nocheck` 사용
- ❌ 타입 단언 남용 (`as` 최소화)

### 필수 수행
- ✅ 실제 타입 확인 후 정의
- ✅ 타입 가드 구현
- ✅ null/undefined 처리
- ✅ 각 수정 후 타입 체크

## 📊 예상 결과

### Before
```
any 타입: 23개
TypeScript 에러: 24개
빌드: 실패
```

### After
```
any 타입: 0개
TypeScript 에러: 0개
빌드: 성공
```

## → 다음 Phase
- 파일: `PHASE_2_API_CLIENT_IMPLEMENTATION.md`
- 조건: TypeScript 에러 0개 달성 후 진행

---

**⚠️ 중요**: 임시방편 절대 금지! 모든 타입 문제를 완전히 해결하세요.