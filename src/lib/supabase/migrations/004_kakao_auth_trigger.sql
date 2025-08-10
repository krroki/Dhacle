-- ================================================
-- Kakao OAuth 자동 회원가입 트리거
-- Version: 004
-- Date: 2025-01-10
-- Description: 카카오 로그인 시 users 테이블에 자동으로 프로필 생성
-- Note: 비즈니스 인증 전 - profile_nickname, profile_image만 사용
-- ================================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 새로운 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 카카오 로그인 사용자 자동 등록
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    username,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    -- 이메일: 카카오는 비즈니스 인증 전에는 이메일 제공 안 함
    COALESCE(
      NEW.email, 
      NEW.raw_user_meta_data->>'email',
      NEW.id::text || '@kakao.user'  -- 임시 이메일
    ),
    -- 닉네임: 카카오의 profile_nickname 사용
    COALESCE(
      NEW.raw_user_meta_data->>'profile_nickname',
      NEW.raw_user_meta_data->>'nickname',
      NEW.raw_user_meta_data->>'name',
      '카카오사용자'
    ),
    -- 프로필 이미지
    COALESCE(
      NEW.raw_user_meta_data->>'profile_image',
      NEW.raw_user_meta_data->>'avatar_url',
      NULL
    ),
    -- username: 닉네임을 기반으로 생성 (공백을 언더스코어로, 소문자로)
    LOWER(
      REPLACE(
        COALESCE(
          NEW.raw_user_meta_data->>'profile_nickname',
          NEW.raw_user_meta_data->>'nickname',
          'user_' || LEFT(NEW.id::text, 8)
        ), 
        ' ', '_'
      )
    ),
    -- 기본 역할은 'user'
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    -- 충돌 시 프로필 이미지만 업데이트 (닉네임은 변경하지 않음)
    avatar_url = COALESCE(
      NEW.raw_user_meta_data->>'profile_image',
      users.avatar_url
    ),
    updated_at = NOW()
  WHERE users.id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- 테스트 쿼리
-- ================================================
-- 트리거가 제대로 생성되었는지 확인
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- users 테이블의 카카오 사용자 확인
-- SELECT id, email, full_name, username, avatar_url, role 
-- FROM public.users 
-- WHERE email LIKE '%@kakao.user';