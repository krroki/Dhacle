# Database Schema Reference

## 📌 문서 관리 지침
**목적**: 데이터베이스 스키마 완전 조회 - 테이블, 컬럼, 관계, 제약조건, RLS 정책 종합 데이터
**대상**: Database Agent, API Route 개발 AI (테이블 구조 참조 필요시)
**범위**: 스키마 정보만 포함 (구현 방법이나 사용법 없음)
**업데이트 기준**: migration 파일 추가/변경 시 자동 업데이트
**최대 길이**: 15000 토큰 (현재 약 12000 토큰)
**연관 문서**: [Database Agent](../../supabase/migrations/CLAUDE.md), [API 엔드포인트](./api-endpoints.md)

## ⚠️ 금지사항
- 테이블 생성 방법이나 마이그레이션 가이드 추가 금지 (→ how-to/ 문서로 이관)
- 사용 예제나 코드 패턴 추가 금지 (→ how-to/ 문서로 이관)
- 설계 철학이나 배경 설명 추가 금지 (→ explanation/ 문서로 이관)

---

**Project**: Dhacle - YouTube Creator Tools Platform  
**Last Updated**: 2025-08-31  
**Database**: Supabase (PostgreSQL)  
**Total Migrations**: 56 files  

## Current State Overview

- **Active Tables**: ~45+ tables (complex migration history)
- **Core Systems**: User Management, YouTube Lens, Course System, Community, Revenue Certification
- **Authentication**: Supabase Auth integration with custom profiles
- **Row Level Security**: Enabled on all tables with comprehensive policies

## Core System Tables

### 1. User Management System

#### `users` - Core user profiles
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  channel_name TEXT,
  channel_url TEXT,
  total_revenue BIGINT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'instructor', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS Policies**:
- Public profiles viewable by everyone
- Users can insert/update their own profile
- Linked to Supabase auth.users table

#### `profiles` - Extended profile information
```sql
-- Note: profiles is a VIEW, not a table
-- Combines data from users and additional fields
-- Contains: email, random_nickname, naver_cafe_verified, role
```

### 2. YouTube Lens System (Primary Feature)

#### `videos` - Core video metadata
```sql
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id VARCHAR(20) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    channel_id VARCHAR(30) NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    duration_seconds INTEGER,
    is_short BOOLEAN DEFAULT false,
    thumbnails JSONB,
    tags TEXT[],
    category_id VARCHAR(10),
    language_code VARCHAR(10),
    region_code VARCHAR(5),
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

#### `video_stats` - Time-series statistics
```sql
CREATE TABLE video_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id VARCHAR(20) NOT NULL,
    view_count BIGINT DEFAULT 0,
    like_count BIGINT DEFAULT 0,
    comment_count BIGINT DEFAULT 0,
    views_per_hour DECIMAL(10, 2),
    engagement_rate DECIMAL(5, 2),
    viral_score DECIMAL(10, 2),
    view_delta BIGINT DEFAULT 0,
    like_delta BIGINT DEFAULT 0,
    comment_delta BIGINT DEFAULT 0,
    snapshot_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (video_id) REFERENCES videos(video_id)
);
```

#### `channels` - YouTube channel information
```sql
CREATE TABLE channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id VARCHAR(30) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    custom_url VARCHAR(100),
    subscriber_count BIGINT DEFAULT 0,
    video_count INTEGER DEFAULT 0,
    view_count BIGINT DEFAULT 0,
    country VARCHAR(5),
    published_at TIMESTAMPTZ,
    thumbnails JSONB,
    is_monitored BOOLEAN DEFAULT false,
    monitor_frequency_hours INTEGER DEFAULT 24,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Additional YouTube Lens Tables
- `yl_channels` - YouTube Lens channel monitoring
- `yl_videos` - YouTube Lens video tracking
- `yl_shorts` - YouTube Shorts specific data
- `yl_keywords` - Keyword tracking
- `yl_collections` - Video collections
- `trending_videos` - Trending content tracking
- `category_analytics` - Category-based analytics

### 3. Course System

#### `courses` - Online course content
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES users(id),
  price INTEGER NOT NULL DEFAULT 0,
  discount_rate INTEGER DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 100),
  thumbnail_url TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT CHECK (category IN ('shorts', 'marketing', 'editing', 'monetization', 'analytics')),
  rating DECIMAL(2,1) DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `enrollments` - Course enrollment tracking
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);
```

### 4. Community System

#### `communities` - Community posts
```sql
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('notice', 'free', 'success', 'qna', 'tips', 'resources')),
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `comments` - Post comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Revenue Certification System

#### `revenue_certifications` - User revenue proof
```sql
CREATE TABLE revenue_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'KRW' CHECK (currency IN ('KRW', 'USD')),
  screenshot_url TEXT NOT NULL,
  platform TEXT CHECK (platform IN ('youtube', 'blog', 'tiktok', 'instagram', 'other')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  description TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (period_end >= period_start)
);
```

#### `rankings` - Revenue-based user rankings
```sql
CREATE TABLE rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period_type TEXT CHECK (period_type IN ('weekly', 'monthly', 'yearly', 'all-time')),
  period_date DATE NOT NULL,
  rank INTEGER NOT NULL CHECK (rank > 0),
  total_revenue BIGINT NOT NULL,
  change_from_previous INTEGER DEFAULT 0,
  percentile DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_type, period_date)
);
```

### 6. API & Integration Tables

#### `api_keys` - User API key management
```sql
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  service TEXT NOT NULL CHECK (service IN ('youtube', 'openai')),
  is_active BOOLEAN DEFAULT true,
  quota_limit INTEGER DEFAULT 10000,
  quota_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `api_usage` - API usage tracking
```sql
CREATE TABLE api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  quota_used INTEGER DEFAULT 1,
  response_time INTEGER,
  status_code INTEGER,
  error_message TEXT,
  request_params JSONB,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7. Naver Integration

#### `naver_cafe_members` - Naver Cafe verification
```sql
CREATE TABLE naver_cafe_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_member_id TEXT UNIQUE NOT NULL,
  nickname TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verification_code TEXT,
  verification_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `naver_cafe_verifications` - Extended verification data
```sql
CREATE TABLE naver_cafe_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id TEXT NOT NULL,
  cafe_name TEXT,
  member_level TEXT,
  verified BOOLEAN DEFAULT false,
  verification_data JSONB,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cafe_id)
);
```

### 8. Monitoring & Analytics

#### `analytics_logs` - User action tracking
```sql
CREATE TABLE analytics_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT, -- 'video', 'channel', 'playlist'
  resource_id TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `youtube_analysis_cache` - Analysis caching
```sql
CREATE TABLE youtube_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id TEXT UNIQUE NOT NULL,
  channel_id TEXT,
  analysis_type TEXT NOT NULL, -- 'transcript', 'metrics', 'sentiment', 'keywords'
  analysis_data JSONB NOT NULL,
  metrics JSONB,
  confidence_score NUMERIC(3,2),
  processing_time INTEGER, -- milliseconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);
```

#### `notifications` - System notifications
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);
```

### 9. Tool System

#### `tools` - Tool usage tracking
```sql
CREATE TABLE tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('subtitle_generator', 'thumbnail_analyzer', 'title_optimizer', 'tag_generator')),
  input_data JSONB,
  output_data JSONB,
  processing_time_ms INTEGER,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  file_url TEXT,
  credits_used INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
```

## Migration History Issues

**Critical Note**: The project has a complex migration history with 56+ migration files, indicating multiple rounds of schema changes and fixes. Key issues:

1. **Table Creation Inconsistency**: Multiple migrations attempt to create same tables
2. **Missing Table References**: Some API endpoints reference tables that may not exist
3. **RLS Policy Conflicts**: Multiple RLS policy definitions across migrations
4. **Profile vs Users Confusion**: `profiles` is a VIEW, not a table, causing confusion

## Row Level Security (RLS)

All tables have RLS enabled with the following general patterns:

### User Data Access
```sql
-- Users can access their own data
CREATE POLICY "Users own data" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

### Public Read Access
```sql
-- Some data is publicly readable
CREATE POLICY "Public read access" ON table_name
  FOR SELECT USING (true);
```

### Admin Access
```sql
-- Admins can access all data
CREATE POLICY "Admin full access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Performance Indexes

Key performance indexes are created for:
- User lookups (`idx_*_user`)
- Time-based queries (`idx_*_created`)
- Status filtering (`idx_*_status`, `idx_*_verified`)
- Foreign key relationships
- Frequently queried fields

## Database Functions & Triggers

### Auto-Update Triggers
```sql
-- Automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Counter Maintenance
```sql
-- Update comment counts on communities
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update comment_count when comments are added/removed
END;
$$ LANGUAGE plpgsql;
```

### Student Count Updates
```sql
-- Update student counts on courses
CREATE OR REPLACE FUNCTION update_student_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update student_count when enrollments change
END;
$$ LANGUAGE plpgsql;
```

## Current Schema Verification

To verify the current state of your database, run:

```sql
-- Check all tables
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Notes & Recommendations

1. **Migration Cleanup Needed**: Consider consolidating the 56+ migration files
2. **Table Verification Required**: Some referenced tables may not exist in current schema
3. **RLS Policy Review**: Multiple policy definitions may cause conflicts
4. **Index Optimization**: Review and optimize indexes based on actual query patterns
5. **Documentation Updates**: Keep this document synchronized with schema changes

---

*This document reflects the analysis of migration files as of 2025-08-31. The actual database state may vary depending on which migrations have been applied.*