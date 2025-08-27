// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

// GET - 모든 쿠폰 조회 (관리자용)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(req);
    if (!user) {
      logger.warn('Unauthorized access attempt to admin coupons');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    
    // 관리자 권한 체크
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 });
    }

    // 쿠폰 목록 조회
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch coupons:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(coupons || []);
  } catch (error) {
    logger.error('API error in admin coupons GET:', error);
    return NextResponse.json({ error: '쿠폰 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST - 새 쿠폰 생성 (관리자용)
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(req);
    if (!user) {
      logger.warn('Unauthorized access attempt to create coupon');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    
    // 관리자 권한 체크
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      course_id,
      max_usage,
      valid_from,
      valid_until,
      is_active = true
    } = body;

    // 필수 필드 검증
    if (!code || !discount_type || !discount_value || !valid_until) {
      return NextResponse.json({ 
        error: '필수 필드가 누락되었습니다. (code, discount_type, discount_value, valid_until)' 
      }, { status: 400 });
    }

    // 쿠폰 코드 중복 체크
    const { data: existing } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code.toUpperCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 409 });
    }

    // 쿠폰 생성
    const { data: newCoupon, error } = await supabase
      .from('coupons')
      .insert({
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        course_id,
        max_usage,
        usage_count: 0,
        valid_from: valid_from || new Date().toISOString(),
        valid_until,
        is_active,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to create coupon:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    logger.error('API error in admin coupons POST:', error);
    return NextResponse.json({ error: '쿠폰 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PATCH - 쿠폰 수정 (관리자용)
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(req);
    if (!user) {
      logger.warn('Unauthorized access attempt to update coupon');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    
    // 관리자 권한 체크
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: '쿠폰 ID가 필요합니다.' }, { status: 400 });
    }

    // 쿠폰 업데이트
    const { data: updatedCoupon, error } = await supabase
      .from('coupons')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update coupon:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updatedCoupon);
  } catch (error) {
    logger.error('API error in admin coupons PATCH:', error);
    return NextResponse.json({ error: '쿠폰 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE - 쿠폰 삭제 (관리자용)
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(req);
    if (!user) {
      logger.warn('Unauthorized access attempt to delete coupon');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();
    
    // 관리자 권한 체크
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: '권한 없음' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '쿠폰 ID가 필요합니다.' }, { status: 400 });
    }

    // Soft delete - is_active를 false로 설정
    const { error } = await supabase
      .from('coupons')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      logger.error('Failed to delete coupon:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: '쿠폰이 비활성화되었습니다.' });
  } catch (error) {
    logger.error('API error in admin coupons DELETE:', error);
    return NextResponse.json({ error: '쿠폰 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}