/**
 * YouTube Lens - Advanced Analytics API
 * Phase 4: API Endpoint
 *
 * Provides endpoints for outlier detection, NLP analysis, trend analysis, and predictions
 */

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { mapOutlierDetectionResult } from '@/lib/utils/type-mappers';
import { analyzeTrends, extractEntities, generateNLPReport } from '@/lib/youtube/analysis/nlp';
import { detectOutliers, generateOutlierReport } from '@/lib/youtube/analysis/outlier';
import {
  batchPredict,
  generatePredictionReport,
  predictVideoPerformance,
} from '@/lib/youtube/analysis/predictor';
import { generateTrendReport } from '@/lib/youtube/analysis/trends';
import type { BatchAnalysisResult, YouTubeLensVideo } from '@/types';

// Type for video stats from database (without extended VideoStats fields)
type DatabaseVideoStats = {
  id: string;
  video_id: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  date: string;
  engagement_rate: number | null;
  viral_score: number | null;
  view_delta: number | null;
  like_delta: number | null;
  comment_delta: number | null;
  views_per_hour: number | null;
  created_at: string | null;
};

/**
 * POST /api/youtube/analysis
 *
 * Request body:
 * {
 *   type: 'outlier' | 'nlp' | 'trend' | 'prediction' | 'batch';
 *   videoIds?: string[];
 *   timeWindowDays?: number;
 *   config?: Partial<AnalyticsConfig>;
 * }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();
    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { type, videoIds = [], timeWindowDays = 7, config = {} } = body;

    // Validate request
    if (!type) {
      return NextResponse.json({ error: 'Analysis type is required' }, { status: 400 });
    }

    const start_time = Date.now();

    // Fetch videos and stats
    let videos_query = supabase.from('videos').select('*');

    if (videoIds.length > 0) {
      videos_query = videos_query.in('id', videoIds);
    } else {
      // Default to recent videos
      const window_start = new Date();
      window_start.setDate(window_start.getDate() - timeWindowDays);
      videos_query = videos_query.gte('published_at', window_start.toISOString());
    }

    const { data: dbVideos, error: videos_error } = await videos_query.limit(100);

    if (videos_error) {
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    if (!dbVideos || dbVideos.length === 0) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    // Convert database records to YouTubeLensVideo type
    const videos: YouTubeLensVideo[] = dbVideos.map((v) => ({
      id: v.id,
      video_id: v.id,
      title: v.title,
      description: v.description,
      channel_id: v.channel_id,
      published_at: v.published_at || v.created_at || new Date().toISOString(),
      durationSeconds: v.duration ? Number(v.duration) : null,
      isShort: v.duration ? Number(v.duration) <= 60 : false,
      thumbnails: v.thumbnail_url ? { default: { url: v.thumbnail_url, width: 120, height: 90 } } : null,
      tags: v.tags || [],
      category_id: v.category_id,
      languageCode: v.default_language || null,
      regionCode: null,
      firstSeenAt: v.created_at || new Date().toISOString(),
      lastUpdatedAt: v.updated_at || v.created_at || new Date().toISOString(),
      created_at: v.created_at || new Date().toISOString(),
      deleted_at: null
    }));

    // Fetch stats for videos
    const fetched_video_ids = videos.map((v) => v.id);
    const { data: stats, error: stats_error } = await supabase
      .from('video_stats')
      .select('*')
      .in('video_id', fetched_video_ids)
      .order('snapshot_at', { ascending: false });

    if (stats_error) {
      return NextResponse.json({ error: 'Failed to fetch video statistics' }, { status: 500 });
    }

    // Group stats by video
    const stats_by_video = new Map<string, DatabaseVideoStats[]>();
    stats?.forEach((stat) => {
      const video_stats = stats_by_video.get(stat.video_id) || [];
      video_stats.push(stat as DatabaseVideoStats);
      stats_by_video.set(stat.video_id, video_stats);
    });

    // Add stats to videos with proper type
    const videos_with_stats = videos.map((video) => ({
      ...video,
      stats: stats_by_video.get(video.id) || [],
    })) as Array<YouTubeLensVideo & { stats: DatabaseVideoStats[] }>;

    let result: Record<string, unknown> = {};

    switch (type) {
      case 'outlier': {
        // Outlier detection - cast to bypass VideoStats type mismatch
        const outlier_results = await detectOutliers(videos_with_stats as Parameters<typeof detectOutliers>[0], config);
        const outlier_report = generateOutlierReport(outlier_results);

        result = {
          type: 'outlier',
          results: outlier_results,
          report: outlier_report,
          config: config,
        };
        break;
      }

      case 'nlp': {
        // NLP Entity extraction
        const entity_extractions = await Promise.all(
          videos.map((video) => extractEntities(video))
        );

        const trends = await analyzeTrends(videos, timeWindowDays);
        const nlp_report = generateNLPReport(entity_extractions, trends);

        result = {
          type: 'nlp',
          entities: entity_extractions,
          trends: trends,
          report: nlp_report,
        };
        break;
      }

      case 'trend': {
        // Trend analysis
        const trend_report = generateTrendReport(videos_with_stats as Parameters<typeof generateTrendReport>[0], timeWindowDays);

        result = {
          type: 'trend',
          report: trend_report,
          timeWindowDays: timeWindowDays,
        };
        break;
      }

      case 'prediction': {
        // Performance prediction
        const predictions = await batchPredict(
          videos_with_stats.map((v) => ({
            video: v,
            stats: v.stats || [],
          })) as unknown as Parameters<typeof batchPredict>[0],
          30 // 30 days horizon
        );

        const prediction_report = generatePredictionReport(predictions);

        result = {
          type: 'prediction',
          predictions: predictions,
          report: prediction_report,
        };
        break;
      }

      case 'batch': {
        // Batch analysis (all types)
        const [batch_outliers, batch_entities, batch_trends, batch_predictions] = await Promise.all(
          [
            detectOutliers(videos_with_stats as Parameters<typeof detectOutliers>[0], config),
            Promise.all(videos.map((v) => extractEntities(v))),
            analyzeTrends(videos, timeWindowDays),
            batchPredict(
              videos_with_stats.map((v) => ({
                video: v,
                stats: v.stats || [],
              })) as unknown as Parameters<typeof batchPredict>[0],
              30
            ),
          ]
        );

        const batch_result: BatchAnalysisResult = {
          outliers: batch_outliers.map(mapOutlierDetectionResult).filter((o) => o.isOutlier),
          trends: batch_trends,
          predictions: batch_predictions,
          processingTimeMs: Date.now() - start_time,
          totalVideosAnalyzed: videos.length,
          timestamp: new Date().toISOString(),
        };

        result = {
          type: 'batch',
          result: batch_result,
          reports: {
            outlier: generateOutlierReport(batch_outliers),
            nlp: generateNLPReport(batch_entities, batch_trends),
            trend: generateTrendReport(videos_with_stats as Parameters<typeof generateTrendReport>[0], timeWindowDays),
            prediction: generatePredictionReport(batch_predictions),
          },
        };
        break;
      }

      default:
        return NextResponse.json({ error: `Invalid analysis type: ${type}` }, { status: 400 });
    }

    // Log analytics usage - analyticsLogs table not available yet
    // TODO: Create analyticsLogs table or use alternative logging
    // await supabase.from('analyticsLogs').insert({
    //   user_id: user.id,
    //   analysisType: type,
    //   video_count: videos.length,
    //   processingTimeMs: Date.now() - start_time,
    //   config: config,
    //   created_at: new Date().toISOString(),
    // });

    return NextResponse.json({
      success: true,
      ...result,
      processingTimeMs: Date.now() - start_time,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/youtube/analysis
 *
 * Query params:
 * - type: Analysis type
 * - video_id: Specific video ID (optional)
 * - limit: Number of results
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: auth_error,
    } = await supabase.auth.getUser();
    if (auth_error || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';
    const video_id = searchParams.get('video_id');
    const limit = Number.parseInt(searchParams.get('limit') || '10', 10);

    let result: Record<string, unknown> = {};

    switch (type) {
      case 'summary': {
        // Get analysis summary - analyticsLogs table not available yet
        // TODO: Create analyticsLogs table or use alternative
        const recent_analytics: any[] = [];
        // const { data: recent_analytics } = await supabase
        //   .from('analyticsLogs')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('created_at', { ascending: false })
        //   .limit(limit);

        result = {
          type: 'summary',
          recentAnalyses: recent_analytics,
          usageStats: {
            totalAnalyses: recent_analytics?.length || 0,
            analysisTypes: recent_analytics?.reduce((acc: Record<string, number>, log: any) => {
              acc[log.analysisType] = (acc[log.analysisType] || 0) + 1;
              return acc;
            }, {}),
          },
        };
        break;
      }

      case 'outliers': {
        // Get recent outliers
        const { data: outlier_videos } = await supabase
          .from('videos')
          .select('*, video_stats(*)')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (outlier_videos) {
          const outliers = await detectOutliers(
            outlier_videos.map((v) => ({
              ...v,
              stats: v.video_stats,
            })) as unknown as Parameters<typeof detectOutliers>[0]
          );

          result = {
            type: 'outliers',
            outliers: outliers
              .map(mapOutlierDetectionResult)
              .filter((o) => o.isOutlier)
              .slice(0, limit),
          };
        }
        break;
      }

      case 'predictions':
        // Get recent predictions
        if (video_id) {
          const { data: dbVideo } = await supabase
            .from('videos')
            .select('*, video_stats(*)')
            .eq('id', video_id)
            .single();

          if (dbVideo) {
            // Convert database record to YouTubeLensVideo type
            const v = dbVideo;
            const video: YouTubeLensVideo = {
              id: v.id,
              video_id: v.id,
              title: v.title,
              description: v.description,
              channel_id: v.channel_id,
              published_at: v.published_at || v.created_at || new Date().toISOString(),
              durationSeconds: v.duration ? Number(v.duration) : null,
              isShort: v.duration ? Number(v.duration) <= 60 : false,
              thumbnails: v.thumbnail_url ? { default: { url: v.thumbnail_url, width: 120, height: 90 } } : null,
              tags: v.tags || [],
              category_id: v.category_id,
              languageCode: v.default_language || null,
              regionCode: null,
              firstSeenAt: v.created_at || new Date().toISOString(),
              lastUpdatedAt: v.updated_at || v.created_at || new Date().toISOString(),
              created_at: v.created_at || new Date().toISOString(),
              deleted_at: null
            };
            
            const prediction = await predictVideoPerformance(video, (v.video_stats || []) as unknown as Parameters<typeof predictVideoPerformance>[1]);

            result = {
              type: 'predictions',
              prediction,
            };
          }
        }
        break;

      default:
        return NextResponse.json({ error: `Invalid query type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
