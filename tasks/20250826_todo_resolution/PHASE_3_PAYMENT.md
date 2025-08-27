/sc:implement --seq --validate
"Phase 3: 결제 시스템 활성화 - 쿠폰 기능 구현"

# Phase 3: 결제 시스템 활성화

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인

## 📌 Phase 정보
- Phase 번호: 3/6
- 예상 시간: 1-2일
- 우선순위: 🟠 HIGH
- 선행 조건: Phase 1 완료 (coupons 테이블 생성)

## 🎯 Phase 목표
1. 쿠폰 시스템 활성화
2. 결제 프로세스에 쿠폰 적용
3. TossPayments v2 마이그레이션

## 📝 작업 내용

### 1️⃣ 쿠폰 검증 API 수정

```typescript
// src/app/api/coupons/validate/route.ts 수정
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }

  const { code, amount } = await request.json();

  // 쿠폰 조회
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .lte('valid_from', new Date().toISOString())
    .single();

  if (error || !coupon) {
    return NextResponse.json({ error: '유효하지 않은 쿠폰' }, { status: 400 });
  }

  // 사용 제한 체크
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return NextResponse.json({ error: '사용 한도 초과' }, { status: 400 });
  }

  // 최소 구매 금액 체크
  if (coupon.min_purchase_amount > amount) {
    return NextResponse.json({ 
      error: `최소 구매 금액: ${coupon.min_purchase_amount}원` 
    }, { status: 400 });
  }

  // 할인 계산
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = amount * (coupon.discount_value / 100);
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    discount = coupon.discount_value;
  }

  return NextResponse.json({
    valid: true,
    discount,
    finalAmount: amount - discount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description
    }
  });
}
```

### 2️⃣ 결제 생성 API 수정

```typescript
// src/app/api/payment/create-intent/route.ts 수정
// 54번 줄 - 쿠폰 코드 활성화

// 쿠폰 적용 로직
let finalAmount = amount;
let appliedCoupon = null;

if (couponCode) {
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', couponCode)
    .eq('is_active', true)
    .single();

  if (coupon) {
    // 할인 적용
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = amount * (coupon.discount_value / 100);
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }
    
    finalAmount = amount - discount;
    appliedCoupon = coupon;

    // 사용 횟수 증가
    await supabase
      .from('coupons')
      .update({ used_count: coupon.used_count + 1 })
      .eq('id', coupon.id);
  }
}

// TossPayments 결제 요청에 finalAmount 사용
```

### 3️⃣ 결제 실패 처리

```typescript
// src/app/api/payment/fail/route.ts 수정
// 48번 줄 - 쿠폰 롤백 로직 활성화

// 쿠폰 사용 횟수 롤백
if (couponId) {
  const { data: coupon } = await supabase
    .from('coupons')
    .select('used_count')
    .eq('id', couponId)
    .single();

  if (coupon && coupon.used_count > 0) {
    await supabase
      .from('coupons')
      .update({ used_count: coupon.used_count - 1 })
      .eq('id', couponId);
  }
}
```

### 4️⃣ TossPayments v2 마이그레이션

```typescript
// src/lib/tosspayments/client.ts 수정
// 152번 줄 - NOTE 주석 처리 및 v2 API 사용

import { loadTossPayments } from '@tosspayments/payment-sdk';

export async function initializeTossPayments() {
  const tossPayments = await loadTossPayments(
    process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
  );
  
  return {
    // v2 API 메서드
    requestPayment: tossPayments.requestPayment,
    requestBillingAuth: tossPayments.requestBillingAuth,
    // widgets 대신 v2 메서드 사용
  };
}
```

### 5️⃣ 쿠폰 관리 API (관리자용)

```typescript
// src/app/api/admin/coupons/route.ts 생성
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  
  // 관리자 권한 체크
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user?.id)
    .single();
    
  if (!profile?.is_admin) {
    return NextResponse.json({ error: '권한 없음' }, { status: 403 });
  }

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  // 쿠폰 생성 로직
  const data = await request.json();
  
  const { error } = await supabase
    .from('coupons')
    .insert(data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

## ✅ 완료 조건

### 🔴 필수 완료 조건
```bash
# 1. 빌드 성공
npm run build

# 2. 실제 브라우저 테스트
npm run dev
# 결제 페이지에서 테스트
- [ ] 쿠폰 코드 입력 → 할인 적용 확인
- [ ] 결제 진행 → 성공 확인
- [ ] 결제 취소 → 쿠폰 롤백 확인

# 3. API 테스트
- [ ] POST /api/coupons/validate → 할인 계산 정확
- [ ] POST /api/payment/create-intent → 쿠폰 적용
- [ ] POST /api/payment/fail → 쿠폰 롤백
```

### 🟡 권장 완료 조건
- [ ] 쿠폰 만료 자동 처리
- [ ] 쿠폰 사용 내역 로깅
- [ ] 쿠폰 통계 대시보드

## → 다음 Phase
- 파일: [PHASE_4_YOUTUBE.md](./PHASE_4_YOUTUBE.md)
- 내용: YouTube Lens 기능 복원