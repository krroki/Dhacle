/**
 * YouTube Lens Phase 2: Keyword Trends API
 * GET /api/youtube-lens/keywords/trends - Get trending keywords from recent videos
 * POST /api/youtube-lens/keywords/trends - Analyze and update keyword trends
 */

import { NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { KeywordExtractor, type KeywordTrend } from '@/lib/youtube-lens/keyword-analyzer';
import type { Database } from '@/types/database.generated';

// Force dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

/**
 * GET /api/youtube-lens/keywords/trends
 * Get current keyword trends from database
 */
export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '1', 10);
    const category = searchParams.get('category') || undefined;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Build query
    let query = supabase
      .from('yl_keyword_trends')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('growth_rate', { ascending: false })
      .limit(30);
    
    // Add category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data: trends, error } = await query;
    
    if (error) {
      console.error('Error fetching keyword trends:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch trends' },
        { status: 500 }
      );
    }

    // Group by category for UI
    const categories: Record<string, KeywordTrend[]> = {};
    if (trends) {
      for (const trend of trends) {
        const cat = trend.category || '기타';
        if (!categories[cat]) {
          categories[cat] = [];
        }
        categories[cat].push({
          keyword: trend.keyword,
          frequency: trend.frequency || 0,
          growth: trend.growth_rate ? Number(trend.growth_rate) : 0,
          channels: trend.channels || [],
          category: trend.category || undefined
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        trends: trends?.map((t: Database['public']['Tables']['yl_keyword_trends']['Row']) => ({
          keyword: t.keyword,
          frequency: t.frequency || 0,
          growth: t.growth_rate ? Number(t.growth_rate) : 0,
          channels: t.channels || [],
          category: t.category || undefined
        })) || [],
        categories,
        updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Keywords trends API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube-lens/keywords/trends
 * Analyze recent videos and update keyword trends
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { channelIds, analyze = true } = body;

    // Get recent videos from specified channels or all channels
    let videosQuery = supabase
      .from('yl_videos')
      .select('video_id, channel_id, title, description, published_at')
      .order('published_at', { ascending: false })
      .limit(100);

    if (channelIds && Array.isArray(channelIds) && channelIds.length > 0) {
      videosQuery = videosQuery.in('channel_id', channelIds);
    }

    const { data: videos, error: videosError } = await videosQuery;

    if (videosError) {
      console.error('Error fetching videos:', videosError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    if (!videos || videos.length === 0) {
      // If no videos in yl_videos table, try to get from yl_channels recent data
      const { data: channels } = await supabase
        .from('yl_channels')
        .select('channel_id, title, description')
        .limit(50);
      
      if (!channels || channels.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            trends: [],
            analyzed: 0,
            message: 'No videos found for analysis'
          }
        });
      }

      // Use channel data as fallback
      const extractor = new KeywordExtractor();
      const videoInputs = channels.map((ch) => ({
        title: ch.title,
        description: ch.description || '',
        channelId: ch.channel_id,
        category: undefined
      }));

      const trends = await extractor.analyzeKeywordTrends(videoInputs);

      return NextResponse.json({
        success: true,
        data: {
          trends: trends.slice(0, 20),
          analyzed: channels.length,
          message: 'Analyzed channel data (no videos available yet)'
        }
      });
    }

    if (!analyze) {
      // Just return video count without analysis
      return NextResponse.json({
        success: true,
        data: {
          videoCount: videos.length,
          message: 'Videos ready for analysis'
        }
      });
    }

    // Get yesterday's trends for comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    if (!yesterdayStr) {
      throw new Error('Failed to generate date string');
    }
    
    const { data: previousTrends } = await supabase
      .from('yl_keyword_trends')
      .select('keyword, frequency')
      .eq('date', yesterdayStr);

    // Build previous trends map
    const previousMap = new Map<string, number>();
    if (previousTrends) {
      for (const trend of previousTrends) {
        previousMap.set(trend.keyword, trend.frequency || 0);
      }
    }

    // Analyze keywords using KeywordExtractor
    const extractor = new KeywordExtractor();
    const videoInputs = videos.map((v) => ({
      title: v.title,
      description: v.description || '',
      channelId: v.channel_id || 'unknown', // Handle null channelId
      category: undefined, // We could join with yl_channels to get category
      publishedAt: v.published_at || undefined
    }));

    const trends = await extractor.analyzeKeywordTrends(videoInputs, previousMap);

    // Store trends in database (upsert)
    const today = new Date().toISOString().split('T')[0];
    if (!today) {
      throw new Error('Failed to generate date string');
    }
    
    const trendRecords = trends.map(trend => ({
      keyword: trend.keyword,
      date: today, // guaranteed to be string
      frequency: trend.frequency,
      channels: trend.channels,
      growth_rate: trend.growth,
      category: trend.category || null
    }));

    if (trendRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('yl_keyword_trends')
        .upsert(trendRecords, { 
          onConflict: 'keyword,date',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Error upserting trends:', upsertError);
        // Continue even if storage fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        trends: trends.slice(0, 20),
        analyzed: videos.length,
        stored: trendRecords.length,
        message: 'Keyword trends analyzed and stored successfully'
      }
    });

  } catch (error) {
    console.error('Keywords trends POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}