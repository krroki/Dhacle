# 🔌 API Route 개발 지침

*Next.js 15 App Router API Routes 표준 패턴 및 보안 규칙*

---

## 🛑 API Route 3단계 필수 규칙

### 1️⃣ STOP - 즉시 중단 신호
- **세션 체크 없는 API 발견 → 중단**
- **any 타입 사용 → 중단**  
- **빈 배열/null 임시 반환 → 중단**
- **try-catch로 에러 숨기기 → 중단**

### 2️⃣ MUST - 필수 행동
```typescript
// 모든 API Route 필수
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
}

// Response 타입 정의 필수
type ApiResponse = { data: UserData[] } | { error: string };
```

### 3️⃣ CHECK - 검증 필수
```bash
# 수정 후 즉시 실행
npm run types:check
npx biome check src/app/api/**/*.ts
curl -X GET http://localhost:3000/api/[endpoint] # 실제 동작 확인
```

## 🚫 API Route any 타입 금지

### ❌ 발견된 문제: app/api/youtube/search/route.ts
```typescript
// ❌ 절대 금지
const results = response.data.items as any

// ✅ 즉시 수정 - YouTube API 타입 확인 후
import type { YouTubeSearchItem } from '@/types/youtube'
const results = response.data.items as YouTubeSearchItem[]
```

---

## 🚨 API Route 필수 패턴 (Next.js 15 App Router)

### ✅ 올바른 패턴 (2025-08-22 표준)

```typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 인증 체크 (필수)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // 비즈니스 로직
    const { data, error } = await supabase
      .from('table')
      .select()
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### ❌ 절대 금지 패턴 (빌드 실패 원인)

```typescript
// ❌ 금지 - PKCE 오류 발생!
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// ❌ 금지 - 환경변수 오류!
import { createServerClient } from '@supabase/ssr';

// ❌ 금지 - 보안 취약점!
getSession() // → getUser() 사용

// ❌ 금지 - Next.js 15 비호환!
new Response() // → NextResponse.json() 사용
```

---

## 🔒 인증 골든룰

### 1. **모든 Route는 세션 검사 필수**
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json(
    { error: 'User not authenticated' },
    { status: 401 }
  );
}
```

### 2. **getUser() 사용** (getSession() 금지)
- `getUser()`: 서버에서 토큰 검증 (안전)
- `getSession()`: 클라이언트 토큰 신뢰 (위험)

### 3. **401 시 표준 에러 형식 준수**
```typescript
{ error: 'User not authenticated' }
```

### 4. **userId는 세션에서만 추출**
```typescript
// ❌ 금지 - 조작 가능
const userId = request.nextUrl.searchParams.get('userId');

// ✅ 올바름 - 세션에서 추출
const userId = user.id;
```

---

## 🎯 HTTP 메서드별 패턴

### GET - 데이터 조회
```typescript
export async function GET(request: Request): Promise<NextResponse> {
  // 쿼리 파라미터 검증
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // 페이지네이션 적용
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .range(from, to);
  
  // 캐싱 헤더 설정
  return NextResponse.json(
    { data, total: count, page, limit },
    { 
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate'
      }
    }
  );
}
```

### POST - 데이터 생성
```typescript
import { validateRequestBody } from '@/lib/security/validation-schemas';
import { createPostSchema } from './schemas';

export async function POST(request: Request): Promise<NextResponse> {
  // Zod 스키마 검증
  const validation = await validateRequestBody(request, createPostSchema);
  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }
  
  // 트랜잭션 처리
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...validation.data,
      user_id: user.id,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  // 생성된 리소스 반환
  return NextResponse.json(data, { status: 201 });
}
```

### PUT/PATCH - 데이터 수정
```typescript
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // 권한 체크
  const { data: existing } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', params.id)
    .single();
  
  if (existing?.user_id !== user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  
  // 부분 업데이트
  const body = await request.json();
  const { data, error } = await supabase
    .from('posts')
    .update(body)
    .eq('id', params.id)
    .select()
    .single();
  
  return NextResponse.json(data);
}
```

### DELETE - 데이터 삭제
```typescript
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  // Soft delete 우선
  const { error } = await supabase
    .from('posts')
    .update({ 
      deleted_at: new Date().toISOString(),
      deleted_by: user.id 
    })
    .eq('id', params.id)
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  // 삭제 확인 응답
  return NextResponse.json(
    { message: 'Successfully deleted' },
    { status: 200 }
  );
}
```

---

## 📊 에러 처리 표준

### 에러 응답 형식
```typescript
interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
}
```

### 상태 코드별 처리
```typescript
// 400 - 잘못된 요청 (검증 실패)
return NextResponse.json(
  { error: 'Bad Request', message: '구체적인 이유' },
  { status: 400 }
);

// 401 - 인증 필요
return NextResponse.json(
  { error: 'User not authenticated' },
  { status: 401 }
);

// 403 - 권한 없음
return NextResponse.json(
  { error: 'Forbidden', message: '권한이 없습니다' },
  { status: 403 }
);

// 404 - 리소스 없음
return NextResponse.json(
  { error: 'Not Found', message: '요청한 리소스를 찾을 수 없습니다' },
  { status: 404 }
);

// 409 - 충돌 (중복 등)
return NextResponse.json(
  { error: 'Conflict', message: '이미 존재합니다' },
  { status: 409 }
);

// 500 - 서버 오류
return NextResponse.json(
  { error: 'Internal Server Error' },
  { status: 500 }
);
```

---

## 🔍 입력 검증 패턴

### Zod 스키마 검증
```typescript
import { z } from 'zod';
import { validateRequestBody } from '@/lib/security/validation-schemas';

// 스키마 정의
const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).max(5).optional()
});

// 검증 수행
const validation = await validateRequestBody(request, createPostSchema);
if (!validation.success) {
  return createValidationErrorResponse(validation.error);
}

// 검증된 데이터 사용
const validatedData = validation.data;
```

### XSS 방지
```typescript
import { sanitizeRichHTML } from '@/lib/security/sanitizer';

const safeContent = sanitizeRichHTML(userInput);
```

---

## ⚡ 성능 최적화

### Response Streaming
```typescript
// 대용량 데이터 스트리밍
const stream = new ReadableStream({
  async start(controller) {
    const { data } = await supabase.from('large_table').select();
    controller.enqueue(JSON.stringify(data));
    controller.close();
  }
});

return new Response(stream, {
  headers: { 'Content-Type': 'application/json' }
});
```

### 페이지네이션
```typescript
const limit = 20;
const offset = (page - 1) * limit;

const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(offset, offset + limit - 1);
```

### DB 쿼리 최적화
```typescript
// ✅ 필요한 필드만 선택
.select('id, title, created_at')

// ✅ 인덱스 활용
.eq('indexed_column', value)

// ✅ 조인 최소화
.select('*, author:users(name)')
```

---

## 🧪 테스트 체크리스트

- [ ] 인증 없이 호출 → 401
- [ ] 잘못된 데이터 → 400 + 상세 메시지
- [ ] 정상 요청 → 200 + 데이터
- [ ] DB 오류 → 500 + 로깅
- [ ] Rate limiting 동작 확인
- [ ] 권한 체크 → 403
- [ ] 존재하지 않는 리소스 → 404

---

## 📁 관련 파일

- 인증: `/src/lib/supabase/server-client.ts`
- 검증: `/src/lib/security/validation-schemas.ts`
- 타입: `/src/types/index.ts`
- 에러 처리: `/src/lib/api-error.ts`
- Rate Limiting: `/src/lib/security/rate-limiter.ts`

---

## ⚠️ 주의사항

1. **환경변수 직접 접근 금지** - `env.ts` 사용
2. **any 타입 사용 금지** - 구체적 타입 정의
3. **userId 쿼리스트링 전달 금지** - 세션에서 추출
4. **동기 작업 금지** - 모든 DB 작업은 비동기
5. **민감정보 로깅 금지** - 패스워드, 토큰 제외

---

*API Route 작업 시 이 문서를 우선 참조하세요.*