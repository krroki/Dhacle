-- ====================================================
-- Fix: Create user_certificates Table Only
-- Phase 3: Security Hardening - Missing Table Fix
-- Date: 2025-08-25
-- ====================================================

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS user_certificates CASCADE;

-- Create user_certificates table
CREATE TABLE user_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completion_date TIMESTAMPTZ NOT NULL,
    grade TEXT,
    score NUMERIC(5,2),
    is_public BOOLEAN DEFAULT false,
    certificate_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(user_id, course_id) -- One certificate per user per course
);

-- Create indexes
CREATE INDEX idx_user_certificates_user_id ON user_certificates(user_id);
CREATE INDEX idx_user_certificates_course_id ON user_certificates(course_id);
CREATE INDEX idx_user_certificates_certificate_number ON user_certificates(certificate_number);
CREATE INDEX idx_user_certificates_is_public ON user_certificates(is_public);

-- Create or replace the trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for user_certificates
CREATE TRIGGER update_user_certificates_updated_at
    BEFORE UPDATE ON user_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ====================================================
-- Apply RLS Policies for user_certificates
-- ====================================================

-- Enable RLS
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own certificates
CREATE POLICY "Users can view own certificates" ON user_certificates
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy: Public certificates are viewable by all authenticated users
CREATE POLICY "Public certificates viewable by all" ON user_certificates
  FOR SELECT 
  USING (is_public = true AND auth.uid() IS NOT NULL);

-- Policy: System (service role) can create certificates
CREATE POLICY "System can create certificates" ON user_certificates
  FOR INSERT 
  WITH CHECK (false); -- Only service role can bypass this

-- Policy: Users can update their own certificates (e.g., make public/private)
CREATE POLICY "Users can update own certificates" ON user_certificates
  FOR UPDATE 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ====================================================
-- Verification
-- ====================================================

-- Check if table exists and has RLS enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN 'RLS ENABLED ✅'
        ELSE 'RLS DISABLED ❌'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_certificates';

-- List policies
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_certificates'
ORDER BY policyname;

-- ====================================================
-- Success Message
-- ====================================================
DO $$ 
BEGIN
    RAISE NOTICE 'user_certificates table created and RLS policies applied successfully!';
END $$;