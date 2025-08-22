// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

// PUT: 채널 정보 수정 (관리자 전용)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ channel_id: string }> }
) {
  const { channel_id } = await params;
  const supabase = await createSupabaseRouteHandlerClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 관리자 권한 체크
  const admin_emails = ['glemfkcl@naver.com'];
  if (!admin_emails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status, notes, category, subcategory, dominantFormat } = body;

    const update_data: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // 상태 변경
    if (status) {
      update_data.approval_status = status;
      update_data.approval_notes = notes;

      if (status === 'approved') {
        update_data.approved_by = user.id;
        update_data.approved_at = new Date().toISOString();
      }
    }

    // 카테고리 정보 업데이트
    if (category !== undefined) update_data.category = category;
    if (subcategory !== undefined) update_data.subcategory = subcategory;
    if (dominantFormat !== undefined) update_data.dominant_format = dominantFormat;

    const { data, error } = await supabase
      .from('yl_channels')
      .update(update_data)
      .eq('channel_id', channel_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        channel_id: data.channel_id,
        approvalStatus: data.approval_status,
        updated_at: data.updated_at,
      },
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
  _request: NextRequest,
  { params }: { params: Promise<{ channel_id: string }> }
) {
  const { channel_id } = await params;
  const supabase = await createSupabaseRouteHandlerClient();

  // 인증 체크
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  // 관리자 권한 체크
  const admin_emails = ['glemfkcl@naver.com'];
  if (!admin_emails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    // 삭제 전 로그 남기기
    await supabase.from('yl_approval_logs').insert({
      channel_id: channel_id,
      action: 'delete',
      actor_id: user.id,
      notes: 'Channel deleted by admin',
      created_at: new Date().toISOString(),
    });

    // 채널 삭제 (CASCADE로 관련 데이터도 삭제됨)
    const { error } = await supabase.from('yl_channels').delete().eq('channel_id', channel_id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Channel deleted successfully',
    });
  } catch (error) {
    console.error('Admin channel DELETE error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete channel' },
      { status: 500 }
    );
  }
}
