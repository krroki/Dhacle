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
    const status = searchParams.get('status');
    const search_query = searchParams.get('q');

    // yl_channels 테이블에서 데이터 조회
    let query = supabase
      .from('yl_channels')
      .select(`
        *,
        yl_approval_logs(*)
      `)
      .order('created_at', { ascending: false });

    // 상태 필터
    if (status) {
      query = query.eq('status', status);
    }

    // 검색
    if (search_query) {
      query = query.or(`title.ilike.%${search_query}%,channel_id.ilike.%${search_query}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // snake_case를 camelCase로 변환
    const camel_case_data = data?.map((channel) => ({
      id: channel.id,
      channelId: channel.channel_id,
      title: channel.title,
      description: channel.description,
      thumbnailUrl: channel.thumbnail_url,
      subscriberCount: channel.subscriber_count,
      videoCount: channel.video_count,
      viewCount: channel.view_count,
      status: channel.status,
      approvedBy: channel.approved_by,
      approvedAt: channel.approved_at,
      createdAt: channel.created_at,
      updatedAt: channel.updated_at,
      approvalLogs: channel.yl_approval_logs || [],
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

    // yl_channels 테이블에 채널 추가
    const { data, error } = await supabase
      .from('yl_channels')
      .insert({
        channel_id: channel_id,
        title: channel_info.snippet.title,
        description: channel_info.snippet.description,
        thumbnail_url: channel_info.snippet.thumbnails?.default?.url,
        subscriber_count: Number.parseInt(channel_info.statistics.subscriber_count || '0'),
        view_count: Number.parseInt(channel_info.statistics.view_count || '0'),
        video_count: Number.parseInt(channel_info.statistics.videoCount || '0'),
        status: 'pending', // 초기 상태는 pending
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
        id: data.id,
        channelId: data.channel_id,
        title: data.title,
        subscriberCount: data.subscriber_count,
        status: data.status,
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
