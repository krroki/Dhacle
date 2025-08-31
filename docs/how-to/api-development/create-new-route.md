# 🔌 API Route 생성 - 단계별 실행 가이드

*가장 자주 하는 작업인 새 API Route 생성을 실수 없이 완료하는 방법*

**목적**: 디하클 프로젝트에서 새 API 엔드포인트를 안전하고 일관되게 생성  
**소요시간**: 5-10분  
**전제조건**: 테이블이 이미 생성되어 있어야 함 ([테이블 생성 가이드](../database-operations/create-table.md) 참조)

---

## 🛑 STOP - 즉시 중단 신호

다음 중 하나라도 발견되면 **즉시 작업 중단**:
- ❌ 세션 체크 없는 API 
- ❌ any 타입 사용
- ❌ 빈 배열/null 임시 반환값
- ❌ `getSession()` 함수 사용 (프로젝트에 없는 함수!)

## ✅ MUST - 필수 행동 패턴

### 인증 패턴 (모든 API Route 필수)
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
}
```

### Response 타입 정의 (필수)
```typescript
type ApiResponse = { data: UserData[] } | { error: string };
```

## 📋 CHECK - 검증 필수

작업 완료 후 반드시 실행:
```bash
npm run types:check           # TypeScript 에러 확인
curl -X GET http://localhost:3000/api/[endpoint]  # 실제 동작 확인
```

---

## 📝 단계별 실행 방법

### 1단계: 파일 생성 및 기본 구조
```bash
# API 파일 생성 (예: /api/posts)
mkdir -p src/app/api/posts
touch src/app/api/posts/route.ts
```

### 2단계: 기본 템플릿 작성
```typescript
// src/app/api/posts/route.ts
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 🔒 인증 체크 (필수 - 절대 생략 금지)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // 📊 비즈니스 로직 (실제 DB 쿼리)
    const { data, error } = await supabase
      .from('posts')  // 실제 테이블명 사용
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    // ✅ 성공 응답
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

### 3단계: POST 메서드 추가 (데이터 생성)
```typescript
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 🔒 인증 체크 (필수)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // 📥 요청 본문 파싱
    const body = await request.json();
    
    // 🔍 간단한 검증 (Zod 사용 권장)
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // 📊 DB에 데이터 생성
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: body.title,
        content: body.content,
        user_id: user.id,  // 세션에서 추출 (쿼리스트링 금지)
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 4단계: 타입 정의 추가
```typescript
// 파일 상단에 타입 정의
interface CreatePostRequest {
  title: string;
  content: string;
  tags?: string[];
}

interface PostResponse {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
}

type ApiResponse = PostResponse | PostResponse[] | { error: string };
```

### 5단계: 동적 라우트 (선택적)
개별 리소스 접근이 필요한 경우:
```bash
# 동적 라우트 생성
mkdir -p src/app/api/posts/[id]
touch src/app/api/posts/[id]/route.ts
```

```typescript
// src/app/api/posts/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 인증 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // ID로 특정 게시글 조회
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)  // 본인 게시글만
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
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

### 6단계: 검증 및 테스트
```bash
# 1. TypeScript 컴파일 확인
npm run types:check

# 2. 개발 서버 시작
npm run dev

# 3. API 엔드포인트 테스트
curl -X GET "http://localhost:3000/api/posts"
curl -X POST "http://localhost:3000/api/posts" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Post", "content": "Test content"}'

# 4. 브라우저에서 직접 확인
# http://localhost:3000/api/posts (GET만 가능)
```

---

## ⚠️ 절대 하지 말 것

| ❌ 금지 | 이유 | ✅ 대신 사용 |
|---------|------|-------------|
| `getSession()` | 프로젝트에 없는 함수 | `getUser()` |
| `any` 타입 | biome 에러 발생 | 구체적 타입 정의 |
| `process.env.VAR` | 타입 안전하지 않음 | `env.ts` import |
| userId 쿼리스트링 | 조작 가능 | 세션에서 추출 |
| TODO 주석 | 임시방편 금지 | 즉시 구현 |
| 빈 배열 반환 | 실제 로직 없음 | DB에서 실제 조회 |

---

## 🎯 고급 패턴

### Rate Limiting 추가
```typescript
import { authRateLimiter } from '@/lib/security/rate-limiter';

// API Route 상단에 추가
const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
const rateLimit = await authRateLimiter.check(clientIp);
if (!rateLimit.success) {
  return NextResponse.json(
    { error: 'Too many requests' },
    { status: 429 }
  );
}
```

### Zod 검증 강화
```typescript
import { z } from 'zod';
import { validateRequestBody } from '@/lib/security/validation-schemas';

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
```

### 페이지네이션
```typescript
// 쿼리 파라미터 처리
const { searchParams } = new URL(request.url);
const page = parseInt(searchParams.get('page') || '1');
const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);

const from = (page - 1) * limit;
const to = from + limit - 1;

const { data, count } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .range(from, to);

return NextResponse.json({
  data,
  pagination: {
    page,
    limit,
    total: count,
    totalPages: Math.ceil((count || 0) / limit)
  }
});
```

---

## 🔗 다음 단계

### 관련 가이드
- [테이블 생성하기](../database-operations/create-table.md) - API 생성 전 필수
- [컴포넌트에서 API 호출하기](../frontend-development/api-integration.md)
- [API 에러 처리하기](../error-handling/api-errors.md)

### 검증 도구
```bash
npm run verify:parallel  # 전체 검증
npm run types:check      # 타입 검증
```

---

**🎉 완료!** 이제 안전하고 일관된 API Route가 생성되었습니다. 실제 테스트를 통해 정상 작동을 확인하고 다음 작업을 진행하세요.