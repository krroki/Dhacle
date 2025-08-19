'use client';

import {
  Activity,
  AlertCircle,
  BarChart3,
  Clock,
  Info,
  RefreshCw,
  Search,
  TrendingUp,
  Video,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { QuotaStatus } from '@/types/youtube';

interface QuotaStatusProps {
  quotaStatus?: QuotaStatus | null;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  compact?: boolean;
  className?: string;
}

// 색상 계산 함수
function getQuotaColor(percentage: number): string {
  if (percentage >= 95) return 'text-destructive';
  if (percentage >= 80) return 'text-orange-500';
  if (percentage >= 60) return 'text-yellow-500';
  return 'text-green-500';
}

// 진행바 색상 계산
function getProgressColor(percentage: number): string {
  if (percentage >= 95) return 'bg-destructive';
  if (percentage >= 80) return 'bg-orange-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
}

// 남은 시간 계산
function formatTimeRemaining(resetTime?: number): string {
  if (!resetTime) return '알 수 없음';

  const now = Date.now();
  const diff = resetTime - now;

  if (diff <= 0) return '곧 초기화';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 후`;
  }
  return `${minutes}분 후`;
}

export function QuotaStatus({
  quotaStatus,
  onRefresh,
  isLoading = false,
  compact = false,
  className,
}: QuotaStatusProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // 남은 시간 업데이트
  useEffect(() => {
    if (!quotaStatus?.resetTime) return;

    const updateTime = () => {
      setTimeRemaining(formatTimeRemaining(quotaStatus.resetTime.getTime()));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, [quotaStatus?.resetTime]);

  // 새로고침 핸들러
  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // 로딩 상태
  if (isLoading && !quotaStatus) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className={compact ? 'pb-3' : ''}>
          <div className="h-5 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-muted rounded mb-2" />
          <div className="h-4 w-24 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // 데이터 없음
  if (!quotaStatus) {
    return (
      <Card className={className}>
        <CardHeader className={compact ? 'pb-3' : ''}>
          <CardTitle className="text-base">API 할당량</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">할당량 정보를 불러올 수 없습니다</p>
          {onRefresh && (
            <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compact 뷰
  if (compact) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">API 할당량</span>
            <Badge
              variant={
                quotaStatus.critical ? 'destructive' : quotaStatus.warning ? 'secondary' : 'default'
              }
              className="text-xs"
            >
              {quotaStatus.used.toLocaleString()} / 10,000
            </Badge>
          </div>
          <Progress
            value={quotaStatus.percentage}
            className="h-2"
            // Progress 컴포넌트에 색상 적용
            style={
              {
                '--progress-foreground': getProgressColor(quotaStatus.percentage),
              } as React.CSSProperties
            }
          />
        </div>
        {onRefresh && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </Button>
        )}
      </div>
    );
  }

  // Full 뷰
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">API 할당량 상태</CardTitle>
            <CardDescription>YouTube Data API v3 일일 할당량</CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
              새로고침
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 진행바 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={cn('h-4 w-4', getQuotaColor(quotaStatus.percentage))} />
              <span className="text-sm font-medium">
                사용량: {quotaStatus.percentage.toFixed(1)}%
              </span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild={true}>
                  <Badge
                    variant={
                      quotaStatus.critical
                        ? 'destructive'
                        : quotaStatus.warning
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {quotaStatus.used.toLocaleString()} / 10,000
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>남은 할당량: {quotaStatus.remaining.toLocaleString()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Progress
            value={quotaStatus.percentage}
            className="h-3"
            style={
              {
                '--progress-foreground': getProgressColor(quotaStatus.percentage),
              } as React.CSSProperties
            }
          />
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="h-3 w-3" />
              <span>검색 횟수</span>
            </div>
            <p className="text-lg font-semibold">{quotaStatus.searchCount || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Video className="h-3 w-3" />
              <span>비디오 조회</span>
            </div>
            <p className="text-lg font-semibold">{quotaStatus.videoCount || 0}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>다음 초기화</span>
            </div>
            <p className="text-sm font-medium">{timeRemaining}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>남은 검색</span>
            </div>
            <p className="text-sm font-medium">약 {Math.floor(quotaStatus.remaining / 100)}회</p>
          </div>
        </div>

        {/* 경고 메시지 */}
        {quotaStatus.critical && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>할당량 초과 위험</AlertTitle>
            <AlertDescription>
              API 할당량이 95%를 초과했습니다. 추가 검색을 자제해주세요.
            </AlertDescription>
          </Alert>
        )}
        {quotaStatus.warning && !quotaStatus.critical && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>할당량 경고</AlertTitle>
            <AlertDescription>
              API 할당량이 80%를 초과했습니다. 신중하게 사용해주세요.
            </AlertDescription>
          </Alert>
        )}

        {/* 팁 */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                YouTube API 할당량은 매일 태평양 표준시(PST) 자정에 초기화됩니다.
              </p>
              <p className="text-xs text-muted-foreground">
                검색 1회당 약 100 유닛, 비디오 상세 정보 조회는 1 유닛이 소비됩니다.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
