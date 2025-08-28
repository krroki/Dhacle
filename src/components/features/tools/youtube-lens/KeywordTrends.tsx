'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Hash, TrendingUp, TrendingDown, Minus, RefreshCw, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiGet, apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface KeywordTrendData {
  keyword: string;
  frequency: number;
  growth: number;
  channels: string[];
  category?: string;
}

interface TrendsResponse {
  success: boolean;
  data: {
    trends: KeywordTrendData[];
    categories: Record<string, KeywordTrendData[]>;
    updated: string;
  };
}

interface AnalyzeResponse {
  success: boolean;
  data: {
    trends: KeywordTrendData[];
    analyzed: number;
    stored?: number;
    message: string;
  };
}

export function KeywordTrends() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const queryClient = useQueryClient();
  
  // Fetch current trends
  const { data, isLoading, error } = useQuery<TrendsResponse>({
    queryKey: ['youtube-lens', 'keywords', 'trends', selectedCategory],
    queryFn: () => apiGet<TrendsResponse>(
      `/api/youtube-lens/keywords/trends${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`
    ),
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  // Analyze trends mutation
  const analyzeMutation = useMutation<AnalyzeResponse>({
    mutationFn: async () => {
      return await apiPost<AnalyzeResponse>('/api/youtube-lens/keywords/trends', {
        analyze: true
      });
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(`분석 완료: ${response.data.analyzed}개 비디오 처리됨`);
        // Invalidate and refetch trends
        queryClient.invalidateQueries({ 
          queryKey: ['youtube-lens', 'keywords', 'trends'] 
        });
      }
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast.error('키워드 분석 중 오류가 발생했습니다');
    }
  });

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Hash className="w-5 h-5" />
            오류 발생
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            키워드 트렌드를 불러오는 중 오류가 발생했습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            급상승 키워드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const trends = data?.data.trends || [];
  const categories = data?.data.categories || {};
  
  // Extract unique categories
  const uniqueCategories = Object.keys(categories).filter(cat => cat !== '기타');
  const allCategories = ['all', ...uniqueCategories, '기타'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              급상승 키워드
            </CardTitle>
            <CardDescription>
              {data?.data.updated ? `최근 업데이트: ${new Date(data.data.updated).toLocaleString('ko-KR')}` : '최근 24시간 트렌드'}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending}
          >
            {analyzeMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                트렌드 분석
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(allCategories.length, 5)}, 1fr)` }}>
            {allCategories.slice(0, 5).map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {cat === 'all' ? '전체' : cat}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 mt-4">
            {trends.length === 0 ? (
              <EmptyState onAnalyze={() => analyzeMutation.mutate()} />
            ) : (
              trends.slice(0, 10).map((trend, index) => (
                <KeywordItem 
                  key={`${trend.keyword}-${index}`}
                  trend={trend}
                  rank={index + 1}
                />
              ))
            )}
          </TabsContent>
          
          {Object.entries(categories).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-3 mt-4">
              {items.length === 0 ? (
                <EmptyState onAnalyze={() => analyzeMutation.mutate()} />
              ) : (
                items.slice(0, 10).map((trend, index) => (
                  <KeywordItem 
                    key={`${trend.keyword}-${index}`}
                    trend={trend}
                    rank={index + 1}
                  />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function KeywordItem({ 
  trend, 
  rank 
}: { 
  trend: KeywordTrendData; 
  rank: number;
}) {
  const getTrendIcon = (growth: number) => {
    if (growth > 20) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (growth < -20) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 100) return 'bg-green-600';
    if (growth > 50) return 'bg-green-500';
    if (growth > 20) return 'bg-green-400';
    if (growth > 0) return 'bg-green-300';
    if (growth < -20) return 'bg-red-400';
    return 'bg-gray-300';
  };

  const formatGrowth = (growth: number) => {
    if (growth === 0) return '변동 없음';
    if (growth > 0) return `+${growth.toFixed(0)}%`;
    return `${growth.toFixed(0)}%`;
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={cn(
        "flex items-center justify-center min-w-[24px] w-6 h-6 rounded-full text-xs font-bold",
        rank <= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
      )}>
        {rank}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">
            {trend.keyword}
          </span>
          {getTrendIcon(trend.growth)}
          <Badge variant="outline" className="text-xs">
            {trend.frequency}회
          </Badge>
          {trend.category && (
            <Badge variant="secondary" className="text-xs">
              {trend.category}
            </Badge>
          )}
        </div>
        
        <div className="mt-1">
          <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted")}>
            <div 
              className={cn("h-full transition-all", getTrendColor(trend.growth))}
              style={{ width: `${Math.min(100, Math.abs(trend.growth) / 2)}%` }}
            />
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span>{trend.channels.length}개 채널</span>
          {trend.growth !== 0 && (
            <span className={cn(
              "font-medium",
              trend.growth > 0 ? "text-green-600" : trend.growth < 0 ? "text-red-600" : ""
            )}>
              {formatGrowth(trend.growth)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="text-center py-8">
      <Hash className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground mb-4">
        아직 분석된 키워드가 없습니다
      </p>
      <Button 
        size="sm" 
        onClick={onAnalyze}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        지금 분석하기
      </Button>
    </div>
  );
}