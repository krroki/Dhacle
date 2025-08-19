import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 });
    }

    const body = await req.json();
    const { courseId, couponCode } = body;

    // 강의 정보 조회
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 구매했는지 확인
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: '이미 구매한 강의입니다.' },
        { status: 400 }
      );
    }

    let finalPrice = course.price;
    let appliedCoupon = null;

    // 쿠폰 적용
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (!couponError && coupon) {
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = new Date(coupon.valid_until);

        if (now >= validFrom && now <= validUntil) {
          if (coupon.discount_type === 'percentage') {
            finalPrice = Math.round(course.price * (1 - coupon.discount_value / 100));
          } else {
            finalPrice = Math.max(0, course.price - coupon.discount_value);
          }
          
          appliedCoupon = coupon;

          // 쿠폰 사용 횟수 증가
          await supabase
            .from('coupons')
            .update({ 
              usage_count: (coupon.usage_count || 0) + 1 
            })
            .eq('id', coupon.id);
        }
      }
    }

    // 주문 ID 생성 (고유해야 함)
    const orderId = `ORDER_${Date.now()}_${courseId}_${user.id.substring(0, 8)}`;

    // 구매 레코드 생성 (pending 상태)
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        course_id: courseId,
        amount: course.price,
        final_amount: finalPrice,
        payment_method: 'tosspayments',
        payment_intent_id: orderId, // 주문 ID 저장
        status: 'pending',
        coupon_id: appliedCoupon?.id,
      })
      .select()
      .single();

    if (purchaseError) {
      return NextResponse.json(
        { error: '구매 처리 중 오류가 발생했습니다.' },
        { status: 500 }
      );
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
      orderId,
      amount: finalPrice,
      orderName: course.title,
      customerName: profile?.username || '고객',
      customerEmail: profile?.email || user.email,
      purchaseId: purchase.id,
      appliedCoupon: appliedCoupon ? {
        code: appliedCoupon.code,
        discountType: appliedCoupon.discount_type,
        discountValue: appliedCoupon.discount_value,
      } : null,
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}