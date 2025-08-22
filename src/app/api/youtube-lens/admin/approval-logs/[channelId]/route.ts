import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

// GET: 채널별 승인 로그 조회 (관리자 전용)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ channel_id: string }> }
) {
  const { channel_id } = await params;
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
    const camelCaseData = data?.map((log) => ({
      id: log.id,
      channel_id: log.channel_id,
      action: log.action,
      actorId: log.actor_id,
      beforeStatus: log.before_status,
      afterStatus: log.after_status,
      notes: log.notes,
      created_at: log.created_at,
    }));

    return NextResponse.json({ data: camelCaseData || [] });
  } catch (error) {
    console.error('Approval logs GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch approval logs' },
      { status: 500 }
    );
  }
}
