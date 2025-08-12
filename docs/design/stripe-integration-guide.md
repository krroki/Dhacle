# 💳 Stripe 결제 연동 가이드

## 📋 사전 준비사항

### Stripe 계정 설정
1. [Stripe Dashboard](https://dashboard.stripe.com) 계정 생성
2. 사업자 정보 입력 (한국 사업자)
3. 은행 계좌 연결
4. KYC 인증 완료

### API 키 발급
```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx  # 테스트 키
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx  # 공개 키
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # Webhook 시크릿
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

## 🔧 설치 및 설정

### 1. 패키지 설치
```bash
npm install stripe @stripe/stripe-js
npm install --save-dev @types/stripe
```

### 2. Stripe 클라이언트 설정
```typescript
// src/lib/stripe/client.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);
```

```typescript
// src/lib/stripe/server.ts
import Stripe from 'stripe';

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  {
    apiVersion: '2023-10-16',
    typescript: true,
  }
);
```

## 💰 가격 체계 설정

### Stripe 제품 생성
```typescript
// scripts/create-stripe-products.ts
const products = [
  {
    name: '무료 강의 다시보기',
    price: 3000,
    currency: 'krw',
    metadata: { type: 'replay' }
  },
  {
    name: '4주 일반 과정',
    price: 50000,
    currency: 'krw',
    metadata: { type: 'course_4w_basic' }
  },
  {
    name: '4주 프리미엄 과정',
    price: 100000,
    currency: 'krw',
    metadata: { type: 'course_4w_premium' }
  },
  {
    name: '8주 프리미엄 과정',
    price: 200000,
    currency: 'krw',
    metadata: { type: 'course_8w_premium' }
  }
];

// Stripe에 제품 생성
for (const product of products) {
  const stripeProduct = await stripe.products.create({
    name: product.name,
    metadata: product.metadata
  });
  
  await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: product.price,
    currency: product.currency,
  });
}
```

## 🛒 결제 플로우 구현

### 1. Checkout Session 생성 API
```typescript
// app/api/stripe/create-checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { courseId } = await req.json();
    
    // 사용자 인증 확인
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }
    
    // 강의 정보 조회
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (!course) {
      return NextResponse.json(
        { error: '강의를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    // 이미 수강 중인지 확인
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();
    
    if (enrollment) {
      return NextResponse.json(
        { error: '이미 수강 중인 강의입니다' },
        { status: 400 }
      );
    }
    
    // Stripe Checkout 세션 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'krw',
            product_data: {
              name: course.title,
              description: `${course.instructor_name} 강사 | ${course.duration_weeks}주 과정`,
              images: course.thumbnail_url ? [course.thumbnail_url] : [],
            },
            unit_amount: course.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}?enrolled=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/courses/${courseId}?canceled=true`,
      metadata: {
        courseId: courseId,
        userId: user.id,
        userEmail: user.email || '',
      },
      customer_email: user.email,
    });
    
    return NextResponse.json({ url: session.url });
    
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: '결제 세션 생성에 실패했습니다' },
      { status: 500 }
    );
  }
}
```

### 2. 결제 버튼 컴포넌트
```typescript
// components/courses/EnrollButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// styled-components 기반 디자인 시스템 사용
import { StripeButton } from '@/components/design-system';

interface EnrollButtonProps {
  courseId: string;
  price: number;
}

export function EnrollButton({ courseId, price }: EnrollButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const handleEnroll = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      
      const data = await response.json();
      
      if (data.url) {
        // Stripe Checkout 페이지로 리다이렉트
        window.location.href = data.url;
      } else {
        alert(data.error || '결제 페이지로 이동할 수 없습니다');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <StripeButton
      onClick={handleEnroll}
      disabled={loading}
      loading={loading}
      size="lg"
      variant="primary"
    >
      {price === 0 ? '무료 수강하기' : `₩${price.toLocaleString()} 결제하기`}
    </StripeButton>
  );
}
```

## 🔔 Webhook 처리

### 1. Webhook 엔드포인트
```typescript
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }
  
  const supabase = createClient();
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // 메타데이터에서 정보 추출
      const { courseId, userId, userEmail } = session.metadata!;
      
      // enrollment 생성
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          payment_id: session.payment_intent as string,
          payment_status: 'completed',
          payment_amount: session.amount_total,
          payment_method: 'card',
        });
      
      if (enrollError) {
        console.error('Enrollment creation failed:', enrollError);
        return NextResponse.json(
          { error: 'Failed to create enrollment' },
          { status: 500 }
        );
      }
      
      // 이메일 알림 (선택사항)
      // await sendEnrollmentEmail(userEmail, courseId);
      
      break;
    }
    
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // 실패 처리
      const { error } = await supabase
        .from('enrollments')
        .update({ payment_status: 'failed' })
        .eq('payment_id', paymentIntent.id);
      
      if (error) {
        console.error('Payment status update failed:', error);
      }
      
      break;
    }
    
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      
      // 환불 처리
      const { error } = await supabase
        .from('enrollments')
        .update({ 
          payment_status: 'refunded',
          is_active: false 
        })
        .eq('payment_id', charge.payment_intent);
      
      if (error) {
        console.error('Refund status update failed:', error);
      }
      
      break;
    }
  }
  
  return NextResponse.json({ received: true });
}
```

### 2. Webhook 설정 (Stripe Dashboard)
```
Endpoint URL: https://your-domain.com/api/stripe/webhook

Events to listen:
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded
```

## 🧪 테스트

### 테스트 카드 번호
```
성공: 4242 4242 4242 4242
실패: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

### 테스트 시나리오
```typescript
// tests/stripe-integration.test.ts
describe('Stripe Integration', () => {
  it('should create checkout session', async () => {
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ courseId: 'test-course-id' }),
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.url).toContain('checkout.stripe.com');
  });
  
  it('should handle webhook correctly', async () => {
    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            courseId: 'test-course',
            userId: 'test-user',
          },
        },
      },
    };
    
    // Webhook 처리 테스트
  });
});
```

## 🚀 프로덕션 체크리스트

### 배포 전 확인사항
- [ ] 프로덕션 API 키로 교체
- [ ] Webhook 엔드포인트 등록
- [ ] 환불 정책 페이지 생성
- [ ] 이용약관 페이지 생성
- [ ] SSL 인증서 확인
- [ ] PCI 컴플라이언스 준수

### 보안 체크리스트
- [ ] API 키 환경변수 설정
- [ ] Webhook 서명 검증
- [ ] CORS 설정
- [ ] Rate limiting
- [ ] SQL Injection 방지
- [ ] XSS 방지

### 모니터링
- [ ] Stripe Dashboard 알림 설정
- [ ] 결제 실패 알림
- [ ] 환불 요청 알림
- [ ] 이상 거래 감지

## 📊 결제 분석

### 추적할 메트릭
- 전환율 (방문 → 결제)
- 평균 결제 금액
- 결제 실패율
- 환불율
- 인기 강의

### 분석 도구
```typescript
// lib/analytics/stripe-analytics.ts
export async function getPaymentMetrics(startDate: Date, endDate: Date) {
  const charges = await stripe.charges.list({
    created: {
      gte: Math.floor(startDate.getTime() / 1000),
      lte: Math.floor(endDate.getTime() / 1000),
    },
  });
  
  return {
    totalRevenue: charges.data.reduce((sum, charge) => sum + charge.amount, 0),
    transactionCount: charges.data.length,
    averageTransaction: charges.data.length > 0 
      ? charges.data.reduce((sum, charge) => sum + charge.amount, 0) / charges.data.length 
      : 0,
    failureRate: charges.data.filter(c => c.status === 'failed').length / charges.data.length,
  };
}
```

## 🔧 트러블슈팅

### 일반적인 문제 해결

#### 1. Webhook 수신 실패
```bash
# Stripe CLI로 로컬 테스트
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### 2. 결제 실패 처리
```typescript
// 재시도 로직
const MAX_RETRIES = 3;
let retries = 0;

while (retries < MAX_RETRIES) {
  try {
    await processPayment();
    break;
  } catch (error) {
    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000 * retries));
  }
}
```

#### 3. 중복 결제 방지
```typescript
// Idempotency key 사용
const idempotencyKey = `${userId}-${courseId}-${Date.now()}`;
const session = await stripe.checkout.sessions.create(
  { /* ... */ },
  { idempotencyKey }
);
```

## 📚 참고 자료

- [Stripe 공식 문서](https://stripe.com/docs)
- [Stripe Next.js 예제](https://github.com/vercel/next.js/tree/canary/examples/with-stripe-typescript)
- [한국 결제 가이드](https://stripe.com/docs/payments/cards/supported-card-brands#asia-pacific)
- [Webhook 보안](https://stripe.com/docs/webhooks/best-practices)

---

*작성일: 2025-01-11*
*버전: 1.0*
*작성자: PM AI*