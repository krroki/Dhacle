# 🔷 TypeScript 타입 시스템 지침

*TypeScript 타입 시스템 전문가 - Type Agent 자동 활성화*

**자동 활성화**: `*.ts, *.tsx` 파일 Edit/Write/MultiEdit 시  
**전문 분야**: any 타입 즉시 제거, @/types 중앙화, database.generated.ts 보호

---

## 🛑 TypeScript 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **any 타입 사용 → 중단** (biome 에러 발생)
- **database.generated.ts 직접 import → 중단**
- **가짜 타입 생성 시도 → 중단** (2025-08-26 재앙 방지)
- **unknown→any 캐스팅 → 중단**
- **'any' 문자열 값 사용 → 중단**

### 2️⃣ MUST - 필수 행동
```typescript
// @/types 중앙화 필수 (direct import 금지)
import { User, Post, YouTubeVideo } from '@/types';
// import { Database } from '@/types/database.generated'; // ❌ 절대 금지!

// 구체적 타입 정의 필수 (any 대신)
const processData = (data: User[]): ProcessedUser[] => {
  // any 대신 구체적 타입 사용
};

// 타입 가드 사용 (unknown 처리)
const isValidUser = (obj: unknown): obj is User => {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
};
```

### 3️⃣ CHECK - 검증 필수
```bash
# TypeScript 수정 후 즉시 실행
npm run types:check          # TypeScript 전체 검증
npx biome check **/*.ts      # any 타입 사용 검사
npm run types:generate       # DB 변경 시 타입 재생성
```

## 🚫 TypeScript any 타입 금지

### ❌ 발견된 문제: src/lib/youtube/monitoring.ts:18-24
```typescript
// ❌ 절대 금지 - 6개 any 타입 임시 정의 (즉시 수정 필요!)
type Alert = any;
type AlertRule = any;
type AlertRuleType = any;
type AlertMetric = any;
type AlertCondition = any;
type AlertScope = any;

// ✅ 즉시 수정 - 구체적 YouTube 모니터링 타입
interface Alert {
  id: string;
  rule_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggered_at: string;
  resolved_at?: string;
}

interface AlertRule {
  id: string;
  name: string;
  type: AlertRuleType;
  condition: AlertCondition;
  threshold: number;
  enabled: boolean;
}

type AlertRuleType = 'subscriber_drop' | 'view_count_low' | 'engagement_drop';
```

### 🛡️ 예방책
- **Context7 TypeScript**: 공식 ESLint 규칙으로 any 타입 'warn' 처리
- **biome 즉시 차단**: any 타입 사용 시 빌드 실패
- **4단계 위험 분류**: Critical/High/Medium/Low로 실질적 위험도 평가

---

## 🚨 TypeScript 필수 패턴

### 패턴 1: @/types 중앙화 (database.generated 직접 금지)
```typescript
// ✅ @/types 중앙화 (프로젝트 표준)
import { User, Post, Collection } from '@/types';

// @/types/index.ts에서 재export
export type { Database } from './database.generated';
export type User = Database['public']['Tables']['users']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];

// ❌ 절대 금지 - database.generated 직접 import
// import { Database } from '@/types/database.generated';
```

### 패턴 2: 타입 안전 에러 처리 (any 금지)
```typescript
// ✅ 타입 안전한 에러 처리
try {
  const response = await apiCall();
  return response.data;
} catch (error) {
  // any 대신 unknown → instanceof 사용
  console.error('Error:', error instanceof Error ? error.message : String(error));
  
  // 타입 가드로 안전한 처리
  if (isAPIError(error)) {
    throw new Error(`API Error: ${error.statusCode}`);
  }
  
  throw new Error('Unknown error occurred');
}

// 타입 가드 정의
const isAPIError = (error: unknown): error is APIError => {
  return typeof error === 'object' && 
         error !== null && 
         'statusCode' in error;
};
```

### 패턴 3: 실제 DB 타입 생성 (가짜 타입 방지)
```bash
# ✅ 유일한 올바른 방법 - Supabase CLI 사용
npm run types:generate

# 생성 실패 시 수동 실행 (2>&1 필수!)
npx supabase gen types typescript \
  --project-id [PROJECT_ID] \
  > src/types/database.generated.ts 2>&1

# ❌ 절대 금지 - 가짜 타입 추측 생성
# export interface Database { /* 추측으로 만든 구조 */ }
```

---

## 📋 TypeScript 검증 명령어

```bash
# 즉시 검증
npm run types:check          # TypeScript 전체 오류 확인
npx biome check **/*.ts      # any 타입 사용 검사

# 상세 검증
npm run build               # 프로덕션 빌드로 타입 검증
npm run types:generate      # DB 타입 재생성 (변경 시)

# 실제 타입 확인
wc -l src/types/database.generated.ts  # 1000줄 이상이어야 정상
head -5 src/types/database.generated.ts  # Supabase 자동 생성 확인
```

---

## 🎯 TypeScript 성공 기준

- [ ] **any 타입 0개**: 모든 any 타입 제거 (현재: monitoring.ts 6개 남음)
- [ ] **@/types 중앙화**: database.generated 직접 import 0개
- [ ] **실제 DB 타입**: 가짜 타입 없음, Supabase CLI 생성만 허용
- [ ] **타입 가드 활용**: unknown 처리 시 instanceof/typeof 사용
- [ ] **빌드 성공**: npm run types:check 통과

---

## ⚠️ TypeScript 주의사항

### 자주 하는 실수
- **any 타입 남용**: "빠르게"라는 핑계로 타입 시스템 파괴
- **database.generated 직접 import**: @/types 우회하여 직접 접근
- **가짜 타입 생성**: 실제 DB 구조와 맞지 않는 추측 타입
- **unknown 무시**: any 캐스팅으로 타입 검사 우회

### 함정 포인트
- **'any' 문자열**: option value="any"도 혼동 야기 (value="all" 사용)
- **외부 라이브러리**: JSON.parse 등 불가피한 any도 타입 가드로 처리
- **이벤트 핸들러**: React.MouseEvent<HTMLElement> 등 구체적 타입 사용
- **API 응답**: 외부 API 응답도 interface 정의 후 검증

---

## 💀 2025-08-26 가짜 타입 재앙 교훈

### 문제 사례
```typescript
// ❌ 절대 금지 - AI가 추측으로 만든 가짜 타입
export interface Database {
  public: {
    Tables: {
      users: { // 실제 DB와 다름!
        Row: { id: string; email: string } // naver_cafe_nickname 누락!
      }
    }
  }
}
```

### 결과
- **컴파일**: ✅ 성공 → **런타임**: ❌ 실패
- **자동완성**: 잘못된 필드 제안 → **undefined 에러**
- **디버깅**: "타입은 맞는데 왜 안 되지?" → **시간 낭비**

### 영구 해결책
1. **Supabase CLI만 사용**: 실제 DB 구조에서 타입 생성
2. **1000줄 이상 검증**: 정상적인 database.generated.ts 크기
3. **@/types 중앙화**: 직접 import 차단으로 통제
4. **Type Agent 자동 차단**: 가짜 타입 생성 시도 즉시 중단

---

## 📁 관련 파일

- **중앙 타입**: [/src/types/index.ts](index.ts) - 모든 타입 재export
- **DB 타입**: [/src/types/database.generated.ts](database.generated.ts) - Supabase 자동 생성
- **변환 함수**: [/src/types/converters.ts](converters.ts) - snake_case ↔ camelCase
- **타입 가드**: [/src/types/guards.ts](guards.ts) - 런타임 타입 검증

---

*TypeScript 작업 시 이 지침을 필수로 준수하세요. Type Agent가 자동으로 활성화되어 any 타입 사용과 가짜 타입 생성을 즉시 차단합니다.*