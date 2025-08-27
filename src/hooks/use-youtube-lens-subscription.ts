'use client';

import { useEffect, useRef, useState } from 'react';
import { YoutubeLensPubSub, type ChannelUpdatePayload } from '@/lib/pubsub/youtube-lens-pubsub';
import { createClient } from '@/lib/supabase/client';

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
    
    async function setupSubscription() {
      // Clean up previous subscription
      await pubsub.current.unsubscribe();
      
      if (!channelId) {
        setIsSubscribed(false);
        return;
      }
      
      // Subscribe to specific channel
      if (channelId === '*') {
        // Admin view - all channels
        await pubsub.current.subscribeToAll((payload) => {
          if (isMounted) {
            setUpdates(prev => [...prev, payload]);
          }
        });
      } else {
        // Specific channel
        await pubsub.current.subscribe(channelId, (payload) => {
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
      pubsub.current.unsubscribe();
    };
  }, [channelId]);
  
  return { updates, isSubscribed };
}

/**
 * React Hook for YouTube Lens approval logs subscription
 * @param userId - User ID to monitor (admin only)
 */
export function useApprovalLogsSubscription(userId?: string) {
  const [logs, setLogs] = useState<any[]>([]);
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
          setLogs(prev => [...prev, payload]);
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