# Snake Case Conversion Patterns in Dhacle

## 📌 문서 관리 지침
**목적**: DB-API 간 snake_case 변환 구현 - 15+ API 라우트에서 검증된 변환 패턴 제공  
**대상**: API/DB 작업하는 AI (데이터 변환 필요한 모든 영역)  
**범위**: 변환 구현 단계만 포함 (컨벤션 이론 없음)  
**업데이트 기준**: snakeToCamelCase 함수 변경 또는 새 변환 패턴 추가 시  
**최대 길이**: 8000 토큰 (현재 약 7500 토큰)  
**연관 문서**: [Type Agent](../../src/types/CLAUDE.md), [API Route Agent](../../src/app/api/CLAUDE.md)

## ⚠️ 금지사항
- 네이밍 컨벤션 이론 추가 금지 (→ explanation/ 문서로 이관)
- 자동 변환 라이브러리 추가 금지 (→ 프로젝트 내장 함수만)
- 여러 변환 방법 제시 금지 (→ 검증된 패턴만)

---

This guide documents the actual snake_case conversion patterns used throughout the Dhacle codebase.

## Core Philosophy

Dhacle uses **snake_case everywhere** - both database and frontend. The conversion utilities handle API responses and form data transformation.

## Import Pattern

```typescript
import { snakeToCamelCase } from '@/types';
```

## Database to API Response Pattern

### ✅ Standard Pattern (Used in 15+ API routes)

```typescript
// In API routes - convert DB response to camelCase for frontend
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Convert snake_case DB response to camelCase for API
  return NextResponse.json(snakeToCamelCase({ profile }));
}
```

### Response Transformation

```typescript
// Database returns (snake_case):
{
  id: "123",
  full_name: "John Doe",
  channel_name: "My Channel",
  created_at: "2024-01-01T00:00:00Z",
  naver_cafe_nickname: "johndoe"
}

// API returns (camelCase via snakeToCamelCase):
{
  profile: {
    id: "123",
    fullName: "John Doe",
    channelName: "My Channel", 
    createdAt: "2024-01-01T00:00:00Z",
    naverCafeNickname: "johndoe"
  }
}
```

## Frontend to Database Pattern

### Manual Field Mapping (Most Common)

```typescript
export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  
  // Frontend sends camelCase, manually map to snake_case for DB
  const {
    username,
    workType,        // camelCase from frontend
    jobCategory,     // camelCase from frontend  
    currentIncome,   // camelCase from frontend
    targetIncome,    // camelCase from frontend
    experienceLevel,
  } = body;

  // Map to snake_case for database insert/update
  const result = await supabase
    .from('profiles')
    .update({
      username,
      work_type: workType,           // Convert to snake_case
      job_category: jobCategory,     // Convert to snake_case
      current_income: currentIncome, // Convert to snake_case
      target_income: targetIncome,   // Convert to snake_case
      experience_level: experienceLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  // Return converted response
  return NextResponse.json(snakeToCamelCase({ profile: result.data }));
}
```

### Conditional Field Mapping

```typescript
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const {
    username,
    fullName,
    channelName,
    channelUrl,
    workType,
    jobCategory,
    naverCafeNickname,
    naverCafeMemberUrl
  } = validation.data;

  // Build update object only with provided fields
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };
  
  // Conditional mapping to snake_case
  if (username !== undefined) updateData.username = username;
  if (fullName !== undefined) updateData.full_name = fullName;
  if (channelName !== undefined) updateData.channel_name = channelName;
  if (channelUrl !== undefined) updateData.channel_url = channelUrl;
  if (workType !== undefined) updateData.work_type = workType;
  if (jobCategory !== undefined) updateData.job_category = jobCategory;
  if (naverCafeNickname !== undefined) updateData.naver_cafe_nickname = naverCafeNickname;
  if (naverCafeMemberUrl !== undefined) updateData.cafe_member_url = naverCafeMemberUrl;

  const result = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);
}
```

## Type System Integration

### Database Types (snake_case)

```typescript
// From @/types - all DB types use snake_case
export type DBProfile = Tables<'profiles'>;
export type Profile = DBProfile; // Direct alias, no conversion

// Example DB type structure:
interface DBProfile {
  id: string;
  full_name: string | null;
  channel_name: string | null;
  work_type: string | null;
  job_category: string | null;
  current_income: string | null;
  target_income: string | null;
  experience_level: string | null;
  naver_cafe_nickname: string | null;
  cafe_member_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### Conversion Utilities

```typescript
// From @/types/index.ts - Available utility functions

/**
 * snake_case를 camelCase로 변환
 */
export function snakeToCamelCase<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase) as T;
  }
  
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      converted[camelKey] = snakeToCamelCase(value);
    }
    return converted as T;
  }
  
  return obj;
}

/**
 * camelCase를 snake_case로 변환
 */
export function camelToSnakeCase<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase) as T;
  }
  
  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      converted[snakeKey] = camelToSnakeCase(value);
    }
    return converted as T;
  }
  
  return obj;
}
```

## Real Examples from Codebase

### 1. Profile API (/api/user/profile/route.ts)

```typescript
// GET - Database to API
const { data: profile } = await supabase
  .from('profiles') 
  .select('*')
  .eq('id', user.id)
  .single();

return NextResponse.json(snakeToCamelCase({ profile }));
// Returns: { profile: { fullName: "...", channelName: "..." } }

// POST - Frontend to Database  
const { username, workType, jobCategory, currentIncome } = body;

await supabase
  .from('profiles')
  .update({
    username,
    work_type: workType,           // Manual conversion
    job_category: jobCategory,
    current_income: currentIncome,
    updated_at: new Date().toISOString(),
  })
  .eq('id', user.id);
```

### 2. Collections API (/api/youtube/collections/route.ts)

```typescript
// Simple case - no field mapping needed, just response conversion
const collection_manager = new ServerCollectionManager();
const { data, error } = await collection_manager.getCollections();

return NextResponse.json({ collections: data });
// Note: ServerCollectionManager likely handles conversion internally
```

## Validation Schema Integration

```typescript
// Zod schemas expect camelCase from frontend
export const profileUpdateSchema = z.object({
  username: z.string().min(2).optional(),
  fullName: z.string().min(2).optional(),        // camelCase
  channelName: z.string().max(100).optional(),   // camelCase  
  workType: z.enum(['student', 'employee']).optional(),
  naverCafeNickname: z.string().max(50).optional(),
});

// In API route, validated data is camelCase
const validation = profileUpdateSchema.safeParse(body);
const { fullName, channelName, workType, naverCafeNickname } = validation.data;

// Convert to snake_case for database
const updateData = {
  full_name: fullName,              // Manual conversion required
  channel_name: channelName,
  work_type: workType,
  naver_cafe_nickname: naverCafeNickname,
  updated_at: new Date().toISOString(),
};
```

## Best Practices

### ✅ Do This

1. **Use snakeToCamelCase for API responses**
   ```typescript
   return NextResponse.json(snakeToCamelCase({ data }));
   ```

2. **Manual field mapping for database operations**
   ```typescript
   const { workType, jobCategory } = body;
   await supabase.update({
     work_type: workType,
     job_category: jobCategory,
   });
   ```

3. **Import from @/types**
   ```typescript
   import { snakeToCamelCase } from '@/types';
   ```

### ❌ Don't Do This

1. **Don't use automatic camelToSnakeCase for DB operations**
   ```typescript
   // ❌ WRONG - Less explicit, error-prone
   await supabase.update(camelToSnakeCase(body));
   ```

2. **Don't skip conversion in API responses**
   ```typescript
   // ❌ WRONG - Frontend expects camelCase
   return NextResponse.json({ data }); // Returns snake_case
   ```

3. **Don't import conversion functions from elsewhere**
   ```typescript
   // ❌ WRONG
   import { snakeToCamelCase } from 'some-other-library';
   ```

## Summary

Dhacle's conversion strategy:

1. **Database**: Always snake_case (profiles.full_name, profiles.work_type)
2. **API Layer**: Manual conversion on input, automatic conversion on output
3. **Frontend**: Receives camelCase from API, sends camelCase to API
4. **Types**: snake_case everywhere, direct from Supabase generated types

This approach provides explicit control over field mapping while maintaining consistent casing conventions across the application layers.