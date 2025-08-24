import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import type { YouTubeFavorite, FlattenedYouTubeVideo } from '@/types';

// Fetch all favorites
export function useYouTubeFavorites() {
  return useQuery({
    queryKey: ['youtube', 'favorites'],
    queryFn: () => apiGet<YouTubeFavorite[]>('/api/youtube/favorites'),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

// Add to favorites mutation
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      video: FlattenedYouTubeVideo;
      tags?: string[];
      notes?: string;
    }) => {
      return apiPost<YouTubeFavorite>('/api/youtube/favorites', {
        videoId: data.video.id,
        videoData: data.video,
        tags: data.tags || [],
        notes: data.notes || '',
      });
    },
    onSuccess: (newFavorite) => {
      // Update the favorites list cache
      queryClient.setQueryData<YouTubeFavorite[]>(
        ['youtube', 'favorites'],
        (old) => {
          if (!old) return [newFavorite];
          return [newFavorite, ...old];
        }
      );
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['youtube', 'favorites'] });
    },
    onError: (error) => {
      console.error('Failed to add to favorites:', error);
    },
  });
}

// Remove from favorites mutation
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (favoriteId: string) => {
      return apiDelete(`/api/youtube/favorites/${favoriteId}`);
    },
    onSuccess: (_, favoriteId) => {
      // Update the favorites list cache
      queryClient.setQueryData<YouTubeFavorite[]>(
        ['youtube', 'favorites'],
        (old) => {
          if (!old) return [];
          return old.filter((fav) => fav.id !== favoriteId);
        }
      );
      
      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['youtube', 'favorites'] });
    },
    onError: (error) => {
      console.error('Failed to remove from favorites:', error);
    },
  });
}