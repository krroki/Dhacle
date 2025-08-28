// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server-client';
import type { Json } from '@/types';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Authentication check (required!)
    const user = await requireAuth(req);
    if (!user) {
      logger.warn('Unauthorized access attempt to payment fail');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId, code, message } = body;

    if (!orderId) {
      return NextResponse.json({ error: '주문 ID가 누락되었습니다.' }, { status: 400 });
    }

    const supabase = await createClient();

    // 구매 상태를 실패로 업데이트
    const { data: purchase, error: update_error } = await supabase
      .from('purchases')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
        payment_data: { failureReason: message || code || '결제 실패' } satisfies Json,
      })
      .eq('payment_id', orderId)
      .select()
      .single();

    if (update_error) {
      return NextResponse.json({ error: '주문 상태 업데이트에 실패했습니다.' }, { status: 500 });
    }

    // 쿠폰 사용 횟수 되돌리기
    if (purchase?.coupon_id) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('usage_count')
        .eq('id', purchase.coupon_id)
        .single();

      if (coupon && coupon.usage_count && coupon.usage_count > 0) {
        await supabase
          .from('coupons')
          .update({
            usage_count: coupon.usage_count - 1,
          })
          .eq('id', purchase.coupon_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: '결제가 실패했습니다.',
      purchase,
    });
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json({ error: '결제 실패 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
