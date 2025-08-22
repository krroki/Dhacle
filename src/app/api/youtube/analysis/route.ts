/**
 * YouTube Lens - Advanced Analytics API
 * Phase 4: API Endpoint
 *
 * Provides endpoints for outlier detection, NLP analysis, trend analysis, and predictions
 */

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
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { type, videoIds = [], timeWindowDays = 7, config = {} } = body;

    // Validate request
    if (!type) {
      return NextResponse.json({ error: 'Analysis type is required' }, { status: 400 });
    }

    const startTime = Date.now();

    // Fetch videos and stats
    let videosQuery = supabase.from('videos').select('*');

    if (videoIds.length > 0) {
      videosQuery = videosQuery.in('video_id', videoIds);
    } else {
      // Default to recent videos
      const windowStart = new Date();
      windowStart.setDate(windowStart.getDate() - timeWindowDays);
      videosQuery = videosQuery.gte('published_at', windowStart.toISOString());
    }

    const { data: videos, error: videosError } = await videosQuery.limit(100);

    if (videosError) {
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
    }

    if (!videos || videos.length === 0) {
      return NextResponse.json({ error: 'No videos found' }, { status: 404 });
    }

    // Fetch stats for videos
    const fetchedVideoIds = videos.map((v: Video) => v.video_id);
    const { data: stats, error: statsError } = await supabase
      .from('videoStats')
      .select('*')
      .in('video_id', fetchedVideoIds)
      .order('snapshotAt', { ascending: false });

    if (statsError) {
      return NextResponse.json({ error: 'Failed to fetch video statistics' }, { status: 500 });
    }

    // Group stats by video
    const statsByVideo = new Map<string, VideoStats[]>();
    stats?.forEach((stat: VideoStats) => {
      const videoStats = statsByVideo.get(stat.video_id) || [];
      videoStats.push(stat);
      statsByVideo.set(stat.video_id, videoStats);
    });

    // Add stats to videos
    const videosWithStats = videos.map((video: Video) => ({
      ...video,
      stats: statsByVideo.get(video.video_id) || [],
    }));

    let result: Record<string, unknown> = {};

    switch (type) {
      case 'outlier': {
        // Outlier detection
        const outlierResults = await detectOutliers(videosWithStats, config);
        const outlierReport = generateOutlierReport(outlierResults);

        result = {
          type: 'outlier',
          results: outlierResults,
          report: outlierReport,
          config: config,
        };
        break;
      }

      case 'nlp': {
        // NLP Entity extraction
        const entityExtractions = await Promise.all(
          videos.map((video: Video) => extractEntities(video))
        );

        const trends = await analyzeTrends(videos, timeWindowDays);
        const nlpReport = generateNLPReport(entityExtractions, trends);

        result = {
          type: 'nlp',
          entities: entityExtractions,
          trends: trends,
          report: nlpReport,
        };
        break;
      }

      case 'trend': {
        // Trend analysis
        const trendReport = generateTrendReport(videosWithStats, timeWindowDays);

        result = {
          type: 'trend',
          report: trendReport,
          timeWindowDays: timeWindowDays,
        };
        break;
      }

      case 'prediction': {
        // Performance prediction
        const predictions = await batchPredict(
          videosWithStats.map((v) => ({
            video: v,
            stats: v.stats || [],
          })),
          30 // 30 days horizon
        );

        const predictionReport = generatePredictionReport(predictions);

        result = {
          type: 'prediction',
          predictions: predictions,
          report: predictionReport,
        };
        break;
      }

      case 'batch': {
        // Batch analysis (all types)
        const [batchOutliers, batchEntities, batchTrends, batchPredictions] = await Promise.all([
          detectOutliers(videosWithStats, config),
          Promise.all(videos.map((v: Video) => extractEntities(v))),
          analyzeTrends(videos, timeWindowDays),
          batchPredict(
            videosWithStats.map((v) => ({
              video: v,
              stats: v.stats || [],
            })),
            30
          ),
        ]);

        const batchResult: BatchAnalysisResult = {
          outliers: batchOutliers.map(mapOutlierDetectionResult).filter((o) => o.isOutlier),
          trends: batchTrends,
          predictions: batchPredictions,
          processingTimeMs: Date.now() - startTime,
          totalVideosAnalyzed: videos.length,
          timestamp: new Date().toISOString(),
        };

        result = {
          type: 'batch',
          result: batchResult,
          reports: {
            outlier: generateOutlierReport(batchOutliers),
            nlp: generateNLPReport(batchEntities, batchTrends),
            trend: generateTrendReport(videosWithStats, timeWindowDays),
            prediction: generatePredictionReport(batchPredictions),
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
      processingTimeMs: Date.now() - startTime,
      config: config,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      ...result,
      processingTimeMs: Date.now() - startTime,
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
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
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
        const { data: recentAnalytics } = await supabase
          .from('analyticsLogs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        result = {
          type: 'summary',
          recentAnalyses: recentAnalytics,
          usageStats: {
            totalAnalyses: recentAnalytics?.length || 0,
            analysisTypes: recentAnalytics?.reduce((acc: Record<string, number>, log) => {
              acc[log.analysisType] = (acc[log.analysisType] || 0) + 1;
              return acc;
            }, {}),
          },
        };
        break;
      }

      case 'outliers': {
        // Get recent outliers
        const { data: outlierVideos } = await supabase
          .from('videos')
          .select('*, videoStats(*)')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (outlierVideos) {
          const outliers = await detectOutliers(
            outlierVideos.map((v) => ({
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
