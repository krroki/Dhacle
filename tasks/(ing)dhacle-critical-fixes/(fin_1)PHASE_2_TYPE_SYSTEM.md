/sc:improve --seq --think --validate
"Phase 2: 51개 any 타입 제거 및 타입 안정성 확보"

# Phase 2: TypeScript 타입 시스템 정비

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` 83-198행 - TypeScript 컴파일 에러
- [ ] `/src/types/CLAUDE.md` - 타입 관리 가이드
- [ ] `/CLAUDE.md` 143-302행 - TypeScript 패턴

### 프로젝트 금지사항 체크 ✅
- [ ] any 타입 사용 절대 금지
- [ ] @/types에서만 import
- [ ] unknown + 타입가드 사용
- [ ] database.generated.ts 직접 import 금지
- [ ] 타입 추측 금지 (실제 확인 필수)

### 작업 전 검증 명령어
```bash
# any 타입 사용 현황
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
# 현재: 51개

# 타입 에러 확인
npm run type-check

# 직접 import 확인 (0개여야 함)
grep -r "from '@/types/database'" src/
```

## 📌 Phase 정보
- **Phase 번호**: 2/4
- **선행 조건**: Phase 1 완료 (DB 타입 필요)
- **예상 시간**: 3-4일
- **우선순위**: CRITICAL
- **작업 범위**: 51개 any 타입, 타입 정의 파일들

## 🎯 Phase 목표
1. 51개 any 타입 완전 제거
2. 누락된 타입 정의 추가
3. React Query v5 타입 수정
4. 타입 안정성 100% 달성

## 📚 온보딩 섹션
### 이 Phase에 필요한 지식
- [ ] `/docs/CONTEXT_BRIDGE.md` 370-438행 - React Query v5 타입
- [ ] `/src/types/index.ts` - 기존 타입 정의
- [ ] TypeScript 4.9+ 기능 (satisfies, const type parameters)

### 작업 파일 경로
- 주요 문제 파일:
  - `src/lib/query-keys.ts:36,46,63,72,75,86,100,117,140`
  - `src/hooks/queries/useCacheInvalidation.ts:61,82,115,254`
  - `src/lib/youtube/monitoring.ts:204-247`

## 📝 작업 내용

### 1단계: 필터 타입 정의 생성
```typescript
// src/types/filters.ts (새 파일 생성)
export interface CommunityPostFilter {
  category?: string;
  dateRange?: { 
    start: Date; 
    end: Date; 
  };
  status?: 'published' | 'draft' | 'archived';
  sortBy?: 'latest' | 'popular' | 'views' | 'comments';
  page?: number;
  limit?: number;
}

export interface RevenueProofFilter {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  minAmount?: number;
  maxAmount?: number;
  verified?: boolean;
  userId?: string;
}

export interface YouTubeSearchFilter {
  query?: string;
  channelId?: string;
  maxResults?: number;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long';
}

// src/types/index.ts에 추가
export * from './filters';
```

### 2단계: query-keys.ts any 타입 제거
```typescript
// src/lib/query-keys.ts
import { 
  CommunityPostFilter, 
  RevenueProofFilter, 
  YouTubeSearchFilter 
} from '@/types';

// BEFORE:
communityPosts: (filter?: any) => ['community', 'posts', filter] as const,

// AFTER:
communityPosts: (filter?: CommunityPostFilter) => 
  ['community', 'posts', filter] as const,

// BEFORE:
revenueProofs: (filter?: any) => ['revenue', 'proofs', filter] as const,

// AFTER:
revenueProofs: (filter?: RevenueProofFilter) => 
  ['revenue', 'proofs', filter] as const,

// 모든 any를 구체적 타입으로 교체
```

### 3단계: YouTube API 응답 타입 정의
```typescript
// src/types/youtube.ts (새 파일 생성)
export interface YouTubeApiResponse<T> {
  data: T;
  error?: string;
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults?: number;
  resultsPerPage?: number;
}

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
    favoriteCount: string;
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
  };
}

export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: Record<string, { url: string }>;
  };
  statistics?: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
}

// src/lib/youtube/monitoring.ts 수정
import { YouTubeVideo, YouTubeChannel } from '@/types/youtube';

// any 타입 제거하고 구체적 타입 사용
```

### 4단계: React Query v5 타입 수정
```typescript
// src/hooks/queries/useYouTubeSearch.ts 예시
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import { YouTubeSearchFilter, YouTubeVideo } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  nextPageToken?: string;
  totalResults?: number;
}

export function useYouTubeSearch(filter: YouTubeSearchFilter) {
  return useInfiniteQuery<
    PaginatedResponse<YouTubeVideo>,           // TQueryFnData
    Error,                                      // TError
    InfiniteData<PaginatedResponse<YouTubeVideo>>, // TData
    readonly ['youtube', 'search', YouTubeSearchFilter?], // TQueryKey
    string | undefined                          // TPageParam
  >({
    queryKey: ['youtube', 'search', filter] as const,
    queryFn: async ({ pageParam }) => {
      // pageParam 기본값 제거 (v5 변경사항)
      const response = await apiGet<PaginatedResponse<YouTubeVideo>>(
        '/api/youtube/search',
        { 
          ...filter, 
          pageToken: pageParam 
        }
      );
      return response;
    },
    initialPageParam: undefined,  // v5 필수 속성
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });
}
```

### 5단계: 캐시 무효화 타입 수정
```typescript
// src/hooks/queries/useCacheInvalidation.ts
import { QueryKey } from '@tanstack/react-query';

interface InvalidationOptions {
  exact?: boolean;
  refetch?: boolean;
  predicate?: (query: { queryKey: QueryKey }) => boolean;
}

// BEFORE:
export function invalidateQueries(keys: any, options?: any) {

// AFTER:
export function invalidateQueries(
  keys: QueryKey | QueryKey[], 
  options?: InvalidationOptions
) {
  // 타입 안전한 구현
}
```

### 6단계: 에러 처리 타입 개선
```typescript
// src/lib/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 에러 타입 가드
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

// 사용 예시
catch (error) {
  if (isAppError(error)) {
    console.error(`AppError [${error.code}]:`, error.message);
  } else if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('Unknown error:', String(error));
  }
}
```

## 📋 QA 테스트 시나리오
### 정상 플로우
1. 타입 체크 통과
   ```bash
   npm run type-check
   # 에러 0개 확인
   ```
2. 빌드 성공
   ```bash
   npm run build
   ```
3. IDE 자동완성 작동

### 실패 시나리오
1. 잘못된 타입 전달 → 컴파일 에러
2. 타입 불일치 → TypeScript 에러
3. any 사용 → ESLint 경고

### 성능 측정
- 타입 체크 시간: < 30초
- 빌드 시간: < 2분
- IDE 자동완성: < 100ms

## ✅ Phase 완료 조건 (기능 작동 필수)
- [ ] **any 타입 0개 달성**
  ```bash
  grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l
  # 결과: 0
  ```
- [ ] **모든 필터 타입 정의 완료**
- [ ] **API 응답 타입 정의 완료**
- [ ] **React Query v5 타입 수정 완료**
- [ ] **타입 체크 통과**: `npm run type-check`
- [ ] **빌드 성공**: `npm run build`
- [ ] **ESLint 통과**: `npm run lint`
- [ ] **테스트 통과**: `npm test`

## 🔄 롤백 절차
```bash
# Phase 2 롤백
# 1. 타입 파일 삭제
rm src/types/filters.ts
rm src/types/youtube.ts

# 2. 변경사항 되돌리기
git checkout -- src/lib/query-keys.ts
git checkout -- src/hooks/queries/
git checkout -- src/lib/youtube/

# 3. 이전 커밋으로 복원
git reset --hard HEAD~1
```

## → 다음 Phase
- **파일**: PHASE_3_SECURITY_ROUTES.md
- **선행 조건**: 
  - 타입 시스템 안정화 완료
  - any 타입 0개 달성
  - 빌드 및 타입 체크 통과