'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Dashboard error occurred', error, {
      operation: 'dashboard-error',
      metadata: {
        digest: error.digest,
        page: 'dashboard',
      }
    });
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>대시보드 로딩 실패</AlertTitle>
        <AlertDescription className="mt-2">
          <p>{error.message || '대시보드를 불러올 수 없습니다.'}</p>
          <Button 
            onClick={reset} 
            variant="outline" 
            size="sm"
            className="mt-4"
          >
            새로고침
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}