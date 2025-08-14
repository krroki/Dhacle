import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server-client';
import { headers } from 'next/headers';

const stripeKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2025-07-30.basil',
}) : null;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // 구매 상태 업데이트
        const { error: updateError } = await supabase
          .from('purchases')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', paymentIntent.id);

        if (updateError) {
          console.error('Failed to update purchase:', updateError);
          return NextResponse.json(
            { error: 'Failed to update purchase' },
            { status: 500 }
          );
        }

        // 구매 정보 조회
        const { data: purchase } = await supabase
          .from('purchases')
          .select('*')
          .eq('payment_intent_id', paymentIntent.id)
          .single();

        if (purchase) {
          // 수강 등록
          await supabase
            .from('enrollments')
            .upsert({
              user_id: purchase.user_id,
              course_id: purchase.course_id,
              enrolled_at: new Date().toISOString(),
              is_active: true,
            }, {
              onConflict: 'user_id,course_id',
            });

          // 강의 수강생 수 증가
          const { data: course } = await supabase
            .from('courses')
            .select('student_count')
            .eq('id', purchase.course_id)
            .single();

          if (course) {
            await supabase
              .from('courses')
              .update({ 
                student_count: (course.student_count || 0) + 1 
              })
              .eq('id', purchase.course_id);
          }

          // 이메일 알림 (추후 구현)
          // await sendPurchaseConfirmationEmail(purchase);
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // 구매 상태를 실패로 업데이트
        await supabase
          .from('purchases')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', paymentIntent.id);

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        if (charge.payment_intent) {
          // 환불 처리
          const { data: purchase } = await supabase
            .from('purchases')
            .select('*')
            .eq('payment_intent_id', charge.payment_intent)
            .single();

          if (purchase) {
            // 구매 상태 업데이트
            await supabase
              .from('purchases')
              .update({
                status: 'refunded',
                refunded_at: new Date().toISOString(),
                refund_amount: charge.amount_refunded,
              })
              .eq('id', purchase.id);

            // 수강 비활성화
            await supabase
              .from('enrollments')
              .update({
                is_active: false,
                unenrolled_at: new Date().toISOString(),
              })
              .eq('user_id', purchase.user_id)
              .eq('course_id', purchase.course_id);

            // 강의 수강생 수 감소
            const { data: course } = await supabase
              .from('courses')
              .select('student_count')
              .eq('id', purchase.course_id)
              .single();

            if (course && course.student_count > 0) {
              await supabase
                .from('courses')
                .update({ 
                  student_count: course.student_count - 1 
                })
                .eq('id', purchase.course_id);
            }
          }
        }

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        // 구독 관련 처리 (추후 구현)
        console.log('Subscription event:', event.type);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Stripe 웹훅은 원시 body가 필요하므로 bodyParser 비활성화
export const runtime = 'nodejs';