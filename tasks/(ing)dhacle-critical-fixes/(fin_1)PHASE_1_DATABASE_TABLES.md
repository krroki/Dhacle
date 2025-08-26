/sc:implement --seq --validate --think
"Phase 1: 누락된 15개 DB 테이블 생성 및 RLS 정책 적용"

# Phase 1: 데이터베이스 테이블 생성 및 보안

## 🚨 프로젝트 특화 규칙 확인 (필수)
⚠️ **경고**: 아래 문서 미확인 시 프로젝트 파괴 가능성 90%

### 최우선 확인 문서
- [ ] `/docs/CONTEXT_BRIDGE.md` - 프로젝트 특화 규칙 (전체 읽기 필수)
- [ ] `/CLAUDE.md` 17-52행 - 능동적 해결 원칙 (STOP & ACT)
- [ ] `/docs/DATA_MODEL.md` - 데이터베이스 구조
- [ ] `/docs/PROJECT.md` 372-428행 - 테이블 현황

### 프로젝트 금지사항 체크 ✅
- [ ] 주석 처리하고 넘어가지 않음
- [ ] TODO 남기고 회피하지 않음
- [ ] 임시 테이블 생성 금지
- [ ] RLS 없는 테이블 생성 금지
- [ ] any 타입으로 회피 금지

### 작업 전 검증 명령어
```bash
# 기존 테이블 확인
node scripts/verify-with-service-role.js

# 주석 처리된 DB 호출 확인
grep -r "// .*supabase" src/ --include="*.ts" --include="*.tsx"

# 자동 스크립트 확인 (없어야 함)
ls scripts/fix-*.js 2>/dev/null
```

## 📌 Phase 정보
- **Phase 번호**: 1/4
- **선행 조건**: 없음 (독립적)
- **예상 시간**: 2-3일
- **우선순위**: CRITICAL
- **작업 범위**: 15개 테이블, 44개 주석 처리된 DB 호출

## 🎯 Phase 목표
1. 누락된 15개 테이블 완전 생성
2. 모든 테이블에 RLS 정책 적용
3. 주석 처리된 44개 DB 호출 복원
4. Supabase 타입 자동 생성

## 📚 온보딩 섹션
### 이 Phase에 필요한 지식
- [ ] `/docs/DATA_MODEL.md` - 테이블 구조
- [ ] `/src/lib/supabase/CLAUDE.md` - Supabase 패턴
- [ ] `/docs/PROJECT.md` 318-371행 - 마이그레이션 현황
- [ ] 기존 마이그레이션 파일 검토

### 작업 파일 경로
- 마이그레이션: `supabase/migrations/`
- 검증 스크립트: `scripts/verify-with-service-role.js`
- SQL 실행: `scripts/supabase-sql-executor.js`
- 주석 처리된 코드: `src/lib/youtube/pubsub.ts` 외 43개

## 📝 작업 내용

### 1단계: 누락 테이블 SQL 작성
```sql
-- 1. channelSubscriptions 테이블 (YouTube 구독 관리)
CREATE TABLE IF NOT EXISTS channelSubscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id text NOT NULL,
  channel_title text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'deleted')),
  last_checked timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

-- 2. yl_channels 테이블 (YouTube Lens 채널)
CREATE TABLE IF NOT EXISTS yl_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  subscriber_count bigint,
  video_count integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. api_usage 테이블 (API 사용량 추적)
CREATE TABLE IF NOT EXISTS api_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  quota_used integer DEFAULT 1,
  response_time integer,
  status_code integer,
  created_at timestamptz DEFAULT now()
);

-- 4. proof_reports 테이블 (수익 증명서 신고)
CREATE TABLE IF NOT EXISTS proof_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proof_id uuid REFERENCES revenue_proofs(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES auth.users(id),
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. coupons 테이블 (쿠폰 시스템)
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL,
  max_uses integer,
  used_count integer DEFAULT 0,
  valid_from timestamptz,
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 6. yl_approval_logs 테이블
CREATE TABLE IF NOT EXISTS yl_approval_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- 7. webhookEvents 테이블
CREATE TABLE IF NOT EXISTS webhookEvents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 8. subscriptionLogs 테이블
CREATE TABLE IF NOT EXISTS subscriptionLogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- 9. naverCafeVerifications 테이블
CREATE TABLE IF NOT EXISTS naverCafeVerifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  cafe_nickname text NOT NULL,
  verified boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 10-15. 나머지 테이블들...
```

### 2단계: RLS 정책 적용
```sql
-- 모든 테이블에 RLS 활성화
ALTER TABLE channelSubscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- channelSubscriptions 정책
CREATE POLICY "Users can manage own subscriptions" 
ON channelSubscriptions FOR ALL 
USING (auth.uid() = user_id);

-- yl_channels 정책 (공개 읽기, 관리자만 쓰기)
CREATE POLICY "Public can read channels" 
ON yl_channels FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage channels" 
ON yl_channels FOR INSERT 
USING (auth.uid() IN (
  SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
));

-- api_usage 정책
CREATE POLICY "Users can view own usage" 
ON api_usage FOR SELECT 
USING (auth.uid() = user_id);

-- 각 테이블별 적절한 정책 추가...
```

### 3단계: 주석 처리된 코드 복원
```typescript
// src/lib/youtube/pubsub.ts
// BEFORE (주석 처리됨):
// const { data: subscription } = await supabase
//   .from('channelSubscriptions')
//   .select('*')

// AFTER (복원 및 에러 처리 추가):
const { data: subscription, error } = await supabase
  .from('channelSubscriptions')
  .select('*')
  .eq('channel_id', channelId)
  .eq('user_id', userId)
  .single();

if (error) {
  console.error('Failed to fetch subscription:', error);
  throw new Error('구독 정보를 가져올 수 없습니다');
}

// 44개 모든 주석 처리된 DB 호출 복원
```

### 4단계: 타입 생성
```bash
# Supabase 타입 자동 생성
npx supabase gen types typescript --project-ref golbwnsytwbyoneucunx > src/types/database.types.ts

# src/types/index.ts 업데이트
export * from './database.types';
```

## 📋 QA 테스트 시나리오
### 정상 플로우
1. 각 테이블 CRUD 테스트
   ```bash
   # 테이블 존재 확인
   node scripts/verify-with-service-role.js
   
   # CRUD 테스트
   npm run test:db
   ```
2. RLS 정책 작동 확인
3. 외래키 제약 조건 테스트

### 실패 시나리오
1. 권한 없는 사용자 접근 → 차단 확인
2. 잘못된 데이터 타입 → 거부 확인  
3. 중복 키 → 오류 처리 확인

### 성능 측정
- 테이블 생성 시간: < 10초
- RLS 정책 적용: < 5초
- 타입 생성: < 30초

## ✅ Phase 완료 조건 (기능 작동 필수)
- [ ] **15개 테이블 모두 생성 완료**
- [ ] **모든 테이블 RLS 정책 적용**
- [ ] **44개 주석 처리 코드 복원**
- [ ] **CRUD 테스트 통과**
- [ ] **verify-with-service-role.js 검증 통과**
- [ ] **타입 생성 완료**: database.types.ts
- [ ] **빌드 성공**: npm run build
- [ ] **타입 체크 통과**: npm run type-check

## 🔄 롤백 절차
```bash
# Phase 1 전체 롤백
# 1. 생성한 테이블 삭제
DROP TABLE IF EXISTS channelSubscriptions CASCADE;
DROP TABLE IF EXISTS yl_channels CASCADE;
DROP TABLE IF EXISTS api_usage CASCADE;
DROP TABLE IF EXISTS proof_reports CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
# ... 나머지 테이블

# 2. 코드 원복
git checkout -- src/lib/youtube/pubsub.ts
git checkout -- src/types/database.types.ts

# 3. 이전 커밋으로 복원
git reset --hard HEAD~1
```

## → 다음 Phase
- **파일**: PHASE_2_TYPE_SYSTEM.md
- **선행 조건**: 
  - DB 테이블 생성 완료
  - database.types.ts 생성 완료
  - 모든 주석 처리된 DB 호출 복원