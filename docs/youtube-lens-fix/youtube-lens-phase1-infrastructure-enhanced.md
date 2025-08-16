# YouTube Lens Phase 1: 기초 인프라 구축 (Enhanced)

## 🎯 목표 및 완료 기준
- ✅ 11개 핵심 테이블 모두 생성
- ✅ 완전한 RLS 정책 적용
- ✅ 팀 협업 구조 구현
- ✅ 브랜드 컬러 시스템 통합

## 📊 필수 데이터베이스 구조 (11개 테이블)

### Step 1: 마이그레이션 파일 생성
```bash
# 새 마이그레이션 파일 생성
npx supabase migration new youtube_lens_complete
```

### Step 2: 완전한 테이블 구조 구현

```sql
-- supabase/migrations/[timestamp]_youtube_lens_complete.sql

-- 1. YouTube 영상 메타데이터 (핵심!)
CREATE TABLE IF NOT EXISTS videos (
  video_id VARCHAR(20) PRIMARY KEY,
  channel_id VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds INTEGER,
  
  -- 기본 통계
  view_count BIGINT DEFAULT 0,
  like_count BIGINT DEFAULT 0,
  comment_count BIGINT DEFAULT 0,
  
  -- Shorts 특화 필드
  is_shorts BOOLEAN DEFAULT false,
  vertical_ratio DECIMAL(3,2),
  
  -- 메타데이터
  tags TEXT[],
  category_id VARCHAR(20),
  language VARCHAR(10),
  region_code VARCHAR(2),
  
  -- 썸네일
  thumbnail_url TEXT,
  thumbnail_analyzed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 영상 통계 시계열 데이터 (VPH 계산용!)
CREATE TABLE IF NOT EXISTS video_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id VARCHAR(20) REFERENCES videos(video_id) ON DELETE CASCADE,
  
  -- 시점별 통계
  snapshot_at TIMESTAMP WITH TIME ZONE NOT NULL,
  view_count BIGINT NOT NULL,
  like_count BIGINT,
  comment_count BIGINT,
  
  -- 계산된 지표
  views_per_hour DECIMAL(10,2),
  delta_24h BIGINT,
  engagement_rate DECIMAL(5,2),
  
  -- 인덱싱
  UNIQUE(video_id, snapshot_at)
);

-- 3. YouTube 채널 정보
CREATE TABLE IF NOT EXISTS channels (
  channel_id VARCHAR(50) PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  custom_url VARCHAR(100),
  
  -- 통계
  subscriber_count BIGINT,
  video_count INTEGER,
  view_count BIGINT,
  
  -- 메타데이터
  country VARCHAR(2),
  published_at TIMESTAMP WITH TIME ZONE,
  thumbnail_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 소스 채널 폴더 (모니터링용!)
CREATE TABLE IF NOT EXISTS source_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  color VARCHAR(7), -- HEX color
  icon VARCHAR(50), -- emoji or icon name
  
  -- 설정
  auto_monitor BOOLEAN DEFAULT true,
  check_interval INTEGER DEFAULT 60, -- minutes
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 폴더별 채널 매핑
CREATE TABLE IF NOT EXISTS folder_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES source_folders(id) ON DELETE CASCADE,
  channel_id VARCHAR(50) REFERENCES channels(channel_id),
  
  -- 채널별 설정
  custom_threshold BIGINT, -- 개별 임계치
  enabled BOOLEAN DEFAULT true,
  
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(folder_id, channel_id)
);

-- 6. 알림 규칙 (임계치 설정!)
CREATE TABLE IF NOT EXISTS alert_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES source_folders(id),
  
  name TEXT NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'view_threshold', 'vph_threshold', 'engagement_threshold'
  
  -- 조건
  threshold_value DECIMAL(15,2) NOT NULL,
  within_hours INTEGER, -- X시간 이내
  
  -- 알림 설정
  notify_email BOOLEAN DEFAULT true,
  notify_push BOOLEAN DEFAULT false,
  notify_webhook BOOLEAN DEFAULT false,
  webhook_url TEXT,
  
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 알림 히스토리
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID REFERENCES alert_rules(id) ON DELETE CASCADE,
  video_id VARCHAR(20) REFERENCES videos(video_id),
  
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  alert_type VARCHAR(50),
  message TEXT,
  
  -- 트리거 시점 데이터
  trigger_value DECIMAL(15,2),
  video_data JSONB,
  
  -- 알림 상태
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);

-- 8. 컬렉션/보드
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- 공유 설정
  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(100) UNIQUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 컬렉션 아이템
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  video_id VARCHAR(20) REFERENCES videos(video_id),
  
  -- 메모 및 태그
  notes TEXT,
  tags TEXT[],
  position INTEGER,
  
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id),
  
  UNIQUE(collection_id, video_id)
);

-- 10. 저장된 검색
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  
  -- 검색 조건
  filters JSONB NOT NULL, -- {region, period, keywords, excludeMusic, etc}
  
  -- 실행 설정
  auto_run BOOLEAN DEFAULT false,
  run_interval INTEGER, -- hours
  last_run_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. 구독 및 결제 정보
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  org_id UUID REFERENCES organizations(id),
  
  -- 플랜 정보
  plan_type VARCHAR(20) NOT NULL, -- 'free', 'pro', 'team', 'enterprise'
  status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
  
  -- 결제 정보
  billing_key TEXT ENCRYPTED, -- TossPayments billing key
  payment_method VARCHAR(50),
  
  -- 기간
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- 사용량 제한
  api_quota_limit INTEGER,
  api_quota_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CHECK (user_id IS NOT NULL OR org_id IS NOT NULL)
);

-- 인덱스 생성 (성능 최적화!)
CREATE INDEX idx_videos_published ON videos(published_at DESC);
CREATE INDEX idx_videos_channel ON videos(channel_id);
CREATE INDEX idx_videos_shorts ON videos(is_shorts) WHERE is_shorts = true;
CREATE INDEX idx_videos_region ON videos(region_code);

CREATE INDEX idx_stats_video_time ON video_stats(video_id, snapshot_at DESC);
CREATE INDEX idx_stats_vph ON video_stats(views_per_hour DESC);

CREATE INDEX idx_alerts_triggered ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_rule ON alerts(rule_id);

-- Trigger 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 모든 테이블에 updated_at 트리거 적용
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_updated_at 
      BEFORE UPDATE ON %I 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()',
      t, t);
  END LOOP;
END $$;
```

### Step 3: 완전한 RLS 정책 구현

```sql
-- RLS 활성화
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE folder_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 공개 데이터 (videos, channels) - 모두 읽기 가능
CREATE POLICY "Public read access to videos"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Public read access to channels"
  ON channels FOR SELECT
  USING (true);

CREATE POLICY "Public read access to video stats"
  ON video_stats FOR SELECT
  USING (true);

-- 개인/조직 데이터 정책
CREATE POLICY "Users manage their source folders"
  ON source_folders FOR ALL
  USING (
    auth.uid() = user_id 
    OR 
    org_id IN (
      SELECT org_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage their alert rules"
  ON alert_rules FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users view their alerts"
  ON alerts FOR SELECT
  USING (
    rule_id IN (
      SELECT id FROM alert_rules 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage their collections"
  ON collections FOR ALL
  USING (
    auth.uid() = user_id 
    OR 
    is_public = true
    OR
    org_id IN (
      SELECT org_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage collection items"
  ON collection_items FOR ALL
  USING (
    collection_id IN (
      SELECT id FROM collections 
      WHERE user_id = auth.uid() 
      OR is_public = true
      OR org_id IN (
        SELECT org_id FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users manage their saved searches"
  ON saved_searches FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users view their subscriptions"
  ON subscriptions FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    org_id IN (
      SELECT org_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );
```

### Step 4: 초기 데이터 시딩

```sql
-- 기본 카테고리 삽입
INSERT INTO public.categories (id, name, name_ko) VALUES
  ('1', 'Film & Animation', '영화/애니메이션'),
  ('2', 'Autos & Vehicles', '자동차/교통'),
  ('10', 'Music', '음악'),
  ('15', 'Pets & Animals', '애완동물'),
  ('17', 'Sports', '스포츠'),
  ('19', 'Travel & Events', '여행/이벤트'),
  ('20', 'Gaming', '게임'),
  ('22', 'People & Blogs', '인물/블로그'),
  ('23', 'Comedy', '코미디'),
  ('24', 'Entertainment', '엔터테인먼트'),
  ('25', 'News & Politics', '뉴스/정치'),
  ('26', 'Howto & Style', '노하우/스타일'),
  ('27', 'Education', '교육'),
  ('28', 'Science & Technology', '과학/기술')
ON CONFLICT DO NOTHING;
```

### Step 5: 마이그레이션 적용 및 검증

```bash
# 마이그레이션 적용
npx supabase db push

# 스키마 확인
npx supabase db diff

# 테이블 목록 확인
npx supabase db query "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%video%' OR table_name LIKE '%channel%' OR table_name LIKE '%source%' OR table_name LIKE '%alert%' OR table_name LIKE '%collection%' OR table_name LIKE '%saved%' OR table_name LIKE '%subscription%'"
```

## ✅ Phase 1 완료 체크리스트

### 데이터베이스 검증
- [ ] 11개 테이블 모두 생성됨
- [ ] 모든 인덱스 생성됨
- [ ] RLS 정책 모두 적용됨
- [ ] Trigger 함수 작동 확인
- [ ] 초기 데이터 시딩 완료

### 다음 단계 준비
- [ ] Supabase 클라이언트 타입 재생성
- [ ] 환경 변수 확인 (ENCRYPTION_KEY)
- [ ] API 엔드포인트 계획 수립

## 🚨 트러블슈팅

### 마이그레이션 실패 시
```bash
# 롤백
npx supabase db reset

# 개별 테이블 확인
npx supabase db query "SELECT * FROM pg_tables WHERE schemaname = 'public'"

# RLS 정책 확인
npx supabase db query "SELECT * FROM pg_policies WHERE schemaname = 'public'"
```

### 타입 생성
```bash
# Supabase 타입 자동 생성
npx supabase gen types typescript --local > src/types/supabase.ts
```