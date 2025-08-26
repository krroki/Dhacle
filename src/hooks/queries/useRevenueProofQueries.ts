import { useQuery, useMutation, useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { RevenueProof, FilterParams } from '@/types';

interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

/**
 * 수익 인증 목록 쿼리 훅 (무한 스크롤)
 */
interface RevenueProofFilters {
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'latest' | 'popular' | 'amount';
}

export function useRevenueProofs(filters?: RevenueProofFilters) {
  // Convert number fields to string for FilterParams compatibility
  const filterParams: FilterParams | undefined = filters ? {
    ...filters,
    minAmount: filters.minAmount?.toString(),
    maxAmount: filters.maxAmount?.toString(),
  } : undefined;
  
  return useInfiniteQuery<
    PaginatedResponse<RevenueProof>,
    Error,
    InfiniteData<PaginatedResponse<RevenueProof>>,
    readonly ['revenue-proof', 'list', FilterParams | undefined],
    number
  >({
    queryKey: queryKeys.revenueProof.list(filterParams),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: '20',
        ...(filters?.category && { category: filters.category }),
        ...(filters?.minAmount && { minAmount: filters.minAmount.toString() }),
        ...(filters?.maxAmount && { maxAmount: filters.maxAmount.toString() }),
        ...(filters?.sortBy && { sortBy: filters.sortBy }),
      });
      return apiGet(`/api/revenue-proof?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.data?.length < 20) return undefined;
      return pages.length;
    },
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * 수익 인증 상세 쿼리 훅
 */
export function useRevenueProof(proofId: string) {
  return useQuery<RevenueProof>({
    queryKey: queryKeys.revenueProof.detail(proofId),
    queryFn: () => apiGet(`/api/revenue-proof/${proofId}`),
    enabled: !!proofId,
    staleTime: 5 * 60 * 1000, // 5분
  });
}

/**
 * 수익 인증 생성 뮤테이션 훅
 */
export function useCreateRevenueProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      amount: number;
      category: string;
      proofImageUrl: string;
      platform?: string;
    }) => apiPost('/api/revenue-proof', data),
    onSuccess: () => {
      // 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.lists() 
      });
    },
  });
}

/**
 * 수익 인증 수정 뮤테이션 훅
 */
export function useUpdateRevenueProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ proofId, data }: {
      proofId: string;
      data: Partial<RevenueProof>;
    }) => apiPut(`/api/revenue-proof/${proofId}`, data),
    onSuccess: (_, variables) => {
      // 상세 페이지 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.detail(variables.proofId) 
      });
      // 목록도 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.lists() 
      });
    },
  });
}

/**
 * 수익 인증 삭제 뮤테이션 훅
 */
export function useDeleteRevenueProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (proofId: string) => 
      apiDelete(`/api/revenue-proof/${proofId}`),
    onSuccess: (_, proofId) => {
      // 캐시 제거
      queryClient.removeQueries({ 
        queryKey: queryKeys.revenueProof.detail(proofId) 
      });
      // 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.lists() 
      });
    },
  });
}

/**
 * 수익 인증 댓글 목록 쿼리 훅
 */
export function useRevenueProofComments(proofId: string) {
  return useQuery({
    queryKey: queryKeys.revenueProof.comments(proofId),
    queryFn: () => apiGet(`/api/revenue-proof/${proofId}/comments`),
    enabled: !!proofId,
    staleTime: 30 * 1000, // 30초
  });
}

/**
 * 수익 인증 댓글 작성 뮤테이션 훅
 */
export function useCreateRevenueProofComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ proofId, content }: {
      proofId: string;
      content: string;
    }) => apiPost(`/api/revenue-proof/${proofId}/comment`, { content }),
    onSuccess: (_, variables) => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.comments(variables.proofId) 
      });
      // 상세 페이지도 무효화 (댓글 수 업데이트)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.detail(variables.proofId) 
      });
    },
  });
}

/**
 * 수익 인증 신고 뮤테이션 훅
 */
export function useReportRevenueProof() {
  return useMutation({
    mutationFn: ({ proofId, reason }: {
      proofId: string;
      reason: string;
    }) => apiPost(`/api/revenue-proof/${proofId}/report`, { reason }),
  });
}

/**
 * 수익 인증 좋아요 토글 뮤테이션 훅
 */
export function useToggleRevenueProofLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (proofId: string) => 
      apiPost(`/api/revenue-proof/${proofId}/like`, {}),
    onSuccess: (_, proofId) => {
      // 상세 페이지 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.revenueProof.detail(proofId) 
      });
    },
    // 낙관적 업데이트
    onMutate: async (proofId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.revenueProof.detail(proofId) 
      });
      
      const previousProof = queryClient.getQueryData<RevenueProof>(
        queryKeys.revenueProof.detail(proofId)
      );
      
      if (previousProof) {
        const proofWithLikes = previousProof as RevenueProof & { isLiked?: boolean; likeCount?: number };
        queryClient.setQueryData(
          queryKeys.revenueProof.detail(proofId),
          {
            ...proofWithLikes,
            isLiked: !proofWithLikes.isLiked,
            likeCount: proofWithLikes.isLiked 
              ? (proofWithLikes.likeCount || 0) - 1 
              : (proofWithLikes.likeCount || 0) + 1,
          }
        );
      }
      
      return { previousProof };
    },
    onError: (_err, proofId, context) => {
      if (context?.previousProof) {
        queryClient.setQueryData(
          queryKeys.revenueProof.detail(proofId),
          context.previousProof
        );
      }
    },
  });
}

/**
 * 수익 인증 통계 쿼리 훅
 */
export function useRevenueProofStats() {
  return useQuery({
    queryKey: ['revenue-proof', 'stats'],
    queryFn: () => apiGet('/api/revenue-proof/stats'),
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
  });
}