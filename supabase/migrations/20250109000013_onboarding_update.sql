-- Migration: Add new onboarding fields to profiles table
-- Date: 2025-01-17
-- Description: 사용자 온보딩 프로세스 개선을 위한 필드 추가

-- profiles 테이블에 새로운 필드 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS work_type VARCHAR(20) CHECK (work_type IN ('main', 'side')),
ADD COLUMN IF NOT EXISTS job_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS current_income VARCHAR(20),
ADD COLUMN IF NOT EXISTS target_income VARCHAR(20);

-- 기존 experience_level 필드가 없다면 추가
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced'));

-- 필드 설명 추가
COMMENT ON COLUMN public.profiles.work_type IS '크리에이터 활동 형태: main(본업), side(부업)';
COMMENT ON COLUMN public.profiles.job_category IS '현재 직업 카테고리: office_worker, student, freelancer, self_employed, creator, unemployed, other';
COMMENT ON COLUMN public.profiles.current_income IS '현재 월 평균 수입 범위: 0-100, 100-300, 300-500, 500-1000, 1000+';
COMMENT ON COLUMN public.profiles.target_income IS '목표 월 수입 범위: 0-100, 100-300, 300-500, 500-1000, 1000+';
COMMENT ON COLUMN public.profiles.experience_level IS '크리에이터 경험 수준: beginner, intermediate, advanced';

-- 인덱스 추가 (검색 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_work_type ON public.profiles(work_type);
CREATE INDEX IF NOT EXISTS idx_profiles_job_category ON public.profiles(job_category);
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);