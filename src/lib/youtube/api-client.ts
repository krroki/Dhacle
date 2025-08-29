// OAuth removed - using API Key system
import type { FlattenedYouTubeVideo, YouTubeChannel, YouTubeSearchFilters } from '@/types';
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

  private apiKey?: string;
  private onQuotaUpdate?: (units: number) => Promise<void>;
  private useCache = true;
  private useBatchQueue = false;
  private userId?: string;

  constructor(options: {
    api_key?: string;
    onQuotaUpdate?: (units: number) => Promise<void>;
    useCache?: boolean;
    useBatchQueue?: boolean;
    user_id?: string;
  }) {
    this.apiKey = options.api_key;
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
    quota_cost: number
  ): Promise<T> {
    // 캐시 키 생성
    const cache_key = cacheManager.generateKey(endpoint, params);

    // 캐시 확인 (캐싱 활성화된 경우)
    if (this.useCache) {
      const cached = await cacheManager.get<T>(cache_key);
      if (cached) {
        console.log(`Cache hit for ${endpoint}`);
        return cached;
      }
    }

    // 배치 큐 사용 (활성화된 경우)
    if (this.useBatchQueue) {
      // 작업 유형 매핑
      const job_type = this.mapEndpointToJobType(endpoint);

      if (job_type) {
        const job = await queueManager.addJob({
          type: job_type,
          params,
          user_id: this.userId,
          priority: JobPriority.HIGH,
        });

        // 작업 완료 대기
        const result = await this.waitForJobCompletion<T>(job.id!, job_type);
        return result;
      }
    }

    // 직접 API 호출
    const result = await this.directAPICall<T>(endpoint, params, quota_cost);

    // 결과 캐싱 (캐싱 활성화된 경우)
    if (this.useCache && CacheManager.isCacheable(result)) {
      const ttl = CacheManager.getTTL(endpoint);
      await cacheManager.set(cache_key, result, ttl);
    }

    return result;
  }

  /**
   * 직접 API 호출 (캐싱/큐 없이)
   */
  private async directAPICall<T>(
    endpoint: string,
    params: Record<string, unknown>,
    quota_cost: number
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
        await this.onQuotaUpdate(quota_cost);
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
  private async waitForJobCompletion<T>(job_id: string, job_type: JobType): Promise<T> {
    // 간단한 폴링 구현 (실제로는 더 정교한 방법 필요)
    const max_attempts = 60;
    const delay_ms = 1000;

    for (let i = 0; i < max_attempts; i++) {
      const job = await queueManager.getJobStatus(job_id, job_type);

      if (job?.finishedOn) {
        if (job.failedReason) {
          throw new Error(`Job failed: ${job.failedReason}`);
        }
        return job.returnvalue as T;
      }

      await new Promise((resolve) => setTimeout(resolve, delay_ms));
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
      items: { id: { videoId: string } }[];
      nextPageToken?: string;
      pageInfo?: { totalResults: number };
    }>('search', params, YouTubeAPIClient.QUOTA_COSTS.search);

    // 검색 결과를 YouTubeVideo 형식으로 변환
    const video_ids = response.items.map((item) => item.id.videoId).join(',');

    // 비디오 상세 정보 가져오기 (통계, 재생시간 등)
    if (video_ids) {
      const videos_response = await this.getVideos(video_ids);

      // 검색 결과와 상세 정보 병합
      const videos_map = new Map(videos_response.items.map((video) => [video.id, video]));

      const items = response.items
        .map((item) => videos_map.get(item.id.videoId))
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
  async getVideos(video_ids: string): Promise<{
    items: FlattenedYouTubeVideo[];
  }> {
    const response = await this.makeRequest<{
      items: unknown[];
    }>(
      'videos',
      {
        part: 'snippet,statistics,contentDetails,status',
        id: video_ids,
        maxResults: 50,
      },
      YouTubeAPIClient.QUOTA_COSTS.videos * video_ids.split(',').length
    );

    if (!Array.isArray(response.items)) {
      throw new Error('Invalid response: items is not an array');
    }

    const items: FlattenedYouTubeVideo[] = response.items.map((item: unknown) => {
      if (!item || typeof item !== 'object') {
        throw new Error('Invalid video item format');
      }
      const video_item = item as Record<string, unknown>;
      const snippet = video_item.snippet as Record<string, unknown> | undefined;
      const statistics = video_item.statistics as Record<string, unknown> | undefined;
      const content_details = video_item.contentDetails as Record<string, unknown> | undefined;
      const status = video_item.status as Record<string, unknown> | undefined;

      return {
        id: String(video_item.id || ''),
        title: String(snippet?.title || ''),
        description: String(snippet?.description || ''),
        thumbnail: String(
          ((snippet?.thumbnails as Record<string, unknown>)?.high as Record<string, unknown>)
            ?.url ||
            ((snippet?.thumbnails as Record<string, unknown>)?.default as Record<string, unknown>)
              ?.url ||
            ''
        ),
        channel_id: String(snippet?.channelId || ''),
        channel_title: String(snippet?.channelTitle || ''),
        published_at: String(snippet?.publishedAt || ''),
        duration: this.parseDuration(String(content_details?.duration || '')),
        view_count: Number.parseInt(String(statistics?.viewCount || '0'), 10),
        like_count: Number.parseInt(String(statistics?.likeCount || '0'), 10),
        comment_count: Number.parseInt(String(statistics?.commentCount || '0'), 10),
        tags: Array.isArray(snippet?.tags) ? (snippet.tags as string[]) : [],
        category_id: String(snippet?.categoryId || ''),
        defaultLanguage: String(snippet?.defaultLanguage || ''),
        defaultAudioLanguage: String(snippet?.defaultAudioLanguage || ''),
        statistics: {
          view_count: String(statistics?.viewCount || '0'),
          like_count: String(statistics?.likeCount || '0'),
          dislikeCount: String(statistics?.dislikeCount || '0'),
          favoriteCount: String(statistics?.favoriteCount || '0'),
          comment_count: String(statistics?.commentCount || '0'),
        },
        contentDetails: {
          duration: String(content_details?.duration || ''),
          dimension: String(content_details?.dimension || ''),
          definition: String(content_details?.definition || ''),
          caption: String(content_details?.caption || ''),
          licensedContent: Boolean(content_details?.licensedContent),
          projection: String(content_details?.projection || ''),
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

    if (!response.items || !Array.isArray(response.items) || response.items.length === 0) {
      return null;
    }

    const item = response.items[0];
    if (!item || typeof item !== 'object') {
      return null;
    }
    const typed_item = item as Record<string, unknown>;
    const snippet = typed_item.snippet as Record<string, unknown> | undefined;
    const statistics = typed_item.statistics as Record<string, unknown> | undefined;

    return {
      id: String(typed_item.id || ''),
      snippet: {
        title: String(snippet?.title || ''),
        description: String(snippet?.description || ''),
        customUrl: String(snippet?.customUrl || ''),
        published_at: String(snippet?.publishedAt || ''),
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
        view_count: String(statistics?.viewCount || '0'),
        subscriber_count: String(statistics?.subscriberCount || '0'),
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
    page_token?: string
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
        pageToken: page_token,
      },
      YouTubeAPIClient.QUOTA_COSTS.playlistItems
    );

    // 비디오 ID 추출
    const video_ids = response.items
      .map((item: unknown) => {
        if (!item || typeof item !== 'object') {
          return null;
        }
        const playlist_item = item as Record<string, unknown>;
        const snippet = playlist_item.snippet as Record<string, unknown> | undefined;
        const resource_id = snippet?.resourceId as Record<string, unknown> | undefined;
        return String(resource_id?.videoId || '');
      })
      .filter(Boolean)
      .join(',');

    // 비디오 상세 정보 가져오기
    if (video_ids) {
      const videos_response = await this.getVideos(video_ids);

      return {
        items: videos_response.items,
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
  updateAuth(options: { api_key?: string }) {
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
