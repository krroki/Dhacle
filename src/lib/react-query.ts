/**
 * React Query 캐싱 전략 및 설정
 * Phase 2: High Priority 기술부채 해소
 * 
 * Purpose: 데이터 특성별 최적화된 캐싱 전략 제공
 */

import { QueryClient } from '@tanstack/react-query';
import type { FilterParams } from '@/types';

/**
 * 데이터 특성별 캐싱 전략 프리셋
 */
export const cachePresets = {
  /**
   * 정적 데이터 (코스 목록, 카테고리, 설정값 등)
   * - 변경 빈도: 매우 낮음
   * - 캐싱 시간: 1시간
   */
  static: {
    staleTime: 1000 * 60 * 60, // 1시간
    gcTime: 1000 * 60 * 60 * 24, // 24시간
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  
  /**
   * 자주 변경되는 데이터 (사용자 프로필, 대시보드 데이터)
   * - 변경 빈도: 중간
   * - 캐싱 시간: 1분
   */
  dynamic: {
    staleTime: 1000 * 60, // 1분
    gcTime: 1000 * 60 * 10, // 10분
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
  
  /**
   * 실시간 데이터 (채팅, 알림, 실시간 통계)
   * - 변경 빈도: 매우 높음
   * - 캐싱 시간: 없음
   */
  realtime: {
    staleTime: 0, // 항상 stale
    gcTime: 1000 * 60 * 5, // 5분
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30, // 30초마다 자동 갱신
  },
  
  /**
   * YouTube API 데이터 (비용이 높은 외부 API)
   * - API 비용: 높음
   * - 캐싱 시간: 30분
   */
  expensive: {
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60 * 2, // 2시간
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2, // 재시도 횟수 줄임
  },
  
  /**
   * 사용자별 개인 데이터 (즐겨찾기, 설정, 히스토리)
   * - 변경 빈도: 낮음
   * - 캐싱 시간: 5분
   */
  user: {
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 30, // 30분
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
  
  /**
   * 검색 결과 (검색 쿼리별 캐싱)
   * - 변경 빈도: 낮음
   * - 캐싱 시간: 10분
   */
  search: {
    staleTime: 1000 * 60 * 10, // 10분
    gcTime: 1000 * 60 * 60, // 1시간
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
  
  /**
   * 통계 데이터 (분석, 리포트)
   * - 변경 빈도: 주기적 업데이트
   * - 캐싱 시간: 15분
   */
  analytics: {
    staleTime: 1000 * 60 * 15, // 15분
    gcTime: 1000 * 60 * 60, // 1시간
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
};

/**
 * QueryClient 인스턴스 생성 헬퍼
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 기본 설정
        staleTime: 1000 * 60 * 5, // 5분
        gcTime: 1000 * 60 * 30, // 30분
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: 'always',
        
        // 네트워크 상태 관리
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: 1,
        networkMode: 'offlineFirst',
      },
    },
  });
}

/**
 * 캐시 키 생성 헬퍼
 */
export const queryKeys = {
  // 사용자 관련
  user: (userId?: string) => ['user', userId].filter(Boolean),
  userProfile: (userId: string) => ['user', 'profile', userId],
  userSettings: (userId: string) => ['user', 'settings', userId],
  
  // YouTube 관련
  youtube: {
    video: (videoId: string) => ['youtube', 'video', videoId],
    channel: (channelId: string) => ['youtube', 'channel', channelId],
    search: (query: string, filters?: FilterParams) => ['youtube', 'search', query, filters].filter(Boolean),
    popular: (category?: string) => ['youtube', 'popular', category].filter(Boolean),
    favorites: (userId: string) => ['youtube', 'favorites', userId],
    history: (userId: string) => ['youtube', 'history', userId],
  },
  
  // 코스 관련
  course: {
    list: (filters?: FilterParams) => ['courses', filters].filter(Boolean),
    detail: (courseId: string) => ['course', courseId],
    userCourses: (userId: string) => ['courses', 'user', userId],
  },
  
  // 커뮤니티 관련
  community: {
    posts: (filters?: FilterParams) => ['community', 'posts', filters].filter(Boolean),
    post: (postId: string) => ['community', 'post', postId],
    comments: (postId: string) => ['community', 'comments', postId],
  },
  
  // 수익 인증 관련
  revenueProof: {
    list: (filters?: FilterParams) => ['revenue-proof', filters].filter(Boolean),
    detail: (proofId: string) => ['revenue-proof', proofId],
    userProofs: (userId: string) => ['revenue-proof', 'user', userId],
  },
  
  // 알림 관련
  notifications: (userId: string) => ['notifications', userId],
  
  // 통계 관련
  analytics: {
    dashboard: (userId?: string) => ['analytics', 'dashboard', userId].filter(Boolean),
    vitals: (period?: string) => ['analytics', 'vitals', period].filter(Boolean),
  },
} as const;

/**
 * 캐시 무효화 헬퍼
 */
export async function invalidateQueries(
  queryClient: QueryClient,
  keys: Array<readonly unknown[]>
): Promise<void> {
  await Promise.all(
    keys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
  );
}

/**
 * 옵티미스틱 업데이트 헬퍼
 */
export function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  updater: (oldData: T | undefined) => T
): { previousData: T | undefined; rollback: () => void } {
  const previousData = queryClient.getQueryData<T>(queryKey);
  
  queryClient.setQueryData(queryKey, updater);
  
  return {
    previousData,
    rollback: () => {
      queryClient.setQueryData(queryKey, previousData);
    },
  };
}