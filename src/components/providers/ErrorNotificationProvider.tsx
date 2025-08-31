'use client';

// Error Notification Provider - 전역 에러 알림 관리
// 앱 전체에서 발생하는 에러를 Toast로 알리고 시스템 상태를 관리

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useErrorNotifications, type NotificationOptions } from '@/hooks/use-error-notifications';
import { ErrorStatusIndicator } from '@/components/error/ErrorStatusIndicator';
import { Toaster } from '@/components/ui/toaster';
import type { ErrorInfo } from '@/lib/error/error-handler';

// Provider 컨텍스트
const ErrorNotificationContext = createContext<{
  showErrorToast: (error: ErrorInfo) => void;
  refreshSystemState: () => void;
  attemptRecovery: () => Promise<boolean>;
} | null>(null);

interface ErrorNotificationProviderProps {
  children: ReactNode;
  options?: NotificationOptions;
  showStatusIndicator?: boolean;
  statusIndicatorPosition?: 'header' | 'sidebar' | 'floating';
}

export function ErrorNotificationProvider({
  children,
  options = {
    enableToasts: true,
    enableSystemStatus: true,
    autoRecovery: true,
    notificationLevel: 'medium',
    maxToastsPerMinute: 5,
  },
  showStatusIndicator = true,
  statusIndicatorPosition = 'floating',
}: ErrorNotificationProviderProps) {
  const {
    showErrorToast,
    refreshSystemState,
    attemptRecovery,
  } = useErrorNotifications(options);

  // 전역 에러 핸들러 설정
  useEffect(() => {
    // 전역 JavaScript 에러 캐치
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global JavaScript Error:', event.error);
      
      showErrorToast({
        code: 'JAVASCRIPT_ERROR',
        severity: 'high',
        userMessage: '예기치 않은 오류가 발생했습니다.',
        technicalMessage: event.error?.message || 'Unknown JavaScript error',
        recoveryActions: ['페이지 새로고침', '잠시 후 다시 시도'],
        canRetry: true,
        context: {
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      });
    };

    // 전역 Promise rejection 캐치
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      
      showErrorToast({
        code: 'PROMISE_REJECTION',
        severity: 'medium',
        userMessage: '요청 처리 중 오류가 발생했습니다.',
        technicalMessage: event.reason?.message || 'Unhandled promise rejection',
        recoveryActions: ['다시 시도', '페이지 새로고침'],
        canRetry: true,
        context: {
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      });

      // 브라우저 기본 처리 방지
      event.preventDefault();
    };

    // React Error Boundary와의 통합
    const handleReactError = (event: CustomEvent) => {
      console.error('React Error Boundary:', event.detail);
      
      showErrorToast({
        code: 'REACT_ERROR',
        severity: 'high',
        userMessage: '화면 표시 중 오류가 발생했습니다.',
        technicalMessage: event.detail?.error?.message || 'React component error',
        recoveryActions: ['페이지 새로고침', '다른 페이지로 이동'],
        canRetry: true,
        context: {
          timestamp: new Date().toISOString(),
          component: event.detail?.errorInfo?.componentStack,
          url: window.location.href,
        },
      });
    };

    // 이벤트 리스너 등록
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('react-error', handleReactError as EventListener);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('react-error', handleReactError as EventListener);
    };
  }, [showErrorToast]);

  // API 요청 에러 인터셉트 (fetch 래핑)
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // HTTP 에러 상태 코드 처리
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          
          showErrorToast({
            code: `HTTP_${response.status}`,
            severity: response.status >= 500 ? 'high' : 'medium',
            userMessage: errorData?.error?.message || `서버 요청 실패 (${response.status})`,
            technicalMessage: `HTTP ${response.status}: ${response.statusText}`,
            recoveryActions: ['다시 시도', '잠시 후 재시도'],
            canRetry: response.status >= 500,
            retryAfter: response.status >= 500 ? 10 : undefined,
            context: {
              timestamp: new Date().toISOString(),
              url: args[0] as string,
              method: (args[1] as RequestInit)?.method || 'GET',
              status: response.status,
            },
          });
        }
        
        return response;
      } catch (error) {
        console.error('Fetch Error:', error);
        
        showErrorToast({
          code: 'NETWORK_ERROR',
          severity: 'medium',
          userMessage: '네트워크 연결에 문제가 있습니다.',
          technicalMessage: error instanceof Error ? error.message : 'Network error',
          recoveryActions: ['인터넷 연결 확인', '다시 시도'],
          canRetry: true,
          retryAfter: 5,
          context: {
            timestamp: new Date().toISOString(),
            url: args[0] as string,
            userAgent: navigator.userAgent,
          },
        });
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [showErrorToast]);

  const contextValue = {
    showErrorToast,
    refreshSystemState,
    attemptRecovery,
  };

  return (
    <ErrorNotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Toast 컨테이너 */}
      <Toaster />
      
      {/* 상태 인디케이터 */}
      {showStatusIndicator && (
        <ErrorStatusIndicator
          position={statusIndicatorPosition}
          autoRecovery={options.autoRecovery}
          className={
            statusIndicatorPosition === 'floating'
              ? 'fixed bottom-4 right-4 z-50'
              : undefined
          }
        />
      )}
    </ErrorNotificationContext.Provider>
  );
}

// Context 사용 훅
export function useErrorNotificationContext() {
  const context = useContext(ErrorNotificationContext);
  
  if (!context) {
    throw new Error(
      'useErrorNotificationContext must be used within ErrorNotificationProvider'
    );
  }
  
  return context;
}

// 편의 함수들
export const ErrorNotification = {
  // 수동으로 에러 알림 표시
  showError: (message: string, options?: { severity?: 'low' | 'medium' | 'high' | 'critical' }) => {
    // 전역 컨텍스트가 없는 경우를 위한 대체
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('manual-error-notification', {
        detail: {
          message,
          severity: options?.severity || 'medium',
          timestamp: new Date().toISOString(),
        }
      }));
    }
  },

  // 성공 알림 표시
  showSuccess: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('success-notification', {
        detail: { message, timestamp: new Date().toISOString() }
      }));
    }
  },

  // 시스템 상태 새로고침
  refresh: () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('refresh-error-state'));
    }
  },
};

export default ErrorNotificationProvider;