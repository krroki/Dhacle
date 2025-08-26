import { useQuery, useMutation, useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { CommunityPost, CommunityComment } from '@/types';

/**
 * 커뮤니티 포스트 목록 쿼리 훅 (무한 스크롤)
 */
interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
}

type CommunityFilters = {
  category?: string;
  tag?: string;
  search?: string;
};

export function useCommunityPosts(filters?: CommunityFilters) {
  return useInfiniteQuery<
    PaginatedResponse<CommunityPost>,
    Error,
    InfiniteData<PaginatedResponse<CommunityPost>>,
    readonly ['community', 'posts', CommunityFilters?],
    number
  >({
    queryKey: queryKeys.community.posts(filters),
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({
        page: String(pageParam),
        limit: '20',
        ...(filters?.category && { category: filters.category }),
        ...(filters?.tag && { tag: filters.tag }),
        ...(filters?.search && { search: filters.search }),
      });
      return apiGet(`/api/community/posts?${params}`);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage?.data?.length < 20) return undefined;
      return pages.length;
    },
    staleTime: 1 * 60 * 1000, // 1분
  });
}

/**
 * 커뮤니티 포스트 상세 쿼리 훅
 */
export function useCommunityPost(postId: string) {
  return useQuery<CommunityPost>({
    queryKey: queryKeys.community.post(postId),
    queryFn: () => apiGet(`/api/community/posts/${postId}`),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2분
  });
}

/**
 * 커뮤니티 포스트 생성 뮤테이션 훅
 */
export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      category: string;
      tags?: string[];
    }) => apiPost('/api/community/posts', data),
    onSuccess: () => {
      // 포스트 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.posts() 
      });
    },
  });
}

/**
 * 커뮤니티 포스트 수정 뮤테이션 훅
 */
export function useUpdateCommunityPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, data }: {
      postId: string;
      data: Partial<CommunityPost>;
    }) => apiPut(`/api/community/posts/${postId}`, data),
    onSuccess: (_, variables) => {
      // 특정 포스트 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.post(variables.postId) 
      });
      // 목록도 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.posts() 
      });
    },
  });
}

/**
 * 커뮤니티 포스트 삭제 뮤테이션 훅
 */
export function useDeleteCommunityPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => 
      apiDelete(`/api/community/posts/${postId}`),
    onSuccess: (_, postId) => {
      // 포스트 캐시 제거
      queryClient.removeQueries({ 
        queryKey: queryKeys.community.post(postId) 
      });
      // 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.posts() 
      });
    },
  });
}

/**
 * 커뮤니티 댓글 목록 쿼리 훅
 */
export function useCommunityComments(postId: string) {
  return useQuery<CommunityComment[]>({
    queryKey: queryKeys.community.comments(postId),
    queryFn: () => apiGet(`/api/community/posts/${postId}/comments`),
    enabled: !!postId,
    staleTime: 30 * 1000, // 30초
  });
}

/**
 * 커뮤니티 댓글 작성 뮤테이션 훅
 */
export function useCreateCommunityComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content }: {
      postId: string;
      content: string;
    }) => apiPost(`/api/community/posts/${postId}/comments`, { content }),
    onSuccess: (_, variables) => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.comments(variables.postId) 
      });
      // 포스트 상세도 무효화 (댓글 수 업데이트)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.post(variables.postId) 
      });
    },
  });
}

/**
 * 커뮤니티 댓글 삭제 뮤테이션 훅
 */
export function useDeleteCommunityComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, commentId }: {
      postId: string;
      commentId: string;
    }) => apiDelete(`/api/community/posts/${postId}/comments/${commentId}`),
    onSuccess: (_, variables) => {
      // 댓글 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.comments(variables.postId) 
      });
      // 포스트 상세도 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.post(variables.postId) 
      });
    },
  });
}

/**
 * 커뮤니티 카테고리 목록 쿼리 훅
 */
export function useCommunityCategories() {
  return useQuery({
    queryKey: queryKeys.community.categories(),
    queryFn: () => apiGet('/api/community/categories'),
    staleTime: 60 * 60 * 1000, // 1시간
    gcTime: 24 * 60 * 60 * 1000, // 24시간
  });
}

/**
 * 커뮤니티 포스트 좋아요 토글 뮤테이션 훅
 */
export function useToggleCommunityLike() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => 
      apiPost(`/api/community/posts/${postId}/like`, {}),
    onSuccess: (_, postId) => {
      // 포스트 상세 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.community.post(postId) 
      });
    },
    // 낙관적 업데이트
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.community.post(postId) 
      });
      
      const previousPost = queryClient.getQueryData<CommunityPost>(
        queryKeys.community.post(postId)
      );
      
      if (previousPost) {
        const postWithLikes = previousPost as CommunityPost & { isLiked?: boolean; likeCount?: number };
        queryClient.setQueryData(
          queryKeys.community.post(postId),
          {
            ...postWithLikes,
            isLiked: !postWithLikes.isLiked,
            likeCount: postWithLikes.isLiked 
              ? (postWithLikes.likeCount || 0) - 1 
              : (postWithLikes.likeCount || 0) + 1,
          }
        );
      }
      
      return { previousPost };
    },
    onError: (_err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          queryKeys.community.post(postId),
          context.previousPost
        );
      }
    },
  });
}