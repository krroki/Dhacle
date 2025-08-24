import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import type { FlattenedYouTubeVideo } from '@/types';

interface PopularVideosParams {
  maxResults?: number;
  regionCode?: string;
  categoryId?: string;
}

export function useYouTubePopular(params: PopularVideosParams = {}) {
  return useQuery({
    queryKey: ['youtube', 'popular', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.maxResults) searchParams.append('maxResults', params.maxResults.toString());
      if (params.regionCode) searchParams.append('regionCode', params.regionCode);
      if (params.categoryId) searchParams.append('categoryId', params.categoryId);

      const queryString = searchParams.toString();
      const url = queryString ? `/api/youtube/popular?${queryString}` : '/api/youtube/popular';
      
      return apiGet<FlattenedYouTubeVideo[]>(url);
    },
    staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// Hook for trending shorts
export function useYouTubeTrendingShorts() {
  return useQuery({
    queryKey: ['youtube', 'trending', 'shorts'],
    queryFn: () => apiGet<FlattenedYouTubeVideo[]>('/api/youtube/trending-shorts'),
    staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
  });
}