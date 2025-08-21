// OAuth removed - using API Key system
import type {
  FlattenedYouTubeVideo,
  OAuthToken,
  YouTubeChannel,
  YouTubeSearchFilters,
} from '@/types/youtube';
import { CacheManager, cacheManager } from './cache';
import { JobPriority, JobType, queueManager } from './queue-manager';

/**
 * YouTube Data API v3 클라이언트
 * 캐싱, 배치 처리, 자동 토큰 갱신 및 할당량 관리 기능 포함
 */
export class YouTubeAPIClient {
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3';

  // API 할당량 비용 (YouTube Data API v3 기준)
  private static readonly QUOTA_COSTS = {
    search: 100, // search.list
    videos: 1, // videos.list (per ID)
    channels: 1, // channels.list
    playlists: 1, // playlists.list
    playlistItems: 1, // playlistItems.list
    comments: 1, // comments.list
    commentThreads: 1, // commentThreads.list
  };

  private token?: OAuthToken;
  private apiKey?: string;
  private onTokenRefresh?: (token: OAuthToken) => Promise<void>;
  private onQuotaUpdate?: (units: number) => Promise<void>;
  private useCache = true;
  private useBatchQueue = false;
  private userId?: string;

  constructor(options: {
    token?: OAuthToken;
    api_key?: string;
    onTokenRefresh?: (token: OAuthToken) => Promise<void>;
    onQuotaUpdate?: (units: number) => Promise<void>;
    useCache?: boolean;
    useBatchQueue?: boolean;
    user_id?: string;
  }) {
    this.token = options.token;
    this.apiKey = options.api_key;
    this.onTokenRefresh = options.onTokenRefresh;
    this.onQuotaUpdate = options.onQuotaUpdate;
    this.useCache = options.useCache ?? true;
    this.useBatchQueue = options.useBatchQueue ?? false;
    this.userId = options.user_id;
  }

  /**
   * API 요청 실행 (캐싱 및 배치 처리 포함)
   */
  private async makeRequest<T>(
    endpoint: string,
    params: Record<string, unknown>,
    quotaCost: number
  ): Promise<T> {
    // 캐시 키 생성
    const cacheKey = cacheManager.generateKey(endpoint, params);

    // 캐시 확인 (캐싱 활성화된 경우)
    if (this.useCache) {
      const cached = await cacheManager.get<T>(cacheKey);
      if (cached) {
        console.log(`Cache hit for ${endpoint}`);
        return cached;
      }
    }

    // 배치 큐 사용 (활성화된 경우)
    if (this.useBatchQueue) {
      // 작업 유형 매핑
      const jobType = this.mapEndpointToJobType(endpoint);

      if (jobType) {
        const job = await queueManager.addJob({
          type: jobType,
          params,
          user_id: this.userId,
          priority: JobPriority.HIGH,
        });

        // 작업 완료 대기
        const result = await this.waitForJobCompletion<T>(job.id!, jobType);
        return result;
      }
    }

    // 직접 API 호출
    const result = await this.directAPICall<T>(endpoint, params, quotaCost);

    // 결과 캐싱 (캐싱 활성화된 경우)
    if (this.useCache && CacheManager.isCacheable(result)) {
      const ttl = CacheManager.getTTL(endpoint);
      await cacheManager.set(cacheKey, result, ttl);
    }

    return result;
  }

  /**
   * 직접 API 호출 (캐싱/큐 없이)
   */
  private async directAPICall<T>(
    endpoint: string,
    params: Record<string, unknown>,
    quotaCost: number
  ): Promise<T> {
    // OAuth 시스템이 제거되었습니다 - API Key만 사용

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
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error?.message || `YouTube API error: ${response.status} ${response.statusText}`
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
   * 엔드포인트를 작업 유형으로 매핑
   */
  private mapEndpointToJobType(endpoint: string): JobType | null {
    const mapping: Record<string, JobType> = {
      search: JobType.SEARCH,
      videos: JobType.VIDEO_DETAILS,
      channels: JobType.CHANNEL_DETAILS,
      playlistItems: JobType.PLAYLIST_ITEMS,
    };

    return mapping[endpoint] || null;
  }

  /**
   * 작업 완료 대기
   */
  private async waitForJobCompletion<T>(jobId: string, jobType: JobType): Promise<T> {
    // 간단한 폴링 구현 (실제로는 더 정교한 방법 필요)
    const maxAttempts = 60;
    const delayMs = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      const job = await queueManager.getJobStatus(jobId, jobType);

      if (job?.finishedOn) {
        if (job.failedReason) {
          throw new Error(`Job failed: ${job.failedReason}`);
        }
        return job.returnvalue as T;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error('Job timeout');
  }

  /**
   * YouTube 영상 검색
   */
  async search(filters: YouTubeSearchFilters): Promise<{
    items: FlattenedYouTubeVideo[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    const params: Record<string, unknown> = {
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
    if (filters.channel_id) {
      params.channel_id = filters.channel_id;
    }
    if (filters.pageToken) {
      params.pageToken = filters.pageToken;
    }

    const response = await this.makeRequest<{
      items: { id: { video_id: string } }[];
      nextPageToken?: string;
      pageInfo?: { totalResults: number };
    }>('search', params, YouTubeAPIClient.QUOTA_COSTS.search);

    // 검색 결과를 YouTubeVideo 형식으로 변환
    const videoIds = response.items.map((item) => item.id.video_id).join(',');

    // 비디오 상세 정보 가져오기 (통계, 재생시간 등)
    if (videoIds) {
      const videosResponse = await this.getVideos(videoIds);

      // 검색 결과와 상세 정보 병합
      const videosMap = new Map(videosResponse.items.map((video) => [video.id, video]));

      const items = response.items
        .map((item) => videosMap.get(item.id.video_id))
        .filter(Boolean) as FlattenedYouTubeVideo[];

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
    items: FlattenedYouTubeVideo[];
  }> {
    const response = await this.makeRequest<{
      items: unknown[];
    }>(
      'videos',
      {
        part: 'snippet,statistics,contentDetails,status',
        id: videoIds,
        maxResults: 50,
      },
      YouTubeAPIClient.QUOTA_COSTS.videos * videoIds.split(',').length
    );

    const items: FlattenedYouTubeVideo[] = response.items.map((item: unknown) => {
      if (!item || typeof item !== 'object') {
        throw new Error('Invalid video item format');
      }
      const videoItem = item as Record<string, unknown>;
      const snippet = videoItem.snippet as Record<string, unknown> | undefined;
      const statistics = videoItem.statistics as Record<string, unknown> | undefined;
      const contentDetails = videoItem.contentDetails as Record<string, unknown> | undefined;
      const status = videoItem.status as Record<string, unknown> | undefined;

      return {
        id: String(videoItem.id || ''),
        title: String(snippet?.title || ''),
        description: String(snippet?.description || ''),
        thumbnail: String(
          ((snippet?.thumbnails as Record<string, unknown>)?.high as Record<string, unknown>)
            ?.url ||
            ((snippet?.thumbnails as Record<string, unknown>)?.default as Record<string, unknown>)
              ?.url ||
            ''
        ),
        channel_id: String(snippet?.channel_id || ''),
        channel_title: String(snippet?.channel_title || ''),
        published_at: String(snippet?.published_at || ''),
        duration: this.parseDuration(String(contentDetails?.duration || '')),
        view_count: Number.parseInt(String(statistics?.view_count || '0'), 10),
        like_count: Number.parseInt(String(statistics?.like_count || '0'), 10),
        comment_count: Number.parseInt(String(statistics?.comment_count || '0'), 10),
        tags: Array.isArray(snippet?.tags) ? (snippet.tags as string[]) : [],
        category_id: String(snippet?.category_id || ''),
        defaultLanguage: String(snippet?.defaultLanguage || ''),
        defaultAudioLanguage: String(snippet?.defaultAudioLanguage || ''),
        statistics: {
          view_count: String(statistics?.view_count || '0'),
          like_count: String(statistics?.like_count || '0'),
          dislikeCount: String(statistics?.dislikeCount || '0'),
          favoriteCount: String(statistics?.favoriteCount || '0'),
          comment_count: String(statistics?.comment_count || '0'),
        },
        contentDetails: {
          duration: String(contentDetails?.duration || ''),
          dimension: String(contentDetails?.dimension || ''),
          definition: String(contentDetails?.definition || ''),
          caption: String(contentDetails?.caption || ''),
          licensedContent: Boolean(contentDetails?.licensedContent),
          projection: String(contentDetails?.projection || ''),
        },
        status: {
          uploadStatus: String(status?.uploadStatus || ''),
          privacyStatus: String(status?.privacyStatus || ''),
          license: String(status?.license || ''),
          embeddable: Boolean(status?.embeddable),
          publicStatsViewable: Boolean(status?.publicStatsViewable),
          madeForKids: Boolean(status?.madeForKids),
        },
      };
    });

    return { items };
  }

  /**
   * 채널 정보 가져오기
   */
  async getChannel(channel_id: string): Promise<YouTubeChannel | null> {
    const response = await this.makeRequest<{
      items?: unknown[];
    }>(
      'channels',
      {
        part: 'snippet,statistics,contentDetails',
        id: channel_id,
      },
      YouTubeAPIClient.QUOTA_COSTS.channels
    );

    if (!response.items || response.items.length === 0) {
      return null;
    }

    const item = response.items[0] as Record<string, unknown>;
    const snippet = item.snippet as Record<string, unknown> | undefined;
    const statistics = item.statistics as Record<string, unknown> | undefined;

    return {
      id: String(item.id || ''),
      snippet: {
        title: String(snippet?.title || ''),
        description: String(snippet?.description || ''),
        customUrl: String(snippet?.customUrl || ''),
        published_at: String(snippet?.published_at || ''),
        thumbnails: {
          high: {
            url: String(
              ((snippet?.thumbnails as Record<string, unknown>)?.high as Record<string, unknown>)
                ?.url || ''
            ),
            width: 800,
            height: 800,
          },
          default: {
            url: String(
              ((snippet?.thumbnails as Record<string, unknown>)?.default as Record<string, unknown>)
                ?.url || ''
            ),
            width: 88,
            height: 88,
          },
        },
        country: String(snippet?.country || ''),
      },
      statistics: {
        view_count: String(statistics?.view_count || '0'),
        subscriber_count: String(statistics?.subscriber_count || '0'),
        hiddenSubscriberCount: Boolean(statistics?.hiddenSubscriberCount),
        videoCount: String(statistics?.videoCount || '0'),
      },
    };
  }

  /**
   * 재생목록의 영상 가져오기
   */
  async getPlaylistItems(
    playlist_id: string,
    pageToken?: string
  ): Promise<{
    items: FlattenedYouTubeVideo[];
    nextPageToken?: string;
    totalResults: number;
  }> {
    const response = await this.makeRequest<{
      items: unknown[];
      nextPageToken?: string;
      pageInfo?: { totalResults: number };
    }>(
      'playlistItems',
      {
        part: 'snippet',
        playlist_id,
        maxResults: 50,
        pageToken,
      },
      YouTubeAPIClient.QUOTA_COSTS.playlistItems
    );

    // 비디오 ID 추출
    const videoIds = response.items
      .map((item: unknown) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const playlistItem = item as Record<string, unknown>;
        const snippet = playlistItem.snippet as Record<string, unknown> | undefined;
        const resourceId = snippet?.resourceId as Record<string, unknown> | undefined;
        return String(resourceId?.video_id || '');
      })
      .filter(Boolean)
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
    if (!duration) {
      return 0;
    }

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) {
      return 0;
    }

    const hours = Number.parseInt(match[1] || '0', 10);
    const minutes = Number.parseInt(match[2] || '0', 10);
    const seconds = Number.parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * 인증 방법 업데이트
   */
  updateAuth(options: { token?: OAuthToken; api_key?: string }) {
    if (options.token) {
      this.token = options.token;
    }
    if (options.api_key) {
      this.apiKey = options.api_key;
    }
  }

  /**
   * 할당량 비용 계산
   */
  static calculateQuotaCost(
    operation: keyof typeof YouTubeAPIClient.QUOTA_COSTS,
    count = 1
  ): number {
    return (YouTubeAPIClient.QUOTA_COSTS[operation] || 0) * count;
  }
}
