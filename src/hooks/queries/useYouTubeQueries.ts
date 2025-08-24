import { useQuery, useMutation, useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { YouTubeFavorite, YouTubeFolder } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

/**
 * YouTube 검색 쿼리 훅
 */
export function useYouTubeSearch(searchTerm: string) {
  return useQuery({
    queryKey: queryKeys.youtube.search(searchTerm),
    queryFn: () => apiGet(`/api/youtube/search?q=${encodeURIComponent(searchTerm)}`),
    enabled: !!searchTerm,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분 (cacheTime -> gcTime in v5)
  });
}

/**
 * YouTube 인기 동영상 쿼리 훅
 */
export function useYouTubePopular() {
  return useQuery({
    queryKey: queryKeys.youtube.popular(),
    queryFn: () => apiGet('/api/youtube/popular'),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
}

/**
 * YouTube 즐겨찾기 쿼리 훅
 */
export function useYouTubeFavorites() {
  return useQuery<YouTubeFavorite[]>({
    queryKey: queryKeys.youtube.favorites(),
    queryFn: () => apiGet('/api/youtube/favorites'),
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * YouTube 즐겨찾기 추가 뮤테이션 훅
 */
export function useAddYouTubeFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<YouTubeFavorite>) => 
      apiPost('/api/youtube/favorites', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.youtube.favorites() 
      });
    },
  });
}

/**
 * YouTube 즐겨찾기 삭제 뮤테이션 훅
 */
export function useDeleteYouTubeFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      apiDelete(`/api/youtube/favorites/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.youtube.favorites() 
      });
    },
  });
}

/**
 * YouTube 폴더 쿼리 훅
 */
export function useYouTubeFolders() {
  return useQuery<YouTubeFolder[]>({
    queryKey: queryKeys.youtube.folders(),
    queryFn: () => apiGet('/api/youtube/folders'),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * YouTube 폴더 생성 뮤테이션 훅
 */
export function useCreateYouTubeFolder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      apiPost('/api/youtube/folders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.youtube.folders() 
      });
    },
  });
}

/**
 * YouTube 컬렉션 쿼리 훅 (무한 스크롤)
 */
export function useYouTubeCollections() {
  return useInfiniteQuery<
    PaginatedResponse<unknown>,
    Error,
    InfiniteData<PaginatedResponse<unknown>>,
    readonly ['youtube', 'collections'],
    number
  >({
    queryKey: queryKeys.youtube.collections(),
    queryFn: ({ pageParam }) => 
      apiGet(`/api/youtube/collections?page=${pageParam}&limit=20`),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.data?.length < 20) return undefined;
      return pages.length;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * YouTube 구독 관리 뮤테이션 훅
 */
export function useYouTubeSubscribe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (channelId: string) => 
      apiPost('/api/youtube/subscribe', { channelId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.youtube.subscriptions() 
      });
    },
  });
}

/**
 * YouTube 분석 데이터 쿼리 훅
 */
export function useYouTubeAnalytics(videoId: string) {
  return useQuery({
    queryKey: queryKeys.youtube.analytics(videoId),
    queryFn: () => apiGet(`/api/youtube/analytics?videoId=${videoId}`),
    enabled: !!videoId,
    staleTime: 30 * 60 * 1000, // 30분
    gcTime: 60 * 60 * 1000, // 1시간
  });
}