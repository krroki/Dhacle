// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { type NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(req);
    if (!user) {
      logger.warn('Unauthorized access attempt to payment create-intent');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseRouteHandlerClient();

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

    // 쿠폰 적용 로직
    let final_price = course.price;
    let applied_coupon: {
      id: string;
      code: string;
      description?: string | null;
      discount_type: string;
      discount_value: number;
    } | null = null;

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (coupon) {
        // 유효 기간 체크
        const now = new Date();
        const valid_from = new Date(coupon.valid_from);
        const valid_until = new Date(coupon.valid_until);

        if (now >= valid_from && now <= valid_until) {
          // 사용 제한 체크
          if (!coupon.max_usage || (coupon.usage_count || 0) < coupon.max_usage) {
            // 강의별 쿠폰 체크
            if (!coupon.course_id || coupon.course_id === course_id) {
              // 할인 적용
              let discount = 0;
              if (coupon.discount_type === 'percentage') {
                discount = Math.round(course.price * (coupon.discount_value / 100));
              } else {
                discount = coupon.discount_value;
              }
              
              final_price = Math.max(0, course.price - discount);
              applied_coupon = coupon;

              // 사용 횟수 증가
              await supabase
                .from('coupons')
                .update({ usage_count: (coupon.usage_count || 0) + 1 })
                .eq('id', coupon.id);
            }
          }
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
        final_amount: final_price,  // snake_case로 변경
        payment_method: 'tosspayments',
        payment_intent_id: order_id, // snake_case로 변경
        status: 'pending',
        coupon_id: applied_coupon?.id || null,  // 쿠폰 ID 저장
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
      appliedCoupon: applied_coupon
        ? {
            id: applied_coupon.id,
            code: applied_coupon.code,
            description: applied_coupon.description,
            discountType: applied_coupon.discount_type,
            discountValue: applied_coupon.discount_value,
          }
        : null,
    });
  } catch (error) {
    logger.error('Payment intent creation failed:', error);
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
