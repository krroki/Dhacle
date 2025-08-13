-- 수익 인증 시드 데이터 추가 스크립트
-- 6개의 실제 이미지를 사용한 샘플 데이터

-- 먼저 기존 시드 데이터 삭제 (필요시)
-- DELETE FROM revenue_proofs WHERE title LIKE '% 수익 인증 사례%';

-- 프로필 데이터가 없는 경우 테스트용 프로필 생성
-- 실제 운영 시에는 실제 사용자 ID를 사용해야 함
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- auth.users에 테스트 사용자가 있는지 확인
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    -- 테스트 사용자가 없으면 시드 데이터 추가 불가
    IF test_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Please create a user first.';
        RETURN;
    END IF;

    -- profiles 테이블에 해당 사용자 프로필이 없으면 생성
    INSERT INTO profiles (id, username, avatar_url, bio, created_at, updated_at)
    VALUES (test_user_id, '수익왕', NULL, 'YouTube Shorts 크리에이터', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;

    -- 수익 인증 데이터 삽입
    INSERT INTO revenue_proofs (
        user_id,
        title,
        content,
        amount,
        platform,
        screenshot_url,
        screenshot_blur,
        signature_data,
        is_hidden,
        likes_count,
        comments_count,
        reports_count,
        created_at
    ) VALUES
    (
        test_user_id,
        '2025년 5월 YouTube Shorts 수익 인증',
        '<p>안녕하세요! 5월 YouTube Shorts 수익을 인증합니다.</p><p>이번 달은 특히 바이럴된 영상이 많아서 수익이 크게 늘었습니다. 주로 일상 브이로그와 먹방 콘텐츠를 제작했고, 하루 평균 3-4개의 쇼츠를 업로드했습니다.</p><p>꾸준함이 가장 중요한 것 같습니다. 매일 업로드하는 것이 힘들 때도 있지만, 구독자분들의 응원 덕분에 계속할 수 있었습니다.</p><p><strong>핵심 팁:</strong></p><ul><li>트렌드를 빠르게 캐치하기</li><li>썸네일과 제목 최적화</li><li>첫 3초가 가장 중요</li><li>댓글 소통 적극적으로</li></ul>',
        2850000,
        'youtube',
        '/images/revenue-proof/20250514_155618.png',
        '',
        'data:image/png;base64,signature_placeholder_1',
        false,
        42,
        15,
        0,
        NOW() - INTERVAL '2 days'
    ),
    (
        test_user_id,
        '2025년 7월 인스타그램 릴스 광고 수익',
        '<p>인스타그램 릴스로 처음 100만원을 돌파했습니다! 🎉</p><p>패션 하울과 메이크업 튜토리얼 콘텐츠를 주로 제작했고, 브랜드 협찬도 3건 받았습니다.</p><p>릴스는 YouTube Shorts와 다르게 스토리텔링이 더 중요한 것 같아요. 음악 선택도 정말 중요하고, 해시태그 전략도 필수입니다.</p><p><strong>성공 전략:</strong></p><ul><li>인기 음원 활용하기</li><li>릴스 전용 편집 스타일 개발</li><li>스토리에서 릴스로 유도</li><li>협찬 제품 자연스럽게 녹이기</li></ul>',
        1250000,
        'instagram',
        '/images/revenue-proof/20250713_195132.png',
        '',
        'data:image/png;base64,signature_placeholder_2',
        false,
        28,
        8,
        0,
        NOW() - INTERVAL '5 days'
    ),
    (
        test_user_id,
        'TikTok 크리에이터 펀드 첫 정산',
        '<p>드디어 TikTok에서도 수익이 발생했습니다!</p><p>댄스 챌린지와 코미디 콘텐츠로 팔로워 10만을 달성하고, 크리에이터 펀드에 가입했습니다.</p><p>TikTok은 알고리즘이 정말 강력해서 하나가 터지면 순식간에 조회수가 올라가더라구요. 대신 일관성 있는 콘텐츠가 중요합니다.</p><p><strong>TikTok 팁:</strong></p><ul><li>트렌드 사운드는 필수</li><li>첫 1초에 훅 넣기</li><li>세로 화면 최적화</li><li>라이브 방송도 병행하기</li></ul>',
        780000,
        'tiktok',
        '/images/revenue-proof/IMG_2157.png',
        '',
        'data:image/png;base64,signature_placeholder_3',
        false,
        35,
        12,
        0,
        NOW() - INTERVAL '7 days'
    ),
    (
        test_user_id,
        '6월 YouTube 최고 수익 달성!',
        '<p>믿기지 않지만 6월에 역대 최고 수익을 달성했습니다! 😱</p><p>게임 플레이 쇼츠가 대박이 났어요. 특히 신작 게임 공략 영상들이 조회수 100만을 넘었습니다.</p><p>이번에 깨달은 건 타이밍이 정말 중요하다는 것. 신작 게임 출시 직후가 골든타임입니다.</p><p><strong>게임 쇼츠 전략:</strong></p><ul><li>신작 게임 출시일 체크</li><li>핵심 장면만 편집</li><li>공략 정보는 자막으로</li><li>시리즈물로 연결하기</li></ul><p>다음 달도 이 기세를 이어가고 싶네요! 화이팅! 💪</p>',
        4200000,
        'youtube',
        '/images/revenue-proof/KakaoTalk_20250618_054750921_01.png',
        '',
        'data:image/png;base64,signature_placeholder_4',
        false,
        89,
        32,
        0,
        NOW() - INTERVAL '10 days'
    ),
    (
        test_user_id,
        '인스타그램 + YouTube 동시 운영 수익',
        '<p>멀티 플랫폼 전략이 성공했습니다!</p><p>같은 콘텐츠를 플랫폼별로 최적화해서 업로드하니 수익이 2배가 되었어요. 요리 레시피 콘텐츠인데, YouTube는 자세한 과정을, 인스타는 결과물 위주로 편집했습니다.</p><p><strong>멀티 플랫폼 운영 팁:</strong></p><ul><li>각 플랫폼 특성 이해하기</li><li>콘텐츠 재활용 전략</li><li>업로드 시간대 다르게</li><li>플랫폼별 소통 방식 차별화</li></ul><p>시간 관리가 힘들긴 하지만, 수익이 안정적으로 들어와서 만족스럽습니다.</p>',
        1850000,
        'youtube',
        '/images/revenue-proof/image (2).png',
        '',
        'data:image/png;base64,signature_placeholder_5',
        false,
        56,
        19,
        0,
        NOW() - INTERVAL '12 days'
    ),
    (
        test_user_id,
        '8월 TikTok 라이브 수익 공개',
        '<p>TikTok 라이브 방송으로만 150만원 달성!</p><p>매일 저녁 2시간씩 라이브를 진행했고, 주로 시청자들과 소통하면서 노래를 불렀습니다. 선물 기능이 활성화되면서 수익이 크게 늘었어요.</p><p><strong>라이브 방송 노하우:</strong></p><ul><li>정해진 시간에 꾸준히</li><li>시청자 닉네임 부르기</li><li>즉석 이벤트 자주하기</li><li>다른 크리에이터와 콜라보</li></ul><p>라이브는 정말 체력전이지만, 팬들과 직접 소통할 수 있어서 좋아요!</p>',
        1500000,
        'tiktok',
        '/images/revenue-proof/스크린샷_2025-08-03_141501.png',
        '',
        'data:image/png;base64,signature_placeholder_6',
        false,
        67,
        24,
        0,
        NOW() - INTERVAL '15 days'
    );

    -- 좋아요, 댓글 등 상호작용 데이터도 추가 가능
    -- 실제 운영 시에는 다른 사용자들의 상호작용 데이터를 추가

END $$;

-- 실행 확인 메시지
SELECT COUNT(*) as total_revenue_proofs FROM revenue_proofs;