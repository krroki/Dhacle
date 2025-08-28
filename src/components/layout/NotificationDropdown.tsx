'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, Bell, BookOpen, Check, Loader2, MessageSquare, Trophy, X } from 'lucide-react';
import { useEffect } from 'react';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  ScrollArea,
  Skeleton,
} from '@/components/ui';
import { cn } from '@/lib/utils';
import { 
  useNotifications, 
  useMarkAsRead, 
  useMarkAllAsRead, 
  useDeleteNotification,
  type Notification
} from '@/hooks/queries/useNotifications';
import { useNotificationStore } from '@/store/notifications';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

const notificationIcons = {
  info: AlertCircle,
  success: Check,
  warning: AlertCircle,
  comment: MessageSquare,
  course: BookOpen,
  achievement: Trophy,
};

const notificationColors = {
  info: 'text-blue-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  comment: 'text-purple-500',
  course: 'text-indigo-500',
  achievement: 'text-orange-500',
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDropdown({ isOpen, onOpenChange }: NotificationDropdownProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Don't render notifications dropdown if user is not authenticated
  if (!user) {
    return null;
  }
  
  // React Query hooks for server state
  const { data, isLoading, error } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  
  // Zustand store for client preferences
  const { 
    soundEnabled, 
    playNotificationSound,
    setDropdownOpen,
    desktopNotificationsEnabled,
    requestNotificationPermission 
  } = useNotificationStore();
  
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  
  // Sync dropdown state with Zustand
  useEffect(() => {
    setDropdownOpen(isOpen);
  }, [isOpen, setDropdownOpen]);
  
  // Request desktop notification permission if enabled
  useEffect(() => {
    if (desktopNotificationsEnabled) {
      requestNotificationPermission();
    }
  }, [desktopNotificationsEnabled, requestNotificationPermission]);
  
  // Play sound for new notifications
  useEffect(() => {
    if (unreadCount > 0 && soundEnabled && !isOpen) {
      playNotificationSound();
    }
  }, [unreadCount, soundEnabled, isOpen, playNotificationSound]);

  const handleNotificationClick = (notification: Notification) => {
    // Optimistic update via React Query
    markAsRead.mutate(notification.id);
    
    if (notification.link) {
      router.push(notification.link);
      onOpenChange(false);
    }
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };
  
  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">알림</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5">
                {unreadCount}개
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                '모두 읽음'
              )}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">알림을 불러올 수 없습니다</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                다시 시도
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">새로운 알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type as keyof typeof notificationIcons] || AlertCircle;
                const colorClass = notificationColors[notification.type as keyof typeof notificationColors] || 'text-gray-500';

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-muted/50 transition-colors cursor-pointer group',
                      !notification.read && 'bg-primary/5'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={cn('mt-0.5', colorClass)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className={cn('text-sm', !notification.read && 'font-semibold')}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        disabled={deleteNotification.isPending}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded disabled:opacity-50"
                      >
                        {deleteNotification.isPending ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-center text-sm" 
            onClick={() => {
              router.push('/notifications');
              onOpenChange(false);
            }}
          >
            모든 알림 보기
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
