import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
// Notification 타입 정의
interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * 알림 목록 쿼리 훅
 */
export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => apiGet('/api/notifications'),
    staleTime: 30 * 1000, // 30초
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
}

/**
 * 읽지 않은 알림 개수 쿼리 훅
 */
export function useUnreadNotificationsCount() {
  return useQuery<{ count: number }>({
    queryKey: queryKeys.notifications.unread(),
    queryFn: () => apiGet('/api/notifications/unread'),
    staleTime: 30 * 1000, // 30초
    refetchInterval: 30 * 1000, // 30초마다 자동 갱신
  });
}

/**
 * 알림 읽음 처리 뮤테이션 훅
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => 
      apiPut(`/api/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      // 알림 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.list() 
      });
      // 읽지 않은 개수 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.unread() 
      });
    },
    // 낙관적 업데이트
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.notifications.list() 
      });
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(
        queryKeys.notifications.list()
      );
      
      if (previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.list(),
          previousNotifications.map(notif => 
            notif.id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
      }
      
      // 읽지 않은 개수도 낙관적 업데이트
      const previousCount = queryClient.getQueryData<{ count: number }>(
        queryKeys.notifications.unread()
      );
      
      if (previousCount) {
        queryClient.setQueryData(
          queryKeys.notifications.unread(),
          { count: Math.max(0, previousCount.count - 1) }
        );
      }
      
      return { previousNotifications, previousCount };
    },
    onError: (_err, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.list(),
          context.previousNotifications
        );
      }
      if (context?.previousCount) {
        queryClient.setQueryData(
          queryKeys.notifications.unread(),
          context.previousCount
        );
      }
    },
  });
}

/**
 * 모든 알림 읽음 처리 뮤테이션 훅
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => apiPut('/api/notifications/read-all', {}),
    onSuccess: () => {
      // 알림 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.list() 
      });
      // 읽지 않은 개수를 0으로 설정
      queryClient.setQueryData(
        queryKeys.notifications.unread(),
        { count: 0 }
      );
    },
  });
}

/**
 * 알림 설정 쿼리 훅
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: queryKeys.notifications.preferences(),
    queryFn: () => apiGet('/api/notifications/preferences'),
    staleTime: 10 * 60 * 1000, // 10분
  });
}

/**
 * 알림 설정 업데이트 뮤테이션 훅
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
      types?: {
        comments?: boolean;
        likes?: boolean;
        follows?: boolean;
        mentions?: boolean;
        updates?: boolean;
      };
    }) => apiPut('/api/notifications/preferences', preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.preferences() 
      });
    },
  });
}

/**
 * 알림 삭제 뮤테이션 훅
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => 
      apiPost(`/api/notifications/${notificationId}/delete`, {}),
    onSuccess: () => {
      // 알림 목록 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.list() 
      });
      // 읽지 않은 개수 무효화
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.unread() 
      });
    },
  });
}

/**
 * 실시간 알림 구독 훅 (SSE 또는 WebSocket 용)
 * 실제 구현 시 WebSocket 또는 Server-Sent Events 연결 필요
 */
export function useNotificationSubscription(
  _onNewNotification?: (notification: Notification) => void
) {
  // const queryClient = useQueryClient();
  
  // 실제로는 WebSocket 또는 SSE 연결 구현
  // 예시로 주석 처리
  /*
  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/subscribe');
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      
      // 콜백 실행
      onNewNotification?.(notification);
      
      // 캐시 업데이트
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.list() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.notifications.unread() 
      });
    };
    
    return () => {
      eventSource.close();
    };
  }, [onNewNotification, queryClient]);
  */
}