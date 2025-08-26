// revenue-proof/[id]/report/route.ts
// 신고 처리 API (3회 신고 시 자동 숨김)

// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { reportSchema } from '@/lib/validations/revenue-proof';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

// POST: 신고 처리
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to revenue-proof/[id]/report POST');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    const { id: proof_id } = await params;

    // 인증이 존재하는지 확인
    const { data: proof, error: proof_error } = await supabase
      .from('revenue_proofs')
      .select('id, user_id, is_hidden, reports_count')
      .eq('id', proof_id)
      .single();

    if (proof_error || !proof) {
      return NextResponse.json({ error: '인증을 찾을 수 없습니다' }, { status: 404 });
    }

    // 자기 자신의 인증은 신고 불가
    if (proof.user_id === user.id) {
      return NextResponse.json({ error: '자신의 인증은 신고할 수 없습니다' }, { status: 400 });
    }

    // 이미 숨김 처리된 인증
    if (proof.is_hidden) {
      return NextResponse.json({ error: '이미 처리된 인증입니다' }, { status: 400 });
    }

    // 중복 신고 확인
    const { data: existing_report } = await supabase
      .from('proof_reports')
      .select('id')
      .eq('proof_id', proof_id)
      .eq('reporter_id', user.id)
      .single();

    if (existing_report) {
      return NextResponse.json({ error: '이미 신고한 인증입니다' }, { status: 400 });
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 입력값 검증
    const validated_data = reportSchema.parse(body);

    // 악용 경고 확인
    if (!validated_data.acknowledged) {
      return NextResponse.json(
        { error: '신고 악용 시 제재 조치에 동의해야 합니다' },
        { status: 400 }
      );
    }

    // 신고 등록
    const { error: insert_error } = await supabase.from('proof_reports').insert({
      proof_id: proof_id,
      reporter_id: user.id,
      reason: validated_data.reason,
      description: validated_data.details || null,
    });

    if (insert_error) {
      logger.error('Failed to insert proof report:', insert_error);
      return NextResponse.json({ error: '신고 처리 중 오류가 발생했습니다' }, { status: 500 });
    }

    // 신고 수 증가 (nullable 처리)
    const new_reports_count = (proof.reports_count ?? 0) + 1;

    const { error: update_error } = await supabase
      .from('revenue_proofs')
      .update({
        reports_count: new_reports_count,
        // 3회 이상 신고 시 자동 숨김
        is_hidden: new_reports_count >= 3,
      })
      .eq('id', proof_id);

    if (update_error) {
    }

    // 3회 신고 도달 시 관리자 알림
    if (new_reports_count === 3) {
      logger.info(`Auto-hidden revenue proof ${proof_id} after 3 reports`);

      // 관리자 알림 로그 기록
      const { error: notification_error } = await supabase.from('adminnotifications').insert({
        type: 'autoHiddenProof',
        title: '인증 자동 숨김 처리',
        message: `인증 ${proof_id}이(가) 3회 신고로 인해 자동으로 숨김 처리되었습니다.`,
        data: {
          proof_id: proof_id,
          reports_count: new_reports_count,
          hiddenAt: new Date().toISOString(),
        },
        priority: 'high',
      });

      if (notification_error) {
        logger.error('Failed to create admin notification:', notification_error);
        // 알림 생성 실패해도 신고 처리는 계속 진행
      }
    }

    return NextResponse.json({
      message: '신고가 접수되었습니다',
      is_hidden: new_reports_count >= 3,
      reportsCount: new_reports_count,
    });
  } catch (error) {
    // Zod 검증 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '입력값이 올바르지 않습니다',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}

// GET: 신고 사유 목록 조회 (관리자용)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(_request);
    if (!user) {
      logger.warn('Unauthorized access attempt to revenue-proof/[id]/report GET');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    const { id: proof_id } = await params;

    // 신고 목록 조회 (관리자 전용)
    const { data: reports, error } = await supabase
      .from('proof_reports')
      .select(`
        *,
        reporter:users!proof_reports_reporter_id_fkey(
          id,
          username
        )
      `)
      .eq('proof_id', proof_id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch proof reports:', error);
      return NextResponse.json(
        { error: '신고 목록을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 신고 사유별 집계
    const reason_counts = reports?.reduce(
      (acc, report) => {
        acc[report.reason] = (acc[report.reason] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ) || {};

    return NextResponse.json({
      data: reports || [],
      count: reports?.length || 0,
      reasonCounts: reason_counts,
    });
  } catch (error) {
    logger.error('API error in route:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
