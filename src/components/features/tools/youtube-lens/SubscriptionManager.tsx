'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, RefreshCw, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Subscription {
  id: string;
  channel_id: string;
  channel_title: string;
  status: 'pending' | 'verified' | 'active' | 'expired' | 'failed';
  expires_at: string | null;
  last_notification_at: string | null;
  notification_count: number;
  created_at: string;
}

export function SubscriptionManager() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [channelInput, setChannelInput] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  // Fetch subscriptions on mount
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/subscribe', {
        credentials: 'same-origin'
      });
      const data = await response.json();
      
      if (data.success) {
        setSubscriptions(data.subscriptions);
      } else {
        toast.error('Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Error loading subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!channelInput.trim()) {
      toast.error('Please enter a channel ID or URL');
      return;
    }

    try {
      setSubscribing(true);
      
      // Extract channel ID from URL if needed
      let channelId = channelInput.trim();
      if (channelInput.includes('youtube.com')) {
        const match = channelInput.match(/channel\/([^\/\?]+)/);
        if (match) {
          channelId = match[1];
        }
      }

      const response = await fetch('/api/youtube/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          channelId,
          channelTitle: `Channel ${channelId}` // Will be updated after verification
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Subscription request sent! Awaiting verification...');
        setChannelInput('');
        fetchSubscriptions(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Error subscribing to channel');
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async (channelId: string) => {
    try {
      const response = await fetch(`/api/youtube/subscribe?channelId=${channelId}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Unsubscribed successfully');
        fetchSubscriptions(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      toast.error('Error unsubscribing');
    }
  };

  const handleRenew = async (channelId: string) => {
    try {
      const response = await fetch('/api/youtube/subscribe', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ channelId }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Renewal request sent');
        fetchSubscriptions(); // Refresh list
      } else {
        toast.error(data.error || 'Failed to renew');
      }
    } catch (error) {
      console.error('Renew error:', error);
      toast.error('Error renewing subscription');
    }
  };

  const getStatusBadge = (subscription: Subscription) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock },
      verified: { variant: 'default' as const, icon: CheckCircle },
      active: { variant: 'default' as const, icon: CheckCircle },
      expired: { variant: 'destructive' as const, icon: AlertCircle },
      failed: { variant: 'destructive' as const, icon: AlertCircle },
    };

    const config = statusConfig[subscription.status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {subscription.status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Real-time Channel Subscriptions
        </CardTitle>
        <CardDescription>
          Subscribe to YouTube channels for real-time updates via PubSubHubbub
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscribe Form */}
        <div className="flex gap-2">
          <Input
            placeholder="Enter YouTube channel ID or URL"
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            disabled={subscribing}
            className="flex-1"
          />
          <Button onClick={handleSubscribe} disabled={subscribing}>
            {subscribing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Subscribe
              </>
            )}
          </Button>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active subscriptions. Subscribe to channels above to receive real-time updates.
            </div>
          ) : (
            subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sub.channel_title}</span>
                    {getStatusBadge(sub)}
                  </div>
                  <div className="text-sm text-muted-foreground space-x-4">
                    <span>ID: {sub.channel_id.slice(0, 12)}...</span>
                    {sub.notification_count > 0 && (
                      <span>{sub.notification_count} notifications</span>
                    )}
                    {sub.last_notification_at && (
                      <span>
                        Last: {formatDistanceToNow(new Date(sub.last_notification_at), { addSuffix: true })}
                      </span>
                    )}
                    {sub.expires_at && (
                      <span>
                        Expires: {formatDistanceToNow(new Date(sub.expires_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sub.status === 'active' && sub.expires_at && 
                   new Date(sub.expires_at) < new Date(Date.now() + 6 * 60 * 60 * 1000) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRenew(sub.channel_id)}
                      title="Renew subscription"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleUnsubscribe(sub.channel_id)}
                    title="Unsubscribe"
                  >
                    <BellOff className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <p className="font-medium mb-1">ℹ️ About Real-time Updates</p>
          <p className="text-muted-foreground">
            PubSubHubbub provides instant notifications when channels upload new videos. 
            Subscriptions auto-renew every 5 days. For local development, use ngrok to expose your webhook endpoint.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}