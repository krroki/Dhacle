import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  FlattenedYouTubeVideo,
  OAuthToken,
  QuotaStatus,
  YouTubeFavorite,
  YouTubeSearchFilters,
} from '@/types';

interface YouTubeLensState {
  // 비디오 관련
  videos: FlattenedYouTubeVideo[];
  selectedVideos: Set<string>;
  favoriteVideos: Map<string, YouTubeFavorite>;

  // 검색 관련
  searchQuery: string;
  searchFilters: YouTubeSearchFilters;
  searchHistory: string[];
  isSearching: boolean;
  hasMore: boolean;
  nextPageToken?: string;

  // OAuth & API 키
  oauthToken?: OAuthToken;
  api_key?: string;
  isAuthenticated: boolean;

  // API 할당량
  quotaStatus?: QuotaStatus;

  // UI 상태
  viewMode: 'grid' | 'list' | 'compact';
  isLoading: boolean;
  error: string | null;

  // Actions
  setVideos: (videos: FlattenedYouTubeVideo[]) => void;
  appendVideos: (videos: FlattenedYouTubeVideo[]) => void;
  clearVideos: () => void;

  toggleVideoSelection: (video_id: string) => void;
  selectAllVideos: () => void;
  clearSelectedVideos: () => void;

  addFavorite: (video: FlattenedYouTubeVideo) => void;
  removeFavorite: (video_id: string) => void;
  updateFavorite: (video_id: string, updates: Partial<YouTubeFavorite>) => void;
  loadFavorites: (favorites: YouTubeFavorite[]) => void;

  setSearchQuery: (query: string) => void;
  setSearchFilters: (filters: Partial<YouTubeSearchFilters>) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;

  setOAuthToken: (token: OAuthToken | undefined) => void;
  setApiKey: (key: string | undefined) => void;

  setQuotaStatus: (status: QuotaStatus) => void;
  updateQuotaUsage: (units: number) => void;

  setViewMode: (mode: 'grid' | 'list' | 'compact') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  setNextPageToken: (token: string | undefined) => void;
  setHasMore: (has_more: boolean) => void;

  reset: () => void;
}

const initial_state = {
  videos: [],
  selectedVideos: new Set<string>(),
  favoriteVideos: new Map<string, YouTubeFavorite>(),

  searchQuery: '',
  searchFilters: {
    query: '',
    order: 'relevance' as const,
    maxResults: 50,
    videoDuration: 'short' as const,
  },
  searchHistory: [],
  isSearching: false,
  hasMore: false,
  nextPageToken: undefined,

  oauthToken: undefined,
  api_key: undefined,
  isAuthenticated: false,

  quotaStatus: undefined,

  viewMode: 'grid' as const,
  isLoading: false,
  error: null,
};

export const useYouTubeLensStore = create<YouTubeLensState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initial_state,

        // 비디오 관련 액션
        setVideos: (videos) => set({ videos }),

        appendVideos: (videos) =>
          set((state) => ({
            videos: [...state.videos, ...videos],
          })),

        clearVideos: () => set({ videos: [], selectedVideos: new Set() }),

        toggleVideoSelection: (video_id) =>
          set((state) => {
            const new_selected = new Set(state.selectedVideos);
            if (new_selected.has(video_id)) {
              new_selected.delete(video_id);
            } else {
              new_selected.add(video_id);
            }
            return { selectedVideos: new_selected };
          }),

        selectAllVideos: () =>
          set((state) => ({
            selectedVideos: new Set(state.videos.map((v) => v.id)),
          })),

        clearSelectedVideos: () => set({ selectedVideos: new Set() }),

        // 즐겨찾기 관련 액션
        addFavorite: (video) =>
          set((state) => {
            const new_favorites = new Map(state.favoriteVideos);
            const favorite: YouTubeFavorite = {
              id: crypto.randomUUID(),
              user_id: '', // 실제 구현시 auth에서 가져옴
              video_id: video.video_id,
              video_title: video.title,
              video_description: video.description,
              video_thumbnail: video.thumbnail_url,
              channel_id: video.channel_id,
              channel_title: video.channel_title,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            new_favorites.set(video.video_id, favorite);
            return { favoriteVideos: new_favorites };
          }),

        removeFavorite: (video_id) =>
          set((state) => {
            const new_favorites = new Map(state.favoriteVideos);
            new_favorites.delete(video_id);
            return { favoriteVideos: new_favorites };
          }),

        updateFavorite: (video_id, updates) =>
          set((state) => {
            const new_favorites = new Map(state.favoriteVideos);
            const existing = new_favorites.get(video_id);
            if (existing) {
              new_favorites.set(video_id, {
                ...existing,
                ...updates,
                updated_at: new Date().toISOString(),
              });
            }
            return { favoriteVideos: new_favorites };
          }),

        loadFavorites: (favorites) =>
          set({
            favoriteVideos: new Map(favorites.map((f) => [f.video_id, f])),
          }),

        // 검색 관련 액션
        setSearchQuery: (query) => set({ searchQuery: query }),

        setSearchFilters: (filters) =>
          set((state) => ({
            searchFilters: { ...state.searchFilters, ...filters },
          })),

        addToSearchHistory: (query) =>
          set((state) => {
            const new_history = [query, ...state.searchHistory.filter((q) => q !== query)];
            return { searchHistory: new_history.slice(0, 20) }; // 최대 20개 저장
          }),

        clearSearchHistory: () => set({ searchHistory: [] }),

        // 인증 관련 액션
        setOAuthToken: (token) =>
          set({
            oauthToken: token,
            isAuthenticated: !!token,
          }),

        setApiKey: (key) =>
          set({
            api_key: key,
            isAuthenticated: !!key || !!get().oauthToken,
          }),

        // 할당량 관련 액션
        setQuotaStatus: (status) => set({ quotaStatus: status }),

        updateQuotaUsage: (units) =>
          set((state) => {
            if (!state.quotaStatus) {
              return {};
            }

            const new_used = state.quotaStatus.used + units;
            const new_remaining = 10000 - new_used; // 기본 할당량 10000
            const new_percentage = (new_used / 10000) * 100;

            return {
              quotaStatus: {
                ...state.quotaStatus,
                used: new_used,
                remaining: new_remaining,
                percentage: new_percentage,
                warning: new_percentage > 80,
                critical: new_percentage > 95,
              },
            };
          }),

        // UI 관련 액션
        setViewMode: (mode) => set({ viewMode: mode }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        setNextPageToken: (token) => set({ nextPageToken: token }),
        setHasMore: (has_more) => set({ hasMore: has_more }),

        // 전체 초기화
        reset: () => set(initial_state),
      }),
      {
        name: 'youtube-lens-storage',
        partialize: (state) => ({
          searchHistory: state.searchHistory,
          viewMode: state.viewMode,
          searchFilters: state.searchFilters,
          // OAuth 토큰과 API 키는 보안상 저장하지 않음
        }),
      }
    ),
    {
      name: 'YouTubeLensStore',
    }
  )
);
