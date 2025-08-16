-- YouTube PubSubHubbub Subscriptions Table
-- Tracks channel subscriptions for real-time updates via webhooks

-- Create channel_subscriptions table
CREATE TABLE IF NOT EXISTS public.channel_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    channel_title VARCHAR(255),
    hub_callback_url TEXT NOT NULL,
    hub_secret VARCHAR(255) NOT NULL,
    hub_topic TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'active', 'expired', 'failed')),
    lease_seconds INTEGER DEFAULT 86400, -- Default 24 hours
    expires_at TIMESTAMPTZ,
    last_notification_at TIMESTAMPTZ,
    notification_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique subscription per channel per user
    UNIQUE(channel_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_channel_id ON public.channel_subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_user_id ON public.channel_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_status ON public.channel_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_channel_subscriptions_expires_at ON public.channel_subscriptions(expires_at);

-- Create webhook_events table for tracking incoming notifications
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES public.channel_subscriptions(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'video_published', 'video_updated', 'video_deleted'
    video_id VARCHAR(255),
    video_title TEXT,
    published_at TIMESTAMPTZ,
    raw_data JSONB,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_subscription_id ON public.webhook_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_video_id ON public.webhook_events(video_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at DESC);

-- Create subscription_logs table for debugging
CREATE TABLE IF NOT EXISTS public.subscription_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES public.channel_subscriptions(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'subscribe', 'unsubscribe', 'verify', 'renew', 'expire'
    status VARCHAR(50),
    request_data JSONB,
    response_data JSONB,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for subscription_logs
CREATE INDEX IF NOT EXISTS idx_subscription_logs_subscription_id ON public.subscription_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created_at ON public.subscription_logs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for channel_subscriptions
DROP TRIGGER IF EXISTS update_channel_subscriptions_updated_at ON public.channel_subscriptions;
CREATE TRIGGER update_channel_subscriptions_updated_at
    BEFORE UPDATE ON public.channel_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for channel_subscriptions
ALTER TABLE public.channel_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.channel_subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions" ON public.channel_subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON public.channel_subscriptions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own subscriptions
CREATE POLICY "Users can delete own subscriptions" ON public.channel_subscriptions
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for webhook_events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Users can view webhook events for their subscriptions
CREATE POLICY "Users can view own webhook events" ON public.webhook_events
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.channel_subscriptions
            WHERE channel_subscriptions.id = webhook_events.subscription_id
            AND channel_subscriptions.user_id = auth.uid()
        )
    );

-- RLS Policies for subscription_logs
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

-- Users can view logs for their subscriptions
CREATE POLICY "Users can view own subscription logs" ON public.subscription_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.channel_subscriptions
            WHERE channel_subscriptions.id = subscription_logs.subscription_id
            AND channel_subscriptions.user_id = auth.uid()
        )
    );

-- Function to clean up expired subscriptions
CREATE OR REPLACE FUNCTION cleanup_expired_subscriptions()
RETURNS void AS $$
BEGIN
    UPDATE public.channel_subscriptions
    SET status = 'expired'
    WHERE expires_at < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Function to get active subscriptions needing renewal (within 6 hours of expiry)
CREATE OR REPLACE FUNCTION get_subscriptions_needing_renewal()
RETURNS TABLE (
    id UUID,
    channel_id VARCHAR(255),
    hub_topic TEXT,
    hub_callback_url TEXT,
    hub_secret VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id,
        cs.channel_id,
        cs.hub_topic,
        cs.hub_callback_url,
        cs.hub_secret
    FROM public.channel_subscriptions cs
    WHERE cs.status = 'active'
    AND cs.expires_at < NOW() + INTERVAL '6 hours'
    AND cs.expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE public.channel_subscriptions IS 'Tracks YouTube PubSubHubbub webhook subscriptions for real-time channel updates';
COMMENT ON TABLE public.webhook_events IS 'Stores incoming webhook notifications from YouTube PubSubHubbub';
COMMENT ON TABLE public.subscription_logs IS 'Audit log for subscription actions and debugging';

COMMENT ON COLUMN public.channel_subscriptions.status IS 'Subscription status: pending (awaiting verification), verified (hub verified), active (receiving updates), expired (lease expired), failed (subscription failed)';
COMMENT ON COLUMN public.channel_subscriptions.lease_seconds IS 'Subscription lease duration in seconds (YouTube default: 432000 = 5 days)';
COMMENT ON COLUMN public.webhook_events.event_type IS 'Type of YouTube event: video_published, video_updated, video_deleted';