import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import type { FlattenedYouTubeVideo } from '@/types';

interface YouTubeSearchResponse {
  videos: FlattenedYouTubeVideo[];
  nextPageToken?: string;
  totalResults?: number;
}

interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'rating' | 'viewCount';
  videoDuration?: 'short' | 'medium' | 'long';
  pageToken?: string;
}

export function useYouTubeSearch(params: YouTubeSearchParams) {
  return useQuery({
    queryKey: ['youtube', 'search', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('q', params.query);
      if (params.maxResults) searchParams.append('maxResults', params.maxResults.toString());
      if (params.order) searchParams.append('order', params.order);
      if (params.videoDuration) searchParams.append('videoDuration', params.videoDuration);
      if (params.pageToken) searchParams.append('pageToken', params.pageToken);

      return apiGet<YouTubeSearchResponse>(`/api/youtube/search?${searchParams.toString()}`);
    },
    enabled: !!params.query, // Only run query if there's a search query
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 2, // Retry twice on failure
  });
}

// Hook for infinite scrolling
export function useYouTubeSearchInfinite(baseParams: Omit<YouTubeSearchParams, 'pageToken'>) {
  return useQuery({
    queryKey: ['youtube', 'search', 'infinite', baseParams],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.append('q', baseParams.query);
      if (baseParams.maxResults) searchParams.append('maxResults', baseParams.maxResults.toString());
      if (baseParams.order) searchParams.append('order', baseParams.order);
      if (baseParams.videoDuration) searchParams.append('videoDuration', baseParams.videoDuration);

      return apiGet<YouTubeSearchResponse>(`/api/youtube/search?${searchParams.toString()}`);
    },
    enabled: !!baseParams.query,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}