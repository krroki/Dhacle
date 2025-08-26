/**
 * YouTube API response type definitions
 * These types replace any types in YouTube-related API and monitoring files
 */

// Generic API Response wrapper
export interface YouTubeApiResponse<T> {
  data: T;
  error?: string;
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults?: number;
  resultsPerPage?: number;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
}

// Thumbnail types
export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default: YouTubeThumbnail;
  medium: YouTubeThumbnail;
  high: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

// Video types
export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
    categoryId?: string;
    liveBroadcastContent?: 'none' | 'upcoming' | 'live';
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
    favoriteCount: string;
    dislikeCount?: string;
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
    hasCustomThumbnail?: boolean;
    uploadStatus?: string;
    privacyStatus?: string;
  };
  status?: {
    uploadStatus: 'uploaded' | 'processed' | 'failed' | 'rejected' | 'deleted';
    privacyStatus: 'private' | 'public' | 'unlisted';
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
    selfDeclaredMadeForKids?: boolean;
  };
}

// Channel types
export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: YouTubeThumbnails;
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
  contentDetails?: {
    relatedPlaylists: {
      likes: string;
      uploads: string;
      favorites?: string;
    };
  };
  brandingSettings?: {
    channel: {
      title: string;
      description: string;
      keywords?: string;
      defaultTab?: string;
      trackingAnalyticsAccountId?: string;
      moderateComments?: boolean;
      showRelatedChannels?: boolean;
      showBrowseView?: boolean;
      featuredChannelsTitle?: string;
      featuredChannelsUrls?: string[];
      unsubscribedTrailer?: string;
      profileColor?: string;
      defaultLanguage?: string;
      country?: string;
    };
    image?: {
      bannerExternalUrl: string;
    };
  };
}

// Playlist types
export interface YouTubePlaylist {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    tags?: string[];
    defaultLanguage?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  status?: {
    privacyStatus: 'private' | 'public' | 'unlisted';
  };
  contentDetails?: {
    itemCount: number;
  };
  player?: {
    embedHtml: string;
  };
}

// Search result types
export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: 'youtube#video' | 'youtube#channel' | 'youtube#playlist';
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: YouTubeThumbnails;
    channelTitle: string;
    liveBroadcastContent?: 'none' | 'upcoming' | 'live';
  };
}

// Comment types
export interface YouTubeComment {
  id: string;
  snippet: {
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelUrl: string;
    authorChannelId: {
      value: string;
    };
    videoId: string;
    textDisplay: string;
    textOriginal: string;
    canRate: boolean;
    viewerRating: 'none' | 'like' | 'dislike';
    likeCount: number;
    publishedAt: string;
    updatedAt: string;
    parentId?: string;
  };
}

// Analytics types
export interface YouTubeAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  annotationClickThroughRate?: number;
  annotationCloseRate?: number;
  subscribersGained?: number;
  subscribersLost?: number;
  date?: string;
}

// Folder and Channel relationship types (internal)
export interface YouTubeFolder {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  folderChannels?: YouTubeFolderChannel[];
  isDefault?: boolean;
  sortOrder?: number;
}

export interface YouTubeFolderChannel {
  id: string;
  folderId: string;
  channelId: string;
  channelTitle?: string;
  channelDescription?: string;
  channelThumbnailUrl?: string;
  channelSubscriberCount?: string;
  channelVideoCount?: string;
  channelViewCount?: string;
  addedAt: string;
  updatedAt: string;
  isActive?: boolean;
  lastChecked?: string;
  notes?: string;
}

// Monitoring and metrics types
export interface YouTubeMetrics {
  channelId: string;
  date: string;
  viewCount: number;
  subscriberCount: number;
  videoCount: number;
  engagementRate?: number;
  averageViewDuration?: number;
  clickThroughRate?: number;
  impressions?: number;
  uniqueViewers?: number;
}

// Paginated response types
export interface YouTubePaginatedResponse<T> {
  items: T[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  etag?: string;
  kind?: string;
  regionCode?: string;
}

// Error response type
export interface YouTubeErrorResponse {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
      location?: string;
      locationType?: string;
    }>;
    status?: string;
  };
}

// Type guards
export function isYouTubeVideo(item: unknown): item is YouTubeVideo {
  return typeof item === 'object' && item !== null && 'snippet' in item && 'id' in item;
}

export function isYouTubeChannel(item: unknown): item is YouTubeChannel {
  return typeof item === 'object' && item !== null && 'snippet' in item && 'statistics' in item;
}

export function isYouTubeError(response: unknown): response is YouTubeErrorResponse {
  return typeof response === 'object' && response !== null && 'error' in response;
}

// Export all types as a namespace for convenience
export type YouTubeItem = YouTubeVideo | YouTubeChannel | YouTubePlaylist | YouTubeSearchResult;