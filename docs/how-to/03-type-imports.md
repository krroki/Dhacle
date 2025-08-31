# Type Imports in Dhacle

## 📌 문서 관리 지침
**목적**: 중앙화된 타입 시스템 사용법 - @/types에서 모든 타입 import 패턴 제공  
**대상**: TypeScript 작업하는 AI (*.ts, *.tsx 파일 영역)  
**범위**: 타입 import/사용 구현만 포함 (타입 이론 없음)  
**업데이트 기준**: @/types 구조 변경 또는 새 타입 카테고리 추가 시  
**최대 길이**: 9000 토큰 (현재 약 8500 토큰)  
**연관 문서**: [Type Agent](../../src/types/CLAUDE.md), [Database Agent](../../supabase/migrations/CLAUDE.md)

## ⚠️ 금지사항
- TypeScript 타입 시스템 이론 추가 금지 (→ explanation/ 문서로 이관)
- 타입 생성 방법 설명 금지 (→ database.generated 자동생성)
- 여러 타입 import 방법 제시 금지 (→ @/types만 사용)

---

This guide documents the actual type import patterns used throughout the Dhacle codebase.

## Central Type System

Dhacle uses a centralized type system with all imports from `@/types`.

### ✅ Correct Import Pattern

```typescript
// Always import from central @/types
import type { User, Profile, YouTubeVideo, Collection } from '@/types';
import { snakeToCamelCase } from '@/types';
```

### ❌ Wrong Import Patterns

```typescript
// ❌ NEVER import database types directly
import type { Database } from './database.generated';

// ❌ NEVER import from Supabase directly for app types  
import type { User } from '@supabase/supabase-js'; // Only for auth User type

// ❌ NEVER create local type definitions
interface MyLocalProfile { id: string; name: string; }
```

## Type Categories in @/types

### 1. Database Entity Types (snake_case)

```typescript
// Main entities - direct from database
import type {
  User,           // users table
  Profile,        // profiles view
  UserApiKey,     // user_api_keys table
  YouTubeVideo,   // videos table
  YouTubeChannel, // yl_channels table
  Collection,     // collections table
  Notification    // notifications table
} from '@/types';

// Example usage in API route
const { data: profile }: { data: Profile | null } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

### 2. Insert/Update Types

```typescript
// For database operations
import type { 
  UserInsert, 
  ProfileUpdate,
  YouTubeVideoInsert,
  CollectionUpdate 
} from '@/types';

// Example usage
const profileUpdate: ProfileUpdate = {
  full_name: 'New Name',
  updated_at: new Date().toISOString()
};

await supabase
  .from('profiles')
  .update(profileUpdate)
  .eq('id', user.id);
```

### 3. API Response Types

```typescript
// For API responses and frontend communication
import type {
  YouTubeSearchResponse,
  YouTubeVideoItem,
  ChannelAnalytics,
  KeywordTrend,
  ApiResponse,
  PaginatedResponse
} from '@/types';

// Example usage
const response: ApiResponse<Profile> = {
  data: profileData,
  success: true,
  message: 'Profile updated successfully'
};

return NextResponse.json(response);
```

### 4. Form Data Types

```typescript
// For React Hook Form and validation
import type {
  LoginFormData,
  SignupFormData,
  ProfileUpdateFormData,
  YouTubeSearchFormData
} from '@/types';

// Example with validation
const validation = profileUpdateSchema.safeParse(body);
const formData: ProfileUpdateFormData = validation.data;
```

## Real Examples from Codebase

### 1. API Route Type Usage (/api/user/profile/route.ts)

```typescript
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { snakeToCamelCase } from '@/types'; // Utility import
import { profileUpdateSchema, createValidationErrorResponse } from '@/lib/security/validation-schemas';

// Using Profile type from @/types for type safety
export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await requireAuth(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createSupabaseRouteHandlerClient();
  
  // Profile type is inferred from @/types
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return NextResponse.json(snakeToCamelCase({ profile }));
}
```

### 2. Complex YouTube Types (/types/index.ts)

```typescript
// YouTube Lens specific types with proper structure
export interface VideoWithStats {
  id: string;
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_title: string;
  published_at: string;
  view_count: number;
  like_count?: number;
  comment_count?: number;
  duration: string;
  thumbnail_url: string;
  tags?: string[];
  
  // Nested stats object
  stats: {
    viewCount: number;
    likeCount?: number;
    commentCount?: number;
    engagement?: number;
    trendScore?: number;
    viewsPerHour?: number;
    engagementRate?: number;
    viralScore?: number;
  };
}

// Usage in components
import type { VideoWithStats } from '@/types';

interface Props {
  videos: VideoWithStats[];
}
```

## Type Structure Patterns

### 1. Database-First Approach

```typescript
// All types start from database.generated.ts
export type { Database, Tables, TablesInsert, TablesUpdate } from './database.generated';

// Create aliases for easier use
export type DBUser = Tables<'users'>;
export type User = DBUser; // Direct alias - no transformation

// Insert/Update types
export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;
```

### 2. Extended Types for Frontend

```typescript
// When frontend needs additional computed properties
export type Collection = Omit<DBCollection, 'item_count'> & {
  itemCount: number; // camelCase version of item_count
};

// Multiple aliases for different contexts
export type YouTubeCollection = DBCollection; // For DB operations
export type Collection = DBCollection; // For frontend (with transform)
```

### 3. API-Specific Types

```typescript
// YouTube API response structures
export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeVideoItem[];
}

// Used in API routes that call YouTube API
import type { YouTubeSearchResponse } from '@/types';

const youtubeResponse: YouTubeSearchResponse = await fetchYouTubeAPI(query);
```

## Validation Integration

### Schema to Type Relationship

```typescript
// Zod schema (validation-schemas.ts)
export const profileUpdateSchema = z.object({
  username: z.string().min(2).optional(),
  fullName: z.string().min(2).optional(),
  channelName: z.string().max(100).optional(),
});

// Corresponding type in @/types
export interface ProfileUpdateFormData {
  username?: string;
  fullName?: string;
  channelName?: string;
}

// Usage in API route
import { profileUpdateSchema } from '@/lib/security/validation-schemas';
import type { ProfileUpdateFormData } from '@/types';

const validation = profileUpdateSchema.safeParse(body);
if (validation.success) {
  const formData: ProfileUpdateFormData = validation.data;
  // Type-safe access to formData.fullName, etc.
}
```

## Utility Types

### 1. Generic API Response

```typescript
// Generic wrapper for all API responses
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

// Usage across all API routes
const response: ApiResponse<Profile> = {
  data: profileData,
  success: true
};
```

### 2. Pagination

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Usage for paginated endpoints
const response: PaginatedResponse<YouTubeVideo> = {
  data: videos,
  total: 150,
  page: 1,
  limit: 20,
  hasMore: true
};
```

## Type Guards

```typescript
// Type guards available in @/types
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}

export function isYouTubeVideo(obj: unknown): obj is YouTubeVideo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'video_id' in obj &&
    'title' in obj
  );
}

// Usage in code
if (isUser(someData)) {
  // TypeScript now knows someData is User type
  console.log(someData.email); // Type-safe access
}
```

## Best Practices

### ✅ Do This

1. **Always import from @/types**
   ```typescript
   import type { User, Profile } from '@/types';
   ```

2. **Use specific types for operations**
   ```typescript
   const update: ProfileUpdate = { full_name: name };
   ```

3. **Leverage type inference**
   ```typescript
   // Let TypeScript infer the type from @/types
   const { data: profile } = await supabase.from('profiles').select('*');
   ```

4. **Use type guards for runtime checks**
   ```typescript
   if (isYouTubeVideo(item)) {
     // Type-safe access to video properties
   }
   ```

### ❌ Don't Do This

1. **Don't create duplicate type definitions**
   ```typescript
   // ❌ WRONG - type already exists in @/types
   interface LocalUser { id: string; email: string; }
   ```

2. **Don't import from database.generated directly**
   ```typescript
   // ❌ WRONG
   import type { Tables } from './database.generated';
   ```

3. **Don't use any type**
   ```typescript
   // ❌ WRONG - defeats the purpose of TypeScript
   const data: any = await apiCall();
   ```

## Import Summary

The Dhacle type system provides:

- **Single source of truth**: All types from `@/types`
- **Database consistency**: Direct mapping from Supabase generated types
- **Type safety**: Full TypeScript coverage across API and frontend
- **Utility functions**: Conversion helpers and type guards
- **Validation integration**: Seamless integration with Zod schemas

Always import from `@/types` to maintain consistency and get the latest type definitions across the entire Dhacle application.