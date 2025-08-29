// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

// GET: 채널 통계 조회 (관리자 전용)
export async function GET(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(request);
  if (!user) {
    logger.warn('Unauthorized access attempt to YouTube Lens Admin Channel Stats API');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  const supabase = await createSupabaseRouteHandlerClient();

  // 관리자 권한 체크 - Context7 패턴: 환경변수 + 테스트 환경 대응
  const getAdminEmails = (): string[] => {
    const adminEmails: string[] = [];
    
    // 프로덕션 관리자 이메일 (환경변수에서)
    if (env.ADMIN_EMAILS) {
      adminEmails.push(...env.ADMIN_EMAILS.split(',').map((email: string) => email.trim()));
    }
    
    // 기본 프로덕션 관리자 (fallback)
    if (adminEmails.length === 0) {
      adminEmails.push('glemfkcl@naver.com');
    }
    
    // 개발/테스트 환경에서는 테스트 관리자 이메일 추가
    if (env.NODE_ENV !== 'production' && env.TEST_ADMIN_EMAIL) {
      adminEmails.push(env.TEST_ADMIN_EMAIL);
    }
    
    return adminEmails;
  };

  const adminEmails = getAdminEmails();
  if (!adminEmails.includes(user.email || '')) {
    return NextResponse.json({ 
      error: 'Admin access required',
      debug: env.NODE_ENV !== 'production' ? { userEmail: user.email, adminEmails } : undefined
    }, { status: 403 });
  }

  try {
    // 기본 통계
    const { data: stats, error: statsError } = await supabase
      .from('yl_channels')
      .select('status, category, dominant_format')
      .order('created_at', { ascending: false });

    if (statsError) throw statsError;

    // 통계 계산
    const totalChannels = stats?.length || 0;
    const pendingChannels = stats?.filter(ch => ch.status === 'pending').length || 0;
    const approvedChannels = stats?.filter(ch => ch.status === 'approved').length || 0;
    const rejectedChannels = stats?.filter(ch => ch.status === 'rejected').length || 0;

    // 카테고리별 통계
    const channelsByCategory: Record<string, number> = {};
    stats?.forEach(ch => {
      if (ch.category) {
        channelsByCategory[ch.category] = (channelsByCategory[ch.category] || 0) + 1;
      }
    });

    // 포맷별 통계
    const channelsByFormat: Record<string, number> = {};
    stats?.forEach(ch => {
      if (ch.dominant_format) {
        channelsByFormat[ch.dominant_format] = (channelsByFormat[ch.dominant_format] || 0) + 1;
      }
    });

    // 최근 승인 로그 (최근 10개) - 별도 쿼리로 처리
    const { data: recentApprovalsRaw, error: logsError } = await supabase
      .from('yl_approval_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) throw logsError;

    // 채널 정보를 별도로 가져와서 매칭
    const channelIds = recentApprovalsRaw?.map(log => log.channel_id).filter((id): id is string => !!id) || [];
    const { data: channelInfo } = channelIds.length > 0 
      ? await supabase
          .from('yl_channels')
          .select('channel_id, title')
          .in('channel_id', channelIds)
      : { data: [] };

    const recentApprovals = recentApprovalsRaw?.map(log => {
      const channel = channelInfo?.find(ch => ch.channel_id === log.channel_id);
      return {
        id: log.id,
        channelId: log.channel_id,
        action: log.action,
        adminId: log.admin_id,
        notes: log.notes,
        createdAt: log.created_at,
        channelTitle: channel?.title || 'Unknown Channel'
      };
    }) || [];

    const channelStats = {
      totalChannels,
      pendingChannels,
      approvedChannels,
      rejectedChannels,
      channelsByCategory,
      channelsByFormat,
      recentApprovals
    };

    return NextResponse.json({ data: channelStats });
  } catch (error: unknown) {
    console.error('Admin channel stats GET error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch channel stats' },
      { status: 500 }
    );
  }
}