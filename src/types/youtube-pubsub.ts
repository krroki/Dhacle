/**
 * YouTube PubSubHubbub Type Definitions
 */

export interface ChannelSubscription {
  id: string;
  channel_id: string;
  channel_title?: string;
  hub_callback_url: string;
  hub_secret: string;
  hub_topic: string;
  status: SubscriptionStatus;
  lease_seconds: number;
  expires_at?: string;
  last_notification_at?: string;
  notification_count: number;
  error_count: number;
  last_error?: string;
  metadata?: Record<string, any>;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export enum SubscriptionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FAILED = 'failed'
}

export interface WebhookEvent {
  id: string;
  subscription_id: string;
  event_type: WebhookEventType;
  video_id?: string;
  video_title?: string;
  published_at?: string;
  raw_data?: any;
  processed: boolean;
  processed_at?: string;
  error?: string;
  created_at: string;
}

export enum WebhookEventType {
  VIDEO_PUBLISHED = 'video_published',
  VIDEO_UPDATED = 'video_updated',
  VIDEO_DELETED = 'video_deleted'
}

export interface SubscriptionLog {
  id: string;
  subscription_id: string;
  action: SubscriptionAction;
  status?: string;
  request_data?: any;
  response_data?: any;
  error?: string;
  created_at: string;
}

export enum SubscriptionAction {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  VERIFY = 'verify',
  RENEW = 'renew',
  EXPIRE = 'expire'
}

export interface PubSubHubRequest {
  'hub.callback': string;
  'hub.topic': string;
  'hub.verify': 'sync' | 'async';
  'hub.mode': 'subscribe' | 'unsubscribe';
  'hub.secret'?: string;
  'hub.lease_seconds'?: string;
}

export interface PubSubVerificationParams {
  'hub.mode': string;
  'hub.topic': string;
  'hub.challenge': string;
  'hub.lease_seconds'?: string;
}

export interface VideoNotification {
  videoId: string;
  channelId: string;
  title: string;
  description?: string;
  publishedAt: string;
  updatedAt?: string;
  deleted?: boolean;
  thumbnail?: string;
  link?: string;
}