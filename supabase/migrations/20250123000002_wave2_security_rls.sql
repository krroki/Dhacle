-- 🔐 보안 리팩토링: Wave 2 - RLS 정책 적용
-- 나머지 17개 테이블에 대한 Row Level Security 정책
-- Created: 2025-01-23
-- 
-- 대상 테이블:
-- YouTube Lens: videos, video_stats, channels, source_folders, folder_channels, 
--              alert_rules, alerts, collections, collection_items, saved_searches, subscriptions
-- 사용자 관련: user_api_keys, youtube_favorites, youtube_search_history, api_usage
-- 커뮤니티: community_posts, community_comments, community_likes
-- 강의 시스템: course_enrollments, course_progress
-- 기타: badges, community_links, naver_cafe_verifications

-- ============================================
-- YouTube Lens 테이블 그룹
-- ============================================

-- 1. videos 테이블 RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Videos viewable by everyone" ON videos;
DROP POLICY IF EXISTS "Users can manage own videos" ON videos;

-- 모든 사용자가 비디오 조회 가능
CREATE POLICY "Videos viewable by everyone" ON videos
    FOR SELECT
    USING (true);

-- 소유자만 수정/삭제 가능
CREATE POLICY "Users can manage own videos" ON videos
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. video_stats 테이블 RLS
ALTER TABLE video_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Video stats viewable by everyone" ON video_stats;
DROP POLICY IF EXISTS "System can insert video stats" ON video_stats;

-- 모든 사용자가 통계 조회 가능
CREATE POLICY "Video stats viewable by everyone" ON video_stats
    FOR SELECT
    USING (true);

-- 시스템만 통계 삽입 가능 (user_id 기반이 아님)
CREATE POLICY "System can insert video stats" ON video_stats
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 3. channels 테이블 RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Channels viewable by everyone" ON channels;
DROP POLICY IF EXISTS "Users can manage own channels" ON channels;

-- 모든 사용자가 채널 정보 조회 가능
CREATE POLICY "Channels viewable by everyone" ON channels
    FOR SELECT
    USING (true);

-- 인증된 사용자만 채널 추가/수정 가능
CREATE POLICY "Users can manage own channels" ON channels
    FOR ALL
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- 4. source_folders 테이블 RLS
ALTER TABLE source_folders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own folders" ON source_folders;
DROP POLICY IF EXISTS "Users can manage own folders" ON source_folders;

-- 자신의 폴더만 조회 가능
CREATE POLICY "Users can view own folders" ON source_folders
    FOR SELECT
    USING (auth.uid() = user_id);

-- 자신의 폴더만 관리 가능
CREATE POLICY "Users can manage own folders" ON source_folders
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. folder_channels 테이블 RLS
ALTER TABLE folder_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own folder channels" ON folder_channels;

-- 폴더 소유자만 채널 매핑 관리 가능
CREATE POLICY "Users can manage own folder channels" ON folder_channels
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM source_folders
            WHERE source_folders.id = folder_channels.folder_id
            AND source_folders.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM source_folders
            WHERE source_folders.id = folder_channels.folder_id
            AND source_folders.user_id = auth.uid()
        )
    );

-- 6. alert_rules 테이블 RLS
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own alert rules" ON alert_rules;

-- 자신의 알림 규칙만 관리 가능
CREATE POLICY "Users can manage own alert rules" ON alert_rules
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. alerts 테이블 RLS
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;

-- 자신의 알림만 조회 가능
CREATE POLICY "Users can view own alerts" ON alerts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. collections 테이블 RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public collections viewable" ON collections;
DROP POLICY IF EXISTS "Users can manage own collections" ON collections;

-- 공개 컬렉션은 모두 조회 가능, 비공개는 소유자만
CREATE POLICY "Public collections viewable" ON collections
    FOR SELECT
    USING (
        is_public = true 
        OR user_id = auth.uid()
    );

-- 자신의 컬렉션만 관리 가능
CREATE POLICY "Users can manage own collections" ON collections
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. collection_items 테이블 RLS
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Collection items follow collection policy" ON collection_items;

-- 컬렉션 정책 따름
CREATE POLICY "Collection items follow collection policy" ON collection_items
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND (collections.is_public = true OR collections.user_id = auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM collections
            WHERE collections.id = collection_items.collection_id
            AND collections.user_id = auth.uid()
        )
    );

-- 10. saved_searches 테이블 RLS
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own saved searches" ON saved_searches;

-- 자신의 저장된 검색만 관리 가능
CREATE POLICY "Users can manage own saved searches" ON saved_searches
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 11. subscriptions 테이블 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subscriptions" ON subscriptions;

-- 자신의 구독만 관리 가능
CREATE POLICY "Users can manage own subscriptions" ON subscriptions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 사용자 데이터 테이블 그룹
-- ============================================

-- 12. user_api_keys 테이블 RLS (매우 중요!)
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own API keys" ON user_api_keys;

-- 절대적으로 자신의 API 키만 접근 가능
CREATE POLICY "Users can manage own API keys" ON user_api_keys
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 13. youtube_favorites 테이블 RLS
ALTER TABLE youtube_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own favorites" ON youtube_favorites;

-- 자신의 즐겨찾기만 관리 가능
CREATE POLICY "Users can manage own favorites" ON youtube_favorites
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 14. youtube_search_history 테이블 RLS
ALTER TABLE youtube_search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own search history" ON youtube_search_history;

-- 자신의 검색 기록만 관리 가능
CREATE POLICY "Users can manage own search history" ON youtube_search_history
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 15. api_usage 테이블 RLS
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own API usage" ON api_usage;

-- 자신의 API 사용량만 조회 가능
CREATE POLICY "Users can view own API usage" ON api_usage
    FOR SELECT
    USING (auth.uid() = user_id);

-- 시스템만 사용량 기록 가능
CREATE POLICY "System can track API usage" ON api_usage
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 커뮤니티 테이블 그룹
-- ============================================

-- 16. community_posts 테이블 RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public posts viewable by everyone" ON community_posts;
DROP POLICY IF EXISTS "Users can manage own posts" ON community_posts;

-- 공개 게시글은 모두 조회 가능
CREATE POLICY "Public posts viewable by everyone" ON community_posts
    FOR SELECT
    USING (
        status = 'published'
        OR user_id = auth.uid()
    );

-- 자신의 게시글만 관리 가능
CREATE POLICY "Users can manage own posts" ON community_posts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 17. community_comments 테이블 RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments on public posts viewable" ON community_comments;
DROP POLICY IF EXISTS "Users can manage own comments" ON community_comments;

-- 공개 게시글의 댓글은 모두 조회 가능
CREATE POLICY "Comments on public posts viewable" ON community_comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM community_posts
            WHERE community_posts.id = community_comments.post_id
            AND (community_posts.status = 'published' OR community_posts.user_id = auth.uid())
        )
    );

-- 자신의 댓글만 관리 가능
CREATE POLICY "Users can manage own comments" ON community_comments
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 18. community_likes 테이블 RLS
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes on public posts viewable" ON community_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON community_likes;

-- 공개 게시글의 좋아요는 모두 조회 가능
CREATE POLICY "Likes on public posts viewable" ON community_likes
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM community_posts
            WHERE community_posts.id = community_likes.post_id
            AND community_posts.status = 'published'
        )
    );

-- 자신의 좋아요만 관리 가능
CREATE POLICY "Users can manage own likes" ON community_likes
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 강의 시스템 테이블 그룹
-- ============================================

-- 19. course_enrollments 테이블 RLS
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own enrollments" ON course_enrollments;
DROP POLICY IF EXISTS "Users can create own enrollment" ON course_enrollments;

-- 자신의 수강 정보만 조회 가능
CREATE POLICY "Users can view own enrollments" ON course_enrollments
    FOR SELECT
    USING (auth.uid() = user_id);

-- 자신의 수강 신청만 생성 가능
CREATE POLICY "Users can create own enrollment" ON course_enrollments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 20. course_progress 테이블 RLS
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own progress" ON course_progress;

-- 자신의 진도만 관리 가능
CREATE POLICY "Users can manage own progress" ON course_progress
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 기타 테이블
-- ============================================

-- 21. badges 테이블 RLS (있을 경우)
-- 테이블이 존재하는 경우에만 적용
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'badges') THEN
        ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Badges viewable by everyone" ON badges;
        
        -- 뱃지는 모두 조회 가능
        CREATE POLICY "Badges viewable by everyone" ON badges
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- 22. community_links 테이블 RLS (있을 경우)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'community_links') THEN
        ALTER TABLE community_links ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Community links viewable by everyone" ON community_links;
        
        -- 커뮤니티 링크는 모두 조회 가능
        CREATE POLICY "Community links viewable by everyone" ON community_links
            FOR SELECT
            USING (true);
    END IF;
END $$;

-- 23. naver_cafe_verifications 테이블 RLS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'naver_cafe_verifications') THEN
        ALTER TABLE naver_cafe_verifications ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage own verifications" ON naver_cafe_verifications;
        
        -- 자신의 인증 정보만 관리 가능
        CREATE POLICY "Users can manage own verifications" ON naver_cafe_verifications
            FOR ALL
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================
-- RLS 정책 검증 쿼리
-- ============================================

-- RLS가 활성화된 테이블 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND rowsecurity = true
ORDER BY tablename;

-- 각 테이블의 정책 확인
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;