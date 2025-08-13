-- 007_naver_cafe_nickname.sql
-- 네이버 카페 연동 및 랜덤 닉네임 시스템

-- profiles 테이블에 닉네임 관련 필드 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS random_nickname VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS naver_cafe_nickname VARCHAR(50),
ADD COLUMN IF NOT EXISTS naver_cafe_id VARCHAR(50) DEFAULT 'dinohighclass',
ADD COLUMN IF NOT EXISTS naver_cafe_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS naver_cafe_member_url TEXT,
ADD COLUMN IF NOT EXISTS naver_cafe_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS display_nickname VARCHAR(50) GENERATED ALWAYS AS (
  COALESCE(
    CASE WHEN naver_cafe_verified THEN naver_cafe_nickname ELSE NULL END,
    random_nickname,
    username
  )
) STORED;

-- 카페 ID 제약 조건 (dinohighclass만 허용)
ALTER TABLE public.profiles
ADD CONSTRAINT check_naver_cafe_id 
CHECK (naver_cafe_id IS NULL OR naver_cafe_id = 'dinohighclass');

-- 닉네임 변경 방지를 위한 트리거 함수
CREATE OR REPLACE FUNCTION prevent_random_nickname_change()
RETURNS TRIGGER AS $$
BEGIN
  -- random_nickname이 이미 설정되어 있고 변경하려고 하면 에러
  IF OLD.random_nickname IS NOT NULL AND NEW.random_nickname != OLD.random_nickname THEN
    RAISE EXCEPTION 'Random nickname cannot be changed once set';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS prevent_random_nickname_change_trigger ON public.profiles;
CREATE TRIGGER prevent_random_nickname_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_random_nickname_change();

-- 네이버 카페 인증 로그 테이블
CREATE TABLE IF NOT EXISTS public.naver_cafe_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cafe_id VARCHAR(50) DEFAULT 'dinohighclass',
  cafe_nickname VARCHAR(50),
  cafe_member_url TEXT,
  verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  verified_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT check_verification_cafe_id CHECK (cafe_id = 'dinohighclass')
);

-- RLS 활성화
ALTER TABLE public.naver_cafe_verifications ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 인증 요청만 볼 수 있음
CREATE POLICY "Users can view own verifications"
  ON public.naver_cafe_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 인증 요청만 생성할 수 있음
CREATE POLICY "Users can create own verifications"
  ON public.naver_cafe_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_random_nickname ON public.profiles(random_nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_naver_cafe_verified ON public.profiles(naver_cafe_verified);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_user_id ON public.naver_cafe_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_naver_cafe_verifications_status ON public.naver_cafe_verifications(verification_status);

-- 기존 사용자에게 랜덤 닉네임 생성 (애플리케이션 레벨에서 처리)
-- 이 부분은 별도의 스크립트나 API를 통해 처리해야 함

COMMENT ON COLUMN public.profiles.random_nickname IS '자동 생성된 랜덤 닉네임 (변경 불가)';
COMMENT ON COLUMN public.profiles.naver_cafe_nickname IS '네이버 카페 연동 닉네임';
COMMENT ON COLUMN public.profiles.naver_cafe_verified IS '네이버 카페 인증 여부';
COMMENT ON COLUMN public.profiles.naver_cafe_member_url IS '네이버 카페 회원 프로필 URL';
COMMENT ON COLUMN public.profiles.display_nickname IS '실제 표시되는 닉네임 (우선순위: 카페닉네임 > 랜덤닉네임 > username)';