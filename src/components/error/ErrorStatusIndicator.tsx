'use client';

// Error Status Indicator - 실시간 시스템 상태 및 에러 알림 표시
// 헤더나 사이드바에 배치하여 사용자에게 시스템 상태를 실시간으로 알림

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Clock,
} from 'lucide-react';
import { useErrorNotifications } from '@/hooks/use-error-notifications';
import { cn } from '@/lib/utils';

interface ErrorStatusIndicatorProps {
  className?: string;
  showText?: boolean;          // 텍스트 표시 여부
  size?: 'sm' | 'md' | 'lg';  // 크기
  position?: 'header' | 'sidebar' | 'floating';  // 배치 위치
  autoRecovery?: boolean;      // 자동 복구 활성화
}

export function ErrorStatusIndicator({
  className,
  showText = true,
  size = 'md',
  position = 'header',
  autoRecovery = true,
}: ErrorStatusIndicatorProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  
  const { notificationState, attemptRecovery, refreshSystemState } = useErrorNotifications({
    enableSystemStatus: true,
    enableToasts: false, // 인디케이터는 Toast 비활성화
    autoRecovery,
  });

  // 시스템 상태에 따른 아이콘 및 색상
  const getStatusIcon = () => {
    if (notificationState.isRecovering) {
      return <RefreshCw className={cn("animate-spin", getSizeClass('icon'))} />;
    }

    switch (notificationState.systemHealth) {
      case 'healthy':
        return <CheckCircle className={cn("text-green-500", getSizeClass('icon'))} />;
      case 'degraded':
        return <AlertTriangle className={cn("text-yellow-500", getSizeClass('icon'))} />;
      case 'critical':
        return <XCircle className={cn("text-red-500", getSizeClass('icon'))} />;
      default:
        return <Activity className={cn("text-gray-400", getSizeClass('icon'))} />;
    }
  };

  const getStatusColor = () => {
    if (notificationState.isRecovering) return 'blue';
    
    switch (notificationState.systemHealth) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = () => {
    if (notificationState.isRecovering) return '복구 중...';
    
    switch (notificationState.systemHealth) {
      case 'healthy': return '정상';
      case 'degraded': return '주의';
      case 'critical': return '심각';
      default: return '확인 중';
    }
  };

  const getSizeClass = (element: 'icon' | 'text' | 'container') => {
    const sizes = {
      sm: {
        icon: 'h-4 w-4',
        text: 'text-xs',
        container: 'px-2 py-1',
      },
      md: {
        icon: 'h-5 w-5',
        text: 'text-sm',
        container: 'px-3 py-2',
      },
      lg: {
        icon: 'h-6 w-6',
        text: 'text-base',
        container: 'px-4 py-2',
      },
    };
    
    return sizes[size][element];
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const errorTime = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - errorTime.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative gap-2",
            getSizeClass('container'),
            position === 'floating' && "fixed bottom-4 right-4 shadow-lg",
            className
          )}
        >
          {getStatusIcon()}
          {showText && (
            <span className={getSizeClass('text')}>{getStatusText()}</span>
          )}
          
          {/* 에러 카운트 뱃지 */}
          {notificationState.hasActiveErrors && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
            >
              {notificationState.errorCount > 99 ? '99+' : notificationState.errorCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* 시스템 상태 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <h3 className="font-semibold">시스템 상태</h3>
            </div>
            <Badge variant={getStatusColor() === 'green' ? 'default' : 'destructive'}>
              {getStatusText()}
            </Badge>
          </div>

          {/* 시스템 메트릭 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">전체 에러</span>
              <span className="font-medium">{notificationState.errorCount}</span>
            </div>
            
            {notificationState.criticalCount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">심각한 에러</span>
                <span className="font-medium text-red-600">{notificationState.criticalCount}</span>
              </div>
            )}
          </div>

          {/* 최근 에러 정보 */}
          {notificationState.lastError && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  최근 에러: {formatTimeAgo(notificationState.lastError.context.timestamp)}
                </span>
              </div>
              
              <p className="text-sm font-medium">
                {notificationState.lastError.userMessage}
              </p>
              
              {notificationState.lastError.recoveryActions.length > 0 && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">해결 방법: </span>
                  {notificationState.lastError.recoveryActions[0]}
                </div>
              )}
            </div>
          )}

          {/* 복구 진행 상황 */}
          {notificationState.isRecovering && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                <span>자동 복구 진행 중...</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refreshSystemState}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              새로고침
            </Button>
            
            {notificationState.hasActiveErrors && !notificationState.isRecovering && (
              <Button
                size="sm"
                onClick={attemptRecovery}
                className="flex-1"
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                복구 시도
              </Button>
            )}
          </div>

          {/* 상태별 안내 메시지 */}
          <div className="text-xs text-gray-500 text-center">
            {notificationState.systemHealth === 'healthy' && '모든 시스템이 정상 작동 중입니다.'}
            {notificationState.systemHealth === 'degraded' && '일부 기능에 문제가 있을 수 있습니다.'}
            {notificationState.systemHealth === 'critical' && '시스템에 심각한 문제가 발생했습니다.'}
            {notificationState.systemHealth === 'unknown' && '시스템 상태를 확인하고 있습니다.'}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ErrorStatusIndicator;