/**
 * API Route: /api/youtube/metrics
 * Purpose: Calculate and retrieve YouTube video metrics
 * Phase 3: Core Features Implementation
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { calculateMetrics } from '@/lib/youtube/metrics';
import type { YouTubeVideo } from '@/types';
import { env } from '@/env';

export const runtime = 'nodejs';

/**
 * GET /api/youtube/metrics
 * Get metrics for videos or channels
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to YouTube metrics API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const search_params = request.nextUrl.searchParams;
    const type = search_params.get('type') || 'video'; // 'video' or 'channel'
    const id = search_params.get('id');
    const period = search_params.get('period') || '7d';

    // If no id is provided, return user's overall metrics
    if (!id) {
      // Get user's recent videos and calculate aggregate metrics
      const supabase = await createSupabaseRouteHandlerClient();
      
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!videos || videos.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            type: 'overview',
            metrics: {
              totalVideos: 0,
              totalViews: 0,
              avgViews: 0,
              avgEngagement: 0,
              vph: 0,
              viralScore: 0,
              trends: [],
              entities: [],
            },
            period,
            timestamp: new Date().toISOString(),
          },
        });
      }

      // Calculate aggregate metrics
      const aggregateMetrics = {
        totalVideos: videos.length,
        totalViews: videos.reduce((sum, v) => sum + (v.view_count || 0), 0),
        avgViews: videos.length > 0 ? videos.reduce((sum, v) => sum + (v.view_count || 0), 0) / videos.length : 0,
        avgEngagement: 0,
        vph: 0,
        viralScore: 0,
        trends: [],
        entities: [],
      };

      return NextResponse.json({
        success: true,
        data: {
          type: 'overview',
          metrics: aggregateMetrics,
          videos: videos.slice(0, 10), // Return top 10 videos
          period,
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (type === 'video') {
      // Get video metrics
      const metrics = await get_video_metrics(id, period);

      return NextResponse.json({
        success: true,
        data: {
          type: 'video',
          id,
          metrics,
          period,
          timestamp: new Date().toISOString(),
        },
      });
    }
    if (type === 'channel') {
      // Get channel metrics
      const metrics = await get_channel_metrics(id, period);

      return NextResponse.json({
        success: true,
        data: {
          type: 'channel',
          id,
          metrics,
          period,
          timestamp: new Date().toISOString(),
        },
      });
    }
    return NextResponse.json({ error: 'Invalid type. Use "video" or "channel"' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        details: env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube/metrics/batch
 * Calculate metrics for multiple videos
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to YouTube metrics batch API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { videos, options = {} } = body;

    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json({ error: 'Videos array is required' }, { status: 400 });
    }

    // Calculate metrics for all videos
    const videos_with_metrics = calculateMetrics(videos, options);

    // Group by performance tiers
    const tiers = categorize_by_performance(videos_with_metrics);

    // Calculate aggregate statistics
    const aggregate_stats = calculate_aggregate_stats(videos_with_metrics);

    // Save metrics snapshot if requested
    if (body.saveSnapshot) {
      await save_metrics_snapshot(user.id, videos_with_metrics);
    }

    return NextResponse.json({
      success: true,
      data: {
        videos: videos_with_metrics,
        tiers,
        aggregateStats: aggregate_stats,
        totalVideos: videos_with_metrics.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to calculate batch metrics',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        details: env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get video metrics from database
 */
async function get_video_metrics(
  video_id: string,
  period: string
): Promise<{
  vph: number;
  engagementRate: number;
  viralScore: number;
  growthRate: number;
  averageViews: number;
  peakViews: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  dataPoints: number;
}> {
  const supabase = await createSupabaseRouteHandlerClient();

  // Calculate date range
  const end_date = new Date();
  const start_date = new Date();

  switch (period) {
    case '1d':
      start_date.setDate(start_date.getDate() - 1);
      break;
    case '7d':
      start_date.setDate(start_date.getDate() - 7);
      break;
    case '30d':
      start_date.setDate(start_date.getDate() - 30);
      break;
    default:
      start_date.setDate(start_date.getDate() - 7);
  }

  // Fetch video stats from database
  const { data: stats, error } = await supabase
    .from('video_stats')
    .select('*')
    .eq('video_id', video_id)
    .gte('snapshot_at', start_date.toISOString())
    .lte('snapshot_at', end_date.toISOString())
    .order('snapshot_at', { ascending: true });

  if (error) {
    throw error;
  }

  if (!stats || stats.length === 0) {
    return {
      vph: 0,
      engagementRate: 0,
      viralScore: 0,
      growthRate: 0,
      averageViews: 0,
      peakViews: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      dataPoints: 0,
    };
  }

  // Calculate metrics from stats
  const latest_stat = stats[stats.length - 1];
  const first_stat = stats[0];

  // Calculate growth rate
  const view_growth = (latest_stat?.view_count || 0) - (first_stat?.view_count || 0);
  const time_diff =
    new Date(latest_stat?.date || latest_stat?.created_at || 0).getTime() - new Date(first_stat?.date || first_stat?.created_at || 0).getTime();
  const hours_diff = time_diff / (1000 * 60 * 60);
  const growth_rate = hours_diff > 0 ? view_growth / hours_diff : 0;

  // Calculate average and peak views
  interface VideoStat {
    view_count?: number | null;
    [key: string]: unknown;
  }
  const all_views = stats.map((s: VideoStat) => s.view_count ?? 0);
  const average_views = all_views.reduce((a, b) => a + b, 0) / all_views.length;
  const peak_views = Math.max(...all_views);

  // Calculate VPH (Views Per Hour)
  const vph = hours_diff > 0 ? view_growth / hours_diff : 0;

  // Calculate engagement rate
  const engagement_rate =
    (latest_stat?.view_count || 0) > 0
      ? (((latest_stat?.like_count || 0) + (latest_stat?.comment_count || 0)) / (latest_stat?.view_count || 1)) * 100
      : 0;

  // Calculate viral score (custom formula)
  const viral_score = calculate_viral_score({
    views: latest_stat?.view_count || 0,
    likes: latest_stat?.like_count || 0,
    comments: latest_stat?.comment_count || 0,
    vph,
    engagementRate: engagement_rate,
  });

  return {
    vph,
    engagementRate: engagement_rate,
    viralScore: viral_score,
    growthRate: growth_rate,
    averageViews: average_views,
    peakViews: peak_views,
    totalViews: latest_stat?.view_count || 0,
    totalLikes: latest_stat?.like_count || 0,
    totalComments: latest_stat?.comment_count || 0,
    dataPoints: stats.length,
  };
}

/**
 * Helper: Get channel metrics
 */
async function get_channel_metrics(
  channel_id: string,
  _period: string
): Promise<{
  totalVideos: number;
  totalViews: number;
  avgViews: number;
  totalLikes: number;
  avgEngagement: number;
  uploadFrequency: number;
  subscriberGrowth: number;
  performanceScore: number;
}> {
  const supabase = await createSupabaseRouteHandlerClient();

  // Get channel videos with stats
  const { data: videos, error } = await supabase
    .from('videos')
    .select(`
      *,
      video_stats (
        view_count,
        like_count,
        comment_count
      )
    `)
    .eq('channel_id', channel_id)
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  if (!videos || videos.length === 0) {
    return {
      totalVideos: 0,
      totalViews: 0,
      avgViews: 0,
      totalLikes: 0,
      avgEngagement: 0,
      uploadFrequency: 0,
      subscriberGrowth: 0,
      performanceScore: 0,
    };
  }

  // Get channel info
  const { data: _channel } = await supabase
    .from('channels')
    .select('*')
    .eq('channel_id', channel_id)
    .single();

  // Calculate basic metrics
  const total_videos = videos.length;
  const total_views = videos.reduce((sum, v) => {
    const stats = Array.isArray(v.video_stats) ? v.video_stats[0] : v.video_stats;
    return sum + (stats?.view_count || 0);
  }, 0);
  const average_views = total_videos > 0 ? total_views / total_videos : 0;

  return {
    totalVideos: total_videos,
    totalViews: total_views,
    avgViews: average_views,
    totalLikes: 0, // Would need video_stats to calculate
    avgEngagement: 0, // Would need video_stats to calculate
    uploadFrequency: 0, // Would need to calculate from video dates
    subscriberGrowth: 0, // Would need historical data
    performanceScore: 0, // Would need to calculate from metrics
  };
}

/**
 * Helper: Calculate viral score
 */
function calculate_viral_score(metrics: Record<string, number>): number {
  const { views = 0, likes = 0, comments = 0, vph = 0, engagementRate = 0 } = metrics;

  // Weighted formula for viral score
  const view_score = Math.log10(views + 1) * 20;
  const engagement_score = engagementRate * 10;
  const vph_score = Math.log10(vph + 1) * 15;
  const interaction_score = Math.log10(likes + comments + 1) * 5;

  return Math.min(100, view_score + engagement_score + vph_score + interaction_score);
}

/**
 * Helper: Categorize videos by performance
 */
function categorize_by_performance(
  videos: Array<YouTubeVideo & { metrics?: { viralScore?: number } }>
) {
  const tiers = {
    viral: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    trending: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    growing: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    steady: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    low: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
  };

  videos.forEach((video) => {
    const score = video.metrics?.viralScore || 0;

    if (score >= 80) {
      tiers.viral.push(video);
    } else if (score >= 60) {
      tiers.trending.push(video);
    } else if (score >= 40) {
      tiers.growing.push(video);
    } else if (score >= 20) {
      tiers.steady.push(video);
    } else {
      tiers.low.push(video);
    }
  });

  return tiers;
}

/**
 * Helper: Calculate aggregate statistics
 */
function calculate_aggregate_stats(
  videos: Array<
    YouTubeVideo & {
      metrics?: {
        viralScore?: number;
        vph?: number;
        engagementRate?: number;
      };
    }
  >
) {
  if (videos.length === 0) {
    return {
      averageViralScore: 0,
      averageVph: 0,
      averageEngagement: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };
  }

  const total_views = videos.reduce((sum, v) => sum + Number(v.view_count || 0), 0);
  const total_likes = videos.reduce((sum, v) => sum + Number(v.like_count || 0), 0);
  const total_comments = videos.reduce(
    (sum, v) => sum + Number(v.comment_count || 0),
    0
  );

  const average_viral_score =
    videos.reduce((sum, v) => sum + (v.metrics?.viralScore || 0), 0) / videos.length;
  const average_vph = videos.reduce((sum, v) => sum + (v.metrics?.vph || 0), 0) / videos.length;
  const average_engagement =
    videos.reduce((sum, v) => sum + (v.metrics?.engagementRate || 0), 0) / videos.length;

  return {
    averageViralScore: average_viral_score,
    averageVph: average_vph,
    averageEngagement: average_engagement,
    totalViews: total_views,
    totalLikes: total_likes,
    totalComments: total_comments,
    videoCount: videos.length,
  };
}

/**
 * Helper: Save metrics snapshot
 */
async function save_metrics_snapshot(
  _userId: string,
  videos: Array<
    YouTubeVideo & {
      metrics?: {
        vph?: number;
        engagementRate?: number;
        viralScore?: number;
      };
    }
  >
): Promise<void> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    const snapshots = videos.map((video) => ({
      video_id: video.id,
      view_count: Number(video.view_count) || 0,
      like_count: Number(video.like_count) || 0,
      comment_count: Number(video.comment_count) || 0,
      engagement_rate: Number(video.metrics?.engagementRate) || 0,
      viral_score: Number(video.metrics?.viralScore) || 0,
      date: new Date().toISOString(),
    }));

    await supabase.from('video_stats').insert(snapshots);
  } catch (error) {
    logger.error('API error in route:', error);
    // Non-critical error, don't throw
  }
}
