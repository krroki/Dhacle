# 🔷 TypeScript 타입 관리 시스템

*Single Source of Truth 타입 시스템 및 snake_case/camelCase 변환*

---

## 🚨 Single Source of Truth 원칙

### 📊 타입 플로우
```
Supabase DB (snake_case)
     ↓ [npm run types:generate]
database.generated.ts (자동 생성, 수정 금지)
     ↓
src/types/index.ts (변환 레이어, 중앙 관리)
     ↓
Frontend Components (camelCase 사용)
```

**핵심**: DB가 진실의 원천, index.ts가 유일한 타입 소스

---

## ✅ 올바른 타입 import

### 반드시 @/types에서만 import
```typescript
// ✅ 올바른 import - @/types만 사용
import { User, Course, YouTubeVideo } from '@/types';
import { snakeToCamelCase, camelToSnakeCase } from '@/types';
import type { ApiResponse, PaginatedResponse } from '@/types';

// ❌ 절대 금지 패턴들
import { Database } from '@/types/database';           // 금지!
import { Database } from '@/types/database.generated'; // 금지!
import { Database } from '@/types/database.types';     // 금지!
import type { Tables } from '@/types/database.generated'; // 금지!
```

### 파일 체계
```
types/
├── database.generated.ts  # Supabase 자동 생성 (절대 수정 금지!)
└── index.ts              # 중앙 타입 정의 (Single Source of Truth)

❌ 삭제된 파일들 (중복 방지):
- course.ts
- youtube.ts
- youtube-lens.ts
- revenue-proof.ts
- 기타 개별 타입 파일
```

---

## 🔄 케이스 변환 시스템

### API Route에서 (DB → Frontend)
```typescript
import { snakeToCamelCase } from '@/types';

// DB에서 snake_case로 가져온 데이터
const { data } = await supabase
  .from('youtube_videos')
  .select('video_id, channel_name, created_at');

// Frontend로 camelCase로 변환해서 전달
return NextResponse.json(snakeToCamelCase(data));
// 결과: { videoId, channelName, createdAt }
```

### Frontend에서 사용
```typescript
import { YouTubeVideo } from '@/types';
import { apiGet } from '@/lib/api-client';

// 이미 camelCase로 변환된 데이터
const video: YouTubeVideo = await apiGet('/api/youtube/video');
console.log(video.videoId);     // camelCase
console.log(video.channelName); // camelCase
```

### DB 저장 시 (Frontend → DB)
```typescript
import { camelToSnakeCase } from '@/types';

// Frontend에서 camelCase 데이터
const userData = {
  firstName: 'John',
  lastName: 'Doe',
  createdAt: new Date()
};

// DB에 snake_case로 변환해서 저장
await supabase
  .from('users')
  .insert(camelToSnakeCase(userData));
// 저장: { first_name, last_name, created_at }
```

---

## 📝 타입 정의 규칙

### 1. 기본 타입 정의
```typescript
// User 타입 (camelCase 필드)
export interface User {
  id: string;
  email: string;
  firstName: string;    // DB: first_name
  lastName: string;     // DB: last_name
  createdAt: Date;      // DB: created_at
  updatedAt: Date;      // DB: updated_at
}
```

### 2. Union 타입 활용
```typescript
// 상태 타입
export type Status = 'pending' | 'active' | 'completed' | 'failed';

// 역할 타입
export type UserRole = 'admin' | 'user' | 'moderator';

// 결제 상태
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
```

### 3. 제네릭 활용
```typescript
// API 응답 타입
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 사용 예시
type UserResponse = ApiResponse<User>;
type PostListResponse = PaginatedResponse<Post>;
```

### 4. Utility 타입 활용
```typescript
// 부분 업데이트
export type UpdateUser = Partial<User>;

// 필수 필드만
export type CreateUser = Pick<User, 'email' | 'firstName' | 'lastName'>;

// 특정 필드 제외
export type PublicUser = Omit<User, 'password' | 'refreshToken'>;

// 읽기 전용
export type ReadonlyUser = Readonly<User>;
```

### 5. any 타입 절대 금지
```typescript
// ❌ 금지 - any 타입
const data: any = [];
function process(input: any): any {}

// ✅ 올바름 - 구체적 타입 또는 unknown
const data: unknown[] = [];
function process<T>(input: T): T {}

// unknown 처리 시 타입 가드 사용
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj
  );
}
```

---

## 🔧 타입 생성 명령어

### DB에서 타입 생성
```bash
# 프로덕션 DB에서 타입 생성
npm run types:generate

# 로컬 DB에서 타입 생성  
npm run types:generate:local

# database.generated.ts 파일이 자동 생성/갱신됨
```

### 타입 체크
```bash
# TypeScript 타입 체크
npm run types:check

# 타입 오류 상세 확인
npx tsc --noEmit
```

### 타입 오류 자동 수정 (신중히 사용)
```bash
# AI 기반 타입 수정 제안
npm run types:auto-fix

# ⚠️ 주의: 자동 수정은 검증 후 사용
```

---

## 🚫 절대 금지사항

1. **any 타입 사용 금지**
   ```typescript
   // ❌ 절대 금지
   const data: any = {};
   ```

2. **database.generated.ts 직접 import 금지**
   ```typescript
   // ❌ 절대 금지
   import { Database } from '@/types/database.generated';
   ```

3. **수동으로 DB 타입 작성 금지**
   ```typescript
   // ❌ 금지 - DB 타입 임의 작성
   interface DBUser {
     user_id: string;
   }
   ```

4. **@ts-ignore 사용 금지**
   ```typescript
   // ❌ 절대 금지
   // @ts-ignore
   ```

5. **unknown 타입 검증 없이 사용 금지**
   ```typescript
   // ❌ 금지
   const value: unknown = getData();
   console.log(value.property); // 에러!
   
   // ✅ 올바름
   if (typeof value === 'object' && value && 'property' in value) {
     console.log(value.property);
   }
   ```

---

## 📋 타입 체크리스트

- [ ] 모든 함수에 반환 타입 명시
- [ ] API 응답에 타입 정의
- [ ] unknown 처리 시 타입 가드 사용
- [ ] Union 타입으로 유연성 확보
- [ ] 제네릭으로 재사용성 향상
- [ ] any 타입 0개 확인
- [ ] @/types에서만 import
- [ ] camelCase 일관성 유지

---

## 🔍 타입 문제 해결

### import 오류
```typescript
// 문제: Cannot find module '@/types'
// 해결: tsconfig.json paths 확인
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 타입 불일치
```typescript
// 문제: Type 'string | null' is not assignable to type 'string'
// 해결: null 체크 또는 기본값
const value: string = data?.field ?? '';
```

### 제네릭 타입 추론
```typescript
// 문제: 제네릭 타입이 추론되지 않음
// 해결: 명시적 타입 지정
const result = apiGet<User>('/api/user');
```

---

## 📁 관련 파일

- 타입 생성 설정: `/package.json` (scripts)
- TypeScript 설정: `/tsconfig.json`
- 타입 정의: `/src/types/index.ts`
- 자동 생성: `/src/types/database.generated.ts`
- 변환 유틸: `/src/lib/utils/case-converter.ts`

---

*타입 작업 시 이 문서를 우선 참조하세요.*