# Supabase Integration Patterns in Dhacle

## 📌 문서 관리 지침
**목적**: Supabase DB 연동 구현 - 40+ API 라우트에서 검증된 DB 작업 패턴 제공  
**대상**: DB 작업하는 AI (API 라우트, 서비스 레이어 영역)  
**범위**: DB 연동 구현 단계만 포함 (Supabase 개념 없음)  
**업데이트 기준**: createSupabaseRouteHandlerClient 함수 변경 또는 새 DB 패턴 추가 시  
**최대 길이**: 12000 토큰 (현재 약 11500 토큰)  
**연관 문서**: [API Route Agent](../../src/app/api/CLAUDE.md), [Database Agent](../../supabase/migrations/CLAUDE.md)

## ⚠️ 금지사항  
- Supabase 아키텍처 이론 추가 금지 (→ explanation/ 문서로 이관)
- RLS 정책 설명 추가 금지 (→ 구현 예시만)
- 여러 DB 연결 방법 제시 금지 (→ 검증된 패턴만)

---

This guide documents the actual Supabase integration patterns used throughout the Dhacle codebase based on analysis of 40+ API routes and database operations.

## Core Integration Pattern

### 1. Standard Server Client Creation

```typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Standard pattern - create client for each request
  const supabase = await createSupabaseRouteHandlerClient();
  
  // Use supabase client for database operations
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id);
}
```

### 2. Authentication Integration

```typescript
// Two patterns found in codebase:

// Pattern A: Using requireAuth helper (recommended)
import { requireAuth } from '@/lib/api-auth';

const user = await requireAuth(request);
if (!user) {
  return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
}

// Pattern B: Direct auth check
const supabase = await createSupabaseRouteHandlerClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
}
```

## Database Query Patterns

### 1. Basic CRUD Operations

#### Select with User Filtering
```typescript
// Always filter by authenticated user
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Select multiple records
const { data: collections } = await supabase
  .from('collections')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

#### Insert Operations
```typescript
// Create new record
const { data: newProfile, error: createError } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    username: 'newuser',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .select()
  .single();

// Batch insert
const { data: batchData, error } = await supabase
  .from('videos')
  .insert([
    { video_id: 'abc123', title: 'Video 1', user_id: user.id },
    { video_id: 'def456', title: 'Video 2', user_id: user.id }
  ])
  .select();
```

#### Update Operations
```typescript
// Update existing record
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: fullName,
    work_type: workType,
    updated_at: new Date().toISOString()
  })
  .eq('id', user.id)
  .select()
  .single();

// Conditional update with existence check
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', user.id)
  .single();

if (existingProfile) {
  // Update existing
  result = await supabase.from('profiles').update(updateData).eq('id', user.id);
} else {
  // Create new
  result = await supabase.from('profiles').insert(insertData);
}
```

#### Delete Operations
```typescript
// Soft delete (recommended)
const { error } = await supabase
  .from('collections')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', collectionId)
  .eq('user_id', user.id);

// Hard delete (use with caution)
const { error } = await supabase
  .from('collection_items')
  .delete()
  .eq('id', itemId)
  .eq('user_id', user.id); // Always filter by user
```

### 2. Complex Query Patterns

#### Joins and Relations
```typescript
// Select with related data
const { data: collections } = await supabase
  .from('collections')
  .select(`
    *,
    collection_items (
      id,
      video_id,
      title,
      created_at
    )
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

#### Aggregation Queries
```typescript
// Count related items
const { data: stats } = await supabase
  .from('collections')
  .select(`
    id,
    name,
    collection_items!inner (count)
  `)
  .eq('user_id', user.id);

// Custom aggregation with RPC
const { data: analytics } = await supabase
  .rpc('get_user_analytics', {
    user_id_param: user.id,
    date_from: '2024-01-01',
    date_to: '2024-12-31'
  });
```

## Error Handling Patterns

### 1. Standard Error Handling

```typescript
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id);

    if (error) {
      logger.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json(snakeToCamelCase({ profile: data }));
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. Constraint Violation Handling

```typescript
// Handle unique constraint violations
if (result.error) {
  if (result.error.code === '23505' && result.error.message.includes('username')) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }
  
  logger.error('Database constraint error:', result.error);
  return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
}
```

### 3. Profile Not Found Pattern

```typescript
// Handle missing profiles with auto-creation
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

if (profileError) {
  // Auto-create profile if doesn't exist
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (createError) {
    return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
  }
  
  return NextResponse.json(snakeToCamelCase({ profile: newProfile }));
}
```

## Service Layer Integration

### 1. Collection Manager Pattern

```typescript
// Using service classes for complex operations
import { ServerCollectionManager } from '@/lib/youtube/collections-server';

export async function GET(): Promise<NextResponse> {
  const collection_manager = new ServerCollectionManager();
  const { data, error } = await collection_manager.getCollections();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ collections: data });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { name, description, is_public, tags } = body;

  const collection_manager = new ServerCollectionManager();
  const { data, error } = await collection_manager.createCollection({
    name,
    description,
    is_public,
    tags,
  });

  return NextResponse.json({ collection: data }, { status: 201 });
}
```

## Real-World Examples

### 1. User Profile Management

```typescript
// Complete profile management flow
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createSupabaseRouteHandlerClient();
    const body = await request.json();
    
    // Validate with Zod
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }
    
    const { username, fullName, workType, experienceLevel } = validation.data;

    // Build update object with snake_case conversion
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    
    if (username !== undefined) updateData.username = username;
    if (fullName !== undefined) updateData.full_name = fullName;
    if (workType !== undefined) updateData.work_type = workType;
    if (experienceLevel !== undefined) updateData.experience_level = experienceLevel;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    let result;
    if (!existingProfile) {
      // Create new profile
      result = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          ...updateData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
    } else {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();
    }

    if (result.error) {
      if (result.error.code === '23505' && result.error.message.includes('username')) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json(snakeToCamelCase({ 
      profile: result.data,
      message: 'Profile updated successfully'
    }));
  } catch (error) {
    logger.error('Profile update failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. YouTube Data Management

```typescript
// YouTube video favorites management
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = await createSupabaseRouteHandlerClient();
    const { video_id, title, channel_title, thumbnail_url } = await request.json();

    // Check if already favorited
    const { data: existing } = await supabase
      .from('youtube_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', video_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Already in favorites' }, { status: 409 });
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('youtube_favorites')
      .insert({
        user_id: user.id,
        video_id,
        title,
        channel_title,
        thumbnail_url,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    return NextResponse.json(snakeToCamelCase({ favorite: data }), { status: 201 });
  } catch (error) {
    logger.error('Add favorite failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Best Practices from Codebase

### ✅ Do This

1. **Always create fresh client per request**
   ```typescript
   const supabase = await createSupabaseRouteHandlerClient();
   ```

2. **Filter by authenticated user**
   ```typescript
   .eq('user_id', user.id)
   .eq('id', user.id) // For profile table
   ```

3. **Use proper error handling**
   ```typescript
   if (error) {
     logger.error('Database error:', error);
     return NextResponse.json({ error: 'Database error' }, { status: 500 });
   }
   ```

4. **Include timestamps**
   ```typescript
   {
     created_at: new Date().toISOString(),
     updated_at: new Date().toISOString()
   }
   ```

5. **Use select() after insert/update**
   ```typescript
   .insert(data)
   .select()
   .single();
   ```

### ❌ Don't Do This

1. **Don't reuse client instances**
   ```typescript
   // ❌ WRONG - creates security issues
   const globalSupabase = createSupabaseClient();
   ```

2. **Don't skip user filtering**
   ```typescript
   // ❌ WRONG - exposes all users' data
   const { data } = await supabase.from('profiles').select('*');
   ```

3. **Don't ignore errors**
   ```typescript
   // ❌ WRONG - silent failures
   const { data } = await supabase.from('profiles').select('*');
   return NextResponse.json({ data }); // What if error occurred?
   ```

4. **Don't use getSession() in API routes**
   ```typescript
   // ❌ WRONG - use getUser() instead
   const { data: { session } } = await supabase.auth.getSession();
   ```

## Database Security (RLS)

All tables have Row Level Security enabled:

```sql
-- Example RLS policies used in Dhacle
CREATE POLICY "Users own records" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own api keys" ON user_api_keys FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own collections" ON collections FOR ALL USING (auth.uid() = user_id);
```

This means even without explicit filtering, RLS provides security, but always include user filtering for clarity and performance.

## Performance Patterns

1. **Use selective queries**
   ```typescript
   // Only select needed columns
   .select('id, name, created_at')
   ```

2. **Use single() for unique records**
   ```typescript
   // More efficient than selecting array and taking first
   .single()
   ```

3. **Order results when needed**
   ```typescript
   .order('created_at', { ascending: false })
   ```

4. **Use appropriate indexes** (handled at database level)

The Dhacle codebase demonstrates mature Supabase integration patterns that prioritize security, error handling, and type safety while maintaining good performance characteristics.