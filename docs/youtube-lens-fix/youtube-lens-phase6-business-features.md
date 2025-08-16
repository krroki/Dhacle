# YouTube Lens Phase 6: 비즈니스 기능

## 📌 개요
구독 플랜 관리, 결제 시스템, 권한 관리 등 비즈니스 모델을 지원하는 기능을 구현합니다.

## 🎯 목표
- Free/Pro/Team 플랜 체계 구축
- TossPayments 결제 시스템 통합
- 권한 기반 접근 제어 (RLS)
- 사용량 추적 및 제한

## 💳 플랜 체계

### 플랜 정의

```typescript
// lib/plans/config.ts
export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      dailySearches: 10,
      monitoredChannels: 5,
      alertRules: 2,
      boards: 3,
      csvExports: 5,
      teamMembers: 1,
      apiQuota: 1000, // YouTube API units/day
      dataRetention: 7, // days
      supportLevel: 'community'
    },
    limits: {
      videoResults: 30,
      snapshotInterval: 120, // minutes
      keywords: 5
    }
  },
  pro: {
    name: 'Pro',
    price: 29000, // KRW/month
    features: {
      dailySearches: 100,
      monitoredChannels: 50,
      alertRules: 20,
      boards: 20,
      csvExports: -1, // unlimited
      teamMembers: 1,
      apiQuota: 5000,
      dataRetention: 30,
      supportLevel: 'priority'
    },
    limits: {
      videoResults: 100,
      snapshotInterval: 60,
      keywords: 20
    }
  },
  team: {
    name: 'Team',
    price: 99000, // KRW/month
    features: {
      dailySearches: -1, // unlimited
      monitoredChannels: 200,
      alertRules: 100,
      boards: -1,
      csvExports: -1,
      teamMembers: 10,
      apiQuota: 10000,
      dataRetention: 90,
      supportLevel: 'dedicated'
    },
    limits: {
      videoResults: 200,
      snapshotInterval: 30,
      keywords: 50
    }
  }
};

// 플랜별 기능 체크
export function checkFeatureLimit(
  userPlan: keyof typeof PLANS,
  feature: keyof typeof PLANS.free.features,
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const limit = PLANS[userPlan].features[feature];
  
  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }
  
  const remaining = limit - currentUsage;
  return {
    allowed: remaining > 0,
    limit,
    remaining: Math.max(0, remaining)
  };
}
```

## 💰 TossPayments 결제 시스템

### 결제 초기화

```typescript
// lib/payments/tosspayments.ts
import { loadTossPayments } from '@tosspayments/payment-sdk';

export class PaymentManager {
  private tossPayments: any;
  
  async initialize() {
    this.tossPayments = await loadTossPayments(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY!
    );
  }
  
  // 구독 결제 시작
  async startSubscription(plan: 'pro' | 'team', user: User) {
    const orderId = this.generateOrderId();
    const amount = PLANS[plan].price;
    
    // 빌링키 발급을 위한 결제창 호출
    await this.tossPayments.requestBillingAuth('카드', {
      customerKey: user.id,
      successUrl: `${process.env.NEXT_PUBLIC_URL}/api/payment/success`,
      failUrl: `${process.env.NEXT_PUBLIC_URL}/api/payment/fail`,
      customerName: user.name,
      customerEmail: user.email,
    });
  }
  
  // 빌링키로 정기결제 실행
  async processBilling(billingKey: string, amount: number, orderId: string) {
    const response = await fetch('https://api.tosspayments.com/v1/billing/' + billingKey, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount,
        orderId,
        orderName: 'YouTube Lens 구독',
        customerName: user.name,
        customerEmail: user.email
      })
    });
    
    return response.json();
  }
  
  private generateOrderId(): string {
    return `YTL_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
```

### 결제 성공/실패 처리

```typescript
// app/api/payment/success/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const authKey = url.searchParams.get('authKey');
  const customerKey = url.searchParams.get('customerKey');
  
  try {
    // 빌링키 발급 확인
    const response = await fetch(`https://api.tosspayments.com/v1/billing/authorizations/${authKey}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64')}`
      }
    });
    
    const data = await response.json();
    const billingKey = data.billingKey;
    
    // DB에 빌링키 저장
    await supabase
      .from('subscriptions')
      .insert({
        user_id: customerKey,
        billing_key: billingKey,
        plan_type: 'pro', // or 'team'
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    
    // 첫 결제 실행
    const paymentManager = new PaymentManager();
    await paymentManager.processBilling(
      billingKey,
      PLANS.pro.price,
      generateOrderId()
    );
    
    // 사용자 프로필 업데이트
    await supabase
      .from('profiles')
      .update({
        plan_type: 'pro',
        plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      })
      .eq('id', customerKey);
    
    return NextResponse.redirect('/youtube-lens/settings?payment=success');
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.redirect('/youtube-lens/settings?payment=error');
  }
}
```

### 정기결제 Cron Job

```typescript
// lib/jobs/billing.ts
export async function processMonthlyBilling() {
  // 만료 예정 구독 조회
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .lte('current_period_end', new Date(Date.now() + 24 * 60 * 60 * 1000)); // 1일 이내 만료
  
  const paymentManager = new PaymentManager();
  
  for (const subscription of subscriptions || []) {
    try {
      // 결제 실행
      const result = await paymentManager.processBilling(
        subscription.billing_key,
        PLANS[subscription.plan_type].price,
        generateOrderId()
      );
      
      if (result.status === 'DONE') {
        // 구독 갱신
        await supabase
          .from('subscriptions')
          .update({
            current_period_start: new Date(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            last_payment_at: new Date(),
            failed_attempts: 0
          })
          .eq('id', subscription.id);
      } else {
        // 결제 실패 처리
        await handlePaymentFailure(subscription);
      }
    } catch (error) {
      console.error(`Billing failed for subscription ${subscription.id}:`, error);
      await handlePaymentFailure(subscription);
    }
  }
}

async function handlePaymentFailure(subscription: any) {
  const attempts = (subscription.failed_attempts || 0) + 1;
  
  if (attempts >= 3) {
    // 3회 실패 시 구독 정지
    await supabase
      .from('subscriptions')
      .update({
        status: 'suspended',
        suspended_at: new Date()
      })
      .eq('id', subscription.id);
    
    // 사용자 플랜 다운그레이드
    await supabase
      .from('profiles')
      .update({
        plan_type: 'free',
        plan_expires_at: null
      })
      .eq('id', subscription.user_id);
    
    // 이메일 알림
    await sendEmail({
      to: subscription.user_email,
      subject: 'YouTube Lens 구독 정지 안내',
      template: 'subscription-suspended',
      data: { subscription }
    });
  } else {
    // 재시도 예약
    await supabase
      .from('subscriptions')
      .update({
        failed_attempts: attempts,
        next_retry_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후
      })
      .eq('id', subscription.id);
  }
}
```

## 🔐 권한 관리 시스템

### 조직 및 역할 관리

```typescript
// lib/auth/permissions.ts
export enum Role {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export const PERMISSIONS = {
  [Role.OWNER]: [
    'manage_billing',
    'manage_members',
    'manage_settings',
    'create_folders',
    'edit_folders',
    'delete_folders',
    'create_alerts',
    'edit_alerts',
    'delete_alerts',
    'export_data',
    'view_all'
  ],
  [Role.ADMIN]: [
    'manage_members',
    'manage_settings',
    'create_folders',
    'edit_folders',
    'delete_folders',
    'create_alerts',
    'edit_alerts',
    'delete_alerts',
    'export_data',
    'view_all'
  ],
  [Role.MEMBER]: [
    'create_folders',
    'edit_folders',
    'create_alerts',
    'edit_alerts',
    'export_data',
    'view_all'
  ],
  [Role.VIEWER]: [
    'view_all'
  ]
};

export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[role].includes(permission);
}
```

### RLS 정책 구현

```sql
-- 조직 데이터 접근 정책
CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS TABLE(org_id UUID, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT om.org_id, om.role
  FROM organization_members om
  WHERE om.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- folders 테이블 RLS
CREATE POLICY "Organization folders access" ON folders
  FOR ALL USING (
    -- 개인 폴더 접근
    (user_id = auth.uid()) OR
    -- 조직 폴더 접근
    (org_id IN (SELECT org_id FROM get_user_organizations()))
  );

-- 역할별 수정 권한
CREATE POLICY "Folder modification by role" ON folders
  FOR UPDATE USING (
    -- 소유자는 항상 수정 가능
    (user_id = auth.uid()) OR
    -- 조직 멤버는 역할에 따라
    (org_id IN (
      SELECT org_id FROM get_user_organizations()
      WHERE role IN ('owner', 'admin', 'member')
    ))
  );

CREATE POLICY "Folder deletion by role" ON folders
  FOR DELETE USING (
    (user_id = auth.uid()) OR
    (org_id IN (
      SELECT org_id FROM get_user_organizations()
      WHERE role IN ('owner', 'admin')
    ))
  );
```

## 📊 사용량 추적

### API 사용량 모니터링

```typescript
// lib/usage/tracker.ts
export class UsageTracker {
  // 일일 사용량 체크
  async checkDailyUsage(userId: string, feature: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    
    // 사용자 플랜 조회
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', userId)
      .single();
    
    const plan = profile?.plan_type || 'free';
    const limit = PLANS[plan].features[feature];
    
    if (limit === -1) return true; // 무제한
    
    // 오늘 사용량 조회
    const { count } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('created_at', today);
    
    return (count || 0) < limit;
  }
  
  // 사용량 기록
  async recordUsage(userId: string, feature: string, metadata?: any) {
    await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        feature,
        metadata,
        created_at: new Date()
      });
  }
  
  // 사용량 통계
  async getUsageStats(userId: string, period: 'day' | 'week' | 'month') {
    const startDate = this.getStartDate(period);
    
    const { data } = await supabase
      .from('usage_logs')
      .select('feature, count(*)')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .group('feature');
    
    return data;
  }
  
  private getStartDate(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();
    switch (period) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  }
}
```

### 사용량 제한 미들웨어

```typescript
// middleware/usage-limit.ts
export async function checkUsageLimit(
  request: Request,
  feature: string
): Promise<Response | null> {
  const session = await getSession(request);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const tracker = new UsageTracker();
  const allowed = await tracker.checkDailyUsage(session.user.id, feature);
  
  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: 'Usage limit exceeded',
        feature,
        upgrade_url: '/youtube-lens/pricing'
      }),
      { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
  
  // 사용량 기록
  await tracker.recordUsage(session.user.id, feature);
  
  return null; // 통과
}
```

## 💼 팀 관리

### 팀 멤버 초대

```typescript
// lib/team/manager.ts
export class TeamManager {
  // 멤버 초대
  async inviteMember(orgId: string, email: string, role: Role) {
    // 초대 토큰 생성
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // 초대 정보 저장
    await supabase
      .from('invitations')
      .insert({
        org_id: orgId,
        email,
        role,
        token: inviteToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7일
      });
    
    // 초대 이메일 발송
    await sendEmail({
      to: email,
      subject: 'YouTube Lens 팀 초대',
      template: 'team-invitation',
      data: {
        inviteUrl: `${process.env.NEXT_PUBLIC_URL}/invite/${inviteToken}`,
        orgName: await this.getOrgName(orgId),
        role
      }
    });
  }
  
  // 초대 수락
  async acceptInvitation(token: string, userId: string) {
    // 초대 정보 조회
    const { data: invitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();
    
    if (!invitation || new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invalid or expired invitation');
    }
    
    // 조직 멤버 추가
    await supabase
      .from('organization_members')
      .insert({
        org_id: invitation.org_id,
        user_id: userId,
        role: invitation.role,
        joined_at: new Date()
      });
    
    // 초대 삭제
    await supabase
      .from('invitations')
      .delete()
      .eq('id', invitation.id);
  }
  
  // 멤버 권한 변경
  async updateMemberRole(orgId: string, memberId: string, newRole: Role) {
    await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('org_id', orgId)
      .eq('user_id', memberId);
  }
  
  // 멤버 제거
  async removeMember(orgId: string, memberId: string) {
    await supabase
      .from('organization_members')
      .delete()
      .eq('org_id', orgId)
      .eq('user_id', memberId);
  }
}
```

## ✅ 구현 체크리스트

- [ ] 플랜 체계 정의 및 제한 로직
- [ ] TossPayments 결제 통합
- [ ] 정기결제 및 실패 처리
- [ ] RLS 정책 구현
- [ ] 역할 기반 권한 관리
- [ ] 사용량 추적 시스템
- [ ] 팀 초대 및 관리
- [ ] 결제 관련 UI 페이지

## 📝 다음 단계
Phase 7: 최적화 & 확장으로 진행