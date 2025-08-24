import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import type { CommunityPost } from '@/types';

interface PostsParams {
  page?: number;
  limit?: number;
  category?: string;
  sortBy?: 'latest' | 'popular' | 'trending';
}

interface ExtendedCommunityPost extends CommunityPost {
  likeCount: number;
  isLiked: boolean;
}

// Fetch community posts
export function useCommunityPosts(params: PostsParams = {}) {
  return useQuery({
    queryKey: ['community', 'posts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.category) searchParams.append('category', params.category);
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);

      const queryString = searchParams.toString();
      const url = queryString ? `/api/community/posts?${queryString}` : '/api/community/posts';
      
      return apiGet<{ posts: CommunityPost[]; total: number }>(url);
    },
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}

// Fetch single post
export function useCommunityPost(postId: string) {
  return useQuery({
    queryKey: ['community', 'posts', postId],
    queryFn: () => apiGet<ExtendedCommunityPost>(`/api/community/posts/${postId}`),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Create post mutation
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      category: string;
      tags?: string[];
    }) => {
      return apiPost<CommunityPost>('/api/community/posts', data);
    },
    onSuccess: () => {
      // Invalidate posts list to refetch with new post
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
    onError: (error) => {
      console.error('Failed to create post:', error);
    },
  });
}

// Update post mutation
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, updates }: {
      postId: string;
      updates: Partial<CommunityPost>;
    }) => {
      return apiPut<CommunityPost>(`/api/community/posts/${postId}`, updates);
    },
    onSuccess: (updatedPost) => {
      // Update specific post cache
      queryClient.setQueryData(['community', 'posts', updatedPost.id], updatedPost);
      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
    onError: (error) => {
      console.error('Failed to update post:', error);
    },
  });
}

// Delete post mutation
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return apiDelete(`/api/community/posts/${postId}`);
    },
    onSuccess: (_, postId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ['community', 'posts', postId] });
      // Invalidate posts list
      queryClient.invalidateQueries({ queryKey: ['community', 'posts'] });
    },
    onError: (error) => {
      console.error('Failed to delete post:', error);
    },
  });
}

// Like/Unlike post mutation
export function useTogglePostLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      const endpoint = `/api/community/posts/${postId}/${isLiked ? 'unlike' : 'like'}`;
      return apiPost(endpoint, {});
    },
    onMutate: async ({ postId, isLiked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['community', 'posts', postId] });
      
      const previousPost = queryClient.getQueryData<ExtendedCommunityPost>(['community', 'posts', postId]);
      
      if (previousPost) {
        const updatedPost: ExtendedCommunityPost = {
          ...previousPost,
          isLiked: !isLiked,
          likeCount: isLiked ? previousPost.likeCount - 1 : previousPost.likeCount + 1,
        };
        queryClient.setQueryData(['community', 'posts', postId], updatedPost);
      }
      
      return { previousPost };
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(['community', 'posts', variables.postId], context.previousPost);
      }
    },
    onSettled: (_, __, { postId }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', postId] });
    },
  });
}