import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { Json } from '@/types';
import { createClient } from '@/lib/supabase/server-client';

const tossSecretKey = process.env.TOSS_SECRET_KEY;

export async function POST(req: NextRequest) {
  // 세션 검사
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'User not authenticated' },
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  try {
    const body = await req.json();
    const { paymentKey, orderId, amount } = body;

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
    }

    if (!tossSecretKey) {
      return NextResponse.json({ error: '결제 시스템 설정 오류' }, { status: 500 });
    }

    // 토스페이먼츠 결제 승인 API 호출
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${tossSecretKey}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const paymentData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: paymentData.message || '결제 승인에 실패했습니다.',
          code: paymentData.code,
        },
        { status: response.status }
      );
    }

    // Supabase 업데이트
    const supabase = await createClient();

    // 구매 상태 업데이트
    const { data: purchase, error: updateError } = await supabase
      .from('purchases')
      .update({
        payment_status: 'succeeded',
        updated_at: new Date().toISOString(),
        payment_method: 'toss', // 토스페이먼츠 결제 방식
        payment_data: { paymentKey } as unknown as Json, // 토스페이먼츠 결제 키 저장
      })
      .eq('payment_id', orderId)
      .select()
      .single();

    if (updateError) {
      // 토스페이먼츠 결제 취소 API 호출 (보상 트랜잭션)
      await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${tossSecretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: '주문 처리 중 오류 발생',
        }),
      });

      return NextResponse.json({ error: '주문 처리 중 오류가 발생했습니다.' }, { status: 500 });
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

    return NextResponse.json({
      success: true,
      purchase,
      payment: {
        method: paymentData.method,
        approvedAt: paymentData.approvedAt,
        receipt: paymentData.receipt,
      },
    });
  } catch (_error) {
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
