// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// GET: 채널 목록 조회 (관리자 전용)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = createRouteHandlerClient({ cookies });

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 관리자 권한 체크
  const adminEmails = ['glemfkcl@naver.com'];
  if (!adminEmails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const searchQuery = searchParams.get('q');

    let query = supabase.from('yl_channels').select('*').order('created_at', { ascending: false });

    // 상태 필터
    if (status && status !== 'all') {
      query = query.eq('approval_status', status);
    }

    // 검색
    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,channel_id.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // snake_case를 camelCase로 변환
    const camelCaseData = data?.map((channel) => ({
      channel_id: channel.channel_id,
      title: channel.title,
      handle: channel.handle,
      description: channel.description,
      customUrl: channel.custom_url,
      thumbnail_url: channel.thumbnail_url,
      approvalStatus: channel.approval_status,
      approvalNotes: channel.approval_notes,
      approvedBy: channel.approved_by,
      approvedAt: channel.approved_at,
      source: channel.source,
      subscriber_count: channel.subscriber_count,
      viewCountTotal: channel.view_count_total,
      videoCount: channel.video_count,
      category: channel.category,
      subcategory: channel.subcategory,
      tags: channel.tags,
      dominantFormat: channel.dominant_format,
      country: channel.country,
      language: channel.language,
      is_verified: channel.is_verified,
      created_at: channel.created_at,
      updated_at: channel.updated_at,
    }));

    return NextResponse.json({ data: camelCaseData || [] });
  } catch (error) {
    console.error('Admin channels GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

// POST: 새 채널 추가 (관리자 전용)
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = createRouteHandlerClient({ cookies });

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 관리자 권한 체크
  const adminEmails = ['glemfkcl@naver.com'];
  if (!adminEmails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { channel_id } = body;

    if (!channel_id) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
    }

    // YouTube API로 채널 정보 가져오기
    const ytAdminKey = process.env.YT_ADMIN_KEY;
    if (!ytAdminKey) {
      throw new Error('YouTube Admin API key not configured');
    }

    const ytResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channel_id}&key=${ytAdminKey}`
    );
    const ytData = await ytResponse.json();

    if (!ytData.items || ytData.items.length === 0) {
      return NextResponse.json({ error: 'Channel not found on YouTube' }, { status: 404 });
    }

    const channelInfo = ytData.items[0];

    // DB에 채널 추가
    const { data, error } = await supabase
      .from('yl_channels')
      .insert({
        channel_id: channel_id,
        title: channelInfo.snippet.title,
        handle: channelInfo.snippet.customUrl?.replace('@', ''),
        description: channelInfo.snippet.description,
        thumbnail_url: channelInfo.snippet.thumbnails?.default?.url,
        approval_status: 'pending',
        source: 'manual',
        subscriber_count: Number.parseInt(channelInfo.statistics.subscriber_count || '0'),
        view_count_total: Number.parseInt(channelInfo.statistics.view_count || '0'),
        video_count: Number.parseInt(channelInfo.statistics.videoCount || '0'),
        country: channelInfo.snippet.country || 'KR',
        language: channelInfo.snippet.defaultLanguage || 'ko',
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
        channel_id: data.channel_id,
        title: data.title,
        subscriber_count: data.subscriber_count,
      },
    });
  } catch (error) {
    console.error('Admin channel POST error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add channel' },
      { status: 500 }
    );
  }
}
