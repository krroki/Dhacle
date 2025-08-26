/**
 * YouTube PubSubHubbub Helper Functions
 * Handles real-time webhook subscriptions for YouTube channels
 */

import crypto from 'node:crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types';

// PubSubHubbub Hub URL
const HUB_URL = 'https://pubsubhubbub.appspot.com/';

// Subscription modes
export enum SubscriptionMode {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
}

// Subscription status
export enum SubscriptionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

// Event types for webhook notifications
export enum WebhookEventType {
  VIDEO_PUBLISHED = 'video_published',
  VIDEO_UPDATED = 'video_updated',
  VIDEO_DELETED = 'video_deleted',
}

interface SubscriptionParams {
  channel_id: string;
  channelTitle?: string;
  user_id: string;
  callbackUrl: string;
}

interface WebhookVerification {
  mode: string;
  topic: string;
  challenge: string;
  leaseSeconds?: string;
}

interface VideoNotification {
  video_id: string;
  channel_id: string;
  title: string;
  published_at: string;
  updated_at?: string;
  deleted?: boolean;
}

/**
 * PubSubHubbub Manager Class
 */
export class PubSubHubbubManager {
  /**
   * Generate a secure secret for HMAC verification
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate the topic URL for a YouTube channel
   */
  private getTopicUrl(channel_id: string): string {
    return `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${channel_id}`;
  }

  /**
   * Subscribe to a YouTube channel's updates
   */
  async subscribe(
    params: SubscriptionParams
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const { channel_id, channelTitle, user_id, callbackUrl } = params;

      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Generate secret for this subscription
      const hub_secret = this.generateSecret();
      const topic_url = this.getTopicUrl(channel_id);

      // Check if subscription already exists (channelSubscriptions table)
      const { data: existing, error: checkError } = await supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('channel_id', channel_id)
        .eq('user_id', user_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw checkError;
      }

      let subscription_id: string;

      if (existing) {
        // Update existing subscription (channelSubscriptions table)
        subscription_id = existing.id;
        const { error: updateError } = await supabase
          .from('channelSubscriptions')
          .update({
            hub_callback_url: callbackUrl,
            hub_secret: hub_secret,
            hub_topic: topic_url,
            status: SubscriptionStatus.PENDING,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription_id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new subscription record (channelSubscriptions table)
        const { data: newSub, error: insertError } = await supabase
          .from('channelSubscriptions')
          .insert({
            channel_id: channel_id,
            channel_title: channelTitle,
            hub_callback_url: callbackUrl,
            hub_secret: hub_secret,
            hub_topic: topic_url,
            status: SubscriptionStatus.PENDING,
            user_id: user_id,
          })
          .select()
          .single();
        
        if (insertError) {
          throw insertError;
        }
        subscription_id = newSub.id;
      }

      // Send subscription request to hub
      const subscribe_success = await this.sendHubRequest(
        SubscriptionMode.SUBSCRIBE,
        topic_url,
        callbackUrl,
        hub_secret
      );

      if (subscribe_success) {
        // Log the subscription attempt
        await this.logSubscriptionAction(supabase, subscription_id, 'subscribe', SubscriptionStatus.PENDING, channel_id, user_id);
        return { success: true, subscriptionId: subscription_id };
      }
      // Update status to failed (channelSubscriptions table)
      await supabase
        .from('channelSubscriptions')
        .update({ status: SubscriptionStatus.FAILED })
        .eq('id', subscription_id);

      await this.logSubscriptionAction(supabase, subscription_id, 'subscribe', SubscriptionStatus.FAILED, channel_id, user_id);
      return { success: false, error: 'Failed to subscribe to hub' };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Unsubscribe from a YouTube channel's updates
   */
  async unsubscribe(channel_id: string, user_id: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get subscription details (channelSubscriptions table)
      const { data: subscription, error: fetchError } = await supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('channel_id', channel_id)
        .eq('user_id', user_id)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Send unsubscribe request to hub
      const unsubscribe_success = await this.sendHubRequest(
        SubscriptionMode.UNSUBSCRIBE,
        subscription.hub_topic,
        subscription.hub_callback_url,
        subscription.hub_secret
      );

      if (unsubscribe_success) {
        // Delete subscription record (channelSubscriptions table)
        await supabase.from('channelSubscriptions').delete().eq('id', subscription.id);

        await this.logSubscriptionAction(
          supabase,
          subscription.id,
          'unsubscribe',
          SubscriptionStatus.EXPIRED,
          subscription.channel_id,
          subscription.user_id
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to unsubscribe from hub' };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
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
        'hub.leaseSeconds': '432000', // 5 days
      });

      const response = await fetch(HUB_URL, { // External API: Google PubSubHubbub
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      // Hub returns 202 Accepted for async verification
      return response.status === 202 || response.status === 204;
    } catch (error: unknown) {
      console.error('PubSub operation error:', error);
      return false;
    }
  }

  /**
   * Verify webhook callback from hub
   */
  async verifyCallback(params: WebhookVerification): Promise<{
    success: boolean;
    challenge?: string;
    error?: string;
  }> {
    try {
      const { mode, topic, challenge, leaseSeconds } = params;

      // Extract channel ID from topic URL
      const channel_id_match = topic.match(/channel_id=([^&]+)/);
      if (!channel_id_match) {
        return { success: false, error: 'Invalid topic URL' };
      }
      const channel_id = channel_id_match[1];

      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Find subscription (channelSubscriptions table)
      const { data: subscription, error: fetchError } = await supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('channel_id', channel_id)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Update subscription status
      if (mode === 'subscribe') {
        const lease_seconds = leaseSeconds ? Number.parseInt(leaseSeconds, 10) : 432000;
        const expires_at = new Date(Date.now() + lease_seconds * 1000).toISOString();
        
        // Update subscription status to active (channelSubscriptions table)
        await supabase
          .from('channelSubscriptions')
          .update({
            status: SubscriptionStatus.ACTIVE,
            lease_seconds: lease_seconds,
            expires_at: expires_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        await this.logSubscriptionAction(supabase, subscription.id, 'verify', SubscriptionStatus.ACTIVE, subscription.channel_id, subscription.user_id);
      } else if (mode === 'unsubscribe') {
        // Update subscription status to expired (channelSubscriptions table)
        await supabase
          .from('channelSubscriptions')
          .update({
            status: SubscriptionStatus.EXPIRED,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        await this.logSubscriptionAction(supabase, subscription.id, 'verify', SubscriptionStatus.EXPIRED, subscription.channel_id, subscription.user_id);
      }

      return { success: true, challenge };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Process incoming webhook notification
   */
  async processNotification(
    body: string,
    signature: string | null,
    channel_id: string
  ): Promise<{ success: boolean; video?: VideoNotification; error?: string }> {
    try {
      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get subscription (channelSubscriptions table)
      const { data: subscription, error: fetchError } = await supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('channel_id', channel_id)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Verify HMAC signature if provided
      if (signature && subscription.hub_secret) {
        const expected_signature = crypto
          .createHmac('sha1', subscription.hub_secret)
          .update(body)
          .digest('hex');

        if (`sha1=${expected_signature}` !== signature) {
          return { success: false, error: 'Invalid signature' };
        }
      }

      // Parse XML notification (simplified - you may want to use an XML parser)
      const video_data = this.parseVideoNotification(body);

      if (!video_data) {
        return { success: false, error: 'Failed to parse notification' };
      }

      // Store webhook event (webhookEvents table)
      await supabase.from('webhookEvents').insert({
        subscription_id: subscription.id,
        event_type: video_data.deleted
          ? WebhookEventType.VIDEO_DELETED
          : WebhookEventType.VIDEO_PUBLISHED,
        video_id: video_data.video_id,
        video_title: video_data.title,
        published_at: video_data.published_at,
        raw_data: { xml: body },
        processed: false,
      });

      // Update subscription last notification (channelSubscriptions table)
      await supabase
        .from('channelSubscriptions')
        .update({
          last_notification_at: new Date().toISOString(),
          notification_count: (subscription.notification_count || 0) + 1,
        })
        .eq('id', subscription.id);

      return { success: true, video: video_data };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Parse video notification from Atom XML
   */
  private parseVideoNotification(xml: string): VideoNotification | null {
    try {
      // Extract video ID
      const video_id_match = xml.match(/<yt:video_id>([^<]+)<\/yt:video_id>/);
      const channel_id_match = xml.match(/<yt:channel_id>([^<]+)<\/yt:channel_id>/);
      const title_match = xml.match(/<title>([^<]+)<\/title>/);
      const published_match = xml.match(/<published>([^<]+)<\/published>/);
      const updated_match = xml.match(/<updated>([^<]+)<\/updated>/);

      if (!video_id_match || !channel_id_match) {
        return null;
      }

      // Check if this is a deletion notification
      const is_deleted = xml.includes('<at:deleted-entry>');

      return {
        video_id: video_id_match[1] ?? '',
        channel_id: channel_id_match[1] ?? '',
        title: title_match?.[1] ?? '',
        published_at: published_match?.[1] ?? new Date().toISOString(),
        updated_at: updated_match?.[1] ?? undefined,
        deleted: is_deleted,
      };
    } catch (_error: unknown) {
      return null;
    }
  }

  /**
   * Renew expiring subscriptions
   */
  async renewExpiringSubscriptions(): Promise<void> {
    try {
      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get subscriptions expiring within 6 hours
      const expirationThreshold = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
      const { data: subscriptions, error } = await supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('status', SubscriptionStatus.ACTIVE)
        .lte('expires_at', expirationThreshold);

      if (error) {
        throw error;
      }

      for (const sub of subscriptions || []) {
        await this.sendHubRequest(
          SubscriptionMode.SUBSCRIBE,
          sub.hub_topic,
          sub.hub_callback_url,
          sub.hub_secret
        );

        await this.logSubscriptionAction(supabase, sub.id, 'renew', SubscriptionStatus.PENDING, sub.channel_id, sub.user_id);
      }
    } catch (error: unknown) {
      console.error('Failed to renew subscriptions:', error);
      // Continue processing other subscriptions
    }
  }

  /**
   * Clean up expired subscriptions
   */
  async cleanupExpiredSubscriptions(): Promise<void> {
    try {
      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Clean up expired subscriptions
      const now = new Date().toISOString();
      await supabase
        .from('channelSubscriptions')
        .update({ status: SubscriptionStatus.EXPIRED })
        .lt('expires_at', now)
        .eq('status', SubscriptionStatus.ACTIVE);
    } catch (error: unknown) {
      console.error('Failed to cleanup expired subscriptions:', error);
    }
  }

  /**
   * Log subscription action
   */
  private async logSubscriptionAction(
    supabase: SupabaseClient<Database>,
    subscriptionId: string,
    action: string,
    status: SubscriptionStatus,
    channelId?: string,
    userId?: string
  ): Promise<void> {
    try {
      // We need channel_id and user_id for the logs table
      // If not provided, try to fetch from the subscription
      let channel_id = channelId;
      let user_id = userId;
      
      if (!channel_id || !user_id) {
        const { data: subscription } = await supabase
          .from('channel_subscriptions')
          .select('channel_id, user_id')
          .eq('id', subscriptionId)
          .single();
          
        interface SubscriptionData {
          channel_id: string;
          user_id: string;
        }
        
        if (subscription) {
          const subData = subscription as unknown as SubscriptionData;
          channel_id = subData.channel_id;
          user_id = subData.user_id;
        }
      }
      
      // Only log if we have both required fields
      if (channel_id && user_id) {
        await supabase.from('subscription_logs').insert({
          channel_id,
          user_id,
          action: `${action} (${status})`,
          created_at: new Date().toISOString(),
        });
      }
    } catch (error: unknown) {
      // Non-critical logging failure - don't throw
      console.warn('Failed to log subscription action:', error);
    }
  }

  /**
   * Get user's active subscriptions
   */
  async getUserSubscriptions(user_id: string): Promise<unknown[]> {
    try {
      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get user's active subscriptions (channelSubscriptions table)
      const { data, error } = await supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('user_id', user_id)
        .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.VERIFIED])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error: unknown) {
      console.error('Failed to retrieve data:', error);
      return [];
    }
  }

  /**
   * Get recent webhook events for a user
   */
  async getRecentEvents(user_id: string, limit: number = 20): Promise<unknown[]> {
    try {
      // Create Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const { env } = await import('@/env');
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Get recent webhook events for a user (webhookEvents table)
      const { data, error } = await supabase
        .from('webhookEvents')
        .select(`
          *,
          channelSubscriptions!inner(
            channel_id,
            channel_title,
            user_id
          )
        `)
        .eq('channelSubscriptions.user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error: unknown) {
      console.error('Failed to retrieve data:', error);
      return [];
    }
  }
}

// Export singleton instance
export const pubsubManager = new PubSubHubbubManager();
