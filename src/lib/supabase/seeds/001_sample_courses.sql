-- ====================================
-- 샘플 데이터 시드 스크립트
-- 실행 방법: npm run db:seed
-- ====================================

-- 기존 샘플 데이터 정리 (선택사항)
-- DELETE FROM lessons WHERE course_id IN (SELECT id FROM courses WHERE title LIKE '%샘플%' OR title LIKE '%테스트%');
-- DELETE FROM course_enrollments WHERE course_id IN (SELECT id FROM courses WHERE title LIKE '%샘플%' OR title LIKE '%테스트%');
-- DELETE FROM courses WHERE title LIKE '%샘플%' OR title LIKE '%테스트%';
-- DELETE FROM instructor_profiles WHERE display_name IN ('김쇼츠', '이크리에이터', '박콘텐츠', '최바이럴');

-- ====================================
-- 1. 샘플 강사 프로필 추가
-- ====================================
INSERT INTO instructor_profiles (
  id,
  display_name, 
  bio, 
  specialty, 
  avatar_url,
  is_verified,
  youtube_channel,
  subscriber_count,
  created_at
) VALUES 
  (
    gen_random_uuid(),
    '김쇼츠',
    'YouTube Shorts 전문가, 구독자 100만 달성. 5년간 1000개 이상의 Shorts 제작 경험.',
    'Shorts 알고리즘',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=kimshorts',
    true,
    '@kimshorts',
    1250000,
    NOW()
  ),
  (
    gen_random_uuid(),
    '이크리에이터',
    '콘텐츠 기획 전문가. 바이럴 콘텐츠 제작의 비밀을 공개합니다.',
    '바이럴 콘텐츠',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=leecreator',
    true,
    '@leecreator',
    890000,
    NOW()
  ),
  (
    gen_random_uuid(),
    '박콘텐츠',
    '편집 마스터. Adobe Premiere Pro, After Effects 공인 강사.',
    '영상 편집',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=parkcontent',
    true,
    '@parkcontent',
    560000,
    NOW()
  ),
  (
    gen_random_uuid(),
    '최바이럴',
    '트렌드 분석 전문가. 데이터 기반 콘텐츠 전략 수립.',
    '트렌드 분석',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=choiviral',
    false,
    '@choiviral',
    230000,
    NOW()
  );

-- ====================================
-- 2. 샘플 강의 추가
-- ====================================
INSERT INTO courses (
  id,
  title,
  subtitle,
  description,
  instructor_name,
  thumbnail_url,
  price,
  discount_price,
  is_free,
  status,
  category,
  difficulty,
  duration_hours,
  total_lessons,
  student_count,
  average_rating,
  review_count,
  tags,
  requirements,
  what_youll_learn,
  created_at,
  updated_at
) VALUES 
  (
    gen_random_uuid(),
    'YouTube Shorts 마스터 클래스',
    '30일 만에 10만 구독자 달성하기',
    '쇼츠 알고리즘부터 편집 노하우까지, YouTube Shorts의 모든 것을 알려드립니다. 실제 사례와 데이터를 바탕으로 한 실전 중심 강의입니다.',
    '김쇼츠',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
    99000,
    79000,
    false,
    'active',
    '콘텐츠 제작',
    'beginner',
    12.5,
    45,
    1234,
    4.8,
    234,
    ARRAY['쇼츠', '유튜브', '알고리즘', '편집'],
    ARRAY['스마트폰 보유', '기초적인 영상 편집 지식', 'YouTube 채널 개설'],
    ARRAY['Shorts 알고리즘 완벽 이해', '바이럴 콘텐츠 제작 공식', '효과적인 해시태그 전략', '편집 효율 200% 상승'],
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '무료 Shorts 입문 가이드',
    '초보자를 위한 기초 과정',
    'YouTube Shorts를 처음 시작하는 분들을 위한 무료 강의입니다. 채널 개설부터 첫 영상 업로드까지 차근차근 알려드립니다.',
    '이크리에이터',
    'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=800',
    0,
    0,
    true,
    'active',
    '콘텐츠 제작',
    'beginner',
    3.0,
    12,
    5678,
    4.5,
    567,
    ARRAY['무료', '입문', '기초', '쇼츠'],
    ARRAY['없음'],
    ARRAY['YouTube 채널 개설 방법', 'Shorts 기본 설정', '첫 영상 업로드하기'],
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '프리미어 프로로 Shorts 편집하기',
    '전문가급 편집 스킬 마스터',
    'Adobe Premiere Pro를 활용한 전문적인 Shorts 편집 기법을 배웁니다. 트랜지션, 이펙트, 색보정까지 완벽 마스터!',
    '박콘텐츠',
    'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44b?w=800',
    149000,
    119000,
    false,
    'active',
    '영상 편집',
    'intermediate',
    18.0,
    62,
    892,
    4.9,
    178,
    ARRAY['프리미어', '편집', '이펙트', '색보정'],
    ARRAY['Adobe Premiere Pro 설치', '기본 편집 경험', '8GB 이상 RAM'],
    ARRAY['프리미어 프로 완벽 활용', '프로페셔널 트랜지션', '색보정 마스터', '편집 속도 300% 향상'],
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    '데이터로 보는 바이럴 전략',
    'YouTube Analytics 완벽 분석',
    '숫자로 말하는 성공 전략! YouTube Analytics를 활용한 데이터 기반 콘텐츠 전략을 수립하는 방법을 알려드립니다.',
    '최바이럴',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    89000,
    89000,
    false,
    'active',
    '마케팅 전략',
    'advanced',
    8.5,
    32,
    456,
    4.7,
    91,
    ARRAY['분석', '데이터', '전략', '마케팅'],
    ARRAY['YouTube 채널 운영 경험', 'Analytics 접근 권한', '기초 통계 지식'],
    ARRAY['Analytics 완벽 이해', 'CTR 최적화 전략', 'A/B 테스트 방법론', '데이터 기반 의사결정'],
    NOW(),
    NOW()
  );

-- ====================================
-- 3. 샘플 레슨 추가 (각 강의별)
-- ====================================

-- YouTube Shorts 마스터 클래스 레슨
WITH master_course AS (
  SELECT id FROM courses WHERE title = 'YouTube Shorts 마스터 클래스' LIMIT 1
)
INSERT INTO lessons (
  course_id,
  title,
  description,
  video_url,
  duration,
  order_index,
  is_free,
  is_preview
)
SELECT 
  mc.id,
  title,
  description,
  video_url,
  duration,
  order_index,
  is_free,
  is_preview
FROM master_course mc,
(VALUES
  ('오리엔테이션 - 강의 소개와 목표', '이 강의를 통해 달성할 수 있는 목표와 커리큘럼을 소개합니다.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 600, 1, true, true),
  ('Shorts 알고리즘의 비밀', 'YouTube Shorts 알고리즘이 작동하는 원리를 상세히 설명합니다.', NULL, 1200, 2, true, true),
  ('완벽한 Shorts 기획하기', '시청자를 사로잡는 Shorts 콘텐츠 기획 방법을 배웁니다.', NULL, 900, 3, false, false),
  ('스마트폰으로 촬영하기', '전문가급 촬영을 위한 스마트폰 활용법을 알아봅니다.', NULL, 1500, 4, false, false),
  ('1분 안에 편집 완료하기', '빠르고 효과적인 편집 워크플로우를 구축합니다.', NULL, 1800, 5, false, false),
  ('썸네일과 제목 최적화', 'CTR을 높이는 썸네일과 제목 작성법을 배웁니다.', NULL, 1200, 6, false, false),
  ('해시태그 전략', '효과적인 해시태그 사용 전략을 수립합니다.', NULL, 900, 7, false, false),
  ('업로드 타이밍의 중요성', '최적의 업로드 시간대를 찾는 방법을 알아봅니다.', NULL, 600, 8, false, false),
  ('시청자 참여 유도하기', '댓글, 좋아요, 구독을 늘리는 전략을 배웁니다.', NULL, 1200, 9, false, false),
  ('데이터 분석과 개선', 'Analytics를 활용한 콘텐츠 개선 방법을 익힙니다.', NULL, 1500, 10, false, false)
) AS lessons(title, description, video_url, duration, order_index, is_free, is_preview);

-- 무료 Shorts 입문 가이드 레슨
WITH free_course AS (
  SELECT id FROM courses WHERE title = '무료 Shorts 입문 가이드' LIMIT 1
)
INSERT INTO lessons (
  course_id,
  title,
  description,
  video_url,
  duration,
  order_index,
  is_free,
  is_preview
)
SELECT 
  fc.id,
  title,
  description,
  video_url,
  duration,
  order_index,
  is_free,
  is_preview
FROM free_course fc,
(VALUES
  ('YouTube 채널 만들기', 'Google 계정으로 YouTube 채널을 개설하는 방법을 배웁니다.', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', 300, 1, true, true),
  ('Shorts란 무엇인가?', 'YouTube Shorts의 특징과 일반 영상과의 차이점을 알아봅니다.', NULL, 450, 2, true, true),
  ('첫 Shorts 아이디어 찾기', '초보자도 쉽게 만들 수 있는 Shorts 아이디어를 소개합니다.', NULL, 600, 3, true, false),
  ('스마트폰 기본 설정', '촬영을 위한 스마트폰 카메라 설정 방법을 배웁니다.', NULL, 400, 4, true, false),
  ('무료 편집 앱 소개', '초보자를 위한 무료 모바일 편집 앱을 소개합니다.', NULL, 500, 5, true, false),
  ('첫 영상 업로드하기', 'Shorts 업로드 과정을 단계별로 따라합니다.', NULL, 350, 6, true, false)
) AS lessons(title, description, video_url, duration, order_index, is_free, is_preview);

-- ====================================
-- 4. 샘플 수강 신청 데이터 (선택사항)
-- ====================================

-- 테스트용 사용자가 있다면 수강 신청 데이터 추가
-- INSERT INTO course_enrollments (user_id, course_id, enrolled_at, status)
-- SELECT 
--   'test-user-id',
--   id,
--   NOW() - INTERVAL '7 days',
--   'active'
-- FROM courses 
-- WHERE is_free = true
-- LIMIT 1;

-- ====================================
-- 5. 샘플 진도 데이터 (선택사항)
-- ====================================

-- INSERT INTO course_progress (user_id, course_id, lesson_id, completed, progress_percent)
-- SELECT 
--   'test-user-id',
--   l.course_id,
--   l.id,
--   CASE WHEN l.order_index <= 3 THEN true ELSE false END,
--   CASE WHEN l.order_index <= 3 THEN 100 ELSE 0 END
-- FROM lessons l
-- WHERE l.course_id IN (
--   SELECT id FROM courses WHERE is_free = true LIMIT 1
-- )
-- AND l.order_index <= 5;

-- ====================================
-- 통계 업데이트
-- ====================================

-- 강의별 레슨 수 업데이트
UPDATE courses c
SET total_lessons = (
  SELECT COUNT(*) 
  FROM lessons l 
  WHERE l.course_id = c.id
)
WHERE c.title IN (
  'YouTube Shorts 마스터 클래스',
  '무료 Shorts 입문 가이드',
  '프리미어 프로로 Shorts 편집하기',
  '데이터로 보는 바이럴 전략'
);

-- 강의 시간 계산 및 업데이트
UPDATE courses c
SET duration_hours = (
  SELECT ROUND(SUM(duration) / 3600.0, 1)
  FROM lessons l 
  WHERE l.course_id = c.id
)
WHERE c.title IN (
  'YouTube Shorts 마스터 클래스',
  '무료 Shorts 입문 가이드',
  '프리미어 프로로 Shorts 편집하기',
  '데이터로 보는 바이럴 전략'
);

-- 완료 메시지
SELECT 
  '✅ 시드 데이터 생성 완료' as status,
  COUNT(*) as total_courses,
  SUM(CASE WHEN is_free THEN 1 ELSE 0 END) as free_courses,
  SUM(CASE WHEN is_free = false THEN 1 ELSE 0 END) as paid_courses
FROM courses
WHERE created_at >= NOW() - INTERVAL '1 minute';