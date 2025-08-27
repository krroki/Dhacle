/sc:implement --seq --validate --c7
"Phase 4: YouTube Lens 기능 복원 - 누락된 테이블 생성 및 API 복원"

# Phase 4: YouTube Lens 기능 복원

⚠️ → `/docs/CONTEXT_BRIDGE.md` 및 `/CLAUDE.md` 필수 확인

## 📌 Phase 정보
- Phase 번호: 4/6
- 예상 시간: 3-4일
- 우선순위: 🟠 HIGH
- 해결할 TODO: 15개

## 🔥 실제 코드 확인
```bash
# YouTube 관련 API 패턴 확인
grep -r "youtube" src/app/api --include="*.ts" | head -10
# 결과: /api/youtube-lens/, /api/youtube/ 경로 사용 중

# 테이블 사용 패턴 확인
grep -r "yl_channels\|youtube_favorites" src/ --include="*.ts"
# 결과: 테이블 누락으로 주석 처리된 코드 다수
```

## 🎯 Phase 목표

YouTube Lens 기능 완전 복원:
1. 누락된 테이블 생성
2. PubSub 시스템 구현
3. 관리자 기능 활성화
4. 즐겨찾기 마이그레이션
5. 알림 규칙 복원

## 📝 작업 내용

### 1️⃣ YouTube Lens 테이블 생성

#### SQL 마이그레이션 작성
`supabase/migrations/20250826_create_youtube_lens_tables.sql`:

```sql
-- YouTube Lens 채널 관리 테이블
CREATE TABLE IF NOT EXISTS yl_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  subscriber_count BIGINT DEFAULT 0,
  video_count BIGINT DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

-- 일별 채널 변화 추적
CREATE TABLE IF NOT EXISTS yl_channel_daily_delta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) REFERENCES yl_channels(channel_id),
  date DATE NOT NULL,
  subscriber_delta BIGINT DEFAULT 0,
  video_delta BIGINT DEFAULT 0,
  view_delta BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, date)
);

-- 승인 로그
CREATE TABLE IF NOT EXISTS yl_approval_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) REFERENCES yl_channels(channel_id),
  action VARCHAR(20) NOT NULL, -- approve, reject, pending
  admin_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 알림 규칙
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  channel_id VARCHAR(50) REFERENCES yl_channels(channel_id),
  rule_type VARCHAR(50) NOT NULL, -- subscriber_threshold, video_uploaded, etc
  threshold_value JSONB,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_yl_channels_status ON yl_channels(status);
CREATE INDEX idx_yl_channels_channel_id ON yl_channels(channel_id);
CREATE INDEX idx_yl_daily_delta_date ON yl_channel_daily_delta(date);
CREATE INDEX idx_alert_rules_user ON alert_rules(user_id);

-- RLS 정책
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- 읽기 권한 (모든 사용자)
CREATE POLICY "yl_channels_read" ON yl_channels
  FOR SELECT USING (status = 'approved' OR auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- 관리자 전체 권한
CREATE POLICY "yl_channels_admin" ON yl_channels
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));
```

### 2️⃣ PubSub 테이블 생성

`supabase/migrations/20250826_create_pubsub_tables.sql`:

```sql
-- YouTube PubSub 구독 관리
CREATE TABLE IF NOT EXISTS channel_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) NOT NULL,
  hub_callback_url TEXT NOT NULL,
  hub_secret VARCHAR(255),
  hub_topic TEXT NOT NULL,
  subscription_status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  last_notification_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id)
);

-- Webhook 이벤트 로그
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50) REFERENCES channel_subscriptions(channel_id),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 구독 로그
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_channel_subs_status ON channel_subscriptions(subscription_status);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX idx_subscription_logs_channel ON subscription_logs(channel_id);
```

### 3️⃣ API Route 복원

#### 관리자 채널 관리 API 수정
`src/app/api/youtube-lens/admin/channels/route.ts`:

```typescript
import { createSupabaseRouteHandlerClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 인증 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // 관리자 권한 체크
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // yl_channels 테이블에서 데이터 조회
    const { data, error } = await supabase
      .from('yl_channels')
      .select(`
        *,
        yl_approval_logs(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 인증 및 권한 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // 채널 추가
    const { data, error } = await supabase
      .from('yl_channels')
      .insert({
        channel_id: body.channelId,
        title: body.title,
        description: body.description,
        thumbnail_url: body.thumbnailUrl,
        subscriber_count: body.subscriberCount,
        video_count: body.videoCount,
        view_count: body.viewCount
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

#### 채널 승인 API
`src/app/api/youtube-lens/admin/channels/[channelId]/route.ts`:

```typescript
export async function PATCH(
  request: Request,
  { params }: { params: { channelId: string } }
): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    // 인증 체크
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action, notes } = body;
    
    // 트랜잭션으로 처리
    // 1. 채널 상태 업데이트
    const { data: channel, error: channelError } = await supabase
      .from('yl_channels')
      .update({
        status: action,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('channel_id', params.channelId)
      .select()
      .single();
    
    if (channelError) throw channelError;
    
    // 2. 승인 로그 추가
    const { error: logError } = await supabase
      .from('yl_approval_logs')
      .insert({
        channel_id: params.channelId,
        action,
        admin_id: user.id,
        notes
      });
    
    if (logError) throw logError;
    
    // 3. PubSub 구독 시작 (승인된 경우)
    if (action === 'approved') {
      // TODO: PubSub 구독 구현
    }
    
    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error updating channel:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 4️⃣ 즐겨찾기 마이그레이션

#### collections 테이블 활용
`src/app/api/youtube/favorites/route.ts`:

```typescript
// youtube_favorites 대신 collections 사용
export async function GET(): Promise<NextResponse> {
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // collections 테이블 사용
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'youtube_favorite')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### 5️⃣ 컴포넌트 복원

#### AlertRules 컴포넌트 활성화
`src/components/features/tools/youtube-lens/AlertRules.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export function AlertRules({ channelId }: { channelId: string }) {
  const [rules, setRules] = useState([]);
  const supabase = createSupabaseBrowserClient();
  
  useEffect(() => {
    loadAlertRules();
  }, [channelId]);
  
  const loadAlertRules = async () => {
    const { data, error } = await supabase
      .from('alert_rules')
      .select('*')
      .eq('channel_id', channelId);
    
    if (!error && data) {
      setRules(data);
    }
  };
  
  const createRule = async (rule: any) => {
    const { data, error } = await supabase
      .from('alert_rules')
      .insert({
        channel_id: channelId,
        rule_type: rule.type,
        threshold_value: rule.threshold,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (!error && data) {
      setRules([...rules, data]);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">알림 규칙</h3>
      {/* 알림 규칙 UI */}
    </div>
  );
}
```

## ✅ 완료 조건 (실제 작동 확인 필수)

### 🔴 필수 완료 조건
```bash
# 1. 테이블 생성 확인
- [ ] Supabase Dashboard → yl_channels 테이블 존재
- [ ] yl_channel_daily_delta 테이블 존재
- [ ] yl_approval_logs 테이블 존재
- [ ] alert_rules 테이블 존재
- [ ] channel_subscriptions 테이블 존재

# 2. API 작동 테스트
- [ ] GET /api/youtube-lens/admin/channels → 200
- [ ] POST /api/youtube-lens/admin/channels → 201
- [ ] PATCH /api/youtube-lens/admin/channels/[id] → 200
- [ ] GET /api/youtube/favorites → 200

# 3. 브라우저 테스트
- [ ] YouTube Lens 페이지 접속 → 에러 없음
- [ ] 채널 검색 → 결과 표시
- [ ] 관리자 페이지 → 채널 관리 가능
- [ ] 알림 규칙 설정 → 저장 성공
```

### 🟡 권장 완료 조건
- [ ] PubSub 웹훅 테스트
- [ ] 일별 통계 집계 동작
- [ ] 알림 트리거 테스트

## → 다음 Phase
- 파일: PHASE_5_DATA.md
- 작업: 더미 데이터를 실제 데이터로 교체

---
*Phase 4/6 - YouTube Lens 기능 복원*