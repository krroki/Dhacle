// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';

// GET: 채널별 승인 로그 조회 (관리자 전용)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Admin API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const { channelId } = await context.params;

  // 관리자 권한 체크
  const admin_emails = ['glemfkcl@naver.com'];
  if (!admin_emails.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 승인 로그 조회
    const { data, error } = await supabase
      .from('yl_approval_logs')
      .select(`
        id,
        channel_id,
        action,
        user_id,
        details,
        created_at
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // snake_case를 camelCase로 변환
    const camelCaseData = data?.map((log) => ({
      id: log.id,
      channelId: log.channel_id,
      action: log.action,
      userId: log.user_id,
      details: log.details,
      createdAt: log.created_at,
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
