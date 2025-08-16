/**
 * YouTube PubSubHubbub Helper Functions
 * Handles real-time webhook subscriptions for YouTube channels
 */

import { createClient } from '@/lib/supabase/client';
import crypto from 'crypto';

// PubSubHubbub Hub URL
const HUB_URL = 'https://pubsubhubbub.appspot.com/';

// Subscription modes
export enum SubscriptionMode {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe'
}

// Subscription status
export enum SubscriptionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

// Event types for webhook notifications
export enum WebhookEventType {
  VIDEO_PUBLISHED = 'video_published',
  VIDEO_UPDATED = 'video_updated',
  VIDEO_DELETED = 'video_deleted'
}

interface SubscriptionParams {
  channelId: string;
  channelTitle?: string;
  userId: string;
  callbackUrl: string;
}

interface WebhookVerification {
  mode: string;
  topic: string;
  challenge: string;
  lease_seconds?: string;
}

interface VideoNotification {
  videoId: string;
  channelId: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  deleted?: boolean;
}

/**
 * PubSubHubbub Manager Class
 */
export class PubSubHubbubManager {
  private supabase = createClient();

  /**
   * Generate a secure secret for HMAC verification
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate the topic URL for a YouTube channel
   */
  private getTopicUrl(channelId: string): string {
    return `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channelId}`;
  }

  /**
   * Subscribe to a YouTube channel's updates
   */
  async subscribe(params: SubscriptionParams): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const { channelId, channelTitle, userId, callbackUrl } = params;
      
      // Generate secret for this subscription
      const hubSecret = this.generateSecret();
      const topicUrl = this.getTopicUrl(channelId);

      // Check if subscription already exists
      const { data: existing, error: checkError } = await this.supabase
        .from('channel_subscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }

      let subscriptionId: string;

      if (existing) {
        // Update existing subscription
        subscriptionId = existing.id;
        await this.supabase
          .from('channel_subscriptions')
          .update({
            hub_callback_url: callbackUrl,
            hub_secret: hubSecret,
            hub_topic: topicUrl,
            status: SubscriptionStatus.PENDING,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscriptionId);
      } else {
        // Create new subscription record
        const { data: newSub, error: insertError } = await this.supabase
          .from('channel_subscriptions')
          .insert({
            channel_id: channelId,
            channel_title: channelTitle,
            hub_callback_url: callbackUrl,
            hub_secret: hubSecret,
            hub_topic: topicUrl,
            status: SubscriptionStatus.PENDING,
            user_id: userId
          })
          .select()
          .single();

        if (insertError) throw insertError;
        subscriptionId = newSub.id;
      }

      // Send subscription request to hub
      const subscribeSuccess = await this.sendHubRequest(
        SubscriptionMode.SUBSCRIBE,
        topicUrl,
        callbackUrl,
        hubSecret
      );

      if (subscribeSuccess) {
        // Log the subscription attempt
        await this.logSubscriptionAction(subscriptionId, 'subscribe', SubscriptionStatus.PENDING);
        return { success: true, subscriptionId };
      } else {
        // Update status to failed
        await this.supabase
          .from('channel_subscriptions')
          .update({ status: SubscriptionStatus.FAILED })
          .eq('id', subscriptionId);

        await this.logSubscriptionAction(subscriptionId, 'subscribe', SubscriptionStatus.FAILED);
        return { success: false, error: 'Failed to subscribe to hub' };
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Unsubscribe from a YouTube channel's updates
   */
  async unsubscribe(channelId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get subscription details
      const { data: subscription, error: fetchError } = await this.supabase
        .from('channel_subscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Send unsubscribe request to hub
      const unsubscribeSuccess = await this.sendHubRequest(
        SubscriptionMode.UNSUBSCRIBE,
        subscription.hub_topic,
        subscription.hub_callback_url,
        subscription.hub_secret
      );

      if (unsubscribeSuccess) {
        // Delete subscription record
        await this.supabase
          .from('channel_subscriptions')
          .delete()
          .eq('id', subscription.id);

        await this.logSubscriptionAction(subscription.id, 'unsubscribe', SubscriptionStatus.EXPIRED);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to unsubscribe from hub' };
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Send subscription/unsubscription request to PubSubHubbub hub
   */
  private async sendHubRequest(
    mode: SubscriptionMode,
    topic: string,
    callback: string,
    secret: string
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        'hub.callback': callback,
        'hub.topic': topic,
        'hub.verify': 'async',
        'hub.mode': mode,
        'hub.secret': secret,
        'hub.lease_seconds': '432000' // 5 days
      });

      const response = await fetch(HUB_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      // Hub returns 202 Accepted for async verification
      return response.status === 202 || response.status === 204;
    } catch (error) {
      console.error('Hub request error:', error);
      return false;
    }
  }

  /**
   * Verify webhook callback from hub
   */
  async verifyCallback(params: WebhookVerification): Promise<{ 
    success: boolean; 
    challenge?: string; 
    error?: string 
  }> {
    try {
      const { mode, topic, challenge, lease_seconds } = params;

      // Extract channel ID from topic URL
      const channelIdMatch = topic.match(/channel_id=([^&]+)/);
      if (!channelIdMatch) {
        return { success: false, error: 'Invalid topic URL' };
      }
      const channelId = channelIdMatch[1];

      // Find subscription
      const { data: subscription, error: fetchError } = await this.supabase
        .from('channel_subscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Update subscription status
      if (mode === 'subscribe') {
        const expiresAt = lease_seconds 
          ? new Date(Date.now() + parseInt(lease_seconds) * 1000).toISOString()
          : new Date(Date.now() + 432000 * 1000).toISOString(); // Default 5 days

        await this.supabase
          .from('channel_subscriptions')
          .update({
            status: SubscriptionStatus.ACTIVE,
            lease_seconds: lease_seconds ? parseInt(lease_seconds) : 432000,
            expires_at: expiresAt,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        await this.logSubscriptionAction(subscription.id, 'verify', SubscriptionStatus.ACTIVE);
      } else if (mode === 'unsubscribe') {
        await this.supabase
          .from('channel_subscriptions')
          .update({
            status: SubscriptionStatus.EXPIRED,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);

        await this.logSubscriptionAction(subscription.id, 'verify', SubscriptionStatus.EXPIRED);
      }

      return { success: true, challenge };
    } catch (error) {
      console.error('Verify callback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Process incoming webhook notification
   */
  async processNotification(
    body: string,
    signature: string | null,
    channelId: string
  ): Promise<{ success: boolean; video?: VideoNotification; error?: string }> {
    try {
      // Get subscription
      const { data: subscription, error: fetchError } = await this.supabase
        .from('channel_subscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Verify HMAC signature if provided
      if (signature && subscription.hub_secret) {
        const expectedSignature = crypto
          .createHmac('sha1', subscription.hub_secret)
          .update(body)
          .digest('hex');

        if (`sha1=${expectedSignature}` !== signature) {
          return { success: false, error: 'Invalid signature' };
        }
      }

      // Parse XML notification (simplified - you may want to use an XML parser)
      const videoData = this.parseVideoNotification(body);

      if (!videoData) {
        return { success: false, error: 'Failed to parse notification' };
      }

      // Store webhook event
      await this.supabase
        .from('webhook_events')
        .insert({
          subscription_id: subscription.id,
          event_type: videoData.deleted 
            ? WebhookEventType.VIDEO_DELETED 
            : WebhookEventType.VIDEO_PUBLISHED,
          video_id: videoData.videoId,
          video_title: videoData.title,
          published_at: videoData.publishedAt,
          raw_data: { xml: body },
          processed: false
        });

      // Update subscription last notification
      await this.supabase
        .from('channel_subscriptions')
        .update({
          last_notification_at: new Date().toISOString(),
          notification_count: subscription.notification_count + 1
        })
        .eq('id', subscription.id);

      return { success: true, video: videoData };
    } catch (error) {
      console.error('Process notification error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Parse video notification from Atom XML
   */
  private parseVideoNotification(xml: string): VideoNotification | null {
    try {
      // Extract video ID
      const videoIdMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const channelIdMatch = xml.match(/<yt:channelId>([^<]+)<\/yt:channelId>/);
      const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
      const publishedMatch = xml.match(/<published>([^<]+)<\/published>/);
      const updatedMatch = xml.match(/<updated>([^<]+)<\/updated>/);

      if (!videoIdMatch || !channelIdMatch) {
        return null;
      }

      // Check if this is a deletion notification
      const isDeleted = xml.includes('<at:deleted-entry>');

      return {
        videoId: videoIdMatch[1],
        channelId: channelIdMatch[1],
        title: titleMatch ? titleMatch[1] : '',
        publishedAt: publishedMatch ? publishedMatch[1] : new Date().toISOString(),
        updatedAt: updatedMatch ? updatedMatch[1] : undefined,
        deleted: isDeleted
      };
    } catch (error) {
      console.error('Parse notification error:', error);
      return null;
    }
  }

  /**
   * Renew expiring subscriptions
   */
  async renewExpiringSubscriptions(): Promise<void> {
    try {
      // Get subscriptions expiring within 6 hours
      const { data: subscriptions, error } = await this.supabase
        .rpc('get_subscriptions_needing_renewal');

      if (error) throw error;

      for (const sub of subscriptions || []) {
        await this.sendHubRequest(
          SubscriptionMode.SUBSCRIBE,
          sub.hub_topic,
          sub.hub_callback_url,
          sub.hub_secret
        );

        await this.logSubscriptionAction(sub.id, 'renew', SubscriptionStatus.PENDING);
      }
    } catch (error) {
      console.error('Renew subscriptions error:', error);
    }
  }

  /**
   * Clean up expired subscriptions
   */
  async cleanupExpiredSubscriptions(): Promise<void> {
    try {
      await this.supabase.rpc('cleanup_expired_subscriptions');
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Log subscription action
   */
  private async logSubscriptionAction(
    subscriptionId: string,
    action: string,
    status: SubscriptionStatus,
    requestData?: unknown,
    responseData?: unknown,
    error?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('subscription_logs')
        .insert({
          subscription_id: subscriptionId,
          action,
          status,
          request_data: requestData,
          response_data: responseData,
          error
        });
    } catch (err) {
      console.error('Log action error:', err);
    }
  }

  /**
   * Get user's active subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<ChannelSubscription[]> {
    try {
      const { data, error } = await this.supabase
        .from('channel_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.VERIFIED])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get subscriptions error:', error);
      return [];
    }
  }

  /**
   * Get recent webhook events for a user
   */
  async getRecentEvents(userId: string, limit: number = 50): Promise<WebhookEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('webhook_events')
        .select(`
          *,
          channel_subscriptions!inner(
            channel_id,
            channel_title,
            user_id
          )
        `)
        .eq('channel_subscriptions.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get events error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const pubsubManager = new PubSubHubbubManager();