/**
 * YouTube PubSubHubbub Helper Functions
 * Handles real-time webhook subscriptions for YouTube channels
 */

import crypto from 'node:crypto';
import { createClient } from '@/lib/supabase/client';

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
  channelId: string;
  channelTitle?: string;
  userId: string;
  callbackUrl: string;
}

interface WebhookVerification {
  mode: string;
  topic: string;
  challenge: string;
  leaseSeconds?: string;
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
  async subscribe(
    params: SubscriptionParams
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const { channelId, channelTitle, userId, callbackUrl } = params;

      // Generate secret for this subscription
      const hubSecret = this.generateSecret();
      const topicUrl = this.getTopicUrl(channelId);

      // Check if subscription already exists
      const { data: existing, error: checkError } = await this.supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw checkError;
      }

      let subscriptionId: string;

      if (existing) {
        // Update existing subscription
        subscriptionId = existing.id;
        await this.supabase
          .from('channelSubscriptions')
          .update({
            hubCallbackUrl: callbackUrl,
            hubSecret: hubSecret,
            hubTopic: topicUrl,
            status: SubscriptionStatus.PENDING,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId);
      } else {
        // Create new subscription record
        const { data: newSub, error: insertError } = await this.supabase
          .from('channelSubscriptions')
          .insert({
            channel_id: channelId,
            channelTitle: channelTitle,
            hubCallbackUrl: callbackUrl,
            hubSecret: hubSecret,
            hubTopic: topicUrl,
            status: SubscriptionStatus.PENDING,
            user_id: userId,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
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
      }
      // Update status to failed
      await this.supabase
        .from('channelSubscriptions')
        .update({ status: SubscriptionStatus.FAILED })
        .eq('id', subscriptionId);

      await this.logSubscriptionAction(subscriptionId, 'subscribe', SubscriptionStatus.FAILED);
      return { success: false, error: 'Failed to subscribe to hub' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Unsubscribe from a YouTube channel's updates
   */
  async unsubscribe(
    channelId: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get subscription details
      const { data: subscription, error: fetchError } = await this.supabase
        .from('channelSubscriptions')
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
        subscription.hubTopic,
        subscription.hubCallbackUrl,
        subscription.hubSecret
      );

      if (unsubscribeSuccess) {
        // Delete subscription record
        await this.supabase.from('channelSubscriptions').delete().eq('id', subscription.id);

        await this.logSubscriptionAction(
          subscription.id,
          'unsubscribe',
          SubscriptionStatus.EXPIRED
        );
        return { success: true };
      }
      return { success: false, error: 'Failed to unsubscribe from hub' };
    } catch (error) {
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

      const response = await fetch(HUB_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      // Hub returns 202 Accepted for async verification
      return response.status === 202 || response.status === 204;
    } catch (_error) {
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
      const channelIdMatch = topic.match(/channel_id=([^&]+)/);
      if (!channelIdMatch) {
        return { success: false, error: 'Invalid topic URL' };
      }
      const channelId = channelIdMatch[1];

      // Find subscription
      const { data: subscription, error: fetchError } = await this.supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Update subscription status
      if (mode === 'subscribe') {
        const expiresAt = leaseSeconds
          ? new Date(Date.now() + Number.parseInt(leaseSeconds, 10) * 1000).toISOString()
          : new Date(Date.now() + 432000 * 1000).toISOString(); // Default 5 days

        await this.supabase
          .from('channelSubscriptions')
          .update({
            status: SubscriptionStatus.ACTIVE,
            leaseSeconds: leaseSeconds ? Number.parseInt(leaseSeconds, 10) : 432000,
            expiresAt: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        await this.logSubscriptionAction(subscription.id, 'verify', SubscriptionStatus.ACTIVE);
      } else if (mode === 'unsubscribe') {
        await this.supabase
          .from('channelSubscriptions')
          .update({
            status: SubscriptionStatus.EXPIRED,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        await this.logSubscriptionAction(subscription.id, 'verify', SubscriptionStatus.EXPIRED);
      }

      return { success: true, challenge };
    } catch (error) {
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
    channelId: string
  ): Promise<{ success: boolean; video?: VideoNotification; error?: string }> {
    try {
      // Get subscription
      const { data: subscription, error: fetchError } = await this.supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('channel_id', channelId)
        .single();

      if (fetchError) {
        return { success: false, error: 'Subscription not found' };
      }

      // Verify HMAC signature if provided
      if (signature && subscription.hubSecret) {
        const expectedSignature = crypto
          .createHmac('sha1', subscription.hubSecret)
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
      await this.supabase.from('webhookEvents').insert({
        subscriptionId: subscription.id,
        eventType: videoData.deleted
          ? WebhookEventType.VIDEO_DELETED
          : WebhookEventType.VIDEO_PUBLISHED,
        video_id: videoData.videoId,
        video_title: videoData.title,
        published_at: videoData.publishedAt,
        rawData: { xml: body },
        processed: false,
      });

      // Update subscription last notification
      await this.supabase
        .from('channelSubscriptions')
        .update({
          lastNotificationAt: new Date().toISOString(),
          notificationCount: subscription.notificationCount + 1,
        })
        .eq('id', subscription.id);

      return { success: true, video: videoData };
    } catch (error) {
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
        deleted: isDeleted,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Renew expiring subscriptions
   */
  async renewExpiringSubscriptions(): Promise<void> {
    try {
      // Get subscriptions expiring within 6 hours
      const { data: subscriptions, error } = await this.supabase.rpc(
        'getSubscriptionsNeedingRenewal'
      );

      if (error) {
        throw error;
      }

      for (const sub of subscriptions || []) {
        await this.sendHubRequest(
          SubscriptionMode.SUBSCRIBE,
          sub.hubTopic,
          sub.hubCallbackUrl,
          sub.hubSecret
        );

        await this.logSubscriptionAction(sub.id, 'renew', SubscriptionStatus.PENDING);
      }
    } catch (_error) {}
  }

  /**
   * Clean up expired subscriptions
   */
  async cleanupExpiredSubscriptions(): Promise<void> {
    try {
      await this.supabase.rpc('cleanupExpiredSubscriptions');
    } catch (_error) {}
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
      await this.supabase.from('subscriptionLogs').insert({
        subscriptionId: subscriptionId,
        action,
        status,
        requestData: requestData,
        responseData: responseData,
        error,
      });
    } catch (_error) {}
  }

  /**
   * Get user's active subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<unknown[]> {
    try {
      const { data, error } = await this.supabase
        .from('channelSubscriptions')
        .select('*')
        .eq('user_id', userId)
        .in('status', [SubscriptionStatus.ACTIVE, SubscriptionStatus.VERIFIED])
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (_error) {
      return [];
    }
  }

  /**
   * Get recent webhook events for a user
   */
  async getRecentEvents(userId: string, limit = 50): Promise<unknown[]> {
    try {
      const { data, error } = await this.supabase
        .from('webhookEvents')
        .select(`
          *,
          channelSubscriptions!inner(
            channel_id,
            channelTitle,
            user_id
          )
        `)
        .eq('channelSubscriptions.user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }
      return data || [];
    } catch (_error) {
      return [];
    }
  }
}

// Export singleton instance
export const pubsubManager = new PubSubHubbubManager();
