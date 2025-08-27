/sc:implement --seq --validate --evidence --db-first --e2e
"Phase 4: 결제 관련 TODO 8개 해결 - 결제 플로우 완성"

# Phase 4: 결제 관련 TODO (8개)

## ⚠️ 3-Strike Rule
같은 파일 3번 수정 = 즉시 중단 → 근본 원인 파악 필수

## 🎯 목표
상품 선택 → 쿠폰 적용 → 결제 → 완료까지 실제 작동

---

## 📋 TODO 목록 (우선순위순)

### 현재 TODO 파악
```bash
# 결제 관련 TODO 찾기
grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | grep -i "payment\|결제\|coupon\|쿠폰\|price"
```

### 우선순위 TODO 8개
1. **결제 인텐트 생성** (src/app/api/payment/create-intent/route.ts)
2. **쿠폰 검증** (src/app/api/coupons/validate/route.ts)
3. **결제 성공 처리** (src/app/api/payment/success/route.ts)
4. **결제 실패 처리** (src/app/api/payment/fail/route.ts)
5. **상품 목록 조회** (src/app/api/products/route.ts)
6. **쿠폰 생성 (관리자)** (src/app/api/admin/coupons/route.ts)
7. **결제 이력 조회** (src/app/api/payment/history/route.ts)
8. **환불 처리** (src/app/api/payment/refund/route.ts)

---

## 🔍 TODO 1: 결제 인텐트 생성

### 🎬 사용자 시나리오
```
1. 사용자가 상품 선택
2. → "구매하기" 버튼 클릭
3. → 결제 인텐트 생성
4. → 결제 페이지로 이동
5. → Stripe/토스페이먼츠 결제창
```

### ✅ 진행 조건
- [ ] payments 테이블 확인
- [ ] Stripe API Key 설정
- [ ] 상품 가격 정보 확인

### 🔧 작업

#### Step 1: DB 구조 확인
```bash
# 결제 관련 테이블 확인
grep -n "payments\|coupons\|products" src/types/database.generated.ts
```

#### Step 2: 결제 인텐트 API
```typescript
// src/app/api/payment/create-intent/route.ts
// TODO 제거하고 실제 구현

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await requireAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { amount, productId, couponCode } = await request.json();
    
    // 쿠폰 적용
    let finalAmount = amount;
    if (couponCode) {
      const discount = await validateCoupon(couponCode);
      finalAmount = amount - (amount * discount / 100);
    }
    
    // Stripe 결제 인텐트 생성
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: 'krw',
      metadata: {
        userId: user.id,
        productId
      }
    });
    
    // DB에 결제 레코드 생성
    const supabase = await createSupabaseServerClient();
    await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        product_id: productId,
        amount: finalAmount,
        status: 'pending',
        payment_intent_id: paymentIntent.id
      });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 🧪 검증
```bash
# 브라우저 테스트
- [ ] 상품 선택
- [ ] 구매 버튼 클릭
- [ ] 결제창 표시
- [ ] Network: create-intent 호출
- [ ] DB: payments 레코드 생성
```

---

## 🔍 TODO 2: 쿠폰 검증

### 🎬 사용자 시나리오
```
1. 결제 페이지에서 쿠폰 코드 입력
2. → "적용" 버튼 클릭
3. → 할인율 표시
4. → 최종 금액 재계산
```

### 🔧 작업
```typescript
// src/app/api/coupons/validate/route.ts
// TODO 제거하고 실제 구현

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { code } = await request.json();
    
    const supabase = await createSupabaseServerClient();
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
    
    if (error || !coupon) {
      return NextResponse.json({ 
        valid: false, 
        message: '유효하지 않은 쿠폰입니다' 
      }, { status: 400 });
    }
    
    // 유효기간 체크
    if (new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ 
        valid: false, 
        message: '만료된 쿠폰입니다' 
      }, { status: 400 });
    }
    
    return NextResponse.json({
      valid: true,
      discount: coupon.discount_percent,
      message: `${coupon.discount_percent}% 할인이 적용됩니다`
    });
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## 🔍 TODO 3-4: 결제 성공/실패 처리

### 🎬 사용자 시나리오 (성공)
```
1. 결제 완료
2. → Webhook 수신
3. → payment status = 'success'
4. → 구매 완료 페이지
5. → 이메일 발송
```

### 🎬 사용자 시나리오 (실패)
```
1. 결제 실패
2. → payment status = 'failed'
3. → 에러 메시지 표시
4. → 재시도 버튼
```

### 🔧 작업
```typescript
// src/app/api/payment/success/route.ts
// Webhook 처리

// src/app/api/payment/fail/route.ts
// 실패 처리 & 재시도
```

---

## 🔍 TODO 5-8: 나머지 결제 기능

### 빠른 구현 체크리스트

#### TODO 5: 상품 목록
```typescript
// products 테이블
// 가격, 설명, 이미지
```

#### TODO 6: 쿠폰 생성
```typescript
// 관리자만 가능
// 유효기간, 할인율
```

#### TODO 7: 결제 이력
```typescript
// 사용자별 결제 내역
// 페이지네이션
```

#### TODO 8: 환불 처리
```typescript
// Stripe 환불 API
// 환불 사유 기록
```

---

## ⛔ 즉시 중단 신호

1. **Stripe Key 없음** → 테스트 모드 사용
2. **결제 테이블 없음** → SQL 작성 실행
3. **Webhook 실패** → ngrok 설정
4. **금액 불일치** → 계산 로직 재확인

---

## 📋 Phase 4 완료 조건

```yaml
TODO_해결:
  - [ ] 결제 인텐트 생성
  - [ ] 쿠폰 검증 & 적용
  - [ ] 결제 성공 처리
  - [ ] 결제 실패 처리
  - [ ] 상품 목록 조회
  - [ ] 쿠폰 생성 (관리자)
  - [ ] 결제 이력 조회
  - [ ] 환불 처리

E2E_테스트:
  - [ ] 상품 선택 → 결제 완료
  - [ ] 쿠폰 적용 → 할인 확인
  - [ ] 결제 실패 → 재시도
  - [ ] 결제 이력 표시

증거:
  - [ ] 결제 성공 스크린샷
  - [ ] Stripe 대시보드 확인
  - [ ] DB payments 레코드
```

---

## → 다음 Phase

```bash
# Phase 4 완료 확인
- 결제 TODO: 8개 해결
- 실제 작동: 확인됨

# Phase 5로 진행
cat PHASE_5_REMAINING_TODO.md
```

---

*Phase 4: 결제 관련 TODO*
*핵심: 실제 결제 플로우 완성*
*시간: 4시간 예상*