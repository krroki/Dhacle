/**
 * YouTube 배치 처리 API 엔드포인트
 * 큐 관리, 쿼터 확인, 작업 상태 조회
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/youtube/cache';
import {
  JobPriority,
  type JobType,
  queueManager,
  quotaManager,
  type YouTubeJobData,
} from '@/lib/youtube/queue-manager';
// GET: 큐 및 쿼터 상태 조회
export async function GET(request: NextRequest) {
  try {
    // 세션 검사
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status': {
        // 전체 큐 상태 조회
        const status = await queueManager.getAllQueuesStatus();
        return NextResponse.json(status);
      }

      case 'quota': {
        // 쿼터 상태 조회
        const quota = await quotaManager.getQuotaStatus();
        return NextResponse.json(quota);
      }

      case 'cache-stats': {
        // 캐시 통계 조회
        const stats = cacheManager.getStats();
        const size = cacheManager.getSize();
        return NextResponse.json({ stats, size });
      }

      case 'job': {
        // 특정 작업 상태 조회
        const jobId = searchParams.get('jobId');
        const jobType = searchParams.get('jobType') as JobType;

        if (!jobId || !jobType) {
          return NextResponse.json({ error: 'jobId and jobType are required' }, { status: 400 });
        }

        const job = await queueManager.getJobStatus(jobId, jobType);
        if (!job) {
          return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        return NextResponse.json({
          id: job.id,
          name: job.name,
          data: job.data,
          progress: job.progress,
          attemptsMade: job.attemptsMade,
          finishedOn: job.finishedOn,
          processedOn: job.processedOn,
          failedReason: job.failedReason,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 작업 추가
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { type, params, priority, batch } = body;

    if (!type || !params) {
      return NextResponse.json({ error: 'type and params are required' }, { status: 400 });
    }

    // 배치 작업 처리
    if (batch && Array.isArray(batch)) {
      const jobs: YouTubeJobData[] = batch.map((item) => ({
        type: item.type || type,
        params: item.params,
        userId: user.id,
        priority: item.priority || priority || JobPriority.NORMAL,
        metadata: item.metadata,
      }));

      const results = await queueManager.addBatchJobs(jobs);

      return NextResponse.json({
        success: true,
        jobs: results.map((job) => ({
          id: job.id,
          type: job.name,
          status: 'queued',
        })),
      });
    }

    // 단일 작업 처리
    const jobData: YouTubeJobData = {
      type: type as JobType,
      params,
      userId: user.id,
      priority: priority || JobPriority.NORMAL,
    };

    const job = await queueManager.addJob(jobData);

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        type: job.name,
        status: 'queued',
      },
    });
  } catch (error: unknown) {
    // 쿼터 초과 에러 처리
    if (error instanceof Error && error.message?.includes('quota exceeded')) {
      return NextResponse.json(
        { error: 'Daily quota exceeded. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: 큐 제어 (일시정지, 재개, 재시도)
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action, jobType } = body;

    if (!action || !jobType) {
      return NextResponse.json({ error: 'action and jobType are required' }, { status: 400 });
    }

    switch (action) {
      case 'pause':
        await queueManager.pauseQueue(jobType);
        return NextResponse.json({ success: true, message: 'Queue paused' });

      case 'resume':
        await queueManager.resumeQueue(jobType);
        return NextResponse.json({ success: true, message: 'Queue resumed' });

      case 'retry':
        await queueManager.retryFailedJobs(jobType);
        return NextResponse.json({ success: true, message: 'Failed jobs retried' });

      case 'clean':
        await queueManager.cleanQueue(jobType);
        return NextResponse.json({ success: true, message: 'Queue cleaned' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: 캐시 초기화
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const pattern = searchParams.get('pattern');

    switch (action) {
      case 'clear-cache':
        await cacheManager.clear();
        return NextResponse.json({ success: true, message: 'Cache cleared' });

      case 'delete-pattern':
        if (!pattern) {
          return NextResponse.json({ error: 'pattern is required' }, { status: 400 });
        }
        await cacheManager.deletePattern(pattern);
        return NextResponse.json({
          success: true,
          message: `Cache pattern '${pattern}' deleted`,
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
