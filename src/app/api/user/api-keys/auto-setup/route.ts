// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// POST: API 키 자동 설정 (개발 환경 전용)
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to API Keys Auto Setup API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  // 개발 환경에서만 허용
  if (env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Auto-setup not available in production' },
      { status: 403 }
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();

  try {
    const body = await request.json();
    const { service_name } = body;

    if (!service_name || service_name !== 'youtube') {
      return NextResponse.json(
        { error: 'Invalid service name' },
        { status: 400 }
      );
    }

    // 개발 환경용 YouTube API 키 확인
    const youtubeApiKey = env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured in environment' },
        { status: 500 }
      );
    }

    // 기존 API 키 확인
    const { data: existing } = await supabase
      .from('user_api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_name', service_name)
      .single();

    if (existing && existing.is_active) {
      return NextResponse.json({
        success: true,
        data: {
          id: existing.id,
          service_name: existing.service_name,
          api_key_masked: existing.api_key_masked,
          created_at: existing.created_at,
          is_valid: existing.is_valid
        },
        message: 'API key already exists'
      });
    }

    // 새 API 키 저장
    const maskedKey = youtubeApiKey.slice(0, 8) + '...' + youtubeApiKey.slice(-4);
    
    const { data, error } = await supabase
      .from('user_api_keys')
      .upsert({
        user_id: user.id,
        service_name: service_name,
        encrypted_key: youtubeApiKey, // Changed from api_key to encrypted_key
        api_key_masked: maskedKey,
        is_active: true,
        is_valid: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        service_name: data.service_name,
        api_key_masked: data.api_key_masked,
        created_at: data.created_at,
        is_valid: data.is_valid
      },
      message: 'API key saved successfully'
    });

  } catch (error: unknown) {
    console.error('API Keys auto-setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to setup API key' },
      { status: 500 }
    );
  }
}