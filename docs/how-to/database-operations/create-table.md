# 데이터베이스 테이블 생성하기

*RLS 정책, 마이그레이션, 타입 생성까지 완벽한 테이블 생성 가이드*

---

## 🛑 STOP - 즉시 중단 신호

- **RLS 없는 테이블 생성 → 중단**
- **22개 테이블 동시 처리 → 중단** (순차 처리 필수)
- **타입 생성 생략 → 중단**
- **public 전체 접근 정책 → 중단**

---

## 2️⃣ MUST - 필수 행동

### 테이블 생성과 동시에 RLS 활성화
```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 즉시 추가 (절대 생략 금지!)
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own records" ON table_name FOR ALL USING (auth.uid() = user_id);
```

---

## 3️⃣ CHECK - 검증 필수

```bash
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql
npm run types:generate                      # 타입 생성
node scripts/verify-with-service-role.js    # RLS 정책 확인
```

---

## 📝 단계별 가이드

### Step 1: 마이그레이션 파일 생성

```bash
# 1. 타임스탬프 기반 파일명 생성
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_create_posts.sql << 'EOF'
-- 게시글 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  slug TEXT UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured_image TEXT,
  metadata JSONB DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status) WHERE status = 'published';
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug) WHERE slug IS NOT NULL;

-- 전문 검색을 위한 인덱스 (선택사항)
CREATE INDEX idx_posts_search ON posts USING GIN (to_tsvector('korean', title || ' ' || COALESCE(content, '')));

-- RLS 활성화 (필수!)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view published posts" ON posts
  FOR SELECT USING (status = 'published' OR auth.uid() = user_id);

CREATE POLICY "Users can manage own posts" ON posts
  FOR ALL USING (auth.uid() = user_id);

-- 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
EOF
```

### Step 2: SQL 실행

```bash
# 마이그레이션 실행
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/$(ls -t supabase/migrations/*.sql | head -1)

# 실행 결과 확인
echo "마이그레이션 실행 완료. 결과를 확인하세요."
```

### Step 3: 타입 생성

```bash
# TypeScript 타입 자동 생성
npm run types:generate

# 생성 확인
echo "✅ 타입 파일 크기 확인:"
wc -l src/types/database.generated.ts

echo "✅ 새 테이블 타입 확인:"
grep -A 10 "posts" src/types/database.generated.ts
```

### Step 4: RLS 정책 검증

```bash
# RLS 정책 동작 확인
node scripts/verify-with-service-role.js

# 수동 확인 (Supabase 대시보드)
echo "🔍 Supabase 대시보드에서 확인:"
echo "1. Table Editor에서 posts 테이블 확인"
echo "2. Authentication > RLS policies에서 정책 확인"
echo "3. SQL Editor에서 SELECT * FROM posts; 실행해보기"
```

---

## 📋 테이블 타입별 템플릿

### 1. 사용자 컨텐츠 테이블
```sql
-- 사용자가 생성하는 데이터 (posts, notes, comments 등)
CREATE TABLE IF NOT EXISTS user_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_user_content_user_id ON user_content(user_id);
CREATE INDEX idx_user_content_public ON user_content(is_public) WHERE is_public = true;
CREATE INDEX idx_user_content_tags ON user_content USING GIN (tags);

-- RLS 정책
ALTER TABLE user_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own content" ON user_content
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public content" ON user_content
  FOR SELECT USING (is_public = true);
```

### 2. 시스템 설정 테이블
```sql
-- 전역 설정이나 마스터 데이터 (categories, settings 등)
CREATE TABLE IF NOT EXISTS app_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_app_settings_key ON app_settings(key);
CREATE INDEX idx_app_settings_public ON app_settings(is_public);

-- RLS 정책
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public settings" ON app_settings
  FOR SELECT USING (is_public = true);

-- 관리자만 수정 가능 (API에서 service_role 사용)
```

### 3. 관계형 테이블 (Many-to-Many)
```sql
-- 다대다 관계 (user_likes, post_tags, team_members 등)
CREATE TABLE IF NOT EXISTS user_likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- 인덱스
CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_post_id ON user_likes(post_id);

-- RLS 정책
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own likes" ON user_likes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view likes" ON user_likes
  FOR SELECT USING (true);
```

### 4. 로그/이벤트 테이블
```sql
-- 감사 로그, 사용자 활동 등
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (시계열 데이터 최적화)
CREATE INDEX idx_activity_logs_user_id_created_at ON activity_logs(user_id, created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- RLS 정책
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 관리자는 service_role로 접근
```

---

## 🔧 고급 기능

### JSON 필드 활용
```sql
-- JSONB 필드 및 인덱스
CREATE TABLE IF NOT EXISTS flexible_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- JSONB 인덱스 (특정 키에 대한)
CREATE INDEX idx_flexible_content_data_title ON flexible_content USING GIN ((data->>'title'));
CREATE INDEX idx_flexible_content_data_tags ON flexible_content USING GIN ((data->'tags'));

-- JSONB 필드 유효성 검사
ALTER TABLE flexible_content 
ADD CONSTRAINT check_required_fields 
CHECK (data ? 'title' AND data ? 'created_by');
```

### 전문 검색 (Full-text Search)
```sql
-- 한국어 전문 검색 지원
CREATE INDEX idx_posts_fulltext_search ON posts 
USING GIN (to_tsvector('korean', title || ' ' || COALESCE(content, '')));

-- 검색 함수 생성
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    ts_rank(to_tsvector('korean', p.title || ' ' || COALESCE(p.content, '')), plainto_tsquery('korean', search_query)) AS rank
  FROM posts p
  WHERE to_tsvector('korean', p.title || ' ' || COALESCE(p.content, '')) @@ plainto_tsquery('korean', search_query)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

### 파티셔닝 (대용량 데이터)
```sql
-- 날짜 기반 파티셔닝
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'
) PARTITION BY RANGE (created_at);

-- 월별 파티션 생성
CREATE TABLE activity_logs_2024_01 PARTITION OF activity_logs
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE activity_logs_2024_02 PARTITION OF activity_logs
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

---

## 🚨 성능 최적화

### 인덱스 전략
```sql
-- 1. 외래키에는 항상 인덱스
CREATE INDEX idx_table_user_id ON table_name(user_id);

-- 2. 자주 쿼리하는 필드
CREATE INDEX idx_table_status ON table_name(status);

-- 3. 복합 인덱스 (쿼리 패턴에 따라)
CREATE INDEX idx_table_user_status ON table_name(user_id, status);

-- 4. 부분 인덱스 (조건부)
CREATE INDEX idx_table_published ON table_name(created_at) 
WHERE status = 'published';

-- 5. 정렬에 사용되는 필드
CREATE INDEX idx_table_created_at_desc ON table_name(created_at DESC);
```

### 제약 조건
```sql
-- CHECK 제약 조건
ALTER TABLE posts 
ADD CONSTRAINT check_status 
CHECK (status IN ('draft', 'published', 'archived'));

-- 외래키 제약 조건
ALTER TABLE posts 
ADD CONSTRAINT fk_posts_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- UNIQUE 제약 조건
ALTER TABLE posts 
ADD CONSTRAINT unique_user_slug 
UNIQUE (user_id, slug);
```

---

## ❌ 흔한 실수들

### 1. RLS 정책 누락
```sql
-- ❌ 잘못된 방법
CREATE TABLE bad_table (
  id UUID PRIMARY KEY,
  data TEXT
);
-- RLS 정책 없음!

-- ✅ 올바른 방법
CREATE TABLE good_table (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data TEXT
);

ALTER TABLE good_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own data" ON good_table FOR ALL USING (auth.uid() = user_id);
```

### 2. 인덱스 누락
```sql
-- ❌ 외래키에 인덱스 없음
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),  -- 인덱스 없음!
  content TEXT
);

-- ✅ 외래키에 인덱스 추가
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  content TEXT
);
CREATE INDEX idx_comments_post_id ON comments(post_id);
```

### 3. 타입 생성 누락
```bash
# ❌ SQL만 실행하고 끝
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql

# ✅ 타입도 생성해야 함
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql
npm run types:generate
```

---

## 🔍 문제 해결

### 테이블 생성 실패
```sql
-- 1. 기존 테이블 확인
\dt

-- 2. 제약 조건 확인
\d table_name

-- 3. 권한 확인
SELECT current_user, current_database();
```

### RLS 정책 문제
```sql
-- RLS 정책 목록 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'your_table';

-- RLS 활성화 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'your_table';
```

### 성능 문제
```sql
-- 느린 쿼리 분석
EXPLAIN ANALYZE SELECT * FROM posts WHERE user_id = 'user-id' ORDER BY created_at DESC;

-- 인덱스 사용 확인
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'posts';
```

---

## 🔗 관련 문서

- [Database Agent 지침](../../../supabase/migrations/CLAUDE.md) - 상세 데이터베이스 규칙
- [타입 관리 가이드](../../../src/types/CLAUDE.md) - 생성된 타입 활용법
- [API 개발 가이드](../api-development/create-new-route.md) - 테이블을 활용한 API 개발

---

**💡 기억하세요**: 테이블 생성은 한 번에 끝나는 작업이 아닙니다. RLS 정책, 인덱스, 타입 생성, 검증까지 모두 완료해야 실제 사용 가능한 테이블이 됩니다.