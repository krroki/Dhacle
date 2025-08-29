# 🗄️ 마이그레이션 가이드

*테이블 생성, RLS 정책, 마이그레이션 패턴 - Context-less AI도 즉시 사용 가능*

---

## 🚨 테이블 누락 에러 발생 시 즉시 실행

### 에러: "relation 'table_name' does not exist"
**복사해서 즉시 사용하세요:**

```bash
# 1단계: SQL 파일 생성 (table_name을 실제 테이블명으로 변경)
cat > supabase/migrations/$(date +%Y%m%d%H%M%S)_create_table_name.sql << 'EOF'
-- 테이블 생성 템플릿
CREATE TABLE IF NOT EXISTS table_name (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ⚠️ RLS 필수 - 절대 생략 금지!
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- 기본 RLS 정책 (사용자별 접근)
CREATE POLICY "Users can view own records" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON table_name
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON table_name
  FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX idx_table_name_user_id ON table_name(user_id);
CREATE INDEX idx_table_name_created_at ON table_name(created_at DESC);
CREATE INDEX idx_table_name_status ON table_name(status) WHERE status != 'deleted';

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
EOF

# 2단계: SQL 실행
node scripts/supabase-sql-executor.js --method pg --file supabase/migrations/$(ls -t supabase/migrations/*.sql | head -1)

# 3단계: 타입 생성
npm run types:generate

# 4단계: 검증
node scripts/verify-with-service-role.js
```

---

## 🛑 마이그레이션 필수 규칙

### Database Agent 자동 체크 항목
- [ ] **RLS 활성화**: 모든 테이블에 필수
- [ ] **RLS 정책**: 최소 1개 이상 필수
- [ ] **인덱스**: 외래키와 자주 쿼리되는 필드
- [ ] **타입 생성**: SQL 실행 후 즉시
- [ ] **검증 실행**: verify-with-service-role.js

### 절대 금지 사항
- ❌ RLS 없는 테이블 생성
- ❌ public 전체 접근 정책
- ❌ 타입 생성 생략
- ❌ 검증 없이 완료 선언

---

## 📋 테이블 타입별 템플릿

### 1. 사용자 데이터 테이블
```sql
-- 사용자별 데이터 (posts, comments, likes 등)
CREATE TABLE IF NOT EXISTS user_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_content ENABLE ROW LEVEL SECURITY;

-- 자신의 데이터만 접근
CREATE POLICY "Own data access" ON user_content
  FOR ALL USING (auth.uid() = user_id);

-- 공개 데이터는 모두 조회 가능
CREATE POLICY "Public read access" ON user_content
  FOR SELECT USING (is_public = true);
```

### 2. 시스템 데이터 테이블
```sql
-- 시스템 관리 데이터 (categories, settings 등)
CREATE TABLE IF NOT EXISTS system_data (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_data ENABLE ROW LEVEL SECURITY;

-- 모든 사용자 읽기 가능
CREATE POLICY "Public read" ON system_data
  FOR SELECT USING (true);

-- 관리자만 수정 가능 (service_role 사용)
-- API에서 service_role 클라이언트로 처리
```

### 3. 관계형 테이블 (Many-to-Many)
```sql
-- 다대다 관계 (user_follows, post_tags 등)
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- 자신의 팔로우만 관리
CREATE POLICY "Manage own follows" ON user_follows
  FOR ALL USING (auth.uid() = follower_id);

-- 팔로우 목록은 공개
CREATE POLICY "Public follow list" ON user_follows
  FOR SELECT USING (true);
```

---

## 🔧 마이그레이션 실행 방법

### 방법 1: PostgreSQL 직접 연결 (권장)
```bash
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql
```

### 방법 2: Supabase CLI
```bash
npx supabase db push
```

### 방법 3: 수동 실행 (대시보드)
1. https://app.supabase.com 접속
2. SQL Editor 이동
3. SQL 붙여넣기 및 실행

---

## 📊 기존 테이블 구조 확인

### 현재 테이블 목록 (22개)
```bash
# 모든 테이블 상태 확인
node scripts/verify-with-service-role.js

# 특정 테이블 구조 확인
node scripts/check-table-structure.js --table users
```

### 주요 테이블 참조
- `users`: 사용자 기본 정보
- `profiles`: 사용자 프로필
- `courses`: 강의 정보
- `yl_channels`: YouTube 채널
- `yl_videos`: YouTube 비디오
- `yl_keyword_trends`: 키워드 트렌드
- `notifications`: 알림

---

## 🚨 자주 발생하는 실수

### 1. RLS 정책 누락
```sql
-- ❌ 잘못된 예시
CREATE TABLE bad_table (...);
-- RLS 없음!

-- ✅ 올바른 예시
CREATE TABLE good_table (...);
ALTER TABLE good_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "..." ON good_table ...;
```

### 2. 타입 생성 누락
```bash
# ❌ SQL만 실행
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql

# ✅ 타입도 생성
node scripts/supabase-sql-executor.js --method pg --file migrations/001.sql
npm run types:generate
```

### 3. 검증 생략
```bash
# ❌ 검증 없이 완료
"테이블 생성 완료"

# ✅ 검증 후 완료
node scripts/verify-with-service-role.js
"✅ 테이블 생성 및 검증 완료"
```

---

## 📁 관련 문서

- 메인 가이드: `/CLAUDE.md`
- SQL 실행: `/scripts/CLAUDE.md`
- 타입 관리: `/src/types/CLAUDE.md`
- 보안 정책: `/src/lib/security/CLAUDE.md`

---

## ⚡ 긴급 상황 대응

### 테이블 삭제됨
```sql
-- 백업에서 복구
-- 1. 최근 마이그레이션 파일 확인
ls -la supabase/migrations/*.sql

-- 2. 해당 SQL 재실행
node scripts/supabase-sql-executor.js --method pg --file [파일명]
```

### RLS 정책 오류
```sql
-- 모든 정책 삭제 후 재생성
DROP POLICY IF EXISTS "policy_name" ON table_name;
-- 새 정책 생성
CREATE POLICY "new_policy" ON table_name ...;
```

---

*이 문서는 Context-less AI도 즉시 테이블을 생성할 수 있도록 설계되었습니다.*