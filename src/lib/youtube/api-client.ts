import { YouTubeOAuth } from './oauth';
import { CryptoUtil } from './crypto';
import type { 
  YouTubeVideo, 
  YouTubeChannel, 
  YouTubeSearchFilters,
  OAuthToken 
} from '@/types/youtube';

/**
 * YouTube Data API v3 클라이언트
 * 자동 토큰 갱신 및 할당량 관리 기능 포함
 */
export class YouTubeAPIClient {
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';
  
  // API 할당량 비용 (YouTube Data API v3 기준)
  private static readonly QUOTA_COSTS = {
    search: 100,           // search.list
    videos: 1,            // videos.list (per ID)
    channels: 1,          // channels.list
    playlists: 1,         // playlists.list
    playlistItems: 1,     // playlistItems.list
    comments: 1,          // comments.list
    commentThreads: 1,    // commentThreads.list
  };

  private token?: OAuthToken;
  private apiKey?: string;
  private onTokenRefresh?: (token: OAuthToken) => Promise<void>;
  private onQuotaUpdate?: (units: number) => Promise<void>;

  constructor(options: {
    token?: OAuthToken;
    apiKey?: string;
    onTokenRefresh?: (token: OAuthToken) => Promise<void>;
    onQuotaUpdate?: (units: number) => Promise<void>;
  }) {
    this.token = options.token;
    this.apiKey = options.apiKey;
    this.onTokenRefresh = options.onTokenRefresh;
    this.onQuotaUpdate = options.onQuotaUpdate;
  }

  /**
   * API 요청 실행 (자동 토큰 갱신 포함)
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, any>,
    quotaCost: number
  ): Promise<T> {
    // OAuth 토큰 사용
    if (this.token) {
      return await YouTubeOAuth.withAutoRefresh(
        this.token,
        async (newToken) => {
          this.token = newToken;
          if (this.onTokenRefresh) {
            await this.onTokenRefresh(newToken);
          }
        },
        async (accessToken) => {
          const url = new URL(`${YouTubeAPIClient.BASE_URL}/${endpoint}`);
          
          // 파라미터 추가
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value));
            }
          });

          const response = await fetch(url.toString(), {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            },
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(
              error.error?.message || 
              `YouTube API error: ${response.status} ${response.statusText}`
            );
          }

          // 할당량 업데이트
          if (this.onQuotaUpdate) {
            await this.onQuotaUpdate(quotaCost);
          }

          return response.json();
        }
      );
    }
    
    // API 키 사용
    if (this.apiKey) {
      const url = new URL(`${YouTubeAPIClient.BASE_URL}/${endpoint}`);
      
      // API 키 추가
      url.searchParams.append('key', this.apiKey);
      
      // 파라미터 추가
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error?.message || 
          `YouTube API error: ${response.status} ${response.statusText}`
        );
      }

      // 할당량 업데이트
      if (this.onQuotaUpdate) {
        await this.onQuotaUpdate(quotaCost);
      }

      return response.json();
    }

    throw new Error('No authentication method available. Please provide OAuth token or API key.');
  }

  /**
   * YouTube 영상 검색
   */
  async search(filters: YouTubeSearchFilters): Promise<{
    items: YouTubeVideo[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    const params: Record<string, any> = {
      part: 'snippet',
      type: 'video',
      q: filters.query,
      maxResults: filters.maxResults || 50,
      order: filters.order || 'relevance',
      relevanceLanguage: filters.relevanceLanguage || 'ko',
      regionCode: filters.regionCode || 'KR',
      safeSearch: filters.safeSearch || 'moderate',
    };

    // 추가 필터
    if (filters.videoDuration) {
      params.videoDuration = filters.videoDuration;
    }
    if (filters.videoDefinition) {
      params.videoDefinition = filters.videoDefinition;
    }
    if (filters.videoEmbeddable !== undefined) {
      params.videoEmbeddable = filters.videoEmbeddable;
    }
    if (filters.publishedAfter) {
      params.publishedAfter = filters.publishedAfter;
    }
    if (filters.publishedBefore) {
      params.publishedBefore = filters.publishedBefore;
    }
    if (filters.channelId) {
      params.channelId = filters.channelId;
    }
    if (filters.pageToken) {
      params.pageToken = filters.pageToken;
    }

    const response = await this.makeRequest<any>(
      'search',
      params,
      YouTubeAPIClient.QUOTA_COSTS.search
    );

    // 검색 결과를 YouTubeVideo 형식으로 변환
    const videoIds = response.items.map((item: any) => item.id.videoId).join(',');
    
    // 비디오 상세 정보 가져오기 (통계, 재생시간 등)
    if (videoIds) {
      const videosResponse = await this.getVideos(videoIds);
      
      // 검색 결과와 상세 정보 병합
      const videosMap = new Map(
        videosResponse.items.map(video => [video.id, video])
      );
      
      const items = response.items
        .map((item: any) => videosMap.get(item.id.videoId))
        .filter(Boolean) as YouTubeVideo[];
      
      return {
        items,
        nextPageToken: response.nextPageToken,
        totalResults: response.pageInfo?.totalResults || 0,
      };
    }

    return {
      items: [],
      nextPageToken: response.nextPageToken,
      totalResults: 0,
    };
  }

  /**
   * 비디오 상세 정보 가져오기
   */
  async getVideos(videoIds: string): Promise<{
    items: YouTubeVideo[];
  }> {
    const response = await this.makeRequest<any>(
      'videos',
      {
        part: 'snippet,statistics,contentDetails,status',
        id: videoIds,
        maxResults: 50,
      },
      YouTubeAPIClient.QUOTA_COSTS.videos * videoIds.split(',').length
    );

    const items: YouTubeVideo[] = response.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      duration: this.parseDuration(item.contentDetails?.duration),
      viewCount: parseInt(item.statistics?.viewCount || '0'),
      likeCount: parseInt(item.statistics?.likeCount || '0'),
      commentCount: parseInt(item.statistics?.commentCount || '0'),
      tags: item.snippet.tags || [],
      categoryId: item.snippet.categoryId,
      defaultLanguage: item.snippet.defaultLanguage,
      defaultAudioLanguage: item.snippet.defaultAudioLanguage,
      statistics: {
        viewCount: item.statistics?.viewCount || '0',
        likeCount: item.statistics?.likeCount || '0',
        dislikeCount: item.statistics?.dislikeCount || '0',
        favoriteCount: item.statistics?.favoriteCount || '0',
        commentCount: item.statistics?.commentCount || '0',
      },
      contentDetails: {
        duration: item.contentDetails?.duration,
        dimension: item.contentDetails?.dimension,
        definition: item.contentDetails?.definition,
        caption: item.contentDetails?.caption,
        licensedContent: item.contentDetails?.licensedContent,
        projection: item.contentDetails?.projection,
      },
      status: {
        uploadStatus: item.status?.uploadStatus,
        privacyStatus: item.status?.privacyStatus,
        license: item.status?.license,
        embeddable: item.status?.embeddable,
        publicStatsViewable: item.status?.publicStatsViewable,
        madeForKids: item.status?.madeForKids,
      },
    }));

    return { items };
  }

  /**
   * 채널 정보 가져오기
   */
  async getChannel(channelId: string): Promise<YouTubeChannel | null> {
    const response = await this.makeRequest<any>(
      'channels',
      {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
      },
      YouTubeAPIClient.QUOTA_COSTS.channels
    );

    if (!response.items || response.items.length === 0) {
      return null;
    }

    const item = response.items[0];
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      customUrl: item.snippet.customUrl,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      country: item.snippet.country,
      publishedAt: item.snippet.publishedAt,
      subscriberCount: parseInt(item.statistics?.subscriberCount || '0'),
      videoCount: parseInt(item.statistics?.videoCount || '0'),
      viewCount: parseInt(item.statistics?.viewCount || '0'),
      statistics: {
        viewCount: item.statistics?.viewCount || '0',
        subscriberCount: item.statistics?.subscriberCount || '0',
        hiddenSubscriberCount: item.statistics?.hiddenSubscriberCount || false,
        videoCount: item.statistics?.videoCount || '0',
      },
    };
  }

  /**
   * 재생목록의 영상 가져오기
   */
  async getPlaylistItems(playlistId: string, pageToken?: string): Promise<{
    items: YouTubeVideo[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    const response = await this.makeRequest<any>(
      'playlistItems',
      {
        part: 'snippet',
        playlistId,
        maxResults: 50,
        pageToken,
      },
      YouTubeAPIClient.QUOTA_COSTS.playlistItems
    );

    // 비디오 ID 추출
    const videoIds = response.items
      .map((item: any) => item.snippet.resourceId.videoId)
      .join(',');

    // 비디오 상세 정보 가져오기
    if (videoIds) {
      const videosResponse = await this.getVideos(videoIds);
      
      return {
        items: videosResponse.items,
        nextPageToken: response.nextPageToken,
        totalResults: response.pageInfo?.totalResults || 0,
      };
    }

    return {
      items: [],
      nextPageToken: response.nextPageToken,
      totalResults: 0,
    };
  }

  /**
   * ISO 8601 duration을 초 단위로 변환
   */
  private parseDuration(duration?: string): number {
    if (!duration) return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * 인증 방법 업데이트
   */
  updateAuth(options: {
    token?: OAuthToken;
    apiKey?: string;
  }) {
    if (options.token) {
      this.token = options.token;
    }
    if (options.apiKey) {
      this.apiKey = options.apiKey;
    }
  }

  /**
   * 할당량 비용 계산
   */
  static calculateQuotaCost(operation: keyof typeof YouTubeAPIClient.QUOTA_COSTS, count: number = 1): number {
    return (YouTubeAPIClient.QUOTA_COSTS[operation] || 0) * count;
  }
}