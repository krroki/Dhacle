// revenue-proof/[id]/report/route.ts
// 신고 처리 API (3회 신고 시 자동 숨김)

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { reportSchema } from '@/lib/validations/revenue-proof';
import { z } from 'zod';

// POST: 신고 처리
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { id: proofId } = await params;

    // 인증 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }

    // 인증이 존재하는지 확인
    const { data: proof, error: proofError } = await supabase
      .from('revenue_proofs')
      .select('id, user_id, is_hidden, reports_count')
      .eq('id', proofId)
      .single();

    if (proofError || !proof) {
      return NextResponse.json(
        { error: '인증을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 자기 자신의 인증은 신고 불가
    if (proof.user_id === user.id) {
      return NextResponse.json(
        { error: '자신의 인증은 신고할 수 없습니다' },
        { status: 400 }
      );
    }

    // 이미 숨김 처리된 인증
    if (proof.is_hidden) {
      return NextResponse.json(
        { error: '이미 처리된 인증입니다' },
        { status: 400 }
      );
    }

    // 중복 신고 확인
    const { data: existingReport } = await supabase
      .from('proof_reports')
      .select('id')
      .eq('proof_id', proofId)
      .eq('reporter_id', user.id)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: '이미 신고한 인증입니다' },
        { status: 400 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    
    // 입력값 검증
    const validatedData = reportSchema.parse(body);

    // 악용 경고 확인
    if (!validatedData.acknowledged) {
      return NextResponse.json(
        { error: '신고 악용 시 제재 조치에 동의해야 합니다' },
        { status: 400 }
      );
    }

    // 신고 등록
    const { error: insertError } = await supabase
      .from('proof_reports')
      .insert({
        proof_id: proofId,
        reporter_id: user.id,
        reason: validatedData.reason,
        details: validatedData.details || null
      });

    if (insertError) {
      console.error('Report insert error:', insertError);
      return NextResponse.json(
        { error: '신고 처리 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 신고 수 증가
    const newReportsCount = proof.reports_count + 1;
    
    const { error: updateError } = await supabase
      .from('revenue_proofs')
      .update({ 
        reports_count: newReportsCount,
        // 3회 이상 신고 시 자동 숨김
        is_hidden: newReportsCount >= 3
      })
      .eq('id', proofId);

    if (updateError) {
      console.error('Update reports count error:', updateError);
    }

    // 3회 신고 도달 시 관리자 알림 (추후 구현)
    if (newReportsCount === 3) {
      // TODO: 관리자 알림 시스템 구현
      console.log(`Alert: Revenue proof ${proofId} has been auto-hidden after 3 reports`);
      
      // 관리자 알림 로그 기록
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          type: 'auto_hidden_proof',
          data: {
            proof_id: proofId,
            reports_count: newReportsCount,
            hidden_at: new Date().toISOString()
          }
        });
      
      if (notificationError) {
        console.error('Admin notification error:', notificationError);
      }
    }

    return NextResponse.json({
      message: '신고가 접수되었습니다',
      isHidden: newReportsCount >= 3,
      reportsCount: newReportsCount
    });

  } catch (error) {
    console.error('API error:', error);
    
    // Zod 검증 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: '입력값이 올바르지 않습니다',
          details: error.flatten()
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// GET: 신고 사유 목록 조회 (관리자용)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

  // 세션 검사
  const authSupabase = createRouteHandlerClient({ cookies });
  const { data: { user: authUser2 } } = await authSupabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }


    const supabase = createServerComponentClient({ cookies });
    const { id: proofId } = await params;

    // 인증 확인 (관리자 권한 체크는 추후 구현)
    const { data: { user: authUser3 } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }

    // 신고 목록 조회
    const { data: reports, error } = await supabase
      .from('proof_reports')
      .select(`
        *,
        reporter:profiles!proof_reports_reporter_id_fkey(
          id,
          username
        )
      `)
      .eq('proof_id', proofId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Reports fetch error:', error);
      return NextResponse.json(
        { error: '신고 목록을 불러오는 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    // 신고 사유별 집계
    const reasonCounts = reports?.reduce((acc, report) => {
      acc[report.reason] = (acc[report.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      data: reports || [],
      count: reports?.length || 0,
      reasonCounts
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}