import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }

    const body = await req.json();
    const { couponCode, courseId } = body;

    if (!couponCode || !courseId) {
      return NextResponse.json(
        { error: '쿠폰 코드와 강의 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 쿠폰 조회
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: '유효하지 않은 쿠폰 코드입니다.' },
        { status: 400 }
      );
    }

    // 유효 기간 체크
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      return NextResponse.json(
        { error: '아직 사용할 수 없는 쿠폰입니다.' },
        { status: 400 }
      );
    }

    if (now > validUntil) {
      return NextResponse.json(
        { error: '만료된 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 최대 사용 횟수 체크
    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage) {
      return NextResponse.json(
        { error: '사용 한도를 초과한 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 강의별 쿠폰인 경우 체크
    if (coupon.course_id && coupon.course_id !== courseId) {
      return NextResponse.json(
        { error: '이 강의에는 사용할 수 없는 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 사용자별 사용 횟수 체크 (같은 쿠폰 중복 사용 방지)
    const { data: userUsage, error: usageError } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('coupon_id', coupon.id)
      .eq('status', 'completed');

    if (!usageError && userUsage && userUsage.length > 0) {
      return NextResponse.json(
        { error: '이미 사용한 쿠폰입니다.' },
        { status: 400 }
      );
    }

    // 강의 가격 조회
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('price')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 할인 금액 계산
    let discountAmount = 0;
    let finalPrice = course.price;

    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round(course.price * (coupon.discount_value / 100));
      finalPrice = course.price - discountAmount;
    } else {
      discountAmount = Math.min(coupon.discount_value, course.price);
      finalPrice = Math.max(0, course.price - coupon.discount_value);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        validUntil: coupon.valid_until,
      },
      discount: {
        originalPrice: course.price,
        discountAmount,
        finalPrice,
        discountPercentage: Math.round((discountAmount / course.price) * 100),
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: '쿠폰 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}