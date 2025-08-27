// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(req);
  if (!user) {
    logger.warn('Unauthorized access attempt to coupons validate');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }

  try {
    const supabase = await createSupabaseRouteHandlerClient();

    const body = await req.json();
    const { code, amount, course_id } = body;

    if (!code) {
      return NextResponse.json({ error: '쿠폰 코드가 필요합니다.' }, { status: 400 });
    }

    // 쿠폰 조회 - 유효 기간과 활성 상태 체크
    const { data: coupon, error: coupon_error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .lte('valid_from', new Date().toISOString())
      .single();

    if (coupon_error || !coupon) {
      return NextResponse.json({ error: '유효하지 않은 쿠폰입니다.' }, { status: 400 });
    }

    // 사용 제한 체크 (max_usage 필드 사용)
    if (coupon.max_usage && (coupon.usage_count || 0) >= coupon.max_usage) {
      return NextResponse.json({ error: '사용 한도 초과' }, { status: 400 });
    }

    // 강의별 쿠폰인 경우 체크
    if (coupon.course_id && course_id && coupon.course_id !== course_id) {
      return NextResponse.json(
        { error: '이 강의에는 사용할 수 없는 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 사용자별 사용 횟수 체크 (같은 쿠폰 중복 사용 방지)
    const { data: user_usage, error: usage_error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('coupon_id', coupon.id)
      .eq('status', 'completed');

    if (!usage_error && user_usage && user_usage.length > 0) {
      return NextResponse.json({ error: '이미 사용한 쿠폰입니다.' }, { status: 400 });
    }

    // amount가 제공되거나 course_id로 강의 가격 조회
    let price_to_discount = amount;
    
    if (!price_to_discount && course_id) {
      const { data: course, error: course_error } = await supabase
        .from('courses')
        .select('price')
        .eq('id', course_id)
        .single();

      if (course_error || !course) {
        return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 });
      }
      
      price_to_discount = course.price;
    }
    
    if (!price_to_discount) {
      return NextResponse.json({ error: '할인을 적용할 금액이 필요합니다.' }, { status: 400 });
    }

    // 할인 계산
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round(price_to_discount * (coupon.discount_value / 100));
      // max_discount_amount 필드가 DB에 없으므로 제외
    } else {
      discount = Math.min(coupon.discount_value, price_to_discount);
    }

    const finalAmount = Math.max(0, price_to_discount - discount);

    return NextResponse.json({
      valid: true,
      discount,
      finalAmount,
      originalAmount: price_to_discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        validUntil: coupon.valid_until,
      }
    });
  } catch (error) {
    logger.error('API error in coupon validation:', error);
    return NextResponse.json({ error: '쿠폰 검증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
