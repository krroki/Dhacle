// YouTube Data API v3 관련 타입 정의

// YouTube 비디오 정보 (원본 API 응답 형태)
export interface YouTubeVideo {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
      standard?: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
    liveBroadcastContent: 'none' | 'live' | 'upcoming';
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  statistics?: {
    viewCount: string;
    likeCount?: string;
    dislikeCount?: string;
    favoriteCount?: string;
    commentCount?: string;
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
  };
  status?: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
}

// 평면화된 비디오 정보 (UI 컴포넌트에서 사용)
export interface FlattenedYouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  duration: number; // 초 단위
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  categoryId: string;
  defaultLanguage: string;
  defaultAudioLanguage: string;
  statistics: {
    viewCount: string;
    likeCount: string;
    dislikeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
  };
  status: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
}

// YouTube 썸네일
export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

// YouTube 채널 정보
export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
    };
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
    country?: string;
  };
  statistics?: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
}

// YouTube 검색 결과
export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: YouTubeVideo['snippet'];
}

// YouTube API 응답 형식
export interface YouTubeApiResponse<T> {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: T[];
}

// 검색 필터
export interface YouTubeSearchFilters {
  query: string;
  channelId?: string;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
  publishedAfter?: string;
  publishedBefore?: string;
  videoDuration?: 'short' | 'medium' | 'long';
  videoDefinition?: 'any' | 'high' | 'standard';
  videoType?: 'any' | 'episode' | 'movie';
  videoEmbeddable?: 'any' | 'true';
  maxResults?: number;
  pageToken?: string;
  regionCode?: string;
  relevanceLanguage?: string;
  safeSearch?: 'moderate' | 'none' | 'strict';
}

// 즐겨찾기 데이터
export interface YouTubeFavorite {
  id: string;
  user_id: string;
  video_id: string;
  video_data: FlattenedYouTubeVideo;
  tags: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 검색 히스토리
export interface YouTubeSearchHistory {
  id: string;
  user_id: string;
  query: string;
  filters?: YouTubeSearchFilters;
  results_count: number;
  created_at: string;
}

// API 사용량
export interface ApiUsage {
  id: string;
  user_id: string;
  operation: 'search' | 'videos' | 'channels' | 'playlists';
  units: number;
  timestamp: string;
  api_type: 'youtube';
}

// API 할당량 상태
export interface QuotaStatus {
  used: number;
  remaining: number;
  percentage: number;
  resetTime: Date;
  warning: boolean;
  critical: boolean;
  searchCount?: number;
  videoCount?: number;
}

// OAuth 토큰 정보
export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  expires_at?: number;
}

// 사용자 API 키
export interface UserApiKey {
  id: string;
  user_id: string;
  provider: 'google' | 'youtube';
  encrypted_key: string;
  refresh_token?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// 비디오 카드 props
export interface VideoCardProps {
  video: FlattenedYouTubeVideo;
  isSelected?: boolean;
  onSelect?: (videoId: string) => void;
  onFavorite?: (video: FlattenedYouTubeVideo) => void;
  isFavorited?: boolean;
}

// 검색바 props
export interface SearchBarProps {
  onSearch: (query: string, filters?: YouTubeSearchFilters) => void;
  isLoading?: boolean;
  suggestions?: string[];
  defaultValue?: string;
}

// 비디오 그리드 props
export interface VideoGridProps {
  videos: FlattenedYouTubeVideo[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedVideos?: Set<string>;
  onVideoSelect?: (videoId: string) => void;
  favoriteVideos?: Set<string>;
  onVideoFavorite?: (video: FlattenedYouTubeVideo) => void;
}

// API 에러 응답
export interface ApiError {
  error: {
    code: number;
    message: string;
    errors?: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}