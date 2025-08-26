import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { FilterParams } from '@/types';

export interface RevenueProof {
  id: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  title: string;
  description: string;
  amount: number;
  period: string;
  category: string;
  platform: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueProofComment {
  id: string;
  proofId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  content: string;
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Query key factory
export const revenueProofKeys = {
  all: ['revenue-proof'] as const,
  lists: () => [...revenueProofKeys.all, 'list'] as const,
  list: (filters?: FilterParams) => [...revenueProofKeys.lists(), filters] as const,
  details: () => [...revenueProofKeys.all, 'detail'] as const,
  detail: (id: string) => [...revenueProofKeys.details(), id] as const,
  comments: (id: string) => [...revenueProofKeys.all, 'comments', id] as const,
};

// Fetch revenue proof list with infinite scroll
export function useRevenueProofs(filters?: {
  category?: string;
  platform?: string;
  status?: string;
  sortBy?: string;
}) {
  return useInfiniteQuery({
    queryKey: revenueProofKeys.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        limit: '20',
        ...filters,
      });
      
      const data = await apiGet<{
        proofs: RevenueProof[];
        totalCount: number;
        hasMore: boolean;
      }>(`/api/revenue-proof?${params}`);
      
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single revenue proof detail
export function useRevenueProofDetail(id: string) {
  return useQuery({
    queryKey: revenueProofKeys.detail(id),
    queryFn: async () => {
      const data = await apiGet<RevenueProof>(`/api/revenue-proof/${id}`);
      return data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fetch comments for a revenue proof
export function useRevenueProofComments(proofId: string) {
  return useQuery({
    queryKey: revenueProofKeys.comments(proofId),
    queryFn: async () => {
      const data = await apiGet<RevenueProofComment[]>(
        `/api/revenue-proof/${proofId}/comments`
      );
      return data;
    },
    enabled: !!proofId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Create new revenue proof
export function useCreateRevenueProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proof: Omit<RevenueProof, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount' | 'viewCount'>) => {
      return apiPost<RevenueProof>('/api/revenue-proof', proof);
    },
    onSuccess: () => {
      // Invalidate all lists as new proof affects sorting
      queryClient.invalidateQueries({ queryKey: revenueProofKeys.lists() });
    },
  });
}

// Update revenue proof
export function useUpdateRevenueProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<RevenueProof> & { id: string }) => {
      return apiPut<RevenueProof>(`/api/revenue-proof/${id}`, data);
    },
    onSuccess: (data) => {
      // Update the specific proof detail
      queryClient.setQueryData(revenueProofKeys.detail(data.id), data);
      // Invalidate lists as updates may affect sorting
      queryClient.invalidateQueries({ queryKey: revenueProofKeys.lists() });
    },
  });
}

// Delete revenue proof
export function useDeleteRevenueProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(`/api/revenue-proof/${id}`);
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: revenueProofKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: revenueProofKeys.lists() });
    },
  });
}

// Like/unlike revenue proof
export function useLikeRevenueProof() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, liked }: { id: string; liked: boolean }) => {
      if (liked) {
        return apiPost(`/api/revenue-proof/${id}/like`);
      } else {
        return apiDelete(`/api/revenue-proof/${id}/like`);
      }
    },
    
    // Optimistic update
    onMutate: async ({ id, liked }) => {
      await queryClient.cancelQueries({ queryKey: revenueProofKeys.detail(id) });
      
      const previousData = queryClient.getQueryData<RevenueProof>(
        revenueProofKeys.detail(id)
      );
      
      if (previousData) {
        queryClient.setQueryData<RevenueProof>(revenueProofKeys.detail(id), {
          ...previousData,
          isLiked: liked,
          likeCount: liked ? previousData.likeCount + 1 : previousData.likeCount - 1,
        });
      }
      
      return { previousData };
    },
    
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          revenueProofKeys.detail(variables.id),
          context.previousData
        );
      }
    },
    
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: revenueProofKeys.detail(variables.id) });
    },
  });
}

// Add comment to revenue proof
export function useAddRevenueProofComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ proofId, content }: { proofId: string; content: string }) => {
      return apiPost<RevenueProofComment>(`/api/revenue-proof/${proofId}/comment`, {
        content,
      });
    },
    
    onSuccess: (data, variables) => {
      // Add new comment to the list
      queryClient.setQueryData<RevenueProofComment[]>(
        revenueProofKeys.comments(variables.proofId),
        (old) => old ? [data, ...old] : [data]
      );
      
      // Update comment count in proof detail
      queryClient.setQueryData<RevenueProof>(
        revenueProofKeys.detail(variables.proofId),
        (old) => old ? { ...old, commentCount: old.commentCount + 1 } : old
      );
    },
  });
}

// Report revenue proof
export function useReportRevenueProof() {
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return apiPost(`/api/revenue-proof/${id}/report`, { reason });
    },
  });
}