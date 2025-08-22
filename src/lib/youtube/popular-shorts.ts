/**
 * YouTube Lens - Popular Shorts Discovery Engine
 * Implements keyword-less search strategies to find trending Shorts
 * Created: 2025-01-21
 */

import type { youtube_v3 } from 'googleapis';
import { supabase } from '@/lib/supabase/client';
import type { PopularShortsParams, Video, VideoWithStats } from '@/types';
import { getYouTubeClient } from './client-helper';

/**
 * Strategy patterns for finding popular Shorts without keywords
 */
enum SearchStrategy {
  POPULAR = 'popular', // Use mostPopular chart (NEW - Primary strategy)
  WHITESPACE = 'whitespace', // Use space character
  CATEGORY = 'category', // Use category IDs
  HASHTAG = 'hashtag', // Use # symbol
  TRENDING_MUSIC = 'trending_music', // Music category focus
  GAMING = 'gaming', // Gaming category focus
  VIRAL_SOUNDS = 'viral_sounds', // Search for viral audio
}

/**
 * Main function to get popular Shorts without keyword
 */
export async function getPopularShortsWithoutKeyword(
  params: PopularShortsParams & { user_id?: string } = {}
): Promise<VideoWithStats[]> {
  const {
    regionCode = 'US',
    category_id,
    period = '24h',
    minViews = 1000,
    minVPH = 100,
    limit = 50,
  } = params;
  // Try multiple strategies in parallel for better coverage
  // POPULAR strategy is prioritized as it uses YouTube's official mostPopular chart
  const strategies = [SearchStrategy.POPULAR, SearchStrategy.CATEGORY, SearchStrategy.HASHTAG];

  const search_promises = strategies.map((strategy) =>
    execute_search_strategy(strategy, {
      regionCode,
      category_id,
      maxResults: Math.ceil(limit / strategies.length),
      user_id: params.user_id,
    })
  );

  const results = await Promise.allSettled(search_promises);

  // Combine successful results
  let all_videos: youtube_v3.Schema$Video[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      all_videos = all_videos.concat(result.value);
    }
  }

  // Filter for Shorts (duration < 60 seconds)
  const shorts = filter_shorts(all_videos);

  // Calculate metrics and filter by thresholds
  const videos_with_metrics = await enrich_with_metrics(shorts, period);

  // Apply filters
  const filtered = videos_with_metrics.filter((video) => {
    const stats = video.stats;
    if (!stats) {
      return false;
    }

    return stats.view_count >= minViews && (stats.viewsPerHour || 0) >= minVPH;
  });

  // Sort by viral score (highest first)
  filtered.sort((a, b) => {
    const score_a = a.stats?.viralScore || 0;
    const score_b = b.stats?.viralScore || 0;
    return score_b - score_a;
  });

  // Store in database for caching
  await store_videos_in_database(filtered);

  return filtered.slice(0, limit);
}

/**
 * Execute a specific search strategy
 */
async function execute_search_strategy(
  strategy: SearchStrategy,
  options: {
    regionCode: string;
    category_id?: string;
    maxResults: number;
    user_id?: string;
  }
): Promise<youtube_v3.Schema$Video[]> {
  const youtube = await getYouTubeClient(options.user_id);

  // Special handling for POPULAR strategy - use videos.list with chart parameter
  if (strategy === SearchStrategy.POPULAR) {
    try {
      // Use videos.list with mostPopular chart
      const videos_response = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        chart: 'mostPopular',
        regionCode: options.regionCode,
        videoCategoryId: options.category_id || undefined,
        maxResults: options.maxResults * 2, // Get more to filter for Shorts
        fields: 'items(id,snippet,statistics,contentDetails)',
      });

      return videos_response.data.items || [];
    } catch (error: unknown) {
      console.error('[Popular Shorts] mostPopular chart failed:', {
        error: error instanceof Error ? error.message : String(error),
        regionCode: options.regionCode,
      });
      // Fall back to search-based approach if chart fails
      // Continue with regular search strategy
    }
  }

  const search_params: youtube_v3.Params$Resource$Search$List = {
    part: ['snippet'],
    type: ['video'],
    videoDefinition: 'high',
    videoDuration: 'short', // < 4 minutes (YouTube's filter)
    order: 'view_count',
    publishedAfter: get_timeframe_date('7d'), // Last 7 days for freshness
    regionCode: options.regionCode,
    maxResults: options.maxResults,
    fields: 'items(id,snippet)',
  };

  // Apply strategy-specific parameters
  switch (strategy) {
    case SearchStrategy.WHITESPACE:
      // Use a space character as query
      search_params.q = ' ';
      break;

    case SearchStrategy.CATEGORY: {
      // Use popular category IDs
      const category_ids = ['10', '23', '24', '22']; // Music, Comedy, Entertainment, People & Blogs
      search_params.videoCategoryId = options.category_id || category_ids[0];
      search_params.q = undefined; // No query needed with category
      break;
    }

    case SearchStrategy.HASHTAG:
      // Use hashtag symbol
      search_params.q = '#';
      break;

    case SearchStrategy.TRENDING_MUSIC:
      search_params.videoCategoryId = '10'; // Music
      search_params.q = '#shorts';
      break;

    case SearchStrategy.GAMING:
      search_params.videoCategoryId = '20'; // Gaming
      search_params.q = '#shorts';
      break;

    case SearchStrategy.VIRAL_SOUNDS:
      search_params.q = '#viral #shorts';
      break;

    case SearchStrategy.POPULAR:
      // This case is handled above, but added for completeness
      search_params.q = undefined;
      break;
  }

  try {
    const search_response = await youtube.search.list(search_params);

    if (!search_response.data.items || search_response.data.items.length === 0) {
      return [];
    }

    // Get video details for the found items
    const video_ids = search_response.data.items
      .map((item) => item.id?.videoId)
      .filter(Boolean) as string[];

    if (video_ids.length === 0) {
      return [];
    }

    const videos_response = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: video_ids,
      fields: 'items(id,snippet,statistics,contentDetails)',
    });

    return videos_response.data.items || [];
  } catch (error: unknown) {
    console.error('[Popular Shorts] Search strategy failed:', {
      strategy,
      error: error instanceof Error ? error.message : String(error),
      regionCode: options.regionCode,
      category_id: options.category_id,
    });

    // Check for quota exceeded error
    if (error instanceof Error && error.message.includes('quotaExceeded')) {
      throw new Error('YouTube API 할당량이 초과되었습니다. 나중에 다시 시도해주세요.');
    }

    // Check for API key error
    if (
      error instanceof Error &&
      (error.message.includes('API key') || error.message.includes('api key'))
    ) {
      throw new Error('YouTube API 키가 유효하지 않습니다. 설정에서 API 키를 확인해주세요.');
    }

    // Return empty array for this strategy but log the error
    return [];
  }
}

/**
 * Filter videos to only include Shorts
 * YouTube officially defines Shorts as <= 60 seconds, but we use 90 seconds
 * to catch more content and account for rounding/processing differences
 */
function filter_shorts(videos: youtube_v3.Schema$Video[]): youtube_v3.Schema$Video[] {
  return videos.filter((video) => {
    const duration = video.contentDetails?.duration;
    if (!duration) {
      return false;
    }

    // Parse ISO 8601 duration (e.g., "PT58S", "PT1M30S")
    const seconds = parse_duration(duration);
    // Relaxed to 90 seconds to catch more Shorts-style content
    // Some Shorts may be slightly longer due to processing
    return seconds > 0 && seconds <= 90;
  });
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parse_duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return 0;
  }

  const minutes = Number.parseInt(match[1] || '0', 10);
  const seconds = Number.parseInt(match[2] || '0', 10);

  return minutes * 60 + seconds;
}

/**
 * Enrich videos with calculated metrics
 */
async function enrich_with_metrics(
  videos: youtube_v3.Schema$Video[],
  _period: string
): Promise<VideoWithStats[]> {
  const enriched: VideoWithStats[] = [];

  for (const video of videos) {
    if (!video.id || !video.snippet || !video.statistics) {
      continue;
    }

    const published_at = new Date(video.snippet.publishedAt || '');
    const now = new Date();
    const hours_elapsed = (now.getTime() - published_at.getTime()) / (1000 * 60 * 60);

    const view_count = Number.parseInt(video.statistics.viewCount || '0', 10);
    const like_count = Number.parseInt(video.statistics.likeCount || '0', 10);
    const comment_count = Number.parseInt(video.statistics.commentCount || '0', 10);

    // Calculate metrics
    const vph = hours_elapsed > 0 ? view_count / hours_elapsed : 0;
    const engagement_rate = view_count > 0 ? ((like_count + comment_count) / view_count) * 100 : 0;

    // Calculate viral score (custom algorithm)
    const viral_score = calculate_viral_score({
      view_count,
      like_count,
      comment_count,
      hoursElapsed: hours_elapsed,
      vph,
      engagementRate: engagement_rate,
    });

    const video_with_stats: VideoWithStats = {
      id: video.id,
      video_id: video.id,
      title: video.snippet.title || '',
      description: video.snippet.description || null,
      channel_id: video.snippet.channelId || '',
      published_at: video.snippet.publishedAt || '',
      durationSeconds: parse_duration(video.contentDetails?.duration || ''),
      isShort: true,
      thumbnails: (video.snippet.thumbnails as unknown as Video['thumbnails']) || null,
      tags: video.snippet.tags || null,
      category_id: video.snippet.categoryId || null,
      languageCode: video.snippet.defaultLanguage || null,
      regionCode: null,
      firstSeenAt: now.toISOString(),
      lastUpdatedAt: now.toISOString(),
      created_at: now.toISOString(),
      deleted_at: null,
      stats: {
        id: '', // Will be generated by database
        video_id: video.id,
        view_count: view_count,
        like_count: like_count,
        comment_count: comment_count,
        viewsPerHour: vph,
        engagementRate: engagement_rate,
        viralScore: viral_score,
        viewDelta: 0,
        likeDelta: 0,
        commentDelta: 0,
        snapshotAt: now.toISOString(),
        created_at: now.toISOString(),
      },
    };

    enriched.push(video_with_stats);
  }

  return enriched;
}

/**
 * Calculate viral score based on multiple factors
 */
function calculate_viral_score(metrics: {
  view_count: number;
  like_count: number;
  comment_count: number;
  hoursElapsed: number;
  vph: number;
  engagementRate: number;
}): number {
  const {
    view_count,
    like_count: _like_count,
    comment_count: _comment_count,
    hoursElapsed,
    vph,
    engagementRate,
  } = metrics;

  // Viral score formula (weighted factors)
  let score = 0;

  // Views per hour weight (40%)
  const vph_score = Math.min(vph / 1000, 100) * 0.4;

  // Engagement rate weight (30%)
  const engagement_score = Math.min(engagementRate * 10, 100) * 0.3;

  // Absolute view count weight (20%)
  const view_score = Math.min(view_count / 100000, 100) * 0.2;

  // Recency weight (10%)
  const recency_score = Math.max(0, ((168 - hoursElapsed) / 168) * 100) * 0.1;

  score = vph_score + engagement_score + view_score + recency_score;

  // Apply multipliers for exceptional metrics
  if (vph > 10000) {
    score *= 1.5;
  }
  if (engagementRate > 10) {
    score *= 1.3;
  }
  if (hoursElapsed < 24 && view_count > 50000) {
    score *= 1.4;
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Get date for timeframe filter
 */
function get_timeframe_date(period: string): string {
  const now = new Date();
  const period_map: Record<string, number> = {
    '1h': 1,
    '6h': 6,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
  };

  const hours = period_map[period] || 24;
  const date = new Date(now.getTime() - hours * 60 * 60 * 1000);

  return date.toISOString();
}

/**
 * Store videos in database for caching and history
 */
async function store_videos_in_database(videos: VideoWithStats[]): Promise<void> {
  if (videos.length === 0) {
    return;
  }

  try {
    // Store videos
    const video_data = videos.map((v) => ({
      id: v.video_id, // Map video_id to id
      title: v.title,
      description: v.description,
      channel_id: v.channel_id,
      published_at: v.published_at,
      duration: v.durationSeconds ? `PT${v.durationSeconds}S` : null, // Convert to ISO 8601 duration
      thumbnail_url: v.thumbnails?.default?.url || null, // Get thumbnail URL
      tags: v.tags,
      category_id: v.category_id,
      default_language: v.languageCode, // Map to correct field name
      // Fields not in our data but exist in DB
      comment_count: null,
      like_count: null,
      view_count: null,
    }));

    const { error: video_error } = await supabase
      .from('videos')
      .upsert(video_data, { onConflict: 'id' });

    if (video_error) {
      console.error('[Popular Shorts] Failed to store videos in database:', {
        error: video_error.message,
        code: video_error.code,
        details: video_error.details,
        videoCount: video_data.length,
      });
    }

    // Store stats (using snake_case to match DB schema)
    const stats_data = videos
      .filter((v) => v.stats)
      .map((v) => ({
        video_id: v.video_id,
        date: new Date().toISOString().split('T')[0] as string, // Add required date field
        view_count: v.stats?.view_count ?? null,
        like_count: v.stats?.like_count ?? null,
        comment_count: v.stats?.comment_count ?? null,
        views_per_hour: v.stats?.viewsPerHour ?? null, // Convert to snake_case
        engagement_rate: v.stats?.engagementRate ?? null, // Convert to snake_case
        viral_score: v.stats?.viralScore ?? null, // Convert to snake_case
        view_delta: v.stats?.viewDelta ?? null, // Already snake_case
        like_delta: v.stats?.likeDelta ?? null, // Already snake_case
        comment_delta: v.stats?.commentDelta ?? null, // Already snake_case
      }));

    if (stats_data.length > 0) {
      const { error: stats_error } = await supabase.from('video_stats').insert(stats_data);
      if (stats_error) {
        console.error('[Popular Shorts] Failed to store video stats:', {
          error: stats_error.message,
          code: stats_error.code,
          details: stats_error.details,
          statsCount: stats_data.length,
        });
      }
    }
  } catch (error: unknown) {
    console.error('[Popular Shorts] Database operation failed:', {
      error: error instanceof Error ? error.message : String(error),
      videosCount: videos.length,
    });
  }
}

/**
 * Get cached popular Shorts from database
 */
export async function getCachedPopularShorts(
  params: PopularShortsParams = {}
): Promise<VideoWithStats[]> {
  const {
    regionCode: _regionCode = 'US',
    period = '24h',
    minViews = 1000,
    minVPH = 100,
    limit = 50,
  } = params;

  try {
    const cutoff_date = get_timeframe_date(period);

    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        videoStats!inner(*)
      `)
      .eq('isShort', true)
      .gte('published_at', cutoff_date)
      .gte('videoStats.view_count', minViews)
      .gte('videoStats.viewsPerHour', minVPH)
      .order('videoStats.viralScore', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    // Transform to VideoWithStats format
    const videos_with_stats: VideoWithStats[] = (data || []).map((item) => ({
      ...item,
      video_id: item.id, // Use id field from videos table
      durationSeconds:
        typeof item.duration === 'number'
          ? item.duration
          : Number.parseInt(String(item.duration || 0)),
      isShort: true,
      thumbnails: [],
      published_at: item.published_at || new Date().toISOString(),
      publishedAt: item.published_at || new Date().toISOString(),
      title: item.title || '',
      viewCount: item.view_count || 0,
      channelTitle: '', // channel_title field doesn't exist in DB
      tags: item.tags || [],
      stats:
        item.videoStats && Array.isArray(item.videoStats) && item.videoStats.length > 0
          ? item.videoStats[0]
          : undefined,
      // Add missing required properties for VideoWithStats
      languageCode: 'en',
      regionCode: 'US',
      firstSeenAt: item.created_at || new Date().toISOString(),
      lastUpdatedAt: item.updated_at || new Date().toISOString(),
      deleted_at: null,
    })) as VideoWithStats[];

    return videos_with_stats;
  } catch (error: unknown) {
    console.error('[Popular Shorts] Failed to get cached shorts:', {
      error: error instanceof Error ? error.message : String(error),
      period,
      minViews,
      minVPH,
    });
    return [];
  }
}

/**
 * Hybrid approach: Try cache first, then live search
 */
export async function getPopularShorts(
  params: PopularShortsParams = {}
): Promise<VideoWithStats[]> {
  // Try cache first
  const cached = await getCachedPopularShorts(params);

  // If we have enough cached results, return them
  if (cached.length >= (params.limit || 50)) {
    return cached;
  }

  // Otherwise, fetch fresh data
  return getPopularShortsWithoutKeyword(params);
}
