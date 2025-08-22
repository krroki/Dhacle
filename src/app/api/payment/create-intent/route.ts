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

    let final_price = course.price;
    let applied_coupon = null;

    // 쿠폰 적용
    if (couponCode) {
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
        finalAmount: final_price,
        payment_method: 'tosspayments',
        paymentIntentId: order_id, // 주문 ID 저장
        status: 'pending',
        couponId: applied_coupon?.id,
      })
      .select()
      .single();

    if (purchase_error) {
      return NextResponse.json({ error: '구매 처리 중 오류가 발생했습니다.' }, { status: 500 });
    }

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', user.id)
      .single();

    // 토스페이먼츠는 프론트엔드에서 직접 결제 요청
    // 서버는 주문 정보만 생성
    return NextResponse.json({
      orderId: order_id,
      amount: final_price,
      orderName: course.title,
      customerName: profile?.username || '고객',
      customerEmail: profile?.email || user.email,
      purchaseId: purchase.id,
      appliedCoupon: applied_coupon
        ? {
            code: applied_coupon.code,
            discountType: applied_coupon.discountType,
            discountValue: applied_coupon.discountValue,
          }
        : null,
    });
  } catch (_error) {
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
