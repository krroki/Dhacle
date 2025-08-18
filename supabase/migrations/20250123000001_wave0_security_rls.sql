-- 🔐 보안 리팩토링: Wave 0 - Task 2
-- 4개 핵심 테이블 RLS (Row Level Security) 정책 적용
-- Created: 2025-01-23

-- ============================================
-- 1. users 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;

-- SELECT 정책: 자신의 레코드만 조회 가능
CREATE POLICY "Users can view own record" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- UPDATE 정책: 자신의 레코드만 수정 가능
CREATE POLICY "Users can update own record" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. profiles 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- SELECT 정책: 모든 사용자가 프로필 조회 가능 (공개 프로필)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT
    USING (true);

-- INSERT 정책: 자신의 프로필만 생성 가능
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE 정책: 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. revenue_proofs 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE revenue_proofs ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Revenue proofs are viewable by everyone" ON revenue_proofs;
DROP POLICY IF EXISTS "Users can create own revenue proof" ON revenue_proofs;
DROP POLICY IF EXISTS "Users can update own revenue proof" ON revenue_proofs;
DROP POLICY IF EXISTS "Users can delete own revenue proof" ON revenue_proofs;

-- SELECT 정책: 공개된 수익 인증은 모두 조회 가능
CREATE POLICY "Revenue proofs are viewable by everyone" ON revenue_proofs
    FOR SELECT
    USING (
        status = 'approved' 
        OR status = 'published'
        OR user_id = auth.uid()
    );

-- INSERT 정책: 인증된 사용자만 생성 가능
CREATE POLICY "Users can create own revenue proof" ON revenue_proofs
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IS NOT NULL
    );

-- UPDATE 정책: 자신의 수익 인증만 수정 가능
CREATE POLICY "Users can update own revenue proof" ON revenue_proofs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE 정책: 자신의 수익 인증만 삭제 가능
CREATE POLICY "Users can delete own revenue proof" ON revenue_proofs
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 4. payments 테이블 RLS
-- ============================================

-- RLS 활성화
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create own payment" ON payments;
DROP POLICY IF EXISTS "Users can update own payment status" ON payments;

-- SELECT 정책: 자신의 결제 내역만 조회 가능
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT 정책: 인증된 사용자만 결제 생성 가능
CREATE POLICY "Users can create own payment" ON payments
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND auth.uid() IS NOT NULL
    );

-- UPDATE 정책: 자신의 결제 상태만 업데이트 가능 (webhook 제외)
CREATE POLICY "Users can update own payment status" ON payments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);