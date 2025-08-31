'use client';

// Error Notifications Hook - Toast 알림 및 실시간 에러 상태 관리
// ErrorMonitoringSystem과 연동하여 사용자 친화적인 알림 제공

import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorMonitoring } from '@/lib/error/error-monitoring';
import { type ErrorInfo } from '@/lib/error/error-handler';

// 알림 상태 인터페이스
export interface NotificationState {
  hasActiveErrors: boolean;
  errorCount: number;
  criticalCount: number;
  lastError: ErrorInfo | null;
  isRecovering: boolean;
  systemHealth: 'healthy' | 'degraded' | 'critical' | 'unknown';
}

// 알림 설정 옵션
export interface NotificationOptions {
  enableToasts?: boolean;           // Toast 알림 활성화
  enableSystemStatus?: boolean;     // 시스템 상태 모니터링
  autoRecovery?: boolean;          // 자동 복구 시도
  notificationLevel?: 'all' | 'medium' | 'high' | 'critical'; // 알림 수준
  maxToastsPerMinute?: number;     // 분당 최대 Toast 개수
}

const DEFAULT_OPTIONS: NotificationOptions = {
  enableToasts: true,
  enableSystemStatus: true,
  autoRecovery: true,
  notificationLevel: 'medium',
  maxToastsPerMinute: 5,
};

export function useErrorNotifications(options: NotificationOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { toast } = useToast();
  
  const [notificationState, setNotificationState] = useState<NotificationState>({
    hasActiveErrors: false,
    errorCount: 0,
    criticalCount: 0,
    lastError: null,
    isRecovering: false,
    systemHealth: 'unknown',
  });

  const [toastCount, setToastCount] = useState(0);
  const [lastToastTime, setLastToastTime] = useState(0);

  // Toast 표시 제한 체크
  const canShowToast = useCallback(() => {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    if (now - lastToastTime > oneMinute) {
      setToastCount(0);
      setLastToastTime(now);
    }
    
    return toastCount < config.maxToastsPerMinute!;
  }, [toastCount, lastToastTime, config.maxToastsPerMinute]);

  // 에러 수준에 따른 알림 표시 여부 확인
  const shouldShowNotification = useCallback((error: ErrorInfo) => {
    const level = config.notificationLevel!;
    
    switch (level) {
      case 'all':
        return true;
      case 'medium':
        return ['medium', 'high', 'critical'].includes(error.severity);
      case 'high':
        return ['high', 'critical'].includes(error.severity);
      case 'critical':
        return error.severity === 'critical';
      default:
        return false;
    }
  }, [config.notificationLevel]);

  // Toast 알림 표시
  const showErrorToast = useCallback((error: ErrorInfo) => {
    if (!config.enableToasts || !canShowToast() || !shouldShowNotification(error)) {
      return;
    }

    const variant = error.severity === 'critical' || error.severity === 'high' 
      ? 'destructive' 
      : 'default';

    toast({
      variant,
      title: '문제가 발생했습니다',
      description: error.userMessage,
      duration: error.severity === 'critical' ? 0 : 5000, // Critical은 수동 닫기
    });
    
    // 복구 가능한 에러의 경우 별도 Toast로 복구 옵션 제공
    if (error.canRetry && config.autoRecovery) {
      setTimeout(() => {
        toast({
          title: '자동 복구',
          description: '자동으로 문제를 해결하시겠습니까?',
          duration: 10000,
        });
      }, 1000);
    }

    setToastCount(prev => prev + 1);
  }, [config, canShowToast, shouldShowNotification, toast]);

  // 시스템 상태 업데이트
  const updateSystemState = useCallback(() => {
    if (!config.enableSystemStatus) return;

    const metrics = errorMonitoring.getMetrics();
    const health = errorMonitoring.getSystemHealth();
    // getRecentErrors는 private이므로 metrics에서 최근 에러 정보 추출
    const lastErrorTime = metrics.lastErrorTime ? new Date(metrics.lastErrorTime) : null;
    const hasRecentError = lastErrorTime && (Date.now() - lastErrorTime.getTime()) < 300000; // 5분 이내

    setNotificationState({
      hasActiveErrors: metrics.totalErrors > 0,
      errorCount: metrics.totalErrors,
      criticalCount: metrics.errorsByType.critical || 0,
      lastError: hasRecentError ? {
        code: 'RECENT_ERROR',
        severity: 'medium',
        userMessage: '최근 에러가 발생했습니다',
        technicalMessage: 'Recent error detected',
        recoveryActions: ['새로고침', '다시 시도'],
        canRetry: true,
        context: {
          timestamp: lastErrorTime.toISOString(),
        }
      } : null,
      isRecovering: false, // 복구 상태는 별도 관리
      systemHealth: health.status as NotificationState['systemHealth'],
    });
  }, [config.enableSystemStatus]);

  // 실시간 에러 모니터링
  useEffect(() => {
    if (!config.enableSystemStatus && !config.enableToasts) return;

    let intervalId: NodeJS.Timeout;
    let lastErrorCount = 0;

    const checkForNewErrors = () => {
      const metrics = errorMonitoring.getMetrics();
      const currentErrorCount = metrics.totalErrors;

      // 새 에러 발생 시 Toast 표시
      if (currentErrorCount > lastErrorCount && config.enableToasts) {
        // 새 에러 발생 시 일반적인 에러 Toast 표시
        const newErrorInfo = {
          code: 'NEW_ERROR_DETECTED',
          severity: 'medium' as const,
          userMessage: '새로운 에러가 발생했습니다.',
          technicalMessage: 'New error detected',
          recoveryActions: ['새로고침', '다시 시도'],
          canRetry: true,
          context: {
            timestamp: new Date().toISOString(),
          }
        };
        showErrorToast(newErrorInfo);
      }

      lastErrorCount = currentErrorCount;
      updateSystemState();
    };

    // 초기 상태 설정
    updateSystemState();

    // 주기적 상태 확인 (5초마다)
    intervalId = setInterval(checkForNewErrors, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [config, showErrorToast, updateSystemState]);

  // 수동으로 복구 시도
  const attemptRecovery = useCallback(async () => {
    if (!notificationState.lastError) return false;

    setNotificationState(prev => ({ ...prev, isRecovering: true }));
    
    try {
      const success = await errorMonitoring.attemptRecovery(notificationState.lastError);
      
      if (success) {
        toast({
          variant: 'default',
          title: '복구 완료',
          description: '문제가 해결되었습니다.',
          duration: 3000,
        });
        
        updateSystemState();
      } else {
        toast({
          variant: 'destructive',
          title: '복구 실패',
          description: '복구에 실패했습니다. 다시 시도해보세요.',
          duration: 5000,
        });
      }

      return success;
    } finally {
      setNotificationState(prev => ({ ...prev, isRecovering: false }));
    }
  }, [notificationState.lastError, toast, updateSystemState]);

  // 시스템 상태 새로고침
  const refreshSystemState = useCallback(() => {
    updateSystemState();
  }, [updateSystemState]);

  // 알림 설정 업데이트
  const updateNotificationSettings = useCallback((newOptions: Partial<NotificationOptions>) => {
    Object.assign(config, newOptions);
  }, [config]);

  return {
    // 상태
    notificationState,
    
    // 액션
    attemptRecovery,
    refreshSystemState,
    updateNotificationSettings,
    
    // 헬퍼
    showErrorToast,
    canShowToast,
    shouldShowNotification,
  };
}

export default useErrorNotifications;