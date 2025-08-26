import { useQuery, useMutation, useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { FilterParams } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

// 시스템 설정 타입 정의
interface SystemSettings {
  siteName?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  requireEmailVerification?: boolean;
  maxUploadSize?: number;
  allowedFileTypes?: string[];
  rateLimitPerMinute?: number;
  defaultLanguage?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  analyticsEnabled?: boolean;
  loggingLevel?: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * 관리자 통계 쿼리 훅
 */
export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => apiGet('/api/admin/stats'),
    staleTime: 5 * 60 * 1000, // 5분
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
  });
}

/**
 * 사용자 목록 쿼리 훅 (관리자용)
 */
interface AdminUserFilters extends FilterParams {
  role?: string;
  status?: 'active' | 'suspended' | 'deleted';
  search?: string;
}

export function useAdminUsers(filters?: AdminUserFilters) {
  return useInfiniteQuery<
    PaginatedResponse<unknown>,
    Error,
    InfiniteData<PaginatedResponse<unknown>>,
    readonly ['admin', 'users', FilterParams | undefined],
    number
  >({
    queryKey: queryKeys.admin.users(filters as FilterParams),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: '50',
        ...(filters?.role && { role: filters.role }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && { search: filters.search }),
      });
      return apiGet(`/api/admin/users?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.data?.length < 50) return undefined;
      return pages.length;
    },
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * 사용자 상세 정보 쿼리 훅 (관리자용)
 */
export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.admin.user(userId),
    queryFn: () => apiGet(`/api/admin/users/${userId}`),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 사용자 권한 변경 뮤테이션 훅
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: {
      userId: string;
      role: 'user' | 'moderator' | 'admin';
    }) => apiPut(`/api/admin/users/${userId}/role`, { role }),
    onSuccess: (_, variables) => {
      // 사용자 상세 정보 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.user(variables.userId) 
      });
      // 사용자 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users() 
      });
    },
  });
}

/**
 * 사용자 차단/차단 해제 뮤테이션 훅
 */
export function useToggleUserSuspension() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, reason }: {
      userId: string;
      reason?: string;
    }) => apiPost(`/api/admin/users/${userId}/suspend`, { reason }),
    onSuccess: (_, variables) => {
      // 사용자 상세 정보 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.user(variables.userId) 
      });
      // 사용자 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.users() 
      });
    },
  });
}

/**
 * YouTube Lens 채널 목록 쿼리 훅 (관리자용)
 */
export function useAdminYouTubeChannels(status?: 'pending' | 'approved' | 'rejected') {
  return useQuery({
    queryKey: queryKeys.admin.channels(status),
    queryFn: () => {
      const params = status ? `?status=${status}` : '';
      return apiGet(`/api/youtube-lens/admin/channels${params}`);
    },
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * YouTube 채널 승인/거부 뮤테이션 훅
 */
export function useApproveYouTubeChannel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ channelId, approved, reason }: {
      channelId: string;
      approved: boolean;
      reason?: string;
    }) => apiPut(`/api/youtube-lens/admin/channels/${channelId}`, { 
      approved, 
      reason 
    }),
    onSuccess: () => {
      // 채널 목록 무효화 (모든 상태)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.admin.channels() 
      });
    },
  });
}

/**
 * YouTube 채널 승인 로그 쿼리 훅
 */
export function useAdminApprovalLogs(channelId: string) {
  return useQuery({
    queryKey: queryKeys.admin.approvalLogs(channelId),
    queryFn: () => apiGet(`/api/youtube-lens/admin/approval-logs/${channelId}`),
    enabled: !!channelId,
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 시스템 로그 쿼리 훅 (관리자용)
 */
interface AdminLogFilters extends FilterParams {
  level?: 'info' | 'warning' | 'error';
  module?: string;
  startDate?: string;
  endDate?: string;
}

export function useAdminLogs(filters?: AdminLogFilters) {
  return useInfiniteQuery<
    PaginatedResponse<unknown>,
    Error,
    InfiniteData<PaginatedResponse<unknown>>,
    readonly ['admin', 'logs', FilterParams | undefined],
    number
  >({
    queryKey: queryKeys.admin.logs(filters as FilterParams),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: '100',
        ...(filters?.level && { level: filters.level }),
        ...(filters?.module && { module: filters.module }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
      });
      return apiGet(`/api/admin/logs?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.data?.length < 100) return undefined;
      return pages.length;
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * 관리자 공지사항 생성 뮤테이션 훅
 */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      type: 'info' | 'warning' | 'urgent';
      expiresAt?: string;
    }) => apiPost('/api/admin/announcements', data),
    onSuccess: () => {
      // 공지사항 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'announcements'] 
      });
    },
  });
}

/**
 * 시스템 설정 쿼리 훅
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiGet('/api/admin/settings'),
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 시스템 설정 업데이트 뮤테이션 훅
 */
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: SystemSettings) => 
      apiPut('/api/admin/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['admin', 'settings'] 
      });
    },
  });
}

/**
 * 컨텐츠 삭제 뮤테이션 훅 (관리자용)
 */
export function useAdminDeleteContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ type, id, reason }: {
      type: 'post' | 'comment' | 'revenue-proof' | 'course';
      id: string;
      reason: string;
    }) => apiDelete(`/api/admin/content/${type}/${id}?reason=${encodeURIComponent(reason)}`),
    onSuccess: (_, variables) => {
      // 관련 캐시 무효화
      switch (variables.type) {
        case 'post':
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.community.posts() 
          });
          break;
        case 'revenue-proof':
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.revenueProof.lists() 
          });
          break;
        case 'course':
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.courses.all 
          });
          break;
      }
    },
  });
}