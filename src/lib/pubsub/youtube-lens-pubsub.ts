/**
 * YouTube Lens PubSub System
 * Real-time updates for channel data using Supabase Realtime
 */

import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export type ChannelUpdatePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: {
    channel_id: string;
    date: string;
    subscriber_delta: number;
    view_delta: number;
    video_delta: number;
    created_at: string;
  } | null;
  old: {
    channel_id: string;
    date: string;
  } | null;
};

export class YoutubeLensPubSub {
  private channel: RealtimeChannel | null = null;
  private supabase = createClient();
  
  /**
   * Subscribe to channel updates
   * @param channelId - YouTube channel ID to monitor
   * @param onUpdate - Callback function when updates are received
   */
  async subscribe(
    channelId: string, 
    onUpdate: (payload: ChannelUpdatePayload) => void
  ): Promise<RealtimeChannel> {
    // Clean up existing subscription
    if (this.channel) {
      await this.unsubscribe();
    }
    
    // Create new channel subscription
    this.channel = this.supabase.channel(`yl-channel-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'yl_channel_daily_delta',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          console.log('📊 Channel update received:', payload);
          onUpdate({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as ChannelUpdatePayload['new'],
            old: payload.old as ChannelUpdatePayload['old']
          });
        }
      )
      .subscribe((status) => {
        console.log('🔌 Subscription status:', status);
      });
      
    return this.channel;
  }
  
  /**
   * Subscribe to all channel updates (admin view)
   * @param onUpdate - Callback function when any channel is updated
   */
  async subscribeToAll(
    onUpdate: (payload: ChannelUpdatePayload) => void
  ): Promise<RealtimeChannel> {
    // Clean up existing subscription
    if (this.channel) {
      await this.unsubscribe();
    }
    
    // Subscribe to all channel updates
    this.channel = this.supabase.channel('yl-all-channels')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'yl_channel_daily_delta'
        },
        (payload) => {
          console.log('📊 Global channel update:', payload);
          onUpdate({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new as ChannelUpdatePayload['new'],
            old: payload.old as ChannelUpdatePayload['old']
          });
        }
      )
      .subscribe((status) => {
        console.log('🔌 Global subscription status:', status);
      });
      
    return this.channel;
  }
  
  /**
   * Unsubscribe from current channel
   */
  async unsubscribe() {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
      this.channel = null;
      console.log('🔌 Unsubscribed from channel');
    }
  }
}

// React hooks moved to separate client component file
// See: @/hooks/use-youtube-lens-subscription.ts

/**
 * Server-side PubSub helper
 * @param channelId - YouTube channel ID
 */
export async function startChannelSubscription(channelId: string) {
  console.log(`📡 Starting PubSub subscription for channel: ${channelId}`);
  
  // Actual subscription happens on client side
  // Server just updates channel state
  return {
    success: true,
    message: `PubSub subscription initiated for channel ${channelId}`
  };
}