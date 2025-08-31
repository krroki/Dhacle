'use client';

import { useEffect, useRef, useState } from 'react';
import { YoutubeLensPubSub, type ChannelUpdatePayload } from '@/lib/pubsub/youtube-lens-pubsub';
import { createClient } from '@/lib/supabase/client';

// ApprovalLog 타입 정의
interface ApprovalLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
  created_at: string;
  updated_at: string;
}

/**
 * React Hook for YouTube Lens channel subscription
 * @param channelId - YouTube channel ID to monitor (null for all channels)
 * @returns Object with updates array and subscription status
 */
export function useYoutubeLensSubscription(channelId: string | null) {
  const [updates, setUpdates] = useState<ChannelUpdatePayload[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const pubsub = useRef(new YoutubeLensPubSub());
  
  useEffect(() => {
    let isMounted = true;
    const currentPubsub = pubsub.current;
    
    async function setupSubscription() {
      // Clean up previous subscription
      await currentPubsub.unsubscribe();
      
      if (!channelId) {
        setIsSubscribed(false);
        return;
      }
      
      // Subscribe to specific channel
      if (channelId === '*') {
        // Admin view - all channels
        await currentPubsub.subscribeToAll((payload) => {
          if (isMounted) {
            setUpdates(prev => [...prev, payload]);
          }
        });
      } else {
        // Specific channel
        await currentPubsub.subscribe(channelId, (payload) => {
          if (isMounted) {
            setUpdates(prev => [...prev, payload]);
          }
        });
      }
      
      setIsSubscribed(true);
    }
    
    setupSubscription();
    
    // Cleanup on unmount or channel change
    return () => {
      isMounted = false;
      currentPubsub.unsubscribe();
    };
  }, [channelId]);
  
  return { updates, isSubscribed };
}

/**
 * React Hook for YouTube Lens approval logs subscription
 * @param userId - User ID to monitor (admin only)
 */
export function useApprovalLogsSubscription(userId?: string) {
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const supabase = createClient();
  
  useEffect(() => {
    // Build filter based on userId
    const filter = userId ? `user_id=eq.${userId}` : undefined;
    
    const channel = supabase
      .channel('yl-approval-logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'yl_approval_logs',
          ...(filter && { filter })
        },
        (payload) => {
          console.log('📝 Approval log update:', payload);
          if (payload.new && payload.eventType === 'INSERT') {
            setLogs(prev => [...prev, payload.new as ApprovalLog]);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Approval logs subscription:', status);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);
  
  return logs;
}