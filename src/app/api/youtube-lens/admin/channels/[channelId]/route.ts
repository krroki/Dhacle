// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { snakeToCamelCase } from '@/types';

// PATCH: 채널 승인/거부 (관리자 전용)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Admin Channel API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const { channelId } = await context.params;
  const supabase = await createSupabaseRouteHandlerClient();

  // 관리자 권한 체크
  const adminEmails = ['glemfkcl@naver.com'];
  if (!adminEmails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, notes } = body;

    // 트랜잭션으로 처리
    // 1. 채널 상태 업데이트
    const { data: channel, error: channelError } = await supabase
      .from('yl_channels')
      .update({
        status: action,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('channel_id', channelId)
      .select()
      .single();

    if (channelError) throw channelError;

    // 2. 승인 로그 추가
    const { error: logError } = await supabase
      .from('yl_approval_logs')
      .insert({
        channel_id: channelId,
        action,
        admin_id: user.id,
        notes
      });

    if (logError) throw logError;

    // 3. PubSub 구독 시작 (승인된 경우)
    if (action === 'approved') {
      // TODO: PubSub 구독 구현
      console.log('TODO: Start PubSub subscription for channel', channelId);
    }

    return NextResponse.json({
      success: true,
      data: snakeToCamelCase(channel)
    });
  } catch (error) {
    console.error('Admin channel PUT error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update channel' },
      { status: 500 }
    );
  }
}

// DELETE: 채널 삭제 (관리자 전용)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Admin Channel API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const { channelId } = await context.params;
  const supabase = await createSupabaseRouteHandlerClient();

  // 관리자 권한 체크
  const adminEmails = ['glemfkcl@naver.com'];
  if (!adminEmails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // 삭제 전 로그 남기기
    await supabase.from('yl_approval_logs').insert({
      channel_id: channelId,
      action: 'delete',
      admin_id: user.id,
      notes: 'Channel deleted by admin',
      created_at: new Date().toISOString(),
    });

    // 채널 삭제 (CASCADE로 관련 데이터도 삭제됨)
    const { error } = await supabase.from('yl_channels').delete().eq('channel_id', channelId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Channel deleted successfully'
    });
  } catch (error) {
    console.error('Admin channel DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete channel' },
      { status: 500 }
    );
  }
}
