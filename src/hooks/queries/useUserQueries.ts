import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { User } from '@/types';

// ApiKey 타입 정의
interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  createdAt: string;
  lastUsedAt?: string;
  scopes?: string[];
}

// 사용자 설정 타입 정의
interface UserSettings {
  avatar_url?: string | null;
  full_name?: string | null;
  username?: string | null;
  channel_name?: string | null;
  channel_url?: string | null;
  job_category?: string | null;
  experience_level?: string | null;
  work_type?: string | null;
  current_income?: string | null;
  target_income?: string | null;
}

/**
 * 사용자 프로필 쿼리 훅
 */
export function useUserProfile(userId?: string) {
  return useQuery<User>({
    queryKey: queryKeys.user.profile(userId),
    queryFn: () => apiGet(userId ? `/api/user/profile/${userId}` : '/api/user/profile'),
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 30 * 60 * 1000, // 30분
  });
}

/**
 * 사용자 프로필 업데이트 뮤테이션 훅
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<User>) => 
      apiPut('/api/user/profile', data),
    onSuccess: (data, _variables) => {
      // 프로필 캐시 업데이트
      queryClient.setQueryData(queryKeys.user.profile(), data);
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.all 
      });
    },
  });
}

/**
 * 사용자 설정 쿼리 훅
 */
export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.user.settings(),
    queryFn: () => apiGet('/api/user/settings'),
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 사용자 설정 업데이트 뮤테이션 훅
 */
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: UserSettings) => 
      apiPut('/api/user/settings', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.settings() 
      });
    },
  });
}

/**
 * API 키 목록 쿼리 훅
 */
export function useApiKeys() {
  return useQuery<ApiKey[]>({
    queryKey: queryKeys.user.apiKeys(),
    queryFn: () => apiGet('/api/user/api-keys'),
    staleTime: 1 * 60 * 1000, // 1분 (보안상 짧게 설정)
  });
}

/**
 * API 키 생성 뮤테이션 훅
 */
export function useCreateApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string; permissions: string[] }) => 
      apiPost('/api/user/api-keys', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.apiKeys() 
      });
    },
  });
}

/**
 * API 키 삭제 뮤테이션 훅
 */
export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (keyId: string) => 
      apiDelete(`/api/user/api-keys/${keyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.user.apiKeys() 
      });
    },
    // 낙관적 업데이트
    onMutate: async (keyId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.user.apiKeys() 
      });
      
      const previousKeys = queryClient.getQueryData<ApiKey[]>(
        queryKeys.user.apiKeys()
      );
      
      if (previousKeys) {
        queryClient.setQueryData(
          queryKeys.user.apiKeys(),
          previousKeys.filter(key => key.id !== keyId)
        );
      }
      
      return { previousKeys };
    },
    onError: (_err, _keyId, context) => {
      if (context?.previousKeys) {
        queryClient.setQueryData(
          queryKeys.user.apiKeys(),
          context.previousKeys
        );
      }
    },
  });
}


/**
 * 사용자명 중복 확인 쿼리 훅
 */
export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: ['user', 'check-username', username],
    queryFn: () => apiGet(`/api/user/check-username?username=${encodeURIComponent(username)}`),
    enabled: !!username && username.length >= 3,
    staleTime: 1 * 60 * 1000, // 1분
  });
}