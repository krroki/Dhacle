'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// 개발 모드 체크를 위한 상수 (빌드 타임에 결정됨)
const isDevelopment = process.env.NODE_ENV === 'development';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to logging service
    logger.error('Application error occurred', error, {
      operation: 'error-boundary',
      metadata: {
        digest: error.digest,
        stack: error.stack,
        message: error.message,
      }
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>문제가 발생했습니다</CardTitle>
          </div>
          <CardDescription>
            예기치 않은 오류가 발생했습니다. 문제가 지속되면 지원팀에 문의하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isDevelopment && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
              </div>
            )}
            <Button onClick={reset} className="w-full">
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}