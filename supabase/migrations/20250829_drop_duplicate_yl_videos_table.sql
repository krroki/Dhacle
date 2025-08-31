-- Drop duplicate yl_videos table
-- Created: 2025-08-29
-- Purpose: Eliminate table duplication - unify YouTube video data under single 'videos' table

BEGIN;

-- ============================================
-- SAFETY CHECK: Verify videos table exists and has data
-- ============================================

DO $$
DECLARE
    video_count INTEGER;
    yl_video_count INTEGER;
BEGIN
    -- Check if videos table exists and has data
    SELECT COUNT(*) INTO video_count FROM videos WHERE created_at >= NOW() - INTERVAL '30 days';
    
    -- Check yl_videos table
    SELECT COUNT(*) INTO yl_video_count FROM yl_videos WHERE created_at >= NOW() - INTERVAL '30 days';
    
    RAISE NOTICE 'Videos table has % recent records', video_count;
    RAISE NOTICE 'yl_videos table has % recent records', yl_video_count;
    
    -- Safety check: Don't proceed if videos table is empty but yl_videos has data
    IF video_count = 0 AND yl_video_count > 0 THEN
        RAISE EXCEPTION 'SAFETY CHECK FAILED: videos table is empty but yl_videos has data. Manual data migration required.';
    END IF;
END $$;

-- ============================================
-- OPTIONAL: Data migration (if needed)
-- ============================================

-- Uncomment this block ONLY if you need to migrate data from yl_videos to videos
/*
INSERT INTO videos (
    id,                    -- yl_videos.video_id → videos.id  
    channel_id,
    title, 
    description,
    published_at,
    view_count,
    like_count,
    comment_count,
    thumbnail_url,
    tags,
    duration,              -- yl_videos.duration_seconds → videos.duration (convert to ISO 8601)
    created_at,
    updated_at
)
SELECT 
    video_id,              -- YouTube video ID becomes the primary key
    channel_id,
    title,
    description,
    published_at,
    view_count,
    like_count, 
    comment_count,
    thumbnail_url,
    tags,
    CASE 
        WHEN duration_seconds IS NOT NULL 
        THEN 'PT' || duration_seconds || 'S'  -- Convert seconds to ISO 8601 duration
        ELSE NULL 
    END,
    created_at,
    updated_at
FROM yl_videos
WHERE video_id NOT IN (SELECT id FROM videos)  -- Avoid duplicates
ON CONFLICT (id) DO NOTHING;  -- Skip if already exists
*/

-- ============================================
-- DROP DUPLICATE TABLES AND DEPENDENCIES  
-- ============================================

-- Drop tables that reference yl_videos
DROP TABLE IF EXISTS yl_keyword_trends CASCADE;
DROP TABLE IF EXISTS yl_category_stats CASCADE; 
DROP TABLE IF EXISTS yl_follow_updates CASCADE;

-- Drop the main duplicate table
DROP TABLE IF EXISTS yl_videos CASCADE;

-- ============================================
-- CLEANUP: Remove orphaned types and functions
-- ============================================

-- Remove any orphaned RLS policies (automatically dropped with tables)
-- Remove any orphaned triggers (automatically dropped with tables) 
-- Remove any orphaned indexes (automatically dropped with tables)

-- ============================================ 
-- VERIFICATION
-- ============================================

DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Verify yl_videos table is dropped
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'yl_videos'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE EXCEPTION 'ERROR: yl_videos table still exists after drop operation';
    ELSE
        RAISE NOTICE 'SUCCESS: yl_videos table successfully removed';
    END IF;
    
    -- Verify videos table still exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'videos'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'CRITICAL ERROR: videos table does not exist!';
    ELSE
        RAISE NOTICE 'SUCCESS: videos table is intact';
    END IF;
END $$;

COMMIT;

-- ============================================
-- POST-MIGRATION TASKS
-- ============================================

-- 1. Run: npm run types:generate (to update TypeScript types)
-- 2. Run: npm run build (to verify no compilation errors)
-- 3. Run: node scripts/verify-with-service-role.js (to verify database integrity)
-- 4. Test: /api/youtube-lens/keywords/trends (to verify API still works)

RAISE NOTICE '✅ Migration completed successfully';
RAISE NOTICE '📋 Next steps:';
RAISE NOTICE '   1. npm run types:generate'; 
RAISE NOTICE '   2. npm run build';
RAISE NOTICE '   3. node scripts/verify-with-service-role.js';
RAISE NOTICE '   4. Test /api/youtube-lens/keywords/trends';