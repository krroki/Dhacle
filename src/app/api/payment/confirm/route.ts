// Use Node.js runtime for Supabase compatibility
export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import type { Json } from '@/types';
import { env } from '@/env';
import { requireAuth } from '@/lib/api-auth';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createInternalServerErrorResponse, 
  createValidationErrorResponse 
} from '@/lib/api-error-utils';

const toss_secret_key = env.TOSS_SECRET_KEY;

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Step 1: Authentication check (required!)
  const user = await requireAuth(req);
  if (!user) {
    logger.warn('Unauthorized access attempt to payment confirm');
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return createValidationErrorResponse(
        'Required payment parameters missing',
        { missing: { paymentKey: !paymentKey, orderId: !orderId, amount: !amount } }
      );
    }

    if (!toss_secret_key) {
      return createInternalServerErrorResponse(
        'Payment system configuration error',
        'TOSS_SECRET_KEY_MISSING'
      );
    }

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', { // External API: TossPayments
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${toss_secret_key}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const payment_data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: payment_data.message || '결제 승인에 실패했습니다.',
          code: payment_data.code,
        },
        { status: response.status }
      );
    }

    // Supabase 업데이트
    const supabase = await createSupabaseRouteHandlerClient();

    // 구매 상태 업데이트
    const { data: purchase, error: update_error } = await supabase
      .from('purchases')
      .update({
        payment_status: 'succeeded',
        updated_at: new Date().toISOString(),
        payment_method: 'toss', // 토스페이먼츠 결제 방식
        payment_data: { paymentKey } satisfies Json, // 토스페이먼츠 결제 키 저장
      })
      .eq('payment_id', orderId)
      .select()
      .single();

    if (update_error) {
      // 토스페이먼츠 결제 취소 API 호출 (보상 트랜잭션)
      await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, { // External API: TossPayments
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${toss_secret_key}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: '주문 처리 중 오류 발생',
        }),
      });

      return createInternalServerErrorResponse(
        'Order processing failed after payment confirmation',
        'ORDER_PROCESSING_FAILED'
      );
    }

    if (purchase) {
      // 수강 등록
      await supabase.from('enrollments').upsert(
        {
          user_id: purchase.user_id || '',
          course_id: purchase.course_id || '',
          enrolled_at: new Date().toISOString(),
          is_active: true,
        },
        {
          onConflict: 'user_id,course_id',
        }
      );

      // 강의 수강생 수 증가
      const { data: course } = await supabase
        .from('courses')
        .select('total_students')
        .eq('id', purchase.course_id || '')
        .single();

      if (course) {
        await supabase
          .from('courses')
          .update({
            total_students: (course.total_students || 0) + 1,
          })
          .eq('id', purchase.course_id || '');
      }

      // 이메일 알림 (추후 구현)
      // await sendPurchaseConfirmationEmail(purchase);
    }

    return createSuccessResponse({
      purchase,
      payment: {
        method: payment_data.method,
        approvedAt: payment_data.approvedAt,
        receipt: payment_data.receipt,
      },
    }, 'Payment confirmed and order processed successfully');
  } catch (error) {
    logger.error('Payment confirm API error:', error);
    return createInternalServerErrorResponse(
      'Payment processing failed due to server error',
      'PAYMENT_PROCESSING_FAILED'
    );
  }
}
