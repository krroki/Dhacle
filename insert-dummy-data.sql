-- ====================================
-- 수익 인증 더미 데이터 직접 삽입
-- 로그인 없이도 갤러리에서 볼 수 있음
-- ====================================

-- 임시 더미 사용자 생성 (이미 있으면 스킵)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'dummy1@test.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'dummy2@test.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000003', 'dummy3@test.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- users 테이블에도 추가
INSERT INTO users (id, email, username, full_name, avatar_url)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'dummy1@test.com', '쇼츠마스터', '김철수', 'https://i.pravatar.cc/150?img=1'),
  ('00000000-0000-0000-0000-000000000002', 'dummy2@test.com', '릴스여왕', '이영희', 'https://i.pravatar.cc/150?img=2'),
  ('00000000-0000-0000-0000-000000000003', 'dummy3@test.com', '틱톡킹', '박민수', 'https://i.pravatar.cc/150?img=3')
ON CONFLICT (id) DO NOTHING;

-- RLS 정책 임시 비활성화 (데이터 삽입용)
ALTER TABLE revenue_proofs DISABLE ROW LEVEL SECURITY;

-- 6개 이미지에 대한 수익 인증 데이터 삽입
INSERT INTO revenue_proofs (user_id, title, content, amount, platform, screenshot_url, signature_data, likes_count, comments_count, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 
 '2025년 5월 YouTube Shorts 수익 인증 💰', 
 '<p>안녕하세요! 5월 YouTube Shorts 수익을 인증합니다.</p><p>이번 달은 특히 바이럴된 영상이 많아서 수익이 크게 늘었습니다. 특히 음식 리뷰 쇼츠가 대박났어요!</p>', 
 2850000, 
 'youtube', 
 '/images/revenue-proof/20250514_155618.png',
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
 45, 12, NOW() - INTERVAL '5 days'),

('00000000-0000-0000-0000-000000000002', 
 '인스타그램 릴스 첫 100만원 돌파! 🎉', 
 '<p>드디어 인스타그램 릴스로 처음 100만원을 돌파했습니다!</p><p>꾸준히 업로드한 결과가 나타나기 시작하네요. 여러분도 포기하지 마세요!</p>', 
 1250000, 
 'instagram', 
 '/images/revenue-proof/20250713_195132.png',
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
 23, 8, NOW() - INTERVAL '4 days'),

('00000000-0000-0000-0000-000000000003', 
 'TikTok 크리에이터 펀드 첫 정산 완료', 
 '<p>드디어 TikTok에서도 수익이 발생했습니다!</p><p>아직 많지는 않지만 시작이 반이라고 생각해요. 계속 열심히 하겠습니다.</p>', 
 780000, 
 'tiktok', 
 '/images/revenue-proof/IMG_2157.png',
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
 15, 5, NOW() - INTERVAL '3 days'),

('00000000-0000-0000-0000-000000000001', 
 '6월 YouTube 역대 최고 수익 달성! 😱', 
 '<p>믿기지 않지만 6월에 역대 최고 수익을 달성했습니다!</p><p>420만원이라니... 아직도 실감이 안나네요. 노하우 곧 공유할게요!</p>', 
 4200000, 
 'youtube', 
 '/images/revenue-proof/KakaoTalk_20250618_054750921_01.png',
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
 89, 24, NOW() - INTERVAL '2 days'),

('00000000-0000-0000-0000-000000000002', 
 '멀티 플랫폼 전략 성공! 인스타+유튜브', 
 '<p>멀티 플랫폼 전략이 성공했습니다!</p><p>같은 콘텐츠를 여러 플랫폼에 올리니 수익이 2배가 되네요. 강추!</p>', 
 1850000, 
 'youtube', 
 '/images/revenue-proof/image (2).png',
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
 34, 11, NOW() - INTERVAL '1 day'),

('00000000-0000-0000-0000-000000000003', 
 'TikTok 라이브 방송 수익 150만원!', 
 '<p>TikTok 라이브 방송으로만 150만원 달성!</p><p>라이브 선물이 이렇게 수익이 좋을 줄 몰랐네요. 팬분들 감사합니다!</p>', 
 1500000, 
 'tiktok', 
 '/images/revenue-proof/스크린샷_2025-08-03_141501.png',
 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
 56, 18, NOW());

-- RLS 정책 다시 활성화
ALTER TABLE revenue_proofs ENABLE ROW LEVEL SECURITY;

-- 확인
SELECT COUNT(*) as total_data FROM revenue_proofs;

DO $$
DECLARE
  data_count INT;
BEGIN
  SELECT COUNT(*) INTO data_count FROM revenue_proofs;
  RAISE NOTICE '✅ %개의 수익 인증 데이터가 추가되었습니다!', data_count;
END $$;