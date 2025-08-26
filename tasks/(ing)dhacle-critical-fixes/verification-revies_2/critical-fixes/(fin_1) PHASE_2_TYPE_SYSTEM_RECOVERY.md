/sc:improve --seq --validate --think
"Phase 2: TypeScript 타입 시스템 복구 - 38개 any 타입 제거"

# 🔧 Phase 2: TypeScript 타입 시스템 복구 지시서

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📚 온보딩 섹션

### 작업 관련 경로
- 타입 정의: `src/types/index.ts`
- Hook 타입: `src/hooks/*.ts`
- Query Keys: `src/lib/query-keys.ts`
- React Query: `src/lib/react-query.ts`

### 프로젝트 컨텍스트 확인
```bash
# any 타입 위치 확인
grep -r ": any" src/ --include="*.ts" --include="*.tsx"

# 타입 import 패턴 확인
grep -r "from '@/types'" src/ | head -10

# TypeScript 에러 확인
npm run types:check
```

## 📌 목적
**38개 any 타입을 구체적 타입으로 교체하여 타입 안전성 복구**
- 현재: 38개 any 타입으로 타입 시스템 붕괴
- 목표: 0 any, 100% 타입 안전성

## 🤖 실행 AI 역할
TypeScript 전문가로서 모든 any 타입을 적절한 구체적 타입으로 교체

## 📝 작업 내용

### Step 1: 핵심 타입 정의 추가 (src/types/index.ts)

```typescript
// src/types/index.ts에 추가

// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  CREATOR = 'creator'
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// 필터 타입
export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

// YouTube 관련 타입
export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  subscriber_count: number;
  video_count: number;
  view_count: number;
}

export interface YouTubeVideo {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  duration: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;
}

// 폼 타입
export interface FormState<T = unknown> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
}
```

### Step 2: Hook 타입 수정 (src/hooks/useAuth.ts)

```typescript
// Before (any 타입)
const user: any = await getUser();

// After (구체적 타입)
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const getUser = async (): Promise<User | null> => {
    const supabase = createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // user_profiles 테이블에서 추가 정보 가져오기
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return {
      id: user.id,
      email: user.email!,
      name: profile?.name || null,
      avatar_url: profile?.avatar_url || null,
      role: profile?.role || UserRole.USER,
      created_at: user.created_at!,
      updated_at: profile?.updated_at || user.created_at!
    };
  };
  
  return { user, loading, getUser };
}
```

### Step 3: Query Keys 타입 수정 (src/lib/query-keys.ts)

```typescript
// Before (any 타입)
export const queryKeys = {
  user: (id: any) => ['user', id],
  posts: (filters: any) => ['posts', filters]
};

// After (구체적 타입)
import { FilterParams } from '@/types';

export const queryKeys = {
  // 사용자 관련
  user: (id: string) => ['user', id] as const,
  users: (filters?: FilterParams) => ['users', filters] as const,
  currentUser: () => ['currentUser'] as const,
  
  // YouTube 관련
  youtubeChannel: (id: string) => ['youtube', 'channel', id] as const,
  youtubeVideos: (channelId: string, filters?: FilterParams) => 
    ['youtube', 'videos', channelId, filters] as const,
  youtubeAnalytics: (videoId: string) => 
    ['youtube', 'analytics', videoId] as const,
  
  // 수익 증명 관련
  revenueProofs: (filters?: FilterParams) => 
    ['revenue-proofs', filters] as const,
  revenueProof: (id: string) => ['revenue-proof', id] as const,
  
  // 코스 관련
  courses: (filters?: FilterParams) => ['courses', filters] as const,
  course: (id: string) => ['course', id] as const,
  lessons: (courseId: string) => ['lessons', courseId] as const,
} as const;
```

### Step 4: React Query 에러 핸들러 타입 수정

```typescript
// Before (any 타입)
const handleError = (error: any) => {
  console.error(error);
};

// After (구체적 타입)
import { AxiosError } from 'axios';
import { ApiError } from '@/types';

const handleError = (error: unknown): void => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    logger.error('API Error:', {
      code: apiError?.code || 'UNKNOWN',
      message: apiError?.message || error.message,
      details: apiError?.details
    });
    
    // 토스트 알림
    toast.error(apiError?.message || '오류가 발생했습니다.');
  } else if (error instanceof Error) {
    logger.error('Application Error:', error.message);
    toast.error(error.message);
  } else {
    logger.error('Unknown Error:', error);
    toast.error('알 수 없는 오류가 발생했습니다.');
  }
};
```

### Step 5: 컴포넌트 Props 타입 정의

```typescript
// Before (any 타입)
interface ComponentProps {
  data: any;
  onSubmit: (values: any) => void;
}

// After (구체적 타입)
interface YouTubeLensProps {
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
  onAnalyze: (videoId: string) => Promise<void>;
  isLoading?: boolean;
}

interface RevenueProofFormProps {
  initialData?: Partial<RevenueProof>;
  onSubmit: (data: RevenueProof) => Promise<void>;
  onCancel: () => void;
}
```

### Step 6: API 응답 타입 적용

```typescript
// Before (any 타입)
const response = await fetch('/api/youtube/analysis');
const data: any = await response.json();

// After (구체적 타입)
import { apiClient } from '@/lib/api-client';
import { ApiResponse, YouTubeAnalysis } from '@/types';

const response = await apiClient.post<ApiResponse<YouTubeAnalysis>>(
  '/api/youtube/analysis',
  { videoId }
);

if (response.data) {
  // 타입 안전하게 사용
  const analysis = response.data;
  console.log(analysis.sentiment_score);
}
```

## ✅ 완료 조건
- [ ] 38개 모든 any 타입 제거
- [ ] src/types/index.ts에 필요한 모든 타입 정의
- [ ] 타입 가드 함수 추가
- [ ] TypeScript 컴파일 에러 0개
- [ ] strict mode 활성화

## 📋 QA 테스트 시나리오

### 타입 체크
```bash
# TypeScript 컴파일 체크
npm run types:check
# Expected: 0 errors

# any 타입 검사
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
# Expected: 0

# 타입 import 확인
grep -r "from '@/types'" src/ | wc -l
# Expected: 50+
```

### IDE 자동완성 테스트
1. VSCode에서 변수 위에 마우스 호버 → 타입 정보 표시
2. 자동완성 기능 → 프로퍼티 제안 정상 작동
3. 타입 에러 → 빨간 밑줄 표시

## 🔄 롤백 계획
```bash
# 타입 에러로 빌드 실패 시
git diff src/types/index.ts > types-backup.patch
git checkout -- src/types/index.ts

# 부분 복구
git apply types-backup.patch
```

## 🔍 검증 명령
```bash
# Phase 2 완료 검증
npm run verify:types

# strict mode 확인
cat tsconfig.json | grep '"strict"'
# Expected: "strict": true

# 빌드 성공 확인
npm run build
```

---

**⚠️ 주의사항**
1. unknown 사용 권장: any 대신 unknown 사용 후 타입 가드
2. as const 활용: 리터럴 타입 보존
3. 제네릭 활용: 재사용 가능한 타입 정의

**예상 작업 시간**: 6-8시간
**다음 Phase**: [Phase 3 - API 패턴 통일](./PHASE_3_API_PATTERN_UNIFICATION.md)