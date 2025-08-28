-- Create notifications table for user notifications
-- Created: 2025-08-28

-- Drop existing table if it exists
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement')),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    action_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Add comments
COMMENT ON TABLE public.notifications IS 'User notification system';
COMMENT ON COLUMN public.notifications.id IS 'Unique notification identifier';
COMMENT ON COLUMN public.notifications.user_id IS 'User who receives the notification';
COMMENT ON COLUMN public.notifications.title IS 'Notification title';
COMMENT ON COLUMN public.notifications.message IS 'Notification message content';
COMMENT ON COLUMN public.notifications.type IS 'Notification type (info, success, warning, error, achievement)';
COMMENT ON COLUMN public.notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN public.notifications.metadata IS 'Additional metadata in JSON format';
COMMENT ON COLUMN public.notifications.action_url IS 'Optional URL for notification action';
COMMENT ON COLUMN public.notifications.created_at IS 'When the notification was created';
COMMENT ON COLUMN public.notifications.read_at IS 'When the notification was read';

-- Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create RLS policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON public.notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Allow system/admin to create notifications (using service role)
-- Regular users cannot directly create notifications
CREATE POLICY "System can create notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (true); -- Service role will handle this

-- Create a function to mark notification as read and set read_at timestamp
CREATE OR REPLACE FUNCTION public.mark_notification_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set read_at when marking as read
DROP TRIGGER IF EXISTS set_notification_read_at ON public.notifications;
CREATE TRIGGER set_notification_read_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    WHEN (NEW.is_read = true AND OLD.is_read = false)
    EXECUTE FUNCTION public.mark_notification_read();

-- Create a function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count(p_user_id UUID)
RETURNS BIGINT AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM public.notifications
        WHERE user_id = p_user_id
        AND is_read = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT USAGE ON SEQUENCE public.notifications_id_seq TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count TO authenticated;

-- Insert sample notifications for testing (optional, remove in production)
-- These will only work if you have users in your auth.users table
/*
INSERT INTO public.notifications (user_id, title, message, type)
SELECT 
    id,
    'Welcome to Dhacle!',
    'Thank you for joining our platform. Explore YouTube Lens and other tools to grow your channel.',
    'success'
FROM auth.users
LIMIT 1;
*/