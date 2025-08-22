// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { couponCode, course_id } = body;

    if (!couponCode || !course_id) {
      return NextResponse.json({ error: '쿠폰 코드와 강의 ID가 필요합니다.' }, { status: 400 });
    }

    // 쿠폰 조회
    const { data: coupon, error: coupon_error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (coupon_error || !coupon) {
      return NextResponse.json({ error: '유효하지 않은 쿠폰 코드입니다.' }, { status: 400 });
    }

    // 유효 기간 체크
    const now = new Date();
    const valid_from = new Date(coupon.validFrom);
    const valid_until = new Date(coupon.validUntil);

    if (now < valid_from) {
      return NextResponse.json({ error: '아직 사용할 수 없는 쿠폰입니다.' }, { status: 400 });
    }

    if (now > valid_until) {
      return NextResponse.json({ error: '만료된 쿠폰입니다.' }, { status: 400 });
    }

    // 최대 사용 횟수 체크
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      return NextResponse.json({ error: '사용 한도를 초과한 쿠폰입니다.' }, { status: 400 });
    }

    // 강의별 쿠폰인 경우 체크
    if (coupon.course_id && coupon.course_id !== course_id) {
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
      .eq('couponId', coupon.id)
      .eq('status', 'completed');

    if (!usage_error && user_usage && user_usage.length > 0) {
      return NextResponse.json({ error: '이미 사용한 쿠폰입니다.' }, { status: 400 });
    }

    // 강의 가격 조회
    const { data: course, error: course_error } = await supabase
      .from('courses')
      .select('price')
      .eq('id', course_id)
      .single();

    if (course_error || !course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 할인 금액 계산
    let discount_amount = 0;
    let final_price = course.price;

    if (coupon.discountType === 'percentage') {
      discount_amount = Math.round(course.price * (coupon.discountValue / 100));
      final_price = course.price - discount_amount;
    } else {
      discount_amount = Math.min(coupon.discountValue, course.price);
      final_price = Math.max(0, course.price - coupon.discountValue);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        validUntil: coupon.validUntil,
      },
      discount: {
        originalPrice: course.price,
        discountAmount: discount_amount,
        finalPrice: final_price,
        discountPercentage: Math.round((discount_amount / course.price) * 100),
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: '쿠폰 검증 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
