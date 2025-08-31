# Authentication Patterns in Dhacle

## 📌 문서 관리 지침
**목적**: API 인증 구현 방법 - 40+ API 라우트에서 검증된 인증 패턴 제공  
**대상**: API Route 작업하는 AI (src/app/api/** 영역)  
**범위**: 단계별 인증 구현만 포함 (이론 설명 없음)  
**업데이트 기준**: 인증 패턴 변경 시 즉시 업데이트 (현재: requireAuth 28개, getUser 11개)  
**최대 길이**: 6000 토큰 (현재 약 5800 토큰)  
**연관 문서**: [API Route Agent](../../src/app/api/CLAUDE.md), [보안 가이드](../../src/lib/security/CLAUDE.md)

## ⚠️ 금지사항
- 인증 이론/개념 설명 추가 금지 (→ explanation/ 문서로 이관)
- 여러 솔루션 제시 금지 (→ 검증된 하나의 패턴만)
- 커스텀 인증 방법 추가 금지 (→ 기존 패턴만 사용)

---

This guide documents the actual authentication patterns used in the Dhacle codebase.

## Standard Authentication Pattern

Based on analysis of 40+ API routes, Dhacle uses two main authentication approaches:

### 1. Using requireAuth Helper (Recommended)

```typescript
// Import the helper
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to User Profile API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Step 2: Use user.id for authenticated logic
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)  // Always use user.id for filtering
      .single();

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. Direct Supabase Auth (Alternative)

```typescript
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const supabase = await createSupabaseRouteHandlerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn('Unauthorized access attempt to YouTube Collections API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Step 2: Use user for authenticated logic
    const collection_manager = new ServerCollectionManager();
    const { data, error } = await collection_manager.getCollections();

    return NextResponse.json({ collections: data });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Key Patterns Found

### ✅ Correct Patterns

1. **Always use getUser() for server-side auth**
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   ```

2. **Filter by authenticated user ID**
   ```typescript
   .eq('id', user.id)
   .eq('user_id', user.id)
   ```

3. **Consistent error responses**
   ```typescript
   return NextResponse.json(
     { error: 'User not authenticated' },
     { status: 401 }
   );
   ```

4. **Standard runtime directive**
   ```typescript
   export const runtime = 'nodejs';
   ```

5. **Proper logging**
   ```typescript
   logger.warn('Unauthorized access attempt to API');
   ```

### ❌ Anti-Patterns to Avoid

1. **Never use getSession() in API routes**
   ```typescript
   // ❌ WRONG - getSession() is client-side only
   const { data: { session } } = await supabase.auth.getSession();
   ```

2. **Don't skip authentication checks**
   ```typescript
   // ❌ WRONG - Missing auth check
   export async function GET() {
     const { data } = await supabase.from('profiles').select('*');
     return NextResponse.json({ data });
   }
   ```

3. **Don't use unfiltered queries**
   ```typescript
   // ❌ WRONG - Returns all users' data
   const { data } = await supabase.from('profiles').select('*');
   ```

## Role-Based Authentication

For admin routes, use the role-based helper:

```typescript
import { requireRole } from '@/lib/api-auth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Require admin role
  const user = await requireRole(request, 'admin');
  if (!user) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  // Admin-only logic here
  return NextResponse.json({ data: 'admin data' });
}
```

## Optional Authentication

For public endpoints that can benefit from user context:

```typescript
import { optionalAuth } from '@/lib/api-auth';

export async function GET(): Promise<NextResponse> {
  const user = await optionalAuth();
  
  if (user) {
    // Return personalized content
    const { data } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id);
    return NextResponse.json({ data, personalized: true });
  }

  // Return public content
  const { data } = await supabase
    .from('collections')
    .select('*')
    .eq('is_public', true);
  return NextResponse.json({ data, personalized: false });
}
```

## Complete Template

```typescript
// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { snakeToCamelCase } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

    // Step 2: Database query with user filtering
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      logger.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Step 3: Return snake_case converted response
    return NextResponse.json(snakeToCamelCase({ data }));
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Authentication Flow Summary

1. **Import helpers**: `requireAuth`, `logger`, `createSupabaseRouteHandlerClient`
2. **Check authentication**: Always first step in protected routes
3. **Handle unauthenticated**: Return 401 with error message
4. **Filter by user**: Use `user.id` to filter user-specific data
5. **Error handling**: Proper error responses and logging
6. **Response format**: Use `snakeToCamelCase` for consistent API responses

This pattern is used across all 40+ API routes in the Dhacle codebase and ensures consistent, secure authentication handling.