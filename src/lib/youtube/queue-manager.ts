/**
 * YouTube API 배치 처리 큐 매니저
 * BullMQ를 사용하여 API 호출을 큐에 저장하고 순차적으로 처리
 */

import { type Job, Queue, QueueEvents, type Worker } from 'bullmq';
import Redis from 'ioredis';
import { env } from '@/env';

// Redis 연결 설정
const connection = new Redis({
  host: env.REDIS_HOST || 'localhost',
  port: Number.parseInt(env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// 작업 유형 정의
export enum JobType {
  SEARCH = 'search',
  VIDEO_DETAILS = 'video_details',
  CHANNEL_DETAILS = 'channel_details',
  PLAYLIST_ITEMS = 'playlist_items',
  VIDEO_STATS = 'video_stats',
}

// 작업 우선순위
export enum JobPriority {
  CRITICAL = 1, // 실시간 사용자 요청
  HIGH = 2, // 중요 업데이트
  NORMAL = 3, // 일반 배치 작업
  LOW = 4, // 백그라운드 작업
}

// 작업 데이터 인터페이스
export interface YouTubeJobData {
  type: JobType;
  params: Record<string, unknown>;
  user_id?: string;
  retry_count?: number;
  priority?: JobPriority;
  metadata?: Record<string, unknown>;
}

// 쿼터 관리자
export class QuotaManager {
  private static instance: QuotaManager;
  private dailyQuota = 10000; // YouTube API 일일 쿼터
  private usedQuota = 0;
  private resetTime: Date;

  private constructor() {
    this.resetTime = this.getNextResetTime();
  }

  static getInstance(): QuotaManager {
    if (!QuotaManager.instance) {
      QuotaManager.instance = new QuotaManager();
    }
    return QuotaManager.instance;
  }

  private getNextResetTime(): Date {
    const now = new Date();
    const reset = new Date(now);
    reset.setUTCHours(7, 0, 0, 0); // UTC 7:00 AM (PST 12:00 AM)
    if (reset <= now) {
      reset.setDate(reset.getDate() + 1);
    }
    return reset;
  }

  async checkQuota(cost: number): Promise<boolean> {
    const now = new Date();
    if (now >= this.resetTime) {
      this.usedQuota = 0;
      this.resetTime = this.getNextResetTime();
    }

    return this.usedQuota + cost <= this.dailyQuota;
  }

  async useQuota(cost: number): Promise<void> {
    this.usedQuota += cost;
    await this.saveQuotaState();
  }

  async getQuotaStatus() {
    return {
      used: this.usedQuota,
      total: this.dailyQuota,
      remaining: this.dailyQuota - this.usedQuota,
      resetTime: this.resetTime,
      percentageUsed: (this.usedQuota / this.dailyQuota) * 100,
    };
  }

  private async saveQuotaState(): Promise<void> {
    await connection.set('youtube:quota:used', this.usedQuota.toString());
    await connection.set('youtube:quota:resetTime', this.resetTime.toISOString());
  }

  async loadQuotaState(): Promise<void> {
    const used = await connection.get('youtube:quota:used');
    const reset_time = await connection.get('youtube:quota:resetTime');

    if (used) {
      this.usedQuota = Number.parseInt(used, 10);
    }
    if (reset_time) {
      this.resetTime = new Date(reset_time);
    }
  }
}

// 큐 매니저 클래스
export class YouTubeQueueManager {
  private static instance: YouTubeQueueManager;
  private queues: Map<JobType, Queue>;
  private workers: Map<JobType, Worker>;
  private queueEvents: QueueEvents;
  private quotaManager: QuotaManager;

  private constructor() {
    this.queues = new Map();
    this.workers = new Map();
    this.quotaManager = QuotaManager.getInstance();

    // 큐 이벤트 리스너 설정
    this.queueEvents = new QueueEvents('youtube-api', { connection });
    this.setupEventListeners();

    // 쿼터 상태 로드
    this.quotaManager.loadQuotaState();
  }

  static getInstance(): YouTubeQueueManager {
    if (!YouTubeQueueManager.instance) {
      YouTubeQueueManager.instance = new YouTubeQueueManager();
    }
    return YouTubeQueueManager.instance;
  }

  // 큐 초기화
  initializeQueue(job_type: JobType): Queue {
    if (!this.queues.has(job_type)) {
      const queue = new Queue(`youtube-${job_type}`, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            age: 3600, // 1시간 후 제거
            count: 100, // 최대 100개 유지
          },
          removeOnFail: {
            age: 24 * 3600, // 24시간 후 제거
          },
        },
      });

      this.queues.set(job_type, queue);
    }

    return this.queues.get(job_type)!;
  }

  // 작업 추가
  async addJob(data: YouTubeJobData): Promise<Job> {
    const queue = this.initializeQueue(data.type);

    // 쿼터 체크
    const quota_cost = this.getQuotaCost(data.type);
    const has_quota = await this.quotaManager.checkQuota(quota_cost);

    if (!has_quota) {
      throw new Error('Daily quota exceeded. Please try again tomorrow.');
    }

    // 작업 추가
    const job = await queue.add(data.type, data, {
      priority: data.priority || JobPriority.NORMAL,
      delay: this.calculateDelay(data.priority),
    });

    console.log(`Job ${job.id} added to queue ${data.type}`);
    return job;
  }

  // 배치 작업 추가
  async addBatchJobs(jobs: YouTubeJobData[]): Promise<Job[]> {
    const results: Job[] = [];

    // 우선순위별로 정렬
    jobs.sort((a, b) => (a.priority || 3) - (b.priority || 3));

    for (const job_data of jobs) {
      try {
        const job = await this.addJob(job_data);
        results.push(job);
      } catch (_error) {}
    }

    return results;
  }

  // 작업 상태 조회
  async getJobStatus(job_id: string, job_type: JobType): Promise<Job | undefined> {
    const queue = this.queues.get(job_type);
    if (!queue) {
      return undefined;
    }

    return queue.getJob(job_id);
  }

  // 큐 상태 조회
  async getQueueStatus(job_type: JobType) {
    const queue = this.queues.get(job_type);
    if (!queue) {
      return null;
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  // 모든 큐 상태 조회
  async getAllQueuesStatus() {
    const statuses: Record<string, unknown> = {};

    for (const job_type of Object.values(JobType)) {
      statuses[job_type] = await this.getQueueStatus(job_type as JobType);
    }

    const quota_status = await this.quotaManager.getQuotaStatus();

    return {
      queues: statuses,
      quota: quota_status,
    };
  }

  // 큐 일시정지
  async pauseQueue(job_type: JobType): Promise<void> {
    const queue = this.queues.get(job_type);
    if (queue) {
      await queue.pause();
      console.log(`Queue ${job_type} paused`);
    }
  }

  // 큐 재개
  async resumeQueue(job_type: JobType): Promise<void> {
    const queue = this.queues.get(job_type);
    if (queue) {
      await queue.resume();
      console.log(`Queue ${job_type} resumed`);
    }
  }

  // 큐 정리
  async cleanQueue(job_type: JobType, grace = 0): Promise<void> {
    const queue = this.queues.get(job_type);
    if (queue) {
      await queue.clean(grace, 1000); // 1000개 제한
      console.log(`Queue ${job_type} cleaned`);
    }
  }

  // 실패한 작업 재시도
  async retryFailedJobs(job_type: JobType): Promise<void> {
    const queue = this.queues.get(job_type);
    if (!queue) {
      return;
    }

    const failed = await queue.getFailed();
    for (const job of failed) {
      await job.retry();
    }

    console.log(`Retried ${failed.length} failed jobs in ${job_type}`);
  }

  // 이벤트 리스너 설정
  private setupEventListeners(): void {
    this.queueEvents.on('completed', async ({ jobId, returnvalue }) => {
      console.log(`Job ${jobId} completed with result:`, returnvalue);
    });

    this.queueEvents.on('failed', async ({ jobId: _jobId, failedReason: _failedReason }) => {});

    this.queueEvents.on('progress', async ({ jobId, data }) => {
      console.log(`Job ${jobId} progress:`, data);
    });
  }

  // 쿼터 비용 계산
  private getQuotaCost(job_type: JobType): number {
    const costs: Record<JobType, number> = {
      [JobType.SEARCH]: 100,
      [JobType.VIDEO_DETAILS]: 1,
      [JobType.CHANNEL_DETAILS]: 1,
      [JobType.PLAYLIST_ITEMS]: 1,
      [JobType.VIDEO_STATS]: 1,
    };

    return costs[job_type] || 1;
  }

  // 지연 시간 계산
  private calculateDelay(priority?: JobPriority): number {
    if (!priority) {
      return 0;
    }

    const delays: Record<JobPriority, number> = {
      [JobPriority.CRITICAL]: 0,
      [JobPriority.HIGH]: 1000,
      [JobPriority.NORMAL]: 5000,
      [JobPriority.LOW]: 10000,
    };

    return delays[priority] || 0;
  }

  // 종료 처리
  async shutdown(): Promise<void> {
    // 모든 워커 종료
    for (const worker of this.workers.values()) {
      await worker.close();
    }

    // 모든 큐 종료
    for (const queue of this.queues.values()) {
      await queue.close();
    }

    // 이벤트 리스너 종료
    await this.queueEvents.close();

    // Redis 연결 종료
    await connection.quit();

    console.log('YouTube Queue Manager shut down gracefully');
  }
}

// 싱글톤 인스턴스 export
export const queueManager = YouTubeQueueManager.getInstance();
export const quotaManager = QuotaManager.getInstance();
