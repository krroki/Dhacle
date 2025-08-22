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

  addFavorite: (video: FlattenedYouTubeVideo, tags?: string[], notes?: string) => void;
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
  setHasMore: (hasMore: boolean) => void;

  reset: () => void;
}

const initialState = {
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
        ...initialState,

        // 비디오 관련 액션
        setVideos: (videos) => set({ videos }),

        appendVideos: (videos) =>
          set((state) => ({
            videos: [...state.videos, ...videos],
          })),

        clearVideos: () => set({ videos: [], selectedVideos: new Set() }),

        toggleVideoSelection: (video_id) =>
          set((state) => {
            const newSelected = new Set(state.selectedVideos);
            if (newSelected.has(video_id)) {
              newSelected.delete(video_id);
            } else {
              newSelected.add(video_id);
            }
            return { selectedVideos: newSelected };
          }),

        selectAllVideos: () =>
          set((state) => ({
            selectedVideos: new Set(state.videos.map((v) => v.id)),
          })),

        clearSelectedVideos: () => set({ selectedVideos: new Set() }),

        // 즐겨찾기 관련 액션
        addFavorite: (video, tags = [], notes = '') =>
          set((state) => {
            const newFavorites = new Map(state.favoriteVideos);
            const favorite: YouTubeFavorite = {
              id: crypto.randomUUID(),
              user_id: '', // 실제 구현시 auth에서 가져옴
              video_id: video.id,
              videoData: video,
              tags,
              notes: notes || undefined,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            newFavorites.set(video.id, favorite);
            return { favoriteVideos: newFavorites };
          }),

        removeFavorite: (video_id) =>
          set((state) => {
            const newFavorites = new Map(state.favoriteVideos);
            newFavorites.delete(video_id);
            return { favoriteVideos: newFavorites };
          }),

        updateFavorite: (video_id, updates) =>
          set((state) => {
            const newFavorites = new Map(state.favoriteVideos);
            const existing = newFavorites.get(video_id);
            if (existing) {
              newFavorites.set(video_id, {
                ...existing,
                ...updates,
                updated_at: new Date().toISOString(),
              });
            }
            return { favoriteVideos: newFavorites };
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
            const newHistory = [query, ...state.searchHistory.filter((q) => q !== query)];
            return { searchHistory: newHistory.slice(0, 20) }; // 최대 20개 저장
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

            const newUsed = state.quotaStatus.used + units;
            const newRemaining = 10000 - newUsed; // 기본 할당량 10000
            const newPercentage = (newUsed / 10000) * 100;

            return {
              quotaStatus: {
                ...state.quotaStatus,
                used: newUsed,
                remaining: newRemaining,
                percentage: newPercentage,
                warning: newPercentage > 80,
                critical: newPercentage > 95,
              },
            };
          }),

        // UI 관련 액션
        setViewMode: (mode) => set({ viewMode: mode }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),

        setNextPageToken: (token) => set({ nextPageToken: token }),
        setHasMore: (hasMore) => set({ hasMore }),

        // 전체 초기화
        reset: () => set(initialState),
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
