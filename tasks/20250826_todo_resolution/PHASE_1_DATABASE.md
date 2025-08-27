/sc:implement --seq --validate --c7
"Phase 1: 데이터베이스 기반 구조 완성 - 누락된 테이블과 필드 추가"

# Phase 1: 데이터베이스 기반 구조 완성

⚠️ → 상단 '최우선 프로젝트 특화 규칙' 필수 확인
- `/docs/CONTEXT_BRIDGE.md` 전체 읽기
- `/CLAUDE.md` 17-43행 자동 스크립트 금지
- any 타입 사용 금지
- 임시방편 해결책 금지

## 📌 Phase 정보
- Phase 번호: 1/6
- 예상 시간: 2-3일
- 우선순위: 🔴 CRITICAL (다른 모든 Phase의 기반)
- 차단 요소: 없음

## 📚 온보딩 섹션

### 작업 관련 경로
- 마이그레이션: `supabase/migrations/`
- 타입 정의: `src/types/database.generated.ts`
- API 라우트: `src/app/api/`
- 환경 변수: `src/env.ts`

### 프로젝트 컨텍스트 확인
```bash
# Supabase 연결 확인
cat .env.local | grep SUPABASE

# 기존 마이그레이션 확인
ls -la supabase/migrations/

# 현재 타입 구조 확인
cat src/types/database.generated.ts | grep -A 5 "interface Database"
```

## 🎯 Phase 목표
1. 21개 누락 테이블/필드 생성
2. 타입 시스템과 동기화
3. RLS 정책 적용
4. 기존 데이터 무결성 유지

## 📝 작업 내용

### 1️⃣ profiles 테이블 필드 추가 (8개 필드)

#### SQL 마이그레이션 생성
```sql
-- File: supabase/migrations/20250826000005_add_missing_profile_fields.sql

-- 1. randomNickname 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS random_nickname TEXT;

-- 2. 네이버 카페 관련 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS naver_cafe_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cafe_member_url TEXT,
ADD COLUMN IF NOT EXISTS naver_cafe_nickname TEXT,
ADD COLUMN IF NOT EXISTS naver_cafe_verified_at TIMESTAMP WITH TIME ZONE;

-- 3. work_type 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS work_type TEXT CHECK (work_type IN ('student', 'employee', 'freelancer', 'business', 'other'));

-- 4. email 필드 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_profiles_random_nickname ON profiles(random_nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_naver_cafe_verified ON profiles(naver_cafe_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_work_type ON profiles(work_type);
```

### 2️⃣ 결제 관련 테이블 생성

```sql
-- File: supabase/migrations/20250826000006_create_coupons_table.sql

CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coupons are viewable by authenticated users" ON coupons
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage coupons" ON coupons
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- 인덱스
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, valid_until);
```

### 3️⃣ YouTube Lens 관련 테이블 생성

```sql
-- File: supabase/migrations/20250826000007_create_youtube_lens_tables.sql

-- yl_channels 테이블
CREATE TABLE IF NOT EXISTS yl_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT UNIQUE NOT NULL,
  channel_title TEXT NOT NULL,
  channel_description TEXT,
  subscriber_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  country TEXT,
  custom_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- yl_channel_daily_delta 테이블
CREATE TABLE IF NOT EXISTS yl_channel_daily_delta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES yl_channels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  subscriber_delta INTEGER DEFAULT 0,
  view_delta BIGINT DEFAULT 0,
  video_delta INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, date)
);

-- yl_approval_logs 테이블
CREATE TABLE IF NOT EXISTS yl_approval_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES yl_channels(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('approve', 'reject', 'pending')) NOT NULL,
  reason TEXT,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- alertRules 테이블
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES yl_channels(id) ON DELETE CASCADE,
  rule_type TEXT CHECK (rule_type IN ('subscriber_change', 'view_change', 'new_video')) NOT NULL,
  threshold_value DECIMAL(10, 2),
  threshold_type TEXT CHECK (threshold_type IN ('percentage', 'absolute')) DEFAULT 'percentage',
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_approval_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX idx_yl_channels_channel_id ON yl_channels(channel_id);
CREATE INDEX idx_yl_channels_approval_status ON yl_channels(approval_status);
CREATE INDEX idx_yl_channel_daily_delta_date ON yl_channel_daily_delta(date);
CREATE INDEX idx_alert_rules_user_channel ON alert_rules(user_id, channel_id);
```

### 4️⃣ PubSub 관련 테이블 생성

```sql
-- File: supabase/migrations/20250826000008_create_pubsub_tables.sql

-- channelSubscriptions 테이블
CREATE TABLE IF NOT EXISTS channel_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id TEXT NOT NULL,
  channel_title TEXT,
  topic_url TEXT NOT NULL,
  hub_callback TEXT NOT NULL,
  hub_secret TEXT,
  hub_lease_seconds INTEGER,
  subscription_status TEXT CHECK (subscription_status IN ('pending', 'active', 'expired', 'failed')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE,
  last_notification_at TIMESTAMP WITH TIME ZONE,
  verification_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id)
);

-- webhookEvents 테이블
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES channel_subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- subscriptionLogs 테이블
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES channel_subscriptions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE channel_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- 인덱스
CREATE INDEX idx_channel_subscriptions_channel_id ON channel_subscriptions(channel_id);
CREATE INDEX idx_channel_subscriptions_status ON channel_subscriptions(subscription_status);
CREATE INDEX idx_webhook_events_processed ON webhook_events(processed);
```

### 5️⃣ 로그 테이블 생성

```sql
-- File: supabase/migrations/20250826000009_create_analytics_logs.sql

CREATE TABLE IF NOT EXISTS analytics_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_label TEXT,
  event_value JSONB,
  page_url TEXT,
  referrer_url TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE analytics_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics" ON analytics_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" ON analytics_logs
  FOR INSERT WITH CHECK (true);

-- 인덱스
CREATE INDEX idx_analytics_logs_user_id ON analytics_logs(user_id);
CREATE INDEX idx_analytics_logs_event_type ON analytics_logs(event_type);
CREATE INDEX idx_analytics_logs_created_at ON analytics_logs(created_at DESC);
```

### 6️⃣ 타입 생성 및 동기화

```bash
# Supabase 타입 재생성
npx supabase gen types typescript --local > src/types/database.generated.ts
```

## ✅ 완료 조건

### 🔴 필수 완료 조건
```bash
# 1. SQL 실행 성공
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250826000005_add_missing_profile_fields.sql
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250826000006_create_coupons_table.sql
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250826000007_create_youtube_lens_tables.sql
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250826000008_create_pubsub_tables.sql
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/20250826000009_create_analytics_logs.sql

# 2. 타입 동기화 확인
npx supabase gen types typescript --local > src/types/database.generated.ts
npm run types:check  # 에러 0개

# 3. 빌드 성공
npm run build  # 성공

# 4. DB 확인
- [ ] Supabase Dashboard에서 테이블 생성 확인
- [ ] 각 테이블의 RLS 정책 활성화 확인
- [ ] 인덱스 생성 확인
```

### 🟡 권장 완료 조건
- [ ] 기존 데이터 백업 완료
- [ ] 마이그레이션 롤백 계획 수립
- [ ] 테이블 관계 다이어그램 작성

## 🔄 롤백 계획

### 실패 시 롤백 절차
```sql
-- 롤백 SQL (필요시)
DROP TABLE IF EXISTS analytics_logs CASCADE;
DROP TABLE IF EXISTS subscription_logs CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS channel_subscriptions CASCADE;
DROP TABLE IF EXISTS alert_rules CASCADE;
DROP TABLE IF EXISTS yl_approval_logs CASCADE;
DROP TABLE IF EXISTS yl_channel_daily_delta CASCADE;
DROP TABLE IF EXISTS yl_channels CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- profiles 테이블 필드 제거
ALTER TABLE profiles 
DROP COLUMN IF EXISTS random_nickname,
DROP COLUMN IF EXISTS naver_cafe_verified,
DROP COLUMN IF EXISTS cafe_member_url,
DROP COLUMN IF EXISTS naver_cafe_nickname,
DROP COLUMN IF EXISTS naver_cafe_verified_at,
DROP COLUMN IF EXISTS work_type,
DROP COLUMN IF EXISTS email;
```

## 📋 검증 스크립트

```javascript
// scripts/verify-phase1-db.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyPhase1() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const tables = [
    'profiles', 'coupons', 'yl_channels', 'yl_channel_daily_delta',
    'yl_approval_logs', 'alert_rules', 'channel_subscriptions',
    'webhook_events', 'subscription_logs', 'analytics_logs'
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      console.error(`❌ Table ${table}: ${error.message}`);
    } else {
      console.log(`✅ Table ${table}: OK`);
    }
  }
}

verifyPhase1();
```

## → 다음 Phase
- 파일: [PHASE_2_AUTH.md](./PHASE_2_AUTH.md)
- 내용: 인증/프로필 시스템 완성