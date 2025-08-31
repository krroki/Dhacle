# 📦 디하클 데이터 모델 명세

*목적: Frontend-Backend 타입 매핑*
*핵심 질문: "DB 스키마와 TS 타입이 일치하나?"*
*업데이트: 2025-08-22 - 타입 파일 통합 완료, TypeScript 타입 가드 패턴 추가*

---

## 🚨 필수 숙지 사항 (Critical Understanding)

### 🎯 Single Source of Truth - DB가 유일한 진실
- **DB가 진실의 원천**: Supabase DB 스키마가 모든 타입의 기준
- **자동 생성**: 수동 타입 정의 최소화, DB 변경시 자동 반영
- **타입 파일 통합**: 9개 → 2개 완료 (database.generated.ts, index.ts만 유지)
- **일관성**: snake_case (DB) ↔ camelCase (Frontend) 자동 변환

### 📦 타입 관리 필수 명령어
```bash
# 타입 생성 및 동기화 (반드시 실행)
npm run types:generate      # Supabase → TypeScript 타입 생성
npm run types:sync          # 생성 + 타입 체크
npm run types:check         # TypeScript 컴파일 체크

# 타입 오류 자동 수정 (AI 전용)
npm run types:auto-fix      # 타입 오류 자동 수정
npm run types:explain       # 타입 오류 상세 설명

# Wave 3-4 검증 도구 (2025-02-21 추가)
node scripts/type-validator.js    # 타입 시스템 전체 검증
node scripts/type-suggester.js <파일>  # 파일별 타입 제안
```

### 🆕 필수 import 패턴 (절대 준수)
```typescript
// ✅ 올바른 import - 반드시 @/types에서만
import { User, Course, Video } from '@/types';  // camelCase로 자동 변환됨
import { snakeToCamelCase, camelToSnakeCase } from '@/types';

// ❌ 절대 금지 패턴
import { Database } from '@/types/database.generated'; // 금지!
import { Course } from '@/types/course';               // 금지! (파일 삭제됨)
import { YouTubeVideo } from '@/types/youtube';        // 금지! (파일 삭제됨)

// ✅ 2025-08-22 타입 파일 통합 완료
// - 9개 타입 파일 → 2개로 통합 (database.generated.ts, index.ts)
// - 모든 타입은 @/types/index.ts에서만 import
// - 중복 타입 정의 제거 완료

// ⚠️ 2025-08-22 발견된 문제: 변환 함수 사용률 10%
// - 47개 API routes 중 5개만 snakeToCamelCase 사용
// - 대부분 API가 DB snake_case 그대로 반환 중
// - 긴급 수정 필요: 모든 API route에 변환 적용
```

### 🛡️ TypeScript Unknown 타입 가드 패턴 (2025-08-22 추가)
```typescript
// ✅ unknown 타입 안전하게 접근하기
function handleUnknownResult(result: unknown) {
  // 1. null/undefined 체크
  if (result === null || result === undefined) {
    return null;
  }
  
  // 2. 객체 타입 체크 ('object' 타입에 null 포함되므로 별도 체크)
  if (typeof result !== 'object') {
    return null;
  }
  
  // 3. 속성 존재 체크
  if ('data' in result) {
    const typedResult = result as { data?: unknown };
    // 4. 속성값 체크
    if (typedResult.data !== null && typedResult.data !== undefined) {
      return typedResult.data;
    }
  }
  
  return null;
}

// ❌ 금지: unknown 타입 직접 접근
const result = await someFunction();
result.data; // TypeScript 에러!

// ✅ 올바른 방법: 타입 가드 사용
const data = handleUnknownResult(result);
```

### 🚨 타입 불일치 체크리스트 (2025-01-31 Wave 3 완료)
| 문제 | Frontend | Backend | 해결 | 상태 |
|-----|----------|---------|------|------|
| 키 이름 | camelCase | snake_case | 변환 함수 | ✅ Wave 1 완료 |
| NULL | undefined | null | null → undefined 변환 | ✅ Wave 3 완료 |
| JSON | 객체 | jsonb 문자열 | JSON.parse() | ✅ 작동 중 |
| **Course** | Course | DB Row | mapCourse() 함수 | ✅ Wave 3 - 완전 통합 |
| **Lesson** | Lesson | DB Row | 인라인 인터페이스 | ✅ Wave 3 - 매핑 완료 |
| **CourseProgress** | CourseProgress | progress 테이블 | notes 필드 추가 | ✅ Wave 3 - 완료 |
| **Collection** | Collection | collections 테이블 | collection_items 수정 | ✅ Wave 3 - 테이블명 수정 |
| **UserApiKey** | UserApiKey | user_api_keys | Json 타입 캐스팅 | ✅ Wave 3 - 완료 |
| **테이블명** | camelCase | snake_case | 정확한 테이블명 사용 | ✅ Wave 3 - 100% 수정 |

---

## 📚 목차 (Table of Contents)

### 타입 시스템
- [🎯 TypeScript 타입 시스템 v2.0](#-typescript-타입-시스템-v20-2025-02-01-구축)
- [🔄 데이터 변환 레이어](#-데이터-변환-레이어)
- [🛟️ Zod 스키마와의 관계](#️-zod-스키마와의-관계)
- [📊 DB 스키마 vs Zod 스키마 차이점](#-db-스키마-vs-zod-스키마-차이점-2025-08-22-추가)

### 데이터 모델
- [👤 User/Profile](#-userprofile)
- [🎬 YouTube Video](#-youtube-video)
- [🆕 YouTube Lens Phase 2](#-youtube-lens-phase-2-2025-08-28-추가) - Shorts/키워드 분석 
- [📚 Course](#-course)
- [💰 Revenue Proof](#-revenue-proof)
- [📝 Community Post](#-community-post)
- [🔍 Naver Cafe Verifications](#-naver-cafe-verifications-2025-02-21-생성)
- [🔐 API Key](#-api-key)

### 유틸리티 및 패턴
- [📊 공통 변환 유틸리티](#-공통-변환-유틸리티-2025-02-01-typescript-개선)
- [📌 API 응답 타입 정의 패턴](#-api-응답-타입-정의-패턴-2025-01-30-추가)
- [🔐 환경변수 타입 안전성](#-환경변수-타입-안전성-2025-02-01-구현)
- [🎯 구현 우선순위](#-구현-우선순위)

---

## 🎯 TypeScript 타입 시스템 v2.0 (2025-02-02 완전 수정)

### 📐 타입 시스템 아키텍처
```
Supabase Database (PostgreSQL)
         ↓
    [types:generate 명령어]
         ↓
database.generated.ts (자동 생성, snake_case)
         ↓
    [index.ts 변환 레이어]
         ↓
Frontend Types (camelCase 자동 변환)
         ↓
React Components + API Routes
```

### 🔄 타입 생성 프로세스
```typescript
// 1. Supabase DB에서 타입 자동 생성 (Single Source of Truth)
npm run types:generate      // 프로덕션 DB → database.generated.ts
npm run types:generate:local // 로컬 DB → database.generated.ts

// 2. 자동 생성된 타입 (src/types/database.generated.ts)
// - Tables, Views, Functions, Enums 모두 포함
// - snake_case 형태로 생성됨

// 3. Frontend에서 사용 (src/types/index.ts가 자동 변환)
import { User, Course, Video } from '@/types';  // camelCase로 자동 변환됨
import { snakeToCamelCase, camelToSnakeCase } from '@/types';
```

### 🛡️ Zod 스키마와의 관계
```typescript
// Zod는 타입 정의가 아닌 런타임 입력 검증용
// src/lib/security/validation-schemas.ts

// 1. TypeScript 타입 (컴파일 타임)
import { User } from '@/types';  // Supabase에서 생성된 타입

// 2. Zod 스키마 (런타임 검증)
import { updateProfileSchema } from '@/lib/security/validation-schemas';

// 3. API Route에서 함께 사용
export async function POST(request: Request) {
  // Zod로 입력 검증
  const validation = await validateRequestBody(request, updateProfileSchema);
  if (!validation.success) {
    return createValidationErrorResponse(validation.error);
  }
  
  // TypeScript 타입으로 데이터 처리
  const userData: User = validation.data;
  // ...
}
```

### 📦 타입 관리 명령어
```bash
# 타입 생성 및 동기화
npm run types:generate      # Supabase → TypeScript 타입 생성
npm run types:sync          # 생성 + 타입 체크
npm run types:check         # TypeScript 컴파일 체크

# 타입 오류 자동 수정
npm run types:auto-fix      # 타입 오류 자동 수정
npm run types:explain       # 타입 오류 상세 설명
npm run types:help          # 타입 명령어 도움말
```

### 🎯 Single Source of Truth 원칙
- **DB가 진실의 원천**: Supabase DB 스키마가 모든 타입의 기준
- **자동 생성**: 수동 타입 정의 최소화, DB 변경시 자동 반영
- **타입 안전성**: any 타입 완전 제거 (0개 달성)
- **일관성**: snake_case (DB) ↔ camelCase (Frontend) 자동 변환

## 🔄 데이터 변환 레이어

### 기본 변환 패턴 (Union 타입 활용)
```typescript
// Supabase Response → Frontend Type
// Union 타입으로 유연한 매핑
const mapResponse = (dbData: DBType | FrontendType): FrontendType => ({
  id: 'id' in dbData ? dbData.id : dbData.id,
  // snake_case → camelCase
  userName: 'user_name' in dbData ? dbData.user_name : dbData.userName,
  createdAt: new Date('created_at' in dbData ? dbData.created_at : dbData.createdAt),
  // 타입 변환
  viewCount: Number('view_count' in dbData ? dbData.view_count : dbData.viewCount),
  // 기본값 처리 (nullish coalescing 우선순위)
  thumbnail: (('thumbnail_url' in dbData ? dbData.thumbnail_url : dbData.thumbnail) ?? '/default.jpg')
})
```

---

## 📊 DB 스키마 vs Zod 스키마 차이점 (2025-08-22 추가)

### 🎯 핵심 차이점 요약
| 구분 | DB 스키마 | Zod 스키마 |
|------|-----------|------------|
| **역할** | 데이터베이스 테이블 구조 정의 | 런타임 입력 검증 |
| **위치** | Supabase/PostgreSQL | TypeScript 코드 |
| **목적** | 데이터 저장 구조 | API 요청 검증 |
| **언제 사용** | 테이블 생성/수정 시 | API Route에서 |
| **타입 생성** | types:generate로 자동 생성 | 수동 작성 |

### 📚 DB 스키마 (Database Schema)
- **정의**: Supabase/PostgreSQL의 실제 테이블 구조
- **파일**: `supabase/migrations/*.sql`
- **특징**: 
  - snake_case 컬럼명 사용
  - PostgreSQL 데이터 타입 (uuid, text, jsonb, timestamptz)
  - 관계 정의 (Foreign Key, Primary Key)
  - RLS 정책 포함

```sql
-- DB 스키마 예시: Supabase 테이블 정의
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  username text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
```

### 🛡️ Zod 스키마 (Validation Schema)
- **정의**: 런타임에서 사용자 입력을 검증하는 스키마
- **파일**: `src/lib/security/validation-schemas.ts`
- **특징**:
  - camelCase 필드명 사용
  - JavaScript 타입 + 검증 규칙
  - 에러 메시지 커스터마이징
  - API Route에서 사용

```typescript
// Zod 스키마 예시: API 요청 검증
import { z } from 'zod';

export const createProfileSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  avatarUrl: z.string().url().optional(),
  bio: z.string().max(500).optional()
});

// API Route에서 사용
const validation = await validateRequestBody(request, createProfileSchema);
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}
```

### 🔄 관계와 워크플로우
```
사용자 입력 (camelCase)
     ↓
[Zod 스키마로 검증]
     ↓
camelToSnakeCase() 변환
     ↓
DB 저장 (snake_case)
     ↓
DB 조회
     ↓
snakeToCamelCase() 변환
     ↓
Frontend 응답 (camelCase)
```

### 💡 언제 뭘 사용하나요?
1. **새 테이블 추가**: DB 스키마 (SQL) → `npm run types:generate`
2. **API 엔드포인트 생성**: Zod 스키마 작성 → 입력 검증
3. **Frontend 타입 필요**: `@/types`에서 import (자동 생성된 타입)
4. **데이터 저장**: camelToSnakeCase() 변환 후 DB 저장
5. **데이터 조회**: DB에서 조회 후 snakeToCamelCase() 변환

### ⚠️ 주의사항
- DB 스키마 변경 시 반드시 `npm run types:generate` 실행
- Zod 스키마는 DB 스키마와 독립적 (검증 목적)
- Frontend는 DB 스키마를 직접 참조하지 않음 (자동 생성 타입 사용)

---

## 👤 User/Profile (2025-08-21 Profile 타입 개선)

### Frontend Type
```typescript
interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  role: 'user' | 'admin'
  createdAt: Date
}

// 🆕 DB에서 오는 snake_case Profile
interface ProfileDB {
  id: string
  username: string | null
  email: string | null
  avatar_url: string | null
  random_nickname: string | null
  naver_cafe_nickname: string | null
  naver_cafe_verified: boolean
  naver_cafe_member_url: string | null
  naver_cafe_verified_at: string | null
  created_at: string
  updated_at: string
}

// 🆕 Frontend용 camelCase Profile
interface Profile {
  id: string
  username: string | null
  email: string | null
  avatarUrl: string | null
  randomNickname: string | null
  naverCafeNickname: string | null
  naverCafeVerified: boolean
  naverCafeMemberUrl: string | null
  naverCafeVerifiedAt: string | null
  createdAt: string
  updatedAt: string
}

// 🆕 변환 함수 (필수 사용)
export function profileDBToProfile(db: ProfileDB): Profile {
  return {
    id: db.id,
    username: db.username,
    email: db.email,
    avatarUrl: db.avatar_url,
    randomNickname: db.random_nickname,
    naverCafeNickname: db.naver_cafe_nickname,
    naverCafeVerified: db.naver_cafe_verified,
    naverCafeMemberUrl: db.naver_cafe_member_url,
    naverCafeVerifiedAt: db.naver_cafe_verified_at,
    createdAt: db.created_at,
    updatedAt: db.updated_at
  }
}
```

### Supabase Schema
```sql
-- auth.users (Supabase Auth 기본)
id: uuid
email: text
created_at: timestamptz

-- public.profiles
user_id: uuid (FK → auth.users)
nickname: text
bio: text
social_links: jsonb
is_verified: boolean
created_at: timestamptz
updated_at: timestamptz

-- public.badges (✨ 2025-02-21 생성)
id: uuid (PK)
user_id: uuid (FK → auth.users)
badge_type: varchar(50)
badge_level: varchar(20) -- bronze/silver/gold
title: varchar(255)
description: text
earned_at: timestamptz
created_at: timestamptz
updated_at: timestamptz
```

### API 매핑 (구현 상태)
```typescript
// GET /api/user/profile
const profile = {
  userId: data.user_id,          // ✅ 구현됨
  nickname: data.nickname,        // ✅ 구현됨
  bio: data.bio,                  // ✅ 구현됨
  socialLinks: data.social_links, // ⚠️ 파싱 함수 필요
  isVerified: data.is_verified    // ✅ 구현됨
}
```

**변환 함수 상태**: 
- ✅ snake_case → camelCase 변환 구현
- ⚠️ socialLinks JSONB 파싱 미구현

---

## 🎥 YouTube Video

### Frontend Type
```typescript
interface Video {
  id: string
  title: string
  description: string
  channelTitle: string
  channelId: string
  thumbnailUrl: string
  viewCount: number
  likeCount: number
  publishedAt: Date
  duration: string // "PT3M45S"
  tags: string[]
}
```

### Supabase Schema
```sql
-- public.videos
video_id: text (PK)
title: text
description: text
channel_name: text
channel_id: text
thumbnail_url: text
view_count: bigint
like_count: bigint
published_at: timestamptz
duration: text
tags: text[]
created_at: timestamptz

-- public.video_stats (✨ 2025-02-21 생성)
id: uuid (PK)
video_id: varchar(255)
date: date
view_count: bigint
like_count: bigint
comment_count: bigint
view_delta: bigint
like_delta: bigint
comment_delta: bigint
viral_score: decimal(5,2)
engagement_rate: decimal(5,2)
views_per_hour: decimal(10,2)
snapshot_at: timestamptz
created_at: timestamptz
```

### API 매핑 (구현 상태)
```typescript
// GET /api/youtube/popular
const mapVideo = (data): Video => ({
  id: data.video_id,              // ⚠️ 키 이름 변환 필요
  title: data.title,               // ✅ 구현됨
  description: data.description,    // ✅ 구현됨
  channelTitle: data.channel_name,  // ⚠️ 키 이름 변환 필요
  channelId: data.channel_id,       // ✅ 구현됨
  thumbnailUrl: data.thumbnail_url,  // ✅ 구현됨
  viewCount: Number(data.view_count), // ⚠️ 타입 변환 함수 필요
  likeCount: Number(data.like_count), // ⚠️ 타입 변환 함수 필요
  publishedAt: new Date(data.published_at), // ⚠️ 타입 변환 함수 필요
  duration: data.duration,          // ✅ 구현됨
  tags: data.tags || []            // ✅ null 처리 구현
})
```

**변환 함수 상태**: 
- ✅ snake_case → camelCase 변환 부분 구현
- ⚠️ 타입 변환 함수 필요 (Number, Date)

---

## 🆕 YouTube Lens Phase 2 (2025-08-28 추가)

**Phase 2 구현**: Shorts 자동 분석, 키워드 트렌드 시스템, 카테고리 통계, 팔로우 알림

### 1. 비디오 메타데이터 (yl_videos)

#### Supabase Schema
```sql
CREATE TABLE yl_videos (
  video_id TEXT PRIMARY KEY,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_seconds INTEGER,
  is_shorts BOOLEAN DEFAULT false,     -- 🆕 Shorts 자동 판별
  published_at TIMESTAMPTZ,
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  thumbnail_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Frontend Type
```typescript
interface YlVideo {
  videoId: string;
  channelId: string;
  title: string;
  description: string;
  durationSeconds: number;
  isShorts: boolean;                   // 🆕 Shorts 판별 결과
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. 키워드 트렌드 (yl_keyword_trends)

#### Supabase Schema
```sql
CREATE TABLE yl_keyword_trends (
  keyword TEXT,
  date DATE,
  frequency INTEGER DEFAULT 1,
  channels TEXT[],                     -- 사용 채널 목록
  growth_rate NUMERIC(5,2),           -- 전일 대비 성장률
  category TEXT,
  PRIMARY KEY(keyword, date)
);
```

#### Frontend Type
```typescript
interface KeywordTrend {
  keyword: string;
  date: string;                        // YYYY-MM-DD
  frequency: number;
  channels: string[];
  growthRate: number;                  // 성장률 (%)
  category?: string;
}
```

### 3. 카테고리 통계 (yl_category_stats)

#### Supabase Schema
```sql
CREATE TABLE yl_category_stats (
  category TEXT,
  subcategory TEXT,
  date DATE,
  channel_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_subscribers BIGINT DEFAULT 0,
  avg_delta_views BIGINT DEFAULT 0,
  top_channel_id TEXT,
  PRIMARY KEY(category, subcategory, date)
);
```

#### Frontend Type
```typescript
interface CategoryStats {
  category: string;
  subcategory: string;
  date: string;
  channelCount: number;
  totalViews: number;
  totalSubscribers: number;
  avgDeltaViews: number;
  topChannelId?: string;
}
```

### 4. 팔로우 업데이트 (yl_follow_updates)

#### Supabase Schema
```sql
CREATE TABLE yl_follow_updates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT REFERENCES yl_channels(channel_id) ON DELETE CASCADE,
  update_type TEXT CHECK (update_type IN ('new_video', 'milestone', 'trending')),
  message TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Frontend Type
```typescript
interface FollowUpdate {
  id: number;
  userId: string;
  channelId: string;
  updateType: 'new_video' | 'milestone' | 'trending';
  message: string;
  metadata: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}
```

### API 엔드포인트
- `GET/POST /api/youtube-lens/keywords/trends` - 키워드 트렌드 조회/분석
- **분석 라이브러리**: 
  - `src/lib/youtube-lens/shorts-detector.ts` - Shorts 자동 판별
  - `src/lib/youtube-lens/keyword-analyzer.ts` - 키워드 추출/트렌드 분석
- **UI 컴포넌트**: `src/components/features/tools/youtube-lens/KeywordTrends.tsx`

---

## 📚 Course

### Frontend Type
```typescript
interface Course {
  id: string
  title: string
  description: string
  instructor: string
  price: number
  thumbnailUrl: string
  duration: number // 분 단위
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  enrollmentCount: number
  rating: number | null
  isPublished: boolean
}
```

### Supabase Schema
```sql
-- public.courses
id: uuid (PK)
title: text
description: text
instructor_id: uuid (FK → profiles)
price: integer
thumbnail_url: text
duration_minutes: integer
level: text
category: text
enrollment_count: integer
rating: decimal(2,1)
is_published: boolean
created_at: timestamptz

-- public.course_enrollments (✨ 2025-02-21 생성)
id: uuid (PK)
user_id: uuid (FK → auth.users)
course_id: uuid (FK → courses)
enrolled_at: timestamptz
last_accessed_at: timestamptz
completed_at: timestamptz
progress_percentage: integer (0-100)
status: varchar(20) -- active/completed/paused/cancelled
created_at: timestamptz
updated_at: timestamptz

-- public.course_progress_extended (✨ 2025-02-21 생성)
id: uuid (PK)
user_id: uuid (FK → auth.users)
course_id: uuid (FK → courses)
lesson_id: uuid (FK → lessons)
total_lessons: integer
completed_lessons: integer
last_position: integer
notes: text
created_at: timestamptz
updated_at: timestamptz
```

### API 매핑 (구현 상태)
```typescript
// GET /api/courses
// ✅ 2025-02-02 mapCourse 함수 완전 재작성
const mapCourse = (data): Course => ({
  id: data.id,                      // ✅ 구현됨
  title: data.title,                // ✅ 구현됨
  description: data.description,     // ✅ 구현됨
  instructorName: data.instructor_name || 'Unknown',  // ✅ 수정 완료
  instructorId: data.instructor_id,  // ✅ 수정 완료
  price: data.price,                // ✅ 구현됨
  thumbnailUrl: data.thumbnail_url,  // ✅ 구현됨
  totalDuration: data.duration_minutes || 0,   // ✅ 수정 완료
  difficultyLevel: data.difficulty_level || 'beginner', // ✅ 수정 완료
  category: data.category,          // ✅ 구현됨
  totalStudents: data.total_students || 0, // ✅ 수정 완료
  averageRating: data.average_rating || 0, // ✅ 수정 완료
  status: data.status || 'active'    // ✅ 수정 완료
})
```

**변환 함수 상태**: 
- ✅ 완전 구현됨 (2025-02-02)
- ✅ 모든 필드 snake_case → camelCase 변환 완료

---

## 💰 Revenue Proof

### Frontend Type
```typescript
interface RevenueProof {
  id: string
  userId: string
  userName: string
  title: string
  content: string
  amount: number
  currency: 'KRW' | 'USD'
  proofImageUrl: string
  category: string
  likeCount: number
  commentCount: number
  isVerified: boolean
  createdAt: Date
}
```

### Supabase Schema
```sql
-- public.revenue_proofs
id: uuid (PK)
user_id: uuid (FK → profiles)
title: text
content: text
amount: bigint
currency: text
proof_image_url: text
category: text
like_count: integer
comment_count: integer
is_verified: boolean
created_at: timestamptz

-- public.revenues (✨ 2025-02-21 생성)
id: uuid (PK)
user_id: uuid (FK → auth.users)
amount: decimal(12,2)
currency: varchar(3) -- KRW/USD
proof_url: text
proof_type: varchar(50)
description: text
verified: boolean
verified_at: timestamptz
created_at: timestamptz
updated_at: timestamptz

-- public.proof_likes (✨ 2025-02-21 생성)
id: uuid (PK)
user_id: uuid (FK → auth.users)
proof_id: uuid (FK → revenue_proofs)
created_at: timestamptz

-- public.proof_comments (✨ 2025-02-21 생성)
id: uuid (PK)
user_id: uuid (FK → auth.users)
proof_id: uuid (FK → revenue_proofs)
parent_id: uuid (FK → proof_comments) -- 대댓글
content: text
is_edited: boolean
edited_at: timestamptz
created_at: timestamptz
updated_at: timestamptz
```

### API 매핑 (구현 상태)
```typescript
// GET /api/revenue-proof
const mapRevenueProof = (data): RevenueProof => ({
  id: data.id,                      // ✅ 구현됨
  userId: data.user_id,             // ✅ 구현됨
  userName: data.user_name,         // ⚠️ JOIN 처리 필요
  title: data.title,                // ✅ 구현됨
  content: data.content,            // ✅ 구현됨
  amount: Number(data.amount),      // ⚠️ bigint → number 변환 필요
  currency: data.currency,          // ✅ 구현됨
  proofImageUrl: data.proof_image_url, // ✅
  category: data.category,          // ✅
  likeCount: data.like_count,       // ✅
  commentCount: data.comment_count, // ✅
  isVerified: data.is_verified,     // ✅
  createdAt: new Date(data.created_at) // ⚠️ 타입 변환
})
```

---

## 📝 Community Post

### Frontend Type
```typescript
interface CommunityPost {
  id: string
  userId: string
  userName: string
  userAvatar: string | null
  category: 'qa' | 'info' | 'free'
  title: string
  content: string
  viewCount: number
  likeCount: number
  commentCount: number
  isPinned: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
```

### Supabase Schema
```sql
-- public.community_posts
id: uuid (PK)
user_id: uuid (FK → profiles)
category: text
title: text
content: text
view_count: integer
like_count: integer
comment_count: integer
is_pinned: boolean
tags: text[]
created_at: timestamptz
updated_at: timestamptz
```

---

## 🔍 Naver Cafe Verifications (✨ 2025-02-21 생성)

### Frontend Type
```typescript
interface NaverCafeVerification {
  id: string
  userId: string
  cafeNickname: string
  cafeMemberUrl: string | null
  verificationStatus: 'pending' | 'verified' | 'failed'
  verifiedAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### Supabase Schema
```sql
-- public.naver_cafe_verifications
id: uuid (PK)
user_id: uuid (FK → auth.users)
cafe_nickname: varchar(255)
cafe_member_url: text
verification_status: varchar(20) -- pending/verified/failed
verified_at: timestamptz
created_at: timestamptz
updated_at: timestamptz
```

### API 매핑 (구현 상태)
```typescript
// GET /api/verification/naver-cafe
const mapVerification = (data): NaverCafeVerification => ({
  id: data.id,                              // ✅
  userId: data.user_id,                     // ✅
  cafeNickname: data.cafe_nickname,         // ✅
  cafeMemberUrl: data.cafe_member_url,      // ✅
  verificationStatus: data.verification_status, // ✅
  verifiedAt: data.verified_at ? new Date(data.verified_at) : null,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at)
})
```

---

## 🔐 API Key

### Frontend Type
```typescript
interface ApiKey {
  id: string
  name: string
  key: string // 마스킹된 키 (****...abc)
  provider: 'youtube' | 'openai' | 'custom'
  isActive: boolean
  lastUsedAt: Date | null
  createdAt: Date
}
```

### Supabase Schema
```sql
-- public.user_api_keys
id: uuid (PK)
user_id: uuid (FK → profiles)
name: text
encrypted_key: text -- AES-256 암호화
provider: text
is_active: boolean
last_used_at: timestamptz
created_at: timestamptz
```

### API 매핑
```typescript
// GET /api/user/api-keys
const mapApiKey = (data): ApiKey => ({
  id: data.id,
  name: data.name,
  key: maskKey(data.encrypted_key), // ❌ 복호화 + 마스킹
  provider: data.provider,
  isActive: data.is_active,
  lastUsedAt: data.last_used_at ? new Date(data.last_used_at) : null,
  createdAt: new Date(data.created_at)
})

// 키 마스킹 함수
const maskKey = (key: string): string => {
  const decrypted = decrypt(key) // AES-256 복호화
  return '****' + decrypted.slice(-4)
}
```

---

## 📊 공통 변환 유틸리티 (2025-02-01 TypeScript 개선)

### snake_case → camelCase (any 타입 제거)
```typescript
// ✅ 개선된 버전 - Union 타입 사용
type ConvertibleType = string | number | boolean | null | undefined | Date | 
                       Record<string, unknown> | unknown[];

const toCamelCase = (obj: ConvertibleType): ConvertibleType => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
      acc[camelKey] = toCamelCase((obj as Record<string, unknown>)[key])
      return acc
    }, {} as Record<string, unknown>)
  }
  return obj
}
```

### 날짜 변환
```typescript
const parseDate = (date: string | Date): Date => {
  return typeof date === 'string' ? new Date(date) : date
}
```

### Null 처리
```typescript
const withDefaults = <T>(data: Partial<T>, defaults: T): T => {
  return { ...defaults, ...data }
}
```

---

## 📌 API 응답 타입 정의 패턴 (2025-01-30 추가)

### API 함수 반환 타입 명시 (Promise 타입 필수)
```typescript
// ✅ API 함수는 반드시 Promise 반환 타입 명시
export async function getApiData(): Promise<{
  success: boolean;
  data?: SpecificDataType;
  error?: string;
}> {
  try {
    // 비즈니스 로직
    return { success: true, data };
  } catch (error) {
    // Error 인스턴스 체크 패턴
    console.error(error instanceof Error ? error.message : String(error));
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// 배열 반환 시
export async function getList(): Promise<DataType[]> {
  // ...
}

// 단일 객체 반환 시
export async function getItem(id: string): Promise<DataType | null> {
  // ...
}
```

### Record 타입 안전 사용
```typescript
// ❌ 금지 - any 사용
type UnsafeRecord = Record<string, any>;

// ✅ 권장 - unknown 사용 후 타입 가드
type SafeRecord = Record<string, unknown>;

// 타입 가드로 안전한 접근
function processRecord(data: SafeRecord) {
  if (typeof data.field === 'string') {
    // data.field는 이제 string 타입
    console.log(data.field.toUpperCase());
  }
}
```

### 제네릭 타입 활용
```typescript
// API 응답 제네릭 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 사용 예시
async function fetchUser(): Promise<ApiResponse<User>> {
  // ...
}

async function fetchPosts(): Promise<ApiResponse<Post[]>> {
  // ...
}
```

---

## 🚨 타입 불일치 체크리스트

### 자주 발생하는 문제
| 문제 | Frontend | Backend | 해결 |
|-----|----------|---------|------|
| 키 이름 | camelCase | snake_case | 변환 함수 |
| 날짜 | Date 객체 | timestamptz 문자열 | new Date() |
| 숫자 | number | bigint | Number() |
| NULL | undefined | null | ?? 연산자 |
| JSON | 객체 | jsonb 문자열 | JSON.parse() |

### 구현 상태 (2025-02-21 업데이트)
- ✅ User/Profile 매핑
- ✅ Badges 테이블 생성 완료
- ❌ Video 매핑 함수
- ✅ video_stats 테이블 생성 완료
- ✅ Course 매핑 완료 (2025-02-02)
- ✅ course_enrollments 테이블 생성 완료
- ✅ course_progress_extended 테이블 생성 완료
- ⚠️ Revenue Proof JOIN
- ✅ revenues 테이블 생성 완료
- ✅ proof_likes 테이블 생성 완료
- ✅ proof_comments 테이블 생성 완료
- ❌ Community Post JOIN
- ✅ naver_cafe_verifications 테이블 생성 완료
- ⚠️ API Key 암호화/복호화

---

## 🔐 환경변수 타입 안전성 (2025-02-01 구현)

### 구현 개요
- **파일**: `src/env.ts`
- **라이브러리**: @t3-oss/env-nextjs v0.13.8
- **검증**: Zod 스키마 기반

### 타입 정의 구조
```typescript
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  // 서버 전용 환경변수
  server: {
    // Supabase
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    
    // 암호화
    ENCRYPTION_KEY: z.string().length(64),
    ENCRYPTION_IV: z.string().length(32),
    
    // YouTube
    YOUTUBE_API_KEY: z.string().min(1),
    YT_ADMIN_KEY: z.string().min(1),
    
    // Redis
    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.string().optional(),
    REDIS_PASSWORD: z.string().optional(),
    
    // 환경
    NODE_ENV: z.enum(['development', 'production', 'test']),
  },
  
  // 클라이언트 공개 환경변수
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    
    // 앱 설정
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
    
    // 기능 플래그
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.boolean().optional().default(false),
  },
  
  // 런타임 환경변수 (빌드 타임에 알 수 없는 값)
  runtimeEnv: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    ENCRYPTION_IV: process.env.ENCRYPTION_IV,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    YT_ADMIN_KEY: process.env.YT_ADMIN_KEY,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
});
```

### 사용 패턴
```typescript
// 1. 서버 컴포넌트/API Route
import { env } from '@/env';

export async function GET() {
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY; // string 타입 보장
  // 사용...
}

// 2. 클라이언트 컴포넌트
'use client';
import { env } from '@/env';

export function ClientComponent() {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL; // string 타입 보장
  // 사용...
}

// 3. 조건부 기능
if (env.NEXT_PUBLIC_ENABLE_ANALYTICS) {
  // Analytics 코드
}
```

### 빌드 타임 검증
- 누락된 필수 환경변수 → 빌드 실패
- 타입 불일치 → TypeScript 에러
- 형식 오류 (URL, 길이 등) → Zod 검증 실패

### 환경변수 추가 프로세스
1. `.env.local`에 환경변수 추가
2. `src/env.ts`에 스키마 정의 추가
3. `runtimeEnv`에 매핑 추가
4. TypeScript 자동 완성 즉시 사용 가능

### 환경변수 안전성 체크리스트
- [ ] `src/env.ts` 파일 존재
- [ ] 모든 환경변수가 Zod 스키마로 정의됨
- [ ] process.env 직접 접근 없음
- [ ] 빌드 시 환경변수 검증 통과

---

## 📋 QA 테스트 시나리오

### 정상 플로우
1. **구조 확인**:
   ```bash
   # 새 디렉토리 확인
   ls -la src/hooks/queries/
   ls -la src/store/
   ls src/env.ts src/components/ErrorBoundary.tsx
   ```

2. **문서 일관성**:
   - 모든 파일 경로가 실제로 존재하는지 확인
   - 라이브러리 버전이 package.json과 일치하는지 확인

3. **체크리스트 실행**:
   - 새로 추가된 체크리스트 항목 실제 수행
   - 각 항목이 검증 가능한지 확인

### 실패 시나리오
- 잘못된 파일 경로 → 404 에러
- 버전 불일치 → 기능 작동 안 함
- 체크리스트 누락 → 품질 저하

### 성능 측정
- 문서 로딩 속도
- 상호 참조 링크 작동
- 검색 가능성

---

## 🎯 구현 우선순위

### Phase 1 (완료) ✅ 2025-02-21
- [x] 누락된 8개 테이블 생성 완료
- [x] TypeScript 타입 재생성
- [x] Course 매핑 함수 완료
- [x] snake_case → camelCase 변환 구현

### Phase 2 (진행 중)
- [ ] 남은 TypeScript 오류 해결 (~30개)
- [ ] Video 매핑 함수 작성
- [ ] JOIN 데이터 처리 (userName 등)
- [ ] API Key 암호화/복호화

### Phase 3 (예정)
- [ ] TypeScript 제네릭 타입 정의
- [ ] Zod 스키마 통합
- [ ] 자동 타입 생성 파이프라인

---

## ✅ Phase 3 완료 조건 (기능 작동 필수)
- [x] **CODEMAP.md 업데이트 완료**
  - [x] src 디렉토리 구조 업데이트
  - [x] 새 디렉토리/파일 반영
  - [x] 주요 변경사항 명시
- [x] **CHECKLIST.md 업데이트 완료**
  - [x] 5개 새 체크리스트 섹션 추가
  - [x] 각 항목 실행 가능성 검증
- [x] **COMPONENT_INVENTORY.md 업데이트 완료**
  - [x] 시스템 컴포넌트 섹션 추가
  - [x] 각 컴포넌트 설명 완성
- [x] **ERROR_BOUNDARY.md 업데이트 완료**
  - [x] React Error Boundary 통합 섹션 추가
  - [x] 코드 예시 포함
  - [x] 플로우 차트 추가
- [x] **DATA_MODEL.md 업데이트 완료**
  - [x] 환경변수 타입 안전성 섹션 추가
  - [x] 실제 env.ts 구조 반영
  - [x] QA 테스트 시나리오 추가
- [ ] **Git 커밋**
  - [ ] "docs: 개발 도구 최적화 Phase 3 일반 문서 업데이트" 커밋

---

*데이터 타입 작업 시 이 문서 필수 참조*