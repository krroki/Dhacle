# 🔌 API Route 개발 지침

*Next.js 15 App Router API Routes 전문가 - API Route Agent 자동 활성화*

**자동 활성화**: `src/app/api/**` 파일 Edit/Write/MultiEdit 시  
**전문 분야**: 인증, snake_case 변환, 타입 안전성, 에러 처리

---

## 🛑 API Route 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **세션 체크 없는 API 발견 → 중단**
- **getSession() 사용 → 중단** (프로젝트에 없는 함수!)
- **any 타입 사용 → 중단** 
- **빈 배열/null 임시 반환 → 중단**
- **getUser() 직접 사용 지양** (28개 파일이 requireAuth() 사용 중)

### 2️⃣ MUST - 필수 행동
```typescript
// 현재 프로젝트 표준 패턴 (28개 파일 사용)
import { requireAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  // 🔒 인증 검사 (requireAuth 헬퍼 사용)
  const { user } = await requireAuth();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }
  
  // 비즈니스 로직...
}
```

### 3️⃣ CHECK - 검증 필수
```bash
# API 수정 후 즉시 실행
npm run types:check
curl -X GET http://localhost:3000/api/[endpoint]  # 실제 동작 확인
npx biome check src/app/api/**/*.ts
```

## 🚫 API Route any 타입 금지

### ❌ 발견된 문제: app/api/youtube/search/route.ts
```typescript
// ❌ 절대 금지 - YouTube API 응답 타입 무시
const results = response.data.items as any;

// ✅ 즉시 수정 - 구체적 YouTube API 타입
import type { YouTubeSearchItem } from '@/types/youtube';
const results = response.data.items as YouTubeSearchItem[];
```

### 🛡️ 예방책
- **API Response 타입 정의**: 모든 엔드포인트에 구체적 반환 타입
- **외부 API 타입**: YouTube, TossPayments 등 외부 API 응답 타입 정의
- **Type Agent 연계**: *.ts 파일 수정 시 Type Agent 자동 활성화

---

## 🚨 API Route 필수 패턴

### 패턴 1: 표준 인증 검증 (모든 Route)
```typescript
// 🔒 디하클 프로젝트 표준 인증 패턴 (28개 파일 동일)
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json(
    { error: 'User not authenticated' },  // 표준 메시지
    { status: 401 }
  );
}
```

### 패턴 2: snake_case 변환 (DB 경계)
```typescript
// 🔄 API 경계에서 자동 변환 (프로젝트 표준)
import { snakeToCamelCase, camelToSnakeCase } from '@/types';

// DB → API 응답 (snake_case → camelCase)
const dbData = await supabase.from('users').select();
return NextResponse.json(snakeToCamelCase(dbData));

// API 요청 → DB (camelCase → snake_case)
const body = await request.json();
const dbPayload = camelToSnakeCase(body);
await supabase.from('users').insert(dbPayload);
```

### 패턴 3: 타입 안전 에러 처리
```typescript
// 🛡️ 타입 안전한 에러 처리 (any 금지)
try {
  const { data, error } = await supabase.from('table').select();
  if (error) throw error;
  
  return NextResponse.json(data);
} catch (error) {
  console.error('API Error:', error);
  
  // unknown → string 타입 안전 변환
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json(
    { error: 'Internal Server Error', details: message },
    { status: 500 }
  );
}
```

---

## 📋 API Route 검증 명령어

```bash
# 즉시 검증
npm run types:check                    # TypeScript 오류 확인
curl -X GET http://localhost:3000/api/endpoint  # 실제 호출 테스트

# 상세 검증
npx biome check src/app/api/**/*.ts    # 코드 스타일 검증
npm run verify:parallel                # 전체 시스템 검증

# 실제 동작 확인
npm run dev                           # 개발 서버 시작 (2.5초)
# 브라우저에서 API 엔드포인트 직접 호출 테스트
```

---

## 🎯 API Route 성공 기준

- [ ] **인증 체크**: 모든 Route에 `getUser()` 패턴 적용
- [ ] **타입 안전성**: any 타입 0개, 구체적 Response 타입 정의
- [ ] **에러 처리**: 표준 401/400/500 응답 형식 준수
- [ ] **변환 적용**: snake_case ↔ camelCase 변환 규칙 적용
- [ ] **실제 동작**: curl/브라우저 테스트로 정상 작동 확인

---

## ⚠️ API Route 주의사항

### 자주 하는 실수
- **getSession() 함수 사용**: 프로젝트에 없는 함수 (getUser() 사용)
- **requireAuth() 패턴**: 28개 기존 파일과 다른 패턴 (표준 인증 패턴 사용)
- **userId 쿼리스트링 전달**: 조작 가능 (세션에서 추출)
- **변환 규칙 무시**: snake_case/camelCase 혼용으로 프론트엔드 오류

### 함정 포인트
- **deprecated 패키지**: `@supabase/auth-helpers-nextjs` 사용 금지
- **환경변수 직접 접근**: `process.env.*` 대신 `env.ts` 사용
- **New Response()**: Next.js 15에서 `NextResponse.json()` 사용
- **에러 숨기기**: try-catch로 에러 무시하지 말고 적절히 처리

---

## 📁 관련 파일

- **인증**: [/src/lib/supabase/server-client.ts](../../../lib/supabase/server-client.ts)
- **타입 변환**: [/src/types/index.ts](../../../types/index.ts)
- **환경변수**: [/env.ts](../../../env.ts)
- **검증**: [/src/lib/security/validation-schemas.ts](../../../lib/security/validation-schemas.ts)
- **API 클라이언트**: [/src/lib/api-client.ts](../../../lib/api-client.ts)

---

*API Route 작업 시 이 지침을 필수로 준수하세요. API Route Agent가 자동으로 활성화되어 실시간 품질 검증을 수행합니다.*