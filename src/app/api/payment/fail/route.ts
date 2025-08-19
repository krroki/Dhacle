import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';

export async function POST(req: NextRequest) {
  try {
    // 세션 검사
    const authSupabase = createRouteHandlerClient({ cookies });
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { orderId, code, message } = body;

    if (!orderId) {
      return NextResponse.json({ error: '주문 ID가 누락되었습니다.' }, { status: 400 });
    }

    const supabase = await createClient();

    // 구매 상태를 실패로 업데이트
    const { data: purchase, error: updateError } = await supabase
      .from('purchases')
      .update({
        status: 'failed',
        failedAt: new Date().toISOString(),
        failureReason: message || code || '결제 실패',
      })
      .eq('paymentIntentId', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('구매 상태 업데이트 실패:', updateError);
      return NextResponse.json({ error: '주문 상태 업데이트에 실패했습니다.' }, { status: 500 });
    }

    // 쿠폰 사용 횟수 되돌리기
    if (purchase?.couponId) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('usageCount')
        .eq('id', purchase.couponId)
        .single();

      if (coupon && coupon.usageCount > 0) {
        await supabase
          .from('coupons')
          .update({
            usageCount: coupon.usageCount - 1,
          })
          .eq('id', purchase.couponId);
      }
    }

    return NextResponse.json({
      success: true,
      message: '결제가 실패했습니다.',
      purchase,
    });
  } catch (error) {
    console.error('결제 실패 처리 중 오류:', error);
    return NextResponse.json({ error: '결제 실패 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
