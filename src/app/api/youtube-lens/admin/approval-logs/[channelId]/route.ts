// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

// GET: 채널별 승인 로그 조회 (관리자 전용)
export async function GET(
  _request: NextRequest,
  _context: { params: Promise<{ channel_id: string }> }
) {
  // channel_id는 주석 처리된 코드에서만 사용되므로 현재는 사용하지 않음
  // const { channel_id } = await params;
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
    // TODO: yl_approval_logs 테이블이 존재하지 않음 - 테이블 생성 필요
    // 승인 로그 조회 임시 비활성화
    /*
    const { data, error } = await supabase
      .from('yl_approval_logs')
      .select(`
        id,
        channel_id,
        action,
        actor_id,
        before_status,
        after_status,
        notes,
        created_at
      `)
      .eq('channel_id', channel_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // snake_case를 camelCase로 변환
    const camel_case_data = data?.map((log) => ({
      id: log.id,
      channel_id: log.channel_id,
      action: log.action,
      actorId: log.actor_id,
      beforeStatus: log.before_status,
      afterStatus: log.after_status,
      notes: log.notes,
      created_at: log.created_at,
    }));
    */

    // 임시로 빈 데이터 반환
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error('Approval logs GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch approval logs' },
      { status: 500 }
    );
  }
}
