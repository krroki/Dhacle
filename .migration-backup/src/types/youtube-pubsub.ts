/**
 * YouTube PubSubHubbub Type Definitions
 */

export interface ChannelSubscription {
  id: string;
  channel_id: string;
  channelTitle?: string;
  hubCallbackUrl: string;
  hubSecret: string;
  hubTopic: string;
  status: SubscriptionStatus;
  leaseSeconds: number;
  expiresAt?: string;
  lastNotificationAt?: string;
  notificationCount: number;
  errorCount: number;
  lastError?: string;
  metadata?: Record<string, unknown>;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export enum SubscriptionStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  FAILED = 'failed',
}

export interface WebhookEvent {
  id: string;
  subscriptionId: string;
  eventType: WebhookEventType;
  video_id?: string;
  video_title?: string;
  published_at?: string;
  rawData?: unknown;
  processed: boolean;
  processedAt?: string;
  error?: string;
  created_at: string;
}

export enum WebhookEventType {
  VIDEO_PUBLISHED = 'video_published',
  VIDEO_UPDATED = 'video_updated',
  VIDEO_DELETED = 'video_deleted',
}

export interface SubscriptionLog {
  id: string;
  subscriptionId: string;
  action: SubscriptionAction;
  status?: string;
  requestData?: unknown;
  responseData?: unknown;
  error?: string;
  created_at: string;
}

export enum SubscriptionAction {
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  VERIFY = 'verify',
  RENEW = 'renew',
  EXPIRE = 'expire',
}

export interface PubSubHubRequest {
  'hub.callback': string;
  'hub.topic': string;
  'hub.verify': 'sync' | 'async';
  'hub.mode': 'subscribe' | 'unsubscribe';
  'hub.secret'?: string;
  'hub.leaseSeconds'?: string;
}

export interface PubSubVerificationParams {
  'hub.mode': string;
  'hub.topic': string;
  'hub.challenge': string;
  'hub.leaseSeconds'?: string;
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
