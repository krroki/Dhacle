import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import { useAuth } from '@/lib/auth/AuthContext';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'comment' | 'course' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  userId?: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// Query key factory
export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

// Fetch all notifications (only when authenticated)
export function useNotifications() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const data = await apiGet<NotificationsResponse>('/api/notifications');
      return data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    refetchIntervalInBackground: true,
    enabled: !!user, // Only run when user is authenticated
  });
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiPost(`/api/notifications/${id}/read`);
    },
    
    // Optimistic update
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<NotificationsResponse>(
        notificationKeys.list()
      );
      
      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<NotificationsResponse>(notificationKeys.list(), {
          ...previousData,
          notifications: previousData.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: previousData.unreadCount - 1,
        });
      }
      
      return { previousData };
    },
    
    // If the mutation fails, rollback
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

// Mark all notifications as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return apiPost('/api/notifications/read-all');
    },
    
    // Optimistic update
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      
      const previousData = queryClient.getQueryData<NotificationsResponse>(
        notificationKeys.list()
      );
      
      if (previousData) {
        queryClient.setQueryData<NotificationsResponse>(notificationKeys.list(), {
          ...previousData,
          notifications: previousData.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        });
      }
      
      return { previousData };
    },
    
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

// Delete notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      return apiDelete(`/api/notifications/${id}`);
    },
    
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      
      const previousData = queryClient.getQueryData<NotificationsResponse>(
        notificationKeys.list()
      );
      
      if (previousData) {
        const notificationToDelete = previousData.notifications.find(n => n.id === id);
        queryClient.setQueryData<NotificationsResponse>(notificationKeys.list(), {
          ...previousData,
          notifications: previousData.notifications.filter(n => n.id !== id),
          unreadCount: notificationToDelete && !notificationToDelete.read 
            ? previousData.unreadCount - 1 
            : previousData.unreadCount,
        });
      }
      
      return { previousData };
    },
    
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.list(), context.previousData);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
}

// Prefetch notifications (for server components)
export async function prefetchNotifications() {
  const { QueryClient } = await import('@tanstack/react-query');
  const queryClient = new QueryClient();
  
  await queryClient.prefetchQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const data = await apiGet<NotificationsResponse>('/api/notifications');
      return data;
    },
  });
  
  return queryClient;
}