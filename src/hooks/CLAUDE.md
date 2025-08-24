# 📊 React Query 사용 규칙

*React Query v5 패턴, 캐싱 전략, 15개 구현된 훅 활용 가이드*

---

## 🚨 React Query v5 패턴 (2025-02-01 구현)

### ✅ 기본 사용 패턴

```typescript
'use client'; // Client Component에서만 사용

import { useYouTubeSearch } from '@/hooks/queries/useYouTubeSearch';

function SearchComponent() {
  const { data, isLoading, error, refetch } = useYouTubeSearch('검색어');
  
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <Button onClick={() => refetch()}>새로고침</Button>
      <VideoGrid videos={data} />
    </div>
  );
}
```

---

## 📁 파일 구조

```
hooks/
└── queries/              # React Query 훅
    ├── useYouTubeSearch.ts       # YouTube 검색
    ├── useYouTubePopular.ts      # 인기 동영상
    ├── useYouTubeFavorites.ts    # 즐겨찾기
    ├── useCommunityPosts.ts      # 커뮤니티 게시글
    ├── useRevenueProof.ts        # 수익 인증
    ├── useUserProfile.ts         # 사용자 프로필
    ├── useChannelFolders.ts      # 채널 폴더
    ├── useNotifications.ts       # 알림
    ├── useCacheInvalidation.ts   # 캐시 무효화
    └── ...                       # 기타 도메인별 훅
```

---

## 🎯 명명 규칙

### 파일 및 훅 이름
```typescript
// 파일명: use[Domain][Action].ts
useYouTubeSearch.ts    // YouTube 도메인, 검색 액션
useUserProfile.ts      // User 도메인, 프로필 조회
usePostCreate.ts       // Post 도메인, 생성 액션

// 훅 이름: camelCase 필수!
useYouTubeSearch  ✅  // 올바름
use_youtube_search ❌  // 금지 (snake_case)
```

### 쿼리 키 패턴
```typescript
// ['도메인', '액션', ...파라미터]
['youtube', 'search', query]
['user', 'profile', userId]
['posts', 'list', { page, limit }]
['folders', 'detail', folderId]
```

---

## ⚙️ 캐싱 전략

### 기본 설정
```typescript
{
  staleTime: 5 * 60 * 1000,     // 5분 (데이터 신선도)
  gcTime: 5 * 60 * 1000,         // 5분 (가비지 컬렉션)
  retry: 3,                      // 3회 재시도
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
}
```

### 도메인별 캐싱 전략
```typescript
// 자주 변경되는 데이터 (실시간성 중요)
const realtimeConfig = {
  staleTime: 0,           // 항상 새로 페칭
  gcTime: 1 * 60 * 1000,  // 1분
};

// 정적 데이터 (변경 거의 없음)
const staticConfig = {
  staleTime: 60 * 60 * 1000,  // 1시간
  gcTime: 24 * 60 * 60 * 1000, // 24시간
};

// 사용자 데이터 (중간 빈도)
const userDataConfig = {
  staleTime: 5 * 60 * 1000,   // 5분
  gcTime: 10 * 60 * 1000,     // 10분
};
```

---

## 🔄 데이터 업데이트 패턴

### Optimistic Update
```typescript
const updateMutation = useMutation({
  mutationFn: updatePost,
  
  // 낙관적 업데이트
  onMutate: async (newData) => {
    // 이전 쿼리 취소
    await queryClient.cancelQueries({ queryKey: ['posts', postId] });
    
    // 이전 데이터 스냅샷
    const previous = queryClient.getQueryData(['posts', postId]);
    
    // 낙관적으로 새 데이터 설정
    queryClient.setQueryData(['posts', postId], newData);
    
    return { previous };
  },
  
  // 에러 시 롤백
  onError: (err, newData, context) => {
    queryClient.setQueryData(['posts', postId], context.previous);
  },
  
  // 완료 후 재검증
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['posts', postId] });
  }
});
```

### 캐시 무효화
```typescript
// 특정 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['posts'] });

// 전체 캐시 초기화
queryClient.clear();

// 조건부 무효화
queryClient.invalidateQueries({
  queryKey: ['posts'],
  predicate: query => query.state.dataUpdatedAt < Date.now() - 60000
});
```

---

## 🚨 React Query v5 useInfiniteQuery 타입 패턴

### ❌ v4 패턴 (타입 에러 발생)
```typescript
// 타입 에러: 'pageParam' is of type 'unknown'
return useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => {
    return apiGet(`/api/posts?page=${pageParam}`);
  }
});
```

### ✅ v5 패턴 (5개 제네릭 타입 필수)
```typescript
import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

return useInfiniteQuery<
  PaginatedResponse<Post>,                    // TQueryFnData
  Error,                                       // TError
  InfiniteData<PaginatedResponse<Post>>,      // TData (InfiniteData로 감싸기)
  readonly ['posts', any?],                    // TQueryKey (readonly 튜플)
  number                                       // TPageParam
>({
  queryKey: ['posts'] as const,
  queryFn: ({ pageParam }) => {               // 기본값 제거!
    return apiGet(`/api/posts?page=${pageParam}`);
  },
  initialPageParam: 0,                        // v5 필수 속성
  getNextPageParam: (lastPage, pages) => {
    if (lastPage?.data?.length < 20) return undefined;
    return pages.length;
  },
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,                    // cacheTime → gcTime in v5
});
```

---

## ✅ 15개 구현된 훅

### YouTube 관련
1. `useYouTubeSearch` - YouTube 검색
2. `useYouTubePopular` - 인기 동영상
3. `useYouTubeFavorites` - 즐겨찾기 관리

### 커뮤니티 관련
4. `useCommunityPosts` - 커뮤니티 게시글
5. `useRevenueProof` - 수익 인증

### 사용자 관련
6. `useUserProfile` - 사용자 프로필
7. `useNotifications` - 알림 관리

### YouTube Lens
8. `useChannelFolders` - 채널 폴더 관리
9. `useYouTubeLensChannels` - 채널 목록
10. `useYouTubeLensMetrics` - 메트릭 조회

### 유틸리티
11. `useCacheInvalidation` - 캐시 무효화
12. `useOptimisticUpdate` - 낙관적 업데이트
13. `useInfiniteScroll` - 무한 스크롤
14. `useDebounce` - 디바운스 검색
15. `useLocalStorage` - 로컬 스토리지 연동

---

## 🎯 사용 예시

### 기본 쿼리
```typescript
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', 'profile', userId],
    queryFn: () => apiGet(`/api/user/${userId}`),
    enabled: !!userId, // userId 있을 때만 실행
    staleTime: 5 * 60 * 1000,
  });
}
```

### 무한 스크롤
```typescript
export function useCommunityPosts() {
  return useInfiniteQuery<
    PaginatedResponse<Post>,
    Error,
    InfiniteData<PaginatedResponse<Post>>,
    readonly ['posts'],
    number
  >({
    queryKey: ['posts'] as const,
    queryFn: ({ pageParam }) => 
      apiGet(`/api/community/posts?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
```

### Mutation
```typescript
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePostInput) => 
      apiPost('/api/community/posts', data),
    onSuccess: () => {
      // 포스트 목록 재검증
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('게시글이 작성되었습니다');
    },
    onError: (error) => {
      toast.error('게시글 작성에 실패했습니다');
    }
  });
}
```

---

## ⚠️ 주의사항

1. **Server Component에서 사용 불가**
   - React Query는 Client Component에서만 동작
   - Server Component는 직접 데이터 페칭

2. **캐시 무효화 시점 신중히 결정**
   - 너무 자주 → 성능 저하
   - 너무 적게 → 오래된 데이터

3. **에러 바운더리와 함께 사용**
   ```typescript
   <ErrorBoundary>
     <QueryComponent />
   </ErrorBoundary>
   ```

4. **로딩/에러 상태 항상 처리**
   ```typescript
   if (isLoading) return <Loading />;
   if (error) return <Error />;
   ```

5. **Hook 규칙 준수**
   - 조건문 안에서 호출 금지
   - 반복문 안에서 호출 금지
   - 최상위에서만 호출

---

## 📋 체크리스트

- [ ] Client Component에서만 사용
- [ ] 쿼리 키 일관성 유지
- [ ] 적절한 캐싱 전략 설정
- [ ] 로딩/에러 상태 처리
- [ ] 타입 안전성 확보
- [ ] Hook 이름 camelCase
- [ ] v5 패턴 사용 (InfiniteData 등)

---

## 📁 관련 파일

- Query Client 설정: `/src/components/providers/Providers.tsx`
- API 클라이언트: `/src/lib/api-client.ts`
- 타입 정의: `/src/types/index.ts`
- 에러 바운더리: `/src/components/ErrorBoundary.tsx`

---

*React Query 훅 작업 시 이 문서를 우선 참조하세요.*