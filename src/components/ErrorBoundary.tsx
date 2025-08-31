'use client';

// 전역 window 객체 타입 확장
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error, options?: {
        extra?: Record<string, unknown>;
        tags?: Record<string, string>;
        contexts?: Record<string, unknown>;
      }) => void;
    };
    queryClient?: {
      clear: () => void;
    };
  }
}

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { env } from '@/env';
import { ErrorRecoveryDialog } from '@/components/error/ErrorRecoveryDialog';
import { ErrorHandler, type ErrorInfo } from '@/lib/error/error-handler';
import { errorMonitoring } from '@/lib/error/error-monitoring';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const router = useRouter();
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  // 에러를 ErrorInfo로 변환하여 처리
  const processError = (error: Error) => {
    const errorInfo = ErrorHandler.fromNetworkError(error, {
      component: 'ErrorBoundary',
      action: 'react_error_boundary_catch',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    });

    // 에러 모니터링 시스템에 추가
    errorMonitoring.trackError(errorInfo);
    
    setErrorInfo(errorInfo);

    // 에러 로깅
    console.error('Error caught by boundary:', error);
    
    return errorInfo;
  };

  // 초기 에러 처리
  if (!errorInfo) {
    processError(error);
  }

  const handleRecoveryAttempt = async () => {
    if (errorInfo?.canRetry) {
      setShowRecoveryDialog(true);
      
      // 자동 복구 시도
      const recoverySuccess = await errorMonitoring.attemptRecovery(errorInfo);
      
      if (recoverySuccess) {
        // 복구 성공 시 2초 후 리셋
        setTimeout(() => {
          resetErrorBoundary();
          setShowRecoveryDialog(false);
        }, 2000);
      }
    }
  };

  const handleCloseRecoveryDialog = () => {
    setShowRecoveryDialog(false);
  };

  // ErrorRecoveryDialog가 활성화된 경우 다이얼로그 표시
  if (showRecoveryDialog && errorInfo) {
    return (
      <>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full text-center">
            <h1 className="text-xl font-semibold mb-4">복구 시도 중...</h1>
            <p className="text-gray-600">자동으로 문제를 해결하고 있습니다.</p>
          </div>
        </div>
        <ErrorRecoveryDialog
          error={errorInfo}
          isOpen={true}
          onClose={handleCloseRecoveryDialog}
          onRetry={resetErrorBoundary}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
        <p className="text-gray-600">
          {errorInfo?.userMessage || '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
        
        {/* 복구 액션 표시 */}
        {errorInfo?.recoveryActions && errorInfo.recoveryActions.length > 0 && (
          <div className="text-left bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm mb-2">해결 방법:</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {errorInfo.recoveryActions.map((action, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2 font-medium">
                    {index + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 개발 환경에서만 에러 상세 표시 */}
        {env.NODE_ENV === 'development' && (
          <details className="text-left bg-gray-100 p-4 rounded-lg">
            <summary className="cursor-pointer font-medium">에러 상세</summary>
            <pre className="mt-2 text-xs overflow-auto">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-2 justify-center">
          {errorInfo?.canRetry && (
            <Button onClick={handleRecoveryAttempt}>
              자동 복구 시도
            </Button>
          )}
          <Button onClick={resetErrorBoundary}>
            다시 시도
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            홈으로 이동
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // ErrorInfo로 변환하여 체계적으로 처리
        const errorDetails = ErrorHandler.fromNetworkError(error, {
          component: 'ErrorBoundary',
          action: 'react_error_boundary_onError',
          url: typeof window !== 'undefined' ? window.location.href : undefined,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          metadata: {
            componentStack: errorInfo.componentStack,
            errorBoundary: 'ErrorBoundary',
          },
        });

        // 에러 모니터링 시스템에 등록
        errorMonitoring.trackError(errorDetails);

        // 프로덕션 환경에서 외부 모니터링 서비스로 전송
        if (env.NODE_ENV === 'production') {
          // 실제 서비스 연동 (Sentry, LogRocket 등)
          try {
            // Sentry가 설정된 경우
            if (typeof window !== 'undefined' && window.Sentry) {
              window.Sentry.captureException(error, { 
                extra: { 
                  componentStack: errorInfo.componentStack 
                } as Record<string, unknown>,
                tags: {
                  errorCode: errorDetails.code,
                  severity: errorDetails.severity,
                },
                contexts: {
                  errorDetails: {
                    userMessage: errorDetails.userMessage,
                    canRetry: errorDetails.canRetry,
                    recoveryActions: errorDetails.recoveryActions,
                  }
                }
              });
            } else {
              // 대체 로깅 시스템
              console.error('Production error (no Sentry):', {
                error: error.message,
                stack: error.stack,
                errorInfo,
                errorDetails,
              });
            }
          } catch (loggingError) {
            console.error('Failed to log error to external service:', loggingError);
          }
        } else {
          // 개발 환경에서는 상세한 로깅
          console.group('🚨 ErrorBoundary Caught Error');
          console.error('Original Error:', error);
          console.error('Error Info:', errorInfo);
          console.error('Processed Error Details:', errorDetails);
          console.groupEnd();
        }
      }}
      onReset={() => {
        // 에러 리셋 시 필요한 작업
        try {
          // 1. React Query 캐시 클리어 (있는 경우)
          if (typeof window !== 'undefined' && window.queryClient) {
            window.queryClient.clear();
          }

          // 2. localStorage 임시 데이터 클리어
          if (typeof window !== 'undefined' && window.localStorage) {
            // 에러 관련 임시 데이터만 클리어
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.includes('error') || key.includes('temp') || key.includes('cache')) {
                localStorage.removeItem(key);
              }
            });
          }

          // 3. 서비스 워커 새로고침 (있는 경우)
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
              registration.update();
            });
          }

          // 4. 에러 모니터링 시스템에 복구 시도 기록
          try {
            errorMonitoring.trackError(ErrorHandler.createError('SYSTEM_RECOVERY', {
              component: 'ErrorBoundary',
              action: 'reset_boundary',
              metadata: { 
                resetTime: new Date().toISOString(),
                userAgent: navigator.userAgent,
              }
            }));
          } catch (trackingError) {
            console.warn('Failed to track recovery attempt:', trackingError);
          }

        } catch (resetError) {
          console.error('Error during boundary reset:', resetError);
          // 최후의 수단: 페이지 리로드
          window.location.reload();
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}