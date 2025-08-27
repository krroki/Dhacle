-- Add status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'yl_channels' AND column_name = 'status'
  ) THEN
    ALTER TABLE yl_channels ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
  END IF;
END $$;

-- Add approved_by column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'yl_channels' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE yl_channels ADD COLUMN approved_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Add approved_at column if it doesn't exist  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'yl_channels' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE yl_channels ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- Now that columns exist, create/replace policies
-- Drop existing policies
DROP POLICY IF EXISTS "yl_channels_read_approved" ON yl_channels;
DROP POLICY IF EXISTS "yl_channels_admin_all" ON yl_channels;
DROP POLICY IF EXISTS "yl_daily_delta_read" ON yl_channel_daily_delta;
DROP POLICY IF EXISTS "yl_daily_delta_admin" ON yl_channel_daily_delta;
DROP POLICY IF EXISTS "yl_approval_logs_admin" ON yl_approval_logs;

-- Enable RLS if not already enabled
ALTER TABLE yl_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_channel_daily_delta ENABLE ROW LEVEL SECURITY;
ALTER TABLE yl_approval_logs ENABLE ROW LEVEL SECURITY;

-- Create new policies
-- 읽기 권한 (승인된 채널은 모든 사용자가 볼 수 있음)
CREATE POLICY "yl_channels_read_approved" ON yl_channels
  FOR SELECT 
  USING (
    status = 'approved' OR 
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 관리자 전체 권한 
CREATE POLICY "yl_channels_admin_all" ON yl_channels
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 일별 델타 읽기 권한 (승인된 채널만)
CREATE POLICY "yl_daily_delta_read" ON yl_channel_daily_delta
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM yl_channels 
      WHERE yl_channels.channel_id = yl_channel_daily_delta.channel_id 
      AND yl_channels.status = 'approved'
    ) OR auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 일별 델타 관리자 전체 권한
CREATE POLICY "yl_daily_delta_admin" ON yl_channel_daily_delta
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- 승인 로그 관리자만 볼 수 있음
CREATE POLICY "yl_approval_logs_admin" ON yl_approval_logs
  FOR ALL 
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );