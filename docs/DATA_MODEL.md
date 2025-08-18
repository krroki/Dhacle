# 📦 디하클 데이터 모델 명세

*Frontend TypeScript 타입과 Backend Supabase 스키마 매핑*

---

## 🔄 데이터 변환 레이어

### 기본 변환 패턴
```typescript
// Supabase Response → Frontend Type
const mapResponse = (dbData: DBType): FrontendType => ({
  id: dbData.id,
  // snake_case → camelCase
  userName: dbData.user_name,
  createdAt: new Date(dbData.created_at),
  // 타입 변환
  viewCount: Number(dbData.view_count),
  // 기본값 처리
  thumbnail: dbData.thumbnail_url || '/default.jpg'
})
```

---

## 👤 User/Profile

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

interface Profile {
  userId: string
  nickname: string | null
  bio: string | null
  socialLinks: {
    youtube?: string
    instagram?: string
  }
  isVerified: boolean
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
```

### API 매핑 (구현 상태)
```typescript
// GET /api/courses
const mapCourse = (data): Course => ({
  id: data.id,                      // ✅ 구현됨
  title: data.title,                // ✅ 구현됨
  description: data.description,     // ✅ 구현됨
  instructor: data.instructor_name,  // ⚠️ JOIN 처리 필요
  price: data.price,                // ✅ 구현됨
  thumbnailUrl: data.thumbnail_url,  // ✅ 구현됨
  duration: data.duration_minutes,   // ⚠️ 키 이름 변환 필요
  level: data.level,                // ✅ 구현됨
  category: data.category,          // ✅ 구현됨
  enrollmentCount: data.enrollment_count, // ✅ 구현됨
  rating: data.rating,              // ✅ 구현됨
  isPublished: data.is_published    // ✅ 구현됨
})
```

**변환 함수 상태**: 
- ✅ 대부분 구현됨
- ⚠️ instructor JOIN 처리 미구현

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

## 📊 공통 변환 유틸리티

### snake_case → camelCase
```typescript
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase)
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
      acc[camelKey] = toCamelCase(obj[key])
      return acc
    }, {})
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

### API 함수 반환 타입 명시
```typescript
// API 함수는 반드시 반환 타입 명시
export async function getApiData(): Promise<{
  success: boolean;
  data?: SpecificDataType;
  error?: string;
}> {
  // ...
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

### 구현 상태
- ✅ User/Profile 매핑
- ❌ Video 매핑 함수
- ⚠️ Course JOIN 처리
- ❌ Revenue Proof JOIN
- ❌ Community Post JOIN
- ⚠️ API Key 암호화/복호화

---

## 🎯 구현 우선순위

### Phase 1 (긴급)
- [ ] Video 매핑 함수 작성
- [ ] camelCase 변환 유틸리티 적용
- [ ] 날짜 변환 통일

### Phase 2 (중요)
- [ ] JOIN 데이터 처리 (userName 등)
- [ ] API Key 암호화/복호화
- [ ] NULL 처리 표준화

### Phase 3 (개선)
- [ ] TypeScript 제네릭 타입 정의
- [ ] Zod 스키마 통합
- [ ] 자동 타입 생성

---

*데이터 타입 작업 시 이 문서 필수 참조*