'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, RefreshCw } from 'lucide-react';

export default function YouTubeLensError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('YouTube Lens error occurred', error, {
      operation: 'youtube-lens-error',
      metadata: {
        digest: error.digest,
        tool: 'youtube-lens',
      }
    });
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-600" />
            <CardTitle>YouTube Lens 오류</CardTitle>
          </div>
          <CardDescription>
            YouTube Lens를 로드하는 중 문제가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error.message || 'YouTube API 연결에 실패했습니다. 잠시 후 다시 시도해주세요.'}
            </p>
            <Button onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}