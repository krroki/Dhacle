/**
 * YouTube Lens - Advanced Analytics API
 * Phase 4: API Endpoint
 *
 * Provides endpoints for outlier detection, NLP analysis, trend analysis, and predictions
 */

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { mapOutlierDetectionResult } from '@/lib/utils/type-mappers';
import { analyzeTrends, extractEntities, generateNLPReport } from '@/lib/youtube/analysis/nlp';
import { detectOutliers, generateOutlierReport } from '@/lib/youtube/analysis/outlier';
import {
  batchPredict,
  generatePredictionReport,
  predictVideoPerformance,
} from '@/lib/youtube/analysis/predictor';
import { generateTrendReport } from '@/lib/youtube/analysis/trends';
import type { BatchAnalysisResult, YouTubeLensVideo as Video, VideoStats } from '@/types';

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
    const supabase = createRouteHandlerClient({ cookies });

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
      videos_query = videos_query.in('video_id', videoIds);
    } else {
      // Default to recent videos
      const window_start = new Date();
      window_start.setDate(window_start.getDate() - timeWindowDays);
      videos_query = videos_query.gte('published_at', window_start.toISOString());
    }

    const { data: videos, error: videos_error } = await videos_query.limit(100);

    if (videos_error) {
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    if (!videos || videos.length === 0) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    // Fetch stats for videos
    const fetched_video_ids = videos.map((v: Video) => v.video_id);
    const { data: stats, error: stats_error } = await supabase
      .from('videoStats')
      .select('*')
      .in('video_id', fetched_video_ids)
      .order('snapshotAt', { ascending: false });

    if (stats_error) {
      return NextResponse.json({ error: 'Failed to fetch video statistics' }, { status: 500 });
    }

    // Group stats by video
    const stats_by_video = new Map<string, VideoStats[]>();
    stats?.forEach((stat: VideoStats) => {
      const video_stats = stats_by_video.get(stat.video_id) || [];
      video_stats.push(stat);
      stats_by_video.set(stat.video_id, video_stats);
    });

    // Add stats to videos
    const videos_with_stats = videos.map((video: Video) => ({
      ...video,
      stats: stats_by_video.get(video.video_id) || [],
    }));

    let result: Record<string, unknown> = {};

    switch (type) {
      case 'outlier': {
        // Outlier detection
        const outlier_results = await detectOutliers(videos_with_stats, config);
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
          videos.map((video: Video) => extractEntities(video))
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
        const trend_report = generateTrendReport(videos_with_stats, timeWindowDays);

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
          })),
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
            detectOutliers(videos_with_stats, config),
            Promise.all(videos.map((v: Video) => extractEntities(v))),
            analyzeTrends(videos, timeWindowDays),
            batchPredict(
              videos_with_stats.map((v) => ({
                video: v,
                stats: v.stats || [],
              })),
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
            trend: generateTrendReport(videos_with_stats, timeWindowDays),
            prediction: generatePredictionReport(batch_predictions),
          },
        };
        break;
      }

      default:
        return NextResponse.json({ error: `Invalid analysis type: ${type}` }, { status: 400 });
    }

    // Log analytics usage
    await supabase.from('analyticsLogs').insert({
      user_id: user.id,
      analysisType: type,
      video_count: videos.length,
      processingTimeMs: Date.now() - start_time,
      config: config,
      created_at: new Date().toISOString(),
    });

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
    const supabase = createRouteHandlerClient({ cookies });

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
        // Get analysis summary
        const { data: recent_analytics } = await supabase
          .from('analyticsLogs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        result = {
          type: 'summary',
          recentAnalyses: recent_analytics,
          usageStats: {
            totalAnalyses: recent_analytics?.length || 0,
            analysisTypes: recent_analytics?.reduce((acc: Record<string, number>, log) => {
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
          .select('*, videoStats(*)')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (outlier_videos) {
          const outliers = await detectOutliers(
            outlier_videos.map((v) => ({
              ...v,
              stats: v.videoStats,
            }))
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
          const { data: video } = await supabase
            .from('videos')
            .select('*, videoStats(*)')
            .eq('video_id', video_id)
            .single();

          if (video) {
            const prediction = await predictVideoPerformance(video, video.videoStats || []);

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
