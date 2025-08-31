// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

// Force dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

/**
 * GET /api/youtube-lens/keywords/trends
 * Get current keyword trends from videos table
 * 
 * TODO: Implement keyword extraction from videos table after yl_keyword_trends removal
 */
export async function GET(_request: Request) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // TODO: Implement keyword trends functionality using videos table
    // For now, return empty results since yl_keyword_trends table was removed
    
    return NextResponse.json({
      success: true,
      data: {
        trends: [], // TODO: Extract keywords from videos.title and videos.description
        categories: [
          'tech', 'lifestyle', 'business', 'entertainment', 
          'education', 'gaming', 'sports', 'music', 'news'
        ],
        updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Keyword trends API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/youtube-lens/keywords/trends  
 * Analyze keywords from recent videos
 * 
 * TODO: Implement keyword analysis using videos table
 */
export async function POST(_request: Request) {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // TODO: Implement keyword analysis from videos table
    // 1. Get recent videos from videos table
    // 2. Extract keywords from title and description
    // 3. Calculate trends and growth rates
    // 4. Return analyzed data

    return NextResponse.json({
      success: true,
      data: {
        trends: [],
        analyzed: 0,
        message: 'Keyword analysis temporarily unavailable - implementation needed for videos table'
      }
    });

  } catch (error) {
    console.error('Keyword analysis error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}