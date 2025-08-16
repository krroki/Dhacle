/**
 * API Route: /api/youtube/metrics
 * Purpose: Calculate and retrieve YouTube video metrics
 * Phase 3: Core Features Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { calculateMetrics, calculateChannelMetrics } from '@/lib/youtube/metrics';
import { YouTubeVideo } from '@/types/youtube-lens';

export const runtime = 'nodejs';

/**
 * GET /api/youtube/metrics
 * Get metrics for videos or channels
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'video'; // 'video' or 'channel'
    const id = searchParams.get('id');
    const period = searchParams.get('period') || '7d';

    if (!id) {
      return NextResponse.json(
        { error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    if (type === 'video') {
      // Get video metrics
      const metrics = await getVideoMetrics(id, period);
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'video',
          id,
          metrics,
          period,
          timestamp: new Date().toISOString()
        }
      });

    } else if (type === 'channel') {
      // Get channel metrics
      const metrics = await getChannelMetrics(id, period);
      
      return NextResponse.json({
        success: true,
        data: {
          type: 'channel',
          id,
          metrics,
          period,
          timestamp: new Date().toISOString()
        }
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid type. Use "video" or "channel"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching metrics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube/metrics/batch
 * Calculate metrics for multiple videos
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { videos, options = {} } = body;

    if (!videos || !Array.isArray(videos)) {
      return NextResponse.json(
        { error: 'Videos array is required' },
        { status: 400 }
      );
    }

    // Calculate metrics for all videos
    const videosWithMetrics = calculateMetrics(videos, options);

    // Group by performance tiers
    const tiers = categorizeByPerformance(videosWithMetrics);

    // Calculate aggregate statistics
    const aggregateStats = calculateAggregateStats(videosWithMetrics);

    // Save metrics snapshot if requested
    if (body.saveSnapshot) {
      await saveMetricsSnapshot(session.user.id, videosWithMetrics);
    }

    return NextResponse.json({
      success: true,
      data: {
        videos: videosWithMetrics,
        tiers,
        aggregateStats,
        totalVideos: videosWithMetrics.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error calculating batch metrics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to calculate batch metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Get video metrics from database
 */
async function getVideoMetrics(videoId: string, period: string) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '1d':
      startDate.setDate(startDate.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }

  // Fetch video stats from database
  const { data: stats, error } = await supabase
    .from('video_stats')
    .select('*')
    .eq('video_id', videoId)
    .gte('snapshot_at', startDate.toISOString())
    .lte('snapshot_at', endDate.toISOString())
    .order('snapshot_at', { ascending: true });

  if (error) throw error;

  if (!stats || stats.length === 0) {
    return {
      vph: 0,
      engagementRate: 0,
      viralScore: 0,
      growthRate: 0,
      averageViews: 0,
      peakViews: 0
    };
  }

  // Calculate metrics from stats
  const latestStat = stats[stats.length - 1];
  const firstStat = stats[0];
  
  // Calculate growth rate
  const viewGrowth = latestStat.view_count - firstStat.view_count;
  const timeDiff = new Date(latestStat.snapshot_at).getTime() - new Date(firstStat.snapshot_at).getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  const growthRate = hoursDiff > 0 ? (viewGrowth / hoursDiff) : 0;

  // Calculate average and peak views
  const allViews = stats.map(s => s.view_count);
  const averageViews = allViews.reduce((a, b) => a + b, 0) / allViews.length;
  const peakViews = Math.max(...allViews);

  // Calculate VPH (Views Per Hour)
  const vph = hoursDiff > 0 ? viewGrowth / hoursDiff : 0;

  // Calculate engagement rate
  const engagementRate = latestStat.view_count > 0
    ? ((latestStat.like_count + latestStat.comment_count) / latestStat.view_count) * 100
    : 0;

  // Calculate viral score (custom formula)
  const viralScore = calculateViralScore({
    views: latestStat.view_count,
    likes: latestStat.like_count,
    comments: latestStat.comment_count,
    vph,
    engagementRate
  });

  return {
    vph,
    engagementRate,
    viralScore,
    growthRate,
    averageViews,
    peakViews,
    totalViews: latestStat.view_count,
    totalLikes: latestStat.like_count,
    totalComments: latestStat.comment_count,
    dataPoints: stats.length
  };
}

/**
 * Helper: Get channel metrics
 */
async function getChannelMetrics(channelId: string, period: string) {
  const supabase = createRouteHandlerClient({ cookies });
  
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
    .eq('channel_id', channelId)
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  if (!videos || videos.length === 0) {
    return {
      totalVideos: 0,
      totalViews: 0,
      averageViews: 0,
      totalSubscribers: 0,
      engagementRate: 0
    };
  }

  // Get channel info
  const { data: channel } = await supabase
    .from('channels')
    .select('*')
    .eq('channel_id', channelId)
    .single();

  // Calculate basic metrics
  const totalVideos = videos.length;
  const totalViews = videos.reduce((sum, v) => {
    const stats = Array.isArray(v.video_stats) ? v.video_stats[0] : v.video_stats;
    return sum + (stats?.view_count || 0);
  }, 0);
  const averageViews = totalVideos > 0 ? totalViews / totalVideos : 0;

  return {
    totalVideos,
    totalViews,
    averageViews,
    totalSubscribers: channel?.subscriber_count || 0,
    engagementRate: 0 // Would need video_stats to calculate
  };
}

/**
 * Helper: Calculate viral score
 */
function calculateViralScore(metrics: Record<string, number>): number {
  const {
    views = 0,
    likes = 0,
    comments = 0,
    vph = 0,
    engagementRate = 0
  } = metrics;

  // Weighted formula for viral score
  const viewScore = Math.log10(views + 1) * 20;
  const engagementScore = engagementRate * 10;
  const vphScore = Math.log10(vph + 1) * 15;
  const interactionScore = Math.log10(likes + comments + 1) * 5;

  return Math.min(100, viewScore + engagementScore + vphScore + interactionScore);
}

/**
 * Helper: Categorize videos by performance
 */
function categorizeByPerformance(videos: Array<YouTubeVideo & { metrics?: { viralScore?: number } }>) {
  const tiers = {
    viral: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    trending: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    growing: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    steady: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>,
    low: [] as Array<YouTubeVideo & { metrics?: { viralScore?: number } }>
  };

  videos.forEach(video => {
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
function calculateAggregateStats(videos: Array<YouTubeVideo & { 
  metrics?: { 
    viralScore?: number;
    vph?: number;
    engagementRate?: number;
  }
}>) {
  if (videos.length === 0) {
    return {
      averageViralScore: 0,
      averageVph: 0,
      averageEngagement: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0
    };
  }

  const totalViews = videos.reduce((sum, v) => sum + (v.statistics?.viewCount || 0), 0);
  const totalLikes = videos.reduce((sum, v) => sum + (v.statistics?.likeCount || 0), 0);
  const totalComments = videos.reduce((sum, v) => sum + (v.statistics?.commentCount || 0), 0);

  const averageViralScore = videos.reduce((sum, v) => sum + (v.metrics?.viralScore || 0), 0) / videos.length;
  const averageVph = videos.reduce((sum, v) => sum + (v.metrics?.vph || 0), 0) / videos.length;
  const averageEngagement = videos.reduce((sum, v) => sum + (v.metrics?.engagementRate || 0), 0) / videos.length;

  return {
    averageViralScore,
    averageVph,
    averageEngagement,
    totalViews,
    totalLikes,
    totalComments,
    videoCount: videos.length
  };
}

/**
 * Helper: Save metrics snapshot
 */
async function saveMetricsSnapshot(userId: string, videos: Array<YouTubeVideo & { 
  metrics?: { 
    vph?: number;
    engagementRate?: number;
    viralScore?: number;
  }
}>) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const snapshots = videos.map(video => ({
      video_id: video.id,
      view_count: video.statistics.viewCount,
      like_count: video.statistics.likeCount,
      comment_count: video.statistics.commentCount,
      vph: video.metrics?.vph || 0,
      engagement_rate: video.metrics?.engagementRate || 0,
      viral_score: video.metrics?.viralScore || 0,
      snapshot_at: new Date().toISOString()
    }));

    await supabase.from('video_stats').insert(snapshots);
  } catch (error) {
    console.error('Failed to save metrics snapshot:', error);
    // Non-critical error, don't throw
  }
}