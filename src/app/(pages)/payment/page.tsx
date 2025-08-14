'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/browser-client';
import type { Course } from '@/types/course';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ courseId }: { courseId: string; purchaseId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<{ 
    clientSecret: string; 
    finalPrice: number;
    appliedCoupon?: { code: string; discountValue: number };
  } | null>(null);

  useEffect(() => {
    loadCourseData();
    createPaymentIntent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadCourseData = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (data) {
      setCourse(data);
    }
  };

  const createPaymentIntent = async () => {
    try {
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });

      if (!response.ok) {
        throw new Error('결제 초기화에 실패했습니다.');
      }

      const data = await response.json();
      setPaymentIntent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const card = elements.getElement(CardElement);
    
    if (!card) {
      setError('카드 정보를 확인할 수 없습니다.');
      setIsProcessing(false);
      return;
    }

    try {
      // Confirm the payment
      const { error: confirmError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: card,
          }
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (confirmedIntent?.status === 'succeeded') {
        // 결제 성공
        router.push(`/payment/success?courseId=${courseId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '결제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 강의 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>주문 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{course.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {course.instructor_name}
              </p>
            </div>
            <Badge variant="secondary">
              ₩{paymentIntent?.finalPrice?.toLocaleString() || course.price.toLocaleString()}
            </Badge>
          </div>
          
          {paymentIntent?.appliedCoupon && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">
                쿠폰 적용: {paymentIntent.appliedCoupon.code} 
                ({paymentIntent.appliedCoupon.discountValue}% 할인)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 카드 정보 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            결제 정보
          </CardTitle>
          <CardDescription>
            카드 정보를 안전하게 입력해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444',
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>결제 정보는 암호화되어 안전하게 처리됩니다</span>
          </div>
        </CardContent>
      </Card>

      {/* 결제 버튼 */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            결제 처리중...
          </>
        ) : (
          <>
            ₩{paymentIntent?.finalPrice?.toLocaleString() || course.price.toLocaleString()} 결제하기
          </>
        )}
      </Button>

      {/* 환불 정책 */}
      <div className="text-center text-sm text-muted-foreground">
        <p>7일 이내 100% 환불 가능</p>
        <p className="mt-1">결제 후 바로 수강하실 수 있습니다</p>
      </div>
    </form>
  );
}

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const purchaseId = searchParams.get('purchaseId');

  if (!courseId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertDescription>잘못된 접근입니다.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">결제하기</h1>
        <p className="text-muted-foreground">
          안전한 결제를 위해 카드 정보를 입력해주세요
        </p>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutForm courseId={courseId} purchaseId={purchaseId || ''} />
      </Elements>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}