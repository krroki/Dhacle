'use client';

import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, Bell, BookOpen, Check, MessageSquare, Trophy, X } from 'lucide-react';
import { useState } from 'react';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  ScrollArea,
} from '@/components/ui';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'comment' | 'course' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
  link?: string;
}

const notification_icons = {
  info: AlertCircle,
  success: Check,
  warning: AlertCircle,
  comment: MessageSquare,
  course: BookOpen,
  achievement: Trophy,
};

const notification_colors = {
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
  // TODO: 실제 알림 시스템 구현 필요
  // - Supabase 알림 테이블 생성
  // - 실시간 알림 구독 (Supabase Realtime)
  // - 알림 읽음 상태 업데이트 API
  // - 푸시 알림 지원 (Service Worker)
  const [notifications, set_notifications] = useState<Notification[]>([
    // 임시 더미 데이터 - 실제 구현 시 Supabase에서 가져올 예정
    {
      id: '1',
      type: 'course',
      title: '새로운 강의가 출시되었습니다',
      message: 'YouTube Shorts 고급 편집 테크닉 강의가 추가되었습니다.',
      read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
      link: '/courses/advanced-editing',
    },
    {
      id: '2',
      type: 'comment',
      title: '댓글이 달렸습니다',
      message: '작성하신 게시글에 새로운 댓글이 달렸습니다.',
      read: false,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
      link: '/community/post/123',
    },
    {
      id: '3',
      type: 'achievement',
      title: '새로운 업적 달성!',
      message: '첫 강의 수료 업적을 달성하셨습니다.',
      read: true,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      link: '/mypage/achievements',
    },
    {
      id: '4',
      type: 'info',
      title: '시스템 공지',
      message: '내일 오전 2시부터 4시까지 서버 점검이 예정되어 있습니다.',
      read: true,
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ]);

  const unread_count = notifications.filter((n) => !n.read).length;

  const mark_as_read = (id: string) => {
    set_notifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const mark_all_as_read = () => {
    set_notifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const delete_notification = (id: string) => {
    set_notifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handle_notification_click = (notification: Notification) => {
    mark_as_read(notification.id);
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild={true}>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread_count > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unread_count > 9 ? '9+' : unread_count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">알림</h3>
            {unread_count > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5">
                {unread_count}개
              </Badge>
            )}
          </div>
          {unread_count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={mark_all_as_read}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              모두 읽음
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">새로운 알림이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = notification_icons[notification.type];
                const color_class = notification_colors[notification.type];

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-muted/50 transition-colors cursor-pointer group',
                      !notification.read && 'bg-primary/5'
                    )}
                    onClick={() => handle_notification_click(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={cn('mt-0.5', color_class)}>
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
                          {formatDistanceToNow(notification.created_at, {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          delete_notification(notification.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full justify-center text-sm" asChild={true}>
            <a href="/notifications">모든 알림 보기</a>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
