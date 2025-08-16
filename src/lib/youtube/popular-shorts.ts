/**
 * YouTube Lens - Popular Shorts Discovery Engine
 * Implements keyword-less search strategies to find trending Shorts
 * Created: 2025-01-21
 */

import { youtube_v3 } from 'googleapis';
import { getYouTubeClient } from './client-helper';
import { 
  VideoWithStats, 
  PopularShortsParams
} from '@/types/youtube-lens';
import { supabase } from '@/lib/supabase/client';

/**
 * Strategy patterns for finding popular Shorts without keywords
 */
enum SearchStrategy {
  WHITESPACE = 'whitespace',        // Use space character
  CATEGORY = 'category',            // Use category IDs
  HASHTAG = 'hashtag',              // Use # symbol
  TRENDING_MUSIC = 'trending_music', // Music category focus
  GAMING = 'gaming',                // Gaming category focus
  VIRAL_SOUNDS = 'viral_sounds',   // Search for viral audio
}

/**
 * Main function to get popular Shorts without keyword
 */
export async function getPopularShortsWithoutKeyword(
  params: PopularShortsParams = {}
): Promise<VideoWithStats[]> {
  const {
    regionCode = 'US',
    categoryId,
    period = '24h',
    minViews = 1000,
    minVPH = 100,
    limit = 50
  } = params;

  try {
    // Try multiple strategies in parallel for better coverage
    const strategies = [
      SearchStrategy.WHITESPACE,
      SearchStrategy.CATEGORY,
      SearchStrategy.HASHTAG,
    ];

    const searchPromises = strategies.map(strategy => 
      executeSearchStrategy(strategy, {
        regionCode,
        categoryId,
        maxResults: Math.ceil(limit / strategies.length)
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
    const filtered = videosWithMetrics.filter(video => {
      const stats = video.stats;
      if (!stats) return false;
      
      return (
        stats.view_count >= minViews &&
        (stats.views_per_hour || 0) >= minVPH
      );
    });

    // Sort by viral score (highest first)
    filtered.sort((a, b) => {
      const scoreA = a.stats?.viral_score || 0;
      const scoreB = b.stats?.viral_score || 0;
      return scoreB - scoreA;
    });

    // Store in database for caching
    await storeVideosInDatabase(filtered);

    return filtered.slice(0, limit);
  } catch (error) {
    console.error('Error fetching popular shorts:', error);
    throw error;
  }
}

/**
 * Execute a specific search strategy
 */
async function executeSearchStrategy(
  strategy: SearchStrategy,
  options: {
    regionCode: string;
    categoryId?: string;
    maxResults: number;
  }
): Promise<youtube_v3.Schema$Video[]> {
  const youtube = await getYouTubeClient();
  
  const searchParams: youtube_v3.Params$Resource$Search$List = {
    part: ['snippet'],
    type: ['video'],
    videoDefinition: 'high',
    videoDuration: 'short', // < 4 minutes (YouTube's filter)
    order: 'viewCount',
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
      
    case SearchStrategy.CATEGORY:
      // Use popular category IDs
      const categoryIds = ['10', '23', '24', '22']; // Music, Comedy, Entertainment, People & Blogs
      searchParams.videoCategoryId = options.categoryId || categoryIds[0];
      searchParams.q = undefined; // No query needed with category
      break;
      
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
      .map(item => item.id?.videoId)
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
  } catch (error: unknown) {
    console.error(`Strategy ${strategy} failed:`, error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Filter videos to only include Shorts (< 60 seconds)
 */
function filterShorts(videos: youtube_v3.Schema$Video[]): youtube_v3.Schema$Video[] {
  return videos.filter(video => {
    const duration = video.contentDetails?.duration;
    if (!duration) return false;
    
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
  if (!match) return 0;
  
  const minutes = parseInt(match[1] || '0');
  const seconds = parseInt(match[2] || '0');
  
  return minutes * 60 + seconds;
}

/**
 * Enrich videos with calculated metrics
 */
async function enrichWithMetrics(
  videos: youtube_v3.Schema$Video[],
  period: string
): Promise<VideoWithStats[]> {
  const enriched: VideoWithStats[] = [];
  
  for (const video of videos) {
    if (!video.id || !video.snippet || !video.statistics) continue;
    
    const publishedAt = new Date(video.snippet.publishedAt || '');
    const now = new Date();
    const hoursElapsed = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60);
    
    const viewCount = parseInt(video.statistics.viewCount || '0');
    const likeCount = parseInt(video.statistics.likeCount || '0');
    const commentCount = parseInt(video.statistics.commentCount || '0');
    
    // Calculate metrics
    const vph = hoursElapsed > 0 ? viewCount / hoursElapsed : 0;
    const engagementRate = viewCount > 0 
      ? ((likeCount + commentCount) / viewCount) * 100 
      : 0;
    
    // Calculate viral score (custom algorithm)
    const viralScore = calculateViralScore({
      viewCount,
      likeCount,
      commentCount,
      hoursElapsed,
      vph,
      engagementRate
    });
    
    const videoWithStats: VideoWithStats = {
      id: video.id,
      video_id: video.id,
      title: video.snippet.title || '',
      description: video.snippet.description || null,
      channel_id: video.snippet.channelId || '',
      published_at: video.snippet.publishedAt || '',
      duration_seconds: parseDuration(video.contentDetails?.duration || ''),
      is_short: true,
      thumbnails: video.snippet.thumbnails || null,
      tags: video.snippet.tags || null,
      category_id: video.snippet.categoryId || null,
      language_code: video.snippet.defaultLanguage || null,
      region_code: null,
      first_seen_at: now.toISOString(),
      last_updated_at: now.toISOString(),
      created_at: now.toISOString(),
      deleted_at: null,
      stats: {
        id: '', // Will be generated by database
        video_id: video.id,
        view_count: viewCount,
        like_count: likeCount,
        comment_count: commentCount,
        views_per_hour: vph,
        engagement_rate: engagementRate,
        viral_score: viralScore,
        view_delta: 0,
        like_delta: 0,
        comment_delta: 0,
        snapshot_at: now.toISOString(),
        created_at: now.toISOString()
      }
    };
    
    enriched.push(videoWithStats);
  }
  
  return enriched;
}

/**
 * Calculate viral score based on multiple factors
 */
function calculateViralScore(metrics: {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  hoursElapsed: number;
  vph: number;
  engagementRate: number;
}): number {
  const {
    viewCount,
    likeCount,
    commentCount,
    hoursElapsed,
    vph,
    engagementRate
  } = metrics;
  
  // Viral score formula (weighted factors)
  let score = 0;
  
  // Views per hour weight (40%)
  const vphScore = Math.min(vph / 1000, 100) * 0.4;
  
  // Engagement rate weight (30%)
  const engagementScore = Math.min(engagementRate * 10, 100) * 0.3;
  
  // Absolute view count weight (20%)
  const viewScore = Math.min(viewCount / 100000, 100) * 0.2;
  
  // Recency weight (10%)
  const recencyScore = Math.max(0, (168 - hoursElapsed) / 168 * 100) * 0.1;
  
  score = vphScore + engagementScore + viewScore + recencyScore;
  
  // Apply multipliers for exceptional metrics
  if (vph > 10000) score *= 1.5;
  if (engagementRate > 10) score *= 1.3;
  if (hoursElapsed < 24 && viewCount > 50000) score *= 1.4;
  
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
  if (videos.length === 0) return;
  
  try {
    // Store videos
    const videoData = videos.map(v => ({
      video_id: v.video_id,
      title: v.title,
      description: v.description,
      channel_id: v.channel_id,
      published_at: v.published_at,
      duration_seconds: v.duration_seconds,
      is_short: v.is_short,
      thumbnails: v.thumbnails,
      tags: v.tags,
      category_id: v.category_id,
      language_code: v.language_code,
      region_code: v.region_code,
    }));
    
    const { error: videoError } = await supabase
      .from('videos')
      .upsert(videoData, { onConflict: 'video_id' });
    
    if (videoError) {
      console.error('Error storing videos:', videoError);
    }
    
    // Store stats
    const statsData = videos
      .filter(v => v.stats)
      .map(v => ({
        video_id: v.video_id,
        view_count: v.stats!.view_count,
        like_count: v.stats!.like_count,
        comment_count: v.stats!.comment_count,
        views_per_hour: v.stats!.views_per_hour,
        engagement_rate: v.stats!.engagement_rate,
        viral_score: v.stats!.viral_score,
        view_delta: v.stats!.view_delta,
        like_delta: v.stats!.like_delta,
        comment_delta: v.stats!.comment_delta,
      }));
    
    const { error: statsError } = await supabase
      .from('video_stats')
      .insert(statsData);
    
    if (statsError) {
      console.error('Error storing stats:', statsError);
    }
  } catch (error) {
    console.error('Error storing videos in database:', error);
  }
}

/**
 * Get cached popular Shorts from database
 */
export async function getCachedPopularShorts(
  params: PopularShortsParams = {}
): Promise<VideoWithStats[]> {
  const {
    regionCode = 'US',
    period = '24h',
    minViews = 1000,
    minVPH = 100,
    limit = 50
  } = params;
  
  try {
    const cutoffDate = getTimeframeDate(period);
    
    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        video_stats!inner(*)
      `)
      .eq('is_short', true)
      .gte('published_at', cutoffDate)
      .gte('video_stats.view_count', minViews)
      .gte('video_stats.views_per_hour', minVPH)
      .order('video_stats.viral_score', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching cached shorts:', error);
      return [];
    }
    
    // Transform to VideoWithStats format
    const videosWithStats: VideoWithStats[] = (data || []).map(item => ({
      ...item,
      stats: item.video_stats?.[0] || undefined
    }));
    
    return videosWithStats;
  } catch (error) {
    console.error('Error fetching cached shorts:', error);
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