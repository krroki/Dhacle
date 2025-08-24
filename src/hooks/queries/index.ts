/**
 * React Query 훅 중앙 export
 * 모든 커스텀 React Query 훅을 여기서 export
 */

// YouTube 관련 훅
export * from './useYouTubeQueries';

// 사용자 관련 훅
export * from './useUserQueries';

// 커뮤니티 관련 훅
export * from './useCommunityQueries';

// 수익 인증 관련 훅
export * from './useRevenueProofQueries';

// 알림 관련 훅
export * from './useNotificationQueries';

// 강의 관련 훅
export * from './useCourseQueries';

// 관리자 관련 훅
export * from './useAdminQueries';

/**
 * 사용 예시:
 * 
 * import { useYouTubeSearch, useUserProfile } from '@/hooks/queries';
 * 
 * function MyComponent() {
 *   const { data, isLoading } = useYouTubeSearch('검색어');
 *   const { data: profile } = useUserProfile();
 * }
 */