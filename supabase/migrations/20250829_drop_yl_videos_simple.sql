-- Drop duplicate yl_videos table - Simple version
-- Created: 2025-08-29
-- Purpose: Eliminate table duplication - unify YouTube video data under single 'videos' table

-- Drop tables that reference yl_videos
DROP TABLE IF EXISTS yl_keyword_trends CASCADE;
DROP TABLE IF EXISTS yl_category_stats CASCADE; 
DROP TABLE IF EXISTS yl_follow_updates CASCADE;

-- Drop the main duplicate table
DROP TABLE IF EXISTS yl_videos CASCADE;

-- Verification queries (run manually after migration)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%videos%';