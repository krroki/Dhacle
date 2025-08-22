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
  const strategies = [SearchStrategy.WHITESPACE, SearchStrategy.CATEGORY, SearchStrategy.HASHTAG];

  const searchPromises = strategies.map((strategy) =>
    executeSearchStrategy(strategy, {
      regionCode,
      category_id,
      maxResults: Math.ceil(limit / strategies.length),
      user_id: params.user_id,
    })
  );

  const results = await Promise.allSettled(searchPromises);

  // Combine successful results
  let allVideos: youtube_v3.Schema$Video[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      allVideos = allVideos.concat(result.value);
    }
  }

  // Filter for Shorts (duration < 60 seconds)
  const shorts = filterShorts(allVideos);

  // Calculate metrics and filter by thresholds
  const videosWithMetrics = await enrichWithMetrics(shorts, period);

  // Apply filters
  const filtered = videosWithMetrics.filter((video) => {
    const stats = video.stats;
    if (!stats) {
      return false;
    }

    return stats.view_count >= minViews && (stats.viewsPerHour || 0) >= minVPH;
  });

  // Sort by viral score (highest first)
  filtered.sort((a, b) => {
    const scoreA = a.stats?.viralScore || 0;
    const scoreB = b.stats?.viralScore || 0;
    return scoreB - scoreA;
  });

  // Store in database for caching
  await storeVideosInDatabase(filtered);

  return filtered.slice(0, limit);
}

/**
 * Execute a specific search strategy
 */
async function executeSearchStrategy(
  strategy: SearchStrategy,
  options: {
    regionCode: string;
    category_id?: string;
    maxResults: number;
    user_id?: string;
  }
): Promise<youtube_v3.Schema$Video[]> {
  const youtube = await getYouTubeClient(options.user_id);

  const searchParams: youtube_v3.Params$Resource$Search$List = {
    part: ['snippet'],
    type: ['video'],
    videoDefinition: 'high',
    videoDuration: 'short', // < 4 minutes (YouTube's filter)
    order: 'view_count',
    publishedAfter: getTimeframeDate('7d'), // Last 7 days for freshness
    regionCode: options.regionCode,
    maxResults: options.maxResults,
    fields: 'items(id,snippet)',
  };

  // Apply strategy-specific parameters
  switch (strategy) {
    case SearchStrategy.WHITESPACE:
      // Use a space character as query
      searchParams.q = ' ';
      break;

    case SearchStrategy.CATEGORY: {
      // Use popular category IDs
      const categoryIds = ['10', '23', '24', '22']; // Music, Comedy, Entertainment, People & Blogs
      searchParams.videoCategoryId = options.category_id || categoryIds[0];
      searchParams.q = undefined; // No query needed with category
      break;
    }

    case SearchStrategy.HASHTAG:
      // Use hashtag symbol
      searchParams.q = '#';
      break;

    case SearchStrategy.TRENDING_MUSIC:
      searchParams.videoCategoryId = '10'; // Music
      searchParams.q = '#shorts';
      break;

    case SearchStrategy.GAMING:
      searchParams.videoCategoryId = '20'; // Gaming
      searchParams.q = '#shorts';
      break;

    case SearchStrategy.VIRAL_SOUNDS:
      searchParams.q = '#viral #shorts';
      break;
  }

  try {
    const searchResponse = await youtube.search.list(searchParams);

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return [];
    }

    // Get video details for the found items
    const videoIds = searchResponse.data.items
      .map((item) => item.id?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return [];
    }

    const videosResponse = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
      fields: 'items(id,snippet,statistics,contentDetails)',
    });

    return videosResponse.data.items || [];
  } catch (_error: unknown) {
    return [];
  }
}

/**
 * Filter videos to only include Shorts (< 60 seconds)
 */
function filterShorts(videos: youtube_v3.Schema$Video[]): youtube_v3.Schema$Video[] {
  return videos.filter((video) => {
    const duration = video.contentDetails?.duration;
    if (!duration) {
      return false;
    }

    // Parse ISO 8601 duration (e.g., "PT58S", "PT1M30S")
    const seconds = parseDuration(duration);
    return seconds > 0 && seconds <= 60;
  });
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(duration: string): number {
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
async function enrichWithMetrics(
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
    const hoursElapsed = (now.getTime() - published_at.getTime()) / (1000 * 60 * 60);

    const view_count = Number.parseInt(video.statistics.viewCount || '0', 10);
    const like_count = Number.parseInt(video.statistics.likeCount || '0', 10);
    const comment_count = Number.parseInt(video.statistics.commentCount || '0', 10);

    // Calculate metrics
    const vph = hoursElapsed > 0 ? view_count / hoursElapsed : 0;
    const engagementRate = view_count > 0 ? ((like_count + comment_count) / view_count) * 100 : 0;

    // Calculate viral score (custom algorithm)
    const viralScore = calculateViralScore({
      view_count,
      like_count,
      comment_count,
      hoursElapsed,
      vph,
      engagementRate,
    });

    const videoWithStats: VideoWithStats = {
      id: video.id,
      video_id: video.id,
      title: video.snippet.title || '',
      description: video.snippet.description || null,
      channel_id: video.snippet.channelId || '',
      published_at: video.snippet.publishedAt || '',
      durationSeconds: parseDuration(video.contentDetails?.duration || ''),
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
        engagementRate: engagementRate,
        viralScore: viralScore,
        viewDelta: 0,
        likeDelta: 0,
        commentDelta: 0,
        snapshotAt: now.toISOString(),
        created_at: now.toISOString(),
      },
    };

    enriched.push(videoWithStats);
  }

  return enriched;
}

/**
 * Calculate viral score based on multiple factors
 */
function calculateViralScore(metrics: {
  view_count: number;
  like_count: number;
  comment_count: number;
  hoursElapsed: number;
  vph: number;
  engagementRate: number;
}): number {
  const { view_count, like_count: _like_count, comment_count: _comment_count, hoursElapsed, vph, engagementRate } = metrics;

  // Viral score formula (weighted factors)
  let score = 0;

  // Views per hour weight (40%)
  const vphScore = Math.min(vph / 1000, 100) * 0.4;

  // Engagement rate weight (30%)
  const engagementScore = Math.min(engagementRate * 10, 100) * 0.3;

  // Absolute view count weight (20%)
  const viewScore = Math.min(view_count / 100000, 100) * 0.2;

  // Recency weight (10%)
  const recencyScore = Math.max(0, ((168 - hoursElapsed) / 168) * 100) * 0.1;

  score = vphScore + engagementScore + viewScore + recencyScore;

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
function getTimeframeDate(period: string): string {
  const now = new Date();
  const periodMap: Record<string, number> = {
    '1h': 1,
    '6h': 6,
    '24h': 24,
    '7d': 24 * 7,
    '30d': 24 * 30,
  };

  const hours = periodMap[period] || 24;
  const date = new Date(now.getTime() - hours * 60 * 60 * 1000);

  return date.toISOString();
}

/**
 * Store videos in database for caching and history
 */
async function storeVideosInDatabase(videos: VideoWithStats[]): Promise<void> {
  if (videos.length === 0) {
    return;
  }

  try {
    // Store videos
    const videoData = videos.map((v) => ({
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

    const { error: videoError } = await supabase
      .from('videos')
      .upsert(videoData, { onConflict: 'id' });

    if (videoError) {
    }

    // Store stats (using snake_case to match DB schema)
    const statsData = videos
      .filter((v) => v.stats)
      .map((v) => ({
        video_id: v.video_id,
        date: new Date().toISOString().split('T')[0] as string, // Add required date field
        view_count: v.stats?.view_count ?? null,
        like_count: v.stats?.like_count ?? null,
        comment_count: v.stats?.comment_count ?? null,
        views_per_hour: v.stats?.viewsPerHour ?? null,  // Convert to snake_case
        engagement_rate: v.stats?.engagementRate ?? null,  // Convert to snake_case
        viral_score: v.stats?.viralScore ?? null,  // Convert to snake_case
        view_delta: v.stats?.viewDelta ?? null,  // Already snake_case
        like_delta: v.stats?.likeDelta ?? null,  // Already snake_case
        comment_delta: v.stats?.commentDelta ?? null,  // Already snake_case
      }));

    if (statsData.length > 0) {
      const { error: statsError } = await supabase.from('video_stats').insert(statsData);
      if (statsError) {
        console.error('Stats insert error:', statsError);
      }
    }
  } catch (_error) {}
}

/**
 * Get cached popular Shorts from database
 */
export async function getCachedPopularShorts(
  params: PopularShortsParams = {}
): Promise<VideoWithStats[]> {
  const { regionCode: _regionCode = 'US', period = '24h', minViews = 1000, minVPH = 100, limit = 50 } = params;

  try {
    const cutoffDate = getTimeframeDate(period);

    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        videoStats!inner(*)
      `)
      .eq('isShort', true)
      .gte('published_at', cutoffDate)
      .gte('videoStats.view_count', minViews)
      .gte('videoStats.viewsPerHour', minVPH)
      .order('videoStats.viralScore', { ascending: false })
      .limit(limit);

    if (error) {
      return [];
    }

    // Transform to VideoWithStats format
    const videosWithStats: VideoWithStats[] = (data || []).map((item) => ({
      ...item,
      video_id: item.id,  // Use id field from videos table
      durationSeconds: typeof item.duration === 'number' ? item.duration : parseInt(String(item.duration || 0)),
      isShort: true,
      thumbnails: [],
      published_at: item.published_at || new Date().toISOString(),
      publishedAt: item.published_at || new Date().toISOString(),
      title: item.title || '',
      viewCount: item.view_count || 0,
      channelTitle: '',  // channel_title field doesn't exist in DB
      tags: item.tags || [],
      stats: (item.videoStats && Array.isArray(item.videoStats) && item.videoStats.length > 0) 
        ? item.videoStats[0]
        : undefined,
      // Add missing required properties for VideoWithStats
      languageCode: 'en',
      regionCode: 'US',
      firstSeenAt: item.created_at || new Date().toISOString(),
      lastUpdatedAt: item.updated_at || new Date().toISOString(),
      deleted_at: null,
    })) as VideoWithStats[];

    return videosWithStats;
  } catch (_error) {
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
