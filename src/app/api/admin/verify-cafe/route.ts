// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse, type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
// Types will be inferred from Supabase client

/**
 * 관리자 전용 네이버 카페 인증 승인/거부 API
 * 
 * 관리자가 사용자의 네이버 카페 가입 인증 요청을 승인하거나 거부합니다.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to admin verify-cafe API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    
    // 관리자 권한 체크 (users 테이블에서 role 확인)
    const { data: adminProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminProfile?.role !== 'admin') {
      logger.warn('Non-admin user attempted to access admin verify-cafe API', { userId: user.id });
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    // 요청 데이터 파싱
    const body = await request.json();
    const { userId, approved, reason } = body;

    // 유효성 검사
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Approval status must be a boolean' },
        { status: 400 }
      );
    }

    // 대상 사용자의 현재 프로필 확인 (profiles VIEW로 읽기)
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')  // 읽기는 profiles VIEW 사용 가능
      .select('id, naver_cafe_nickname, cafe_member_url, naver_cafe_verified')
      .eq('id', userId)
      .single();

    if (profileError || !targetProfile) {
      logger.error('Failed to fetch target profile', profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // 이미 인증된 경우 처리
    if (targetProfile.naver_cafe_verified && approved) {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 400 }
      );
    }

    // 인증 요청 정보가 없는 경우
    if (!targetProfile.naver_cafe_nickname || !targetProfile.cafe_member_url) {
      return NextResponse.json(
        { error: 'No verification request found for this user' },
        { status: 400 }
      );
    }

    if (approved) {
      // 승인 처리
      const { error: updateError } = await supabase
        .from('users')
        .update({
          naver_cafe_verified: true,
          naver_cafe_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        logger.error('Failed to approve verification', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      // 인증 내역 테이블 업데이트 (있는 경우)
      await supabase
        .from('naver_cafe_verifications')
        .update({
          verification_status: 'verified',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          rejection_reason: approved ? null : (reason || '관리자 승인'),
        })
        .eq('user_id', userId)
        .eq('verification_status', 'pending');

      logger.info('Naver cafe verification approved', {
        userId: user.id,
        operation: 'verify-cafe-approve',
        metadata: {
          targetUserId: userId,
          nickname: targetProfile.naver_cafe_nickname
        }
      });

      return NextResponse.json({
        success: true,
        message: '네이버 카페 인증이 승인되었습니다',
        data: {
          userId,
          nickname: targetProfile.naver_cafe_nickname,
          approved: true,
          approvedAt: new Date().toISOString(),
        }
      });
    } else {
      // 거부 처리
      const { error: updateError } = await supabase
        .from('users')
        .update({
          naver_cafe_verified: false,
          naver_cafe_verified_at: null,
          // 거부 시 닉네임과 URL은 유지 (재신청 가능하도록)
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        logger.error('Failed to reject verification', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      // 인증 내역 테이블 업데이트 (있는 경우)
      await supabase
        .from('naver_cafe_verifications')
        .update({
          verification_status: 'rejected',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          rejection_reason: reason || '관리자 거부',
        })
        .eq('user_id', userId)
        .eq('verification_status', 'pending');

      logger.info('Naver cafe verification rejected', {
        userId: user.id,
        operation: 'verify-cafe-reject',
        metadata: {
          targetUserId: userId,
          reason
        }
      });

      return NextResponse.json({
        success: true,
        message: '네이버 카페 인증이 거부되었습니다',
        data: {
          userId,
          approved: false,
          reason,
          rejectedAt: new Date().toISOString(),
        }
      });
    }
  } catch (error) {
    logger.error('Admin verify-cafe API error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 관리자 전용 - 인증 대기 중인 사용자 목록 조회
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(request);
    if (!user) {
      logger.warn('Unauthorized access attempt to admin verify-cafe API');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    
    // 관리자 권한 체크 (users 테이블에서 role 확인)
    const { data: adminProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminProfile?.role !== 'admin') {
      logger.warn('Non-admin user attempted to access admin verify-cafe API', { userId: user.id });
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다' },
        { status: 403 }
      );
    }

    // 인증 대기 중인 사용자 목록 조회 (profiles VIEW로 읽기)
    const { data: pendingUsers, error: fetchError } = await supabase
      .from('profiles')  // 조회는 profiles VIEW 사용 OK
      .select('id, email, username, naver_cafe_nickname, cafe_member_url, created_at, updated_at')
      .eq('naver_cafe_verified', false)
      .not('naver_cafe_nickname', 'is', null)
      .not('cafe_member_url', 'is', null)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      logger.error('Failed to fetch pending verifications', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch pending verifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pendingUsers || [],
      total: pendingUsers?.length || 0,
    });
  } catch (error) {
    logger.error('Admin verify-cafe GET API error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}