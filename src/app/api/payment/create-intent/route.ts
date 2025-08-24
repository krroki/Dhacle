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
    const { course_id, couponCode } = body;

    // 강의 정보 조회
    const { data: course, error: course_error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single();

    if (course_error || !course) {
      return NextResponse.json({ error: '강의를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이미 구매했는지 확인
    const { data: existing_purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course_id)
      .eq('status', 'completed')
      .single();

    if (existing_purchase) {
      return NextResponse.json({ error: '이미 구매한 강의입니다.' }, { status: 400 });
    }

    const final_price = course.price;
    // @ts-expect-error - 쿠폰 기능 구현 대기 중
    const _applied_coupon: { id: string; code: string; discountType: string; discountValue: number } | null = null;

    // TODO: coupons 테이블이 없어서 임시로 비활성화
    // 쿠폰 적용
    if (couponCode) {
      // 쿠폰 기능 임시 비활성화
      return NextResponse.json(
        { error: '쿠폰 기능은 현재 준비 중입니다.' },
        { status: 503 }
      );
      
      /* 원본 코드 - coupons 테이블 생성 후 활성화 필요
      const { data: coupon, error: coupon_error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (!coupon_error && coupon) {
        const now = new Date();
        const valid_from = new Date(coupon.validFrom);
        const valid_until = new Date(coupon.validUntil);

        if (now >= valid_from && now <= valid_until) {
          if (coupon.discountType === 'percentage') {
            final_price = Math.round(course.price * (1 - coupon.discountValue / 100));
          } else {
            final_price = Math.max(0, course.price - coupon.discountValue);
          }

          applied_coupon = coupon;

          // 쿠폰 사용 횟수 증가
          await supabase
            .from('coupons')
            .update({
              usageCount: (coupon.usageCount || 0) + 1,
            })
            .eq('id', coupon.id);
        }
      }
      */
    }

    // 주문 ID 생성 (고유해야 함)
    const order_id = `ORDER_${Date.now()}_${course_id}_${user.id.substring(0, 8)}`;

    // 구매 레코드 생성 (pending 상태)
    const { data: purchase, error: purchase_error } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        course_id: course_id,
        amount: course.price,
        final_amount: final_price,  // snake_case로 변경
        payment_method: 'tosspayments',
        payment_intent_id: order_id, // snake_case로 변경
        status: 'pending',
        coupon_id: null,  // 쿠폰 기능 비활성화 중
      })
      .select()
      .single();

    if (purchase_error) {
      return NextResponse.json({ error: '구매 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')  // email 필드 제거 (profiles 테이블에 없음)
      .eq('id', user.id)
      .single();

    // 토스페이먼츠는 프론트엔드에서 직접 결제 요청
    // 서버는 주문 정보만 생성
    return NextResponse.json({
      orderId: order_id,
      amount: final_price,
      orderName: course.title,
      customerName: profile?.username || '고객',
      customerEmail: user.email,  // user.email 직접 사용
      purchaseId: purchase.id,
      // 쿠폰 기능이 비활성화되어 있으므로 항상 null
      appliedCoupon: null,
      /* 쿠폰 기능 활성화 시 사용
      appliedCoupon: applied_coupon
        ? {
            code: applied_coupon.code,
            discountType: applied_coupon.discountType,
            discountValue: applied_coupon.discountValue,
          }
        : null,
      */
    });
  } catch (_error) {
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
