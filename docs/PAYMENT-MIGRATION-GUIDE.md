# 💳 Stripe → 토스페이먼츠 마이그레이션 가이드

## 🚨 중요: 왜 토스페이먼츠로 전환해야 하나요?

### Stripe의 한계
- ❌ **한국 미지원**: Stripe는 한국 사업자를 공식 지원하지 않음
- ❌ **미국 법인 필요**: Stripe Atlas로 $500 들여 미국 법인 설립 필요
- ❌ **복잡한 세금**: 미국 법인 운영 시 세금 이슈
- ❌ **정산 문제**: 달러 → 원화 환전 필요

### 토스페이먼츠의 장점
- ✅ **한국 공식 지원**: 한국 사업자등록증만 있으면 OK
- ✅ **간편결제 통합**: 카카오페이, 네이버페이, 토스페이 모두 지원
- ✅ **빠른 정산**: D+2 (영업일 기준 2일)
- ✅ **한국어 지원**: 문서, 고객지원 모두 한국어
- ✅ **동일한 수수료**: 2.9% (Stripe와 동일)

---

## 🔄 마이그레이션 단계별 가이드

### Step 1: 토스페이먼츠 계정 생성

1. **[토스페이먼츠 가입](https://developers.tosspayments.com) 접속**
2. **회원가입** (개인/법인 선택)
3. **테스트 키 즉시 발급** (심사 없이 바로 사용)

### Step 2: 패키지 설치

```bash
# Stripe 제거
npm uninstall stripe @stripe/stripe-js @stripe/react-stripe-js

# 토스페이먼츠 설치
npm install @tosspayments/payment-sdk
```

### Step 3: 환경 변수 변경

```env
# .env.local

# 기존 Stripe (주석 처리 또는 삭제)
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# 토스페이먼츠 (새로 추가)
TOSS_SECRET_KEY=test_ck_0RnYX2w532DPKe7PNzWxrNeyqApQ
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_0RnYX2w532DPKe7PNzWxrNeyqApQ

### Step 4: API 엔드포인트 수정

#### 기존 Stripe 코드:
```typescript
// app/api/payment/create-intent/route.ts (기존)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 99000,
    currency: 'krw',
  });
  
  return Response.json({
    clientSecret: paymentIntent.client_secret,
  });
}
```

#### 토스페이먼츠로 변경:
```typescript
// app/api/payment/create-intent/route.ts (새로운)
export async function POST(req: Request) {
  const { courseId, amount } = await req.json();
  
  // 주문 ID 생성 (고유해야 함)
  const orderId = `ORDER_${Date.now()}_${courseId}`;
  
  // 토스페이먼츠는 프론트엔드에서 직접 결제 요청
  // 서버는 주문 정보만 생성
  const order = await createOrder({
    orderId,
    courseId,
    amount,
    status: 'pending',
  });
  
  return Response.json({
    orderId,
    amount,
    orderName: `강의 결제 - ${courseId}`,
    customerName: user.name,
    customerEmail: user.email,
  });
}
```

### Step 5: 프론트엔드 결제 컴포넌트

#### 기존 Stripe:
```tsx
// components/StripePayment.tsx (기존)
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
await stripe.confirmCardPayment(clientSecret);
```

#### 토스페이먼츠로 변경:
```tsx
// components/TossPayment.tsx (새로운)
import { loadTossPayments } from '@tosspayments/payment-sdk';

const tossPayments = await loadTossPayments(
  process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
);

// 결제창 호출
await tossPayments.requestPayment('카드', {
  amount: 99000,
  orderId: 'ORDER_12345',
  orderName: 'YouTube Shorts 마스터 클래스',
  customerName: '홍길동',
  customerEmail: 'test@example.com',
  successUrl: `${window.location.origin}/payment/success`,
  failUrl: `${window.location.origin}/payment/fail`,
});
```

### Step 6: Webhook 처리

```typescript
// app/api/payment/webhook/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  
  // 토스페이먼츠 결제 승인 API 호출
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey: body.paymentKey,
      orderId: body.orderId,
      amount: body.amount,
    }),
  });
  
  if (response.ok) {
    // 결제 성공 처리
    await updateOrderStatus(body.orderId, 'completed');
  }
  
  return Response.json({ received: true });
}
```

---

## 🎯 주요 변경 사항 요약

| 항목 | Stripe | 토스페이먼츠 |
|------|--------|------------|
| **패키지** | `stripe`, `@stripe/stripe-js` | `@tosspayments/payment-sdk` |
| **환경변수** | `STRIPE_SECRET_KEY` | `TOSS_SECRET_KEY` |
| **결제 방식** | PaymentIntent 생성 → 확인 | 결제창 호출 → 승인 API |
| **테스트** | 테스트 카드 번호 | 테스트 키 + 실제 카드 |
| **Webhook** | Stripe 서명 검증 | 토스페이먼츠 승인 API |
| **UI** | Stripe Elements | 토스페이먼츠 결제창 |

---

## 💡 간편결제 추가 (보너스!)

토스페이먼츠를 사용하면 간편결제를 쉽게 추가할 수 있습니다:

```typescript
// 카드 결제
await tossPayments.requestPayment('카드', options);

// 카카오페이
await tossPayments.requestPayment('카카오페이', options);

// 네이버페이
await tossPayments.requestPayment('네이버페이', options);

// 토스페이
await tossPayments.requestPayment('토스페이', options);

// 가상계좌
await tossPayments.requestPayment('가상계좌', options);

// 계좌이체
await tossPayments.requestPayment('계좌이체', options);

// 휴대폰
await tossPayments.requestPayment('휴대폰', options);
```

---

## 📚 참고 자료

### 토스페이먼츠 문서
- [공식 문서](https://docs.tosspayments.com)
- [Next.js 연동 가이드](https://docs.tosspayments.com/guides/payment-widget/integration)
- [결제 위젯 데모](https://docs.tosspayments.com/guides/payment-widget/demo)
- [API 레퍼런스](https://docs.tosspayments.com/reference)

### 기타 한국 PG사 옵션
1. **포트원 (아임포트)**: 여러 PG사 통합
2. **네이버페이**: 네이버 생태계 특화
3. **카카오페이**: 카카오 생태계 특화
4. **페이팔**: 해외 결제 필요 시

---

## ⏱️ 예상 마이그레이션 시간

- 토스페이먼츠 계정 생성: 10분
- 패키지 교체: 5분
- API 엔드포인트 수정: 30분
- 프론트엔드 컴포넌트 수정: 30분
- 테스트: 30분
- **총 예상 시간: 약 2시간**

---

## 🆘 도움이 필요하신가요?

### 토스페이먼츠 지원
- 개발자 포럼: https://discord.gg/tosspayments
- 기술 문의: support@tosspayments.com
- 카카오톡 채널: @tosspayments_dev

### 마이그레이션 체크리스트
- [ ] 토스페이먼츠 계정 생성
- [ ] 테스트 키 발급
- [ ] 패키지 설치/제거
- [ ] 환경 변수 설정
- [ ] API 엔드포인트 수정
- [ ] 프론트엔드 컴포넌트 수정
- [ ] 결제 테스트
- [ ] 간편결제 추가 (선택)

---

*마지막 업데이트: 2025-01-16*