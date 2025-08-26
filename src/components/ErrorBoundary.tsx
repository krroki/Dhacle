'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { env } from '@/env';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const router = useRouter();

  // 에러 로깅 (프로덕션에서는 Sentry 등으로 전송)
  console.error('Error caught by boundary:', error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
        <p className="text-gray-600">
          일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </p>
        
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
        // 프로덕션에서는 에러 모니터링 서비스로 전송
        if (env.NODE_ENV === 'production') {
          // TODO: Sentry.captureException(error, { extra: errorInfo });
          console.error('Production error:', error, errorInfo);
        }
      }}
      onReset={() => {
        // 에러 리셋 시 필요한 작업
        // 예: 캐시 클리어, 상태 초기화 등
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}