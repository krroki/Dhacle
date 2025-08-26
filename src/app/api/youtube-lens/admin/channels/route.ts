// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// GET: 채널 목록 조회 (관리자 전용)
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Admin Channels API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();

  // 관리자 권한 체크
  const admin_emails = ['glemfkcl@naver.com'];
  if (!admin_emails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    // status 필터는 channels 테이블에 approval_status 필드가 없어서 사용하지 않음
    // const status = searchParams.get('status');
    const search_query = searchParams.get('q');

    let query = supabase.from('channels').select('*').order('created_at', { ascending: false });

    // 검색 (approval_status 필드가 없으므로 상태 필터는 제거)
    if (search_query) {
      query = query.or(`title.ilike.%${search_query}%,id.ilike.%${search_query}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // snake_case를 camelCase로 변환 (channels 테이블에 실제로 존재하는 필드만 매핑)
    const camel_case_data = data?.map((channel) => ({
      channel_id: channel.id, // id를 channel_id로 사용
      title: channel.title,
      handle: channel.custom_url?.replace('@', '') || null, // custom_url에서 handle 추출
      description: channel.description,
      customUrl: channel.custom_url,
      thumbnail_url: channel.thumbnail_url,
      approvalStatus: 'approved', // 기본값으로 설정 (channels 테이블에 없음)
      approvalNotes: null, // channels 테이블에 없음
      approvedBy: null, // channels 테이블에 없음
      approvedAt: null, // channels 테이블에 없음
      source: 'youtube', // 기본값으로 설정
      subscriber_count: channel.subscriber_count,
      viewCountTotal: channel.view_count, // view_count를 사용
      videoCount: channel.video_count,
      category: null, // channels 테이블에 없음
      subcategory: null, // channels 테이블에 없음
      tags: channel.keywords, // keywords를 tags로 사용
      dominantFormat: null, // channels 테이블에 없음
      country: channel.country,
      language: 'ko', // 기본값 (channels 테이블에 없음)
      is_verified: channel.is_active, // is_active를 사용
      created_at: channel.created_at,
      updated_at: channel.updated_at,
    }));

    return NextResponse.json({ data: camel_case_data || [] });
  } catch (error: unknown) {
    console.error('Admin channels GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

// POST: 새 채널 추가 (관리자 전용)
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Admin Channels API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();

  // 관리자 권한 체크
  const admin_emails = ['glemfkcl@naver.com'];
  if (!admin_emails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { channel_id } = body;

    if (!channel_id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // YouTube API로 채널 정보 가져오기
    const yt_admin_key = env.YT_ADMIN_KEY;
    if (!yt_admin_key) {
      throw new Error('YouTube Admin API key not configured');
    }

    const yt_response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channel_id}&key=${yt_admin_key}` // External API: YouTube
    );
    const yt_data = await yt_response.json();

    if (!yt_data.items || yt_data.items.length === 0) {
      return NextResponse.json({ error: 'Channel not found on YouTube' }, { status: 404 });
    }

    const channel_info = yt_data.items[0];

    // DB에 채널 추가 (channels 테이블 사용)
    const { data, error } = await supabase
      .from('channels')
      .insert({
        id: channel_id, // channels 테이블에서는 id가 channel_id 역할
        title: channel_info.snippet.title,
        custom_url: channel_info.snippet.customUrl, // custom_url 필드 사용
        description: channel_info.snippet.description,
        thumbnail_url: channel_info.snippet.thumbnails?.default?.url,
        subscriber_count: Number.parseInt(channel_info.statistics.subscriber_count || '0'),
        view_count: Number.parseInt(channel_info.statistics.view_count || '0'), // view_count_total 대신 view_count
        video_count: Number.parseInt(channel_info.statistics.videoCount || '0'),
        country: channel_info.snippet.country || 'KR',
        published_at: channel_info.snippet.publishedAt || new Date().toISOString(),
        is_active: true, // 기본값으로 활성화
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // 중복 채널인 경우
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Channel already exists' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        channel_id: data.id, // id를 channel_id로 반환
        title: data.title,
        subscriber_count: data.subscriber_count,
      },
    });
  } catch (error: unknown) {
    console.error('Admin channel POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add channel' },
      { status: 500 }
    );
  }
}
