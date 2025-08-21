/**
 * YouTube API 배치 처리 워커
 * 큐에서 작업을 가져와 실제 API 호출을 처리
 */

import { type Job, Worker } from 'bullmq';
import { google, type youtube_v3 } from 'googleapis';
import Redis from 'ioredis';
import { cacheManager } from '../cache';
import { JobType, quotaManager, type YouTubeJobData } from '../queue-manager';

// Redis 연결
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// YouTube API 클라이언트 생성
function createYouTubeClient(api_key: string): youtube_v3.Youtube {
  return google.youtube({
    version: 'v3',
    auth: api_key,
  });
}

// 워커 프로세서 클래스
export class YouTubeBatchProcessor {
  private workers: Map<JobType, Worker> = new Map();
  private youtube: youtube_v3.Youtube | null = null;

  constructor(private api_key?: string) {
    if (api_key) {
      this.youtube = createYouTubeClient(api_key);
    }
  }

  // 워커 시작
  startWorker(jobType: JobType): Worker {
    if (this.workers.has(jobType)) {
      return this.workers.get(jobType)!;
    }

    const worker = new Worker(
      `youtube-${jobType}`,
      async (job: Job<YouTubeJobData>) => {
        return this.processJob(job);
      },
      {
        connection,
        concurrency: this.getConcurrency(jobType),
        limiter: {
          max: 10,
          duration: 1000, // 초당 최대 10개 처리
        },
      }
    );

    // 워커 이벤트 리스너
    worker.on('completed', (job) => {
      console.log(`Worker completed job ${job.id} of type ${jobType}`);
    });

    worker.on('failed', (_job, _err) => {});

    this.workers.set(jobType, worker);
    return worker;
  }

  // 모든 워커 시작
  startAllWorkers(): void {
    for (const jobType of Object.values(JobType)) {
      this.startWorker(jobType as JobType);
    }
    console.log('All YouTube batch processors started');
  }

  // 작업 처리
  private async processJob(job: Job<YouTubeJobData>): Promise<unknown> {
    const { type, params, user_id } = job.data;

    // API 키 확인
    const api_key = this.api_key || (await this.getUserApiKey(user_id));
    if (!api_key) {
      throw new Error('YouTube API key not found');
    }

    const youtube = this.youtube || createYouTubeClient(api_key);

    // 캐시 확인
    const cacheKey = cacheManager.generateKey(type, params);
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for job ${job.id}`);
      return cached;
    }

    // 쿼터 확인 및 사용
    const quotaCost = this.getQuotaCost(type);
    const hasQuota = await quotaManager.checkQuota(quotaCost);
    if (!hasQuota) {
      throw new Error('Daily quota exceeded');
    }
    // 진행 상황 업데이트
    await job.updateProgress(10);

    // API 호출 처리
    let result: unknown;
    switch (type) {
      case JobType.SEARCH:
        result = await this.processSearch(youtube, params);
        break;
      case JobType.VIDEO_DETAILS:
        result = await this.processVideoDetails(youtube, params);
        break;
      case JobType.CHANNEL_DETAILS:
        result = await this.processChannelDetails(youtube, params);
        break;
      case JobType.PLAYLIST_ITEMS:
        result = await this.processPlaylistItems(youtube, params);
        break;
      case JobType.VIDEO_STATS:
        result = await this.processVideoStats(youtube, params);
        break;
      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    // 쿼터 사용 기록
    await quotaManager.useQuota(quotaCost);

    // 결과 캐싱
    await cacheManager.set(cacheKey, result, this.getCacheTTL(type));

    // 진행 상황 완료
    await job.updateProgress(100);

    return result;
  }

  // 검색 처리
  private async processSearch(
    youtube: youtube_v3.Youtube,
    params: Record<string, unknown>
  ): Promise<youtube_v3.Schema$SearchListResponse> {
    const searchParams: youtube_v3.Params$Resource$Search$List = {
      part: ['snippet'],
      q: (params.query as string) || ' ',
      type: (params.type as string[]) || ['video'],
      maxResults: (params.maxResults as number) || 50,
      order: (params.order as string) || 'relevance',
      regionCode: (params.regionCode as string) || 'KR',
      videoDuration: params.videoDuration as string | undefined,
      publishedAfter: params.publishedAfter as string | undefined,
      publishedBefore: params.publishedBefore as string | undefined,
    };
    const response = await youtube.search.list(searchParams);

    return response.data;
  }

  // 비디오 상세 정보 처리
  private async processVideoDetails(
    youtube: youtube_v3.Youtube,
    params: Record<string, unknown>
  ): Promise<{ items: youtube_v3.Schema$Video[] }> {
    const videoIds = Array.isArray(params.id) ? params.id : [params.id];

    // 배치로 처리 (최대 50개)
    const chunks = this.chunkArray(videoIds, 50);
    const results = [];

    for (const chunk of chunks) {
      const videoParams: youtube_v3.Params$Resource$Videos$List = {
        part: ['snippet', 'statistics', 'contentDetails'],
        id: chunk,
      };
      const response = await youtube.videos.list(videoParams);
      results.push(...(response.data.items || []));
    }

    return { items: results };
  }

  // 채널 상세 정보 처리
  private async processChannelDetails(
    youtube: youtube_v3.Youtube,
    params: Record<string, unknown>
  ): Promise<{ items: youtube_v3.Schema$Channel[] }> {
    const channelIds = Array.isArray(params.id) ? params.id : [params.id];

    const chunks = this.chunkArray(channelIds, 50);
    const results = [];

    for (const chunk of chunks) {
      const channelParams: youtube_v3.Params$Resource$Channels$List = {
        part: ['snippet', 'statistics', 'contentDetails'],
        id: chunk,
      };
      const response = await youtube.channels.list(channelParams);
      results.push(...(response.data.items || []));
    }

    return { items: results };
  }

  // 재생목록 아이템 처리
  private async processPlaylistItems(
    youtube: youtube_v3.Youtube,
    params: Record<string, unknown>
  ): Promise<youtube_v3.Schema$PlaylistItemListResponse> {
    const playlistParams: youtube_v3.Params$Resource$Playlistitems$List = {
      part: ['snippet', 'contentDetails'],
      playlistId: params.playlist_id as string,
      maxResults: (params.maxResults as number) || 50,
      pageToken: params.pageToken as string | undefined,
    };
    const response = await youtube.playlistItems.list(playlistParams);

    return response.data;
  }

  // 비디오 통계 처리
  private async processVideoStats(
    youtube: youtube_v3.Youtube,
    params: Record<string, unknown>
  ): Promise<youtube_v3.Schema$VideoListResponse> {
    const videoIds = Array.isArray(params.id) ? params.id : [params.id];

    const statsParams: youtube_v3.Params$Resource$Videos$List = {
      part: ['statistics'],
      id: videoIds,
    };
    const response = await youtube.videos.list(statsParams);

    return response.data;
  }

  // 사용자 API 키 가져오기
  private async getUserApiKey(user_id?: string): Promise<string | null> {
    if (!user_id) {
      return null;
    }

    // Supabase에서 암호화된 API 키 가져오기
    // TODO: 실제 구현 필요
    return process.env.YOUTUBE_API_KEY || null;
  }

  // 배열 청크 분할
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // 동시 처리 수 설정
  private getConcurrency(jobType: JobType): number {
    const concurrency: Record<JobType, number> = {
      [JobType.SEARCH]: 2,
      [JobType.VIDEO_DETAILS]: 3,
      [JobType.CHANNEL_DETAILS]: 3,
      [JobType.PLAYLIST_ITEMS]: 2,
      [JobType.VIDEO_STATS]: 5,
    };

    return concurrency[jobType] || 1;
  }

  // 쿼터 비용 가져오기
  private getQuotaCost(jobType: JobType): number {
    const costs: Record<JobType, number> = {
      [JobType.SEARCH]: 100,
      [JobType.VIDEO_DETAILS]: 1,
      [JobType.CHANNEL_DETAILS]: 1,
      [JobType.PLAYLIST_ITEMS]: 1,
      [JobType.VIDEO_STATS]: 1,
    };

    return costs[jobType] || 1;
  }

  // 캐시 TTL 설정
  private getCacheTTL(jobType: JobType): number {
    const ttls: Record<JobType, number> = {
      [JobType.SEARCH]: 5 * 60 * 1000, // 5분
      [JobType.VIDEO_DETAILS]: 10 * 60 * 1000, // 10분
      [JobType.CHANNEL_DETAILS]: 60 * 60 * 1000, // 1시간
      [JobType.PLAYLIST_ITEMS]: 10 * 60 * 1000, // 10분
      [JobType.VIDEO_STATS]: 5 * 60 * 1000, // 5분
    };

    return ttls[jobType] || 5 * 60 * 1000;
  }

  // 모든 워커 정지
  async stopAllWorkers(): Promise<void> {
    for (const worker of this.workers.values()) {
      await worker.close();
    }

    await connection.quit();
    console.log('All YouTube batch processors stopped');
  }
}

// 싱글톤 인스턴스
let processorInstance: YouTubeBatchProcessor | null = null;

export function initializeBatchProcessor(api_key?: string): YouTubeBatchProcessor {
  if (!processorInstance) {
    processorInstance = new YouTubeBatchProcessor(api_key);
  }
  return processorInstance;
}

export function getBatchProcessor(): YouTubeBatchProcessor | null {
  return processorInstance;
}
